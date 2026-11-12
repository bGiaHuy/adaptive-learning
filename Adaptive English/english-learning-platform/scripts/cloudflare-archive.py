"""Convert the private, consistent PostgreSQL export into a verified D1 archive.

This archive does not change the application's live database connection.
"""
import datetime
from collections import Counter
import hashlib
import json
from pathlib import Path
import re
import sqlite3

root = Path('.artifacts/cloudflare-migration-20261109')
snapshot = json.loads((root / 'postgres-snapshot.private.json').read_text(encoding='utf-8'))
target = root / 'postgres-archive.private.sqlite'
if target.exists():
    raise RuntimeError('Refusing to overwrite an existing archive')

def quote(value):
    return '"' + value.replace('"', '""') + '"'

def normalize(value, column):
    if value is None:
        return None
    kind = column['data_type']
    if kind == 'boolean':
        return int(value)
    if kind.startswith('timestamp'):
        stamp = datetime.datetime.fromisoformat(value.replace('Z', '+00:00'))
        if stamp.tzinfo is None:
            stamp = stamp.replace(tzinfo=datetime.timezone.utc)
        return round(stamp.timestamp() * 1000)
    if kind == 'bytea':
        if isinstance(value, dict) and value.get('type') == 'Buffer':
            return bytes(value['data'])
        if isinstance(value, str) and value.startswith('\\x'):
            return bytes.fromhex(value[2:])
        raise ValueError('Unsupported bytea format')
    return value

types = {'text': 'TEXT', 'integer': 'INTEGER', 'double precision': 'REAL', 'boolean': 'BOOLEAN', 'timestamp without time zone': 'DATETIME', 'bytea': 'BLOB'}
connection = sqlite3.connect(target)
connection.execute('PRAGMA foreign_keys=OFF')
summary = {'tables': [], 'rows': 0, 'foreignKeyViolations': [], 'sourceSnapshotSha256': hashlib.sha256((root / 'postgres-snapshot.private.json').read_bytes()).hexdigest()}
for table, rows in snapshot['tables'].items():
    columns = [c for c in snapshot['columns'] if c['table_name'] == table]
    definitions = []
    for col in columns:
        text = quote(col['column_name']) + ' ' + types[col['data_type']]
        if col['is_nullable'] == 'NO':
            text += ' NOT NULL'
        default = col['column_default']
        if default is not None:
            default = re.sub(r'::(?:text|character varying|timestamp without time zone|double precision|integer|boolean)$', '', default)
            if default == 'CURRENT_TIMESTAMP' or default == 'now()':
                default = "(CAST(strftime('%s','now') AS INTEGER)*1000)"
            if default in ('true', 'false'):
                default = '1' if default == 'true' else '0'
            text += ' DEFAULT ' + default
        definitions.append(text)
    for constraint in snapshot['constraints']:
        if constraint['table_name'].strip('"') == table and constraint['contype'] in ('p', 'u', 'f', 'c'):
            definitions.append('CONSTRAINT ' + quote(constraint['conname']) + ' ' + constraint['definition'])
    connection.execute('CREATE TABLE ' + quote(table) + ' (' + ','.join(definitions) + ')')
    names = ','.join(quote(col['column_name']) for col in columns)
    values = [tuple(normalize(row[col['column_name']], col) for col in columns) for row in rows]
    connection.executemany('INSERT INTO ' + quote(table) + ' (' + names + ') VALUES (' + ','.join('?' for _ in columns) + ')', values)
    actual = connection.execute('SELECT ' + names + ' FROM ' + quote(table)).fetchall()
    if Counter(actual) != Counter(values):
        raise RuntimeError('Round-trip mismatch in ' + table)
    summary['tables'].append({'name': table, 'rows': len(rows), 'roundTrip': 'PASS'})
    summary['rows'] += len(rows)
connection.commit()
summary['foreignKeyViolations'] = list(connection.execute('PRAGMA foreign_key_check'))
summary['integrity'] = connection.execute('PRAGMA integrity_check').fetchone()[0]
if summary['foreignKeyViolations'] or summary['integrity'] != 'ok':
    raise RuntimeError('Archive integrity validation failed')
# D1 imports need deferred FK checks because table order is not dependency order.
statements = [line for line in connection.iterdump() if line not in ('BEGIN TRANSACTION;', 'COMMIT;')]
dependencies = {table: set() for table in snapshot['tables']}
for constraint in snapshot['constraints']:
    if constraint['contype'] == 'f':
        parent = re.search(r'REFERENCES "([^\"]+)"', constraint['definition']).group(1)
        dependencies[constraint['table_name'].strip('"')].add(parent)
order = []
while dependencies:
    ready = sorted(table for table, parents in dependencies.items() if not parents - set(order))
    if not ready:
        raise RuntimeError('Cyclic FK graph requires a different import strategy')
    order.extend(ready)
    for table in ready:
        del dependencies[table]
inserts = []
def literal(value):
    return connection.execute('SELECT quote(?)', (value,)).fetchone()[0]
for table in order:
    columns = list(connection.execute('PRAGMA table_info(' + quote(table) + ')'))
    names = [col[1] for col in columns]
    keys = [col[1] for col in columns if col[5]]
    for row in connection.execute('SELECT * FROM ' + quote(table)).fetchall():
        oversized = {index: value for index, value in enumerate(row) if isinstance(value, (str, bytes)) and len(value) > 15000}
        values = [literal((b'' if isinstance(value, bytes) else '') if index in oversized else value) for index, value in enumerate(row)]
        inserts.append('INSERT INTO ' + quote(table) + ' VALUES(' + ','.join(values) + ');')
        if oversized and not keys:
            raise RuntimeError('Cannot safely append a large value without a primary key')
        where = ' AND '.join(quote(key) + '=' + literal(row[names.index(key)]) for key in keys)
        for index, value in oversized.items():
            column = quote(names[index])
            for start in range(0, len(value), 15000):
                expression = column + ' || ' + literal(value[start:start + 15000])
                if isinstance(value, bytes):
                    expression = 'CAST(' + expression + ' AS BLOB)'
                inserts.append('UPDATE ' + quote(table) + ' SET ' + column + '=' + expression + ' WHERE ' + where + ';')
dump = '\n'.join([s for s in statements if s.startswith('CREATE TABLE ')] + inserts + [s for s in statements if not s.startswith(('CREATE TABLE ', 'INSERT INTO '))])
(root / 'postgres-archive.private.sql').write_text('PRAGMA defer_foreign_keys=ON;\n' + dump + '\n', encoding='utf-8', newline='')
connection.close()
local_source = sqlite3.connect('file:prisma/dev.db?mode=ro', uri=True)
local_destination = sqlite3.connect(root / 'local-development.private.sqlite')
local_source.backup(local_destination)
summary['localDevelopmentTables'] = []
for (table,) in local_source.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"):
    summary['localDevelopmentTables'].append({'name': table, 'rows': local_source.execute('SELECT count(*) FROM ' + quote(table)).fetchone()[0]})
local_source.close()
local_destination.close()
(root / 'archive-validation.json').write_text(json.dumps(summary, indent=2), encoding='utf-8')
print(json.dumps({'productionTables': len(summary['tables']), 'productionRows': summary['rows'], 'roundTrip': 'PASS', 'integrity': summary['integrity'], 'foreignKeyViolations': len(summary['foreignKeyViolations']), 'localBackup': 'complete'}))

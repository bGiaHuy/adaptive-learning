"""Build a canonical, indexed SQLite/D1 copy from a consistent private PG export.

No source database is written, and no existing output database is overwritten.
"""
from collections import Counter
import datetime
import hashlib
import json
from pathlib import Path
import sqlite3
import sys

source = Path(sys.argv[1])
schema_path = Path(sys.argv[2])
output = Path(sys.argv[3])
output.mkdir(parents=True, exist_ok=True)
snapshot = json.loads((source / 'postgres-snapshot.private.json').read_text(encoding='utf-8'))
filename = output / 'canonical.private.sqlite'
if filename.exists():
    raise RuntimeError('Refusing to overwrite an existing candidate')
db = sqlite3.connect(filename)
db.executescript(schema_path.read_text(encoding='utf-8'))
db.execute('PRAGMA foreign_keys=OFF')
quote = lambda value: '"' + value.replace('"', '""') + '"'
tables = [row[0] for row in db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")]
if set(tables) != set(snapshot['tables']):
    raise RuntimeError('Source/canonical table mismatch: ' + repr(set(tables) ^ set(snapshot['tables'])))

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
        raise ValueError('Unknown bytea representation')
    return value

summary = {'sourceExportedAt': snapshot['exportedAt'], 'sourceSnapshotSha256': hashlib.sha256((source / 'postgres-snapshot.private.json').read_bytes()).hexdigest(), 'tables': []}
dependencies = {}
for table in tables:
    information = list(db.execute('PRAGMA table_info(' + quote(table) + ')'))
    names = [column[1] for column in information]
    columns = {column['column_name']: column for column in snapshot['columns'] if column['table_name'] == table}
    if set(names) != set(columns):
        raise RuntimeError('Source/canonical column mismatch: ' + table)
    values = [tuple(normalize(row[name], columns[name]) for name in names) for row in snapshot['tables'][table]]
    db.executemany('INSERT INTO ' + quote(table) + '(' + ','.join(map(quote, names)) + ') VALUES(' + ','.join('?' for _ in names) + ')', values)
    actual = db.execute('SELECT ' + ','.join(map(quote, names)) + ' FROM ' + quote(table)).fetchall()
    if Counter(values) != Counter(actual):
        raise RuntimeError('Canonical row mismatch: ' + table)
    dependencies[table] = {row[2] for row in db.execute('PRAGMA foreign_key_list(' + quote(table) + ')') if row[2] != table}
    summary['tables'].append({'name': table, 'rows': len(values), 'columnsMatch': True, 'valuesMatch': True})
db.commit()
summary['foreignKeyViolations'] = list(db.execute('PRAGMA foreign_key_check'))
summary['integrity'] = db.execute('PRAGMA integrity_check').fetchone()[0]
if summary['foreignKeyViolations'] or summary['integrity'] != 'ok':
    raise RuntimeError('Canonical integrity validation failed')
order = []
while dependencies:
    ready = sorted(table for table, parents in dependencies.items() if not parents - set(order))
    if not ready:
        raise RuntimeError('Cyclic dependency requires a reviewed import strategy')
    order.extend(ready)
    for table in ready:
        del dependencies[table]

def literal(value):
    if value is None:
        return 'NULL'
    if isinstance(value, bytes):
        return "X'" + value.hex() + "'"
    if isinstance(value, str):
        return "CAST(X'" + value.encode('utf-8').hex() + "' AS TEXT)"
    return repr(value)

statements = ['PRAGMA defer_foreign_keys=ON;']
statements.extend(row[0] + ';' for row in db.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"))
statements.extend(row[0] + ';' for row in db.execute("SELECT sql FROM sqlite_master WHERE type='index' AND sql IS NOT NULL ORDER BY name"))
for table in order:
    information = list(db.execute('PRAGMA table_info(' + quote(table) + ')'))
    names = [column[1] for column in information]
    keys = [column[1] for column in information if column[5]]
    if not keys:
        raise RuntimeError('Source table lacks a primary key: ' + table)
    for row in db.execute('SELECT * FROM ' + quote(table)).fetchall():
        large = {index: value for index, value in enumerate(row) if (isinstance(value, bytes) and len(value) > 15000) or (isinstance(value, str) and len(value) > 5000)}
        initial = [literal((b'' if isinstance(value, bytes) else '') if index in large else value) for index, value in enumerate(row)]
        statements.append('INSERT INTO ' + quote(table) + ' VALUES(' + ','.join(initial) + ');')
        where = ' AND '.join(quote(key) + '=' + literal(row[names.index(key)]) for key in keys)
        for index, value in large.items():
            column = quote(names[index])
            chunk = 15000 if isinstance(value, bytes) else 5000
            for start in range(0, len(value), chunk):
                expression = column + ' || ' + literal(value[start:start + chunk])
                if isinstance(value, bytes):
                    expression = 'CAST(' + expression + ' AS BLOB)'
                statements.append('UPDATE ' + quote(table) + ' SET ' + column + '=' + expression + ' WHERE ' + where + ';')
if any(len(statement.encode('utf-8')) >= 100000 for statement in statements):
    raise RuntimeError('SQL statement exceeds D1 limit')
(output / 'canonical.private.sql').write_text('\n'.join(statements) + '\n', encoding='utf-8', newline='')
summary['rows'] = sum(table['rows'] for table in summary['tables'])
summary['tablesCount'] = len(tables)
summary['sqliteSha256'] = hashlib.sha256(filename.read_bytes()).hexdigest()
(output / 'canonical-validation.json').write_text(json.dumps(summary, indent=2), encoding='utf-8')
db.close()
print(json.dumps({'tables': len(tables), 'rows': summary['rows'], 'valuesMatch': True, 'foreignKeyViolations': 0, 'integrity': summary['integrity']}))

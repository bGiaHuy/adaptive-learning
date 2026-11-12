"""Preserve the separate development database byte-for-byte in a private D1 archive."""
import gzip
import hashlib
import json
from pathlib import Path
import sqlite3

root = Path('.artifacts/cloudflare-migration-20261109')
data = (root / 'local-development.private.sqlite').read_bytes()
packed = gzip.compress(data, mtime=0)
source = sqlite3.connect(root / 'local-development.private.sqlite')
tables = []
for (name,) in source.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"):
    quoted = '"' + name.replace('"', '""') + '"'
    tables.append({'name': name, 'rows': source.execute('SELECT count(*) FROM ' + quoted).fetchone()[0]})
metadata = {'format': 'sqlite-gzip-chunks-v1', 'bytes': len(data), 'compressedBytes': len(packed), 'sha256': hashlib.sha256(data).hexdigest(), 'tables': tables, 'rows': sum(table['rows'] for table in tables)}
literal = lambda value: "'" + value.replace("'", "''") + "'"
statements = [
    'CREATE TABLE SnapshotMetadata (id TEXT PRIMARY KEY, manifest TEXT NOT NULL);',
    'CREATE TABLE SnapshotChunk (snapshotId TEXT NOT NULL REFERENCES SnapshotMetadata(id), position INTEGER NOT NULL, data BLOB NOT NULL, PRIMARY KEY(snapshotId,position));',
    'INSERT INTO SnapshotMetadata VALUES(\'local-development-20261109\',' + literal(json.dumps(metadata)) + ');'
]
for position, start in enumerate(range(0, len(packed), 16000)):
    statements.append("INSERT INTO SnapshotChunk VALUES('local-development-20261109'," + str(position) + ",X'" + packed[start:start + 16000].hex() + "');")
(root / 'local-development-d1.private.sql').write_text('\n'.join(statements), encoding='utf-8', newline='')
(root / 'local-development-manifest.json').write_text(json.dumps(metadata, indent=2), encoding='utf-8')
print(json.dumps({'tables': len(tables), 'rows': metadata['rows'], 'bytes': len(data), 'compressedBytes': len(packed), 'sha256': metadata['sha256']}))

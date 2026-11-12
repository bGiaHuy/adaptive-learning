import gzip
import hashlib
import json
from pathlib import Path
import sqlite3

root = Path('.artifacts/cloudflare-migration-20261109')
database = sqlite3.connect(':memory:')
with (root / 'local-d1-export.private.sql').open(encoding='utf-8', newline='') as file:
    database.executescript(file.read())
manifest = json.loads(database.execute('SELECT manifest FROM SnapshotMetadata WHERE id=?', ('local-development-20261109',)).fetchone()[0])
chunks = database.execute('SELECT position,data FROM SnapshotChunk WHERE snapshotId=? ORDER BY position', ('local-development-20261109',)).fetchall()
assert [row[0] for row in chunks] == list(range(len(chunks)))
data = gzip.decompress(b''.join(row[1] for row in chunks))
actual = hashlib.sha256(data).hexdigest()
assert len(data) == manifest['bytes'] and actual == manifest['sha256']
assert data == (root / 'local-development.private.sqlite').read_bytes()
result = {'result': 'PASS', 'tables': len(manifest['tables']), 'rows': manifest['rows'], 'bytes': len(data), 'sha256': actual, 'byteForByteMatch': True}
(root / 'local-d1-roundtrip-validation.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
print(json.dumps(result))

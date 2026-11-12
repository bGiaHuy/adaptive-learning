from collections import Counter
import json
from pathlib import Path
import sqlite3

root = Path('.artifacts/cloudflare-migration-20261109')
source = sqlite3.connect(root / 'postgres-archive.private.sqlite')
remote = sqlite3.connect(':memory:')
with (root / 'd1-export.private.sql').open(encoding='utf-8', newline='') as file:
    remote.executescript(file.read())
tables = [row[0] for row in source.execute("SELECT name FROM sqlite_master WHERE type='table'")]
checks = []
for table in tables:
    quote = '"' + table.replace('"', '""') + '"'
    expected = source.execute('SELECT * FROM ' + quote).fetchall()
    actual = remote.execute('SELECT * FROM ' + quote).fetchall()
    checks.append({'name': table, 'rows': len(expected), 'allValuesMatch': Counter(expected) == Counter(actual)})
result = {'tables': checks, 'allRowsMatch': all(c['allValuesMatch'] for c in checks), 'foreignKeyViolations': list(remote.execute('PRAGMA foreign_key_check')), 'integrity': remote.execute('PRAGMA integrity_check').fetchone()[0]}
(root / 'd1-roundtrip-validation.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
print(json.dumps({'tables': len(checks), 'rows': sum(c['rows'] for c in checks), 'allRowsMatch': result['allRowsMatch'], 'foreignKeyViolations': len(result['foreignKeyViolations']), 'integrity': result['integrity']}))
assert result['allRowsMatch'] and not result['foreignKeyViolations'] and result['integrity'] == 'ok'

from collections import Counter
import json
from pathlib import Path
import sqlite3
import sys

directory = Path(sys.argv[1])
export_file = Path(sys.argv[2])
expected = sqlite3.connect('file:' + (directory / 'canonical.private.sqlite').resolve().as_posix() + '?mode=ro', uri=True)
actual = sqlite3.connect(':memory:')
with export_file.open(encoding='utf-8', newline='') as file:
    actual.executescript(file.read())
checks = []
for (table,) in expected.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"):
    quoted = '"' + table.replace('"', '""') + '"'
    columns = [row[1] for row in expected.execute('PRAGMA table_info(' + quoted + ')')]
    names = ','.join('"' + name.replace('"', '""') + '"' for name in columns)
    left = expected.execute('SELECT ' + names + ' FROM ' + quoted).fetchall()
    right = actual.execute('SELECT ' + names + ' FROM ' + quoted).fetchall()
    expected_indexes = sorted((row[0], row[1]) for row in expected.execute("SELECT name,sql FROM sqlite_master WHERE type='index' AND tbl_name=? AND sql IS NOT NULL", (table,)))
    actual_indexes = sorted((row[0], row[1]) for row in actual.execute("SELECT name,sql FROM sqlite_master WHERE type='index' AND tbl_name=? AND sql IS NOT NULL", (table,)))
    checks.append({'table': table, 'rows': len(left), 'allValuesMatch': Counter(left) == Counter(right), 'indexesMatch': expected_indexes == actual_indexes})
result = {'result': 'PASS' if all(check['allValuesMatch'] and check['indexesMatch'] for check in checks) else 'FAIL', 'checks': checks, 'foreignKeyViolations': list(actual.execute('PRAGMA foreign_key_check')), 'integrity': actual.execute('PRAGMA integrity_check').fetchone()[0]}
(directory / 'remote-roundtrip-validation.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
print(json.dumps({'result':result['result'],'tables':len(checks),'rows':sum(check['rows'] for check in checks),'foreignKeyViolations':len(result['foreignKeyViolations']),'integrity':result['integrity']}))
assert result['result'] == 'PASS' and not result['foreignKeyViolations'] and result['integrity'] == 'ok'

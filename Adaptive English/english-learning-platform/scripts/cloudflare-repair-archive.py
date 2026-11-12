"""Correct text newline conversion in this session's new, isolated D1 archive."""
from pathlib import Path
import sqlite3

root = Path('.artifacts/cloudflare-migration-20261109')
source = sqlite3.connect(root / 'postgres-archive.private.sqlite')
remote = sqlite3.connect(':memory:')
with (root / 'd1-export.private.sql').open(encoding='utf-8', newline='') as file:
    remote.executescript(file.read())
quote = lambda text: '"' + text.replace('"', '""') + '"'
literal = lambda value: source.execute('SELECT quote(?)', (value,)).fetchone()[0]
statements = []
for (table,) in source.execute("SELECT name FROM sqlite_master WHERE type='table'"):
    columns = list(source.execute('PRAGMA table_info(' + quote(table) + ')'))
    names = [col[1] for col in columns]
    keys = [i for i, col in enumerate(columns) if col[5]]
    for row in source.execute('SELECT * FROM ' + quote(table)).fetchall():
        where = ' AND '.join(quote(names[i]) + '=' + literal(row[i]) for i in keys)
        other = remote.execute('SELECT * FROM ' + quote(table) + ' WHERE ' + where).fetchone()
        if other is None:
            raise RuntimeError('Missing row; refusing text-only repair')
        for i, value in enumerate(row):
            if value != other[i]:
                if not isinstance(value, str) or not isinstance(other[i], str):
                    raise RuntimeError('Unexpected non-text mismatch')
                chunks = [value[j:j + 12000] for j in range(0, len(value), 12000)] or ['']
                for j, chunk in enumerate(chunks):
                    expression = (quote(names[i]) + ' || ' if j else '') + literal(chunk)
                    statements.append('UPDATE ' + quote(table) + ' SET ' + quote(names[i]) + '=' + expression + ' WHERE ' + where + ';')
(root / 'd1-text-repair.private.sql').write_text('\n'.join(statements) + '\n', encoding='utf-8', newline='')
print('Text repair statements:', len(statements))

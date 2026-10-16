import json
from pathlib import Path
import shutil
import sqlite3

root = Path(__file__).resolve().parents[3]
app = root / 'english-learning-platform'
old = root / 'docs/release/codex-acceptance-20261010/runtime'
runtime = Path(__file__).parent / 'runtime'
runtime.mkdir(exist_ok=False)
shutil.copytree(app / '.next', runtime / '.next')
shutil.copy2(app / 'package.json', runtime / 'package.json')
for name in ['@prisma/client', '.prisma/client']:
    shutil.copytree(old / 'node_modules' / name, runtime / 'node_modules' / name)
(runtime / 'prisma').mkdir()
db = runtime / 'prisma/dev.db'
with sqlite3.connect((old / 'prisma/dev.db').as_uri() + '?mode=ro', uri=True) as source:
    schema = source.execute("SELECT sql FROM sqlite_master WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%' ORDER BY type DESC").fetchall()
with sqlite3.connect(db) as target:
    for (sql,) in schema:
        target.execute(sql)
for name in ['index.js', 'edge.js']:
    file = runtime / 'node_modules/.prisma/client' / name
    content = file.read_text(encoding='utf-8')
    content = content.replace('file:' + (old / 'prisma/dev.db').as_posix(), 'file:' + db.as_posix())
    assert 'file:' + db.as_posix() in content
    file.write_text(content, encoding='utf-8')
print(json.dumps({'prepared': True, 'copied_personal_data': False, 'copied_env': False}))

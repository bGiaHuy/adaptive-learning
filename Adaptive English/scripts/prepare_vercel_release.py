"""Build a clean release directory without credentials, accounts or recordings."""
from pathlib import Path
import gzip
import hashlib
import json
import shutil
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--session', default='20261010')
args = parser.parse_args()
assert all(c.isdigit() or c == '-' for c in args.session)

root = Path(__file__).resolve().parents[1]
app = root / 'english-learning-platform'
stage = app / f'.artifacts/vercel-release-{args.session}'
stage.mkdir(parents=True, exist_ok=False)
for name in ['package.json', 'package-lock.json', 'tsconfig.json', 'tailwind.config.ts',
             'postcss.config.js', 'next-env.d.ts', 'next.config.js', 'vercel.json', '.vercelignore']:
    shutil.copy2(app / name, stage / name)
shutil.copytree(app / 'src', stage / 'src')
(stage / 'prisma').mkdir()
shutil.copy2(app / 'prisma/schema.prisma', stage / 'prisma/schema.prisma')
(stage / 'scripts').mkdir()
shutil.copy2(app / 'scripts/build-vercel.cjs', stage / 'scripts/build-vercel.cjs')
for name in ['assets', 'audio', 'motion']:
    shutil.copytree(app / 'public' / name, stage / 'public' / name)
(stage / 'data').mkdir()
with (root / 'data/dictionary.db').open('rb') as source, (stage / 'data/dictionary.db.gz').open('wb') as dest:
    with gzip.GzipFile(fileobj=dest, mode='wb', mtime=0) as archive:
        shutil.copyfileobj(source, archive)
(stage / '.vercel').mkdir()
shutil.copy2(app / '.vercel/project.json', stage / '.vercel/project.json')
files = [file for file in stage.rglob('*') if file.is_file()]
assert not any(file.name.startswith('.env') or file.suffix in ['.db', '.webm'] or '/uploads/' in file.as_posix() for file in files)
report = root / f'docs/verification-logs/vercel-{args.session}'
report.mkdir(parents=True, exist_ok=True)
(report / 'release-inventory.json').write_text(json.dumps({
 'directory': stage.relative_to(root).as_posix(),
 'files': [{'path':file.relative_to(stage).as_posix(), 'bytes':file.stat().st_size,
            'sha256':hashlib.sha256(file.read_bytes()).hexdigest()} for file in files],
 'includes_user_database': False, 'includes_env_files': False, 'includes_recordings': False,
}, indent=2), encoding='utf-8')
print(json.dumps({'files':len(files), 'dictionary_gzip_bytes':(stage/'data/dictionary.db.gz').stat().st_size}))
# These dependencies are local build tools only; .vercelignore excludes them from upload.
shutil.copytree(app / 'node_modules', stage / 'node_modules')

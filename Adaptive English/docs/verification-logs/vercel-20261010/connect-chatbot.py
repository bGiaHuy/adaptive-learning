from pathlib import Path
import subprocess, json, sys

root = Path(__file__).resolve().parents[3]
app = root / 'english-learning-platform'
node = r'C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
cli = r'C:\Users\Administrator\AppData\Local\npm-cache\_npx\69f9afb961c37556\node_modules\vercel\dist\index.js'
values = {}
for line in (app / '.env.local').read_text(encoding='utf-8-sig').splitlines():
    if '=' in line and not line.lstrip().startswith('#'):
        k, v = line.split('=', 1)
        values[k.strip()] = v.strip().strip('"').strip("'")
keys = ['MWAPI_API_KEY', 'MWAPI_BASE_URL', 'MWAPI_MODEL']
assert all(values.get(k) for k in keys), 'Missing local MWAPI configuration'
results = []
for key in keys:
    args = [node, cli, 'env', 'add', key, 'production', '--force', '--yes', '--sensitive' if key.endswith('API_KEY') else '--no-sensitive']
    r = subprocess.run(args, cwd=app, input=values[key], text=True, capture_output=True)
    output = r.stdout + r.stderr
    for secret in values.values():
        if len(secret) > 8:
            output = output.replace(secret, '[REDACTED]')
    results.append({'variable': key, 'exit_code': r.returncode, 'output': output})
    Path(__file__).with_name('chatbot-env-push.json').write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf-8')
    print(key, 'exit', r.returncode)
    if r.returncode:
        print(output)
        sys.exit(r.returncode)

from pathlib import Path
import json, urllib.request, urllib.error

root = Path(__file__).resolve().parents[3]
values = {}
for line in (root / 'english-learning-platform/.env.local').read_text(encoding='utf-8-sig').splitlines():
    if '=' in line and not line.lstrip().startswith('#'):
        k, v = line.split('=', 1)
        values[k.strip()] = v.strip().strip('"').strip("'")
result = {'date': '2026-10-10', 'checks': [], 'production_database_access': False, 'production_data_mutation': False,
          'authenticated_chat_test': 'BLOCKED by automatic approval review before execution: production database credential access, record creation and deletion not covered by deployment authorization.'}
def call(url, data=None, headers=None):
    request = urllib.request.Request(url, data=json.dumps(data).encode() if data else None, headers=headers or {})
    try:
        with urllib.request.urlopen(request, timeout=65) as response:
            return response.status, json.loads(response.read())
    except urllib.error.HTTPError as e:
        return e.code, {}

status, info = call('https://adaptiveenglish.vercel.app/api/ai/tutor')
result['checks'].append({'name': 'production-provider', 'http_status': status, 'response': info,
                         'pass': status == 200 and info.get('providerInfo', {}).get('provider') == 'mwapi' and info['providerInfo']['isConfigured'] is True})
status, _ = call('https://adaptiveenglish.vercel.app/api/ai/chat', {'message': 'hello'}, {'Content-Type': 'application/json'})
result['checks'].append({'name': 'anonymous-chat-rejected', 'http_status': status, 'pass': status == 401})
status, response = call(values['MWAPI_BASE_URL'].rstrip('/') + '/v1/messages',
    {'model': values['MWAPI_MODEL'], 'max_tokens': 150,
     'system': 'Return only a JSON object with a reply string. Explain the English word resilient in one short Vietnamese sentence.',
     'messages': [{'role': 'user', 'content': 'What does resilient mean?'}]},
    {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + values['MWAPI_API_KEY'], 'anthropic-version': '2023-06-01'})
reply = ''.join(part.get('text', '') for part in response.get('content', []) if part.get('type') == 'text')
result['checks'].append({'name': 'direct-upstream-synthetic-prompt', 'http_status': status, 'model': values['MWAPI_MODEL'],
                         'pass': status == 200 and bool(reply.strip()), 'reply': reply,
                         'scope': 'Direct provider request with the same local configuration pushed to production; not an authenticated production chatbot request.'})
result['exit_code'] = 0 if all(check['pass'] for check in result['checks']) else 1
Path(__file__).with_name('chatbot-connection-results.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(result, ensure_ascii=False))
raise SystemExit(result['exit_code'])

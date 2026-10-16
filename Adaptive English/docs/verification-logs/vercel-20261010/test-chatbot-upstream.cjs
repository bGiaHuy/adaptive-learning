const fs = require('node:fs');
const path = require('node:path');
const app = path.resolve(__dirname, '../../../english-learning-platform');
const values = {};
for (const line of fs.readFileSync(path.join(app, '.env.local'), 'utf8').split(/\r?\n/)) {
  if (!line.trim().startsWith('#') && line.includes('=')) {
    const index = line.indexOf('=');
    values[line.slice(0, index).trim()] = line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
  }
}
(async () => {
  const response = await fetch(values.MWAPI_BASE_URL.replace(/\/+$/, '') + '/v1/messages', {
    method: 'POST', headers: {'Content-Type': 'application/json', Authorization: 'Bearer ' + values.MWAPI_API_KEY, 'anthropic-version': '2023-06-01'},
    body: JSON.stringify({model: values.MWAPI_MODEL, max_tokens: 150, system: 'Return only JSON with a reply string. Explain resilient in Vietnamese in one short sentence.', messages: [{role: 'user', content: 'What does resilient mean?'}]}),
    signal: AbortSignal.timeout(65000)
  });
  let body = await response.text();
  for (const value of Object.values(values)) if (value.length > 8) body = body.split(value).join('[REDACTED]');
  const result = {date: '2026-10-10', runtime: process.version, http_status: response.status, pass: response.ok, body: body.slice(0, 2000), scope: 'Synthetic prompt directly to upstream with Node fetch matching app runtime; no production database access or data mutation', exit_code: response.ok ? 0 : 1};
  fs.writeFileSync(path.join(__dirname, 'chatbot-node-upstream-results.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
  process.exitCode = result.exit_code;
})().catch(() => {console.log('Upstream network request failed'); process.exitCode = 1;});

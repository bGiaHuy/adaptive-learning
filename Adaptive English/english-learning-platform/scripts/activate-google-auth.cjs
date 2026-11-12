// Stream site-specific OAuth credentials directly to Wrangler, without a second
// credential file, command-line secret values, or credential-bearing output.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
function main() {
  const source = process.argv[2];
  if (!source) throw new Error('A protected local Web OAuth JSON path is required');
  const web = JSON.parse(fs.readFileSync(source, 'utf8').replace(/^\uFEFF/, '')).web;
  const callback = 'https://adaptive-english.adaptive-learning-c3.workers.dev/api/auth/google/callback';
  if (!web || web.project_id !== 'adaptive-english-auth-20261110' || !web.redirect_uris?.includes(callback) || !/^[A-Za-z0-9_-]+\.apps\.googleusercontent\.com$/.test(web.client_id || '') || typeof web.client_secret !== 'string' || web.client_secret.length < 10) throw new Error('Site-specific Web client validation failed');
  const cli = path.join(process.env.APPDATA, 'npm/node_modules/wrangler/bin/wrangler.js');
  const result = spawnSync(process.execPath, [cli, 'secret', 'bulk', '--config', 'deploy/cloudflare/wrangler.jsonc'], { input: JSON.stringify({ GOOGLE_CLIENT_ID: web.client_id, GOOGLE_CLIENT_SECRET: web.client_secret }), encoding: 'utf8', windowsHide: true, timeout: 120000 });
  // Wrangler diagnostics are deliberately withheld: this process has secrets.
  if (result.error || result.status !== 0) throw new Error('Wrangler secret upload failed; credential-bearing diagnostics withheld');
  console.log(JSON.stringify({ uploaded: true, secretNames: ['GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET'], project: web.project_id, callback, credentialCopiesWritten: false, secretValuesPrinted: false }));
}
try { main(); } catch { console.error('Google OAuth activation failed; no credentials printed. Check protected source format, project/callback and Wrangler authorization.'); process.exitCode = 1; }

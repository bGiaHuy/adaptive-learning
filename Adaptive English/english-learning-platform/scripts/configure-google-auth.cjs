// Accept a downloaded Google Web OAuth JSON or a local .env file; print no credentials.
const fs = require('node:fs');
const { envFile } = require('./cloudflare-backup.cjs');
const file = process.argv[2];
if (!file) throw Error('Provide the path to a local Google OAuth Web client credential file.');
const origin = 'https://adaptive-english.adaptive-learning-c3.workers.dev';
const callback = origin + '/api/auth/google/callback';
let clientId, clientSecret;
if (file.toLowerCase().endsWith('.json')) {
  const credentials = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!credentials.web) throw Error('Google credentials must be a Web application client.');
  if (!credentials.web.redirect_uris?.includes(callback)) throw Error('Add this exact authorized redirect URI to the Google Web client: ' + callback);
  clientId = credentials.web.client_id;
  clientSecret = credentials.web.client_secret;
} else {
  const credentials = envFile(file);
  clientId = credentials.GOOGLE_CLIENT_ID;
  clientSecret = credentials.GOOGLE_CLIENT_SECRET;
}
if (!clientId?.endsWith('.apps.googleusercontent.com') || !clientSecret || /\[SENSITIVE\]|placeholder|your_client/i.test(clientSecret)) throw Error('Valid Google client credentials are required.');
fs.mkdirSync('.artifacts/google-auth-tests', {recursive:true});
fs.writeFileSync('.artifacts/google-auth-tests/google-secrets.private.json', JSON.stringify({GOOGLE_CLIENT_ID:clientId,GOOGLE_CLIENT_SECRET:clientSecret}));
console.log(JSON.stringify({prepared:true,secretValuesPrinted:false,callback,next:'Upload the private secrets file with Wrangler secret bulk, then redeploy with a fresh APP_INSTANCE_KEY.'}));

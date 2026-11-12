// Public runtime checks only. Never reads the protected OAuth client file.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const puppeteer = require('puppeteer-core');
const base = 'https://adaptive-english.adaptive-learning-c3.workers.dev';
const directory = process.argv[2] || '.artifacts/d1-runtime-lab/google-live-20261110';
async function main() {
  fs.mkdirSync(directory, { recursive: true });
  const status = await fetch(base + '/api/auth/google/status').then(r => r.json());
  assert.equal(status.enabled, true);
  const start = await fetch(base + '/api/auth/google', { redirect: 'manual' });
  const target = new URL(start.headers.get('location'));
  assert.equal(start.status, 303);
  assert.equal(target.origin, 'https://accounts.google.com');
  assert.equal(target.searchParams.get('redirect_uri'), base + '/api/auth/google/callback');
  assert.equal(target.searchParams.get('scope'), 'openid email profile');
  assert.equal(target.searchParams.get('code_challenge_method'), 'S256');
  const cookie = start.headers.getSetCookie().find(value => value.startsWith('adaptive_google_state='));
  assert.ok(cookie?.includes('HttpOnly') && cookie.includes('Secure'));
  const forged = await fetch(base + '/api/auth/google/callback?state=forged&code=forged', { redirect: 'manual' });
  assert.equal(forged.status, 303);
  assert.equal(new URL(forged.headers.get('location')).searchParams.get('google_error'), 'state');
  const cancellation = new URL(base + '/api/auth/google/callback');
  cancellation.search = new URLSearchParams({ state: target.searchParams.get('state'), error: 'access_denied' });
  const cancelled = await fetch(cancellation, { redirect: 'manual', headers: { cookie: cookie.split(';')[0] } });
  assert.equal(cancelled.status, 303);
  assert.equal(new URL(cancelled.headers.get('location')).searchParams.get('google_error'), 'cancelled');
  const replay = await fetch(cancellation, { redirect: 'manual', headers: { cookie: cookie.split(';')[0] } });
  assert.equal(new URL(replay.headers.get('location')).searchParams.get('google_error'), 'state');
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--no-sandbox'] });
  const checks = [];
  try {
    for (const [name, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844, isMobile: true }]]) {
      const page = await browser.newPage();
      await page.setViewport(viewport);
      const errors = [];
      page.on('pageerror', error => errors.push(error.name));
      await page.goto(base + '/auth/login', { waitUntil: 'networkidle2', timeout: 90000 });
      const button = await page.waitForSelector('form[action*="/api/auth/google"] button', { timeout: 15000 });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      const passwordAvailable = Boolean(await page.$('input[type="password"]'));
      assert.equal(passwordAvailable, true);
      assert.equal(overflow, false);
      assert.equal(errors.length, 0);
      await page.screenshot({ path: directory + '/login-' + name + '.png', fullPage: true });
      await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 90000 }), button.click()]);
      const current = new URL(page.url());
      assert.equal(current.hostname, 'accounts.google.com');
      const body = await page.evaluate(() => document.body.innerText);
      const googleError = /redirect_uri_mismatch|invalid_client|Error 400|Error 403|access_blocked/i.test(body);
      assert.equal(googleError, false);
      await page.screenshot({ path: directory + '/google-' + name + '.png', fullPage: true });
      checks.push({ viewport: name, googleButtonVisible: true, passwordAvailable, overflow, runtimeErrors: errors.length, reachedGoogleAccountPage: true, googleConfigurationErrorVisible: googleError });
      await page.close();
    }
  } finally { await browser.close(); }
  const result = { checkedAt: new Date().toISOString(), result: 'PASS', enabled: true, startStatus: 303, callbackMatches: true, scopes: 'openid email profile', pkce: 'S256', secureHttpOnlyStateCookie: true, forgedCallbackRejected: true, actualD1CancellationAndReplayPass: true, checks, realGoogleLoginVerified: false, testUsersAdded: false, limitation: 'Fresh browser reaches Google account sign-in. Requires authenticated Google consent to verify token exchange and application session. Google exempts these basic identity scopes from the Testing allowlist; user allowed skipping unnecessary tester registration.' };
  fs.writeFileSync(directory + '/result.json', JSON.stringify(result, null, 2), { flag: 'wx' });
  console.log(JSON.stringify(result));
}
main().catch(error => { console.error('Public Google login check failed:', error.name); process.exitCode = 1; });

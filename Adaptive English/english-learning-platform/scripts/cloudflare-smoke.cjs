const fs = require('node:fs');
const assert = require('node:assert/strict');
const puppeteer = require('puppeteer-core');
const base = process.argv[2] || 'https://adaptive-english.adaptive-learning-c3.workers.dev';
const directory = '.artifacts/cloudflare-migration-20261109';
async function main() {
  const checks = [];
  async function check(path, expected, options = {}) {
    const response = await fetch(base + path, { ...options, redirect: 'manual', signal: AbortSignal.timeout(65000) });
    assert.equal(response.status, expected, path);
    const contentType = response.headers.get('content-type') || '';
    let body;
    if (contentType.includes('application/json')) body = await response.json();
    checks.push({ path, status: response.status, expected, location: response.headers.get('location') });
    return { response, body };
  }
  const health = await check('/api/health', 200);
  assert.equal(health.body.database, 'connected');
  await check('/auth/login', 200);
  await check('/auth/register', 200);
  for (const path of ['/student/home', '/teacher/dashboard', '/admin/dashboard']) {
    const result = await check(path, 307);
    const location = new URL(result.response.headers.get('location'), base);
    assert.equal(location.origin, new URL(base).origin);
    assert.equal(location.pathname, '/auth/login');
  }
  await check('/api/auth/me', 401);
  await check('/api/assignments', 401);
  await check('/api/audio/play?pathname=invalid', 401);
  await check('/api/teacher/import-docx', 401, { method: 'POST', body: '{}' , headers: { 'content-type': 'application/json' } });
  await check('/api/auth/switch-role', 403, { method: 'POST', body: '{}', headers: { 'content-type': 'application/json' } });
  await check('/api/auth/login', 401, { method: 'POST', body: JSON.stringify({ email: 'migration-readonly-probe-20261109@example.invalid', password: 'invalid-readonly-probe' }), headers: { 'content-type': 'application/json' } });
  const dictionary = await check('/api/dictionary?q=hello', 200);
  assert.equal(dictionary.body.entry.word.toLowerCase(), 'hello');
  assert.ok(dictionary.body.entry.senses.length > 0);
  assert.ok(dictionary.body.stats.englishWords > 10000);
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--no-sandbox'] });
  const browserChecks = [];
  try {
    for (const [name, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844, isMobile: true, deviceScaleFactor: 1 }]]) {
      const page = await browser.newPage();
      await page.setViewport(viewport);
      const errors = [];
      const failedRequests = [];
      page.on('pageerror', error => errors.push(error.name));
      page.on('requestfailed', request => failedRequests.push(new URL(request.url()).pathname));
      await page.goto(base + '/auth/login', { waitUntil: 'networkidle2', timeout: 65000 });
      const layout = await page.evaluate(() => ({ title: document.title, email: !!document.querySelector('input[type=email]'), password: !!document.querySelector('input[type=password]'), horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1 }));
      await page.screenshot({ path: directory + '/cloudflare-login-' + name + '.png', fullPage: true });
      assert.ok(layout.email && layout.password, 'Login inputs');
      assert.equal(layout.horizontalOverflow, false, 'Responsive overflow');
      assert.deepEqual(errors, [], 'Browser runtime errors');
      assert.deepEqual(failedRequests, [], 'Failed browser requests');
      browserChecks.push({ name, ...layout, errors, failedRequests });
      await page.close();
    }
  } finally { await browser.close(); }
  const result = { base, checkedAt: new Date().toISOString(), result: 'PASS', checks, browserChecks, limitations: ['No real user password used; successful authenticated flows and mutations not tested against production.', 'Live PostgreSQL and Blob service remain external; D1 is an archive.'] };
  fs.writeFileSync(directory + '/public-smoke.json', JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
}
main().catch(error => { console.error(error.name + ': ' + error.message); process.exitCode = 1; });

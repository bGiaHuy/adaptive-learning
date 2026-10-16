const fs = require('node:fs');
const assert = require('node:assert/strict');
const base = 'http://localhost:3019';
const results = [];
async function request(route, body, cookie) {
  const res = await fetch(base + route, {
    method: body ? 'POST' : 'GET', redirect: 'manual',
    headers: { ...(body ? {'Content-Type':'application/json'} : {}), ...(cookie ? {Cookie:cookie} : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, cookie:res.headers.getSetCookie(), body:await res.text() };
}
async function main() {
  assert.equal((await request('/api/auth/me')).status, 401);
  results.push({test:'Anonymous identity rejected', status:401});
  for (const role of ['student', 'teacher']) {
    const credentials = {email:`local-${role}@example.invalid`, password:'LocalSynthetic-2026!'};
    const registered = await request('/api/auth/register', {...credentials, name:'Synthetic Local Test', role});
    assert.equal(registered.status, 200);
    assert.ok(registered.cookie.every(c => !/; Secure/i.test(c) && /HttpOnly/i.test(c) && /SameSite=Lax/i.test(c)));
    const logged = await request('/api/auth/login', credentials);
    assert.equal(logged.status, 200);
    const cookies = logged.cookie.map(c => c.split(';')[0]).join('; ');
    assert.equal((await request('/api/auth/me', undefined, cookies)).status, 200);
    const route = role === 'student' ? '/student/home' : '/teacher/dashboard';
    assert.equal((await request(route, undefined, cookies)).status, 200);
    assert.equal((await request('/api/auth/login', {...credentials,password:'IncorrectPassword!'})).status, 401);
    results.push({test:`${role} registration, login, authenticated page and wrong password`, result:'PASS'});
  }
}
main().then(() => {
  fs.writeFileSync(__dirname + '/api-results.json', JSON.stringify({environment:'Isolated production build, HTTP loopback; synthetic accounts only', results},null,2));
  console.log(JSON.stringify(results));
}).catch(err => { console.error(err.message); process.exitCode=1; });

const fs = require('node:fs');
const assert = require('node:assert/strict');
async function main() {
  const base = 'http://localhost:3020';
  const findings = [];
  for (const route of ['/', '/auth/login', '/auth/register']) {
    const res = await fetch(base + route);
    assert.equal(res.status, 200);
    const body = await res.text();
    if (route.endsWith('register')) assert.ok(body.includes('register-confirm-email'));
    findings.push({route,status:res.status});
  }
  const identity = await fetch(base+'/api/auth/me');
  assert.equal(identity.status, 401);
  findings.push({route:'/api/auth/me',status:identity.status});
  const recover = await fetch(base+'/api/auth/recover', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'synthetic@example.invalid'})});
  const reset = await recover.json();
  assert.equal(recover.status, 503);
  assert.ok(!('testResetLink' in reset));
  findings.push({route:'/api/auth/recover',status:recover.status,reset_link_exposed:false});
  const dictionary = await fetch(base+'/api/dictionary?q=hello');
  assert.equal(dictionary.status, 200);
  const data = await dictionary.json();
  assert.equal(data.entry.word.toLowerCase(), 'hello');
  assert.ok(data.entry.senses.length>0);
  findings.push({route:'/api/dictionary?q=hello',status:dictionary.status,senses:data.entry.senses.length});
  const trace = JSON.parse(fs.readFileSync(__dirname+'/../../../english-learning-platform/.artifacts/vercel-release-20261010/.next/server/app/api/dictionary/route.js.nft.json','utf8'));
  assert.ok(trace.files.some(file=>file.endsWith('data/dictionary.db.gz')));
  findings.push({test:'dictionary included in Next.js function trace', result:'PASS'});
  fs.writeFileSync(__dirname+'/smoke-results.json',JSON.stringify({environment:'Isolated production build, VERCEL=1, placeholder PostgreSQL URL. No DB was connected.',findings},null,2));
  console.log(JSON.stringify(findings));
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});

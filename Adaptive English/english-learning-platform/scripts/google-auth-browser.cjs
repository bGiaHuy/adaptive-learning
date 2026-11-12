const fs = require('node:fs');
const assert = require('node:assert/strict');
const puppeteer = require('puppeteer-core');
const base = 'http://127.0.0.1:3820';
const destination = '.artifacts/google-auth-tests';
async function main() {
  const status = await fetch(base + '/api/auth/google/status').then(response => response.json());
  assert.deepEqual(status, { enabled: false, connected: false });
  const start = await fetch(base + '/api/auth/google', { redirect: 'manual' });
  assert.equal(start.status, 303);
  assert.equal(new URL(start.headers.get('location')).searchParams.get('google_error'), 'unavailable');
  const forged = await fetch(base + '/api/auth/google/callback?state=forged&code=forged', { redirect: 'manual' });
  assert.equal(forged.status, 303);
  assert.equal(new URL(forged.headers.get('location')).searchParams.get('google_error'), 'state');
  const browser = await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox']});
  const checks = [];
  try {
    for (const [name, viewport] of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844,isMobile:true}]]) {
      const page = await browser.newPage();
      await page.setViewport(viewport);
      const errors = [];
      page.on('pageerror',error=>errors.push(error.name));
      await page.setRequestInterception(true);
      page.on('request',request=>{
        if (new URL(request.url()).pathname === '/api/auth/google/status') return request.respond({status:200,contentType:'application/json',body:JSON.stringify({enabled:true,connected:false})});
        return request.continue();
      });
      await page.goto(base + '/auth/login?redirect=/student/home', {waitUntil:'networkidle2'});
      const login = await page.evaluate(()=>{
        const form = Array.from(document.forms).find(form=>form.action.includes('/api/auth/google'));
        return {google:!!form,method:form?.method,role:form?.querySelector('input[name=role]')?.value,redirect:form?.querySelector('input[name=redirect]')?.value,password:!!document.querySelector('input[type=password]'),nestedForms:!!document.querySelector('form form'),overflow:document.documentElement.scrollWidth>innerWidth+1};
      });
      assert.ok(login.google && login.password); assert.equal(login.nestedForms,false);assert.equal(login.overflow,false);assert.equal(login.redirect,'/student/home');
      await page.screenshot({path:destination+'/google-login-'+name+'.png',fullPage:true});
      await page.goto(base + '/auth/register', {waitUntil:'networkidle2'});
      await page.evaluate(()=>{const button=Array.from(document.querySelectorAll('button')).find(button=>/giáo viên/i.test(button.textContent||''));button?.click();});
      const registration=await page.evaluate(()=>({google:!!document.querySelector('form[action^="/api/auth/google"]'),role:document.querySelector('form[action^="/api/auth/google"] input[name=role]')?.value,nestedForms:!!document.querySelector('form form'),overflow:document.documentElement.scrollWidth>innerWidth+1}));
      assert.ok(registration.google); assert.equal(registration.role,'teacher');assert.equal(registration.nestedForms,false);assert.equal(registration.overflow,false);assert.deepEqual(errors,[]);
      checks.push({name,login,registration,browserErrors:errors});
      await page.close();
    }
  } finally { await browser.close(); }
  const result={result:'PASS',environment:'Local production container; provider readiness mocked only in browser; no Google identity or production user created.',unconfiguredStatus:status,unconfiguredStart:start.status,forgedCallback:forged.status,checks};
  fs.writeFileSync(destination+'/browser-checks.json',JSON.stringify(result,null,2));
  console.log(JSON.stringify(result,null,2));
}
main().catch(error=>{console.error(error.name+': '+error.message);process.exitCode=1;});

const fs=require('fs'); const assert=require('node:assert/strict');
(async()=>{
 const base='https://adaptiveenglish.vercel.app';
 let r=await fetch(base+'/join?code=ZCRE6Q',{redirect:'manual'});
 console.log('join',r.status,r.headers.get('location')); assert.equal(r.status,307);
 let next=new URL(r.headers.get('location'),base); assert.equal(next.pathname,'/student/classroom'); assert.equal(next.searchParams.get('code'),'ZCRE6Q');
 r=await fetch(next,{redirect:'manual'}); console.log('classroom guest',r.status,r.headers.get('location'));assert.equal(r.status,307);
 next=new URL(r.headers.get('location'),base);assert.equal(next.pathname,'/auth/login');assert.equal(next.searchParams.get('redirect'),'/student/classroom?code=ZCRE6Q');
 r=await fetch(next);assert.equal(r.status,200);const html=await r.text();assert.ok(html.includes('Đăng Nhập')); console.log('login 200; login page rendered');
 for(const path of ['/','/auth/register']) {r=await fetch(base+path);assert.equal(r.status,200);console.log(path,200);}
 console.log('PASS public HTTP smoke; no database writes, no account login or real classroom membership test');
})().catch(e=>{console.error(e);process.exitCode=1});

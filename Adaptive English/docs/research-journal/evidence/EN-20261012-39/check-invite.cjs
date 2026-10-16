const fs = require('fs');
const vm = require('vm');
const ts = require('../../../../english-learning-platform/node_modules/typescript');
const assert = require('node:assert/strict');
const root = '../../../english-learning-platform/';
function load(file, mocks) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(root + file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(code, { exports, require: name => mocks[name], URL, URLSearchParams });
  return exports;
}
const joinPage = load('src/app/join/page.tsx', { 'next/navigation': { redirect: url => { throw { location: url }; } } }).default;
const join = args => { try { joinPage(args); } catch (result) { return result.location; } };
assert.equal(join({searchParams:{code:'ZCRE6Q'}}), '/student/classroom?code=ZCRE6Q');
assert.equal(join({searchParams:{code:' A&B '}}), '/student/classroom?code=A%26B');
assert.equal(join({searchParams:{code:['A','B']}}), '/student/classroom');
const {middleware} = load('src/middleware.ts', { 'next/server': { NextResponse: {redirect: url => url, next: () => 'next'} } });
const target = new URL('https://example.test/student/classroom?code=ZCRE6Q');
const login = middleware({nextUrl:target, url:target.href, cookies:{get:() => undefined}});
assert.equal(login.pathname, '/auth/login');
assert.equal(login.searchParams.get('redirect'), '/student/classroom?code=ZCRE6Q');
assert.equal(middleware({nextUrl:target, url:target.href, cookies:{get:() => ({value:'test'})}}), 'next');
console.log('PASS: 5 redirect/query/session assertions; no database access.');



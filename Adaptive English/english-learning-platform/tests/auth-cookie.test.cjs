const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/lib/authCookie.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const mod = { exports: {} };
new Function('module', 'exports', code)(mod, mod.exports);
const { authCookieSecure } = mod.exports;

test('Production cookies support explicitly configured HTTP loopback origins', () => {
  for (const origin of ['http://localhost:3008', 'http://127.0.0.1:3008', 'http://[::1]:3008']) {
    assert.equal(authCookieSecure('production', origin), false);
  }
});
test('Deployment, invalid config and localhost lookalikes keep Secure', () => {
  for (const origin of [undefined, '', 'invalid', 'https://localhost', 'https://school.example',
    'http://school.example', 'http://localhost.attacker.example', 'http://localhost@attacker.example']) {
    assert.equal(authCookieSecure('production', origin), true);
  }
});
test('Local development supports HTTP', () => {
  assert.equal(authCookieSecure('development', undefined), false);
});

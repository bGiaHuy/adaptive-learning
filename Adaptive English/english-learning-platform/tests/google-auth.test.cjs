const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ts = require('typescript');
const { PrismaClient } = require('@prisma/client');
const { NextResponse } = require('next/server');
function load(file, dependencies = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  new Function('require', 'module', 'exports', code)(name => name in dependencies ? dependencies[name] : require(name), module, module.exports);
  return module.exports;
}
const identity = load('lib/googleIdentity.ts');
fs.mkdirSync('.artifacts/google-auth-tests', { recursive: true });
const testDirectory = fs.mkdtempSync(path.resolve('.artifacts/google-auth-tests/run-'));
const testDatabase = path.join(testDirectory, 'test.sqlite');
const init = require('node:child_process').spawnSync('python', ['-c', 'import sqlite3,pathlib,sys;c=sqlite3.connect(sys.argv[1]);c.executescript(pathlib.Path(sys.argv[2]).read_text(encoding="utf-8"));c.close()', testDatabase, path.resolve('.artifacts/google-auth-tests/schema.sql')], { encoding: 'utf8' });
assert.equal(init.status, 0, 'Create fresh isolated SQLite schema: ' + init.stderr);
const db = new PrismaClient({ datasources: { db: { url: 'file:' + testDatabase.replaceAll('\\', '/') } } });
test.after(() => db.$disconnect());
process.env.BASE_URL = 'https://english.example';
process.env.GOOGLE_CLIENT_ID = '123-test.apps.googleusercontent.com';
process.env.GOOGLE_CLIENT_SECRET = 'isolated-test-only';
const flows = {};
const jar = new Map();
const sessions = [];
let currentUser = null;
let tokenRequests = 0;
let verifiedPayload = null;
let verifyThrows = false;
class FakeOAuthClient {
  constructor(options) { assert.equal(options.redirectUri, 'https://english.example/api/auth/google/callback'); }
  async getToken(options) { tokenRequests++; assert.ok(options.codeVerifier.length >= 43); return { tokens: { id_token: 'test-token' } }; }
  async verifyIdToken(options) { assert.equal(options.audience, process.env.GOOGLE_CLIENT_ID); if (verifyThrows) throw Error('Invalid signature'); return { getPayload: () => verifiedPayload }; }
}
const dependencies = {
  'next/server': { NextResponse },
  'next/headers': { cookies: () => ({ get: key => jar.has(key) ? { value: jar.get(key) } : undefined, set: (key, value, options) => { jar.set(key, value); flows.cookieOptions = options; } }) },
  '@/lib/prisma': { __esModule: true, default: db },
  '@/lib/auth': { getCurrentUser: async () => currentUser, hashPassword: async () => 'isolated-random-password-hash', setAuthSession: async id => sessions.push(id) },
  '@/lib/googleIdentity': identity,
  'google-auth-library': { OAuth2Client: FakeOAuthClient },
};
const start = load('app/api/auth/google/route.ts', dependencies);
const callback = load('app/api/auth/google/callback/route.ts', dependencies);
async function begin(query = '') {
  const response = await start.GET(new Request('https://english.example/api/auth/google' + query));
  assert.equal(response.status, 303);
  return new URL(response.headers.get('location'));
}
async function finish(url, changes = {}) {
  const state = url.searchParams.get('state');
  verifiedPayload = { sub: 'callback-new-subject', email: 'callback-student@example.invalid', email_verified: true, name: 'Test Student', nonce: url.searchParams.get('nonce'), ...changes };
  return callback.GET(new Request('https://english.example/api/auth/google/callback?' + new URLSearchParams({ code: 'test-code', state })));
}

test('OAuth state, nonce and PKCE have independent random entropy and constant-time equality', () => {
  const a = identity.newGoogleFlow(), b = identity.newGoogleFlow();
  assert.notEqual(a.state, b.state); assert.notEqual(a.nonce, a.state);
  assert.equal(a.codeChallenge, crypto.createHash('sha256').update(a.codeVerifier).digest('base64url'));
  assert.equal(identity.sameGoogleState(a.state, a.state), true);
  for (const value of ['', a.state + 'x', 'x'.repeat(43)]) assert.equal(identity.sameGoogleState(a.state, value), false);
});
test('return destinations reject external, encoded and cross-role paths', () => {
  for (const value of ['//evil.example', 'https://evil.example', '/student/../teacher/dashboard', '/student/%2e%2e/teacher/dashboard', '/student/\\evil', '/student/%5cevil', '/teacher/dashboard']) assert.equal(identity.safeGoogleReturnTo(value, 'student'), '');
  assert.equal(identity.safeGoogleReturnTo('/student/classroom/join?code=test', 'student'), '/student/classroom/join?code=test');
});
test('unverified email and incorrect nonce are rejected', () => {
  const nonce = identity.newGoogleFlow().nonce;
  const payload = { sub: 'test-sub', email: 'test@example.invalid', email_verified: true, nonce };
  assert.equal(identity.validateGoogleClaims(payload, nonce).subject, 'test-sub');
  assert.throws(() => identity.validateGoogleClaims({ ...payload, email_verified: false }, nonce));
  assert.throws(() => identity.validateGoogleClaims({ ...payload, nonce: identity.newGoogleFlow().nonce }, nonce));
});
test('authorization uses fixed origin, narrow scopes, state cookie and PKCE', async () => {
  const url = await begin('?role=admin&redirect=//evil.example');
  assert.equal(url.origin, 'https://accounts.google.com');
  assert.equal(url.searchParams.get('redirect_uri'), 'https://english.example/api/auth/google/callback');
  assert.equal(url.searchParams.get('scope'), 'openid email profile');
  assert.equal(url.searchParams.get('code_challenge_method'), 'S256');
  assert.equal(flows.cookieOptions.httpOnly, true); assert.equal(flows.cookieOptions.secure, true); assert.equal(flows.cookieOptions.sameSite, 'lax');
  const record = await db.googleOAuthState.findUnique({ where: { stateHash: identity.googleStateHash(url.searchParams.get('state')) } });
  assert.equal(record.role, 'student'); assert.equal(record.returnTo, '');
});
test('forged callback state never exchanges code or creates a session', async () => {
  const before = tokenRequests, count = sessions.length;
  const response = await callback.GET(new Request('https://english.example/api/auth/google/callback?state=forged&code=stolen'));
  assert.ok(response.headers.get('location').endsWith('google_error=state'));
  assert.equal(tokenRequests, before); assert.equal(sessions.length, count);
});
test('new Google student has six profiles, existing session, and one-use callback state', async () => {
  const url = await begin('?redirect=/student/home');
  const response = await finish(url);
  assert.equal(response.headers.get('location'), 'https://english.example/student/home');
  const user = await db.user.findUnique({ where: { email: 'callback-student@example.invalid' }, include: { googleAccount: true, skillProfiles: true } });
  assert.equal(user.role, 'student'); assert.equal(user.googleAccount.subject, 'callback-new-subject'); assert.equal(user.skillProfiles.length, 6);
  assert.equal(sessions.at(-1), user.id);
  const before = tokenRequests;
  const replay = await finish(url);
  assert.ok(replay.headers.get('location').endsWith('google_error=state')); assert.equal(tokenRequests, before);
});
test('signature verification failure never creates or logs in a user', async () => {
  const url = await begin(); const count = sessions.length;
  verifyThrows = true;
  const response = await finish(url, { sub: 'bad-signature', email: 'bad@example.invalid' });
  verifyThrows = false;
  assert.ok(response.headers.get('location').endsWith('google_error=failed')); assert.equal(sessions.length, count);
  assert.equal(await db.user.count({ where: { email: 'bad@example.invalid' } }), 0);
});
test('returning Google subject retains original user, email and role', async () => {
  const user = await db.user.findUnique({ where: { email: 'callback-student@example.invalid' } });
  const result = await identity.resolveGoogleIdentity(db, { subject: 'callback-new-subject', email: 'changed@example.invalid', name: 'Changed' }, { role: 'teacher', linkUserId: null }, null, 'unused');
  assert.equal(result.user.id, user.id); assert.equal(result.user.role, 'student'); assert.equal(result.user.email, user.email);
});
test('existing email cannot be taken over or duplicated by Google sign-in', async () => {
  const user = await db.user.create({ data: { email: 'password-admin@example.invalid', name: 'Admin fixture', role: 'admin', passwordHash: 'test-only' } });
  await assert.rejects(identity.resolveGoogleIdentity(db, { subject: 'new-admin-google', email: user.email, name: 'Attacker' }, { role: 'teacher', linkUserId: null }, null, 'unused'), /google_link_required/);
  assert.equal(await db.googleAccount.count({ where: { userId: user.id } }), 0);
  assert.equal(await db.user.count({ where: { email: user.email } }), 1);
});
test('explicit linking requires same user session and matching Google email', async () => {
  const user = await db.user.findUnique({ where: { email: 'password-admin@example.invalid' } });
  const flow = { role: 'student', linkUserId: user.id };
  const profile = { subject: 'linked-admin-google', email: user.email, name: 'Admin' };
  await assert.rejects(identity.resolveGoogleIdentity(db, profile, flow, null, 'unused'), /google_link_session/);
  await assert.rejects(identity.resolveGoogleIdentity(db, { ...profile, email: 'other@example.invalid' }, flow, user.id, 'unused'), /google_link_email/);
  const result = await identity.resolveGoogleIdentity(db, profile, flow, user.id, 'unused');
  assert.equal(result.user.role, 'admin'); assert.equal(result.linked, true);
});
test('cross-origin linking is rejected before touching account state', async () => {
  const before = await db.googleOAuthState.count();
  const response = await start.POST(new Request('https://english.example/api/auth/google', { method: 'POST', headers: { origin: 'https://evil.example' } }));
  assert.equal(response.status, 403); assert.equal(await db.googleOAuthState.count(), before);
});
test('expired and cancelled OAuth flows create no session', async () => {
  const url = await begin(); const state = url.searchParams.get('state');
  await db.googleOAuthState.update({ where: { stateHash: identity.googleStateHash(state) }, data: { expiresAt: new Date(0) } });
  assert.ok((await finish(url)).headers.get('location').endsWith('google_error=state'));
  const other = await begin(); const count = sessions.length;
  const response = await callback.GET(new Request('https://english.example/api/auth/google/callback?' + new URLSearchParams({ state: other.searchParams.get('state'), error: 'access_denied' })));
  assert.ok(response.headers.get('location').endsWith('google_error=cancelled')); assert.equal(sessions.length, count);
});

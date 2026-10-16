// Run only against this audit's isolated Next.js production runtime.
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('./runtime/node_modules/@prisma/client');
const prisma = new PrismaClient();
const base = 'http://127.0.0.1:3018';
const findings = [];

async function call(route, body, cookie) {
  const response = await fetch(base + route, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(cookie ? { Cookie: cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: 'manual',
  });
  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { nonJson: true }; }
  return { status: response.status, data,
    cookie: response.headers.getSetCookie().map(v => v.split(';')[0]).join('; '),
    secureCookie: response.headers.getSetCookie().every(v => /; Secure/i.test(v)),
    location: response.headers.get('location') };
}

async function main() {
  const before = await prisma.user.count();
  if (before !== 0) throw new Error('Audit runtime DB must start empty; refusing to use existing users.');
  const register = await call('/api/auth/register', { name: 'Synthetic Audit Student', email: 'audit-student@example.invalid', password: 'AuditInitial-2026!', role: 'student' });
  findings.push({ test: 'Register synthetic student on production build', status: register.status, secureCookie: register.secureCookie });
  if (register.status !== 200) throw new Error('Could not register isolated user');
  const identity = await call('/api/auth/me', undefined, register.cookie);
  findings.push({ test: 'Authenticated me', status: identity.status });
  for (const route of ['/api/auth/me', '/api/classes', '/api/admin/users']) {
    findings.push({ test: 'Anonymous ' + route, status: (await call(route)).status });
  }
  findings.push({ test: 'Student calls admin users', status: (await call('/api/admin/users', undefined, register.cookie)).status });
  findings.push({ test: 'Production role switching', status: (await call('/api/auth/switch-role', { role: 'admin' })).status });
  const user = await prisma.user.findUnique({ where: { email: 'audit-student@example.invalid' } });
  const session = await prisma.session.findFirst({ where: { userId: user.id } });
  const raw = register.cookie.match(/adaptive_session_token=([^;]+)/)?.[1];
  findings.push({ test: 'Session stored as hash, not raw token', passed: session.sessionToken !== raw && session.sessionToken.length === 64 });
  const recovery = await call('/api/auth/recover', { email: user.email });
  findings.push({ test: 'Anonymous production recovery exposes reset link with SMTP absent and simulation false', status: recovery.status, hasLiveEmailService: recovery.data.hasLiveEmailService, resetLinkExposed: !!recovery.data.testResetLink });
  if (recovery.data.testResetLink) {
    const token = new URL(recovery.data.testResetLink).searchParams.get('token');
    const reset = await call('/api/auth/reset-password', { token, newPassword: 'AuditChanged-2026!' });
    const takeoverLogin = await call('/api/auth/login', { email: user.email, password: 'AuditChanged-2026!' });
    const revoked = await call('/api/auth/me', undefined, register.cookie);
    findings.push({ test: 'Reset without mailbox access then login with attacker-chosen password', resetStatus: reset.status, loginStatus: takeoverLogin.status, oldSessionStatus: revoked.status });
    const raceRecovery = await call('/api/auth/recover', { email: user.email });
    const raceToken = new URL(raceRecovery.data.testResetLink).searchParams.get('token');
    const race = await Promise.all([
      call('/api/auth/reset-password', { token: raceToken, newPassword: 'RaceFirst-2026!' }),
      call('/api/auth/reset-password', { token: raceToken, newPassword: 'RaceSecond-2026!' }),
    ]);
    findings.push({ test: 'Same reset token used by two simultaneous requests', statuses: race.map(r => r.status), expected: 'Exactly one succeeds' });
  }
  const publicAudio = await fetch(base + '/uploads/audio/audit-canary.webm');
  findings.push({ test: 'Anonymous access to synthetic file in recording storage', status: publicAudio.status, bytes: (await publicAudio.arrayBuffer()).byteLength });
  const result = { environment: 'Copied .next production build; fresh empty SQLite schema; no .env or provider credentials copied; copied generated Prisma client points only at audit DB.', findings };
  fs.writeFileSync(path.join(__dirname, 'runtime-results.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
}

main().catch(e => { console.error(e.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());

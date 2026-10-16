const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE_URL = process.env.BASE_URL || 'http://localhost:3008';

async function runPasswordResetSuite() {
  console.log('====================================================');
  console.log('   STARTING PASSWORD RECOVERY & RESET TEST SUITE    ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  const testEmail = 'student1@journey.test';
  const initialPassword = 'Password123!';
  const newPassword = 'NewSecretPassword456!';

  try {
    // 0. Ensure user exists
    const user = await prisma.user.findUnique({ where: { email: testEmail } });
    assert(!!user, `User ${testEmail} exists in database`);

    // Clean up any existing reset tokens for this user
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    // 1. Initial Login to establish an active session
    console.log('\n--- 1. Initial Login & Session Creation ---');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: initialPassword }),
    });
    assert(loginRes.status === 200, 'Login with original password returns 200');
    const setCookie = loginRes.headers.get('set-cookie') || '';
    const sessionCookie = setCookie.split(';')[0];
    assert(sessionCookie.includes('adaptive_session_token='), 'Received session cookie');

    // Verify session works
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: sessionCookie },
    });
    assert(meRes.status === 200, '/api/auth/me with session cookie returns 200');

    // 2. Request Password Recovery for Registered User
    console.log('\n--- 2. Request Recovery for Registered User ---');
    const recoverRes = await fetch(`${BASE_URL}/api/auth/recover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });
    assert(recoverRes.status === 200, 'Recover endpoint returns 200 for valid user');
    const recoverData = await recoverRes.json();
    assert(recoverData.success === true, 'Response payload contains success: true');
    assert(typeof recoverData.message === 'string', 'Response contains neutral message');
    assert(!!recoverData.testResetLink, 'Test reset link provided in non-production environment');

    // Check database has created a token
    const dbToken = await prisma.passwordResetToken.findFirst({
      where: { userId: user.id, usedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    assert(!!dbToken, 'Database contains PasswordResetToken record for user');
    assert(dbToken.tokenHash && dbToken.tokenHash.length === 64, 'Token is stored as 64-char SHA-256 hash');
    assert(dbToken.expiresAt > new Date(), 'Token expiration is in the future (~30 mins)');

    // Extract raw token from testResetLink
    const urlObj = new URL(recoverData.testResetLink, BASE_URL);
    const rawToken = urlObj.searchParams.get('token');
    assert(!!rawToken, 'Extracted raw token from testResetLink');

    // 3. Request Password Recovery for Non-Existent Email (No Enumeration)
    console.log('\n--- 3. Email Enumeration Protection ---');
    const nonExistentEmail = 'doesnotexist987654321@example.com';
    const fakeRecoverRes = await fetch(`${BASE_URL}/api/auth/recover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: nonExistentEmail }),
    });
    assert(fakeRecoverRes.status === 200, 'Recover returns identical 200 for non-existent email');
    const fakeData = await fakeRecoverRes.json();
    assert(fakeData.message === recoverData.message, 'Neutral message is identical to avoid email enumeration');
    assert(!fakeData.testResetLink, 'No reset link created for non-existent user');

    // 4. Reset with Invalid / Fake Token
    console.log('\n--- 4. Reset with Invalid Token ---');
    const fakeTokenRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'definitely-invalid-token-1234567890', password: 'ValidPassword123!' }),
    });
    assert(fakeTokenRes.status === 400, 'Invalid token rejected with HTTP 400');

    // 5. Reset with Weak Password (< 8 chars)
    console.log('\n--- 5. Password Complexity Validation ---');
    const weakPassRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: rawToken, password: 'short' }),
    });
    assert(weakPassRes.status === 400, 'Short password (< 8 chars) rejected with HTTP 400');

    // 6. Successful Password Reset with the active token
    console.log('\n--- 6. Successful Password Reset ---');
    const resetRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: rawToken, password: newPassword }),
    });
    const resetBodyText = await resetRes.text();
    let resetData = {};
    try { resetData = JSON.parse(resetBodyText); } catch(e) {}

    assert(resetRes.status === 200, 'Valid reset returns HTTP 200');
    assert(resetData.success === true, 'Reset response has success: true');

    // Verify token marked used
    const consumedToken = await prisma.passwordResetToken.findUnique({
      where: { id: dbToken.id },
    });
    assert(consumedToken && consumedToken.usedAt !== null, 'Token marked as used (usedAt is set)');

    // 7. Token Replay Protection (Single-use token)
    console.log('\n--- 7. Token Replay Attack Prevention ---');
    const replayRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: rawToken, password: 'AnotherPassword789!' }),
    });
    assert(replayRes.status === 400, 'Re-using already consumed token rejected with HTTP 400');

    // 8. Rate Limiting Check (on a dedicated test address)
    console.log('\n--- 8. Rate Limiting Protection ---');
    const rateLimitEmail = 'ratelimit-test@journey.test';
    const r1 = await fetch(`${BASE_URL}/api/auth/recover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: rateLimitEmail }),
    });
    const r2 = await fetch(`${BASE_URL}/api/auth/recover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: rateLimitEmail }),
    });
    const r3 = await fetch(`${BASE_URL}/api/auth/recover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: rateLimitEmail }),
    });
    const r4 = await fetch(`${BASE_URL}/api/auth/recover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: rateLimitEmail }),
    });
    assert(r4.status === 429, 'Fourth recovery request blocked with HTTP 429 Too Many Requests');

    // 9. Session Revocation Verification (Previous sessions killed)
    console.log('\n--- 9. Session Invalidation Verification ---');
    const oldSessionMe = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: sessionCookie },
    });
    assert(oldSessionMe.status === 401, 'Old session cookie is immediately revoked (HTTP 401 on /api/auth/me)');

    // 10. Login with Old Password Fails
    console.log('\n--- 10. Old Password Invalidation ---');
    const oldLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: initialPassword }),
    });
    assert(oldLoginRes.status === 401, 'Login with old password fails (HTTP 401)');

    // 11. Login with New Password Succeeds
    console.log('\n--- 11. New Password Verification ---');
    const newLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: newPassword }),
    });
    assert(newLoginRes.status === 200, 'Login with new password succeeds (HTTP 200)');
    const newCookie = (newLoginRes.headers.get('set-cookie') || '').split(';')[0];
    const newMeRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: newCookie },
    });
    assert(newMeRes.status === 200, '/api/auth/me with new session succeeds');

    // 12. Cleanup / Revert password back to initialPassword
    console.log('\n--- 12. Restore Test Password ---');
    // Create new reset token to restore password cleanly
    const restoreRes = await fetch(`${BASE_URL}/api/auth/recover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });
    // Even if rate limited on recover endpoint for IP, we can directly update password via bcrypt in prisma
    const bcrypt = require('bcryptjs');
    const restoredHash = await bcrypt.hash(initialPassword, 10);
    await prisma.user.update({
      where: { email: testEmail },
      data: { passwordHash: restoredHash },
    });
    console.log('  [PASS] Password restored cleanly to initialPassword');

  } catch (err) {
    console.error('Test suite caught exception:', err);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n====================================================');
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPasswordResetSuite();

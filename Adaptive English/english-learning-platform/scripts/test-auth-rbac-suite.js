const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

const BASE_URL = process.env.BASE_URL || 'http://localhost:3008';

function hashSessionToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function parseCookie(res) {
  const raw = res.headers.get('set-cookie');
  if (!raw) return '';
  return raw.split(';')[0];
}

function extractTokenValue(cookieStr) {
  const match = cookieStr.match(/adaptive_session_token=([^;]+)/);
  return match ? match[1] : '';
}

async function runTests() {
  console.log('====================================================');
  console.log('   STARTING AUTH & RBAC SECURITY VERIFICATION SUITE  ');
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

  try {
    // ----------------------------------------------------
    // TEST 1: Chưa đăng nhập gọi các API riêng tư -> 401
    // ----------------------------------------------------
    console.log('--- TEST 1: Unauthenticated Requests to Private APIs ---');
    const unauthRoutes = [
      { url: '/api/auth/me', method: 'GET' },
      { url: '/api/admin/stats', method: 'GET' },
      { url: '/api/classes', method: 'GET' },
      { url: '/api/assignments', method: 'GET' },
      { url: '/api/notifications', method: 'GET' },
      { url: '/api/ai/evaluate', method: 'POST', body: { skill: 'writing', content: 'test' } },
      { url: '/api/audio/upload', method: 'POST' },
      { url: '/api/teacher/import-docx', method: 'POST', body: { action: 'publish' } },
    ];

    for (const r of unauthRoutes) {
      const opts = { method: r.method };
      if (r.body) {
        opts.headers = { 'Content-Type': 'application/json' };
        opts.body = JSON.stringify(r.body);
      }
      const res = await fetch(`${BASE_URL}${r.url}`, opts);
      assert(res.status === 401, `Unauth ${r.method} ${r.url} returned 401 (actual: ${res.status})`);
    }

    // ----------------------------------------------------
    // TEST 2: Đăng nhập sai mật khẩu -> 401, không tạo phiên
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Login with Invalid Password ---');
    const badLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@example.com', password: 'WrongPassword999!' }),
    });
    assert(badLoginRes.status === 401, `Wrong password rejected with 401 (actual: ${badLoginRes.status})`);
    const badCookies = badLoginRes.headers.get('set-cookie');
    assert(!badCookies || !badCookies.includes('adaptive_session_token='), 'No session cookie issued for wrong password');

    // ----------------------------------------------------
    // TEST 3: Đăng nhập đúng mật khẩu -> 200, tạo phiên hợp lệ
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Login with Correct Password ---');
    const goodLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@example.com', password: 'password123' }),
    });
    assert(goodLoginRes.status === 200, `Correct password login succeeded with 200 (actual: ${goodLoginRes.status})`);
    const studentCookie = parseCookie(goodLoginRes);
    assert(studentCookie.includes('adaptive_session_token='), `Received httpOnly session cookie: ${studentCookie.slice(0, 35)}...`);
    
    const loginData = await goodLoginRes.json();
    assert(loginData.user && loginData.user.email === 'student@example.com', 'Login returned student user data');
    assert(!('passwordHash' in loginData.user) && !('password' in loginData.user) && !('sessionToken' in loginData.user), 'No sensitive password or token fields exposed in response');

    // Verify session works on /api/auth/me
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: studentCookie },
    });
    assert(meRes.status === 200, `GET /api/auth/me with valid session returned 200 (actual: ${meRes.status})`);

    // ----------------------------------------------------
    // TEST 4: Dùng userId làm cookie giả -> bị từ chối 401
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Forged Cookie with Raw userId ---');
    const studentUser = await prisma.user.findUnique({ where: { email: 'student@example.com' } });
    const fakeUserIdCookie = `adaptive_session_token=${studentUser.id}`;
    const fakeLegacyCookie = `adaptive_session_user=${studentUser.id}`;

    const fakeRes1 = await fetch(`${BASE_URL}/api/auth/me`, { headers: { Cookie: fakeUserIdCookie } });
    assert(fakeRes1.status === 401, `adaptive_session_token=<userId> rejected with 401 (actual: ${fakeRes1.status})`);

    const fakeRes2 = await fetch(`${BASE_URL}/api/auth/me`, { headers: { Cookie: fakeLegacyCookie } });
    assert(fakeRes2.status === 401, `adaptive_session_user=<userId> rejected with 401 (actual: ${fakeRes2.status})`);

    // ----------------------------------------------------
    // TEST 5: Đổi token giả mạo -> 401
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Tampered / Random Nonexistent Token ---');
    const tamperedRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: 'adaptive_session_token=random_forged_hex_token_98234891238491283' },
    });
    assert(tamperedRes.status === 401, `Tampered token rejected with 401 (actual: ${tamperedRes.status})`);

    // ----------------------------------------------------
    // TEST 6: Dùng token hết hạn -> 401 và tự dọn dẹp DB
    // ----------------------------------------------------
    console.log('\n--- TEST 6: Expired Token Handling ---');
    const expiredRawToken = crypto.randomBytes(32).toString('hex');
    const expiredHash = hashSessionToken(expiredRawToken);
    const expiredSession = await prisma.session.create({
      data: {
        sessionToken: expiredHash,
        userId: studentUser.id,
        expiresAt: new Date(Date.now() - 3600000), // 1 hour in the past
      },
    });

    const expiredRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: `adaptive_session_token=${expiredRawToken}` },
    });
    assert(expiredRes.status === 401, `Expired token rejected with 401 (actual: ${expiredRes.status})`);

    const sessionInDbAfter = await prisma.session.findUnique({ where: { id: expiredSession.id } });
    assert(sessionInDbAfter === null, 'Expired session was deleted from database on verification');

    // ----------------------------------------------------
    // TEST 7: Thu hồi phiên sau đăng xuất -> 401
    // ----------------------------------------------------
    console.log('\n--- TEST 7: Logout and Session Revocation ---');
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { Cookie: studentCookie },
    });
    assert(logoutRes.status === 200, `Logout succeeded with 200 (actual: ${logoutRes.status})`);

    // Token must be rejected immediately
    const postLogoutMe = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: studentCookie },
    });
    assert(postLogoutMe.status === 401, `Post-logout token rejected with 401 (actual: ${postLogoutMe.status})`);

    // ----------------------------------------------------
    // TEST 8: Đăng ký công khai: không cho phép đăng ký admin
    // ----------------------------------------------------
    console.log('\n--- TEST 8: Prevent Public Registration of Admin ---');
    const adminRegisterRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `evil_admin_${Date.now()}@test.com`,
        password: 'password123',
        name: 'Evil Admin',
        role: 'admin',
      }),
    });
    assert(adminRegisterRes.status === 400, `Public registration of admin role blocked with 400 (actual: ${adminRegisterRes.status})`);

    // ----------------------------------------------------
    // TEST 9: Học sinh gọi API giáo viên và admin -> 403
    // ----------------------------------------------------
    console.log('\n--- TEST 9: Student Calling Teacher/Admin APIs (403) ---');
    // Log back in as student
    const studentLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@example.com', password: 'password123' }),
    });
    const sCookie = parseCookie(studentLogin);

    // Call Admin Stats
    const studentToAdminStats = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { Cookie: sCookie },
    });
    assert(studentToAdminStats.status === 403, `Student calling /api/admin/stats returned 403 (actual: ${studentToAdminStats.status})`);

    // Call Admin Users
    const studentToAdminUsers = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { Cookie: sCookie },
    });
    assert(studentToAdminUsers.status === 403, `Student calling /api/admin/users returned 403 (actual: ${studentToAdminUsers.status})`);

    // Call Teacher Create Class
    const studentCreateClass = await fetch(`${BASE_URL}/api/classes`, {
      method: 'POST',
      headers: { Cookie: sCookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Lớp Của Học Sinh', room: '101' }),
    });
    assert(studentCreateClass.status === 403, `Student creating classroom returned 403 (actual: ${studentCreateClass.status})`);

    // Call Teacher Import DOCX
    const studentImportDocx = await fetch(`${BASE_URL}/api/teacher/import-docx`, {
      method: 'POST',
      headers: { Cookie: sCookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'publish' }),
    });
    assert(studentImportDocx.status === 403, `Student calling /api/teacher/import-docx returned 403 (actual: ${studentImportDocx.status})`);

    // ----------------------------------------------------
    // TEST 10: Giáo viên A truy cập lớp của Giáo viên B -> 403
    // ----------------------------------------------------
    console.log('\n--- TEST 10: Teacher A Accessing Teacher B Class (403) ---');
    // Ensure we have Teacher B and a Class owned by Teacher B
    let teacherB = await prisma.user.findFirst({ where: { email: { startsWith: 'teacher_b' } } });
    if (!teacherB) {
      teacherB = await prisma.user.create({
        data: {
          email: `teacher_b_${Date.now()}@adaptive.edu.vn`,
          passwordHash: await require('bcryptjs').hash('password123', 10),
          name: 'Cô Minh Thư (Teacher B)',
          role: 'teacher',
        },
      });
    }

    let classB = await prisma.classroom.findFirst({ where: { teacherId: teacherB.id } });
    if (!classB) {
      classB = await prisma.classroom.create({
        data: {
          name: 'Lớp 10A2 - Cô Thư',
          code: `TB${Math.floor(1000 + Math.random() * 9000)}`,
          teacherId: teacherB.id,
        },
      });
    }

    // Login Teacher A
    const teacherALogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'teacher@example.com', password: 'password123' }),
    });
    const tACookie = parseCookie(teacherALogin);

    // Teacher A tries to GET Teacher B's class
    const tAAccessBClass = await fetch(`${BASE_URL}/api/classes/${classB.id}`, {
      headers: { Cookie: tACookie },
    });
    assert(tAAccessBClass.status === 403, `Teacher A accessing Teacher B's class returned 403 (actual: ${tAAccessBClass.status})`);

    // Teacher A tries to create assignment in Teacher B's class
    const tACreateAsgInBClass = await fetch(`${BASE_URL}/api/assignments`, {
      method: 'POST',
      headers: { Cookie: tACookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        classId: classB.id,
        title: 'Đề thi của Thầy Hoàng gửi lớp Cô Thư',
        skill: 'reading',
      }),
    });
    assert(tACreateAsgInBClass.status === 403, `Teacher A creating assignment in Teacher B's class returned 403 (actual: ${tACreateAsgInBClass.status})`);

    // ----------------------------------------------------
    // TEST 11: Học sinh A truy cập bài nộp của Học sinh B -> 403
    // ----------------------------------------------------
    console.log('\n--- TEST 11: Student A Accessing Student B Submission (403) ---');
    let studentB = await prisma.user.findFirst({ where: { email: { startsWith: 'student_b' } } });
    if (!studentB) {
      studentB = await prisma.user.create({
        data: {
          email: `student_b_${Date.now()}@adaptive.edu.vn`,
          passwordHash: await require('bcryptjs').hash('password123', 10),
          name: 'Học sinh B Mai Phương',
          role: 'student',
        },
      });
    }

    // Find or create an assignment and a submission for Student B
    let assignment = await prisma.assignment.findFirst({ include: { classroom: true } });
    let subB = await prisma.submission.findFirst({ where: { studentId: studentB.id } });
    if (!subB && assignment) {
      subB = await prisma.submission.create({
        data: {
          assignmentId: assignment.id,
          studentId: studentB.id,
          content: 'Bài làm bí mật của Học sinh B',
          status: 'pending_grading',
        },
      });
    }

    if (subB) {
      // Student A attempts to read Student B's submission
      const sAAccessSubB = await fetch(`${BASE_URL}/api/grading/${subB.id}`, {
        headers: { Cookie: sCookie },
      });
      assert(sAAccessSubB.status === 403, `Student A viewing Student B's submission returned 403 (actual: ${sAAccessSubB.status})`);
    } else {
      console.log('  [SKIP] No submission found or created for Student B');
    }

    // ----------------------------------------------------
    // TEST 12: switch-role bị chặn trên production -> 403
    // ----------------------------------------------------
    console.log('\n--- TEST 12: switch-role Blocked on Production ---');
    const switchRoleRes = await fetch(`${BASE_URL}/api/auth/switch-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'admin' }),
    });
    assert(switchRoleRes.status === 403, `POST /api/auth/switch-role returned 403 (actual: ${switchRoleRes.status})`);

    // ----------------------------------------------------
    // TEST 13: Bảo vệ trang theo vai trò (Direct URL Navigation)
    // ----------------------------------------------------
    console.log('\n--- TEST 13: Direct URL Protection & Redirects ---');
    // Without cookie -> redirect to login
    const noAuthAdminPage = await fetch(`${BASE_URL}/admin`, { redirect: 'manual' });
    assert(
      noAuthAdminPage.status === 307 || noAuthAdminPage.status === 308 || noAuthAdminPage.status === 302,
      `Unauth access to /admin redirected (status: ${noAuthAdminPage.status}, location: ${noAuthAdminPage.headers.get('location')})`
    );

    const noAuthTeacherPage = await fetch(`${BASE_URL}/teacher/dashboard`, { redirect: 'manual' });
    assert(
      noAuthTeacherPage.status === 307 || noAuthTeacherPage.status === 308 || noAuthTeacherPage.status === 302,
      `Unauth access to /teacher/dashboard redirected (status: ${noAuthTeacherPage.status}, location: ${noAuthTeacherPage.headers.get('location')})`
    );

    const noAuthStudentPage = await fetch(`${BASE_URL}/student/home`, { redirect: 'manual' });
    assert(
      noAuthStudentPage.status === 307 || noAuthStudentPage.status === 308 || noAuthStudentPage.status === 302,
      `Unauth access to /student/home redirected (status: ${noAuthStudentPage.status}, location: ${noAuthStudentPage.headers.get('location')})`
    );

    // Student cookie accessing /admin -> should be redirected away from /admin
    const studentAdminPage = await fetch(`${BASE_URL}/admin`, {
      headers: { Cookie: sCookie },
      redirect: 'manual',
    });
    assert(
      studentAdminPage.status === 307 || studentAdminPage.status === 308 || studentAdminPage.status === 302,
      `Student accessing /admin redirected to non-admin area (status: ${studentAdminPage.status}, location: ${studentAdminPage.headers.get('location')})`
    );

    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal error during test run:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();

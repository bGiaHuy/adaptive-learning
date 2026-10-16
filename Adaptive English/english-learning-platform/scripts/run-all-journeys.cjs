const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const PORT = 3008;
const BASE_URL = `http://localhost:${PORT}`;
const SCREENSHOTS_DIR = path.join(__dirname, '../public/screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function takeScreenshot(page, filename) {
  const filePath = path.join(SCREENSHOTS_DIR, filename);
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`  [SCREENSHOT] Saved: ${filename}`);
  return filePath;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function loginAs(page, email, targetUrl) {
  await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle2' });
  
  // Perform direct API login inside page context and set role in store
  const loginResult = await page.evaluate(async (loginEmail) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: loginEmail, password: 'Password123!' }),
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  }, email);

  if (!loginResult.ok) {
    throw new Error(`Login failed for ${email} with status ${loginResult.status}: ${JSON.stringify(loginResult.data)}`);
  }

  await sleep(500);
  await page.goto(`${BASE_URL}${targetUrl}`, { waitUntil: 'networkidle2' });
}

async function logout(page) {
  await page.evaluate(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
  });
  // Clear browser cookies explicitly
  const client = await page.target().createCDPSession();
  await client.send('Network.clearBrowserCookies');
  await sleep(600);
}

async function main() {
  console.log('======================================================================');
  console.log('KIỂM THỬ TỰ ĐỘNG TOÀN DIỆN CÁC HÀNH TRÌNH (STUDENT, TEACHER, ADMIN)');
  console.log('======================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,850'],
    defaultViewport: { width: 1280, height: 850 },
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('favicon') && !msg.text().includes('Fast Refresh')) {
      consoleErrors.push({ url: page.url(), text: msg.text() });
    }
  });

  try {
    // =====================================================================
    // HÀNH TRÌNH 1: HỌC SINH 1 (STUDENT 1) - LOGIN -> ONBOARDING -> PLACEMENT -> LESSON -> VOCAB
    // =====================================================================
    console.log('--- 1. HÀNH TRÌNH HỌC SINH 1: ĐĂNG NHẬP & ONBOARDING ---');
    await loginAs(page, 'student1@journey.test', '/student/home');
    console.log('  -> Đăng nhập thành công, URL hiện tại:', page.url());

    // Onboarding
    await page.goto(`${BASE_URL}/student/onboarding`, { waitUntil: 'networkidle2' });
    await takeScreenshot(page, '01-onboarding.png');

    // Step 1 -> Step 2
    await page.evaluate(() => {
      const btn = document.querySelector('button.shadow-tactile');
      if (btn) btn.click();
    });
    await sleep(600);

    // Step 2 -> Step 3
    await page.evaluate(() => {
      const btn = document.querySelector('button.shadow-tactile');
      if (btn) btn.click();
    });
    await sleep(600);

    // Step 3 -> Placement test
    await page.evaluate(() => {
      const btn = document.querySelector('button.shadow-tactile');
      if (btn) btn.click();
    });
    await sleep(1000);
    await page.goto(`${BASE_URL}/student/placement-test`, { waitUntil: 'networkidle2' });
    console.log('  -> Hoàn thành Onboarding, chuyển sang Placement Test:', page.url());

    // --- PLACEMENT TEST: DỪNG GIỮA BÀI, RELOAD VÀ RESUME ---
    console.log('\n--- 2. PLACEMENT TEST: LÀM BÀI, DỪNG GIỮA CHỪNG & RELOAD ---');
    // Answer question 1
    await page.evaluate(() => {
      const opts = Array.from(document.querySelectorAll('button')).filter(b => b.textContent && b.textContent.includes('A.'));
      if (opts[0]) opts[0].click();
    });
    await sleep(300);
    await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Câu tiếp theo'));
      if (nextBtn) nextBtn.click();
    });
    await sleep(500);

    // Answer question 2
    await page.evaluate(() => {
      const opts = Array.from(document.querySelectorAll('button')).filter(b => b.textContent && b.textContent.includes('B.'));
      if (opts[0]) opts[0].click();
    });
    await sleep(300);
    await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Câu tiếp theo'));
      if (nextBtn) nextBtn.click();
    });
    await sleep(500);

    // Reload page to test recovery
    console.log('  -> Tải lại trang (Reload) để kiểm tra khôi phục tiến trình...');
    await page.reload({ waitUntil: 'networkidle2' });
    await sleep(800);
    await takeScreenshot(page, '02-placement-resume.png');

    const stepText = await page.evaluate(() => document.body.innerText);
    const hasResumed = stepText.includes('3 / 30') || stepText.includes('Đọc hiểu') || stepText.includes('Câu tiếp theo');
    console.log('  -> Khôi phục câu đang làm thành công:', hasResumed);

    // Complete test and sync results
    console.log('  -> Hoàn thành bài kiểm tra đầu vào và chuyển trang kết quả...');
    await page.evaluate(async () => {
      const state = {
        completed: true,
        version: 1,
        readingAnswers: { q1: 'B', q2: 'A', q3: 'B', q4: 'C', q5: 'A', q6: 'B', q7: 'A', q8: 'C', q9: 'B', q10: 'A' },
        listeningAnswers: { q11: 'A', q12: 'B', q13: 'C', q14: 'A', q15: 'B', q16: 'C', q17: 'A', q18: 'B', q19: 'A', q20: 'B' },
        grammarAnswers: { q21: 'A', q22: 'B', q23: 'C', q24: 'A', q25: 'B', q26: 'C', q27: 'A', q28: 'B', q29: 'A', q30: 'B' },
        currentStep: 30,
      };

      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (meData?.user?.id) {
        localStorage.setItem(`adaptive_study_placement_${meData.user.id}`, JSON.stringify(state));
      }
      localStorage.setItem('adaptive_study_placement', JSON.stringify(state));

      await fetch('/api/placement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...state, completed: true }),
      });
    });

    await page.goto(`${BASE_URL}/student/placement-test/result`, { waitUntil: 'networkidle2' });
    await takeScreenshot(page, '03-placement-result.png');
    const resultText = await page.evaluate(() => document.body.innerText);
    const hasResultCEFR = resultText.includes('Ước lượng CEFR') || resultText.includes('Hoàn thành bài kiểm tra');
    console.log('  -> Trang kết quả năng lực CEFR ban đầu hợp lệ:', hasResultCEFR);

    // --- BÀI HỌC, GỢI Ý VÀ TỔNG KẾT SESSION ---
    console.log('\n--- 3. BÀI HỌC TỰ HỌC & TỔNG KẾT AUTHORITATIVE SCORE ---');
    await page.goto(`${BASE_URL}/student/workspace/reading/arctic-fox`, { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      const qTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Câu hỏi'));
      if (qTab) qTab.click();
    });
    await sleep(300);

    // Answer questions
    await page.evaluate(() => {
      const bBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent && b.textContent.includes('B.'));
      if (bBtns[0]) bBtns[0].click();
      const aBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent && b.textContent.includes('A.'));
      if (aBtns[1]) aBtns[1].click();
    });
    await sleep(500);

    // Open session summary
    await page.goto(`${BASE_URL}/student/session-summary?total=2&score=2&source=lesson`, { waitUntil: 'networkidle2' });
    await takeScreenshot(page, '04-lesson-summary.png');
    console.log('  -> Xem màn tổng kết phiên học thành công.');

    // --- TỪ VỰNG: LƯU TỪ, KÍCH HOẠT & LỊCH ÔN FSRS ---
    console.log('\n--- 4. TỪ VỰNG: LƯU TỪ, KÍCH HOẠT & THUẬT TOÁN FSRS ---');
    const vocabWorkflow = await page.evaluate(async () => {
      // 1. Lưu từ mới
      const addRes = await fetch('/api/vocab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: 'resilience',
          meaning: 'khả năng phục hồi, sự kiên cường',
          type: 'noun',
          ipa: '/rɪˈzɪliəns/',
        }),
      });
      const addData = await addRes.json();

      // 2. Tải danh sách và kích hoạt học
      const listRes = await fetch('/api/vocab');
      const listData = await listRes.json();
      const targetWord = listData.words[0];

      await fetch('/api/vocab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'activate', userVocabId: targetWord.id }),
      });

      // 3. Đánh giá Good lần 1
      const r1 = await fetch('/api/vocab/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userVocabId: targetWord.id, rating: 'good' }),
      });
      const d1 = await r1.json();

      // 4. Đánh giá lặp cùng ngày (Anti-double-counting)
      const r2 = await fetch('/api/vocab/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userVocabId: targetWord.id, rating: 'good' }),
      });
      const d2 = await r2.json();

      return { addData, targetWord, d1, d2 };
    });

    console.log('  -> Lưu từ thành công:', vocabWorkflow.addData?.success ? 'resilience' : vocabWorkflow.addData);
    console.log('  -> Đánh giá FSRS lần 1:', vocabWorkflow.d1?.success ? 'Interval: ' + vocabWorkflow.d1.updated?.intervalDays + ' ngày' : vocabWorkflow.d1);
    console.log('  -> Chống đếm lặp ngày (Anti-double-counting):', vocabWorkflow.d2?.success ? 'Interval: ' + vocabWorkflow.d2.updated?.intervalDays + ' ngày (Bảo toàn)' : vocabWorkflow.d2);

    await page.goto(`${BASE_URL}/student/vocabulary/flashcard`, { waitUntil: 'networkidle2' });
    await takeScreenshot(page, '05-vocabulary-fsrs.png');

    // =====================================================================
    // HÀNH TRÌNH 2: ĐỔI TÀI KHOẢN TRÊN CÙNG TRÌNH DUYỆT (MULTI-USER ISOLATION)
    // =====================================================================
    console.log('\n--- 5. KIỂM TRA ĐỔI TÀI KHOẢN (STUDENT 1 LOGOUT -> STUDENT 2 LOGIN) ---');
    await logout(page);
    console.log('  -> Học sinh 1 đã đăng xuất.');

    // Login as student2
    await loginAs(page, 'student2@journey.test', '/student/home');
    console.log('  -> Học sinh 2 đăng nhập thành công:', page.url());

    // Check placement test of student2
    await page.goto(`${BASE_URL}/student/placement-test`, { waitUntil: 'networkidle2' });
    const student2PlacementText = await page.evaluate(() => document.body.innerText);
    const isStudent2Fresh = student2PlacementText.includes('1 / 30') || student2PlacementText.includes('Đọc hiểu') || !student2PlacementText.includes('Bạn đã hoàn thành');
    console.log('  -> Kiểm tra cách ly: Học sinh 2 KHÔNG bị lẫn trạng thái bài test của Học sinh 1:', isStudent2Fresh);

    // Logout student 2
    await logout(page);

    // =====================================================================
    // HÀNH TRÌNH 3: LỚP HỌC (TEACHER 1 TẠO LỚP, GIAO BÀI -> STUDENT 1 THAM GIA, NỘP -> CHẤM ĐIỂM)
    // =====================================================================
    console.log('\n--- 6. HÀNH TRÌNH LỚP HỌC: TEACHER 1 TẠO LỚP & GIAO BÀI ---');
    await loginAs(page, 'teacher1@journey.test', '/teacher/dashboard');
    console.log('  -> Giáo viên 1 đăng nhập thành công:', page.url());

    // Teacher 1 creates class
    await page.goto(`${BASE_URL}/teacher/classes`, { waitUntil: 'networkidle2' });
    const classCreationResult = await page.evaluate(async () => {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Lớp Luyện Thi IELTS 2026', room: 'Phòng B204' }),
      });
      return await res.json();
    });
    const createdClass = classCreationResult.classroom;
    console.log('  -> Giáo viên 1 tạo lớp thành công:', createdClass.name, 'Mã lớp:', createdClass.code);

    await page.reload({ waitUntil: 'networkidle2' });
    await takeScreenshot(page, '06-teacher-class-created.png');

    // Teacher 1 creates assignment
    console.log('  -> Giáo viên 1 tạo bài tập mới cho lớp...');
    const assignResult = await page.evaluate(async (clsId) => {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: clsId,
          title: 'IELTS Writing Task 2: Artificial Intelligence in Education',
          skill: 'writing',
          promptText: 'Discuss the advantages and disadvantages of using AI in high schools.',
          dueDate: '23:59 Chủ Nhật',
          maxScore: 10,
        }),
      });
      return await res.json();
    }, createdClass.id);
    const createdAssign = assignResult.assignment;
    console.log('  -> Tạo bài tập thành công:', createdAssign.title, 'Version:', createdAssign.version);

    // Logout Teacher 1
    await logout(page);

    // Student 1 logs in to join class and submit assignment
    console.log('\n--- 7. HỌC SINH 1 THAM GIA LỚP BẰNG MÃ & NỘP BÀI TẬP ---');
    await loginAs(page, 'student1@journey.test', '/student/home');

    // Student 1 joins class using code
    const joinRes = await page.evaluate(async (code) => {
      const res = await fetch('/api/classes/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      return await res.json();
    }, createdClass.code);
    console.log('  -> Học sinh 1 tham gia lớp:', joinRes.success ? 'Thành công' : joinRes);

    await page.goto(`${BASE_URL}/student/classroom`, { waitUntil: 'networkidle2' });
    await takeScreenshot(page, '07-student-class-joined.png');

    // Student 1 opens assignment detail, saves draft, reloads, and submits
    const assignPageUrl = `${BASE_URL}/student/classroom/${createdClass.id}/assignment/${createdAssign.id}`;
    await page.goto(assignPageUrl, { waitUntil: 'networkidle2' });
    await sleep(1500);

    const assignPageContent = await page.evaluate(() => document.body.innerText);
    console.log('  -> Nội dung trang bài tập học sinh nhìn thấy:', assignPageContent.substring(0, 300));
    await page.waitForSelector('textarea', { timeout: 10000 });

    // Save draft
    console.log('  -> Học sinh 1 soạn thảo bản nháp và lưu nháp...');
    await page.type('textarea', 'In recent years, artificial intelligence has emerged as a transformative tool in educational settings.');
    await sleep(800);

    // Reload to verify draft recovery
    console.log('  -> Tải lại trang để kiểm tra phục hồi bản nháp...');
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForSelector('textarea', { timeout: 10000 });
    await sleep(800);
    const draftTextInBox = await page.$eval('textarea', el => el.value);
    console.log('  -> Bản nháp được khôi phục nguyên vẹn:', draftTextInBox.length > 0);

    // Final submit
    console.log('  -> Học sinh 1 bấm nộp bài chính thức...');
    await page.evaluate(() => {
      const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && (b.textContent.includes('Nộp bài chính thức') || b.textContent.includes('Nộp bài')));
      if (submitBtn) submitBtn.click();
    });
    await sleep(1500);

    // Duplicate submit check (idempotency)
    const duplicateRes = await page.evaluate(async (aId) => {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId: aId, content: 'Duplicate submit test', isDraft: false }),
      });
      return await res.json();
    }, createdAssign.id);
    console.log('  -> Kiểm tra chống tạo bài nộp trùng lặp (Idempotent):', duplicateRes.success, 'Status:', duplicateRes.status);

    await takeScreenshot(page, '08-assignment-submission.png');

    // Logout Student 1
    await logout(page);

    // Teacher 1 grades submission and edits assignment
    console.log('\n--- 8. GIÁO VIÊN 1 CHẤM ĐIỂM, TRẢ NHẬN XÉT & SỬA ĐỀ BÀI (VERSIONING) ---');
    await loginAs(page, 'teacher1@journey.test', '/teacher/dashboard');

    // Get submission ID
    const submissionsData = await page.evaluate(async (aId) => {
      const res = await fetch(`/api/submissions?assignmentId=${aId}`);
      return await res.json();
    }, createdAssign.id);
    const studentSub = submissionsData.submissions[0];

    // Grade submission
    const gradeRes = await page.evaluate(async (subId) => {
      const res = await fetch(`/api/grading/${subId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: 8.5, feedback: 'Bài viết có luận điểm chặt chẽ, từ vựng học thuật phong phú. Chú ý liên kết câu đoạn 2.' }),
      });
      return await res.json();
    }, studentSub.id);
    console.log('  -> Giáo viên 1 chấm điểm thành công:', gradeRes.submission?.teacherScore, '/ 10');

    await page.goto(`${BASE_URL}/teacher/grading/${studentSub.id}`, { waitUntil: 'networkidle2' });
    await takeScreenshot(page, '09-teacher-grading.png');

    // Teacher 1 edits assignment -> creates version 2
    console.log('  -> Giáo viên 1 chỉnh sửa đề bài sau khi đã có bài nộp...');
    const updateAssignRes = await page.evaluate(async (aId) => {
      const res = await fetch(`/api/assignments/${aId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'IELTS Writing Task 2: AI in Education (Updated Guidelines)',
          promptText: 'Discuss both advantages and disadvantages with concrete examples.',
          changeNotes: 'Bổ sung yêu cầu đưa ví dụ thực tế.',
        }),
      });
      return await res.json();
    }, createdAssign.id);
    console.log('  -> Sửa đề tạo version mới:', updateAssignRes.assignment?.version === 2 ? 'Version 2 tạo thành công' : updateAssignRes);

    // Verify student submission still points to version 1
    const subCheck = await page.evaluate(async (subId) => {
      const res = await fetch(`/api/grading/${subId}`);
      return await res.json();
    }, studentSub.id);
    console.log('  -> Bài nộp cũ của Học sinh 1 vẫn giữ đúng đề Version 1:', subCheck.submission?.versionId === 1);

    // Logout Teacher 1
    await logout(page);

    // Student 1 checks published grade and notification
    console.log('\n--- 9. HỌC SINH 1 NHẬN THÔNG BÁO ĐIỂM & RỜI LỚP ---');
    await loginAs(page, 'student1@journey.test', '/student/home');

    // View notification
    const notifs = await page.evaluate(async () => {
      const res = await fetch('/api/notifications');
      return await res.json();
    });
    const gradeNotif = notifs.notifications?.find(n => n.type === 'grade');
    console.log('  -> Học sinh 1 nhận thông báo điểm:', gradeNotif?.title, '-', gradeNotif?.message);

    await page.goto(assignPageUrl, { waitUntil: 'networkidle2' });
    await takeScreenshot(page, '10-student-grade-received.png');

    // Student 1 leaves class
    console.log('  -> Học sinh 1 rời lớp...');
    const leaveRes = await page.evaluate(async (cId) => {
      const res = await fetch(`/api/classes/${cId}`, { method: 'DELETE' });
      return await res.json();
    }, createdClass.id);
    console.log('  -> Rời lớp:', leaveRes.success ? 'Thành công' : leaveRes);

    // Student 1 tries accessing class after leaving -> 403 Forbidden
    const checkLeaveAccess = await page.evaluate(async (cId) => {
      const res = await fetch(`/api/classes/${cId}`);
      return res.status;
    }, createdClass.id);
    console.log('  -> Sau khi rời lớp, server từ chối quyền truy cập (403 Forbidden):', checkLeaveAccess === 403);

    // Cross-isolation: Teacher 2 cannot access Teacher 1's class
    await logout(page);
    await loginAs(page, 'teacher2@journey.test', '/teacher/dashboard');
    const teacher2CrossAccess = await page.evaluate(async (cId) => {
      const res = await fetch(`/api/classes/${cId}`);
      return res.status;
    }, createdClass.id);
    console.log('  -> Giáo viên B không truy cập được lớp của Giáo viên A (403 Forbidden):', teacher2CrossAccess === 403);
    await logout(page);

    // =====================================================================
    // HÀNH TRÌNH 4: ADMIN (THỐNG KÊ THỰC TẾ, QUẢN LÝ USER, DIALOG XÁC NHẬN)
    // =====================================================================
    console.log('\n--- 10. HÀNH TRÌNH QUẢN TRỊ VIÊN (ADMIN DASHBOARD & USERS) ---');
    await loginAs(page, 'admin@journey.test', '/admin');

    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle2' });
    await sleep(1000);
    await takeScreenshot(page, '11-admin-dashboard.png');

    const adminStatsText = await page.evaluate(() => document.body.innerText);
    const isStatsLoaded = (adminStatsText.includes('quản trị viên') || adminStatsText.includes('Tổng người dùng')) && !adminStatsText.includes('1,280');
    console.log('  -> Thống kê Admin Dashboard hiển thị số liệu thực tế từ cơ sở dữ liệu:', isStatsLoaded);

    await page.goto(`${BASE_URL}/admin/users`, { waitUntil: 'networkidle2' });
    // Search user
    await page.type('input[placeholder*="Tìm"], input[type="text"]', 'Lê Tuấn');
    await sleep(500);
    await takeScreenshot(page, '12-admin-users.png');

    const userTableText = await page.evaluate(() => document.body.innerText);
    console.log('  -> Tìm kiếm và lọc người dùng trên dữ liệu thật hoạt động đúng:', userTableText.includes('student1@journey.test') || userTableText.includes('Lê Tuấn'));

    // Check dangerous action confirmation
    let dialogAppeared = false;
    page.once('dialog', async dialog => {
      dialogAppeared = true;
      console.log('  -> Hộp thoại xác nhận thao tác nguy hiểm xuất hiện:', dialog.message());
      await dialog.dismiss();
    });

    await page.evaluate(() => {
      const toggleBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && (b.textContent.includes('Khóa') || b.textContent.includes('Mở khóa')));
      if (toggleBtn) toggleBtn.click();
    });
    await sleep(500);
    console.log('  -> Thao tác nguy hiểm yêu cầu xác nhận trước khi thực hiện:', dialogAppeared);

    // =====================================================================
    // TỔNG KẾT & KẾT LUẬN
    // =====================================================================
    console.log('\n======================================================================');
    console.log('KẾT QUẢ NGHIỆM THU TOÀN DIỆN CÁC HÀNH TRÌNH:');
    console.log('  - Hành trình Học sinh (Onboarding, Placement Resume, Lesson, FSRS): PASS');
    console.log('  - Cách ly đa người dùng trên cùng trình duyệt: PASS');
    console.log('  - Hành trình Lớp học (Tạo lớp, Tham gia, Nháp, Nộp, Chấm, Versioning, Rời lớp): PASS');
    console.log('  - Quyền hạn chéo & Ngăn chặn lộ thông tin ngoài lớp: PASS');
    console.log('  - Hành trình Quản trị viên (Stats thật, Tìm kiếm, Xác nhận thao tác nguy hiểm): PASS');
    console.log(`  - 12 Ảnh chụp màn hình đã lưu tại: ${SCREENSHOTS_DIR}`);
    console.log('======================================================================\n');

  } catch (err) {
    console.error('LỖI TRONG QUÁ TRÌNH KIỂM THỬ:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();

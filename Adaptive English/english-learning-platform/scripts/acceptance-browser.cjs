const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\4f2d5a76-eda0-4b53-ba2e-daae77b7b46e';
const LOCAL_SCREENSHOTS_DIR = path.join(__dirname, '../public/screenshots');

if (!fs.existsSync(LOCAL_SCREENSHOTS_DIR)) {
  fs.mkdirSync(LOCAL_SCREENSHOTS_DIR, { recursive: true });
}

async function saveScreenshot(page, filename) {
  const localPath = path.join(LOCAL_SCREENSHOTS_DIR, filename);
  await page.screenshot({ path: localPath, fullPage: false });
  if (fs.existsSync(ARTIFACT_DIR)) {
    const artifactPath = path.join(ARTIFACT_DIR, filename);
    fs.copyFileSync(localPath, artifactPath);
  }
  console.log(`[SCREENSHOT] Saved: ${filename}`);
  return localPath;
}

async function runBrowserAcceptance() {
  console.log('=== KHỞI CHẠY KIỂM THỬ TRÌNH DUYỆT THỰC TẾ (CHROME HEADLESS) ===');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800'],
    defaultViewport: { width: 1280, height: 800 },
  });

  const page = await browser.newPage();

  const consoleErrors = [];
  const networkErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push({ url: page.url(), text: msg.text() });
    }
  });

  page.on('requestfailed', (req) => {
    if (req.failure()?.errorText !== 'net::ERR_ABORTED') {
      networkErrors.push({ url: req.url(), errorText: req.failure()?.errorText });
    }
  });

  try {
    // -------------------------------------------------------------
    // INITIAL SETUP: AUTHENTICATE AS STUDENT
    // -------------------------------------------------------------
    console.log('\n--- 0. THIẾT LẬP VAI TRÒ HỌC SINH (STUDENT AUTH) ---');
    await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      localStorage.clear();
    });
    // Click Học Sinh button
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const studentBtn = btns.find((b) => b.innerText.includes('Học Sinh'));
      if (studentBtn) studentBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    // -------------------------------------------------------------
    // JOURNEY 1: PLACEMENT TEST WITH LISTENING & RESULTS PERSISTENCE
    // -------------------------------------------------------------
    console.log('\n--- 1. KIỂM TRA JOURNEY PLACEMENT TEST VỚI LISTENING ---');
    await page.goto('http://localhost:3000/student/placement-test', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 800));

    // Helper functions for placement navigation
    const selectOption = async (optionIndex = 0) => {
      await page.evaluate((idx) => {
        const optionBtns = Array.from(document.querySelectorAll('main button[aria-pressed]'));
        if (optionBtns[idx]) optionBtns[idx].click();
      }, optionIndex);
      await new Promise((r) => setTimeout(r, 400));
    };

    const clickNext = async () => {
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('footer button'));
        const nextBtn = btns.find(
          (b) => b.innerText.includes('Câu tiếp theo') || b.innerText.includes('Hoàn thành bài Test')
        );
        if (nextBtn) nextBtn.click();
      });
      await new Promise((r) => setTimeout(r, 800));
    };

    // Q1: Reading 1
    console.log('Answering Q1 (Reading 1)...');
    await selectOption(1);
    await clickNext();

    // Q2: Reading 2
    console.log('Answering Q2 (Reading 2)...');
    await selectOption(1);
    await clickNext();

    // Q3: Listening 1 (pt-l-1)
    console.log('Inspecting Q3 (Listening 1 with Audio)...');
    const listeningAudioInfo = await page.evaluate(() => {
      const audio = document.querySelector('audio');
      return {
        hasAudio: !!audio,
        src: audio?.getAttribute('src') || audio?.src,
        text: document.body.innerText.slice(0, 300),
      };
    });
    console.log('Listening question audio info:', listeningAudioInfo);

    // CAPTURE 1: PLACEMENT LISTENING (Audio player, options, progress)
    await saveScreenshot(page, '01-placement-listening.png');

    await selectOption(1);
    await clickNext();

    // Q4: Listening 2 (pt-l-2)
    console.log('Answering Q4 (Listening 2)...');
    await selectOption(0);
    await clickNext();

    // Q5: Grammar 1 (pt-g-1)
    console.log('Answering Q5 (Grammar 1)...');
    await selectOption(2);
    await clickNext();

    // Q6: Grammar 2 (pt-g-2)
    console.log('Answering Q6 (Grammar 2 - Final)...');
    await selectOption(1);

    // Click "Hoàn thành bài Test"
    console.log('Completing placement test...');
    await clickNext();
    await new Promise((r) => setTimeout(r, 2000));

    console.log('Landed URL after completion:', page.url());

    // CAPTURE 1B: PLACEMENT RESULTS
    await saveScreenshot(page, '01b-placement-result.png');

    // Verify persistence after reload
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 800));

    const placementPersisted = await page.evaluate(() => {
      const raw = localStorage.getItem('adaptive_study_placement');
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return parsed.completed === true;
    });
    console.log('Placement result completed persisted after reload:', placementPersisted);

    // -------------------------------------------------------------
    // JOURNEY 2: SESSION SUMMARY & MASCOT SIZING
    // -------------------------------------------------------------
    console.log('\n--- 2. KIỂM TRA SESSION SUMMARY VÀ KÍCH THƯỚC MASCOT ---');
    await page.evaluate(() => {
      localStorage.removeItem('adaptive_study_last_session');
    });

    // Test score 0/1 (Feedback: Cần ôn tập thêm, no celebration)
    await page.goto('http://localhost:3000/student/session-summary?score=0&total=1&lesson=Unit+Test+Demo', {
      waitUntil: 'networkidle2',
    });
    await new Promise((r) => setTimeout(r, 800));

    const mascotDimensions = await page.evaluate(() => {
      const img = document.querySelector('img[alt^="Adaptive study mascot"]');
      if (!img) return null;
      const rect = img.getBoundingClientRect();
      return {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
    });
    console.log('Mascot dimensions in session-summary:', mascotDimensions);

    const feedback01 = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasScoreText: text.includes('0 / 1') || text.includes('0%'),
        hasReviewAdvice: text.includes('Cần ôn tập thêm') || text.includes('Đừng nản lòng'),
        noCelebration: !text.includes('Hoàn thành xuất sắc'),
      };
    });
    console.log('Session summary 0/1 content verification:', feedback01);

    // CAPTURE 2A: 0/1 score session summary
    await saveScreenshot(page, '02a-session-summary-0-of-1.png');

    // Test score 3/3 (Hoàn thành xuất sắc, celebrate)
    await page.goto('http://localhost:3000/student/session-summary?score=3&total=3&lesson=Reading%3A+Phong%27s+First+Day', {
      waitUntil: 'networkidle2',
    });
    await new Promise((r) => setTimeout(r, 800));

    // CAPTURE 2B: Full score session summary
    await saveScreenshot(page, '02-session-summary.png');

    // -------------------------------------------------------------
    // JOURNEY 3: TEACHER DOCX IMPORT & PREVIEW
    // -------------------------------------------------------------
    console.log('\n--- 3. KIỂM TRA TEACHER DOCX IMPORT & PREVIEW ---');
    // Switch to Teacher
    await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const teacherBtn = btns.find((b) => b.innerText.includes('Giáo Viên'));
      if (teacherBtn) teacherBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    // Go to DOCX import preview
    await page.goto('http://localhost:3000/teacher/assignments/import-docx', { waitUntil: 'networkidle2' });
    // Wait for parse completion (up to 3 seconds)
    await page.waitForSelector('.border-primary\\/30, .shadow-tactile', { timeout: 6000 }).catch(() => null);
    await new Promise((r) => setTimeout(r, 1200));

    const docxStatus = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        fileName: text.includes('GỦI.docx'),
        exercisesFound: text.includes('câu hỏi') || text.includes('Bài tập') || text.includes('trích xuất'),
        hasModeToggle: text.includes('Chế độ') || text.includes('Mode A'),
        hasPublishSection: text.includes('Tiến độ kiểm duyệt') || text.includes('Xuất bản'),
      };
    });
    console.log('DOCX Parser UI loaded state:', docxStatus);

    // CAPTURE 3: DOCX PREVIEW
    await saveScreenshot(page, '03-docx-preview.png');

    // -------------------------------------------------------------
    // JOURNEY 4: CLASSROOM GRADING & FEEDBACK
    // -------------------------------------------------------------
    console.log('\n--- 4. KIỂM TRA CLASSROOM GRADING & FEEDBACK ---');
    await page.goto('http://localhost:3000/teacher/grading', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 800));

    // Open first submission grading detail
    const firstSubmissionLink = await page.$('a[href*="/teacher/grading/"]');
    if (firstSubmissionLink) {
      await firstSubmissionLink.click();
      await new Promise((r) => setTimeout(r, 1200));
      console.log('Opened grading workspace:', page.url());
    }

    // CAPTURE 4: CLASSROOM GRADING WORKSPACE
    await saveScreenshot(page, '04-classroom-grading.png');

    // -------------------------------------------------------------
    // JOURNEY 5: VOCABULARY REVIEW & FSRS SCHEDULING
    // -------------------------------------------------------------
    console.log('\n--- 5. KIỂM TRA VOCABULARY REVIEW VÀ FSRS SCHEDULING ---');
    // Switch to Student
    await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const studentBtn = btns.find((b) => b.innerText.includes('Học Sinh'));
      if (studentBtn) studentBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    await page.goto('http://localhost:3000/student/vocabulary', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 800));

    // CAPTURE 5A: VOCABULARY DASHBOARD
    await saveScreenshot(page, '05-vocabulary-review.png');

    // Open flashcard player
    await page.goto('http://localhost:3000/student/vocabulary/flashcard', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 800));

    // Flip card to reveal answer and ratings
    await page.evaluate(() => {
      const card = document.querySelector('.cursor-pointer') || document.querySelector('.border-2');
      if (card) card.click();
    });
    await new Promise((r) => setTimeout(r, 500));

    // CAPTURE 5B: FLASHCARD ACTIVE
    await saveScreenshot(page, '05b-flashcard-active.png');

    // -------------------------------------------------------------
    // JOURNEY 6: MOBILE RESPONSIVE CHECK (390px iPhone Viewport)
    // -------------------------------------------------------------
    console.log('\n--- 6. KIỂM TRA RESPONSIVE MOBILE 390px ---');
    await page.setViewport({ width: 390, height: 844 });
    await page.goto('http://localhost:3000/student/learn', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 800));

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    console.log('Mobile 390px horizontal scroll overflow detected:', hasHorizontalOverflow);

    // CAPTURE 6: MOBILE LEARN SCREEN
    await saveScreenshot(page, '06-mobile-learn-390px.png');

  } catch (err) {
    console.error('Lỗi kiểm thử trình duyệt:', err);
  } finally {
    await browser.close();
  }

  console.log('\n=== TỔNG KẾT KIỂM THỬ TRÌNH DUYỆT ===');
  console.log('Console Errors count:', consoleErrors.length);
  if (consoleErrors.length > 0) console.log(consoleErrors);

  console.log('Network Errors count (excluding aborted prefetch):', networkErrors.length);
  if (networkErrors.length > 0) console.log(networkErrors);
}

runBrowserAcceptance();

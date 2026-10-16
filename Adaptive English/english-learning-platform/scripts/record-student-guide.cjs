const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const { enableCursorOverlay, moveAndClick, smoothMoveMouse } = require('./recorder-cursor-utils.cjs');

const FFMPEG_PATH = 'C:\\Users\\Administrator\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.2-full_build\\bin\\ffmpeg.exe';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3008';
const OUTPUT_DIR = path.resolve(__dirname, '../artifacts/tutorials');
const RAW_CLIPS_DIR = path.join(OUTPUT_DIR, 'raw_clips');

if (!fs.existsSync(RAW_CLIPS_DIR)) {
  fs.mkdirSync(RAW_CLIPS_DIR, { recursive: true });
}

// Hàm khởi tạo tiến trình FFmpeg ghi lại chuỗi ảnh chụp thành video clip chất lượng cao
function createFfmpegRecorder(outputFile, fps = 30) {
  const args = [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'png',
    '-r', String(fps),
    '-i', '-',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'fast',
    '-crf', '18',
    outputFile,
  ];

  const ffmpegProc = spawn(FFMPEG_PATH, args, { stdio: ['pipe', 'ignore', 'pipe'] });
  
  ffmpegProc.stderr.on('data', (d) => {
    // console.log('[ffmpeg]', d.toString());
  });

  return {
    proc: ffmpegProc,
    writeFrame: async (buffer) => {
      if (ffmpegProc.stdin.writable) {
        return new Promise((resolve) => {
          ffmpegProc.stdin.write(buffer, () => resolve());
        });
      }
    },
    stop: async () => {
      return new Promise((resolve, reject) => {
        ffmpegProc.stdin.end();
        ffmpegProc.on('close', (code) => {
          if (code === 0) resolve();
          else reject(new Error(`FFmpeg exited with code ${code}`));
        });
      });
    }
  };
}

async function recordStudentTutorial() {
  console.log('====================================================');
  console.log('   BẮT ĐẦU QUAY VIDEO THỰC TẾ: HƯỚNG DẪN HỌC SINH   ');
  console.log('   Độ phân giải: 1920x1080 | Tốc độ: 30 FPS         ');
  console.log('====================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1920,1080',
      '--disable-notifications',
      '--force-device-scale-factor=1',
    ],
    defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
  });

  const page = await browser.newPage();
  await enableCursorOverlay(page);

  const rawClipPath = path.join(RAW_CLIPS_DIR, 'student-raw.mp4');
  const recorder = createFfmpegRecorder(rawClipPath, 30);

  let isCapturing = true;
  // Vòng lặp chụp frame liên tục với CDP screencast
  const captureLoop = async () => {
    const client = await page.target().createCDPSession();
    await client.send('Page.startScreencast', { format: 'png', quality: 100, everyNthFrame: 1 });
    client.on('Page.screencastFrame', async ({ data, sessionId }) => {
      if (isCapturing) {
        const buffer = Buffer.from(data, 'base64');
        await recorder.writeFrame(buffer);
      }
      try {
        await client.send('Page.screencastFrameAck', { sessionId });
      } catch (e) {}
    });
  };

  await captureLoop();

  try {
    // ----------------------------------------------------
    // CẢNH S1: Đăng nhập học sinh
    // ----------------------------------------------------
    console.log('[CẢNH S1] Mở trang đăng nhập & xác thực tài khoản học sinh...');
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));

    // Di chuyển tới ô Email
    const emailInput = await page.$('input[type="email"]');
    await moveAndClick(page, emailInput, 300, 300);
    await page.keyboard.type('student1@journey.test', { delay: 60 });
    await new Promise(r => setTimeout(r, 400));

    // Di chuyển tới ô Mật khẩu
    const passInput = await page.$('input[type="password"]');
    await moveAndClick(page, passInput, 300, 300);
    await page.keyboard.type('Password123!', { delay: 60 });
    await new Promise(r => setTimeout(r, 500));

    // Bấm nút Đăng nhập
    const loginBtn = await page.$('button[type="submit"]');
    await moveAndClick(page, loginBtn, 400, 1000);
    await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});
    await new Promise(r => setTimeout(r, 1500));

    // ----------------------------------------------------
    // CẢNH S2: Placement Test & Kết quả CEFR
    // ----------------------------------------------------
    console.log('[CẢNH S2] Thực hiện bài kiểm tra đầu vào (Placement Test)...');
    await page.goto(`${BASE_URL}/student/placement-test`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));

    // Chọn đáp án mẫu
    const options = await page.$$('button[role="radio"], .placement-option, button.border-2');
    if (options.length > 0) {
      await moveAndClick(page, options[0], 400, 600);
    }
    await new Promise(r => setTimeout(r, 1000));

    // Mở trang kết quả CEFR
    console.log('[CẢNH S2] Xem trang kết quả năng lực CEFR ban đầu...');
    await page.goto(`${BASE_URL}/student/placement-test/result`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));

    // ----------------------------------------------------
    // CẢNH S3: Khu vực Tự học (Learn Explorer) & Audio
    // ----------------------------------------------------
    console.log('[CẢNH S3] Khám phá kỹ năng tự học thích ứng & Audio...');
    await page.goto(`${BASE_URL}/student/learn`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500));

    // Bấm vào nút chuyển tab Listening
    const listenTab = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent && b.textContent.includes('Listening'));
    });
    if (listenTab && listenTab.asElement()) {
      await moveAndClick(page, listenTab.asElement(), 400, 1000);
    }
    await new Promise(r => setTimeout(r, 1500));

    // Bấm nút "Bắt đầu học" của bài học đầu tiên
    const startLessonLink = await page.$('a[href^="/student/learn/listening/"]');
    if (startLessonLink) {
      await moveAndClick(page, startLessonLink, 400, 1500);
    } else {
      const anyStartLink = await page.$('a[href*="/student/learn/"]');
      if (anyStartLink) {
        await moveAndClick(page, anyStartLink, 400, 1500);
      }
    }
    await new Promise(r => setTimeout(r, 2000));

    // ----------------------------------------------------
    // CẢNH S4: Tủ từ vựng & Flashcard FSRS
    // ----------------------------------------------------
    console.log('[CẢNH S4] Ôn tập từ vựng Spaced Repetition (FSRS Flashcards)...');
    await page.goto(`${BASE_URL}/student/vocabulary`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500));

    // Bấm nút Bắt đầu ôn tập nếu có
    const reviewBtn = await page.$('a[href*="flashcard"], button');
    if (reviewBtn) {
      await moveAndClick(page, reviewBtn, 400, 1000);
    }
    await page.goto(`${BASE_URL}/student/vocabulary/flashcard`, { waitUntil: 'networkidle0' }).catch(() => {});
    await new Promise(r => setTimeout(r, 1000));

    // Lật thẻ flashcard
    const cardEl = await page.$('.flashcard-container, div[role="button"], .cursor-pointer');
    if (cardEl) {
      await moveAndClick(page, cardEl, 400, 800);
    }
    await new Promise(r => setTimeout(r, 1000));

    // Bấm nút đánh giá Nhớ (Good)
    const goodBtn = await page.$('button');
    if (goodBtn) {
      await moveAndClick(page, goodBtn, 400, 600);
    }
    await new Promise(r => setTimeout(r, 1500));

    // ----------------------------------------------------
    // CẢNH S5: Lớp học & Nộp bài tập
    // ----------------------------------------------------
    console.log('[CẢNH S5] Tham gia lớp học, lưu nháp và nộp bài...');
    await page.goto(`${BASE_URL}/student/classroom`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500));

    // Mở chi tiết lớp học
    const classLinks = await page.$$('a[href*="/student/classroom/"]');
    if (classLinks.length > 0) {
      await moveAndClick(page, classLinks[0], 400, 1000);
    }
    await new Promise(r => setTimeout(r, 2000));

    // ----------------------------------------------------
    // CẢNH S6: Nhận thông báo điểm & Xem chi tiết
    // ----------------------------------------------------
    console.log('[CẢNH S6] Kiểm tra chuông thông báo & xem điểm số giáo viên chấm...');
    await page.goto(`${BASE_URL}/student/notifications`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2500));

  } catch (err) {
    console.error('[LỖI TRONG QUÁ TRÌNH QUAY]', err);
  } finally {
    isCapturing = false;
    await recorder.stop();
    await browser.close();
    console.log(`\n[HOÀN TẤT BẢN QUAY GỐC] Đã lưu tại: ${rawClipPath}`);
  }
}

recordStudentTutorial().catch(console.error);

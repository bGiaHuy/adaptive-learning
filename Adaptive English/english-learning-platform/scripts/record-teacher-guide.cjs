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

async function recordTeacherTutorial() {
  console.log('====================================================');
  console.log('   BẮT ĐẦU QUY TRÌNH QUAY: HƯỚNG DẪN GIÁO VIÊN      ');
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

  const rawClipPath = path.join(RAW_CLIPS_DIR, 'teacher-raw.mp4');
  const recorder = createFfmpegRecorder(rawClipPath, 30);

  let isCapturing = true;
  let totalFrames = 0;
  const captureLoop = async () => {
    const client = await page.target().createCDPSession();
    await client.send('Page.startScreencast', { format: 'png', quality: 100, everyNthFrame: 1 });
    client.on('Page.screencastFrame', async ({ data, sessionId }) => {
      if (isCapturing) {
        totalFrames++;
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
    // CẢNH T1: Đăng nhập Giáo viên & Dashboard (0s - 15s)
    // ----------------------------------------------------
    console.log('[CẢNH T1] Đăng nhập tài khoản Giáo viên & Mở Bảng điều khiển...');
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));

    const emailInput = await page.$('input[type="email"]');
    if (emailInput) {
      await moveAndClick(page, emailInput, 400, 300);
      await page.keyboard.type('teacher1@journey.test', { delay: 60 });
    }
    await new Promise(r => setTimeout(r, 800));

    const passInput = await page.$('input[type="password"]');
    if (passInput) {
      await moveAndClick(page, passInput, 400, 300);
      await page.keyboard.type('Password123!', { delay: 60 });
    }
    await new Promise(r => setTimeout(r, 1000));

    const loginBtn = await page.$('button[type="submit"]');
    if (loginBtn) {
      await moveAndClick(page, loginBtn, 500, 1000);
    }
    await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});
    await new Promise(r => setTimeout(r, 4000));

    // Di chuyển chuột qua các card thống kê trên Dashboard
    await smoothMoveMouse(page, 500, 350, 700);
    await new Promise(r => setTimeout(r, 1000));
    await smoothMoveMouse(page, 960, 350, 700);
    await new Promise(r => setTimeout(r, 1500));

    // ----------------------------------------------------
    // CẢNH T2: Quản lý Lớp học & Xem Sổ điểm (16s - 32s)
    // ----------------------------------------------------
    console.log('[CẢNH T2] Mở danh sách lớp học & xem chi tiết lớp...');
    await page.goto(`${BASE_URL}/teacher/classes`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));

    // Di chuột đến nút Tạo lớp học mới để người xem quan sát
    const createClassBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.innerText.includes('Tạo lớp'));
    });
    if (createClassBtn && createClassBtn.asElement()) {
      await smoothMoveMouse(page, 1500, 150, 600);
      await new Promise(r => setTimeout(r, 1200));
    }

    // Mở trang chi tiết lớp học thực tế có mã lớp và học viên
    await page.goto(`${BASE_URL}/teacher/classes/cmv2c950p00109ay6bzn099qh`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 3000));

    // Di chuột làm nổi bật Mã lớp và tab Sổ điểm
    await smoothMoveMouse(page, 450, 220, 600);
    await new Promise(r => setTimeout(r, 1500));
    await smoothMoveMouse(page, 650, 320, 600);
    await new Promise(r => setTimeout(r, 2500));

    // ----------------------------------------------------
    // CẢNH T3: Giao bài tập & Quản lý phiên bản (33s - 48s)
    // ----------------------------------------------------
    console.log('[CẢNH T3] Quản lý bài tập & phân bổ phiên bản đề...');
    await page.goto(`${BASE_URL}/teacher/assignments`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2500));

    // Di chuyển tới form soạn bài / xem danh sách bài tập
    await smoothMoveMouse(page, 600, 350, 700);
    await new Promise(r => setTimeout(r, 1500));

    await page.goto(`${BASE_URL}/teacher/assignments/create`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 3000));
    await smoothMoveMouse(page, 500, 400, 600);
    await new Promise(r => setTimeout(r, 2500));

    // ----------------------------------------------------
    // CẢNH T4: Chấm bài & Trả nhận xét sư phạm (49s - 65s)
    // ----------------------------------------------------
    console.log('[CẢNH T4] Bàn chấm bài tập học sinh & gửi phản hồi chi tiết...');
    await page.goto(`${BASE_URL}/teacher/grading`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2500));

    // Vào bài nộp cụ thể đã có dữ liệu nộp bài
    await page.goto(`${BASE_URL}/teacher/grading/cmv2c9a46001a9ay6rt56ovre`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 3000));

    // Di chuột qua khu vực bài làm học sinh và ô cho điểm
    await smoothMoveMouse(page, 600, 500, 700);
    await new Promise(r => setTimeout(r, 2000));
    await smoothMoveMouse(page, 1400, 450, 700);
    await new Promise(r => setTimeout(r, 2500));

    // ----------------------------------------------------
    // CẢNH T5: Nhập học liệu tự động từ DOCX (66s - 80s)
    // ----------------------------------------------------
    console.log('[CẢNH T5] Trình nhập đề tự động từ tệp Word (DOCX Ingestion)...');
    await page.goto(`${BASE_URL}/teacher/assignments/import-docx`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 3000));

    // Di chuột qua khu vực kéo thả tệp DOCX và cờ cảnh báo
    await smoothMoveMouse(page, 960, 400, 700);
    await new Promise(r => setTimeout(r, 2500));
    await smoothMoveMouse(page, 960, 650, 700);
    await new Promise(r => setTimeout(r, 3000));

  } catch (err) {
    console.error('[LỖI TRONG QUÁ TRÌNH QUAY GIÁO VIÊN]', err);
  } finally {
    isCapturing = false;
    await recorder.stop();
    await browser.close();
    console.log(`\n[HOÀN TẤT BẢN QUAY GỐC GIÁO VIÊN] Tổng số khung hình: ${totalFrames}`);
    console.log(`Đã lưu tại: ${rawClipPath}`);
  }
}

recordTeacherTutorial().catch(console.error);

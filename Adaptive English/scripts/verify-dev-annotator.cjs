const path = require('path');
const puppeteer = require(path.join(__dirname, '../english-learning-platform/node_modules/puppeteer-core'));
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const PORT = 3055;
const BASE_URL = `http://localhost:${PORT}`;
const OUT_DIR = path.join(__dirname, '../docs/verification-logs/dev-annotator-20261011');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function waitServer(timeout = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      http.get(`${BASE_URL}/`, (res) => {
        if (res.statusCode) return resolve(true);
      }).on('error', () => {
        if (Date.now() - start > timeout) {
          return reject(new Error('Dev server timed out'));
        }
        setTimeout(check, 500);
      });
    };
    check();
  });
}

async function run() {
  console.log(`[1] Đang khởi động Next.js dev server trên port ${PORT}...`);
  const devProcess = spawn('npx.cmd', ['next', 'dev', '-p', String(PORT)], {
    cwd: path.join(__dirname, '../english-learning-platform'),
    stdio: 'pipe',
    shell: true,
  });

  devProcess.stderr.on('data', (d) => process.stderr.write(`[DEV ERR] ${d}`));

  try {
    await waitServer(40000);
    console.log('[2] Dev server đã sẵn sàng!');

    console.log('[3] Mở Chrome Puppeteer...');
    const browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800'],
      defaultViewport: { width: 1280, height: 800 },
    });

    const page = await browser.newPage();
    const consoleLogs = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleLogs.push(msg.text());
    });

    console.log('[4] Điều hướng tới trang chủ...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2', timeout: 30000 });

    // Đợi 2 giây cho React render & DevAgentAnnotator scan
    await new Promise((r) => setTimeout(r, 2000));

    // Kiểm tra DOM attributes
    const annotatedCount = await page.evaluate(() => {
      return document.querySelectorAll('[data-component]').length;
    });
    console.log(`[5] Số lượng phần tử được tự động gắn data-component: ${annotatedCount}`);

    const devToolPresent = await page.evaluate(() => {
      const tool = document.querySelector('[data-agent-dev-tool]');
      return Boolean(tool);
    });
    console.log(`[6] Dev Agent Annotator Toolbar hiển thị: ${devToolPresent}`);

    // Lấy danh sách sample component attributes
    const sampleComponents = await page.evaluate(() => {
      const items = [];
      const els = document.querySelectorAll('[data-component]');
      for (let i = 0; i < Math.min(els.length, 10); i++) {
        const el = els[i];
        items.push({
          tag: el.tagName.toLowerCase(),
          component: el.getAttribute('data-component'),
          file: el.getAttribute('data-file'),
          locator: el.getAttribute('data-agent-locator'),
        });
      }
      return items;
    });

    // Bật Visual Badges để chụp screenshot rõ ràng
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('[data-agent-dev-tool] button'));
      const badgeBtn = buttons.find((b) => b.textContent && b.textContent.includes('Badges'));
      if (badgeBtn) badgeBtn.click();
    });

    await new Promise((r) => setTimeout(r, 800));

    const screenshotPath = path.join(OUT_DIR, 'dev-agent-annotator.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`[7] Đã lưu ảnh minh chứng tại: ${screenshotPath}`);

    // Báo cáo
    const reportPath = path.join(OUT_DIR, 'dev-agent-annotator-report.md');
    const reportContent = `# BÁO CÁO KIỂM THỬ TÍNH NĂNG DEV AGENT ANNOTATOR

- **Thời điểm:** ${new Date().toISOString()}
- **Môi trường:** Local Dev Server (${BASE_URL}), Chrome Headless via Puppeteer
- **Mục tiêu:** Kiểm tra tính năng annotate component dành cho AI Agent & Developer

## KẾT QUẢ QUAN SÁT THỰC TẾ

1. **Số lượng phần tử DOM được tự động gán metadata:** ${annotatedCount} phần tử.
2. **Dev Agent Annotator Toolbar:** ${devToolPresent ? 'HIỂN THỊ THÀNH CÔNG (PASS)' : 'KHÔNG TÌM THẤY (FAIL)'}.
3. **Mẫu thuộc tính gắn trên DOM elements:**
\`\`\`json
${JSON.stringify(sampleComponents, null, 2)}
\`\`\`
4. **Console Errors:** ${consoleLogs.length} lỗi.
5. **Ảnh minh chứng:** \`dev-agent-annotator.png\` đã ghi lại trạng thái thanh công cụ Dev Agent Annotator và các visual badge định vị component.

## HƯỚNG DẪN DÀNH CHO DEV / KHI DEPLOY
- Tính năng chỉ chạy khi \`process.env.NODE_ENV !== 'production'\`.
- Khi cần deploy lên web, chỉ cần xóa hoặc comment thẻ \`<DevAgentAnnotator />\` trong \`src/app/layout.tsx\`.
`;
    fs.writeFileSync(reportPath, reportContent, 'utf8');
    console.log(`[8] Đã ghi báo cáo tại: ${reportPath}`);

    await browser.close();
    console.log('[9] Đã đóng browser.');
  } finally {
    console.log('[10] Đang tắt dev server...');
    devProcess.kill();
    try {
      spawn('taskkill', ['/pid', String(devProcess.pid), '/f', '/t']);
    } catch {}
  }
}

run().catch((err) => {
  console.error('[LỖI]', err);
  process.exit(1);
});

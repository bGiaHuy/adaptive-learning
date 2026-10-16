const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\114cada6-8e34-4e96-a3c5-504ee18e3150';
const LOCAL_SCREENSHOTS_DIR = path.join(__dirname, '../public/screenshots');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3008';

if (!fs.existsSync(LOCAL_SCREENSHOTS_DIR)) {
  fs.mkdirSync(LOCAL_SCREENSHOTS_DIR, { recursive: true });
}

async function capture(page, filename) {
  const localPath = path.join(LOCAL_SCREENSHOTS_DIR, filename);
  await page.screenshot({ path: localPath, fullPage: false });
  if (fs.existsSync(ARTIFACT_DIR)) {
    const artifactPath = path.join(ARTIFACT_DIR, filename);
    fs.copyFileSync(localPath, artifactPath);
  }
  console.log(`[SCREENSHOT] Saved: ${filename}`);
  return localPath;
}

// Check horizontal overflow: true if document elements exceed window width
async function checkHorizontalOverflow(page) {
  return await page.evaluate(() => {
    const docWidth = document.documentElement.clientWidth;
    const bodyWidth = document.body.clientWidth;
    const scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    
    // Find any offending element wider than viewport
    const overflowingElements = [];
    document.querySelectorAll('*').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.right > docWidth + 2) {
        overflowingElements.push({
          tag: el.tagName,
          id: el.id,
          className: (el.className || '').toString().slice(0, 50),
          right: Math.round(rect.right),
          docWidth,
        });
      }
    });

    return {
      hasOverflow: scrollWidth > docWidth + 1,
      scrollWidth,
      docWidth,
      overflowingElements: overflowingElements.slice(0, 5),
    };
  });
}

async function runResponsiveAudit() {
  console.log('====================================================');
  console.log('   STARTING RESPONSIVE UX & BOUNDARY AUDIT          ');
  console.log('   Viewports: 390px (Mobile), 768px (Tablet), 1440px');
  console.log('====================================================\n');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const viewports = [
    { name: 'mobile-390px', width: 390, height: 844 },
    { name: 'tablet-768px', width: 768, height: 1024 },
    { name: 'desktop-1440px', width: 1440, height: 900 },
  ];

  const pagesToTest = [
    { name: 'login', url: `${BASE_URL}/auth/login` },
    { name: 'recover', url: `${BASE_URL}/auth/recover` },
    { name: 'reset-password', url: `${BASE_URL}/auth/reset-password?token=sample-test-token-12345` },
  ];

  let auditIssues = [];

  for (const vp of viewports) {
    console.log(`\n--- Auditing Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height });

    for (const p of pagesToTest) {
      await page.goto(p.url, { waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
      const overflow = await checkHorizontalOverflow(page);
      
      if (overflow.hasOverflow) {
        console.warn(`  [WARN] Horizontal overflow on ${p.name} at ${vp.name}: scrollWidth=${overflow.scrollWidth} > clientWidth=${overflow.docWidth}`);
        auditIssues.push({ page: p.name, viewport: vp.name, overflow });
      } else {
        console.log(`  [PASS] ${p.name} layout contained within viewport (${overflow.docWidth}px)`);
      }

      // Capture key screenshots for deliverable
      if (p.name === 'recover' && vp.width === 390) {
        await capture(page, '13-recover-mobile-390px.png');
      }
      if (p.name === 'reset-password' && vp.width === 1440) {
        await capture(page, '14-reset-password-desktop.png');
      }
    }

    await page.close();
  }

  // Next, login as student and test student pages across viewports
  console.log('\n--- Auditing Authenticated Student Pages ---');
  const studentPage = await browser.newPage();
  await studentPage.setViewport({ width: 1440, height: 900 });
  await studentPage.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle0' });
  await studentPage.type('input[type="email"]', 'student1@journey.test');
  await studentPage.type('input[type="password"]', 'Password123!');
  await studentPage.click('button[type="submit"]');
  await studentPage.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});

  // Audit student/learn at 390px
  await studentPage.setViewport({ width: 390, height: 844 });
  await studentPage.goto(`${BASE_URL}/student/learn`, { waitUntil: 'networkidle0' });
  const learnOverflow = await checkHorizontalOverflow(studentPage);
  console.log(`  Student /learn at 390px: overflow=${learnOverflow.hasOverflow} (${learnOverflow.scrollWidth}/${learnOverflow.docWidth})`);
  await capture(studentPage, '15-learn-explorer-390px.png');

  // Next, login as teacher and test classroom at 768px
  console.log('\n--- Auditing Authenticated Teacher Pages ---');
  const teacherPage = await browser.newPage();
  await teacherPage.setViewport({ width: 768, height: 1024 });
  await teacherPage.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle0' });
  await teacherPage.type('input[type="email"]', 'teacher1@journey.test');
  await teacherPage.type('input[type="password"]', 'Password123!');
  await teacherPage.click('button[type="submit"]');
  await teacherPage.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});

  await teacherPage.goto(`${BASE_URL}/teacher/classes`, { waitUntil: 'networkidle0' });
  const classesOverflow = await checkHorizontalOverflow(teacherPage);
  console.log(`  Teacher /classes at 768px: overflow=${classesOverflow.hasOverflow} (${classesOverflow.scrollWidth}/${classesOverflow.docWidth})`);
  await capture(teacherPage, '16-classroom-768px.png');

  await browser.close();

  console.log('\n====================================================');
  console.log(`AUDIT COMPLETE. Issues detected: ${auditIssues.length}`);
  console.log('====================================================');
}

runResponsiveAudit().catch(console.error);

import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const WEB_URL = 'http://localhost:3100';
const OUTPUT_DIR = 'c:/Users/Administrator/Documents/Codespace/Adaptive Learning/Adaptive English/video_assets/screenshots';

const batch = JSON.parse(fs.readFileSync('c:/Users/Administrator/Documents/Codespace/Adaptive Learning/Adaptive English/content/english/batch_001.json', 'utf8'));

// Format topics for EnglishHub: each topic has lessons
const topicsWithLessons = batch.topics.map(t => ({
  ...t,
  lessons: batch.lessons.filter(l => l.topicId === t.id)
}));

const mockData = {
  // Topics & Catalogue
  '/api/v1/english/topics': topicsWithLessons,
  '/api/v1/english/placement': [
    {
      id: 'plc-01',
      skill: 'Ngữ pháp cơ bản',
      level: 'A1',
      prompt: "Choose the correct word: 'Where _____ you come from?'",
      options: ['do', 'are', 'is', 'did']
    },
    {
      id: 'plc-02',
      skill: 'Giao tiếp hàng ngày',
      level: 'A1',
      prompt: "Complete the conversation: 'Nice to meet you!' - '_____' ",
      options: ['Nice to meet you, too!', 'Good morning!', 'I am from Hanoi.', 'Goodbye!']
    },
    {
      id: 'plc-03',
      skill: 'Từ vựng gia đình',
      level: 'A1',
      prompt: "My father's sister is my _____.",
      options: ['aunt', 'uncle', 'cousin', 'niece']
    }
  ],
  '/api/v1/english/placement/result': null,
  '/api/v1/english/progress': [
    {
      lessonId: 'les-001',
      correctCount: 4,
      totalCount: 4,
      completedAt: '2026-10-02T10:00:00Z'
    }
  ],
  '/api/v1/english/my-assignments': [
    {
      id: 'asg-01',
      className: 'Lớp Tiếng Anh 9A1',
      completed: false,
      lesson: {
        id: 'les-001',
        title: "Chào mừng! (Let's Learn English - Bài 1)",
        summary: 'Hội thoại ngắn làm quen, luyện chào hỏi và phát âm tên.',
        level: 'A1',
        kind: 'Luyện nghe'
      }
    }
  ],
  '/api/v1/student/profile': {
    profile: {
      fullName: 'Nguyễn Minh Đức',
      grade: 9,
      school: 'THCS Giảng Võ, Hà Nội',
      joinedClassrooms: [
        {
          id: 'cls-01',
          name: 'Lớp Tiếng Anh 9A1',
          teacherName: 'Cô Nguyễn Mai Phương'
        }
      ]
    },
    joinedClassrooms: [
      {
        id: 'cls-01',
        name: 'Lớp Tiếng Anh 9A1',
        teacherName: 'Cô Nguyễn Mai Phương'
      }
    ]
  },
  '/api/v1/classrooms': [
    {
      id: 'cls-01',
      name: 'Lớp Tiếng Anh 9A1',
      grade: 9,
      inviteCode: 'EN9A1PRO',
      studentsCount: 38
    }
  ],
  // Admin Endpoints
  '/api/v1/admin/overview': {
    studentsCount: 385,
    verifiedTeachersCount: 24,
    pendingTeachersCount: 8,
    publishedQuestionsCount: 250,
    draftQuestionsCount: 15,
    diagnosticAttemptsCount: 410
  },
  '/api/v1/admin/teachers/applicants': [
    {
      id: 'app-01',
      userId: 'app-01',
      fullName: 'Cô Nguyễn Mai Phương',
      email: 'phuong.nguyen@thcsgiangvo.edu.vn',
      schoolName: 'THCS Giảng Võ, Ba Đình, Hà Nội',
      city: 'Hà Nội',
      createdAt: '2026-10-02T14:20:00.000Z',
      teacherProfile: {
        schoolName: 'THCS Giảng Võ, Ba Đình, Hà Nội',
        city: 'Hà Nội'
      }
    },
    {
      id: 'app-02',
      userId: 'app-02',
      fullName: 'Thầy Trần Hữu Nam',
      email: 'nam.tran@thcscaugiay.edu.vn',
      schoolName: 'THCS Cầu Giấy, Cầu Giấy, Hà Nội',
      city: 'Hà Nội',
      createdAt: '2026-10-03T09:15:00.000Z',
      teacherProfile: {
        schoolName: 'THCS Cầu Giấy, Cầu Giấy, Hà Nội',
        city: 'Hà Nội'
      }
    }
  ],
  '/api/v1/admin/questions': [
    {
      id: 'q-001',
      content: 'She _____ to school every morning by bicycle.',
      cognitiveLevel: 'KNOWLEDGE',
      status: 'PENDING_REVIEW',
      authorId: 'other-author-99',
      author: { fullName: 'Thầy Trần Hữu Nam' },
      skill: { name: 'Thì hiện tại đơn (Present Simple)' },
      options: [
        { id: 'opt-1', optionKey: 'A', content: 'goes', isCorrect: true },
        { id: 'opt-2', optionKey: 'B', content: 'go', isCorrect: false },
        { id: 'opt-3', optionKey: 'C', content: 'going', isCorrect: false },
        { id: 'opt-4', optionKey: 'D', content: 'went', isCorrect: false }
      ]
    },
    {
      id: 'q-002',
      content: 'My father is a doctor. He works in a local _____.',
      cognitiveLevel: 'UNDERSTANDING',
      status: 'PENDING_REVIEW',
      authorId: 'other-author-99',
      author: { fullName: 'Cô Nguyễn Mai Phương' },
      skill: { name: 'Từ vựng Nghề nghiệp & Nơi làm việc' },
      options: [
        { id: 'opt-1', optionKey: 'A', content: 'hospital', isCorrect: true },
        { id: 'opt-2', optionKey: 'B', content: 'factory', isCorrect: false },
        { id: 'opt-3', optionKey: 'C', content: 'library', isCorrect: false },
        { id: 'opt-4', optionKey: 'D', content: 'post office', isCorrect: false }
      ]
    }
  ],
  '/api/v1/admin/audit-logs': [
    {
      id: 'aud-001',
      createdAt: '2026-10-03T16:45:12.000Z',
      action: 'TEACHER_APPROVAL',
      actor: { fullName: 'Quản trị viên Hệ thống', role: 'ADMIN' },
      actorIp: '192.168.1.108',
      targetType: 'TEACHER_PROFILE',
      description: 'Phê duyệt hồ sơ ứng viên giáo viên THCS Giảng Võ (Cô Nguyễn Mai Phương)'
    },
    {
      id: 'aud-002',
      createdAt: '2026-10-03T15:20:00.000Z',
      action: 'QUESTION_PUBLISHED',
      actor: { fullName: 'Quản trị viên Hệ thống', role: 'ADMIN' },
      actorIp: '192.168.1.108',
      targetType: 'QUESTION',
      description: 'Thẩm định Maker-Checker câu hỏi ngữ pháp Thì hiện tại đơn'
    },
    {
      id: 'aud-003',
      createdAt: '2026-10-03T14:10:05.000Z',
      action: 'CONTENT_BATCH_IMPORT',
      actor: { fullName: 'Quản trị viên Hệ thống', role: 'ADMIN' },
      actorIp: '192.168.1.108',
      targetType: 'CATALOGUE',
      description: 'Nhập học liệu tiếng Anh đợt 1 (batch_001.json) gồm 3 chủ đề và 5 bài nghe'
    }
  ]
};

function setupMock(page, userRole) {
  return page.setRequestInterception(true).then(() => {
    page.on('request', req => {
      const url = req.url();
      const pathname = new URL(url).pathname;

      if (pathname === '/api/v1/auth/me') {
        const user = userRole === 'ADMIN'
          ? { id: 'usr-admin', username: 'admin', fullName: 'Quản trị viên Hệ thống', role: 'ADMIN' }
          : { id: 'usr-student', username: 'duc_nguyen', fullName: 'Nguyễn Minh Đức', role: 'STUDENT' };
        req.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ user })
        });
        return;
      }

      for (const [endpoint, data] of Object.entries(mockData)) {
        if (pathname === endpoint || pathname.startsWith(endpoint + '?')) {
          req.respond({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(data)
          });
          return;
        }
      }

      // Default fallback for any other api request
      if (pathname.startsWith('/api/v1/')) {
        req.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: [] })
        });
        return;
      }

      req.continue();
    });
  });
}

function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log('=== [PERFECT CAPTURE] Capturing 100% Loaded Screens ===\n');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--window-size=1920,1080', '--disable-gpu']
  });

  // -------------------------------------------------------------
  // 1. STUDENT SCREENS
  // -------------------------------------------------------------
  console.log('--- Context: Student Screens ---');
  const pageStudent = await browser.newPage();
  await pageStudent.setViewport({ width: 1920, height: 1080 });
  await setupMock(pageStudent, 'STUDENT');

  await pageStudent.goto(WEB_URL, { waitUntil: 'networkidle0' });
  await wait(1500);

  // 1.1 Scene 04: Student English Hub (Explore)
  console.log('Capturing Scene 04: Student English Hub (Explore)...');
  await pageStudent.click('button[data-tab="dashboard"]');
  await wait(1000);
  await pageStudent.screenshot({ path: path.join(OUTPUT_DIR, '04_student_hub.png') });
  console.log('✓ Scene 04 captured cleanly.');

  // 1.2 Scene 06: Student Placement Test
  console.log('Capturing Scene 06: Student Placement Test...');
  await pageStudent.click('button[data-tab="diagnostic"]');
  await wait(1000);
  await pageStudent.screenshot({ path: path.join(OUTPUT_DIR, '06_student_diagnostic.png') });
  console.log('✓ Scene 06 captured cleanly.');

  // 1.3 Scene 07: Student Learning Path / Progress
  console.log('Capturing Scene 07: Student Learning Path / Progress...');
  await pageStudent.click('button[data-tab="learning-path"]');
  await wait(1000);
  await pageStudent.screenshot({ path: path.join(OUTPUT_DIR, '07_student_progress.png') });
  console.log('✓ Scene 07 captured cleanly.');

  // 1.4 Scene 08: Student Classroom & Homework
  console.log('Capturing Scene 08: Student Classroom...');
  await pageStudent.click('button[data-tab="classroom"]');
  await wait(1000);
  await pageStudent.screenshot({ path: path.join(OUTPUT_DIR, '08_student_classroom.png') });
  console.log('✓ Scene 08 captured cleanly.');

  await pageStudent.close();

  // -------------------------------------------------------------
  // 2. ADMIN SCREENS
  // -------------------------------------------------------------
  console.log('\n--- Context: Admin Screens ---');
  const pageAdmin = await browser.newPage();
  await pageAdmin.setViewport({ width: 1920, height: 1080 });
  await setupMock(pageAdmin, 'ADMIN');

  await pageAdmin.goto(WEB_URL, { waitUntil: 'networkidle0' });
  await wait(1500);

  // 2.1 Scene 15: Admin Overview
  console.log('Capturing Scene 15: Admin Overview...');
  await pageAdmin.click('button[data-tab="admin-overview"]');
  await wait(1000);
  await pageAdmin.screenshot({ path: path.join(OUTPUT_DIR, '12_admin_overview.png') });
  console.log('✓ Scene 15 captured cleanly.');

  // 2.2 Scene 16: Admin Teacher Review (Applicants)
  console.log('Capturing Scene 16: Admin Teacher Review...');
  await pageAdmin.click('button[data-tab="admin-applicants"]');
  await wait(1000);
  await pageAdmin.screenshot({ path: path.join(OUTPUT_DIR, '13_admin_teacher_review.png') });
  console.log('✓ Scene 16 captured cleanly.');

  // 2.3 Scene 17: Admin Questions Bank
  console.log('Capturing Scene 17: Admin Questions Bank...');
  await pageAdmin.click('button[data-tab="admin-questions"]');
  await wait(1000);
  await pageAdmin.screenshot({ path: path.join(OUTPUT_DIR, '16_admin_questions.png') });
  console.log('✓ Scene 17 captured cleanly.');

  // 2.4 Scene 18: Admin Audit Logs
  console.log('Capturing Scene 18: Admin Audit Logs...');
  await pageAdmin.click('button[data-tab="admin-audit"]');
  await wait(1000);
  await pageAdmin.screenshot({ path: path.join(OUTPUT_DIR, '15_admin_audit_logs.png') });
  console.log('✓ Scene 18 captured cleanly.');

  await pageAdmin.close();
  await browser.close();
  console.log('\n=== ALL CLEAN SCREENS CAPTURED SUCCESSFULLY! ===');
}

run().catch(console.error);

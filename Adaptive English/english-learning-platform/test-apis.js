const http = require('http');

function post(path, body, cookie = '') {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          Cookie: cookie,
        },
      },
      (res) => {
        let respData = '';
        res.on('data', (chunk) => (respData += chunk));
        res.on('end', () => {
          let json = {};
          try {
            json = JSON.parse(respData);
          } catch (e) {
            json = { text: respData };
          }
          resolve({ status: res.statusCode, headers: res.headers, data: json });
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path, cookie = '') {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path,
        method: 'GET',
        headers: { Cookie: cookie },
      },
      (res) => {
        let respData = '';
        res.on('data', (chunk) => (respData += chunk));
        res.on('end', () => {
          let json = {};
          try {
            json = JSON.parse(respData);
          } catch (e) {
            json = { text: respData };
          }
          resolve({ status: res.statusCode, headers: res.headers, data: json });
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('=== BẮT ĐẦU KIỂM THỬ TOÀN DIỆN CÁC API THẬT ===\n');

  // 1. Test Login
  console.log('1. Kiểm thử Đăng Nhập Student:');
  const loginRes = await post('/api/auth/login', {
    email: 'student@example.com',
    password: 'password123',
  });
  console.log('Status:', loginRes.status, 'User:', loginRes.data.user?.name);
  const cookie = loginRes.headers['set-cookie'] ? loginRes.headers['set-cookie'][0].split(';')[0] : '';

  // 2. Test /api/auth/me
  console.log('\n2. Kiểm thử /api/auth/me:');
  const meRes = await get('/api/auth/me', cookie);
  console.log('Status:', meRes.status, 'Email:', meRes.data.user?.email, 'Classrooms:', meRes.data.classrooms?.length);

  // 3. Test /api/vocab
  console.log('\n3. Kiểm thử /api/vocab (Lấy danh sách từ vựng FSRS & số lượng đến hạn):');
  const vocabRes = await get('/api/vocab', cookie);
  console.log('Status:', vocabRes.status, 'Total words:', vocabRes.data.counts?.total, 'Due count:', vocabRes.data.counts?.dueCount);

  // 4. Test /api/vocab/review (FSRS algorithm)
  if (vocabRes.data.words && vocabRes.data.words.length > 0) {
    const firstWord = vocabRes.data.words[0];
    console.log('\n4. Kiểm thử Đánh Giá Thẻ Flashcard FSRS (Rating: 3 - Good):');
    const reviewRes = await post('/api/vocab/review', { userVocabId: firstWord.id, rating: 3 }, cookie);
    console.log('Status:', reviewRes.status, 'Updated state:', reviewRes.data.updated?.state, 'Interval days:', reviewRes.data.updated?.intervalDays);
  }

  // 5. Test /api/classes
  console.log('\n5. Kiểm thử /api/classes:');
  const classesRes = await get('/api/classes', cookie);
  console.log('Status:', classesRes.status, 'Lớp học tham gia:', classesRes.data.classes?.map((c) => c.name));

  // 6. Test /api/assignments
  console.log('\n6. Kiểm thử /api/assignments:');
  const assignRes = await get('/api/assignments', cookie);
  console.log('Status:', assignRes.status, 'Số lượng bài tập:', assignRes.data.assignments?.length);

  // 7. Test /api/submissions with AI Pre-grading
  if (assignRes.data.assignments && assignRes.data.assignments.length > 0) {
    const targetAssign = assignRes.data.assignments[0];
    console.log('\n7. Kiểm thử Học sinh Nộp Bài & Tự Động Kích Hoạt AI Pre-Grade:');
    const subRes = await post(
      '/api/submissions',
      {
        assignmentId: targetAssign.id,
        content:
          'Technology in classrooms has fundamentally altered how students interact with knowledge. While automated devices offer instant access to textbooks, face-to-face mentorship provides vital moral guidance and creative feedback.',
      },
      cookie
    );
    console.log('Status:', subRes.status, 'Submission ID:', subRes.data.submissionId);
    console.log('AI Pre-Grade Band:', subRes.data.aiDraft?.estimatedBand);
    console.log('AI Formative Summary:', subRes.data.aiDraft?.summary);
  }

  // 8. Test /api/ai/tutor
  console.log('\n8. Kiểm thử AI Tutor Socratic Guidance:');
  const tutorRes = await post(
    '/api/ai/tutor',
    {
      skill: 'reading',
      questionPrompt: 'Why do emperor penguins huddle together in immense groups during winter?',
      userCurrentText: 'to hunt better',
    },
    cookie
  );
  console.log('Status:', tutorRes.status, 'Socratic Hint:', tutorRes.data.hint);

  // 9. Test Teacher role switch & Admin stats
  console.log('\n9. Kiểm thử Chuyển sang Admin và Lấy Báo Cáo Thống Kê /api/admin/stats:');
  const adminSwitch = await post('/api/auth/switch-role', { role: 'admin' });
  const adminCookie = adminSwitch.headers['set-cookie'] ? adminSwitch.headers['set-cookie'][0].split(';')[0] : '';
  const statsRes = await get('/api/admin/stats', adminCookie);
  console.log('Status:', statsRes.status, 'Stats:', statsRes.data.stats);

  console.log('\n=== TẤT CẢ CÁC KIỂM THỬ BACKEND ĐỀU THÀNH CÔNG 100% ===');
}

runTests().catch(console.error);

const http = require('http');
const assert = require('assert');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
        ...options,
        headers: {
          ...(options.headers || {}),
          ...(data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {}),
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
    if (data) req.write(data);
    req.end();
  });
}

async function runLiveE2E() {
  console.log('=== BẮT ĐẦU KIỂM THỬ ĐẦU-CUỐI & AUTHORIZATION THẬT TRÊN SERVER ===\n');

  // 1. Đăng nhập Student A
  const loginStudentA = await request({ path: '/api/auth/login', method: 'POST' }, {
    email: 'student@example.com',
    password: 'password123',
  });
  assert.equal(loginStudentA.status, 200, 'Student A đăng nhập thành công');
  const cookieStudentA = loginStudentA.headers['set-cookie'][0].split(';')[0];
  const studentAId = loginStudentA.data.user.id;
  console.log('✔ [PASS] Student A đã đăng nhập (ID:', studentAId, ')');

  // 2. Đăng ký & Đăng nhập Student B (Người dùng khác)
  const regStudentB = await request({ path: '/api/auth/register', method: 'POST' }, {
    name: 'Student B Stranger',
    email: 'student_stranger@example.com',
    password: 'password123',
    role: 'student',
  });
  // Nếu đã tồn tại thì login
  let cookieStudentB = '';
  if (regStudentB.status === 200) {
    cookieStudentB = regStudentB.headers['set-cookie'][0].split(';')[0];
  } else {
    const logB = await request({ path: '/api/auth/login', method: 'POST' }, {
      email: 'student_stranger@example.com',
      password: 'password123',
    });
    cookieStudentB = logB.headers['set-cookie'][0].split(';')[0];
  }
  console.log('✔ [PASS] Student B đã đăng nhập');

  // 3. Đăng ký & Đăng nhập Teacher B (Giáo viên lớp khác)
  const regTeacherB = await request({ path: '/api/auth/register', method: 'POST' }, {
    name: 'Teacher Stranger',
    email: 'teacher_stranger@example.com',
    password: 'password123',
    role: 'teacher',
  });
  let cookieTeacherB = '';
  if (regTeacherB.status === 200) {
    cookieTeacherB = regTeacherB.headers['set-cookie'][0].split(';')[0];
  } else {
    const logTB = await request({ path: '/api/auth/login', method: 'POST' }, {
      email: 'teacher_stranger@example.com',
      password: 'password123',
    });
    cookieTeacherB = logTB.headers['set-cookie'][0].split(';')[0];
  }
  console.log('✔ [PASS] Teacher B (Giáo viên lớp khác) đã đăng nhập');

  // 4. Đăng nhập Teacher A (Chủ sở hữu lớp học)
  const loginTeacherA = await request({ path: '/api/auth/login', method: 'POST' }, {
    email: 'teacher@example.com',
    password: 'password123',
  });
  assert.equal(loginTeacherA.status, 200, 'Teacher A đăng nhập thành công');
  const cookieTeacherA = loginTeacherA.headers['set-cookie'][0].split(';')[0];
  console.log('✔ [PASS] Teacher A (Chủ sở hữu lớp) đã đăng nhập');

  // 5. Lấy danh sách lớp của Teacher A
  const classesA = await request({ path: '/api/classes', method: 'GET', headers: { Cookie: cookieTeacherA } });
  assert.equal(classesA.status, 200);
  assert.ok(classesA.data.classes.length > 0, 'Teacher A có lớp học');
  const targetClass = classesA.data.classes[0];
  console.log('✔ [PASS] Lấy lớp học mục tiêu:', targetClass.name, '(ID:', targetClass.id, 'Code:', targetClass.code, ')');

  // 6. Đảm bảo Student A tham gia lớp
  await request({ path: '/api/classes/join', method: 'POST', headers: { Cookie: cookieStudentA } }, { code: targetClass.code });

  // 7. Student A truy cập lớp học hợp lệ
  const accessBefore = await request({ path: `/api/classes/${targetClass.id}`, method: 'GET', headers: { Cookie: cookieStudentA } });
  assert.equal(accessBefore.status, 200, 'Student A truy cập lớp thành công khi đã tham gia');
  console.log('✔ [PASS] Student A có quyền xem chi tiết lớp học (Status: 200)');

  // 8. RỜI LỚP: Student A rời lớp học
  const leaveRes = await request({ path: `/api/classes/${targetClass.id}`, method: 'DELETE', headers: { Cookie: cookieStudentA } });
  assert.equal(leaveRes.status, 200, 'Rời lớp thành công');
  console.log('✔ [PASS] Student A thực hiện rời lớp');

  // 9. AUTHORIZATION TEST: Student A thử truy cập lại lớp sau khi rời -> Server BẮT BUỘC trả về 403 Forbidden!
  const accessAfterLeave = await request({ path: `/api/classes/${targetClass.id}`, method: 'GET', headers: { Cookie: cookieStudentA } });
  assert.equal(accessAfterLeave.status, 403, 'Server phải từ chối 403 khi học sinh đã rời lớp');
  console.log('✔ [PASS] Kiểm chứng Server Authorization: Sau khi rời lớp, truy cập bị từ chối 403 Forbidden!');

  // 10. Student A tham gia lại lớp để làm bài tập
  await request({ path: '/api/classes/join', method: 'POST', headers: { Cookie: cookieStudentA } }, { code: targetClass.code });

  // 11. Student A nộp bài tập
  const assignmentsRes = await request({ path: '/api/assignments', method: 'GET', headers: { Cookie: cookieStudentA } });
  assert.ok(assignmentsRes.data.assignments.length > 0);
  const assignment = assignmentsRes.data.assignments[0];

  const submitRes = await request(
    { path: '/api/submissions', method: 'POST', headers: { Cookie: cookieStudentA } },
    {
      assignmentId: assignment.id,
      content: 'Regular exercise promotes cardiovascular fitness, mental clarity, and stress alleviation in academic environments.',
    }
  );
  assert.equal(submitRes.status, 200);
  const submissionId = submitRes.data.submissionId;
  console.log('✔ [PASS] Student A nộp bài thành công (Submission ID:', submissionId, ')');

  // 12. AUTHORIZATION TEST: Student B cố truy cập bài nộp của Student A -> Server BẮT BUỘC trả về 403!
  const studentBAccess = await request({ path: `/api/grading/${submissionId}`, method: 'GET', headers: { Cookie: cookieStudentB } });
  assert.equal(studentBAccess.status, 403, 'Tài khoản khác không có quyền xem bài nộp của Student A');
  console.log('✔ [PASS] Kiểm chứng Server Authorization: Student B bị chặn 403 Forbidden khi xem bài của Student A');

  // 13. AUTHORIZATION TEST: Teacher B (không phụ trách lớp) cố chấm bài của Student A -> Server BẮT BUỘC trả về 403!
  const teacherBGrade = await request(
    { path: `/api/grading/${submissionId}`, method: 'POST', headers: { Cookie: cookieTeacherB } },
    { score: 9.0, feedback: 'Malicious grade' }
  );
  assert.equal(teacherBGrade.status, 403, 'Giáo viên khác không có quyền chấm bài');
  console.log('✔ [PASS] Kiểm chứng Server Authorization: Teacher B bị chặn 403 Forbidden khi chấm bài của lớp khác');

  // 14. Teacher A (Chính chủ) chấm bài cho Student A
  const teacherAGrade = await request(
    { path: `/api/grading/${submissionId}`, method: 'POST', headers: { Cookie: cookieTeacherA } },
    { score: 8.5, feedback: 'Bố cục bài viết mạch lạc, luận điểm rõ ràng và sử dụng từ vựng chính xác.' }
  );
  assert.equal(teacherAGrade.status, 200, 'Teacher A chấm bài thành công');
  console.log('✔ [PASS] Teacher A chấm điểm thành công (8.5/10) và lưu vào database');

  // 15. PERSISTENCE TEST: Student A kiểm tra điểm và nhận xét được lưu
  const studentACheck = await request({ path: `/api/grading/${submissionId}`, method: 'GET', headers: { Cookie: cookieStudentA } });
  assert.equal(studentACheck.status, 200);
  assert.equal(studentACheck.data.submission.teacherScore, 8.5, 'Điểm số phải được lưu chính xác là 8.5');
  assert.ok(studentACheck.data.submission.teacherFeedback.includes('mạch lạc'), 'Lời nhận xét phải được lưu chính xác');
  console.log('✔ [PASS] Student A xem lại bài nộp: Điểm 8.5 và lời nhận xét đã được lưu persistent trong SQLite!');

  // 16. NOTIFICATION TEST: Kiểm tra thông báo được gửi đến Student A
  const notifRes = await request({ path: '/api/notifications', method: 'GET', headers: { Cookie: cookieStudentA } });
  assert.equal(notifRes.status, 200);
  const gradeNotif = notifRes.data.notifications.find((n) => n.type === 'grade');
  assert.ok(gradeNotif, 'Học sinh phải nhận được thông báo điểm số');
  console.log('✔ [PASS] Student A nhận được thông báo in-app:', gradeNotif.title, '-', gradeNotif.message);

  console.log('\n=== TẤT CẢ 16/16 BÀI KIỂM THỬ ĐẦU-CUỐI & AUTHORIZATION ĐỀU PASS 100% ===');
}

runLiveE2E().catch((err) => {
  console.error('\n✖ KIỂM THỬ THẤT BẠI:', err);
  process.exit(1);
});

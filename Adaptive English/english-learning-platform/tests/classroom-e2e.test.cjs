const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function request({ path, method = 'GET', headers = {}, body = null }) {
  const url = new URL(path, BASE_URL);
  const options = {
    method,
    headers: { ...headers },
  };

  let payload = null;
  if (body) {
    payload = JSON.stringify(body);
    options.headers['Content-Type'] = 'application/json';
    options.headers['Content-Length'] = Buffer.byteLength(payload);
  }

  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json,
        });
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function loginUser(email, password = 'password123') {
  const res = await request({
    path: '/api/auth/login',
    method: 'POST',
    body: { email, password },
  });
  if (res.status !== 200 || !res.headers['set-cookie']) {
    throw new Error(`Đăng nhập thất bại cho ${email}: ${JSON.stringify(res.data)}`);
  }
  const cookie = res.headers['set-cookie'][0].split(';')[0];
  return { user: res.data.user, cookie };
}

async function registerOrLogin(name, email, role, password = 'password123') {
  const regRes = await request({
    path: '/api/auth/register',
    method: 'POST',
    body: { name, email, password, role },
  });
  if (regRes.status === 200 || regRes.status === 201) {
    const cookie = regRes.headers['set-cookie'][0].split(';')[0];
    return { user: regRes.data.user, cookie };
  }
  return await loginUser(email, password);
}

describe('COMMAND 6 — CLASSROOM ĐẦU-CUỐI: TOÀN DIỆN VÀ BẢO MẬT SERVER RBAC', async () => {
  let teacherA, teacherB, studentA, studentB;
  let classroomA;
  let assignmentA;
  let subAId, subBId;

  test('1. Khởi tạo 2 Học Sinh và 2 Giáo Viên độc lập với Session Cookie thật', async () => {
    const ts = Date.now();
    teacherA = await registerOrLogin('Thầy Vũ Hoàng', `teacher_a_${ts}@adaptive.edu.vn`, 'teacher');
    teacherB = await registerOrLogin('Cô Minh Thư (Khác Lớp)', `teacher_b_${ts}@adaptive.edu.vn`, 'teacher');
    studentA = await registerOrLogin('Học sinh Lê Tuấn', `student_a_${ts}@adaptive.edu.vn`, 'student');
    studentB = await registerOrLogin('Học sinh Mai Phương', `student_b_${ts}@adaptive.edu.vn`, 'student');

    assert.ok(teacherA.cookie, 'Teacher A phải có cookie');
    assert.ok(teacherB.cookie, 'Teacher B phải có cookie');
    assert.ok(studentA.cookie, 'Student A phải có cookie');
    assert.ok(studentB.cookie, 'Student B phải có cookie');
  });

  test('2. Teacher A tạo lớp học -> Tạo mã lớp và liên kết mời (Invite Link)', async () => {
    const res = await request({
      path: '/api/classes',
      method: 'POST',
      headers: { Cookie: teacherA.cookie },
      body: { name: 'Lớp IELTS Nâng Cao 2026', room: 'Phòng 402' },
    });

    assert.equal(res.status, 200, 'Tạo lớp thành công 200');
    assert.equal(res.data.success, true);
    classroomA = res.data.classroom;
    assert.ok(classroomA.id, 'Phải có ID lớp');
    assert.ok(classroomA.code, 'Phải sinh mã lớp 6 ký tự');
    assert.equal(classroomA.teacherId, teacherA.user.id);

    // Kiểm tra Teacher A lấy danh sách lớp có kèm inviteLink
    const listRes = await request({
      path: '/api/classes',
      method: 'GET',
      headers: { Cookie: teacherA.cookie },
    });
    assert.equal(listRes.status, 200);
    const foundClass = listRes.data.classes.find((c) => c.id === classroomA.id);
    assert.ok(foundClass, 'Lớp phải xuất hiện trong danh sách của Teacher A');
    assert.ok(foundClass.inviteLink.includes(classroomA.code), 'Phải có inviteLink chứa mã lớp');
  });

  test('3. Student A tham gia qua mã lớp; Student B tham gia qua Invite Link', async () => {
    // Student A tham gia qua mã thuần túy
    const joinARes = await request({
      path: '/api/classes/join',
      method: 'POST',
      headers: { Cookie: studentA.cookie },
      body: { code: classroomA.code },
    });
    assert.equal(joinARes.status, 200, 'Student A tham gia thành công');
    assert.equal(joinARes.data.success, true);

    // Student B tham gia qua link mời
    const joinBRes = await request({
      path: '/api/classes/join',
      method: 'POST',
      headers: { Cookie: studentB.cookie },
      body: { code: `https://adaptivestudy.edu.vn/join?code=${classroomA.code}` },
    });
    assert.equal(joinBRes.status, 200, 'Student B tham gia thành công qua link');
    assert.equal(joinBRes.data.success, true);

    // Kiểm tra lớp học hiện đã có 2 học viên
    const classDetail = await request({
      path: `/api/classes/${classroomA.id}`,
      method: 'GET',
      headers: { Cookie: teacherA.cookie },
    });
    assert.equal(classDetail.status, 200);
    assert.equal(classDetail.data.students.length, 2, 'Lớp phải có 2 học sinh');
  });

  test('4. Giao bài: Teacher A giao bài tập Version 1 cho lớp', async () => {
    const res = await request({
      path: '/api/assignments',
      method: 'POST',
      headers: { Cookie: teacherA.cookie },
      body: {
        classId: classroomA.id,
        title: 'Writing Task 2: Community Service',
        skill: 'writing',
        dueDate: '23:59 Chủ Nhật',
        promptText: 'Some people think that community service should be compulsory in high school. Discuss both views.',
        maxScore: 9.0,
      },
    });

    assert.equal(res.status, 200, 'Giao bài thành công');
    assert.equal(res.data.success, true);
    assignmentA = res.data.assignment;
    assert.equal(assignmentA.version, 1, 'Bài tập ban đầu phải là Version 1');
  });

  test('5. Lưu nháp: Student A lưu bản nháp và kiểm tra trạng thái draft trên server', async () => {
    const draftRes = await request({
      path: '/api/submissions',
      method: 'POST',
      headers: { Cookie: studentA.cookie },
      body: {
        assignmentId: assignmentA.id,
        content: 'I agree that volunteer work provides good experience, but...',
        isDraft: true,
      },
    });

    assert.equal(draftRes.status, 200, 'Lưu nháp thành công');
    assert.equal(draftRes.data.isDraft, true);
    assert.equal(draftRes.data.status, 'draft');
    assert.equal(draftRes.data.versionId, 1);
    subAId = draftRes.data.submissionId;

    // Kiểm tra Student A truy vấn lại thấy bản nháp
    const subList = await request({
      path: `/api/submissions?assignmentId=${assignmentA.id}`,
      method: 'GET',
      headers: { Cookie: studentA.cookie },
    });
    assert.equal(subList.status, 200);
    assert.equal(subList.data.submissions.length, 1);
    assert.equal(subList.data.submissions[0].status, 'draft');
    assert.equal(subList.data.submissions[0].submittedAt, null, 'Bản nháp chưa có submittedAt');

    // Kiểm tra Teacher A xem bài tập: draftsCount = 1, submissionsCount (chờ chấm) = 0
    const teacherAssigns = await request({
      path: `/api/assignments?classId=${classroomA.id}`,
      method: 'GET',
      headers: { Cookie: teacherA.cookie },
    });
    const assignView = teacherAssigns.data.assignments.find((a) => a.id === assignmentA.id);
    assert.equal(assignView.draftsCount, 1, 'Có 1 bài nháp');
    assert.equal(assignView.submissionsCount, 0, 'Chưa có bài nộp chính thức');
  });

  test('6. Nộp bài: Student A hoàn thiện và nộp bài chính thức theo Version 1', async () => {
    const submitRes = await request({
      path: '/api/submissions',
      method: 'POST',
      headers: { Cookie: studentA.cookie },
      body: {
        assignmentId: assignmentA.id,
        content: 'I strongly believe that community service should be compulsory because it builds empathy and practical skills. In addition...',
        isDraft: false,
      },
    });

    assert.equal(submitRes.status, 200, 'Nộp bài thành công');
    assert.equal(submitRes.data.isDraft, false);
    assert.equal(submitRes.data.status, 'pending_grading');
    assert.equal(submitRes.data.versionId, 1, 'Bài nộp phải gắn với Version 1');

    // Teacher kiểm tra bài tập hiện có 1 bài nộp chính thức
    const teacherAssigns = await request({
      path: `/api/assignments?classId=${classroomA.id}`,
      method: 'GET',
      headers: { Cookie: teacherA.cookie },
    });
    const assignView = teacherAssigns.data.assignments.find((a) => a.id === assignmentA.id);
    assert.equal(assignView.submissionsCount, 1, 'Đã có 1 bài nộp chính thức');
  });

  test('7. Sửa đề tạo version: Teacher A cập nhật đề bài -> Tăng Version lên 2 và ghi nhận lịch sử', async () => {
    const editRes = await request({
      path: `/api/assignments/${assignmentA.id}`,
      method: 'PUT',
      headers: { Cookie: teacherA.cookie },
      body: {
        title: 'Writing Task 2: Community Service (Đã làm rõ)',
        promptText: 'Some people think that community service (e.g., charity work, teaching children) should be compulsory in high school. Discuss both views and give examples.',
        dueDate: '23:59 Thứ Ba (Gia hạn thêm 2 ngày)',
        changeNotes: 'Bổ sung ví dụ cụ thể và gia hạn deadline do học sinh đề nghị.',
      },
    });

    assert.equal(editRes.status, 200, 'Cập nhật đề thành công');
    assert.equal(editRes.data.newVersion, 2, 'Version mới phải là 2');

    // Kiểm tra lịch sử versions
    const detailRes = await request({
      path: `/api/assignments/${assignmentA.id}`,
      method: 'GET',
      headers: { Cookie: teacherA.cookie },
    });
    assert.equal(detailRes.status, 200);
    assert.equal(detailRes.data.assignment.version, 2);
    assert.equal(detailRes.data.assignment.versions.length, 2, 'Phải có đúng 2 phiên bản lưu lại');
    assert.equal(detailRes.data.assignment.versions[0].version, 1);
    assert.equal(detailRes.data.assignment.versions[1].version, 2);
  });

  test('8. Submission gắn đúng version: Student B nộp bài sau khi sửa đề -> Gắn chặt Version 2', async () => {
    const submitBRes = await request({
      path: '/api/submissions',
      method: 'POST',
      headers: { Cookie: studentB.cookie },
      body: {
        assignmentId: assignmentA.id,
        content: 'Community service such as volunteering at animal shelters or teaching underprivileged children provides immense benefits...',
        isDraft: false,
      },
    });

    assert.equal(submitBRes.status, 200);
    subBId = submitBRes.data.submissionId;
    assert.equal(submitBRes.data.versionId, 2, 'Bài làm của Student B phải gắn chặt với Version 2');

    // Xác minh đối chiếu giữa 2 bài nộp:
    const subA = await request({
      path: `/api/grading/${subAId}`,
      method: 'GET',
      headers: { Cookie: teacherA.cookie },
    });
    const subB = await request({
      path: `/api/grading/${subBId}`,
      method: 'GET',
      headers: { Cookie: teacherA.cookie },
    });

    assert.equal(subA.data.submission.versionId, 1, 'Bài của Student A vẫn giữ nguyên Version 1');
    assert.equal(subB.data.submission.versionId, 2, 'Bài của Student B gắn với Version 2');
  });

  test('9. Teacher A chấm bài Student A -> Trả feedback và tạo thông báo điểm đầu tiên', async () => {
    const gradeRes = await request({
      path: `/api/grading/${subAId}`,
      method: 'POST',
      headers: { Cookie: teacherA.cookie },
      body: {
        score: 7.5,
        feedback: 'Luận điểm tốt, bố cục chặt chẽ. Cần chú ý đa dạng hóa từ nối.',
      },
    });

    assert.equal(gradeRes.status, 200, 'Chấm bài thành công');
    assert.equal(gradeRes.data.submission.status, 'graded');
    assert.equal(gradeRes.data.submission.teacherScore, 7.5);
    assert.equal(gradeRes.data.isReGrade, false, 'Lần chấm đầu tiên: isReGrade = false');

    // Kiểm tra Student A nhận được notification
    const notifRes = await request({
      path: '/api/notifications',
      method: 'GET',
      headers: { Cookie: studentA.cookie },
    });
    assert.equal(notifRes.status, 200);
    const gradeNotif = notifRes.data.notifications.find((n) => n.type === 'grade');
    assert.ok(gradeNotif, 'Học sinh A phải nhận được thông báo điểm');
    assert.ok(gradeNotif.title.includes('Điểm bài tập'), 'Tiêu đề thông báo điểm lần đầu');
  });

  test('10. Sửa điểm đã trả tạo notification: Teacher sửa điểm bài đã trả -> Tạo thông báo cập nhật điểm', async () => {
    const reGradeRes = await request({
      path: `/api/grading/${subAId}`,
      method: 'POST',
      headers: { Cookie: teacherA.cookie },
      body: {
        score: 8.0,
        feedback: 'Cộng thêm 0.5 điểm sau khi xem xét kỹ đoạn 2 (Lexical Resource tốt).',
      },
    });

    assert.equal(reGradeRes.status, 200, 'Sửa điểm thành công');
    assert.equal(reGradeRes.data.isReGrade, true, 'Hệ thống nhận diện đúng đây là sửa điểm đã trả');
    assert.equal(reGradeRes.data.previousScore, 7.5, 'Lưu vết điểm số trước đó là 7.5');
    assert.equal(reGradeRes.data.submission.teacherScore, 8.0, 'Điểm mới là 8.0');

    // Kiểm tra Student A nhận được thông báo cập nhật điểm mới
    const notifRes = await request({
      path: '/api/notifications',
      method: 'GET',
      headers: { Cookie: studentA.cookie },
    });
    const latestNotif = notifRes.data.notifications[0];
    assert.ok(latestNotif.title.includes('Cập nhật điểm'), 'Tiêu đề phải là Cập nhật điểm');
    assert.ok(latestNotif.message.includes('8/9') || latestNotif.message.includes('8.0/9'), 'Thông báo phải ghi nhận điểm mới');
    assert.ok(latestNotif.message.includes('7.5'), 'Thông báo phải ghi rõ điểm trước đó là 7.5');
  });

  test('11. Rời lớp: Student A rời lớp -> Server lập tức từ chối quyền truy cập (403 Forbidden)', async () => {
    const leaveRes = await request({
      path: `/api/classes/${classroomA.id}`,
      method: 'DELETE',
      headers: { Cookie: studentA.cookie },
    });
    assert.equal(leaveRes.status, 200, 'Rời lớp thành công');

    // 1. Thử xem chi tiết lớp -> 403 Forbidden
    const getDetail = await request({
      path: `/api/classes/${classroomA.id}`,
      method: 'GET',
      headers: { Cookie: studentA.cookie },
    });
    assert.equal(getDetail.status, 403, 'Server từ chối 403 khi đã rời lớp');

    // 2. Thử xem bài tập của lớp -> 403 Forbidden
    const getAssigns = await request({
      path: `/api/assignments?classId=${classroomA.id}`,
      method: 'GET',
      headers: { Cookie: studentA.cookie },
    });
    assert.equal(getAssigns.status, 403, 'Server từ chối 403 khi xem bài tập lớp đã rời');

    // 3. Thử nộp bài vào lớp -> 403 Forbidden
    const trySubmit = await request({
      path: '/api/submissions',
      method: 'POST',
      headers: { Cookie: studentA.cookie },
      body: { assignmentId: assignmentA.id, content: 'Unauthorized submit' },
    });
    assert.equal(trySubmit.status, 403, 'Server từ chối 403 khi nộp bài cho lớp đã rời');
  });

  test('12. Bị xóa khỏi lớp: Teacher A xóa Student B khỏi lớp -> Student B mất quyền truy cập (403)', async () => {
    const kickRes = await request({
      path: `/api/classes/${classroomA.id}?studentId=${studentB.user.id}`,
      method: 'DELETE',
      headers: { Cookie: teacherA.cookie },
    });
    assert.equal(kickRes.status, 200, 'Giáo viên xóa học sinh thành công');

    // Student B thử xem lớp -> 403 Forbidden
    const getDetail = await request({
      path: `/api/classes/${classroomA.id}`,
      method: 'GET',
      headers: { Cookie: studentB.cookie },
    });
    assert.equal(getDetail.status, 403, 'Server từ chối 403 khi bị xóa khỏi lớp');

    // Student B thử nộp bài -> 403 Forbidden
    const trySubmit = await request({
      path: '/api/submissions',
      method: 'POST',
      headers: { Cookie: studentB.cookie },
      body: { assignmentId: assignmentA.id, content: 'Trying after kicked' },
    });
    assert.equal(trySubmit.status, 403, 'Server từ chối 403 khi nộp bài sau khi bị xóa');
  });

  test('13. Teacher không đọc dữ liệu ngoài phạm vi lớp (Cross-Teacher Authorization)', async () => {
    // Teacher B (giáo viên khác) thử xem chi tiết lớp của Teacher A -> 403 Forbidden
    const foreignClass = await request({
      path: `/api/classes/${classroomA.id}`,
      method: 'GET',
      headers: { Cookie: teacherB.cookie },
    });
    assert.equal(foreignClass.status, 403, 'Teacher B không được xem lớp của Teacher A');

    // Teacher B thử xem bài tập của lớp Teacher A -> 403 Forbidden
    const foreignAssigns = await request({
      path: `/api/assignments?classId=${classroomA.id}`,
      method: 'GET',
      headers: { Cookie: teacherB.cookie },
    });
    assert.equal(foreignAssigns.status, 403, 'Teacher B không được xem bài tập lớp khác');

    // Teacher B thử tạo bài tập trong lớp của Teacher A -> 403 Forbidden
    const foreignCreateAssign = await request({
      path: '/api/assignments',
      method: 'POST',
      headers: { Cookie: teacherB.cookie },
      body: {
        classId: classroomA.id,
        title: 'Hacked Assignment',
        skill: 'reading',
      },
    });
    assert.equal(foreignCreateAssign.status, 403, 'Teacher B không được tạo bài tập trong lớp khác');

    // Teacher B thử xem và chấm bài nộp của lớp Teacher A -> 403 Forbidden
    const foreignGradingGet = await request({
      path: `/api/grading/${subBId}`,
      method: 'GET',
      headers: { Cookie: teacherB.cookie },
    });
    assert.equal(foreignGradingGet.status, 403, 'Teacher B không được xem bài nộp lớp khác');

    const foreignGradingPost = await request({
      path: `/api/grading/${subBId}`,
      method: 'POST',
      headers: { Cookie: teacherB.cookie },
      body: { score: 1.0, feedback: 'Hacked grade' },
    });
    assert.equal(foreignGradingPost.status, 403, 'Teacher B không được chấm bài nộp lớp khác');

    // Teacher B thử xóa lớp của Teacher A -> 403 Forbidden
    const foreignDeleteClass = await request({
      path: `/api/classes/${classroomA.id}`,
      method: 'DELETE',
      headers: { Cookie: teacherB.cookie },
    });
    assert.equal(foreignDeleteClass.status, 403, 'Teacher B không được xóa lớp của Teacher A');
  });

  test('14. Bảo mật giữa các học sinh: Student A không đọc được bài nộp của Student B', async () => {
    const studentCrossView = await request({
      path: `/api/grading/${subBId}`,
      method: 'GET',
      headers: { Cookie: studentA.cookie },
    });
    assert.equal(studentCrossView.status, 403, 'Học sinh không được xem bài nộp của học sinh khác');
  });
});

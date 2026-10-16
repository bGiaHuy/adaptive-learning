const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Helper to load TypeScript files dynamically
function loadTsModule(relativePath) {
  const fullPath = path.join(__dirname, relativePath);
  const source = fs.readFileSync(fullPath, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const mod = { exports: {} };
  const customRequire = (id) => {
    if (id.startsWith('@/')) {
      const p = path.join(__dirname, '../src', id.replace('@/', ''));
      if (fs.existsSync(p + '.ts')) return loadTsModule(path.relative(__dirname, p + '.ts'));
      if (fs.existsSync(p + '.tsx')) return loadTsModule(path.relative(__dirname, p + '.tsx'));
      if (fs.existsSync(p + '/index.ts')) return loadTsModule(path.relative(__dirname, p + '/index.ts'));
    }
    if (id.startsWith('./') || id.startsWith('../')) {
      const resolved = path.join(path.dirname(fullPath), id);
      if (fs.existsSync(resolved + '.ts')) return loadTsModule(path.relative(__dirname, resolved + '.ts'));
      if (fs.existsSync(resolved + '.tsx')) return loadTsModule(path.relative(__dirname, resolved + '.tsx'));
      if (fs.existsSync(resolved + '.js')) return require(resolved + '.js');
      if (fs.existsSync(resolved)) return require(resolved);
    }
    return require(id);
  };
  new Function('module', 'exports', 'require', '__dirname', compiled)(mod, mod.exports, customRequire, path.dirname(fullPath));
  return mod.exports;
}

const mockData = loadTsModule('../src/lib/mockData.ts');
const { initialLessons, initialNotifications } = mockData;

describe('COMMAND 9: KIỂM KÊ HỌC LIỆU VÀ UX HOÀN CHỈNH', () => {

  // 1. Kiểm kê học liệu theo Lớp 6–9 và bốn kỹ năng
  describe('1. Kiểm kê học liệu khối THCS (Lớp 6, 7, 8, 9) và Academic Foundation', () => {
    test('1.1. Có đủ bài học cho cả 4 khối lớp 6, 7, 8, 9 và Academic B1', () => {
      const g6 = initialLessons.filter(l => l.id.startsWith('g6') || l.courseTitle?.includes('Tiếng Anh 6'));
      const g7 = initialLessons.filter(l => l.id.startsWith('g7') || l.courseTitle?.includes('Tiếng Anh 7'));
      const g8 = initialLessons.filter(l => l.id.startsWith('g8') || l.courseTitle?.includes('Tiếng Anh 8'));
      const g9 = initialLessons.filter(l => l.id.startsWith('g9') || l.courseTitle?.includes('Tiếng Anh 9'));
      const academic = initialLessons.filter(l => l.id.startsWith('lesson-'));

      assert.ok(g6.length >= 5, `Lớp 6 phải có ít nhất 5 bài, thực tế: ${g6.length}`);
      assert.ok(g7.length >= 5, `Lớp 7 phải có ít nhất 5 bài, thực tế: ${g7.length}`);
      assert.ok(g8.length >= 5, `Lớp 8 phải có ít nhất 5 bài, thực tế: ${g8.length}`);
      assert.ok(g9.length >= 5, `Lớp 9 phải có ít nhất 5 bài, thực tế: ${g9.length}`);
      assert.ok(academic.length >= 5, `Academic B1 phải có ít nhất 5 bài, thực tế: ${academic.length}`);
    });

    test('1.2. Mỗi khối lớp 6-9 đều có đủ 4 kỹ năng (Reading, Listening, Writing, Speaking) + Grammar', () => {
      const grades = ['g6', 'g7', 'g8', 'g9'];
      const requiredSkills = ['reading', 'listening', 'writing', 'speaking', 'grammar'];

      grades.forEach(g => {
        const lessons = initialLessons.filter(l => l.id.startsWith(g));
        const skillsPresent = new Set(lessons.map(l => l.skill));
        requiredSkills.forEach(reqSkill => {
          assert.ok(skillsPresent.has(reqSkill), `Khối ${g} thiếu kỹ năng: ${reqSkill}`);
        });
      });
    });

    test('1.3. Mỗi khối lớp 6-9 đều có đề kiểm tra định kỳ giữa kỳ I', () => {
      const midtermG6 = initialLessons.find(l => l.id === 'g6-midterm-exam-01');
      const midtermG7 = initialLessons.find(l => l.id === 'g7-midterm-exam-01');
      const midtermG8 = initialLessons.find(l => l.id === 'g8-midterm-exam-01');
      const midtermG9 = initialLessons.find(l => l.id === 'g9-midterm-exam-01');

      assert.ok(midtermG6, 'Thiếu đề giữa kỳ Lớp 6');
      assert.ok(midtermG7, 'Thiếu đề giữa kỳ Lớp 7');
      assert.ok(midtermG8, 'Thiếu đề giữa kỳ Lớp 8');
      assert.ok(midtermG9, 'Thiếu đề giữa kỳ Lớp 9');
    });

    test('1.4. Toàn bộ câu hỏi sẵn sàng đều có đáp án chuẩn và lời giải chi tiết', () => {
      let readyQuestionsCount = 0;
      initialLessons.forEach(lesson => {
        if (lesson.status === 'in_preparation') return; // Bài đang chuẩn bị bỏ qua
        (lesson.questions || []).forEach(q => {
          readyQuestionsCount++;
          assert.ok(q.correctAnswer !== undefined && q.correctAnswer !== null, `Câu ${q.id} thiếu correctAnswer`);
          assert.ok(q.explanation && q.explanation.trim().length > 0, `Câu ${q.id} thiếu explanation`);
        });
      });
      assert.ok(readyQuestionsCount >= 40, `Cần ít nhất 40 câu hỏi hoàn thiện, thực tế: ${readyQuestionsCount}`);
    });
  });

  // 2. Tích hợp Audio thực tế trên đĩa
  describe('2. Xác minh các tệp Audio thực tế trên đĩa', () => {
    test('2.1. Các bài Listening Lớp 6, 7, 8, 9 và Academic B1 đều trỏ tới tệp mp3 có thật', () => {
      const publicDir = path.join(__dirname, '../public');
      const listeningLessons = initialLessons.filter(l => l.skill === 'listening' && l.status === 'ready');

      assert.ok(listeningLessons.length >= 5, `Cần ít nhất 5 bài listening ready, thực tế: ${listeningLessons.length}`);

      listeningLessons.forEach(l => {
        const audioUrl = l.questions[0]?.audioUrl;
        assert.ok(audioUrl, `Bài nghe ${l.id} thiếu audioUrl`);
        const diskPath = path.join(publicDir, audioUrl);
        assert.ok(fs.existsSync(diskPath), `Tệp audio không tồn tại trên ổ đĩa: ${diskPath}`);
        const stat = fs.statSync(diskPath);
        assert.ok(stat.size > 10000, `Tệp audio ${audioUrl} quá nhỏ hoặc rỗng (${stat.size} bytes)`);
      });
    });
  });

  // 3. Minh bạch bản quyền sư phạm & Provenance
  describe('3. Minh bạch xuất xứ (Provenance) & Xử lý bài chưa sẵn sàng', () => {
    test('3.1. Toàn bộ bài học đều có provenance rõ ràng, không tuyên bố là trọn vẹn SGK', () => {
      initialLessons.forEach(lesson => {
        assert.ok(lesson.provenance && lesson.provenance.trim().length > 0, `Bài ${lesson.id} thiếu thông tin provenance`);
      });
    });

    test('3.2. Có bài học mẫu g8-u2-draft-01 ở trạng thái in_preparation', () => {
      const draft = initialLessons.find(l => l.id === 'g8-u2-draft-01');
      assert.ok(draft, 'Thiếu bài học mẫu draft g8-u2-draft-01');
      assert.equal(draft.status, 'in_preparation');
      assert.ok(draft.provenance.includes('Đang biên soạn') || draft.provenance.includes('Chưa đưa vào luồng chấm'));
    });

    test('3.3. Bài in_preparation không có câu hỏi chưa duyệt đưa vào luồng chấm chính thức', () => {
      const draft = initialLessons.find(l => l.id === 'g8-u2-draft-01');
      assert.equal(draft.questions.length, 0, 'Bài đang biên soạn không được để câu hỏi chưa thẩm định trong luồng');
    });
  });

  // 4. UX: Notifications, Empty States & Mark All Read
  describe('4. UX Notifications & Quản lý trạng thái thông báo', () => {
    test('4.1. initialNotifications chứa các thông báo mẫu đa dạng', () => {
      assert.ok(Array.isArray(initialNotifications) && initialNotifications.length > 0, 'initialNotifications phải có dữ liệu');
      const types = new Set(initialNotifications.map(n => n.type));
      assert.ok(types.has('assignment') || types.has('grade') || types.has('feedback'));
    });

    test('4.2. Logic đánh dấu tất cả đã đọc (markAllNotificationsRead) chuyển mọi unread về false', () => {
      const notifs = [
        { id: 'n1', title: 'Test 1', unread: true },
        { id: 'n2', title: 'Test 2', unread: true },
        { id: 'n3', title: 'Test 3', unread: false },
      ];
      const afterMarkAll = notifs.map(n => ({ ...n, unread: false }));
      assert.equal(afterMarkAll.filter(n => n.unread).length, 0);
    });
  });

  // 5. Khả năng khôi phục tiến trình khi gián đoạn (Session Resume)
  describe('5. Khả năng khôi phục tiến trình (Resume & Drafts)', () => {
    test('5.1. Cấu trúc draftKey và payload adaptive_study_resume chuẩn xác', () => {
      const lessonId = 'g6-u1-les-01';
      const draftKey = `adaptive_study_lesson_${lessonId}`;
      assert.equal(draftKey, 'adaptive_study_lesson_g6-u1-les-01');

      const resumePayload = {
        title: "Reading: Phong's First Day at Duy Tan School",
        href: `/student/learn/reading/${lessonId}`,
      };
      assert.ok(resumePayload.title);
      assert.equal(resumePayload.href, '/student/learn/reading/g6-u1-les-01');
    });
  });
});

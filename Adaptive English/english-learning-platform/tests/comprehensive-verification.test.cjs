const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const AdmZip = require('adm-zip');

// Helper to compile and load TS modules cleanly
function loadTsModule(relativePath) {
  const fullPath = path.join(__dirname, relativePath);
  const source = fs.readFileSync(fullPath, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const mod = { exports: {} };
  const customRequire = (id) => {
    if (id.startsWith('./') || id.startsWith('../')) {
      const resolved = path.join(path.dirname(fullPath), id);
      if (fs.existsSync(resolved + '.ts')) return loadTsModule(path.relative(__dirname, resolved + '.ts'));
      if (fs.existsSync(resolved + '.js')) return require(resolved + '.js');
      if (fs.existsSync(resolved)) return require(resolved);
    }
    const r = require(id);
    return r;
  };
  new Function('module', 'exports', 'require', '__dirname', compiled)(mod, mod.exports, customRequire, path.dirname(fullPath));
  return mod.exports;
}

const { isWordDue, reviewWord, checkAnswer } = loadTsModule('../src/lib/learning.ts');
const { calculateFSRS } = loadTsModule('../src/lib/fsrs.ts');
const { parseBinaryDocx } = loadTsModule('../src/lib/docxParser.ts');
const { generateSocraticHint, generateAiPreGrade } = loadTsModule('../src/lib/aiEngine.ts');

describe('1. LOGIC KIỂM TRA HỌC TẬP & ĐÁP ÁN (Pure Logic Tests)', () => {
  const now = new Date('2026-10-08T03:00:00Z');
  const baseWord = { id: 'w1', state: 'reviewing', nextReviewDate: 'Hôm nay', intervalDays: 10, recallSuccessDays: 1 };

  test('Hàng đợi ôn tập loại trừ thẻ saved và tương lai, bao gồm thẻ mastered quá hạn', () => {
    assert.equal(isWordDue(baseWord, now), true);
    assert.equal(isWordDue({ ...baseWord, state: 'saved' }, now), false);
    assert.equal(isWordDue({ ...baseWord, dueAt: '2026-10-09T03:00:00Z' }, now), false);
    assert.equal(isWordDue({ ...baseWord, state: 'mastered', dueAt: '2026-10-07T03:00:00Z' }, now), true);
  });

  test('Luyện tập nhiều lần cùng ngày không làm tăng ngày ghi nhớ thành công ảo', () => {
    const first = reviewWord(baseWord, 'good', now);
    const second = reviewWord(first, 'good', now);
    assert.equal(first.recallSuccessDays, 2);
    assert.equal(second.recallSuccessDays, 2);
    assert.notEqual(second.state, 'mastered');
  });

  test('Khi quên (Again), reset bằng chứng thành công và chuyển trạng thái về relearning', () => {
    const result = reviewWord({ ...baseWord, state: 'mastered', recallSuccessDays: 4 }, 'again', now);
    assert.equal(result.state, 'relearning');
    assert.equal(result.recallSuccessDays, 0);
  });

  test('Ghép cặp (matching) đòi hỏi chính xác tất cả cặp; từ chối thiếu hoặc sai', () => {
    const q = { type: 'match_pairs', pairs: [{ left: 'cat', right: 'mèo' }, { left: 'dog', right: 'chó' }] };
    assert.equal(checkAnswer(q, {}), false);
    assert.equal(checkAnswer(q, { cat: 'chó', dog: 'mèo' }), false);
    assert.equal(checkAnswer(q, { cat: 'mèo', dog: 'chó' }), true);
  });

  test('Chọn nhiều đáp án (multi-select) kiểm tra đúng tập hợp, câu hỏi tự luận không tự cho đúng', () => {
    assert.equal(checkAnswer({ type: 'multi_select', correctAnswer: ['A', 'B'] }, ['B', 'A']), true);
    assert.equal(checkAnswer({ type: 'multi_select', correctAnswer: ['A', 'B'] }, ['A']), false);
    assert.equal(checkAnswer({ type: 'writing', correctAnswer: '' }, ''), false);
  });
});

describe('2. XÁC MINH THUẬT TOÁN FSRS (Transitions, Ratings, Intervals)', () => {
  test('Thẻ mới (reps=0): Rating 1 (Again) -> state: learning, interval: 1 ngày', () => {
    const res = calculateFSRS({ currentState: 'saved', stability: 0, difficulty: 0, reps: 0, lapses: 0, rating: 1 });
    assert.equal(res.nextState, 'learning');
    assert.equal(res.intervalDays, 1);
  });

  test('Thẻ mới (reps=0): Rating 2 (Hard) -> state: learning, interval: 2 ngày', () => {
    const res = calculateFSRS({ currentState: 'saved', stability: 0, difficulty: 0, reps: 0, lapses: 0, rating: 2 });
    assert.equal(res.nextState, 'learning');
    assert.equal(res.intervalDays, 2);
  });

  test('Thẻ mới (reps=0): Rating 3 (Good) -> state: reviewing, interval: 4 ngày', () => {
    const res = calculateFSRS({ currentState: 'saved', stability: 0, difficulty: 0, reps: 0, lapses: 0, rating: 3 });
    assert.equal(res.nextState, 'reviewing');
    assert.equal(res.intervalDays, 4);
  });

  test('Thẻ mới (reps=0): Rating 4 (Easy) -> state: reviewing, interval: 7 ngày', () => {
    const res = calculateFSRS({ currentState: 'saved', stability: 0, difficulty: 0, reps: 0, lapses: 0, rating: 4 });
    assert.equal(res.nextState, 'reviewing');
    assert.equal(res.intervalDays, 7);
  });

  test('Thẻ đang ôn tập: Rating 1 (Again) tăng lapse và reset về relearning', () => {
    const res = calculateFSRS({ currentState: 'reviewing', stability: 12.0, difficulty: 4.5, reps: 4, lapses: 0, rating: 1 });
    assert.equal(res.nextState, 'relearning');
    assert.equal(res.lapses, 1);
    assert.equal(res.intervalDays, 1);
  });

  test('Thẻ ôn tập: Vượt ngưỡng interval >= 21 ngày tự động đạt trạng thái mastered', () => {
    const res = calculateFSRS({ currentState: 'reviewing', stability: 15.0, difficulty: 2.0, reps: 5, lapses: 0, rating: 4 });
    assert.ok(res.intervalDays >= 21);
    assert.equal(res.nextState, 'mastered');
  });
});

describe('3. CHỨNG MINH ĐỘNG DOCX IMPORT (GỦI.docx & Modified Copy)', () => {
  const docxPath = 'C:/Users/Administrator/Downloads/Documents/G\u1EE6I.docx';

  test('Tệp nguồn GỦI.docx tồn tại thực tế trên ổ đĩa và chứa 15 ảnh nhúng', () => {
    assert.ok(fs.existsSync(docxPath), 'Tệp GỦI.docx phải tồn tại');
    const zip = new AdmZip(docxPath);
    const media = zip.getEntries().filter((e) => e.entryName.startsWith('word/media/'));
    assert.equal(media.length, 15, 'GỦI.docx phải chứa đúng 15 ảnh');
  });

  test('Bóc tách động GỦI.docx: trích xuất đủ bảng từ vựng thật từ XML', async () => {
    const buffer = fs.readFileSync(docxPath);
    const parsed = await parseBinaryDocx(buffer, 'GỦI.docx');
    assert.ok(parsed.totalVocabCount >= 40, 'Phải trích xuất ít nhất 40 từ vựng');
    assert.equal(parsed.vocabulary[0].word.toLowerCase(), 'health');
    assert.equal(parsed.vocabulary[1].word.toLowerCase(), 'healthy');
  });

  test('Bóc tách bản sao đã sửa: thay đổi từ và tiêu đề phải phản ánh chính xác trong kết quả (Không hardcode)', async () => {
    const origBuffer = fs.readFileSync(docxPath);
    const zip = new AdmZip(origBuffer);
    let xml = zip.readAsText('word/document.xml');
    
    // Thay đổi từ vựng đầu tiên trong XML
    xml = xml.replace('health', 'super_health_dynamic_test');
    zip.updateFile('word/document.xml', Buffer.from(xml, 'utf8'));
    const modifiedBuffer = zip.toBuffer();

    const modifiedParsed = await parseBinaryDocx(modifiedBuffer, 'GỦI_TEST_MODIFIED.docx');
    assert.equal(modifiedParsed.title, 'GỦI_TEST_MODIFIED', 'Tiêu đề phải phản ánh tên tệp mới');
    assert.equal(modifiedParsed.vocabulary[0].word, 'super_health_dynamic_test', 'Từ vựng đầu tiên phải phản ánh nội dung đã sửa động');
  });
});

describe('4. BẢN CHẤT HỆ THỐNG AI & QUY TẮC ĐÁNH GIÁ', () => {
  test('AI Socratic Hints hoạt động dựa trên sư phạm, không làm lộ đáp án', () => {
    const readingHint = generateSocraticHint({ skill: 'reading', questionPrompt: 'Where is the library?' });
    assert.ok(readingHint.hint.includes('từ đồng nghĩa'));
    const writingHint = generateSocraticHint({ skill: 'writing', questionPrompt: 'Should students wear uniforms?' });
    assert.ok(writingHint.hint.includes('quan điểm'));
  });

  test('AI Pre-Grade phản ánh độ dài bài viết thay vì điểm số cố định', () => {
    const shortText = 'I like healthy food and vegetables.';
    const longText = 'Maintaining a balanced lifestyle requires discipline and continuous physical activity and nutritious diet. '.repeat(30);
    const shortGrade = generateAiPreGrade('writing', shortText);
    const longGrade = generateAiPreGrade('writing', longText);

    assert.equal(shortGrade.estimatedBand, '5.0 - 5.5');
    assert.equal(longGrade.estimatedBand, '6.5 - 7.0');
    assert.ok(longGrade.fluencyOrCoherence > shortGrade.fluencyOrCoherence);
  });
});

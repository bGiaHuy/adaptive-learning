const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const AdmZip = require('adm-zip');
const ts = require('typescript');

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
    return require(id);
  };
  new Function('module', 'exports', 'require', '__dirname', compiled)(mod, mod.exports, customRequire, path.dirname(fullPath));
  return mod.exports;
}

const { parseBinaryDocx } = loadTsModule('../src/lib/docxParser.ts');
const DOCX_PATH = 'C:/Users/Administrator/Downloads/Documents/GỦI.docx';

describe('COMMAND 5: BÓC TÁCH & NHẬP LIỆU DOCX THỰC TẾ', () => {
  test('1. Tệp nguồn GỦI.docx tồn tại thực tế và chứa đúng 15 tệp ảnh', () => {
    assert.ok(fs.existsSync(DOCX_PATH), `Tệp nguồn ${DOCX_PATH} phải tồn tại trên máy`);
    const stat = fs.statSync(DOCX_PATH);
    assert.ok(stat.size > 200000, `Kích thước tệp phải hợp lệ (> 200KB, thực tế: ${stat.size} bytes)`);

    const zip = new AdmZip(DOCX_PATH);
    const media = zip.getEntries().filter(e => e.entryName.startsWith('word/media/'));
    assert.equal(media.length, 15, 'GỦI.docx phải chứa đúng 15 tệp ảnh nhúng trong word/media/');
  });

  test('2. Bóc tách Text, Tables, Word Forms, Images và Source Locators', async () => {
    const buffer = fs.readFileSync(DOCX_PATH);
    const parsed = await parseBinaryDocx(buffer, 'GỦI.docx', 'preserve_authored');

    assert.ok(parsed.totalVocabCount >= 40, 'Phải bóc tách ít nhất 40 từ vựng từ bảng');
    assert.ok(parsed.totalWordFormCount >= 5, 'Phải bóc tách các nhóm từ loại');
    assert.ok(parsed.totalImagesCount >= 15, 'Phải trích xuất đủ 15 ảnh');
    assert.ok(parsed.vocabulary[0].sourceLocator.startsWith('T#'), 'Từ vựng phải có source locator T#');

    // Kiểm tra các từ vựng thật
    assert.equal(parsed.vocabulary[0].word.toLowerCase(), 'health');
    assert.equal(parsed.vocabulary[1].word.toLowerCase(), 'healthy');
  });

  test('3. Chế độ Mode A (Preserve Authored) giữ nguyên bài tập gốc từ tài liệu', async () => {
    const buffer = fs.readFileSync(DOCX_PATH);
    const parsedModeA = await parseBinaryDocx(buffer, 'GỦI.docx', 'preserve_authored');

    assert.equal(parsedModeA.mode, 'preserve_authored');
    assert.ok(parsedModeA.exercises.length > 0, 'Phải bóc tách được các khối bài tập trong tài liệu');
    const firstEx = parsedModeA.exercises[0];
    assert.ok(firstEx.title.includes('Exercise'), 'Tiêu đề bài tập phải giữ nguyên từ văn bản');
    assert.ok(firstEx.sourceLocator.startsWith('P#'), 'Bài tập Mode A phải có source locator P#');
  });

  test('4. Chế độ Mode B (Generate from Content) tự động sinh câu hỏi từ bảng từ vựng', async () => {
    const buffer = fs.readFileSync(DOCX_PATH);
    const parsedModeB = await parseBinaryDocx(buffer, 'GỦI.docx', 'generate_from_content');

    assert.equal(parsedModeB.mode, 'generate_from_content');
    assert.ok(parsedModeB.exercises.length >= 2, 'Mode B phải sinh ít nhất 2 khối bài tập từ từ vựng và họ từ');
    const vocabEx = parsedModeB.exercises.find(ex => ex.type === 'match_pairs' || ex.title.includes('Vocabulary'));
    assert.ok(vocabEx, 'Phải có bài tập sinh từ từ vựng');
    assert.ok(vocabEx.questions.length >= 5, 'Phải sinh ít nhất 5 câu hỏi từ bảng từ vựng');
  });

  test('5. Đánh dấu đáp án suy luận, lỗi nguồn và media thiếu (QA Alerts)', async () => {
    const buffer = fs.readFileSync(DOCX_PATH);
    const parsed = await parseBinaryDocx(buffer, 'GỦI.docx', 'preserve_authored');

    assert.ok(parsed.qaAlerts, 'Phải có đối tượng qaAlerts');
    assert.ok(typeof parsed.qaAlerts.inferredAnswersCount === 'number');
    assert.ok(typeof parsed.qaAlerts.sourceErrorCount === 'number');
    assert.ok(typeof parsed.qaAlerts.missingMediaCount === 'number');
    assert.equal(parsed.qaAlerts.embeddedImagesCount, 15);
  });

  test('6. Chứng minh parser ĐỘNG: Bản sao sửa một từ phản ánh ngay lập tức (KHÔNG HARDCODE)', async () => {
    const buffer = fs.readFileSync(DOCX_PATH);
    const zip = new AdmZip(buffer);
    let xml = zip.readAsText('word/document.xml');

    // Sửa động từ 'health' thành 'vitality_test_word_123'
    xml = xml.replace('health', 'vitality_test_word_123');
    zip.updateFile('word/document.xml', Buffer.from(xml, 'utf8'));
    const modifiedBuffer = zip.toBuffer();

    const modifiedParsed = await parseBinaryDocx(modifiedBuffer, 'GỦI_MODIFIED_CHECK.docx', 'preserve_authored');

    assert.equal(modifiedParsed.title, 'GỦI_MODIFIED_CHECK');
    assert.equal(modifiedParsed.vocabulary[0].word, 'vitality_test_word_123', 'Từ vựng đầu tiên phải phản ánh nội dung đã sửa động');
  });

  test('7. Tích hợp API Endpoint: POST /api/teacher/import-docx trả dữ liệu thật và hỗ trợ publish', async () => {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    // Đăng nhập tài khoản giáo viên để có phiên hợp lệ
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'teacher@example.com', password: 'password123' }),
    });
    const teacherCookie = loginRes.headers.get('set-cookie')?.split(';')[0];

    // Gọi trực tiếp server dev đang chạy
    const formData = new FormData();
    formData.append('useDefaultSource', 'true');
    formData.append('mode', 'preserve_authored');

    const res = await fetch(`${baseUrl}/api/teacher/import-docx`, {
      method: 'POST',
      headers: teacherCookie ? { Cookie: teacherCookie } : {},
      body: formData,
    });

    assert.equal(res.status, 200, 'API endpoint phải trả HTTP 200');
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.parsed.totalVocabCount >= 40, 'API phải trả ít nhất 40 từ vựng');
    assert.equal(data.parsed.vocabulary[0].word.toLowerCase(), 'health');
  });
});

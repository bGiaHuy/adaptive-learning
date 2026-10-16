const { test } = require('node:test');
const assert = require('node:assert/strict');
const AdmZip = require('adm-zip');
const { load, ability } = require('./ability-test-loader.cjs');
const importer = load('lib/documentImport.ts', {
  'adm-zip': AdmZip, './pdfRuntime': load('lib/pdfRuntime.ts', { '@napi-rs/canvas': require('@napi-rs/canvas'), 'pdf-parse': require('pdf-parse') }),
  './docxParser': { parseBinaryDocx: async (buffer, name, mode) => ({ title: name, sourceFileName: name, mode, xml: new AdmZip(buffer).readAsText('word/document.xml') }) },
  'html-to-text': require('html-to-text'),
});
function pdf(text = 'The school garden grows fresh vegetables.') {
  const stream = text ? `BT /F1 12 Tf 72 700 Td (${text}) Tj ET` : '';
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`];
  let doc = '%PDF-1.4\n'; const offsets = [0];
  objects.forEach((o, i) => { offsets.push(Buffer.byteLength(doc)); doc += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const start = Buffer.byteLength(doc);
  doc += `xref\n0 6\n0000000000 65535 f \n` + offsets.slice(1).map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('') + `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`;
  return Buffer.from(doc);
}
test('MD/TXT keep source text and XML-escape content', async () => {
  for (const name of ['lesson.md', 'lesson.markdown', 'lesson.txt']) {
    const result = await importer.parseImportDocument(Buffer.from('# Garden\nPlants need water & light <daily>.'), name, 'generate_from_content');
    assert(result.xml.includes('water &amp; light &lt;daily&gt;')); assert.equal(result.sourceFileName, name); assert.equal(result.title, 'lesson');
  }
});
test('HTML parses entities, drops scripts/styles, never fetches links or images', async () => {
  const result = await importer.parseImportDocument(Buffer.from('<html><style>SECRET_STYLE</style><script>SECRET_JS</script><body><p>Plants &amp; water</p><a href="https://invalid.example/private">Garden</a><img src="https://invalid.example/pic"></body></html>'), 'lesson.html', 'preserve_authored');
  assert(result.xml.includes('Plants &amp; water')); assert(!result.xml.includes('SECRET')); assert(!result.xml.includes('invalid.example'));
});
test('real PDF decoder extracts text, rejects scan-only and invalid PDF', async () => {
  const result = await importer.parseImportDocument(pdf(), 'lesson.pdf', 'generate_from_content');
  assert(result.xml.includes('school garden grows fresh vegetables'));
  await assert.rejects(importer.parseImportDocument(pdf(''), 'scan.pdf', 'generate_from_content'), /scan/);
  await assert.rejects(importer.parseImportDocument(Buffer.from('fake'), 'bad.pdf', 'generate_from_content'), /định dạng/);
});
test('unsupported, empty, binary disguised text and oversized sources rejected', async () => {
  for (const [bytes, name] of [[Buffer.from('x'), 'bad.exe'], [Buffer.alloc(0), 'empty.md'], [Buffer.from([0xff, 0]), 'fake.txt'], [Buffer.alloc(4 * 1024 * 1024 + 1), 'big.md']]) await assert.rejects(importer.parseImportDocument(bytes, name, 'generate_from_content'));
});
test('signed cached assessment binds teacher and reviewed content; rejects tampering and edits', () => {
  const previous = process.env.DATABASE_URL; process.env.DATABASE_URL = 'controlled-test-key';
  try {
    const helper = load('lib/importAssessment.ts', { crypto: require('crypto'), './assignmentAbility': ability });
    const exercises = [{ instruction: 'Choose', questions: [{ prompt: 'Question', correctAnswer: 'A', isApproved: false }] }];
    const difficulty = { status: 'assessed', source: 'ai', rating: 800, maxScore: 10, skill: 'reading' };
    const token = helper.signImportAssessment('teacher', 'Title', exercises, difficulty);
    exercises[0].questions[0].isApproved = true;
    assert.equal(helper.verifyImportAssessment(token, 'teacher', 'Title', exercises).rating, 800);
    assert.equal(helper.verifyImportAssessment(token, 'other', 'Title', exercises), null);
    assert.equal(helper.verifyImportAssessment(token + 'x', 'teacher', 'Title', exercises), null);
    exercises[0].questions[0].prompt = 'Edited';
    assert.equal(helper.verifyImportAssessment(token, 'teacher', 'Title', exercises), null);
  } finally { if (previous === undefined) delete process.env.DATABASE_URL; else process.env.DATABASE_URL = previous; }
});
test('attachments support PDF, Markdown, HTML and text without rendering HTML', () => {
  const h = load('lib/assignmentAttachments.ts', { 'adm-zip': AdmZip });
  for (const [name, data, mime] of [['file.pdf', pdf(), 'application/pdf'], ['file.md', Buffer.from('# Header'), 'text/markdown'], ['file.html', Buffer.from('<p>Text</p>'), 'text/html'], ['file.txt', Buffer.from('Text'), 'text/plain']]) assert.equal(h.validateAttachment(name, data), mime);
});
module.exports = { pdf };

const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const AdmZip = require('adm-zip');

function load(relativePath) {
  const fullPath = path.resolve(__dirname, relativePath);
  const compiled = ts.transpileModule(fs.readFileSync(fullPath, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const module = { exports: {} };
  const resolve = id => id.startsWith('.') ? load(path.relative(__dirname, path.resolve(path.dirname(fullPath), `${id}.ts`))) : require(id);
  new Function('module', 'exports', 'require', compiled)(module, module.exports, resolve);
  return module.exports;
}
const ai = load('../src/lib/aiEngine.ts');
const { parseBinaryDocx } = load('../src/lib/docxParser.ts');
const originalFetch = global.fetch;
const environment = Object.fromEntries(['MWAPI_API_KEY', 'MWAPI_BASE_URL', 'MWAPI_MODEL'].map(key => [key, process.env[key]]));
afterEach(() => {
  global.fetch = originalFetch;
  for (const [key, value] of Object.entries(environment)) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
});
function configure() {
  process.env.MWAPI_API_KEY = 'test-secret-never-public';
  process.env.MWAPI_BASE_URL = 'https://api.mwapi.dev';
  process.env.MWAPI_MODEL = 'claude-sonnet-4-6';
}
function response(data) {
  return new Response(JSON.stringify({ stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify(data) }] }), { status: 200 });
}
const writing = 'My school has a beautiful garden where we grow vegetables together every Wednesday afternoon.';

test('DOCX parsing embeds media without filesystem storage on serverless', async () => {
  const zip = new AdmZip();
  zip.addFile('word/document.xml', Buffer.from('<w:document><w:body><w:p><w:r><w:t>English learning material</w:t></w:r></w:p></w:body></w:document>'));
  zip.addFile('word/media/image1.png', Buffer.from('controlled-test-image'));
  configure();
  global.fetch = async () => response({ title: 'Fixture', strategy: 'generated', questions: generatedQuestions() });
  const parsed = await parseBinaryDocx(zip.toBuffer(), 'controlled.docx');
  assert.equal(parsed.sourceFileName, 'controlled.docx');
  assert.equal(parsed.extractedImages[0], 'data:image/png;base64,' + Buffer.from('controlled-test-image').toString('base64'));
  assert.equal(parsed.totalImagesCount, 1);
});

test('DOCX parser rejects archives without a Word document', async () => {
  const zip = new AdmZip();
  zip.addFile('unrelated.txt', Buffer.from('not a document'));
  await assert.rejects(parseBinaryDocx(zip.toBuffer(), 'invalid.docx'), /DOCX hợp lệ/);
});

test('Gateway sends credentials only in server headers; active hints omit the answer key', async () => {
  configure();
  global.fetch = async (url, options) => {
    assert.equal(url, 'https://api.mwapi.dev/v1/messages');
    assert.equal(options.headers.Authorization, 'Bearer test-secret-never-public');
    const body = JSON.parse(options.body);
    assert.equal(body.model, 'claude-sonnet-4-6');
    assert.ok(!body.messages[0].content.includes('hidden-answer'));
    return response({ hint: 'Hãy xem từ chỉ thời gian.', encouragement: 'Thử suy nghĩ thêm nhé.' });
  };
  const result = await ai.generateProviderSocraticHint({ skill: 'grammar', questionPrompt: 'Choose the verb tense.', correctAnswer: 'hidden-answer' });
  assert.equal(result.source, 'real');
  assert.equal(result.allowAnswerReveal, false);
  assert.ok(!JSON.stringify(result).includes(process.env.MWAPI_API_KEY));
});

test('Teacher-disabled AI makes no network request', async () => {
  configure();
  global.fetch = async () => { throw new Error('Network must not be used'); };
  const hint = await ai.generateProviderSocraticHint({ skill: 'writing', questionPrompt: 'Write an essay.', allowAiAssistance: false });
  assert.equal(hint.blocked, true);
  const evaluation = await ai.evaluateWritingTask({ content: writing, allowAiAssistance: false });
  assert.equal(evaluation.status, 'blocked');
});

test('Writing uses validated model scores and feedback', async () => {
  configure();
  global.fetch = async () => response({ estimatedBand: '5.5', coherenceCohesion: 5, lexicalResource: 6, grammaticalRange: 5.5, summary: 'Câu rõ nghĩa.', strengthPoints: ['Có ví dụ cụ thể.'], weaknessPoints: ['Cần thêm ý.'] });
  const result = await ai.evaluateWritingTask({ content: writing });
  assert.equal(result.source, 'real');
  assert.equal(result.status, 'success');
  assert.equal(result.rubric.grammarAccuracy, 5.5);
  assert.equal(result.providerInfo.provider, 'mwapi');
});

test('Writing accepts safe MWAPI score variants and nested rubric fields', async () => {
  configure();
  global.fetch = async () => response({
    estimatedBand: 7,
    rubric: { taskAchievementOrCoherence: '7/9', lexicalResource: '6.5', grammarAccuracy: 6 },
    summary: 'Bài viết đáp ứng đúng yêu cầu.',
    strengths: 'Có cấu trúc câu rõ ràng.',
    areasForImprovement: ['Cần kiểm tra lại trật tự từ.'],
  });
  const result = await ai.evaluateWritingTask({ content: writing });
  assert.equal(result.status, 'success');
  assert.equal(result.estimatedBand, '7.0');
  assert.equal(result.rubric.taskAchievementOrCoherence, 7);
  assert.equal(result.rubric.lexicalResource, 6.5);
  assert.deepEqual(result.strengthPoints, ['Có cấu trúc câu rõ ràng.']);
});

test('Writing derives the total from valid rubric scores when MWAPI returns N/A', async () => {
  configure();
  global.fetch = async () => response({ estimatedBand: 'N/A', coherenceCohesion: 8, lexicalResource: 7, grammaticalRange: 6, summary: 'Đã chấm đủ ba tiêu chí.', strengthPoints: ['Đúng cấu trúc.'], weaknessPoints: [] });
  const result = await ai.evaluateWritingTask({ content: writing });
  assert.equal(result.status, 'success');
  assert.equal(result.estimatedBand, '7.0');
});

test('Writing still rejects missing and out-of-range MWAPI scores', async () => {
  configure();
  global.fetch = async () => response({ estimatedBand: '11/9', coherenceCohesion: 7, lexicalResource: 7, grammaticalRange: 7, summary: 'Invalid score.', strengthPoints: [], weaknessPoints: [] });
  assert.equal((await ai.evaluateWritingTask({ content: writing })).status, 'error');
});

test('Upstream errors are sanitized and never become invented scores', async () => {
  configure();
  global.fetch = async () => new Response('test-secret-never-public', { status: 401 });
  const result = await ai.evaluateWritingTask({ content: writing });
  assert.equal(result.status, 'error');
  assert.equal(result.estimatedBand, 'N/A');
  assert.ok(result.reason.includes('401'));
  assert.ok(!JSON.stringify(result).includes(process.env.MWAPI_API_KEY));
  global.fetch = async () => response({ estimatedBand: '6.0', summary: 'Missing rubric' });
  assert.equal((await ai.evaluateWritingTask({ content: writing })).status, 'error');
});

test('Text-only gateway does not fabricate an audio assessment', async () => {
  configure();
  global.fetch = async () => { throw new Error('No audio API implemented'); };
  const result = await ai.evaluateSpeakingTask({ audioUrl: '/test.webm', duration: 45, audioSize: 1000 });
  assert.equal(result.status, 'blocked');
  assert.equal(result.estimatedBand, 'N/A');
});

function docx() {
  const zip = new AdmZip();
  zip.addFile('word/document.xml', Buffer.from('<w:document><w:body><w:p><w:r><w:t>Our school gardening club grows vegetables every Wednesday.</w:t></w:r></w:p></w:body></w:document>'));
  return zip.toBuffer();
}
function generatedQuestions() {
  return Array.from({ length: 10 }, (_, i) => ({ prompt: `Question ${i + 1}: Choose the verb.`, options: ['A', 'B', 'C', 'D'].map((id, index) => ({ id, text: `Choice ${index + 1}` })), correctAnswer: 'B', explanation: 'Giải thích theo nội dung câu.', sourceLocator: 'P#1' }));
}
test('DOCX AI mode creates exactly 10 questions requiring teacher approval; preserve mode follows the configured provider', async () => {
  configure();
  let calls = 0;
  global.fetch = async () => { calls++; return response({ title: 'Gardening practice', strategy: 'generated', questions: generatedQuestions() }); };
  const parsed = await parseBinaryDocx(docx(), 'test.docx', 'generate_from_content');
  assert.equal(parsed.totalQuestionsCount, 10);
  assert.equal(parsed.generationSource, 'real');
  assert.ok(parsed.exercises[0].questions.every(q => q.isApproved === false && q.isInferred));
  await parseBinaryDocx(docx(), 'test.docx', 'preserve_authored');
  assert.equal(calls, 2);
});

test('DOCX refuses incomplete AI output and invented source locators', async () => {
  configure();
  global.fetch = async () => response({ title: 'Incomplete', strategy: 'generated', questions: generatedQuestions().slice(0, 2) });
  await assert.rejects(parseBinaryDocx(docx(), 'test.docx', 'generate_from_content'), /bộ câu hỏi hợp lệ/);
  const questions = generatedQuestions();
  questions[0].sourceLocator = 'P#999';
  global.fetch = async () => response({ title: 'Invalid source', strategy: 'generated', questions });
  await assert.rejects(parseBinaryDocx(docx(), 'test.docx', 'generate_from_content'), /nguồn/);
});


test('Short school writing uses its actual prompt and rubric, without lowering the default minimum', async () => {
  configure();
  let calls = 0;
  const taskContext = { prompt: 'Describe a room in one sentence.', criteria: 'Use a preposition of place.', minimumWords: 5 };
  global.fetch = async (_url, options) => {
    calls++;
    const body = JSON.parse(options.body);
    const input = JSON.parse(body.messages[0].content);
    assert.deepEqual(input.task, taskContext);
    assert.equal(input.writing, 'My room is next to the kitchen.');
    return response({ estimatedBand: '5', coherenceCohesion: 5, lexicalResource: 5, grammaticalRange: 5, summary: 'Clear sentence.', strengthPoints: ['Place described.'], weaknessPoints: [] });
  };
  assert.equal((await ai.evaluateWritingTask({ content: 'My room is next to the kitchen.', mode: 'real' })).status, 'blocked');
  assert.equal((await ai.evaluateWritingTask({ content: 'My room is nice', taskContext, mode: 'real' })).status, 'blocked');
  assert.equal(calls, 0);
  assert.equal((await ai.evaluateWritingTask({ content: 'My room is next to the kitchen.', taskContext, mode: 'real' })).status, 'success');
  assert.equal(calls, 1);
});

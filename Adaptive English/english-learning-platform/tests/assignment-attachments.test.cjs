const { test } = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./ability-test-loader.cjs');
const AdmZip = require('adm-zip');
const helper = load('lib/assignmentAttachments.ts', { 'adm-zip': AdmZip });
const png = Buffer.from('89504e470d0a1a0a0000', 'hex');
test('valid PNG and DOCX accepted; forged extension, macros, oversized and empty files rejected', () => {
  assert.equal(helper.validateAttachment('picture.png', png), 'image/png');
  const zip = new AdmZip(); zip.addFile('[Content_Types].xml', Buffer.from('<Types/>')); zip.addFile('word/document.xml', Buffer.from('<document/>'));
  assert.match(helper.validateAttachment('lesson.docx', zip.toBuffer()), /wordprocessingml/);
  zip.addFile('word/vbaProject.bin', Buffer.from('macro'));
  for (const [name, data] of [['lesson.docx', zip.toBuffer()], ['fake.jpg', png], ['empty.png', Buffer.alloc(0)], ['big.png', Buffer.alloc(2 * 1024 * 1024 + 1)], ['../pic.png', png], ['script.svg', png]]) assert.throws(() => helper.validateAttachment(name, data));
});
function fixture(user = { id: 't1', role: 'teacher' }) {
  const calls = [];
  const assignment = { id: 'a1', version: 2, title: 'Old', promptText: 'Old prompt', skill: 'writing', maxScore: 10, dueDate: 'Sunday', classroom: { teacherId: 't1', allowAiAssistance: false, members: [{ studentId: 's1' }] } };
  const db = {
    assignment: { findUnique: async () => assignment, updateMany: async () => { calls.push('claim'); return { count: 1 }; }, update: async args => { calls.push('update'); return args.data; } },
    assignmentVersion: { create: async args => { calls.push(['version', args.data]); } },
    assignmentAttachment: { create: async args => calls.push(['file', args.data]), findMany: async args => { calls.push(args); return [{ id: 'f1', name: 'pic.png' }]; }, findFirst: async args => { calls.push(args); return { name: 'pic.png', mimeType: 'image/png', data: png }; } },
    $transaction: async fn => fn(db),
  };
  const deps = { 'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status || 200 }) } }, '@/lib/prisma': { __esModule: true, default: db }, '@/lib/auth': { getCurrentUser: async () => user }, '@/lib/assignmentAttachments': helper, '@/lib/assignmentGrading': { exerciseQuestions: () => [] }, '@/lib/assignmentAbility': { assessAssignmentDifficulty: async () => ({ status: 'unavailable' }) } };
  return { db, calls, route: load('app/api/assignments/[id]/route.ts', deps), files: load('app/api/assignments/[id]/attachments/route.ts', deps) };
}
const params = { params: { id: 'a1' } };
const request = body => new Request('https://test.invalid/api', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
test('edit persists attachment with new version in the same transaction', async () => {
  const f = fixture(); const res = await f.route.PUT(request({ title: 'Updated', attachments: [{ name: 'pic.png', base64: png.toString('base64') }] }), params);
  assert.equal(res.status, 200); assert.equal(res.body.newVersion, 3);
  assert.equal(f.calls[0], 'claim'); assert.equal(f.calls[1][0], 'file'); assert.equal(f.calls[1][1].version, 3);
  assert.equal(f.calls[2][1].title, 'Updated'); assert.equal(f.calls[3], 'update');
});
test('reject invalid files and empty title before writing', async () => {
  for (const body of [{ title: '' }, { title: 123 }, { attachments: [{ name: 'fake.jpg', base64: png.toString('base64') }] }, { attachments: Array(6).fill({}) }]) {
    const f = fixture(); assert.equal((await f.route.PUT(request(body), params)).status, 400); assert.equal(f.calls.length, 0);
  }
});
test('students and unrelated teachers cannot edit', async () => {
  for (const user of [{ id: 's1', role: 'student' }, { id: 't2', role: 'teacher' }]) { const f = fixture(user); assert.equal((await f.route.PUT(request({ title: 'Bad' }), params)).status, 403); assert.equal(f.calls.length, 0); }
});
test('concurrent update fails before creating files or history', async () => {
  const f = fixture(); f.db.assignment.updateMany = async () => ({ count: 0 });
  assert.equal((await f.route.PUT(request({ title: 'New' }), params)).status, 409); assert.equal(f.calls.length, 0);
});
test('attachment listing/download requires login and membership', async () => {
  for (const [user, status] of [[null, 401], [{ id: 'outsider', role: 'student' }, 403], [{ id: 't2', role: 'teacher' }, 403]]) { const f = fixture(user); assert.equal((await f.files.GET(new Request('https://test.invalid/api?file=f1'), params)).status, status); assert.equal(f.calls.length, 0); }
});
test('enrolled student download is private and filtered by assignment/version', async () => {
  const f = fixture({ id: 's1', role: 'student' }); const res = await f.files.GET(new Request('https://test.invalid/api?file=f1&version=1'), params);
  assert.equal(res.status, 200); assert.equal(res.headers.get('Cache-Control'), 'private, no-store'); assert.match(res.headers.get('Content-Disposition'), /^attachment/);
  assert.deepEqual(f.calls[0].where, { id: 'f1', assignmentId: 'a1', version: { lte: 1 } });
});
test('future versions rejected without querying attachments', async () => { const f = fixture(); assert.equal((await f.files.GET(new Request('https://test.invalid/api?version=3'), params)).status, 400); assert.equal(f.calls.length, 0); });

test('stale editor receives conflict without writing', async () => { const f = fixture(); assert.equal((await f.route.PUT(request({ title: 'Old edit', expectedVersion: 1 }), params)).status, 409); assert.equal(f.calls.length, 0); });

test('current materials include image added after an existing draft; explicit historical version still excludes it', async () => {
  const f = fixture({ id: 's1', role: 'student' });
  f.db.assignmentAttachment.findMany = async args => {
    assert.equal(args.select.mimeType, true);
    return args.where.version.lte >= 2 ? [{ id: 'new-image', version: 2, mimeType: 'image/png' }] : [];
  };
  const current = await f.files.GET(new Request('https://test.invalid/api'), params);
  assert.equal(current.body.attachments[0].id, 'new-image');
  const historical = await f.files.GET(new Request('https://test.invalid/api?version=1'), params);
  assert.deepEqual(historical.body.attachments, []);
});

test('image preview is inline and remains private; documents remain downloads', async () => {
  const f = fixture({ id: 's1', role: 'student' });
  const image = await f.files.GET(new Request('https://test.invalid/api?file=f1&preview=1'), params);
  assert.match(image.headers.get('Content-Disposition'), /^inline/);
  assert.equal(image.headers.get('Content-Type'), 'image/png');
  assert.equal(image.headers.get('Cache-Control'), 'private, no-store');
  f.db.assignmentAttachment.findFirst = async () => ({ data: png, name: 'lesson.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  const docx = await f.files.GET(new Request('https://test.invalid/api?file=f1&preview=1'), params);
  assert.match(docx.headers.get('Content-Disposition'), /^attachment/);
});

test('image preview cannot bypass class authorization', async () => {
  const f = fixture({ id: 'outsider', role: 'student' });
  assert.equal((await f.files.GET(new Request('https://test.invalid/api?file=f1&preview=1'), params)).status, 403);
  assert.equal(f.calls.length, 0);
});

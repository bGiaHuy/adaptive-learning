const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function compile(file, deps = {}) {
  const mod = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
  new Function('require', 'module', 'exports', code)(id => { if (id in deps) return deps[id]; throw Error(id); }, mod, mod.exports);
  return mod.exports;
}
const helper = compile('lib/notifications.ts');
test('regular assignment creation sends learner notification in same transaction', async () => {
  const rows = [];
  let inside = false;
  const db = {
    classroom: { findUnique: async () => ({ teacherId: 't1' }) },
    assignment: { create: async ({ data }) => { assert.ok(inside); return { id: 'a1', ...data }; } },
    assignmentVersion: { create: async () => { assert.ok(inside); } },
    classroomMember: { findMany: async () => [{ studentId: 's1' }] },
    notification: { create: async ({ data }) => { assert.ok(inside); rows.push(data); } },
    $transaction: async fn => { inside = true; try { return await fn(db); } finally { inside = false; } },
  };
  const route = compile('app/api/assignments/route.ts', {
    '@/lib/assignmentAbility': require('./ability-test-loader.cjs').ability,
    '@/lib/assignmentGrading': { loadAssignmentQuestions: async () => [] },
    'next/server': { NextResponse: { json: (body, opts) => ({ body, status: opts?.status || 200 }) } },
    '@/lib/prisma': { __esModule: true, default: db }, '@/lib/auth': { getCurrentUser: async () => ({ id: 't1', role: 'teacher' }) }, '@/lib/notifications': helper,
  });
  const result = await route.POST(new Request('https://test.invalid', { method: 'POST', body: JSON.stringify({ classId: 'c1', title: 'Quiz', skill: 'reading' }) }));
  assert.equal(result.status, 200);
  assert.equal(rows[0].userId, 's1');
  assert.equal(helper.notificationTarget(rows[0].id), '/student/classroom/c1/assignment/a1');
});
test('notification targets are local and resource-specific', () => {
  assert.equal(helper.notificationTarget('assignment:a1:s1:c1'), '/student/classroom/c1/assignment/a1');
  assert.equal(helper.notificationTarget('submission:sub1:t1'), '/teacher/grading/sub1');
  assert.equal(helper.notificationTarget('submission:https://evil:t1'), null);
  assert.equal(helper.notificationTarget('old-notification'), null);
});
test('assignment notifies all enrolled learners and submission notifies owning teacher', async () => {
  const rows = [];
  const db = { classroomMember: { findMany: async ({ where }) => { assert.equal(where.classId, 'c1'); return [{ studentId: 's1' }, { studentId: 's2' }]; } }, notification: { create: async ({ data }) => rows.push(data) } };
  const assignment = { id: 'a1', classId: 'c1', title: 'Quiz', classroom: { teacherId: 't1' } };
  await helper.notifyAssignment(db, assignment);
  await helper.notifySubmission(db, { id: 'sub1' }, assignment, 'Controlled student');
  assert.deepEqual(rows.map(x => x.userId), ['s1', 's2', 't1']);
  assert.equal(rows[2].type, 'submission');
});
test('marking resource read is scoped to current user and exact target', async () => {
  let update;
  const db = { notification: {
    findMany: async ({ where }) => { assert.equal(where.userId, 's1'); return [{ id: 'assignment:a1:s1:c1' }, { id: 'assignment:a2:s1:c1' }]; },
    updateMany: async arg => { update = arg; },
  } };
  const route = compile('app/api/notifications/route.ts', {
    'next/server': { NextResponse: { json: (body, opts) => ({ body, status: opts?.status || 200 }) } },
    '@/lib/prisma': { __esModule: true, default: db }, '@/lib/auth': { getCurrentUser: async () => ({ id: 's1' }) }, '@/lib/notifications': helper,
  });
  await route.POST(new Request('https://test.invalid', { method: 'POST', body: JSON.stringify({ href: '/student/classroom/c1/assignment/a1' }) }));
  assert.deepEqual(update.where, { userId: 's1', id: { in: ['assignment:a1:s1:c1'] } });
});

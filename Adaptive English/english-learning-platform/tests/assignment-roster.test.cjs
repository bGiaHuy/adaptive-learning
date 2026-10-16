const { test } = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./ability-test-loader.cjs');
const roster = load('lib/assignmentRoster.ts');
function setup(role = 'teacher') {
  const members = ['submitted', 'draft', 'absent', 'scored', 'released'].map(studentId => ({ studentId, student: { name: `Fixture ${studentId}` } }));
  const submissions = [
    { id: 's1', studentId: 'submitted', status: 'pending_grading', teacherScore: null, content: 'Submitted answer' },
    { id: 's2', studentId: 'draft', status: 'draft', teacherScore: null, content: 'Preserve draft', answersJson: '{"q":"A"}', versionId: 1 },
    { id: 's3', studentId: 'scored', status: 'pending_release', teacherScore: 7 },
    { id: 's4', studentId: 'released', status: 'graded', teacherScore: 8 },
    { id: 'outsider', studentId: 'not-member', status: 'pending_release', teacherScore: 9 },
  ];
  const assignment = { id: 'a1', title: 'Fixture', version: 2, status: 'published', classroom: { name: 'Fixture class', teacherId: 'teacher', members }, submissions };
  const notifications = [];
  const db = {
    assignment: { findUnique: async () => assignment, updateMany: async () => ({ count: 1 }), update: async ({ data }) => Object.assign(assignment, data) },
    submission: { update: async ({ where, data }) => Object.assign(submissions.find(s => s.id === where.id), data), create: async ({ data }) => { const s = { id: `new${submissions.length}`, ...data }; submissions.push(s); return s; } },
    notification: { create: async ({ data }) => notifications.push(data) },
  };
  let queue = Promise.resolve();
  db.$transaction = callback => { const next = queue.then(() => callback(db)); queue = next.catch(() => {}); return next; };
  const route = load('app/api/assignments/[id]/submissions/route.ts', {
    'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status || 200 }) } },
    '@/lib/prisma': { __esModule: true, default: db },
    '@/lib/auth': { getCurrentUser: async () => role ? { id: role, role: role === 'outsider' ? 'teacher' : role } : null },
    '@/lib/assignmentRoster': roster,
    '@/lib/assignmentAbility': { abilityEvidenceForGrade: async (_, sub, score) => JSON.stringify({ score, version: sub.versionId }) },
  });
  return { assignment, submissions, notifications, get: () => route.GET(null, { params: { id: 'a1' } }), post: (action, confirm = true) => route.POST(new Request('https://fixture.invalid', { method: 'POST', body: JSON.stringify({ action, confirm }) }), { params: { id: 'a1' } }) };
}
test('roster contains every class member, excludes outsiders and hides raw answers', async () => {
  const result = await setup().get();
  assert.equal(result.status, 200); assert.equal(result.body.students.length, 5);
  assert.equal(result.body.students.find(s => s.studentId === 'absent').submitted, false);
  assert.equal(JSON.stringify(result).includes('Submitted answer'), false);
  assert.equal(result.body.students.find(s => s.studentId === 'released').published, true);
});
test('teacher ownership and authentication protect reads and mutations', async () => {
  for (const [role, status] of [[null, 401], ['student', 403], ['outsider', 403]]) {
    const h = setup(role); assert.equal((await h.get()).status, status); assert.equal((await h.post('collect')).status, status); assert.equal(h.assignment.status, 'published');
  }
});
test('collection requires confirmation, closes assignment, zeros only missing and preserves drafts', async () => {
  const h = setup(); assert.equal((await h.post('collect', false)).status, 400);
  const result = await h.post('collect'); assert.equal(result.body.changed, 2); assert.equal(h.assignment.status, 'closed');
  const draft = h.submissions.find(s => s.id === 's2'); assert.equal(draft.content, 'Preserve draft'); assert.equal(draft.answersJson, '{"q":"A"}'); assert.equal(draft.versionId, 1); assert.equal(draft.teacherScore, 0); assert.equal(draft.status, 'pending_release');
  assert.equal(h.submissions.find(s => s.id === 's1').teacherScore, null); assert.equal(h.submissions.find(s => s.id === 's3').teacherScore, 7); assert.equal(h.notifications.length, 0);
  assert.equal((await h.get()).body.students.find(s => s.studentId === 'draft').submitted, false);
  assert.equal((await h.post('collect')).body.changed, 0); assert.equal(h.submissions.length, 6);
});
test('bulk publication releases saved scores including zeros; skips ungraded and outsiders; repeat is idempotent', async () => {
  const h = setup(); await h.post('collect'); const result = await h.post('publish');
  assert.equal(result.body.changed, 3); assert.equal(h.notifications.length, 3);
  assert.equal(h.submissions.find(s => s.id === 's1').status, 'pending_grading'); assert.equal(h.submissions.find(s => s.id === 'outsider').status, 'pending_release');
  assert.equal(h.submissions.find(s => s.id === 's2').status, 'graded'); assert.equal((await h.post('publish')).body.changed, 0); assert.equal(h.notifications.length, 3);
});
test('simultaneous bulk publication serializes without duplicate notifications', async () => {
  const h = setup(); const results = await Promise.all([h.post('publish'), h.post('publish')]);
  assert.deepEqual(results.map(r => r.body.changed), [1, 0]); assert.equal(h.notifications.length, 1);
});
test('terminal submission wins over draft duplicate without deleting records', () => {
  const rows = roster.assignmentRoster([{ studentId: 's', student: { name: 'Fixture' } }], [{ id: 'draft', studentId: 's', status: 'draft' }, { id: 'real', studentId: 's', status: 'pending_grading' }]);
  assert.equal(rows[0].submissionId, 'real'); assert.equal(rows[0].submitted, true);
});

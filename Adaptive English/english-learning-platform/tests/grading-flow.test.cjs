const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function compile(file, dependencies = {}) {
  const mod = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2020 } }).outputText;
  new Function('require', 'module', 'exports', code)(id => {
    if (id in dependencies) return dependencies[id];
    throw new Error(`Unexpected dependency ${id}`);
  }, mod, mod.exports);
  return mod.exports;
}
const helper = compile('lib/assignmentGrading.ts');
const notificationHelper = compile('lib/notifications.ts');
const questions = [{ id: 'q1', prompt: 'Question?', options: [{ id: 'A', text: 'One' }, { id: 'B', text: 'Two' }], correctAnswer: 'A', explanation: 'SECRET_KEY' }, { id: 'q2', prompt: 'Second?', options: [{ id: 'A', text: 'One' }, { id: 'B', text: 'Two' }], correctAnswer: 'B' }];
function harness(role = 'teacher', overrides = {}) {
  const assignment = { id: 'a1', packId: 'p1', maxScore: 10, skill: 'reading', version: 1, title: 'Quiz', promptText: 'Choose', classroom: { teacherId: 'teacher', members: [{ studentId: 'student' }] }, ...overrides.assignment };
  let sub = { id: 'sub1', assignmentId: 'a1', studentId: 'student', status: 'pending_release', teacherScore: 5, teacherFeedback: 'SECRET_FEEDBACK', answersJson: '{"q1":"A","q2":"A"}', aiPreGradeJson: JSON.stringify({ source: 'automatic', questions }), assignment, student: { id: 'student', name: 'Controlled learner' }, ...overrides.submission };
  const writes = [], notifications = [];
  const prisma = {
    assignmentVersion: { findUnique: async () => overrides.difficulty ? { difficultyJson: JSON.stringify(overrides.difficulty), promptText: 'Original version prompt' } : null },
    assignment: { findUnique: async () => assignment, updateMany: async () => ({ count: assignment.status === "closed" || overrides.closeOnLock ? 0 : 1 }) },
    exercise: { findMany: async () => [{ dataJson: JSON.stringify(questions) }] },
    submission: {
      findUnique: async () => sub,
      findFirst: async () => overrides.existing || null,
      findMany: async () => [sub],
      create: async ({ data }) => { writes.push(data); return { id: 'new', ...data }; },
      update: async ({ data }) => { writes.push(data); sub = { ...sub, ...data }; return sub; },
    },
    notification: { create: async ({ data }) => { notifications.push(data); return data; } },
  };
  const deps = {
    '@/lib/audioStorage':{validateSubmissionAudio:async url=>url},
    '@/lib/assignmentAbility': require('./ability-test-loader.cjs').ability,
    'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status || 200 }) } },
    '@/lib/auth': { getCurrentUser: async () => ({ id: role, role: role === 'outsider' ? 'teacher' : role }) },
    '@/lib/prisma': { __esModule: true, default: prisma },
    '@/lib/assignmentGrading': helper,
    '@/lib/notifications': notificationHelper,
    '@/lib/aiEngine': { evaluateWritingTask: async () => ({ status: 'success', source: 'real', estimatedBand: '4.5', summary: 'Controlled AI evaluation' }) },
  };
  prisma.$transaction = async callback => callback(prisma);
  const grading = compile('app/api/grading/[submissionId]/route.ts', deps);
  const submissions = compile('app/api/submissions/route.ts', deps);
  const request = body => new Request('https://test.invalid', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return { writes, notifications, get: () => grading.GET(new Request('https://test.invalid'), { params: { submissionId: 'sub1' } }), grade: body => grading.POST(request(body), { params: { submissionId: 'sub1' } }), submit: body => submissions.POST(request({ assignmentId: 'a1', answers: { q1: 'A', q2: 'A' }, ...body })), list: () => submissions.GET(new Request('https://test.invalid?assignmentId=a1')) };
}
test('automatic score is proportional; open questions are not silently wrong', () => {
  assert.equal(helper.autoGrade(questions, { q1: 'A', q2: 'A' }, 20).score, 10);
  assert.equal(helper.autoGrade([{ id: 'essay' }], {}, 10), null);
  assert.equal(helper.autoGrade([], {}, 10), null);
  assert.equal(helper.autoGrade(questions, {}, 10), null);
});
test('teacher receives question choices and actual submitted answers', async () => {
  const result = await harness().get();
  assert.equal(result.body.submission.answers.q1, 'A');
  assert.equal(result.body.submission.questions[0].prompt, 'Question?');
  assert.equal(result.body.submission.automaticGrade.score, 5);
});
test('student cannot read unreleased marks, answer key, AI draft or comments', async () => {
  const h = harness('student');
  const result = await h.get();
  assert.equal(result.body.submission.teacherScore, null);
  assert.equal(result.body.submission.aiDraftGrade, null);
  assert.equal(result.body.submission.automaticGrade, null);
  assert.equal(JSON.stringify(result).includes('SECRET'), false);
  assert.equal((await h.list()).body.submissions[0].teacherScore, null);
});
test('released marks are visible to the student', async () => {
  assert.equal((await harness('student', { submission: { status: 'graded' } }).get()).body.submission.teacherScore, 5);
});
test('quiz submit computes score but holds release by default and saves snapshot', async () => {
  const h = harness('student'); const response = await h.submit({});
  assert.equal(response.body.status, 'pending_release');
  assert.equal(response.body.teacherScore, null);
  assert.equal(h.writes[0].teacherScore, 5);
  assert.equal(JSON.stringify(response).includes('correctAnswer'), false);
  assert.equal(JSON.parse(h.writes[0].aiPreGradeJson).questions.length, 2);
  assert.equal(h.notifications.length, 1);
  assert.equal(h.notifications[0].userId, 'teacher');
  assert.equal(h.notifications[0].type, 'submission');
});
test('immediate release returns server-computed grade, not a client score', async () => {
  const h = harness('student', { assignment: { releaseGradesImmediately: true } });
  const result = await h.submit({ teacherScore: 10 });
  assert.equal(result.body.status, 'graded'); assert.equal(result.body.teacherScore, 5);
});
test('drafts are never graded and invalid choices cannot be submitted', async () => {
  const h = harness('student');
  assert.equal((await h.submit({ isDraft: true })).body.status, 'draft');
  assert.equal(h.writes[0].teacherScore, undefined);
  assert.equal(h.notifications.length, 0);
  assert.equal((await h.submit({ answers: { q1: 'Z', q2: 'A' } })).status, 400);
});
test('manual save keeps score private and publication notifies student', async () => {
  const h = harness();
  assert.equal((await h.grade({ score: 7.5, feedback: 'Controlled feedback', publish: false })).body.submission.status, 'pending_release');
  assert.equal(h.notifications.length, 0);
  assert.equal((await h.grade({ score: 7.5, feedback: 'Controlled feedback', publish: true })).body.submission.status, 'graded');
  assert.equal(h.notifications.length, 1);
});
test('teacher ownership and numeric score boundaries are enforced', async () => {
  const h = harness('outsider');
  assert.equal((await h.get()).status, 403);
  assert.equal((await h.grade({ score: 5 })).status, 403);
  for (const score of [-1, 11, '', null]) assert.equal((await harness().grade({ score })).status, 400);
});
test('writing AI is a persisted reference, never automatically published', async () => {
  const h = harness('teacher', { assignment: { skill: 'writing' }, submission: { content: 'A controlled paragraph for testing.', aiPreGradeJson: null } });
  const result = await h.grade({ action: 'ai-grade' });
  assert.equal(result.body.draft.score, 5);
  assert.equal(h.writes[0].status, undefined);
  assert.equal(h.notifications.length, 0);
});
test('speaking AI explicitly blocks until real audio analysis is integrated', async () => {
  const h = harness('teacher', { assignment: { skill: 'speaking' } });
  assert.equal((await h.grade({ action: 'ai-grade' })).status, 422);
  assert.equal(h.writes.length, 0);
});

test('publication persists ability snapshot once; manual draft and AI draft do not', async () => {
  const difficulty = { status: 'assessed', source: 'ai', rating: 1200, maxScore: 10, skill: 'writing' };
  const h = harness('teacher', { difficulty, assignment: { skill: 'writing' }, submission: { versionId: 1 } });
  await h.grade({ score: 8, publish: false });
  assert.equal(h.writes.at(-1).abilityEvidenceJson, undefined);
  await h.grade({ score: 8, publish: true });
  const first = JSON.parse(h.writes.at(-1).abilityEvidenceJson);
  assert.equal(first.earnedRating, 960);
  await h.grade({ score: 10, publish: true });
  const revised = JSON.parse(h.writes.at(-1).abilityEvidenceJson);
  assert.equal(revised.earnedRating, 1200); assert.equal(revised.publishedAt, first.publishedAt);
});
test('immediate quiz release attaches ability; old submitted version keeps its scale', async () => {
  const difficulty = { status: 'assessed', source: 'ai', rating: 1200, maxScore: 10, skill: 'reading' };
  const h = harness('student', { difficulty, assignment: { releaseGradesImmediately: true } });
  assert.equal((await h.submit({})).body.status, 'graded');
  assert.equal(JSON.parse(h.writes.at(-1).abilityEvidenceJson).earnedRating, 600);
  const old = harness('teacher', { difficulty, assignment: { maxScore: 20, version: 2 }, submission: { versionId: 1 } });
  assert.equal((await old.grade({ score: 11 })).status, 400);
  assert.equal((await old.grade({ score: 8 })).status, 200);
  assert.equal(JSON.parse(old.writes.at(-1).abilityEvidenceJson).earnedRating, 960);
});
test('additive migration preserves an existing assignment in isolated SQLite memory', () => {
  const { DatabaseSync } = require('node:sqlite'); const db = new DatabaseSync(':memory:');
  db.exec('CREATE TABLE Assignment (id TEXT PRIMARY KEY); INSERT INTO Assignment(id) VALUES (\'controlled\');');
  db.exec(fs.readFileSync(path.join(__dirname, '../prisma/migrations/20261012090000_grade_release/migration.sql'), 'utf8'));
  assert.equal(db.prepare('SELECT releaseGradesImmediately FROM Assignment WHERE id = ?').get('controlled').releaseGradesImmediately, 0);
  db.close();
});

test('closed assignment rejects final submission and drafts without writes', async () => {
  for (const isDraft of [true, false]) {
    const h = harness('student', { assignment: { status: 'closed' } });
    assert.equal((await h.submit({ isDraft })).status, 409); assert.equal(h.writes.length, 0);
  }
});
test('zero for missing submission does not produce quiz or AI grades', async () => {
  const h = harness('teacher', { assignment: { skill: 'writing' }, submission: { aiPreGradeJson: JSON.stringify({ source: 'missing-submission' }), teacherScore: 0 } });
  assert.equal((await h.get()).body.submission.automaticGrade, null);
  assert.equal((await h.get()).body.submission.aiDraftGrade, null);
  assert.equal((await h.grade({ action: 'ai-grade' })).status, 400);
});

test('collection wins after initial read: transaction rejects draft and final writes', async () => {
  for (const isDraft of [true, false]) {
    const h = harness('student', { closeOnLock: true });
    assert.equal((await h.submit({ isDraft })).status, 409);
    assert.equal(h.writes.length, 0);
  }
});

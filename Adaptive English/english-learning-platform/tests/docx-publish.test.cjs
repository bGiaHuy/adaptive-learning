const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

function harness({ owner = 'teacher-1', failVersion = false } = {}) {
  const committed = [];
  const prisma = {
    classroom: { findUnique: async () => ({ teacherId: owner }) },
    $transaction: async (fn) => {
      const pending = [];
      const model = (name) => ({ create: async ({ data }) => {
        if (name === 'version' && failVersion) throw new Error('controlled transaction failure');
        const result = { id: `${name}-${pending.length}`, ...data };
        pending.push({ name, data: result });
        return result;
      } });
      const result = await fn({
        thematicPack: model('pack'), exercise: model('exercise'),
        assignment: model('assignment'), assignmentVersion: model('version'),
        classroomMember: { findMany: async () => [{ studentId: 'student-1' }] },
        notification: model('notification'),
        vocabularyItem: { createMany: async ({ data }) => pending.push({ name: 'vocabulary', data }) },
      });
      committed.push(...pending);
      return result;
    },
  };
  const source = fs.readFileSync(require('node:path').join(__dirname, '../src/app/api/teacher/import-docx/route.ts'), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', compiled)((id) => {
    if (id === 'next/server') return { NextResponse: { json: (body, options) => ({ body, status: options?.status || 200 }) } };
    if (id === '@/lib/assignmentAbility') return { assessAssignmentDifficulty: () => { throw Error('Publication must not query AI'); } };
    if (id === '@/lib/prisma') return { __esModule: true, default: prisma };
    if (id === '@/lib/auth') return { getCurrentUser: async () => ({ id: 'teacher-1', role: 'teacher' }) };
    if (id === '@/lib/assignmentAttachments') return require('./ability-test-loader.cjs').load('lib/assignmentAttachments.ts',{'adm-zip':require('adm-zip')});
    if (id === '@/lib/documentImport') return {};
    if (id === '@/lib/importAssessment') return { verifyImportAssessment: () => null };
    if (id === '@/lib/notifications') {
      const helper = { exports: {} };
      const code = ts.transpileModule(fs.readFileSync(require('node:path').join(__dirname, '../src/lib/notifications.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
      new Function('module', 'exports', code)(helper, helper.exports);
      return helper.exports;
    }
    return require(id);
  }, mod, mod.exports);
  const publish = (exercises = [{ title: 'Test', questions: [
    { id: 'q1', prompt: 'Test question', correctAnswer: 'B', isApproved: true },
    { id: 'q2', prompt: 'Unapproved', isApproved: false },
  ] }]) => mod.exports.POST(new Request('https://test.invalid/api/teacher/import-docx', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action: 'publish', classId: 'controlled-class', title: 'Controlled test', exercises,
      vocabulary: [{ word: 'test', meaning: 'kiểm thử' }] }),
  }));
  return { committed, publish };
}

test('publish persists approved payload and links assignment to its new pack/exercise/version', async () => {
  const h = harness();
  const response = await h.publish();
  assert.equal(response.status, 200);
  assert.equal(response.body.publishedQuestionsCount, 1);
  const exercise = h.committed.find(x => x.name === 'exercise').data;
  assert.deepEqual(JSON.parse(exercise.dataJson).map(x => x.id), ['q1']);
  const assignment = h.committed.find(x => x.name === 'assignment').data;
  assert.equal(assignment.packId, response.body.packId);
  assert.deepEqual(JSON.parse(assignment.selectedExerciseIdsJson), [exercise.id]);
  assert.equal(h.committed.find(x => x.name === 'version').data.assignmentId, assignment.id);
  assert.equal(h.committed.find(x => x.name === 'vocabulary').data[0].packId, assignment.packId);
  const notification = h.committed.find(x => x.name === 'notification').data;
  assert.equal(notification.userId, 'student-1');
  assert.equal(notification.id, `assignment:${assignment.id}:student-1:controlled-class`);
});
test('ownership failure writes nothing', async () => {
  const h = harness({ owner: 'other-teacher' });
  assert.equal((await h.publish()).status, 403);
  assert.equal(h.committed.length, 0);
});
test('empty approved set writes nothing', async () => {
  const h = harness();
  assert.equal((await h.publish([])).status, 400);
  assert.equal(h.committed.length, 0);
});
test('transaction failure returns error and commits nothing in isolated transaction mock', async () => {
  const h = harness({ failVersion: true });
  assert.equal((await h.publish()).status, 500);
  assert.equal(h.committed.length, 0);
});

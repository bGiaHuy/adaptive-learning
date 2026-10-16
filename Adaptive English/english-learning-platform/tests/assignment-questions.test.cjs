const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
test('student assignment returns saved choices without answer key or explanations', async () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/app/api/assignments/[id]/route.ts'), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
  const mod = { exports: {} };
  let query;
  const prisma = {
    assignment: { findUnique: async () => ({ id: 'a1', packId: 'p1', selectedExerciseIdsJson: '["e1"]',
      classroom: { teacherId: 't1', members: [{ studentId: 's1' }] }, versions: [], submissions: [] }) },
    exercise: { findMany: async (args) => { query = args; return [{ id: 'e1', title: 'Quiz', instruction: 'Choose',
      dataJson: JSON.stringify([{ id: 'q1', prompt: 'Question?', options: [{ id: 'A', text: 'Choice' }], correctAnswer: 'A', explanation: 'SECRET EXPLANATION' }]) }]; } },
  };
  new Function('require', 'module', 'exports', code)((id) => {
    if (id === 'next/server') return { NextResponse: { json: body => body } };
    if (id === '@/lib/assignmentAttachments') return {};
    if (id === '@/lib/assignmentAbility') return require('./ability-test-loader.cjs').ability;
    if (id === '@/lib/prisma') return { __esModule: true, default: prisma };
    if (id === '@/lib/auth') return { getCurrentUser: async () => ({ id: 's1', role: 'student' }) };
    if (id === '@/lib/assignmentGrading') {
      const helper = { exports: {} };
      const helperCode = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/lib/assignmentGrading.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
      new Function('module', 'exports', helperCode)(helper, helper.exports);
      return helper.exports;
    }
    throw new Error(id);
  }, mod, mod.exports);
  const response = await mod.exports.GET(new Request('https://test.invalid'), { params: { id: 'a1' } });
  assert.equal(response.assignment.exercises[0].questions[0].prompt, 'Question?');
  assert.equal(response.assignment.exercises[0].questions[0].options[0].text, 'Choice');
  assert.equal(JSON.stringify(response).includes('correctAnswer'), false);
  assert.equal(JSON.stringify(response).includes('SECRET EXPLANATION'), false);
  assert.deepEqual(query.where, { packId: 'p1', id: { in: ['e1'] } });
});

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function route(file, prisma, extras = {}) {
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/app/api', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', code)(id => {
    if (id === '@/lib/assignmentAbility') return require('./ability-test-loader.cjs').ability;
    if (id === 'next/server') return { NextResponse: { json: (body, options) => ({ body, status: options?.status || 200 }) } };
    if (id === '@/lib/auth') return { getCurrentUser: async () => ({ id: 's1', role: 'student' }) };
    if (id === '@/lib/prisma') return { __esModule: true, default: prisma };
    if (extras[id]) return extras[id];
    throw new Error(id);
  }, mod, mod.exports);
  return mod.exports;
}
test('progress uses scored vocabulary and decimal writing band; pending work stays unscored', async () => {
  const p = {
    studentSkillProfile: { findMany: async () => [
      { skill: 'writing', evidenceCount: 1, scoreDisplay: 'AI Band 4.5/9', independentRate: 100 },
      { skill: 'vocabulary', evidenceCount: 1, scoreDisplay: '8/10 câu đúng', independentRate: 100 },
    ] },
    userVocab: { findMany: async () => [] },
    vocabReviewHistory: { findMany: async () => [{ userVocabId: 'v1' }] },
    submission: { findMany: async () => [{ status: 'pending_grading', teacherScore: null, assignment: { skill: 'speaking', maxScore: 10 } }] },
    lessonAttempt: { findMany: async () => [] },
  };
  const { body } = await route('student/progress/route.ts', p).GET();
  assert.equal(body.skills.writing.level, 'A2');
  assert.equal(body.skills.vocabulary.evaluated, true);
  assert.equal(body.skills.vocabulary.evidenceCount, 2);
  assert.equal(body.skills.speaking.evaluated, false);
  assert.equal(body.skills.speaking.evidenceCount, 1);
});
test('review rejects another learner card and inactive saved card', async () => {
  let card = { userId: 's2', state: 'learning' };
  const p = { userVocab: { findUnique: async () => card } };
  const handler = route('vocab/review/route.ts', p, { '@/lib/fsrs': { LABEL_TO_RATING: { good: 3 } } });
  const request = () => new Request('https://test.invalid', { method: 'POST', body: JSON.stringify({ userVocabId: 'v1', rating: 'good' }) });
  assert.equal((await handler.POST(request())).status, 404);
  card = { userId: 's1', state: 'saved' };
  assert.equal((await handler.POST(request())).status, 400);
});
test('review persists scheduled card and history atomically', async () => {
  let update, history, batch;
  const p = {
    userVocab: { findUnique: async () => ({ userId: 's1', state: 'learning' }), update: args => { update = args; return { id: 'v1', ...args.data }; } },
    vocabReviewHistory: { create: args => { history = args; return { id: 'h1', ...args.data }; } },
    $transaction: async entries => { batch = entries; return entries; },
  };
  const next = new Date('2026-10-13T03:00:00Z');
  const handler = route('vocab/review/route.ts', p, { '@/lib/fsrs': { LABEL_TO_RATING: { good: 3 }, RATING_TO_LABEL: { 3: 'good' }, calculateFSRS: () => ({ nextState: 'reviewing', nextStability: 2, nextDifficulty: 5, intervalDays: 1, nextReviewDate: next, reps: 1, lapses: 0 }) } });
  const result = await handler.POST(new Request('https://test.invalid', { method: 'POST', body: JSON.stringify({ userVocabId: 'v1', rating: 'good' }) }));
  assert.equal(result.status, 200);
  assert.equal(batch.length, 2);
  assert.equal(update.data.nextReviewDate, next);
  assert.equal(history.data.userId, 's1');
});

test('completed scored lesson is persisted and immediately reflected in progress', async () => {
  let attempt;
  const p = {
    lessonAttempt: { findUnique: async () => null, upsert: async ({ create }) => { attempt = create; return create; }, findMany: async () => attempt ? [attempt] : [] },
    studentSkillProfile: { findMany: async () => [] }, userVocab: { findMany: async () => [] }, vocabReviewHistory: { findMany: async () => [] }, submission: { findMany: async () => [] },
  };
  const handler = route('student/progress/route.ts', p);
  const body = { id: 'controlled-attempt', lessonId: 'lesson1', lessonTitle: 'Reading', skill: 'reading', score: 4, total: 5, timestamp: new Date().toISOString() };
  assert.equal((await handler.POST(new Request('https://test.invalid', { method: 'POST', body: JSON.stringify(body) }))).status, 200);
  const result = await handler.GET();
  assert.equal(result.body.skills.reading.evaluated, true);
  assert.equal(result.body.skills.reading.level, 'B1');
  assert.equal(result.body.stats.totalLessonAttempts, 1);
  await handler.POST(new Request('https://test.invalid', { method: 'POST', body: JSON.stringify({ ...body, score: null }) }));
  assert.equal(attempt.assessmentStatus, 'completion_only');
});

test('adding dictionary card activates immediately without resetting an existing reviewed card', async () => {
  const helperCode = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/lib/cardQuality.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const mod = { exports: {} }; new Function('module', 'exports', helperCode)(mod, mod.exports);
  const quality = mod.exports;
  assert.equal(quality.isUsableCard({ word: 'A', meaning: 'B' }), false);
  assert.equal(quality.isUsableCard({ word: 'a', meaning: 'một', dictionarySenseId: 1 }), true);
  let existing = null, write;
  const p = {
    vocabularyItem: { upsert: async () => ({ id: 'v1' }) },
    userVocab: { findUnique: async () => existing, upsert: async args => { write = args; return { id: 'u1', ...args.create }; } },
  };
  p.$transaction = async fn => fn(p);
  const handler = route('vocab/route.ts', p, {
    '@/lib/cardQuality': quality, '@/lib/dictionary': { getDictionarySense: () => ({ entry: { id: 1, word: 'easy', pronunciations: [] }, sense: { id: 1, partOfSpeech: 'adjective', definition: 'dễ' } }), dictionaryAttribution: {} },
    '@/lib/vocabulary': { mapPersonalWord: x => x }, '@/lib/learning': {}, '@/lib/dailyVocabulary': {},
  });
  const request = () => new Request('https://test.invalid', { method: 'POST', body: JSON.stringify({ dictionarySenseId: 1 }) });
  assert.equal((await handler.POST(request())).status, 200);
  assert.equal(write.create.state, 'learning');
  assert.ok(write.create.nextReviewDate instanceof Date);
  existing = { state: 'reviewing' }; await handler.POST(request());
  assert.deepEqual(write.update, {});
  existing = { state: 'saved' }; await handler.POST(request());
  assert.equal(write.update.state, 'learning');
});

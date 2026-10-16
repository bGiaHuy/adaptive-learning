const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { DatabaseSync } = require('node:sqlite');
test('additive placement schema preserves existing users and supports draft storage', () => {
  const db = new DatabaseSync(':memory:');
  db.exec('CREATE TABLE "User" (id TEXT PRIMARY KEY); INSERT INTO "User" VALUES (\'controlled-user\');');
  db.exec(fs.readFileSync(path.join(__dirname, '../prisma/migrations/20261012093000_placement_attempt_postgres/migration.sql'), 'utf8'));
  assert.equal(db.prepare('SELECT count(*) AS n FROM "User"').get().n, 1);
  assert.equal(db.prepare('PRAGMA table_info("PlacementAttempt")').all().length, 14);
  db.close();
});
test('placement completion saves answers and six profiles without requiring successful AI scoring', async () => {
  const profiles = [];
  let attempt;
  const prisma = {
    placementAttempt: {
      upsert: async ({ create }) => { attempt = { id: 'controlled-attempt', ...create, updatedAt: new Date() }; return attempt; },
      update: async ({ data }) => { Object.assign(attempt, data); return attempt; },
    },
    studentSkillProfile: { upsert: async ({ create }) => { profiles.push(create); return create; } },
  };
  const mod = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/app/api/placement/route.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
  const dependencies = {
    'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status || 200 }) } },
    '@/lib/prisma': { __esModule: true, default: prisma }, '@/lib/auth': { getCurrentUser: async () => ({ id: 'controlled-user', role: 'student' }) },
    '@/lib/placementQuestions': { PLACEMENT_VERSION: 1, placementQuestions: ['reading','listening','grammar','vocabulary'].map(section => ({ id: section, section, correct: 'A' })) },
    '@/lib/aiEngine': { evaluateWritingTask: async () => ({ status: 'error', estimatedBand: 'N/A', reason: 'Controlled provider unavailable' }) },
  };
  new Function('require','module','exports',code)(id=>dependencies[id], mod, mod.exports);
  const result = await mod.exports.POST(new Request('https://test.invalid', { method: 'POST', body: JSON.stringify({ readingAnswers: { reading: 'A' }, listeningAnswers: { listening: 'A' }, grammarAnswers: { grammar: 'A' }, vocabAnswers: { vocabulary: 'A' }, completed: true }) }));
  assert.equal(result.status, 200);
  assert.equal(result.body.completed, true);
  assert.equal(profiles.length, 6);
  assert.equal(attempt.status, 'completed');
  assert.equal(JSON.parse(attempt.readingAnswersJson).reading, 'A');
  assert.equal(profiles.find(x=>x.skill === 'writing').evidenceCount, 0);
});

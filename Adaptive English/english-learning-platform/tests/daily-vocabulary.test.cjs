const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function load(file) {
  const full = path.resolve(__dirname, file);
  const code = ts.transpileModule(fs.readFileSync(full, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} };
  new Function('module', 'exports', 'require', code)(mod, mod.exports, id => id.startsWith('.') ? load(path.relative(__dirname, path.resolve(path.dirname(full), `${id}.ts`))) : require(id));
  return mod.exports;
}
const { dailyPlan, ensureDailyVocabulary } = load('../src/lib/dailyVocabulary.ts');
const now = new Date('2026-10-12T03:00:00Z');
const row = (word, extra = {}) => ({ id: word, state: 'learning', vocabItem: { word }, nextReviewDate: now, ...extra });
test('daily target respects finite limits and never uses unlimited as a minimum', () => {
  assert.equal(dailyPlan([], 5, now).missing, 5);
  assert.equal(dailyPlan([], 9999, now).missing, 10);
  assert.equal(dailyPlan([], 0, now).missing, 0);
});
test('due cards and completed work count once per distinct term; no endless refill', () => {
  const rows = Array.from({ length: 10 }, (_, i) => row(`word${i}`, { lastReviewedAt: now, nextReviewDate: new Date('2026-11-01') }));
  assert.equal(dailyPlan(rows, 10, now).missing, 0);
  assert.equal(dailyPlan([row('easy'), row('EASY')], 10, now).missing, 9);
});
test('day boundary uses Saigon rather than UTC', () => {
  const rows = [row('easy', { activatedAt: new Date('2026-10-12T16:59:00Z'), nextReviewDate: new Date('2026-11-01') })];
  assert.equal(dailyPlan(rows, 10, new Date('2026-10-12T17:01:00Z')).missing, 10);
});
function mock(rows = []) {
  const items = new Map();
  const tx = {
    userVocab: {
      findMany: async () => rows,
      update: async ({ where, data }) => Object.assign(rows.find(r => r.id === where.id), data),
      upsert: async ({ create }) => {
        const existing = rows.find(r => r.vocabId === create.vocabId);
        if (existing) return existing;
        const result = { ...create, id: `uv${rows.length}`, vocabItem: items.get(create.vocabId) };
        rows.push(result); return result;
      },
    },
    vocabularyItem: {
      findMany: async () => [],
      upsert: async ({ create }) => { items.set(create.id, create); return create; },
    },
  };
  return { rows, prisma: { $transaction: async callback => callback(tx) } };
}
test('empty shelf gets 10 persisted active cards; repeated preparation adds none', async () => {
  const { rows, prisma } = mock();
  assert.equal((await ensureDailyVocabulary(prisma, { id: 's1', vocabDailyLimit: 10 }, now)).added, 10);
  assert.equal(rows.length, 10);
  assert.ok(rows.every(r => r.state === 'learning' && r.activatedAt === now));
  assert.equal((await ensureDailyVocabulary(prisma, { id: 's1', vocabDailyLimit: 10 }, now)).added, 0);
});
test('saved vocabulary has priority; respects maximum new activations', async () => {
  const { rows, prisma } = mock([row('custom', { state: 'saved', nextReviewDate: null })]);
  const result = await ensureDailyVocabulary(prisma, { id: 's1', vocabDailyLimit: 5 }, now);
  assert.equal(result.added, 5);
  assert.equal(rows[0].state, 'learning');
});
test('serialization conflict retries without claiming a failed write succeeded', async () => {
  const { prisma } = mock(); const original = prisma.$transaction; let calls = 0;
  prisma.$transaction = async callback => { if (++calls === 1) throw Object.assign(new Error('conflict'), { code: 'P2034' }); return original(callback); };
  assert.equal((await ensureDailyVocabulary(prisma, { id: 's1', vocabDailyLimit: 5 }, now)).added, 5);
  assert.equal(calls, 2);
});
test('read-only dictionary supplies Vietnamese definitions without known terms', () => {
  const { recommendDictionary } = load('../src/lib/dictionary.ts');
  const result = recommendDictionary(['abc'], 10);
  assert.equal(result.length, 10);
  assert.ok(result.every(r => r.entry.word !== 'abc' && r.sense.definitionLang === 'vi' && r.sense.definition));
});
test('dictionary lookup fills the easy gap with attributed original content', async () => {
  const full = path.resolve(__dirname, '../src/app/api/dictionary/route.ts');
  const code = ts.transpileModule(fs.readFileSync(full, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', code)(id => {
    if (id === 'next/server') return { NextResponse: { json: body => body } };
    if (id === '@/lib/dictionary') return { lookupDictionary: () => null };
    if (id === '@/lib/dailyVocabulary') return load('../src/lib/dailyVocabulary.ts');
    throw new Error(id);
  }, mod, mod.exports);
  const result = await mod.exports.GET(new Request('https://test.invalid/api/dictionary?q=easy'));
  assert.equal(result.entry.senses[0].definition, 'dễ');
  assert.match(result.attribution.name, /Adaptive English/);
});

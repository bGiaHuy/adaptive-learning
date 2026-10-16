const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const mod = { exports: {} };
const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/lib/placementSync.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
new Function('module', 'exports', code)(mod, mod.exports);
test('new accounts and navigation-only placement state have no edits to autosave', () => {
  assert.equal(mod.exports.hasPlacementInput({}), false);
  assert.equal(mod.exports.hasPlacementInput({ readingAnswers: {}, writingAnswer: '  ', currentStep: 4 }), false);
});
test('real answers and writing edits trigger autosave eligibility', () => {
  assert.equal(mod.exports.hasPlacementInput({ readingAnswers: { q1: 'A' } }), true);
  assert.equal(mod.exports.hasPlacementInput({ writingAnswer: 'My answer.' }), true);
});
test('hydration does not queue writes and remote errors do not set browser-storage flag', () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/lib/store.tsx'), 'utf8');
  assert.equal(source.includes('if (!pState.completed) queuePlacementDraft(pState)'), false);
  const save = source.slice(source.indexOf('const savePlacementDraft'), source.indexOf('const queuePlacementDraft'));
  assert.ok(save.includes("currentUser.role !== 'student'"));
  assert.ok(save.includes('setPlacementSyncError(true)'));
  assert.equal(save.includes('setStorageError'), false);
});

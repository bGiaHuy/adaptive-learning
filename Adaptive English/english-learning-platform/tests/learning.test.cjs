const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
// Exercise the production pure functions without adding a test framework dependency.
const source = fs.readFileSync(path.join(__dirname, '../src/lib/learning.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const customRequire = (id) => {
  if (id === './fsrs') {
    const fsrsSrc = fs.readFileSync(path.join(__dirname, '../src/lib/fsrs.ts'), 'utf8');
    const fsrsCompiled = ts.transpileModule(fsrsSrc, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
    const fsrsTarget = { exports: {} };
    new Function('module', 'exports', 'require', fsrsCompiled)(fsrsTarget, fsrsTarget.exports, require);
    return fsrsTarget.exports;
  }
  return require(id);
};
const target = { exports: {} };
new Function('module', 'exports', 'require', compiled)(target, target.exports, customRequire);
const { isWordDue, reviewWord, checkAnswer } = target.exports;
const now = new Date('2026-10-08T03:00:00Z');
const word = { id: 'w', state: 'reviewing', nextReviewDate: 'Hôm nay', intervalDays: 10, recallSuccessDays: 1 };

test('due queue excludes saved and future cards, includes overdue mastered cards', () => {
  assert.equal(isWordDue(word, now), true);
  assert.equal(isWordDue({ ...word, state: 'saved' }, now), false);
  assert.equal(isWordDue({ ...word, dueAt: '2026-10-09T03:00:00Z' }, now), false);
  assert.equal(isWordDue({ ...word, state: 'mastered', dueAt: '2026-10-07T03:00:00Z' }, now), true);
});
test('successful repeats on one day do not count as multiple recall days', () => {
  const first = reviewWord(word, 'good', now);
  const second = reviewWord(first, 'good', now);
  assert.equal(first.recallSuccessDays, 2);
  assert.equal(second.recallSuccessDays, 2);
  assert.notEqual(second.state, 'mastered');
  assert.equal(isWordDue(first, now), false);
});
test('forgetting resets success evidence and returns mastered cards to relearning', () => {
  const result = reviewWord({ ...word, state: 'mastered', recallSuccessDays: 4 }, 'again', now);
  assert.equal(result.state, 'relearning');
  assert.equal(result.recallSuccessDays, 0);
});
test('matching requires all actual pairs; blank and wrong pairs are not accepted', () => {
  const question = { type: 'match_pairs', pairs: [{ left: 'a', right: '1' }, { left: 'b', right: '2' }] };
  assert.equal(checkAnswer(question, {}), false);
  assert.equal(checkAnswer(question, { a: '2', b: '1' }), false);
  assert.equal(checkAnswer(question, { a: '1', b: '2' }), true);
});
test('multi-select requires exactly the expected set and open responses are not auto-correct', () => {
  assert.equal(checkAnswer({ type: 'multi_select', correctAnswer: ['a', 'b'] }, ['b', 'a']), true);
  assert.equal(checkAnswer({ type: 'multi_select', correctAnswer: ['a', 'b'] }, ['a', 'a']), false);
  assert.equal(checkAnswer({ type: 'writing', correctAnswer: '' }, ''), false);
});

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function load(file) {
  const full = path.resolve(__dirname, file);
  const code = ts.transpileModule(fs.readFileSync(full, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const module = { exports: {} };
  new Function('module', 'exports', 'require', code)(module, module.exports, id => id.startsWith('.') ? load(path.relative(__dirname, path.resolve(path.dirname(full), `${id}.ts`))) : require(id));
  return module.exports;
}
const { getSkillChartData, getSkillProgressChartData } = load('../src/lib/skillChart.ts');
const { placementQuestions } = load('../src/lib/placementQuestions.ts');
const empty = () => ({ completed: false, currentStep: 1, readingAnswers: {}, listeningAnswers: {}, grammarAnswers: {} });
test('stale CEFR without scored evidence is never plotted', () => {
  assert.equal(getSkillProgressChartData({ reading: { level: 'B1', evaluated: false, evidenceCount: 2 } })[0].radius, null);
  assert.equal(getSkillProgressChartData({ reading: { level: 'B1', evaluated: true, evidenceCount: 0 } })[0].radius, null);
});
function section(state, skill, correct) {
  placementQuestions.filter(q => q.section === skill).forEach((q, index) => {
    state[`${skill}Answers`][q.id] = index < correct ? q.correct : q.options.find(option => option.id !== q.correct).id;
  });
}
test('Missing or partial evidence never becomes zero or a plotted level', () => {
  const state = empty();
  assert.ok(getSkillChartData(state).every(skill => skill.level === null && skill.radius === null));
  const q = placementQuestions[0];
  state[`${q.section}Answers`][q.id] = q.correct;
  assert.equal(getSkillChartData(state).find(skill => skill.key === q.section).answered, 1);
  assert.ok(getSkillChartData(state).every(skill => skill.percentage === null));
});
test('Completed sections use the same placement thresholds while other skills remain unknown', () => {
  const state = empty();
  section(state, 'reading', 8); section(state, 'listening', 5); section(state, 'grammar', 0);
  const skills = getSkillChartData(state);
  assert.deepEqual(skills.filter(s => s.percentage !== null).map(s => [s.key, s.percentage, s.level]), [['reading', 80, 'B1'], ['listening', 50, 'A2'], ['grammar', 0, 'A1']]);
  assert.ok(skills.filter(s => !s.total).every(s => s.level === null));
  const q = placementQuestions.find(q => q.section === 'reading');
  state.readingAnswers[q.id] = 'invalid-option';
  assert.equal(getSkillChartData(state)[0].level, null);
});

test('Progress chart uses real skill estimates and keeps unscored evidence visible without inventing CEFR', () => {
  const estimates = {
    reading: { level: 'A2', scoreDisplay: '60% trung bình · 2 nguồn bằng chứng', confidence: 75, evidenceCount: 2, evaluated: true, independentRate: 90 },
    writing: { level: 'Chưa đánh giá', scoreDisplay: '1 bài đã hoàn thành · Chưa có điểm đánh giá', confidence: 0, evidenceCount: 1, evaluated: false, independentRate: 100 },
    vocabulary: { level: 'Chưa đánh giá', scoreDisplay: '4 từ đã ôn · 7 lượt ôn', confidence: 0, evidenceCount: 7, evaluated: false, independentRate: 0 },
  };
  const chart = getSkillProgressChartData(estimates);
  assert.equal(chart.find(skill => skill.key === 'reading').radius, 2);
  assert.equal(chart.find(skill => skill.key === 'writing').radius, null);
  assert.equal(chart.find(skill => skill.key === 'writing').evidenceCount, 1);
  assert.equal(chart.find(skill => skill.key === 'vocabulary').scoreDisplay, '4 từ đã ôn · 7 lượt ôn');
  assert.equal(chart.find(skill => skill.key === 'speaking').scoreDisplay, 'Chưa có dữ liệu thật');
});

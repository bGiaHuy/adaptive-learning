const fs = require('fs');
const ts = require('typescript');

const content = fs.readFileSync('src/lib/mockData.ts', 'utf8');
const compiled = ts.transpileModule(content, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
}).outputText;

const mod = { exports: {} };
new Function('module', 'exports', 'require', compiled)(mod, mod.exports, require);

const lessons = mod.exports.initialLessons || [];
console.log('Total initialLessons:', lessons.length);

const gradeSummary = {};
let totalQ = 0;
let readyQ = 0;
let draftQ = 0;

lessons.forEach(l => {
  const g = l.courseTitle || 'Other';
  if (!gradeSummary[g]) gradeSummary[g] = { lessons: 0, questions: 0, bySkill: {} };
  gradeSummary[g].lessons++;
  const qCount = (l.questions || []).length;
  gradeSummary[g].questions += qCount;
  gradeSummary[g].bySkill[l.skill] = (gradeSummary[g].bySkill[l.skill] || 0) + qCount;
  totalQ += qCount;
  if (l.status === 'ready') readyQ += qCount;
  else draftQ += qCount;
});

console.log('\n=== CURRENT CURRICULUM AUDIT ===');
Object.keys(gradeSummary).forEach(g => {
  console.log(`\n${g}:`);
  console.log(`  Lessons: ${gradeSummary[g].lessons}, Questions: ${gradeSummary[g].questions}`);
  console.log(`  By Skill:`, gradeSummary[g].bySkill);
});

console.log(`\nTOTAL QUESTIONS: ${totalQ} (Ready: ${readyQ}, Draft/In Prep: ${draftQ})`);

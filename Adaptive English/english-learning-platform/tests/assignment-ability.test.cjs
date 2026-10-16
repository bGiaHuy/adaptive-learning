const {test}=require('node:test'),assert=require('node:assert/strict');
const {load,ability:a}=require('./ability-test-loader.cjs');
const difficulty={status:'assessed',source:'ai',rating:1200,skill:'writing',maxScore:10};
test('additive ability migration preserves historical assignments and submissions',()=>{
 const {DatabaseSync}=require('node:sqlite'),fs=require('fs'),path=require('path');const d=new DatabaseSync(':memory:');
 d.exec("CREATE TABLE AssignmentVersion(id TEXT PRIMARY KEY); CREATE TABLE Submission(id TEXT PRIMARY KEY,teacherScore REAL); INSERT INTO AssignmentVersion VALUES('v1'); INSERT INTO Submission VALUES('s1',8.5);");
 d.exec(fs.readFileSync(path.join(__dirname,'../prisma/migrations/20261012_assignment_ability/migration.sql'),'utf8'));
 assert.equal(d.prepare('SELECT difficultyJson FROM AssignmentVersion').get().difficultyJson,null);assert.equal(d.prepare('SELECT teacherScore FROM Submission').get().teacherScore,8.5);assert.equal(d.prepare('SELECT abilityEvidenceJson FROM Submission').get().abilityEvidenceJson,null);d.close();
});
function db(d=difficulty){return {assignmentVersion:{findUnique:async({where})=>{assert.equal(where.assignmentId_version.version,1);return {difficultyJson:JSON.stringify(d)}}}}}
function sub(json,overrides={}){return {id:'s1',assignmentId:'a1',versionId:1,status:'graded',teacherScore:8,abilityEvidenceJson:json,...overrides}}
test('8/10 times 1200 gives960; prior1200 updates to1152',async()=>{
 const json=await a.abilityEvidenceForGrade(db(),sub(null),8),e=a.readAbilityEvidence(sub(json));
 assert.equal(e.earnedRating,960);assert.equal(a.combineAbility(1200,[e]),1152);assert.equal(a.combineAbility(null,[e]),960);
});
test('non10 scales normalize proportionally and invalid scores are rejected',async()=>{
 const json=await a.abilityEvidenceForGrade(db({...difficulty,maxScore:20}),sub(null),16);
 assert.equal(JSON.parse(json).earnedRating,960);await assert.rejects(()=>a.abilityEvidenceForGrade(db(),sub(null),11));
});
test('regrade replaces evidence and retains original order; duplicate request never compounds',async()=>{
 const original=await a.abilityEvidenceForGrade(db(),sub(null),8);
 const revised=await a.abilityEvidenceForGrade(db(),sub(original),10);
 assert.equal(JSON.parse(revised).publishedAt,JSON.parse(original).publishedAt);
 const e=a.readAbilityEvidence(sub(revised,{teacherScore:10}));assert.equal(a.combineAbility(1200,[e,e]),1200);
});
test('only released, matching version and matching final score contribute; stale metadata ignored',async()=>{
 const json=await a.abilityEvidenceForGrade(db(),sub(null),8);
 for(const extra of [{status:'pending_release'},{status:'draft'},{versionId:2},{teacherScore:9}])assert.equal(a.readAbilityEvidence(sub(json,extra)),null);
 assert.equal(a.readAbilityEvidence(sub('{bad')),null);
 assert.equal(await a.abilityEvidenceForGrade(db(null),sub(null),8),null);
});
test('AI result is validated; errors, missing provider, disabled AI do not fabricate rating',async()=>{
 const input={title:'Essay',promptText:'Describe your school.',skill:'writing',maxScore:10};
 let calls=0;const make=result=>load('lib/assignmentAbility.ts',{'./aiEngine':{requestMwapiJson:async()=>{calls++;if(result instanceof Error)throw result;return result}}});
 assert.equal((await make({rating:1200,confidence:80,rationale:'B1 vocabulary'}).assessAssignmentDifficulty(input)).rating,1200);
 for(const result of [{rating:9999,confidence:80,rationale:'bad'},{rating:'1200',confidence:80,rationale:'bad'},new Error('provider')])assert.equal((await make(result).assessAssignmentDifficulty(input)).status,'unavailable');
 const before=calls;assert.equal((await make({}).assessAssignmentDifficulty(input,false)).status,'unavailable');assert.equal(calls,before);
});
test('progress counts classroom score once, combines with baseline, and pending score remains private',async()=>{
 const json=await a.abilityEvidenceForGrade(db(),sub(null),8);
 const p={studentSkillProfile:{findMany:async()=>[{skill:'writing',evidenceCount:1,scoreDisplay:'8/10',independentRate:100}]},userVocab:{findMany:async()=>[]},vocabReviewHistory:{findMany:async()=>[]},lessonAttempt:{findMany:async()=>[]},submission:{findMany:async()=>[sub(json,{assignment:{skill:'writing',maxScore:10}})]}};
 const route=load('app/api/student/progress/route.ts',{'next/server':{NextResponse:{json:(body,opts)=>({body,status:opts?.status||200})}},'@/lib/prisma':{__esModule:true,default:p},'@/lib/auth':{getCurrentUser:async()=>({id:'student'})},'@/lib/assignmentAbility':a});
 const result=await route.GET();assert.equal(result.body.skills.writing.abilityRating,1152);assert.equal(result.body.skills.writing.evidenceCount,2);
 p.submission.findMany=async()=>[sub(json,{status:'pending_release',assignment:{skill:'writing',maxScore:10}})];
 const hidden=await route.GET();assert.equal(hidden.body.skills.writing.abilityRating,undefined);assert.equal(hidden.body.skills.writing.level,'B1');
});

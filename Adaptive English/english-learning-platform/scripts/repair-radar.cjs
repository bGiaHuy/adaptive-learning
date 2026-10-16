const fs = require('node:fs');
const ts = require('typescript');
const { neon } = require('../.artifacts/release-db-tools/node_modules/@neondatabase/serverless');
let url = fs.readFileSync('.vercel/.env.radar-audit.local','utf8').split(/\r?\n/).find(s=>s.startsWith('DATABASE_URL='))?.slice(13);
if(url?.startsWith('"')) url=JSON.parse(url);
if(!url || url==='[SENSITIVE]') throw Error('Configuration unavailable');
if(new URL(url).hostname!=='ep-patient-rice-b3rcws3x-pooler.c-4.ap-southeast-1.aws.neon.tech') throw Error('Unexpected database');
const sql=neon(url);
(async()=>{
  const counts=()=>sql.query('SELECT (SELECT count(*)::int FROM "User") AS users,(SELECT count(*)::int FROM "StudentSkillProfile") AS profiles,(SELECT count(*)::int FROM "PlacementAttempt") AS placements');
  const before=await counts();
  if(process.argv.includes('--apply')) {
    const statements=fs.readFileSync('prisma/migrations/20261012103000_lesson_attempt_postgres/migration.sql','utf8').split(';').map(s=>s.trim()).filter(Boolean);
    await sql.transaction(statements.map(s=>sql.query(s)));
  }
  const after=await counts();
  if(JSON.stringify(before)!==JSON.stringify(after)) throw Error('Existing record counts changed');
  const users=await sql.query('SELECT id,role FROM "User" ORDER BY "createdAt",id');
  const mod={exports:{}};
  let currentUser;
  const model=(table,field='userId')=>({findMany:({where})=>sql.query(`SELECT * FROM "${table}" WHERE "${field}"=$1`,[where[field]])});
  const prisma={studentSkillProfile:model('StudentSkillProfile'),userVocab:model('UserVocab'),vocabReviewHistory:model('VocabReviewHistory'),lessonAttempt:model('LessonAttempt'),submission:{findMany:({where})=>sql.query('SELECT s.*,json_build_object(\'skill\',a.skill,\'maxScore\',a."maxScore") AS assignment FROM "Submission" s JOIN "Assignment" a ON a.id=s."assignmentId" WHERE s."studentId"=$1 AND s.status IN (\'pending_grading\',\'pending_release\',\'graded\')',[where.studentId])}};
  const deps={'next/server':{NextResponse:{json:(body,options)=>({body,status:options?.status||200})}},'@/lib/prisma':{__esModule:true,default:prisma},'@/lib/auth':{getCurrentUser:async()=>currentUser}};
  const code=ts.transpileModule(fs.readFileSync('src/app/api/student/progress/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
  new Function('require','module','exports',code)(id=>deps[id],mod,mod.exports);
  const results=[];
  for(const [i,user] of users.entries()) {
    if(user.role!=='student') continue;
    currentUser=user;
    const r=await mod.exports.GET();
    if(r.status!==200) throw Error('Progress route verification failed');
    results.push({account:`TK${String(i+1).padStart(2,'0')}`,status:r.status,evaluatedSkills:Object.entries(r.body.skills).filter(([,s])=>s.evaluated).map(([k])=>k)});
  }
  console.log(JSON.stringify({before,after,existingCountsUnchanged:true,verification:'local route invocation, real production SELECTs, controlled auth; not authenticated HTTP',results},null,2));
})().catch(e=>{console.error(JSON.stringify({error:e.name,code:e.code,message:e.message?.includes('verification')?e.message:undefined}));process.exitCode=1;});

const fs = require('node:fs');
const { neon } = require('../.artifacts/release-db-tools/node_modules/@neondatabase/serverless');
let url = fs.readFileSync('.vercel/.env.radar-audit.local', 'utf8').split(/\r?\n/).find(s => s.startsWith('DATABASE_URL='))?.slice(13);
if (url?.startsWith('"')) url = JSON.parse(url);
if (!url || url === '[SENSITIVE]') throw Error('Database configuration unavailable');
const sql = neon(url);
(async () => {
  const tables = await sql.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('PlacementAttempt','LessonAttempt','StudentSkillProfile','UserVocab','VocabReviewHistory','Submission') ORDER BY table_name");
  const users = await sql.query('SELECT id, role FROM "User" ORDER BY "createdAt",id');
  const profiles = await sql.query('SELECT "userId",skill,"scoreDisplay","evidenceCount" FROM "StudentSkillProfile"');
  const attempts = await sql.query('SELECT "userId",status FROM "PlacementAttempt"');
  const accounts = users.map((u,i) => ({account:`TK${String(i+1).padStart(2,'0')}`,role:u.role,placement:attempts.filter(a=>a.userId===u.id).map(a=>a.status),profiles:profiles.filter(p=>p.userId===u.id).length,scoredSkills:profiles.filter(p=>p.userId===u.id && p.evidenceCount>0 && /\d+(?:\.\d+)?\s*\/\s*[1-9]\d*(?:\.\d+)?/.test(p.scoreDisplay)).map(p=>p.skill)}));
  let lessonRead;
  try { await sql.query('SELECT id FROM "LessonAttempt" LIMIT 0'); lessonRead='ok'; }
  catch(e) { lessonRead={code:e.code}; }
  console.log(JSON.stringify({readOnly:true,tables:tables.map(t=>t.table_name),accounts,lessonRead},null,2));
})().catch(e=>{console.error(JSON.stringify({error:e.name,code:e.code}));process.exitCode=1;});

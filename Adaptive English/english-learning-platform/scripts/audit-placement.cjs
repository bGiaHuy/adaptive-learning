const fs = require('node:fs');
const { neon } = require('../.artifacts/release-db-tools/node_modules/@neondatabase/serverless');
let url = fs.readFileSync('.vercel/.env.placement-audit.local','utf8').split(/\r?\n/).find(x=>x.startsWith('DATABASE_URL='))?.slice(13);
if (url?.startsWith('"')) url = JSON.parse(url);
if (!url || url === '[SENSITIVE]') throw Error('Database configuration unavailable');
const sql = neon(url);
(async () => {
  const columns = await sql.query("SELECT table_name,column_name FROM information_schema.columns WHERE table_schema='public' AND table_name IN ('PlacementAttempt','StudentSkillProfile','LessonAttempt') ORDER BY table_name,ordinal_position");
  console.log(JSON.stringify({ host:new URL(url).hostname, columns }));
  if (process.argv.includes('--apply')) {
    if (new URL(url).hostname !== 'ep-patient-rice-b3rcws3x-pooler.c-4.ap-southeast-1.aws.neon.tech') throw Error('Unexpected target');
    const counts = () => sql.query('SELECT (SELECT count(*)::int FROM "User") AS users,(SELECT count(*)::int FROM "StudentSkillProfile") AS profiles');
    const before = await counts();
    const statements = fs.readFileSync('prisma/migrations/20261012093000_placement_attempt_postgres/migration.sql','utf8').split(';').map(x=>x.trim()).filter(Boolean);
    await sql.transaction(statements.map(statement => sql.query(statement)));
    const after = await counts();
    const verified = await sql.query("SELECT count(*)::int AS columns FROM information_schema.columns WHERE table_schema='public' AND table_name='PlacementAttempt'");
    console.log(JSON.stringify({migration:'placement_attempt_postgres',before,after,countsUnchanged:JSON.stringify(before)===JSON.stringify(after),verified}));
  }
})().catch(e=>{console.error(JSON.stringify({error:e.name,code:e.code}));process.exitCode=1;});

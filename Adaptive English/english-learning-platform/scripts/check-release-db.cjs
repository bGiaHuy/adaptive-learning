const fs = require('node:fs');
const text = fs.readFileSync('.vercel/.env.release-20261012.local', 'utf8');
const line = text.split(/\r?\n/).find(x => x.startsWith('DATABASE_URL='));
let url = line?.slice('DATABASE_URL='.length);
if (url?.startsWith('"')) url = JSON.parse(url);
if (!url || url === '[SENSITIVE]') throw new Error('Production DATABASE_URL is unavailable; refusing migration.');
console.log(JSON.stringify({ databaseHost: new URL(url).hostname, credentialsPrinted: false }));
process.env.DATABASE_URL = url;
const { neon } = require('../.artifacts/release-db-tools/node_modules/@neondatabase/serverless');
const sql = neon(url);
const db = { $queryRawUnsafe: text => sql.query(text), $executeRawUnsafe: text => sql.query(text), $disconnect: async () => {} };
(async () => {
  const counts = () => db.$queryRawUnsafe('SELECT (SELECT count(*)::int FROM "Assignment") AS assignments, (SELECT count(*)::int FROM "Submission") AS submissions');
  const before = await counts();
  const columns = await db.$queryRawUnsafe("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='Assignment' AND column_name='releaseGradesImmediately'");
  if (!columns.length) await db.$executeRawUnsafe('ALTER TABLE "Assignment" ADD COLUMN "releaseGradesImmediately" BOOLEAN NOT NULL DEFAULT false');
  const after = await counts();
  console.log(JSON.stringify({ migration: columns.length ? 'already applied' : 'applied', before, after, countsUnchanged: JSON.stringify(before) === JSON.stringify(after) }));
})().catch(error => { console.error(JSON.stringify({ migrationFailed: true, errorType: error.name, code: error.code, databaseCode: error.meta?.code, reason: String(error.message).split('\n').slice(-4).join(' ').replace(/postgres(?:ql)?:\/\/\S+/g, '[REDACTED]').replace(new URL(url).password, '[REDACTED]') })); process.exitCode = 1; }).finally(() => db.$disconnect());

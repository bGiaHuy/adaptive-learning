// Additive production migration. Never resets, seeds, or rewrites user records.
const fs = require('node:fs');
const { envFile } = require('./cloudflare-backup.cjs');
const { neon } = require('../.artifacts/release-db-tools/node_modules/@neondatabase/serverless');
async function main() {
  const source = envFile('.env.cloudflare-source.local');
  if (!source.DATABASE_URL) throw Error('Source configuration unavailable');
  const sql = neon(source.DATABASE_URL);
  const counts = () => sql.query('SELECT (SELECT count(*)::int FROM "User") AS users, (SELECT count(*)::int FROM "Submission") AS submissions, (SELECT count(*)::int FROM "Assignment") AS assignments');
  const before = await counts();
  const statements = fs.readFileSync('prisma/migrations/20261109000000_google_auth/postgres.sql', 'utf8').split(';').map(value => value.trim()).filter(Boolean);
  await sql.transaction(statements.map(statement => sql.query(statement)));
  const columns = await sql.query("SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name IN ('GoogleAccount','GoogleOAuthState') ORDER BY table_name, ordinal_position");
  const after = await counts();
  const summary = { result: 'PASS', migration: '20261109000000_google_auth', before, after, existingCountsUnchanged: JSON.stringify(before) === JSON.stringify(after), columns };
  if (!summary.existingCountsUnchanged) throw Error('Source counts changed; investigate before release');
  fs.writeFileSync('.artifacts/google-auth-tests/production-migration.json', JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary));
}
main().catch(error => {console.error('Additive migration failed:',error.name,error.code || '');process.exitCode=1;});

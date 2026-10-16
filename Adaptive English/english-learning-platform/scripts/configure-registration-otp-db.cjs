// URL is supplied through stdin, never command arguments or logs.
const fs = require('node:fs');
const path = require('node:path');
const { neon } = require('../.artifacts/release-db-tools/node_modules/@neondatabase/serverless');
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', async (chunk) => {
  input += chunk;
  if (!input.includes('\n')) return;
  process.stdin.removeAllListeners('data');
  try {
    const { url, apply } = JSON.parse(input.trim());
    input = '';
    if (!/^postgres(?:ql)?:\/\//.test(url)) throw new Error('Invalid database URL');
    const sql = neon(url);
    const columns = await sql.query("SELECT table_name, column_name FROM information_schema.columns WHERE table_schema='public' AND table_name IN ('User','StudentSkillProfile','Assignment','Submission')");
    for (const [table, column] of [['User','cefrTarget'],['StudentSkillProfile','skill'],['Assignment','classId'],['Submission','studentId']]) {
      if (!columns.some(c => c.table_name === table && c.column_name === column)) throw new Error('English schema identity check failed');
    }
    const counts = () => sql.query('SELECT (SELECT count(*)::int FROM "User") AS users, (SELECT count(*)::int FROM "Assignment") AS assignments, (SELECT count(*)::int FROM "Submission") AS submissions');
    const before = await counts();
    console.log(JSON.stringify({ englishSchemaVerified: true, before, mode: apply ? 'apply-additive-migration' : 'read-only' }));
    if (apply) {
      const migration = fs.readFileSync(path.join(__dirname, '../prisma/migrations/20261013090000_registration_otp/migration.sql'), 'utf8');
      const statements = migration.split(';').map(s => s.trim()).filter(Boolean).map(s => s.replace('CREATE TABLE ', 'CREATE TABLE IF NOT EXISTS '));
      await sql.transaction(statements.map(statement => sql.query(statement)));
    }
    const tables = await sql.query("SELECT table_name, column_name FROM information_schema.columns WHERE table_schema='public' AND table_name IN ('RegistrationOtp','AuthEmailRateLimit') ORDER BY table_name, ordinal_position");
    if (apply) {
      for (const [table, columns] of [['RegistrationOtp',['email','codeHash','expiresAt','sentAt','windowAt','sends','attempts']], ['AuthEmailRateLimit',['key','windowAt','count']]]) {
        if (JSON.stringify(tables.filter(t => t.table_name === table).map(t => t.column_name)) !== JSON.stringify(columns)) throw new Error('OTP table schema mismatch');
      }
    }
    const after = await counts();
    if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error('Counts changed during migration; requires review');
    console.log(JSON.stringify({ tables, after, countsUnchanged: true, migrationApplied: !!apply }));
  } catch (error) {
    // Provider exception messages may contain URLs; report only non-secret identifiers.
    console.error(JSON.stringify({ failed: true, errorType: error.name, code: error.code || null }));
    process.exitCode = 1;
  } finally { process.stdin.destroy(); }
});
// Optional ephemeral input file for runners with a closed stdin. Consume and remove immediately.
if (process.argv[2]) {
  const payload = fs.readFileSync(process.argv[2], 'utf8');
  fs.unlinkSync(process.argv[2]);
  process.stdin.emit('data', payload + '\n');
}

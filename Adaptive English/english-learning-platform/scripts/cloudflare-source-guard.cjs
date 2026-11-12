// Reversible source write barrier. Never updates or deletes application rows.
const fs = require('node:fs');
const { envFile } = require('./cloudflare-backup.cjs');
const FUNCTION = 'ae_cloudflare_migration_readonly_20261109';
const TRIGGER = 'ae_cloudflare_migration_readonly_20261109';
const quote = name => '"' + name.replaceAll('"', '""') + '"';
function statements(tables, remove = false) {
  if (!tables.length || new Set(tables).size !== tables.length) throw new Error('Invalid table set');
  const names = tables.slice().sort().map(name => 'public.' + quote(name));
  const result = ["SET LOCAL lock_timeout='5s'", "SET LOCAL statement_timeout='20s'", 'LOCK TABLE ' + names.join(',') + ' IN SHARE ROW EXCLUSIVE MODE'];
  if (remove) return [...result, ...names.map(name => `DROP TRIGGER ${quote(TRIGGER)} ON ${name}`), `DROP FUNCTION public.${quote(FUNCTION)}()`];
  return [...result, `CREATE FUNCTION public.${quote(FUNCTION)}() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $guard$ BEGIN RAISE EXCEPTION 'Adaptive English moved to Cloudflare; source is read only' USING ERRCODE='25006'; RETURN NULL; END $guard$`, ...names.map(name => `CREATE TRIGGER ${quote(TRIGGER)} BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON ${name} FOR EACH STATEMENT EXECUTE FUNCTION public.${quote(FUNCTION)}()` )];
}
module.exports = { statements, FUNCTION, TRIGGER };
async function main() {
  const mode = process.argv[2];
  if (!['--status', '--freeze', '--unfreeze'].includes(mode)) throw new Error('Expected --status, --freeze or --unfreeze');
  const snapshot = JSON.parse(fs.readFileSync('.artifacts/d1-live-source-20261109/postgres-snapshot.private.json'));
  const config = envFile('.env.cloudflare-source.local');
  if (new URL(config.DATABASE_URL).hostname !== snapshot.sourceHost) throw new Error('Source host changed');
  const { neon } = require('../.artifacts/release-db-tools/node_modules/@neondatabase/serverless');
  const sql = neon(config.DATABASE_URL);
  const actual = await sql.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename");
  const tables = Object.keys(snapshot.tables).sort();
  if (JSON.stringify(tables) !== JSON.stringify(actual.map(row => row.tablename))) throw new Error('Source table set changed');
  const status = () => sql.query("SELECT c.relname AS table_name,t.tgenabled,pg_get_triggerdef(t.oid) AS definition FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND t.tgname=$1 ORDER BY c.relname", [TRIGGER]);
  const before = await status();
  if (mode !== '--status') {
    if (mode === '--freeze' && before.length) throw new Error('Guard already exists; inspect status before retry');
    if (mode === '--unfreeze' && before.length !== tables.length) throw new Error('Incomplete guard; refusing automatic removal');
    await sql.transaction(statements(tables, mode === '--unfreeze').map(text => sql.query(text)));
  }
  const guards = await status();
  const result = { checkedAt: new Date().toISOString(), mode, tables: tables.length, guards: guards.length, allEnabled: guards.every(row => row.tgenabled === 'O'), frozen: guards.length === tables.length && guards.every(row => row.tgenabled === 'O'), sourceRowsModified: false };
  if (mode === '--freeze' && !result.frozen) throw new Error('Freeze verification failed');
  const file = '.artifacts/d1-runtime-lab/source-guard-' + mode.slice(2) + '-' + Date.now() + '.json';
  fs.writeFileSync(file, JSON.stringify(result, null, 2), { flag: 'wx' });
  console.log(JSON.stringify(result));
}
if (require.main === module) main().catch(error => { console.error('Source guard failed:', error.name, error.code || '', 'Private configuration not printed.'); process.exitCode = 1; });

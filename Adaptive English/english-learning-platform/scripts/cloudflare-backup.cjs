// Read-only export. Private data is written only beneath ignored .artifacts/.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { neon } = require('../.artifacts/release-db-tools/node_modules/@neondatabase/serverless');
const { list, get } = require('@vercel/blob');
function envFile(file) {
  const result = {};
  if (!fs.existsSync(file)) return result;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    let value = match[2];
    try { value = JSON.parse(value); } catch { value = value.replace(/^'|'$/g, ''); }
    if (value && value !== '[SENSITIVE]') result[match[1]] = value;
  }
  return result;
}
module.exports = { envFile };
async function main() {
  const source = envFile('.env.cloudflare-source.local');
  if (!source.DATABASE_URL || !source.BLOB_READ_WRITE_TOKEN) throw new Error('Source configuration unavailable');
  const destination = path.resolve(process.argv[2] || '.artifacts/cloudflare-migration-20261109');
  fs.mkdirSync(destination, { recursive: true });
  const sql = neon(source.DATABASE_URL);
  const columns = await sql.query(`SELECT table_name, column_name, data_type, udt_name, is_nullable, column_default, ordinal_position FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name, ordinal_position`);
  const constraints = await sql.query(`SELECT c.conrelid::regclass::text AS table_name, c.conname, c.contype, pg_get_constraintdef(c.oid) AS definition FROM pg_constraint c JOIN pg_namespace n ON n.oid=c.connamespace WHERE n.nspname='public' ORDER BY c.conrelid::regclass::text, c.conname`);
  const names = [...new Set(columns.map(c => c.table_name))];
  const quote = name => '"' + name.replaceAll('"','""') + '"';
  const results = await sql.transaction(names.map(name => sql.query('SELECT * FROM '+quote(name))), { isolationLevel: 'RepeatableRead', readOnly: true });
  const tables = Object.fromEntries(names.map((name, i) => [name, results[i]]));
  const snapshot = { exportedAt: new Date().toISOString(), sourceHost: new URL(source.DATABASE_URL).hostname, columns, constraints, tables };
  const bytes = JSON.stringify(snapshot);
  fs.writeFileSync(path.join(destination, 'postgres-snapshot.private.json'), bytes, { flag: 'wx' });
  const summary = { exportedAt: snapshot.exportedAt, sourceHost: snapshot.sourceHost, snapshotSha256: crypto.createHash('sha256').update(bytes).digest('hex'), tables: names.map(name => ({ name, rows: tables[name].length })), blobs: { count: 0, bytes: 0 } };
  const blobs = [];
  let cursor;
  do {
    const page = await list({ token: source.BLOB_READ_WRITE_TOKEN, cursor, limit: 1000 });
    for (const item of page.blobs) {
      const key = item.pathname;
      if (key.split('/').some(part => part === '..' || part === '.') || key.includes('\\') || key.startsWith('/')) throw new Error('Unsafe blob pathname');
      const blob = await get(key, { token: source.BLOB_READ_WRITE_TOKEN, access: 'private' });
      if (!blob || blob.statusCode !== 200) throw new Error('Blob download failed');
      const data = Buffer.from(await new Response(blob.stream).arrayBuffer());
      const file = path.join(destination, 'blobs', key);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, data, { flag: 'wx' });
      blobs.push({ pathname: key, size: data.length, contentType: blob.blob.contentType, sha256: crypto.createHash('sha256').update(data).digest('hex') });
      summary.blobs.count++; summary.blobs.bytes += data.length;
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  fs.writeFileSync(path.join(destination, 'blob-manifest.private.json'), JSON.stringify(blobs, null, 2));
  fs.writeFileSync(path.join(destination, 'backup-summary.json'), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
}
if (require.main === module) main().catch(error => { console.error('Backup failed:', error.name, error.code || '', 'Private configuration not printed.'); process.exitCode = 1; });

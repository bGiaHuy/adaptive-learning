// Private data transport for the application's D1 transaction planner.
// All public responses to unauthenticated callers are deliberately identical.
const quote = value => '"' + value.replaceAll('"', '""') + '"';
const schemaSql = "SELECT name,type,sql FROM sqlite_master WHERE type IN ('table','index','trigger') AND name NOT GLOB 'sqlite_*' AND name NOT GLOB '_cf_*' AND name NOT GLOB '_ae_*' AND name NOT GLOB 'd1_*' AND sql IS NOT NULL ORDER BY type,name";
function encoded(expression) {
  return `CASE typeof(${expression}) WHEN 'null' THEN json_array('null',NULL) WHEN 'blob' THEN json_array('blob',hex(${expression})) WHEN 'text' THEN json_array('text',hex(CAST(${expression} AS BLOB))) WHEN 'integer' THEN json_array('integer',CAST(${expression} AS TEXT)) WHEN 'real' THEN json_array('real',printf('%!.26g',${expression})) END`;
}
function response(body, status = 200) {
  return Response.json(body, { status, headers: { 'cache-control': 'private, no-store', 'x-content-type-options': 'nosniff' } });
}
async function digest(text) {
  const data = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(data)].map(value => value.toString(16).padStart(2, '0')).join('');
}
async function authorized(request, env) {
  if (!env.CLOUDFLARE_DATA_TOKEN) return false;
  const actual = await digest(request.headers.get('authorization') || '');
  const expected = await digest('Bearer ' + env.CLOUDFLARE_DATA_TOKEN);
  let difference = 0;
  for (let index = 0; index < actual.length; index++) difference |= actual.charCodeAt(index) ^ expected.charCodeAt(index);
  return difference === 0;
}
function sqlArgument(value) {
  if (value && typeof value === 'object' && Object.keys(value).length === 1 && typeof value.blob === 'string') {
    const bytes = Uint8Array.from(atob(value.blob), character => character.charCodeAt(0));
    return bytes.buffer;
  }
  if (value === null || typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value))) return value;
  throw new Error('Invalid SQL argument');
}
async function revision(db) {
  const row = await db.prepare('SELECT version FROM _ae_revision WHERE id=1').first();
  if (!row || !Number.isSafeInteger(row.version)) throw new Error('Revision metadata missing');
  return row.version;
}
async function snapshot(db, cachedRevision, cachedSchema) {
  if (Number.isSafeInteger(cachedRevision) && typeof cachedSchema === 'string') {
    const current = await db.batch([db.prepare('SELECT version FROM _ae_revision WHERE id=1'), db.prepare(schemaSql)]);
    if (current[0].results[0]?.version === cachedRevision && await digest(JSON.stringify(current[1].results)) === cachedSchema) return { notModified: true, revision: cachedRevision };
  }
  for (let attempt = 0; attempt < 2; attempt++) {
    const schema = await db.prepare(schemaSql).all();
    const definitions = schema.results;
    const tableDefinitions = definitions.filter(item => item.type === 'table');
    const information = await db.batch(tableDefinitions.map(table => db.prepare('PRAGMA table_info(' + quote(table.name) + ')')));
    const tables = tableDefinitions.map((table, index) => ({ name: table.name, sql: table.sql, columns: information[index].results.map(column => column.name), primaryKey: information[index].results.filter(column => column.pk).sort((left, right) => left.pk - right.pk).map(column => column.name) }));
    const profiles = await db.batch([
      db.prepare('SELECT version FROM _ae_revision WHERE id=1'),
      ...tables.map(table => {
        const rowBytes = table.columns.map(column => 'coalesce(length(CAST(' + quote(column) + ' AS BLOB)),0)').join('+');
        return db.prepare('SELECT count(*) AS rowCount,coalesce(sum(' + rowBytes + '),0) AS totalBytes,coalesce(max(' + rowBytes + '),0) AS maxRowBytes FROM ' + quote(table.name));
      }),
      db.prepare(schemaSql),
    ]);
    if (JSON.stringify(profiles.at(-1).results) !== JSON.stringify(definitions)) continue;
    if (profiles.slice(1,-1).reduce((sum,result) => sum + result.results[0].totalBytes,0) > 4 * 1024 * 1024) {
      const version = profiles[0].results[0]?.version;
      if (!Number.isSafeInteger(version)) throw new Error('Revision metadata missing');
      return {paged:true,revision:version,schemaFingerprint:await digest(JSON.stringify(definitions)),tables:tables.map((table,index)=>{
        const profile=profiles[index+1].results[0];
        return {...table,rowCount:profile.rowCount,pageSize:Math.max(1,Math.min(200,Math.floor(512*1024/(profile.maxRowBytes*2+table.columns.length*40+100))))};
      }),indexes:definitions.filter(item=>item.type==='index'),triggers:definitions.filter(item=>item.type==='trigger')};
    }
    const results = await db.batch([
      db.prepare('SELECT version FROM _ae_revision WHERE id=1'),
      ...tables.map(table => db.prepare('SELECT ' + table.columns.map(column => encoded(quote(column)) + ' AS ' + quote(column)).join(',') + ' FROM ' + quote(table.name))),
      db.prepare(schemaSql),
    ]);
    if (JSON.stringify(results.at(-1).results) !== JSON.stringify(definitions)) continue;
    const version = results[0].results[0]?.version;
    if (!Number.isSafeInteger(version)) throw new Error('Revision metadata missing');
    return { revision: version, schemaFingerprint: await digest(JSON.stringify(definitions)), tables: tables.map((table, index) => ({ ...table, rows: results[index + 1].results.map(row => table.columns.map(column => JSON.parse(row[column]))) })), indexes: definitions.filter(item => item.type === 'index'), triggers: definitions.filter(item => item.type === 'trigger') };
  }
  throw new Error('Database schema changed during snapshot');
}
async function snapshotPage(db,body) {
  if(!Number.isSafeInteger(body.revision)||typeof body.table!=='string'||!Number.isSafeInteger(body.limit)||body.limit<1||body.limit>200||(body.cursor!==null&&!Number.isSafeInteger(body.cursor)))return response({code:'INVALID_PAGE'},400);
  const definition=await db.prepare("SELECT name,sql FROM sqlite_master WHERE type='table' AND name=? AND name NOT GLOB 'sqlite_*' AND name NOT GLOB '_cf_*' AND name NOT GLOB '_ae_*' AND name NOT GLOB 'd1_*'").bind(body.table).first();
  if(!definition||/WITHOUT\s+ROWID/i.test(definition.sql))return response({code:'UNSUPPORTED_PAGE_TABLE'},400);
  const columns=(await db.prepare('PRAGMA table_info('+quote(body.table)+')').all()).results.map(column=>column.name);
  const statement=db.prepare('SELECT rowid AS __ae_cursor,'+columns.map(column=>encoded(quote(column))+' AS '+quote(column)).join(',')+' FROM '+quote(body.table)+(body.cursor===null?'':' WHERE rowid>?')+' ORDER BY rowid LIMIT ?');
  const result=await db.batch([db.prepare('SELECT version FROM _ae_revision WHERE id=1'),body.cursor===null?statement.bind(body.limit):statement.bind(body.cursor,body.limit)]);
  if(result[0].results[0]?.version!==body.revision)return response({code:'REVISION_CONFLICT'},409);
  const rows=result[1].results;
  return response({rows:rows.map(row=>columns.map(column=>JSON.parse(row[column]))),cursor:rows.length?rows.at(-1).__ae_cursor:body.cursor,more:rows.length===body.limit});
}
async function snapshotCheck(db,body) {
  const result=await db.batch([db.prepare('SELECT version FROM _ae_revision WHERE id=1'),db.prepare(schemaSql)]);
  if(result[0].results[0]?.version!==body.revision||await digest(JSON.stringify(result[1].results))!==body.schemaFingerprint)return response({code:'REVISION_CONFLICT'},409);
  return response({valid:true,revision:body.revision});
}
async function commit(db, body) {
  if (!/^[a-f0-9]{64}$/.test(body.id || '') || !Number.isSafeInteger(body.revision) || !Array.isArray(body.changes) || !body.changes.length || body.changes.length > 5000) return response({ code: 'INVALID_COMMIT' }, 400);
  const fingerprint = await digest(JSON.stringify([body.revision, body.changes]));
  const completed = () => db.prepare('SELECT fingerprint,revision FROM _ae_commits WHERE id=?').bind(body.id).first();
  const existing = await completed();
  if (existing) return existing.fingerprint === fingerprint ? response({ committed: true, revision: existing.revision, repeated: true }) : response({ code: 'COMMIT_ID_MISMATCH' }, 409);
  const tables = new Set((await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT GLOB 'sqlite_*' AND name NOT GLOB '_cf_*' AND name NOT GLOB '_ae_*' AND name NOT GLOB 'd1_*'").all()).results.map(table => table.name));
  const statements = [
    db.prepare('INSERT INTO _ae_commit_guard(id,valid) VALUES(1,CASE WHEN (SELECT version FROM _ae_revision WHERE id=1)=? THEN 1 ELSE 0 END) ON CONFLICT(id) DO UPDATE SET valid=excluded.valid').bind(body.revision),
    db.prepare('PRAGMA defer_foreign_keys=ON'),
  ];
  for (const change of body.changes) {
    const target = typeof change.sql === 'string' && change.sql.match(/^(?:INSERT INTO|UPDATE|DELETE FROM) "([A-Za-z][A-Za-z0-9_]*)" /);
    if (!target || !tables.has(target[1]) || /;|--|\/\*/.test(change.sql) || !Array.isArray(change.params) || change.params.length > 100) return response({ code: 'INVALID_MUTATION' }, 400);
    statements.push(db.prepare(change.sql).bind(...change.params.map(sqlArgument)));
  }
  statements.push(db.prepare('INSERT INTO _ae_commits(id,fingerprint,revision,committedAt) SELECT ?,?,version,CAST(strftime(\'%s\',\'now\') AS INTEGER)*1000 FROM _ae_revision WHERE id=1').bind(body.id, fingerprint));
  statements.push(db.prepare("DELETE FROM _ae_commits WHERE committedAt < (CAST(strftime('%s','now') AS INTEGER)-604800)*1000"));
  try {
    await db.batch(statements);
    const result = await completed();
    if (!result) throw new Error('Missing commit acknowledgement');
    return response({ committed: true, revision: result.revision });
  } catch {
    const result = await completed();
    if (result) return result.fingerprint === fingerprint ? response({ committed: true, revision: result.revision, repeated: true }) : response({ code: 'COMMIT_ID_MISMATCH' }, 409);
    if (await revision(db) !== body.revision) return response({ code: 'REVISION_CONFLICT' }, 409);
    // SQL text, bound values and database errors may contain personal data.
    return response({ code: 'COMMIT_REJECTED' }, 422);
  }
}
export async function dataFetch(request, env) {
  if (request.method !== 'POST' || new URL(request.url).pathname !== '/v1/data' || !await authorized(request, env)) return new Response('Not found', { status: 404, headers: { 'cache-control': 'no-store' } });
  if (Number(request.headers.get('content-length')) > 16 * 1024 * 1024) return response({ code: 'REQUEST_TOO_LARGE' }, 413);
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).length > 16 * 1024 * 1024) return response({ code: 'REQUEST_TOO_LARGE' }, 413);
    const body = JSON.parse(text);
    if (body.operation === 'snapshot') {
      const result = await snapshot(env.DB, body.ifRevision, body.ifSchema);
      if (new TextEncoder().encode(JSON.stringify(result)).length > 16 * 1024 * 1024) return response({ code: 'SNAPSHOT_TOO_LARGE' }, 503);
      return response(result);
    }
    if (body.operation === 'commit') return await commit(env.DB, body);
    if (body.operation === 'snapshot-page') return await snapshotPage(env.DB,body);
    if (body.operation === 'snapshot-check') return await snapshotCheck(env.DB,body);
    if (body.operation === 'health') return response({ database: 'connected', provider: 'cloudflare-d1', revision: await revision(env.DB) });
    return response({ code: 'UNKNOWN_OPERATION' }, 400);
  } catch { return response({ code: 'DATA_SERVICE_ERROR' }, 503); }
}
export async function mediaGatewayFetch(request, env) {
  if (!['GET','HEAD','PUT'].includes(request.method) || !await authorized(request,env)) return new Response('Not found',{status:404,headers:{'cache-control':'no-store'}});
  const pathname=new URL(request.url).searchParams.get('pathname')||'';
  if(!/^audio\/[a-zA-Z0-9_-]{1,100}\/(?:practice|assignments\/[a-zA-Z0-9_-]{1,100})\/[a-f0-9-]{36}\.(?:webm|mp4|ogg|wav|mp3)$/.test(pathname)) return response({code:'INVALID_MEDIA_PATH'},400);
  if(!env.MEDIA) return response({code:'MEDIA_UNAVAILABLE'},503);
  return env.MEDIA.getByName(pathname).fetch(request);
}
export default { fetch: dataFetch };

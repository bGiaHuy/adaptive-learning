/*
 * D1 is authoritative. Prisma executes against a disposable SQLite snapshot so
 * existing interactive/nested transactions retain real SQLite rollback behavior.
 * SQLite change triggers capture exact typed values. D1 commits the journal in
 * one atomic batch guarded by the snapshot revision. A stale plan is discarded.
 * No successful mutation is returned until its durable D1 commit is acknowledged.
 */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');
const PLAN = Symbol('cloudflare-prisma-plan');
const quote = value => '"' + value.replaceAll('"', '""') + '"';

function decodeValue(value) {
  if (!Array.isArray(value) || value.length !== 2) throw new Error('Invalid typed database value');
  switch (value[0]) {
    case 'null': return null;
    case 'blob': return Buffer.from(value[1], 'hex');
    case 'text': return Buffer.from(value[1], 'hex').toString('utf8');
    case 'integer': {
      const number = Number(value[1]);
      if (!Number.isSafeInteger(number)) throw new Error('Database integer exceeds the supported exact range');
      return number;
    }
    case 'real': return Number(value[1]);
    default: throw new Error('Unsupported database value type');
  }
}
function wireValue(value) {
  return Buffer.isBuffer(value) || value instanceof Uint8Array ? { blob: Buffer.from(value).toString('base64') } : value;
}
// Encode TEXT as UTF-8 bytes (including NUL), BLOB as hex, and REAL with enough
// digits to round-trip a binary64. JSON's ordinary float rendering is insufficient.
function encoded(expression) {
  return `CASE typeof(${expression}) WHEN 'null' THEN json_array('null',NULL) WHEN 'blob' THEN json_array('blob',hex(${expression})) WHEN 'text' THEN json_array('text',hex(CAST(${expression} AS BLOB))) WHEN 'integer' THEN json_array('integer',CAST(${expression} AS TEXT)) WHEN 'real' THEN json_array('real',printf('%!.26g',${expression})) END`;
}
function rowExpression(columns, prefix) {
  return 'json_array(' + columns.map(column => 'json(' + encoded(prefix + '.' + quote(column)) + ')').join(',') + ')';
}
function hydrate(filename, snapshot) {
  const db = new DatabaseSync(filename);
  try {
    db.exec('PRAGMA foreign_keys=OFF; BEGIN;');
    for (const table of snapshot.tables) {
      db.exec(table.sql);
      const insert = db.prepare('INSERT INTO ' + quote(table.name) + ' (' + table.columns.map(quote).join(',') + ') VALUES (' + table.columns.map(() => '?').join(',') + ')');
      for (const row of table.rows) insert.run(...row.map(decodeValue));
    }
    for (const definition of snapshot.indexes || []) db.exec(definition.sql);
    // No application triggers currently exist. Refuse rather than replaying an
    // unreviewed trigger twice (once in the planner and again in D1).
    if (snapshot.triggers?.length) throw new Error('Application triggers require a reviewed replay strategy');
    db.exec('COMMIT; PRAGMA foreign_keys=ON;');
    if (db.prepare('PRAGMA foreign_key_check').get()) throw new Error('Source snapshot violates a foreign key');
    db.exec('BEGIN; CREATE TABLE _planner_changes(seq INTEGER PRIMARY KEY AUTOINCREMENT, tableName TEXT NOT NULL, operation TEXT NOT NULL, oldKey TEXT, newRow TEXT);');
    for (const table of snapshot.tables) {
      if (!table.primaryKey?.length) throw new Error('Every application table must have a primary key');
      const name = quote(table.name);
      const label = "'" + table.name.replaceAll("'", "''") + "'";
      const oldKey = rowExpression(table.primaryKey, 'OLD');
      const newRow = rowExpression(table.columns, 'NEW');
      for (const [operation, key, row] of [['INSERT', 'NULL', newRow], ['UPDATE', oldKey, newRow], ['DELETE', oldKey, 'NULL']]) {
        db.exec('CREATE TRIGGER ' + quote('_planner_' + table.name + '_' + operation) + ' AFTER ' + operation + ' ON ' + name + ' BEGIN INSERT INTO _planner_changes(tableName,operation,oldKey,newRow) VALUES(' + label + ", '" + operation + "', " + key + ', ' + row + '); END;');
      }
    }
    db.exec('COMMIT;');
    return db.prepare('PRAGMA schema_version').get().schema_version;
  } finally { db.close(); }
}
function journal(filename, snapshot, expectedSchemaVersion) {
  const db = new DatabaseSync(filename);
  try {
    if (expectedSchemaVersion !== undefined && db.prepare('PRAGMA schema_version').get().schema_version !== expectedSchemaVersion) throw new Error('Schema changes must use the reviewed migration workflow');
    const tables = new Map(snapshot.tables.map(table => [table.name, table]));
    return db.prepare('SELECT tableName,operation,oldKey,newRow FROM _planner_changes ORDER BY seq').all().map(change => {
      const table = tables.get(change.tableName);
      if (!table) throw new Error('Unexpected planner table');
      const name = quote(table.name);
      const key = change.oldKey ? JSON.parse(change.oldKey).map(decodeValue) : [];
      const values = change.newRow ? JSON.parse(change.newRow).map(decodeValue) : [];
      const where = table.primaryKey.map(column => quote(column) + '=?').join(' AND ');
      if (change.operation === 'INSERT') return { sql: 'INSERT INTO ' + name + ' (' + table.columns.map(quote).join(',') + ') VALUES (' + table.columns.map(() => '?').join(',') + ')', params: values.map(wireValue) };
      if (change.operation === 'UPDATE') return { sql: 'UPDATE ' + name + ' SET ' + table.columns.map(column => quote(column) + '=?').join(',') + ' WHERE ' + where, params: [...values, ...key].map(wireValue) };
      if (change.operation === 'DELETE') return { sql: 'DELETE FROM ' + name + ' WHERE ' + where, params: key.map(wireValue) };
      throw new Error('Unexpected planner operation');
    });
  } finally { db.close(); }
}
function transportFromEnvironment() {
  const endpoint = process.env.CLOUDFLARE_DATA_URL;
  const secret = process.env.CLOUDFLARE_DATA_TOKEN;
  if (!endpoint || !secret) throw new Error('Cloudflare data service is not configured');
  const url = new URL(endpoint);
  if (url.protocol !== 'https:' && !(['localhost', '127.0.0.1'].includes(url.hostname) && url.protocol === 'http:')) throw new Error('Data transport requires HTTPS');
  return async body => {
    const response = await fetch(url, { method: 'POST', headers: { authorization: 'Bearer ' + secret, 'content-type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(45000), redirect: 'error' });
    const result = await response.json();
    if (!response.ok) {
      const error = new Error('Cloudflare database operation failed');
      error.code = result.code || 'CLOUDFLARE_DATA_ERROR';
      error.status = response.status;
      throw error;
    }
    return result;
  };
}
function removePlanner(directory) {
  const parent = path.resolve(os.tmpdir());
  const resolved = path.resolve(directory);
  if (path.dirname(resolved) !== parent || !path.basename(resolved).startsWith('adaptive-d1-tx-')) throw new Error('Unsafe planner cleanup path');
  try { fs.rmSync(resolved, { recursive: true, force: true, maxRetries: 3, retryDelay: 50 }); }
  catch {
    // A scanner can briefly hold a Windows file open. Cleanup must never turn an
    // acknowledged durable commit into an apparent failed user mutation.
    const timer = setTimeout(() => {
      try { fs.rmSync(resolved, { recursive: true, force: true, maxRetries: 3, retryDelay: 50 }); }
      catch { console.warn('Temporary transaction cleanup deferred until container disposal'); }
    }, 10000);
    timer.unref?.();
  }
}

function createCloudflareStore({ PrismaClient, transport = transportFromEnvironment(), maxAttempts = 5, onAttempt } = {}) {
  if (!PrismaClient) throw new Error('A SQLite Prisma client is required');
  let cachedSnapshot;
  let snapshotPending;
  async function getSnapshot() {
    if (snapshotPending) return snapshotPending;
    snapshotPending = (async () => {
      for(let attempt=0;attempt<maxAttempts;attempt++) {
        try {
          let result = await transport({ operation: 'snapshot', ...(cachedSnapshot ? { ifRevision: cachedSnapshot.revision, ifSchema: cachedSnapshot.schemaFingerprint } : {}) });
          if (result.notModified) {
            if (!cachedSnapshot || result.revision !== cachedSnapshot.revision) throw new Error('Invalid cached snapshot acknowledgement');
            return cachedSnapshot;
          }
          if(result.paged) {
            const tables=[];
            for(const table of result.tables) {
              const rows=[];
              if(table.rowCount) {
                let cursor=null;
                while(true) {
                  const page=await transport({operation:'snapshot-page',revision:result.revision,table:table.name,limit:table.pageSize,cursor});
                  rows.push(...page.rows);
                  if(!page.more)break;
                  if(page.cursor===cursor)throw new Error('Database snapshot page made no progress');
                  cursor=page.cursor;
                }
              }
              if(rows.length!==table.rowCount)throw new Error('Snapshot row count changed without a revision');
              tables.push({...table,rows});
            }
            const checked=await transport({operation:'snapshot-check',revision:result.revision,schemaFingerprint:result.schemaFingerprint});
            if(checked.valid!==true)throw new Error('Invalid paged snapshot acknowledgement');
            result={...result,tables};
          }
          cachedSnapshot=result;
          return result;
        } catch(error) {
          if(error.code!=='REVISION_CONFLICT'||attempt+1===maxAttempts)throw error;
        }
      }
    })().finally(() => { snapshotPending = undefined; });
    return snapshotPending;
  }
  async function commit(payload) {
    // Reuse the SAME transaction id after ambiguous network failures. The gateway
    // ledger makes this idempotent, even if a response was lost after a commit.
    for (let attempt = 0; attempt < 3; attempt++) {
      try { return await transport(payload); }
      catch (error) {
        if (error.status && error.status < 500) throw error;
        if (attempt === 2) throw error;
      }
    }
  }
  async function execute(work, options) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const snapshot = await getSnapshot();
      if (!Number.isSafeInteger(snapshot.revision)) throw new Error('Invalid source revision');
      const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'adaptive-d1-tx-'));
      const filename = path.join(directory, 'planner.sqlite');
      let client;
      try {
        const schemaVersion = hydrate(filename, snapshot);
        client = new PrismaClient({ datasources: { db: { url: 'file:' + filename.replaceAll('\\', '/') } }, log: [] });
        const result = await work(client, options);
        await client.$disconnect(); client = null;
        const changes = journal(filename, snapshot, schemaVersion);
        onAttempt?.({ attempt, revision: snapshot.revision, mutations: changes.length });
        if (changes.length) {
          const id = crypto.randomBytes(32).toString('hex');
          const acknowledgement = await commit({ operation: 'commit', id, revision: snapshot.revision, changes });
          if (acknowledgement.committed !== true || !Number.isSafeInteger(acknowledgement.revision) || acknowledgement.revision <= snapshot.revision) throw new Error('Invalid durable commit acknowledgement');
        }
        return result;
      } catch (error) {
        if (error.code !== 'REVISION_CONFLICT' || attempt + 1 === maxAttempts) {
          if (error.code === 'REVISION_CONFLICT') error.code = 'P2034';
          throw error;
        }
      } finally {
        if (client) await client.$disconnect();
        removePlanner(directory);
      }
    }
  }
  function deferred(plan) {
    let pending;
    const run = () => pending ??= execute(client => plan.model ? client[plan.model][plan.method](...plan.args) : client[plan.method](...plan.args));
    return {
      [PLAN]: { ...plan, started: () => Boolean(pending) },
      [Symbol.toStringTag]: 'PrismaPromise',
      then: (resolve, reject) => run().then(resolve, reject),
      catch: reject => run().catch(reject),
      finally: finish => run().finally(finish),
    };
  }
  return new Proxy({}, {
    get(_target, property) {
      if (property === 'then') return undefined;
      if (property === '$connect' || property === '$disconnect') return async () => {};
      if (property === '$transaction') return (input, options) => {
        if (typeof input === 'function') return execute(client => client.$transaction(input, options));
        if (!Array.isArray(input)) throw new Error('Invalid transaction');
        const plans = input.map(operation => {
          const plan = operation?.[PLAN];
          if (!plan || plan.started()) throw new Error('Batch transactions require unexecuted operations from this client');
          return plan;
        });
        return execute(client => client.$transaction(plans.map(plan => plan.model ? client[plan.model][plan.method](...plan.args) : client[plan.method](...plan.args)), options));
      };
      if (typeof property !== 'string') return undefined;
      if (property.startsWith('$')) {
        if (!['$queryRaw', '$queryRawUnsafe', '$executeRaw', '$executeRawUnsafe'].includes(property)) throw new Error('Unsupported Prisma control method');
        return (...args) => deferred({ method: property, args });
      }
      return new Proxy({}, { get(_model, method) { return (...args) => deferred({ model: property, method, args }); } });
    }
  });
}
module.exports = { createCloudflareStore, hydrate, journal, decodeValue, wireValue, encoded, quote };

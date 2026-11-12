const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { PrismaClient } = require('../src/generated/cloudflarePrisma');
const { createCloudflareStore } = require('../src/lib/cloudflareStore.cjs');
const { revisionSchema } = require('../scripts/cloudflare-data-schema.cjs');
let dataFetch;
test.before(async () => { ({ dataFetch } = await import('../deploy/cloudflare/data-gateway.mjs')); });

function fixture() {
  const db = new DatabaseSync(':memory:');
  db.exec(fs.readFileSync('.artifacts/google-auth-tests/schema.sql', 'utf8'));
  db.exec('CREATE TABLE ExactValue(id TEXT PRIMARY KEY,b BLOB,t TEXT,n REAL);');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all().map(table=>table.name);
  for (const statement of revisionSchema(tables)) db.exec(statement);
  const convert = value => value instanceof ArrayBuffer ? new Uint8Array(value) : value;
  class Prepared {
    constructor(sql, params = []) { this.sql = sql; this.params = params; }
    bind(...params) { return new Prepared(this.sql, params.map(convert)); }
    sync() {
      const statement = db.prepare(this.sql);
      if (statement.columns().length) return {results:statement.all(...this.params),success:true};
      const result = statement.run(...this.params);
      return {results:[],success:true,meta:{changes:Number(result.changes)}};
    }
    async first() { return this.sync().results[0] || null; }
    async all() { return this.sync(); }
  }
  const binding = {
    prepare: sql => new Prepared(sql),
    async batch(statements) {
      db.exec('BEGIN');
      try { const results = statements.map(statement=>statement.sync()); db.exec('COMMIT'); return results; }
      catch(error) { db.exec('ROLLBACK'); throw error; }
    }
  };
  const sent = [];
  let loseAcknowledgement = false;
  let rejectCommit = false;
  const transport = async body => {
    sent.push(body);
    const actual = rejectCommit && body.operation==='commit' ? {...body,changes:[...body.changes,{sql:'INSERT INTO "User" ("id") VALUES (?)',params:['invalid-row']}]} : body;
    const response = await dataFetch(new Request('https://data.example/v1/data',{method:'POST',headers:{authorization:'Bearer test-only-token','content-type':'application/json'},body:JSON.stringify(actual)}),{DB:binding,CLOUDFLARE_DATA_TOKEN:'test-only-token'});
    const result = await response.json();
    if(!response.ok){const error=new Error('Gateway rejected test operation');error.code=result.code;error.status=response.status;throw error;}
    if(loseAcknowledgement && body.operation==='commit'){loseAcknowledgement=false;throw new TypeError('Simulated lost acknowledgement');}
    return result;
  };
  const attempts = [];
  const prisma = createCloudflareStore({PrismaClient,transport,onAttempt:attempt=>attempts.push(attempt)});
  return {db,binding,prisma,transport,sent,attempts,loseResponse(){loseAcknowledgement=true;},reject(){rejectCommit=true;},close(){db.close();}};
}
const user = (id, extra={}) => ({id,email:id+'@example.invalid',name:'Isolated fixture',passwordHash:'isolated-test-only',...extra});

test('private gateway rejects unknown credentials and paths without exposing data',async()=>{
  const f=fixture();
  for(const [url,token] of [['https://data.example/v1/data','wrong'],['https://data.example/','test-only-token']]){
    const response=await dataFetch(new Request(url,{method:'POST',headers:{authorization:'Bearer '+token},body:'{"operation":"snapshot"}'}),{DB:f.binding,CLOUDFLARE_DATA_TOKEN:'test-only-token'});
    assert.equal(response.status,404);assert.equal(await response.text(),'Not found');
  }
  f.close();
});
test('ordinary and nested Prisma mutations commit all dependent rows to D1',async()=>{
  const f=fixture();
  const created=await f.prisma.user.create({data:{...user('student'),skillProfiles:{create:[{skill:'reading',level:'B1',scoreDisplay:'Test',confidence:10,evidenceCount:0,independentRate:0}]}}});
  assert.equal(created.id,'student');
  assert.equal(f.db.prepare('SELECT count(*) n FROM User').get().n,1);
  assert.equal(f.db.prepare('SELECT count(*) n FROM StudentSkillProfile').get().n,1);
  const fetched=await f.prisma.user.findUnique({where:{id:'student'},include:{skillProfiles:true}});
  assert.equal(fetched.skillProfiles.length,1);assert.ok(fetched.createdAt instanceof Date);
  f.close();
});
test('interactive transaction failure leaves authoritative rows and revision unchanged',async()=>{
  const f=fixture();await f.prisma.user.create({data:user('rollback')});
  const before=await f.transport({operation:'health'});
  await assert.rejects(f.prisma.$transaction(async tx=>{await tx.user.update({where:{id:'rollback'},data:{dailyMinutes:99}});await tx.notification.create({data:{userId:'rollback',title:'Temporary',message:'Not committed',type:'grade'}});throw Error('Intentional rollback');}),/Intentional rollback/);
  assert.equal(f.db.prepare('SELECT dailyMinutes FROM User').get().dailyMinutes,20);
  assert.equal(f.db.prepare('SELECT count(*) n FROM Notification').get().n,0);
  assert.equal((await f.transport({operation:'health'})).revision,before.revision);
  f.close();
});
test('array transactions are lazy, atomic, and preserve constraint failure rollback',async()=>{
  const f=fixture();await f.prisma.user.create({data:user('array')});
  const planned=f.prisma.user.update({where:{id:'array'},data:{dailyMinutes:55}});
  assert.equal(f.db.prepare('SELECT dailyMinutes FROM User').get().dailyMinutes,20);
  await assert.rejects(f.prisma.$transaction([planned,f.prisma.notification.create({data:{userId:'missing',title:'Invalid',message:'FK fails',type:'grade'}})]));
  assert.equal(f.db.prepare('SELECT dailyMinutes FROM User').get().dailyMinutes,20);
  await f.prisma.$transaction([f.prisma.user.update({where:{id:'array'},data:{dailyMinutes:25}}),f.prisma.notification.create({data:{userId:'array',title:'Valid',message:'Committed together',type:'grade'}})]);
  assert.equal(f.db.prepare('SELECT dailyMinutes FROM User').get().dailyMinutes,25);assert.equal(f.db.prepare('SELECT count(*) n FROM Notification').get().n,1);
  f.close();
});
test('competing transactions re-read on revision conflict instead of losing an increment',async()=>{
  const f=fixture();await f.prisma.user.create({data:user('race',{dailyMinutes:0})});
  let arrived=0;let release;const barrier=new Promise(resolve=>{release=resolve;});
  function increment(){let first=true;return f.prisma.$transaction(async tx=>{const row=await tx.user.findUnique({where:{id:'race'}});if(first){first=false;if(++arrived===2)release();await barrier;}return tx.user.update({where:{id:'race'},data:{dailyMinutes:row.dailyMinutes+1}});});}
  await Promise.all([increment(),increment()]);
  assert.equal(f.db.prepare('SELECT dailyMinutes FROM User').get().dailyMinutes,2);
  assert.ok(f.attempts.some(attempt=>attempt.attempt===1));
  f.close();
});
test('lost commit acknowledgement retries the same id without duplicating a mutation',async()=>{
  const f=fixture();f.loseResponse();
  const result=await f.prisma.user.create({data:user('once')});
  assert.equal(result.id,'once');assert.equal(f.db.prepare('SELECT count(*) n FROM User').get().n,1);
  const requests=f.sent.filter(body=>body.operation==='commit');assert.equal(requests.length,2);assert.equal(requests[0].id,requests[1].id);
  assert.equal(f.db.prepare('SELECT count(*) n FROM _ae_commits').get().n,1);
  f.close();
});
test('D1 rejection rolls back the entire batch and is never returned as success',async()=>{
  const f=fixture();await f.prisma.user.create({data:user('rejected')});f.reject();
  await assert.rejects(f.prisma.user.update({where:{id:'rejected'},data:{dailyMinutes:100}}),error=>error.code==='COMMIT_REJECTED');
  assert.equal(f.db.prepare('SELECT dailyMinutes FROM User').get().dailyMinutes,20);
  f.close();
});
test('binary attachments, embedded NUL text and high precision REAL values survive exact replay',async()=>{
  const f=fixture();const bytes=Buffer.from([0,1,2,255,0,128]);const text='A\0B tiếng Việt 🐢';const number=1.2345678901234567;
  // Start with an exact persisted value. Prisma 5's existing native parameter
  // encoder itself rounds some JS floats on INSERT; this test isolates snapshot
  // and journal preservation rather than claiming to fix Prisma's encoder.
  f.db.prepare('INSERT INTO ExactValue(id,b,t,n) VALUES(?,?,?,?)').run('exact',bytes,text,number);
  await f.prisma.$executeRawUnsafe('UPDATE ExactValue SET t=?,b=? WHERE id=?',text,bytes,'exact');
  const stored=f.db.prepare('SELECT b,t,n FROM ExactValue').get();
  assert.deepEqual(Buffer.from(stored.b),bytes);assert.equal(stored.t,text);assert.equal(stored.n,number);
  const rows=await f.prisma.$queryRawUnsafe('SELECT b,t,n FROM ExactValue WHERE id=?','exact');
  assert.deepEqual(Buffer.from(rows[0].b),bytes);assert.equal(rows[0].t,text);assert.equal(rows[0].n,number);
  f.close();
});
test('cascading deletes remain atomic and no child rows survive',async()=>{
  const f=fixture();await f.prisma.user.create({data:{...user('cascade'),notifications:{create:[{title:'Fixture',message:'Cascade',type:'grade'}]}}});
  await f.prisma.user.delete({where:{id:'cascade'}});
  assert.equal(f.db.prepare('SELECT count(*) n FROM User').get().n,0);assert.equal(f.db.prepare('SELECT count(*) n FROM Notification').get().n,0);
  f.close();
});
test('raw schema changes are rejected instead of being silently discarded',async()=>{
  const f=fixture();await assert.rejects(f.prisma.$executeRawUnsafe('CREATE TABLE Unreviewed(id TEXT)'),/reviewed migration/);
  assert.equal(f.db.prepare("SELECT count(*) n FROM sqlite_master WHERE name='Unreviewed'").get().n,0);f.close();
});
test('large database snapshots use bounded pages and retain exact attachment bytes',async()=>{
  const f=fixture();
  const bytes=Buffer.alloc(1024*1024,251);
  const insert=f.db.prepare('INSERT INTO ExactValue(id,b,t,n) VALUES(?,?,?,?)');
  for(let i=0;i<5;i++)insert.run('large-'+i,bytes,'Paged fixture',i+0.25);
  const rows=await f.prisma.$queryRawUnsafe('SELECT id,b,n FROM ExactValue ORDER BY id');
  assert.equal(rows.length,5);assert.deepEqual(Buffer.from(rows[4].b),bytes);assert.equal(rows[4].n,4.25);
  assert.ok(f.sent.some(body=>body.operation==='snapshot-page'));assert.ok(f.sent.some(body=>body.operation==='snapshot-check'));
  const before=f.sent.filter(body=>body.operation==='snapshot-page').length;
  assert.equal((await f.prisma.$queryRawUnsafe('SELECT count(*) n FROM ExactValue'))[0].n,5n);
  assert.equal(f.sent.filter(body=>body.operation==='snapshot-page').length,before,'Unchanged snapshots should reuse the verified private cache');
  f.close();
});

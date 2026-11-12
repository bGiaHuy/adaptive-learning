const test=require('node:test');
const assert=require('node:assert/strict');
const {DatabaseSync}=require('node:sqlite');
let mediaFetch,mediaRange;
test.before(async()=>{({mediaFetch,mediaRange}=await import('../deploy/cloudflare/media-store.mjs'));});
function fixture(failAt){
 const db=new DatabaseSync(':memory:');
 const storage={sql:{exec(sql,...args){if(failAt!==undefined&&sql.startsWith('INSERT INTO chunks')&&args[0]===failAt)throw Error('Injected storage failure');const stmt=db.prepare(sql);const values=args.map(value=>value instanceof ArrayBuffer?new Uint8Array(value):value);const rows=stmt.columns().length?stmt.all(...values):(stmt.run(...values),[]);return{toArray:()=>rows};}},transactionSync(work){db.exec('BEGIN');try{const result=work();db.exec('COMMIT');return result;}catch(error){db.exec('ROLLBACK');throw error;}}};
 return {storage,db,close:()=>db.close()};
}
const put=data=>new Request('https://private.invalid',{method:'PUT',headers:{'content-type':'audio/webm'},body:data});
test('private recordings survive chunk boundaries and range requests exactly',async()=>{
 const f=fixture(),data=new Uint8Array(700000);for(let i=0;i<data.length;i++)data[i]=i%251;
 assert.equal((await mediaFetch(put(data),f.storage)).status,201);
 const head=await mediaFetch(new Request('https://private.invalid',{method:'HEAD'}),f.storage);assert.equal(head.headers.get('content-length'),String(data.length));assert.equal(head.headers.get('content-type'),'audio/webm');assert.match(head.headers.get('etag'),/^"[a-f0-9]{64}"$/);
 const full=await mediaFetch(new Request('https://private.invalid'),f.storage);assert.deepEqual(new Uint8Array(await full.arrayBuffer()),data);assert.equal(full.headers.get('cache-control'),'private, no-store');
 for(const [range,start,end] of [['bytes=262130-262170',262130,262170],['bytes=-100',699900,699999],['bytes=699900-',699900,699999]]){const result=await mediaFetch(new Request('https://private.invalid',{headers:{range}}),f.storage);assert.equal(result.status,206);assert.equal(result.headers.get('content-range'),`bytes ${start}-${end}/${data.length}`);assert.deepEqual(new Uint8Array(await result.arrayBuffer()),data.slice(start,end+1));}
 assert.equal((await mediaFetch(put(data),f.storage)).status,409);f.close();
});
test('upload transaction failure leaves no partial metadata or chunks',async()=>{
 const f=fixture(1);await assert.rejects(mediaFetch(put(new Uint8Array(700000)),f.storage),/Injected/);
 assert.equal(f.db.prepare('SELECT count(*) n FROM metadata').get().n,0);assert.equal(f.db.prepare('SELECT count(*) n FROM chunks').get().n,0);f.close();
});
test('missing recordings, invalid media, excessive size and bad ranges reject safely',async()=>{
 const f=fixture();assert.equal((await mediaFetch(new Request('https://private.invalid'),f.storage)).status,404);
 assert.equal((await mediaFetch(put(new Uint8Array(499)),f.storage)).status,400);
 assert.equal((await mediaFetch(new Request('https://private.invalid',{method:'PUT',headers:{'content-type':'text/html'},body:'not audio'}),f.storage)).status,415);
 assert.equal((await mediaFetch(new Request('https://private.invalid',{method:'PUT',headers:{'content-type':'audio/webm','content-length':String(21*1024*1024)},body:'x'}),f.storage)).status,413);
 await mediaFetch(put(new Uint8Array(1000)),f.storage);
 for(const range of ['bytes=1000-','bytes=10-1','bytes=-0','bytes=0-1,3-4','bytes=-','garbage']){const r=await mediaFetch(new Request('https://private.invalid',{headers:{range}}),f.storage);assert.equal(r.status,416);assert.equal(r.headers.get('content-range'),'bytes */1000');}
 assert.deepEqual(mediaRange('bytes=0-9999',1000),{start:0,end:999,partial:true});f.close();
});

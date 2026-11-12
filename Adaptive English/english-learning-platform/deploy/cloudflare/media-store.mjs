// Private recordings live in SQLite-backed Durable Objects. This requires no R2
// account activation and keeps the existing authenticated application URLs.
export const MAX_MEDIA_BYTES = 20 * 1024 * 1024;
const CHUNK_BYTES = 256 * 1024;
const types = new Set(['audio/webm','audio/mp4','audio/ogg','audio/wav','audio/x-wav','audio/mpeg']);
const json = (body, status) => Response.json(body, {status,headers:{'cache-control':'private, no-store'}});
function schema(storage) {
  storage.sql.exec('CREATE TABLE IF NOT EXISTS metadata(id INTEGER PRIMARY KEY CHECK(id=1),contentType TEXT NOT NULL,size INTEGER NOT NULL,etag TEXT NOT NULL,createdAt INTEGER NOT NULL)');
  storage.sql.exec('CREATE TABLE IF NOT EXISTS chunks(position INTEGER PRIMARY KEY,data BLOB NOT NULL)');
}
async function boundedBody(request) {
  if (Number(request.headers.get('content-length')) > MAX_MEDIA_BYTES) return null;
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const chunks = [];
  let length = 0;
  while (true) {
    const {done,value} = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > MAX_MEDIA_BYTES) { await reader.cancel(); return null; }
    chunks.push(value);
  }
  const data = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {data.set(chunk,offset);offset+=chunk.byteLength;}
  return data;
}
export function mediaRange(value, size) {
  if (!value) return {start:0,end:size-1,partial:false};
  const match = /^bytes=(\d*)-(\d*)$/.exec(value);
  if (!match || (!match[1] && !match[2])) return null;
  let start, end;
  if (!match[1]) {
    const length = Number(match[2]);
    if (!Number.isSafeInteger(length) || length <= 0) return null;
    start = Math.max(0,size-length);end=size-1;
  } else {
    start=Number(match[1]);end=match[2]?Number(match[2]):size-1;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start>=size || end<start) return null;
    end=Math.min(end,size-1);
  }
  return {start,end,partial:true};
}
export async function mediaFetch(request, storage) {
  schema(storage);
  if (request.method === 'PUT') {
    const contentType=(request.headers.get('content-type')||'').split(';')[0].toLowerCase();
    if(!types.has(contentType)) return json({error:'Unsupported recording type'},415);
    const data=await boundedBody(request);
    if(!data) return json({error:'Recording exceeds maximum size'},413);
    if(data.byteLength<500) return json({error:'Recording is too small'},400);
    const digest=await crypto.subtle.digest('SHA-256',data);
    const etag='"'+[...new Uint8Array(digest)].map(value=>value.toString(16).padStart(2,'0')).join('')+'"';
    const stored=storage.transactionSync(()=>{
      if(storage.sql.exec('SELECT id FROM metadata WHERE id=1').toArray().length) return false;
      storage.sql.exec('INSERT INTO metadata(id,contentType,size,etag,createdAt) VALUES(1,?,?,?,?)',contentType,data.byteLength,etag,Date.now());
      for(let offset=0,position=0;offset<data.byteLength;offset+=CHUNK_BYTES,position++) storage.sql.exec('INSERT INTO chunks(position,data) VALUES(?,?)',position,data.slice(offset,offset+CHUNK_BYTES).buffer);
      return true;
    });
    return stored?json({stored:true,size:data.byteLength,contentType},201):json({error:'Recording already exists'},409);
  }
  if(!['GET','HEAD'].includes(request.method)) return new Response(null,{status:405,headers:{allow:'GET, HEAD, PUT','cache-control':'no-store'}});
  const record=storage.sql.exec('SELECT contentType,size,etag FROM metadata WHERE id=1').toArray()[0];
  if(!record) return new Response(null,{status:404,headers:{'cache-control':'no-store'}});
  const range=mediaRange(request.headers.get('range'),record.size);
  if(!range) return new Response(null,{status:416,headers:{'content-range':'bytes */'+record.size,'cache-control':'no-store'}});
  const headers=new Headers({'content-type':record.contentType,'content-length':String(range.end-range.start+1),'cache-control':'private, no-store','accept-ranges':'bytes','etag':record.etag,'x-content-type-options':'nosniff'});
  if(range.partial) headers.set('content-range',`bytes ${range.start}-${range.end}/${record.size}`);
  if(request.method==='HEAD') return new Response(null,{status:range.partial?206:200,headers});
  const first=Math.floor(range.start/CHUNK_BYTES),last=Math.floor(range.end/CHUNK_BYTES);
  const chunks=storage.sql.exec('SELECT position,data FROM chunks WHERE position BETWEEN ? AND ? ORDER BY position',first,last).toArray();
  if(chunks.length!==last-first+1) return json({error:'Recording is incomplete'},503);
  let index=0;
  const stream=new ReadableStream({pull(controller){
    if(index>=chunks.length){controller.close();return;}
    const chunk=chunks[index++];
    const data=chunk.data instanceof Uint8Array?chunk.data:new Uint8Array(chunk.data);
    const begin=Math.max(0,range.start-chunk.position*CHUNK_BYTES);
    const end=Math.min(data.byteLength,range.end-chunk.position*CHUNK_BYTES+1);
    controller.enqueue(data.slice(begin,end));
  }});
  return new Response(stream,{status:range.partial?206:200,headers});
}

// Boundary checks are restricted to the isolated QA app. No real-user files.
const fs=require('node:fs');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const base='http://127.0.0.1:3821';
const accounts=JSON.parse(fs.readFileSync('.artifacts/d1-runtime-lab/e2e-accounts.private.json'));
async function login(account){const response=await fetch(base+'/api/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:account.email,password:account.password})});assert.equal(response.status,200);return response.headers.getSetCookie().map(value=>value.split(';')[0]).join('; ');}
const hash=buffer=>crypto.createHash('sha256').update(buffer).digest('hex');
async function main(){
 const teacherCookie=await login(accounts.find(account=>account.role==='teacher'));
 const classes=await fetch(base+'/api/classes',{headers:{cookie:teacherCookie}}).then(response=>response.json());
 const assignments=await fetch(base+'/api/assignments?classId='+classes.classes[0].id,{headers:{cookie:teacherCookie}}).then(response=>response.json());
 const boundary=assignments.assignments.find(assignment=>assignment.title==='Isolated 2 MiB attachment boundary');
 assert.ok(boundary,'Run the 2 MiB attachment creation check first');
 const list=await fetch(base+'/api/assignments/'+boundary.id+'/attachments',{headers:{cookie:teacherCookie}}).then(response=>response.json());
 const attachment=await fetch(base+'/api/assignments/'+boundary.id+'/attachments?file='+list.attachments[0].id,{headers:{cookie:teacherCookie}});
 assert.equal(attachment.status,200);const bytes=Buffer.from(await attachment.arrayBuffer());assert.equal(bytes.length,2*1024*1024);assert.equal(hash(bytes),hash(Buffer.alloc(bytes.length,97)));
 const studentCookie=await login(accounts.find(account=>account.role==='student'));
 const recording=Buffer.alloc(20*1024*1024,97);recording.write('RIFF');recording.writeUInt32LE(recording.length-8,4);recording.write('WAVEfmt ',8);recording.writeUInt32LE(16,16);recording.writeUInt16LE(1,20);recording.writeUInt16LE(1,22);recording.writeUInt32LE(16000,24);recording.writeUInt32LE(32000,28);recording.writeUInt16LE(2,32);recording.writeUInt16LE(16,34);recording.write('data',36);recording.writeUInt32LE(recording.length-44,40);
 const form=new FormData();form.set('audio',new Blob([recording],{type:'audio/wav'}),'boundary.wav');
 const uploaded=await fetch(base+'/api/audio/upload',{method:'POST',headers:{cookie:studentCookie},body:form,signal:AbortSignal.timeout(90000)});
 const body=await uploaded.json();assert.equal(uploaded.status,200,body.error||'20 MiB recording upload');assert.equal(body.size,recording.length);
 const playback=await fetch(base+body.url,{headers:{cookie:studentCookie},signal:AbortSignal.timeout(90000)});assert.equal(playback.status,200);const restored=Buffer.from(await playback.arrayBuffer());assert.equal(restored.length,recording.length);assert.equal(hash(restored),hash(recording));
 const range=await fetch(base+body.url,{headers:{cookie:studentCookie,range:'bytes=-32'}});assert.equal(range.status,206);assert.deepEqual(Buffer.from(await range.arrayBuffer()),recording.subarray(recording.length-32));
 const publicMedia=await fetch('https://adaptive-english-data-qa.adaptive-learning-c3.workers.dev/v1/media?pathname=not-valid');assert.equal(publicMedia.status,404);
 const result={result:'PASS',environment:'isolated-QA',productionSourceWritten:false,attachment:{bytes:bytes.length,sha256:hash(bytes),allBytesMatch:true},recording:{bytes:restored.length,sha256:hash(restored),allBytesMatch:true,suffixRangeStatus:range.status},unauthenticatedMediaStatus:publicMedia.status};
 fs.writeFileSync('.artifacts/d1-runtime-lab/file-boundaries-results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}
main().catch(error=>{console.error(error.name+': '+error.message);process.exitCode=1;});

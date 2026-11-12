// All mutations target the isolated QA app/data service, never the live source.
const fs=require('node:fs');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const base=process.argv[2]||'http://127.0.0.1:3821';
if(!['127.0.0.1','localhost'].includes(new URL(base).hostname)&&!new URL(base).hostname.startsWith('adaptive-english-qa.'))throw Error('Refusing mutation tests against an unrecognized app');
const output='.artifacts/d1-runtime-lab';
const checks=[];
const accounts=[];
function actor(){return {cookies:new Map()};}
async function request(who,path,{method='GET',body,expected=200,headers={}}={}){
 const h=new Headers(headers);
 if(who?.cookies.size)h.set('cookie',[...who.cookies].map(([k,v])=>k+'='+v).join('; '));
 let data=body;
 if(body!==undefined&&!(body instanceof FormData)&&!(body instanceof Blob)){h.set('content-type','application/json');data=JSON.stringify(body);}
 const began=Date.now();
 const response=await fetch(base+path,{method,headers:h,body:data,redirect:'manual',signal:AbortSignal.timeout(65000)});
 for(const cookie of response.headers.getSetCookie()){const [pair]=cookie.split(';');const equal=pair.indexOf('=');who?.cookies.set(pair.slice(0,equal),pair.slice(equal+1));}
 const type=response.headers.get('content-type')||'';
 const value=type.includes('application/json')?await response.json():Buffer.from(await response.arrayBuffer());
 checks.push({method,path:path.split('?')[0],status:response.status,expected,milliseconds:Date.now()-began});
 assert.equal(response.status,expected,path+' '+(value?.error||''));
 return {response,value};
}
async function signup(role,suffix){
 const who=actor();const email='cloudflare-qa-'+suffix+'-'+Date.now()+'@example.invalid';const password=crypto.randomBytes(24).toString('base64url');
 const {value}=await request(who,'/api/auth/register',{method:'POST',body:{email,password,name:'Isolated migration QA',role}});
 who.user=value.user;accounts.push({email,password,userId:value.user.id,role});
 fs.writeFileSync(output+'/e2e-accounts.private.json',JSON.stringify(accounts,null,2));
 assert.equal((await request(who,'/api/auth/me')).value.user.id,value.user.id);
 return who;
}
async function main(){
 const began=Date.now();
 const health=await request(null,'/api/health');assert.equal(health.value.database,'connected');
 const teacher=await signup('teacher','teacher');
 const student=await signup('student','student');
 const outsider=await signup('student','outsider');
 const {value:created}=await request(teacher,'/api/classes',{method:'POST',body:{name:'Isolated D1 migration class',room:'QA only'}});
 const classroom=created.classroom;
 await request(student,'/api/classes/join',{method:'POST',body:{code:classroom.code}});
 const text=Buffer.from('Migration QA attachment\r\nTiếng Việt — preserved bytes.\n','utf8');
 const {value:assigned}=await request(teacher,'/api/assignments',{method:'POST',body:{classId:classroom.id,title:'Isolated speaking fixture',skill:'speaking',dueDate:'QA fixture only',promptText:'Record a short test clip.',maxScore:10,attachments:[{name:'fixture.txt',base64:text.toString('base64')}]}});
 const assignment=assigned.assignment;
 const {value:changed}=await request(teacher,'/api/assignments/'+assignment.id,{method:'PUT',body:{title:'Isolated speaking fixture version 2',promptText:'Updated QA instructions.',changeNotes:'QA version history test'}});
 assert.equal(changed.newVersion,2);
 await request(outsider,'/api/assignments/'+assignment.id,{expected:403});
 const {value:files}=await request(student,'/api/assignments/'+assignment.id+'/attachments');assert.equal(files.attachments.length,1);
 const {value:download}=await request(student,'/api/assignments/'+assignment.id+'/attachments?file='+files.attachments[0].id);assert.deepEqual(download,text);
 await request(outsider,'/api/assignments/'+assignment.id+'/attachments?file='+files.attachments[0].id,{expected:403});
 const recording=Buffer.alloc(700044);recording.write('RIFF');recording.writeUInt32LE(recording.length-8,4);recording.write('WAVEfmt ',8);recording.writeUInt32LE(16,16);recording.writeUInt16LE(1,20);recording.writeUInt16LE(1,22);recording.writeUInt32LE(16000,24);recording.writeUInt32LE(32000,28);recording.writeUInt16LE(2,32);recording.writeUInt16LE(16,34);recording.write('data',36);recording.writeUInt32LE(recording.length-44,40);
 for(let i=44;i<recording.length;i++)recording[i]=i%251;
 const {value:prepared}=await request(student,'/api/audio/upload',{method:'POST',body:{assignmentId:assignment.id,mimeType:'audio/wav',size:recording.length}});assert.equal(prepared.uploadMode,'cloudflare');
 const form=new FormData();form.set('audio',new Blob([recording],{type:'audio/wav'}),'fixture.wav');form.set('assignmentId',assignment.id);
 const {value:uploaded}=await request(student,'/api/audio/upload',{method:'POST',body:form});assert.ok(uploaded.url.startsWith('/api/audio/play?pathname='));
 const {value:playback}=await request(student,uploaded.url);assert.deepEqual(playback,recording);
 const {response:ranged,value:rangeBytes}=await request(student,uploaded.url,{headers:{range:'bytes=262130-262170'},expected:206});assert.equal(ranged.headers.get('content-range'),`bytes 262130-262170/${recording.length}`);assert.deepEqual(rangeBytes,recording.subarray(262130,262171));
 await request(outsider,uploaded.url,{expected:403});await request(teacher,uploaded.url,{expected:403});
 await request(student,'/api/submissions',{method:'POST',body:{assignmentId:assignment.id,audioUrl:uploaded.url,content:'QA draft',isDraft:true}});
 const {value:submitted}=await request(student,'/api/submissions',{method:'POST',body:{assignmentId:assignment.id,audioUrl:uploaded.url,content:'QA final',isDraft:false}});assert.equal(submitted.status,'pending_grading');
 await request(teacher,uploaded.url);
 await request(teacher,'/api/grading/'+submitted.submissionId,{method:'POST',body:{score:8,feedback:'Isolated grade fixture',publish:false}});
 const {value:hidden}=await request(student,'/api/grading/'+submitted.submissionId);assert.equal(hidden.submission.teacherScore,null);
 await request(teacher,'/api/assignments/'+assignment.id+'/submissions',{method:'POST',body:{action:'publish',confirm:true}});
 const {value:visible}=await request(student,'/api/grading/'+submitted.submissionId);assert.equal(visible.submission.teacherScore,8);assert.equal(visible.submission.status,'graded');
 await request(teacher,'/api/assignments/'+assignment.id+'/submissions',{method:'POST',body:{action:'collect',confirm:true}});
 await request(student,'/api/submissions',{method:'POST',body:{assignmentId:assignment.id,content:'Cannot overwrite',isDraft:true},expected:409});
 await Promise.all([request(student,'/api/vocab',{method:'POST',body:{action:'prepare-daily'}}),request(student,'/api/vocab',{method:'POST',body:{action:'prepare-daily'}})]);
 const {value:vocabulary}=await request(student,'/api/vocab');assert.ok(vocabulary.words.length>0&&vocabulary.words.length<=10);
 const card=vocabulary.words[0];await request(student,'/api/vocab/review',{method:'POST',body:{userVocabId:card.id,rating:3}});
 const result={result:'PASS',environment:base,sourceDatabaseWritten:false,externalDatabaseCredentialsProvided:false,externalBlobCredentialsProvided:false,checks,fixtures:{accounts:accounts.length,assignmentVersions:2,recordingBytes:recording.length,recordingSha256:crypto.createHash('sha256').update(recording).digest('hex'),attachmentBytes:text.length,dailyVocabularyCards:vocabulary.words.length},milliseconds:Date.now()-began,limitations:['Google provider remains unconfigured; no real Google consent/login.','AI calls deliberately unconfigured in the isolated QA app.']};
 fs.writeFileSync(output+'/e2e-results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}
main().catch(error=>{fs.writeFileSync(output+'/e2e-failure.json',JSON.stringify({result:'FAIL',checks,error:error.message},null,2));console.error(error.name+': '+error.message);process.exitCode=1;});

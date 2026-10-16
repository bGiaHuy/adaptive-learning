const assert=require('node:assert/strict');
const {ability:a}=require('./ability-test-loader.cjs');
const {PrismaClient}=require('../artifacts/assignment-ability-20261012/generated');
const db=new PrismaClient();
(async()=>{
 assert.equal(await db.user.count(),0,'This test requires an empty isolated database');
 const teacher=await db.user.create({data:{name:'Synthetic teacher',email:'ability-teacher@example.invalid',passwordHash:'not-a-real-hash',role:'teacher'}});
 const student=await db.user.create({data:{name:'Synthetic student',email:'ability-student@example.invalid',passwordHash:'not-a-real-hash'}});
 const classroom=await db.classroom.create({data:{name:'Isolated ability verification',teacherId:teacher.id,code:'ABL001',room:'Test'}});
 const assignment=await db.assignment.create({data:{classId:classroom.id,title:'Synthetic writing task',skill:'writing',dueDate:'No deadline',promptText:'Describe your school.'}});
 await db.assignmentVersion.create({data:{assignmentId:assignment.id,version:1,title:assignment.title,promptText:assignment.promptText,dueDate:assignment.dueDate,difficultyJson:JSON.stringify({status:'assessed',source:'ai',rating:1200,maxScore:10,skill:'writing'})}});
 let sub=await db.submission.create({data:{assignmentId:assignment.id,studentId:student.id,versionId:1,status:'pending_release',teacherScore:8}});
 assert.equal(a.readAbilityEvidence(sub),null);
 async function publish(score){return db.$transaction(async tx=>{const old=await tx.submission.findUnique({where:{id:sub.id}});const evidence=await a.abilityEvidenceForGrade(tx,old,score);return tx.submission.update({where:{id:sub.id},data:{status:'graded',teacherScore:score,abilityEvidenceJson:evidence}})})}
 sub=await publish(8);const first=a.readAbilityEvidence(sub);assert.equal(a.combineAbility(1200,[first]),1152);
 sub=await publish(8);assert.equal(a.combineAbility(1200,[a.readAbilityEvidence(sub)]),1152);
 sub=await publish(10);assert.equal(a.combineAbility(1200,[a.readAbilityEvidence(sub)]),1200);assert.equal(a.readAbilityEvidence(sub).publishedAt,first.publishedAt);assert.equal(await db.submission.count(),1);
 await db.assignment.update({where:{id:assignment.id},data:{version:2,maxScore:20}});
 await db.assignmentVersion.create({data:{assignmentId:assignment.id,version:2,title:'New version',promptText:'New task',dueDate:'No deadline',difficultyJson:JSON.stringify({status:'assessed',source:'ai',rating:2000,maxScore:20,skill:'writing'})}});
 sub=await publish(8);assert.equal(a.readAbilityEvidence(sub).earnedRating,960);
 await assert.rejects(()=>db.$transaction(async tx=>{await tx.submission.update({where:{id:sub.id},data:{teacherScore:1}});throw Error('controlled rollback')}));
 assert.equal((await db.submission.findUnique({where:{id:sub.id}})).teacherScore,8);
 console.log('PASS real isolated SQLite: first publication1152; repeat unchanged; regrade replaces; old version preserves1200/10; transaction rollback; one submission');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>db.$disconnect());

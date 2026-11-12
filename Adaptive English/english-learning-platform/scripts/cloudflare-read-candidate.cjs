const fs = require('node:fs');
const { createCloudflareStore } = require('../src/lib/cloudflareStore.cjs');
const { PrismaClient } = require('../src/generated/cloudflarePrisma');
async function main() {
  process.env.CLOUDFLARE_DATA_URL = 'https://adaptive-english-data.adaptive-learning-c3.workers.dev/v1/data';
  process.env.CLOUDFLARE_DATA_TOKEN = JSON.parse(fs.readFileSync('.artifacts/d1-runtime-lab/data-secrets.private.json')).CLOUDFLARE_DATA_TOKEN;
  const prisma = createCloudflareStore({PrismaClient});
  const started = Date.now();
  const counts = {users:await prisma.user.count(),assignments:await prisma.assignment.count(),submissions:await prisma.submission.count(),attachments:await prisma.assignmentAttachment.count()};
  const summaries = await prisma.assignment.findMany({include:{classroom:{include:{members:true}},versions:true,attachments:true,submissions:true}});
  if (summaries.length !== counts.assignments) throw new Error('Relational read count mismatch');
  const result = {result:'PASS',provider:'remote-cloudflare-d1',counts,relationalAssignments:summaries.length,milliseconds:Date.now()-started,sourceWritten:false};
  fs.writeFileSync('.artifacts/d1-runtime-lab/remote-read-check.json',JSON.stringify(result,null,2));
  console.log(JSON.stringify(result));
}
main().catch(error=>{console.error('Candidate read failed:',error.name,error.code||'');process.exitCode=1;});

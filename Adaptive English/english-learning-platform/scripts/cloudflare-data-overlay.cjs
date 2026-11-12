const fs = require('node:fs');
const path = require('node:path');
const target = path.resolve('.artifacts/cloudflare-build/app');
if (!fs.existsSync(target)) throw new Error('Prepare the saved live release and Google overlay first.');
for (const file of ['src/lib/cloudflareStore.cjs','src/lib/cloudflarePrisma.ts','src/lib/prisma.ts','src/lib/importAssessment.ts','scripts/generate-cloudflare-prisma.cjs','src/lib/privateAudio.ts','src/lib/audioStorage.ts','src/lib/uploadAudio.ts','src/app/api/audio/upload/route.ts','src/app/api/audio/play/route.ts','src/app/api/audio/upload-token/route.ts','src/app/api/health/route.ts']) {
  fs.mkdirSync(path.dirname(path.join(target,file)),{recursive:true});
  fs.copyFileSync(file,path.join(target,file));
}
console.log('Cloudflare D1 runtime overlay prepared; no live database configuration changed.');

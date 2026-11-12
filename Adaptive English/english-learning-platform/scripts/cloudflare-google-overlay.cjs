// Overlay only reviewed Google-auth files onto the saved live release.
const fs = require('node:fs');
const path = require('node:path');
const target = path.resolve('.artifacts/cloudflare-build/app');
if (!fs.existsSync(target)) throw new Error('Prepare the original Cloudflare release first.');
const copies = ['src/lib/googleIdentity.ts', 'src/components/ui/GoogleSignIn.tsx', 'src/app/api/auth/google', 'prisma/migrations/20261109000000_google_auth'];
for (const file of copies) {
  fs.mkdirSync(path.dirname(path.join(target, file)), {recursive:true});
  fs.cpSync(file, path.join(target, file), {recursive:true});
}
for (const [file, anchor, insert] of [
  ['src/app/auth/login/page.tsx', '        {/* Standard Form */}', '        <GoogleSignIn />\n\n'],
  ['src/app/auth/register/page.tsx', '        <form onSubmit={handleRegister}', '        <GoogleSignIn role={selectedRole} />\n\n'],
  ['src/app/student/settings/page.tsx', '      <div className="bg-white border-2 border-line rounded-lg p-6 space-y-6 shadow-soft">', '      <GoogleSignIn connect />\n\n'],
  ['src/app/teacher/settings/page.tsx', '      {/* Header */}', '      <div className="mb-6"><GoogleSignIn connect /></div>\n\n'],
]) {
  const destination = path.join(target, file);
  let source = fs.readFileSync(destination, 'utf8');
  if (!source.includes('GoogleSignIn')) {
    if (!source.includes(anchor)) throw new Error('Unexpected release source: ' + file);
    source = source.replace('import React', 'import { GoogleSignIn } from "@/components/ui/GoogleSignIn";\nimport React').replace(anchor, insert + anchor);
    fs.writeFileSync(destination, source);
  }
}
const schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
const models = schema.slice(schema.indexOf('\nmodel GoogleAccount'));
const destination = path.join(target, 'prisma/schema.prisma');
let releaseSchema = fs.readFileSync(destination, 'utf8');
if (!releaseSchema.includes('model GoogleAccount')) {
  releaseSchema = releaseSchema.replace('  classrooms          ClassroomMember[]', '  googleAccount       GoogleAccount?\n  classrooms          ClassroomMember[]') + models;
  fs.writeFileSync(destination, releaseSchema);
}
console.log('Google authentication overlay prepared; live registration behavior preserved.');

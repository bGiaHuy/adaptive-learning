const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { envFile } = require('./cloudflare-backup.cjs');
const source = path.resolve('.artifacts/vercel-release-20261014-04');
const target = path.resolve('.artifacts/cloudflare-build/app');
if (fs.existsSync(target)) throw new Error('Build source already exists; preserve it and choose a new directory.');
fs.mkdirSync(target, { recursive: true });
for (const entry of ['src', 'public', 'prisma', 'scripts', 'data', 'package.json', 'package-lock.json', 'next.config.js', 'next-env.d.ts', 'tsconfig.json', 'postcss.config.js', 'tailwind.config.ts']) {
  if (fs.existsSync(path.join(source, entry))) fs.cpSync(path.join(source, entry), path.join(target, entry), { recursive: true });
}
const configFile = path.join(target, 'next.config.js');
let config = fs.readFileSync(configFile, 'utf8').replace('module.exports = {', "module.exports = {\n  output: 'standalone',\n  experimental:PLACEHOLDER");
config = config.replace('  experimental:PLACEHOLDER\n  experimental: {', '  experimental: {\n    cpus: 2,');
fs.writeFileSync(configFile, config);
const health = path.join(target, 'src/app/api/health');
fs.mkdirSync(health, { recursive: true });
fs.writeFileSync(path.join(health, 'route.ts'), `import prisma from '@/lib/prisma';
export const dynamic = 'force-dynamic';
export async function GET() {
  try { await prisma.$queryRaw\`SELECT 1\`; return Response.json({status:'ok',database:'connected'}, {headers:{'cache-control':'no-store'}}); }
  catch { return Response.json({status:'unavailable',database:'unavailable'}, {status:503,headers:{'cache-control':'no-store'}}); }
}
`);
const secrets = envFile('.env.cloudflare-source.local');
const local = envFile('.env.local');
const selected = {};
for (const key of ['DATABASE_URL', 'BLOB_READ_WRITE_TOKEN', 'MWAPI_API_KEY', 'MWAPI_BASE_URL', 'MWAPI_MODEL', 'GEMINI_API_KEY', 'RESEND_API_KEY', 'AUTH_EMAIL_FROM', 'REGISTRATION_OTP_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET']) {
  if (secrets[key] || local[key]) selected[key] = secrets[key] || local[key];
}
fs.writeFileSync('.artifacts/cloudflare-build/secrets.private.json', JSON.stringify(selected));
const hashes = {};
function scan(dir) { for (const item of fs.readdirSync(dir, {withFileTypes:true})) {const file=path.join(dir,item.name);if(item.isDirectory())scan(file);else hashes[path.relative(target,file).replaceAll('\\','/')]=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');} }
scan(target);
fs.writeFileSync('.artifacts/cloudflare-build/source-manifest.json', JSON.stringify({ source:'.artifacts/vercel-release-20261014-04', sourceDeployment:'dpl_8WWUofaVEU1wjjHJzskcMqHGPB8Q', hashes },null,2));
console.log(JSON.stringify({prepared: true, files: Object.keys(hashes).length, runtimeSecretNames: Object.keys(selected), source:'.artifacts/vercel-release-20261014-04'}));

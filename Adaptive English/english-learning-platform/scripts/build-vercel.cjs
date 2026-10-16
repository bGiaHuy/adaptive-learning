const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

// This command runs in the isolated release directory or Vercel build environment.
// npm run build and the canonical SQLite schema remain suitable for local use.
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl || !/^postgres(?:ql)?:\/\//.test(databaseUrl)) {
  console.error('DATABASE_URL must be a PostgreSQL connection configured on Vercel.');
  process.exit(1);
}
const source = fs.readFileSync('prisma/schema.prisma', 'utf8');
const schema = source.replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"')
  .replace(/url\s*=\s*"file:\.\/dev\.db"/, 'url = env("DATABASE_URL")');
if (schema === source || !schema.includes('provider = "postgresql"') || !schema.includes('url = env("DATABASE_URL")')) {
  throw new Error('Unexpected canonical schema; refusing an incomplete conversion.');
}
fs.writeFileSync('prisma/schema.vercel.prisma', schema);
if (process.argv.includes('--schema-only')) process.exit(0);
for (const [file, args] of [
  ['prisma/build/index.js', ['generate', '--schema', 'prisma/schema.vercel.prisma']],
  ['next/dist/bin/next', ['build']],
]) {
  const result = spawnSync(process.execPath, [path.join(process.cwd(), 'node_modules', file), ...args], {stdio:'inherit', env:process.env});
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

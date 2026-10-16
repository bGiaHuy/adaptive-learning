const fs = require('node:fs');
const path = require('node:path');
const release = path.resolve(__dirname, '../../../english-learning-platform/.artifacts/vercel-release-20261010');
process.chdir(release);
require(path.join(release, 'node_modules/@next/env')).loadEnvConfig(release, false);
const { PrismaClient } = require(path.join(release, 'node_modules/@prisma/client'));
const prisma = new PrismaClient();
const email = 'codex-prod-check-20261010@example.invalid';
(async () => {
  const before = await prisma.user.count({where:{email}});
  if (before !== 1) throw new Error(`Expected exactly one synthetic user, found ${before}; refusing cleanup.`);
  const deleted = await prisma.user.deleteMany({where:{email}});
  const after = await prisma.user.count({where:{email}});
  if (deleted.count !== 1 || after !== 0) throw new Error('Synthetic user cleanup verification failed.');
  const result = {target:'synthetic account only', email, before, deleted:deleted.count, after, cascades:'schema relations'};
  fs.writeFileSync(path.join(__dirname,'prod-cleanup-result.json'), JSON.stringify(result,null,2));
  console.log(JSON.stringify({deleted:deleted.count,remaining:after}));
})().finally(() => prisma.$disconnect());

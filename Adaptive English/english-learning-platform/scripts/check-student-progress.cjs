const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, role: true } });
  for (const u of users) {
    const attempts = await prisma.lessonAttempt.findMany({ where: { userId: u.id } });
    const subs = await prisma.submission.findMany({ where: { studentId: u.id } });
    const profiles = await prisma.studentSkillProfile.findMany({ where: { userId: u.id } });
    if (attempts.length > 0 || subs.length > 0 || profiles.length > 0) {
      console.log('=== USER', u.email, '===');
      console.log('Attempts:', JSON.stringify(attempts, null, 2));
      console.log('Submissions:', JSON.stringify(subs, null, 2));
      console.log('Profiles:', JSON.stringify(profiles, null, 2));
    }
  }
  await prisma.$disconnect();
})();

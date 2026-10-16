const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Password123!', 10);
  const accounts = [
    { email: 'student1@journey.test', name: 'Học sinh Lê Tuấn', role: 'student' },
    { email: 'student2@journey.test', name: 'Học sinh Mai Phương', role: 'student' },
    { email: 'teacher1@journey.test', name: 'Thầy Vũ Hoàng', role: 'teacher' },
    { email: 'teacher2@journey.test', name: 'Cô Minh Thư', role: 'teacher' },
    { email: 'admin@journey.test', name: 'Quản trị viên Hệ thống', role: 'admin' },
  ];

  for (const acc of accounts) {
    const existing = await prisma.user.findUnique({ where: { email: acc.email } });
    if (!existing) {
      const created = await prisma.user.create({
        data: {
          email: acc.email,
          name: acc.name,
          role: acc.role,
          passwordHash: hash,
        },
      });
      console.log('Created account:', acc.email, created.role);
    } else {
      await prisma.user.update({
        where: { id: existing.id },
        data: { passwordHash: hash, name: acc.name, role: acc.role },
      });
      console.log('Ensured account:', acc.email, acc.role);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

import { PrismaClient, UserRole, UserStatus, TeacherVerificationStatus, CognitiveLevel, QuestionStatus } from '@prisma/client';
import * as argon2 from '@node-rs/argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial database data...');

  // Default secure dev password hashed with Argon2id
  const defaultPassword = 'P@ssword123!';
  const passwordHash = await argon2.hash(defaultPassword, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1
  });

  // 1. Create Super Admin
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@adaptivemath.vn',
      fullName: 'Hệ Thống Quản Trị',
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      permissionVersion: 1
    }
  });

  // 2. Create Verified Teacher
  const teacherUser = await prisma.user.upsert({
    where: { username: 'thaynam' },
    update: {},
    create: {
      username: 'thaynam',
      email: 'thaynam@adaptivemath.vn',
      fullName: 'Thầy Nguyễn Văn Nam',
      passwordHash,
      role: UserRole.TEACHER,
      status: UserStatus.ACTIVE,
      permissionVersion: 1,
      teacherProfile: {
        create: {
          schoolName: 'THCS Chu Văn An, Hà Nội',
          city: 'Hà Nội',
          verificationStatus: TeacherVerificationStatus.VERIFIED,
          verifiedAt: new Date(),
          verifiedByAdminId: adminUser.id
        }
      }
    }
  });

  // 3. Create Teacher Applicant (Pending Verification)
  await prisma.user.upsert({
    where: { username: 'teacher_pending' },
    update: {},
    create: {
      username: 'teacher_pending',
      email: 'teacher.applicant@adaptivemath.vn',
      fullName: 'Cô Lê Thị Mai',
      passwordHash,
      role: UserRole.TEACHER_APPLICANT,
      status: UserStatus.ACTIVE,
      permissionVersion: 1,
      teacherProfile: {
        create: {
          schoolName: 'THCS Giảng Võ, Hà Nội',
          city: 'Hà Nội',
          verificationStatus: TeacherVerificationStatus.PENDING_REVIEW
        }
      }
    }
  });

  // 4. Create Student
  const studentUser = await prisma.user.upsert({
    where: { username: 'duc_nguyen' },
    update: {},
    create: {
      username: 'duc_nguyen',
      email: 'hocsinh.demo4564@adaptivemath.vn',
      fullName: 'Nguyễn Minh Đức',
      passwordHash,
      role: UserRole.STUDENT,
      status: UserStatus.ACTIVE,
      permissionVersion: 1,
      studentProfile: {
        create: {
          grade: 9,
          targetGoal: 'Ôn thi vào lớp 10',
          dailyMinutes: 45,
          examDate: '05/06/2027',
          selfAssessment: 'Khá'
        }
      }
    }
  });

  // 5. Create 8 Pilot Skills (from CONTENT-READINESS.md)
  const skillsData = [
    { code: 'SKILL-01', title: 'Căn bậc hai và căn thức cơ bản', chapter: 'CĂN BẬC HAI VÀ CĂN BẬC BA', orderIndex: 1 },
    { code: 'SKILL-02', title: 'Biến đổi và tính toán với căn thức', chapter: 'CĂN BẬC HAI VÀ CĂN BẬC BA', orderIndex: 2 },
    { code: 'SKILL-03', title: 'Phương trình bậc nhất 2 ẩn và Giải hệ phương trình', chapter: 'PHƯƠNG TRÌNH VÀ HỆ HAI PHƯƠNG TRÌNH', orderIndex: 3 },
    { code: 'SKILL-04', title: 'Giải bài toán bằng cách lập hệ phương trình', chapter: 'PHƯƠNG TRÌNH VÀ HỆ HAI PHƯƠNG TRÌNH', orderIndex: 4 },
    { code: 'SKILL-05', title: 'Phương trình bậc hai một ẩn', chapter: 'HÀM SỐ BẬC HAI VÀ PHƯƠNG TRÌNH BẬC HAI', orderIndex: 5 },
    { code: 'SKILL-06', title: 'Định lý Viète và ứng dụng', chapter: 'HÀM SỐ BẬC HAI VÀ PHƯƠNG TRÌNH BẬC HAI', orderIndex: 6 },
    { code: 'SKILL-07', title: 'Tỉ số lượng giác của góc nhọn', chapter: 'HỆ THỨC LƯỢNG TRONG TAM GIÁC VUÔNG', orderIndex: 7 },
    { code: 'SKILL-08', title: 'Đường tròn và góc nội tiếp', chapter: 'ĐƯỜNG TRÒN', orderIndex: 8 }
  ];

  for (const s of skillsData) {
    const skill = await prisma.skillNode.upsert({
      where: { code: s.code },
      update: {},
      create: {
        code: s.code,
        title: s.title,
        grade: 9,
        chapter: s.chapter,
        orderIndex: s.orderIndex
      }
    });

    // Add sample questions for SKILL-02 (matching video 01:34)
    if (s.code === 'SKILL-02') {
      const q1 = await prisma.question.create({
        data: {
          skillId: skill.id,
          versionNumber: 1,
          cognitiveLevel: CognitiveLevel.REMEMBERING,
          content: 'Rút gọn \\sqrt{245} được',
          explanation: 'Ta có $245 = 49 \\times 5 = 7^2 \\times 5$. Do đó $\\sqrt{245} = \\sqrt{7^2 \\times 5} = 7\\sqrt{5}$.',
          status: QuestionStatus.PUBLISHED,
          authorId: teacherUser.id,
          reviewerId: adminUser.id,
          options: {
            create: [
              { optionKey: 'A', content: '\\sqrt{35}', isCorrect: false },
              { optionKey: 'B', content: '7\\sqrt{5}', isCorrect: true },
              { optionKey: 'C', content: '5\\sqrt{7}', isCorrect: false },
              { optionKey: 'D', content: '49\\sqrt{5}', isCorrect: false }
            ]
          }
        }
      });
    }
  }

  // 6. Create Classroom for Verified Teacher with Crockford code KTR2QX79 if not exists
  const existingClass = await prisma.classroom.findFirst({
    where: { name: 'Toán 9A1 - Thầy Nguyễn Văn Nam' }
  });

  if (!existingClass) {
    await prisma.classroom.create({
      data: {
        teacherId: teacherUser.id,
        name: 'Toán 9A1 - Thầy Nguyễn Văn Nam',
        grade: 9,
        academicYear: '2026-2027',
        isActive: true,
        inviteCodes: {
          create: {
            codeHash: 'HMAC_HASH_KTR2QX79',
            codePlainPrefix: 'KTR',
            maxUses: 45,
            usedCount: 0,
            expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000)
          }
        }
      }
    });
  }

  console.log('Database seeded successfully!');
  console.log('Sample Accounts created:');
  console.log('- Admin: admin / P@ssword123!');
  console.log('- Verified Teacher: thaynam / P@ssword123!');
  console.log('- Teacher Applicant: teacher_pending / P@ssword123!');
  console.log('- Student: duc_nguyen / P@ssword123!');
  console.log('- Class code: KTR2QX79');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

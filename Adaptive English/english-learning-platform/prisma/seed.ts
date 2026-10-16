import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { thematicPackUnit2 } from '../src/lib/thematicPackUnit2';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Bắt đầu Seeding Database Thật ---');

  // 1. Tạo Users với mật khẩu hash
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      passwordHash,
      name: 'Nguyễn Văn A',
      role: 'student',
      cefrTarget: 'B2',
      dailyMinutes: 25,
      vocabDailyLimit: 10,
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@example.com' },
    update: {},
    create: {
      email: 'teacher@example.com',
      passwordHash,
      name: 'Thầy Vũ Hoàng (M.A TESOL)',
      role: 'teacher',
      dailyMinutes: 60,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash,
      name: 'Quản Trị Viên Hệ Thống',
      role: 'admin',
    },
  });

  console.log('✓ Đã tạo 3 người dùng: Student, Teacher, Admin');

  // 2. Tạo Classrooms
  const class1 = await prisma.classroom.upsert({
    where: { code: 'IEL789' },
    update: {},
    create: {
      code: 'IEL789',
      name: 'IELTS Academic Target 6.5 (K24)',
      teacherId: teacher.id,
      room: 'Online Hub Room A',
    },
  });

  const class2 = await prisma.classroom.upsert({
    where: { code: 'ENG456' },
    update: {},
    create: {
      code: 'ENG456',
      name: 'Reading & Writing Lab B1+',
      teacherId: teacher.id,
      room: 'Phòng B204',
    },
  });

  // Thêm Student vào cả 2 lớp
  await prisma.classroomMember.upsert({
    where: { classId_studentId: { classId: class1.id, studentId: student.id } },
    update: {},
    create: { classId: class1.id, studentId: student.id },
  });

  await prisma.classroomMember.upsert({
    where: { classId_studentId: { classId: class2.id, studentId: student.id } },
    update: {},
    create: { classId: class2.id, studentId: student.id },
  });

  console.log('✓ Đã tạo 2 lớp học và đăng ký học sinh');

  // 3. Tạo Courses & Units & Lessons
  const course = await prisma.course.upsert({
    where: { id: 'course-ielts-b1' },
    update: {},
    create: {
      id: 'course-ielts-b1',
      title: 'Academic English Foundation B1',
      description: 'Chương trình phát triển toàn diện 4 kỹ năng học thuật theo khung CEFR B1.',
      level: 'B1',
    },
  });

  const unit1 = await prisma.unit.upsert({
    where: { id: 'unit-1-listening' },
    update: {},
    create: {
      id: 'unit-1-listening',
      courseId: course.id,
      order: 1,
      title: 'Unit 1: Nghe Bắt Thông Tin & Giao Tiếp Học Thuật',
      level: 'B1',
      description: 'Luyện tập kỹ thuật Skimming & Scanning, nghe nhận diện từ khóa và hội thoại.',
    },
  });

  await prisma.lesson.upsert({
    where: { id: 'lesson-reading-01' },
    update: {},
    create: {
      id: 'lesson-reading-01',
      unitId: unit1.id,
      order: 1,
      title: 'Skimming & Scanning: Đời Sống Hoang Dã',
      skill: 'reading',
      durationMinutes: 12,
      targetCefr: 'B1',
    },
  });

  await prisma.lesson.upsert({
    where: { id: 'lesson-listening-01' },
    update: {},
    create: {
      id: 'lesson-listening-01',
      unitId: unit1.id,
      order: 2,
      title: 'Đặt Lịch Hẹn & Tra Cứu Thông Tin Dịch Vụ',
      skill: 'listening',
      durationMinutes: 10,
      targetCefr: 'B1',
    },
  });

  // 4. Tạo Thematic Pack thực tế từ file GỦI.docx (Unit 2: Healthy Living)
  const pack = await prisma.thematicPack.upsert({
    where: { id: thematicPackUnit2.id },
    update: {},
    create: {
      id: thematicPackUnit2.id,
      title: thematicPackUnit2.title,
      cefrLevel: thematicPackUnit2.cefrLevel,
      targetAudience: thematicPackUnit2.targetAudience,
      sourceFileName: 'GỦI.docx',
    },
  });

  // Tạo 41 Từ vựng
  for (const v of thematicPackUnit2.vocabulary) {
    const vItem = await prisma.vocabularyItem.create({
      data: {
        packId: pack.id,
        no: v.no,
        word: v.word,
        type: v.type,
        ipa: v.ipa,
        meaning: v.meaning,
      },
    });

    // Personal cards and review progress must come from learner actions, never seed fixtures.
  }

  // Tạo 8 Word Form families
  for (const wf of thematicPackUnit2.wordForms) {
    await prisma.wordFormFamily.create({
      data: {
        packId: pack.id,
        root: wf.root,
        meaning: wf.meaning,
        derivativesJson: JSON.stringify(wf.derivatives),
      },
    });
  }

  // Tạo Grammar Topic
  await prisma.grammarTopic.create({
    data: {
      packId: pack.id,
      title: thematicPackUnit2.grammar.title,
      description: thematicPackUnit2.grammar.description,
      patternsJson: JSON.stringify(thematicPackUnit2.grammar.patterns),
    },
  });

  // Tạo 27 Exercises
  for (const ex of thematicPackUnit2.exercises) {
    await prisma.exercise.create({
      data: {
        packId: pack.id,
        exerciseNumber: ex.exerciseNumber,
        title: ex.title,
        category: ex.category,
        type: ex.type,
        instruction: ex.instruction,
        questionCount: ex.questionCount,
        hasImages: !!ex.hasImages,
        imageCount: ex.imageCount || 0,
        audioMissing: !!ex.audioMissing,
        hasSourceError: !!ex.hasSourceError,
        sourceErrorNotes: ex.sourceErrorNotes || null,
        suggestedFix: ex.suggestedFix || null,
        originalFormatNote: ex.originalFormatNote || null,
        dataJson: JSON.stringify(ex.sampleItems || []),
      },
    });
  }

  console.log('✓ Đã nạp trọn bộ Thematic Pack "Unit 2: Healthy Living" (41 từ, 8 word forms, grammar, 27 exercises)');

  // 5. Tạo Assignments & Submissions
  const assign1 = await prisma.assignment.create({
    data: {
      classId: class1.id,
      title: 'Writing Task 2: Remote Learning vs. Traditional Classrooms',
      skill: 'writing',
      dueDate: '23:59 ngày mai',
      version: 1,
      status: 'published',
      maxScore: 9.0,
      allowAiTutor: true,
      promptText:
        'Some people believe that online education will completely replace physical universities in the near future. To what extent do you agree or disagree? Write at least 250 words.',
    },
  });

  await prisma.submission.create({
    data: {
      assignmentId: assign1.id,
      studentId: student.id,
      versionId: 1,
      status: 'pending_grading',
      content:
        'In recent years, the rapid advancement of digital technology has transformed the educational landscape. While remote learning offers unparalleled flexibility, I firmly believe that traditional classrooms remain irreplaceable due to face-to-face social interaction...',
      aiPreGradeJson: JSON.stringify({
        estimatedBand: '6.5',
        fluencyOrCoherence: 6.5,
        lexicalResource: 6.5,
        grammarAccuracy: 6.0,
        summary:
          'Đoạn văn mở bài và thân bài 1 có luận điểm rõ ràng, sử dụng tốt các từ nối như "unparalleled flexibility" và "irreplaceable". Lỗi ngữ pháp nhẹ ở vế câu điều kiện.',
      }),
      submittedAt: new Date(),
    },
  });

  const assign2 = await prisma.assignment.create({
    data: {
      classId: class1.id,
      title: 'Speaking Part 2: A Time You Solved a Difficult Problem',
      skill: 'speaking',
      dueDate: 'Đã hoàn thành',
      version: 1,
      status: 'published',
      maxScore: 9.0,
      allowAiTutor: true,
      promptText: 'Describe a challenge you faced and how you overcame it.',
    },
  });

  await prisma.submission.create({
    data: {
      assignmentId: assign2.id,
      studentId: student.id,
      versionId: 1,
      status: 'graded',
      teacherScore: 6.5,
      teacherFeedback:
        'Ý tưởng phát triển mạch lạc, phát âm âm cuối /t/ và /d/ rất rõ. Em cần chú ý thêm cấu trúc câu điều kiện loại 3 khi nhắc về quá khứ nhé!',
      aiPreGradeJson: JSON.stringify({
        estimatedBand: '6.5',
        fluencyOrCoherence: 6.5,
        lexicalResource: 6.0,
        grammarAccuracy: 6.0,
        summary: 'Fluency 6.5, Pronunciation 7.0, Grammar 6.0',
      }),
      submittedAt: new Date(),
      gradedAt: new Date(),
    },
  });

  // 6. Tạo Student Skill Profile
  const skills = [
    { skill: 'reading', level: 'B1', scoreDisplay: 'B1 (Intermediate)', confidence: 82, evidenceCount: 24, independentRate: 75 },
    { skill: 'listening', level: 'B1', scoreDisplay: 'B1+ (Threshold High)', confidence: 78, evidenceCount: 19, independentRate: 80 },
    { skill: 'writing', level: 'Chưa đánh giá', scoreDisplay: 'Đang chờ chấm bài nộp Task 2', confidence: 25, evidenceCount: 1, independentRate: 0 },
    { skill: 'speaking', level: 'B1', scoreDisplay: 'B1 (Band 6.5)', confidence: 75, evidenceCount: 2, independentRate: 90 },
    { skill: 'vocabulary', level: 'B1', scoreDisplay: 'B1 (640 từ đã ghi nhận)', confidence: 85, evidenceCount: 52, independentRate: 88 },
    { skill: 'grammar', level: 'B1', scoreDisplay: 'B1 (Thì & Cấu trúc phức)', confidence: 80, evidenceCount: 30, independentRate: 70 },
  ];

  for (const sk of skills) {
    await prisma.studentSkillProfile.upsert({
      where: { userId_skill: { userId: student.id, skill: sk.skill } },
      update: {},
      create: {
        userId: student.id,
        skill: sk.skill,
        level: sk.level,
        scoreDisplay: sk.scoreDisplay,
        confidence: sk.confidence,
        evidenceCount: sk.evidenceCount,
        independentRate: sk.independentRate,
      },
    });
  }

  // 7. Tạo Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: student.id,
        title: 'Bài tập mới từ Thầy Vũ Hoàng',
        message: 'Lớp IELTS Academic Target 6.5 vừa có bài mới: Writing Task 2.',
        type: 'assignment',
        unread: true,
      },
      {
        userId: student.id,
        title: 'Giáo viên đã trả điểm bài Speaking',
        message: 'Thầy Hoàng đã chấm bài "Speaking Part 2": Điểm 6.5 / 9.0 kèm nhận xét.',
        type: 'grade',
        unread: true,
      },
      {
        userId: student.id,
        title: 'Nhắc nhở ôn tập từ vựng FSRS',
        message: 'Bạn có từ vựng chủ đề Healthy Living đến hạn ôn hôm nay!',
        type: 'reminder',
        unread: false,
      },
    ],
  });

  console.log('✓ Hoàn tất Seed Database thật thành công 100%!');
}

main()
  .catch((e) => {
    console.error('Lỗi khi seed database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

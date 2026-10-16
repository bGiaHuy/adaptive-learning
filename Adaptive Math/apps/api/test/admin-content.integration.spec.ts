import 'reflect-metadata';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Admin and Content Maker-Checker Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const suffix = `${Date.now()}_${Math.random().toString(16).slice(2)}`;

  let adminId: string;
  let adminCookie: string;
  let authorId: string;
  let authorCookie: string;
  let reviewerId: string;
  let reviewerCookie: string;
  let teacherApplicantId: string;
  let skillId: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.SESSION_COOKIE_NAME = 'am_session';
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleRef.createNestApplication(new ExpressAdapter());
    app.use(cookieParser());
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
    prisma = app.get(PrismaService);

    // Get an existing SkillNode for question tests
    const skill = await prisma.skillNode.findFirst();
    if (!skill) {
      throw new Error('No skill node in database. Run seed first.');
    }
    skillId = skill.id;

    // 1. Setup Admin
    const adminReg = await request(app.getHttpServer())
      .post('/api/v1/auth/register/student')
      .send({
        username: `adm_${suffix}`.slice(0, 30),
        email: `adm_${suffix}@test.adaptivemath.local`,
        fullName: 'Admin Quản Trị',
        password: 'P@ssword123!'
      });
    adminId = adminReg.body.id;
    await prisma.user.update({
      where: { id: adminId },
      data: { role: 'ADMIN' }
    });
    const admLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ identifier: `adm_${suffix}`.slice(0, 30), password: 'P@ssword123!' });
    adminCookie = admLogin.headers['set-cookie'][0].split(';')[0];

    // 2. Setup Author (CONTENT_AUTHOR)
    const authorReg = await request(app.getHttpServer())
      .post('/api/v1/auth/register/student')
      .send({
        username: `aut_${suffix}`.slice(0, 30),
        email: `aut_${suffix}@test.adaptivemath.local`,
        fullName: 'Tác Giả Câu Hỏi',
        password: 'P@ssword123!'
      });
    authorId = authorReg.body.id;
    await prisma.user.update({
      where: { id: authorId },
      data: { role: 'CONTENT_AUTHOR' }
    });
    const autLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ identifier: `aut_${suffix}`.slice(0, 30), password: 'P@ssword123!' });
    authorCookie = autLogin.headers['set-cookie'][0].split(';')[0];

    // 3. Setup Reviewer (CONTENT_REVIEWER)
    const revReg = await request(app.getHttpServer())
      .post('/api/v1/auth/register/student')
      .send({
        username: `rev_${suffix}`.slice(0, 30),
        email: `rev_${suffix}@test.adaptivemath.local`,
        fullName: 'Người Duyệt Câu Hỏi',
        password: 'P@ssword123!'
      });
    reviewerId = revReg.body.id;
    await prisma.user.update({
      where: { id: reviewerId },
      data: { role: 'CONTENT_REVIEWER' }
    });
    const revLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ identifier: `rev_${suffix}`.slice(0, 30), password: 'P@ssword123!' });
    reviewerCookie = revLogin.headers['set-cookie'][0].split(';')[0];

    // 4. Setup Teacher Applicant
    const utEmail = `app_${suffix}@test.adaptivemath.local`;
    const utReg = await request(app.getHttpServer())
      .post('/api/v1/auth/register/teacher')
      .send({
        email: utEmail,
        fullName: 'Giáo Viên Ứng Tuyển',
        password: 'P@ssword123!',
        schoolName: 'THCS Sư Phạm'
      });
    teacherApplicantId = utReg.body.id;
  });

  afterAll(async () => {
    const ids = [adminId, authorId, reviewerId, teacherApplicantId].filter(Boolean);
    if (ids.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: ids } } }).catch(() => undefined);
    }
    await app.close();
  });

  it('allows Admin to review teacher applicants and grant TEACHER role', async () => {
    // 1. Admin gets overview
    const overview = await request(app.getHttpServer())
      .get('/api/v1/admin/overview')
      .set('Cookie', adminCookie)
      .expect(200);
    expect(overview.body.totalUsers).toBeGreaterThan(0);

    // 2. Admin approves applicant
    const reviewRes = await request(app.getHttpServer())
      .post(`/api/v1/admin/teachers/${teacherApplicantId}/review`)
      .set('Cookie', adminCookie)
      .send({ status: 'VERIFIED' })
      .expect(200);

    expect(reviewRes.body.newRole).toBe('TEACHER');

    const updatedUser = await prisma.user.findUnique({ where: { id: teacherApplicantId } });
    expect(updatedUser?.role).toBe('TEACHER');
  });

  it('enforces Maker-Checker principle on question review', async () => {
    // 1. Author creates DRAFT question
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/admin/questions')
      .set('Cookie', authorCookie)
      .send({
        skillId,
        cognitiveLevel: 'UNDERSTANDING',
        content: 'Tìm $x$ biết $x^2 - 4 = 0$',
        explanation: 'Phương trình tương đương $(x-2)(x+2) = 0 \\Leftrightarrow x = \\pm 2$',
        options: [
          { optionKey: 'A', content: '$x = 2$', isCorrect: false },
          { optionKey: 'B', content: '$x = -2$', isCorrect: false },
          { optionKey: 'C', content: '$x = \\pm 2$', isCorrect: true },
          { optionKey: 'D', content: '$x = 4$', isCorrect: false }
        ]
      })
      .expect(201);

    const questionId = createRes.body.question.id;
    expect(createRes.body.question.status).toBe('DRAFT');

    // 2. Author attempts to approve their OWN question -> 403 MAKER_CHECKER_VIOLATION
    const violationRes = await request(app.getHttpServer())
      .patch(`/api/v1/admin/questions/${questionId}/review`)
      .set('Cookie', authorCookie)
      .send({ status: 'PUBLISHED' })
      .expect(403);

    expect(violationRes.body.code).toBe('MAKER_CHECKER_VIOLATION');

    // 3. Different reviewer approves the question -> 200 OK
    const approveRes = await request(app.getHttpServer())
      .patch(`/api/v1/admin/questions/${questionId}/review`)
      .set('Cookie', reviewerCookie)
      .send({ status: 'PUBLISHED' })
      .expect(200);

    expect(approveRes.body.question.status).toBe('PUBLISHED');
    expect(approveRes.body.question.reviewerId).toBe(reviewerId);

    // 4. Verify audit log entry exists
    const logsRes = await request(app.getHttpServer())
      .get('/api/v1/admin/audit-logs')
      .set('Cookie', adminCookie)
      .expect(200);

    expect(logsRes.body.length).toBeGreaterThan(0);
    const hasQuestionReview = logsRes.body.some(
      (log: any) => log.action === 'QUESTION_REVIEWED' && log.targetEntityId === questionId
    );
    expect(hasQuestionReview).toBe(true);
  });

  it('handles teacher profile rejection, resubmission and re-approval workflow', async () => {
    // 1. Create a teacher applicant
    const reEmail = `rej_${suffix}@test.adaptivemath.local`;
    const reReg = await request(app.getHttpServer())
      .post('/api/v1/auth/register/teacher')
      .send({
        email: reEmail,
        fullName: 'Giáo Viên Ứng Tuyển Lại',
        password: 'P@ssword123!',
        schoolName: 'THCS Tạm'
      });
    const rejId = reReg.body.id;

    // Login as the applicant
    const reLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ identifier: reEmail, password: 'P@ssword123!' });
    const rejCookie = reLogin.headers['set-cookie'][0].split(';')[0];

    // 2. Admin rejects this applicant with reason
    await request(app.getHttpServer())
      .post(`/api/v1/admin/teachers/${rejId}/review`)
      .set('Cookie', adminCookie)
      .send({ status: 'REJECTED', rejectionReason: 'Cần bổ sung chính xác tên trường và tỉnh thành' })
      .expect(200);

    const profAfterReject = await prisma.teacherProfile.findUnique({ where: { userId: rejId } });
    expect(profAfterReject?.verificationStatus).toBe('REJECTED');
    expect(profAfterReject?.rejectionReason).toBe('Cần bổ sung chính xác tên trường và tỉnh thành');

    // 3. Teacher updates profile and resubmits via PUT /auth/teacher-profile
    const updateRes = await request(app.getHttpServer())
      .put('/api/v1/auth/teacher-profile')
      .set('Cookie', rejCookie)
      .send({
        schoolName: 'THPT Chu Văn An',
        city: 'Hà Nội'
      })
      .expect(200);

    expect(updateRes.body.user.teacherProfile.verificationStatus).toBe('PENDING_REVIEW');
    expect(updateRes.body.user.teacherProfile.schoolName).toBe('THPT Chu Văn An');
    expect(updateRes.body.user.teacherProfile.city).toBe('Hà Nội');
    expect(updateRes.body.user.teacherProfile.rejectionReason).toBeNull();

    // 4. Verify audit log contains TEACHER_APPLICATION_RESUBMITTED
    const auditRes = await request(app.getHttpServer())
      .get('/api/v1/admin/audit-logs')
      .set('Cookie', adminCookie)
      .expect(200);
    const hasResubmitLog = auditRes.body.some(
      (log: any) => log.action === 'TEACHER_APPLICATION_RESUBMITTED' && log.actorUserId === rejId
    );
    expect(hasResubmitLog).toBe(true);

    // 5. Admin can now approve resubmitted profile
    await request(app.getHttpServer())
      .post(`/api/v1/admin/teachers/${rejId}/review`)
      .set('Cookie', adminCookie)
      .send({ status: 'VERIFIED' })
      .expect(200);

    const finalUser = await prisma.user.findUnique({ where: { id: rejId } });
    expect(finalUser?.role).toBe('TEACHER');

    // Cleanup
    await prisma.user.delete({ where: { id: rejId } }).catch(() => undefined);
  });

  it('enforces Maker-Checker on English lesson import and review', async () => {
    const topicId = `top_${suffix}`.slice(0, 30);
    const lessonId = `les_${suffix}`.slice(0, 30);

    // 1. Author imports an English batch
    const importPayload = {
      topics: [{ id: topicId, title: 'English Test Topic' }],
      lessons: [{
        id: lessonId,
        topicId: topicId,
        title: 'Present Perfect Tense',
        level: 'B1',
        kind: 'GRAMMAR',
        published: true, // Attempt to publish on import
        exercises: [{
          id: `ex_${suffix}`.slice(0, 30),
          kind: 'SINGLE_CHOICE',
          prompt: 'I ___ here for three years.',
          options: ['live', 'have lived', 'lived', 'living'],
          correctAnswer: 'have lived',
          explanation: 'Present perfect indicates action continuing to present.'
        }]
      }]
    };

    const importRes = await request(app.getHttpServer())
      .post('/api/v1/english/import')
      .set('Cookie', authorCookie)
      .send(importPayload)
      .expect(201);

    expect(importRes.body.lessons).toBe(1);

    // 2. Verify imported lesson is NOT published (forced to false) and authorId is tracked
    const savedLesson = await prisma.englishLesson.findUnique({ where: { id: lessonId } });
    expect(savedLesson).not.toBeNull();
    expect(savedLesson?.published).toBe(false);
    expect(savedLesson?.authorId).toBe(authorId);

    // 3. Author attempts to self-approve the lesson -> 403 MAKER_CHECKER_VIOLATION
    // (Temporarily promote author to ADMIN to test maker-checker even when user has review role)
    await prisma.user.update({ where: { id: authorId }, data: { role: 'ADMIN' } });
    // Re-login to refresh role in session
    const autLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ identifier: `aut_${suffix}`.slice(0, 30), password: 'P@ssword123!' });
    const authorAdminCookie = autLogin.headers['set-cookie'][0].split(';')[0];

    const violationRes = await request(app.getHttpServer())
      .post(`/api/v1/english/lessons/${lessonId}/review`)
      .set('Cookie', authorAdminCookie)
      .send({ approve: true })
      .expect(403);

    expect(violationRes.body.code).toBe('MAKER_CHECKER_VIOLATION');

    // 4. Independent Reviewer (or original Admin) reviews and approves -> 200 OK
    const approveRes = await request(app.getHttpServer())
      .post(`/api/v1/english/lessons/${lessonId}/review`)
      .set('Cookie', adminCookie)
      .send({ approve: true })
      .expect(200);

    expect(approveRes.body.lesson.published).toBe(true);
    expect(approveRes.body.lesson.reviewerId).toBe(adminId);

    // 5. Verify audit log entry
    const auditRes = await request(app.getHttpServer())
      .get('/api/v1/admin/audit-logs')
      .set('Cookie', adminCookie)
      .expect(200);

    const hasEnglishReview = auditRes.body.some(
      (log: any) => log.action === 'ENGLISH_LESSON_REVIEWED' && log.targetEntityId === lessonId
    );
    expect(hasEnglishReview).toBe(true);

    // Cleanup
    await prisma.englishLesson.deleteMany({ where: { id: lessonId } }).catch(() => undefined);
    await prisma.englishTopic.deleteMany({ where: { id: topicId } }).catch(() => undefined);
  });
});

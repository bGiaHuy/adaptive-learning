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
});

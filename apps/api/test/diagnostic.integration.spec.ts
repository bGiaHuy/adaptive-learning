import 'reflect-metadata';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Diagnostic CAT/IRT and Student Mastery Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const suffix = `${Date.now()}_${Math.random().toString(16).slice(2)}`;

  let studentId: string;
  let studentCookie: string;

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

    // Setup student
    const stReg = await request(app.getHttpServer())
      .post('/api/v1/auth/register/student')
      .send({
        username: `diag_${suffix}`.slice(0, 30),
        email: `diag_${suffix}@test.adaptivemath.local`,
        fullName: 'Học sinh Thi Thử',
        password: 'P@ssword123!'
      });
    studentId = stReg.body.id;
    const stLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ identifier: `diag_${suffix}`.slice(0, 30), password: 'P@ssword123!' });
    studentCookie = stLogin.headers['set-cookie'][0].split(';')[0];
  });

  afterAll(async () => {
    if (studentId) {
      await prisma.user.delete({ where: { id: studentId } }).catch(() => undefined);
    }
    await app.close();
  });

  it('runs adaptive diagnostic loop, computes mastery, and populates mistake records', async () => {
    // 1. Start diagnostic attempt
    const startRes = await request(app.getHttpServer())
      .post('/api/v1/diagnostic/start')
      .set('Cookie', studentCookie)
      .send({ grade: 9 })
      .expect(201);

    expect(startRes.body.attemptId).toBeDefined();
    expect(startRes.body.currentTheta).toBe(0);
    const skillItems = await prisma.question.findMany({ where: { skillId: startRes.body.currentQuestion.skillId, status: 'PUBLISHED' } });
    const levels = ['REMEMBERING', 'UNDERSTANDING', 'APPLYING', 'ADVANCED_APPLYING'];
    expect(startRes.body.currentQuestion.cognitiveLevel).toBe(levels.find(l => skillItems.some(q => q.cognitiveLevel === l)));
    expect(startRes.body.currentQuestion).toBeDefined();

    const attemptId = startRes.body.attemptId;
    const firstQ = startRes.body.currentQuestion;

    // 2. Submit wrong answer for first question
    const correct = await prisma.questionOption.findFirst({ where: { questionId: firstQ.id, isCorrect: true } });
    const wrongOption = firstQ.options.find((o: any) => o.key !== correct!.optionKey);
    const answer1Res = await request(app.getHttpServer())
      .post('/api/v1/diagnostic/answer')
      .set('Cookie', studentCookie)
      .send({
        attemptId,
        questionId: firstQ.id,
        selectedOptionKey: wrongOption.key,
        timeSpentSeconds: 45
      })
      .expect(200);

    // Because it was incorrect, theta should have decreased
    expect(answer1Res.body.currentTheta).toBeLessThan(0);
    expect(answer1Res.body.isCorrect).toBe(false);

    // 3. Finalize attempt
    const submitRes = await request(app.getHttpServer())
      .post(`/api/v1/diagnostic/submit/${attemptId}`)
      .set('Cookie', studentCookie)
      .expect(200);

    expect(submitRes.body.status).toBe('COMPLETED');
    expect(submitRes.body.totalAnswered).toBe(1);
    expect(submitRes.body.correctCount).toBe(0);

    // 4. Verify Student Mistake Notebook contains the wrong answer
    const mistakesRes = await request(app.getHttpServer())
      .get('/api/v1/student/mistakes')
      .set('Cookie', studentCookie)
      .expect(200);

    expect(mistakesRes.body.total).toBe(1);
    expect(mistakesRes.body.mistakes[0].questionId).toBe(firstQ.id);
    expect(mistakesRes.body.mistakes[0].isMastered).toBe(false);

    // 5. Update mistake record (mark mastered)
    const mistakeId = mistakesRes.body.mistakes[0].id;
    const patchMistake = await request(app.getHttpServer())
      .patch(`/api/v1/student/mistakes/${mistakeId}`)
      .set('Cookie', studentCookie)
      .send({ isMastered: true, userNotes: 'Đã hiểu cách giải qua lời giải chi tiết' })
      .expect(200);

    expect(patchMistake.body.mistake.isMastered).toBe(true);

    // 6. Student views learning path
    const pathRes = await request(app.getHttpServer())
      .get('/api/v1/student/learning-path')
      .set('Cookie', studentCookie)
      .expect(200);

    expect(pathRes.body.grade).toBe(9);
    expect(pathRes.body.modules.length).toBeGreaterThan(0);
  });
});

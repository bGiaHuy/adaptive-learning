import 'reflect-metadata';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { UserRole, QuestionStatus } from '@prisma/client';

describe('Classroom Assignment & Admin Management Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const suffix = `${Date.now()}_${Math.random().toString(16).slice(2)}`;

  let teacherId: string;
  let teacherCookie: string;
  let studentId: string;
  let studentCookie: string;
  let adminId: string;
  let adminCookie: string;
  let classId: string;
  let question1Id: string;
  let question2Id: string;
  let assignmentId: string;

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

    // 1. Setup Verified Teacher
    const tEmail = `teacher_${suffix}@test.adaptivemath.local`;
    const tReg = await request(app.getHttpServer())
      .post('/api/v1/auth/register/teacher')
      .send({
        email: tEmail,
        fullName: 'Thầy Giáo Viên',
        password: 'P@ssword123!',
        schoolName: 'THCS Giảng Võ'
      });
    teacherId = tReg.body.id;
    await prisma.user.update({
      where: { id: teacherId },
      data: { role: UserRole.TEACHER }
    });
    await prisma.teacherProfile.update({
      where: { userId: teacherId },
      data: { verificationStatus: 'VERIFIED', verifiedAt: new Date() }
    });
    const tLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ identifier: tEmail, password: 'P@ssword123!' });
    teacherCookie = tLogin.headers['set-cookie'][0];

    // 2. Setup Student
    const sUsername = `stu_${suffix}`.slice(0, 30);
    const sEmail = `student_${suffix}@test.adaptivemath.local`;
    const sReg = await request(app.getHttpServer())
      .post('/api/v1/auth/register/student')
      .send({
        username: sUsername,
        email: sEmail,
        fullName: 'Học Sinh Bài Thi',
        password: 'P@ssword123!'
      });
    studentId = sReg.body.id;
    const sLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ identifier: sUsername, password: 'P@ssword123!' });
    studentCookie = sLogin.headers['set-cookie'][0];

    // 3. Setup Admin
    const aUsername = `adm_${suffix}`.slice(0, 30);
    const aEmail = `admin_${suffix}@test.adaptivemath.local`;
    const adminReg = await request(app.getHttpServer())
      .post('/api/v1/auth/register/student')
      .send({
        username: aUsername,
        email: aEmail,
        fullName: 'Quản Trị Viên Test',
        password: 'P@ssword123!'
      });
    adminId = adminReg.body.id;
    await prisma.user.update({
      where: { id: adminId },
      data: { role: UserRole.ADMIN }
    });
    const admLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ identifier: aUsername, password: 'P@ssword123!' });
    adminCookie = admLogin.headers['set-cookie'][0].split(';')[0];

    // 4. Create sample published questions
    const skill = await prisma.skillNode.findFirst();
    const q1 = await prisma.question.create({
      data: {
        skillId: skill!.id,
        authorId: teacherId,
        status: QuestionStatus.PUBLISHED,
        content: 'Tính giá trị của \\sqrt{16}',
        explanation: 'Vì 4^2 = 16 nên \\sqrt{16} = 4.',
        options: {
          create: [
            { optionKey: 'A', content: '2', isCorrect: false },
            { optionKey: 'B', content: '4', isCorrect: true },
            { optionKey: 'C', content: '8', isCorrect: false },
            { optionKey: 'D', content: '16', isCorrect: false }
          ]
        }
      }
    });
    question1Id = q1.id;

    const q2 = await prisma.question.create({
      data: {
        skillId: skill!.id,
        authorId: teacherId,
        status: QuestionStatus.PUBLISHED,
        content: 'Căn bậc hai số học của 25 là:',
        explanation: 'Căn bậc hai số học của 25 là 5.',
        options: {
          create: [
            { optionKey: 'A', content: '-5', isCorrect: false },
            { optionKey: 'B', content: '5', isCorrect: true },
            { optionKey: 'C', content: '\\pm 5', isCorrect: false },
            { optionKey: 'D', content: '25', isCorrect: false }
          ]
        }
      }
    });
    question2Id = q2.id;

    // 5. Create Classroom & Student Joins
    const classRes = await request(app.getHttpServer())
      .post('/api/v1/classrooms')
      .set('Cookie', teacherCookie)
      .send({ name: 'Lớp 9A Test Đề', grade: 9, academicYear: '2026-2027' })
      .expect(201);
    classId = classRes.body.classroom.id;

    // Join student
    await prisma.classroomMembership.create({
      data: {
        classId,
        studentId,
        status: 'ACTIVE'
      }
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('Scenario 1: Teacher creates an assignment and verifies list', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/classrooms/${classId}/assignments`)
      .set('Cookie', teacherCookie)
      .send({
        title: 'Kiểm tra 15 phút - Căn thức bậc hai',
        description: 'Làm bài trong 15 phút',
        durationMinutes: 15,
        dueDate: '2026-11-30T23:59:59.000Z',
        questionIds: [question1Id, question2Id]
      })
      .expect(201);

    expect(res.body.assignment.title).toBe('Kiểm tra 15 phút - Căn thức bậc hai');
    expect(res.body.assignment.questionCount).toBe(2);
    assignmentId = res.body.assignment.id;

    // Verify teacher assignment list
    const listRes = await request(app.getHttpServer())
      .get(`/api/v1/classrooms/${classId}/assignments`)
      .set('Cookie', teacherCookie)
      .expect(200);

    expect(listRes.body.assignments.length).toBeGreaterThan(0);
    expect(listRes.body.assignments[0].id).toBe(assignmentId);
    expect(listRes.body.assignments[0].totalStudents).toBe(1);
    expect(listRes.body.assignments[0].totalSubmissions).toBe(0);
  });

  it('Scenario 2: Student retrieves exam for taking (verifying NO leaked answers)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/assignments/${assignmentId}/take`)
      .set('Cookie', studentCookie)
      .expect(200);

    expect(res.body.assignment.title).toBe('Kiểm tra 15 phút - Căn thức bậc hai');
    expect(res.body.assignment.questions.length).toBe(2);

    // CRITICAL SECURITY CHECK: isCorrect MUST NOT be present in options!
    for (const q of res.body.assignment.questions) {
      for (const opt of q.options) {
        expect(opt).not.toHaveProperty('isCorrect');
      }
    }
  });

  it('Scenario 3: Student submits answers, receives auto-grade and mistake logging', async () => {
    const submitRes = await request(app.getHttpServer())
      .post(`/api/v1/assignments/${assignmentId}/submit`)
      .set('Cookie', studentCookie)
      .send({
        timeSpentSeconds: 420,
        answers: [
          { questionId: question1Id, selectedOptionKey: 'B' }, // Correct!
          { questionId: question2Id, selectedOptionKey: 'A' }  // Wrong!
        ]
      })
      .expect(200);

    expect(submitRes.body.correctCount).toBe(1);
    expect(submitRes.body.totalQuestions).toBe(2);
    expect(submitRes.body.score).toBe(5.0); // 1 out of 2 = 5.0 / 10

    // Verify wrong answer recorded in Mistake Notebook
    const mistake = await prisma.mistakeRecord.findUnique({
      where: {
        studentId_questionId: {
          studentId,
          questionId: question2Id
        }
      }
    });
    expect(mistake).not.toBeNull();
    expect(mistake!.selectedOptionKey).toBe('A');
  });

  it('Scenario 4: Student views full submission result with explanations', async () => {
    const resultRes = await request(app.getHttpServer())
      .get(`/api/v1/assignments/${assignmentId}/result`)
      .set('Cookie', studentCookie)
      .expect(200);

    const r = resultRes.body.result;
    expect(r.score).toBe(5.0);
    expect(r.questions.length).toBe(2);
    expect(r.questions[0].isCorrect).toBe(true);
    expect(r.questions[0].explanation).toContain('Vì 4^2 = 16');
    expect(r.questions[1].isCorrect).toBe(false);
    expect(r.questions[1].correctOptionKey).toBe('B');
  });

  it('Scenario 5: Teacher views class scoreboard and question-by-question analytics', async () => {
    const scoreRes = await request(app.getHttpServer())
      .get(`/api/v1/classrooms/${classId}/assignments/${assignmentId}/submissions`)
      .set('Cookie', teacherCookie)
      .expect(200);

    expect(scoreRes.body.assignment.submittedCount).toBe(1);
    expect(scoreRes.body.assignment.averageScore).toBe(5.0);
    expect(scoreRes.body.roster.length).toBe(1);
    expect(scoreRes.body.roster[0].isSubmitted).toBe(true);
    expect(scoreRes.body.roster[0].score).toBe(5.0);

    // Analytics: Q1 was 100% correct, Q2 was 0% correct
    expect(scoreRes.body.questionAnalytics[0].accuracyPercentage).toBe(100);
    expect(scoreRes.body.questionAnalytics[1].accuracyPercentage).toBe(0);
  });

  it('Scenario 6: Admin users management, status toggle & password reset', async () => {
    // 1. Get users list
    const usersRes = await request(app.getHttpServer())
      .get('/api/v1/admin/users')
      .set('Cookie', adminCookie)
      .expect(200);

    expect(usersRes.body.total).toBeGreaterThan(0);
    expect(usersRes.body.users.some((u: any) => u.id === studentId)).toBe(true);

    // 2. Suspend student
    const suspendRes = await request(app.getHttpServer())
      .patch(`/api/v1/admin/users/${studentId}/status`)
      .set('Cookie', adminCookie)
      .send({ status: 'SUSPENDED' })
      .expect(200);

    expect(suspendRes.body.user.status).toBe('SUSPENDED');

    // 3. Activate student back
    const activateRes = await request(app.getHttpServer())
      .patch(`/api/v1/admin/users/${studentId}/status`)
      .set('Cookie', adminCookie)
      .send({ status: 'ACTIVE' })
      .expect(200);

    expect(activateRes.body.user.status).toBe('ACTIVE');

    // 4. Reset password
    const resetRes = await request(app.getHttpServer())
      .post(`/api/v1/admin/users/${studentId}/reset-password`)
      .set('Cookie', adminCookie)
      .send({ newPassword: 'NewSecurePassword123!' })
      .expect(200);

    expect(resetRes.body.tempPassword).toBe('NewSecurePassword123!');

    // 5. Check all classrooms
    const classRes = await request(app.getHttpServer())
      .get('/api/v1/admin/classrooms')
      .set('Cookie', adminCookie)
      .expect(200);

    expect(classRes.body.total).toBeGreaterThan(0);
  });

  it('Scenario 7: Sample template endpoint returns standard JSON schema for AI & teachers', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/assignments/sample-template')
      .set('Cookie', teacherCookie)
      .expect(200);

    expect(res.body).toHaveProperty('title');
    expect(res.body).toHaveProperty('description');
    expect(res.body).toHaveProperty('questions');
    expect(Array.isArray(res.body.questions)).toBe(true);
    expect(res.body.questions.length).toBeGreaterThan(0);

    const firstQ = res.body.questions[0];
    expect(firstQ).toHaveProperty('content');
    expect(firstQ).toHaveProperty('options');
    expect(firstQ).toHaveProperty('explanation');
    expect(firstQ.options.length).toBe(4);
    expect(firstQ.options[0]).toHaveProperty('key');
    expect(firstQ.options[0]).toHaveProperty('content');
  });

  it('Scenario 8: Teacher creates custom assignment with manual/AI questions', async () => {
    // Re-authenticate student because Scenario 6 reset student's password
    const sLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ identifier: `student_${suffix}@test.adaptivemath.local`, password: 'NewSecurePassword123!' });
    studentCookie = sLogin.headers['set-cookie'][0];

    const customRes = await request(app.getHttpServer())
      .post(`/api/v1/classrooms/${classId}/assignments`)
      .set('Cookie', teacherCookie)
      .send({
        title: 'Đề Custom Tự Soạn - Hình học 9',
        description: 'Đề thi giáo viên nhập trực tiếp kết hợp AI',
        durationMinutes: 20,
        dueDate: '2026-12-01T12:00:00.000Z',
        customQuestions: [
          {
            content: 'Tam giác ABC vuông tại A có AB = 3cm, AC = 4cm. Độ dài cạnh BC là:',
            options: [
              { key: 'A', content: '5cm', isCorrect: true },
              { key: 'B', content: '7cm', isCorrect: false },
              { key: 'C', content: '6cm', isCorrect: false },
              { key: 'D', content: '25cm', isCorrect: false }
            ],
            explanation: 'Áp dụng định lý Pythagoras: BC = \\sqrt{AB^2 + AC^2} = \\sqrt{9 + 16} = 5cm.',
            cognitiveLevel: 'APPLY'
          },
          {
            content: 'Giá trị của \\sin 30^\\circ bằng:',
            options: [
              { key: 'A', content: '1', isCorrect: false },
              { key: 'B', content: '\\frac{1}{2}', isCorrect: true },
              { key: 'C', content: '\\frac{\\sqrt{3}}{2}', isCorrect: false },
              { key: 'D', content: '0', isCorrect: false }
            ],
            explanation: 'Theo bảng giá trị lượng giác cơ bản, \\sin 30^\\circ = 1/2.',
            cognitiveLevel: 'RECOGNIZE'
          }
        ]
      })
      .expect(201);

    expect(customRes.body.assignment.title).toBe('Đề Custom Tự Soạn - Hình học 9');
    expect(customRes.body.assignment.questionCount).toBe(2);

    const customAssignmentId = customRes.body.assignment.id;

    // Student retrieves the custom assignment
    const takeRes = await request(app.getHttpServer())
      .get(`/api/v1/assignments/${customAssignmentId}/take`)
      .set('Cookie', studentCookie)
      .expect(200);

    const qs = takeRes.body.assignment.questions;
    expect(qs.length).toBe(2);
    expect(qs[0].content).toContain('Tam giác ABC vuông tại A');
    expect(qs[0].options.length).toBe(4);
    // Ensure isCorrect is stripped for student
    for (const opt of qs[0].options) {
      expect(opt).not.toHaveProperty('isCorrect');
    }

    // Student submits answers using 'selectedOption' (the field that previously failed with 400 Bad Request)
    const subRes = await request(app.getHttpServer())
      .post(`/api/v1/assignments/${customAssignmentId}/submit`)
      .set('Cookie', studentCookie)
      .send({
        timeSpentSeconds: 300,
        answers: [
          { questionId: qs[0].id, selectedOption: 'a' }, // Note lowercase 'a', must normalize to 'A' and match isCorrect: true
          { questionId: qs[1].id, selectedOption: 'C' }  // Selected 'C', correct is 'B' -> incorrect
        ]
      })
      .expect(200);

    expect(subRes.body.correctCount).toBe(1);
    expect(subRes.body.totalQuestions).toBe(2);
    expect(subRes.body.score).toBe(5.0);

    // Verify submission result
    const resultRes = await request(app.getHttpServer())
      .get(`/api/v1/assignments/${customAssignmentId}/result`)
      .set('Cookie', studentCookie)
      .expect(200);

    expect(resultRes.body.result.score).toBe(5.0);
    expect(resultRes.body.result.questions[0].isCorrect).toBe(true);
    expect(resultRes.body.result.questions[1].isCorrect).toBe(false);
    expect(resultRes.body.result.questions[1].correctOptionKey).toBe('B');
  });

  it('Scenario 9: Hybrid assignment creation with both bank questionIds and customQuestions', async () => {
    const hybridRes = await request(app.getHttpServer())
      .post(`/api/v1/classrooms/${classId}/assignments`)
      .set('Cookie', teacherCookie)
      .send({
        title: 'Đề Hỗn Hợp (Ngân Hàng + AI/Custom)',
        durationMinutes: 25,
        dueDate: '2026-12-05T23:59:59.000Z',
        questionIds: [question1Id],
        customQuestions: [
          {
            content: 'Phương trình bậc nhất 2x - 4 = 0 có nghiệm là:',
            options: [
              { key: 'A', content: 'x = 2', isCorrect: true },
              { key: 'B', content: 'x = -2', isCorrect: false },
              { key: 'C', content: 'x = 4', isCorrect: false },
              { key: 'D', content: 'x = 0', isCorrect: false }
            ],
            explanation: '2x - 4 = 0 <=> 2x = 4 <=> x = 2.',
            cognitiveLevel: 'UNDERSTAND'
          }
        ]
      })
      .expect(201);

    expect(hybridRes.body.assignment.questionCount).toBe(2);
    expect(hybridRes.body.assignment.title).toBe('Đề Hỗn Hợp (Ngân Hàng + AI/Custom)');
  });
});

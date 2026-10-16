import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnswerQuestionDto } from './dto/answer-question.dto';
import { estimateAbility, diagnosticMastery, selectStaircase } from '../student/math-adaptive';

const answerInclude = { question: { include: { skill: true, options: true } } };
@Injectable()
export class DiagnosticService {
  private readonly maxQuestions = Math.max(1, Math.min(64, Number(process.env.DIAGNOSTIC_MAX_QUESTIONS) || 24));
  constructor(private readonly prisma: PrismaService) {}
  private remainingSeconds(startedAt: Date) {
    return Math.max(0, 90 - Math.floor((Date.now() - startedAt.getTime()) / 1000));
  }
  private safeQuestion(q: any) {
    return q ? { id: q.id, skillId: q.skillId, skillTitle: q.skill.title, chapter: q.skill.chapter,
      cognitiveLevel: q.cognitiveLevel, content: q.content,
      options: q.options.map((o: any) => ({ key: o.optionKey, content: o.content })) } : null;
  }
  private async lock(tx: any, studentId: string) {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${studentId}))::text`;
  }
  private async pool(tx: any, studentId: string, attempt?: any) {
    if (attempt?.skillIds?.length) return tx.question.findMany({ where: { skillId: { in: attempt.skillIds }, status: 'PUBLISHED' },
      include: { skill: true, options: true }, orderBy: { id: 'asc' } });
    const profile = await tx.studentProfile.findUnique({ where: { userId: studentId } });
    // Eight skills per diagnostic permit coverage and verification within 24 items.
    const skills = await tx.skillNode.findMany({
      where: { grade: profile?.grade || 9, questions: { some: { status: 'PUBLISHED' } } },
      orderBy: [{ orderIndex: 'asc' }, { code: 'asc' }]
    });
    const assessed = await tx.skillMastery.findMany({ where: { studentId } });
    skills.sort((a: any, b: any) => {
      const ma = assessed.find((m: any) => m.skillId === a.id), mb = assessed.find((m: any) => m.skillId === b.id);
      return Number(Boolean(ma)) - Number(Boolean(mb)) || (ma?.masteryScore || 0) - (mb?.masteryScore || 0) || a.orderIndex - b.orderIndex || a.code.localeCompare(b.code);
    });
    const skillIds = [...new Set([...skills.slice(0, 8).map((s: any) => s.id), ...(attempt?.answers || []).map((a: any) => a.question.skillId)])];
    return tx.question.findMany({ where: { skillId: { in: skillIds }, status: 'PUBLISHED' },
      include: { skill: true, options: true }, orderBy: { id: 'asc' } });
  }
  private next(pool: any[], attempt: any) {
    return attempt.answers.length >= this.maxQuestions ? null : selectStaircase(pool, attempt.answers, attempt.id);
  }
  private answerResponse(attempt: any, q: any, answer: any, pool: any[], replayed = false) {
    const next = this.next(pool, attempt);
    return { replayed, isCorrect: answer.isCorrect, correctOptionKey: q.options.find((o: any) => o.isCorrect)?.optionKey,
      explanation: q.explanation, currentTheta: attempt.currentTheta,
      standardError: estimateAbility(attempt.answers).standardError, answeredCount: attempt.answers.length,
      totalQuestions: this.maxQuestions, isReadyToSubmit: !next, nextQuestion: this.safeQuestion(next) };
  }
  async startAttempt(studentId: string) {
    return this.prisma.$transaction(async tx => {
      await this.lock(tx, studentId);
      if (await tx.mathPracticeSession.findFirst({ where: { studentId, status: 'IN_PROGRESS' } }))
        throw new ConflictException('Hãy hoàn thành hoặc kết thúc buổi luyện trước khi kiểm tra.');
      let attempt: any = await tx.diagnosticAttempt.findFirst({ where: { studentId, status: 'IN_PROGRESS' },
        include: { answers: { include: answerInclude, orderBy: [{ answeredAt: 'asc' }, { id: 'asc' }] } } });
      const isResumed = Boolean(attempt), pool = await this.pool(tx, studentId, attempt);
      if (!pool.length) throw new BadRequestException({ code: 'QUESTION_POOL_EMPTY', message: 'Chưa có câu hỏi đã duyệt cho khối lớp của bạn.' });
      const skillIds = [...new Set(pool.map((q: any) => q.skillId))] as string[];
      if (!attempt) attempt = { ...await tx.diagnosticAttempt.create({ data: { studentId, currentTheta: 0, skillIds } }), answers: [] };
      else {
        attempt.currentTheta = estimateAbility(attempt.answers).theta;
        await tx.diagnosticAttempt.update({ where: { id: attempt.id }, data: { currentTheta: attempt.currentTheta, skillIds } });
      }
      const next = this.next(pool, attempt);
      return { attemptId: attempt.id, isResumed, status: attempt.status, currentTheta: attempt.currentTheta,
        standardError: estimateAbility(attempt.answers).standardError,
        answeredCount: attempt.answers.length, totalQuestions: this.maxQuestions,
        availableSkillCount: new Set(pool.map((q: any) => q.skillId)).size,
        isReadyToSubmit: !next,
        questionTimeRemainingSeconds: this.remainingSeconds(attempt.answers.at(-1)?.answeredAt ?? attempt.startedAt),
        currentQuestion: this.safeQuestion(next), parameterStatus: 'PROVISIONAL' };
    });
  }
  async answerQuestion(studentId: string, dto: AnswerQuestionDto) {
    return this.prisma.$transaction(async tx => {
      await this.lock(tx, studentId);
      const attempt = await tx.diagnosticAttempt.findUnique({ where: { id: dto.attemptId },
        include: { answers: { include: answerInclude, orderBy: [{ answeredAt: 'asc' }, { id: 'asc' }] } } });
      if (!attempt) throw new NotFoundException('Không tìm thấy bài chẩn đoán.');
      if (attempt.studentId !== studentId) throw new ForbiddenException('Bạn không có quyền truy cập bài kiểm tra này.');
      if (attempt.status !== 'IN_PROGRESS') throw new BadRequestException('Bài kiểm tra đã kết thúc.');
      const pool = await this.pool(tx, studentId, attempt), existing = attempt.answers.find(a => a.questionId === dto.questionId);
      if (existing) return this.answerResponse(attempt, existing.question, existing, pool, true);
      const q = this.next(pool, attempt);
      if (!q || q.id !== dto.questionId) throw new ConflictException('Câu hỏi không thuộc lượt hiện tại. Hãy tải lại phiên làm bài.');
      if (dto.selectedOptionKey && !q.options.some(o => o.optionKey === dto.selectedOptionKey)) throw new BadRequestException('Đáp án không hợp lệ.');
      if (!dto.selectedOptionKey && !dto.isSkipped && !dto.isTimeout) throw new BadRequestException('Chọn đáp án hoặc bỏ qua câu hỏi.');
      const isTimeout = Boolean(dto.isTimeout || this.remainingSeconds(attempt.answers.at(-1)?.answeredAt ?? attempt.startedAt) === 0);
      const isCorrect = !isTimeout && !dto.isSkipped && dto.selectedOptionKey === q.options.find(o => o.isCorrect)?.optionKey;
      const ability = estimateAbility([...attempt.answers, { question: q, isCorrect }]);
      const answer = await tx.attemptAnswer.create({ data: { attemptId: attempt.id, questionId: q.id,
        selectedOptionKey: isTimeout ? null : dto.selectedOptionKey || null, isCorrect, isTimeout,
        isSkipped: !isTimeout && Boolean(dto.isSkipped), timeSpentSeconds: isTimeout ? 90 : dto.timeSpentSeconds || 0,
        thetaAfter: ability.theta } });
      await tx.diagnosticAttempt.update({ where: { id: attempt.id }, data: { currentTheta: ability.theta } });
      return this.answerResponse({ ...attempt, currentTheta: ability.theta, answers: [...attempt.answers, { ...answer, question: q }] }, q, answer, pool);
    });
  }
  async submitAttempt(studentId: string, attemptId: string) {
    return this.prisma.$transaction(async tx => {
      await this.lock(tx, studentId);
      const attempt = await tx.diagnosticAttempt.findUnique({ where: { id: attemptId },
        include: { answers: { include: answerInclude, orderBy: { answeredAt: 'asc' } } } });
      if (!attempt || attempt.studentId !== studentId) throw new NotFoundException('Không tìm thấy bài chẩn đoán.');
      if (attempt.status === 'ABANDONED') throw new BadRequestException('Bài kiểm tra đã được kết thúc.');
      if (!attempt.answers.length) throw new BadRequestException('Bài chẩn đoán chưa có câu trả lời để nộp.');
      const ability = estimateAbility(attempt.answers), correctCount = attempt.answers.filter(a => a.isCorrect).length;
      const skills = [...new Set(attempt.answers.map(a => a.question.skillId))], skillsEvaluated: any[] = [];
      if (attempt.status !== 'COMPLETED') {
        await tx.diagnosticAttempt.update({ where: { id: attemptId }, data: { status: 'COMPLETED', currentTheta: ability.theta, finalTheta: ability.theta, completedAt: new Date() } });
        for (const a of attempt.answers.filter(a => !a.isCorrect)) await tx.mistakeRecord.upsert({
          where: { studentId_questionId: { studentId, questionId: a.questionId } },
          update: { selectedOptionKey: a.selectedOptionKey, attemptId, isMastered: false },
          create: { studentId, questionId: a.questionId, selectedOptionKey: a.selectedOptionKey, attemptId } });
        for (const skillId of skills) {
          const answers = attempt.answers.filter(a => a.question.skillId === skillId), score = diagnosticMastery(answers, ability.theta) * 100;
          await tx.skillMastery.upsert({ where: { studentId_skillId: { studentId, skillId } },
            update: { masteryScore: score, evidenceCount: answers.length, attemptsCount: { increment: 1 }, lastAssessedAt: new Date() },
            create: { studentId, skillId, masteryScore: score, evidenceCount: answers.length } });
          skillsEvaluated.push({ skillId, title: answers[0].question.skill.title, masteryScore: score,
            evidenceCount: answers.length, status: answers.length < 5 ? 'INSUFFICIENT_DATA' : score >= 85 ? 'STRONG' : 'NEEDS_PRACTICE' });
        }
      }
      return { attemptId, status: 'COMPLETED', finalTheta: ability.theta, standardError: ability.standardError,
        scorePercentage: Math.round(correctCount / attempt.answers.length * 100), correctCount,
        totalAnswered: attempt.answers.length, skillsEvaluated, alreadySubmitted: attempt.status === 'COMPLETED', parameterStatus: 'PROVISIONAL' };
    });
  }
  async getAttemptResult(studentId: string, attemptId: string) {
    const attempt = await this.prisma.diagnosticAttempt.findUnique({ where: { id: attemptId },
      include: { answers: { include: answerInclude, orderBy: { answeredAt: 'asc' } } } });
    if (!attempt || attempt.studentId !== studentId) throw new NotFoundException('Không tìm thấy kết quả.');
    if (attempt.status !== 'COMPLETED') throw new ForbiddenException('Hãy nộp bài trước khi xem kết quả.');
    const ability = estimateAbility(attempt.answers);
    return { attemptId, status: attempt.status, finalTheta: ability.theta, standardError: ability.standardError,
      startedAt: attempt.startedAt, completedAt: attempt.completedAt, totalAnswered: attempt.answers.length,
      correctCount: attempt.answers.filter(a => a.isCorrect).length, parameterStatus: 'PROVISIONAL',
      answers: attempt.answers.map(a => ({ questionId: a.questionId, content: a.question.content,
        explanation: a.question.explanation, skillTitle: a.question.skill.title, selectedOptionKey: a.selectedOptionKey,
        isCorrect: a.isCorrect, isTimeout: a.isTimeout, timeSpentSeconds: a.timeSpentSeconds, thetaAfter: a.thetaAfter,
        options: a.question.options.map(o => ({ key: o.optionKey, content: o.content, isCorrect: o.isCorrect })) })) };
  }
}

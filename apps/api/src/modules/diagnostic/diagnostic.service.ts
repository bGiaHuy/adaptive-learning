import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnswerQuestionDto } from './dto/answer-question.dto';
import { AttemptStatus, CognitiveLevel, QuestionStatus } from '@prisma/client';

@Injectable()
export class DiagnosticService {
  private readonly maxQuestions = Number(process.env.DIAGNOSTIC_MAX_QUESTIONS || 24);
  private readonly questionSeconds = 90;

  constructor(private readonly prisma: PrismaService) {}

  private remainingSeconds(startedAt: Date) {
    const elapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000);
    return Math.max(0, this.questionSeconds - elapsed);
  }

  // Format question safe for student (exclude isCorrect)
  private formatQuestionForStudent(question: any) {
    if (!question) return null;
    return {
      id: question.id,
      skillId: question.skillId,
      skillTitle: question.skill?.title,
      chapter: question.skill?.chapter,
      cognitiveLevel: question.cognitiveLevel,
      content: question.content,
      options: question.options.map((opt: any) => ({
        key: opt.optionKey,
        content: opt.content
      }))
    };
  }

  // Start or resume existing diagnostic attempt
  async startAttempt(studentId: string) {
    // 1. Check if an attempt is currently IN_PROGRESS
    const existingAttempt = await this.prisma.diagnosticAttempt.findFirst({
      where: {
        studentId,
        status: AttemptStatus.IN_PROGRESS
      },
      include: {
        answers: {
          include: {
            question: {
              include: {
                skill: true,
                options: true
              }
            }
          },
          orderBy: { answeredAt: 'asc' }
        }
      }
    });

    if (existingAttempt) {
      const answeredQIds = existingAttempt.answers.map(a => a.questionId);
      const isComplete = existingAttempt.answers.length >= this.maxQuestions;

      const nextQuestion = isComplete
        ? null
        : await this.selectNextQuestion(existingAttempt.currentTheta, answeredQIds);

      return {
        attemptId: existingAttempt.id,
        isResumed: true,
        status: existingAttempt.status,
        currentTheta: existingAttempt.currentTheta,
        answeredCount: existingAttempt.answers.length,
        totalQuestions: this.maxQuestions,
        isReadyToSubmit: isComplete || !nextQuestion,
        questionTimeRemainingSeconds: this.remainingSeconds(
          existingAttempt.answers.at(-1)?.answeredAt ?? existingAttempt.startedAt
        ),
        currentQuestion: this.formatQuestionForStudent(nextQuestion)
      };
    }

    // 2. Create new attempt with initial Theta = 0.50
    const newAttempt = await this.prisma.diagnosticAttempt.create({
      data: {
        studentId,
        currentTheta: 0.50,
        status: AttemptStatus.IN_PROGRESS
      }
    });

    // 3. Pick first question (REMEMBERING level in SKILL-01 or SKILL-02)
    const firstQuestion = await this.selectNextQuestion(0.50, []);
    if (!firstQuestion) {
      throw new BadRequestException({
        code: 'QUESTION_POOL_EMPTY',
        message: 'Ngân hàng câu hỏi chưa đủ để bắt đầu bài chẩn đoán.'
      });
    }

    return {
      attemptId: newAttempt.id,
      isResumed: false,
      status: newAttempt.status,
      currentTheta: newAttempt.currentTheta,
      answeredCount: 0,
      totalQuestions: this.maxQuestions,
      isReadyToSubmit: false,
      questionTimeRemainingSeconds: this.questionSeconds,
      currentQuestion: this.formatQuestionForStudent(firstQuestion)
    };
  }

  // Adaptive Next Question Selection Algorithm (CAT / IRT)
  private async selectNextQuestion(theta: number, excludedQuestionIds: string[]) {
    // Select cognitive level based on theta
    let targetLevel: CognitiveLevel = CognitiveLevel.REMEMBERING;
    if (theta >= 0.70) {
      targetLevel = CognitiveLevel.APPLYING;
    } else if (theta >= 0.40) {
      targetLevel = CognitiveLevel.UNDERSTANDING;
    }

    // 1. Try matching target level
    let question = await this.prisma.question.findFirst({
      where: {
        status: QuestionStatus.PUBLISHED,
        id: { notIn: excludedQuestionIds },
        cognitiveLevel: targetLevel
      },
      include: {
        skill: true,
        options: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // 2. Fallback to any published question not yet answered
    if (!question) {
      question = await this.prisma.question.findFirst({
        where: {
          status: QuestionStatus.PUBLISHED,
          id: { notIn: excludedQuestionIds }
        },
        include: {
          skill: true,
          options: true
        }
      });
    }

    return question;
  }

  // Answer a question within attempt
  async answerQuestion(studentId: string, dto: AnswerQuestionDto) {
    const attempt = await this.prisma.diagnosticAttempt.findUnique({
      where: { id: dto.attemptId },
      include: {
        answers: true
      }
    });

    if (!attempt) {
      throw new NotFoundException({
        code: 'ATTEMPT_NOT_FOUND',
        message: 'Không tìm thấy bài chẩn đoán này.'
      });
    }

    if (attempt.studentId !== studentId) {
      throw new ForbiddenException({
        code: 'FORBIDDEN_ATTEMPT',
        message: 'Bạn không có quyền truy cập bài kiểm tra này.'
      });
    }

    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new BadRequestException({
        code: 'ATTEMPT_ALREADY_COMPLETED',
        message: 'Bài chẩn đoán này đã hoàn thành.'
      });
    }

    const question = await this.prisma.question.findUnique({
      where: { id: dto.questionId },
      include: {
        options: true,
        skill: true
      }
    });

    if (!question) {
      throw new NotFoundException({
        code: 'QUESTION_NOT_FOUND',
        message: 'Không tìm thấy câu hỏi.'
      });
    }

    const existingAnswer = attempt.answers.find(a => a.questionId === dto.questionId);
    if (existingAnswer) {
      const answeredQIds = attempt.answers.map(a => a.questionId);
      const nextQuestion = answeredQIds.length >= this.maxQuestions
        ? null
        : await this.selectNextQuestion(attempt.currentTheta, answeredQIds);
      return {
        replayed: true,
        isCorrect: existingAnswer.isCorrect,
        correctOptionKey: question.options.find(o => o.isCorrect)?.optionKey,
        explanation: question.explanation,
        currentTheta: existingAnswer.thetaAfter,
        answeredCount: answeredQIds.length,
        totalQuestions: this.maxQuestions,
        isReadyToSubmit: answeredQIds.length >= this.maxQuestions || !nextQuestion,
        nextQuestion: this.formatQuestionForStudent(nextQuestion)
      };
    }

    // Determine correctness
    const correctOption = question.options.find(o => o.isCorrect);
    const lastAnswerAt = attempt.answers.reduce<Date | null>(
      (latest, answer) => !latest || answer.answeredAt > latest ? answer.answeredAt : latest,
      null
    );
    const expired = this.remainingSeconds(lastAnswerAt ?? attempt.startedAt) === 0;
    const isTimeout = Boolean(dto.isTimeout || expired);
    const isCorrect =
      !isTimeout &&
      !dto.isSkipped &&
      dto.selectedOptionKey === correctOption?.optionKey;

    // Calculate Theta delta
    let delta = 0.15;
    if (question.cognitiveLevel === CognitiveLevel.UNDERSTANDING) delta = 0.20;
    else if (question.cognitiveLevel === CognitiveLevel.APPLYING) delta = 0.25;

    const newTheta = isCorrect
      ? Math.min(1.0, Number((attempt.currentTheta + delta).toFixed(2)))
      : Math.max(0.1, Number((attempt.currentTheta - delta).toFixed(2)));

    try {
      await this.prisma.$transaction([
        this.prisma.attemptAnswer.create({
          data: {
            attemptId: attempt.id,
            questionId: question.id,
            selectedOptionKey: isTimeout ? null : dto.selectedOptionKey || null,
            isCorrect,
            isTimeout,
            isSkipped: isTimeout ? false : dto.isSkipped || false,
            timeSpentSeconds: isTimeout ? this.questionSeconds : dto.timeSpentSeconds || 0,
            thetaAfter: newTheta
          }
        }),
        this.prisma.diagnosticAttempt.update({
          where: { id: attempt.id },
          data: { currentTheta: newTheta }
        })
      ]);
    } catch (error) {
      // Two requests can pass the initial lookup together. The unique answer
      // constraint is the final idempotency guard; return the stored answer.
      if ((error as { code?: string }).code === 'P2002') {
        const stored = await this.prisma.attemptAnswer.findUnique({
          where: { attemptId_questionId: { attemptId: attempt.id, questionId: question.id } }
        });
        if (stored) return this.answerQuestion(studentId, dto);
      }
      throw error;
    }

    // Check if test reached max questions
    const answeredQIds = [
      ...attempt.answers.map(a => a.questionId),
      question.id
    ];
    const nextQuestion = answeredQIds.length >= this.maxQuestions
      ? null
      : await this.selectNextQuestion(newTheta, answeredQIds);
    const isReadyToSubmit = answeredQIds.length >= this.maxQuestions || !nextQuestion;

    return {
      isCorrect,
      correctOptionKey: correctOption?.optionKey,
      explanation: question.explanation,
      currentTheta: newTheta,
      answeredCount: answeredQIds.length,
      totalQuestions: this.maxQuestions,
      isReadyToSubmit,
      nextQuestion: this.formatQuestionForStudent(nextQuestion)
    };
  }

  // Submit and finalize diagnostic attempt
  async submitAttempt(studentId: string, attemptId: string) {
    const attempt = await this.prisma.diagnosticAttempt.findUnique({
      where: { id: attemptId },
      include: {
        answers: {
          include: {
            question: {
              include: {
                skill: true,
                options: true
              }
            }
          }
        }
      }
    });

    if (!attempt || attempt.studentId !== studentId) {
      throw new NotFoundException({
        code: 'ATTEMPT_NOT_FOUND',
        message: 'Không tìm thấy bài làm chẩn đoán.'
      });
    }

    if (attempt.status === AttemptStatus.COMPLETED) {
      const correctCount = attempt.answers.filter(a => a.isCorrect).length;
      return {
        attemptId: attempt.id,
        status: attempt.status,
        finalTheta: attempt.finalTheta ?? attempt.currentTheta,
        scorePercentage: attempt.answers.length
          ? Math.round((correctCount / attempt.answers.length) * 100)
          : 0,
        correctCount,
        totalAnswered: attempt.answers.length,
        alreadySubmitted: true
      };
    }

    if (attempt.answers.length === 0) {
      throw new BadRequestException({
        code: 'ATTEMPT_HAS_NO_ANSWERS',
        message: 'Bài chẩn đoán chưa có câu trả lời để nộp.'
      });
    }

    const finalTheta = attempt.currentTheta;
    const totalAnswered = attempt.answers.length;
    const correctCount = attempt.answers.filter(a => a.isCorrect).length;
    const scorePct = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

    // 1. Update attempt status to COMPLETED
    await this.prisma.diagnosticAttempt.update({
      where: { id: attemptId },
      data: {
        status: AttemptStatus.COMPLETED,
        finalTheta,
        completedAt: new Date()
      }
    });

    // 2. Populate Mistake Notebook for any incorrect answers
    for (const ans of attempt.answers) {
      if (!ans.isCorrect) {
        await this.prisma.mistakeRecord.upsert({
          where: {
            studentId_questionId: {
              studentId,
              questionId: ans.questionId
            }
          },
          update: {
            selectedOptionKey: ans.selectedOptionKey,
            attemptId: attempt.id,
            isMastered: false
          },
          create: {
            studentId,
            questionId: ans.questionId,
            attemptId: attempt.id,
            selectedOptionKey: ans.selectedOptionKey,
            isMastered: false
          }
        });
      }
    }

    // 3. Update Skill Mastery for each skill assessed in this attempt
    const skillsEvaluated: Record<string, { total: number; correct: number; skillId: string; title: string }> = {};
    for (const ans of attempt.answers) {
      const sId = ans.question.skillId;
      if (!skillsEvaluated[sId]) {
        skillsEvaluated[sId] = {
          total: 0,
          correct: 0,
          skillId: sId,
          title: ans.question.skill.title
        };
      }
      skillsEvaluated[sId].total += 1;
      if (ans.isCorrect) skillsEvaluated[sId].correct += 1;
    }

    const masteryResults: Array<{
      skillId: string;
      title: string;
      masteryScore: number;
      status: 'STRONG' | 'NEEDS_PRACTICE';
    }> = [];
    for (const [skillId, evalData] of Object.entries(skillsEvaluated)) {
      const skillScore = Math.round((evalData.correct / evalData.total) * 100);
      await this.prisma.skillMastery.upsert({
        where: {
          studentId_skillId: {
            studentId,
            skillId
          }
        },
        update: {
          masteryScore: skillScore,
          attemptsCount: { increment: 1 },
          lastAssessedAt: new Date()
        },
        create: {
          studentId,
          skillId,
          masteryScore: skillScore,
          attemptsCount: 1,
          lastAssessedAt: new Date()
        }
      });

      masteryResults.push({
        skillId,
        title: evalData.title,
        masteryScore: skillScore,
        status: skillScore >= 70 ? 'STRONG' : 'NEEDS_PRACTICE'
      });
    }

    return {
      attemptId: attempt.id,
      status: AttemptStatus.COMPLETED,
      finalTheta,
      scorePercentage: scorePct,
      correctCount,
      totalAnswered,
      skillsEvaluated: masteryResults
    };
  }

  // Get full diagnostic results report
  async getAttemptResult(studentId: string, attemptId: string) {
    const attempt = await this.prisma.diagnosticAttempt.findUnique({
      where: { id: attemptId },
      include: {
        answers: {
          include: {
            question: {
              include: {
                skill: true,
                options: true
              }
            }
          },
          orderBy: { answeredAt: 'asc' }
        }
      }
    });

    if (!attempt || attempt.studentId !== studentId) {
      throw new NotFoundException({
        code: 'ATTEMPT_NOT_FOUND',
        message: 'Không tìm thấy kết quả bài chẩn đoán.'
      });
    }

    return {
      attemptId: attempt.id,
      status: attempt.status,
      finalTheta: attempt.finalTheta || attempt.currentTheta,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      totalAnswered: attempt.answers.length,
      correctCount: attempt.answers.filter(a => a.isCorrect).length,
      answers: attempt.answers.map(a => ({
        questionId: a.questionId,
        content: a.question.content,
        explanation: a.question.explanation,
        skillTitle: a.question.skill.title,
        selectedOptionKey: a.selectedOptionKey,
        isCorrect: a.isCorrect,
        isTimeout: a.isTimeout,
        timeSpentSeconds: a.timeSpentSeconds,
        thetaAfter: a.thetaAfter,
        options: a.question.options.map(opt => ({
          key: opt.optionKey,
          content: opt.content,
          isCorrect: opt.isCorrect
        }))
      }))
    };
  }
}

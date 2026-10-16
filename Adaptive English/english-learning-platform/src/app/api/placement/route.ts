import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { placementQuestions, PLACEMENT_VERSION } from '@/lib/placementQuestions';
import { evaluateWritingTask } from '@/lib/aiEngine';

const MAX_ANSWERS_PER_SECTION = 100;

function cleanAnswers(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const entries = Object.entries(value).filter(([key, answer]) =>
    key.length > 0 && key.length <= 120 && typeof answer === 'string' && answer.length <= 200
  );
  if (entries.length > MAX_ANSWERS_PER_SECTION) throw new Error('Quá nhiều câu trả lời trong một phần.');
  return Object.fromEntries(entries);
}

function serializeAttempt(attempt: {
  version: number; status: string; currentStep: number; readingAnswersJson: string;
  listeningAnswersJson: string; grammarAnswersJson: string; vocabAnswersJson: string;
  writingAnswer: string | null; completedAt: Date | null; updatedAt: Date;
  aiWritingEvaluationJson?: string | null;
}) {
  const parse = (value: string) => {
    try { return cleanAnswers(JSON.parse(value)); } catch { return {}; }
  };
  let writingEvaluation: unknown = null;
  if (attempt.aiWritingEvaluationJson) {
    try { writingEvaluation = JSON.parse(attempt.aiWritingEvaluationJson); } catch { /* keep malformed legacy data private */ }
  }
  return {
    version: attempt.version,
    completed: attempt.status === 'completed',
    currentStep: attempt.currentStep,
    readingAnswers: parse(attempt.readingAnswersJson),
    listeningAnswers: parse(attempt.listeningAnswersJson),
    grammarAnswers: parse(attempt.grammarAnswersJson),
    vocabAnswers: parse(attempt.vocabAnswersJson),
    writingAnswer: attempt.writingAnswer || '',
    writingEvaluation,
    completedAt: attempt.completedAt,
    updatedAt: attempt.updatedAt,
  };
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const [profiles, attempt] = await Promise.all([
      prisma.studentSkillProfile.findMany({
      where: { userId: user.id },
      }),
      prisma.placementAttempt.findUnique({ where: { userId_version: { userId: user.id, version: PLACEMENT_VERSION } } }),
    ]);

    const isCompleted = profiles.some(p => ['reading', 'listening', 'grammar', 'vocabulary'].includes(p.skill) && p.evidenceCount > 0);

    return NextResponse.json({
      success: true,
      completed: isCompleted,
      version: PLACEMENT_VERSION,
      attempt: attempt ? serializeAttempt(attempt) : null,
      profiles: profiles.map((p) => ({
        skill: p.skill,
        level: p.level,
        scoreDisplay: p.scoreDisplay,
        confidence: p.confidence,
        evidenceCount: p.evidenceCount,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const body = await request.json();
    const {
      readingAnswers,
      listeningAnswers,
      grammarAnswers,
      vocabAnswers,
      writingAnswer = '',
      completed = false,
    } = body;

    const answerSets = {
      readingAnswers: cleanAnswers(readingAnswers),
      listeningAnswers: cleanAnswers(listeningAnswers),
      grammarAnswers: cleanAnswers(grammarAnswers),
      vocabAnswers: cleanAnswers(vocabAnswers),
    };
    const safeStep = Math.min(placementQuestions.length, Math.max(1, Math.trunc(Number(body.currentStep) || 1)));
    const safeWritingAnswer = typeof writingAnswer === 'string' ? writingAnswer.slice(0, 10000) : '';

    let draft = await prisma.placementAttempt.upsert({
      where: { userId_version: { userId: user.id, version: PLACEMENT_VERSION } },
      create: {
        userId: user.id, version: PLACEMENT_VERSION, status: completed ? 'completed' : 'in_progress', currentStep: safeStep,
        readingAnswersJson: JSON.stringify(answerSets.readingAnswers), listeningAnswersJson: JSON.stringify(answerSets.listeningAnswers),
        grammarAnswersJson: JSON.stringify(answerSets.grammarAnswers), vocabAnswersJson: JSON.stringify(answerSets.vocabAnswers),
        writingAnswer: safeWritingAnswer || null, completedAt: completed ? new Date() : null,
      },
      update: {
        currentStep: safeStep, readingAnswersJson: JSON.stringify(answerSets.readingAnswers),
        listeningAnswersJson: JSON.stringify(answerSets.listeningAnswers), grammarAnswersJson: JSON.stringify(answerSets.grammarAnswers),
        vocabAnswersJson: JSON.stringify(answerSets.vocabAnswers), writingAnswer: safeWritingAnswer || null,
        ...(completed ? { status: 'completed', completedAt: new Date() } : {}),
      },
    });

    if (!completed) return NextResponse.json({ success: true, attempt: serializeAttempt(draft) });

    const writingQuestion = placementQuestions.find((question) => question.taskType === 'writing');
    const writingEvaluation = await evaluateWritingTask({
      content: safeWritingAnswer,
      taskContext: writingQuestion ? {
        prompt: writingQuestion.prompt,
        criteria: writingQuestion.explanation || 'Viết đoạn văn tiếng Anh đáp ứng đúng yêu cầu đề bài.',
        minimumWords: 10,
      } : undefined,
      mode: 'auto',
    });
    draft = await prisma.placementAttempt.update({
      where: { id: draft.id },
      data: { aiWritingEvaluationJson: JSON.stringify(writingEvaluation) },
    });

    // Evaluate MCQ sections (reading, listening, grammar, vocabulary)
    const sections = [
      { key: 'reading', answers: answerSets.readingAnswers },
      { key: 'listening', answers: answerSets.listeningAnswers },
      { key: 'grammar', answers: answerSets.grammarAnswers },
      { key: 'vocabulary', answers: answerSets.vocabAnswers },
    ];

    for (const sec of sections) {
      const questions = placementQuestions.filter((q) => q.section === sec.key);
      const answered = questions.filter((q) => sec.answers[q.id]);
      const correct = answered.filter((q) => sec.answers[q.id] === q.correct).length;
      const isComplete = answered.length >= questions.length;
      const ratio = questions.length > 0 ? correct / questions.length : 0;
      const level = isComplete ? (ratio >= 0.8 ? 'B1' : ratio >= 0.5 ? 'A2' : 'A1') : 'A1';

      await prisma.studentSkillProfile.upsert({
        where: {
          userId_skill: {
            userId: user.id,
            skill: sec.key,
          },
        },
        create: {
          userId: user.id,
          skill: sec.key,
          level,
          scoreDisplay: `${correct}/${questions.length} câu đúng · Bằng chứng đầu vào`,
          confidence: isComplete ? 75 : 30,
          evidenceCount: answered.length,
          independentRate: 100,
        },
        update: {
          level,
          scoreDisplay: `${correct}/${questions.length} câu đúng · Bằng chứng đầu vào`,
          confidence: isComplete ? 75 : 30,
          evidenceCount: answered.length,
          independentRate: 100,
        },
      });
    }

    // Writing assessment from placement task
    const writingWords = safeWritingAnswer
      ? safeWritingAnswer.trim().split(/\s+/).filter(Boolean).length
      : 0;
    const hasWriting = writingWords >= 10;
    const aiBand = writingEvaluation.status === 'success' ? Number(writingEvaluation.estimatedBand) : Number.NaN;
    const writingLevel = Number.isFinite(aiBand) ? (aiBand >= 5 ? 'B1 (ước lượng)' : aiBand >= 4 ? 'A2 (ước lượng)' : 'A1 (ước lượng)') : hasWriting ? (writingWords >= 50 ? 'A2' : 'A1') : 'A1 (Tạm thời)';
    const writingDisplay = Number.isFinite(aiBand)
      ? `AI ước lượng Band ${writingEvaluation.estimatedBand}/9 · ${writingWords} từ · Cần đối chiếu thêm`
      : hasWriting
      ? `${writingWords} từ · Đoạn văn bài test đầu vào`
      : 'Chưa thu thập bài viết tự luận';

    await prisma.studentSkillProfile.upsert({
      where: {
        userId_skill: {
          userId: user.id,
          skill: 'writing',
        },
      },
      create: {
        userId: user.id,
        skill: 'writing',
        level: writingLevel,
        scoreDisplay: writingDisplay,
          confidence: Number.isFinite(aiBand) ? 45 : hasWriting ? 40 : 0,
        evidenceCount: hasWriting ? 1 : 0,
        independentRate: hasWriting ? 100 : 0,
      },
      update: {
        level: writingLevel,
        scoreDisplay: writingDisplay,
          confidence: Number.isFinite(aiBand) ? 45 : hasWriting ? 40 : 0,
        evidenceCount: hasWriting ? 1 : 0,
        independentRate: hasWriting ? 100 : 0,
      },
    });

    // Speaking baseline
    await prisma.studentSkillProfile.upsert({
      where: {
        userId_skill: {
          userId: user.id,
          skill: 'speaking',
        },
      },
      create: {
        userId: user.id,
        skill: 'speaking',
        level: 'A1 (Tạm thời)',
        scoreDisplay: 'Chưa thu thập bản ghi âm chính thức',
        confidence: 0,
        evidenceCount: 0,
        independentRate: 0,
      },
      update: {
        level: 'A1 (Tạm thời)',
        scoreDisplay: 'Chưa thu thập bản ghi âm chính thức',
      },
    });

    return NextResponse.json({
      success: true,
      completed: true,
      message: 'Đã hoàn tất đánh giá đầu vào và lưu hồ sơ năng lực',
      attempt: serializeAttempt(draft),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

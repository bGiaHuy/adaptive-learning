import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { readAbilityEvidence, combineAbility, LEVEL_RATINGS, abilityLevel } from '@/lib/assignmentAbility';

const SKILLS = ['reading', 'listening', 'writing', 'speaking', 'vocabulary', 'grammar'] as const;
type SkillKey = typeof SKILLS[number];

type SkillAccumulator = {
  evidenceCount: number;
  scoredEvidenceCount: number;
  percentageTotal: number;
  independentRateTotal: number;
  independentRateCount: number;
};

function emptyAccumulator(): SkillAccumulator {
  return { evidenceCount: 0, scoredEvidenceCount: 0, percentageTotal: 0, independentRateTotal: 0, independentRateCount: 0 };
}

function levelFromPercentage(percentage: number) {
  return percentage >= 80 ? 'B1' : percentage >= 50 ? 'A2' : 'A1';
}

function parseProfilePercentage(scoreDisplay: string) {
  const match = scoreDisplay.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const correct = Number(match[1]);
  const total = Number(match[2]);
  if (!Number.isFinite(correct) || !Number.isFinite(total) || total <= 0 || correct < 0 || correct > total) return null;
  return Math.round((correct / total) * 100);
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

    const [profiles, userVocabs, vocabReviews, submissions, lessonAttempts] = await Promise.all([
      prisma.studentSkillProfile.findMany({ where: { userId: user.id } }),
      prisma.userVocab.findMany({ where: { userId: user.id } }),
      prisma.vocabReviewHistory.findMany({ where: { userId: user.id }, select: { userVocabId: true } }),
      prisma.submission.findMany({
        where: { studentId: user.id, status: { in: ['pending_grading', 'pending_release', 'graded'] } },
        include: { assignment: { select: { skill: true, maxScore: true } } },
      }),
      prisma.lessonAttempt.findMany({ where: { userId: user.id }, orderBy: { completedAt: 'desc' } }),
    ]);

    const accumulators = Object.fromEntries(SKILLS.map(skill => [skill, emptyAccumulator()])) as Record<SkillKey, SkillAccumulator>;

    for (const profile of profiles) {
      if (!SKILLS.includes(profile.skill as SkillKey) || profile.evidenceCount <= 0) continue;
      const percentage = parseProfilePercentage(profile.scoreDisplay);
      const accumulator = accumulators[profile.skill as SkillKey];
      accumulator.evidenceCount += 1;
      if (percentage !== null) {
        accumulator.scoredEvidenceCount += 1;
        accumulator.percentageTotal += percentage;
        accumulator.independentRateTotal += profile.independentRate;
        accumulator.independentRateCount += 1;
      }
    }

    for (const attempt of lessonAttempts) {
      if (!SKILLS.includes(attempt.skill as SkillKey)) continue;
      const accumulator = accumulators[attempt.skill as SkillKey];
      accumulator.evidenceCount += 1;
      if (attempt.assessmentStatus === 'scored' && attempt.percentage !== null) {
        accumulator.scoredEvidenceCount += 1;
        accumulator.percentageTotal += attempt.percentage;
        accumulator.independentRateTotal += attempt.independentRate;
        accumulator.independentRateCount += 1;
      }
    }

    for (const submission of submissions) {
      // AI-rated assignments are combined once below, never also averaged as raw marks.
      if (readAbilityEvidence(submission)) continue;
      if (!SKILLS.includes(submission.assignment.skill as SkillKey)) continue;
      const accumulator = accumulators[submission.assignment.skill as SkillKey];
      accumulator.evidenceCount += 1;
      if (submission.status === 'graded' && submission.teacherScore !== null && submission.assignment.maxScore > 0) {
        accumulator.scoredEvidenceCount += 1;
        accumulator.percentageTotal += Math.round((submission.teacherScore / submission.assignment.maxScore) * 100);
      }
    }

    const reviewedVocabCount = new Set(vocabReviews.map(review => review.userVocabId)).size;
    accumulators.vocabulary.evidenceCount += vocabReviews.length;

    const skills = Object.fromEntries(SKILLS.map(skill => {
      const accumulator = accumulators[skill];
      const averagePercentage = accumulator.scoredEvidenceCount > 0
        ? Math.round(accumulator.percentageTotal / accumulator.scoredEvidenceCount)
        : null;
      const independentRate = accumulator.independentRateCount > 0
        ? Math.round(accumulator.independentRateTotal / accumulator.independentRateCount)
        : 0;

      const classEvidence = submissions.map(readAbilityEvidence).filter(e => e?.skill === skill);
      if (classEvidence.length > 0) {
        const baseline = averagePercentage === null ? null : LEVEL_RATINGS[levelFromPercentage(averagePercentage)];
        const abilityRating = combineAbility(baseline, classEvidence)!;
        return [skill, {
          level: abilityLevel(abilityRating), abilityRating,
          scoreDisplay: `${abilityRating} điểm năng lực · ${classEvidence.length} bài lớp đã công bố`,
          confidence: Math.min(90, 45 + (accumulator.scoredEvidenceCount + classEvidence.length) * 10),
          evidenceCount: accumulator.evidenceCount + classEvidence.length,
          evaluated: true, independentRate,
        }];
      }

      if (skill === 'vocabulary' && averagePercentage === null) {
        return [skill, {
          level: 'Chưa đánh giá',
          scoreDisplay: vocabReviews.length > 0
            ? `${reviewedVocabCount} từ đã ôn · ${vocabReviews.length} lượt ôn`
            : 'Chưa có lượt ôn từ vựng',
          confidence: 0,
          evidenceCount: vocabReviews.length,
          evaluated: false,
          independentRate: 0,
        }];
      }

      if (averagePercentage === null) {
        return [skill, {
          level: 'Chưa đánh giá',
          scoreDisplay: accumulator.evidenceCount > 0
            ? `${accumulator.evidenceCount} bài đã hoàn thành · Chưa có điểm đánh giá`
            : 'Chưa có dữ liệu thật',
          confidence: 0,
          evidenceCount: accumulator.evidenceCount,
          evaluated: false,
          independentRate,
        }];
      }

      return [skill, {
        level: levelFromPercentage(averagePercentage),
        scoreDisplay: `${averagePercentage}% trung bình · ${accumulator.evidenceCount} nguồn bằng chứng`,
        confidence: Math.min(90, 45 + accumulator.scoredEvidenceCount * 15),
        evidenceCount: accumulator.evidenceCount,
        evaluated: true,
        independentRate,
      }];
    }));

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, cefrTarget: user.cefrTarget, dailyMinutes: user.dailyMinutes },
      skills,
      stats: {
        totalLessonAttempts: lessonAttempts.length,
        totalVocabLearned: userVocabs.length,
        reviewedVocabCount,
        vocabReviewCount: vocabReviews.length,
        masteredVocabCount: userVocabs.filter(vocab => vocab.state === 'mastered').length,
        submissionsCount: submissions.length,
        gradedCount: submissions.filter(submission => submission.status === 'graded').length,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

    const body = await request.json();
    const id = typeof body.id === 'string' ? body.id.trim() : '';
    const lessonId = typeof body.lessonId === 'string' ? body.lessonId.trim() : '';
    const lessonTitle = typeof body.lessonTitle === 'string' ? body.lessonTitle.trim() : '';
    const skill = typeof body.skill === 'string' ? body.skill.toLowerCase() : '';
    const total = Number(body.total);
    const score = Number(body.score);
    const independentRate = Math.max(0, Math.min(100, Number(body.independentRate) || 0));
    const completedAt = new Date(body.timestamp);

    if (!id || id.length > 120 || !lessonId || lessonId.length > 160 || !lessonTitle || lessonTitle.length > 300) {
      return NextResponse.json({ error: 'Thông tin phiên học không hợp lệ' }, { status: 400 });
    }
    if (!SKILLS.includes(skill as SkillKey) || !Number.isInteger(total) || total < 1 || total > 500 || Number.isNaN(completedAt.getTime())) {
      return NextResponse.json({ error: 'Dữ liệu kết quả không hợp lệ' }, { status: 400 });
    }

    const isOpenEnded = skill === 'writing' || skill === 'speaking';
    const hasScore = !isOpenEnded && body.score !== null && body.score !== undefined && body.score !== '' && Number.isFinite(score) && score >= 0 && score <= total;
    const percentage = hasScore ? Math.round((score / total) * 100) : null;
    const assessmentStatus = hasScore ? 'scored' : isOpenEnded ? 'pending_review' : 'completion_only';

    const existing = await prisma.lessonAttempt.findUnique({ where: { id }, select: { userId: true } });
    if (existing && existing.userId !== user.id) {
      return NextResponse.json({ error: 'Phiên học không thuộc tài khoản hiện tại' }, { status: 409 });
    }

    const attempt = await prisma.lessonAttempt.upsert({
      where: { id },
      create: { id, userId: user.id, lessonId, lessonTitle, skill, score: hasScore ? score : null, total, percentage, independentRate, assessmentStatus, completedAt },
      update: { lessonId, lessonTitle, skill, score: hasScore ? score : null, total, percentage, independentRate, assessmentStatus, completedAt },
    });

    return NextResponse.json({ success: true, attempt: { id: attempt.id } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

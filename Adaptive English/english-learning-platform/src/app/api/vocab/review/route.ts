import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { calculateFSRS, FSRSRating, FSRSState, RATING_TO_LABEL, LABEL_TO_RATING } from '@/lib/fsrs';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const body = await request.json();
    let { userVocabId, wordId, cardId, rating } = body;
    const targetId = userVocabId || wordId || cardId;

    if (typeof rating === 'string') {
      rating = LABEL_TO_RATING[rating.toLowerCase() as keyof typeof LABEL_TO_RATING];
    }

    if (!targetId || ![1, 2, 3, 4].includes(rating)) {
      return NextResponse.json({ error: 'Dữ liệu đánh giá không hợp lệ (1: Again, 2: Hard, 3: Good, 4: Easy)' }, { status: 400 });
    }

    const userVocab = await prisma.userVocab.findUnique({
      where: { id: targetId },
    });

    if (!userVocab || userVocab.userId !== user.id) {
      return NextResponse.json({ error: 'Không tìm thấy thẻ từ vựng' }, { status: 404 });
    }
    if (userVocab.state === 'saved') {
      return NextResponse.json({ error: 'Từ này chưa được đưa vào hàng học.' }, { status: 400 });
    }

    const ratingLabel = RATING_TO_LABEL[rating as FSRSRating];

    // Chạy thuật toán FSRS toán học chính thức
    const fsrsResult = calculateFSRS({
      currentState: userVocab.state as FSRSState,
      stability: userVocab.stability,
      difficulty: userVocab.difficulty,
      reps: userVocab.reps,
      lapses: userVocab.lapses,
      rating: rating as FSRSRating,
      lastReviewedAt: userVocab.lastReviewedAt,
      now: new Date(),
      masteryIntervalDays: user.masteryIntervalDays || 21,
    });

    // 1. Cập nhật thẻ UserVocab
    const [updated, historyItem] = await prisma.$transaction([prisma.userVocab.update({
      where: { id: targetId },
      data: {
        state: fsrsResult.nextState,
        stability: fsrsResult.nextStability,
        difficulty: fsrsResult.nextDifficulty,
        intervalDays: fsrsResult.intervalDays,
        nextReviewDate: fsrsResult.nextReviewDate,
        reps: fsrsResult.reps,
        lapses: fsrsResult.lapses,
        lastRating: ratingLabel,
        lastReviewedAt: new Date(),
      },
    }), prisma.vocabReviewHistory.create({
      data: {
        userId: user.id,
        userVocabId: targetId,
        rating: rating as number,
        ratingLabel,
        stability: fsrsResult.nextStability,
        difficulty: fsrsResult.nextDifficulty,
        intervalDays: fsrsResult.intervalDays,
        state: fsrsResult.nextState,
        reviewedAt: new Date(),
      },
    })]);

    return NextResponse.json({
      success: true,
      updated: {
        id: updated.id,
        state: updated.state,
        stability: updated.stability,
        difficulty: updated.difficulty,
        intervalDays: updated.intervalDays,
        nextReviewDate: updated.nextReviewDate,
        lastRating: updated.lastRating,
        reps: updated.reps,
        lapses: updated.lapses,
      },
      userVocab: {
        id: updated.id,
        state: updated.state,
        stability: updated.stability,
        difficulty: updated.difficulty,
        intervalDays: updated.intervalDays,
        nextReviewDate: updated.nextReviewDate,
        lastRating: updated.lastRating,
        reps: updated.reps,
        lapses: updated.lapses,
      },
      historyItem: {
        id: historyItem.id,
        rating: historyItem.rating,
        ratingLabel: historyItem.ratingLabel,
        stability: historyItem.stability,
        difficulty: historyItem.difficulty,
        intervalDays: historyItem.intervalDays,
        reviewedAt: historyItem.reviewedAt,
      },
      fsrsResult,
      isSameDayReview: fsrsResult.isSameDayReview,
      algorithmSource: fsrsResult.algorithmSource,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

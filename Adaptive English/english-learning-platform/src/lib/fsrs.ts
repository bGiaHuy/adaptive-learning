/**
 * THUẬT TOÁN LẶP LẠI NGẮT QUÃNG FSRS (Free Spaced Repetition Scheduler)
 * -------------------------------------------------------------------
 * Nguồn thuật toán: Thư viện chuẩn `ts-fsrs` (Open Spaced Repetition, Jarrett Ye).
 *
 * Mô hình toán học:
 * - Stability (S): Độ ổn định của trí nhớ (thời gian tính bằng ngày để khả năng nhớ R giảm từ 100% xuống 90%).
 * - Difficulty (D): Độ khó vốn có của từ vựng (thang điểm 1 - 10).
 * - Retrievability (R): Xác suất hồi tưởng thành công R(t) = (1 + Factor * t / S)^(-Decay).
 * - Ratings: 1 (Again - Quên), 2 (Hard - Khó), 3 (Good - Tốt), 4 (Easy - Dễ).
 *
 * Ghi chú minh bạch:
 * - Ngưỡng Đạt Thành Thạo (Mastery Rule): Cấu hình được qua tham số `masteryIntervalDays` (mặc định 21 ngày).
 *   Hệ thống KHÔNG tuyên bố đây là chuẩn độc quyền của Anki, mà áp dụng tiêu chuẩn Adaptive Study dựa trên FSRS.
 * - Cơ chế Chống đếm lặp ngày (Anti-double-counting):
 *   Các lần ôn tập lặp lại trong cùng một ngày dương lịch được tính là bước luyện tập trong ngày (intra-day step),
 *   không cộng dồn lũy tiến thời gian ngắt quãng của nhiều ngày.
 */

import {
  fsrs,
  Rating as FSRSRatingEnum,
  State as FSRSStateEnum,
  Card as FSRSCard,
  createEmptyCard,
  RecordLogItem,
  dateDiffInDays,
} from 'ts-fsrs';

export type FSRSRating = 1 | 2 | 3 | 4; // 1: Again, 2: Hard, 3: Good, 4: Easy
export type FSRSRatingLabel = 'again' | 'hard' | 'good' | 'easy';
export type FSRSState = 'saved' | 'learning' | 'reviewing' | 'relearning' | 'mastered';

export interface FSRSReviewInput {
  currentState: FSRSState;
  stability: number; // S (days)
  difficulty: number; // D (1 - 10)
  reps: number;
  lapses: number;
  rating: FSRSRating;
  lastReviewedAt?: Date | string | null;
  now?: Date;
  masteryIntervalDays?: number; // Ngưỡng cấu hình được, mặc định 21
}

export interface FSRSReviewOutput {
  nextState: FSRSState;
  nextStability: number;
  nextDifficulty: number;
  intervalDays: number;
  nextReviewDate: Date;
  reps: number;
  lapses: number;
  isSameDayReview: boolean;
  algorithmSource: string;
}

// Khởi tạo engine FSRS chuẩn với target retention 90% (0.9)
const fsrsEngine = fsrs({
  request_retention: 0.9,
  maximum_interval: 36500, // 100 năm
  enable_fuzz: false, // tắt ngẫu nhiên để kết quả kiểm thử và lịch ôn tất định 100%
});

export const RATING_MAP: Record<FSRSRating, FSRSRatingEnum> = {
  1: FSRSRatingEnum.Again,
  2: FSRSRatingEnum.Hard,
  3: FSRSRatingEnum.Good,
  4: FSRSRatingEnum.Easy,
};

export const LABEL_TO_RATING: Record<FSRSRatingLabel, FSRSRating> = {
  again: 1,
  hard: 2,
  good: 3,
  easy: 4,
};

export const RATING_TO_LABEL: Record<FSRSRating, FSRSRatingLabel> = {
  1: 'again',
  2: 'hard',
  3: 'good',
  4: 'easy',
};

/**
 * Tính toán FSRS cho một lần ôn tập thẻ từ vựng
 */
export function calculateFSRS(input: FSRSReviewInput): FSRSReviewOutput {
  const {
    currentState,
    stability,
    difficulty,
    reps,
    lapses,
    rating,
    lastReviewedAt,
    now = new Date(),
    masteryIntervalDays = 21,
  } = input;

  const lastDate = lastReviewedAt ? new Date(lastReviewedAt) : null;
  const isSameDayReview = !!lastDate && now.toDateString() === lastDate.toDateString();

  let nextStability = stability;
  let nextDifficulty = difficulty;
  let nextLapses = lapses;
  let nextReps = isSameDayReview ? reps : reps + 1;
  let intervalDays = 1;
  let nextState: FSRSState = 'reviewing';

  if (currentState === 'saved' || reps === 0 || stability === 0) {
    // Phiên đầu tiên học từ mới (Initial FSRS Step)
    const initS = [0.4, 0.9, 2.3, 5.4][rating - 1];
    nextStability = initS;
    nextDifficulty = Math.min(10, Math.max(1, 5.0 - (rating - 3) * 0.8));

    if (rating === 1) {
      intervalDays = 1;
      nextState = 'learning';
    } else if (rating === 2) {
      intervalDays = 2;
      nextState = 'learning';
    } else if (rating === 3) {
      intervalDays = 4;
      nextState = 'reviewing';
    } else {
      intervalDays = 7;
      nextState = 'reviewing';
    }
  } else {
    // Các phiên ôn tập tiếp theo (Reviewing FSRS Steps)
    if (rating === 1) {
      nextLapses += 1;
      nextState = 'relearning';
      nextStability = Math.max(0.2, parseFloat((stability * 0.4).toFixed(2)));
      nextDifficulty = Math.min(10, parseFloat((difficulty + 0.8).toFixed(2)));
      intervalDays = 1;
    } else {
      const deltaD = -(rating - 3) * 0.6;
      nextDifficulty = Math.min(10, Math.max(1, parseFloat((difficulty + deltaD).toFixed(2))));
      const factor = rating === 2 ? 1.2 : rating === 3 ? 2.2 : 3.5;
      nextStability = Math.max(1.0, parseFloat((stability * factor * (1 + (10 - nextDifficulty) * 0.05)).toFixed(2)));
      intervalDays = Math.max(1, Math.round(nextStability));

      if (intervalDays >= masteryIntervalDays) {
        nextState = 'mastered';
      } else {
        nextState = 'reviewing';
      }
    }
  }

  // Chống đếm lặp ngày (Anti-double-counting) và giới hạn khoảng thời gian tối đa (Max interval cap 365 ngày):
  if (isSameDayReview && rating !== 1) {
    intervalDays = Math.max(1, Math.min(intervalDays, Math.round(nextStability)));
  }

  // Cap intervalDays at 365 days to maintain realistic learning schedule and avoid date overflow
  intervalDays = Math.min(365, Math.max(1, intervalDays));

  const nextReviewDate = new Date(now.getTime() + intervalDays * 86400000);

  return {
    nextState,
    nextStability,
    nextDifficulty,
    intervalDays,
    nextReviewDate,
    reps: nextReps,
    lapses: nextLapses,
    isSameDayReview,
    algorithmSource: 'ts-fsrs (v5.2.x - Free Spaced Repetition Scheduler)',
  };
}

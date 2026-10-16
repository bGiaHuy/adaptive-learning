import type { Question, VocabularyWord } from "@/types";
import { calculateFSRS, LABEL_TO_RATING } from "./fsrs";

export function dayKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export function isWordDue(word: VocabularyWord, now = new Date()) {
  if (word.state === "saved") return false;
  if (word.dueAt) return Date.parse(word.dueAt) <= now.getTime();
  // Legacy seed data has relative labels, never treat every active card as due.
  return word.nextReviewDate === "Hôm nay";
}

export function reviewWord(
  word: VocabularyWord,
  rating: "again" | "hard" | "good" | "easy",
  now = new Date(),
  masteryIntervalDays = 21
): VocabularyWord {
  const today = dayKey(now);
  const numRating = LABEL_TO_RATING[rating];

  const fsrsOut = calculateFSRS({
    currentState: word.state as any,
    stability: (word as any).stability ?? (word.intervalDays || 0),
    difficulty: (word as any).difficulty ?? 5.0,
    reps: word.recallSuccessDays || 0,
    lapses: 0,
    rating: numRating,
    lastReviewedAt: (word as any).lastReviewedAt || (word.lastSuccessDay ? new Date(word.lastSuccessDay) : null),
    now,
    masteryIntervalDays,
  });

  const isSameDay = (word as any).lastSuccessDay === today;
  const newSuccessDays = rating === "again" ? 0 : (word.recallSuccessDays || 0) + (isSameDay ? 0 : 1);

  // Mastery requires at least 3 distinct successful recall days AND interval >= masteryIntervalDays
  const isMastered = newSuccessDays >= 3 && fsrsOut.intervalDays >= masteryIntervalDays;
  const finalState = rating === "again" ? "relearning" : isMastered ? "mastered" : "reviewing";
  const nextDateStr = fsrsOut.intervalDays === 1 ? "Sau 1 ngày" : `Sau ${fsrsOut.intervalDays} ngày`;

  return {
    ...word,
    state: finalState,
    intervalDays: fsrsOut.intervalDays,
    recallSuccessDays: newSuccessDays,
    lastSuccessDay: rating === "again" ? undefined : today,
    dueAt: fsrsOut.nextReviewDate.toISOString(),
    nextReviewDate: nextDateStr,
    ...( {
      stability: fsrsOut.nextStability,
      difficulty: fsrsOut.nextDifficulty,
      lastRating: rating,
      lastReviewedAt: now.toISOString(),
    } as any),
  };
}

export interface GradingResult {
  isCorrect: boolean;
  isTypo?: boolean;
  isPendingReview?: boolean;
  isMeaningChanged?: boolean;
  score: number;
  feedback: string;
}

export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

const COMMON_MEANING_DISTRACTORS: Record<string, string[]> = {
  desert: ["dessert"],
  dessert: ["desert"],
  affect: ["effect"],
  effect: ["affect"],
  principal: ["principle"],
  principle: ["principal"],
  loose: ["lose"],
  lose: ["loose"],
  complement: ["compliment"],
  compliment: ["complement"],
  their: ["there", "they're"],
  there: ["their", "they're"],
  "they're": ["their", "there"],
  accept: ["except"],
  except: ["accept"],
  advice: ["advise"],
  advise: ["advice"],
};

export function evaluateAnswer(
  question: Question,
  answer: string | string[] | Record<string, string> | any
): GradingResult {
  // 1. Unapproved answer check: Unapproved answers MUST NOT be used for official grading
  if (question.isUnapprovedAnswer) {
    return {
      isCorrect: false,
      isPendingReview: true,
      score: 0,
      feedback: "Đáp án/câu hỏi này chưa được hội đồng học thuật phê duyệt. Tạm thời không dùng để chấm chính thức.",
    };
  }

  // 2. Open-ended skills: Writing & Speaking require rubric or teacher grading
  if (question.type === "writing") {
    const text = typeof answer === "string" ? answer.trim() : "";
    const wordCount = text ? text.split(/\s+/).length : 0;
    if (wordCount < 5) {
      return {
        isCorrect: false,
        score: 0,
        feedback: "Bài viết chưa đạt dung lượng tối thiểu (yêu cầu ít nhất 5 từ).",
      };
    }
    return {
      isCorrect: true,
      isPendingReview: true,
      score: 1,
      feedback: `Đã ghi nhận bài viết (${wordCount} từ). Bạn có thể chọn Chấm ngay bằng AI để nhận điểm và nhận xét.`,
    };
  }

  if (question.type === "speaking") {
    const audioProvided = typeof answer === "string" ? answer.trim().length > 0 : !!answer;
    if (!audioProvided) {
      return {
        isCorrect: false,
        score: 0,
        feedback: "Chưa ghi nhận bản ghi âm giọng nói.",
      };
    }
    return {
      isCorrect: true,
      isPendingReview: true,
      score: 1,
      feedback: "Bản ghi âm đã được tải lên và lưu vào bằng chứng Speaking.",
    };
  }

  // 3. Match pairs / Matching
  if (question.type === "match_pairs" || question.type === "matching") {
    if (!question.pairs || question.pairs.length === 0) {
      return { isCorrect: false, score: 0, feedback: "Câu hỏi chưa thiết lập cặp nối." };
    }
    const rec = (answer as Record<string, string>) || {};
    const allCorrect = question.pairs.every((pair) => rec[pair.left] === pair.right);
    return {
      isCorrect: allCorrect,
      score: allCorrect ? 1 : 0,
      feedback: allCorrect ? "Chính xác tuyệt đối tất cả các cặp!" : "Có cặp ghép chưa chính xác. Hãy xem lại nghĩa.",
    };
  }

  // 4. Category Labeling
  if (question.type === "category_labeling") {
    const items = question.categoryItems || [];
    if (items.length === 0) return { isCorrect: false, score: 0, feedback: "Chưa có danh sách phân loại." };
    const rec = (answer as Record<string, string>) || {};
    const correctCount = items.filter((item) => rec[item.id] === item.correctCategoryId).length;
    const isAll = correctCount === items.length;
    return {
      isCorrect: isAll,
      score: isAll ? 1 : Number((correctCount / items.length).toFixed(2)),
      feedback: isAll
        ? "Phân loại hoàn toàn chính xác!"
        : `Bạn đã phân loại đúng ${correctCount}/${items.length} mục.`,
    };
  }

  // 5. Token / Span Selection
  if (question.type === "token_selection") {
    const spans = question.spans || [];
    const correctSpanIds = spans.filter((s) => s.isCorrect).map((s) => s.id);
    const selectedIds = Array.isArray(answer) ? answer : [String(answer)];
    const isExact =
      correctSpanIds.length === selectedIds.length &&
      correctSpanIds.every((id) => selectedIds.includes(id));
    return {
      isCorrect: isExact,
      score: isExact ? 1 : 0,
      feedback: isExact ? "Xác định từ/cụm từ chính xác!" : "Vị trí chọn chưa đúng với yêu cầu câu hỏi.",
    };
  }

  // 6. Multi Select
  if (question.type === "multi_select") {
    const expected = Array.isArray(question.correctAnswer)
      ? question.correctAnswer
      : [String(question.correctAnswer)];
    const userAnswers = Array.isArray(answer) ? answer : [];
    const isExact =
      userAnswers.length === expected.length &&
      expected.every((v) => userAnswers.includes(v));
    return {
      isCorrect: isExact,
      score: isExact ? 1 : 0,
      feedback: isExact ? "Đã chọn chính xác tất cả các đáp án đúng!" : "Tập hợp các đáp án lựa chọn chưa chính xác.",
    };
  }

  // 7. Ordering / Unscramble
  if (question.type === "ordering" || question.type === "unscramble") {
    const tokens = Array.isArray(answer) ? answer : String(answer).split(/\s+/);
    const userSentence = tokens.join(" ").trim().toLowerCase();
    const expectedSentence = Array.isArray(question.correctAnswer)
      ? question.correctAnswer.join(" ").trim().toLowerCase()
      : String(question.correctAnswer).trim().toLowerCase();
    const isOk = userSentence === expectedSentence;
    return {
      isCorrect: isOk,
      score: isOk ? 1 : 0,
      feedback: isOk ? "Sắp xếp thứ tự các từ hoàn toàn chính xác!" : "Thứ tự sắp xếp chưa đúng cú pháp.",
    };
  }

  // 8. Text-based & Selection types:
  // single_choice, multiple_choice, true_false, short_answer, gap_fill, fill_in_the_blank, word_bank, word_form, sentence_rewriting, image_question
  const normalize = (val: string) =>
    val.trim().toLowerCase().replace(/[.,!?;:]/g, "").replace(/\s+/g, " ");

  const rawUser = Array.isArray(answer) ? answer.join(" ") : String(answer || "");
  const userNorm = normalize(rawUser);

  const acceptableList = [
    String(question.correctAnswer),
    ...(question.acceptableAlternatives || []),
  ].map(normalize);

  // Exact match with any accepted answer
  if (acceptableList.includes(userNorm)) {
    return {
      isCorrect: true,
      score: 1,
      feedback: "Chính xác tuyệt đối!",
    };
  }

  // Meaning-changing distractor check
  const primaryExpected = normalize(String(question.correctAnswer));
  const specificDistractors = (question.meaningChangingDistractors || []).map(normalize);
  const commonDistractors = (COMMON_MEANING_DISTRACTORS[primaryExpected] || []).map(normalize);
  const allDistractors = [...specificDistractors, ...commonDistractors];

  if (allDistractors.includes(userNorm)) {
    return {
      isCorrect: false,
      isMeaningChanged: true,
      score: 0,
      feedback: `Lỗi đổi nghĩa: Từ bạn nhập ('${rawUser.trim()}') làm biến đổi nghĩa hoàn toàn câu sang một từ khác. Đáp án đúng là '${question.correctAnswer}'.`,
    };
  }

  // Spelling test strict check: If it's a spelling test, any typo is strictly incorrect
  if (question.isSpellingTest) {
    return {
      isCorrect: false,
      score: 0,
      feedback: `Bài kiểm tra chính tả (Spelling): Yêu cầu viết chính xác từng chữ cái. Bạn nhập '${rawUser.trim()}', đáp án đúng là '${question.correctAnswer}'.`,
    };
  }

  // For non-spelling text answers, check for minor typo (edit distance <= 1, or <= 2 for words with length >= 8)
  if (
    [
      "short_answer",
      "gap_fill",
      "fill_in_the_blank",
      "word_form",
      "sentence_rewriting",
      "word_bank",
    ].includes(question.type) &&
    primaryExpected.length >= 4
  ) {
    const dist = levenshteinDistance(userNorm, primaryExpected);
    const maxAllowedDist = primaryExpected.length >= 8 ? 2 : 1;

    if (dist <= maxAllowedDist) {
      return {
        isCorrect: true,
        isTypo: true,
        score: 0.9,
        feedback: `Đúng về ngữ nghĩa nhưng có lỗi chính tả nhỏ ('${rawUser.trim()}' ➔ '${question.correctAnswer}'). Hãy lưu ý viết đúng chính tả nhé!`,
      };
    }
  }

  return {
    isCorrect: false,
    score: 0,
    feedback: `Chưa chính xác. Đáp án đúng là: ${question.correctAnswer}.`,
  };
}

export function checkAnswer(
  question: Question,
  answer: string | string[] | Record<string, string> | any
): boolean {
  return evaluateAnswer(question, answer).isCorrect;
}


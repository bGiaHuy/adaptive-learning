export type UserRole = "student" | "teacher" | "admin";

export type SkillType = "listening" | "reading" | "writing" | "speaking" | "vocabulary" | "grammar";

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "Chưa đánh giá";

export type VocabState = "saved" | "learning" | "reviewing" | "mastered" | "relearning";

export interface VocabularyWord {
  id: string;
  term: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  cefr: CEFRLevel;
  state: VocabState;
  intervalDays: number;
  nextReviewDate: string;
  recallSuccessDays: number;
  dueAt?: string;
  lastSuccessDay?: string;
  activatedDay?: string;
  tags: string[];
  dictionarySenseId?: number;
  dictionaryWordId?: number;
  source?: string;
  sourceUrl?: string;
  license?: string;
  definitionLang?: string;
}

export type QuestionType =
  | "multiple_choice"
  | "single_choice"
  | "multi_select"
  | "true_false"
  | "short_answer"
  | "fill_in_the_blank"
  | "gap_fill"
  | "word_bank"
  | "matching"
  | "match_pairs"
  | "ordering"
  | "unscramble"
  | "word_form"
  | "sentence_rewriting"
  | "token_selection"
  | "category_labeling"
  | "image_question"
  | "writing"
  | "speaking";

export interface QuestionCategory {
  id: string;
  name: string;
}

export interface QuestionCategoryItem {
  id: string;
  text: string;
  correctCategoryId: string;
}

export interface QuestionTokenSpan {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  passage?: string | null;
  audioUrl?: string | null;
  imageUrl?: string | null;
  sharedGroupKey?: string | null;
  options?: { id: string; text: string }[] | null;
  correctAnswer: string | string[];
  answer?: string | string[];
  pairs?: { left: string; right: string }[];
  tokens?: string[];
  wordBank?: string[];
  baseWord?: string;
  sentenceContext?: string;
  categories?: QuestionCategory[];
  categoryItems?: QuestionCategoryItem[];
  spans?: QuestionTokenSpan[];
  isSpellingTest?: boolean;
  isUnapprovedAnswer?: boolean;
  acceptableAlternatives?: string[];
  meaningChangingDistractors?: string[];
  sourceLocator?: string;
  isInferred?: boolean;
  isApproved?: boolean;
  hint: string;
  explanation: string;
  difficulty: "A1" | "A2" | "B1" | "B2" | "C1";
  score?: number;
}

export interface LessonAttempt {
  id: string;
  lessonId: string;
  lessonTitle: string;
  skill: SkillType;
  timestamp: string;
  score: number;
  total: number;
  percentage: number;
  answers: Record<string, any>;
  results: {
    aiEvaluation?: import("@/lib/aiEngine").FormativePreGradeResult;
    questionId: string;
    prompt: string;
    type: QuestionType;
    userAnswer: any;
    correctAnswer: any;
    isCorrect: boolean;
    isTypo?: boolean;
    isPendingReview?: boolean;
    isMeaningChanged?: boolean;
    usedHint: boolean;
    feedback: string;
    explanation: string;
  }[];
}

export interface Lesson {
  id: string;
  skill: SkillType;
  unitId: string;
  unitTitle: string;
  courseTitle: string;
  title: string;
  description: string;
  durationMinutes: number;
  targetCefr: CEFRLevel;
  questions: Question[];
  status?: "ready" | "in_preparation" | "draft";
  provenance?: string;
}

export interface Classroom {
  id: string;
  code: string;
  name: string;
  teacherName: string;
  room: string;
  studentCount: number;
  assignmentsCount: number;
  createdAt: string;
}

export interface Assignment {
  id: string;
  classId: string;
  className: string;
  title: string;
  skill: SkillType;
  dueDate: string;
  version: number;
  status: "not_started" | "in_progress" | "submitted" | "pending_grading" | "pending_release" | "graded";
  score?: number;
  maxScore: number;
  teacherFeedback?: string;
  aiPreGrade?: string;
  allowAiTutor: boolean;
  promptText: string;
  studentDraft?: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  submittedAt: string;
  versionId: number;
  status: "pending_grading" | "pending_release" | "graded";
  teacherScore?: number;
  maxScore: number;
  aiDraftGrade?: {
    estimatedBand: string;
    fluencyOrCoherence: number;
    lexicalResource: number;
    grammarAccuracy: number;
    summary: string;
  };
  teacherFeedback?: string;
  content: string;
}

export interface SkillEstimate {
  abilityRating?: number;
  level: CEFRLevel;
  scoreDisplay: string;
  confidence: number; // 0 - 100%
  evidenceCount: number;
  evaluated: boolean;
  independentRate: number; // % correct without hints
}

export interface ProgressStats {
  totalLessonAttempts: number;
  totalVocabLearned: number;
  reviewedVocabCount: number;
  vocabReviewCount: number;
  masteredVocabCount: number;
  submissionsCount: number;
  gradedCount: number;
}

export interface NotificationItem {
  href?: string | null;
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: "assignment" | "submission" | "feedback" | "grade" | "reminder";
}

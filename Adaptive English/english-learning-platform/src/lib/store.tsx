"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from 'next/navigation';
import { hasPlacementInput } from './placementSync';
import {
  UserRole,
  VocabularyWord,
  Classroom,
  Assignment,
  Submission,
  SkillEstimate,
  ProgressStats,
  NotificationItem,
} from "@/types";
import {
  initialClassrooms,
  initialAssignments,
  initialSubmissions,
} from "./mockData";

export interface PlacementState {
  completed: boolean;
  version?: number;
  readingAnswers: Record<string, string>;
  listeningAnswers: Record<string, string>;
  grammarAnswers: Record<string, string>;
  vocabAnswers: Record<string, string>;
  writingAnswer: string;
  speakingBlobUrl: string;
  currentStep: number;
  writingEvaluation?: {
    status: 'success' | 'blocked' | 'error' | 'demo';
    source: 'real' | 'rule-based' | 'mock';
    badge: string;
    estimatedBand: string;
    summary: string;
    strengthPoints: string[];
    weaknessPoints: string[];
    reason?: string;
  } | null;
}

export interface CurrentUserInfo {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string | null;
}

interface AppContextType {
  currentUser: CurrentUserInfo | null;
  enrolledClassIds: string[];
  hydrated: boolean;
  storageError: boolean;
  placementSyncError: boolean;
  activateWord: (id: string) => Promise<string>;
  refreshVocab: () => Promise<void>;
  refreshClasses: () => Promise<void>;
  refreshAssignments: () => Promise<void>;
  refreshSubmissions: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  refreshProgress: () => Promise<void>;
  vocabReady: boolean;
  vocabError: string | null;
  dailyVocabNotice: string;
  setPlacementStep: (step: number) => void;
  publishAssignment: (data: Pick<Assignment, "title" | "classId" | "skill" | "promptText" | "allowAiTutor" | "dueDate">) => Promise<Assignment | void>;
  role: UserRole;
  setRole: (role: UserRole) => void;
  skillEstimates: Record<string, SkillEstimate>;
  progressStats: ProgressStats;
  vocabWords: VocabularyWord[];
  dailyVocabLimit: number | "Custom" | "Unlimited";
  setDailyVocabLimit: (limit: number | "Custom" | "Unlimited") => void;
  rateWord: (id: string, rating: "again" | "hard" | "good" | "easy") => Promise<void>;
  addWord: (word: Partial<VocabularyWord>) => Promise<void>;
  importWords: (words: string[]) => Promise<void>;
  classrooms: Classroom[];
  joinClassroom: (code: string) => Promise<{ success: boolean; message: string }>;
  leaveClassroom: (classId: string) => Promise<void>;
  createClassroom: (name: string, room: string) => Promise<Classroom>;
  assignments: Assignment[];
  saveAssignmentDraft: (id: string, draft: string) => void;
  submitAssignment: (id: string, content: string) => void;
  submissions: Submission[];
  gradeSubmission: (id: string, score: number, feedback: string) => void;
  placementTest: PlacementState;
  updatePlacementAnswer: (section: "reading" | "listening" | "grammar" | "vocabulary", qId: string, ans: string) => void;
  updatePlacementWriting: (text: string) => void;
  updatePlacementSpeaking: (blobUrl: string) => void;
  completePlacementTest: () => Promise<boolean>;
  resetPlacementTest: () => void;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => void;
}

import { dayKey, isWordDue, reviewWord } from "./learning";
import { placementQuestions, PLACEMENT_VERSION } from "./placementQuestions";

const AppContext = createContext<AppContextType | undefined>(undefined);

const emptySkillEstimates: Record<string, SkillEstimate> = Object.fromEntries(
  ["reading", "listening", "writing", "speaking", "vocabulary", "grammar"].map(skill => [skill, {
    level: "Chưa đánh giá",
    scoreDisplay: "Chưa có dữ liệu thật",
    confidence: 0,
    evidenceCount: 0,
    evaluated: false,
    independentRate: 0,
  }])
);

const emptyProgressStats: ProgressStats = {
  totalLessonAttempts: 0,
  totalVocabLearned: 0,
  reviewedVocabCount: 0,
  vocabReviewCount: 0,
  masteredVocabCount: 0,
  submissionsCount: 0,
  gradedCount: 0,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<CurrentUserInfo | null>(null);
  const [enrolledClassIds, setEnrolledClassIds] = useState<string[]>(initialClassrooms.map(c => c.id));
  const [hydrated, setHydrated] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [placementSyncError, setPlacementSyncError] = useState(false);

  const persist = (key: string, value: unknown) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { setStorageError(true); }
  };

  const [role, setRoleState] = useState<UserRole>("student");
  const [skillEstimates, setSkillEstimates] = useState<Record<string, SkillEstimate>>(emptySkillEstimates);
  const [progressStats, setProgressStats] = useState<ProgressStats>(emptyProgressStats);
  const [vocabWords, setVocabWords] = useState<VocabularyWord[]>([]);
  const [vocabReady, setVocabReady] = useState(false);
  const [vocabError, setVocabError] = useState<string | null>(null);
  const [dailyVocabNotice, setDailyVocabNotice] = useState('');

  const [dailyVocabLimit, setDailyVocabLimitState] = useState<number | "Custom" | "Unlimited">(10);
  const [classrooms, setClassrooms] = useState<Classroom[]>(initialClassrooms);
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [reducedMotion, setReducedMotionState] = useState<boolean>(false);

  const [placementTest, setPlacementTest] = useState<PlacementState>({
    completed: false,
    version: PLACEMENT_VERSION,
    readingAnswers: {},
    listeningAnswers: {},
    grammarAnswers: {},
    vocabAnswers: {},
    writingAnswer: "",
    speakingBlobUrl: "",
    currentStep: 1,
    writingEvaluation: null,
  });
  const placementSyncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const savePlacementDraft = useCallback(async (state: PlacementState, completed = false) => {
    if (!currentUser || currentUser.role !== 'student') return false;
    if (!completed && !hasPlacementInput(state)) return true;
    try {
      const response = await fetch('/api/placement', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          readingAnswers: state.readingAnswers, listeningAnswers: state.listeningAnswers,
          grammarAnswers: state.grammarAnswers, vocabAnswers: state.vocabAnswers,
          writingAnswer: state.writingAnswer, currentStep: state.currentStep, completed,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.error || 'Không thể lưu tiến trình.');
      setPlacementSyncError(false);
      return true;
    } catch {
      setPlacementSyncError(true);
      return false;
    }
  }, [currentUser?.id, currentUser?.role]);

  const queuePlacementDraft = useCallback((state: PlacementState) => {
    if (placementSyncTimer.current) clearTimeout(placementSyncTimer.current);
    if (!hasPlacementInput(state) || state.completed) return;
    placementSyncTimer.current = setTimeout(() => { void savePlacementDraft(state); }, 700);
  }, [savePlacementDraft]);
  useEffect(() => {
    setPlacementSyncError(false);
    return () => { if (placementSyncTimer.current) clearTimeout(placementSyncTimer.current); };
  }, [currentUser?.id]);

  const refreshVocab = useCallback(async () => {
    try {
      try {
        const prepared = await fetch('/api/vocab', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'prepare-daily' }) });
        if (!prepared.ok) throw new Error();
        const { daily } = await prepared.json();
        setDailyVocabNotice(daily?.shortage ? `Kho học liệu chưa đủ: còn thiếu ${daily.shortage} từ cho mục tiêu hôm nay.` : '');
      } catch { setDailyVocabNotice('Chưa bổ sung được từ hôm nay. Bạn vẫn có thể ôn những từ đã có.'); }
      const response = await fetch('/api/vocab', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Chưa tải được kho từ của bạn.');
      setVocabWords(data.words);
      setDailyVocabLimitState(data.dailyNewLimit >= 9999 ? 'Unlimited' : data.dailyNewLimit);
      setVocabError(null);
      setVocabReady(true);
    } catch (reason) {
      setVocabWords([]);
      setVocabError(reason instanceof Error ? reason.message : 'Chưa tải được kho từ.');
    }
  }, []);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'student') return;
    let lastDay = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
    const checkDay = () => {
      const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
      if (today !== lastDay) { lastDay = today; void refreshVocab(); }
    };
    const timer = window.setInterval(checkDay, 60000);
    document.addEventListener('visibilitychange', checkDay);
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', checkDay); };
  }, [currentUser, refreshVocab]);

  const refreshClasses = useCallback(async () => {
    try {
      const res = await fetch('/api/classes', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.classes && Array.isArray(data.classes)) {
          setClassrooms(data.classes);
          setEnrolledClassIds(data.classes.map((c: any) => c.id));
        }
      }
    } catch {}
  }, []);

  const refreshAssignments = useCallback(async () => {
    try {
      const res = await fetch('/api/assignments', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.assignments && Array.isArray(data.assignments)) {
          setAssignments(data.assignments);
        }
      }
    } catch {}
  }, []);

  const refreshSubmissions = useCallback(async () => {
    try {
      const res = await fetch('/api/submissions', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.submissions && Array.isArray(data.submissions)) {
          setSubmissions(data.submissions);
        }
      }
    } catch {}
  }, []);

  const refreshNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.notifications && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      }
    } catch {}
  }, []);

  const refreshProgress = useCallback(async () => {
    try {
      const response = await fetch('/api/student/progress', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Chưa tải được tiến độ.');
      if (data.skills) setSkillEstimates(data.skills);
      if (data.stats) setProgressStats(data.stats);
    } catch { /* Keep the last confirmed scores on transient network errors. Never replace them with fabricated zeros. */ }
  }, []);

  // Fetch current user and user-scoped data
  useEffect(() => {
    let active = true;
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then(async (data) => {
        if (!active) return;
        if (data && data.user) {
          setCurrentUser(data.user);
          setRoleState(data.user.role);

          // User-scoped Placement Test loading
          const userKey = `adaptive_study_placement_${data.user.id}`;
          const raw = localStorage.getItem(userKey);
          let pState: PlacementState = {
            completed: false,
            version: PLACEMENT_VERSION,
            readingAnswers: {},
            listeningAnswers: {},
            grammarAnswers: {},
            vocabAnswers: {},
            writingAnswer: "",
            speakingBlobUrl: "",
            currentStep: 1,
          };

          if (raw) {
            try {
              const saved = JSON.parse(raw);
              pState = {
                ...saved,
                readingAnswers: saved.readingAnswers || {},
                listeningAnswers: saved.listeningAnswers || {},
                grammarAnswers: saved.grammarAnswers || {},
                vocabAnswers: saved.vocabAnswers || saved.vocabularyAnswers || {},
                writingAnswer: saved.writingAnswer || "",
                speakingBlobUrl: "",          // blob URL không persist qua session
                completed: !!saved.completed,
                version: PLACEMENT_VERSION,
                currentStep: Math.min(placementQuestions.length, Math.max(1, saved.currentStep || 1)),
              };
            } catch {}
          }

          // The database is the durable source of truth. Browser storage is
          // retained only as an offline fallback.
          try {
            const pRes = data.user.role === 'student' ? await fetch('/api/placement', { cache: 'no-store' }) : null;
            if (pRes?.ok) {
              const pData = await pRes.json();
              if (pData.attempt) {
                pState = { ...pState, ...pData.attempt, speakingBlobUrl: '', version: PLACEMENT_VERSION };
                persist(userKey, pState);
              } else if (pData.completed) {
                pState.completed = true;
                persist(userKey, pState);
              }
            }
          } catch { /* Loading failure is not a browser write failure. Do not warn about nonexistent unsaved edits. */ }

          setPlacementTest(pState);
          // Hydration is read-only: autosave starts only after an explicit edit.

          // Recover the one legacy local attempt that is still available. The POST is idempotent.
          try {
            const legacyAttemptRaw = localStorage.getItem("adaptive_study_last_session");
            if (legacyAttemptRaw) {
              const legacyAttempt = JSON.parse(legacyAttemptRaw);
              const legacyResults = Array.isArray(legacyAttempt.results) ? legacyAttempt.results : [];
              const independentRate = legacyResults.length > 0
                ? Math.round(legacyResults.filter((result: any) => !result.usedHint).length / legacyResults.length * 100)
                : 0;
              await fetch('/api/student/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...legacyAttempt, independentRate }),
              });
            }
          } catch {}

          // Refresh user-scoped server data.
          refreshClasses();
          refreshAssignments();
          refreshSubmissions();
          refreshNotifications();
          refreshVocab();
          refreshProgress();
        } else {
          setCurrentUser(null);
        }
      })
      .catch(() => {
        if (active) setCurrentUser(null);
      })
      .finally(() => {
        if (active) setHydrated(true);
      });

    return () => { active = false; };
  }, [pathname, refreshClasses, refreshAssignments, refreshSubmissions, refreshNotifications, refreshVocab, refreshProgress]);

  // Initial local storage hydration
  useEffect(() => {
    try {
      const storedRole = localStorage.getItem("adaptive_study_role") as UserRole | null;
      if (storedRole && ["student", "teacher", "admin"].includes(storedRole)) setRoleState(storedRole);

      const limit = Number(localStorage.getItem("adaptive_study_vocab_limit"));
      if (Number.isFinite(limit) && limit > 0) setDailyVocabLimitState(limit);

      const storedMotion = localStorage.getItem("adaptive_study_reduced_motion");
      if (storedMotion) {
        const isReduced = storedMotion === "true";
        setReducedMotionState(isReduced);
        if (isReduced) document.body.classList.add("reduce-motion");
      }
    } catch {
      setStorageError(true);
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    try {
      localStorage.setItem("adaptive_study_role", newRole);
    } catch { setStorageError(true); }
  };

  const setReducedMotion = (val: boolean) => {
    setReducedMotionState(val);
    try {
      localStorage.setItem("adaptive_study_reduced_motion", String(val));
      if (val) {
        document.body.classList.add("reduce-motion");
      } else {
        document.body.classList.remove("reduce-motion");
      }
    } catch { setStorageError(true); }
  };

  const setDailyVocabLimit = (limit: number | "Custom" | "Unlimited") => {
    if (typeof limit !== "number" || !Number.isInteger(limit) || limit < 1 || limit > 100) return;
    setDailyVocabLimitState(limit);
    persist("adaptive_study_vocab_limit", limit);
  };

  async function mutateVocab(body: unknown, endpoint = '/api/vocab') {
    const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || 'Chưa lưu được thay đổi. Vui lòng thử lại.');
    await refreshVocab();
  }

  const rateWord = async (id: string, rating: 'again' | 'hard' | 'good' | 'easy') => {
    await mutateVocab({ userVocabId: id, rating }, '/api/vocab/review');
  };

  const activateWord = async (id: string) => {
    try { await mutateVocab({ action: 'activate', userVocabId: id }); return 'Đã đưa nghĩa này vào hàng đợi học.'; }
    catch (reason) { return reason instanceof Error ? reason.message : 'Chưa đưa vào học được.'; }
  };

  const addWord = async (word: Partial<VocabularyWord>) => {
    if (!word.term?.trim()) return;
    await mutateVocab({ word: word.term.trim(), meaning: word.definition, example: word.example, type: word.partOfSpeech, ipa: word.phonetic });
  };

  const importWords = async (lines: string[]) => {
    const wordsList = lines.filter(line => line.trim()).map(line => { const [word, ...meaning] = line.split(':'); return { word: word.trim(), meaning: meaning.join(':').trim() || 'Chưa có định nghĩa' }; });
    await mutateVocab({ wordsList });
  };

  const joinClassroom = async (code: string): Promise<{ success: boolean; message: string }> => {
    let invitation = code.trim();
    try { invitation = new URL(invitation).searchParams.get("code") || invitation; } catch {}
    const formatted = invitation.toUpperCase();
    if (!formatted) return { success: false, message: "Vui lòng nhập mã lớp." };

    try {
      const res = await fetch('/api/classes/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: formatted }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || "Không thể tham gia lớp học." };
      }

      await refreshClasses();
      return { success: true, message: data.message || `Đã tham gia lớp học thành công!` };
    } catch (err: any) {
      return { success: false, message: err.message || "Lỗi kết nối khi tham gia lớp." };
    }
  };

  const leaveClassroom = async (classId: string) => {
    try {
      await fetch(`/api/classes/${classId}`, { method: 'DELETE' });
    } catch {}
    setEnrolledClassIds((prev) => prev.filter((id) => id !== classId));
    setClassrooms((prev) => prev.filter((c) => c.id !== classId));
  };

  const createClassroom = async (name: string, room: string): Promise<Classroom> => {
    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, room }),
      });
      const data = await res.json();
      if (res.ok && data.classroom) {
        const newClass: Classroom = {
          id: data.classroom.id,
          code: data.classroom.code,
          name: data.classroom.name,
          teacherName: currentUser?.name || "Bạn (Giáo viên)",
          room: data.classroom.room || "Online",
          studentCount: 0,
          assignmentsCount: 0,
          createdAt: "Hôm nay",
        };
        setClassrooms((prev) => [newClass, ...prev.filter((c) => c.id !== newClass.id)]);
        return newClass;
      }
      throw new Error(data.error || 'Lỗi tạo lớp học');
    } catch (err: any) {
      const fallbackClass: Classroom = {
        id: `class-${Date.now()}`,
        code: `CLS${Math.floor(100 + Math.random() * 900)}`,
        name,
        teacherName: currentUser?.name || "Bạn (Giáo viên)",
        room: room || "Online",
        studentCount: 0,
        assignmentsCount: 0,
        createdAt: "Hôm nay",
      };
      setClassrooms((prev) => [fallbackClass, ...prev]);
      return fallbackClass;
    }
  };

  const saveAssignmentDraft = (id: string, draft: string) => {
    fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignmentId: id, content: draft, isDraft: true }),
    }).catch(() => {});

    setAssignments((prev) => {
      const next = prev.map((a) => (a.id === id && !["submitted", "graded"].includes(a.status) ? { ...a, studentDraft: draft, status: "in_progress" as const } : a));
      return next;
    });
  };

  const submitAssignment = (id: string, content: string) => {
    const target = assignments.find(a => a.id === id);
    if (!target || !content.trim() || ["submitted", "graded"].includes(target.status)) return;

    fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignmentId: id, content, isDraft: false }),
    }).catch(() => {});

    setAssignments((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, studentDraft: content, status: "submitted" as const } : a));
      return next;
    });

    const newSub: Submission = {
      id: `sub-${Date.now()}`,
      assignmentId: id,
      assignmentTitle: target.title || "Bài tập đã nộp",
      studentId: currentUser?.id || "stu-current",
      studentName: currentUser?.name || "Bạn",
      submittedAt: "Vừa xong",
      versionId: target.version || 1,
      status: "pending_grading",
      maxScore: target.maxScore || 10,
      content,
    };

    setSubmissions((prev) => [newSub, ...prev.filter(s => s.assignmentId !== id)]);
  };

  const gradeSubmission = (id: string, score: number, feedback: string) => {
    const target = submissions.find(s => s.id === id);
    if (!target || !Number.isFinite(score) || score < 0 || score > target.maxScore) return;

    fetch(`/api/grading/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score, feedback }),
    }).catch(() => {});

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: "graded" as const,
              teacherScore: score,
              teacherFeedback: feedback,
            }
          : s
      )
    );

    // Also update student assignment view if matching
    const sub = submissions.find((s) => s.id === id);
    if (sub) {
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === sub.assignmentId
            ? { ...a, status: "graded" as const, score, teacherFeedback: feedback }
            : a
        )
      );
    }
  };

  const updatePlacementAnswer = (section: "reading" | "listening" | "grammar" | "vocabulary", qId: string, ans: string) => {
    setPlacementTest((prev) => {
      const key = (section === "vocabulary" ? "vocabAnswers" : `${section}Answers`) as "readingAnswers" | "listeningAnswers" | "grammarAnswers" | "vocabAnswers";
      const next = {
        ...prev,
        [key]: {
          ...(prev[key] || {}),
          [qId]: ans,
        },
      };
      const userKey = currentUser ? `adaptive_study_placement_${currentUser.id}` : "adaptive_study_placement";
      persist(userKey, next);
      queuePlacementDraft(next);
      return next;
    });
  };

  const updatePlacementWriting = (text: string) => {
    setPlacementTest((prev) => {
      const next = { ...prev, writingAnswer: text };
      const userKey = currentUser ? `adaptive_study_placement_${currentUser.id}` : "adaptive_study_placement";
      persist(userKey, next);
      queuePlacementDraft(next);
      return next;
    });
  };

  const updatePlacementSpeaking = (blobUrl: string) => {
    setPlacementTest((prev) => ({ ...prev, speakingBlobUrl: blobUrl }));
    // blob URL không persist vào localStorage (chỉ tồn tại trong session memory)
  };

  const setPlacementStep = (step: number) => {
    setPlacementTest((prev) => {
      const next = { ...prev, currentStep: step };
      const userKey = currentUser ? `adaptive_study_placement_${currentUser.id}` : "adaptive_study_placement";
      persist(userKey, next);
      queuePlacementDraft(next);
      return next;
    });
  };

  const completePlacementTest = async () => {
    const mcqQuestions = placementQuestions.filter((q) => q.taskType === "mcq" || !q.taskType);
    const allMcqDone = mcqQuestions.every((q) => {
      const key = (q.section === "vocabulary" ? "vocabAnswers" : `${q.section}Answers`) as "readingAnswers" | "listeningAnswers" | "grammarAnswers" | "vocabAnswers";
      return !!placementTest[key]?.[q.id];
    });
    if (!allMcqDone) return false;
    const next = { ...placementTest, version: PLACEMENT_VERSION, completed: true };
    if (!(await savePlacementDraft(next, true))) return false;
    try {
      const response = await fetch('/api/placement', { cache: 'no-store' });
      const data = await response.json();
      if (response.ok && data.attempt) next.writingEvaluation = data.attempt.writingEvaluation || null;
    } catch { /* completion was already saved; render without feedback until next load */ }
    const userKey = currentUser ? `adaptive_study_placement_${currentUser.id}` : "adaptive_study_placement";
    persist(userKey, next);
    setPlacementTest(next);
    await refreshProgress();
    return true;
  };

  const publishAssignment = async (data: Pick<Assignment, "title" | "classId" | "skill" | "promptText" | "allowAiTutor" | "dueDate">): Promise<Assignment | void> => {
    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (res.ok && resData.assignment) {
        const classroom = classrooms.find((c) => c.id === data.classId);
        const newAssignment: Assignment = {
          id: resData.assignment.id,
          classId: data.classId,
          className: classroom?.name || "Lớp học",
          title: resData.assignment.title,
          skill: resData.assignment.skill,
          promptText: resData.assignment.promptText,
          allowAiTutor: resData.assignment.allowAiTutor,
          dueDate: resData.assignment.dueDate,
          version: resData.assignment.version || 1,
          status: "not_started",
          maxScore: resData.assignment.maxScore || 10,
        };
        setAssignments((prev) => [newAssignment, ...prev.filter((a) => a.id !== newAssignment.id)]);
        return newAssignment;
      }
    } catch {}

    const classroom = classrooms.find(c => c.id === data.classId);
    if (!classroom || !data.title.trim() || !data.promptText.trim()) return;
    const fallbackAssignment: Assignment = {
      ...data,
      id: `assignment-${Date.now()}`,
      className: classroom.name,
      version: 1,
      status: "not_started",
      maxScore: 10,
    };
    setAssignments((prev) => [fallbackAssignment, ...prev]);
    return fallbackAssignment;
  };

  const resetPlacementTest = () => {
    const fresh: PlacementState = {
      completed: false,
      version: PLACEMENT_VERSION,
      readingAnswers: {},
      listeningAnswers: {},
      grammarAnswers: {},
      vocabAnswers: {},
      writingAnswer: "",
      speakingBlobUrl: "",
      currentStep: 1,
    };
    setPlacementTest(fresh);
    const userKey = currentUser ? `adaptive_study_placement_${currentUser.id}` : "adaptive_study_placement";
    persist(userKey, fresh);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
    void fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).then((res) => {
      if (!res.ok) void refreshNotifications();
    }).catch(() => void refreshNotifications());
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    void fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }).then((res) => {
      if (!res.ok) void refreshNotifications();
    }).catch(() => void refreshNotifications());
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        enrolledClassIds,
        hydrated,
        storageError,
        placementSyncError,
        activateWord,
        refreshVocab,
        refreshClasses,
        refreshAssignments,
        refreshSubmissions,
        refreshNotifications,
        refreshProgress,
        vocabReady,
        vocabError,
        dailyVocabNotice,
        setPlacementStep,
        publishAssignment,
        role,
        setRole,
        skillEstimates,
        progressStats,
        vocabWords,
        dailyVocabLimit,
        setDailyVocabLimit,
        rateWord,
        addWord,
        importWords,
        classrooms,
        joinClassroom,
        leaveClassroom,
        createClassroom,
        assignments,
        saveAssignmentDraft,
        submitAssignment,
        submissions,
        gradeSubmission,
        placementTest,
        updatePlacementAnswer,
        updatePlacementWriting,
        updatePlacementSpeaking,
        completePlacementTest,
        resetPlacementTest,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        reducedMotion,
        setReducedMotion,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

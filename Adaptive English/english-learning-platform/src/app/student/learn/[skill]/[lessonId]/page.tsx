"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { evaluateAnswer, GradingResult } from "@/lib/learning";
import { initialLessons } from "@/lib/mockData";
import { useApp } from '@/lib/store';
import { Button } from "@/components/ui/Button";
import { OptionCard } from "@/components/ui/OptionCard";
import { AudioPlayer } from "@/components/ui/AudioPlayer";
import { WritingEvaluation } from "@/components/ui/WritingEvaluation";
import { AITutorDrawer } from "@/components/ui/AITutorDrawer";
import { LessonAttempt, Question } from "@/types";
import {
  X,
  Sparkles,
  Check,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  AlertCircle,
  Volume2,
  Mic,
  MicOff,
  Image as ImageIcon,
  BookOpen,
  Layers,
  RotateCcw,
} from "lucide-react";

export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const { refreshProgress } = useApp();

  const lessonId = params.lessonId as string;
  const foundLesson = initialLessons.find((l) => l.id === lessonId && l.skill === params.skill);
  const currentLesson = foundLesson || initialLessons[0];

  // Block in_preparation lessons from entering official learning/grading loop
  const isInPreparation = currentLesson.status === "in_preparation" || !currentLesson.questions || currentLesson.questions.length === 0;

  const [questionIndex, setQuestionIndex] = useState(0);
  const currentQ: Question = currentLesson.questions?.[questionIndex] || currentLesson.questions?.[0] || {
    id: "empty",
    type: "single_choice",
    prompt: "Bài học đang trong quá trình biên soạn.",
    options: [],
    correctAnswer: "",
  };

  // Answer states for all 15 question types
  const [singleAnswer, setSingleAnswer] = useState<string>("");
  const [multiAnswer, setMultiAnswer] = useState<string[]>([]);
  const [textAnswer, setTextAnswer] = useState<string>("");
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});
  const [orderedTokens, setOrderedTokens] = useState<string[]>([]);
  const [categoryAllocations, setCategoryAllocations] = useState<Record<string, string>>({});
  const [selectedSpans, setSelectedSpans] = useState<string[]>([]);
  const [audioRecorded, setAudioRecorded] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  // Validation & Grading state
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [evalResult, setEvalResult] = useState<GradingResult | null>(null);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [isTutorOpen, setIsTutorOpen] = useState<boolean>(false);
  const [usedHint, setUsedHint] = useState<boolean>(false);

  // Attempt & Results tracking
  const [recordedAnswers, setRecordedAnswers] = useState<Record<string, any>>({});
  const [results, setResults] = useState<LessonAttempt["results"]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const draftKey = `adaptive_study_lesson_${lessonId}`;

  // Restore session draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.questionIndex !== undefined) setQuestionIndex(draft.questionIndex);
        if (draft.singleAnswer !== undefined) setSingleAnswer(draft.singleAnswer);
        if (draft.multiAnswer !== undefined) setMultiAnswer(draft.multiAnswer);
        if (draft.textAnswer !== undefined) setTextAnswer(draft.textAnswer);
        if (draft.matchedPairs !== undefined) setMatchedPairs(draft.matchedPairs);
        if (draft.orderedTokens !== undefined) setOrderedTokens(draft.orderedTokens);
        if (draft.categoryAllocations !== undefined) setCategoryAllocations(draft.categoryAllocations);
        if (draft.selectedSpans !== undefined) setSelectedSpans(draft.selectedSpans);
        if (draft.audioRecorded !== undefined) setAudioRecorded(draft.audioRecorded);
        if (draft.isSubmitted !== undefined) setIsSubmitted(draft.isSubmitted);
        if (draft.evalResult !== undefined) setEvalResult(draft.evalResult);
        if (draft.correctCount !== undefined) setCorrectCount(draft.correctCount);
        if (draft.usedHint !== undefined) setUsedHint(draft.usedHint);
        if (draft.recordedAnswers !== undefined) setRecordedAnswers(draft.recordedAnswers);
        if (draft.results !== undefined) setResults(draft.results);
      }
    } catch {
      setSaveError(true);
    }
    setLoaded(true);
  }, [draftKey]);

  // Save current progress to localStorage
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(
        draftKey,
        JSON.stringify({
          questionIndex,
          singleAnswer,
          multiAnswer,
          textAnswer,
          matchedPairs,
          orderedTokens,
          categoryAllocations,
          selectedSpans,
          audioRecorded,
          isSubmitted,
          evalResult,
          correctCount,
          usedHint,
          recordedAnswers,
          results,
        })
      );
      localStorage.setItem(
        "adaptive_study_resume",
        JSON.stringify({
          title: currentLesson.title,
          href: `/student/learn/${currentLesson.skill}/${lessonId}`,
        })
      );
    } catch {
      setSaveError(true);
    }
  }, [
    loaded,
    draftKey,
    questionIndex,
    singleAnswer,
    multiAnswer,
    textAnswer,
    matchedPairs,
    orderedTokens,
    categoryAllocations,
    selectedSpans,
    audioRecorded,
    isSubmitted,
    evalResult,
    correctCount,
    usedHint,
    recordedAnswers,
    results,
    currentLesson.title,
    currentLesson.skill,
    lessonId,
  ]);

  const openTutor = () => {
    if (!isSubmitted) setUsedHint(true);
    setIsTutorOpen(true);
  };

  // Check if current question has an answer supplied
  const hasProvidedAnswer = (): boolean => {
    switch (currentQ.type) {
      case "single_choice":
      case "multiple_choice":
      case "true_false":
      case "image_question":
        return singleAnswer !== "";
      case "multi_select":
        return multiAnswer.length > 0;
      case "short_answer":
      case "fill_in_the_blank":
      case "gap_fill":
      case "word_bank":
      case "word_form":
      case "sentence_rewriting":
        return textAnswer.trim() !== "";
      case "matching":
      case "match_pairs":
        return !!currentQ.pairs && currentQ.pairs.length > 0 && currentQ.pairs.every((p) => !!matchedPairs[p.left]);
      case "ordering":
      case "unscramble":
        return orderedTokens.length > 0;
      case "category_labeling":
        return (
          !!currentQ.categoryItems &&
          currentQ.categoryItems.length > 0 &&
          currentQ.categoryItems.every((item) => !!categoryAllocations[item.id])
        );
      case "token_selection":
        return selectedSpans.length > 0;
      case "writing":
        return textAnswer.trim().split(/\s+/).length >= 5;
      case "speaking":
        return audioRecorded;
      default:
        return singleAnswer !== "" || textAnswer.trim() !== "";
    }
  };

  // Get current raw answer for evaluation
  const getCurrentAnswerPayload = () => {
    switch (currentQ.type) {
      case "single_choice":
      case "multiple_choice":
      case "true_false":
      case "image_question":
        return singleAnswer;
      case "multi_select":
        return multiAnswer;
      case "short_answer":
      case "fill_in_the_blank":
      case "gap_fill":
      case "word_bank":
      case "word_form":
      case "sentence_rewriting":
      case "writing":
        return textAnswer;
      case "matching":
      case "match_pairs":
        return matchedPairs;
      case "ordering":
      case "unscramble":
        return orderedTokens;
      case "category_labeling":
        return categoryAllocations;
      case "token_selection":
        return selectedSpans;
      case "speaking":
        return audioRecorded ? "audio_submission_recorded.wav" : "";
      default:
        return singleAnswer || textAnswer;
    }
  };

  const handleCheckAnswer = () => {
    if (isSubmitted || !hasProvidedAnswer()) return;
    const answer = getCurrentAnswerPayload();
    const evaluation = evaluateAnswer(currentQ, answer);

    setEvalResult(evaluation);
    setIsSubmitted(true);

    if (evaluation.isCorrect) {
      setCorrectCount((prev) => prev + 1);
    }

    // Save answer and result item
    const newAnswers = { ...recordedAnswers, [currentQ.id]: answer };
    setRecordedAnswers(newAnswers);

    const resultItem: LessonAttempt["results"][number] = {
      questionId: currentQ.id,
      prompt: currentQ.prompt,
      type: currentQ.type,
      userAnswer: answer,
      correctAnswer: currentQ.correctAnswer,
      isCorrect: evaluation.isCorrect,
      isTypo: evaluation.isTypo,
      isPendingReview: evaluation.isPendingReview,
      isMeaningChanged: evaluation.isMeaningChanged,
      usedHint,
      feedback: evaluation.feedback,
      explanation: currentQ.explanation,
    };

    setResults((prev) => [...prev, resultItem]);
  };

  const handleNextQuestion = async () => {
    if (questionIndex < currentLesson.questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
      // Reset input fields
      setSingleAnswer("");
      setMultiAnswer([]);
      setTextAnswer("");
      setMatchedPairs({});
      setOrderedTokens([]);
      setCategoryAllocations({});
      setSelectedSpans([]);
      setAudioRecorded(false);
      setIsRecording(false);
      setIsSubmitted(false);
      setEvalResult(null);
      setUsedHint(false);
      setIsTutorOpen(false);
    } else {
      // Completed session: build and store authoritative attempt record
      const finalScore = evalResult?.isCorrect ? correctCount : correctCount;
      const attemptId = `att-${Date.now()}`;
      const attempt: LessonAttempt = {
        id: attemptId,
        lessonId: currentLesson.id,
        lessonTitle: currentLesson.title,
        skill: currentLesson.skill,
        timestamp: new Date().toISOString(),
        score: finalScore,
        total: currentLesson.questions.length,
        percentage:
          currentLesson.questions.length > 0
            ? Math.round((finalScore / currentLesson.questions.length) * 100)
            : 0,
        answers: recordedAnswers,
        results: results,
      };

      try {
        localStorage.setItem("adaptive_study_last_session", JSON.stringify(attempt));
      } catch {
        setSaveError(true);
      }

      try {
        const independentRate = attempt.results.length > 0
          ? Math.round(attempt.results.filter(result => !result.usedHint).length / attempt.results.length * 100)
          : 0;
        const response = await fetch('/api/student/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...attempt, independentRate }),
        });
        if (!response.ok) throw new Error('Không đồng bộ được phiên học');
        await refreshProgress();
        try { localStorage.removeItem(draftKey); localStorage.removeItem('adaptive_study_resume'); } catch {}
      } catch {
        setSaveError(true);
        return;
      }

      // Navigate to summary using attemptId as primary reference
      router.push(
        `/student/session-summary?attemptId=${attemptId}&lesson=${encodeURIComponent(
          currentLesson.title
        )}&source=lesson`
      );
    }
  };

  const handleExit = () => {
    router.push("/student/home");
  };

  if (!foundLesson || isInPreparation)
    return (
      <main className="p-8">
        <h1 className="text-xl font-bold">Không tìm thấy bài học</h1>
        <a href="/student/learn" className="text-primary underline mt-2 block">
          Quay lại kho bài học
        </a>
      </main>
    );

  const progressPercent = currentLesson.questions.length > 0 ? ((questionIndex + 1) / currentLesson.questions.length) * 100 : 0;

  // Passage/Media sharing: check if current question has passage or audio
  const sharedPassage = currentQ?.passage;
  const sharedAudio = currentQ?.audioUrl;
  const sharedImage = currentQ?.imageUrl;

  if (!loaded) return <p className="p-8" role="status">Đang khôi phục bài học…</p>;

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between">
      {/* Top Bar: Exit + Title + Progress + AI Tutor */}
      <header className="bg-white border-b border-line px-4 md:px-6 py-3.5 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleExit}
            className="p-2 rounded-full hover:bg-[#F6F9FF] text-ink-muted hover:text-ink transition-colors"
            title="Thoát và lưu dở"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex-1 max-w-md mx-auto space-y-1">
            <div className="flex justify-between text-xs font-bold text-ink-muted">
              <span className="truncate max-w-[200px]">{currentLesson.title}</span>
              <span>
                {questionIndex + 1} / {currentLesson.questions.length}
              </span>
            </div>
            <div className="h-2.5 w-full bg-line rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-fast rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={openTutor}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-[#EAF2FF] text-primary-dark border border-primary/20 text-xs font-bold hover:bg-[#DCE8FC] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">Hỏi AI Tutor</span>
          </button>
        </div>
      </header>

      {/* Main Study Workspace */}
      <main data-study-question-id={currentQ.id} className="max-w-3xl mx-auto w-full px-4 md:px-6 py-8 md:py-10 space-y-6 flex-1">
        <div className="flex items-center justify-between text-xs text-ink-muted">
          <span role={saveError ? 'alert' : undefined}>{saveError ? "Chưa lưu hoặc đồng bộ được kết quả. Giữ trang mở và bấm hoàn thành để thử lại." : "Đã lưu tiến trình tự động"}</span>
          <span className="font-mono font-bold">Độ khó: {currentQ.difficulty || "A2"}</span>
        </div>

        {/* 1. Shared Media / Passage Panel */}
        {sharedPassage && (
          <div className="p-5 bg-white border-2 border-line rounded-md text-sm md:text-base leading-relaxed text-ink shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-primary uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>Đoạn văn đọc hiểu / Ngữ cảnh:</span>
            </div>
            <p className="whitespace-pre-line">{sharedPassage}</p>
          </div>
        )}

        {sharedAudio && (
          <div className="mb-4">
            <AudioPlayer src={sharedAudio} title="Bài nghe audio tương ứng" />
          </div>
        )}

        {sharedImage && (
          <div className="p-4 bg-white border-2 border-line rounded-md flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-ink-muted self-start">
              <ImageIcon className="w-4 h-4 text-primary" />
              <span>Hình ảnh minh họa:</span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sharedImage}
              alt="Hình ảnh bài tập"
              className="max-h-64 object-contain rounded border border-line"
            />
          </div>
        )}

        {/* 2. Prompt Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-pill bg-[#EAF2FF] text-primary uppercase tracking-wider">
              {currentQ.type.replace(/_/g, " ")}
            </span>
            {currentQ.isSpellingTest && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-pill bg-warning-soft text-warning border border-warning/30">
                Kiểm tra chính tả (Spelling)
              </span>
            )}
            {currentQ.isUnapprovedAnswer && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-pill bg-[#F1F5F9] text-ink-muted">
                Chờ duyệt đáp án
              </span>
            )}
          </div>
          <h2 className="text-lg md:text-xl font-bold text-ink leading-snug">{currentQ.prompt}</h2>
        </div>

        {/* 3. Question Renderers for All 15 Types */}
        <div className="space-y-4">
          {/* A. Single Choice / Multiple Choice / True-False / Image Question */}
          {(currentQ.type === "multiple_choice" ||
            currentQ.type === "single_choice" ||
            currentQ.type === "true_false" ||
            currentQ.type === "image_question") &&
            currentQ.options && (
              <div className="space-y-2.5">
                {currentQ.options.map((opt) => {
                  const isSelected = singleAnswer === opt.id;
                  let status: "default" | "correct" | "wrong" = "default";
                  if (isSubmitted) {
                    if (opt.id === currentQ.correctAnswer) status = "correct";
                    else if (isSelected) status = "wrong";
                  }
                  return (
                    <OptionCard
                      key={opt.id}
                      id={opt.id}
                      label={opt.text}
                      selected={isSelected}
                      status={status}
                      disabled={isSubmitted}
                      onClick={() => setSingleAnswer(opt.id)}
                    />
                  );
                })}
              </div>
            )}

          {/* B. Multi Select */}
          {currentQ.type === "multi_select" && currentQ.options && (
            <div className="space-y-2.5">
              <p className="text-xs text-ink-muted">Chọn tất cả các đáp án phù hợp:</p>
              {currentQ.options.map((opt) => {
                const isSelected = multiAnswer.includes(opt.id);
                let status: "default" | "correct" | "wrong" = "default";
                if (isSubmitted) {
                  const correctArr = Array.isArray(currentQ.correctAnswer)
                    ? currentQ.correctAnswer
                    : [String(currentQ.correctAnswer)];
                  if (correctArr.includes(opt.id)) status = "correct";
                  else if (isSelected) status = "wrong";
                }
                return (
                  <OptionCard
                    key={opt.id}
                    id={opt.id}
                    label={opt.text}
                    selected={isSelected}
                    status={status}
                    disabled={isSubmitted}
                    onClick={() => {
                      if (isSelected) setMultiAnswer(multiAnswer.filter((x) => x !== opt.id));
                      else setMultiAnswer([...multiAnswer, opt.id]);
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* C. Short Answer / Fill in the blank / Gap Fill */}
          {(currentQ.type === "short_answer" ||
            currentQ.type === "fill_in_the_blank" ||
            currentQ.type === "gap_fill") && (
            <div className="space-y-3">
              {currentQ.sentenceContext && (
                <div className="p-4 bg-white border border-line rounded-md text-base font-medium">
                  {currentQ.sentenceContext}
                </div>
              )}
              <input
                type="text"
                disabled={isSubmitted}
                placeholder="Nhập câu trả lời của bạn vào đây..."
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                className="w-full p-4 rounded-md border-2 border-line text-base font-bold text-ink focus:border-primary focus:outline-none"
              />
            </div>
          )}

          {/* D. Word Form (e.g. given [SUCCESS], write successful) */}
          {currentQ.type === "word_form" && (
            <div className="space-y-3">
              {currentQ.baseWord && (
                <div className="flex items-center gap-2 p-3 bg-[#EAF2FF] border border-primary/20 rounded-md text-xs font-bold text-primary-dark">
                  <span>Từ gốc cho trước:</span>
                  <span className="font-mono uppercase text-sm font-black bg-white px-2 py-0.5 rounded border border-primary/30">
                    {currentQ.baseWord}
                  </span>
                </div>
              )}
              <input
                type="text"
                disabled={isSubmitted}
                placeholder="Điền dạng từ đúng (danh từ, tính từ, trạng từ...)"
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                className="w-full p-4 rounded-md border-2 border-line text-base font-bold text-ink focus:border-primary focus:outline-none"
              />
            </div>
          )}

          {/* E. Sentence Rewriting */}
          {currentQ.type === "sentence_rewriting" && (
            <div className="space-y-3">
              <input
                type="text"
                disabled={isSubmitted}
                placeholder="Viết lại câu hoàn chỉnh theo yêu cầu..."
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                className="w-full p-4 rounded-md border-2 border-line text-base font-bold text-ink focus:border-primary focus:outline-none"
              />
            </div>
          )}

          {/* F. Word Bank */}
          {currentQ.type === "word_bank" && (
            <div className="space-y-4">
              <div className="min-h-[50px] p-4 bg-white border-2 border-line rounded-md text-base font-bold text-ink flex items-center justify-between">
                <span>{textAnswer || <span className="text-xs text-ink-muted italic">Chọn từ bên dưới...</span>}</span>
                {textAnswer && !isSubmitted && (
                  <button
                    type="button"
                    onClick={() => setTextAnswer("")}
                    className="text-xs font-bold text-error hover:underline"
                  >
                    Xóa
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {(currentQ.wordBank || currentQ.tokens || []).map((word, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isSubmitted}
                    onClick={() => setTextAnswer(word)}
                    className={`px-3.5 py-2 rounded-pill font-bold text-sm border-2 transition-all ${
                      textAnswer === word
                        ? "bg-primary text-white border-primary"
                        : "bg-white border-line text-ink hover:border-primary"
                    }`}
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* G. Matching / Match Pairs */}
          {(currentQ.type === "match_pairs" || currentQ.type === "matching") && currentQ.pairs && (
            <div className="space-y-3">
              <p className="text-xs text-ink-muted">Ghép nối từng vế trái với vế phải phù hợp:</p>
              {currentQ.pairs.map((pair) => (
                <label
                  key={pair.left}
                  className="grid sm:grid-cols-2 gap-2 p-3 border border-line rounded-md bg-white items-center"
                >
                  <span className="font-bold text-sm text-ink">{pair.left}</span>
                  <select
                    aria-label={`Ghép vế cho ${pair.left}`}
                    disabled={isSubmitted}
                    value={matchedPairs[pair.left] || ""}
                    onChange={(e) =>
                      setMatchedPairs((prev) => ({ ...prev, [pair.left]: e.target.value }))
                    }
                    className="p-2 border border-line rounded-md text-sm font-medium focus:border-primary focus:outline-none"
                  >
                    <option value="">Chọn vế tương ứng…</option>
                    {[...currentQ.pairs!].map((choice) => (
                      <option key={choice.right} value={choice.right}>
                        {choice.right}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          )}

          {/* H. Ordering / Unscramble */}
          {(currentQ.type === "ordering" || currentQ.type === "unscramble") && currentQ.tokens && (
            <div className="space-y-4">
              <div className="min-h-[60px] p-4 bg-white border-2 border-line rounded-md flex flex-wrap gap-2 items-center">
                {orderedTokens.length === 0 ? (
                  <span className="text-xs text-ink-muted italic">Nhấn vào các từ bên dưới để ghép câu theo thứ tự...</span>
                ) : (
                  orderedTokens.map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => setOrderedTokens(orderedTokens.filter((_, i) => i !== idx))}
                      className="px-3 py-1.5 rounded-pill bg-primary text-white font-bold text-sm shadow-sm hover:bg-error transition-colors"
                      title="Nhấn để gỡ từ"
                    >
                      {t}
                    </button>
                  ))
                )}
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {currentQ.tokens.map((token, idx) => {
                  const usedCount = orderedTokens.filter((t) => t === token).length;
                  const totalCount = currentQ.tokens?.filter((t) => t === token).length || 1;
                  const isAvailable = usedCount < totalCount;
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={!isAvailable || isSubmitted}
                      onClick={() => setOrderedTokens([...orderedTokens, token])}
                      className={`px-3.5 py-2 rounded-pill font-bold text-sm border-2 transition-all ${
                        isAvailable
                          ? "bg-white border-line text-ink hover:border-primary"
                          : "opacity-30 border-line text-ink-muted cursor-not-allowed"
                      }`}
                    >
                      {token}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* I. Token / Span Selection */}
          {currentQ.type === "token_selection" && currentQ.spans && (
            <div className="space-y-3">
              <p className="text-xs text-ink-muted">Nhấn vào từ/cụm từ trong đoạn để chọn:</p>
              <div className="p-5 bg-white border-2 border-line rounded-md flex flex-wrap gap-2 items-center text-base leading-loose">
                {currentQ.spans.map((span) => {
                  const isSelected = selectedSpans.includes(span.id);
                  return (
                    <button
                      key={span.id}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => {
                        if (isSelected) setSelectedSpans(selectedSpans.filter((id) => id !== span.id));
                        else setSelectedSpans([...selectedSpans, span.id]);
                      }}
                      className={`px-2.5 py-1 rounded transition-all font-bold ${
                        isSelected
                          ? "bg-primary text-white shadow-sm"
                          : "bg-[#F1F5F9] text-ink hover:bg-primary/20"
                      }`}
                    >
                      {span.text}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* J. Category Labeling */}
          {currentQ.type === "category_labeling" && currentQ.categories && currentQ.categoryItems && (
            <div className="space-y-3">
              <p className="text-xs text-ink-muted">Phân loại từng mục vào nhóm thích hợp:</p>
              <div className="space-y-2">
                {currentQ.categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white border border-line rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <span className="font-bold text-sm text-ink">{item.text}</span>
                    <select
                      disabled={isSubmitted}
                      value={categoryAllocations[item.id] || ""}
                      onChange={(e) =>
                        setCategoryAllocations((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                      className="p-2 border border-line rounded-md text-sm font-medium focus:border-primary focus:outline-none"
                    >
                      <option value="">Chọn nhóm phân loại…</option>
                      {currentQ.categories!.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* K. Writing Task */}
          {currentQ.type === "writing" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-ink-muted">
                <span>Soạn thảo bài viết theo yêu cầu đề bài:</span>
                <span className="font-mono font-bold">
                  Số từ: {textAnswer.trim() ? textAnswer.trim().split(/\s+/).length : 0} từ (tối thiểu 5 từ)
                </span>
              </div>
              <textarea
                disabled={isSubmitted}
                rows={6}
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Gõ bài viết của bạn tại đây..."
                className="w-full p-4 rounded-md border-2 border-line text-sm leading-relaxed text-ink focus:border-primary focus:outline-none"
              />
            </div>
          )}

          {/* L. Speaking Task */}
          {currentQ.type === "speaking" && (
            <div className="p-6 bg-white border-2 border-line rounded-md text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={isSubmitted}
                  onClick={() => {
                    if (isRecording) {
                      setIsRecording(false);
                      setAudioRecorded(true);
                    } else {
                      setIsRecording(true);
                    }
                  }}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-tactile ${
                    isRecording
                      ? "bg-error text-white animate-pulse"
                      : audioRecorded
                      ? "bg-success text-white"
                      : "bg-primary text-white"
                  }`}
                >
                  {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-ink">
                  {isRecording
                    ? "Đang ghi âm giọng nói... Bấm lại nút Mic để kết thúc."
                    : audioRecorded
                    ? "Đã ghi âm xong (Bản thu âm sẵn sàng nộp)."
                    : "Bấm vào nút Mic để bắt đầu nói tiếng Anh."}
                </div>
                {audioRecorded && !isSubmitted && (
                  <button
                    type="button"
                    onClick={() => {
                      setAudioRecorded(false);
                      setIsRecording(false);
                    }}
                    className="text-xs text-ink-muted hover:text-ink underline"
                  >
                    Ghi âm lại từ đầu
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {isSubmitted && currentQ.type === "writing" && !currentQ.isUnapprovedAnswer && (
          <WritingEvaluation key={currentQ.id} content={textAnswer} lessonId={lessonId} questionId={currentQ.id}
            result={results.find(item => item.questionId === currentQ.id)?.aiEvaluation}
            onResult={evaluation => setResults(previous => previous.map(item => item.questionId === currentQ.id ? { ...item, aiEvaluation: evaluation } : item))} />
        )}

        {/* 4. Immediate Pedagogical Feedback Card */}
        {isSubmitted && evalResult && (
          <div
            className={`p-5 rounded-md border-2 animate-in fade-in slide-in-from-bottom-2 ${
              evalResult.isPendingReview
                ? "bg-[#F0F4FF] border-primary/30 text-primary-dark"
                : evalResult.isMeaningChanged
                ? "bg-error-soft border-error text-[#8B2535]"
                : evalResult.isTypo
                ? "bg-[#FFF9E6] border-warning text-[#7A5B00]"
                : evalResult.isCorrect
                ? "bg-success-soft border-success text-[#185932]"
                : "bg-error-soft border-error text-[#8B2535]"
            }`}
          >
            <div className="flex items-center gap-2 font-black text-base mb-1">
              {evalResult.isPendingReview ? (
                <>
                  <Layers className="w-5 h-5 text-primary" /> Đã ghi nhận bài nộp!
                </>
              ) : evalResult.isMeaningChanged ? (
                <>
                  <AlertCircle className="w-5 h-5 text-error" /> Lỗi biến đổi ngữ nghĩa
                </>
              ) : evalResult.isTypo ? (
                <>
                  <AlertTriangle className="w-5 h-5 text-warning" /> Đúng ngữ nghĩa (Có lỗi chính tả nhỏ)
                </>
              ) : evalResult.isCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-success" /> Chính xác tuyệt đối!
                </>
              ) : (
                <>
                  <X className="w-5 h-5 text-error" /> Chưa chính xác
                </>
              )}
            </div>
            <p className="text-xs md:text-sm font-medium leading-relaxed mb-2">
              {evalResult.feedback}
            </p>
            {currentQ.explanation && (
              <div className="pt-2 border-t border-line/50 text-xs text-ink-muted">
                <strong>Giải thích chi tiết: </strong> {currentQ.explanation}
              </div>
            )}
          </div>
        )}
      </main>

      {/* 5. Sticky Bottom Action Bar */}
      <footer className="bg-white border-t border-line py-4 px-4 md:px-6 sticky bottom-0 z-30">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={openTutor}
            className="flex items-center gap-1.5 text-xs md:text-sm font-bold text-primary hover:text-primary-dark"
          >
            <Sparkles className="w-4 h-4" /> Gợi ý từ AI
          </button>

          {!isSubmitted ? (
            <Button
              size="lg"
              disabled={!hasProvidedAnswer()}
              onClick={handleCheckAnswer}
              className="shadow-tactile min-w-[160px]"
            >
              {currentQ.type === "writing" ? "Hoàn tất bài viết" : "Kiểm tra đáp án"}
            </Button>
          ) : (
            <Button size="lg" onClick={handleNextQuestion} className="shadow-tactile min-w-[160px]">
              {questionIndex === currentLesson.questions.length - 1 ? "Xem kết quả phiên học" : "Tiếp tục"}{" "}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          )}
        </div>
      </footer>

      {/* AI Tutor Drawer Component */}
      <AITutorDrawer
        isOpen={isTutorOpen}
        onClose={() => setIsTutorOpen(false)}
        promptText={JSON.stringify({ question: currentQ.prompt, passage: currentQ.passage, options: currentQ.options })}
        skill={currentLesson.skill}
        userCurrentText={textAnswer || singleAnswer || multiAnswer.join(", ")}
        hintText={currentQ.hint}
        explanationText={currentQ.explanation}
        hasAnswered={isSubmitted}
        isCorrect={evalResult?.isCorrect || false}
      />
    </div>
  );
}

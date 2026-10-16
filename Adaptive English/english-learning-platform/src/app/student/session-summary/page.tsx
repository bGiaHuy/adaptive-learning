"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocalDraft } from "@/lib/useLocalDraft";
import { Mascot, MascotMood } from "@/components/ui/Mascot";
import { WritingEvaluation } from "@/components/ui/WritingEvaluation";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, ArrowRight, Eye, AlertCircle, FileQuestion, PenLine, Lightbulb } from "lucide-react";

function SessionSummaryContent() {
  const searchParams = useSearchParams();
  const attemptIdParam = searchParams.get("attemptId");

  const { value: storedAttempt, setValue: setStoredAttempt } = useLocalDraft<any>("adaptive_study_last_session", null);

  // Authoritative data resolution: Prioritize stored attempt record when attemptId matches, or fallback to query params
  const hasAuthoritativeAttempt =
    storedAttempt && (attemptIdParam ? storedAttempt.id === attemptIdParam : !searchParams.get("score"));

  const rawTotal = hasAuthoritativeAttempt && typeof storedAttempt?.total === "number"
    ? storedAttempt.total
    : Number(searchParams.get("total") || 0);

  const rawScore = hasAuthoritativeAttempt && typeof storedAttempt?.score === "number"
    ? storedAttempt.score
    : Number(searchParams.get("score") || 0);

  const total = Number.isFinite(rawTotal) ? Math.max(0, rawTotal) : 0;
  const score = Number.isFinite(rawScore) ? Math.min(total, Math.max(0, rawScore)) : 0;

  const lessonTitle = hasAuthoritativeAttempt && storedAttempt?.lessonTitle
    ? storedAttempt.lessonTitle
    : searchParams.get("lesson") || "Bài học hoàn tất";

  const results: any[] = hasAuthoritativeAttempt && Array.isArray(storedAttempt?.results)
    ? storedAttempt.results
    : searchParams.get("source") === "lesson" && Array.isArray(storedAttempt?.results)
    ? storedAttempt.results
    : [];

  const [reviewMistakesOpen, setReviewMistakesOpen] = useState(false);

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  // Determine feedback, mood, and badge according to ACTUAL result
  let mood: MascotMood = "celebrate";
  let badgeTitle = "Hoàn thành xuất sắc";
  let badgeClass = "bg-success-soft text-success border-success/20";
  let speechText = "Tuyệt vời! Cậu nắm bài rất chắc chắn!";
  let feedbackText = "Cậu đã nắm rất vững kiến thức trọng tâm của bài này. Hãy duy trì phong độ nhé!";

  if (percentage < 50) {
    mood = "thinking";
    badgeTitle = "Cần ôn tập thêm";
    badgeClass = "bg-error-soft text-error border-error/20";
    speechText = "Đừng nản lòng nhé! Xem lại lời giải để hiểu rõ hơn nào.";
    feedbackText = "Phiên học này có một số câu còn bỡ ngỡ. Hãy xem lại phần giải thích chi tiết bên dưới để nắm chắc kiến thức nhé!";
  } else if (percentage < 80) {
    mood = "encouraging";
    badgeTitle = "Hoàn thành bài học";
    badgeClass = "bg-primary-light text-primary-dark border-primary/20";
    speechText = "Khá lắm! Cố gắng thêm một chút là đạt điểm tối đa!";
    feedbackText = "Kết quả khá tốt! Cậu chỉ cần chú ý một vài lỗi nhỏ là sẽ đạt kết quả hoàn hảo.";
  }

  const hasWriting = results.some(item => item.type === "writing");
  const allWritingEvaluated = hasWriting && results
    .filter(item => item.type === "writing")
    .every(item => item.aiEvaluation);
  if (hasWriting) {
    mood = "encouraging";
    badgeTitle = "Đã hoàn thành bài viết";
    badgeClass = "bg-primary-light text-primary-dark border-primary/20";
    speechText = "Xem nhận xét AI để cải thiện bài viết nhé!";
    feedbackText = allWritingEvaluated
      ? "Điểm và góp ý AI cho từng câu được trình bày bên dưới."
      : "Chọn chấm AI bên dưới để nhận điểm và góp ý cho từng bài viết.";
  }

  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-4 md:px-6 py-6 md:py-10 space-y-6 text-center animate-in fade-in">
      {/* 1. Header & Title (Above the fold) */}
      <div className="space-y-2">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-pill font-extrabold text-xs border ${badgeClass}`}>
          {percentage >= 50 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
          {badgeTitle}
        </span>
        <h1 className="text-2xl md:text-3xl font-black text-ink tracking-tight">
          {lessonTitle}
        </h1>
      </div>

      {/* 2. Integrated Result Card + Mascot (Side-by-side or compact stack) */}
      <div className="bg-white border-2 border-line rounded-lg p-5 md:p-6 shadow-soft max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Left: Mascot (guaranteed size 160-190px, won't blow up) */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <Mascot
            mood={mood}
            size="summary"
            speechText={speechText}
          />
        </div>

        {/* Right: Metrics & Feedback */}
        <div className="flex-1 w-full space-y-4 text-left sm:border-l sm:border-line sm:pl-6">
          <div className="grid grid-cols-2 gap-3 divide-x divide-line bg-canvas p-3 rounded-md border border-line">
            <div className="space-y-0.5">
              <span className="text-[11px] text-ink-muted font-bold block uppercase tracking-wider">{hasWriting ? "Đã hoàn thành" : "Tỷ lệ chính xác"}</span>
              <span className={`text-2xl md:text-3xl font-black font-mono ${percentage >= 50 ? "text-primary" : "text-error"}`}>
                {hasWriting ? Math.round(results.length / Math.max(total, 1) * 100) : percentage}%
              </span>
            </div>
            <div className="space-y-0.5 pl-3">
              <span className="text-[11px] text-ink-muted font-bold block uppercase tracking-wider">{hasWriting ? "Bài đã làm" : "Số câu đúng"}</span>
              <span className="text-2xl md:text-3xl font-black text-ink font-mono">
                {hasWriting ? results.length : score} <span className="text-base text-ink-muted font-normal">/ {total}</span>
              </span>
            </div>
          </div>

          <div className="text-xs text-ink-muted leading-relaxed">
            <p className="font-medium text-ink">{feedbackText}</p>
          </div>
        </div>
      </div>

      {hasAuthoritativeAttempt && results.filter(item => item.type === "writing").map((item, index, writingItems) => (
        <article key={item.questionId} className="overflow-hidden rounded-[28px] bg-white shadow-[0_14px_40px_rgba(36,86,174,0.08)] text-left">
          <header className="border-b border-line-subtle bg-[#F8FAFF] px-5 py-5 md:px-6">
            <div className="mb-3 flex items-center justify-between gap-4">
              <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">
                Câu {index + 1}
              </span>
              <span className="text-xs font-semibold tabular-nums text-ink-muted">
                {index + 1} / {writingItems.length}
              </span>
            </div>
            <h2 className="max-w-[66ch] text-base font-extrabold leading-relaxed text-ink md:text-lg">
              {item.prompt}
            </h2>
          </header>
          <WritingEvaluation content={String(item.userAnswer || "")} lessonId={storedAttempt.lessonId} questionId={item.questionId}
            embedded
            result={item.aiEvaluation}
            onResult={evaluation => setStoredAttempt((previous: any) => ({ ...previous, results: previous.results.map((row: any) => row.questionId === item.questionId ? { ...row, aiEvaluation: evaluation } : row) }))} />
        </article>
      ))}

      {/* 3. Action Buttons (Directly visible in first view) */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto w-full">
        <Link href="/student/learn" className="w-full sm:flex-1">
          <Button size="lg" className="w-full shadow-tactile">
            Bài Học Tiếp Theo <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </Link>
        <Link href="/student/home" className="w-full sm:w-auto">
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            Về Trang Chủ
          </Button>
        </Link>
      </div>

      {/* 4. Review Mistakes Collapsible */}
      <div className="max-w-3xl mx-auto text-left pt-2">
        <button
          type="button"
          onClick={() => setReviewMistakesOpen(!reviewMistakesOpen)}
          className={`w-full flex items-center justify-between px-5 py-4 bg-white border text-sm font-bold text-ink hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 transition-colors ${reviewMistakesOpen ? "rounded-t-[20px] border-primary/30" : "rounded-[20px] border-line"}`}
        >
          <span className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" /> Xem lại chi tiết từng câu hỏi ({results.length || total} câu)
          </span>
          <span className="text-xs text-ink-muted">{reviewMistakesOpen ? "Thu gọn ▲" : "Mở xem ▼"}</span>
        </button>

        {reviewMistakesOpen && (
          <div className="space-y-4 rounded-b-[20px] border-x border-b border-primary/30 bg-[#F8FAFF] p-4 md:p-5 animate-in fade-in">
            {results.length > 0 ? (
              <div className="space-y-4">
                <p className="inline-flex items-center gap-2 rounded-sm bg-white px-3 py-2 text-xs font-semibold text-ink-muted shadow-sm">
                  <Lightbulb aria-hidden="true" className="h-3.5 w-3.5 text-primary" />
                  {results.filter((r: any) => r.usedHint).length > 0
                    ? `${results.filter((r: any) => r.usedHint).length} câu đã sử dụng gợi ý.`
                    : "Học sinh hoàn thành độc lập không dùng gợi ý."}
                </p>
                {results.map((r: any, i: number) => {
                  const isOk = r.isCorrect ?? r.correct;
                  return (
                    <article key={r.questionId || r.id || i} className="overflow-hidden rounded-[22px] border border-line bg-white shadow-[0_10px_28px_rgba(36,86,174,0.07)]">
                      <header className="border-b border-line-subtle bg-[#EDF4FF] px-4 py-4 md:px-5">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-primary">Câu {i + 1}</span>
                        <span
                          className={`shrink-0 rounded-sm px-2.5 py-1 text-[10px] font-extrabold ${
                            r.isPendingReview
                              ? "bg-white text-primary"
                              : r.isMeaningChanged
                              ? "bg-error-soft text-error"
                              : r.isTypo
                              ? "bg-[#FFF9E6] text-[#7A5B00]"
                              : isOk
                              ? "bg-success-soft text-success"
                              : "bg-error-soft text-error"
                          }`}
                        >
                          {r.isPendingReview
                            ? r.aiEvaluation ? "Đã có nhận xét AI" : r.type === "writing" ? "Có thể chấm AI" : "Chờ duyệt"
                            : r.isMeaningChanged
                            ? "Sai nghĩa"
                            : r.isTypo
                            ? "Lỗi chính tả nhẹ"
                            : isOk
                            ? "Đúng"
                            : "Sai"}
                        </span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <FileQuestion aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <div>
                            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-primary-dark/70">Đề bài</p>
                            <h3 className="text-sm font-extrabold leading-relaxed text-ink md:text-base">{r.prompt}</h3>
                          </div>
                        </div>
                      </header>

                      <div className="space-y-3 p-4 md:p-5">
                        {r.userAnswer !== undefined && (
                          <section aria-label={`Câu trả lời câu ${i + 1}`} className="rounded-[16px] border border-[#F1D487] bg-[#FFF9E6] p-4">
                            <div className="mb-2 flex items-center gap-2 text-[#7A5B00]">
                              <PenLine aria-hidden="true" className="h-4 w-4 shrink-0" />
                              <h4 className="text-xs font-extrabold uppercase tracking-[0.08em]">Bạn đã trả lời</h4>
                            </div>
                            <p className="whitespace-pre-wrap break-words text-sm font-semibold leading-relaxed text-ink">
                              {typeof r.userAnswer === "object" ? JSON.stringify(r.userAnswer) : String(r.userAnswer)}
                            </p>
                          </section>
                        )}

                        {r.feedback && r.type !== "writing" && (
                          <div className="rounded-sm bg-canvas p-3 text-xs font-medium text-ink">
                            {r.feedback}
                          </div>
                        )}

                        {!isOk && r.correctAnswer && (
                          <section className="rounded-[16px] border border-success/20 bg-success-soft p-4">
                            <h4 className="mb-2 text-xs font-extrabold uppercase tracking-[0.08em] text-success">Đáp án tham khảo</h4>
                            <p className="whitespace-pre-wrap break-words text-sm font-semibold leading-relaxed text-ink">
                              {typeof r.correctAnswer === "object" ? JSON.stringify(r.correctAnswer) : String(r.correctAnswer)}
                            </p>
                          </section>
                        )}

                        {r.explanation && (
                          <section aria-label={`Giải thích câu ${i + 1}`} className="rounded-[16px] bg-[#F1F0FF] p-4 text-[#4C3F91]">
                            <div className="mb-2 flex items-center gap-2">
                              <Lightbulb aria-hidden="true" className="h-4 w-4 shrink-0" />
                              <h4 className="text-xs font-extrabold uppercase tracking-[0.08em]">Giải thích</h4>
                            </div>
                            <p className="text-sm leading-relaxed">{r.explanation}</p>
                          </section>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="text-ink-muted text-center py-2">
                {score === 0 && total === 1
                  ? "Bạn chưa trả lời đúng câu hỏi này. Hãy thử lại để đạt kết quả tốt hơn nhé!"
                  : "Chưa có dữ liệu chi tiết cho bài làm này."}
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default function SessionSummaryPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm font-bold text-ink-muted">Đang tải kết quả...</div>}>
      <SessionSummaryContent />
    </Suspense>
  );
}

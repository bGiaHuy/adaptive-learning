"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { CheckCircle2, MessageSquareText, TrendingUp, Sparkles } from "lucide-react";
import styles from "./WritingEvaluation.module.css";

function ScoreBar({ label, score, delay = 0 }: { label: string; score: number; delay?: number }) {
  const value = Math.min(9, Math.max(0, Number.isFinite(score) ? score : 0));
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-ink-muted">{label}</span>
        <span className="font-bold tabular-nums text-ink">{value}<span className="font-normal text-ink-muted"> / 9</span></span>
      </div>
      <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={9} aria-valuenow={value}
        className="h-2 overflow-hidden rounded-full bg-[#E4ECF8]">
        <div className={`${styles.fill} h-full w-full rounded-full bg-primary`}
          style={{ "--score-ratio": value / 9, "--score-delay": `${delay}ms` } as CSSProperties} />
      </div>
    </div>
  );
}
import type { FormativePreGradeResult } from "@/lib/aiEngine";
import { Button } from "./Button";

function WritingEvaluationSkeleton() {
  const line = (width: string) => <span className={`${styles.skeleton} block h-3 rounded-full`} style={{ width }} />;
  return (
    <div role="status" aria-live="polite" aria-label="AI đang chấm bài" className="space-y-4 p-4 md:p-6">
      <span className="sr-only">AI đang đọc bài viết, đối chiếu yêu cầu và chuẩn bị nhận xét.</span>
      <div aria-hidden="true" className="grid min-h-[172px] gap-5 rounded-[20px] bg-[#F6F9FF] p-5 sm:grid-cols-[150px_1fr] sm:gap-7">
        <div className="space-y-3">
          {line("72%")}
          <span className={`${styles.skeleton} block h-10 w-24 rounded-xl`} />
          <div className="hidden space-y-2 pt-3 sm:block">{line("48%")}<span className={`${styles.skeleton} block h-2 w-full rounded-full`} /></div>
        </div>
        <div className="space-y-5">
          {["86%", "72%", "79%"].map((width, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between gap-4">{line("36%")} {line("12%")}</div>
              <span className={`${styles.skeleton} block h-2 rounded-full`} style={{ width }} />
            </div>
          ))}
        </div>
      </div>
      <div aria-hidden="true" className="min-h-[112px] space-y-3 rounded-[20px] bg-[#EDF4FF] p-5">
        {line("30%")} {line("100%")} {line("92%")} {line("68%")}
      </div>
      <div aria-hidden="true" className="grid gap-4 sm:grid-cols-2">
        <div className="min-h-[152px] space-y-3 rounded-[20px] bg-success-soft p-5">{line("34%")} {line("94%")} {line("80%")} {line("88%")}</div>
        <div className="min-h-[152px] space-y-3 rounded-[20px] bg-error-soft p-5">{line("42%")} {line("90%")} {line("76%")} {line("84%")}</div>
      </div>
    </div>
  );
}

export function WritingEvaluation({ content, lessonId, questionId, result, onResult, embedded = false }: {
  content: string;
  lessonId: string;
  questionId: string;
  result?: FormativePreGradeResult;
  onResult: (result: FormativePreGradeResult) => void;
  embedded?: boolean;
}) {
  const scoreRef = useRef<HTMLDivElement>(null);
  const [scoresVisible, setScoresVisible] = useState(false);
  useEffect(() => {
    setScoresVisible(false);
    if (!result || !scoreRef.current) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setScoresVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.25 });
    observer.observe(scoreRef.current);
    return () => observer.disconnect();
  }, [result]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const evaluate = async () => {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/ai/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill: "writing", content, lessonId, questionId, mode: "real" }),
      });
      const data = await response.json();
      if (!response.ok || !data.success || data.result?.source !== "real" || data.result?.status !== "success") {
        throw new Error(data.reason || data.error || data.result?.reason || "Chưa nhận được kết quả chấm AI. Hãy thử lại.");
      }
      onResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không kết nối được AI. Hãy thử lại.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <section aria-label="Chấm bài bằng AI" aria-busy={loading} className={`overflow-hidden bg-white text-left text-ink ${embedded ? "" : "rounded-[24px] border border-line"}`}>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-subtle p-5 md:px-6">
        <div className="space-y-1">
          <h3 className="flex items-center gap-2 text-base font-extrabold"><Sparkles aria-hidden="true" className="h-4 w-4 text-primary" />Chấm bài bằng AI</h3>
          <p className="text-xs text-ink-muted">Nhận điểm và góp ý ngay cho bài viết của bạn.</p>
        </div>
        {!result && (
          <Button onClick={evaluate} disabled={loading || content.trim().split(/\s+/).length < 5}>
            {loading ? "AI đang chấm bài…" : "Chấm ngay bằng AI"}
          </Button>
        )}
      </div>
      {loading && <WritingEvaluationSkeleton />}
      {error && <p role="alert" className="mx-5 my-4 rounded-sm bg-error-soft p-4 text-sm text-error">{error}</p>}
      {result && <div className="space-y-4 p-4 md:p-6">
        <div ref={scoreRef} key={result.evaluatedAt} className={`${scoresVisible ? styles.visible : ""} grid gap-5 rounded-[20px] bg-[#F6F9FF] p-5 sm:grid-cols-[150px_1fr] sm:gap-7`}>
          <div className="flex items-center gap-4 sm:block sm:space-y-2">
            <div>
              <p className="text-xs font-bold text-ink-muted">Điểm AI tham khảo</p>
              <p className="mt-1 font-extrabold tabular-nums tracking-tight text-primary"><span className="text-4xl">{result.estimatedBand}</span><span className="ml-1 text-lg font-medium text-ink-muted">/9</span></p>
            </div>
            <div className="hidden sm:block pt-2"><ScoreBar label="Tổng điểm" score={Number(result.estimatedBand)} /></div>
          </div>
          <div className="space-y-4">
            <ScoreBar label="Nội dung & mạch lạc" score={result.rubric.taskAchievementOrCoherence} delay={100} />
            <ScoreBar label="Từ vựng" score={result.rubric.lexicalResource} delay={220} />
            <ScoreBar label="Ngữ pháp" score={result.rubric.grammarAccuracy} delay={340} />
          </div>
        </div>
        <div className="rounded-[20px] bg-[#EDF4FF] p-5 text-[#234A83]">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-extrabold"><MessageSquareText aria-hidden="true" className="h-4 w-4 shrink-0" />Nhận xét chung</h4>
          <p className="whitespace-pre-line text-sm leading-relaxed">{result.summary}</p>
        </div>
        <div className="grid items-start gap-4 sm:grid-cols-2">
          <div className="rounded-[20px] bg-success-soft p-5 text-[#185932]">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-extrabold"><CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0" />Điểm tốt</h4>
            {result.strengthPoints.length ? <ul className="space-y-3 text-sm leading-relaxed">{result.strengthPoints.map((point, i) => <li key={i} className="flex items-start gap-2"><span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-success" /><span>{point}</span></li>)}</ul> : <p className="text-sm">AI chưa nêu điểm tốt cụ thể.</p>}
          </div>
          <div className="rounded-[20px] bg-error-soft p-5 text-[#8B2535]">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-extrabold"><TrendingUp aria-hidden="true" className="h-4 w-4 shrink-0" />Cần cải thiện</h4>
            {result.weaknessPoints.length ? <ul className="space-y-3 text-sm leading-relaxed">{result.weaknessPoints.map((point, i) => <li key={i} className="flex items-start gap-2"><span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-error" /><span>{point}</span></li>)}</ul> : <p className="text-sm">AI chưa đề xuất phần cần cải thiện.</p>}
          </div>
        </div>
      </div>}
    </section>
  );
}

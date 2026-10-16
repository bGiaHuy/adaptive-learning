"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { placementQuestions } from "@/lib/placementQuestions";
import { Mascot } from "@/components/ui/Mascot";
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Home,
  Award,
  Headphones,
  BookOpen,
  Layers,
  BookMarked,
  PenLine,
  Mic,
} from "lucide-react";

export default function PlacementResultPage() {
  const { placementTest, hydrated } = useApp();

  // Sections that are MCQ-scored
  const mcqSections = [
    { key: "reading" as const, title: "Đọc hiểu (Reading)", icon: BookOpen },
    { key: "listening" as const, title: "Nghe hiểu (Listening)", icon: Headphones },
    { key: "grammar" as const, title: "Ngữ pháp (Grammar)", icon: Layers },
    { key: "vocabulary" as const, title: "Từ vựng (Vocabulary)", icon: BookMarked },
  ];

  // Calculate MCQ section scores
  const sectionStats = mcqSections.map(({ key, title, icon }) => {
    const questions = placementQuestions.filter((q) => q.section === key);
    const answers =
      key === "vocabulary"
        ? placementTest.vocabAnswers || {}
        : (placementTest[`${key}Answers`] as Record<string, string>) || {};
    const correct = questions.filter((q) => answers[q.id] === q.correct).length;
    const percentage = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    return { key, title, icon, total: questions.length, correct, percentage };
  });

  const totalMcq = sectionStats.reduce((s, x) => s + x.total, 0);
  const totalCorrect = sectionStats.reduce((s, x) => s + x.correct, 0);
  const overallPct = totalMcq > 0 ? Math.round((totalCorrect / totalMcq) * 100) : 0;

  // Provisional CEFR from MCQ sections
  const provisionalCefr = overallPct >= 80 ? "B1" : overallPct >= 50 ? "A2" : "A1";

  // Writing evidence
  const writingWordCount = placementTest.writingAnswer
    ? placementTest.writingAnswer.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const hasWriting = writingWordCount >= 10;
  const writingEvaluation = placementTest.writingEvaluation;

  // Speaking evidence
  const hasSpeaking = !!placementTest.speakingBlobUrl;

  // Guard: no data yet
  if (hydrated && !placementTest.completed && totalCorrect === 0) {
    return (
      <main className="max-w-xl mx-auto w-full p-6 md:p-12 text-center space-y-6 animate-in fade-in">
        <Mascot mood="thinking" size="summary" speechText="Cậu chưa hoàn thành bài test đầu vào nè!" />
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-ink">Chưa có kết quả bài kiểm tra</h1>
          <p className="text-xs md:text-sm text-ink-muted">
            Bài kiểm tra định vị đầu vào giúp hệ thống thiết lập thang năng lực ban đầu cho bạn.
            Bạn chỉ cần thực hiện duy nhất 1 lần.
          </p>
        </div>
        <Link href="/student/placement-test">
          <button className="px-6 py-3 rounded-lg font-bold bg-primary text-white hover:bg-primary-dark transition-colors inline-flex items-center gap-2 shadow-tactile text-sm">
            Làm bài kiểm tra ngay <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto w-full p-6 md:p-10 space-y-8 animate-in fade-in">
      {/* Mascot */}
      <div className="flex justify-center">
        <Mascot
          mood="encouraging"
          size="inline"
          speechText="Chúc mừng cậu đã hoàn thành bài Test đầu vào!"
        />
      </div>

      <header className="space-y-3 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-success-soft text-success text-xs font-extrabold border border-success/20">
          <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn thành bài kiểm tra định vị ban đầu (1 lần
          duy nhất)
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-ink">Bằng chứng năng lực ban đầu</h1>
        <p className="text-xs md:text-sm text-ink-muted max-w-xl mx-auto">
          Kết quả dưới đây được tính từ câu trả lời của bạn qua 6 phần: Đọc, Nghe, Ngữ pháp, Từ
          vựng, Viết và Nói.
        </p>
      </header>

      {/* Provisional CEFR Summary */}
      <section className="p-5 md:p-6 bg-white border-2 border-primary/30 rounded-xl shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-full bg-primary-light text-primary">
                <Award className="w-4 h-4" />
              </span>
              <h2 className="text-base font-extrabold text-ink">Ước lượng CEFR ban đầu</h2>
            </div>
            <p className="text-xs text-ink-muted mt-1">
              Dựa trên {totalCorrect}/{totalMcq} câu đúng từ phần Đọc, Nghe, Ngữ pháp và Từ vựng
            </p>
          </div>
          <div className="flex items-baseline gap-2 self-start sm:self-auto">
            <span className="text-3xl md:text-4xl font-black text-primary font-mono">
              {provisionalCefr}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-pill bg-warning-soft text-warning border border-warning/30">
              Mức tạm tính (Provisional)
            </span>
          </div>
        </div>
      </section>

      {/* MCQ Sections Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold text-ink-muted uppercase tracking-wider">
          Phần trắc nghiệm (có điểm):
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sectionStats.map(({ key, title, icon: Icon, correct, total, percentage }) => (
            <section
              key={key}
              className="p-5 bg-white border-2 border-line rounded-lg space-y-2 shadow-soft"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-xs text-ink-muted uppercase tracking-wider leading-tight">
                  {title}
                </h2>
                <Icon className="w-4 h-4 text-primary shrink-0" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-primary font-mono">
                  {correct}/{total}
                </span>
                <span className="text-xs font-bold text-ink-muted font-mono">({percentage}%)</span>
              </div>
              <div className="h-1.5 w-full bg-line rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-[11px] text-ink-muted leading-tight">
                {correct === total
                  ? "Nắm chắc kiến thức nền tảng."
                  : correct > 0
                  ? "Đáp ứng mức cơ bản, cần rèn luyện thêm."
                  : "Cần củng cố kiến thức từ đầu."}
              </p>
            </section>
          ))}
        </div>
      </div>

      {/* Writing & Speaking Evidence */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold text-ink-muted uppercase tracking-wider">
          Phần tự luận & ghi âm (bằng chứng ban đầu):
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Writing */}
          <section className="p-5 bg-white border-2 border-line rounded-xl shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PenLine className="w-4 h-4 text-primary" />
                <h2 className="font-bold text-sm text-ink">Viết (Writing)</h2>
              </div>
              {hasWriting ? (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-pill bg-success-soft text-success border border-success/20">
                  Đã nộp
                </span>
              ) : (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-pill bg-[#F1F5F9] text-ink-muted">
                  Chưa nộp
                </span>
              )}
            </div>

            {hasWriting ? (
              <div className="space-y-2">
                <p className="text-[11px] text-ink-muted font-medium">
                  {writingWordCount} từ · Bằng chứng viết ban đầu
                </p>
                <blockquote className="text-xs text-ink leading-relaxed border-l-2 border-primary pl-3 line-clamp-4 italic">
                  {placementTest.writingAnswer}
                </blockquote>
                {writingEvaluation?.status === "success" ? (
                  <div className="rounded-lg bg-[#EAF2FF] border border-primary/20 p-3 space-y-1.5">
                    <p className="text-xs font-extrabold text-primary-dark">AI ước lượng sơ bộ: Band {writingEvaluation.estimatedBand}/9</p>
                    <p className="text-[11px] text-ink-muted leading-relaxed">{writingEvaluation.summary}</p>
                    <p className="text-[10px] text-ink-muted">Đây là nhận xét AI ban đầu, không phải điểm chính thức.</p>
                  </div>
                ) : writingEvaluation?.status === "blocked" || writingEvaluation?.status === "error" ? (
                  <p className="text-[11px] text-warning">Chưa có điểm AI: {writingEvaluation.reason || writingEvaluation.summary}</p>
                ) : (
                  <p className="text-[11px] text-ink-muted">Năng lực Writing sẽ được đánh giá chi tiết hơn qua các bài viết trong lớp.</p>
                )}
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-warning" />
                  <span className="text-xs font-bold text-warning">A1 (Mức khởi đầu tạm)</span>
                </div>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Chưa nộp bài viết. Hệ thống áp dụng mức khởi đầu tạm A1. Sẽ cập nhật khi bạn
                  nộp bài viết đầu tiên.
                </p>
              </div>
            )}
          </section>

          {/* Speaking */}
          <section className="p-5 bg-white border-2 border-line rounded-xl shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-primary" />
                <h2 className="font-bold text-sm text-ink">Nói (Speaking)</h2>
              </div>
              {hasSpeaking ? (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-pill bg-success-soft text-success border border-success/20">
                  Đã ghi âm
                </span>
              ) : (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-pill bg-[#F1F5F9] text-ink-muted">
                  Chưa ghi âm
                </span>
              )}
            </div>

            {hasSpeaking ? (
              <div className="space-y-2">
                <p className="text-[11px] text-success font-bold">
                  ✓ Bản ghi âm ban đầu đã được lưu trong phiên này
                </p>
                <audio
                  src={placementTest.speakingBlobUrl}
                  controls
                  className="w-full rounded-lg"
                />
                <p className="text-[11px] text-ink-muted">
                  Bản ghi âm chỉ lưu trong phiên hiện tại. Năng lực Nói sẽ được đánh giá liên tục
                  qua các bài luyện nói trong lớp.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-warning" />
                  <span className="text-xs font-bold text-warning">A1 (Mức khởi đầu tạm)</span>
                </div>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Chưa có bản ghi âm. Hệ thống áp dụng mức khởi đầu tạm A1 và sẽ thu thập bằng
                  chứng qua các bài luyện nói trong lớp.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link href="/student/learn" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto px-6 py-3 rounded-lg font-bold bg-primary text-white hover:bg-primary-dark transition-colors flex items-center justify-center gap-1.5 shadow-tactile text-sm">
            Bắt đầu học ngay <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
        <Link href="/student/home" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto px-6 py-3 rounded-lg font-bold border border-line bg-white hover:bg-canvas text-ink transition-colors flex items-center justify-center gap-1.5 text-sm">
            <Home className="w-4 h-4" /> Về trang chủ
          </button>
        </Link>
      </div>
    </main>
  );
}

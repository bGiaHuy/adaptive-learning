"use client";

import { isWordDue } from "@/lib/learning";
import { useLocalDraft } from "@/lib/useLocalDraft";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Mascot } from "@/components/ui/Mascot";
import { useApp } from "@/lib/store";
import { SkillRadar } from "@/components/ui/SkillRadar";
import {
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  RotateCcw,
  Users,
  ArrowRight,
  Sparkles,
  Flame,
  CheckCircle,
} from "lucide-react";

export default function StudentHomePage() {
  const { vocabWords, assignments, placementTest, enrolledClassIds } = useApp();

  const { value: resume } = useLocalDraft<{ title: string; href: string } | null>("adaptive_study_resume", null);
  const dueVocabCount = vocabWords.filter(w => isWordDue(w)).length;

  const pendingAssignment = assignments.find(a => enrolledClassIds.includes(a.classId) && (a.status === "in_progress" || a.status === "not_started"));

  return (
    <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-8 md:py-10 space-y-10">
      {/* 1. GREETING WITH MASCOT */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 md:p-8 bg-gradient-to-r from-white to-[#F0F5FF] border-2 border-line rounded-lg shadow-soft">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-xs font-bold text-primary px-3 py-1 rounded-pill bg-[#EAF2FF] inline-block">
            Chào mừng trở lại, Minh Triết!
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-ink tracking-tight">
            Sẵn sàng tiến bộ hôm nay?
          </h1>
          <p className="text-xs md:text-sm text-ink-muted max-w-md">
            {placementTest.completed ? `Hôm nay có ${dueVocabCount} từ đến hạn. Bạn có thể học tiếp hoặc tự chọn kỹ năng.` : "Hoàn thành bài kiểm tra ngắn để bắt đầu học. Bạn có thể xem trước các mục trong ứng dụng."}
          </p>
        </div>

        <div className="shrink-0 flex items-center justify-center">
          <Mascot mood="idle" size="inline" speechText="Cùng học bài tiếp theo nào!" />
        </div>
      </section>

      {/* 2. PRIORITY 1: HERO ACTION CARD (ONE PRIMARY PROMINENT FOCUS) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-ink-muted">
            Bước tiếp theo
          </span>
          <span className="text-xs font-bold text-primary flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> {resume ? "Tiếp tục phiên học" : "Gợi ý bài mẫu"}
          </span>
        </div>

        <div className="bg-white border-2 border-primary/40 rounded-lg p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-primary transition-all">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-primary text-white text-[11px] font-black uppercase">
                {placementTest.completed ? "Bài học mẫu" : "Kiểm tra đầu vào"}
              </span>
              <span className="text-xs font-bold text-ink-muted">{placementTest.completed ? "Tự học theo nhịp của bạn" : "Mục tiêu cá nhân có thể bỏ qua"}</span>
            </div>

            <h2 className="text-xl md:text-2xl font-black text-ink">
              {!placementTest.completed ? "Hoàn thành bài kiểm tra đầu vào" : resume?.title || "Skimming & Scanning: Đời sống hoang dã"}
            </h2>

            <p className="text-xs md:text-sm text-ink-muted leading-relaxed">
              {!placementTest.completed ? "Tiến trình được lưu theo từng câu trên thiết bị." : resume ? "Quay lại đúng câu đang làm, cùng các đáp án đã lưu." : "Bài mẫu giúp luyện đọc tìm thông tin. Chưa phải đề xuất từ mô hình năng lực đã hiệu chỉnh."}
            </p>
          </div>

          <Link href={!placementTest.completed ? "/student/placement-test" : resume?.href || "/student/learn/reading/lesson-reading-01"} className="shrink-0 w-full md:w-auto">
            <Button size="lg" className="w-full md:w-auto shadow-tactile">
              {!placementTest.completed ? "Làm bài kiểm tra" : resume ? "Học tiếp" : "Học bài mẫu"} <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* 3. PRIORITY 2: SECONDARY BLOCKS (VOCAB DUE & CLASSROOM DUE) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Block A: Vocabulary FSRS Review */}
        <div className="bg-white border-2 border-line rounded-lg p-6 flex flex-col justify-between shadow-soft space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-ink flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-primary" /> Ôn từ vựng
              </span>
              <span className="px-2.5 py-0.5 rounded-pill bg-warning-soft text-warning font-black text-xs">
                {dueVocabCount} từ đến hạn
              </span>
            </div>

            <h3 className="text-base font-bold text-ink">
              Củng cố ký ức ngắt quãng
            </h3>

            <p className="text-xs text-ink-muted leading-relaxed">
              Các từ: <em>curious</em>, <em>resilient</em>, <em>subtle</em>... đang chờ bạn ôn lại để duy trì trí nhớ ổn định trên 21 ngày.
            </p>
          </div>

          <div className="pt-2">
            <Link href="/student/vocabulary/flashcard">
              <Button variant="secondary" size="md" className="w-full">
                Bắt đầu phiên lật Flashcard ({dueVocabCount} từ)
              </Button>
            </Link>
          </div>
        </div>

        {/* Block B: Classroom Assignment */}
        <div className="bg-white border-2 border-line rounded-lg p-6 flex flex-col justify-between shadow-soft space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-ink flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Bài Tập Lớp Học
              </span>
              {pendingAssignment && (
                <span className="px-2.5 py-0.5 rounded-pill bg-[#EFF6FF] text-primary-dark font-black text-xs">
                  {pendingAssignment.dueDate}
                </span>
              )}
            </div>

            {pendingAssignment ? (
              <>
                <h3 className="text-base font-bold text-ink">
                  {pendingAssignment.title}
                </h3>
                <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">
                  {pendingAssignment.className} · {pendingAssignment.promptText}
                </p>
              </>
            ) : (
              <p className="text-xs text-ink-muted">Bạn không có bài tập lớp nào đang chờ hoàn thành.</p>
            )}
          </div>

          <div className="pt-2">
            {pendingAssignment ? (
              <Link href={`/student/classroom/${pendingAssignment.classId}/assignment/${pendingAssignment.id}`}>
                <Button variant="secondary" size="md" className="w-full">
                  Tiếp tục làm bài tập lớp
                </Button>
              </Link>
            ) : (
              <Link href="/student/classroom">
                <Button variant="outline" size="md" className="w-full">
                  Vào không gian lớp học
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      <SkillRadar />

      {/* 4. PRIORITY 3: SKILL SELECTION GRID */}
      <section className="space-y-4">
        <h2 className="text-lg font-black text-ink">Tự chọn kỹ năng luyện tập tự do</h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/student/learn?skill=listening"
            className="p-5 bg-white border-2 border-line hover:border-primary rounded-md text-center space-y-2 transition-all shadow-sm group"
          >
            <div className="w-12 h-12 rounded-full bg-[#EAF2FF] text-primary flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
              <Headphones className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-ink group-hover:text-primary">Listening</h3>
            <p className="text-[11px] text-ink-muted">Hội thoại & Chi tiết</p>
          </Link>

          <Link
            href="/student/learn?skill=reading"
            className="p-5 bg-white border-2 border-line hover:border-primary rounded-md text-center space-y-2 transition-all shadow-sm group"
          >
            <div className="w-12 h-12 rounded-full bg-[#EAF2FF] text-primary flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-ink group-hover:text-primary">Reading</h3>
            <p className="text-[11px] text-ink-muted">Học thuật & Logic</p>
          </Link>

          <Link
            href="/student/workspace/writing/assign-1"
            className="p-5 bg-white border-2 border-line hover:border-primary rounded-md text-center space-y-2 transition-all shadow-sm group"
          >
            <div className="w-12 h-12 rounded-full bg-[#EAF2FF] text-primary flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
              <PenTool className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-ink group-hover:text-primary">Writing</h3>
            <p className="text-[11px] text-ink-muted">Bài luận & AI cố vấn</p>
          </Link>

          <Link
            href="/student/workspace/speaking/lesson-speaking-01"
            className="p-5 bg-white border-2 border-line hover:border-primary rounded-md text-center space-y-2 transition-all shadow-sm group"
          >
            <div className="w-12 h-12 rounded-full bg-[#EAF2FF] text-primary flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-ink group-hover:text-primary">Speaking</h3>
            <p className="text-[11px] text-ink-muted">Thu âm & Phản hồi</p>
          </Link>
        </div>
      </section>
    </main>
  );
}

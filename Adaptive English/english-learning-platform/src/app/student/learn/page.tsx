"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { initialLessons } from "@/lib/mockData";
import { SkillType, Lesson } from "@/types";
import { Button } from "@/components/ui/Button";
import { Mascot } from "@/components/ui/Mascot";
import {
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  FastForward,
  Play,
  Sparkles,
  Layers,
  Clock,
} from "lucide-react";

type GradeFilter = "all" | "g6" | "g7" | "g8" | "g9" | "academic";

export default function LearnExplorerPage() {
  const [selectedSkill, setSelectedSkill] = useState<SkillType | "all">("reading");
  const [selectedGrade, setSelectedGrade] = useState<GradeFilter>("all");
  const [skipTestModalOpen, setSkipTestModalOpen] = useState(false);

  useEffect(() => {
    const skill = new URLSearchParams(window.location.search).get("skill");
    if (skill && ["reading", "listening", "writing", "speaking", "grammar"].includes(skill)) {
      setSelectedSkill(skill as SkillType);
    }
  }, []);

  const skillTabs: { id: SkillType | "all"; label: string; icon: React.ReactNode }[] = [
    { id: "all", label: "Tất cả kỹ năng", icon: <Layers className="w-4 h-4" /> },
    { id: "reading", label: "Reading", icon: <BookOpen className="w-4 h-4" /> },
    { id: "listening", label: "Listening", icon: <Headphones className="w-4 h-4" /> },
    { id: "writing", label: "Writing", icon: <PenTool className="w-4 h-4" /> },
    { id: "speaking", label: "Speaking", icon: <Mic className="w-4 h-4" /> },
    { id: "grammar", label: "Grammar", icon: <Sparkles className="w-4 h-4" /> },
  ];

  const gradeOptions: { id: GradeFilter; label: string }[] = [
    { id: "all", label: "Tất cả khối lớp" },
    { id: "g6", label: "Lớp 6" },
    { id: "g7", label: "Lớp 7" },
    { id: "g8", label: "Lớp 8" },
    { id: "g9", label: "Lớp 9" },
    { id: "academic", label: "Academic B1 Foundation" },
  ];

  const courseDisplayNames: Record<GradeFilter, string> = {
    all: "Tiếng Anh",
    g6: "Tiếng Anh 6",
    g7: "Tiếng Anh 7",
    g8: "Tiếng Anh 8",
    g9: "Tiếng Anh 9",
    academic: "Tiếng Anh B1",
  };

  const getGradeCategory = (lesson: Lesson): GradeFilter => {
    if (lesson.id.startsWith("g6") || lesson.courseTitle?.includes("Tiếng Anh 6")) return "g6";
    if (lesson.id.startsWith("g7") || lesson.courseTitle?.includes("Tiếng Anh 7")) return "g7";
    if (lesson.id.startsWith("g8") || lesson.courseTitle?.includes("Tiếng Anh 8")) return "g8";
    if (lesson.id.startsWith("g9") || lesson.courseTitle?.includes("Tiếng Anh 9")) return "g9";
    return "academic";
  };

  const filteredLessons = useMemo(() => {
    return initialLessons.filter((l) => {
      if (l.status !== "ready" || !l.questions?.length) return false;
      const matchSkill = selectedSkill === "all" ? true : l.skill === selectedSkill;
      const matchGrade = selectedGrade === "all" ? true : getGradeCategory(l) === selectedGrade;
      return matchSkill && matchGrade;
    });
  }, [selectedSkill, selectedGrade]);

  // Group lessons by Course/Grade
  const groupedCourses = useMemo(() => {
    const map = new Map<string, { title: string; cefr: string; grade: GradeFilter; provenance: string; lessons: Lesson[] }>();

    filteredLessons.forEach((lesson) => {
      const courseKey = lesson.courseTitle || "Khoá học Tiếng Anh";
      if (!map.has(courseKey)) {
        map.set(courseKey, {
          title: courseKey,
          cefr: lesson.targetCefr || "A2",
          grade: getGradeCategory(lesson),
          provenance: lesson.provenance || "Chương trình GDPT 2018 (NXB Giáo Dục Việt Nam)",
          lessons: [],
        });
      }
      map.get(courseKey)!.lessons.push(lesson);
    });

    return Array.from(map.values());
  }, [filteredLessons]);

  return (
    <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-8 md:py-10 space-y-8">
      {/* Header with Level-Skip Test Callout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-ink tracking-tight">
            Kho Bài Học & Lộ Trình Thích Ứng
          </h1>
          <p className="text-xs md:text-sm text-ink-muted">
            Luyện tập 4 kỹ năng & Ngữ pháp theo phân phối chương trình GDPT 2018 (Lớp 6–9) và B1 Foundation.
          </p>
        </div>

        {/* Level-Skip CTA */}
        <button
          type="button"
          onClick={() => setSkipTestModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-[#EAF2FF] border border-primary/20 text-xs font-bold text-primary-dark hover:bg-[#DCE8FC] transition-colors self-start md:self-auto"
        >
          <FastForward className="w-4 h-4 text-primary" />
          <span>Bài Test Nhảy Trình (Level-Skip)</span>
        </button>
      </div>

      {/* Filter Bars */}
      <div className="space-y-3">
        {/* Skill Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {skillTabs.map((tab) => {
            const isActive = selectedSkill === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedSkill(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-pill text-xs md:text-sm font-extrabold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-tactile translate-y-[-1px]"
                    : "bg-white border-2 border-line text-ink-muted hover:border-primary/50 hover:text-ink"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Grade Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-ink-muted shrink-0 mr-1">Khối lớp:</span>
          {gradeOptions.map((g) => {
            const isActive = selectedGrade === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setSelectedGrade(g.id)}
                className={`px-3 py-1 rounded-pill text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-ink text-white"
                    : "bg-white border border-line text-ink-muted hover:text-ink hover:border-ink/40"
                }`}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Course / Unit / Lesson Hierarchy Cards */}
      {groupedCourses.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-line rounded-lg p-10 text-center flex flex-col items-center justify-center space-y-3">
          <Mascot size="inline" mood="thinking" />
          <p className="text-sm font-bold text-ink">Không tìm thấy bài học nào phù hợp với bộ lọc.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedSkill("all");
              setSelectedGrade("all");
            }}
          >
            Đặt lại bộ lọc
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedCourses.map((course) => (
            <div
              key={course.title}
              className="bg-white border-2 border-line rounded-lg p-5 md:p-6 space-y-5 shadow-soft"
            >
              {/* Course Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-primary uppercase tracking-wider">
                      Khóa học trọng điểm
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 font-bold text-ink-muted border border-line">
                      {course.lessons.length} bài học
                    </span>
                  </div>
                  <h2 className="text-lg md:text-xl font-black text-ink mt-0.5">
                    {courseDisplayNames[course.grade]}
                  </h2>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="px-3 py-1 rounded-pill bg-[#EAF2FF] text-primary-dark font-black text-xs">
                    Mục tiêu CEFR: {course.cefr}
                  </span>
                </div>
              </div>

              {/* Lesson Rows */}
              <div className="space-y-3">
                {course.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="p-4 md:p-5 rounded-md border-2 border-line bg-[#F8FAFF] transition-all hover:border-primary/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-2 max-w-2xl">
                        <h3 className="font-extrabold text-sm md:text-base text-ink">
                          {lesson.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-2 md:gap-3 text-[11px] font-bold text-ink-muted">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" /> ~{lesson.durationMinutes} phút
                          </span>
                          <span>•</span>
                          <span>{lesson.questions.length} câu hỏi</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="shrink-0 flex items-center gap-3">
                        <Link href={`/student/learn/${lesson.skill}/${lesson.id}`}>
                          <Button size="sm" className="text-xs font-bold">
                            Bắt đầu học <Play className="w-3.5 h-3.5 ml-1 fill-current" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Level-Skip Modal */}
      {skipTestModalOpen && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-line rounded-lg p-6 max-w-md w-full shadow-panel space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2.5 text-primary-dark font-black text-lg">
              <FastForward className="w-6 h-6 text-primary" />
              <span>Bài Test Nhảy Trình (Level-Skip)</span>
            </div>

            <p className="text-xs text-ink-muted leading-relaxed">
              Bài xác nhận mức cho kỹ năng <strong>{selectedSkill.toUpperCase()}</strong> đang chờ chốt cơ chế. Bạn vẫn có thể tự chọn bài trong kho để luyện tập thích ứng theo trình độ cá nhân.
            </p>

            <div className="p-3 bg-warning-soft border-l-4 border-warning text-[11px] text-ink rounded-sm space-y-1">
              <strong>[PENDING: Quy chế nhảy trình]</strong>
              <p>Ngưỡng đạt, số lần thử và cách cập nhật năng lực chưa được duyệt chính thức.</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setSkipTestModalOpen(false)}>
                Đóng
              </Button>
              <Link href={`/student/learn/${selectedSkill === "all" ? "reading" : selectedSkill}/${filteredLessons[0]?.id || "g6-u1-les-01"}`}>
                <Button size="sm" onClick={() => setSkipTestModalOpen(false)}>
                  Mở bài luyện mẫu
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}

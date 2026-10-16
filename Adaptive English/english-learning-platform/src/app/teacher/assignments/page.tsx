"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Plus, Upload, Calendar, ArrowRight, Sparkles } from "lucide-react";

export default function TeacherAssignmentsPage() {
  const { assignments } = useApp();

  return (
    <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-8 md:py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="text-3xl font-black text-ink tracking-tight">Bài tập</h1>
          <p className="text-xs md:text-sm text-ink-muted">Soạn đề mới, quản lý phiên bản đề bài và giao bài cho học viên.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/teacher/assignments/import-docx">
            <Button variant="outline" size="sm">
              <Upload className="w-3.5 h-3.5 mr-1" /> Tải file lên
            </Button>
          </Link>
          <Link href="/teacher/assignments/create">
            <Button size="sm" className="shadow-tactile">
              <Plus className="w-3.5 h-3.5 mr-1" /> Soạn đề thủ công
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {assignments.map((assign) => (
          <div
            key={assign.id}
            className="bg-white border-2 border-line hover:border-primary/60 rounded-md p-6 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#EAF2FF] text-primary uppercase">
                  {assign.skill}
                </span>
                <span className="text-xs font-bold text-ink-muted">{assign.className}</span>
                <span className="text-xs font-mono font-bold text-ink px-2 py-0.2 bg-line/60 rounded">
                  Phiên bản V{assign.version}
                </span>
              </div>

              <h3 className="font-black text-base text-ink">{assign.title}</h3>
              <p className="text-xs text-ink-muted line-clamp-1">{assign.promptText}</p>

              <div className="flex items-center gap-4 text-xs text-ink-muted pt-1">
                <span>Hạn chót: <strong>{assign.dueDate}</strong></span>
                <span>Thang điểm: <strong>{assign.maxScore}</strong></span>
                {assign.allowAiTutor ? (
                  <span className="text-primary font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI Tutor bật
                  </span>
                ) : (
                  <span className="text-ink-muted">[AI Tutor tắt]</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/teacher/assignments/${assign.id}/versions`}><Button variant="outline" size="sm">Chỉnh sửa / Tệp đính kèm</Button></Link>
              <Link href={`/teacher/assignments/${assign.id}/submissions`}>
                <Button variant="secondary" size="sm">
                  Xem bài nộp <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

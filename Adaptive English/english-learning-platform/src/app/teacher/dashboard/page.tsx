"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Users, BookOpen, Award, Upload, Plus, ArrowRight, Clock, CheckCircle2 } from "lucide-react";

export default function TeacherDashboardPage() {
  const { classrooms, assignments, submissions } = useApp();

  const pendingSubmissions = submissions.filter((s) => s.status === "pending_grading");
  const totalStudents = classrooms.reduce((acc, c) => acc + c.studentCount, 0);

  return (
    <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-8 md:py-10 space-y-10">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <span className="text-xs font-bold text-primary px-2.5 py-0.5 rounded-pill bg-[#EAF2FF] inline-block mb-1">
            Không Gian Dành Cho Giáo Viên
          </span>
          <h1 className="text-3xl font-black text-ink tracking-tight">Teacher Management Dashboard</h1>
          <p className="text-xs md:text-sm text-ink-muted">
            Quản trị lớp học, giao bài tập tùy biến, nhập đề DOCX và chấm điểm định hình cho học viên.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/teacher/assignments/import-docx">
            <Button variant="outline" size="sm">
              <Upload className="w-3.5 h-3.5 mr-1" /> Import DOCX
            </Button>
          </Link>
          <Link href="/teacher/assignments/create">
            <Button size="sm" className="shadow-tactile">
              <Plus className="w-3.5 h-3.5 mr-1" /> Soạn bài tập mới
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-line rounded-lg p-5 space-y-1 shadow-sm">
          <span className="text-xs font-bold text-ink-muted">Lớp đang giảng dạy</span>
          <span className="text-3xl font-black text-primary font-mono block">{classrooms.length}</span>
          <span className="text-[11px] text-ink-muted">Đang hoạt động</span>
        </div>

        <div className="bg-white border-2 border-line rounded-lg p-5 space-y-1 shadow-sm">
          <span className="text-xs font-bold text-ink-muted">Tổng số học viên</span>
          <span className="text-3xl font-black text-ink font-mono block">{totalStudents}</span>
          <span className="text-[11px] text-ink-muted">Trên toàn bộ các lớp</span>
        </div>

        <div className="bg-white border-2 border-line rounded-lg p-5 space-y-1 shadow-sm">
          <span className="text-xs font-bold text-ink-muted">Bài nộp chờ chấm</span>
          <span className={`text-3xl font-black font-mono block ${pendingSubmissions.length > 0 ? "text-error" : "text-success"}`}>
            {pendingSubmissions.length}
          </span>
          <span className="text-[11px] text-ink-muted">Cần phản hồi</span>
        </div>

        <div className="bg-white border-2 border-line rounded-lg p-5 space-y-1 shadow-sm">
          <span className="text-xs font-bold text-ink-muted">Tổng bài tập đã giao</span>
          <span className="text-3xl font-black text-ink font-mono block">{assignments.length}</span>
          <span className="text-[11px] text-ink-muted">Bao gồm cả đề V1 & V2</span>
        </div>
      </div>

      {/* Pending Grading Alert & Direct Access */}
      {pendingSubmissions.length > 0 && (
        <div className="p-5 bg-white border-2 border-primary/40 rounded-lg shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-error-soft text-error flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-ink">
                Có {pendingSubmissions.length} bài nộp của học sinh đang chờ chấm điểm:
              </h3>
              <p className="text-xs text-ink-muted">
                {pendingSubmissions[0].studentName} đã nộp bài "{pendingSubmissions[0].assignmentTitle}".
              </p>
            </div>
          </div>

          <Link href={`/teacher/grading/${pendingSubmissions[0].id}`}>
            <Button size="sm" className="shadow-tactile">
              Mở bàn chấm bài ngay <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      )}

      {/* Classrooms Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-ink flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Lớp học của bạn
          </h2>
          <Link href="/teacher/classes" className="text-xs font-bold text-primary hover:underline">
            Quản lý tất cả lớp →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classrooms.map((cls) => (
            <div key={cls.id} className="bg-white border-2 border-line rounded-lg p-6 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2.5 py-0.5 rounded-pill bg-[#EAF2FF] text-primary-dark font-mono font-bold">
                    Mã mời: {cls.code}
                  </span>
                  <span className="text-xs text-ink-muted">{cls.room}</span>
                </div>
                <h3 className="text-lg font-black text-ink">{cls.name}</h3>
                <p className="text-xs text-ink-muted">Sĩ số: {cls.studentCount} học viên · {cls.assignmentsCount} bài tập</p>
              </div>

              <div className="pt-3 border-t border-line flex justify-end gap-2">
                <Link href={`/teacher/classes/${cls.id}`}>
                  <Button variant="secondary" size="sm">
                    Xem Sổ Điểm & Học Viên →
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

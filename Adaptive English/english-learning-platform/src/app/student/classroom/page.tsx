"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import {
  Users,
  Plus,
  BookOpen,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  LogOut,
  Sparkles,
} from "lucide-react";

export default function StudentClassroomHubPage() {
  const { classrooms: allClasses, assignments: allAssignments, enrolledClassIds, joinClassroom, leaveClassroom } = useApp();
  const classrooms = allClasses.filter(c => enrolledClassIds.includes(c.id));
  const assignments = allAssignments.filter(a => enrolledClassIds.includes(a.classId));

  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [classCode, setClassCode] = useState("");
  const [joinMessage, setJoinMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [joining, setJoining] = useState(false);

  React.useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
      setClassCode(code.trim().toUpperCase());
      setJoinModalOpen(true);
    }
  }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (joining) return;
    setJoining(true);
    const res = await joinClassroom(classCode);
    setJoining(false);
    if (res.success) {
      setJoinMessage({ type: "success", text: res.message });
      setClassCode("");
      setTimeout(() => {
        setJoinModalOpen(false);
        setJoinMessage(null);
      }, 1200);
    } else {
      setJoinMessage({ type: "error", text: res.message });
    }
  };

  const handleLeaveClass = async (classId: string, className: string) => {
    if (
      confirm(
        `CẢNH BÁO: Rời khỏi lớp "${className}" sẽ thu hồi toàn bộ quyền xem bài tập và lịch sử làm bài của lớp này. Bạn có chắc chắn muốn rời lớp?`
      )
    ) {
      await leaveClassroom(classId);
    }
  };

  return (
    <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-8 md:py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="text-3xl font-black text-ink tracking-tight">Không Gian Lớp Học (Classroom)</h1>
          <p className="text-xs md:text-sm text-ink-muted">
            Nhận bài tập chuyên biệt từ giáo viên, nộp bài đúng hạn và nhận feedback định hình.
          </p>
        </div>

        <Button size="md" onClick={() => setJoinModalOpen(true)} className="shadow-tactile">
          <Plus className="w-4 h-4 mr-1.5" /> Tham gia lớp học mới
        </Button>
      </div>

      {/* Enrolled Classes List */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-ink flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" /> Các lớp bạn đang tham gia ({classrooms.length})
        </h2>

        {classrooms.length === 0 ? (
          <div className="bg-white border-2 border-line rounded-lg p-8 text-center space-y-3">
            <p className="text-sm text-ink-muted">Bạn chưa tham gia lớp học nào.</p>
            <Button variant="outline" size="sm" onClick={() => setJoinModalOpen(true)}>
              Nhập mã lớp để tham gia
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classrooms.map((cls) => (
              <div
                key={cls.id}
                className="bg-white border-2 border-line rounded-lg p-6 space-y-4 shadow-sm hover:border-primary/50 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2.5 py-0.5 rounded-pill bg-[#EAF2FF] text-primary-dark font-mono font-bold">
                      Mã lớp: {cls.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleLeaveClass(cls.id, cls.name)}
                      className="text-xs text-ink-muted hover:text-error flex items-center gap-1 transition-colors"
                      title="Rời khỏi lớp"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Rời lớp
                    </button>
                  </div>

                  <h3 className="text-lg font-black text-ink">{cls.name}</h3>
                  <p className="text-xs text-ink-muted">Giảng viên: <strong>{cls.teacherName}</strong> · {cls.room}</p>
                </div>

                <div className="pt-3 border-t border-line flex items-center justify-between text-xs text-ink-muted">
                  <span>{cls.studentCount} bạn cùng lớp</span>
                  <span className="font-bold text-primary">{cls.assignmentsCount} bài tập đã giao</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Classroom Assignments Board */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-ink flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" /> Danh sách bài tập được giao ({assignments.length})
        </h2>

        <div className="space-y-3">
          {assignments.map((assign) => {
            const isGraded = assign.status === "graded";
            const isSubmitted = ['submitted', 'pending_grading', 'pending_release'].includes(assign.status);
            const isInProgress = assign.status === "in_progress";

            return (
              <div
                key={assign.id}
                className="bg-white border-2 border-line hover:border-primary/60 rounded-md p-5 md:p-6 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#EAF2FF] text-primary uppercase">
                      {assign.skill}
                    </span>
                    <span className="text-xs text-ink-muted font-bold">
                      {assign.className}
                    </span>
                    <span className="text-xs text-ink-muted">
                      • Phiên bản đề: <strong>V{assign.version}</strong>
                    </span>
                  </div>

                  <h3 className="font-black text-base text-ink">{assign.title}</h3>

                  <p className="text-xs text-ink-muted line-clamp-1">
                    {assign.promptText}
                  </p>

                  <div className="flex items-center gap-4 text-xs pt-1">
                    <span className="flex items-center gap-1 text-ink-muted">
                      <Calendar className="w-3.5 h-3.5 text-primary" /> Hạn nộp: <strong>{assign.dueDate}</strong>
                    </span>

                    {/* Dual-Grade Display if Graded */}
                    {isGraded && (
                      <span className="text-success font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Điểm Giáo viên: {assign.score}/{assign.maxScore}
                      </span>
                    )}

                    {assign.allowAiTutor ? (
                      <span className="text-primary font-semibold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> AI Tutor hỗ trợ
                      </span>
                    ) : (
                      <span className="text-ink-muted italic">
                        [AI Tutor tắt theo yêu cầu đề thi]
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <Link href={`/student/classroom/${assign.classId}/assignment/${assign.id}`}>
                    <Button
                      variant={isGraded ? "outline" : isInProgress ? "primary" : "secondary"}
                      size="sm"
                    >
                      {isGraded ? "Xem Feedback & Điểm" : isInProgress ? "Tiếp tục làm bài" : "Vào làm bài"}
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Join Class Modal */}
      {joinModalOpen && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleJoin}
            className="bg-white border-2 border-line rounded-lg p-6 max-w-md w-full shadow-panel space-y-4 animate-in fade-in"
          >
            <h3 className="font-black text-lg text-ink">Tham Gia Lớp Học Mới</h3>
            <p className="text-xs text-ink-muted">
              Nhập mã lớp gồm 6 ký tự do giáo viên cung cấp (ví dụ: <code>IEL789</code> hoặc <code>ENG456</code>).
            </p>

            <input
              type="text"
              required
              placeholder="Nhập mã lớp..."
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              className="w-full p-3 border-2 border-line rounded-sm text-sm font-mono uppercase font-bold focus:border-primary focus:outline-none"
            />

            {joinMessage && (
              <div
                className={`p-3 rounded-sm text-xs ${
                  joinMessage.type === "success"
                    ? "bg-success-soft text-success"
                    : "bg-error-soft text-error"
                }`}
              >
                {joinMessage.text}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setJoinModalOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" size="sm" disabled={joining}>
                {joining ? 'Đang tham gia...' : 'Xác nhận tham gia'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

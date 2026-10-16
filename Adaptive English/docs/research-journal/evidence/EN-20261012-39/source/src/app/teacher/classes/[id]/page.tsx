"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Users, Award, BookOpen, Copy, Check, Sparkles } from "lucide-react";

export default function TeacherClassDetailPage() {
  const params = useParams();
  const classId = params.id as string;

  const [activeTab, setActiveTab] = useState<"students" | "gradebook" | "assignments">("students");
  const [copied, setCopied] = useState(false);
  const [classroomData, setClassroomData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchClassData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/classes/${classId}`);
      if (res.ok) {
        const data = await res.json();
        setClassroomData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchClassData();
  }, [classId]);

  const handleKickStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa học sinh "${studentName}" khỏi lớp? Học sinh sẽ mất toàn bộ quyền truy cập bài tập của lớp này trên server.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/classes/${classId}?studentId=${studentId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setActionMsg(`Đã xóa học sinh "${studentName}" khỏi lớp thành công.`);
        fetchClassData();
        setTimeout(() => setActionMsg(null), 3000);
      } else {
        const err = await res.json();
        alert(err.error || 'Lỗi khi xóa học sinh');
      }
    } catch {
      alert('Lỗi kết nối máy chủ');
    }
  };

  const currentClass = classroomData?.classroom;
  const students = classroomData?.students || [];
  const assignments = classroomData?.assignments || [];

  if (loading && !classroomData) {
    return <main className="p-8 text-center"><p className="text-sm text-ink-muted">Đang tải dữ liệu lớp học...</p></main>;
  }

  if (!currentClass) {
    return (
      <main className="p-8 space-y-3">
        <h1 className="text-xl font-bold text-ink">Không tìm thấy lớp hoặc bạn không có quyền truy cập</h1>
        <Link href="/teacher/classes" className="text-primary text-sm font-bold">← Về danh sách lớp</Link>
      </main>
    );
  }

  const copyInvite = async () => {
    try {
      const invite = new URL('/join', window.location.origin);
      invite.searchParams.set('code', currentClass.code);
      await navigator.clipboard.writeText(invite.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setActionMsg('Không thể sao chép liên kết. Bạn có thể gửi mã lớp cho học sinh.');
    }
  };

  return (
    <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-8 md:py-10 space-y-8">
      {/* Header */}
      <div className="space-y-4 border-b border-line pb-6">
        <Link href="/teacher/classes" className="inline-flex items-center gap-2 text-xs font-bold text-ink-muted hover:text-ink">
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách lớp
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-pill bg-[#EAF2FF] text-primary-dark font-mono font-bold">
                Mã lớp: {currentClass.code}
              </span>
              <span className="text-xs text-ink-muted">{currentClass.room}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-ink mt-1">{currentClass.name}</h1>
          </div>

          <button
            type="button"
            onClick={copyInvite}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-white border-2 border-line text-xs font-bold text-ink hover:border-primary transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-primary" />}
            <span>{copied ? "Đã sao chép link mời!" : "Sao chép link mời học viên"}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-line pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("students")}
          className={`px-4 py-2 rounded-pill text-xs font-bold transition-colors ${
            activeTab === "students" ? "bg-primary text-white" : "text-ink-muted hover:text-ink"
          }`}
        >
          Học viên ({students.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("gradebook")}
          className={`px-4 py-2 rounded-pill text-xs font-bold transition-colors ${
            activeTab === "gradebook" ? "bg-primary text-white" : "text-ink-muted hover:text-ink"
          }`}
        >
          Sổ điểm lớp học (Gradebook)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("assignments")}
          className={`px-4 py-2 rounded-pill text-xs font-bold transition-colors ${
            activeTab === "assignments" ? "bg-primary text-white" : "text-ink-muted hover:text-ink"
          }`}
        >
          Bài tập lớp ({assignments.length})
        </button>
      </div>

      {/* Action message */}
      {actionMsg && (
        <div className="p-3 bg-success-soft border border-success/30 rounded-lg text-xs font-bold text-[#185932]">
          {actionMsg}
        </div>
      )}

      {/* Tab 1: Students Roster */}
      {activeTab === "students" && (
        <div className="bg-white border-2 border-line rounded-lg overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFF] border-b border-line font-bold text-ink-muted">
                <tr>
                  <th className="p-4">Học viên</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">CEFR ước lượng</th>
                  <th className="p-4">Bài đã nộp</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-ink-muted">
                      Chưa có học viên nào tham gia. Chia sẻ mã lớp <strong>{currentClass.code}</strong> để mời học sinh.
                    </td>
                  </tr>
                ) : (
                  students.map((stu: any) => (
                    <tr key={stu.id} className="hover:bg-[#F8FAFF] transition-colors">
                      <td className="p-4 font-bold text-ink flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-[#EAF2FF] text-primary flex items-center justify-center font-black">
                          {stu.name?.[0] || 'S'}
                        </span>
                        <span>{stu.name}</span>
                      </td>
                      <td className="p-4 text-ink-muted font-mono">{stu.email}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-pill bg-[#EAF2FF] text-primary-dark font-extrabold text-[11px]">
                          {stu.estimatedCefr || 'B1'}
                        </span>
                      </td>
                      <td className="p-4 text-ink-muted font-mono">{stu.submissionsCount || 0} bài</td>
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleKickStudent(stu.id, stu.name)}
                          className="text-error font-bold hover:underline"
                        >
                          Xóa khỏi lớp
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Gradebook Table */}
      {activeTab === "gradebook" && (
        <div className="bg-white border-2 border-line rounded-lg overflow-hidden shadow-soft space-y-4 p-6">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h3 className="font-black text-base text-ink">Bảng Tổng Hợp Điểm (Gradebook)</h3>
              <p className="text-xs text-ink-muted">Điểm chính thức do giáo viên phê duyệt và nhập vào sổ.</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-pill bg-success-soft text-[#185932] font-bold">
              Bảo lưu lịch sử điểm
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFF] border-b border-line font-bold text-ink-muted">
                <tr>
                  <th className="p-3">Học viên</th>
                  <th className="p-3">Số bài đã nộp</th>
                  <th className="p-3">CEFR</th>
                  <th className="p-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {students.map((stu: any) => (
                  <tr key={stu.id} className="hover:bg-[#F8FAFF]">
                    <td className="p-3 font-bold text-ink">{stu.name}</td>
                    <td className="p-3 font-mono font-bold text-primary">{stu.submissionsCount || 0} bài</td>
                    <td className="p-3 text-ink-muted font-mono">{stu.estimatedCefr || 'B1'}</td>
                    <td className="p-3 text-success font-bold">Đang học</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Assignments List */}
      {activeTab === "assignments" && (
        <div className="space-y-3">
          {assignments.length === 0 ? (
            <div className="p-8 bg-white border-2 border-line rounded-lg text-center text-ink-muted">
              Chưa có bài tập nào trong lớp học này.
            </div>
          ) : (
            assignments.map((a: any) => (
              <div key={a.id} className="p-5 bg-white border-2 border-line rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-primary uppercase">{a.skill}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-pill bg-brand-blue/10 text-brand-blue font-bold font-mono">
                      Phiên bản V{a.version}
                    </span>
                  </div>
                  <h4 className="font-bold text-base text-ink mt-1">{a.title}</h4>
                  <p className="text-xs text-ink-muted">Hạn nộp: {a.dueDate} · Điểm tối đa: {a.maxScore} · Đã nộp: {a.submissionsCount || 0}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/teacher/assignments/${a.id}/versions`}>
                    <Button variant="outline" size="sm">
                      Lịch sử phiên bản (V{a.version})
                    </Button>
                  </Link>
                  <Link href={`/teacher/grading`}>
                    <Button size="sm">
                      Chấm bài ({a.submissionsCount || 0})
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </main>
  );
}

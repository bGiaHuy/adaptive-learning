"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Users, Plus, ArrowRight, Copy, Check } from "lucide-react";

export default function TeacherClassesPage() {
  const { classrooms, createClassroom } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [className, setClassName] = useState("");
  const [room, setRoom] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;
    await createClassroom(className.trim(), room.trim() || "Phòng học online");
    setClassName("");
    setRoom("");
    setModalOpen(false);
  };

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  return (
    <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-8 md:py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="text-3xl font-black text-ink tracking-tight">Quản Lý Lớp Học</h1>
          <p className="text-xs md:text-sm text-ink-muted">Tạo lớp mới, chia sẻ mã tham gia và theo dõi tiến độ học sinh.</p>
        </div>

        <Button size="md" onClick={() => setModalOpen(true)} className="shadow-tactile">
          <Plus className="w-4 h-4 mr-1.5" /> Tạo lớp học mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {classrooms.map((cls) => (
          <div key={cls.id} className="bg-white border-2 border-line rounded-lg p-6 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-pill bg-[#EAF2FF] text-primary-dark font-mono font-bold">
                    Mã lớp: {cls.code}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyCode(cls.code)}
                    className="p-1 rounded text-ink-muted hover:text-primary transition-colors text-xs flex items-center gap-1"
                    title="Sao chép mã lớp"
                  >
                    {copiedCode === cls.code ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <span className="text-xs text-ink-muted">{cls.createdAt}</span>
              </div>

              <h2 className="text-xl font-black text-ink">{cls.name}</h2>
              <p className="text-xs text-ink-muted">{cls.room} · Giảng dạy: <strong>{cls.teacherName}</strong></p>
            </div>

            <div className="pt-4 border-t border-line flex items-center justify-between">
              <div className="text-xs text-ink-muted">
                <span><strong>{cls.studentCount}</strong> học viên</span>
                <span className="mx-2">•</span>
                <span><strong>{cls.assignmentsCount}</strong> bài tập</span>
              </div>

              <Link href={`/teacher/classes/${cls.id}`}>
                <Button variant="secondary" size="sm">
                  Quản lý lớp <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Create Class */}
      {modalOpen && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-white border-2 border-line rounded-lg p-6 max-w-md w-full shadow-panel space-y-4 animate-in fade-in">
            <h3 className="font-black text-lg text-ink">Tạo Lớp Học Mới</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Tên lớp học</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IELTS Intensive 6.5+ (Thứ 2 & 4)"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full p-2.5 border-2 border-line rounded-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Phòng học / Ghi chú</label>
                <input
                  type="text"
                  placeholder="e.g. Online Zoom Hub hoặc Phòng 302"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full p-2.5 border-2 border-line rounded-sm focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" size="sm">
                Xác nhận tạo lớp
              </Button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

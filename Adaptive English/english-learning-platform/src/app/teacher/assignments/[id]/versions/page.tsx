'use client';
import AssignmentAttachments from '@/components/AssignmentAttachments';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function AssignmentVersionsPage() {
  const params = useParams();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit / new version form state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editChangeNotes, setEditChangeNotes] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [editMaxScore, setEditMaxScore] = useState(10);
  const [editAllowAi, setEditAllowAi] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/assignments/${assignmentId}`);
      if (res.ok) {
        const data = await res.json();
        setAssignment(data.assignment);
        setError(null);
        setEditMaxScore(data.assignment.maxScore);
        setEditAllowAi(data.assignment.allowAiTutor);
        setEditTitle(data.assignment.title);
        setEditPrompt(data.assignment.promptText);
        setEditDueDate(data.assignment.dueDate);
      } else {
        const err = await res.json();
        setError(err.error || 'Không thể tải thông tin bài tập');
      }
    } catch {
      setError('Lỗi kết nối khi tải bài tập');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignment();
  }, [assignmentId]);

  const handleUpdateVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || (!assignment.packId && !assignment.exercises?.length && !editPrompt.trim())) {
      alert('Vui lòng điền đủ tiêu đề và nội dung đề bài.');
      return;
    }

    try {
      setIsUpdating(true);
      if (files.length > 5 || files.reduce((n, f) => n + f.size, 0) > 2 * 1024 * 1024) { alert('Tối đa 5 tệp, tổng dung lượng 2 MB mỗi lần lưu.'); return; }
      const attachments = await Promise.all(files.map(file => new Promise<{ name: string; base64: string }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ name: file.name, base64: String(reader.result).split(',')[1] });
        reader.onerror = () => reject(new Error('Không đọc được tệp'));
        reader.readAsDataURL(file);
      })));
      const res = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expectedVersion: assignment.version,
          attachments,
          maxScore: editMaxScore,
          allowAiTutor: editAllowAi,
          title: editTitle,
          promptText: editPrompt,
          dueDate: editDueDate,
          changeNotes: editChangeNotes || `Cập nhật nội dung phiên bản mới`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessMsg(`Đã tạo thành công Version ${data.newVersion}!`);
        setShowEditModal(false);
        setEditChangeNotes('');
        setFiles([]);
        await fetchAssignment();
        setTimeout(() => setSuccessMsg(null), 3500);
      } else {
        const err = await res.json();
        alert(err.error || 'Lỗi khi cập nhật bài tập');
      }
    } catch {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading && !assignment) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center text-gray-500">
        Đang tải lịch sử phiên bản đề bài...
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-4">
        <div className="p-4 bg-red-50 text-red-700 rounded-xl font-bold">
          {error || 'Không tìm thấy bài tập'}
        </div>
        <Link href="/teacher/assignments" className="text-brand-blue font-bold text-sm">
          ← Quay lại danh sách bài tập
        </Link>
      </div>
    );
  }

  const versions = assignment.versions || [];
  const submissions = assignment.submissions || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-gray-500">
        <Link href="/teacher/assignments" className="hover:text-brand-blue">
          ← Danh sách bài tập
        </Link>
        <span>/</span>
        <span className="text-brand-dark">{assignment.title}</span>
        <span>/</span>
        <span className="text-brand-blue font-bold">Lịch sử phiên bản</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-brand-dark">Lịch Sử Phiên Bản Đề Bài</h1>
            <Badge variant="warning">Version {assignment.version} (Hiện tại)</Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Lớp: <span className="font-bold text-gray-700">{assignment.className}</span> • Kỹ năng:{' '}
            <span className="font-bold uppercase text-brand-blue">{assignment.skill}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => setShowEditModal(true)} className="shadow-sm">
            + Sửa đề (Tạo Version {assignment.version + 1})
          </Button>
          <Link href="/teacher/assignments">
            <Button variant="outline">Quay lại</Button>
          </Link>
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 font-bold text-sm">
          {successMsg}
        </div>
      )}

      <AssignmentAttachments assignmentId={assignmentId} version={assignment.version} />
      {/* Alert Banner */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
        <div className="flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <h3 className="font-bold text-sm text-amber-900">
              Quy tắc tính công bằng & Version Binding
            </h3>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
              Mỗi khi giáo viên sửa đề bài, hệ thống tự động tăng số hiệu Version và lưu lại bản sao lịch sử. Mọi bài nộp của học sinh sẽ được gắn chặt với Version tương ứng tại thời điểm nộp để giáo viên đối chiếu chính xác khi chấm điểm.
            </p>
          </div>
        </div>
      </div>

      {/* Timeline of Versions */}
      <div className="space-y-6 mb-8">
        <h2 className="text-lg font-bold text-brand-dark">
          Các phiên bản đã phát hành ({versions.length})
        </h2>

        {versions.length === 0 ? (
          <Card className="p-6 text-gray-500 text-sm">Chưa có lịch sử phiên bản nào.</Card>
        ) : (
          versions.map((v: any) => {
            let difficulty: any = null;
            try { difficulty = JSON.parse(v.difficultyJson || 'null'); } catch { /* old versions have no assessment */ }
            const isCurrent = v.version === assignment.version;
            const subsForThisVersion = submissions.filter((s: any) => s.versionId === v.version);

            return (
              <Card
                key={v.id || v.version}
                className={`p-6 border-2 transition-all ${
                  isCurrent ? 'border-brand-blue bg-blue-50/10' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2 mb-4">
                  <div className="flex items-center gap-3">
                    <Badge variant={isCurrent ? 'success' : 'neutral'}>
                      Version {v.version} {isCurrent ? '(Đang kích hoạt)' : '(Lịch sử)'}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Thời điểm: {new Date(v.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-brand-blue bg-blue-50 px-2.5 py-1 rounded-pill">
                      {subsForThisVersion.length} bài nộp theo version này
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase block">Tiêu đề:</span>
                    <p className="text-sm font-bold text-brand-dark">{v.title}</p>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase block">Hạn nộp:</span>
                    <p className="text-xs text-gray-700 font-semibold">{v.dueDate}</p>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase block">Nội dung đề bài:</span>
                    <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 font-mono leading-relaxed whitespace-pre-line">
                      {v.promptText}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase block">Ghi chú thay đổi:</span>
                    <p className="text-xs text-gray-600 italic">
                      {v.changeNotes || 'Không có ghi chú thêm.'}
                    </p>
                      <p className="text-xs text-gray-600 mt-2">{difficulty?.status === 'assessed' ? `Mức AI: ${difficulty.rating} điểm · ${difficulty.level} tham khảo · độ tin cậy ${difficulty.confidence}%. ${difficulty.rationale}` : 'Chưa có mức AI đánh giá; phiên bản này chưa tính vào điểm năng lực mới.'}</p>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal Edit / Bump Version */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-xl font-bold text-brand-dark">
                Sửa Đề Bài (Tạo Version {assignment.version + 1})
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateVersion} className="space-y-4">
              <fieldset disabled={isUpdating} className="space-y-4">
              <label className="block text-sm font-bold">Thêm tệp đính kèm<input aria-label="Thêm tệp đính kèm" type="file" multiple accept=".docx,.pdf,.md,.markdown,.html,.htm,.txt,.png,.jpg,.jpeg,.webp" onChange={e => setFiles(Array.from(e.target.files || []))} className="block w-full mt-2" /><span className="block text-xs font-normal mt-1">DOCX, PDF, MD, HTML, TXT, PNG, JPG, WebP · tối đa 5 tệp, tổng 2 MB mỗi lần lưu. Tệp cũ được giữ lại.</span></label>
              <label className="block text-sm font-bold">Thang điểm<input aria-label="Thang điểm" type="number" min="0.1" step="any" required value={editMaxScore} onChange={e => setEditMaxScore(Number(e.target.value))} className="block border rounded p-2" /></label>
              <label className="block text-sm"><input type="checkbox" checked={editAllowAi} onChange={e => setEditAllowAi(e.target.checked)} /> Cho phép AI Tutor</label>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Tiêu đề bài tập</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Hạn nộp mới</label>
                <input
                  type="text"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  placeholder="Ví dụ: 23:59 Chủ Nhật (15/10)"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Nội dung đề bài điều chỉnh</label>
                <textarea
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2 border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Lý do điều chỉnh / Ghi chú phiên bản</label>
                <input
                  type="text"
                  value={editChangeNotes}
                  onChange={(e) => setEditChangeNotes(e.target.value)}
                  placeholder="Ví dụ: Bổ sung gợi ý từ vựng và kéo dài hạn nộp thêm 2 ngày"
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  disabled={isUpdating}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? 'Đang cập nhật...' : `Lưu và Phát Hành Version ${assignment.version + 1}`}
                </Button>
              </div>
              </fieldset>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <Link href={`/teacher/grading`}>
          <Button variant="secondary">
            Xem danh sách bài nộp cần chấm
          </Button>
        </Link>
        <span className="text-xs text-gray-400">
          Chỉ giáo viên phụ trách lớp mới có quyền điều chỉnh và tạo phiên bản đề bài.
        </span>
      </div>
    </div>
  );
}

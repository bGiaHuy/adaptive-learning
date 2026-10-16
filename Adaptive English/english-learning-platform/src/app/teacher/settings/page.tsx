'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function TeacherSettingsPage() {
  const [aiTutorEnabled, setAiTutorEnabled] = useState(true);
  const [aiScope, setAiScope] = useState<'class' | 'assignment'>('class');
  const [allowStepHint, setAllowStepHint] = useState(true);
  const [aiPreGradeEnabled, setAiPreGradeEnabled] = useState(true);
  const [autoApproveJoin, setAutoApproveJoin] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/teacher/dashboard" className="text-sm font-bold text-gray-400 hover:text-brand-blue">
              ← Bảng điều khiển
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-bold text-brand-blue">Cài đặt giảng dạy</span>
          </div>
          <h1 className="text-3xl font-extrabold text-brand-dark">Cài Đặt Lớp Học & AI Tutor</h1>
          <p className="text-sm text-gray-500 mt-1">
            Cấu hình mức độ can thiệp của AI Tutor và thiết lập lớp học của bạn.
          </p>
        </div>

        <Button variant="primary" onClick={handleSave}>
          Lưu thay đổi
        </Button>
      </div>

      {savedSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-semibold animate-fadeIn">
          <span>✓ Đã lưu cấu hình thành công! (Mô phỏng lưu vào bộ nhớ cục bộ)</span>
        </div>
      )}

      {/* Pending Decision Notice from docs/ui-open-questions.md */}
      <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
        <div className="flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded">
                UI-Q-001 • Đang chờ duyệt thiết kế
              </span>
            </div>
            <p className="text-sm text-amber-900 mt-1 font-medium">
              Phạm vi bật/tắt AI Tutor: Đang đề xuất hỗ trợ cả 2 cấp độ: Cài đặt mặc định toàn lớp và công tắc ghi đè trên từng bài tập cụ thể.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1: AI Tutor in Classroom */}
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-brand-dark">AI Tutor trong Giờ Làm Bài</h2>
              <p className="text-sm text-gray-500 mt-1">
                Cho phép trợ lý ếch xanh hỗ trợ học sinh phương pháp Socratic định hướng (không cung cấp đáp án trực tiếp).
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={aiTutorEnabled}
                onChange={(e) => setAiTutorEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand-blue"></div>
            </label>
          </div>

          <div className={`space-y-4 ${!aiTutorEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Phạm vi áp dụng mặc định
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAiScope('class')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    aiScope === 'class'
                      ? 'border-brand-blue bg-blue-50/50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-bold text-sm text-brand-dark">Toàn bộ lớp học</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Áp dụng tự động cho tất cả bài tập được giao trong lớp.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAiScope('assignment')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    aiScope === 'assignment'
                      ? 'border-brand-blue bg-blue-50/50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-bold text-sm text-brand-dark">Tùy chọn theo từng bài</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Giáo viên sẽ tự quyết định bật hay tắt khi soạn từng đề bài riêng.
                  </div>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-brand-dark">Cho phép gợi ý định hướng từng bước</div>
                <div className="text-xs text-gray-500">
                  Học sinh có thể hỏi AI khi đang làm dở câu hỏi. Nếu tắt, AI chỉ xuất hiện giải thích lỗi sau khi bài được nộp.
                </div>
              </div>
              <input
                type="checkbox"
                checked={allowStepHint}
                onChange={(e) => setAllowStepHint(e.target.checked)}
                className="w-5 h-5 text-brand-blue rounded border-gray-300 focus:ring-brand-blue"
              />
            </div>
          </div>
        </Card>

        {/* Section 2: AI Pre-grading */}
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-brand-dark">AI Pre-Grading (Chấm Nháp Tự Động)</h2>
                <Badge variant="info">Dành cho Giáo viên</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Tự động phân tích bài viết Writing và phát âm Speaking theo tiêu chí CEFR ngay khi học sinh nộp bài, giúp giáo viên có cơ sở tham khảo trước khi nhập điểm chính thức.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={aiPreGradeEnabled}
                onChange={(e) => setAiPreGradeEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand-blue"></div>
            </label>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-600">
            📌 Điểm do AI Pre-grade đề xuất chỉ là bản nháp nội bộ cho Giáo viên xem. Học sinh <strong>chỉ nhìn thấy điểm chính thức</strong> sau khi Giáo viên duyệt hoặc tự chỉnh sửa và bấm &ldquo;Công bố kết quả&rdquo;.
          </div>
        </Card>

        {/* Section 3: Classroom Management */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-brand-dark mb-4">Quy Chế Tham Gia Lớp Học</h2>
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <div className="font-bold text-sm text-brand-dark">Tự động duyệt học sinh qua Mã Lớp (Class Code)</div>
              <div className="text-xs text-gray-500">
                Học sinh nhập đúng mã mời 6 ký tự sẽ được vào thẳng lớp học mà không cần chờ giáo viên phê duyệt thủ công.
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoApproveJoin}
              onChange={(e) => setAutoApproveJoin(e.target.checked)}
              className="w-5 h-5 text-brand-blue rounded border-gray-300 focus:ring-brand-blue"
            />
          </div>

          <div className="pt-4 flex items-center justify-between text-xs text-gray-500">
            <span>Dữ liệu được lưu trữ an toàn trong phạm vi phiên bản mô phỏng Prototype.</span>
            <Button variant="ghost" size="sm" onClick={() => alert('Đặt lại về mặc định demo.')}>
              Khôi phục mặc định
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

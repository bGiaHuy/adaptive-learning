"use client";

import React from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Sliders, Volume2, Eye, RotateCcw, Shield } from "lucide-react";

export default function StudentSettingsPage() {
  const { dailyVocabLimit, setDailyVocabLimit, reducedMotion, setReducedMotion } = useApp();

  const handleReset = () => {
    if (confirm("Đặt lại toàn bộ trạng thái tiến trình demo về ban đầu?")) {
      Object.keys(localStorage).filter(key => key.startsWith("adaptive_study_")).forEach(key => localStorage.removeItem(key));
      window.location.reload();
    }
  };

  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-4 md:px-6 py-8 md:py-10 space-y-8">
      <div className="border-b border-line pb-4">
        <h1 className="text-2xl md:text-3xl font-black text-ink tracking-tight flex items-center gap-2.5">
          <Sliders className="w-6 h-6 text-primary" /> Cài Đặt Ứng Dụng
        </h1>
        <p className="text-xs md:text-sm text-ink-muted">Tùy chỉnh trải nghiệm học tập, chuyển động và âm thanh.</p>
      </div>

      <div className="bg-white border-2 border-line rounded-lg p-6 space-y-6 shadow-soft">
        {/* Vocab Limit Setting */}
        <div className="space-y-3 border-b border-line pb-6">
          <h2 className="text-base font-bold text-ink">Hạn mức từ mới mỗi ngày</h2>
          <p className="text-xs text-ink-muted">
            Mức nạp từ mới khuyến nghị là 10 từ/ngày để đảm bảo bạn không bị quá tải ôn tập về sau.
          </p>
          <div className="flex flex-wrap gap-2">
            {[5, 10, 20].map((opt) => (
              <button
                key={String(opt)}
                type="button"
                onClick={() => setDailyVocabLimit(opt as any)}
                className={`px-3 py-1.5 rounded-pill text-xs font-bold border transition-colors ${
                  dailyVocabLimit === opt
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-[#F8FAFF] border-line text-ink-muted hover:border-primary"
                }`}
              >
                {opt === 10 ? "10 từ (Khuyến nghị)" : String(opt)}
              </button>
            ))}
          </div>
        </div>

        {/* Accessibility & Reduced Motion */}
        <div className="space-y-3 border-b border-line pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-ink flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" /> Chế độ giảm chuyển động (Reduced Motion)
              </h2>
              <p className="text-xs text-ink-muted">
                Tự động thay thế mascot hoạt họa động bằng hình ảnh vector tĩnh và giảm thiểu hiệu ứng chuyển cảnh.
              </p>
            </div>
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
              className="w-5 h-5 rounded border-line text-primary focus:ring-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Reset Data */}
        <div className="pt-2 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-ink">Đặt lại dữ liệu trên thiết bị</h2>
            <p className="text-xs text-ink-muted">Xoá toàn bộ nháp và tiến trình tạm lưu trên trình duyệt của thiết bị này.</p>
          </div>
          <Button variant="danger" size="sm" onClick={handleReset}>
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Đặt lại dữ liệu
          </Button>
        </div>
      </div>
    </main>
  );
}

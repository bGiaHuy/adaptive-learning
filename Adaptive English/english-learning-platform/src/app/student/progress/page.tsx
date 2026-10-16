"use client";

import React from "react";
import { useApp } from "@/lib/store";
import { SkillRadar } from "@/components/ui/SkillRadar";
import { BarChart3, AlertCircle } from "lucide-react";

export default function StudentProgressPage() {
  const { skillEstimates, progressStats } = useApp();
  const totalEvidence = Object.values(skillEstimates).reduce((sum, estimate) => sum + estimate.evidenceCount, 0);

  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-6 py-8 md:py-10 space-y-10">
      <div className="border-b border-line pb-6">
        <h1 className="text-3xl font-black text-ink tracking-tight">Hồ Sơ Năng Lực Học Tập (Learning Profile)</h1>
        <p className="text-xs md:text-sm text-ink-muted">
          Bằng chứng ban đầu theo kỹ năng. Thang CEFR và cách hiệu chỉnh cần được duyệt, kiểm chứng.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border-2 border-line rounded-lg p-5 space-y-1 shadow-sm">
          <span className="text-xs font-bold text-ink-muted uppercase">Bằng chứng đã ghi nhận</span>
          <span className="text-3xl font-black text-primary font-mono block">{totalEvidence} lượt</span>
          <span className="text-[11px] text-ink-muted">Từ placement, bài tự học, bài lớp và lượt ôn từ.</span>
        </div>

        <div className="bg-white border-2 border-line rounded-lg p-5 space-y-1 shadow-sm">
          <span className="text-xs font-bold text-ink-muted uppercase">Từ vựng đã ôn</span>
          <span className="text-3xl font-black text-success font-mono block">{progressStats.reviewedVocabCount} từ</span>
          <span className="text-[11px] text-ink-muted">{progressStats.vocabReviewCount} lượt ôn · {progressStats.masteredVocabCount} từ đã mastered</span>
        </div>

        <div
          className="bg-white border-2 border-line rounded-lg p-5 space-y-1 shadow-sm"
          style={{ fontFamily: "Calibri, Arial, sans-serif" }}
        >
          <span className="text-xs font-bold text-ink-muted uppercase">Phiên tự học đã lưu</span>
          <span className="text-3xl font-black text-ink block">{progressStats.totalLessonAttempts}</span>
          <span className="text-[11px] text-ink-muted">{progressStats.submissionsCount} bài lớp đã nộp · {progressStats.gradedCount} bài đã chấm</span>
        </div>
      </div>

      <SkillRadar />

      {/* Multi-skill CEFR Breakdown Table / Grid */}
      <div className="bg-white border-2 border-line rounded-lg p-6 md:p-8 shadow-soft space-y-6">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <h2 className="text-lg font-black text-ink flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" /> Chi tiết dữ liệu thực tế theo kỹ năng
          </h2>
          <span className="text-xs px-2.5 py-0.5 rounded-pill bg-[#EAF2FF] text-primary-dark font-bold">
            Theo tài khoản hiện tại
          </span>
        </div>

        <div className="space-y-4">
          {Object.entries(skillEstimates).map(([skillKey, est]) => (
            <div key={skillKey} className="p-4 rounded-md border border-line bg-[#F8FAFF] space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-ink capitalize">{skillKey}</span>
                  <span className={`px-2 py-0.5 rounded-pill font-bold text-xs ${
                    est.evaluated ? "bg-[#EAF2FF] text-primary-dark" : "bg-line text-ink-muted"
                  }`}>
                    {est.scoreDisplay}
                  </span>
                </div>
                <div className="text-xs text-ink-muted">
                  Bằng chứng ghi nhận: <strong className="text-ink">{est.evidenceCount} lượt</strong>
                </div>
              </div>

              {est.evaluated ? (
                <p className="text-xs text-ink-muted font-medium">
                  {est.independentRate > 0 ? `Tỷ lệ tự làm không dùng gợi ý: ${est.independentRate}%` : "Điểm được tổng hợp từ dữ liệu đã chấm."}
                </p>
              ) : (
                <p className="text-xs text-ink-muted italic flex items-center gap-1.5 pt-1">
                  <AlertCircle className="w-3.5 h-3.5 text-warning shrink-0" />
                  {est.evidenceCount > 0
                    ? "Đã ghi nhận hoạt động thật nhưng chưa có điểm đủ tin cậy để suy ra CEFR."
                    : "Chưa có hoạt động thực tế cho kỹ năng này."}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

    </main>
  );
}

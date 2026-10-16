"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Sparkles, CheckCircle2, Save, AlertCircle, ShieldAlert } from "lucide-react";

export default function WritingWorkspacePage() {
  const params = useParams();
  const draftKey = `adaptive_study_writing_${params.id}`;
  const [essayText, setEssayText] = useState("");
  const [saveStatus, setSaveStatus] = useState("Đã lưu nháp tự động");
  const [isAiEvaluating, setIsAiEvaluating] = useState(false);
  const [evalMode, setEvalMode] = useState<"auto" | "rule-based" | "demo">("auto");
  const [evalResult, setEvalResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load draft from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) setEssayText(saved);
    } catch {}
  }, [draftKey]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setEssayText(val);
    setSaveStatus("Đang lưu nháp...");
    try {
      localStorage.setItem(draftKey, val);
      setTimeout(() => setSaveStatus("Đã lưu nháp trên thiết bị này"), 500);
    } catch {
      setSaveStatus("Không thể lưu nháp");
    }
  };

  const wordCount = essayText.trim() === "" ? 0 : essayText.trim().split(/\s+/).length;

  const handleEvaluateAi = async () => {
    if (wordCount < 10) {
      setErrorMessage("Bài viết quá ngắn (dưới 10 từ). Vui lòng viết thêm nội dung trước khi yêu cầu đánh giá.");
      return;
    }

    setIsAiEvaluating(true);
    setErrorMessage(null);
    setEvalResult(null);

    try {
      const res = await fetch("/api/ai/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill: "writing",
          content: essayText,
          mode: evalMode,
        }),
      });

      const data = await res.json();

      if (res.status === 403) {
        setEvalResult({
          status: "blocked",
          badge: "Bị khóa bởi Giáo viên",
          reason: data.reason || "Giáo viên đã tắt tính năng trợ lý AI cho bài học này.",
        });
      } else if (data.blocked) {
        setEvalResult(data.result);
      } else if (data.success) {
        setEvalResult(data.result);
      } else {
        throw new Error(data.error || "Không thể phân tích bài viết.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Xảy ra lỗi kết nối khi gọi AI đánh giá.");
    } finally {
      setIsAiEvaluating(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between">
      <header className="bg-white border-b border-line px-4 md:px-6 py-3.5 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <Link href="/student/learn" className="flex items-center gap-2 text-xs font-bold text-ink-muted hover:text-ink">
            <ArrowLeft className="w-4 h-4" /> Quay lại kho bài học
          </Link>
          <span className="font-extrabold text-sm text-ink truncate">Writing Workspace: Task 2 Essay</span>
          <span className="text-xs px-2.5 py-0.5 rounded-pill bg-[#EAF2FF] text-primary-dark font-bold">
            Academic Writing Lab
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full px-4 md:px-6 py-8 md:py-10 space-y-6 flex-1">
        {/* Essay Prompt Card */}
        <div className="bg-white border-2 border-line rounded-lg p-6 shadow-sm space-y-3">
          <span className="text-xs font-extrabold text-primary uppercase tracking-wider block">
            IELTS Writing Task 2 Prompt (Yêu cầu bài viết):
          </span>
          <h2 className="text-base md:text-lg font-bold text-ink leading-relaxed">
            "Some people believe that unpaid community service should be a compulsory part of high school programmes. To what extent do you agree or disagree? Write at least 250 words."
          </h2>
          <div className="flex items-center gap-3 text-xs text-ink-muted pt-1">
            <span>Tiêu chuẩn tối thiểu: <strong>250 từ</strong></span>
            <span>•</span>
            <span>Thời gian khuyến nghị: <strong>40 phút</strong></span>
          </div>
        </div>

        {/* Editor Area */}
        <div className="bg-white border-2 border-line rounded-lg p-6 shadow-soft space-y-3">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-line">
            <div className="flex items-center gap-2 text-ink-muted">
              <Save className="w-3.5 h-3.5 text-primary" />
              <span>{saveStatus}</span>
            </div>
            <div className="font-mono font-bold text-ink">
              Số từ: <span className={wordCount >= 250 ? "text-success font-black" : "text-primary"}>{wordCount}</span> / 250 từ
            </div>
          </div>

          <textarea
            rows={14}
            value={essayText}
            onChange={handleTextChange}
            placeholder="Bắt đầu viết bài luận của bạn tại đây (In recent decades, the debate surrounding...)..."
            className="w-full p-4 rounded-md border-2 border-line text-sm md:text-base leading-relaxed text-ink focus:border-primary focus:outline-none resize-y font-sans"
          />

          {errorMessage && (
            <div className="p-3 bg-error-soft border-l-4 border-error text-xs text-ink rounded-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Chọn chế độ đánh giá */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-line text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-ink">Chế độ AI</span>
            </div>

            <Button
              type="button"
              disabled={wordCount < 10 || isAiEvaluating}
              isLoading={isAiEvaluating}
              onClick={handleEvaluateAi}
              className="shadow-tactile w-full sm:w-auto"
            >
              <Sparkles className="w-4 h-4 mr-1.5" /> Yêu cầu AI Đánh giá
            </Button>
          </div>
        </div>

        {/* AI Evaluation Result */}
        {evalResult && (
          <div>
            {evalResult.isBlocked || evalResult.status === "blocked" ? (
              <div className="p-5 bg-warning-soft border-2 border-warning rounded-md space-y-3">
                <div className="flex items-center gap-2 text-warning font-black text-sm">
                  <ShieldAlert className="w-5 h-5" /> TÍNH NĂNG ĐÁNH GIÁ BỊ KHÓA
                </div>
                <p className="text-xs text-ink font-medium leading-relaxed">
                  {evalResult.reason || "Chưa cấu hình API Key AI (GEMINI_API_KEY). Hệ thống từ chối trả điểm giả mạo như kết quả thật."}
                </p>
              </div>
            ) : (
              <div className="bg-white border-2 border-primary/50 rounded-lg p-6 md:p-8 shadow-panel space-y-5 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <h3 className="font-black text-lg text-ink">Kết Quả Đánh Giá Văn Bản (Writing Assessment)</h3>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-pill font-extrabold ${
                    evalResult.source === "real"
                      ? "bg-purple-100 text-purple-700 border border-purple-300"
                      : evalResult.source === "rule-based"
                      ? "bg-blue-100 text-blue-700 border border-blue-300"
                      : "bg-amber-100 text-amber-700 border border-amber-300"
                  }`}>
                    {evalResult.badge || "Do AI đánh giá"}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-surface rounded-md border border-line text-center">
                    <span className="text-ink-muted block text-[11px]">Task Achievement</span>
                    <span className="font-mono font-bold text-primary text-base">
                      {evalResult.rubric?.taskAchievementOrCoherence || 6.0}
                    </span>
                  </div>
                  <div className="p-3 bg-surface rounded-md border border-line text-center">
                    <span className="text-ink-muted block text-[11px]">Coherence & Cohesion</span>
                    <span className="font-mono font-bold text-primary text-base">
                      {evalResult.rubric?.taskAchievementOrCoherence || 6.0}
                    </span>
                  </div>
                  <div className="p-3 bg-surface rounded-md border border-line text-center">
                    <span className="text-ink-muted block text-[11px]">Lexical Resource</span>
                    <span className="font-mono font-bold text-primary text-base">
                      {evalResult.rubric?.lexicalResource || 6.0}
                    </span>
                  </div>
                  <div className="p-3 bg-surface rounded-md border border-line text-center">
                    <span className="text-ink-muted block text-[11px]">Grammatical Range</span>
                    <span className="font-mono font-bold text-primary text-base">
                      {evalResult.rubric?.grammarAccuracy || 6.0}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-[#F8FAFF] rounded-md border border-line text-xs space-y-2">
                  <strong className="text-ink block">Nhận xét tổng quát:</strong>
                  <p className="text-ink-muted leading-relaxed">{evalResult.summary}</p>
                  {evalResult.strengthPoints?.length > 0 && (
                    <div className="pt-2">
                      <span className="font-bold text-success">Điểm tích cực:</span>
                      <ul className="list-disc pl-4 text-ink-muted space-y-0.5 pt-1">
                        {evalResult.strengthPoints.map((pt: string, idx: number) => (
                          <li key={idx}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {evalResult.weaknessPoints?.length > 0 && (
                    <div className="pt-2">
                      <span className="font-bold text-warning">Điểm cần cải thiện:</span>
                      <ul className="list-disc pl-4 text-ink-muted space-y-0.5 pt-1">
                        {evalResult.weaknessPoints.map((pt: string, idx: number) => (
                          <li key={idx}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Link href="/student/home">
                    <Button variant="outline" size="md">
                      Lưu bài và quay lại Trang Chủ
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { Mascot, MascotMood } from "./Mascot";

export interface AITutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  promptText?: string;
  hintText?: string;
  explanationText?: string;
  hasAnswered?: boolean;
  isCorrect?: boolean;
  canRevealAnswer?: boolean;
  skill?: string;
  userCurrentText?: string;
  assignmentId?: string;
  classId?: string;
}

export function AITutorDrawer({
  isOpen,
  onClose,
  promptText,
  hintText,
  explanationText,
  hasAnswered = false,
  isCorrect = false,
  canRevealAnswer = true,
  skill = "general",
  userCurrentText,
  assignmentId,
  classId,
}: AITutorDrawerProps) {
  const drawerRef = useRef<HTMLElement>(null);
  const [aiResponse, setAiResponse] = useState<{ hint: string; encouragement: string; source: string } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [retry, setRetry] = useState(0);
  const showExplanation = hasAnswered && canRevealAnswer;
  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    setAiResponse(null);
    setAiError(null);
    setIsLoading(true);
    const loadHint = async () => {
      try {
        const response = await fetch("/api/ai/tutor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skill, questionPrompt: promptText || hintText || "Hướng dẫn cách tự học tiếng Anh.", userCurrentText,
            lessonStatus: showExplanation ? "review" : "in_progress", canViewAnswers: showExplanation,
            ...(showExplanation ? { correctAnswer: explanationText } : {}), assignmentId, classId }),
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.reason || data.error || "Chưa nhận được gợi ý AI.");
        if (!controller.signal.aborted) setAiResponse({ hint: data.hint, encouragement: data.encouragement, source: data.source });
      } catch (error) {
        if (!controller.signal.aborted) setAiError(error instanceof Error ? error.message : "Không kết nối được trợ lý AI.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    void loadHint();
    return () => controller.abort();
  }, [isOpen, skill, promptText, hintText, explanationText, userCurrentText, showExplanation, assignmentId, classId, retry]);
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const first = drawerRef.current?.querySelector<HTMLElement>("button");
    first?.focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = drawerRef.current?.querySelectorAll<HTMLElement>('button, a[href], input, textarea, select, [tabindex="0"]');
      if (!items?.length) return;
      if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items[items.length - 1].focus(); }
      else if (!event.shiftKey && document.activeElement === items[items.length - 1]) { event.preventDefault(); items[0].focus(); }
    };
    document.addEventListener("keydown", trap);
    return () => { document.removeEventListener("keydown", trap); previous?.focus(); };
  }, [isOpen]);
  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  let mood: MascotMood = "explaining";
  if (!hasAnswered) {
    mood = "thinking";
  } else if (hasAnswered && isCorrect) {
    mood = "celebrate";
  } else if (hasAnswered && !isCorrect) {
    mood = "encouraging";
  }

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-ink/30 backdrop-blur-sm z-40 transition-opacity"
      />

      {/* Drawer Container */}
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="AI Tutor Leaf AI"
        className="fixed bottom-0 left-0 right-0 max-h-[85vh] md:max-h-none md:bottom-6 md:right-6 md:left-auto md:w-[400px] bg-white border border-line rounded-t-lg md:rounded-lg shadow-panel z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line bg-[#F8FAFF]">
          <div className="flex items-center gap-3">
            <img
              src="/assets/mascot/avatar.svg"
              alt="AI Frog Avatar"
              className="w-9 h-9 rounded-full bg-[#EAF2FF] p-0.5 border border-primary/20"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm text-ink">AI Leaf AI</h3>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF2FF] text-primary">
                  <Sparkles className="w-2.5 h-2.5 mr-0.5" /> Context-Aware
                </span>
              </div>
              <p className="text-[11px] text-ink-muted">Hướng dẫn tư duy · Không làm bài hộ</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Đóng AI Tutor"
            className="w-8 h-8 rounded-full flex items-center justify-center text-ink-muted hover:text-ink hover:bg-line/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 max-h-[60vh] md:max-h-[500px]">
          {/* Mascot with mood */}
          <div className="flex justify-center py-2 bg-gradient-to-b from-[#F0F5FF]/60 to-transparent rounded-md">
            <Mascot mood={mood} size="avatar" />
          </div>

          {/* Scaffolding Guidance */}
          {isLoading && <p role="status" className="flex items-center gap-2 text-sm text-ink-muted"><Loader2 className="w-4 h-4 animate-spin" /> AI đang đọc câu hỏi và tạo gợi ý…</p>}
          {aiError && <div role="alert" className="space-y-2 text-sm text-ink-muted"><p>{aiError}</p><button type="button" onClick={() => setRetry(value => value + 1)} className="text-primary font-bold underline">Thử lại</button></div>}
          {!isLoading && !aiError && !showExplanation && (
            <div className="space-y-3">
              <div className="p-3.5 bg-[#EDF4FF] rounded-sm border-l-4 border-primary text-xs md:text-sm text-ink leading-relaxed">
                <strong className="block text-primary-dark font-bold mb-1">Gợi ý phương pháp (Scaffolding):</strong>
                {aiResponse?.hint || hintText || "Quan sát kỹ các từ khóa trong câu và ngữ cảnh ngữ pháp của chủ ngữ."}
              </div>
              <p className="text-xs text-ink-muted italic">
                * AI Tutor chỉ đưa ra câu hỏi gợi mở hoặc nguyên tắc ngữ pháp. Hãy tự chọn đáp án để rèn luyện phản xạ nhé!
              </p>
            </div>
          )}

          {/* Formative Feedback when answered */}
          {!isLoading && !aiError && showExplanation && (
            <div className="space-y-3">
              <div
                className={`p-3.5 rounded-sm border-l-4 text-xs md:text-sm leading-relaxed ${
                  isCorrect
                    ? "bg-success-soft border-success text-[#185932]"
                    : "bg-error-soft border-error text-[#8B2535]"
                }`}
              >
                <strong className="block font-bold mb-1">
                  {isCorrect ? "Tuyệt vời! Giải thích chi tiết:" : "Chưa chính xác! Cùng phân tích bẫy tư duy:"}
                </strong>
                {aiResponse?.hint || explanationText || "Xem xét lại thì của câu và sự hòa hợp giữa chủ ngữ và động từ."}
              </div>
            </div>
          )}

          {/* System Note */}
          {aiResponse?.encouragement && <p className="text-xs text-ink-muted">{aiResponse.encouragement}</p>}
          <div className="flex items-start gap-2 pt-2 border-t border-line/60 text-[11px] text-ink-muted">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-primary mt-0.5" />
            <span>{aiResponse?.source === "real" ? "Gợi ý từ AI. Hãy đối chiếu với nội dung bài học." : aiResponse ? "Gợi ý theo quy tắc sư phạm." : "Trợ lý hướng dẫn theo ngữ cảnh bài."} {hasAnswered && !canRevealAnswer ? "Bài này chưa cho phép xem lời giải." : ""}</span>
          </div>
        </div>
      </aside>
    </>
  );
}

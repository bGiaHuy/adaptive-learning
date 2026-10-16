"use client";

import React, { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { OptionCard } from "@/components/ui/OptionCard";
import { AudioPlayer } from "@/components/ui/AudioPlayer";
import {
  X,
  ArrowRight,
  Loader2,
  RotateCcw,
  Mic,
  Square,
  Play,
  CheckCircle2,
  PenLine,
  Headphones,
  BookOpen,
  Layers,
  BookMarked,
} from "lucide-react";

import { placementQuestions } from "@/lib/placementQuestions";

// ── Section icon map ───────────────────────────────────────────────────────────
const sectionIcons: Record<string, React.ElementType> = {
  reading: BookOpen,
  listening: Headphones,
  grammar: Layers,
  vocabulary: BookMarked,
  writing: PenLine,
  speaking: Mic,
};

// ── Simple inline speaking recorder for placement test ────────────────────────
function PlacementSpeakingRecorder({
  onRecorded,
  existingUrl,
}: {
  onRecorded: (url: string) => void;
  existingUrl: string;
}) {
  const [status, setStatus] = useState<"idle" | "recording" | "done">(
    existingUrl ? "done" : "idle"
  );
  const [audioUrl, setAudioUrl] = useState<string>(existingUrl);
  const [duration, setDuration] = useState(0);
  const [permErr, setPermErr] = useState<string | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef=useRef(true);
  const startingRef=useRef(false);

  const stopCleanup = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => { try { t.stop(); } catch {} });
    streamRef.current = null;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  React.useEffect(()=>{mountedRef.current=true;return ()=>{mountedRef.current=false;if(mediaRef.current){mediaRef.current.onstop=null;if(mediaRef.current.state==='recording')mediaRef.current.stop();}stopCleanup();};},[stopCleanup]);
  const startRecording = async () => {
    if(startingRef.current)return;startingRef.current=true;
    setPermErr(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if(!mountedRef.current){stream.getTracks().forEach(t=>t.stop());return;}
      streamRef.current = stream;
      chunksRef.current = [];
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);

      const mimeType=['audio/webm;codecs=opus','audio/mp4','audio/ogg;codecs=opus'].find(type=>MediaRecorder.isTypeSupported(type));
      const mr = new MediaRecorder(stream,mimeType?{mimeType}:undefined);
      mediaRef.current = mr;
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        stopCleanup();
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || chunksRef.current[0]?.type || "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setStatus("done");
        onRecorded(url);
      };
      mr.onerror=()=>{stopCleanup();setPermErr('Ghi âm bị gián đoạn. Hãy thử lại.');setStatus('idle');};
      mr.start();
      setStatus("recording");
    } catch (err: any) {
      stopCleanup();
      if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
        setPermErr("Trình duyệt chưa cấp quyền micro. Vui lòng cho phép và thử lại.");
      } else {
        setPermErr("Không khởi động được micro. Hãy thử trình duyệt khác.");
      }
    } finally {startingRef.current=false;}
  };

  const stopRecording = () => {
    if(mediaRef.current?.state==='recording')mediaRef.current.stop();
  };

  const reRecord = () => {
    setAudioUrl("");
    setStatus("idle");
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="space-y-4">
      {permErr && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {permErr}
        </div>
      )}

      {status === "idle" && (
        <button
          type="button"
          onClick={startRecording}
          className="flex items-center gap-3 px-6 py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-colors shadow-tactile w-full justify-center"
        >
          <Mic className="w-5 h-5" />
          Bắt đầu ghi âm
        </button>
      )}

      {status === "recording" && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border-2 border-red-200">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse shrink-0" />
            <span className="font-bold text-red-700 text-sm flex-1">Đang ghi âm...</span>
            <span className="font-mono text-red-600 text-sm font-bold">{fmt(duration)}</span>
          </div>
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-2 px-5 py-3 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition-colors w-full justify-center"
          >
            <Square className="w-4 h-4" />
            Dừng ghi âm
          </button>
        </div>
      )}

      {status === "done" && audioUrl && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success-soft border border-success/20">
            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            <span className="text-xs font-bold text-success">Đã ghi âm thành công!</span>
          </div>
          <audio src={audioUrl} controls className="w-full rounded-lg" />
          <button
            type="button"
            onClick={reRecord}
            className="flex items-center gap-2 text-xs text-ink-muted hover:text-ink font-bold px-3 py-2 rounded-lg hover:bg-canvas transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Ghi âm lại
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Placement Test Page ──────────────────────────────────────────────────
export default function PlacementTestPage() {
  const router = useRouter();
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const {
    placementTest,
    updatePlacementAnswer,
    updatePlacementWriting,
    updatePlacementSpeaking,
    completePlacementTest,
    setPlacementStep,
    storageError,
    placementSyncError,
    hydrated,
  } = useApp();

  // Single-attempt rule
  React.useEffect(() => {
    if (hydrated && placementTest.completed) {
      router.replace("/student/placement-test/result");
    }
  }, [hydrated, placementTest.completed, router]);

  const currentIndex = Math.min(
    placementQuestions.length - 1,
    Math.max(0, placementTest.currentStep - 1)
  );
  const setCurrentIndex = (index: number) => setPlacementStep(index + 1);
  const currentQ = placementQuestions[currentIndex];
  const sectionQuestions = placementQuestions.filter((q) => q.section === currentQ.section);
  const sectionQuestionNumber =
    sectionQuestions.findIndex((q) => q.id === currentQ.id) + 1;

  const hasPriorProgress =
    placementTest.currentStep > 1 ||
    Object.keys(placementTest.readingAnswers).length > 0;

  // Determine selected / saved answer for current question
  const currentAnswers =
    currentQ.section === "reading"
      ? placementTest.readingAnswers || {}
      : currentQ.section === "listening"
      ? placementTest.listeningAnswers || {}
      : currentQ.section === "vocabulary"
      ? placementTest.vocabAnswers || (placementTest as any).vocabularyAnswers || {}
      : placementTest.grammarAnswers || {};

  const selectedAnswer =
    currentQ.taskType === "mcq" || !currentQ.taskType
      ? currentAnswers[currentQ.id]
      : undefined;

  const handleSelectOption = (optId: string) => {
    updatePlacementAnswer(
      currentQ.section as "reading" | "listening" | "grammar" | "vocabulary",
      currentQ.id,
      optId
    );
  };

  // Writing / Speaking "answered" check
  const writingFilled = (placementTest.writingAnswer || "").trim().length >= 10;
  const speakingDone = !!placementTest.speakingBlobUrl;

  const isCurrentAnswered =
    currentQ.taskType === "writing"
      ? writingFilled
      : currentQ.taskType === "speaking"
      ? speakingDone
      : !!selectedAnswer;

  const handleNext = async () => {
    if (currentIndex < placementQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCompletionError(null);
      setIsCompleting(true);
      const saved = await completePlacementTest();
      setIsCompleting(false);
      if (!saved) {
        setCompletionError('Chưa lưu được kết quả vào máy chủ. Vui lòng kiểm tra mạng rồi thử lại.');
        return;
      }
      router.push("/student/placement-test/result");
    }
  };

  const progressPercent = ((currentIndex + 1) / placementQuestions.length) * 100;
  const SectionIcon = sectionIcons[currentQ.section] || Layers;
  const isLastQuestion = currentIndex === placementQuestions.length - 1;

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <p className="text-xs text-ink-muted">Đang tải bài kiểm tra đầu vào...</p>
      </div>
    );
  }

  if (placementTest.completed) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <h2 className="text-lg font-bold text-ink">Bạn đã hoàn thành bài kiểm tra đầu vào</h2>
        <p className="text-xs text-ink-muted">
          Mỗi tài khoản chỉ thực hiện bài test đầu vào một lần duy nhất. Đang chuyển đến bảng kết
          quả năng lực...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between">
      {/* Top Bar */}
      <header className="bg-white border-b border-line px-4 md:px-6 py-3.5 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push("/student/home")}
            className="p-1.5 rounded-full hover:bg-[#F6F9FF] text-ink-muted hover:text-ink transition-colors"
            title="Thoát và lưu dở"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Progress */}
          <div className="flex-1 max-w-md mx-auto space-y-1">
            <div className="flex justify-between text-xs font-bold text-ink-muted">
              <span className="flex items-center gap-1">
                <SectionIcon className="w-3.5 h-3.5" />
                {currentQ.sectionTitle}
              </span>
              <span className="shrink-0">
                {currentIndex + 1} / {placementQuestions.length}
              </span>
            </div>
            <div className="h-2 w-full bg-line rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-fast rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasPriorProgress && currentIndex > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-primary px-2.5 py-1 rounded-pill bg-[#EAF2FF]">
                <RotateCcw className="w-3 h-3" /> Đang tiếp tục phiên trước
              </span>
            )}
            <span className="text-[11px] font-bold text-success px-2.5 py-1 rounded-pill bg-success-soft">
              {storageError ? "Chưa lưu được trên trình duyệt — giữ trang mở" : placementSyncError ? "Chưa đồng bộ lên máy chủ — thử lưu lại" : "Tự động lưu khi trả lời"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Question Area */}
      <main
        data-study-question-id={currentQ.id}
        className="max-w-3xl mx-auto w-full px-4 md:px-6 py-8 md:py-12 space-y-8 flex-1"
      >
        {completionError && (
          <div role="alert" className="p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700 font-medium">
            {completionError}
          </div>
        )}
        {/* Reading passage */}
        {currentQ.passage && (
          <div className="p-5 md:p-6 bg-white border-2 border-line rounded-md text-sm md:text-base leading-relaxed text-ink shadow-sm">
            <span className="text-xs font-extrabold text-primary uppercase tracking-wider block mb-2">
              Đoạn văn đọc hiểu:
            </span>
            {currentQ.passage}
          </div>
        )}

        {/* Listening audio player */}
        {currentQ.hasAudio && (
          <div className="mb-6">
            <AudioPlayer
              key={currentQ.id}
              src={currentQ.audioUrl || "/audio/placement-test-dialogue.mp3"}
              title={`Bài nghe: ${currentQ.prompt.slice(0, 40)}...`}
            />
          </div>
        )}

        {/* Question prompt & task guide */}
        <div className="space-y-2">
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#EAF2FF] text-primary text-xs font-extrabold">
            Câu {sectionQuestionNumber} / {sectionQuestions.length} trong phần này
          </span>
          <h2 className="text-lg md:text-xl font-bold text-ink leading-snug whitespace-pre-line">
            {currentQ.prompt}
          </h2>
          {currentQ.taskGuide && (
            <p className="text-xs text-ink-muted font-medium">{currentQ.taskGuide}</p>
          )}
        </div>

        {/* MCQ options */}
        {(currentQ.taskType === "mcq" || !currentQ.taskType) && currentQ.options && (
          <div className="space-y-3">
            {currentQ.options.map((opt) => (
              <OptionCard
                key={opt.id}
                id={opt.id}
                prefix={opt.id}
                label={opt.text}
                selected={selectedAnswer === opt.id}
                onClick={() => handleSelectOption(opt.id)}
              />
            ))}
          </div>
        )}

        {/* Writing textarea */}
        {currentQ.taskType === "writing" && (
          <div className="space-y-3">
            <textarea
              className="w-full min-h-[180px] p-4 rounded-xl border-2 border-line bg-white text-sm text-ink leading-relaxed resize-y focus:outline-none focus:border-primary transition-colors placeholder:text-ink-muted/60"
              placeholder="Write your paragraph here in English…"
              value={placementTest.writingAnswer}
              onChange={(e) => updatePlacementWriting(e.target.value)}
              spellCheck
            />
            <div className="flex justify-between text-xs text-ink-muted font-medium">
              <span>
                {placementTest.writingAnswer.trim().split(/\s+/).filter(Boolean).length} từ
              </span>
              <span className={writingFilled ? "text-success font-bold" : ""}>
                {writingFilled ? "✓ Đủ nội dung để tiếp tục" : "Tối thiểu ~10 từ để tiếp tục"}
              </span>
            </div>
          </div>
        )}

        {/* Speaking recorder */}
        {currentQ.taskType === "speaking" && (
          <div className="p-5 bg-white border-2 border-line rounded-xl shadow-soft space-y-4">
            <div className="text-xs text-ink-muted leading-relaxed">
              <strong className="text-ink">Hướng dẫn:</strong> Nhấn{" "}
              <strong>Bắt đầu ghi âm</strong>, đợi micro sáng rồi trả lời bằng tiếng Anh theo các
              câu hỏi trên. Bạn có thể ghi lại nếu chưa ưng.
            </div>
            <PlacementSpeakingRecorder
              onRecorded={(url) => updatePlacementSpeaking(url)}
              existingUrl={placementTest.speakingBlobUrl}
            />
            {!speakingDone && (
              <p className="text-xs text-ink-muted italic">
                Nếu không có micro, bạn có thể bỏ qua phần này và hoàn thành bài test.
              </p>
            )}
          </div>
        )}
      </main>

      {/* Bottom Action Bar */}
      <footer className="bg-white border-t border-line py-4 px-4 md:px-6 sticky bottom-0 z-30">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(currentIndex - 1)}
            className="text-xs md:text-sm font-bold text-ink-muted hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Câu trước
          </button>

          <div className="flex items-center gap-2">
            {/* Speaking can be skipped */}
            {currentQ.taskType === "speaking" && !speakingDone && (
              <button
                type="button"
                onClick={handleNext}
                className="text-xs font-bold text-ink-muted hover:text-ink px-3 py-2 rounded-lg hover:bg-canvas transition-colors"
              >
                Bỏ qua
              </button>
            )}

            <Button
              size="lg"
              disabled={isCompleting || (!isCurrentAnswered && currentQ.taskType !== "speaking")}
              onClick={handleNext}
              className="shadow-tactile min-w-[160px]"
            >
              {isCompleting ? "Đang lưu kết quả..." : isLastQuestion ? "Hoàn thành bài Test" : "Câu tiếp theo"}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}

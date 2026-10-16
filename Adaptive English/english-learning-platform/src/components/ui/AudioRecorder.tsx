"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, RotateCcw, CheckCircle2, AlertCircle, UploadCloud, RefreshCw, Sparkles, ShieldAlert } from "lucide-react";
import { Button } from "./Button";

import { uploadAudio } from '@/lib/uploadAudio';

export interface AudioRecorderProps {
  onUploaded?: (url: string | null) => void;
  submissionMode?: boolean;
  onRecorded?: (blobUrl: string) => void;
  onSubmitDemo?: () => void;
  assignmentId?: string;
}

export function AudioRecorder({ onRecorded, onSubmitDemo, assignmentId, onUploaded, submissionMode = false }: AudioRecorderProps) {
  const [step, setStep] = useState<"idle" | "recording" | "review" | "evaluating" | "result">("idle");
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [serverAudioUrl, setServerAudioUrl] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [evalMode, setEvalMode] = useState<"auto" | "rule-based" | "demo">("auto");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [evalResult, setEvalResult] = useState<any>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startingRef = useRef(false);
  const mountedRef = useRef(true);
  const urlRef = useRef<string|null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Microphone stream cleanup: Dừng mọi track tránh giữ mic sáng đèn đỏ trên trình duyệt
  const cleanupStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      streamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    mountedRef.current=true;
    return () => {
      mountedRef.current=false;
      if(mediaRecorderRef.current){mediaRecorderRef.current.onstop=null;if(mediaRecorderRef.current.state==='recording')mediaRecorderRef.current.stop();}
      if(urlRef.current)URL.revokeObjectURL(urlRef.current);
      cleanupStream();
    };
  }, []);

  const startRecording = async () => {
    if(startingRef.current)return; startingRef.current=true;
    setPermissionError(null);
    setValidationError(null);
    setUploadError(null);
    setEvalResult(null);
    setDuration(0);
    chunksRef.current = [];

    try {
      if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined') {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if(!mountedRef.current){stream.getTracks().forEach(t=>t.stop());return;}
        streamRef.current = stream;

        const mimeType=['audio/webm;codecs=opus','audio/mp4','audio/ogg;codecs=opus'].find(type=>MediaRecorder.isTypeSupported(type));
        const mediaRecorder = new MediaRecorder(stream,mimeType?{mimeType}:undefined);
        mediaRecorder.onerror=()=>{cleanupStream();setPermissionError('Ghi âm bị gián đoạn. Vui lòng thử lại.');setStep('idle');};
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
          cleanupStream();
          const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType || chunksRef.current[0]?.type || "audio/webm" });
          
          // Kiểm tra bản ghi âm rỗng hoặc thời lượng quá ngắn
          if (blob.size < 500) {
            setValidationError("Bản ghi âm không có dữ liệu âm thanh hoặc quá ngắn. Vui lòng ghi âm lại.");
            setStep("idle");
            return;
          }

          setAudioBlob(blob);
          const url = URL.createObjectURL(blob);
          if(urlRef.current)URL.revokeObjectURL(urlRef.current);
          urlRef.current=url;
          setAudioUrl(url);
          if (onRecorded) onRecorded(url);
          setStep("review");
        };

        mediaRecorder.start();
        setStep("recording");

        timerRef.current = setInterval(() => {
          setDuration((prev) => prev + 1);
        }, 1000);
      } else {
        setPermissionError("Trình duyệt hoặc thiết bị chưa hỗ trợ ghi âm HTML5 Web Audio.");
        setStep("idle");
      }
    } catch (err: any) {
      cleanupStream();
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setPermissionError("Bạn đã từ chối quyền truy cập Microphone. Vui lòng bấm vào biểu tượng ổ khóa trên thanh địa chỉ trình duyệt để cấp quyền và thử lại.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setPermissionError("Không tìm thấy thiết bị Microphone kết nối với máy tính/điện thoại.");
      } else {
        setPermissionError(`Không thể khởi tạo Microphone: ${err.message || "Lỗi không xác định"}`);
      }
      setStep("idle");
    } finally {startingRef.current=false;}
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    cleanupStream();
  };

  const retake = () => {
    cleanupStream();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setAudioBlob(null);
    setServerAudioUrl(null);
    onUploaded?.(null);
    setDuration(0);
    setValidationError(null);
    setUploadError(null);
    setEvalResult(null);
    setStep("idle");
  };

  const handleUploadAndEvaluate = async () => {
    if (!audioBlob) return;

    if (duration < 3) {
      setValidationError("Bản ghi quá ngắn (dưới 3 giây). Vui lòng ghi âm tối thiểu 3 giây.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setValidationError(null);
    setStep("evaluating");

    try {
      // 1. Tải bản ghi âm thật lên máy chủ qua /api/audio/upload
      const uploadData = await uploadAudio(audioBlob, assignmentId);
      setServerAudioUrl(uploadData.url);
      onUploaded?.(uploadData.url);
      if (submissionMode) { setStep('review'); return; }

      // 2. Gọi đánh giá chủ động qua API /api/ai/evaluate
      const evalRes = await fetch("/api/ai/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill: "speaking",
          audioUrl: uploadData.url,
          duration,
          audioSize: uploadData.size,
          assignmentId,
          mode: evalMode,
        }),
      });

      const evalData = await evalRes.json();

      if (evalRes.status === 403) {
        setEvalResult({
          status: "blocked",
          badge: "Bị khóa bởi Giáo viên",
          reason: evalData.reason || "Giáo viên đã tắt tính năng trợ lý AI cho bài học này.",
        });
      } else if (evalData.blocked) {
        setEvalResult(evalData.result);
      } else if (evalData.success) {
        setEvalResult(evalData.result);
        if (onSubmitDemo) onSubmitDemo();
      } else {
        throw new Error(evalData.error || "Không thể hoàn thành đánh giá AI.");
      }

      setStep("result");
    } catch (err: any) {
      setUploadError(err.message || "Xảy ra lỗi kết nối khi tải bản ghi âm.");
      setStep("review");
    } finally {
      setIsUploading(false);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="bg-white border-2 border-line rounded-md p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-extrabold text-base text-ink flex items-center gap-2">
          <Mic className="w-5 h-5 text-primary" /> Phòng Thu Âm Speaking
        </h4>
        <span className="text-xs px-2.5 py-1 rounded-pill bg-[#EAF2FF] text-primary-dark font-bold">
          Tiêu chuẩn bài nói: 45–60 giây
        </span>
      </div>

      {permissionError && (
        <div className="p-3.5 bg-error-soft border-l-4 border-error text-xs text-ink rounded-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
          <span>{permissionError}</span>
        </div>
      )}

      {validationError && (
        <div className="p-3 bg-warning-soft border-l-4 border-warning text-xs text-ink rounded-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <span>{validationError}</span>
        </div>
      )}

      {uploadError && (
        <div className="p-3 bg-error-soft border-l-4 border-error text-xs text-ink rounded-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Step 1: Idle */}
      {step === "idle" && (
        <div className="text-center py-8 space-y-4 bg-[#F8FAFF] rounded-md border border-line">
          <div className="w-16 h-16 rounded-full bg-[#EAF2FF] text-primary flex items-center justify-center mx-auto shadow-inner">
            <Mic className="w-8 h-8" />
          </div>
          <div>
            <p className="font-bold text-ink text-sm">Cấp quyền microphone & Bắt đầu ghi âm</p>
            <p className="text-xs text-ink-muted">Chuẩn bị ý tưởng trong 10 giây trước khi bấm nút thu âm.</p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Button onClick={startRecording} size="lg">
              <Mic className="w-4 h-4 mr-1.5" /> Bắt đầu ghi âm
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Recording */}
      {step === "recording" && (
        <div className="text-center py-8 space-y-4 bg-error-soft/30 rounded-md border border-error/20">
          <div className="flex items-center justify-center gap-2 text-error font-mono font-black text-2xl">
            <span className="w-3 h-3 rounded-full bg-error animate-ping" />
            {formatSeconds(duration)}
          </div>

          <div className="flex items-center justify-center gap-1.5 h-10">
            {[40, 75, 55, 90, 60, 80, 45, 95, 70, 50, 85, 60].map((h, i) => (
              <span
                key={i}
                className="w-1.5 bg-primary rounded-full animate-pulse"
                style={{
                  height: `${h}%`,
                  animationDelay: `${(i * 0.1).toFixed(1)}s`,
                }}
              />
            ))}
          </div>

          <p className="text-xs text-ink-muted font-medium">Đang thu âm microphone trực tiếp... Hãy nói rõ ràng vào micro.</p>

          <Button variant="danger" size="md" onClick={stopRecording}>
            <Square className="w-4 h-4 mr-2 fill-current" /> Dừng ghi âm
          </Button>
        </div>
      )}

      {/* Step 3: Review & Upload */}
      {step === "review" && (
        <div className="py-6 space-y-4 bg-[#F8FAFF] rounded-md border border-line p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-ink text-sm">Bản ghi hoàn tất ({formatSeconds(duration)})</p>
              <p className="text-xs text-ink-muted">Bạn có thể nghe lại bên dưới trước khi lưu hoặc gửi bản ghi.</p>
            </div>
            <button
              onClick={retake}
              className="text-xs font-bold text-ink-muted hover:text-error flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Ghi lại
            </button>
          </div>

          {audioUrl && (
            <div className="space-y-2 bg-white p-3 rounded-md border border-line">
              <audio controls src={audioUrl} className="w-full h-10 rounded-pill" />
              <div className="flex justify-between text-[11px] text-ink-muted px-1">
                <span>Độ dài: {duration} giây</span>
                <a href={audioUrl} download={`speaking-practice.${audioBlob?.type.includes("mp4")?"mp4":audioBlob?.type.includes("ogg")?"ogg":"webm"}`} className="text-primary hover:underline font-bold">
                  Tải về bản sao lưu
                </a>
              </div>
            </div>
          )}

          {submissionMode && serverAudioUrl && <p role="status" className="text-sm text-success">Đã tải bản ghi vào kho riêng. Bấm Nộp bài cho Giáo Viên ở bên dưới để hoàn tất.</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={retake}>
              Hủy
            </Button>
            <Button
              size="md"
              disabled={!audioBlob || isUploading || (submissionMode && Boolean(serverAudioUrl))}
              isLoading={isUploading}
              onClick={handleUploadAndEvaluate}
            >
              <Sparkles className="w-4 h-4 mr-1.5" /> {submissionMode ? 'Lưu bản ghi vào bài' : 'Gửi bản ghi & Yêu cầu AI Đánh giá'}
            </Button>
          </div>
        </div>
      )}

      {/* Evaluating State */}
      {step === "evaluating" && (
        <div className="text-center py-10 space-y-3 bg-[#F8FAFF] rounded-md border border-line">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="font-bold text-ink text-sm">{submissionMode ? 'Đang lưu bản ghi vào kho riêng…' : 'Đang tải bản ghi âm và yêu cầu đánh giá…'}</p>
          <p className="text-xs text-ink-muted">{submissionMode ? 'Giữ trang mở cho đến khi bản ghi được lưu xong.' : 'Thời gian xử lý tùy dịch vụ đánh giá đang được cấu hình.'}</p>
        </div>
      )}

      {/* Step 4: Result */}
      {step === "result" && evalResult && (
        <div className="space-y-4">
          {evalResult.isBlocked || evalResult.status === "blocked" ? (
            <div className="p-5 bg-warning-soft border-2 border-warning rounded-md space-y-3">
              <div className="flex items-center gap-2 text-warning font-black text-sm">
                <ShieldAlert className="w-5 h-5" /> TÍNH NĂNG ĐÁNH GIÁ BỊ KHÓA
              </div>
              <p className="text-xs text-ink font-medium leading-relaxed">
                {evalResult.reason || "Chưa cấu hình API Key AI. Hệ thống từ chối trả điểm giả mạo như kết quả thật."}
              </p>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={retake}>
                  Quay lại
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-white border-2 border-primary/50 rounded-md shadow-panel space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <h5 className="font-extrabold text-sm text-ink">Kết Quả Đánh Giá Speaking</h5>
                </div>
                {/* Badge phân loại minh bạch nguồn đánh giá */}
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

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 bg-surface rounded border border-line text-center">
                  <span className="text-ink-muted block text-[11px]">Độ trôi chảy (Fluency)</span>
                  <span className="font-mono font-bold text-primary text-sm">
                    {evalResult.rubric?.pronunciationOrFluency ?? "—"}
                  </span>
                </div>
                <div className="p-2.5 bg-surface rounded border border-line text-center">
                  <span className="text-ink-muted block text-[11px]">Từ vựng (Lexical)</span>
                  <span className="font-mono font-bold text-primary text-sm">
                    {evalResult.rubric?.lexicalResource || 6.0}
                  </span>
                </div>
                <div className="p-2.5 bg-surface rounded border border-line text-center">
                  <span className="text-ink-muted block text-[11px]">Ngữ pháp (Grammar)</span>
                  <span className="font-mono font-bold text-primary text-sm">
                    {evalResult.rubric?.grammarAccuracy || 6.0}
                  </span>
                </div>
                <div className="p-2.5 bg-surface rounded border border-line text-center">
                  <span className="text-ink-muted block text-[11px]">Ước lượng Band</span>
                  <span className="font-mono font-black text-success text-sm">
                    Band {evalResult.estimatedBand ?? "—"}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#F8FAFF] rounded-md border border-line text-xs space-y-1.5">
                <strong className="text-ink block">Nhận xét chi tiết:</strong>
                <p className="text-ink-muted leading-relaxed">{evalResult.summary}</p>
                {evalResult.strengthPoints?.length > 0 && (
                  <div className="pt-1">
                    <span className="font-bold text-success">Điểm tích cực:</span>
                    <ul className="list-disc pl-4 text-ink-muted">
                      {evalResult.strengthPoints.map((pt: string, idx: number) => (
                        <li key={idx}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {evalResult.weaknessPoints?.length > 0 && (
                  <div className="pt-1">
                    <span className="font-bold text-warning">Điểm cần cải thiện:</span>
                    <ul className="list-disc pl-4 text-ink-muted">
                      {evalResult.weaknessPoints.map((pt: string, idx: number) => (
                        <li key={idx}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {serverAudioUrl && (
                <div className="text-[11px] text-ink-muted flex items-center justify-between pt-1">
                  <span>Bản ghi đã lưu trong kho riêng</span>
                  <span>Thời gian: {evalResult.evaluatedAt?.slice(0, 19).replace("T", " ")}</span>
                </div>
              )}

              <Button variant="outline" size="sm" onClick={retake} className="w-full">
                Luyện tập bài khác hoặc Ghi âm lại
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, Volume2, AlertCircle, Loader2 } from "lucide-react";

export interface AudioPlayerProps {
  title?: string;
  durationSeconds?: number;
  src?: string;
  onTranscriptToggle?: () => void;
  showTranscriptButton?: boolean;
}

export function AudioPlayer({
  title = "Đoạn hội thoại bài nghe",
  src,
  onTranscriptToggle,
  showTranscriptButton = false,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setIsPlaying(false);
    setCurrentTime(0);
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current || hasError) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setHasError(false);
        })
        .catch((err: any) => {
          if (err?.name === "AbortError") return;
          console.warn("Audio play rejected:", err);
          setHasError(true);
        });
    }
  };

  const handleReplay = () => {
    if (!audioRef.current || hasError) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
        setHasError(false);
      })
      .catch((err: any) => {
        if (err?.name === "AbortError") return;
        console.warn("Audio replay rejected:", err);
        setHasError(true);
      });
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
      setIsLoading(false);
      setHasError(false);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    const mediaError = (e?.target as HTMLAudioElement)?.error;
    if (mediaError?.code === 1) return; // MEDIA_ERR_ABORTED - do not flag as error
    console.warn("Audio load error:", mediaError);
    setIsLoading(false);
    setHasError(true);
    setIsPlaying(false);
  };

  const formatTime = (secs: number) => {
    if (!Number.isFinite(secs) || secs < 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <section className="bg-white border-2 border-line rounded-lg p-4 md:p-5 shadow-soft space-y-3">
      {/* Hidden native audio element */}
      {src && (
        <audio
          ref={audioRef}
          src={src}
          preload="metadata"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlay={() => setIsLoading(false)}
          onEnded={handleEnded}
          onError={handleError}
          className="hidden"
          aria-label={title}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-full bg-primary-light text-primary">
            <Volume2 className="w-4 h-4" />
          </span>
          <h3 className="text-sm font-bold text-ink">{title}</h3>
        </div>

        {showTranscriptButton && onTranscriptToggle && (
          <button
            type="button"
            onClick={onTranscriptToggle}
            className="text-xs font-bold text-primary hover:underline"
          >
            Bản lời (Transcript)
          </button>
        )}
      </div>

      {/* State: No audio src */}
      {!src && (
        <div className="p-3.5 bg-warning-soft text-ink-muted rounded-md text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-warning shrink-0" />
          <span>Chưa có tệp âm thanh cho phần này.</span>
        </div>
      )}

      {/* State: Loading */}
      {src && isLoading && !hasError && (
        <div className="flex items-center justify-center gap-2 py-3 text-xs text-ink-muted font-bold animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span>Đang nạp dữ liệu âm thanh...</span>
        </div>
      )}

      {/* State: Load Error */}
      {hasError && (
        <div className="p-3.5 bg-error-soft text-error rounded-md text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Không tải được tệp âm thanh. Vui lòng kiểm tra kết nối mạng.</span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.load();
                setIsLoading(true);
                setHasError(false);
              }
            }}
            className="underline font-bold hover:text-error/80"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Controls & Scrubber */}
      {src && !isLoading && !hasError && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-3">
            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-transform active:scale-95 shadow-sm shrink-0"
              title={isPlaying ? "Tạm dừng" : "Phát âm thanh"}
              aria-label={isPlaying ? "Tạm dừng" : "Phát âm thanh"}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            {/* Replay Button */}
            <button
              type="button"
              onClick={handleReplay}
              className="p-2 rounded-full border border-line hover:bg-canvas text-ink-muted hover:text-ink transition-colors shrink-0"
              title="Nghe lại từ đầu"
              aria-label="Nghe lại từ đầu"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Progress Bar */}
            <div className="flex-1 space-y-1">
              <div
                className="h-2 w-full bg-line rounded-full overflow-hidden cursor-pointer relative"
                onClick={(e) => {
                  if (!audioRef.current || duration <= 0) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  audioRef.current.currentTime = pos * duration;
                  setCurrentTime(pos * duration);
                }}
              >
                <div
                  className="h-full bg-primary rounded-full transition-all duration-75"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono font-bold text-ink-muted">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

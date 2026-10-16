"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AudioPlayer } from "@/components/ui/AudioPlayer";
import { OptionCard } from "@/components/ui/OptionCard";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Headphones, FileText, CheckCircle2, ArrowRight } from "lucide-react";

export default function ListeningWorkspacePage() {
  const router = useRouter();
  const [showTranscript, setShowTranscript] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const transcriptContent = `
    Advisor: Good afternoon, welcome to Student Academic Support. How can I help you today?
    Student: Hi, I'm hoping to reserve a group study room for our economics project this Thursday.
    Advisor: Certainly. We have collaborative pods on the 3rd floor equipped with whiteboards and digital screens. What time would suit your group best?
    Student: Around 2:00 PM would be ideal, for about two hours.
    Advisor: Let me check... Room 304 is available from 2:00 to 4:00 PM. Just bring your student ID card to activate the door lock.
  `;

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between">
      <header className="bg-white border-b border-line px-4 md:px-6 py-3.5 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Link href="/student/learn" className="flex items-center gap-2 text-xs font-bold text-ink-muted hover:text-ink">
            <ArrowLeft className="w-4 h-4" /> Quay lại kho bài học
          </Link>
          <span className="font-extrabold text-sm text-ink truncate">Listening Workspace: Campus Room Booking</span>
          <span className="text-xs px-2.5 py-0.5 rounded-pill bg-[#EAF2FF] text-primary-dark font-bold">
            Audio Section 1
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto w-full px-4 md:px-6 py-8 md:py-10 space-y-6 flex-1">
        {/* Audio Player Component */}
        <AudioPlayer
          title="Student Support Dialogue: Reserving a Study Room"
          src="/audio/study-room-dialogue.mp3"
          durationSeconds={75}
          onTranscriptToggle={() => setShowTranscript(!showTranscript)}
        />

        {/* Optional Transcript Accordion */}
        {showTranscript && (
          <div className="p-5 bg-white border-2 border-line rounded-md text-xs md:text-sm text-ink space-y-2 animate-in fade-in">
            <div className="flex items-center gap-1.5 font-bold text-primary pb-2 border-b border-line">
              <FileText className="w-4 h-4" /> Nội dung bản ghi âm (Transcript):
            </div>
            {transcriptContent.trim().split("\n").map((line, idx) => (
              <p key={idx} className="leading-relaxed">
                {line.trim()}
              </p>
            ))}
          </div>
        )}

        {/* Listening Question */}
        <div className="bg-white border-2 border-line rounded-lg p-6 md:p-8 shadow-soft space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-extrabold text-primary uppercase">Information Retrieval Question:</span>
            <h3 className="text-base md:text-lg font-bold text-ink leading-snug">
              What item must the student bring to unlock Room 304?
            </h3>
          </div>

          <div className="space-y-2.5">
            {[
              { id: "A", text: "A physical metal key collected from the ground floor reception." },
              { id: "B", text: "A student ID card to activate the electronic door lock." },
              { id: "C", text: "A digital QR confirmation code sent via university email." },
              { id: "D", text: "A receipt proving payment of a study room deposit." },
            ].map((opt) => (
              <OptionCard
                key={opt.id}
                id={opt.id}
                prefix={opt.id}
                label={opt.text}
                selected={selectedOpt === opt.id}
                status={isSubmitted ? (opt.id === "B" ? "correct" : selectedOpt === opt.id ? "wrong" : "default") : "default"}
                disabled={isSubmitted}
                onClick={() => setSelectedOpt(opt.id)}
              />
            ))}
          </div>

          {isSubmitted && (
            <div className="p-4 bg-success-soft rounded-sm border border-success/30 text-xs text-[#185932] space-y-1">
              <strong>Giải thích:</strong> Cố vấn học tập dặn sinh viên: <em>'Just bring your student ID card to activate the door lock.'</em>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            {!isSubmitted ? (
              <Button size="lg" disabled={!selectedOpt} onClick={() => setIsSubmitted(true)} className="shadow-tactile">
                Kiểm tra câu trả lời
              </Button>
            ) : (
              <Button size="lg" onClick={() => router.push(`/student/session-summary?score=${selectedOpt === "B" ? 1 : 0}&total=1&lesson=Đọc%20bản%20lời%20mẫu`)} className="shadow-tactile">
                Hoàn thành đọc bản lời mẫu <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

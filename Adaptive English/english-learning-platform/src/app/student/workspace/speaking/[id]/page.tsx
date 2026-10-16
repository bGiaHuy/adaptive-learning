"use client";

import React from "react";
import Link from "next/link";
import { AudioRecorder } from "@/components/ui/AudioRecorder";
import { ArrowLeft, Mic, Sparkles } from "lucide-react";

export default function SpeakingWorkspacePage() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between">
      <header className="bg-white border-b border-line px-4 md:px-6 py-3.5 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Link href="/student/learn" className="flex items-center gap-2 text-xs font-bold text-ink-muted hover:text-ink">
            <ArrowLeft className="w-4 h-4" /> Quay lại kho bài học
          </Link>
          <span className="font-extrabold text-sm text-ink truncate">Speaking Workspace: Part 2 Cue Card</span>
          <span className="text-xs px-2.5 py-0.5 rounded-pill bg-[#EAF2FF] text-primary-dark font-bold">
            Voice Lab
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto w-full px-4 md:px-6 py-8 md:py-10 space-y-6 flex-1">
        {/* Cue Card Prompt */}
        <div className="bg-white border-2 border-line rounded-lg p-6 shadow-sm space-y-3">
          <span className="text-xs font-extrabold text-primary uppercase tracking-wider block">
            Speaking Part 2 Cue Card:
          </span>
          <h2 className="text-base md:text-lg font-bold text-ink leading-snug">
            Describe an interesting place in your hometown that you would recommend visitors to explore.
          </h2>
          <div className="p-3.5 bg-[#F8FAFF] rounded-md border border-line text-xs text-ink-muted space-y-1">
            <strong>Gợi ý dàn ý nói (You should say):</strong>
            <ul className="list-disc pl-5 space-y-0.5 pt-1">
              <li>Where this place is located</li>
              <li>What people can do or see there</li>
              <li>Why you personally like this place</li>
              <li>And explain why it is worth visiting for tourists.</li>
            </ul>
          </div>
        </div>

        {/* Real Browser Audio Recorder Component */}
        <AudioRecorder />
      </main>
    </div>
  );
}

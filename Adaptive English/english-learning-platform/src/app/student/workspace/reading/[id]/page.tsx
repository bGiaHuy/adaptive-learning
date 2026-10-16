"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLocalDraft } from "@/lib/useLocalDraft";
import { Button } from "@/components/ui/Button";
import { OptionCard } from "@/components/ui/OptionCard";
import { X, ArrowLeft, BookOpen, CheckCircle2, ArrowRight } from "lucide-react";

export default function ReadingWorkspacePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"passage" | "questions">("passage");
  const { value: selectedAnswers, setValue: setSelectedAnswers, ready, saved } = useLocalDraft<Record<string, string>>(`adaptive_study_reading_${useParams().id}`, {});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const passageText = `
    The Arctic Fox (Vulpes lagopus) is an extraordinary mammal that has adapted to endure the harshest, coldest environments on Earth. Inhabiting the treeless tundra throughout the Arctic regions of North America and Eurasia, its body has evolved unique physiological traits to survive temperatures that plunge to -58°F (-50°C).

    The most conspicuous adaptation is its dense, multi-layered fur. During the winter, the fur is pristine white, serving as effective camouflage against the snowbound terrain. In the summer months, however, the coat shifts dramatically to a mottled brownish-gray, harmonizing with the thawing tundra and rocky hillsides.

    Beyond camouflage, the fox possesses a remarkable countercurrent heat exchange system in its paws, preventing heat loss to the frozen ground. Its rounded, compact ears and short muzzle diminish the surface area exposed to frostbite. Furthermore, its metabolic rate remains remarkably steady down to -40°C, meaning the animal does not even begin to shiver until the mercury plummets beyond this critical threshold.
  `;

  const questions = [
    {
      id: "q1",
      prompt: "1. What is the primary function of the Arctic fox's coat changing from white to brownish-gray in summer?",
      options: [
        { id: "A", text: "To absorb solar thermal radiation more efficiently." },
        { id: "B", text: "To provide camouflage against thawing tundra and rocky hillsides." },
        { id: "C", text: "To attract prospective mates during the brief breeding season." },
        { id: "D", text: "To facilitate swimming across glacial meltwater rivers." },
      ],
      correct: "B",
      explanation: "Đoạn 2 nêu rõ: Lông đổi sang màu nâu xám để 'harmonizing with the thawing tundra and rocky hillsides' (hòa hợp với đài nguyên tan băng và sườn đồi đầy đá).",
    },
    {
      id: "q2",
      prompt: "2. Which physiological feature directly reduces the animal's vulnerability to frostbite?",
      options: [
        { id: "A", text: "Its rounded, compact ears and short muzzle." },
        { id: "B", text: "Its enlarged ocular cavities with enhanced night vision." },
        { id: "C", text: "Its elongated razor-sharp claws adapted for burrowing snow." },
        { id: "D", text: "Its extended bushy tail serving as a thermal headwrap." },
      ],
      correct: "A",
      explanation: "Đoạn 3 chỉ ra: 'Its rounded, compact ears and short muzzle diminish the surface area exposed to frostbite'.",
    },
  ];

  const handleSelect = (qId: string, optId: string) => {
    setSelectedAnswers({ ...selectedAnswers, [qId]: optId });
  };

  const allAnswered = questions.every((q) => selectedAnswers[q.id]);

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  if (!ready) return <p className="p-8">Đang khôi phục bài đọc…</p>;
  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between">
      {/* Top Bar */}
      <p role="status" className="px-4 py-2 text-xs">{saved ? "Câu trả lời đã lưu trên thiết bị" : "Chưa lưu được — giữ trang mở"}</p>
      <header className="bg-white border-b border-line px-4 md:px-6 py-3.5 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <Link href="/student/learn" className="flex items-center gap-2 text-xs font-bold text-ink-muted hover:text-ink">
            <ArrowLeft className="w-4 h-4" /> Quay lại kho bài học
          </Link>
          <span className="font-extrabold text-sm text-ink truncate">Reading Workspace: The Arctic Fox</span>
          <span className="text-xs px-2.5 py-0.5 rounded-pill bg-[#EAF2FF] text-primary-dark font-bold">
            IELTS Academic Style
          </span>
        </div>
      </header>

      {/* Mobile Tab Switcher */}
      <div className="md:hidden bg-white border-b border-line px-4 py-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("passage")}
          className={`flex-1 py-1.5 rounded-pill text-xs font-bold text-center ${
            activeTab === "passage" ? "bg-primary text-white" : "bg-line/40 text-ink-muted"
          }`}
        >
          Đoạn văn đọc
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("questions")}
          className={`flex-1 py-1.5 rounded-pill text-xs font-bold text-center ${
            activeTab === "questions" ? "bg-primary text-white" : "bg-line/40 text-ink-muted"
          }`}
        >
          Câu hỏi ({Object.keys(selectedAnswers).length}/{questions.length})
        </button>
      </div>

      {/* Main Split Layout: Desktop 2 Columns */}
      <main className="max-w-6xl mx-auto w-full px-4 md:px-6 py-6 md:py-8 flex-1 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Passage (Desktop visible, Mobile controlled by tab) */}
        <div
          className={`md:col-span-6 bg-white border-2 border-line rounded-lg p-6 md:p-8 shadow-sm space-y-4 max-h-[75vh] overflow-y-auto leading-relaxed ${
            activeTab === "passage" ? "block" : "hidden md:block"
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-extrabold text-primary uppercase tracking-wider pb-2 border-b border-line">
            <BookOpen className="w-4 h-4" /> Academic Reading Passage
          </div>
          <h2 className="text-xl md:text-2xl font-black text-ink">
            Adaptive Survival of the Arctic Fox
          </h2>
          <div className="text-sm md:text-base text-ink space-y-4 font-normal">
            {passageText.trim().split("\n\n").map((para, idx) => (
              <p key={idx} className="leading-relaxed">
                {para.trim()}
              </p>
            ))}
          </div>
        </div>

        {/* Right Column: Questions Panel */}
        <div
          className={`md:col-span-6 space-y-6 ${
            activeTab === "questions" ? "block" : "hidden md:block"
          }`}
        >
          <div className="bg-white border-2 border-line rounded-lg p-6 md:p-8 shadow-sm space-y-6">
            <h3 className="text-base font-extrabold text-ink border-b border-line pb-3">
              Câu hỏi đọc hiểu ({questions.length} câu)
            </h3>

            <div className="space-y-6">
              {questions.map((q) => (
                <div key={q.id} className="space-y-3">
                  <h4 className="text-sm md:text-base font-bold text-ink leading-snug">
                    {q.prompt}
                  </h4>

                  <div className="space-y-2">
                    {q.options.map((opt) => {
                      const isSelected = selectedAnswers[q.id] === opt.id;
                      let status: "default" | "correct" | "wrong" = "default";
                      if (isSubmitted) {
                        if (opt.id === q.correct) status = "correct";
                        else if (isSelected) status = "wrong";
                      }
                      return (
                        <OptionCard
                          key={opt.id}
                          id={opt.id}
                          prefix={opt.id}
                          label={opt.text}
                          selected={isSelected}
                          status={status}
                          disabled={isSubmitted}
                          onClick={() => handleSelect(q.id, opt.id)}
                        />
                      );
                    })}
                  </div>

                  {isSubmitted && (
                    <div className="p-3.5 bg-success-soft rounded-sm border border-success/30 text-xs text-[#185932]">
                      <strong>Giải thích:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-line flex justify-end">
              {!isSubmitted ? (
                <Button size="lg" disabled={!allAnswered} onClick={handleSubmit} className="shadow-tactile">
                  Nộp bài đọc
                </Button>
              ) : (
                <Button size="lg" onClick={() => router.push(`/student/session-summary?score=${questions.filter(q => selectedAnswers[q.id] === q.correct).length}&total=${questions.length}&lesson=Reading%20Workspace`)} className="shadow-tactile">
                  Hoàn tất phiên học <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

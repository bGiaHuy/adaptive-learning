"use client";

import { isWordDue } from "@/lib/learning";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Mascot } from "@/components/ui/Mascot";
import { X, Volume2, RotateCcw, ArrowLeft, ArrowRight, HelpCircle, CheckCircle2 } from "lucide-react";

export default function FlashcardPlayerPage() {
  const router = useRouter();
  const { vocabWords, rateWord, vocabReady, vocabError } = useApp();

  const [sessionIds, setSessionIds] = useState<string[] | null>(null);
  useEffect(() => { if (vocabReady && sessionIds === null) setSessionIds(vocabWords.filter(w => isWordDue(w)).map(w => w.id)); }, [vocabReady, sessionIds, vocabWords]);
  const dueList = (sessionIds || []).map(id => vocabWords.find(w => w.id === id)).filter((w): w is NonNullable<typeof w> => !!w);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [ratedCount, setRatedCount] = useState(0);

  const currentCard = dueList[currentIndex];

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleRate = async (rating: "again" | "hard" | "good" | "easy") => {
    if (!currentCard || !isRevealed || saving) return;
    setSaving(true); setError('');
    try { await rateWord(currentCard.id, rating);
    setRatedCount((prev) => prev + 1);

    if (currentIndex < dueList.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsRevealed(false);
    } else {
      // Completed batch
      setIsRevealed(false);
      setCurrentIndex(dueList.length); // trigger finished view
    }
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Chưa lưu được lần ôn.'); }
    finally { setSaving(false); }
  };

  const isBatchFinished = currentIndex >= dueList.length || !currentCard;

  if (vocabError) return <p role="alert" className="p-8 text-error">{vocabError}</p>;
  if (sessionIds === null) return <p role="status" className="p-8">Đang tải thẻ đã lưu…</p>;

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between">
      {/* Top Bar */}
      <header className="bg-white border-b border-line px-4 md:px-6 py-3.5 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Link href="/student/vocabulary" className="p-2 rounded-full hover:bg-[#F6F9FF] text-ink-muted hover:text-ink">
            <X className="w-5 h-5" />
          </Link>

          {!isBatchFinished && (
            <div className="flex-1 max-w-xs mx-auto space-y-1 text-center">
              <span className="text-xs font-bold text-ink-muted">
                Thẻ {currentIndex + 1} / {dueList.length}
              </span>
              <div className="h-2 w-full bg-line rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-fast"
                  style={{ width: `${((currentIndex + 1) / dueList.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          <span className="text-xs px-2.5 py-0.5 rounded-pill bg-[#EAF2FF] text-primary-dark font-extrabold">
            Ôn cách quãng
          </span>
        </div>
      </header>

      {/* Main Flashcard Container */}
      <main className="max-w-xl mx-auto w-full px-4 md:px-6 py-8 md:py-12 flex-1 flex flex-col justify-center">
        {isBatchFinished ? (
          /* Finished State */
          <div className="bg-white border-2 border-line rounded-lg p-8 shadow-soft text-center space-y-6 animate-in fade-in">
            <div className="flex justify-center">
              <Mascot mood="celebrate" size="summary" speechText="Phiên ôn đã kết thúc. Hẹn gặp lại cậu!" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-ink">Hoàn Thành Đợt Ôn Tập</h2>
              <p className="text-xs md:text-sm text-ink-muted">
                Đã ghi nhận phản hồi đánh giá của {ratedCount} thẻ vào lịch ôn tập của bạn.
              </p>
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <Link href="/student/vocabulary">
                <Button variant="outline" size="md">
                  Về Tủ Từ Vựng
                </Button>
              </Link>
              <Link href="/student/home">
                <Button size="md" className="shadow-tactile">
                  Về Trang Chủ <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Card In Review */
          <div className="space-y-6">
            <div
              className={`bg-white border-2 border-line rounded-lg p-8 md:p-10 shadow-soft text-center min-h-[320px] flex flex-col justify-between transition-all duration-panel ${
                isRevealed ? "border-primary/60" : ""
              }`}
            >
              {/* Card Front */}
              <div className="space-y-4 my-auto">
                <span className="text-xs font-bold text-ink-muted uppercase tracking-wider block">
                  {currentCard.partOfSpeech} · CEFR {currentCard.cefr}
                </span>

                <div className="flex items-center justify-center gap-3">
                  <h2 className="text-4xl md:text-5xl font-black text-ink tracking-tight">
                    {currentCard.term}
                  </h2>
                  <button
                    type="button"
                    className="w-10 h-10 rounded-full bg-[#EAF2FF] text-primary flex items-center justify-center hover:bg-[#DCE8FC] transition-colors"
                    title="Phát âm bằng giọng đọc thiết bị"
                    onClick={() => { if ("speechSynthesis" in window) { window.speechSynthesis.cancel(); const speech = new SpeechSynthesisUtterance(currentCard.term); speech.lang = "en-US"; window.speechSynthesis.speak(speech); } }}
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-sm font-mono text-primary font-bold">
                  {currentCard.phonetic}
                </p>

                {!isRevealed ? (
                  <p className="text-xs text-ink-muted pt-6 italic">
                    (Hãy hồi tưởng lại nghĩa tiếng Việt trước khi bấm xem đáp án)
                  </p>
                ) : (
                  /* Card Back (Revealed) */
                  <div className="space-y-3 pt-6 border-t border-line animate-in fade-in">
                    <p className="text-base md:text-lg font-bold text-ink leading-relaxed">
                      {currentCard.definition}
                    </p>
                    <p className="text-xs md:text-sm text-ink-muted italic bg-[#F8FAFF] p-3 rounded-md">
                      "{currentCard.example}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Action: Reveal Button OR 4 FSRS Buttons */}
            {!isRevealed ? (
              <Button
                size="lg"
                onClick={() => setIsRevealed(true)}
                className="w-full shadow-tactile py-4 text-base"
              >
                Lật thẻ xem đáp án
              </Button>
            ) : (
              <div className="space-y-3 animate-in fade-in">
                <div className="grid grid-cols-4 gap-2">
                  {/* Again */}
                  <button
                    type="button"
                    onClick={() => handleRate("again")}
                    className="p-3 rounded-md bg-[#FFF0F2] border-2 border-error text-center hover:bg-[#FFE0E4] active:scale-95 transition-all"
                  >
                    <span className="block font-black text-sm text-error">Quên</span>
                    <span className="text-[10px] text-ink-muted font-bold block mt-0.5">1 ngày</span>
                  </button>

                  {/* Hard */}
                  <button
                    type="button"
                    onClick={() => handleRate("hard")}
                    className="p-3 rounded-md bg-warning-soft border-2 border-warning text-center hover:bg-[#FDE68A] active:scale-95 transition-all"
                  >
                    <span className="block font-black text-sm text-warning">Khó</span>
                    <span className="text-[10px] text-ink-muted font-bold block mt-0.5">Vẫn nhớ</span>
                  </button>

                  {/* Good */}
                  <button
                    type="button"
                    onClick={() => handleRate("good")}
                    className="p-3 rounded-md bg-[#EDF4FF] border-2 border-primary text-center hover:bg-[#DCE8FC] active:scale-95 transition-all"
                  >
                    <span className="block font-black text-sm text-primary">Nhớ</span>
                    <span className="text-[10px] text-ink-muted font-bold block mt-0.5">Vẫn nhớ</span>
                  </button>

                  {/* Easy */}
                  <button
                    type="button"
                    onClick={() => handleRate("easy")}
                    className="p-3 rounded-md bg-success-soft border-2 border-success text-center hover:bg-[#DCFCE7] active:scale-95 transition-all"
                  >
                    <span className="block font-black text-sm text-success">Dễ</span>
                    <span className="text-[10px] text-ink-muted font-bold block mt-0.5">Nhớ dễ dàng</span>
                  </button>
                </div>

                {/* Pedagogical Rule Note */}
                <div className="p-3 bg-[#F8FAFF] rounded-md border border-line text-[11px] text-ink-muted text-center">
                  💡 <strong>Quy tắc sư phạm:</strong> Nút <em>"Khó"</em> là bạn vẫn nhớ được nghĩa; nếu hoàn toàn quên, <strong>bắt buộc bấm "Quên"</strong> để reset chu kỳ.
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

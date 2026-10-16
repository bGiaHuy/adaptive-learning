'use client';

import React, { useState } from 'react';
import clsx from 'clsx';
import { Badge } from '@/components/ui/Badge';

export interface WordBankItem {
  id: string;
  word: string;
}

export interface BlankQuestion {
  id: string;
  prefix: string;
  suffix: string;
  correctWord: string;
}

export interface WordBankFillProps {
  bank: string[]; // e.g. ["soybeans", "suncream", "affects", "early", "for", "tired"]
  questions: BlankQuestion[];
  onAnswersChange?: (answers: Record<string, string>) => void;
}

export function WordBankFill({ bank, questions, onAnswersChange }: WordBankFillProps) {
  // Mapping of question.id -> selected word
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(questions[0]?.id || null);

  // Determine which words are currently used
  const usedWords = Object.values(answers);

  const handleSelectWordFromBank = (word: string) => {
    if (!activeQuestionId) return;

    const nextAnswers = { ...answers, [activeQuestionId]: word };
    setAnswers(nextAnswers);

    if (onAnswersChange) {
      onAnswersChange(nextAnswers);
    }

    // Automatically advance to the next unfilled question
    const nextUnfilled = questions.find((q) => q.id !== activeQuestionId && !nextAnswers[q.id]);
    if (nextUnfilled) {
      setActiveQuestionId(nextUnfilled.id);
    }
  };

  const handleClearBlank = (qId: string) => {
    const nextAnswers = { ...answers };
    delete nextAnswers[qId];
    setAnswers(nextAnswers);
    setActiveQuestionId(qId);

    if (onAnswersChange) {
      onAnswersChange(nextAnswers);
    }
  };

  return (
    <div className="space-y-6">
      {/* Word Bank Container */}
      <div className="p-4 bg-[#F0F5FF] border-2 border-primary/20 rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase text-primary-dark tracking-wider">
            Từ Điển Cho Sẵn (Word Bank)
          </span>
          <span className="text-xs text-ink-muted">
            {usedWords.length} / {bank.length} từ đã điền
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {bank.map((word, idx) => {
            const isUsed = usedWords.includes(word);
            return (
              <button
                key={idx}
                type="button"
                disabled={isUsed}
                onClick={() => handleSelectWordFromBank(word)}
                className={clsx(
                  'px-3.5 py-1.5 rounded-pill text-sm font-bold transition-all shadow-sm',
                  isUsed
                    ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-60 line-through'
                    : 'bg-white text-primary-dark border-2 border-primary/30 hover:border-primary hover:bg-primary hover:text-white cursor-pointer active:translate-y-0.5'
                )}
              >
                {word}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sentence List with Blanks */}
      <div className="space-y-3">
        {questions.map((q, idx) => {
          const filled = answers[q.id];
          const isActive = activeQuestionId === q.id;

          return (
            <div
              key={q.id}
              onClick={() => setActiveQuestionId(q.id)}
              className={clsx(
                'p-4 rounded-lg border-2 transition-all flex flex-wrap items-center gap-2 text-sm md:text-base leading-relaxed cursor-pointer',
                isActive
                  ? 'bg-blue-50/40 border-primary shadow-sm'
                  : 'bg-white border-line hover:border-line/80'
              )}
            >
              <span className="font-bold text-ink-muted w-6">{idx + 1}.</span>
              <span className="text-ink">{q.prefix}</span>

              {/* Blank Box */}
              <div
                className={clsx(
                  'min-w-[120px] px-3 py-1 rounded-md border-2 font-bold text-center inline-flex items-center justify-center gap-1 transition-all',
                  filled
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : isActive
                    ? 'bg-white border-primary border-dashed text-primary font-bold animate-pulse'
                    : 'bg-gray-50 border-gray-300 border-dashed text-gray-400'
                )}
              >
                {filled ? (
                  <>
                    <span>{filled}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearBlank(q.id);
                      }}
                      className="ml-1 w-4 h-4 rounded-full bg-white/20 hover:bg-white/40 text-xs flex items-center justify-center leading-none"
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <span className="text-xs font-normal">
                    {isActive ? 'Chọn từ ở trên' : 'Nhấp để điền'}
                  </span>
                )}
              </div>

              <span className="text-ink">{q.suffix}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WordBankFill;

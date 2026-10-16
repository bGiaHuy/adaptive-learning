'use client';

import React, { useState } from 'react';
import clsx from 'clsx';
import { Badge } from '@/components/ui/Badge';

export interface InlineWordSelectorProps {
  sentence: string; // e.g. "Tofu has vegetable protein and vitamin B."
  mode: 'subject_verb' | 'object_adverb';
  onSelectionChange?: (result: { subjects: string[]; verbs: string[]; classified: Record<string, 'O' | 'Adv'> }) => void;
}

export function InlineWordSelector({ sentence, mode, onSelectionChange }: InlineWordSelectorProps) {
  // Split sentence into words/tokens while preserving punctuation
  const words = sentence.split(' ');

  // For subject_verb mode: each word can be 'none' | 'subject' (underlined) | 'verb' (circled/pill)
  const [wordRoles, setWordRoles] = useState<Record<number, 'none' | 'subject' | 'verb'>>({});

  // For object_adverb mode: each word or highlighted segment can be 'none' | 'O' | 'Adv'
  const [wordClasses, setWordClasses] = useState<Record<number, 'none' | 'O' | 'Adv'>>({});

  const handleWordClick = (index: number) => {
    if (mode === 'subject_verb') {
      const current = wordRoles[index] || 'none';
      let next: 'none' | 'subject' | 'verb' = 'none';
      if (current === 'none') next = 'subject';
      else if (current === 'subject') next = 'verb';
      else next = 'none';

      const updated = { ...wordRoles, [index]: next };
      setWordRoles(updated);

      if (onSelectionChange) {
        const subjects = words.filter((_, i) => updated[i] === 'subject');
        const verbs = words.filter((_, i) => updated[i] === 'verb');
        onSelectionChange({ subjects, verbs, classified: {} });
      }
    } else {
      const current = wordClasses[index] || 'none';
      let next: 'none' | 'O' | 'Adv' = 'none';
      if (current === 'none') next = 'O';
      else if (current === 'O') next = 'Adv';
      else next = 'none';

      const updated = { ...wordClasses, [index]: next };
      setWordClasses(updated);

      if (onSelectionChange) {
        const classified: Record<string, 'O' | 'Adv'> = {};
        words.forEach((w, i) => {
          if (updated[i] === 'O' || updated[i] === 'Adv') {
            classified[w] = updated[i] as 'O' | 'Adv';
          }
        });
        onSelectionChange({ subjects: [], verbs: [], classified });
      }
    }
  };

  return (
    <div className="p-4 bg-white border-2 border-line rounded-lg space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-2">
        <span className="text-xs font-bold text-ink-muted">
          {mode === 'subject_verb'
            ? 'Bấm 1 lần để Gạch chân Chủ ngữ (S) — Bấm lần 2 để Khoanh tròn Động từ (V) — Bấm lần 3 để Hủy'
            : 'Bấm 1 lần để gán nhãn Tân ngữ (O) — Bấm lần 2 để gán nhãn Trạng từ (Adv) — Bấm lần 3 để Hủy'}
        </span>
        <div className="flex items-center gap-2 text-xs">
          {mode === 'subject_verb' ? (
            <>
              <span className="inline-flex items-center gap-1 font-bold text-primary">
                <span className="w-2.5 h-0.5 bg-primary rounded-full"></span> Chủ ngữ
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                <span className="w-2 h-2 rounded-full border-2 border-emerald-600"></span> Động từ
              </span>
            </>
          ) : (
            <>
              <Badge variant="primary">O (Object)</Badge>
              <Badge variant="warning">Adv (Adverb)</Badge>
            </>
          )}
        </div>
      </div>

      {/* Interactive Sentence Tokens */}
      <div className="flex flex-wrap items-center gap-2 py-2 text-base md:text-lg font-medium text-ink">
        {words.map((word, idx) => {
          const role = wordRoles[idx] || 'none';
          const cls = wordClasses[idx] || 'none';

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleWordClick(idx)}
              className={clsx(
                'relative px-2 py-1 rounded-md transition-all select-none cursor-pointer',
                mode === 'subject_verb' && {
                  'hover:bg-gray-100': role === 'none',
                  'border-b-4 border-primary font-bold text-primary bg-blue-50/50': role === 'subject',
                  'border-2 border-emerald-500 rounded-full font-bold text-emerald-700 bg-emerald-50/50 shadow-sm': role === 'verb',
                },
                mode === 'object_adverb' && {
                  'hover:bg-gray-100': cls === 'none',
                  'bg-blue-100 text-primary-dark font-bold ring-2 ring-primary': cls === 'O',
                  'bg-amber-100 text-amber-900 font-bold ring-2 ring-amber-400': cls === 'Adv',
                }
              )}
            >
              <span>{word}</span>
              {mode === 'subject_verb' && role === 'subject' && (
                <span className="absolute -top-2 -right-1 text-[9px] font-black bg-primary text-white px-1 rounded-full">
                  S
                </span>
              )}
              {mode === 'subject_verb' && role === 'verb' && (
                <span className="absolute -top-2 -right-1 text-[9px] font-black bg-emerald-600 text-white px-1 rounded-full">
                  V
                </span>
              )}
              {mode === 'object_adverb' && cls !== 'none' && (
                <span className="absolute -top-2 -right-1 text-[9px] font-black bg-ink text-white px-1 rounded-full">
                  {cls}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default InlineWordSelector;

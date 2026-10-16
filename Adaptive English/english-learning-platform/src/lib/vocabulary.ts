import type { VocabularyWord, VocabState } from '@/types';
import { dayKey } from './learning';

export function mapPersonalWord(row: any): VocabularyWord {
  const item = row.vocabItem;
  return {
    id: row.id, term: item.word, phonetic: item.ipa || '', partOfSpeech: item.type || '', definition: item.meaning, example: item.example || '',
    cefr: item.pack?.cefrLevel || 'Chưa đánh giá', state: row.state, intervalDays: row.intervalDays,
    nextReviewDate: row.state === 'saved' ? 'Chưa kích hoạt' : row.nextReviewDate ? new Date(row.nextReviewDate).toLocaleDateString('vi-VN') : 'Hôm nay',
    dueAt: row.nextReviewDate ? new Date(row.nextReviewDate).toISOString() : undefined,
    activatedDay: row.activatedAt ? dayKey(new Date(row.activatedAt)) : undefined,
    recallSuccessDays: row.reps, tags: item.dictionarySenseId ? ['Từ điển Anh–Việt'] : [],
    dictionarySenseId: item.dictionarySenseId || undefined, dictionaryWordId: item.dictionaryWordId || undefined,
    source: item.source || undefined, sourceUrl: item.sourceUrl || undefined, license: item.license || undefined,
    definitionLang: item.definitionLang || undefined,
  };
}

/** Aggregate selected senses conservatively: a word is mastered only when every saved sense is mastered. */
export function summarizeWords(cards: Pick<VocabularyWord, 'term' | 'state'>[]) {
  const groups = new Map<string, typeof cards>();
  for (const card of cards) { const key = card.term.normalize('NFC').trim().toLowerCase(); groups.set(key, [...(groups.get(key) || []), card]); }
  return Array.from(groups.entries()).map(([term, senses]) => {
    const priority: VocabState[] = ['relearning', 'saved', 'learning', 'reviewing', 'mastered'];
    return { term, senses: senses.length, state: priority.find(state => senses.some((s: Pick<VocabularyWord, 'term' | 'state'>) => s.state === state))! };
  });
}

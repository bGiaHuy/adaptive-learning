// Quarantine option labels accidentally imported as vocabulary, without deleting user data.
export function isUsableCard(item: { word: string; meaning?: string | null; dictionarySenseId?: number | null; source?: string | null }) {
  if (!item.word?.trim()) return false;
  if (item.dictionarySenseId || item.source) return true;
  return !(/^[A-D]$/i.test(item.word.trim()) && /^[A-D]$/i.test(item.meaning?.trim() || ''));
}
export function activeCard(now = new Date()) {
  return { state: 'learning', activatedAt: now, nextReviewDate: now, stability: 0, difficulty: 5 };
}

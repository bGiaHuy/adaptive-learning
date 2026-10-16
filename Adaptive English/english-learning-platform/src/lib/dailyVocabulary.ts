import { dayKey } from './learning';
import { recommendDictionary, dictionaryAttribution } from './dictionary';
import { isUsableCard } from './cardQuality';

export const basicVocabulary = [
  ['easy', 'adjective', 'dễ', 'This question is easy.'],
  ['learn', 'verb', 'học', 'I learn English every day.'],
  ['practice', 'verb', 'luyện tập', 'We practice speaking together.'],
  ['remember', 'verb', 'nhớ', 'I remember your name.'],
  ['understand', 'verb', 'hiểu', 'Do you understand this word?'],
  ['question', 'noun', 'câu hỏi', 'Please answer the question.'],
  ['answer', 'noun', 'câu trả lời', 'Your answer is correct.'],
  ['friend', 'noun', 'người bạn', 'She is my friend.'],
  ['family', 'noun', 'gia đình', 'My family lives here.'],
  ['school', 'noun', 'trường học', 'I walk to school.'],
  ['book', 'noun', 'quyển sách', 'This book is interesting.'],
  ['water', 'noun', 'nước', 'I drink water every morning.'],
  ['food', 'noun', 'thức ăn', 'The food is delicious.'],
  ['work', 'verb', 'làm việc', 'They work in a hospital.'],
  ['travel', 'verb', 'đi du lịch', 'I like to travel by train.'],
  ['healthy', 'adjective', 'khỏe mạnh', 'Exercise keeps us healthy.'],
  ['important', 'adjective', 'quan trọng', 'Sleep is important.'],
  ['different', 'adjective', 'khác nhau', 'These two words are different.'],
  ['together', 'adverb', 'cùng nhau', 'We study together.'],
  ['tomorrow', 'adverb', 'ngày mai', 'See you tomorrow.'],
  ['listen', 'verb', 'lắng nghe', 'Listen to the recording.'],
  ['speak', 'verb', 'nói', 'Can you speak slowly?'],
  ['write', 'verb', 'viết', 'Write a short sentence.'],
  ['read', 'verb', 'đọc', 'I read before bed.'],
].map(([word, type, meaning, example], index) => ({ id: `basic-${index}`, word, type, meaning, example }));

const termKey = (word: string) => word.trim().normalize('NFC').toLowerCase();
/** Count today's completed work as well as outstanding cards; never refill after each rating. */
export function dailyPlan(rows: any[], dailyLimit: number, now = new Date()) {
  const target = Math.min(10, Math.max(0, dailyLimit));
  const today = dayKey(now);
  const covered = new Set(rows.filter(row =>
    (row.state !== 'saved' && (!row.nextReviewDate || new Date(row.nextReviewDate) <= now)) ||
    (row.lastReviewedAt && dayKey(new Date(row.lastReviewedAt)) === today) ||
    (row.activatedAt && dayKey(new Date(row.activatedAt)) === today)
  ).map(row => termKey(row.vocabItem.word)));
  const activated = new Set(rows.filter(row => row.activatedAt && dayKey(new Date(row.activatedAt)) === today).map(row => termKey(row.vocabItem.word)));
  return { target, missing: Math.max(0, Math.min(target - covered.size, dailyLimit - activated.size)), covered: covered.size, coveredTerms: Array.from(covered) };
}

/** Serializable transaction plus bounded retries makes concurrent tabs safe. */
export async function ensureDailyVocabulary(prisma: any, user: { id: string; vocabDailyLimit: number }, now = new Date()) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await prisma.$transaction(async (tx: any) => {
        const allRows = await tx.userVocab.findMany({ where: { userId: user.id }, include: { vocabItem: true } });
        const rows = allRows.filter((row: any) => isUsableCard(row.vocabItem));
        const plan = dailyPlan(rows, user.vocabDailyLimit, now);
        let remaining = plan.missing;
        const known = new Set<string>(rows.map((row: any) => termKey(row.vocabItem.word)));
        const picked = new Set<string>();
        for (const row of rows.filter((row: any) => row.state === 'saved')) {
          const key = termKey(row.vocabItem.word);
          if (!remaining) break;
          if (picked.has(key) || plan.coveredTerms.includes(key)) continue;
          await tx.userVocab.update({ where: { id: row.id }, data: { state: 'learning', activatedAt: now, nextReviewDate: now } });
          picked.add(key); remaining--;
        }
        if (remaining) {
          // Only packs assigned to this learner's classrooms, never another teacher's private pack.
          const candidates = await tx.vocabularyItem.findMany({ where: { pack: { assignments: { some: { status: 'published', classroom: { members: { some: { studentId: user.id } } } } } } }, orderBy: { id: 'asc' }, take: 500 });
          for (const item of candidates) {
            const key = termKey(item.word);
            if (!remaining) break;
            if (known.has(key) || picked.has(key) || !item.meaning?.trim() || !isUsableCard(item)) continue;
            await tx.userVocab.upsert({ where: { userId_vocabId: { userId: user.id, vocabId: item.id } }, update: {}, create: { userId: user.id, vocabId: item.id, state: 'learning', activatedAt: now, nextReviewDate: now, difficulty: 5 } });
            picked.add(key); remaining--;
          }
        }
        for (const item of basicVocabulary) {
          if (!remaining) break;
          if (known.has(item.word) || picked.has(item.word)) continue;
          const vocab = await tx.vocabularyItem.upsert({ where: { id: item.id }, update: {}, create: { ...item, ipa: '', definitionLang: 'vi', source: 'Adaptive English — học liệu cơ bản' } });
          await tx.userVocab.upsert({ where: { userId_vocabId: { userId: user.id, vocabId: vocab.id } }, update: {}, create: { userId: user.id, vocabId: vocab.id, state: 'learning', activatedAt: now, nextReviewDate: now, difficulty: 5 } });
          picked.add(item.word); remaining--;
        }
        if (remaining) {
          let recommendations: ReturnType<typeof recommendDictionary> = [];
          try { recommendations = recommendDictionary(Array.from(known).concat(Array.from(picked)), remaining); } catch { /* Return an explicit shortage if the read-only source is unavailable. */ }
          for (const { entry, sense } of recommendations) {
            const vocab = await tx.vocabularyItem.upsert({ where: { dictionarySenseId: sense.id }, update: {}, create: { dictionarySenseId: sense.id, dictionaryWordId: entry.id, word: entry.word, type: sense.partOfSpeech, meaning: sense.definition, example: sense.example || null, ipa: entry.pronunciations.map(p => p.ipa).join(' · '), definitionLang: 'vi', source: sense.source, sourceUrl: dictionaryAttribution.url, license: dictionaryAttribution.license } });
            await tx.userVocab.upsert({ where: { userId_vocabId: { userId: user.id, vocabId: vocab.id } }, update: {}, create: { userId: user.id, vocabId: vocab.id, state: 'learning', activatedAt: now, nextReviewDate: now, difficulty: 5 } });
            picked.add(entry.word); remaining--;
          }
        }
        return { minimum: plan.target, added: picked.size, shortage: remaining };
      }, { isolationLevel: 'Serializable', timeout: 15000 });
    } catch (error: any) { if (error.code !== 'P2034' || attempt === 2) throw error; }
  }
}

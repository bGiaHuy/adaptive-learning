import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { dictionaryAttribution, getDictionarySense } from '@/lib/dictionary';
import { mapPersonalWord, summarizeWords } from '@/lib/vocabulary';
import { dayKey } from '@/lib/learning';
import { ensureDailyVocabulary, basicVocabulary } from '@/lib/dailyVocabulary';
import { activeCard, isUsableCard } from '@/lib/cardQuality';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const allUserVocabs = await prisma.userVocab.findMany({
      where: { userId: user.id },
      include: {
        vocabItem: { include: { pack: true } },
        reviewHistory: {
          orderBy: { reviewedAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { nextReviewDate: 'asc' },
    });

    const userVocabs = allUserVocabs.filter(row => isUsableCard(row.vocabItem));
    const now = new Date();
    const todayStr = dayKey(now);

    // 1. Queue Due: Các từ đang trong vòng lặp học tập có lịch ôn <= bây giờ
    const dueWords = userVocabs.filter(
      (v) => v.state !== 'saved' && (!v.nextReviewDate || new Date(v.nextReviewDate) <= now)
    );

    // 2. Queue Saved (Kệ lưu trữ): Các từ đã lưu nhưng chưa kích hoạt vào học
    const savedWords = userVocabs.filter((v) => v.state === 'saved');

    // 3. Queue New: Các từ mới được kích hoạt học lần đầu (reps = 0 hoặc kích hoạt hôm nay)
    const newWords = userVocabs.filter(
      (v) => v.state === 'learning' && v.reps === 0
    );

    // 4. Queue Reviewing (Đang củng cố trí nhớ)
    const reviewingWords = userVocabs.filter((v) => v.state === 'reviewing');

    // 5. Queue Mastered (Đã ghi nhớ ổn định)
    const masteredWords = userVocabs.filter((v) => v.state === 'mastered');

    // 6. Queue Relearning (Quên từ - cần học lại)
    const relearningWords = userVocabs.filter((v) => v.state === 'relearning');

    // Tính tổng số từ mới đã kích hoạt hôm nay trên toàn bộ các deck
    const activatedTodayCount = userVocabs.filter(
      (v) => v.activatedAt && dayKey(new Date(v.activatedAt)) === todayStr
    ).length;

    const counts = {
      saved: savedWords.length,
      new: newWords.length,
      due: dueWords.length,
      reviewing: reviewingWords.length,
      relearning: relearningWords.length,
      mastered: masteredWords.length,
      total: userVocabs.length,
      activatedToday: activatedTodayCount,
    };

    const mapWord = (uv: any) => ({
      ...mapPersonalWord(uv),
      id: uv.id,
      vocabId: uv.vocabId,
      word: uv.vocabItem.word,
      term: uv.vocabItem.word,
      phonetic: uv.vocabItem.ipa,
      partOfSpeech: uv.vocabItem.type,
      definition: uv.vocabItem.meaning,
      example: uv.vocabItem.example,
      state: uv.state,
      stability: uv.stability,
      difficulty: uv.difficulty,
      intervalDays: uv.intervalDays,
      lastRating: uv.lastRating,
      nextReviewDate: mapPersonalWord(uv).nextReviewDate,
      lastReviewedAt: uv.lastReviewedAt,
      activatedAt: uv.activatedAt,
      reps: uv.reps,
      lapses: uv.lapses,
      recentReviews: uv.reviewHistory ? uv.reviewHistory.map((h: any) => ({
        rating: h.rating,
        ratingLabel: h.ratingLabel,
        stability: h.stability,
        difficulty: h.difficulty,
        intervalDays: h.intervalDays,
        reviewedAt: h.reviewedAt,
      })) : [],
    });

    return NextResponse.json({
      words: userVocabs.map(mapWord),
      wordMastery: summarizeWords(userVocabs.map(mapPersonalWord)),
      queues: {
        saved: savedWords.map(mapWord),
        new: newWords.map(mapWord),
        due: dueWords.map(mapWord),
        reviewing: reviewingWords.map(mapWord),
        relearning: relearningWords.map(mapWord),
        mastered: masteredWords.map(mapWord),
        savedIds: savedWords.map((w) => w.id),
        newIds: newWords.map((w) => w.id),
        dueIds: dueWords.map((w) => w.id),
        reviewingIds: reviewingWords.map((w) => w.id),
        masteredIds: masteredWords.map((w) => w.id),
      },
      counts,
      dailyNewLimit: user.vocabDailyLimit,
      masteryIntervalDays: user.masteryIntervalDays,
      settings: {
        dailyLimit: user.vocabDailyLimit, // 5, 10, 20, custom, 9999 (unlimited)
        dailyNewLimit: user.vocabDailyLimit,
        isUnlimited: user.vocabDailyLimit >= 9999,
        unlimitedWarning:
          'Không khuyến nghị: Chế độ Không Giới Hạn dễ gây quá tải ôn tập và giảm tỷ lệ duy trì lâu dài. Khuyến nghị 10-20 từ/ngày theo tiêu chuẩn FSRS.',
        masteryIntervalDays: user.masteryIntervalDays,
        masteryRuleNote:
          'Quy tắc Đạt Thành Thạo: Ngưỡng khoảng cách ôn tập >= ' +
          user.masteryIntervalDays +
          ' ngày. Thuật toán áp dụng tiêu chuẩn Adaptive Study dựa trên FSRS, không tuyên bố là chuẩn độc quyền của Anki.',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const body = await request.json();
    const { word, type, ipa, meaning, example, bulkAddFromPackId, wordsList, action, userVocabId } = body;

    if (action === 'prepare-daily') {
      if (user.role !== 'student') return NextResponse.json({ daily: null });
      return NextResponse.json({ daily: await ensureDailyVocabulary(prisma, user) });
    }
    if (body.basicWordId !== undefined) {
      const basic = basicVocabulary.find(item => item.id === body.basicWordId);
      if (!basic) return NextResponse.json({ error: 'Không tìm thấy từ cơ bản.' }, { status: 400 });
      const saved = await prisma.$transaction(async tx => {
        const item = await tx.vocabularyItem.upsert({ where: { id: basic.id }, update: {}, create: { ...basic, ipa: '', definitionLang: 'vi', source: 'Adaptive English — học liệu cơ bản' } });
        const existing = await tx.userVocab.findUnique({ where: { userId_vocabId: { userId: user.id, vocabId: item.id } } });
        return tx.userVocab.upsert({ where: { userId_vocabId: { userId: user.id, vocabId: item.id } }, update: existing?.state === 'saved' ? activeCard() : {}, create: { userId: user.id, vocabId: item.id, ...activeCard() }, include: { vocabItem: { include: { pack: true } } } });
      });
      return NextResponse.json({ success: true, word: mapPersonalWord(saved) });
    }

    // Only the sense ID is accepted; definitions and provenance come from the read-only dictionary.
    if (body.dictionarySenseId !== undefined) {
      const selected = getDictionarySense(body.dictionarySenseId);
      if (!selected) return NextResponse.json({ error: 'Không tìm thấy nghĩa tiếng Anh đã chọn.' }, { status: 400 });
      const { entry, sense } = selected;
      const saved = await prisma.$transaction(async tx => {
        const item = await tx.vocabularyItem.upsert({
          where: { dictionarySenseId: sense.id }, update: {},
          create: { dictionarySenseId: sense.id, dictionaryWordId: entry.id, word: entry.word, type: sense.partOfSpeech, ipa: entry.pronunciations.map(p => p.ipa).join(' · '), meaning: sense.definition, example: sense.example || null, definitionLang: sense.definitionLang, source: sense.source, sourceUrl: dictionaryAttribution.url, license: dictionaryAttribution.license },
        });
        const existing = await tx.userVocab.findUnique({ where: { userId_vocabId: { userId: user.id, vocabId: item.id } } });
        return tx.userVocab.upsert({ where: { userId_vocabId: { userId: user.id, vocabId: item.id } }, update: existing?.state === 'saved' ? activeCard() : {}, create: { userId: user.id, vocabId: item.id, ...activeCard() }, include: { vocabItem: { include: { pack: true } } } });
      });
      return NextResponse.json({ success: true, word: mapPersonalWord(saved), message: 'Đã thêm từ vào hàng đợi học.' });
    }

    // ACTION: Kích hoạt từ từ hàng đợi "saved" vào "learning" (tuân thủ giới hạn hàng ngày)
    if (action === 'activate') {
      if (!userVocabId) {
        return NextResponse.json({ error: 'Thiếu mã từ cần kích hoạt' }, { status: 400 });
      }

      const updated = await prisma.$transaction(async tx => {
        const all = await tx.userVocab.findMany({ where: { userId: user.id }, include: { vocabItem: true } });
        const target = all.find(row => row.id === userVocabId);
        if (!target) throw new Error('Không tìm thấy từ trong kho của bạn.');
        if (target.state !== 'saved') throw new Error('Từ này đã ở trong hàng đợi học.');
        const now = new Date();
        const activated = summarizeWords(all.filter(row => row.activatedAt && dayKey(row.activatedAt) === dayKey(now)).map(row => ({ term: row.vocabItem.word, state: row.state as any })));
        const alreadyCounted = activated.some(row => row.term === target.vocabItem.word.trim().toLowerCase());
        if (!alreadyCounted && user.vocabDailyLimit < 9999 && activated.length >= user.vocabDailyLimit) throw new Error(`Đã đạt hạn mức ${user.vocabDailyLimit} từ mới hôm nay. Bạn có thể lưu để học ngày mai.`);
        if (all.filter(row => row.state !== 'saved' && (!row.nextReviewDate || row.nextReviewDate <= now)).length > 25) throw new Error('Hãy ôn bớt thẻ đến hạn trước khi thêm từ mới.');
        return tx.userVocab.update({ where: { id: target.id }, data: { state: 'learning', activatedAt: now, nextReviewDate: now } });
      }).catch(reason => ({ error: reason instanceof Error ? reason.message : 'Chưa kích hoạt được từ.' }));
      if ('error' in updated) return NextResponse.json(updated, { status: 400 });

      return NextResponse.json({ success: true, activated: updated });
    }

    // ACTION: Import từ Thematic Pack -> BẮT BUỘC lưu ở trạng thái "saved" (KHÔNG tự kích hoạt)
    if (bulkAddFromPackId) {
      const packWords = await prisma.vocabularyItem.findMany({
        where: { packId: bulkAddFromPackId },
      });

      let addedCount = 0;
      for (const pw of packWords) {
        if (!isUsableCard(pw)) continue;
        const existing = await prisma.userVocab.findUnique({
          where: { userId_vocabId: { userId: user.id, vocabId: pw.id } },
        });

        if (!existing) {
          await prisma.userVocab.create({
            data: {
              userId: user.id,
              vocabId: pw.id,
              ...activeCard(),
            },
          });
          addedCount++;
        }
      }

      return NextResponse.json({
        success: true,
        addedCount,
        message: `Đã thêm ${addedCount} từ vào hàng đợi học.`,
      });
    }

    // ACTION: Import danh sách text / CSV -> BẮT BUỘC lưu ở trạng thái "saved"
    if (Array.isArray(wordsList) && wordsList.length > 0) {
      let addedCount = 0;
      for (const raw of wordsList) {
        const cleanWord = typeof raw === 'string' ? raw.trim() : raw.word?.trim();
        if (!cleanWord) continue;
        if (!isUsableCard({ word: cleanWord, meaning: raw.meaning })) continue;

        let vocabItem = await prisma.vocabularyItem.findFirst({
          where: { word: { equals: cleanWord }, dictionarySenseId: null, meaning: raw.meaning || 'Từ vựng đã nhập' },
        });

        if (!vocabItem) {
          vocabItem = await prisma.vocabularyItem.create({
            data: {
              word: cleanWord,
              type: raw.type || 'noun',
              ipa: raw.ipa || `/${cleanWord}/`,
              meaning: raw.meaning || 'Từ vựng đã nhập',
              example: raw.example || null,
            },
          });
        }

        const existing = await prisma.userVocab.findUnique({
          where: { userId_vocabId: { userId: user.id, vocabId: vocabItem.id } },
        });

        if (!existing) {
          await prisma.userVocab.create({
            data: {
              userId: user.id,
              vocabId: vocabItem.id,
              ...activeCard(),
            },
          });
          addedCount++;
        }
      }

      return NextResponse.json({
        success: true,
        addedCount,
        message: `Đã thêm ${addedCount} từ vào hàng đợi học.`,
      });
    }

    // ACTION: Thêm 1 từ đơn lẻ -> BẮT BUỘC lưu ở trạng thái "saved"
    if (word) {
      const cleanWord = word.trim();
      if (!isUsableCard({ word: cleanWord, meaning })) return NextResponse.json({ error: 'Nhãn đáp án không phải thẻ từ vựng.' }, { status: 400 });
      let vocabItem = await prisma.vocabularyItem.findFirst({
        where: { word: { equals: cleanWord }, dictionarySenseId: null, meaning: meaning || 'Chưa có định nghĩa' },
      });

      if (!vocabItem) {
        vocabItem = await prisma.vocabularyItem.create({
          data: {
            word: cleanWord,
            type: type || 'noun',
            ipa: ipa || `/${cleanWord}/`,
            meaning: meaning || 'Chưa có định nghĩa',
            example: example || null,
          },
        });
      }

      const existing = await prisma.userVocab.findUnique({
        where: { userId_vocabId: { userId: user.id, vocabId: vocabItem.id } },
      });

      if (existing) {
        return NextResponse.json({ error: 'Từ vựng này đã có trong tủ của bạn' }, { status: 400 });
      }

      const userVocab = await prisma.userVocab.create({
        data: {
          userId: user.id,
          vocabId: vocabItem.id,
          ...activeCard(),
        },
      });

      return NextResponse.json({ success: true, userVocab });
    }

    return NextResponse.json({ error: 'Dữ liệu yêu cầu không hợp lệ' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

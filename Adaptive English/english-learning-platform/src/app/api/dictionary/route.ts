import { NextResponse } from 'next/server';
import { dictionaryAttribution, dictionaryStats, lookupDictionary, suggestDictionary } from '@/lib/dictionary';
import { basicVocabulary } from '@/lib/dailyVocabulary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('q') || '';
  if (query.length > 100) return NextResponse.json({ error: 'Tra cứu tối đa 100 ký tự.' }, { status: 400 });
  const basic = basicVocabulary.find(item => item.word === query.trim().toLowerCase());
  // Original app-authored definitions supplement gaps in the external dictionary.
  const fallback = basic ? { entry: { word: basic.word, pronunciations: [], senses: [{ id: basic.id, definition: basic.meaning, partOfSpeech: basic.type, example: basic.example, definitionLang: 'vi', source: 'Adaptive English' }] }, suggestions: [], attribution: { name: 'Adaptive English — học liệu cơ bản', url: 'https://adaptiveenglish.vercel.app', license: 'Học liệu nội bộ', licenseUrl: 'https://adaptiveenglish.vercel.app' } } : null;
  try {
    const entry = lookupDictionary(query);
    if (!entry && fallback) return NextResponse.json(fallback);
    return NextResponse.json({ entry, suggestions: suggestDictionary(query), stats: dictionaryStats(), attribution: dictionaryAttribution });
  } catch {
    if (fallback) return NextResponse.json(fallback);
    return NextResponse.json({ error: 'Chưa mở được kho từ điển. Vui lòng thử lại sau.' }, { status: 503 });
  }
}

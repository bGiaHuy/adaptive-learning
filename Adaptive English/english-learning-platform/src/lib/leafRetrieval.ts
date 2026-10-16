import { normalizeStudyText } from './chatSafety';

export interface LeafSource { id: string; title: string; content: string; source: string; href: string }
const stopWords = new Set('minh toi ban hay giup dich tu nghia la gi giai thich cho ve mot nhung va cua trong co the duoc voi hoc the a an is are of to for and what how please explain meaning'.split(' '));
const aliases: [string, string][] = [
  ['hien tai hoan thanh', 'present perfect'], ['qua khu hoan thanh', 'past perfect'], ['hien tai tiep dien', 'present continuous'],
  ['hien tai don', 'present simple'], ['qua khu don', 'past simple'], ['cau dieu kien', 'conditionals conditional'],
  ['cau bi dong', 'passive voice'], ['so sanh', 'comparatives comparison'], ['menh de quan he', 'relative clauses'],
  ['tu vung', 'vocabulary'], ['gioi tu', 'prepositions'], ['hoc cach quang', 'spaced repetition'],
];
export function leafTokens(text: string): string[] {
  let normalized = normalizeStudyText(text);
  for (const [phrase, expansion] of aliases) if (normalized.includes(phrase)) normalized += ` ${expansion}`;
  return normalized.split(' ').filter(word => word.length > 1 && !stopWords.has(word));
}

/** BM25 lexical retrieval: stable local ranking, no remote embedding dependency. */
export function rankLeafSources(query: string, documents: LeafSource[], limit = 4): LeafSource[] {
  const terms = Array.from(new Set(leafTokens(query)));
  if (!terms.length || !documents.length) return [];
  const tokenized = documents.map(document => leafTokens(`${document.title} ${document.title} ${document.content}`));
  const averageLength = tokenized.reduce((sum, tokens) => sum + tokens.length, 0) / tokenized.length || 1;
  const frequency = new Map(terms.map(term => [term, tokenized.filter(tokens => tokens.includes(term)).length]));
  const scored = documents.map((document, index) => {
    const tokens = tokenized[index];
    const score = terms.reduce((sum, term) => {
      const tf = tokens.filter(token => token === term).length;
      const df = frequency.get(term) || 0;
      const idf = Math.log(1 + (documents.length - df + 0.5) / (df + 0.5));
      return sum + (tf ? idf * (tf * 2.2) / (tf + 1.2 * (0.25 + 0.75 * tokens.length / averageLength)) : 0);
    }, 0);
    return { document, score };
  });
  return scored.filter(item => item.score > 0).sort((a, b) => b.score - a.score || a.document.id.localeCompare(b.document.id)).slice(0, limit).map(item => item.document);
}

export function extractLeafPreferences(message: string): { key: string; content: string }[] {
  const normalized = normalizeStudyText(message);
  const memories: { key: string; content: string }[] = [];
  const minutes = normalized.match(/(?:hoc|on|danh)\s+(?:khoang\s+)?(\d{1,3})\s+phut\s+(?:moi|mot|hang)\s+ngay/);
  if (minutes && Number(minutes[1]) > 0 && Number(minutes[1]) <= 240) memories.push({ key: 'daily_minutes', content: `Muốn học ${Number(minutes[1])} phút mỗi ngày.` });
  if (/\b(?:minh|toi)\s+(?:thich|muon|uu tien)\b/.test(normalized) && /\b(?:vi du|giai thich|tieng viet|ngan gon|tung buoc)\b/.test(normalized)) {
    const preferences = [normalized.includes('vi du') ? 'có ví dụ' : '', normalized.includes('ngan') ? 'ngắn gọn' : '', normalized.includes('tung buoc') ? 'từng bước' : '', normalized.includes('tieng viet') ? 'bằng tiếng Việt' : ''].filter(Boolean);
    if (preferences.length) memories.push({ key: 'explanation_style', content: `Thích giải thích ${preferences.join(', ')}.` });
  }
  const target = normalized.match(/(?:muc tieu|trinh do|muon dat)\s+(?:la\s+)?(a1|a2|b1|b2|c1|c2)\b/);
  if (target) memories.push({ key: 'cefr_goal', content: `Mục tiêu trình độ ${target[1].toUpperCase()}.` });
  return memories;
}

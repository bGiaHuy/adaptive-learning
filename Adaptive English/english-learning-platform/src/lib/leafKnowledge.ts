import prisma from './prisma';
import { thematicPackUnit2 } from './thematicPackUnit2';
import { rankLeafSources, type LeafSource } from './leafRetrieval';

const grammar: [string, string, string][] = [
  ['present-simple', 'Hiện tại đơn · Present simple', 'Dùng cho thói quen và sự thật. S + V; he/she/it thêm s/es. Phủ định do/does not + V. Ví dụ: Linh reads every evening.'],
  ['present-continuous', 'Hiện tại tiếp diễn · Present continuous', 'Diễn tả việc đang xảy ra: S + am/is/are + V-ing. Ví dụ: I am watering the plants.'],
  ['present-perfect', 'Hiện tại hoàn thành · Present perfect', 'S + have/has + V3/ed. Liên hệ quá khứ với hiện tại; kinh nghiệm hoặc trạng thái còn tiếp tục. Since đi với mốc thời gian, for đi với khoảng thời gian. Ví dụ: I have known Mai for two years.'],
  ['past-perfect', 'Quá khứ hoàn thành · Past perfect', 'S + had + V3/ed. Một việc hoàn tất trước việc khác trong quá khứ. Ví dụ: We had cleaned the room before our guests came. Không dùng chỉ vì câu có một mốc quá khứ.'],
  ['past-simple', 'Quá khứ đơn · Past simple', 'Hành động đã kết thúc: S + V2/ed; phủ định did not + V. Ví dụ: We visited a museum yesterday.'],
  ['conditionals', 'Câu điều kiện · Conditionals', 'Loại 0: If + hiện tại đơn, hiện tại đơn. Loại 1: If + hiện tại đơn, will + V. Loại 2: If + quá khứ đơn, would + V. Loại 3: If + quá khứ hoàn thành, would have + V3/ed; giả định trái với quá khứ. Ví dụ khác: If I had saved more money, I would have bought a bicycle.'],
  ['passive', 'Câu bị động · Passive voice', 'Dùng khi nhấn mạnh đối tượng chịu tác động: be chia theo thì + V3/ed. Ví dụ: These postcards were painted by local artists.'],
  ['comparison', 'So sánh · Comparatives', 'Tính từ ngắn thường thêm er; dài dùng more; so sánh nhất dùng the + est hoặc the most. Ví dụ: This river is wider than that stream.'],
  ['relative', 'Mệnh đề quan hệ · Relative clauses', 'Who chỉ người, which chỉ vật, where chỉ nơi chốn. Ví dụ: The woman who lives next door is a gardener.'],
  ['prepositions', 'Giới từ · Prepositions', 'In thường đi với tháng/năm; on với ngày/thứ; at với giờ. Một số cụm cố định cần học theo ngữ cảnh. Ví dụ: The club meets on Fridays at five.'],
  ['spacing', 'Ôn từ vựng cách quãng · Spaced repetition', 'Ôn lại vào các khoảng cách tăng dần và tự nhớ trước khi lật thẻ. Học từ theo cụm và đặt câu mới. Lịch ôn của web phụ thuộc kết quả nhớ của từng từ.'],
];
let indexReady: Promise<void> | undefined;
export function ensureLeafIndex(): Promise<void> {
  if (!indexReady) indexReady = (async () => {
    const chunks: LeafSource[] = [
      ...thematicPackUnit2.vocabulary.map(word => ({ id: `unit2:vocab:${word.no}`, title: word.word, content: `${word.word} ${word.type} ${word.ipa}: ${word.meaning}`, source: 'Unit 2: Healthy Living · Từ vựng', href: '/student/learn' })),
      ...grammar.map(([id, title, content]) => ({ id: `grammar:${id}`, title, content, source: 'Ghi chú ngữ pháp Leaf AI', href: '/student/learn' })),
    ];
    // Index explanations and dictionary entries only; never assessment questions or answer keys.
    await prisma.$transaction(chunks.map(chunk => prisma.leafKnowledgeChunk.upsert({ where: { id: chunk.id }, create: chunk, update: chunk })));
  })().catch(error => { indexReady = undefined; throw error; });
  return indexReady;
}

export async function retrieveLeafKnowledge(userId: string, query: string): Promise<LeafSource[]> {
  await ensureLeafIndex();
  const [shared, personal] = await Promise.all([
    prisma.leafKnowledgeChunk.findMany(),
    prisma.userVocab.findMany({ where: { userId }, include: { vocabItem: true }, take: 500 }),
  ]);
  const documents: LeafSource[] = [...shared, ...personal.map(row => ({
    id: `personal:${row.id}`, title: row.vocabItem.word,
    content: `${row.vocabItem.word} ${row.vocabItem.type} ${row.vocabItem.ipa}: ${row.vocabItem.meaning}. ${row.vocabItem.example || ''}`,
    source: 'Từ vựng đã lưu của bạn', href: '/student/vocabulary',
  }))];
  return rankLeafSources(query, documents).map(source => ({ ...source, content: source.content.slice(0, 1800) }));
}

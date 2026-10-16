import prisma from './prisma';
import { extractLeafPreferences, rankLeafSources, leafTokens } from './leafRetrieval';

export function validConversationId(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function loadLeafMemory(userId: string, query: string, conversationId: string) {
  const terms = Array.from(new Set(leafTokens(query))).slice(0, 8);
  const [preferences, recent, older] = await Promise.all([
    prisma.leafMemory.findMany({ where: { userId, conversationId }, orderBy: { updatedAt: 'desc' }, take: 12 }),
    prisma.leafChatMessage.findMany({ where: { userId, conversationId, role: 'user', archived: false }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 6 }),
    prisma.leafChatMessage.findMany({ where: { userId, conversationId, archived: false, mode: 'learning', ...(terms.length ? { OR: terms.map(term => ({ searchText: { contains: term } })) } : {}) }, orderBy: { createdAt: 'desc' }, take: 80 }),
  ]);
  const remembered = rankLeafSources(query, older.map(message => ({ id: message.id, title: message.role, content: message.content, source: 'Cuộc trò chuyện trước', href: '' })), 4);
  return { history: recent.reverse().map(message => message.content.slice(0, 1200)), facts: preferences.map(memory => memory.content), remembered: remembered.map(message => message.content.slice(0, 800)) };
}

export async function saveLeafTurn(userId: string, message: string, reply: string, mode: string, sources: unknown, conversationId: string) {
  const preferences = mode === 'learning' ? extractLeafPreferences(message) : [];
  await prisma.$transaction([
    prisma.leafChatMessage.create({ data: { userId, conversationId, role: 'user', content: message, searchText: leafTokens(message).join(' '), mode } }),
    prisma.leafChatMessage.create({ data: { userId, conversationId, role: 'assistant', content: reply, searchText: leafTokens(reply).join(' '), mode, sourcesJson: JSON.stringify(sources) } }),
    ...preferences.map(preference => prisma.leafMemory.upsert({ where: { userId_key: { userId, key: `${conversationId}:${preference.key}` } }, create: { userId, conversationId, key: `${conversationId}:${preference.key}`, content: preference.content }, update: { content: preference.content } })),
  ]);
}

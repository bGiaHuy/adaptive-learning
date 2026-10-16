import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { initialLessons } from '@/lib/mockData';
import { placementQuestions } from '@/lib/placementQuestions';
import { replyToStudyChat } from '@/lib/studyChat';
import type { StudyChatContext } from '@/lib/chatSafety';
import type { Question } from '@/types';
import { retrieveLeafKnowledge } from '@/lib/leafKnowledge';
import { loadLeafMemory, saveLeafTurn, validConversationId } from '@/lib/leafMemory';

const knownPrompts = [...placementQuestions.map(q => q.prompt), ...initialLessons.flatMap(lesson => lesson.questions.map(q => q.prompt))];

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Vui lòng đăng nhập để trò chuyện.' }, { status: 401 });
    const body = await request.json();
    if (!validConversationId(body.conversationId)) return NextResponse.json({ error: 'Vui lòng bắt đầu cuộc chat mới.' }, { status: 400 });
    const conversationId = body.conversationId;
    if (typeof body.message !== 'string' || !body.message.trim() || body.message.length > 2000) return NextResponse.json({ error: 'Tin nhắn cần từ 1 đến 2000 ký tự.' }, { status: 400 });
    const path = typeof body.context?.path === 'string' ? body.context.path.slice(0, 300) : '';
    const questionId = typeof body.context?.questionId === 'string' ? body.context.questionId : '';
    const screenText = typeof body.context?.screenText === 'string' ? body.context.screenText.slice(0, 6000) : '';
    const context: StudyChatContext = { active: /^\/student\/(?:placement-test$|learn\/[^/]+\/[^/]+|workspace\/|classroom\/[^/]+\/assignment\/)/.test(path), prompt: screenText, answers: [] };
    // Resolve assessed material on the server. Client flags such as completed/canReveal are never used.
    const lessonMatch = path.match(/^\/student\/learn\/([^/]+)\/([^/]+)/);
    const lesson = lessonMatch && initialLessons.find(l => l.id === lessonMatch[2] && l.skill === lessonMatch[1]);
    const question = path === '/student/placement-test'
      ? placementQuestions.find(q => q.id === questionId)
      : lesson ? lesson.questions.find((q: Question) => q.id === questionId) : undefined;
    if (question) {
      context.prompt = JSON.stringify({ prompt: question.prompt, passage: question.passage, options: question.options });
      const answer = 'correct' in question ? question.correct : question.correctAnswer;
      context.answers = Array.isArray(answer) ? answer : [answer];
      const option = question.options?.find((o: { id: string; text: string }) => o.id === answer);
      if (option) context.answers.push(option.text);
    } else if (lesson) {
      context.prompt = lesson.questions.map((q: Question) => q.prompt).join('\n').slice(0, 6000);
    } else if (path === '/student/placement-test') {
      context.prompt = placementQuestions.map(q => q.prompt).join('\n').slice(0, 6000);
    }
    const assignmentMatch = path.match(/^\/student\/classroom\/([^/]+)\/assignment\/([^/]+)/);
    if (assignmentMatch) {
      const assignment = await prisma.assignment.findUnique({ where: { id: assignmentMatch[2] }, include: { classroom: { include: { members: true } } } });
      if (!assignment || assignment.classId !== assignmentMatch[1] || (user.role !== 'admin' && assignment.classroom.teacherId !== user.id && !assignment.classroom.members.some(m => m.studentId === user.id))) return NextResponse.json({ error: 'Bạn không có quyền truy cập bài tập này.' }, { status: 403 });
      if (!assignment.allowAiTutor || !assignment.classroom.allowAiAssistance) return NextResponse.json({ error: 'Giáo viên đã tắt trợ giúp AI cho bài này.' }, { status: 403 });
      context.prompt = assignment.promptText;
    }
    const message = body.message.trim();
    const [memory, sources] = await Promise.all([loadLeafMemory(user.id, message, conversationId), retrieveLeafKnowledge(user.id, message)]);
    // Persisted, account-scoped history is authoritative; browser-supplied history is ignored.
    const result = await replyToStudyChat(message, memory.history, context, knownPrompts, { sources, facts: memory.facts, remembered: memory.remembered });
    await saveLeafTurn(user.id, message, result.reply, result.mode, 'sources' in result ? result.sources : [], conversationId);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    // Do not log messages, user data, database URLs, or provider responses here.
    // The error class is enough to make Production failures observable.
    console.error('[leaf-chat] request failed', { name: error instanceof Error ? error.name : 'UnknownError' });
    return NextResponse.json({ error: 'Chatbot chưa phản hồi được. Bạn thử gửi lại sau nhé.' }, { status: 502 });
  }
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 });
  const conversationId = new URL(request.url).searchParams.get('conversationId');
  if (!validConversationId(conversationId)) return NextResponse.json({ error: 'Thiếu mã cuộc chat.' }, { status: 400 });
  const [messages, memories] = await Promise.all([
    prisma.leafChatMessage.findMany({ where: { userId: user.id, conversationId, archived: false }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 40 }),
    prisma.leafMemory.findMany({ where: { userId: user.id, conversationId }, orderBy: { updatedAt: 'desc' }, take: 12 }),
  ]);
  return NextResponse.json({ success: true, messages: messages.reverse().map(message => ({ id: message.id, role: message.role, text: message.content, mode: message.mode, sources: JSON.parse(message.sourcesJson) })), memories: memories.map(memory => ({ id: memory.id, text: memory.content })) }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 });
  const scope = new URL(request.url).searchParams.get('scope');
  const conversationId = new URL(request.url).searchParams.get('conversationId');
  if (!validConversationId(conversationId)) return NextResponse.json({ error: 'Thiếu mã cuộc chat.' }, { status: 400 });
  if (scope === 'history' || scope === 'memory') {
    // Forgetting clears archives too, so deleted preferences cannot be inferred from old chats.
    await prisma.$transaction([prisma.leafMemory.deleteMany({ where: { userId: user.id, conversationId } }), prisma.leafChatMessage.deleteMany({ where: { userId: user.id, conversationId } })]);
  } else return NextResponse.json({ error: 'Phạm vi xóa không hợp lệ.' }, { status: 400 });
  return NextResponse.json({ success: true });
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  const assignment = await prisma.assignment.findUnique({ where: { id: params.id }, include: { classroom: { include: { members: { select: { studentId: true } } } } } });
  if (!assignment) return NextResponse.json({ error: 'Không tìm thấy bài tập' }, { status: 404 });
  const allowed = user.role === 'admin' || (user.role === 'teacher' && assignment.classroom.teacherId === user.id) || (user.role === 'student' && assignment.classroom.members.some(m => m.studentId === user.id));
  if (!allowed) return NextResponse.json({ error: 'Bạn không có quyền truy cập' }, { status: 403 });
  const url = new URL(request.url);
  const fileId = url.searchParams.get('file');
  const requestedVersion = Number(url.searchParams.get('version') || assignment.version);
  if (!Number.isInteger(requestedVersion) || requestedVersion < 1 || requestedVersion > assignment.version) return NextResponse.json({ error: 'Phiên bản không hợp lệ' }, { status: 400 });
  if (fileId) {
    const file = await prisma.assignmentAttachment.findFirst({ where: { id: fileId, assignmentId: params.id, version: { lte: requestedVersion } } });
    if (!file) return NextResponse.json({ error: 'Không tìm thấy tệp' }, { status: 404 });
    const inline = url.searchParams.get('preview') === '1' && ['image/png', 'image/jpeg', 'image/webp'].includes(file.mimeType);
    return new Response(new Uint8Array(file.data), { headers: { 'Content-Type': file.mimeType, 'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename="download"; filename*=UTF-8''${encodeURIComponent(file.name)}`, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } });
  }
  const attachments = await prisma.assignmentAttachment.findMany({ where: { assignmentId: params.id, version: { lte: requestedVersion } }, select: { id: true, name: true, size: true, mimeType: true, version: true }, orderBy: { createdAt: 'asc' } });
  return NextResponse.json({ attachments }, { headers: { 'Cache-Control': 'private, no-store' } });
}

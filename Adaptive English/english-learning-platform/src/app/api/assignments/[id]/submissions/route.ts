import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { assignmentRoster } from '@/lib/assignmentRoster';
import { abilityEvidenceForGrade } from '@/lib/assignmentAbility';

async function owned(db: any, id: string, user: any) {
  if (!user) throw Object.assign(new Error('Chưa đăng nhập'), { status: 401 });
  if (!['teacher', 'admin'].includes(user.role)) throw Object.assign(new Error('Chỉ giáo viên được quản lý bài nộp.'), { status: 403 });
  const assignment = await db.assignment.findUnique({ where: { id }, include: { classroom: { include: { members: { include: { student: { select: { name: true } } } } } }, submissions: true } });
  if (!assignment) throw Object.assign(new Error('Không tìm thấy bài tập.'), { status: 404 });
  if (user.role !== 'admin' && assignment.classroom.teacherId !== user.id) throw Object.assign(new Error('Bạn không phụ trách lớp này.'), { status: 403 });
  return assignment;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const a = await owned(prisma, params.id, await getCurrentUser());
    return NextResponse.json({ assignment: { id: a.id, title: a.title, className: a.classroom.name, maxScore: a.maxScore, status: a.status }, students: assignmentRoster(a.classroom.members, a.submissions).map(({ submission, ...row }) => row) });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: error.status || 500 }); }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    await owned(prisma, params.id, user);
    const body = await request.json();
    if (!['collect', 'publish'].includes(body.action) || body.confirm !== true) return NextResponse.json({ error: 'Cần xác nhận thao tác thu bài hoặc công bố điểm.' }, { status: 400 });
    const result = await prisma.$transaction(async tx => {
      // Shared row lock serializes collection, student writes and grade publication.
      await tx.assignment.updateMany({ where: { id: params.id }, data: { version: { increment: 0 } } });
      const a = await owned(tx, params.id, user);
      const rows = assignmentRoster(a.classroom.members, a.submissions);
      let changed = 0;
      if (body.action === 'collect') {
        if (a.status === 'closed') return { changed, closed: true };
        await tx.assignment.update({ where: { id: a.id }, data: { status: 'closed' } });
        for (const row of rows.filter(row => !row.submitted && !row.missing)) {
          const data = { status: 'pending_release', teacherScore: 0, teacherFeedback: 'Chưa nộp bài khi giáo viên thu bài: 0 điểm.', gradedAt: new Date(), aiPreGradeJson: JSON.stringify({ source: 'missing-submission', collectedAt: new Date().toISOString() }) };
          if (row.submission) await tx.submission.update({ where: { id: row.submission.id }, data });
          else await tx.submission.create({ data: { assignmentId: a.id, studentId: row.studentId, versionId: a.version, submittedAt: null, ...data } });
          changed++;
        }
      } else {
        for (const row of rows.filter(row => !row.published && row.submission?.status === 'pending_release' && typeof row.score === 'number' && Number.isFinite(row.score))) {
          const abilityEvidenceJson = await abilityEvidenceForGrade(tx, row.submission, row.score!);
          await tx.submission.update({ where: { id: row.submissionId! }, data: { status: 'graded', abilityEvidenceJson } });
          await tx.notification.create({ data: { userId: row.studentId, title: `Điểm bài tập: ${a.title}`, message: `Giáo viên đã công bố điểm: ${row.score}. Mở bài tập để xem nhận xét.`, type: 'grade' } });
          changed++;
        }
      }
      return { changed, closed: body.action === 'collect' || a.status === 'closed' };
    }, { timeout: 20000 });
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: error.status || 500 }); }
}

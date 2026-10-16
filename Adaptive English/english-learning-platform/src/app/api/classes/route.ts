import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

function generateClassCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    if (user.role === 'teacher' || user.role === 'admin') {
      const classes = await prisma.classroom.findMany({
        where: user.role === 'admin' ? {} : { teacherId: user.id },
        include: {
          assignments: true,
          _count: { select: { members: true, assignments: true } },
        },
      });

      return NextResponse.json({
        classes: classes.map((c) => ({
          id: c.id,
          code: c.code,
          inviteLink: `/student/classroom?join=${c.code}`,
          name: c.name,
          room: c.room,
          studentCount: c._count.members,
          assignmentsCount: c._count.assignments,
          createdAt: c.createdAt,
        })),
      });
    }

    // Student view
    const memberships = await prisma.classroomMember.findMany({
      where: { studentId: user.id },
      include: {
        classroom: {
          include: {
            teacher: { select: { name: true } },
            assignments: true,
            _count: { select: { members: true } },
          },
        },
      },
    });

    return NextResponse.json({
      classes: memberships.map((m) => ({
        id: m.classroom.id,
        code: m.classroom.code,
        name: m.classroom.name,
        teacherName: m.classroom.teacher.name,
        room: m.classroom.room,
        studentCount: m.classroom._count.members,
        assignmentsCount: m.classroom.assignments.length,
        createdAt: m.classroom.createdAt,
      })),
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
    if (user.role !== 'teacher' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Chỉ giáo viên hoặc quản trị viên mới có quyền tạo lớp' }, { status: 403 });
    }

    const { name, room } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Vui lòng nhập tên lớp học' }, { status: 400 });
    }

    let code = generateClassCode();
    // Ensure unique code
    while (await prisma.classroom.findUnique({ where: { code } })) {
      code = generateClassCode();
    }

    const newClass = await prisma.classroom.create({
      data: {
        code,
        name: name.trim(),
        room: room?.trim() || null,
        teacherId: user.id,
      },
    });

    return NextResponse.json({ success: true, classroom: newClass });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

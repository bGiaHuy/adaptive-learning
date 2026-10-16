import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập', user: null }, { status: 401 });
    }

    // Get user's classrooms
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

    const taughtClasses =
      user.role === 'teacher'
        ? await prisma.classroom.findMany({
            where: { teacherId: user.id },
            include: {
              assignments: true,
              _count: { select: { members: true, assignments: true } },
            },
          })
        : [];

    return NextResponse.json({
      user,
      classrooms: memberships.map((m) => ({
        id: m.classroom.id,
        code: m.classroom.code,
        name: m.classroom.name,
        teacherName: m.classroom.teacher.name,
        room: m.classroom.room,
        studentCount: m.classroom._count.members,
        assignmentsCount: m.classroom.assignments.length,
      })),
      taughtClasses: taughtClasses.map((c) => ({
        id: c.id,
        code: c.code,
        name: c.name,
        room: c.room,
        studentCount: c._count.members,
        assignmentsCount: c._count.assignments,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

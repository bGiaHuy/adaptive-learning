import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Yêu cầu quyền Quản trị viên' }, { status: 403 });
    }

    const [totalUsers, studentCount, teacherCount, adminCount, classCount, assignmentCount, packCount, exerciseCount] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: 'student' } }),
        prisma.user.count({ where: { role: 'teacher' } }),
        prisma.user.count({ where: { role: 'admin' } }),
        prisma.classroom.count(),
        prisma.assignment.count(),
        prisma.thematicPack.count(),
        prisma.exercise.count(),
      ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        studentCount,
        teacherCount,
        adminCount,
        classCount,
        assignmentCount,
        packCount,
        exerciseCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

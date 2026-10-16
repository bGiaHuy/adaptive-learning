import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }
    if (user.role !== 'student') {
      return NextResponse.json({ error: 'Chỉ học sinh mới có quyền tham gia lớp học bằng mã mời' }, { status: 403 });
    }

    const { code } = await request.json();
    if (!code) {
      return NextResponse.json({ error: 'Vui lòng nhập mã lớp' }, { status: 400 });
    }

    let cleanCode = code.trim();
    try {
      if (cleanCode.includes('code=')) {
        const dummyUrl = cleanCode.startsWith('http') ? cleanCode : `http://localhost/${cleanCode.replace(/^\?/, '')}`;
        const parsed = new URL(dummyUrl);
        cleanCode = parsed.searchParams.get('code') || cleanCode;
      } else if (cleanCode.includes('/join/')) {
        cleanCode = cleanCode.split('/join/').pop()?.split('?')[0] || cleanCode;
      }
    } catch {
      // ignore URL parsing error and use code as is
    }
    cleanCode = cleanCode.toUpperCase().trim();

    const classroom = await prisma.classroom.findUnique({
      where: { code: cleanCode },
      include: { teacher: { select: { name: true } } },
    });

    if (!classroom) {
      return NextResponse.json({ error: 'Mã lớp không tồn tại trên hệ thống' }, { status: 404 });
    }

    // Kiểm tra đã là thành viên chưa
    const existing = await prisma.classroomMember.findUnique({
      where: {
        classId_studentId: { classId: classroom.id, studentId: user.id },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Bạn đã tham gia lớp học này rồi' }, { status: 400 });
    }

    await prisma.classroomMember.create({
      data: {
        classId: classroom.id,
        studentId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      classroom: {
        id: classroom.id,
        name: classroom.name,
        teacherName: classroom.teacher.name,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

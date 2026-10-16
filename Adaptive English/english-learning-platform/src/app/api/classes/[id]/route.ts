import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const classId = params.id;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const classroom = await prisma.classroom.findUnique({
      where: { id: classId },
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                skillProfiles: true,
              },
            },
          },
        },
        assignments: {
          include: {
            submissions: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!classroom) {
      return NextResponse.json({ error: 'Không tìm thấy lớp học' }, { status: 404 });
    }

    // Authorization check: User must be admin, class teacher, or enrolled student
    const isTeacher = user.id === classroom.teacherId;
    const isEnrolled = classroom.members.some((m) => m.studentId === user.id);
    const isAdmin = user.role === 'admin';

    if (!isTeacher && !isEnrolled && !isAdmin) {
      return NextResponse.json({ error: 'Bạn không có quyền truy cập lớp học này' }, { status: 403 });
    }

    // Build Gradebook matrix
    const students = classroom.members.map((m) => {
      const readingProf = m.student.skillProfiles.find((s) => s.skill === 'reading');
      const writingProf = m.student.skillProfiles.find((s) => s.skill === 'writing');

      return {
        id: m.student.id,
        name: m.student.name,
        email: m.student.email,
        avatar: m.student.avatar,
        joinedAt: m.joinedAt,
        estimatedCefr: readingProf?.level || 'B1',
        submissionsCount: classroom.assignments.reduce(
          (acc, a) => acc + (a.submissions.some((s) => s.studentId === m.student.id) ? 1 : 0),
          0
        ),
      };
    });

    return NextResponse.json({
      classroom: {
        id: classroom.id,
        code: classroom.code,
        name: classroom.name,
        room: classroom.room,
        teacherName: classroom.teacher.name,
        teacherId: classroom.teacher.id,
        studentCount: students.length,
        createdAt: classroom.createdAt,
      },
      students,
      assignments: classroom.assignments.map((a) => ({
        id: a.id,
        title: a.title,
        skill: a.skill,
        dueDate: a.dueDate,
        version: a.version,
        status: a.status,
        maxScore: a.maxScore,
        submissionsCount: a.submissions.length,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const classId = params.id;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const classroom = await prisma.classroom.findUnique({
      where: { id: classId },
      include: { members: true },
    });

    if (!classroom) {
      return NextResponse.json({ error: 'Không tìm thấy lớp học' }, { status: 404 });
    }

    const url = new URL(request.url);
    const targetStudentId = url.searchParams.get('studentId') || (user.role === 'student' ? user.id : null);

    if (targetStudentId) {
      // Permission: Student can leave; Teacher of the class or Admin can kick student
      const isSelf = user.id === targetStudentId;
      const isTeacher = user.id === classroom.teacherId;
      const isAdmin = user.role === 'admin';

      if (!isSelf && !isTeacher && !isAdmin) {
        return NextResponse.json({ error: 'Không có quyền xóa học sinh khỏi lớp' }, { status: 403 });
      }

      await prisma.classroomMember.deleteMany({
        where: {
          classId: classId,
          studentId: targetStudentId,
        },
      });

      return NextResponse.json({ success: true, message: 'Đã rời khỏi lớp học thành công' });
    }

    // Delete entire classroom (only teacher owner or admin)
    if (user.id !== classroom.teacherId && user.role !== 'admin') {
      return NextResponse.json({ error: 'Chỉ giáo viên sở hữu lớp hoặc quản trị viên mới có quyền xóa lớp' }, { status: 403 });
    }

    await prisma.classroom.delete({
      where: { id: classId },
    });

    return NextResponse.json({ success: true, message: 'Đã xóa lớp học thành công' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

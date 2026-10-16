import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { generateProviderSocraticHint, getAiProviderInfo } from '@/lib/aiEngine';

export async function GET() {
  const providerInfo = getAiProviderInfo();
  return NextResponse.json({
    success: true,
    providerInfo,
  });
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const body = await request.json();
    const {
      skill,
      questionPrompt,
      userCurrentText,
      correctAnswer,
      lessonStatus,
      canViewAnswers,
      assignmentId,
      classId,
    } = body;

    let allowAiAssistance = true;

    // 1. Kiểm tra quyền tắt AI từ phía Giáo viên qua Assignment
    if (assignmentId) {
      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: { classroom: { include: { members: true } } },
      });

      if (assignment) {
        const isStudentEnrolled = assignment.classroom.members.some(m => m.studentId === user.id);
        const isClassTeacher = assignment.classroom.teacherId === user.id;
        const isAdmin = user.role === 'admin';

        if (!isStudentEnrolled && !isClassTeacher && !isAdmin) {
          return NextResponse.json({ error: 'Bạn không có quyền truy cập bài tập này' }, { status: 403 });
        }

        if (assignment.allowAiTutor === false || assignment.classroom?.allowAiAssistance === false) {
          allowAiAssistance = false;
        }
      }
    }

    // 2. Kiểm tra quyền tắt AI từ phía Giáo viên qua Classroom
    if (classId && allowAiAssistance) {
      const classroom = await prisma.classroom.findUnique({
        where: { id: classId },
        include: { members: true },
      });
      if (classroom) {
        const isStudentEnrolled = classroom.members.some(m => m.studentId === user.id);
        const isClassTeacher = classroom.teacherId === user.id;
        const isAdmin = user.role === 'admin';

        if (!isStudentEnrolled && !isClassTeacher && !isAdmin) {
          return NextResponse.json({ error: 'Bạn không có quyền truy cập lớp học này' }, { status: 403 });
        }

        if (classroom.allowAiAssistance === false) {
          allowAiAssistance = false;
        }
      }
    }

    if (!allowAiAssistance) {
      return NextResponse.json(
        {
          success: false,
          blocked: true,
          reason: 'Giáo viên đã tắt tính năng trợ lý AI cho bài học/bài tập này.',
          disclaimer: 'Tính năng AI bị vô hiệu hóa theo cấu hình của giáo viên.',
        },
        { status: 403 }
      );
    }

    const result = await generateProviderSocraticHint({
      skill: skill || 'general',
      questionPrompt: questionPrompt || '',
      userCurrentText,
      correctAnswer,
      lessonStatus,
      canViewAnswers,
      allowAiAssistance,
    });

    return NextResponse.json({
      success: true,
      mode: result.mode,
      allowAnswerReveal: result.allowAnswerReveal,
      hint: result.hint,
      encouragement: result.encouragement,
      disclaimer: result.disclaimer,
      source: result.source,
      providerInfo: result.providerInfo,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

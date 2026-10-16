import { NextResponse } from 'next/server';
import { initialLessons } from '@/lib/mockData';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { evaluateWritingTask, evaluateSpeakingTask, getAiProviderInfo } from '@/lib/aiEngine';

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
      content,
      audioUrl,
      duration,
      audioSize,
      assignmentId,
      lessonId,
      questionId,
      mode = 'auto',
    } = body;

    let allowAiAssistance = true;

    // 1. Kiểm tra quyền và thiết lập tắt AI từ phía Giáo viên
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

    if (!allowAiAssistance) {
      return NextResponse.json(
        {
          success: false,
          blocked: true,
          reason: 'Giáo viên đã tắt tính năng đánh giá AI cho bài học/bài tập này.',
        },
        { status: 403 }
      );
    }

    if (skill === 'writing') {
      let taskContext;
      if (lessonId || questionId) {
        const lesson = initialLessons.find(item => item.id === lessonId && item.skill === 'writing');
        const question = lesson?.questions.find(item => item.id === questionId && item.type === 'writing');
        if (!question || lesson?.status === 'in_preparation' || question.isUnapprovedAnswer) {
          return NextResponse.json({ error: 'Không tìm thấy bài viết sẵn sàng để chấm AI.' }, { status: 400 });
        }
        taskContext = { prompt: question.prompt, criteria: question.explanation, minimumWords: 5 };
      }
      const result = await evaluateWritingTask({
        content: typeof content === 'string' ? content : '',
        taskContext,
        mode,
        allowAiAssistance,
      });

      if (result.status === 'blocked') {
        return NextResponse.json(
          {
            success: false,
            blocked: true,
            result,
          },
          { status: 400 }
        );
      }

      if (result.status === 'error') {
        return NextResponse.json({ success: false, error: result.reason, result }, { status: 502 });
      }

      return NextResponse.json({
        success: true,
        result,
      });
    }

    if (skill === 'speaking') {
      const result = await evaluateSpeakingTask({
        audioUrl: audioUrl || '',
        duration: Number(duration) || 0,
        audioSize: audioSize !== undefined ? Number(audioSize) : undefined,
        mode,
        allowAiAssistance,
      });

      if (result.status === 'blocked') {
        return NextResponse.json(
          {
            success: false,
            blocked: true,
            result,
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        result,
      });
    }

    return NextResponse.json(
      { error: 'Kỹ năng không hợp lệ (hỗ trợ writing hoặc speaking)' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

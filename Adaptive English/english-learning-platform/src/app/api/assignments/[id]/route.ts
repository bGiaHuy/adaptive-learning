import { validateAttachment } from '@/lib/assignmentAttachments';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { studentSubmission, exerciseQuestions } from '@/lib/assignmentGrading';
import { assessAssignmentDifficulty } from '@/lib/assignmentAbility';
export const maxDuration = 120;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const assignmentId = params.id;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        classroom: {
          select: { id: true, name: true, code: true, teacherId: true, members: { select: { studentId: true } } },
        },
        versions: { orderBy: { version: 'asc' } },
        submissions: {
          where: user.role === 'student' ? { studentId: user.id } : undefined,
          include: {
            student: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Không tìm thấy bài tập' }, { status: 404 });
    }

    // RBAC check
    if (user.role === 'teacher') {
      if (assignment.classroom.teacherId !== user.id) {
        return NextResponse.json({ error: 'Bạn không có quyền truy cập bài tập của lớp khác' }, { status: 403 });
      }
    } else if (user.role === 'student') {
      const isEnrolled = assignment.classroom.members.some((m) => m.studentId === user.id);
      if (!isEnrolled) {
        return NextResponse.json({ error: 'Bạn không thuộc lớp học này' }, { status: 403 });
      }
    }

    return NextResponse.json({
      assignment: {
        id: assignment.id,
        classId: assignment.classId,
        className: assignment.classroom.name,
        classCode: assignment.classroom.code,
        title: assignment.title,
        skill: assignment.skill,
        dueDate: assignment.dueDate,
        version: assignment.version,
        status: assignment.status,
        maxScore: assignment.maxScore,
        allowAiTutor: assignment.allowAiTutor,
        releaseGradesImmediately: assignment.releaseGradesImmediately,
        promptText: assignment.promptText,
        exercises: assignment.packId ? (await prisma.exercise.findMany({
          where: { packId: assignment.packId, ...(assignment.selectedExerciseIdsJson ? { id: { in: JSON.parse(assignment.selectedExerciseIdsJson) } } : {}) },
          orderBy: { exerciseNumber: 'asc' },
        })).map((exercise) => ({
          id: exercise.id, title: exercise.title, instruction: exercise.instruction,
          questions: exerciseQuestions([exercise]).map((question) => ({
            id: question.id, prompt: question.prompt, type: question.type,
            options: question.options, imageUrl: question.imageUrl,
          })),
        })) : [],
        versions: user.role === 'student' ? assignment.versions.map(({ difficultyJson, ...version }) => version) : assignment.versions,
        submissions: user.role === 'student' ? assignment.submissions.map(studentSubmission) : assignment.submissions,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const assignmentId = params.id;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }
    if (user.role !== 'teacher' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Chỉ giáo viên mới có quyền chỉnh sửa bài tập' }, { status: 403 });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { classroom: true },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Không tìm thấy bài tập' }, { status: 404 });
    }

    if (user.role !== 'admin' && assignment.classroom.teacherId !== user.id) {
      return NextResponse.json({ error: 'Bạn không có quyền chỉnh sửa bài tập của giáo viên khác' }, { status: 403 });
    }

    if (Number(request.headers.get('content-length')) > 4 * 1024 * 1024) return NextResponse.json({ error: 'Tổng dữ liệu tải lên quá lớn.' }, { status: 413 });
    const body = await request.json();
    if (body.expectedVersion !== undefined && body.expectedVersion !== assignment.version) return NextResponse.json({ error: 'Bài tập đã thay đổi. Hãy tải lại trang trước khi sửa.' }, { status: 409 });
    const files: { name: string; data: Buffer; mimeType: string }[] = [];
    try {
      if (body.attachments !== undefined && (!Array.isArray(body.attachments) || body.attachments.length > 5)) throw new Error('Chọn tối đa 5 tệp mỗi lần lưu.');
      let total = 0;
      for (const item of body.attachments || []) {
        if (typeof item.name !== 'string' || typeof item.base64 !== 'string' || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(item.base64)) throw new Error('Dữ liệu tệp không hợp lệ.');
        const data = Buffer.from(item.base64, 'base64');
        total += data.length;
        if (total > 2 * 1024 * 1024) throw new Error('Tổng dung lượng tệp mỗi lần lưu tối đa 2 MB.');
        files.push({ name: item.name, data, mimeType: validateAttachment(item.name, data) });
      }
    } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 400 }); }
    if (titleInvalid(body)) return NextResponse.json({ error: 'Thông tin bài tập không hợp lệ.' }, { status: 400 });
    const { title, promptText, dueDate, maxScore, changeNotes, allowAiTutor } = body;

    const newVersion = assignment.version + 1;
    const updatedTitle = title !== undefined ? title.trim() : assignment.title;
    const updatedPrompt = promptText !== undefined ? promptText : assignment.promptText;
    const updatedDueDate = dueDate || assignment.dueDate;
    const updatedMaxScore = maxScore !== undefined ? Number(maxScore) : assignment.maxScore;
    const updatedAllowAiTutor = allowAiTutor !== undefined ? Boolean(allowAiTutor) : assignment.allowAiTutor;
    if (!Number.isFinite(updatedMaxScore) || updatedMaxScore <= 0 || typeof updatedPrompt !== 'string' || typeof updatedTitle !== 'string') return NextResponse.json({ error: 'Đề bài hoặc thang điểm không hợp lệ.' }, { status: 400 });
    const questions = assignment.packId ? exerciseQuestions(await prisma.exercise.findMany({ where: { packId: assignment.packId, ...(assignment.selectedExerciseIdsJson ? { id: { in: JSON.parse(assignment.selectedExerciseIdsJson) } } : {}) } })) : [];
    const difficulty = await assessAssignmentDifficulty({ title: updatedTitle, promptText: updatedPrompt, skill: assignment.skill, maxScore: updatedMaxScore, questions }, assignment.classroom.allowAiAssistance !== false);

    // 1. Create new assignment version history record
    const updatedAssignment = await prisma.$transaction(async tx => {
    const claimed = await tx.assignment.updateMany({ where: { id: assignmentId, version: assignment.version }, data: { version: newVersion } });
    if (claimed.count !== 1) throw new Error('Bài tập vừa được cập nhật. Hãy tải lại trang trước khi sửa.');
    for (const file of files) await tx.assignmentAttachment.create({ data: { assignmentId, version: newVersion, name: file.name, mimeType: file.mimeType, size: file.data.length, data: file.data } });
    await tx.assignmentVersion.create({
      data: {
        assignmentId: assignment.id,
        version: newVersion,
        title: updatedTitle,
        promptText: updatedPrompt,
        dueDate: updatedDueDate,
        changeNotes: changeNotes?.trim() || `Cập nhật bài tập lên phiên bản ${newVersion}`,
        difficultyJson: JSON.stringify(difficulty),
      },
    });

    // 2. Update assignment to new version
    return tx.assignment.update({
      where: { id: assignmentId },
      data: {
        title: updatedTitle,
        promptText: updatedPrompt,
        dueDate: updatedDueDate,
        maxScore: updatedMaxScore,
        allowAiTutor: updatedAllowAiTutor,
        ...(typeof body.releaseGradesImmediately === 'boolean' ? { releaseGradesImmediately: body.releaseGradesImmediately } : {}),
        version: newVersion,
      },
      include: {
        versions: { orderBy: { version: 'asc' } },
      },
    });
    });

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật bài tập lên Version ${newVersion}`,
      assignment: updatedAssignment,
      newVersion,
      difficulty,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message?.includes('Bài tập vừa được cập nhật') ? 409 : 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const assignmentId = params.id;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }
    if (user.role !== 'teacher' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Chỉ giáo viên mới có quyền xóa bài tập' }, { status: 403 });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { classroom: true },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Không tìm thấy bài tập' }, { status: 404 });
    }

    if (user.role !== 'admin' && assignment.classroom.teacherId !== user.id) {
      return NextResponse.json({ error: 'Bạn không có quyền xóa bài tập của giáo viên khác' }, { status: 403 });
    }

    await prisma.assignment.delete({
      where: { id: assignmentId },
    });

    return NextResponse.json({ success: true, message: 'Đã xóa bài tập thành công' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function titleInvalid(body: any) {
 return (body.title !== undefined && (typeof body.title !== 'string' || !body.title.trim())) || (body.dueDate !== undefined && (typeof body.dueDate !== 'string' || !body.dueDate.trim())) || (body.changeNotes !== undefined && typeof body.changeNotes !== 'string') || (body.allowAiTutor !== undefined && typeof body.allowAiTutor !== 'boolean');
}

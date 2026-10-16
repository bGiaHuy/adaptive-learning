import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { notifyAssignment } from '@/lib/notifications';
import { assessAssignmentDifficulty } from '@/lib/assignmentAbility';
import { loadAssignmentQuestions } from '@/lib/assignmentGrading';
import { decodeAttachments } from '@/lib/assignmentAttachments';
export const maxDuration = 120;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const whereClause: any = {};

    if (user.role === 'student') {
      // Find classes student is enrolled in
      const memberships = await prisma.classroomMember.findMany({
        where: { studentId: user.id },
        select: { classId: true },
      });
      const enrolledClassIds = memberships.map((m) => m.classId);

      if (classId) {
        if (!enrolledClassIds.includes(classId)) {
          return NextResponse.json({ error: 'Bạn không có quyền truy cập bài tập của lớp này' }, { status: 403 });
        }
        whereClause.classId = classId;
      } else {
        whereClause.classId = { in: enrolledClassIds };
      }
    } else if (user.role === 'teacher') {
      // Find classes teacher owns
      const teacherClasses = await prisma.classroom.findMany({
        where: { teacherId: user.id },
        select: { id: true },
      });
      const teacherClassIds = teacherClasses.map((c) => c.id);

      if (classId) {
        if (!teacherClassIds.includes(classId)) {
          return NextResponse.json({ error: 'Bạn không có quyền truy cập bài tập của lớp này' }, { status: 403 });
        }
        whereClause.classId = classId;
      } else {
        whereClause.classId = { in: teacherClassIds };
      }
    } else {
      // Admin
      if (classId) {
        whereClause.classId = classId;
      }
    }

    const assignments = await prisma.assignment.findMany({
      where: whereClause,
      include: {
        classroom: { select: { name: true, code: true, teacherId: true } },
        versions: { orderBy: { version: 'desc' } },
        submissions: {
          where: user.role === 'student' ? { studentId: user.id } : undefined,
          select: {
            id: true,
            studentId: true,
            status: true,
            teacherScore: true,
            teacherFeedback: true,
            aiPreGradeJson: true,
            versionId: true,
            content: true,
            submittedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      assignments: assignments.map((a) => {
        const studentSub = a.submissions[0];
        return {
          id: a.id,
          classId: a.classId,
          className: a.classroom.name,
          classCode: a.classroom.code,
          title: a.title,
          skill: a.skill,
          dueDate: a.dueDate,
          version: a.version,
          status: studentSub ? studentSub.status : 'not_started',
          score: studentSub?.status === 'graded' ? studentSub.teacherScore : null,
          maxScore: a.maxScore,
          teacherFeedback: studentSub?.status === 'graded' ? studentSub.teacherFeedback : null,
          submissionVersionId: studentSub?.versionId ?? null,
          submissionContent: studentSub?.content ?? null,
          aiPreGrade: user.role !== 'student' && studentSub?.aiPreGradeJson ? JSON.parse(studentSub.aiPreGradeJson)?.summary : null,
          allowAiTutor: a.allowAiTutor,
          promptText: a.promptText,
          submissionsCount: a.submissions.filter((s) => s.status !== 'draft').length,
          draftsCount: a.submissions.filter((s) => s.status === 'draft').length,
        };
      }),
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
      return NextResponse.json({ error: 'Chỉ giáo viên mới có quyền tạo bài tập' }, { status: 403 });
    }

    if (Number(request.headers.get('content-length')) > 4*1024*1024) return NextResponse.json({error:'Dữ liệu quá lớn'},{status:413});
    const body = await request.json();
    let files; try {files=decodeAttachments(body.attachments);} catch(error:any) {return NextResponse.json({error:error.message},{status:400});}
    const { classId, title, skill, dueDate, promptText, maxScore, allowAiTutor, packId, selectedExerciseIds } = body;

    if (!classId || !title || !skill) {
      return NextResponse.json({ error: 'Vui lòng điền đủ thông tin bài tập' }, { status: 400 });
    }

    // Verify classroom ownership
    const classroom = await prisma.classroom.findUnique({
      where: { id: classId },
    });

    if (!classroom) {
      return NextResponse.json({ error: 'Không tìm thấy lớp học' }, { status: 404 });
    }

    if (classroom.teacherId !== user.id) {
      return NextResponse.json({ error: 'Bạn không có quyền tạo bài tập trong lớp học của giáo viên khác' }, { status: 403 });
    }

    const parsedMaxScore = maxScore === undefined ? 10 : Number(maxScore);
    if (!Number.isFinite(parsedMaxScore) || parsedMaxScore <= 0 || (promptText !== undefined && typeof promptText !== 'string') || typeof title !== 'string') return NextResponse.json({ error: 'Đề bài hoặc thang điểm không hợp lệ.' }, { status: 400 });
    const questions = packId ? await loadAssignmentQuestions(prisma, { packId, selectedExerciseIdsJson: selectedExerciseIds ? JSON.stringify(selectedExerciseIds) : null }) : [];
    const difficulty = await assessAssignmentDifficulty({ title, promptText: promptText || '', skill, maxScore: parsedMaxScore, questions }, classroom.allowAiAssistance !== false);
    const assignment = await prisma.$transaction(async (tx) => {
    const assignment = await tx.assignment.create({
      data: {
        classId,
        title: title.trim(),
        skill,
        dueDate: dueDate || '23:59 Chủ Nhật',
        promptText: promptText || '',
        maxScore: parsedMaxScore,
        allowAiTutor: allowAiTutor !== false,
        releaseGradesImmediately: body.releaseGradesImmediately === true,
        packId: packId || null,
        selectedExerciseIdsJson: selectedExerciseIds ? JSON.stringify(selectedExerciseIds) : null,
        version: 1,
        status: 'published',
      },
    });

    for (const file of files) await tx.assignmentAttachment.create({data:{assignmentId:assignment.id,version:1,name:file.name,mimeType:file.mimeType,size:file.data.length,data:file.data}});
    // Record initial version 1 snapshot
    await tx.assignmentVersion.create({
      data: {
        assignmentId: assignment.id,
        version: 1,
        title: assignment.title,
        promptText: assignment.promptText,
        dueDate: assignment.dueDate,
        changeNotes: 'Bản phát hành đầu tiên khi giao cho học sinh.',
        difficultyJson: JSON.stringify(difficulty),
      },
    });

    await notifyAssignment(tx, assignment);
    return assignment;
    });
    return NextResponse.json({ success: true, assignment, difficulty });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

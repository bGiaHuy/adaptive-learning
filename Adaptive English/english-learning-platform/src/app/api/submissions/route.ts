import { validateSubmissionAudio } from '@/lib/audioStorage';
import { NextResponse } from 'next/server';
import { abilityEvidenceForGrade } from '@/lib/assignmentAbility';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { loadAssignmentQuestions, autoGrade, studentSubmission } from '@/lib/assignmentGrading';
import { notifySubmission } from '@/lib/notifications';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');

    if (user.role === 'student') {
      const whereClause: any = { studentId: user.id };
      if (assignmentId) {
        whereClause.assignmentId = assignmentId;
      }

      const submissions = await prisma.submission.findMany({
        where: whereClause,
        include: {
          assignment: {
            select: { id: true, title: true, skill: true, version: true, maxScore: true, classId: true },
          },
        },
        orderBy: { submittedAt: 'desc' },
      });

      return NextResponse.json({
        submissions: submissions.map((s) => ({
          id: s.id,
          assignmentId: s.assignmentId,
          assignmentTitle: s.assignment.title,
          maxScore: s.assignment.maxScore,
          skill: s.assignment.skill,
          versionId: s.versionId,
          currentAssignmentVersion: s.assignment.version,
          status: s.status,
          missingSubmission: s.aiPreGradeJson?.includes('"source":"missing-submission"') || false,
          content: s.content,
          audioUrl: s.audioUrl,
          answers: s.answersJson ? JSON.parse(s.answersJson) : null,
          teacherScore: studentSubmission(s).teacherScore,
          teacherFeedback: studentSubmission(s).teacherFeedback,
          submittedAt: s.submittedAt,
          gradedAt: s.gradedAt,
        })),
      });
    }

    if (user.role === 'teacher') {
      if (assignmentId) {
        // Teacher reading assignment submissions: must own classroom!
        const assignment = await prisma.assignment.findUnique({
          where: { id: assignmentId },
          include: { classroom: true },
        });

        if (!assignment) {
          return NextResponse.json({ error: 'Không tìm thấy bài tập' }, { status: 404 });
        }

        if (assignment.classroom.teacherId !== user.id) {
          return NextResponse.json({ error: 'Bạn không có quyền truy cập bài nộp của lớp khác' }, { status: 403 });
        }

        const submissions = await prisma.submission.findMany({
          where: { assignmentId },
          include: {
            student: { select: { id: true, name: true, email: true, avatar: true } },
            assignment: { select: { id: true, title: true, maxScore: true, version: true } },
          },
          orderBy: { submittedAt: 'desc' },
        });

        return NextResponse.json({
          submissions: submissions.map((s) => ({
            id: s.id,
            assignmentId: s.assignmentId,
            maxScore: s.assignment.maxScore,
            studentId: s.student.id,
            studentName: s.student.name,
            studentEmail: s.student.email,
            versionId: s.versionId,
            currentAssignmentVersion: s.assignment.version,
            status: s.status,
            content: s.content,
            audioUrl: s.audioUrl,
            teacherScore: s.teacherScore,
            teacherFeedback: s.teacherFeedback,
            submittedAt: s.submittedAt,
            gradedAt: s.gradedAt,
          })),
        });
      }

      // Teacher reading all submissions across their own classes
      const submissions = await prisma.submission.findMany({
        where: {
          assignment: { classroom: { teacherId: user.id } },
        },
        include: {
          student: { select: { id: true, name: true, email: true } },
          assignment: { select: { id: true, title: true, maxScore: true, version: true } },
        },
        orderBy: { submittedAt: 'desc' },
      });

      return NextResponse.json({
        submissions: submissions.map((s) => ({
          id: s.id,
          assignmentId: s.assignmentId,
          studentId: s.student.id,
          maxScore: s.assignment.maxScore,
          studentName: s.student.name,
          studentEmail: s.student.email,
          versionId: s.versionId,
          currentAssignmentVersion: s.assignment.version,
          status: s.status,
          content: s.content,
          audioUrl: s.audioUrl,
          teacherScore: s.teacherScore,
          teacherFeedback: s.teacherFeedback,
          submittedAt: s.submittedAt,
          gradedAt: s.gradedAt,
        })),
      });
    }

    if (user.role === 'admin') {
      const submissions = await prisma.submission.findMany({
        where: assignmentId ? { assignmentId } : undefined,
        include: {
          student: { select: { id: true, name: true, email: true } },
          assignment: { select: { id: true, title: true, maxScore: true, version: true } },
        },
        orderBy: { submittedAt: 'desc' },
      });

      return NextResponse.json({
        submissions: submissions.map((s) => ({
          id: s.id,
          assignmentId: s.assignmentId,
          studentId: s.student.id,
          maxScore: s.assignment.maxScore,
          studentName: s.student.name,
          studentEmail: s.student.email,
          versionId: s.versionId,
          currentAssignmentVersion: s.assignment.version,
          status: s.status,
          content: s.content,
          audioUrl: s.audioUrl,
          teacherScore: s.teacherScore,
          teacherFeedback: s.teacherFeedback,
          submittedAt: s.submittedAt,
          gradedAt: s.gradedAt,
        })),
      });
    }

    return NextResponse.json({ submissions: [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    if (user.role !== 'student' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Chỉ học sinh mới có thể nộp hoặc lưu nháp bài tập' }, { status: 403 });
    }

    const body = await request.json();
    const { assignmentId, content, answers, isDraft } = body;
    let audioUrl = body.audioUrl;

    if (!assignmentId) {
      return NextResponse.json({ error: 'Thiếu mã bài tập' }, { status: 400 });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        classroom: {
          include: { members: { select: { studentId: true } } },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Không tìm thấy bài tập' }, { status: 404 });
    }

    // RBAC: Check student is enrolled in the classroom
    const isEnrolled = assignment.classroom.members.some((m) => m.studentId === user.id);
    if (!isEnrolled && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bạn không có quyền nộp bài cho lớp học này (không phải thành viên lớp)' },
        { status: 403 }
      );
    }

    if (assignment.status === 'closed') return NextResponse.json({ error: 'Giáo viên đã thu bài. Không thể nộp hoặc lưu nháp.' }, { status: 409 });
    const submissionContent = content || '';
    const answersStr = answers ? JSON.stringify(answers) : null;

    // Check if user already has an existing submission/draft
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        assignmentId,
        studentId: user.id,
      },
    });

    if (audioUrl === undefined) audioUrl = existingSubmission?.audioUrl || null;
    else if (audioUrl !== null && audioUrl !== '') {
      if(assignment.skill!=='speaking') return NextResponse.json({error:'Bản ghi chỉ dành cho bài Speaking.'},{status:400});
      try { audioUrl=await validateSubmissionAudio(audioUrl,user,assignmentId); }
      catch(error:any) {return NextResponse.json({error:error.message||'Bản ghi không hợp lệ.'},{status:error.status||400});}
    }
    if (existingSubmission && existingSubmission.status !== 'draft' && existingSubmission.status !== 'in_progress') {
      return NextResponse.json({ error: 'Bài đã nộp; không thể ghi đè bằng bản nháp hoặc nộp lại.' }, { status: 409 });
    }

    const questions = await loadAssignmentQuestions(prisma, assignment);
    if (assignment.packId) {
      if (questions.length && (!answers || typeof answers !== 'object' || Array.isArray(answers)
        || questions.some((question) => {
          const value = answers[question.id];
          if (value === undefined || value === '') return !isDraft;
          return typeof value !== 'string' || (question.options?.length && !question.options.some((option: any) => option.id === value));
        }))) {
        return NextResponse.json({ error: 'Hãy trả lời đúng định dạng các câu hỏi trước khi nộp.' }, { status: 400 });
      }
    }

    if (isDraft) {
      const draftSubmission = await prisma.$transaction(async tx => {
        const lock = await tx.assignment.updateMany({ where: { id: assignmentId, status: { not: 'closed' } }, data: { version: { increment: 0 } } });
        if (!lock.count) throw Object.assign(new Error('Giáo viên đã thu bài.'), { status: 409 });
        const current = await tx.submission.findFirst({ where: { assignmentId, studentId: user.id } });
        if (current && !['draft', 'in_progress'].includes(current.status)) throw Object.assign(new Error('Bài đã nộp; không thể ghi đè.'), { status: 409 });
        const data = { content: submissionContent, audioUrl: audioUrl || null, answersJson: answersStr, versionId: assignment.version, status: 'draft', submittedAt: null };
        return current ? tx.submission.update({ where: { id: current.id }, data }) : tx.submission.create({ data: { assignmentId, studentId: user.id, ...data } });
      });

      return NextResponse.json({
        success: true,
        isDraft: true,
        submissionId: draftSubmission.id,
        versionId: draftSubmission.versionId,
        status: 'draft',
        message: 'Đã lưu bản nháp thành công',
      });
    }

    // FINAL SUBMIT
    if (!questions.length && !submissionContent.trim() && !audioUrl) return NextResponse.json({ error: 'Bài làm đang trống.' }, { status: 400 });
    if(assignment.skill==='speaking'&&!questions.length&&!audioUrl)return NextResponse.json({error:'Hãy lưu bản ghi Speaking trước khi nộp.'},{status:400});
    const automatic = autoGrade(questions, answers || {}, assignment.maxScore);
    const finalStatus = automatic ? (assignment.releaseGradesImmediately ? 'graded' : 'pending_release') : 'pending_grading';
    const gradeData = {
      status: finalStatus,
      teacherScore: automatic?.score ?? null,
      teacherFeedback: automatic?.summary ?? null,
      aiPreGradeJson: JSON.stringify(automatic || (questions.length ? { source: 'snapshot', questions } : null)),
      gradedAt: automatic ? new Date() : null,
    };

    const finalSubmission = await prisma.$transaction(async (tx) => {
    const lock = await tx.assignment.updateMany({ where: { id: assignmentId, status: { not: 'closed' } }, data: { version: { increment: 0 } } });
    if (!lock.count) throw Object.assign(new Error('Giáo viên đã thu bài.'), { status: 409 });
    const existingSubmission = await tx.submission.findFirst({ where: { assignmentId, studentId: user.id } });
    if (existingSubmission && !['draft', 'in_progress'].includes(existingSubmission.status)) throw Object.assign(new Error('Bài đã nộp; không thể ghi đè.'), { status: 409 });
    let finalSubmission;
    if (existingSubmission) {
      finalSubmission = await tx.submission.update({
        where: { id: existingSubmission.id },
        data: {
          content: submissionContent,
          audioUrl: audioUrl || null,
          answersJson: answersStr,
          versionId: assignment.version,
          ...gradeData,
          submittedAt: new Date(),
        },
      });
    } else {
      finalSubmission = await tx.submission.create({
        data: {
          assignmentId,
          studentId: user.id,
          versionId: assignment.version,
          ...gradeData,
          content: submissionContent,
          audioUrl: audioUrl || null,
          answersJson: answersStr,
          submittedAt: new Date(),
        },
      });
    }

    if (finalStatus === 'graded' && automatic) {
      const abilityEvidenceJson = await abilityEvidenceForGrade(tx, finalSubmission, automatic.score);
      await tx.submission.update({ where: { id: finalSubmission.id }, data: { abilityEvidenceJson } });
    }
    await notifySubmission(tx, finalSubmission, assignment, user.name || 'Học sinh');
    return finalSubmission;
    });
    return NextResponse.json({
      success: true,
      isDraft: false,
      submissionId: finalSubmission.id,
      versionId: finalSubmission.versionId,
      status: finalStatus,
      teacherScore: finalStatus === 'graded' ? automatic?.score : null,
      teacherFeedback: finalStatus === 'graded' ? automatic?.summary : null,
      message: 'Đã nộp bài thành công',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { loadAssignmentQuestions, autoGrade, parseJson } from '@/lib/assignmentGrading';
import { evaluateWritingTask } from '@/lib/aiEngine';
import { abilityEvidenceForGrade, readDifficulty } from '@/lib/assignmentAbility';

export async function GET(
  request: Request,
  { params }: { params: { submissionId: string } }
) {
  try {
    const submissionId = params.submissionId;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: { include: { classroom: true } },
        student: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Không tìm thấy bài nộp' }, { status: 404 });
    }

    // Authorization check: Must be owner student, class teacher, or admin
    const isOwnerStudent = user.id === submission.studentId;
    const isClassTeacher = user.id === submission.assignment.classroom.teacherId;
    const isAdmin = user.role === 'admin';

    if (!isOwnerStudent && !isClassTeacher && !isAdmin) {
      return NextResponse.json({ error: 'Bạn không có quyền xem bài nộp này' }, { status: 403 });
    }

    const visible = isClassTeacher || isAdmin || submission.status === 'graded';
    const draft = parseJson(submission.aiPreGradeJson);
    const questions = draft?.questions || await loadAssignmentQuestions(prisma, submission.assignment);
    const answers = parseJson(submission.answersJson, {});
    const submittedVersion = await prisma.assignmentVersion.findUnique({ where: { assignmentId_version: { assignmentId: submission.assignmentId, version: submission.versionId } } });
    const difficulty = readDifficulty(submittedVersion?.difficultyJson);
    const automatic = draft?.source === 'missing-submission' ? null : autoGrade(questions, answers, difficulty?.maxScore ?? submission.assignment.maxScore);
    return NextResponse.json({
      submission: {
        id: submission.id,
        assignmentId: submission.assignmentId,
        assignmentTitle: submission.assignment.title,
        skill: submission.assignment.skill,
        maxScore: difficulty?.maxScore ?? submission.assignment.maxScore,
        difficulty: difficulty ? { rating: difficulty.rating, level: difficulty.level } : null,
        studentId: submission.student.id,
        studentName: submission.student.name,
        studentEmail: submission.student.email,
        versionId: submission.versionId,
        status: submission.status,
        missingSubmission: draft?.source === "missing-submission",
        content: submission.content,
        audioUrl: submission.audioUrl,
        answers,
        questions: questions.map((q: any) => visible ? q : { id: q.id, prompt: q.prompt, options: q.options, imageUrl: q.imageUrl }),
        automaticGrade: visible && automatic ? { score: automatic.score, correct: automatic.correct, total: automatic.total, summary: automatic.summary } : null,
        submittedAt: submission.submittedAt,
        teacherScore: visible ? submission.teacherScore : null,
        teacherFeedback: visible ? submission.teacherFeedback : null,
        aiDraftGrade: (isClassTeacher || isAdmin) && draft?.source !== 'automatic' && draft?.source !== 'snapshot' && draft?.source !== 'missing-submission' ? draft : null,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { submissionId: string } }
) {
  try {
    const submissionId = params.submissionId;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }
    if (user.role !== 'teacher' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Chỉ giáo viên mới có quyền chấm bài' }, { status: 403 });
    }

    const existingSubmission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { assignment: { include: { classroom: true } } },
    });

    if (!existingSubmission) {
      return NextResponse.json({ error: 'Không tìm thấy bài nộp' }, { status: 404 });
    }

    // Scoped teacher check: must be class teacher or admin
    if (user.role !== 'admin' && existingSubmission.assignment.classroom.teacherId !== user.id) {
      return NextResponse.json({ error: 'Bạn không phải là giáo viên phụ trách lớp học này' }, { status: 403 });
    }

    const body = await request.json();
    const { score, feedback } = body;
    const submittedVersion = await prisma.assignmentVersion.findUnique({ where: { assignmentId_version: { assignmentId: existingSubmission.assignmentId, version: existingSubmission.versionId } } });
    const versionDifficulty = readDifficulty(submittedVersion?.difficultyJson);
    const scoreLimit = versionDifficulty?.maxScore ?? existingSubmission.assignment.maxScore;
    if (existingSubmission.status === 'draft' || existingSubmission.status === 'in_progress') return NextResponse.json({ error: 'Học sinh chưa nộp bài.' }, { status: 400 });
    if (body.action === 'ai-grade') {
      if (parseJson(existingSubmission.aiPreGradeJson)?.source === 'missing-submission') return NextResponse.json({ error: 'Học sinh chưa nộp bài; không có bài để AI chấm.' }, { status: 400 });
      const assignment = existingSubmission.assignment;
      if (assignment.classroom.allowAiAssistance === false) return NextResponse.json({ error: 'Lớp đã tắt AI.' }, { status: 403 });
      if (!['writing', 'speaking'].includes(assignment.skill)) return NextResponse.json({ error: 'AI chỉ hỗ trợ bài viết hoặc bài nói ở đây.' }, { status: 400 });
      if (assignment.skill === 'speaking') return NextResponse.json({ error: 'Chưa tích hợp phân tích audio thật cho bài nói. Giáo viên nghe bản ghi và chấm thủ công; hệ thống không tạo điểm giả.' }, { status: 422 });
      const previousDraft = parseJson(existingSubmission.aiPreGradeJson);
      const submittedAnswers = parseJson(existingSubmission.answersJson, {});
      const content = existingSubmission.content || (previousDraft?.questions || []).map((q: any) => `${q.prompt}\n${submittedAnswers[q.id] || ''}`).join('\n\n');
      const result = await evaluateWritingTask({ content, mode: 'real', allowAiAssistance: true, taskContext: { prompt: submittedVersion?.promptText ?? assignment.promptText, criteria: 'Đánh giá mức độ đáp ứng đề bài, mạch lạc, từ vựng và ngữ pháp.', minimumWords: 5 } });
      if (result.status !== 'success' || result.source !== 'real') return NextResponse.json({ error: result.reason || 'Chưa có đánh giá AI thực; giáo viên có thể chấm thủ công.' }, { status: 422 });
      const band = Number(result.estimatedBand);
      if (!Number.isFinite(band) || band < 0 || band > 9) return NextResponse.json({ error: 'AI trả điểm không hợp lệ.' }, { status: 502 });
      const draft = { ...result, questions: previousDraft?.questions, score: Math.round(band / 9 * scoreLimit * 100) / 100 };
      await prisma.submission.update({ where: { id: submissionId }, data: { aiPreGradeJson: JSON.stringify(draft) } });
      return NextResponse.json({ success: true, draft });
    }
    const numericScore = Number(score);
    if (score === '' || score === null || score === undefined || !Number.isFinite(numericScore) || numericScore < 0 || numericScore > scoreLimit) return NextResponse.json({ error: 'Điểm phải nằm trong thang điểm của bài.' }, { status: 400 });
    if (feedback !== undefined && typeof feedback !== 'string') return NextResponse.json({ error: 'Nhận xét không hợp lệ.' }, { status: 400 });
    const publish = body.publish !== false;
    if (!publish && existingSubmission.status === 'graded') return NextResponse.json({ error: 'Điểm đã công bố; hãy dùng cập nhật điểm.' }, { status: 409 });

    const isReGrade = existingSubmission.status === 'graded';
    const previousScore = existingSubmission.teacherScore;

    const updated = await prisma.$transaction(async tx => {
    await tx.assignment.updateMany({ where: { id: existingSubmission.assignmentId }, data: { version: { increment: 0 } } });
    const current = await tx.submission.findUnique({ where: { id: submissionId } });
    if (!publish && current?.status === 'graded') throw Object.assign(new Error('Điểm đã công bố; hãy tải lại trang.'), { status: 409 });
    const abilityEvidenceJson = publish ? await abilityEvidenceForGrade(tx, existingSubmission, numericScore) : null;
    const updated = await tx.submission.update({
      where: { id: submissionId },
      data: {
        teacherScore: numericScore,
        teacherFeedback: feedback?.trim() || '',
        status: publish ? 'graded' : 'pending_release',
        gradedAt: new Date(),
        ...(publish ? { abilityEvidenceJson } : {}),
      },
      include: {
        assignment: true,
        student: true,
      },
    });

    // Tạo thông báo cho học sinh (phân biệt chấm lần đầu vs sửa điểm đã trả)
    if (publish && isReGrade) {
      await tx.notification.create({
        data: {
          userId: updated.studentId,
          title: `Cập nhật điểm: ${updated.assignment.title}`,
          message: `Giáo viên đã cập nhật lại điểm số/nhận xét bài tập ${updated.assignment.title}: ${updated.teacherScore}/${updated.assignment.maxScore} điểm (Điểm trước đó: ${previousScore ?? 'chưa rõ'}/${updated.assignment.maxScore}). Bấm để xem nhận xét chi tiết.`,
          type: 'grade',
        },
      });
    } else if (publish) {
      await tx.notification.create({
        data: {
          userId: updated.studentId,
          title: `Điểm bài tập: ${updated.assignment.title}`,
          message: `Giáo viên đã chấm bài: ${updated.teacherScore}/${updated.assignment.maxScore} điểm. Bấm để xem nhận xét chi tiết.`,
          type: 'grade',
        },
      });
    }

    return updated;
    });

    return NextResponse.json({
      success: true,
      submission: updated,
      isReGrade,
      previousScore,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

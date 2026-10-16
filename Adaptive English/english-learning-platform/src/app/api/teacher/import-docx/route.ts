import { NextResponse } from 'next/server';
import fs from 'fs';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { parseImportDocument, IMPORT_EXTENSIONS } from '@/lib/documentImport';
import { signImportAssessment, verifyImportAssessment } from '@/lib/importAssessment';
import { notifyAssignment } from '@/lib/notifications';
import { assessAssignmentDifficulty } from '@/lib/assignmentAbility';
import { decodeAttachments } from '@/lib/assignmentAttachments';
export const maxDuration = 120;

const DEFAULT_DOCX_PATH = 'C:/Users/Administrator/Downloads/Documents/GỦI.docx';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }
    if (user.role !== 'teacher' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Chỉ giáo viên hoặc quản trị viên mới có quyền nhập và xuất bản tài liệu' }, { status: 403 });
    }

    const contentType = request.headers.get('content-type') || '';

    // Handle Publish Action (JSON request)
    if (contentType.includes('application/json')) {
      if(Number(request.headers.get('content-length'))>4*1024*1024)return NextResponse.json({error:'Dữ liệu quá lớn'},{status:413});
      const body = await request.json();
      const { action, title, classId, exercises, vocabulary, sourceFileName } = body;

      if (action === 'publish') {
        let files;try{files=decodeAttachments(body.attachments);}catch(e:any){return NextResponse.json({error:e.message},{status:400});}
        const approvedQuestions = Array.isArray(exercises)
          ? exercises.flatMap((ex: any) =>
              (ex.questions || []).filter((q: any) => q.isApproved !== false)
            )
          : [];
        if (!classId || !Array.isArray(exercises) || approvedQuestions.length === 0) {
          return NextResponse.json({ error: 'Hãy chọn lớp học và duyệt ít nhất một câu hỏi trước khi xuất bản.' }, { status: 400 });
        }

        const classroom = await prisma.classroom.findUnique({ where: { id: classId } });
        if (!classroom) return NextResponse.json({ error: 'Không tìm thấy lớp học' }, { status: 404 });
        if (user.role !== 'admin' && classroom.teacherId !== user.id) {
          return NextResponse.json({ error: 'Bạn không có quyền xuất bản bài tập vào lớp của giáo viên khác' }, { status: 403 });
        }

        const difficulty = (classroom.allowAiAssistance !== false && verifyImportAssessment(body.assessmentToken, user.id, title, exercises)) || { status: 'unavailable', source: 'ai', skill: 'reading', maxScore: 10, reason: 'Nội dung đã thay đổi hoặc chưa có đánh giá mức bài; không gọi lại AI khi xuất bản.' };
        const published = await prisma.$transaction(async (tx) => {
          const pack = await tx.thematicPack.create({
            data: {
              title: title || 'Bộ câu hỏi từ tài liệu',
              cefrLevel: 'B1',
              sourceFileName: sourceFileName || 'Tài liệu',
            },
          });

          if (Array.isArray(vocabulary) && vocabulary.length) {
            await tx.vocabularyItem.createMany({
              data: vocabulary.map((item: any) => ({
                packId: pack.id,
                no: Number.isInteger(item.no) ? item.no : null,
                word: String(item.word || '').trim() || 'Chưa xác định',
                type: String(item.type || '').trim(),
                ipa: String(item.ipa || '').trim(),
                meaning: String(item.meaning || '').trim(),
                source: 'File import',
              })),
            });
          }

          const savedExercises = await Promise.all(exercises.map((exercise: any) => {
            const questions = (exercise.questions || []).filter((question: any) => question.isApproved !== false);
            return tx.exercise.create({
              data: {
                packId: pack.id,
                exerciseNumber: Number(exercise.exerciseNumber) || 1,
                title: String(exercise.title || 'Bài tập'),
                category: 'docx-import',
                type: String(exercise.type || 'multiple_choice'),
                instruction: String(exercise.instruction || 'Chọn đáp án đúng.'),
                questionCount: questions.length,
                hasImages: questions.some((question: any) => Boolean(question.imageUrl)),
                imageCount: questions.filter((question: any) => Boolean(question.imageUrl)).length,
                hasSourceError: questions.some((question: any) => Boolean(question.hasSourceError)),
                dataJson: JSON.stringify(questions),
              },
            });
          }));

          const assignment = await tx.assignment.create({
            data: {
              classId,
              title: title || 'Bộ câu hỏi từ tài liệu',
              skill: 'reading',
              promptText: `Bộ câu hỏi từ tài liệu gồm ${approvedQuestions.length} câu đã được giáo viên duyệt.`,
              allowAiTutor: true,
              releaseGradesImmediately: body.releaseGradesImmediately === true,
              maxScore: 10,
              dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
              packId: pack.id,
              selectedExerciseIdsJson: JSON.stringify(savedExercises.map((exercise) => exercise.id)),
            },
          });
          for(const file of files) await tx.assignmentAttachment.create({data:{assignmentId:assignment.id,version:1,name:file.name,mimeType:file.mimeType,size:file.data.length,data:file.data}});
          await tx.assignmentVersion.create({
            data: {
              assignmentId: assignment.id,
              version: 1,
              title: assignment.title,
              promptText: assignment.promptText,
              dueDate: assignment.dueDate,
              changeNotes: `Xuất bản từ ${sourceFileName || 'tài liệu'}.`,
              difficultyJson: JSON.stringify(difficulty),
            },
          });
          await notifyAssignment(tx, assignment);
          return { pack, assignment };
        });

        return NextResponse.json({
          success: true,
          message: `Đã xuất bản thành công ${approvedQuestions.length} câu hỏi vào lớp học!`,
          assignmentId: published.assignment.id,
          packId: published.pack.id,
          publishedQuestionsCount: approvedQuestions.length,
            difficulty,
        });
      }
    }

    // Handle File Upload & Parse (FormData request)
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const mode = (formData.get('mode') as 'preserve_authored' | 'generate_from_content') || 'preserve_authored';
    const prompt = String(formData.get('prompt') || '').trim();
    if(prompt.length>5000)return NextResponse.json({error:'Prompt tối đa 5000 ký tự'},{status:400});
    const useDefaultSource = formData.get('useDefaultSource') === 'true';
    if (!['preserve_authored', 'generate_from_content'].includes(mode)) {
      return NextResponse.json({ error: 'Cách tạo câu hỏi không hợp lệ.' }, { status: 400 });
    }

    let buffer: Buffer;
    let filename: string;

    if (file && typeof file.arrayBuffer === 'function') {
      if (!IMPORT_EXTENSIONS.includes(file.name.split('.').pop()?.toLowerCase() || '') || file.size === 0 || file.size > 4 * 1024 * 1024) {
        return NextResponse.json({ error: 'Vui lòng chọn tệp DOCX, PDF, MD, HTML hoặc TXT không rỗng, tối đa 4 MB.' }, { status: 400 });
      }
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      filename = file.name;
    } else if (prompt && mode === 'generate_from_content') {
      buffer=Buffer.from(prompt); filename='grammar-prompt.txt';
    } else if (useDefaultSource && process.env.VERCEL !== '1' && fs.existsSync(DEFAULT_DOCX_PATH)) {
      buffer = fs.readFileSync(DEFAULT_DOCX_PATH);
      filename = 'GỦI.docx';
    } else {
      return NextResponse.json({ error: 'Vui lòng chọn tệp DOCX, PDF, MD, HTML hoặc TXT từ máy để AI đọc tài liệu và chuẩn bị câu hỏi.' }, { status: 400 });
    }

    const parsedResult = await parseImportDocument(buffer, filename, mode, prompt);
    const difficulty = await assessAssignmentDifficulty({ title: parsedResult.title, promptText: parsedResult.exercises.map(ex => ex.instruction).join('\n'), skill: 'reading', maxScore: 10, questions: parsedResult.exercises.flatMap(ex => ex.questions) });
    const assessmentToken = signImportAssessment(user.id, parsedResult.title, parsedResult.exercises, difficulty);

    return NextResponse.json({
      success: true,
      parsed: parsedResult,
      assessmentToken,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi xử lý tệp DOCX' }, { status: error.status || 500 });
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }
    if (user.role !== 'teacher' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Chỉ giáo viên hoặc quản trị viên mới có quyền xem học liệu này' }, { status: 403 });
    }

    const pack = await prisma.thematicPack.findFirst({
      where: { id: 'pack-unit-2' },
      include: {
        vocabulary: true,
        wordForms: true,
        grammar: true,
        exercises: true,
      },
    });

    return NextResponse.json({ pack });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

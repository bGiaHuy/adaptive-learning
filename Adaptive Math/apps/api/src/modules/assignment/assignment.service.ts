import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { AssignmentStatus, SubmissionStatus, QuestionStatus, CognitiveLevel } from '@prisma/client';
import { CustomQuestionDto } from './dto/create-assignment.dto';

@Injectable()
export class AssignmentService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Giáo viên tạo đề thi / bài tập cho lớp (hỗ trợ cả câu hỏi từ ngân hàng lẫn câu hỏi tự tạo / nhập từ AI)
  async createAssignment(teacherId: string, classId: string, dto: CreateAssignmentDto) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classId }
    });

    if (!classroom) {
      throw new NotFoundException({
        code: 'CLASSROOM_NOT_FOUND',
        message: 'Lớp học không tồn tại.'
      });
    }

    if (classroom.teacherId !== teacherId) {
      throw new ForbiddenException({
        code: 'ACCESS_DENIED',
        message: 'Bạn chỉ có quyền tạo đề thi cho lớp do bạn phụ trách.'
      });
    }

    const rawQuestionIds = Array.isArray(dto.questionIds) ? dto.questionIds.filter(Boolean) : [];
    const customQuestions = Array.isArray(dto.customQuestions) ? dto.customQuestions : [];

    if (rawQuestionIds.length === 0 && customQuestions.length === 0) {
      throw new BadRequestException({
        code: 'NO_QUESTIONS_PROVIDED',
        message: 'Đề thi phải có ít nhất 1 câu hỏi (chọn từ ngân hàng hoặc tự tạo).'
      });
    }

    // Verify all questionIds exist and are PUBLISHED
    if (rawQuestionIds.length > 0) {
      const questions = await this.prisma.question.findMany({
        where: {
          id: { in: rawQuestionIds },
          status: QuestionStatus.PUBLISHED
        }
      });

      if (questions.length !== rawQuestionIds.length) {
        throw new BadRequestException({
          code: 'INVALID_QUESTIONS',
          message: 'Một số câu hỏi được chọn không tồn tại hoặc chưa được duyệt (PUBLISHED).'
        });
      }
    }

    const createdCustomQuestionIds: string[] = [];

    if (customQuestions.length > 0) {
      // Find or establish default SkillNode for custom questions
      let defaultSkillNode = classroom.grade
        ? await this.prisma.skillNode.findFirst({ where: { grade: classroom.grade } })
        : null;
      if (!defaultSkillNode) {
        defaultSkillNode = await this.prisma.skillNode.findFirst();
      }
      if (!defaultSkillNode) {
        defaultSkillNode = await this.prisma.skillNode.upsert({
          where: { code: 'CUSTOM_TEACHER_EXAM' },
          update: {},
          create: {
            code: 'CUSTOM_TEACHER_EXAM',
            title: 'Câu hỏi đề kiểm tra giáo viên',
            grade: classroom.grade || 9,
            chapter: 'Đề kiểm tra giáo viên',
            orderIndex: 999
          }
        });
      }

      for (let i = 0; i < customQuestions.length; i++) {
        const cq = customQuestions[i];
        if (!cq.content || !cq.content.trim()) {
          throw new BadRequestException({
            code: 'INVALID_CUSTOM_QUESTION',
            message: `Câu hỏi số ${i + 1} không có nội dung.`
          });
        }
        if (!Array.isArray(cq.options) || cq.options.length < 2) {
          throw new BadRequestException({
            code: 'INVALID_CUSTOM_QUESTION',
            message: `Câu hỏi số ${i + 1} phải có ít nhất 2 phương án lựa chọn.`
          });
        }
        const matchedFromOption = cq.options.find(opt => (opt as any).isCorrect)?.key;
        const correctKey = (cq.correctOption || matchedFromOption || '').trim().toUpperCase();
        const hasMatchingOption = cq.options.some(
          opt => opt.key.trim().toUpperCase() === correctKey
        );
        if (!hasMatchingOption) {
          throw new BadRequestException({
            code: 'INVALID_CUSTOM_QUESTION',
            message: `Câu hỏi số ${i + 1}: Đáp án đúng "${cq.correctOption || matchedFromOption || ''}" không khớp với bất kỳ phương án nào (A, B, C, D).`
          });
        }

        // Determine cognitive level
        let level: CognitiveLevel = CognitiveLevel.REMEMBERING;
        const rawLevel = (cq.cognitiveLevel || '').toUpperCase();
        if (rawLevel.includes('THÔNG HIỂU') || rawLevel.includes('UNDERSTAND') || rawLevel.includes('COMPREHENSION')) {
          level = CognitiveLevel.UNDERSTANDING;
        } else if (rawLevel.includes('VẬN DỤNG') || rawLevel.includes('APPLY') || rawLevel.includes('APPLICATION')) {
          level = CognitiveLevel.APPLYING;
        }

        const skillId = cq.skillId || defaultSkillNode.id;

        const newQuestion = await this.prisma.question.create({
          data: {
            skillId,
            authorId: teacherId,
            cognitiveLevel: level,
            content: cq.content.trim(),
            explanation: cq.explanation?.trim() || null,
            status: QuestionStatus.PUBLISHED,
            options: {
              create: cq.options.map(opt => ({
                optionKey: opt.key.trim().toUpperCase(),
                content: opt.content.trim(),
                isCorrect: opt.key.trim().toUpperCase() === correctKey
              }))
            }
          }
        });
        createdCustomQuestionIds.push(newQuestion.id);
      }
    }

    const allQuestionIds = [...rawQuestionIds, ...createdCustomQuestionIds];

    const assignment = await this.prisma.classroomAssignment.create({
      data: {
        classId,
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        durationMinutes: dto.durationMinutes,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        status: dto.status || AssignmentStatus.PUBLISHED,
        questions: {
          create: allQuestionIds.map((qid, idx) => ({
            questionId: qid,
            orderIndex: idx + 1,
            points: 1.0
          }))
        }
      },
      include: {
        questions: {
          include: {
            question: {
              include: {
                skill: true
              }
            }
          },
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    return {
      message: 'Tạo đề thi thành công',
      assignment: {
        id: assignment.id,
        classId: assignment.classId,
        title: assignment.title,
        description: assignment.description,
        durationMinutes: assignment.durationMinutes,
        dueDate: assignment.dueDate,
        status: assignment.status,
        questionCount: assignment.questions.length,
        createdAt: assignment.createdAt
      }
    };
  }

  // 2. Lấy danh sách đề thi của lớp (Giáo viên hoặc Học sinh trong lớp)
  async getClassAssignments(userId: string, classId: string, isTeacher: boolean) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classId },
      include: {
        memberships: true
      }
    });

    if (!classroom) {
      throw new NotFoundException({
        code: 'CLASSROOM_NOT_FOUND',
        message: 'Lớp học không tồn tại.'
      });
    }

    if (isTeacher) {
      if (classroom.teacherId !== userId) {
        throw new ForbiddenException({
          code: 'ACCESS_DENIED',
          message: 'Bạn không có quyền xem lớp học này.'
        });
      }
    } else {
      const isMember = classroom.memberships.some(m => m.studentId === userId && m.status === 'ACTIVE');
      if (!isMember) {
        throw new ForbiddenException({
          code: 'ACCESS_DENIED',
          message: 'Bạn chưa tham gia lớp học này.'
        });
      }
    }

    const assignments = await this.prisma.classroomAssignment.findMany({
      where: {
        classId,
        ...(isTeacher ? {} : { status: AssignmentStatus.PUBLISHED })
      },
      include: {
        questions: true,
        submissions: isTeacher
          ? { select: { id: true, studentId: true, score: true, submittedAt: true } }
          : { where: { studentId: userId } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalStudents = classroom.memberships.length;

    return {
      assignments: assignments.map(a => {
        const studentSubmission = !isTeacher && a.submissions.length > 0 ? a.submissions[0] : null;
        const totalSubmissions = isTeacher ? a.submissions.length : 0;
        const avgScore = isTeacher && totalSubmissions > 0
          ? Number((a.submissions.reduce((acc, s) => acc + s.score, 0) / totalSubmissions).toFixed(1))
          : null;

        return {
          id: a.id,
          classId: a.classId,
          className: classroom.name,
          title: a.title,
          description: a.description,
          durationMinutes: a.durationMinutes,
          dueDate: a.dueDate,
          status: a.status,
          questionCount: a.questions.length,
          createdAt: a.createdAt,
          // Teacher stats
          totalStudents,
          totalSubmissions,
          averageScore: avgScore,
          // Student status
          isSubmitted: !!studentSubmission,
          studentScore: studentSubmission?.score ?? null,
          studentSubmittedAt: studentSubmission?.submittedAt ?? null
        };
      })
    };
  }

  // 3. Học sinh lấy đề thi để làm bài (ẨN ĐÁP ÁN ĐÚNG BẢO MẬT)
  async getAssignmentForTaking(studentId: string, assignmentId: string) {
    const assignment = await this.prisma.classroomAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        classroom: {
          include: {
            memberships: true
          }
        },
        questions: {
          include: {
            question: {
              include: {
                skill: true,
                options: true
              }
            }
          },
          orderBy: { orderIndex: 'asc' }
        },
        submissions: {
          where: { studentId }
        }
      }
    });

    if (!assignment) {
      throw new NotFoundException({
        code: 'ASSIGNMENT_NOT_FOUND',
        message: 'Đề thi không tồn tại.'
      });
    }

    const isMember = assignment.classroom.memberships.some(
      m => m.studentId === studentId && m.status === 'ACTIVE'
    );
    if (!isMember) {
      throw new ForbiddenException({
        code: 'ACCESS_DENIED',
        message: 'Bạn chưa là thành viên của lớp học này.'
      });
    }

    if (assignment.status !== AssignmentStatus.PUBLISHED) {
      throw new BadRequestException({
        code: 'ASSIGNMENT_NOT_ACTIVE',
        message: 'Đề thi hiện đang đóng hoặc chưa phát hành.'
      });
    }

    const existingSubmission = assignment.submissions[0];

    return {
      assignment: {
        id: assignment.id,
        classId: assignment.classId,
        className: assignment.classroom.name,
        title: assignment.title,
        description: assignment.description,
        durationMinutes: assignment.durationMinutes,
        dueDate: assignment.dueDate,
        isSubmitted: !!existingSubmission,
        studentScore: existingSubmission?.score ?? null,
        questions: assignment.questions.map(aq => ({
          id: aq.question.id,
          orderIndex: aq.orderIndex,
          content: aq.question.content,
          cognitiveLevel: aq.question.cognitiveLevel,
          skillTitle: aq.question.skill?.title || 'Chủ đề bài tập',
          chapter: aq.question.skill?.chapter || 'Lớp học',
          options: aq.question.options.map(opt => ({
            key: opt.optionKey,
            content: opt.content
            // Note: isCorrect is deliberately EXCLUDED here for exam integrity!
          }))
        }))
      }
    };
  }

  // 4. Học sinh nộp bài thi — Tự động chấm điểm & Lưu lịch sử
  async submitAssignment(studentId: string, assignmentId: string, dto: SubmitAssignmentDto) {
    const assignment = await this.prisma.classroomAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        classroom: {
          include: { memberships: true }
        },
        questions: {
          include: {
            question: {
              include: {
                skill: true,
                options: true
              }
            }
          },
          orderBy: { orderIndex: 'asc' }
        },
        submissions: {
          where: { studentId }
        }
      }
    });

    if (!assignment) {
      throw new NotFoundException({
        code: 'ASSIGNMENT_NOT_FOUND',
        message: 'Đề thi không tồn tại.'
      });
    }

    const isMember = assignment.classroom.memberships.some(
      m => m.studentId === studentId && m.status === 'ACTIVE'
    );
    if (!isMember) {
      throw new ForbiddenException({
        code: 'ACCESS_DENIED',
        message: 'Bạn không thuộc lớp học này.'
      });
    }

    if (assignment.submissions.length > 0) {
      throw new BadRequestException({
        code: 'ALREADY_SUBMITTED',
        message: 'Bạn đã nộp bài thi này rồi.'
      });
    }

    const answersMap = new Map(
      (dto.answers || []).map(a => [
        a.questionId,
        (a.selectedOptionKey || a.selectedOption || '').trim().toUpperCase() || null
      ])
    );
    const totalQuestions = assignment.questions.length;
    let correctCount = 0;

    const answerRecords: {
      questionId: string;
      selectedOptionKey: string | null;
      isCorrect: boolean;
      pointsAwarded: number;
    }[] = [];

    const wrongQuestionsToRecord: { questionId: string; selectedOptionKey: string | null }[] = [];

    for (const aq of assignment.questions) {
      const q = aq.question;
      const selectedKey = answersMap.get(q.id) || null;
      const correctOption = q.options.find(o => o.isCorrect);
      const isCorrect = !!correctOption && !!selectedKey && selectedKey === correctOption.optionKey.toUpperCase();

      if (isCorrect) {
        correctCount += 1;
      } else {
        wrongQuestionsToRecord.push({ questionId: q.id, selectedOptionKey: selectedKey });
      }

      answerRecords.push({
        questionId: q.id,
        selectedOptionKey: selectedKey,
        isCorrect,
        pointsAwarded: isCorrect ? 1.0 : 0.0
      });
    }

    // Scale to 10 points
    const rawScore = totalQuestions > 0 ? (correctCount / totalQuestions) * 10 : 0;
    const finalScore = Number(rawScore.toFixed(1));

    const submission = await this.prisma.assignmentSubmission.create({
      data: {
        assignmentId,
        studentId,
        score: finalScore,
        totalQuestions,
        correctCount,
        status: SubmissionStatus.SUBMITTED,
        submittedAt: new Date(),
        timeSpentSeconds: dto.timeSpentSeconds,
        answers: {
          create: answerRecords.map(ar => ({
            questionId: ar.questionId,
            selectedOptionKey: ar.selectedOptionKey,
            isCorrect: ar.isCorrect,
            pointsAwarded: ar.pointsAwarded
          }))
        }
      }
    });

    // Auto-record wrong questions to student Mistake Notebook
    for (const w of wrongQuestionsToRecord) {
      try {
        await this.prisma.mistakeRecord.upsert({
          where: {
            studentId_questionId: {
              studentId,
              questionId: w.questionId
            }
          },
          update: {
            selectedOptionKey: w.selectedOptionKey,
            isMastered: false,
            updatedAt: new Date()
          },
          create: {
            studentId,
            questionId: w.questionId,
            selectedOptionKey: w.selectedOptionKey,
            isMastered: false
          }
        });
      } catch (err) {
        // Silently continue if mistake recording fails
      }
    }

    return {
      message: 'Nộp bài thi thành công',
      submissionId: submission.id,
      score: finalScore,
      correctCount,
      totalQuestions,
      submittedAt: submission.submittedAt
    };
  }

  // 5. Học sinh xem kết quả và lời giải chi tiết sau khi nộp
  async getStudentAssignmentResult(studentId: string, assignmentId: string) {
    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId
        }
      },
      include: {
        assignment: {
          include: {
            classroom: true,
            questions: {
              include: {
                question: {
                  include: {
                    skill: true,
                    options: true
                  }
                }
              },
              orderBy: { orderIndex: 'asc' }
            }
          }
        },
        answers: true
      }
    });

    if (!submission) {
      throw new NotFoundException({
        code: 'SUBMISSION_NOT_FOUND',
        message: 'Chưa có kết quả làm bài cho đề thi này.'
      });
    }

    const answersMap = new Map(submission.answers.map(a => [a.questionId, a]));

    return {
      result: {
        submissionId: submission.id,
        assignmentTitle: submission.assignment.title,
        className: submission.assignment.classroom.name,
        score: submission.score,
        correctCount: submission.correctCount,
        totalQuestions: submission.totalQuestions,
        submittedAt: submission.submittedAt,
        timeSpentSeconds: submission.timeSpentSeconds,
        questions: submission.assignment.questions.map(aq => {
          const q = aq.question;
          const ans = answersMap.get(q.id);
          const correctOption = q.options.find(o => o.isCorrect);

          return {
            id: q.id,
            orderIndex: aq.orderIndex,
            content: q.content,
            cognitiveLevel: q.cognitiveLevel,
            skillTitle: q.skill?.title || 'Chủ đề bài tập',
            chapter: q.skill?.chapter || 'Lớp học',
            explanation: q.explanation,
            studentSelectedKey: ans?.selectedOptionKey || null,
            isCorrect: ans?.isCorrect || false,
            correctOptionKey: correctOption?.optionKey || '',
            options: q.options.map(opt => ({
              key: opt.optionKey,
              content: opt.content,
              isCorrect: opt.isCorrect
            }))
          };
        })
      }
    };
  }

  // 6. Giáo viên xem bảng điểm lớp học và phân tích từng câu hỏi
  async getAssignmentSubmissionsForTeacher(teacherId: string, classId: string, assignmentId: string) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classId },
      include: {
        memberships: {
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                username: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!classroom) {
      throw new NotFoundException({
        code: 'CLASSROOM_NOT_FOUND',
        message: 'Lớp học không tồn tại.'
      });
    }

    if (classroom.teacherId !== teacherId) {
      throw new ForbiddenException({
        code: 'ACCESS_DENIED',
        message: 'Bạn chỉ có quyền xem bảng điểm của lớp do bạn phụ trách.'
      });
    }

    const assignment = await this.prisma.classroomAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        questions: {
          include: {
            question: {
              include: {
                skill: true,
                options: true
              }
            }
          },
          orderBy: { orderIndex: 'asc' }
        },
        submissions: {
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                username: true,
                email: true
              }
            },
            answers: true
          },
          orderBy: { score: 'desc' }
        }
      }
    });

    if (!assignment || assignment.classId !== classId) {
      throw new NotFoundException({
        code: 'ASSIGNMENT_NOT_FOUND',
        message: 'Đề thi không tồn tại trong lớp này.'
      });
    }

    const submissionsMap = new Map(assignment.submissions.map(s => [s.studentId, s]));

    // Roster with scores
    const roster = classroom.memberships.map(m => {
      const sub = submissionsMap.get(m.studentId);
      return {
        studentId: m.studentId,
        fullName: m.student.fullName,
        username: m.student.username,
        email: m.student.email,
        isSubmitted: !!sub,
        score: sub?.score ?? null,
        correctCount: sub?.correctCount ?? null,
        totalQuestions: sub?.totalQuestions ?? assignment.questions.length,
        timeSpentSeconds: sub?.timeSpentSeconds ?? null,
        submittedAt: sub?.submittedAt ?? null
      };
    });

    // Per-question accuracy analytics across the class
    const questionAnalytics = assignment.questions.map(aq => {
      const q = aq.question;
      const correctOption = q.options.find(o => o.isCorrect);
      let correctAnswersInClass = 0;
      let totalAnswersInClass = 0;

      for (const sub of assignment.submissions) {
        const studentAns = sub.answers.find(a => a.questionId === q.id);
        if (studentAns) {
          totalAnswersInClass += 1;
          if (studentAns.isCorrect) correctAnswersInClass += 1;
        }
      }

      const passRate = totalAnswersInClass > 0
        ? Math.round((correctAnswersInClass / totalAnswersInClass) * 100)
        : 0;

      return {
        questionId: q.id,
        orderIndex: aq.orderIndex,
        content: q.content,
        cognitiveLevel: q.cognitiveLevel,
        skillTitle: q.skill.title,
        chapter: q.skill.chapter,
        correctOptionKey: correctOption?.optionKey || '',
        totalAnswers: totalAnswersInClass,
        correctAnswers: correctAnswersInClass,
        accuracyPercentage: passRate
      };
    });

    const submittedCount = assignment.submissions.length;
    const avgScore = submittedCount > 0
      ? Number((assignment.submissions.reduce((acc, s) => acc + s.score, 0) / submittedCount).toFixed(1))
      : 0;

    return {
      assignment: {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        durationMinutes: assignment.durationMinutes,
        dueDate: assignment.dueDate,
        status: assignment.status,
        totalStudents: classroom.memberships.length,
        submittedCount,
        averageScore: avgScore
      },
      roster,
      questionAnalytics
    };
  }

  // 7. Giáo viên xóa đề thi
  async deleteAssignment(teacherId: string, classId: string, assignmentId: string) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classId }
    });

    if (!classroom || classroom.teacherId !== teacherId) {
      throw new ForbiddenException({
        code: 'ACCESS_DENIED',
        message: 'Bạn không có quyền xóa đề thi này.'
      });
    }

    await this.prisma.classroomAssignment.delete({
      where: { id: assignmentId }
    });

    return { message: 'Đã xóa đề thi thành công.' };
  }

  // 8. Cung cấp file đề thi mẫu theo chuẩn GDPT 2018
  getSampleExamTemplate() {
    return {
      title: 'Đề kiểm tra 15 phút - Căn bậc hai và Hằng đẳng thức',
      description: 'Kiểm tra kiến thức cơ bản về căn bậc hai, điều kiện xác định và rút gọn biểu thức chứa căn.',
      durationMinutes: 15,
      questions: [
        {
          content: 'Giá trị của biểu thức $\\sqrt{25} - \\sqrt{9}$ là:',
          options: [
            { key: 'A', content: '2' },
            { key: 'B', content: '4' },
            { key: 'C', content: '16' },
            { key: 'D', content: '-2' }
          ],
          correctOption: 'A',
          explanation: 'Ta có $\\sqrt{25} = 5$ và $\\sqrt{9} = 3$. Do đó $5 - 3 = 2$.',
          cognitiveLevel: 'REMEMBERING'
        },
        {
          content: 'Điều kiện xác định của biểu thức $\\sqrt{2x - 6}$ là:',
          options: [
            { key: 'A', content: '$x \\ge 3$' },
            { key: 'B', content: '$x > 3$' },
            { key: 'C', content: '$x \\le 3$' },
            { key: 'D', content: '$x \\ge 6$' }
          ],
          correctOption: 'A',
          explanation: 'Biểu thức $\\sqrt{2x - 6}$ có nghĩa khi và chỉ khi $2x - 6 \\ge 0 \\Leftrightarrow 2x \\ge 6 \\Leftrightarrow x \\ge 3$.',
          cognitiveLevel: 'UNDERSTANDING'
        },
        {
          content: 'Rút gọn biểu thức $P = \\sqrt{(2 - \\sqrt{5})^2} + \\sqrt{5}$ ta được kết quả là:',
          options: [
            { key: 'A', content: '$2$' },
            { key: 'B', content: '$2\\sqrt{5} - 2$' },
            { key: 'C', content: '$-2$' },
            { key: 'D', content: '$2\\sqrt{5} + 2$' }
          ],
          correctOption: 'B',
          explanation: 'Vì $2 < \\sqrt{5}$ nên $2 - \\sqrt{5} < 0$. Do đó $\\sqrt{(2-\\sqrt{5})^2} = |2-\\sqrt{5}| = \\sqrt{5} - 2$. Vậy $P = \\sqrt{5} - 2 + \\sqrt{5} = 2\\sqrt{5} - 2$.',
          cognitiveLevel: 'APPLYING'
        }
      ]
    };
  }
}

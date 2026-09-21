import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewTeacherDto } from './dto/review-teacher.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { ReviewQuestionDto } from './dto/review-question.dto';
import {
  UserRole,
  TeacherVerificationStatus,
  QuestionStatus,
  AttemptStatus
} from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Get list of teacher applicants awaiting verification
  async getTeacherApplicants() {
    const applicants = await this.prisma.user.findMany({
      where: {
        OR: [
          { role: UserRole.TEACHER_APPLICANT },
          { teacherProfile: { verificationStatus: TeacherVerificationStatus.PENDING_REVIEW } }
        ]
      },
      include: {
        teacherProfile: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return applicants.map(a => ({
      userId: a.id,
      username: a.username,
      fullName: a.fullName,
      email: a.email,
      role: a.role,
      schoolName: a.teacherProfile?.schoolName,
      city: a.teacherProfile?.city,
      verificationStatus: a.teacherProfile?.verificationStatus,
      appliedAt: a.createdAt
    }));
  }

  // 2. Review Teacher Applicant (Approve -> TEACHER role; Reject -> REJECTED)
  async reviewTeacherApplicant(adminId: string, teacherId: string, dto: ReviewTeacherDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: teacherId },
      include: { teacherProfile: true }
    });

    if (!user || !user.teacherProfile) {
      throw new NotFoundException({
        code: 'TEACHER_NOT_FOUND',
        message: 'Không tìm thấy hồ sơ giáo viên ứng tuyển.'
      });
    }

    if (dto.status === TeacherVerificationStatus.VERIFIED) {
      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: teacherId },
          data: {
            role: UserRole.TEACHER,
            permissionVersion: { increment: 1 } // Invalidate old session cache
          }
        }),
        this.prisma.teacherProfile.update({
          where: { userId: teacherId },
          data: {
            verificationStatus: TeacherVerificationStatus.VERIFIED,
            verifiedAt: new Date(),
            verifiedByAdminId: adminId,
            rejectionReason: null
          }
        }),
        this.prisma.auditLog.create({
          data: {
            actorUserId: adminId,
            action: 'TEACHER_VERIFIED',
            targetEntity: 'User',
            targetEntityId: teacherId,
            metadata: { previousRole: user.role, newRole: UserRole.TEACHER }
          }
        })
      ]);

      return {
        message: `Đã phê duyệt giáo viên ${user.fullName} thành công. Tài khoản đã nhận quyền TEACHER.`,
        newRole: UserRole.TEACHER
      };
    } else {
      await this.prisma.$transaction([
        this.prisma.teacherProfile.update({
          where: { userId: teacherId },
          data: {
            verificationStatus: TeacherVerificationStatus.REJECTED,
            rejectionReason: dto.rejectionReason || 'Hồ sơ chưa đạt tiêu chuẩn chuyên môn'
          }
        }),
        this.prisma.auditLog.create({
          data: {
            actorUserId: adminId,
            action: 'TEACHER_REJECTED',
            targetEntity: 'User',
            targetEntityId: teacherId,
            metadata: { reason: dto.rejectionReason }
          }
        })
      ]);

      return {
        message: `Đã từ chối hồ sơ ứng tuyển của ${user.fullName}.`
      };
    }
  }

  // 3. Create Question (Initial status: DRAFT)
  async createQuestion(authorId: string, dto: CreateQuestionDto) {
    const skill = await this.prisma.skillNode.findUnique({
      where: { id: dto.skillId }
    });

    if (!skill) {
      throw new NotFoundException({
        code: 'SKILL_NOT_FOUND',
        message: 'Kỹ năng SkillNode không tồn tại.'
      });
    }

    // Ensure at least one correct option exists
    const hasCorrect = dto.options.some(o => o.isCorrect);
    if (!hasCorrect) {
      throw new BadRequestException({
        code: 'MISSING_CORRECT_OPTION',
        message: 'Câu hỏi bắt buộc phải có ít nhất 1 đáp án đúng.'
      });
    }

    const question = await this.prisma.question.create({
      data: {
        skillId: dto.skillId,
        versionNumber: 1,
        cognitiveLevel: dto.cognitiveLevel,
        content: dto.content,
        explanation: dto.explanation,
        status: QuestionStatus.DRAFT,
        authorId,
        options: {
          create: dto.options.map(o => ({
            optionKey: o.optionKey,
            content: o.content,
            isCorrect: o.isCorrect
          }))
        }
      },
      include: {
        options: true,
        skill: true
      }
    });

    await this.prisma.auditLog.create({
      data: {
        actorUserId: authorId,
        action: 'QUESTION_CREATED',
        targetEntity: 'Question',
        targetEntityId: question.id,
        metadata: { skillCode: skill.code, version: 1 }
      }
    });

    return {
      message: 'Tạo câu hỏi thành công (trạng thái DRAFT)',
      question
    };
  }

  // 4. Review Question with MAKER-CHECKER Guard (authorId !== reviewerId)
  async reviewQuestion(reviewerId: string, questionId: string, dto: ReviewQuestionDto) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId }
    });

    if (!question) {
      throw new NotFoundException({
        code: 'QUESTION_NOT_FOUND',
        message: 'Không tìm thấy câu hỏi.'
      });
    }

    // STRICT MAKER-CHECKER ENFORCEMENT: Author cannot review or publish own question
    if (question.authorId === reviewerId) {
      throw new ForbiddenException({
        code: 'MAKER_CHECKER_VIOLATION',
        message: 'Quy tắc Maker-Checker: Tác giả câu hỏi không được phép tự thẩm định hoặc phê duyệt câu hỏi của chính mình.'
      });
    }

    const updated = await this.prisma.question.update({
      where: { id: questionId },
      data: {
        status: dto.status,
        reviewerId
      },
      include: {
        options: true,
        skill: true,
        author: { select: { fullName: true, username: true } },
        reviewer: { select: { fullName: true, username: true } }
      }
    });

    await this.prisma.auditLog.create({
      data: {
        actorUserId: reviewerId,
        action: 'QUESTION_REVIEWED',
        targetEntity: 'Question',
        targetEntityId: question.id,
        metadata: { previousStatus: question.status, newStatus: dto.status }
      }
    });

    return {
      message: `Đã cập nhật trạng thái câu hỏi thành ${dto.status}`,
      question: updated
    };
  }

  // 5. List Questions with filters
  async getQuestions(status?: QuestionStatus, skillId?: string) {
    const where: any = {};
    if (status) where.status = status;
    if (skillId) where.skillId = skillId;

    return this.prisma.question.findMany({
      where,
      include: {
        skill: true,
        options: true,
        author: { select: { id: true, fullName: true, username: true } },
        reviewer: { select: { id: true, fullName: true, username: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // 6. Get Audit Logs
  async getAuditLogs(limit: number = 50) {
    return this.prisma.auditLog.findMany({
      take: limit,
      include: {
        actor: {
          select: { id: true, username: true, fullName: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // 7. System Analytics & Overview
  async getSystemOverview() {
    const [
      totalUsers,
      studentsCount,
      teachersCount,
      pendingTeachersCount,
      classroomsCount,
      questionsCount,
      completedAttempts
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: UserRole.STUDENT } }),
      this.prisma.user.count({ where: { role: UserRole.TEACHER } }),
      this.prisma.user.count({ where: { role: UserRole.TEACHER_APPLICANT } }),
      this.prisma.classroom.count(),
      this.prisma.question.count(),
      this.prisma.diagnosticAttempt.count({ where: { status: AttemptStatus.COMPLETED } })
    ]);

    return {
      totalUsers,
      studentsCount,
      teachersCount,
      pendingTeachersCount,
      classroomsCount,
      questionsCount,
      completedAttempts,
      systemHealth: 'HEALTHY'
    };
  }
}

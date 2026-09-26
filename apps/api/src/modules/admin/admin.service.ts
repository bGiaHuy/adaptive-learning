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
  UserStatus,
  TeacherVerificationStatus,
  QuestionStatus,
  AttemptStatus
} from '@prisma/client';
import * as argon2 from '@node-rs/argon2';

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

  // 8. User Management: Get list of all users with search & filters
  async getUsers(query: { role?: UserRole; status?: UserStatus; search?: string; page?: number; limit?: number }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.role) where.role = query.role;
    if (query.status) where.status = query.status;
    if (query.search?.trim()) {
      const s = query.search.trim();
      where.OR = [
        { username: { contains: s, mode: 'insensitive' } },
        { fullName: { contains: s, mode: 'insensitive' } },
        { email: { contains: s, mode: 'insensitive' } }
      ];
    }

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          role: true,
          status: true,
          createdAt: true,
          teacherProfile: {
            select: {
              schoolName: true,
              city: true,
              verificationStatus: true
            }
          },
          studentProfile: {
            select: {
              grade: true,
              targetGoal: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      })
    ]);

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // 9. Update user status (Active / Suspended)
  async updateUserStatus(adminId: string, userId: string, newStatus: UserStatus) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'Người dùng không tồn tại.'
      });
    }

    if (user.id === adminId && newStatus === UserStatus.SUSPENDED) {
      throw new BadRequestException({
        code: 'CANNOT_SUSPEND_SELF',
        message: 'Bạn không thể tự khóa tài khoản quản trị của chính mình.'
      });
    }

    const updated = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          status: newStatus,
          permissionVersion: { increment: 1 } // Invalidate active session tokens
        }
      }),
      this.prisma.auditLog.create({
        data: {
          actorUserId: adminId,
          action: newStatus === UserStatus.SUSPENDED ? 'USER_SUSPENDED' : 'USER_ACTIVATED',
          targetEntity: 'User',
          targetEntityId: userId,
          metadata: { previousStatus: user.status, newStatus }
        }
      })
    ]);

    return {
      message: `Đã ${newStatus === UserStatus.SUSPENDED ? 'khóa' : 'mở khóa'} tài khoản ${user.username} thành công.`,
      user: {
        id: updated[0].id,
        username: updated[0].username,
        status: updated[0].status
      }
    };
  }

  // 10. Reset user password
  async resetUserPassword(adminId: string, userId: string, newPassword?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'Người dùng không tồn tại.'
      });
    }

    const passwordToSet = newPassword?.trim() || 'P@ssword123!';
    const passwordHash = await argon2.hash(passwordToSet, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1
    });

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          passwordHash,
          permissionVersion: { increment: 1 }
        }
      }),
      this.prisma.auditLog.create({
        data: {
          actorUserId: adminId,
          action: 'PASSWORD_RESET_BY_ADMIN',
          targetEntity: 'User',
          targetEntityId: userId
        }
      })
    ]);

    return {
      message: `Đã đặt lại mật khẩu cho tài khoản ${user.username} thành công.`,
      tempPassword: passwordToSet
    };
  }

  // 11. Get all classrooms across system
  async getAllClassrooms() {
    const classrooms = await this.prisma.classroom.findMany({
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
            email: true,
            teacherProfile: { select: { schoolName: true, city: true } }
          }
        },
        memberships: {
          select: { id: true }
        },
        assignments: {
          select: { id: true, title: true, status: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return {
      total: classrooms.length,
      classrooms: classrooms.map(c => ({
        id: c.id,
        name: c.name,
        grade: c.grade,
        academicYear: c.academicYear,
        isActive: c.isActive,
        createdAt: c.createdAt,
        teacher: {
          id: c.teacher.id,
          fullName: c.teacher.fullName,
          email: c.teacher.email,
          schoolName: c.teacher.teacherProfile?.schoolName,
          city: c.teacher.teacherProfile?.city
        },
        studentsCount: c.memberships.length,
        assignmentsCount: c.assignments.length
      }))
    };
  }

  // 12. Curriculum Stats
  async getCurriculumStats() {
    const [byStatus, byLevel, skills] = await Promise.all([
      this.prisma.question.groupBy({
        by: ['status'],
        _count: { id: true }
      }),
      this.prisma.question.groupBy({
        by: ['cognitiveLevel'],
        _count: { id: true }
      }),
      this.prisma.skillNode.findMany({
        include: {
          _count: {
            select: { questions: true }
          }
        },
        orderBy: { orderIndex: 'asc' }
      })
    ]);

    return {
      byStatus: byStatus.map(s => ({ status: s.status, count: s._count.id })),
      byLevel: byLevel.map(l => ({ level: l.cognitiveLevel, count: l._count.id })),
      bySkill: skills.map(sk => ({
        id: sk.id,
        code: sk.code,
        title: sk.title,
        chapter: sk.chapter,
        questionCount: sk._count.questions
      }))
    };
  }
}

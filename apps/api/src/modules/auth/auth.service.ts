import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException
} from '@nestjs/common';
import * as crypto from 'crypto';
import * as argon2 from '@node-rs/argon2';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterStudentDto } from './dto/register-student.dto';
import { RegisterTeacherDto } from './dto/register-teacher.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole, UserStatus, TeacherVerificationStatus } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly sessionSecret: string;
  private readonly sessionTtlMs: number;

  constructor(private readonly prisma: PrismaService) {
    this.sessionSecret =
      process.env.SESSION_SECRET || 'adaptivemath_dev_session_secret_key_at_least_32_chars_long';
    this.sessionTtlMs = (parseInt(process.env.SESSION_TTL_SECONDS || '604800', 10)) * 1000;
  }

  // Hash password using Argon2id with OWASP recommended parameters
  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1
    });
  }

  // Verify password using Argon2id
  async verifyPassword(hash: string, plain: string): Promise<boolean> {
    return argon2.verify(hash, plain);
  }

  // Generate a high-entropy 32-byte session token
  generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Hash session token before storing in database (Defense-in-depth against DB leak)
  hashSessionToken(token: string): string {
    return crypto
      .createHmac('sha256', this.sessionSecret)
      .update(token)
      .digest('hex');
  }

  // Register Student
  async registerStudent(dto: RegisterStudentDto) {
    // Check uniqueness of username
    const existingUsername = await this.prisma.user.findUnique({
      where: { username: dto.username }
    });
    if (existingUsername) {
      throw new ConflictException({
        code: 'USERNAME_ALREADY_EXISTS',
        message: 'Tên đăng nhập này đã được sử dụng. Vui lòng chọn tên khác.'
      });
    }

    if (dto.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: dto.email }
      });
      if (existingEmail) {
        throw new ConflictException({
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'Địa chỉ email này đã được sử dụng. Vui lòng chọn email khác.'
        });
      }
    }

    const passwordHash = await this.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email || null,
        fullName: dto.fullName,
        passwordHash,
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
        studentProfile: {
          create: {
            grade: 9,
            targetGoal: 'Ôn thi vào lớp 10',
            dailyMinutes: 45,
            parentEmail: dto.parentEmail || null
          }
        }
      },
      include: {
        studentProfile: true
      }
    });

    return this.sanitizeUser(user);
  }

  // Register Teacher Applicant (Pending Verification)
  async registerTeacher(dto: RegisterTeacherDto) {
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });
    if (existingEmail) {
      throw new ConflictException({
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'Địa chỉ email này đã được sử dụng.'
      });
    }

    // Auto generate username from email prefix if not provided
    const usernamePrefix = dto.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
    const username = `${usernamePrefix}_${crypto.randomBytes(2).toString('hex')}`;

    const passwordHash = await this.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        username,
        email: dto.email,
        fullName: dto.fullName,
        passwordHash,
        role: UserRole.TEACHER_APPLICANT,
        status: UserStatus.ACTIVE,
        teacherProfile: {
          create: {
            schoolName: dto.schoolName || null,
            city: dto.city || null,
            verificationStatus: TeacherVerificationStatus.PENDING_REVIEW
          }
        }
      },
      include: {
        teacherProfile: true
      }
    });

    return this.sanitizeUser(user);
  }

  // Login: authenticate credentials and create persistent DB session
  async login(dto: LoginDto, userAgent?: string, ipAddress?: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: dto.identifier }, { email: dto.identifier }]
      },
      include: {
        studentProfile: true,
        teacherProfile: true
      }
    });

    if (!user) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Tên đăng nhập hoặc mật khẩu không chính xác.'
      });
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new ForbiddenException({
        code: 'ACCOUNT_SUSPENDED',
        message: 'Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ ban quản trị.'
      });
    }

    const isPasswordValid = await this.verifyPassword(user.passwordHash, dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Tên đăng nhập hoặc mật khẩu không chính xác.'
      });
    }

    // Generate session token and store hash in database
    const sessionToken = this.generateSessionToken();
    const tokenHash = this.hashSessionToken(sessionToken);
    const expiresAt = new Date(Date.now() + this.sessionTtlMs);

    await this.prisma.session.create({
      data: {
        userId: user.id,
        tokenHash,
        permissionVersion: user.permissionVersion,
        userAgent: userAgent || 'Unknown',
        ipAddress: ipAddress || 'Unknown',
        expiresAt
      }
    });

    // Record login audit log
    await this.prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: 'USER_LOGIN',
        targetEntity: 'User',
        targetEntityId: user.id,
        ipAddress: ipAddress || null
      }
    });

    return {
      user: this.sanitizeUser(user),
      sessionToken,
      expiresAt
    };
  }

  // Validate session token from cookie
  async validateSession(rawToken: string) {
    if (!rawToken || rawToken.length < 32) return null;

    const tokenHash = this.hashSessionToken(rawToken);
    const session = await this.prisma.session.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            studentProfile: true,
            teacherProfile: true
          }
        }
      }
    });

    if (!session || session.revokedAt) return null;

    // Check expiration
    if (session.expiresAt.getTime() < Date.now()) {
      await this.prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      return null;
    }

    // Check account status
    if (session.user.status === UserStatus.SUSPENDED) {
      return null;
    }

    // A role or permission change invalidates every session created with an older version.
    if (session.permissionVersion !== session.user.permissionVersion) {
      await this.prisma.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date() }
      }).catch(() => undefined);
      return null;
    }

    if (Date.now() - session.lastSeenAt.getTime() > 5 * 60 * 1000) {
      await this.prisma.session.update({
        where: { id: session.id },
        data: { lastSeenAt: new Date() }
      }).catch(() => undefined);
    }

    return this.sanitizeUser(session.user);
  }

  // Logout single session
  async logout(rawToken: string) {
    if (!rawToken) return;
    const tokenHash = this.hashSessionToken(rawToken);
    await this.prisma.session.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() }
    });
  }

  async listSessions(userId: string, currentRawToken?: string) {
    const currentTokenHash = currentRawToken
      ? this.hashSessionToken(currentRawToken)
      : undefined;
    const sessions = await this.prisma.session.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() }
      },
      orderBy: { lastSeenAt: 'desc' }
    });

    return sessions.map((session) => ({
      id: session.id,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      createdAt: session.createdAt,
      lastSeenAt: session.lastSeenAt,
      expiresAt: session.expiresAt,
      isCurrent: session.tokenHash === currentTokenHash
    }));
  }

  async revokeSession(userId: string, sessionId: string) {
    const result = await this.prisma.session.updateMany({
      where: { id: sessionId, userId, revokedAt: null },
      data: { revokedAt: new Date() }
    });

    if (result.count === 0) {
      throw new ForbiddenException({
        code: 'SESSION_NOT_ACCESSIBLE',
        message: 'Không thể thu hồi phiên đăng nhập này.'
      });
    }
  }

  // Logout all sessions of a user (e.g. on password reset or account compromise)
  async logoutAll(userId: string) {
    await this.prisma.$transaction([
      this.prisma.session.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() }
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { permissionVersion: { increment: 1 } }
      })
    ]);
  }

  // Strip password hash from returned user object
  sanitizeUser(user: any) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}

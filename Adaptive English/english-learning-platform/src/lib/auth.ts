import { cookies } from 'next/headers';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from './prisma';
import { authCookieSecure } from './authCookie';

export const AUTH_COOKIE_NAME = 'adaptive_session_token';
export const LEGACY_COOKIE_NAME = 'adaptive_session_user';

export const SAFE_USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  avatar: true,
  cefrTarget: true,
  dailyMinutes: true,
  vocabDailyLimit: true,
  masteryIntervalDays: true,
} as const;

export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function generateSessionToken(): string {
  // Cryptographically secure random 32-byte hex token (256 bits)
  return crypto.randomBytes(32).toString('hex');
}

export function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function createSession(userId: string, durationDays: number = 7) {
  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      sessionToken: tokenHash,
      userId,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

export async function getCurrentUser() {
  const cookieStore = cookies();
  const rawToken =
    cookieStore.get(AUTH_COOKIE_NAME)?.value ||
    cookieStore.get(LEGACY_COOKIE_NAME)?.value;

  if (!rawToken) {
    return null;
  }

  const tokenHash = hashSessionToken(rawToken);

  const session = await prisma.session.findUnique({
    where: { sessionToken: tokenHash },
    include: {
      user: {
        select: SAFE_USER_SELECT,
      },
    },
  });

  if (!session) {
    return null;
  }

  // Check expiration
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({
      where: { id: session.id },
    }).catch(() => {});
    return null;
  }

  return session.user;
}

export async function setAuthSession(userId: string, durationDays: number = 7) {
  const { token, expiresAt } = await createSession(userId, durationDays);
  const cookieStore = cookies();

  const cookieOptions = {
    httpOnly: true,
    secure: authCookieSecure(process.env.NODE_ENV, process.env.BASE_URL || process.env.NEXTAUTH_URL),
    sameSite: 'lax' as const,
    path: '/',
    expires: expiresAt,
  };

  cookieStore.set(AUTH_COOKIE_NAME, token, cookieOptions);
  cookieStore.set(LEGACY_COOKIE_NAME, token, cookieOptions);

  return token;
}

export async function clearAuthSession() {
  const cookieStore = cookies();
  const rawToken =
    cookieStore.get(AUTH_COOKIE_NAME)?.value ||
    cookieStore.get(LEGACY_COOKIE_NAME)?.value;

  if (rawToken) {
    const tokenHash = hashSessionToken(rawToken);
    await prisma.session.deleteMany({
      where: { sessionToken: tokenHash },
    }).catch(() => {});
  }

  cookieStore.delete(AUTH_COOKIE_NAME);
  cookieStore.delete(LEGACY_COOKIE_NAME);
}

export async function revokeAllUserSessions(userId: string) {
  await prisma.session.deleteMany({
    where: { userId },
  }).catch(() => {});
}

export function generateResetToken(): string {
  // 32-byte cryptographically secure random token (64 hex characters)
  return crypto.randomBytes(32).toString('hex');
}

export function hashResetToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function createPasswordResetToken(userId: string, durationMinutes: number = 30) {
  // Invalidate any existing unused reset tokens for this user
  await prisma.passwordResetToken.deleteMany({
    where: { userId, usedAt: null },
  }).catch(() => {});

  const token = generateResetToken();
  const tokenHash = hashResetToken(token);
  const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

export async function verifyAndConsumeResetToken(token: string) {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Mã khôi phục không hợp lệ' };
  }

  const tokenHash = hashResetToken(token);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!record) {
    return { valid: false, error: 'Mã khôi phục không tồn tại hoặc đã bị hủy' };
  }

  if (record.usedAt) {
    return { valid: false, error: 'Mã khôi phục này đã được sử dụng trước đó' };
  }

  if (record.expiresAt < new Date()) {
    return { valid: false, error: 'Mã khôi phục đã hết hạn (chỉ có hiệu lực trong 30 phút)' };
  }

  return { valid: true, record, user: record.user };
}

export async function authenticateRequest(allowedRoles?: string[]) {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, status: 401 as const, error: 'Chưa đăng nhập' };
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return { user, status: 403 as const, error: 'Không có quyền truy cập' };
  }
  return { user, status: 200 as const, error: null };
}

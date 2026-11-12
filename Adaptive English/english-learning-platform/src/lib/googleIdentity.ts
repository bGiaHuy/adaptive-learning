import type { PrismaClient } from '@prisma/client';
import { randomBytes, timingSafeEqual, createHash } from 'crypto';

export const GOOGLE_STATE_COOKIE = 'adaptive_google_state';
export const GOOGLE_STATE_TTL = 10 * 60;
export type GoogleClaims = { sub?: string; email?: string; email_verified?: boolean; nonce?: string; name?: string; picture?: string };
export function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID?.endsWith('.apps.googleusercontent.com') && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CLIENT_SECRET !== '[SENSITIVE]');
}
export function googleOrigin() {
  const url = new URL(process.env.BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000');
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))) throw new Error('Invalid OAuth origin');
  return url.origin;
}
export function safeGoogleReturnTo(value: string | null | undefined, role: string) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || /[\\\x00-\x20\x7f]/.test(value)) return '';
  try {
    const url = new URL(value, 'https://local.invalid');
    const path = decodeURIComponent(url.pathname);
    if (/[\\\x00-\x20\x7f]/.test(path) || path.includes('..') || path.startsWith('//')) return '';
    const prefix = role === 'teacher' ? '/teacher/' : role === 'admin' ? '/admin' : '/student/';
    return url.origin === 'https://local.invalid' && url.pathname.startsWith(prefix) ? url.pathname + url.search : '';
  } catch { return ''; }
}
export function sameGoogleState(left: string, right: string) {
  return /^[A-Za-z0-9_-]{43}$/.test(left) && /^[A-Za-z0-9_-]{43}$/.test(right) && timingSafeEqual(Buffer.from(left), Buffer.from(right));
}
export function googleStateHash(state: string) { return createHash('sha256').update(state).digest('hex'); }
export function newGoogleFlow() {
  const state = randomBytes(32).toString('base64url');
  const nonce = randomBytes(32).toString('base64url');
  const codeVerifier = randomBytes(48).toString('base64url');
  return { state, nonce, codeVerifier, codeChallenge: createHash('sha256').update(codeVerifier).digest('base64url') };
}
export function validateGoogleClaims(payload: GoogleClaims, nonce: string) {
  if (!payload.sub || typeof payload.sub !== 'string' || payload.sub.length > 255 || payload.email_verified !== true || !payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email) || payload.email.length > 254 || !sameGoogleState(payload.nonce || '', nonce)) throw new Error('google_invalid_identity');
  return { subject: payload.sub, email: payload.email.trim().toLowerCase(), name: (payload.name || payload.email.split('@')[0]).slice(0, 100) };
}

// Link by stable Google subject. Matching email alone never grants access to an existing account.
export async function resolveGoogleIdentity(db: PrismaClient, identity: ReturnType<typeof validateGoogleClaims>, flow: { role: string; linkUserId: string | null }, authenticatedUserId: string | null, passwordHash: string) {
  return db.$transaction(async tx => {
    const account = await tx.googleAccount.findUnique({ where: { subject: identity.subject }, include: { user: true } });
    if (flow.linkUserId) {
      if (authenticatedUserId !== flow.linkUserId) throw new Error('google_link_session');
      const user = await tx.user.findUnique({ where: { id: flow.linkUserId } });
      if (!user || user.email.toLowerCase() !== identity.email) throw new Error('google_link_email');
      if (account) {
        if (account.userId !== user.id) throw new Error('google_link_conflict');
        return { user, created: false, linked: true };
      }
      if (await tx.googleAccount.findUnique({ where: { userId: user.id } })) throw new Error('google_link_conflict');
      await tx.googleAccount.create({ data: { subject: identity.subject, userId: user.id } });
      return { user, created: false, linked: true };
    }
    if (account) return { user: account.user, created: false, linked: false };
    if (await tx.user.findUnique({ where: { email: identity.email } })) throw new Error('google_link_required');
    const role = flow.role === 'teacher' ? 'teacher' : 'student';
    const user = await tx.user.create({ data: {
      email: identity.email, name: identity.name, passwordHash, role,
      googleAccount: { create: { subject: identity.subject } },
      ...(role === 'student' ? { skillProfiles: { create: ['reading', 'listening', 'writing', 'speaking', 'vocabulary', 'grammar'].map(skill => ({ skill, level: 'Chưa đánh giá', scoreDisplay: 'Chưa làm bài kiểm tra đầu vào', confidence: 10, evidenceCount: 0, independentRate: 0 })) } } : {}),
    } });
    return { user, created: true, linked: false };
  });
}

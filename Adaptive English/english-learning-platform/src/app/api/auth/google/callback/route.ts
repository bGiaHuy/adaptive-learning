import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import prisma from '@/lib/prisma';
import { getCurrentUser, hashPassword, setAuthSession } from '@/lib/auth';
import { googleConfigured, googleOrigin, sameGoogleState, googleStateHash, validateGoogleClaims, resolveGoogleIdentity, safeGoogleReturnTo, GOOGLE_STATE_COOKIE } from '@/lib/googleIdentity';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const origin = googleOrigin();
  const query = new URL(request.url).searchParams;
  const state = query.get('state') || '';
  const saved = cookies().get(GOOGLE_STATE_COOKIE)?.value || '';
  const finish = (path: string) => {
    const response = NextResponse.redirect(new URL(path, origin), 303);
    response.cookies.set(GOOGLE_STATE_COOKIE, '', { httpOnly: true, secure: origin.startsWith('https:'), sameSite: 'lax', path: '/api/auth/google', maxAge: 0 });
    response.headers.set('cache-control', 'no-store');
    response.headers.set('referrer-policy', 'no-referrer');
    return response;
  };
  if (!sameGoogleState(state, saved)) return finish('/auth/login?google_error=state');
  if (!googleConfigured()) return finish('/auth/login?google_error=unavailable');
  try {
    const flow = await prisma.googleOAuthState.findUnique({ where: { stateHash: googleStateHash(state) } });
    if (!flow || flow.expiresAt <= new Date()) return finish('/auth/login?google_error=state');
    const consumed = await prisma.googleOAuthState.deleteMany({ where: { stateHash: flow.stateHash, expiresAt: { gt: new Date() } } });
    if (consumed.count !== 1) return finish('/auth/login?google_error=state');
    if (query.has('error')) return finish('/auth/login?google_error=cancelled');
    const code = query.get('code');
    if (!code || code.length > 4096) return finish('/auth/login?google_error=failed');
    const client = new OAuth2Client({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET, redirectUri: origin + '/api/auth/google/callback' });
    const { tokens } = await client.getToken({ code, codeVerifier: flow.codeVerifier });
    if (!tokens.id_token) throw new Error('google_invalid_identity');
    const ticket = await client.verifyIdToken({ idToken: tokens.id_token, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload) throw new Error('google_invalid_identity');
    const identity = validateGoogleClaims(payload, flow.nonce);
    const current = flow.linkUserId ? await getCurrentUser() : null;
    const passwordHash = await hashPassword(randomBytes(48).toString('base64url'));
    const result = await resolveGoogleIdentity(prisma, identity, flow, current?.id || null, passwordHash);
    await setAuthSession(result.user.id);
    const fallback = result.user.role === 'teacher' ? '/teacher/dashboard' : result.user.role === 'admin' ? '/admin' : result.created ? '/student/onboarding' : '/student/home';
    return finish(safeGoogleReturnTo(flow.returnTo, result.user.role) || fallback);
  } catch (error) {
    const known = error instanceof Error && ['google_link_required', 'google_link_session', 'google_link_email', 'google_link_conflict'].includes(error.message) ? error.message.slice(7) : 'failed';
    return finish('/auth/login?google_error=' + known);
  }
}

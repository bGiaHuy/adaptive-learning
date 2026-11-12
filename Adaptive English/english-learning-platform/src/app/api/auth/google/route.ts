import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { googleConfigured, googleOrigin, newGoogleFlow, googleStateHash, safeGoogleReturnTo, GOOGLE_STATE_COOKIE, GOOGLE_STATE_TTL } from '@/lib/googleIdentity';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function begin(request: Request, link: boolean) {
  const origin = googleOrigin();
  if (link && request.headers.get('origin') !== origin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (!googleConfigured()) return NextResponse.redirect(new URL('/auth/login?google_error=unavailable', origin), 303);
  const user = link ? await getCurrentUser() : null;
  if (link && !user) return NextResponse.redirect(new URL('/auth/login', origin), 303);
  const query = new URL(request.url).searchParams;
  const role = user?.role || (query.get('role') === 'teacher' ? 'teacher' : 'student');
  const returnTo = safeGoogleReturnTo(link ? `/${role === 'teacher' ? 'teacher' : 'student'}/settings` : query.get('redirect'), role);
  try {
    const flow = newGoogleFlow();
    await prisma.googleOAuthState.deleteMany({ where: { expiresAt: { lt: new Date() } } });
    await prisma.googleOAuthState.create({ data: { stateHash: googleStateHash(flow.state), nonce: flow.nonce, codeVerifier: flow.codeVerifier, role, returnTo, linkUserId: user?.id || null, expiresAt: new Date(Date.now() + GOOGLE_STATE_TTL * 1000) } });
    cookies().set(GOOGLE_STATE_COOKIE, flow.state, { httpOnly: true, secure: origin.startsWith('https:'), sameSite: 'lax', path: '/api/auth/google', maxAge: GOOGLE_STATE_TTL });
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.search = new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID!, redirect_uri: origin + '/api/auth/google/callback', response_type: 'code', scope: 'openid email profile', state: flow.state, nonce: flow.nonce, code_challenge: flow.codeChallenge, code_challenge_method: 'S256', prompt: 'select_account' }).toString();
    const response = NextResponse.redirect(url, 303);
    response.headers.set('cache-control', 'no-store');
    response.headers.set('referrer-policy', 'no-referrer');
    return response;
  } catch {
    return NextResponse.redirect(new URL('/auth/login?google_error=failed', origin), 303);
  }
}
export async function GET(request: Request) { return begin(request, false); }
export async function POST(request: Request) { return begin(request, true); }

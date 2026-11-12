import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { googleConfigured } from '@/lib/googleIdentity';
import prisma from '@/lib/prisma';
export const dynamic = 'force-dynamic';
export async function GET() {
  const enabled = googleConfigured();
  const user = enabled ? await getCurrentUser() : null;
  const account = user ? await prisma.googleAccount.findUnique({ where: { userId: user.id }, select: { userId: true } }) : null;
  return NextResponse.json({ enabled, connected: Boolean(account) }, { headers: { 'cache-control': 'private, no-store' } });
}

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { hashRegistrationOtp, normalizeRegistrationEmail, OTP_TTL_MS, sendRegistrationOtp } from '@/lib/registrationOtp';

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY || !process.env.AUTH_EMAIL_FROM) {
    return NextResponse.json({ error: 'Chưa cấu hình dịch vụ email xác thực. Vui lòng liên hệ người quản lý.' }, { status: 503 });
  }
  try {
    const email = normalizeRegistrationEmail((await request.json()).email);
    if (!email) return NextResponse.json({ error: 'Vui lòng nhập email hợp lệ.' }, { status: 400 });
    const now = new Date();
    // Only trust the hosting platform's overwritten address header.
    const address = process.env.VERCEL ? request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() : null;
    const key = hashRegistrationOtp('send-rate', address || 'shared-local');
    await prisma.authEmailRateLimit.upsert({ where: { key }, create: { key, windowAt: now, count: 0 }, update: {} });
    await prisma.authEmailRateLimit.updateMany({
      where: { key, windowAt: { lte: new Date(now.getTime() - 15 * 60 * 1000) } },
      data: { windowAt: now, count: 0 },
    });
    const allowed = await prisma.authEmailRateLimit.updateMany({ where: { key, count: { lt: address ? 20 : 100 } }, data: { count: { increment: 1 } } });
    if (!allowed.count) return NextResponse.json({ error: 'Đã có quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút.' }, { status: 429 });
    const old = await prisma.registrationOtp.findUnique({ where: { email } });
    const freshWindow = !old || now.getTime() - old.windowAt.getTime() >= 15 * 60 * 1000;
    if (old && (now.getTime() - old.sentAt.getTime() < 60000 || (!freshWindow && old.sends >= 3))) {
      return NextResponse.json({ error: 'Vui lòng chờ 60 giây giữa các lần gửi; tối đa 3 lần trong 15 phút.' }, { status: 429 });
    }
    const code = crypto.randomInt(0, 1000000).toString().padStart(6, '0');
    const data = { codeHash: hashRegistrationOtp(email, code), expiresAt: new Date(now.getTime() + OTP_TTL_MS),
      sentAt: now, windowAt: freshWindow ? now : old!.windowAt, sends: freshWindow ? 1 : old!.sends + 1, attempts: 0 };
    // Reserve the send before contacting the provider; concurrent requests cannot bypass cooldown.
    if (old) {
      const reserved = await prisma.registrationOtp.updateMany({ where: { email, sentAt: old.sentAt, codeHash: old.codeHash }, data });
      if (!reserved.count) return NextResponse.json({ error: 'Yêu cầu đang được xử lý. Vui lòng thử lại sau.' }, { status: 429 });
    } else {
      await prisma.registrationOtp.create({ data: { email, ...data } });
    }
    try {
      await sendRegistrationOtp(email, code);
    } catch {
      // Invalidate undelivered codes while retaining the send budget.
      await prisma.registrationOtp.updateMany({ where: { email, codeHash: data.codeHash }, data: { expiresAt: new Date(0) } });
      return NextResponse.json({ error: 'Chưa gửi được email. Vui lòng thử lại sau 60 giây.' }, { status: 502 });
    }
    return NextResponse.json({ success: true, message: 'Đã gửi OTP. Kiểm tra hộp thư và thư rác.', expiresIn: 600, retryAfter: 60 });
  } catch {
    return NextResponse.json({ error: 'Không thể xử lý yêu cầu gửi OTP.' }, { status: 400 });
  }
}

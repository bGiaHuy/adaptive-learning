import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createPasswordResetToken } from '@/lib/auth';

// Rate limiting in memory: Max 3 requests per 15 minutes per IP or Email
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

function isRateLimited(key: string, maxRequests = 3, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  record.count += 1;
  return record.count > maxRequests;
}

export async function POST(request: Request) {
  try {
    // Real SMTP delivery is not implemented yet. Never expose a reset link publicly.
    if (process.env.NODE_ENV === 'production' || process.env.ALLOW_TEST_SIMULATION !== 'true') {
      return NextResponse.json({ error: 'Khôi phục mật khẩu đang chờ cấu hình dịch vụ email. Vui lòng liên hệ người quản lý.' }, { status: 503 });
    }
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp địa chỉ email hợp lệ.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check rate limit by email
    if (isRateLimited(`reset_${normalizedEmail}`)) {
      return NextResponse.json(
        { error: 'Bạn đã yêu cầu đặt lại mật khẩu quá nhiều lần. Vui lòng thử lại sau 15 phút.' },
        { status: 429 }
      );
    }

    // Lookup user in DB
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    let resetToken = '';
    if (user) {
      // Create cryptographically secure random token, hashed in database
      const resetData = await createPasswordResetToken(user.id, 30);
      resetToken = resetData.token;
    }

    const baseUrl = process.env.NEXTAUTH_URL || process.env.BASE_URL || 'http://localhost:3008';
    const resetLink = user ? `${baseUrl}/auth/reset-password?token=${resetToken}` : '';

    // Return unified neutral response to prevent user email enumeration
    // "Nếu email tồn tại trên hệ thống, chúng tôi đã tiếp nhận yêu cầu..."
    return NextResponse.json({
      success: true,
      message: 'Chế độ kiểm thử nội bộ: hệ thống chưa gửi email khôi phục.',
      hasLiveEmailService: false,
      // The guard above allows this only in explicitly enabled, non-production tests.
      testResetLink: resetLink || undefined,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi xử lý yêu cầu' }, { status: 500 });
  }
}

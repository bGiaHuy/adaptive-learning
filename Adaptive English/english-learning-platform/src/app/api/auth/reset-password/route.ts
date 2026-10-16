import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, verifyAndConsumeResetToken, revokeAllUserSessions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = body.token;
    const newPassword = body.newPassword || body.password;

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Mã khôi phục mật khẩu không hợp lệ.' }, { status: 400 });
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Mật khẩu mới phải có độ dài tối thiểu 8 ký tự.' },
        { status: 400 }
      );
    }

    // Verify token validity, expiration, and single-use status
    const verification = await verifyAndConsumeResetToken(token);

    if (!verification.valid || !verification.record || !verification.user) {
      return NextResponse.json(
        { error: verification.error || 'Mã khôi phục không hợp lệ hoặc đã hết hạn.' },
        { status: 400 }
      );
    }

    const { user, record } = verification;
    const newPasswordHash = await hashPassword(newPassword);

    // Atomic transaction:
    // 1. Mark reset token as used (single-use constraint)
    // 2. Update user's passwordHash
    // 3. Revoke all active sessions for this user (force re-login everywhere)
    await prisma.$transaction([
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newPasswordHash },
      }),
      prisma.session.deleteMany({
        where: { userId: user.id },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Mật khẩu đã được thay đổi thành công. Mọi phiên đăng nhập cũ đã được thu hồi an toàn. Vui lòng đăng nhập lại.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi đặt lại mật khẩu' }, { status: 500 });
  }
}

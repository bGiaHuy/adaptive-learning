import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { setAuthSession, SAFE_USER_SELECT } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Vô hiệu hóa mặc định; luôn bị chặn trên production; chỉ cho phép khi có cờ cấu hình trong development
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const isExplicitlyEnabled = process.env.ENABLE_ROLE_SWITCHER === 'true';

    if (!isDevelopment || !isExplicitlyEnabled) {
      return NextResponse.json(
        { error: 'Tính năng chuyển đổi vai trò demo đã bị vô hiệu hóa vì lý do bảo mật.' },
        { status: 403 }
      );
    }

    const { role } = await request.json(); // 'student' | 'teacher' | 'admin'

    const targetEmail =
      role === 'teacher'
        ? 'teacher@example.com'
        : role === 'admin'
        ? 'admin@example.com'
        : 'student@example.com';

    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
      select: SAFE_USER_SELECT,
    });

    if (!user) {
      return NextResponse.json({ error: 'Không tìm thấy tài khoản tương ứng' }, { status: 404 });
    }

    await setAuthSession(user.id);

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

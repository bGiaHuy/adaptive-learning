import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, setAuthSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Vui lòng cung cấp email và mật khẩu' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json({ error: 'Tài khoản không tồn tại trong hệ thống' }, { status: 401 });
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Mật khẩu không chính xác' }, { status: 401 });
    }

    await setAuthSession(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi xử lý đăng nhập' }, { status: 500 });
  }
}

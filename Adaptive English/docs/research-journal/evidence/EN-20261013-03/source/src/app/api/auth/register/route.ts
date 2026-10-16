import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, setAuthSession } from '@/lib/auth';
import { normalizeRegistrationEmail, matchesRegistrationOtp } from '@/lib/registrationOtp';

export async function POST(request: Request) {
  try {
    const { email, password, confirmPassword, name, role, otp } = await request.json();

    if (!normalizeRegistrationEmail(email) || typeof password !== 'string' || password.length < 8 || password.length > 128 || typeof name !== 'string' || !name.trim() || name.trim().length > 100) {
      return NextResponse.json({ error: 'Vui lòng điền đầy đủ thông tin' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Mật khẩu xác nhận không khớp.' }, { status: 400 });
    }
    if (typeof otp !== 'string' || !/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: 'Vui lòng nhập OTP gồm 6 chữ số.' }, { status: 400 });
    }
    const cleanEmail = normalizeRegistrationEmail(email)!;
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json({ error: 'Email này đã được đăng ký' }, { status: 400 });
    }

    if (role === 'admin' || (typeof role === 'string' && role.toLowerCase().trim() === 'admin')) {
      return NextResponse.json({ error: 'Không thể tự đăng ký tài khoản quản trị viên' }, { status: 400 });
    }

    const challenge = await prisma.registrationOtp.findUnique({ where: { email: cleanEmail } });
    if (!challenge || challenge.expiresAt <= new Date() || challenge.attempts >= 5) {
      return NextResponse.json({ error: 'OTP hết hạn hoặc đã hết lượt thử. Vui lòng yêu cầu mã mới.' }, { status: 400 });
    }
    const attempt = await prisma.registrationOtp.updateMany({
      where: { email: cleanEmail, codeHash: challenge.codeHash, attempts: { lt: 5 }, expiresAt: { gt: new Date() } },
      data: { attempts: { increment: 1 } },
    });
    if (!attempt.count || !matchesRegistrationOtp(cleanEmail, otp, challenge.codeHash)) {
      return NextResponse.json({ error: 'OTP không chính xác hoặc không còn hiệu lực.' }, { status: 400 });
    }
    const passwordHash = await hashPassword(password);
    const validRole = role === 'teacher' ? 'teacher' : 'student';

    const newUser = await prisma.$transaction(async (tx) => {
      const consumed = await tx.registrationOtp.updateMany({
        where: { email: cleanEmail, codeHash: challenge.codeHash, expiresAt: { gt: new Date() } },
        data: { expiresAt: new Date(0) },
      });
      if (!consumed.count) throw new Error("OTP đã được sử dụng hoặc hết hạn.");
      const user = await tx.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        name: name.trim(),
        role: validRole,
        cefrTarget: 'B2',
      },
    });

      if (validRole === 'student') {
        for (const skill of ['reading', 'listening', 'writing', 'speaking', 'vocabulary', 'grammar']) {
          await tx.studentSkillProfile.create({ data: { userId: user.id, skill,
            level: 'Chưa đánh giá', scoreDisplay: 'Chưa làm bài kiểm tra đầu vào',
            confidence: 10, evidenceCount: 0, independentRate: 0 } });
        }
      }
      return user;
    });

    await setAuthSession(newUser.id);

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Không thể hoàn tất đăng ký. Vui lòng thử lại hoặc đăng nhập nếu đã có tài khoản.' }, { status: 500 });
  }
}

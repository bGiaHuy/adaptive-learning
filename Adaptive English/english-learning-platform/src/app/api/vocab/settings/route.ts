import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const body = await request.json();
    const { limit, dailyNewLimit, masteryIntervalDays } = body;
    const targetLimit = dailyNewLimit !== undefined ? dailyNewLimit : limit;

    const dataToUpdate: any = {};

    if (targetLimit !== undefined) {
      let numericLimit = 10;
      if (targetLimit === 'unlimited' || targetLimit === 'Unlimited' || targetLimit >= 9999) {
        numericLimit = 9999;
      } else {
        numericLimit = parseInt(String(targetLimit), 10);
        if (isNaN(numericLimit) || numericLimit < 1) numericLimit = 10;
      }
      dataToUpdate.vocabDailyLimit = numericLimit;
    }

    if (masteryIntervalDays !== undefined) {
      const parsedMastery = parseInt(String(masteryIntervalDays), 10);
      if (!isNaN(parsedMastery) && parsedMastery >= 1) {
        dataToUpdate.masteryIntervalDays = parsedMastery;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: dataToUpdate,
    });

    const isUnlimited = updatedUser.vocabDailyLimit >= 9999;

    return NextResponse.json({
      success: true,
      limit: isUnlimited ? 'unlimited' : updatedUser.vocabDailyLimit,
      dailyNewLimit: updatedUser.vocabDailyLimit,
      isUnlimited,
      unlimitedWarning: isUnlimited
        ? 'Không khuyến nghị: Chế độ Không Giới Hạn dễ gây quá tải ôn tập và giảm tỷ lệ duy trì lâu dài. Khuyến nghị 10-20 từ/ngày theo tiêu chuẩn FSRS.'
        : null,
      masteryIntervalDays: updatedUser.masteryIntervalDays,
      masteryRuleNote: `Quy tắc Đạt Thành Thạo: Ngưỡng khoảng cách ôn tập >= ${updatedUser.masteryIntervalDays} ngày. Áp dụng tiêu chuẩn Adaptive Study dựa trên FSRS, không tuyên bố là chuẩn độc quyền của Anki.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

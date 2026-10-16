import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { notificationTarget } from '@/lib/notifications';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      notifications: notifications.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        unread: n.unread,
        href: notificationTarget(n.id),
        time: n.createdAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { id, href } = await request.json();
    if (href) {
      const items = await prisma.notification.findMany({ where: { userId: user.id, unread: true }, select: { id: true } });
      const ids = items.filter(item => notificationTarget(item.id) === href).map(item => item.id);
      await prisma.notification.updateMany({ where: { userId: user.id, id: { in: ids } }, data: { unread: false } });
      return NextResponse.json({ success: true });
    }
    if (id) {
      await prisma.notification.updateMany({
        where: { id, userId: user.id },
        data: { unread: false },
      });
    } else {
      // Mark all read
      await prisma.notification.updateMany({
        where: { userId: user.id },
        data: { unread: false },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

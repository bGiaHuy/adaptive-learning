import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login?redirect=/admin');
  }
  if (user.role !== 'admin') {
    redirect(user.role === 'teacher' ? '/teacher/dashboard' : '/student/home');
  }
  return <>{children}</>;
}

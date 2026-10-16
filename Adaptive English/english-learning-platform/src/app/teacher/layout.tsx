import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login?redirect=/teacher/dashboard');
  }
  if (user.role !== 'teacher' && user.role !== 'admin') {
    redirect('/student/home');
  }
  return <>{children}</>;
}

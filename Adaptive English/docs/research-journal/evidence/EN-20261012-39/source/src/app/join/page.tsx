import { redirect } from 'next/navigation';

export default function JoinPage({ searchParams }: { searchParams: { code?: string | string[] } }) {
  const code = typeof searchParams.code === 'string' ? searchParams.code.trim() : '';
  const query = new URLSearchParams();
  if (code) query.set('code', code);
  redirect(`/student/classroom${code ? `?${query}` : ''}`);
}

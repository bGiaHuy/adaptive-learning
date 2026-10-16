"use client";

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function AssignmentSubmissionsPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<'collect' | 'publish' | null>(null);
  const load = useCallback(async () => {
    const res = await fetch(`/api/assignments/${id}/submissions`, { cache: 'no-store' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Không tải được danh sách học sinh.');
    setData(json);
  }, [id]);
  useEffect(() => { load().catch(e => setError(e.message)); }, [load]);
  const students = data?.students || [];
  const submitted = students.filter((s: any) => s.submitted).length;
  const unpublished = students.filter((s: any) => s.score !== null && !s.published).length;
  const missing = students.filter((s: any) => !s.submitted && !s.missing).length;
  async function act() {
    if (!confirm || busy) return;
    setBusy(true); setError(''); setMessage('');
    try {
      const res = await fetch(`/api/assignments/${id}/submissions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: confirm, confirm: true }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Thao tác thất bại.');
      setMessage(confirm === 'collect' ? `Đã thu bài. ${json.changed} học sinh chưa nộp được ghi 0 điểm, chờ công bố.` : `Đã công bố điểm cho ${json.changed} học sinh.`);
      setConfirm(null);
      await load();
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  }
  return <main className="max-w-6xl mx-auto w-full p-4 md:p-8 space-y-6">
    <Link href="/teacher/assignments" className="text-primary text-sm">← Bài tập</Link>
    <div><h1 className="text-2xl font-black">{data?.assignment.title || 'Bài nộp của lớp'}</h1><p className="text-ink-muted">{data?.assignment.className}</p></div>
    {error && <p role="alert" className="text-danger">{error} <button onClick={() => load().then(() => setError('')).catch(e => setError(e.message))}>Tải lại</button></p>}
    {message && <p role="status" className="text-primary">{message}</p>}
    {!data ? <p role="status">Đang tải danh sách học sinh...</p> : <>
      <p>{students.length} học sinh · {submitted} đã nộp · {students.length - submitted} chưa nộp · {data.assignment.status === 'closed' ? 'Đã thu bài' : 'Đang nhận bài'}</p>
      <div className="flex flex-wrap gap-3">
        <Button disabled={busy || !unpublished} onClick={() => setConfirm('publish')}>Công bố điểm cả lớp</Button>
        <Button variant="outline" disabled={busy || data.assignment.status === 'closed'} onClick={() => setConfirm('collect')}>Thu bài</Button>
      </div>
      <p className="text-sm text-ink-muted">Công bố các điểm đã chấm; bài chưa chấm vẫn chờ giáo viên chấm. Thu bài kết thúc thời gian làm bài và ghi 0 cho học sinh chưa nộp.</p>
      <div className="overflow-x-auto border border-line rounded-lg bg-white"><table className="w-full text-sm text-left">
        <thead className="bg-primary-light"><tr>{['Học sinh', 'Nộp bài', 'Điểm', 'Công bố điểm', 'Thao tác'].map(h => <th key={h} className="p-4 whitespace-nowrap">{h}</th>)}</tr></thead>
        <tbody>{students.map((s: any) => <tr key={s.studentId} className="border-t border-line">
          <td className="p-4 font-bold">{s.studentName}</td><td className="p-4">{s.submitted ? 'Đã nộp' : s.missing ? 'Chưa nộp · Đã thu bài' : 'Chưa nộp'}</td>
          <td className="p-4">{s.score === null ? s.submitted ? 'Chưa chấm' : '—' : s.score}</td>
          <td className="p-4">{s.published ? 'Đã công bố' : 'Chưa công bố'}</td>
          <td className="p-4">{s.submissionId && (s.submitted || s.missing) ? <Link className="text-primary font-bold whitespace-nowrap" href={`/teacher/grading/${s.submissionId}`}>{s.score === null ? 'Chấm bài' : 'Xem / sửa điểm'}</Link> : '—'}</td>
        </tr>)}</tbody>
      </table>{!students.length && <p className="p-4">Lớp chưa có học sinh.</p>}</div>
    </>}
    {confirm && <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="bg-white rounded-xl p-6 max-w-lg space-y-4 shadow-lg">
        <h2 id="confirm-title" className="text-xl font-bold">{confirm === 'collect' ? 'Thu bài của cả lớp?' : 'Công bố điểm cả lớp?'}</h2>
        <p>{confirm === 'collect' ? `Kết thúc thời gian làm bài ngay. ${missing} học sinh chưa nộp sẽ nhận 0 điểm, chờ công bố. Bài đã nộp và điểm đã chấm được giữ nguyên.` : `Công bố ${unpublished} điểm đã chấm cho học sinh. Các bài chưa chấm vẫn chờ chấm.`}</p>
        <div className="flex gap-3"><Button disabled={busy} onClick={act}>{busy ? 'Đang xử lý...' : 'Xác nhận'}</Button><Button variant="outline" disabled={busy} onClick={() => setConfirm(null)}>Hủy</Button></div>
      </div>
    </div>}
  </main>;
}

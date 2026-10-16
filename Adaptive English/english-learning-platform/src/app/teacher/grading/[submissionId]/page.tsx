"use client";

import { useEffect, useRef, useState } from 'react';
import { useDelayedLoading } from '@/lib/useDelayedLoading';
import { GradingSkeleton } from '@/components/ui/GradingSkeleton';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function TeacherGradingWorkspacePage() {
  const { submissionId } = useParams();
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<'ai' | 'save' | null>(null);
  const busy = action !== null;
  const aiPending = action === 'ai';
  const showSkeleton = useDelayedLoading(aiPending);
  const aiRequest = useRef<AbortController | null>(null);
  useEffect(() => {
    setAction(null);
    return () => { aiRequest.current?.abort(); aiRequest.current = null; };
  }, [submissionId]);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    fetch(`/api/grading/${submissionId}`, { cache: 'no-store' }).then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Không tải được bài nộp.');
      if (!active) return;
      setSubmission(data.submission);
      setScore(String(data.submission.teacherScore ?? data.submission.automaticGrade?.score ?? ''));
      setFeedback(data.submission.teacherFeedback ?? data.submission.automaticGrade?.summary ?? '');
    }).catch(reason => { if (active) setError(reason.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [submissionId]);

  async function save(publish: boolean) {
    if (busy) return;
    setAction('save'); setError(''); setNotice('');
    try {
      if (score.trim() === '') throw new Error('Hãy nhập điểm hoặc dùng kết quả chấm tự động.');
      const response = await fetch(`/api/grading/${submissionId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ score: Number(score), feedback, publish }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Chưa lưu được điểm.');
      setSubmission((previous: any) => ({ ...previous, ...data.submission }));
      setNotice(publish ? 'Đã công bố điểm và nhận xét cho học sinh.' : 'Đã lưu điểm. Học sinh chưa thấy kết quả.');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Lưu điểm thất bại.'); }
    finally { setAction(null); }
  }
  async function useAI() {
    if (busy) return;
    setAction('ai'); setError(''); setNotice('');
    const controller = new AbortController();
    aiRequest.current = controller;
    let timedOut = false;
    const timeout = window.setTimeout(() => { timedOut = true; controller.abort(); }, 100000);
    try {
      const response = await fetch(`/api/grading/${submissionId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal, body: JSON.stringify({ action: 'ai-grade', duration }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Chưa chấm được bằng AI.');
      if (controller.signal.aborted) return;
      if (!data.draft || !Number.isFinite(data.draft.score) || typeof data.draft.summary !== 'string' || (data.draft.strengthPoints !== undefined && !Array.isArray(data.draft.strengthPoints)) || (data.draft.weaknessPoints !== undefined && !Array.isArray(data.draft.weaknessPoints))) throw new Error('AI trả về kết quả không hợp lệ. Hãy thử lại.');
      setScore(String(data.draft.score));
      setFeedback([data.draft.summary, ...(data.draft.strengthPoints || []), ...(data.draft.weaknessPoints || [])].join('\n'));
      setSubmission((previous: any) => ({ ...previous, aiDraftGrade: data.draft }));
      setNotice('AI đã lưu bản tham khảo, chưa công bố. Giáo viên kiểm tra trước khi trả điểm.');
    } catch (reason) {
      if (!controller.signal.aborted || timedOut) setError(timedOut ? 'AI phản hồi quá lâu. Điểm và nhận xét trước đó được giữ lại; hãy thử lại.' : reason instanceof Error ? reason.message : 'AI chưa chấm được.');
    } finally {
      window.clearTimeout(timeout);
      if (aiRequest.current === controller) { aiRequest.current = null; setAction(null); }
    }
  }

  if (loading) return <p role="status" className="p-8">Đang tải bài nộp…</p>;
  if (!submission) return <main className="p-8 space-y-4"><p role="alert">{error || 'Không tìm thấy bài nộp.'}</p><Link href="/teacher/grading">Về danh sách bài nộp</Link></main>;
  const questions = submission.questions || [];
  const answers = submission.answers || {};
  const openEnded = !submission.missingSubmission && !submission.automaticGrade && ['writing', 'speaking'].includes(submission.skill);
  return <main className="max-w-6xl mx-auto w-full p-4 md:p-8 space-y-6">
    <Link href="/teacher/grading" className="text-primary inline-flex min-h-11 items-center">← Danh sách bài nộp</Link>
    <h1 className="text-2xl font-black">Chấm bài: {submission.assignmentTitle}</h1>
    <p className="text-sm text-ink-muted">{submission.difficulty ? `Mức bài do AI đánh giá: ${submission.difficulty.rating} điểm (${submission.difficulty.level} tham khảo). Điểm lượt làm = điểm đạt / ${submission.maxScore} × ${submission.difficulty.rating}; tính vào năng lực khi công bố. Sửa điểm sẽ thay kết quả cũ, không cộng thêm lượt.` : 'Bài chưa có mức AI đánh giá; chưa tính vào điểm năng lực mới.'}</p>
    <p className="text-sm text-ink-muted">{submission.studentName} · Phiên bản {submission.versionId} · {submission.status === 'graded' ? 'Đã công bố' : submission.status === 'pending_release' ? 'Chờ công bố điểm' : 'Chờ chấm'}</p>
    <div className="h-20 overflow-auto" data-grade-status>
      {error && <p role="alert" className="p-3 text-sm bg-error-soft text-error rounded-xl">{error}</p>}
      {notice && <p role="status" className="p-3 text-sm bg-primary-light text-primary rounded-xl">{notice}</p>}
    </div>
    <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
      <section className="bg-white border-2 border-line rounded-2xl p-5 space-y-5" aria-label="Bài làm học sinh">
        <h2 className="text-lg font-bold">Bài làm đã nộp</h2>
        <p className="text-sm text-ink-muted">{submission.submittedAt ? new Date(submission.submittedAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : 'Chưa nộp'}</p>
        {questions.map((question: any, index: number) => <article key={`${index}-${question.id}`} className="border border-line rounded-xl p-4 space-y-3">
          <h3 className="font-bold">Câu {index + 1}. {question.prompt}</h3>
          {question.imageUrl && <img src={question.imageUrl} alt={`Hình câu ${index + 1}`} className="max-h-56 max-w-full object-contain" />}
          {question.options?.map((option: any) => <div key={option.id} className={`p-3 rounded-lg border ${answers[question.id] === option.id ? 'border-primary bg-primary-light' : 'border-line'}`}>
            <span className="font-semibold">{option.id}.</span> {option.text}
            {answers[question.id] === option.id && <span className="ml-2 text-primary font-bold text-sm">Học sinh chọn</span>}
            {question.correctAnswer === option.id && <span className="ml-2 text-success font-bold text-sm">Đáp án đúng</span>}
          </div>)}
          {!question.options?.length && <p className="whitespace-pre-wrap">{answers[question.id] || 'Chưa trả lời'}</p>}
          {question.explanation && <details><summary className="cursor-pointer min-h-11 flex items-center font-semibold">Giải thích</summary><p className="text-sm leading-relaxed">{question.explanation}</p></details>}
        </article>)}
        {submission.content && <div className="whitespace-pre-wrap break-words leading-relaxed">{submission.content}</div>}
        {submission.audioUrl && <audio controls src={submission.audioUrl} className="w-full" onLoadedMetadata={event => setDuration(event.currentTarget.duration)} />}
        {!questions.length && Object.keys(answers).length > 0 && <div className="space-y-2">{Object.entries(answers).map(([id, value]) => <p key={id}><strong>{id}:</strong> {String(value)}</p>)}</div>}
        {!questions.length && !submission.content && !submission.audioUrl && !Object.keys(answers).length && <p role="status">Bản ghi này không có nội dung bài làm đã lưu. Không thể khôi phục câu trả lời từ một bản nộp trống.</p>}
      </section>
      <section className="bg-white border-2 border-line rounded-2xl p-5 space-y-5" aria-label="Điểm và nhận xét" aria-busy={aiPending}>
        <h2 className="text-lg font-bold">Điểm và nhận xét</h2>
        {submission.automaticGrade && <p className="p-3 rounded-xl bg-success-soft text-success">Tự chấm: {submission.automaticGrade.score}/{submission.maxScore} · {submission.automaticGrade.summary}</p>}
        {openEnded && <div className="relative h-32 rounded-xl overflow-auto" data-ai-summary>
          {submission.aiDraftGrade && <p className="text-sm">AI tham khảo: {submission.aiDraftGrade.summary}</p>}
          {showSkeleton && <GradingSkeleton multiline />}
        </div>}
        <span role="status" aria-live="polite" className="sr-only">{aiPending ? 'AI đang đọc bài và chuẩn bị điểm, nhận xét.' : ''}</span>
        {openEnded && <Button type="button" disabled={busy} onClick={() => void useAI()} variant="outline">{aiPending ? 'AI đang chấm…' : 'Dùng AI chấm'}</Button>}
        {openEnded && submission.skill === 'speaking' && <p className="text-sm text-ink-muted">Chưa có dịch vụ phân tích audio thật. Hiện giáo viên nghe bản ghi và chấm thủ công.</p>}
        <label className="block font-semibold" htmlFor="grade-score">Điểm / {submission.maxScore}</label>
        <div className="relative rounded-xl" data-grade-score>
        <input disabled={busy} id="grade-score" type="number" min="0" max={submission.maxScore} step="0.01" value={score} onChange={event => setScore(event.target.value)} className="w-full p-3 border-2 border-line rounded-xl" />
        {showSkeleton && <GradingSkeleton />}
        </div>
        <label className="block font-semibold" htmlFor="grade-feedback">Nhận xét và hướng dẫn sửa bài</label>
        <div className="relative rounded-xl" data-grade-feedback>
        <textarea disabled={busy} id="grade-feedback" rows={6} value={feedback} onChange={event => setFeedback(event.target.value)} className="w-full p-3 border-2 border-line rounded-xl" />
        {showSkeleton && <GradingSkeleton multiline />}
        </div>
        {submission.status !== 'graded' && <Button disabled={busy || score === ''} variant="outline" className="w-full" onClick={() => void save(false)}>Lưu điểm, chưa công bố</Button>}
        <Button disabled={busy || score === ''} className="w-full" onClick={() => void save(true)}>{action === 'save' ? 'Đang lưu…' : submission.status === 'graded' ? 'Cập nhật điểm đã công bố' : 'Công bố điểm cho học sinh'}</Button>
      </section>
    </div>
  </main>;
}

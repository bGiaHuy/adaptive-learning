import React, { useEffect, useRef, useState } from 'react';
import { studentApi } from '../lib/apiClient';
import MathAiReply from './MathAiReply';
import './math-tutor-chat.css';

export default function MathTutorChat({ reviewId, enabled }) {
  const [turns, setTurns] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);
  const pending = useRef(null);
  const sending = useRef(false);
  useEffect(() => {
    let active = true;
    studentApi.reviewChatHistory(reviewId).then(data => { if (active) setTurns(data.messages); }).catch(err => { if (active) setError(err.message); }).finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [reviewId]);
  async function send(event) {
    event.preventDefault();
    if (sending.current || busy || !enabled || !message.trim()) return;
    sending.current = true; setBusy(true); setError('');
    const text = message.trim();
    if (!pending.current || pending.current.message !== text) pending.current = { message: text, requestId: crypto.randomUUID() };
    const submitted = pending.current;
    try {
      const result = await studentApi.reviewChat(reviewId, text, pending.current.requestId);
      setTurns(current => current.some(turn => turn.requestId === submitted.requestId) ? current : [...current, { ...submitted, text: result.text }]);
      setMessage(''); pending.current = null;
    } catch (err) { setError(err.message); }
    finally { sending.current = false; setBusy(false); }
  }
  async function clear() {
    if (sending.current || busy) return;
    setBusy(true); setError('');
    try { await studentApi.reviewChatClear(reviewId); setTurns([]); pending.current = null; }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function reloadHistory() {
    if (sending.current || busy) return;
    setBusy(true); setError('');
    try { setTurns((await studentApi.reviewChatHistory(reviewId)).messages); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <section className="math-tutor-chat" aria-labelledby={`tutor-${reviewId}`}>
    <header><h3 id={`tutor-${reviewId}`}>Cùng gia sư hiểu bài này</h3><div className="math-tutor-actions"><button type="button" disabled={busy} onClick={reloadHistory}>Tải lịch sử</button><button type="button" disabled={busy || !turns.length} onClick={clear}>Xóa lịch sử</button></div></header>
    <p>Viết cách bạn nghĩ hoặc hỏi tiếp chỗ chưa hiểu. Gia sư nhớ 6 lượt gần nhất trong bài ôn này. Lịch sử hiển thị trong 30 ngày, tối đa 20 lượt.</p>
    {!enabled && <p role="status">Gia sư AI chưa được bật. Bạn vẫn có thể đọc lời giải và tiếp tục ôn.</p>}
    <div className="math-tutor-transcript" role="log" aria-label="Hội thoại với gia sư" aria-live="polite" aria-busy={busy}>
      {!turns.length && <p className="math-tutor-empty">Bắt đầu từ bước giải khiến bạn băn khoăn.</p>}
      {turns.map(turn => <article key={turn.requestId}><div className="math-tutor-question"><strong>Bạn</strong><p>{turn.message}</p></div><div className="math-tutor-answer"><strong>Gia sư</strong><MathAiReply text={turn.text}/></div></article>)}
    </div>
    <form onSubmit={send}><label htmlFor={`tutor-message-${reviewId}`}>Câu hỏi của bạn</label><textarea id={`tutor-message-${reviewId}`} value={message} onChange={event => setMessage(event.target.value)} maxLength={1000} rows={3} disabled={busy || !enabled} placeholder="Vì sao bước này lại đổi dấu?"/><div className="math-tutor-actions"><span>{message.length}/1000</span><button disabled={busy || !enabled || !message.trim() || turns.length >= 20}>{busy ? 'Đang xử lý…' : 'Gửi câu hỏi'}</button></div></form>
    {error && <p role="alert">{error} Nội dung được giữ. Hãy tải lịch sử trước khi thử lại.</p>}
  </section>;
}

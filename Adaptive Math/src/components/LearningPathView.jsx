import React, { useEffect, useState } from 'react';
import { studentApi } from '../lib/apiClient';
import '../math-learning.css';
export default function LearningPathView({ onStartDiagnostic, onStartPractice, onReview }) {
  const [path, setPath] = useState(null), [active, setActive] = useState(null), [error, setError] = useState('');
  const load = async () => {
    setError('');
    try { const [p, a] = await Promise.all([studentApi.getLearningPath(), studentApi.practiceActive()]); setPath(p); setActive(a); }
    catch (e) { setError(e.message); }
  };
  useEffect(() => { load(); }, []);
  return <section className="math-learning" aria-labelledby="path-title">
    <h1 id="path-title">Lộ trình học cá nhân</h1>
    {error && <p role="alert" className="math-notice math-error">{error} <button onClick={load}>Thử lại</button></p>}
    {!path && !error && <p role="status">Đang xếp lịch học…</p>}
    {active && <div className="math-notice">Bạn còn buổi luyện dở: <strong>{active.title}</strong>. <button className="math-secondary" onClick={() => onStartPractice(active.skillId)}>Tiếp tục buổi học</button></div>}
    {path && <>
      <p className="math-summary">Khối {path.grade} · {path.targetGoal} · {path.plan.dailyMinutes} phút/ngày · mục tiêu {path.plan.targetMastery}%</p>
      <p>Lịch dựa trên kết quả hiện có và được xếp lại khi bạn học tiếp. Chủ đề chưa đánh giá được ghi riêng, không coi là lỗ hổng.</p>
      {path.plan.daysLeft !== null && <p>{path.plan.daysLeft > 0 ? `Còn ${path.plan.daysLeft} ngày tới kỳ thi.` : 'Ngày thi đã đến hoặc đã qua; hãy cập nhật mục tiêu trong hồ sơ.'}</p>}
      <h2>Hôm nay và những ngày tiếp theo</h2>
      {path.plan.days.map((day, index) => <div className="math-day" key={day.date}>
        <h3>{index === 0 ? 'Hôm nay' : new Date(`${day.date}T12:00:00+07:00`).toLocaleDateString('vi-VN')} · {day.plannedMinutes} phút dự kiến</h3>
        {!day.activities.length && <p>Đã hoàn thành các việc hiện có. Bạn có thể ôn lại hoặc chọn chủ đề bên dưới.</p>}
        {day.activities.map((a, i) => <div className="math-activity" key={`${a.skillId || a.kind}-${i}`}>
          <div><strong>{a.title}</strong><p>{a.reason} Khoảng {a.minutes} phút.</p></div>
          <button className={index === 0 ? 'math-primary' : 'math-secondary'} disabled={Boolean(active) && a.kind !== 'REVIEW' && active.skillId !== a.skillId}
            onClick={() => a.kind === 'REVIEW' ? onReview() : onStartPractice(a.skillId)}>{a.kind === 'REVIEW' ? 'Mở lịch ôn' : 'Học chủ đề này'}</button>
        </div>)}
      </div>)}
      {path.plan.unscheduledCount > 0 && <p className="math-notice">Còn {path.plan.unscheduledCount} chủ đề chưa xếp được trong quỹ thời gian tới ngày thi. Cân nhắc tăng thời gian hoặc thu hẹp mục tiêu.</p>}
      <h2>Các chủ đề trong khối lớp</h2>
      {!path.modules.length && <p>Khối lớp này chưa có học liệu trong hệ thống.</p>}
      <div className="math-skill-grid">{path.modules.map(m => <article className="math-lesson" key={m.id}>
        <h3>{m.title}</h3><p>{m.masteryScore === null ? 'Chưa đánh giá' : `${m.masteryScore}% ước tính · ${m.evidenceCount} câu làm bằng chứng`}</p>
        <p>{m.recommendedAction}</p>
        {m.canPractice ? <button className="math-secondary" disabled={Boolean(active) && active.skillId !== m.id} onClick={() => onStartPractice(m.id)}>{m.status === 'COMPLETED' ? 'Luyện củng cố' : 'Ôn và luyện tập'}</button>
          : <p className="math-summary">Có {m.publishedQuestions} câu đã duyệt; cần ít nhất 3 câu để mở buổi luyện.</p>}
      </article>)}</div>
      <button className="math-text-button" onClick={onStartDiagnostic}>Làm bài chẩn đoán mới</button>
    </>}
  </section>;
}

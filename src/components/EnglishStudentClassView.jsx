import React, { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, RefreshCw, Users } from 'lucide-react';
import { classroomApi, englishApi, studentApi } from '../lib/apiClient';

export default function EnglishStudentClassView({ onOpenLesson }) {
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const refresh = async () => {
    setLoading(true); setError('');
    try {
      const [profile, items] = await Promise.all([studentApi.getProfile(), englishApi.myAssignments()]);
      setClasses(profile.joinedClassrooms || []);
      setAssignments(Array.isArray(items) ? items : []);
    } catch (err) { setError(err.message || 'Không thể tải lớp học.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { refresh(); }, []);
  const join = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      await classroomApi.joinClassroom(code.trim());
      setCode(''); setNotice('Đã tham gia lớp học.');
      await refresh();
    } catch (err) { setError(err.message || 'Không thể tham gia lớp.'); }
    finally { setBusy(false); }
  };
  return <div className="english-shell english-class-page">
    <div className="english-topline"><span>ADAPTIVE LEARNING / CLASSROOM</span><span>Bài của lớp</span></div>
    <header className="english-lesson-head"><span>HỌC CÙNG THẦY CÔ</span><h1>Lớp học của em.</h1><p>Nhập mã mời để tham gia lớp và mở các bài thầy cô đã giao.</p></header>
    <form className="english-join-form" onSubmit={join}><label>Mã mời lớp học<input value={code} onChange={event => setCode(event.target.value)} placeholder="Nhập mã 8 ký tự" minLength={4} required /></label><button className="english-primary" disabled={busy || !code.trim()}>Tham gia <ArrowRight size={17} /></button></form>
    {error && <div className="english-error" role="alert">{error} <button onClick={refresh}>Thử lại</button></div>}
    {notice && <div className="english-success" role="status">{notice}</div>}
    {loading ? <div className="english-state"><RefreshCw className="animate-spin" /> Đang tải…</div> : <>
      <section className="english-section"><div className="english-section-heading"><h2>Lớp đã tham gia</h2><span>{classes.length} lớp</span></div>{classes.length ? <div className="english-class-chips">{classes.map(item => <div key={item.id}><Users size={20} /><strong>{item.name}</strong><small>{item.teacherName}</small></div>)}</div> : <div className="english-empty compact"><h3>Em chưa tham gia lớp nào</h3><p>Xin mã mời từ giáo viên rồi nhập vào ô phía trên.</p></div>}</section>
      <section className="english-section"><div className="english-section-heading"><h2>Bài thầy cô giao</h2><span>{assignments.length} bài</span></div>{assignments.length ? <div className="english-lesson-list">{assignments.map(item => <button key={item.id} className="english-lesson-card" onClick={() => onOpenLesson(item.lesson.id)}><span className="english-lesson-icon">{item.completed ? <CheckCircle2 size={22} /> : <BookOpen size={22} />}</span><span><small>{item.className} · {item.lesson.level} · {item.lesson.kind}</small><strong>{item.lesson.title}</strong><em>{item.completed ? 'Đã hoàn thành' : item.lesson.summary}</em></span><span className="english-lesson-end">Mở bài <ArrowRight size={17} /></span></button>)}</div> : <div className="english-empty compact"><h3>Chưa có bài được giao</h3><p>Bài học của lớp sẽ hiện ở đây sau khi giáo viên giao bài.</p></div>}</section>
    </>}
  </div>;
}

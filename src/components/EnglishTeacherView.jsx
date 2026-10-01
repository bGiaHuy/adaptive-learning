import React, { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Plus, RefreshCw, Users } from 'lucide-react';
import { classroomApi, englishApi } from '../lib/apiClient';

export default function EnglishTeacherView() {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState('');
  const [details, setDetails] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [lessonId, setLessonId] = useState('');
  const [className, setClassName] = useState('');
  const [grade, setGrade] = useState(9);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const refreshClasses = async (preferredId) => {
    setLoading(true); setError('');
    try {
      const [classData, topicData] = await Promise.all([classroomApi.getTeacherClassrooms(), englishApi.topics()]);
      const list = Array.isArray(classData) ? classData : classData.classrooms || [];
      setClasses(list);
      setClassId(preferredId || classId || list[0]?.id || '');
      setLessons((Array.isArray(topicData) ? topicData : []).flatMap(topic => topic.lessons || []));
    } catch (err) { setError(err.message || 'Không thể tải lớp học.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { refreshClasses(); }, []);
  useEffect(() => {
    if (!classId) { setDetails(null); return; }
    englishApi.classAssignments(classId).then(setDetails).catch(err => setError(err.message || 'Không thể tải bài đã giao.'));
  }, [classId]);

  const createClass = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      const response = await classroomApi.createClassroom({ name: className.trim(), grade: Number(grade) });
      setInviteCode(response.classroom.inviteCode);
      setClassName('');
      await refreshClasses(response.classroom.id);
      setNotice('Đã tạo lớp. Hãy chia sẻ mã mời bên dưới với học sinh.');
    } catch (err) { setError(err.message || 'Không thể tạo lớp.'); }
    finally { setBusy(false); }
  };
  const newInvite = async () => {
    setBusy(true); setError('');
    try { const response = await classroomApi.generateInviteCode(classId, {}); setInviteCode(response.plainCode); }
    catch (err) { setError(err.message || 'Không thể tạo mã mời.'); }
    finally { setBusy(false); }
  };
  const assign = async () => {
    if (!lessonId) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await englishApi.assignLesson(classId, lessonId);
      setDetails(await englishApi.classAssignments(classId));
      setLessonId(''); setNotice('Đã giao bài học cho lớp.');
    } catch (err) { setError(err.message || 'Không thể giao bài.'); }
    finally { setBusy(false); }
  };
  const remove = async (assignmentId) => {
    setBusy(true); setError('');
    try { await englishApi.removeAssignment(classId, assignmentId); setDetails(await englishApi.classAssignments(classId)); }
    catch (err) { setError(err.message || 'Không thể bỏ bài đã giao.'); }
    finally { setBusy(false); }
  };

  return <div className="english-shell english-class-page">
    <div className="english-topline"><span>ADAPTIVE LEARNING / TEACHER</span><span>Quản lý lớp học</span></div>
    <header className="english-lesson-head"><span>KHÔNG GIAN GIÁO VIÊN</span><h1>Bài học cho cả lớp.</h1><p>Tạo lớp, chia sẻ mã mời và giao bài tiếng Anh đã xuất bản.</p></header>
    {error && <div className="english-error" role="alert">{error} <button onClick={() => refreshClasses()}>Thử lại</button></div>}
    {notice && <div className="english-success" role="status">{notice}</div>}
    {loading ? <div className="english-state"><RefreshCw className="animate-spin" /> Đang tải lớp…</div> : <div className="english-class-grid">
      <section className="english-panel"><h2>Lớp của tôi</h2><form onSubmit={createClass} className="english-class-form"><label>Tên lớp<input value={className} onChange={event => setClassName(event.target.value)} placeholder="Ví dụ: Tiếng Anh 9A1" required /></label><label>Khối<select value={grade} onChange={event => setGrade(event.target.value)}>{[6,7,8,9].map(item => <option key={item} value={item}>Lớp {item}</option>)}</select></label><button className="english-primary" disabled={busy || !className.trim()}><Plus size={16} /> Tạo lớp</button></form>
        <div className="english-class-list">{classes.map(item => <button key={item.id} className={classId === item.id ? 'selected' : ''} onClick={() => { setClassId(item.id); setInviteCode(''); }}><Users size={19} /><span><strong>{item.name}</strong><small>{item.studentCount} học sinh · Khối {item.grade}</small></span><ArrowRight size={15} /></button>)}</div>
        {!classes.length && <p className="english-muted">Chưa có lớp học. Tạo lớp để bắt đầu giao bài.</p>}
      </section>
      <section className="english-panel"><h2>{details?.className || 'Chọn một lớp'}</h2>{classId && <><div className="english-class-code"><span>MÃ MỜI</span><strong>{inviteCode || 'Mã chỉ hiện khi vừa tạo hoặc làm mới'}</strong><button onClick={newInvite} disabled={busy}>Tạo mã mới</button></div><p className="english-muted">{details?.studentCount || 0} học sinh trong lớp</p><div className="english-class-assign"><h3>Giao bài tiếng Anh</h3><select value={lessonId} onChange={event => setLessonId(event.target.value)}><option value="">Chọn bài học đã xuất bản</option>{lessons.map(item => <option key={item.id} value={item.id}>{item.title} · {item.level}</option>)}</select><button className="english-primary" disabled={!lessonId || busy} onClick={assign}>Giao bài <ArrowRight size={16} /></button></div><h3>Bài đã giao</h3><div className="english-assignment-list">{details?.assignments?.length ? details.assignments.map(item => <div key={item.id}><span className="english-lesson-icon"><BookOpen size={20} /></span><span><strong>{item.lesson.title}</strong><small>{item.lesson.kind} · {item.lesson.level} · {item.completedCount}/{details.studentCount} học sinh hoàn thành</small></span><button disabled={busy} onClick={() => remove(item.id)}>Bỏ giao</button></div>) : <p className="english-muted">Lớp chưa được giao bài tiếng Anh.</p>}</div></>}</section>
    </div>}
  </div>;
}

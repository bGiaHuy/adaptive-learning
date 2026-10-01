import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, Headphones, RefreshCw, Search, Sparkles, Volume2 } from 'lucide-react';
import { englishApi } from '../lib/apiClient';

const KINDS = { LISTENING: 'Luyện nghe', VOCABULARY: 'Từ vựng', GRAMMAR: 'Ngữ pháp', READING: 'Đọc hiểu' };
const KIND_ICONS = { LISTENING: Headphones, VOCABULARY: Sparkles, GRAMMAR: BookOpen, READING: BookOpen };

export default function EnglishHub({ view = 'explore', currentUser, initialLessonId = null }) {
  const [topics, setTopics] = useState([]);
  const [progress, setProgress] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [filter, setFilter] = useState(view === 'listening' ? 'LISTENING' : 'ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [speed, setSpeed] = useState(1);
  const audioRef = useRef(null);
  const replayStopRef = useRef(null);

  useEffect(() => { setFilter(view === 'listening' ? 'LISTENING' : 'ALL'); setSelectedTopic(null); setSelectedLesson(null); }, [view]);
  const refresh = async () => {
    setLoading(true); setError('');
    try {
      const [topicData, progressData] = await Promise.all([
        englishApi.topics(), currentUser ? englishApi.progress() : Promise.resolve([])
      ]);
      setTopics(Array.isArray(topicData) ? topicData : []);
      setProgress(Array.isArray(progressData) ? progressData : []);
    } catch (err) { setError(err.message || 'Không thể tải bài học.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { refresh(); }, [currentUser?.id]);

  const allLessons = useMemo(() => topics.flatMap(topic => (topic.lessons || []).map(item => ({ ...item, topicId: topic.id, topicTitle: topic.title }))), [topics]);
  const nextLessons = useMemo(() => {
    const completed = new Set(progress.map(item => item.lessonId));
    const kindScores = {};
    for (const entry of progress) {
      const kind = allLessons.find(item => item.id === entry.lessonId)?.kind;
      if (!kind) continue;
      (kindScores[kind] ||= []).push(entry.totalCount ? entry.correctCount / entry.totalCount : 0);
    }
    const average = kind => kindScores[kind]
      ? kindScores[kind].reduce((sum, score) => sum + score, 0) / kindScores[kind].length
      : 1;
    return allLessons.filter(item => !completed.has(item.id)).sort((a, b) => average(a.kind) - average(b.kind));
  }, [allLessons, progress]);
  const visibleLessons = allLessons.filter(item =>
    (filter === 'ALL' || item.kind === filter) &&
    (!selectedTopic || item.topicId === selectedTopic) &&
    `${item.title} ${item.summary || ''} ${item.topicTitle}`.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi'))
  );
  const visibleTopics = topics.filter(topic => (topic.lessons || []).some(item => visibleLessons.some(lessonItem => lessonItem.id === item.id)));

  const openLesson = async (id) => {
    setSelectedLesson(id); setLesson(null); setResult(null); setAnswers({}); setShowTranscript(false); setError('');
    try { setLesson(await englishApi.lesson(id)); }
    catch (err) { setError(err.message || 'Không thể mở bài học.'); }
  };
  useEffect(() => { if (initialLessonId) openLesson(initialLessonId); }, [initialLessonId]);

  const submit = async () => {
    setError('');
    try { setResult(await englishApi.submit(lesson.id, answers)); setProgress(await englishApi.progress()); }
    catch (err) { setError(err.message || 'Không thể nộp bài.'); }
  };

  const replaySegment = (segment) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(segment.startMs)) return;
    if (replayStopRef.current) audio.removeEventListener('timeupdate', replayStopRef.current);
    audio.currentTime = segment.startMs / 1000;
    audio.play().catch(() => setError('Trình duyệt không thể phát tệp nghe này.'));
    const stopAt = segment.endMs / 1000;
    const stop = () => { if (audio.currentTime >= stopAt) { audio.pause(); audio.removeEventListener('timeupdate', stop); replayStopRef.current = null; } };
    replayStopRef.current = stop;
    audio.addEventListener('timeupdate', stop);
  };

  if (loading) return <div className="english-shell english-state"><RefreshCw className="animate-spin" size={28} /><p>Đang tải thư viện tiếng Anh…</p></div>;

  return <div className="english-shell">
    <div className="english-topline"><span>ADAPTIVE LEARNING / {view === 'listening' ? 'LISTEN' : 'EXPLORE'}</span><span>{allLessons.length} bài học đã xuất bản</span></div>
    {view === 'progress' && !selectedLesson ? <>
      <header className="english-hero"><div><div className="english-eyebrow"><Sparkles size={16} /> YOUR LEARNING PATH</div><h1>Mỗi bài học,<br /><em>một bước tiến.</em></h1><p>Ôn lại bài đã học và chọn bài tiếp theo từ thư viện.</p></div><div className="english-hero-mark"><BookOpen size={90} strokeWidth={1.2} /></div></header>
      {error && <div className="english-error" role="alert">{error} <button onClick={refresh}>Thử lại</button></div>}
      <section className="english-section"><div className="english-section-heading"><h2>Bài đã hoàn thành</h2><span>{progress.length} bài</span></div>{progress.length ? <div className="english-lesson-list">{progress.map(entry => { const item = allLessons.find(candidate => candidate.id === entry.lessonId); return item && <button key={entry.lessonId} className="english-lesson-card" onClick={() => openLesson(item.id)}><span className="english-lesson-icon"><Check size={21} /></span><span><small>{item.topicTitle} · {item.level}</small><strong>{item.title}</strong><em>Hoàn thành {new Date(entry.completedAt).toLocaleDateString('vi-VN')}</em></span><span className="english-lesson-end">{entry.correctCount}/{entry.totalCount} đúng <ArrowRight size={17} /></span></button>; })}</div> : <div className="english-empty compact"><h3>Bạn chưa hoàn thành bài nào</h3><p>Chọn một bài từ mục Khám phá để bắt đầu.</p></div>}</section>
      <section className="english-section"><div className="english-section-heading"><h2>Gợi ý học tiếp</h2></div><div className="english-lesson-list">{nextLessons.slice(0, 3).map(item => <button key={item.id} className="english-lesson-card" onClick={() => openLesson(item.id)}><span className="english-lesson-icon"><BookOpen size={21} /></span><span><small>{KINDS[item.kind]} · {item.level}</small><strong>{item.title}</strong></span><span className="english-lesson-end">Bắt đầu <ArrowRight size={17} /></span></button>)}</div></section>
    </> : selectedLesson ? <>
      <button className="english-back" onClick={() => { setSelectedLesson(null); setLesson(null); setError(''); }}><ArrowLeft size={17} /> Quay lại thư viện</button>
      {!lesson ? <div className="english-state">{error || 'Đang mở bài học…'}</div> : <>
        <header className="english-lesson-head"><span>{KINDS[lesson.kind]} · {lesson.level} · {lesson.topic.title}</span><h1>{lesson.title}</h1><p>{lesson.summary}</p></header>
        <div className="english-lesson-grid">
          <section className="english-panel">
            {lesson.audioUrl && <div className="english-audio"><div className="english-audio-icon"><Headphones size={28} /></div><div><strong>Nghe bài học</strong><p>Phát toàn bài theo tốc độ phù hợp với bạn.</p></div><audio ref={audioRef} controls preload="metadata" src={lesson.audioUrl} onError={() => setError('Tệp nghe hiện không phát được. Hãy thử lại sau.')} aria-label={`Audio: ${lesson.title}`} /><label>Tốc độ <select value={speed} onChange={e => { const value = Number(e.target.value); setSpeed(value); if (audioRef.current) audioRef.current.playbackRate = value; }}><option value="0.75">0.75×</option><option value="1">1×</option><option value="1.25">1.25×</option></select></label></div>}
            {lesson.body && <div className="english-reading"><h2>Nội dung bài học</h2><p>{lesson.body}</p></div>}
            {Array.isArray(lesson.transcript) && lesson.transcript.length > 0 && <div className="english-transcript"><button onClick={() => setShowTranscript(!showTranscript)}>{showTranscript ? 'Ẩn transcript' : 'Xem transcript'}</button>{showTranscript && <div>{lesson.transcript.some(segment => segment.alignmentVerified === false) && <p className="english-transcript-note">Mốc thời gian đang được kiểm tra; hiện hãy nghe bằng trình phát toàn bài.</p>}{lesson.transcript.map((segment, index) => <div key={segment.id || index} className="english-segment">{segment.alignmentVerified !== false && <button onClick={() => replaySegment(segment)} title="Nghe lại đoạn" aria-label={`Nghe lại đoạn ${index + 1}`}><Volume2 size={16} /></button>}<div><p>{segment.textEn}</p>{segment.textVi && <small>{segment.textVi}</small>}</div></div>)}</div>}</div>}
            {lesson.sourceAttribution && <small className="english-attribution">{lesson.sourceAttribution}</small>}
          </section>
          <section className="english-panel english-exercises"><h2>Luyện tập</h2>{lesson.exercises.length === 0 ? <p>Bài học này chưa có câu hỏi.</p> : lesson.exercises.map((exercise, index) => {
            const grade = result?.results?.find(item => item.id === exercise.id);
            return <div className="english-question" key={exercise.id}><div className="english-question-number">CÂU {String(index + 1).padStart(2, '0')}</div><h3>{exercise.prompt}</h3>{exercise.kind === 'SINGLE_CHOICE' && Array.isArray(exercise.options) ? <div className="english-options">{exercise.options.map(option => <label key={option} className={answers[exercise.id] === option ? 'selected' : ''}><input type="radio" name={exercise.id} value={option} checked={answers[exercise.id] === option} disabled={Boolean(result)} onChange={() => setAnswers({ ...answers, [exercise.id]: option })} />{option}</label>)}</div> : <input className="english-answer" value={answers[exercise.id] || ''} disabled={Boolean(result)} onChange={e => setAnswers({ ...answers, [exercise.id]: e.target.value })} placeholder={exercise.kind === 'DICTATION' ? 'Gõ câu bạn nghe được' : 'Nhập câu trả lời'} aria-label={exercise.prompt} />}{grade && <p className={grade.correct ? 'english-correct' : 'english-incorrect'}>{grade.correct ? 'Đúng' : `Đáp án: ${grade.correctAnswer}`}{grade.explanation && ` · ${grade.explanation}`}</p>}</div>;
          })}
          {lesson.exercises.length > 0 && (result ? <div className="english-result"><Check size={18} /> Bạn đúng {result.correctCount}/{result.totalCount} câu. <button onClick={() => { setResult(null); setAnswers({}); }}>Làm lại</button></div> : <button className="english-primary" onClick={submit} disabled={Object.keys(answers).length !== lesson.exercises.length}>Nộp bài <ArrowRight size={17} /></button>)}
          </section>
        </div>
      </>}
    </> : <>
      <header className="english-hero"><div><div className="english-eyebrow"><Sparkles size={16} /> HỌC ĐÚNG NHỊP CỦA BẠN</div><h1>{view === 'listening' ? <>Nghe mỗi ngày.<br /><em>Hiểu rõ từng câu.</em></> : <>Khám phá tiếng Anh<br /><em>theo cách của bạn.</em></>}</h1><p>Chọn một chủ đề, nghe và luyện tập từng bước. Tiến độ của bạn được lưu sau mỗi bài.</p></div><div className="english-hero-mark"><Headphones size={90} strokeWidth={1.2} /></div></header>
      <div className="english-toolbar"><div className="english-search"><Search size={18} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm bài học, chủ đề…" aria-label="Tìm bài học" /></div><div className="english-filters">{[['ALL', 'Tất cả'], ...Object.entries(KINDS)].map(([key, label]) => <button key={key} className={filter === key ? 'active' : ''} onClick={() => { setFilter(key); setSelectedTopic(null); }}>{label}</button>)}</div></div>
      {selectedTopic && <button className="english-back" onClick={() => setSelectedTopic(null)}><ArrowLeft size={17} /> Tất cả chủ đề</button>}
      {error && <div className="english-error" role="alert">{error} <button onClick={refresh}>Thử lại</button></div>}
      {!error && allLessons.length === 0 ? <div className="english-empty"><div><BookOpen size={34} /></div><h2>Thư viện đang được chuẩn bị</h2><p>Các bài học tiếng Anh sẽ xuất hiện ở đây sau khi nội dung được kiểm tra và xuất bản.</p></div> : <>
        {!selectedTopic && !search && filter === 'ALL' && <section className="english-section"><div className="english-section-heading"><h2>Khám phá chủ đề</h2><span>{visibleTopics.length} chủ đề</span></div><div className="english-topic-grid">{visibleTopics.map((topic, index) => <button className={`english-topic-card card-${index % 5}`} key={topic.id} onClick={() => setSelectedTopic(topic.id)}><span className="english-topic-icon"><BookOpen size={22} /></span><span className="english-topic-bottom"><strong>{topic.title}</strong><small>{topic.lessons.length} bài học <ArrowRight size={15} /></small></span></button>)}</div></section>}
        <section className="english-section"><div className="english-section-heading"><h2>{selectedTopic ? topics.find(item => item.id === selectedTopic)?.title : view === 'listening' ? 'Bài luyện nghe' : 'Bài học cho bạn'}</h2><span>{visibleLessons.length} bài</span></div>{visibleLessons.length ? <div className="english-lesson-list">{visibleLessons.map(item => { const Icon = KIND_ICONS[item.kind] || BookOpen; const completed = progress.find(entry => entry.lessonId === item.id); return <button className="english-lesson-card" key={item.id} onClick={() => openLesson(item.id)}><span className="english-lesson-icon"><Icon size={22} /></span><span><small>{KINDS[item.kind]} · {item.level} · {item.topicTitle}</small><strong>{item.title}</strong><em>{item.summary}</em></span><span className="english-lesson-end">{completed ? `${completed.correctCount}/${completed.totalCount} đúng` : 'Bắt đầu'} <ArrowRight size={17} /></span></button>; })}</div> : <div className="english-empty compact"><h3>Chưa có bài phù hợp</h3><p>Thử bộ lọc hoặc từ khóa khác.</p></div>}</section>
      </>}
    </>}
  </div>;
}

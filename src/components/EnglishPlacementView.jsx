import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { englishApi } from '../lib/apiClient';

export default function EnglishPlacementView({ onExplore }) {
  const [questions, setQuestions] = useState([]);
  const [savedResult, setSavedResult] = useState(null);
  const [result, setResult] = useState(null);
  const [answers, setAnswers] = useState({});
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [pool, previous] = await Promise.all([englishApi.placement(), englishApi.placementResult()]);
      setQuestions(Array.isArray(pool) ? pool : []);
      setSavedResult(previous);
    } catch (err) { setError(err.message || 'Không thể tải bài kiểm tra.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const submit = async () => {
    setSubmitting(true); setError('');
    try { setResult(await englishApi.submitPlacement(answers)); }
    catch (err) { setError(err.message || 'Không thể nộp bài kiểm tra.'); }
    finally { setSubmitting(false); }
  };
  const question = questions[index];
  return <div className="english-shell english-placement">
    <div className="english-topline"><span>ADAPTIVE LEARNING / STARTING POINT</span><span>Kiểm tra đầu vào</span></div>
    {loading ? <div className="english-state"><RefreshCw className="animate-spin" size={27} /> Đang chuẩn bị câu hỏi…</div> : result ? <div className="english-placement-result"><CheckCircle2 size={39} /><span>HOÀN THÀNH</span><h1>Mức bài gợi ý: {result.suggestedLevel}</h1><p>Bạn trả lời đúng {result.correctCount}/{result.totalCount} câu. Bài khảo sát này chỉ dùng nội dung ở mức {result.assessedLevels.join(' và ')}; kết quả giúp chọn bài học trong thư viện hiện có, không phải chứng nhận trình độ.</p><button className="english-primary" onClick={onExplore}>Khám phá bài học <ArrowRight size={18} /></button><button className="english-placement-retry" onClick={() => { setResult(null); setAnswers({}); setIndex(0); }}>Làm lại</button></div> : error && !question ? <div className="english-empty"><h2>Chưa thể bắt đầu kiểm tra</h2><p>{error}</p><button className="english-primary" onClick={load}>Thử lại</button></div> : question ? <>
      <header className="english-lesson-head"><span>ĐIỂM BẮT ĐẦU</span><h1>Biết mình đang ở đâu.</h1><p>Trả lời {questions.length} câu ngắn. Kết quả giúp chọn mức bài học phù hợp.</p>{savedResult && <small>Lần trước: {savedResult.correctCount}/{savedResult.totalCount} đúng · mức {savedResult.suggestedLevel}</small>}</header>
      <section className="english-placement-card"><div className="english-placement-meta"><span>CÂU {index + 1} / {questions.length}</span><span>{question.skill} · {question.level}</span></div><div className="english-placement-track"><div style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div><h2>{question.prompt}</h2><div className="english-options">{Array.isArray(question.options) && question.options.map(option => <label key={option} className={answers[question.id] === option ? 'selected' : ''}><input type="radio" name={question.id} checked={answers[question.id] === option} onChange={() => setAnswers({ ...answers, [question.id]: option })} />{option}</label>)}</div><div className="english-placement-actions"><button disabled={index === 0} onClick={() => setIndex(index - 1)}>Câu trước</button>{index < questions.length - 1 ? <button className="english-primary" disabled={!answers[question.id]} onClick={() => setIndex(index + 1)}>Câu tiếp <ArrowRight size={17} /></button> : <button className="english-primary" disabled={submitting || questions.some(item => !answers[item.id])} onClick={submit}>{submitting ? 'Đang nộp…' : 'Xem kết quả'}</button>}</div></section>
      {error && <div className="english-error" role="alert">{error}</div>}
    </> : null}
  </div>;
}

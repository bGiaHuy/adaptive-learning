"use client";

import { AudioRecorder } from '@/components/ui/AudioRecorder';
import AssignmentAttachments from '@/components/AssignmentAttachments';
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { AITutorDrawer } from "@/components/ui/AITutorDrawer";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, CheckCircle2, Clock, Calendar, Sparkles, AlertCircle, Save } from "lucide-react";

export default function StudentAssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { assignments, saveAssignmentDraft, submitAssignment, storageError, enrolledClassIds } = useApp();

  const assignmentId = params.assignmentId as string;
  const storeAssignment = assignments.find(a => a.id === assignmentId && a.classId === params.classId && enrolledClassIds.includes(a.classId));

  const [serverAssignment, setServerAssignment] = useState<any>(null);
  const [serverSubmission, setServerSubmission] = useState<any>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [audioUrl,setAudioUrl]=useState<string|null>(null);
  const draftTextRef=useRef('');
  const [draftText, setDraftText] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const saveQueue = useRef<Promise<unknown>>(Promise.resolve());
  const [submitting, setSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Đã lưu nháp");
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [isTutorOpen, setIsTutorOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        // 1. Fetch assignment details
        const assignRes = await fetch(`/api/assignments/${assignmentId}`);
        if (!assignRes.ok) {
          if (assignRes.status === 403) {
            setAuthError("Bạn không có quyền truy cập bài tập này vì bạn không còn là thành viên của lớp học.");
          } else {
            setAuthError("Không tìm thấy bài tập trên hệ thống.");
          }
          return;
        }
        const assignData = await assignRes.json();
        if (!isMounted) return;
        setServerAssignment(assignData.assignment);

        // 2. Fetch student's submission / draft
        const subRes = await fetch(`/api/submissions?assignmentId=${assignmentId}`);
        if (subRes.ok) {
          const subData = await subRes.json();
          if (subData.submissions && subData.submissions.length > 0) {
            const currentSub = subData.submissions[0];
            setServerSubmission(currentSub);
            setDraftText(currentSub.content || "");
            draftTextRef.current=currentSub.content||'';
            setAudioUrl(currentSub.audioUrl||null);
            setAnswers(currentSub.answers || {});
            setIsSubmittedSuccess(['pending_grading', 'pending_release', 'graded'].includes(currentSub.status));
          } else if (storeAssignment?.studentDraft) {
            setDraftText(storeAssignment.studentDraft);
          }
        }
      } catch {
        if (storeAssignment) {
          setServerAssignment(storeAssignment);
          setDraftText(storeAssignment.studentDraft || "");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    const refreshStatus = async () => {
      try {
        const res = await fetch(`/api/assignments/${assignmentId}`, { cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        if (isMounted) setServerAssignment(json.assignment);
      } catch { /* Preserve the current work while offline. */ }
    };
    const interval = window.setInterval(refreshStatus, 15000);
    window.addEventListener('focus', refreshStatus);
    return () => { isMounted = false; window.clearInterval(interval); window.removeEventListener('focus', refreshStatus); };
  }, [assignmentId]);

  if (loading) {
    return <main className="p-8 text-center"><p className="text-sm text-ink-muted">Đang tải bài tập...</p></main>;
  }

  if (authError) {
    return (
      <main className="max-w-2xl mx-auto p-8 space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm font-bold">
          ⚠️ {authError}
        </div>
        <Link href="/student/classroom" className="text-primary font-bold text-sm block">
          ← Quay lại danh sách lớp học
        </Link>
      </main>
    );
  }

  const assignment = serverAssignment || storeAssignment;
  if (!assignment) {
    return (
      <main className="p-8 space-y-3">
        <h1>Không tìm thấy bài tập hoặc bạn không còn trong lớp.</h1>
        <Link href="/student/classroom">Quay lại lớp học</Link>
      </main>
    );
  }

  const isClosed = assignment.status === "closed";
  const isGraded = serverSubmission?.status === "graded" || assignment?.status === "graded";
  const displayScore = serverSubmission?.teacherScore ?? assignment?.score;
  const displayFeedback = serverSubmission?.teacherFeedback || assignment?.teacherFeedback;
  const submissionVersion = serverSubmission?.versionId ?? assignment?.version;
  const exercises = serverAssignment?.exercises || [];
  const questions = exercises.flatMap((exercise: any) => exercise.questions);
  const isQuestionSet = questions.length > 0;
  const answeredCount = questions.filter((question: any) => answers[question.id]?.trim()).length;
  const saveAnswers = (next: Record<string, string>) => {
    setAnswers(next);
    setSaveStatus('Đang lưu đáp án…');
    saveQueue.current = saveQueue.current.catch(() => {}).then(async () => {
      const response = await fetch('/api/submissions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId, answers: next, isDraft: true }),
      });
      if (!response.ok) {
        const json = await response.json();
        if (response.status === 409 && json.error?.includes('thu bài')) setServerAssignment((a: any) => ({ ...a, status: 'closed' }));
        throw new Error(json.error || 'Không lưu được đáp án.');
      }
    }).then(() => setSaveStatus('Đã lưu đáp án trên máy chủ'), () => setSaveStatus('Không lưu được đáp án — hãy thử lưu lại'));
  };

  const saveAudio = (url: string|null) => {
    setAudioUrl(url);setSaveStatus('Đang lưu bản ghi vào bài…');
    saveQueue.current=saveQueue.current.catch(()=>{}).then(async()=>{
      const res=await fetch('/api/submissions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({assignmentId,content:draftTextRef.current,audioUrl:url,isDraft:true})});
      const data=await res.json();if(!res.ok)throw new Error(data.error||'Chưa lưu được bản ghi vào bài.');
      setSaveStatus('Đã lưu bản ghi vào bản nháp');
    }).catch(error=>setSaveStatus(error.message));
  };

  const handleDraftChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setDraftText(val);
    draftTextRef.current=val;
    setSaveStatus("Đang lưu nháp...");
    saveAssignmentDraft(assignment.id, val);

    saveQueue.current = saveQueue.current.catch(() => {}).then(async () => {
      const res = await fetch('/api/submissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assignmentId: assignment.id, content: val, audioUrl, isDraft: true }) });
      if (!res.ok) {
        const json = await res.json();
        if (res.status === 409 && json.error?.includes('thu bài')) setServerAssignment((a: any) => ({ ...a, status: 'closed' }));
        throw new Error(json.error || 'Không lưu được bản nháp.');
      }
    }).then(() => setSaveStatus('Đã lưu nháp trên máy chủ'), (e: Error) => setSaveStatus(e.message));

  };

  const handleSubmit = async () => {
    if (isClosed) return;
    if (isQuestionSet ? answeredCount !== questions.length : (assignment.skill==='speaking' ? !audioUrl : !draftText.trim())) {
      setSaveStatus("Vui lòng nhập bài làm trước khi nộp.");
      return;
    }

    try {
      setSubmitting(true);
      await saveQueue.current;
      setSaveStatus("Đang nộp bài...");
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId: assignment.id, content: draftText, audioUrl, answers: isQuestionSet ? answers : undefined, isDraft: false }),
      });

      if (res.ok) {
        const result = await res.json();
        setServerSubmission({ ...result, answers: isQuestionSet ? answers : undefined, content: draftText });
        setIsSubmittedSuccess(true);
        setSaveStatus(result.status === 'graded' ? 'Đã nộp và chấm điểm.' : result.status === 'pending_release' ? 'Đã nộp. Đang chờ giáo viên công bố điểm.' : 'Đã nộp. Đang chờ giáo viên chấm.');
      } else {
        const err = await res.json();
        if (res.status === 409 && err.error?.includes('thu bài')) setServerAssignment((a: any) => ({ ...a, status: 'closed' }));
        setSaveStatus(err.error || 'Lỗi khi nộp bài');
      }
    } catch {
      setSaveStatus('Không nộp được bài. Đáp án vẫn giữ trên trang; hãy thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between">
      <header className="bg-white border-b border-line px-4 md:px-6 py-3.5 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <Link href="/student/classroom" className="flex items-center gap-2 text-xs font-bold text-ink-muted hover:text-ink">
            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách lớp học
          </Link>
          <span className="font-extrabold text-sm text-ink truncate">{assignment.title}</span>
          <span className="text-xs px-2.5 py-0.5 rounded-pill bg-[#EAF2FF] text-primary-dark font-mono font-bold">
            Phiên bản đề: V{assignment.version} {serverSubmission?.versionId ? `(Bài làm theo V${serverSubmission.versionId})` : ''}
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full px-4 md:px-6 py-8 md:py-10 space-y-6 flex-1">
        {/* Assignment Metadata Card */}
        <div className="bg-white border-2 border-line rounded-lg p-6 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
            <div>
              <span className="text-[11px] font-bold text-ink-muted block">{assignment.className}</span>
              <h1 className="text-xl md:text-2xl font-black text-ink">{assignment.title}</h1>
            </div>
            <div className="text-right">
              <span className="text-xs px-3 py-1 rounded-pill bg-warning-soft text-warning font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Hạn nộp: {Number.isNaN(Date.parse(assignment.dueDate)) ? assignment.dueDate : new Date(assignment.dueDate).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-extrabold text-primary uppercase block">Yêu cầu đề bài:</span>
            <p className="text-sm md:text-base text-ink font-medium leading-relaxed">
              {assignment.promptText}
            </p>
          </div>
        </div>

      <AssignmentAttachments assignmentId={assignmentId} />

        {/* If Already Graded: Show Dual Evaluation */}
        {isGraded && (
          <div className="bg-white border-2 border-success/40 rounded-lg p-6 shadow-soft space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-success" />
                <h3 className="font-black text-lg text-ink">Kết Quả Điểm Lớp Học & Nhận Xét Của Giáo Viên</h3>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-success font-mono">
                  {displayScore} / {assignment.maxScore}
                </span>
                <span className="text-[11px] text-ink-muted block font-semibold">Điểm chính thức (Theo đề V{submissionVersion})</span>
              </div>
            </div>

            {/* Official Teacher Feedback */}
            <div className="p-4 bg-success-soft/40 border-l-4 border-success rounded-sm space-y-1 text-sm text-ink leading-relaxed">
              <strong className="block text-success font-extrabold">Nhận xét định hình từ giáo viên:</strong>
              <p>{displayFeedback || "Chưa có nhận xét chi tiết."}</p>
            </div>

            {/* AI Pre-grade Comparison Notice */}
            {assignment.aiPreGrade && (
              <div className="p-4 bg-[#F8FAFF] border border-line rounded-md space-y-1 text-xs text-ink-muted">
                <div className="flex items-center gap-1.5 font-bold text-primary">
                  <Sparkles className="w-3.5 h-3.5" /> Bản đánh giá nháp sơ bộ của AI Copilot (Tham khảo):
                </div>
                <p>{assignment.aiPreGrade}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span>{assignment.allowAiTutor ? "Trợ giúp: chỉ gợi ý trước khi trả bài." : "Giáo viên đã tắt gợi ý cho bài này."}</span>
          {assignment.allowAiTutor && <Button variant="outline" size="sm" onClick={() => setIsTutorOpen(true)}>Hỏi AI Tutor</Button>}
        </div>
        {assignment.skill==='speaking' && !isQuestionSet && <section className="space-y-3">
          {audioUrl && <div className="p-4 border rounded-md"><p>Bản ghi đã lưu trong bài</p><audio controls src={audioUrl} className="w-full" /></div>}
          {!isClosed && !isSubmittedSuccess && <AudioRecorder key={assignmentId} assignmentId={assignmentId} submissionMode onUploaded={saveAudio} />}
        </section>}
        {/* Submission / Workspace Form */}
        <div className="bg-white border-2 border-line rounded-lg p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-line">
            <h3 className="font-extrabold text-sm text-ink">Bài làm của bạn</h3>
            {!isSubmittedSuccess && (
              <span className="text-ink-muted flex items-center gap-1.5">
                <Save className="w-3.5 h-3.5 text-primary" /> {storageError ? "Không lưu được — giữ trang mở" : saveStatus}
              </span>
            )}
          </div>

          {isQuestionSet ? <div className="space-y-6">
            <p role="status" className="text-sm font-bold text-primary">Đã trả lời {answeredCount}/{questions.length} câu</p>
            {exercises.map((exercise: any) => <section key={exercise.id} className="space-y-4">
              <h2 className="text-base font-bold">{exercise.title}</h2>
              <p className="text-sm text-ink-muted">{exercise.instruction}</p>
              {exercise.questions.map((question: any, index: number) => <fieldset key={question.id} disabled={isClosed || isSubmittedSuccess || submitting} className="border border-line rounded-lg p-4 space-y-3">
                <legend className="px-2 text-sm font-bold">Câu {index + 1}. {question.prompt}</legend>
                {question.imageUrl && <img src={question.imageUrl} alt="Hình minh họa câu hỏi" className="max-h-64 object-contain" />}
                {question.options?.length ? question.options.map((option: any) => <label key={option.id} className={`flex items-start gap-3 border rounded-md p-3 cursor-pointer text-sm ${answers[question.id] === option.id ? 'border-primary bg-primary-light' : 'border-line'}`}>
                  <input type="radio" name={question.id} value={option.id} checked={answers[question.id] === option.id} onChange={() => saveAnswers({ ...answers, [question.id]: option.id })} className="mt-1" />
                  <span><strong>{option.id}.</strong> {option.text}</span>
                </label>) : <input aria-label={`Trả lời câu ${index + 1}`} value={answers[question.id] || ''} onChange={(e) => saveAnswers({ ...answers, [question.id]: e.target.value })} className="w-full border border-line rounded-md p-3" />}
              </fieldset>)}
            </section>)}
          </div> : <textarea
            rows={10}
            disabled={isClosed || isSubmittedSuccess}
            value={draftText}
            onChange={handleDraftChange}
            placeholder="Nhập nội dung bài làm của bạn..."
            className="w-full p-4 rounded-md border-2 border-line text-sm md:text-base leading-relaxed text-ink focus:border-primary focus:outline-none resize-y disabled:bg-[#F8FAFF] disabled:text-ink-muted"
          />}

          {!isSubmittedSuccess ? (
            <div className="flex justify-end pt-2">
              <Button size="lg" disabled={isClosed || submitting || (isQuestionSet ? answeredCount !== questions.length : (assignment.skill==='speaking' ? !audioUrl : !draftText.trim()))} onClick={handleSubmit} className="shadow-tactile">
                Nộp bài cho Giáo Viên
              </Button>
            </div>
          ) : (
            <div className="p-3 bg-success-soft rounded-md text-xs text-[#185932] font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" /> {serverSubmission?.missingSubmission ? "Chưa nộp bài khi giáo viên thu bài. Đã ghi 0 điểm." : `Bài làm đã nộp thành công trên phiên bản đề V${submissionVersion}.`}
              </span>
              <span className="text-[11px] text-ink-muted font-normal">Đã lưu trữ hồ sơ</span>
            </div>
          )}
        </div>
      </main>
      <AITutorDrawer isOpen={isTutorOpen && assignment.allowAiTutor} onClose={() => setIsTutorOpen(false)} promptText={assignment.promptText} skill={assignment.skill} userCurrentText={draftText} assignmentId={assignmentId} classId={params.classId as string} hasAnswered={isSubmittedSuccess} canRevealAnswer={isGraded} hintText="Đọc kỹ yêu cầu, xác định ý chính và tự lập dàn ý. Kiểm tra mỗi câu trả lời với nội dung đề." explanationText={assignment.teacherFeedback || "Chưa có nhận xét của giáo viên."} />
    </div>
  );
}


'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Eye,
  ArrowRight,
  FolderTree,
  Image as ImageIcon,
  Volume2,
  HelpCircle,
  Layers,
  ChevronRight,
  Edit3,
  Check,
  X,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import { useDelayedLoading } from '@/lib/useDelayedLoading';
import ImportQuestionsSkeleton from '@/components/ImportQuestionsSkeleton';
import { encodeTeacherFiles } from '@/lib/teacherFiles';
import type { ParsedDocxResult, DocxExerciseBlock, DocxExerciseQuestion } from '@/lib/docxParser';

export default function ImportDocxPage() {
  const router = useRouter();
  const [generationPrompt,setGenerationPrompt]=useState('');
  const [attachments,setAttachments]=useState<File[]>([]);
  const [classrooms, setClassrooms] = useState<{ id: string; name: string; code: string }[]>([]);
  const [classesReady, setClassesReady] = useState(false);
  const [classesError, setClassesError] = useState<string | null>(null);

  // File and Mode state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileNameDisplay, setFileNameDisplay] = useState<string>('Chưa chọn tệp (tối đa 4 MB)');
  const [importMode, setImportMode] = useState<'preserve_authored' | 'generate_from_content'>('preserve_authored');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // Do not flash placeholders for a request that completes almost immediately.
  const showLoadingWorkspace = useDelayedLoading(isLoading, 200);
  const [isPublishing, setIsPublishing] = useState(false);
  const showPublishing = useDelayedLoading(isPublishing, 200);
  const [publishedAssignmentId, setPublishedAssignmentId] = useState<string | null>(null);
  const [assessmentToken, setAssessmentToken] = useState<string | null>(null);
  const requestRef = useRef<AbortController | null>(null);
  const busyRef = useRef(false);
  const [parsedData, setParsedData] = useState<ParsedDocxResult | null>(null);
  const [activeTab, setActiveTab] = useState<'exercises' | 'vocab' | 'images' | 'qa_alerts'>('exercises');
  const [notice, setNotice] = useState<string | null>(null);

  // Classroom target for publish
  const [targetClassId, setTargetClassId] = useState<string>('');
  const [releaseGradesImmediately, setReleaseGradesImmediately] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);

  // Inline Question Editing modal state
  const [editingQuestion, setEditingQuestion] = useState<DocxExerciseQuestion | null>(null);
  const [editPrompt, setEditPrompt] = useState<string>('');
  const [editCorrectAnswer, setEditCorrectAnswer] = useState<string>('');
  const [editExplanation, setEditExplanation] = useState<string>('');

  useEffect(() => {
    let active = true;
    const loadClasses = async () => {
      try {
        const response = await fetch('/api/classes', { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok || !Array.isArray(data.classes)) throw new Error(data.error || 'Chưa tải được danh sách lớp.');
        if (!active) return;
        setClassrooms(data.classes);
        setTargetClassId((previous) => data.classes.some((c: { id: string }) => c.id === previous) ? previous : data.classes[0]?.id || '');
      } catch (error) {
        if (active) setClassesError(error instanceof Error ? error.message : 'Chưa tải được danh sách lớp.');
      } finally {
        if (active) setClassesReady(true);
      }
    };
    void loadClasses();
    return () => { active = false; };
  }, []);

  useEffect(() => () => requestRef.current?.abort(), []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFileNameDisplay(file.name);
    }
  };

  const handleParseDocx = async (useDefault = false) => {
    if (busyRef.current) return;
    busyRef.current = true;
    const controller = new AbortController();
    requestRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 115000);
    setIsLoading(true);
    setNotice(null);
    setPublishedAssignmentId(null);
    setPublishSuccess(null);

    try {
      const formData = new FormData();
      if (!useDefault && selectedFile) {
        formData.append('file', selectedFile);
      } else {
        formData.append('useDefaultSource', 'true');
      }
      formData.append('mode', importMode);
      if(importMode==='generate_from_content')formData.append('prompt',generationPrompt);

      const res = await fetch('/api/teacher/import-docx', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      const data = await res.json();
      if (res.ok && data.success && typeof data.parsed?.title === 'string' && data.parsed.qaAlerts && Array.isArray(data.parsed.vocabulary) && Array.isArray(data.parsed.wordForms) && Array.isArray(data.parsed.extractedImages) && Array.isArray(data.parsed?.exercises) && data.parsed.exercises.length && data.parsed.exercises.every((ex: any) => Array.isArray(ex.questions))) {
        setAssessmentToken(data.assessmentToken || null);
        // Mặc định đánh dấu approved cho các câu hỏi
        const withApproved: ParsedDocxResult = {
          ...data.parsed,
          exercises: data.parsed.exercises.map((ex: DocxExerciseBlock) => ({
            ...ex,
            questions: ex.questions.map((q: DocxExerciseQuestion) => ({
              ...q,
              isApproved: q.isApproved !== false && !q.hasSourceError,
            })),
          })),
        };
        setParsedData(withApproved);
        setNotice(`${withApproved.generationSource === 'real' ? 'AI đã tạo đề mới' : 'Đã đọc tài liệu thành công'} từ tệp ${withApproved.sourceFileName}: ${withApproved.totalVocabCount} từ vựng, ${withApproved.totalExercisesCount} nhóm bài tập, ${withApproved.totalQuestionsCount} câu hỏi.${withApproved.generationSource === 'real' ? ' Hãy kiểm tra và duyệt câu hỏi trước khi xuất bản.' : ''}`);
      } else {
        setNotice(`Lỗi đọc tài liệu: ${data.error || 'Không thể đọc tài liệu'}`);
      }
    } catch (err: any) {
      setNotice(err.name === 'AbortError' ? 'Lỗi: Quá thời gian chờ. Bạn có thể thử lại; bộ câu hỏi trước vẫn được giữ.' : `Lỗi hệ thống: ${err.message || 'Không thể kết nối đến máy chủ'}`);
    } finally {
      window.clearTimeout(timeout);
      busyRef.current = false;
      setIsLoading(false);
    }
  };

  // Toggle approval on an individual question
  const toggleApproveQuestion = (exId: string, qId: string) => {
    if (!parsedData) return;
    setParsedData({
      ...parsedData,
      exercises: parsedData.exercises.map((ex) => {
        if (ex.id !== exId) return ex;
        return {
          ...ex,
          questions: ex.questions.map((q) => {
            if (q.id !== qId) return q;
            return { ...q, isApproved: !q.isApproved };
          }),
        };
      }),
    });
  };

  // Approve all / Unapprove all
  const handleToggleApproveAll = (approve: boolean) => {
    if (!parsedData) return;
    setParsedData({
      ...parsedData,
      exercises: parsedData.exercises.map((ex) => ({
        ...ex,
        questions: ex.questions.map((q) => ({
          ...q,
          isApproved: approve,
        })),
      })),
    });
  };

  const handleToggleExerciseApproval = (exerciseId: string, approve: boolean) => {
    if (!parsedData) return;
    setParsedData({
      ...parsedData,
      exercises: parsedData.exercises.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, questions: ex.questions.map((q) => ({ ...q, isApproved: approve })) }
          : ex
      ),
    });
  };

  // Open Edit Modal
  const openEditModal = (q: DocxExerciseQuestion) => {
    setEditingQuestion(q);
    setEditPrompt(q.prompt);
    setEditCorrectAnswer(q.correctAnswer);
    setEditExplanation(q.explanation || '');
  };

  // Save Edit Question
  const handleSaveEditQuestion = () => {
    if (!parsedData || !editingQuestion) return;
    setParsedData({
      ...parsedData,
      exercises: parsedData.exercises.map((ex) => ({
        ...ex,
        questions: ex.questions.map((q) => {
          if (q.id !== editingQuestion.id) return q;
          return {
            ...q,
            prompt: editPrompt,
            correctAnswer: editCorrectAnswer,
            explanation: editExplanation,
            isInferred: false, // Teacher verified answer
            isApproved: true,
          };
        }),
      })),
    });
    setEditingQuestion(null);
  };

  // Final Publish Action
  const handlePublish = async () => {
    if (!parsedData || busyRef.current || publishedAssignmentId) return;
    if (!classesReady || !classrooms.some((c) => c.id === targetClassId)) {
      setNotice('Hãy chọn một lớp học đã tải từ hệ thống trước khi xuất bản.');
      return;
    }
    busyRef.current = true;
    setIsPublishing(true);
    setNotice(null);
    setPublishSuccess(null);
    const controller = new AbortController();
    requestRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 115000);

    try {
      const approvedExercises = parsedData.exercises
        .map((ex) => ({
          ...ex,
          questions: ex.questions.filter((q) => q.isApproved),
        }))
        .filter((ex) => ex.questions.length > 0);

      const res = await fetch('/api/teacher/import-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'publish',
          attachments: await encodeTeacherFiles(attachments),
          assessmentToken,
          title: parsedData.title,
          classId: targetClassId,
          releaseGradesImmediately,
          sourceFileName: parsedData.sourceFileName,
          exercises: approvedExercises,
          vocabulary: parsedData.vocabulary,
        }),
        signal: controller.signal,
      });

      const resData = await res.json();
      if (res.ok && resData.success && resData.assignmentId) {
        setPublishedAssignmentId(resData.assignmentId);
        setPublishSuccess(
            `Đã xuất bản thành công ${resData.publishedQuestionsCount} câu hỏi đã duyệt vào lớp học! ${resData.difficulty?.status === 'assessed' ? `AI đánh giá mức bài: ${resData.difficulty.rating} điểm; tính năng lực khi công bố điểm.` : 'AI chưa đánh giá được mức bài; chưa tính điểm năng lực mới.'}`
        );
      } else {
        setNotice(`Lỗi xuất bản: ${resData.error}`);
      }
    } catch (err: any) {
      setNotice(`Lỗi xuất bản: ${err.message}`);
    } finally {
      window.clearTimeout(timeout);
      busyRef.current = false;
      setIsPublishing(false);
    }
  };

  const totalQuestions = parsedData?.totalQuestionsCount || 0;
  const approvedCount =
    parsedData?.exercises.reduce(
      (sum, ex) => sum + ex.questions.filter((q) => q.isApproved).length,
      0
    ) || 0;

  return (
    <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-8 md:py-10 space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="border-b border-line pb-4 space-y-2">
        <Link
          href="/teacher/assignments"
          className="inline-flex items-center gap-2 text-xs font-bold text-ink-muted hover:text-ink"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách bài tập
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-ink tracking-tight">
              Tải file lên
            </h1>
            <p className="text-xs md:text-sm text-ink-muted">
              AI đọc DOCX, PDF, Markdown, HTML và TXT, nhận diện từ vựng, hình ảnh và câu hỏi để giáo viên kiểm duyệt trước khi giao bài.
            </p>
          </div>
        </div>
      </div>

      <div className="h-24 overflow-auto" data-import-notice>
      {notice && (
        <div role="alert" className={`p-4 border rounded-lg text-xs md:text-sm font-medium flex items-center gap-2 ${notice.startsWith('Lỗi') ? 'bg-error-soft border-error/30 text-error' : 'bg-primary-light border-primary/20 text-primary-dark'}`}>
          {notice.startsWith('Lỗi') ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
          <span>{notice}</span>
        </div>
      )}

      </div>
      {publishSuccess && <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="publish-success-title">
        <div className="bg-white rounded-xl p-6 max-w-lg space-y-4 shadow-lg">
          <h2 id="publish-success-title" className="text-xl font-bold">Xuất bản thành công</h2>
          <p>{publishSuccess}</p>
          <div className="flex flex-wrap gap-3"><Button autoFocus onClick={() => router.push('/teacher/assignments')}>Về danh sách bài tập</Button><Button variant="outline" onClick={() => setPublishSuccess(null)}>Đóng</Button></div>
        </div>
      </div>}

      {/* 1. Control Panel: File Selection & Mode Selector */}
      <div className="bg-white border-2 border-line rounded-lg p-6 space-y-6 shadow-soft">
        <div className="grid md:grid-cols-2 gap-6">
          {/* File Picker */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold uppercase tracking-wider text-ink-muted block">
              1. Tệp nguồn:
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md border-2 border-dashed border-line hover:border-primary cursor-pointer transition-colors bg-canvas text-xs font-bold text-ink">
                <Upload className="w-4 h-4 text-primary" />
                <span>{selectedFile ? selectedFile.name : 'Tải file lên'}</span>
                <input
                  type="file"
                  accept=".docx,.pdf,.md,.markdown,.html,.htm,.txt" disabled={isLoading || isPublishing}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-[11px] text-ink-muted">
              Đang chọn: <strong className="text-ink">{fileNameDisplay}</strong>
            </p>
          </div>

          {/* Mode Selector */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold uppercase tracking-wider text-ink-muted block">
              2. Cách tạo câu hỏi:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setImportMode('preserve_authored')}
                className={`p-3 rounded-md border-2 text-left text-xs transition-all ${
                  importMode === 'preserve_authored'
                    ? 'border-primary bg-primary-light text-primary-dark font-bold'
                    : 'border-line bg-white text-ink hover:border-line-dark'
                }`}
              >
                <div className="font-extrabold">Mode A: Giữ Đề Sẵn</div>
                <div className="text-[11px] opacity-80 mt-0.5">Giữ nguyên câu hỏi và đáp án có sẵn trong tài liệu.</div>
              </button>

              <button
                type="button"
                onClick={() => setImportMode('generate_from_content')}
                className={`p-3 rounded-md border-2 text-left text-xs transition-all ${
                  importMode === 'generate_from_content'
                    ? 'border-primary bg-primary-light text-primary-dark font-bold'
                    : 'border-line bg-white text-ink hover:border-line-dark'
                }`}
              >
                <div className="font-extrabold">Mode B: Sinh Đề Mới</div>
                <div className="text-[11px] opacity-80 mt-0.5">Tạo 10 câu hỏi mới từ nội dung tài liệu bằng AI.</div>
              </button>
            </div>
          </div>
        </div>

        <label className="block text-sm">Yêu cầu AI tạo đề ngữ pháp theo file và/hoặc prompt<textarea value={generationPrompt} maxLength={5000} disabled={isLoading||isPublishing} onChange={e=>{setGenerationPrompt(e.target.value);setImportMode('generate_from_content');}} placeholder="Ví dụ: Present simple và present continuous, lớp 6, mức A2" className="block border p-3 w-full mt-2" /></label>
        <label className="block text-sm">File kèm đề trắc nghiệm (tối đa 5 tệp / tổng 2 MB)<input type="file" multiple accept=".docx,.pdf,.md,.markdown,.html,.htm,.txt,.png,.jpg,.jpeg,.webp" disabled={isLoading||isPublishing} onChange={e=>setAttachments(Array.from(e.target.files||[]))} className="block mt-2" /></label>
        <p className="text-xs">Muốn tải đề tự luận hoặc Speaking thủ công: <Link href="/teacher/assignments/create" className="underline">Soạn bài và đính kèm đề</Link>. Khi chọn file nguồn, AI tạo câu hỏi theo nội dung file.</p>
        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <Button
            size="md"
            disabled={isLoading || isPublishing || (!selectedFile && !generationPrompt.trim())}
            onClick={() => handleParseDocx(!selectedFile)}
            className="shadow-tactile flex items-center gap-2"
          >
            {showLoadingWorkspace ? <Loader2 className="w-4 h-4 animate-spin motion-reduce:animate-none" /> : <Sparkles className="w-4 h-4" />}
            <span>Đọc đề / AI tạo câu hỏi</span>
          </Button>
        </div>
      </div>

      {/* 2. Dynamic Parse Results Workspace */}
      <div className="h-8 text-sm font-bold" role="status" aria-live="polite">{isLoading ? 'AI đang đọc tài liệu và chuẩn bị câu hỏi…' : isPublishing ? 'Đang xuất bản bộ câu hỏi đã duyệt…' : ''}</div>
      {!parsedData && isLoading && <div aria-busy="true" style={{ visibility: showLoadingWorkspace ? 'visible' : 'hidden' }}><ImportQuestionsSkeleton /></div>}
      {parsedData && (
        <div className="relative" aria-busy={isLoading} data-import-results>
          {showLoadingWorkspace && <div className="absolute inset-0 z-30 bg-white/90 pointer-events-none overflow-hidden"><ImportQuestionsSkeleton /></div>}
          <fieldset disabled={isLoading || isPublishing || !!publishedAssignmentId} className="space-y-6 min-w-0">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="min-h-[120px] p-4 bg-white border-2 border-line rounded-lg space-y-1 shadow-soft">
              <span className="text-[11px] font-bold text-ink-muted uppercase">Từ vựng đã đọc</span>
              <div className="text-2xl font-black text-primary font-mono">{parsedData.totalVocabCount}</div>
              <span className="text-[10px] text-ink-muted">từ kèm phiên âm & nghĩa</span>
            </div>

            <div className="min-h-[120px] p-4 bg-white border-2 border-line rounded-lg space-y-1 shadow-soft">
              <span className="text-[11px] font-bold text-ink-muted uppercase">Bảng họ từ (Word Forms)</span>
              <div className="text-2xl font-black text-ink font-mono">{parsedData.totalWordFormCount}</div>
              <span className="text-[10px] text-ink-muted">gốc từ kèm phái sinh</span>
            </div>

            <div className="min-h-[120px] p-4 bg-white border-2 border-line rounded-lg space-y-1 shadow-soft">
              <span className="text-[11px] font-bold text-ink-muted uppercase">Bài tập trích xuất</span>
              <div className="text-2xl font-black text-success font-mono">{parsedData.totalExercisesCount}</div>
              <span className="text-[10px] text-ink-muted">{parsedData.totalQuestionsCount} câu hỏi con</span>
            </div>

            <div className="min-h-[120px] p-4 bg-white border-2 border-line rounded-lg space-y-1 shadow-soft">
              <span className="text-[11px] font-bold text-ink-muted uppercase">Hình ảnh nhúng</span>
              <div className="text-2xl font-black text-purple-600 font-mono">{parsedData.totalImagesCount}</div>
              <span className="text-[10px] text-ink-muted">trích từ word/media/</span>
            </div>
          </div>

          {/* QA Alerts Banner */}
          <div className="min-h-[96px] p-4 bg-canvas border border-line rounded-lg flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5 font-bold text-warning">
                <AlertTriangle className="w-4 h-4" />
                <span>{parsedData.qaAlerts.inferredAnswersCount} đáp án suy luận (Cần duyệt)</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-error">
                <ShieldAlert className="w-4 h-4" />
                <span>{parsedData.qaAlerts.sourceErrorCount} cảnh báo nguồn tài liệu</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-ink-muted">
                <ImageIcon className="w-4 h-4" />
                <span>{parsedData.qaAlerts.missingMediaCount} media thiếu</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => handleToggleApproveAll(true)}>
                Duyệt tất cả
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleToggleApproveAll(false)}>
                Bỏ duyệt tất cả
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="min-h-[56px] flex flex-wrap items-center gap-2 border-b border-line pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('exercises')}
              className={`px-4 py-2 rounded-pill text-xs font-black transition-all ${
                activeTab === 'exercises'
                  ? 'bg-primary text-white shadow-tactile'
                  : 'bg-white border border-line text-ink-muted hover:text-ink'
              }`}
            >
              Bài Tập & Câu Hỏi ({parsedData.totalQuestionsCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('vocab')}
              className={`px-4 py-2 rounded-pill text-xs font-black transition-all ${
                activeTab === 'vocab'
                  ? 'bg-primary text-white shadow-tactile'
                  : 'bg-white border border-line text-ink-muted hover:text-ink'
              }`}
            >
              Bảng Từ Vựng ({parsedData.totalVocabCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('images')}
              className={`px-4 py-2 rounded-pill text-xs font-black transition-all ${
                activeTab === 'images'
                  ? 'bg-primary text-white shadow-tactile'
                  : 'bg-white border border-line text-ink-muted hover:text-ink'
              }`}
            >
              Hình Ảnh Trích Xuất ({parsedData.extractedImages.length})
            </button>
          </div>

          {/* Tab 1: Exercises Review & Approval */}
          {activeTab === 'exercises' && (
            <div className="space-y-6">
              {parsedData.exercises.map((ex) => (
                <div key={ex.id} className="bg-white border-2 border-line rounded-lg p-5 space-y-4 shadow-soft">
                  <div className="min-h-[82px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line">
                    <div>
                      <h3 className="font-extrabold text-base text-ink">{ex.title}</h3>
                      <p className="text-xs text-ink-muted">{ex.instruction}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 self-start">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-canvas border border-line text-ink-muted">
                        {ex.sourceLocator}
                      </span>
                      <Button size="sm" variant="outline" onClick={() => handleToggleExerciseApproval(ex.id, true)}>
                        Duyệt tất cả
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleToggleExerciseApproval(ex.id, false)}>
                        Bỏ duyệt tất cả
                      </Button>
                    </div>
                  </div>

                  {/* Question Items */}
                  <div className="space-y-3">
                    {ex.questions.map((q, idx) => (
                      <div
                        key={q.id || idx}
                        data-question-card className={`min-h-[320px] p-4 rounded-md border-2 transition-all space-y-3 ${
                          q.isApproved
                            ? 'bg-white border-primary/40'
                            : 'bg-[#FAFAFA] border-line opacity-75'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-primary-light text-primary-dark">
                                Câu {idx + 1}
                              </span>
                              <span className="text-[10px] font-mono text-ink-muted">
                                {q.sourceLocator}
                              </span>
                              {q.isInferred && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-pill bg-warning-soft text-warning border border-warning/30">
                                  Đáp án suy luận
                                </span>
                              )}
                              {q.hasSourceError && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-pill bg-error-soft text-error">
                                  Lỗi nguồn
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-ink leading-relaxed">{q.prompt}</h4>
                          </div>

                          {/* Approval Checkbox & Edit Action */}
                          <div className="flex items-center gap-2 shrink-0">
                            <Button size="sm" variant="outline" onClick={() => openEditModal(q)}>
                              <Edit3 className="w-3.5 h-3.5 mr-1" /> Sửa
                            </Button>
                            <button
                              type="button"
                              onClick={() => toggleApproveQuestion(ex.id, q.id)}
                              className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors ${
                                q.isApproved
                                  ? 'bg-primary text-white'
                                  : 'bg-canvas border border-line text-ink-muted hover:text-ink'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{q.isApproved ? 'Đã duyệt' : 'Chưa duyệt'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Image if attached */}
                        {q.imageUrl && (
                          <div className="pt-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={q.imageUrl}
                              alt="Hình ảnh câu hỏi"
                              className="max-h-48 object-contain rounded border border-line"
                            />
                          </div>
                        )}

                        {/* Options if Multiple Choice */}
                        {q.options && q.options.length > 0 && (
                          <div className="grid sm:grid-cols-2 gap-2 pt-1 text-xs">
                            {q.options.map((opt) => (
                              <div
                                key={opt.id}
                                className={`p-2.5 rounded border ${
                                  opt.id === q.correctAnswer
                                    ? 'bg-success-soft border-success text-success font-bold'
                                    : 'bg-canvas border-line text-ink'
                                }`}
                              >
                                <span className="font-bold mr-1.5">{opt.id}.</span> {opt.text}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="grid gap-2 rounded-md border border-line bg-canvas p-3 text-xs">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-ink-muted">Đáp án đúng</span>
                            <strong className="inline-flex min-w-7 justify-center rounded bg-success-soft px-2 py-0.5 font-mono text-success">
                              {q.correctAnswer}
                            </strong>
                          </div>
                          {q.explanation && (
                            <div className="border-t border-line pt-2 text-ink-muted leading-relaxed">
                              <span className="mr-1.5 font-bold text-ink">Giải thích:</span>
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Vocabulary Table */}
          {activeTab === 'vocab' && (
            <div className="bg-white border-2 border-line rounded-lg p-5 shadow-soft space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-canvas border-b border-line text-ink-muted uppercase">
                    <tr>
                      <th className="p-3">STT</th>
                      <th className="p-3">Từ Vựng</th>
                      <th className="p-3">Từ Loại</th>
                      <th className="p-3">Phiên Âm IPA</th>
                      <th className="p-3">Nghĩa Tiếng Việt</th>
                      <th className="p-3">Vị Trí Nguồn</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {parsedData.vocabulary.map((v, i) => (
                      <tr key={i} className="hover:bg-canvas/50">
                        <td className="p-3 font-mono font-bold text-ink-muted">{v.no}</td>
                        <td className="p-3 font-black text-primary text-sm">{v.word}</td>
                        <td className="p-3 font-medium text-ink-muted">{v.type}</td>
                        <td className="p-3 font-mono text-ink">{v.ipa}</td>
                        <td className="p-3 text-ink font-medium">{v.meaning}</td>
                        <td className="p-3 font-mono text-[10px] text-ink-muted">{v.sourceLocator}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Images */}
          {activeTab === 'images' && (
            <div className="bg-white border-2 border-line rounded-lg p-5 shadow-soft space-y-4">
              <h3 className="font-bold text-sm text-ink">Hình ảnh trích xuất từ tệp DOCX (word/media/)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {parsedData.extractedImages.map((imgUrl, i) => (
                  <div key={i} className="p-2 border border-line rounded-md text-center space-y-2 bg-canvas">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgUrl}
                      alt={`Image ${i + 1}`}
                      className="h-28 w-full object-contain bg-white rounded border border-line"
                    />
                    <div className="text-[10px] font-mono text-ink-muted truncate">
                      {imgUrl.split('/').pop()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Sticky Bottom Publish Bar */}
          <div className="bg-white border-2 border-primary/30 p-5 rounded-lg shadow-tactile flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 z-20">
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-ink">Tiến độ kiểm duyệt:</span>
                <span className="font-mono font-black text-primary text-base">
                  {approvedCount} / {totalQuestions} câu hỏi
                </span>
              </div>
              <p className="text-xs text-ink-muted">
                Chỉ những câu hỏi được giáo viên đánh dấu "Đã duyệt" mới được giao vào lớp học cho học sinh.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <label className="text-xs font-bold space-y-1">Công bố điểm trắc nghiệm
                <select value={releaseGradesImmediately ? 'immediate' : 'teacher'} onChange={event => setReleaseGradesImmediately(event.target.value === 'immediate')} className="block p-2.5 border border-line rounded-md bg-white">
                  <option value="teacher">Chờ giáo viên công bố</option>
                  <option value="immediate">Ngay sau khi học sinh nộp</option>
                </select>
              </label>
              {(!classesReady || classesError || classrooms.length === 0) && (
                <p role="status" className="text-xs text-ink-muted">
                  {!classesReady ? 'Đang tải lớp học…' : classesError || 'Bạn chưa có lớp học. Hãy tạo lớp trước khi giao bài.'}
                </p>
              )}
              {classrooms.length > 0 && (
                <select
                  value={targetClassId}
                  onChange={(e) => setTargetClassId(e.target.value)}
                  className="p-2.5 rounded-md border border-line text-xs font-bold text-ink bg-white focus:border-primary focus:outline-none"
                >
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              )}

              <Button
                size="lg"
                disabled={!!publishedAssignmentId || isPublishing || approvedCount === 0 || isLoading || !classesReady || !classrooms.some((c) => c.id === targetClassId)}
                onClick={handlePublish}
                className="shadow-tactile flex items-center gap-2 whitespace-nowrap"
              >
                {showPublishing ? <Loader2 className="w-4 h-4 animate-spin motion-reduce:animate-none" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{publishedAssignmentId ? "Đã xuất bản" : isPublishing ? "Đang xuất bản…" : `Xuất bản (${approvedCount} câu)`}</span>
              </Button>
            </div>
          </div>
          </fieldset>
        </div>
      )}

      {/* Edit Question Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-lg border-2 border-line p-6 max-w-lg w-full space-y-4 shadow-tactile">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="font-extrabold text-base text-ink">Chỉnh sửa câu hỏi</h3>
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="p-1 rounded-full hover:bg-canvas text-ink-muted hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-left">
              <div>
                <label className="text-xs font-bold text-ink-muted block mb-1">Nội dung câu hỏi (Prompt):</label>
                <textarea
                  rows={3}
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  className="w-full p-3 border border-line rounded-md text-xs font-medium text-ink focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink-muted block mb-1">Đáp án đúng (Correct Answer):</label>
                <input
                  type="text"
                  value={editCorrectAnswer}
                  onChange={(e) => setEditCorrectAnswer(e.target.value)}
                  className="w-full p-2.5 border border-line rounded-md text-xs font-bold text-ink focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink-muted block mb-1">Lời giải thích (Explanation):</label>
                <textarea
                  rows={2}
                  value={editExplanation}
                  onChange={(e) => setEditExplanation(e.target.value)}
                  className="w-full p-2.5 border border-line rounded-md text-xs font-medium text-ink focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-line">
              <Button size="sm" variant="outline" onClick={() => setEditingQuestion(null)}>
                Hủy bỏ
              </Button>
              <Button size="sm" onClick={handleSaveEditQuestion}>
                Lưu & Xác nhận duyệt
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

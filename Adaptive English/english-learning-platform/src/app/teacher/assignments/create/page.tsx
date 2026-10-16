"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { encodeTeacherFiles } from '@/lib/teacherFiles';
import { ArrowLeft, Plus, Sparkles, Upload } from "lucide-react";

export default function CreateAssignmentPage() {
  const router = useRouter();
  const { classrooms, publishAssignment, storageError } = useApp();

  const [files,setFiles]=useState<File[]>([]);
  const [source,setSource]=useState<File|null>(null);
  const [aiPrompt,setAiPrompt]=useState('');
  const [generating,setGenerating]=useState(false);
  const generate=async()=>{if(generating)return;setGenerating(true);setError('');setReviewed(false);try{const form=new FormData();form.append('skill',skill);form.append('prompt',aiPrompt);if(source)form.append('file',source);const res=await fetch('/api/teacher/generate-assignment',{method:'POST',body:form,signal:AbortSignal.timeout(115000)});const data=await res.json();if(!res.ok)throw new Error(data.error);setTitle(data.title);setPrompt(data.promptText);}catch(e){setError(e instanceof Error?e.message:'Chưa tạo được đề');}finally{setGenerating(false);}};
  const [title, setTitle] = useState("");
  const [skill, setSkill] = useState("writing");
  const [selectedClass, setSelectedClass] = useState(classrooms[0]?.id || "");
  const [prompt, setPrompt] = useState("");
  const [allowAi, setAllowAi] = useState(true);
  const [releaseGradesImmediately, setReleaseGradesImmediately] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [dueDate, setDueDate] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [published, setPublished] = useState(false);
  const [difficulty, setDifficulty] = useState<any>(null);
  useEffect(() => { if (!classrooms.some(c => c.id === selectedClass)) setSelectedClass(classrooms[0]?.id || ''); }, [classrooms, selectedClass]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewed || !title.trim() || !prompt.trim() || !selectedClass) return;
    if (saving || generating) return;
    setSaving(true); setError('');
    try {
      const response = await fetch('/api/assignments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ attachments: await encodeTeacherFiles(files), title: title.trim(), classId: selectedClass, skill, promptText: prompt.trim(), allowAiTutor: allowAi, dueDate: dueDate || 'Không đặt hạn', releaseGradesImmediately }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Chưa giao được bài.');
      setDifficulty(data.difficulty); setPublished(true);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Giao bài thất bại.'); }
    finally { setSaving(false); }
  };

  if (published) return <main className="max-w-xl mx-auto p-8 space-y-4"><h1 className="text-2xl font-bold">Đã giao bài thành công</h1><p>{difficulty?.status === 'assessed' ? `AI đánh giá mức bài: ${difficulty.rating} điểm · ${difficulty.level} tham khảo. Kết quả sẽ tính vào năng lực khi công bố điểm.` : 'AI chưa đánh giá được mức bài. Bài đã giao nhưng chưa tính vào điểm năng lực mới.'}</p><Link href="/teacher/assignments" className="text-primary underline">Xem danh sách bài tập</Link></main>;
  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-4 md:px-6 py-8 md:py-10 space-y-8">
      <div className="border-b border-line pb-4 space-y-2">
        <Link href="/teacher/assignments" className="inline-flex items-center gap-2 text-xs font-bold text-ink-muted hover:text-ink">
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách bài tập
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-black text-ink tracking-tight">Soạn Bài Tập Mới</h1>
          <Link href="/teacher/assignments/import-docx">
            <Button variant="outline" size="sm">
              <Upload className="w-3.5 h-3.5 mr-1" /> Đề trắc nghiệm / ngữ pháp
            </Button>
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} onChange={(e) => { if ((e.target as HTMLInputElement).name !== "reviewed") setReviewed(false); }} className="bg-white border-2 border-line rounded-lg p-6 md:p-8 space-y-6 shadow-soft">
        {error && <p role="alert" className="text-error">{error}</p>}
        <label className="block text-sm font-bold">Công bố điểm trắc nghiệm
          <select value={releaseGradesImmediately ? 'immediate' : 'teacher'} onChange={event => setReleaseGradesImmediately(event.target.value === 'immediate')} className="block w-full p-3 border-2 border-line rounded-xl mt-2">
            <option value="teacher">Chờ giáo viên công bố</option><option value="immediate">Ngay sau khi nộp</option>
          </select>
          <span className="block text-xs text-ink-muted mt-2">Bài tự luận và nói luôn cần giáo viên duyệt trước khi trả điểm.</span>
        </label>
        <fieldset disabled={saving || generating} className="space-y-4 text-xs">
          <label className="block">Đính kèm đề thủ công (tự luận, Speaking hoặc tài liệu tham khảo; tối đa 5 tệp / tổng 2 MB)<input type="file" multiple accept=".docx,.pdf,.md,.markdown,.html,.htm,.txt,.png,.jpg,.jpeg,.webp" onChange={e=>setFiles(Array.from(e.target.files||[]))} className="block mt-2" /></label>
          <p>{files.map(f=>f.name).join(', ')}</p>
          {['writing','speaking'].includes(skill) && <section className="p-4 border border-line space-y-3 rounded-md">
            <h2 className="font-bold">AI tạo đề {skill==='writing'?'tự luận':'Speaking'}</h2>
            <label className="block">Yêu cầu tạo đề<textarea value={aiPrompt} maxLength={5000} onChange={e=>setAiPrompt(e.target.value)} placeholder="Ví dụ: Đề A2 về trường học, 3 câu, đoạn văn 100 từ" className="block w-full border p-2" /></label>
            <label className="block">Tài liệu nguồn (tùy chọn, tối đa 4 MB)<input type="file" accept=".docx,.pdf,.md,.markdown,.html,.htm,.txt" onChange={e=>setSource(e.target.files?.[0]||null)} className="block" /></label>
            <Button type="button" onClick={generate} disabled={generating||(!source&&!aiPrompt.trim())}>{generating?'AI đang tạo đề…':'Tạo bản nháp bằng AI'}</Button>
            <p>Tài liệu nguồn dùng để AI đọc. Chọn thêm ở mục đính kèm nếu học sinh cần xem tệp. Kiểm tra và sửa bản nháp bên dưới trước khi giao.</p>
          </section>}
          <div>
            <label className="font-bold text-ink block mb-1">Tiêu đề bài tập</label>
            <input
              type="text"
              required
              placeholder="e.g. IELTS Writing Task 1: Academic Line Graph"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border-2 border-line rounded-sm text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-ink block mb-1">Kỹ năng</label>
              <select
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="w-full p-2.5 border-2 border-line rounded-sm text-sm bg-white focus:border-primary focus:outline-none"
              >
                <option value="reading">Reading</option>
                <option value="listening">Listening</option>
                <option value="writing">Writing</option>
                <option value="speaking">Speaking</option>
                <option value="vocabulary">Vocabulary</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-ink block mb-1">Giao cho lớp</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full p-2.5 border-2 border-line rounded-sm text-sm bg-white focus:border-primary focus:outline-none"
              >
                {classrooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-ink block mb-1">Yêu cầu đề bài / Nội dung hướng dẫn</label>
            <textarea
              rows={6}
              required
              placeholder="Nhập nội dung đề bài, các tiêu chí và câu hỏi chi tiết..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-3 border-2 border-line rounded-sm text-sm focus:border-primary focus:outline-none resize-y"
            />
          </div>

          <div className="p-4 bg-[#F8FAFF] rounded-md border border-line space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-ink flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" /> Cho phép học sinh dùng AI Tutor gợi ý trong bài này
              </span>
              <input
                type="checkbox"
                checked={allowAi}
                onChange={(e) => setAllowAi(e.target.checked)}
                className="w-4 h-4 text-primary rounded"
              />
            </div>
            <p className="text-[11px] text-ink-muted">
              Khi bật, học sinh được xem gợi ý phương pháp giải nhưng AI không làm hộ bài. Khi tắt (ví dụ bài kiểm tra), tính năng AI Tutor sẽ bị khóa.
            </p>
          </div>
        </fieldset><label className="block text-sm">Hạn nộp (tùy chọn)<input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="block p-2 border border-line rounded" /></label>
        <p className="text-sm text-ink-muted">AI đánh giá mức bài khi giao. Khi công bố điểm: điểm lượt làm = tỉ lệ đạt × mức bài; năng lực mới = 80% năng lực cũ + 20% điểm lượt làm. Nếu chưa có năng lực trước đó, lượt đầu là điểm khởi đầu. Bài tự luận và nói cần giáo viên chấm và duyệt.</p>
        <label className="flex items-start gap-2 text-sm"><input name="reviewed" type="checkbox" checked={reviewed} onChange={e => setReviewed(e.target.checked)} />Tôi đã kiểm tra đề, lớp nhận bài và quyền gợi ý.</label>
        <div className="flex justify-end gap-3 pt-3 border-t border-line">
          <Link href="/teacher/assignments">
            <Button variant="outline" size="md">
              Hủy
            </Button>
          </Link>
          <Button type="submit" disabled={saving || generating || !reviewed || !selectedClass || !title.trim() || !prompt.trim()} size="lg" className="shadow-tactile">
            {saving ? 'Đang đánh giá mức bài và giao bài…' : 'Phê duyệt & Giao bài cho lớp'}
          </Button>
        </div>
      </form>
    </main>
  );
}


"use client";

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowUp, X, Minus, Loader2, MessageCircle, RotateCcw, Brain, BookOpen, PanelRight } from 'lucide-react';

type ChatSource = { id: string; title: string; source: string; href: string };
type Message = { id: number | string; role: 'user' | 'assistant'; text: string; mode?: string; sources?: ChatSource[] };
const welcome: Message = { id: 0, role: 'assistant', text: 'Chào bạn! Mình là Leaf AI. Bạn muốn hỏi nghĩa một từ, hiểu cấu trúc ngữ pháp hay tìm cách học dễ hơn?' };

export function StudyChatbot() {
  const path = usePathname();
  const visible = path.startsWith('/student/');
  const activity = /^\/student\/(?:placement-test$|learn\/[^/]+\/[^/]+|workspace\/|classroom\/[^/]+\/assignment\/)/.test(path);
  const [open, setOpen] = useState(false);
  const [sidebar, setSidebar] = useState(false);
  const [nudge, setNudge] = useState(false);
  const [messages, setMessages] = useState<Message[]>([welcome]);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otherTutorOpen, setOtherTutorOpen] = useState(false);
  const [memories, setMemories] = useState<{ id: string; text: string }[]>([]);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const launcher = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const nudges = useRef(0);
  const lastInteraction = useRef(Date.now());
  const request = useRef<AbortController | null>(null);
  const conversation = useRef('');

  useEffect(() => {
    try { setSidebar(localStorage.getItem('leaf_ai_sidebar') === 'true'); } catch { /* Use the compact window when storage is unavailable. */ }
  }, []);

  function toggleSidebar() {
    const next = !sidebar;
    setSidebar(next);
    try { localStorage.setItem('leaf_ai_sidebar', String(next)); } catch { /* The selected layout still works for this visit. */ }
  }

  useEffect(() => {
    request.current?.abort();
    conversation.current = visible ? crypto.randomUUID() : '';
    setMessages([welcome]);
    setMemories([]);
    setDraft(''); setError(null); setPending(false); setMemoryOpen(false);
    setReady(visible);
    return () => request.current?.abort();
  }, [visible, path]);

  async function resetChat(scope: 'history' | 'memory') {
    request.current?.abort();
    const previous = conversation.current;
    conversation.current = crypto.randomUUID();
    setMessages([welcome]); setMemories([]); setDraft(''); setError(null); setPending(false); setMemoryOpen(false);
    input.current?.focus();
    if (scope === 'history') return;
    try {
      const response = await fetch(`/api/ai/chat?scope=memory&conversationId=${encodeURIComponent(previous)}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Chưa xóa được dữ liệu. Vui lòng thử lại.');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không kết nối được Leaf AI.'); }
  }

  useEffect(() => {
    const update = () => setOtherTutorOpen(!!document.querySelector('[aria-label="AI Tutor Leaf AI"]'));
    const observer = new MutationObserver(update);
    observer.observe(document.body, { childList: true, subtree: true });
    update();
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!visible || open || otherTutorOpen) { setNudge(false); return; }
    let hide: ReturnType<typeof setTimeout>;
    const timer = setInterval(() => {
      if (document.visibilityState !== 'visible' || nudges.current >= 3 || Date.now() - lastInteraction.current < 90000) return;
      nudges.current++;
      lastInteraction.current = Date.now();
      setNudge(true);
      hide = setTimeout(() => setNudge(false), 10000);
    }, 60000);
    return () => { clearInterval(timer); clearTimeout(hide); };
  }, [visible, open, otherTutorOpen]);
  useEffect(() => {
    if (open) input.current?.focus();
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape' && open) { setOpen(false); launcher.current?.focus(); } };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [open]);
  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [messages, pending, open, error]);
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => {
    request.current?.abort();
    setPending(false);
    setError(null);
  }, [path]);

  function toggleOpen() {
    lastInteraction.current = Date.now();
    setNudge(false);
    setOpen(value => !value);
  }
  async function send(text = draft) {
    const message = text.trim();
    if (!message || pending || !ready) return;
    lastInteraction.current = Date.now();
    setError(null);
    setPending(true);
    setDraft('');
    const next = [...messages, { id: Date.now(), role: 'user' as const, text: message }].slice(-40);
    setMessages(next);
    const controller = new AbortController();
    request.current = controller;
    const conversationId = conversation.current;
    // Read only the task area; never collect navigation, account details or the chat itself.
    const task = document.querySelector<HTMLElement>('[data-study-question-id]') || document.querySelector<HTMLElement>('main');
    const context = { path, questionId: task?.dataset.studyQuestionId, screenText: activity ? task?.innerText.slice(0, 6000) : '' };
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
        body: JSON.stringify({ message, conversationId, context }),
      });
      const data = await response.json();
      if (!response.ok || !data.success || typeof data.reply !== 'string') throw new Error(data.error || 'Mình chưa nhận được tin nhắn. Thử lại nhé.');
      if (!controller.signal.aborted) {
        setMessages(current => [...current, { id: Date.now() + 1, role: 'assistant' as const, text: data.reply, mode: data.mode, sources: data.sources }].slice(-40));
        try {
          const saved = await fetch(`/api/ai/chat?conversationId=${encodeURIComponent(conversationId)}`, { cache: 'no-store', signal: controller.signal });
          if (saved.ok && !controller.signal.aborted) setMemories((await saved.json()).memories || []);
        } catch { /* The reply is already saved; a preference refresh must not resend it. */ }
      }
    } catch (reason) {
      if (!controller.signal.aborted) { setError(reason instanceof Error ? reason.message : 'Không kết nối được chatbot.'); setDraft(message); }
    } finally {
      if (request.current === controller) { setPending(false); request.current = null; }
    }
  }
  if (!visible || otherTutorOpen) return null;

  return (
    <div className={`fixed right-3 sm:right-6 z-40 ${activity ? 'bottom-24 sm:bottom-28' : 'bottom-4 sm:bottom-6'}`}>
      {open && (
        <section id="study-buddy-chat" role="dialog" aria-label="Trò chuyện với Leaf AI" className={`flex flex-col border border-line bg-white shadow-panel overflow-hidden ${sidebar ? 'fixed top-0 right-0 z-50 w-[min(420px,100vw)] h-[100dvh] sm:rounded-l-2xl' : 'absolute bottom-20 right-0 w-[min(380px,calc(100vw-24px))] h-[min(520px,calc(100dvh-190px))] rounded-2xl'}`}>
          <header className="flex items-center gap-3 border-b border-line px-4 py-3 bg-canvas">
            <img src="/assets/mascot/avatar.svg" alt="" className="w-10 h-10 rounded-full bg-primary-light p-1" />
            <div className="flex-1"><h2 className="font-extrabold text-sm text-ink">Trợ lý học tập Leaf AI</h2><p className="text-xs text-ink-muted">Hỏi nhanh về từ vựng, ngữ pháp và cách học</p></div>
            <button type="button" aria-label="Xem trí nhớ Leaf AI" aria-expanded={memoryOpen} onClick={() => setMemoryOpen(value => !value)} className="w-11 h-11 grid place-items-center rounded-full hover:bg-line text-primary"><Brain className="w-5 h-5" /></button>
            <button type="button" aria-label="Thu nhỏ chatbot" onClick={toggleOpen} className="w-11 h-11 grid place-items-center rounded-full hover:bg-line"><Minus className="w-5 h-5" /></button>
          </header>
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-line px-4 bg-white">
            <span className="text-xs text-ink-muted">{sidebar ? 'Mở ở thanh bên' : 'Cửa sổ chat nhỏ'}</span>
            <button type="button" aria-label="Chế độ thanh bên" aria-pressed={sidebar} onClick={toggleSidebar} title={sidebar ? 'Chuyển về cửa sổ nhỏ' : 'Mở thành thanh bên'} className="min-h-11 flex items-center gap-2 text-xs font-bold text-primary rounded-lg px-2 hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
              <PanelRight className="w-4 h-4" aria-hidden="true" /> Thanh bên
              <span aria-hidden="true" className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${sidebar ? 'bg-primary' : 'bg-slate-300'}`}><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${sidebar ? 'translate-x-[18px]' : 'translate-x-0.5'}`} /></span>
            </button>
          </div>
          {memoryOpen && <div className="border-b border-line bg-primary-light p-4 space-y-2 text-xs max-h-48 overflow-y-auto">
            <p className="font-bold text-ink">Trí nhớ cuộc chat này</p>
            {memories.length ? memories.map(memory => <p key={memory.id}>{memory.text}</p>) : <p>Chưa có sở thích được lưu. Bạn có thể nói thời lượng học, mục tiêu hoặc cách giải thích mình thích.</p>}
            <p className="text-ink-muted">Trí nhớ chỉ dùng trong cuộc chat này. Tải lại hoặc chuyển trang sẽ bắt đầu chat mới.</p>
            <button type="button" onClick={() => void resetChat('memory')} className="min-h-11 font-bold text-error underline">Xóa cuộc chat này</button>
          </div>}
          <div ref={log} role="log" aria-live="polite" aria-relevant="additions" aria-label="Lịch sử trò chuyện" className="min-h-0 flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain">
            {messages.map(message => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] rounded-2xl px-3.5 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words ${message.role === 'user' ? 'bg-primary text-white rounded-br-sm' : 'bg-canvas text-ink border border-line rounded-bl-sm'}`}>
                  <span className="sr-only">{message.role === 'user' ? 'Bạn: ' : 'Leaf AI: '}</span>{message.text}
                  {!!message.sources?.length && <div className="mt-3 pt-2 border-t border-line space-y-1 text-xs"><p className="flex items-center gap-1 font-bold"><BookOpen className="w-3 h-3" /> Học liệu tham khảo</p>{message.sources.map(source => <a key={source.id} href={source.href} className="block text-primary underline">{source.title}<span className="block text-ink-muted no-underline">{source.source}</span></a>)}</div>}
                </div>
              </div>
            ))}
            {messages.length === 1 && <div className="space-y-2">
              <p className="text-xs font-semibold text-ink-muted">Gợi ý để bắt đầu</p>
              <div className="flex flex-wrap gap-2">
                {['Dịch từ “curious”', 'Giải thích thì hiện tại hoàn thành', 'Giúp mình lên kế hoạch học'].map(text => <button type="button" key={text} onClick={() => { setDraft(text); input.current?.focus(); }} className="min-h-11 text-xs text-primary border border-primary/20 rounded-xl px-3 py-2 hover:bg-primary-light">{text}</button>)}
              </div>
            </div>}
            {pending && <p role="status" className="flex items-center gap-2 text-xs text-ink-muted"><Loader2 className="w-4 h-4 animate-spin" /> Leaf AI đang suy nghĩ…</p>}
            {!ready && <p role="status" className="text-xs text-ink-muted">Đang khôi phục cuộc trò chuyện…</p>}
            {error && <div role="alert" className="text-sm text-error space-y-1"><p>{error}</p><p className="text-xs text-ink-muted">Tin nhắn đã được giữ trong ô nhập để bạn gửi lại.</p></div>}
          </div>
          <form onSubmit={event => { event.preventDefault(); void send(); }} className="border-t border-line px-3 py-3 space-y-2 bg-white">
            <label htmlFor="study-buddy-message" className="sr-only">Tin nhắn cho Leaf AI</label>
            <div className="flex items-end gap-2 rounded-xl border border-line bg-canvas p-2 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25">
              <textarea ref={input} id="study-buddy-message" value={draft} onChange={event => setDraft(event.target.value)} maxLength={2000} rows={2} placeholder="Bạn muốn hiểu điều gì?" onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void send(); } }} className="min-w-0 flex-1 resize-none border-0 bg-transparent px-3 py-2 text-base sm:text-sm leading-6 outline-none focus:outline-none focus-visible:outline-none" />
              <button type="submit" disabled={pending || !ready || !draft.trim()} aria-label="Gửi tin nhắn" className="w-11 h-11 shrink-0 rounded-xl bg-primary text-white grid place-items-center transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:opacity-100">{pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-5 h-5" />}</button>
            </div>
            <div className="flex justify-end"><button type="button" disabled={!ready} onClick={() => void resetChat('history')} aria-label="Bắt đầu chat mới" title="Bắt đầu chat mới" className="min-h-11 px-3 flex items-center gap-2 rounded-full border border-transparent text-xs text-ink-muted hover:border-line hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-50"><RotateCcw className="w-3.5 h-3.5" /> Chat mới</button></div>
          </form>
        </section>
      )}
      {nudge && !open && <div className="absolute right-0 bottom-20 flex items-center w-64 rounded-2xl rounded-br-sm border border-line bg-white shadow-soft pl-4 pr-1 py-2"><button type="button" onClick={toggleOpen} className="flex-1 text-sm text-ink text-left">Bạn có cần mình giúp gì không?</button><button type="button" aria-label="Ẩn lời nhắc trợ giúp" onClick={() => { setNudge(false); lastInteraction.current = Date.now(); }} className="w-11 h-11 grid place-items-center text-ink-muted"><X className="w-4 h-4" /></button></div>}
      <button ref={launcher} type="button" aria-label={open ? 'Thu nhỏ Leaf AI' : 'Mở chatbot Leaf AI'} aria-expanded={open} aria-controls="study-buddy-chat" onClick={toggleOpen} className="relative w-16 h-16 grid place-items-center rounded-full border-2 border-white bg-primary-light shadow-panel transition-transform hover:scale-105 active:scale-95">
        {open ? <MessageCircle className="w-7 h-7 text-primary" /> : <img src="/assets/mascot/avatar.svg" alt="" className="w-12 h-12" />}
        <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-success border-2 border-white" />
      </button>
    </div>
  );
}

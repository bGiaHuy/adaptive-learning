"use client";

import React, { useState } from "react";
import { Search, Loader2, Volume2, BookOpen } from "lucide-react";
import { useApp } from '@/lib/store';

export function DictionaryLookup() {
  const { vocabWords, refreshVocab, vocabReady } = useApp();
  const [saving, setSaving] = useState<number | string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [expanded, setExpanded] = useState(false);
  async function saveSense(id: number | string) {
    if (saving !== null) return;
    setSaving(id); setFeedback('');
    try {
      const response = await fetch('/api/vocab', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(typeof id === 'string' ? { basicWordId: id } : { dictionarySenseId: id }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Chưa lưu được nghĩa này.');
      await refreshVocab();
      setFeedback('Đã thêm từ và kích hoạt vào hàng đợi học.');
    } catch (reason) { setFeedback(reason instanceof Error ? reason.message : 'Chưa lưu được nghĩa này.'); }
    finally { setSaving(null); }
  }
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setExpanded(false); setFeedback('');
    setSearched(true);
    try {
      const res = await fetch(`/api/dictionary?q=${encodeURIComponent(query.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        setResult(null);
      }
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const playTTS = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="bg-white border-2 border-line rounded-lg p-5 shadow-soft space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-primary" />
        <h2 className="text-base font-bold text-ink">Tra cứu từ điển Anh - Việt</h2>
      </div>
      <p className="text-sm text-ink-muted">Tìm từ trong kho, chọn nghĩa bạn muốn học rồi lưu vào tủ cá nhân.</p>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <input
            id="dictionary-query"
            aria-label="Từ tiếng Anh cần tìm trong từ điển"
            maxLength={100}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nhập từ vựng cần tra cứu (ví dụ: environment, curious)..."
            className="w-full px-4 py-2 border border-line rounded-md text-sm text-ink focus:outline-none focus:border-primary"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-4 py-2 bg-primary text-white rounded-md text-sm font-bold flex items-center gap-1.5 hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Tra từ
        </button>
      </form>
      {feedback && <p role="status" className="text-sm text-primary">{feedback}</p>}

      {searched && !loading && (!result || !result.entry) && (
        <p className="text-xs text-ink-muted">Không tìm thấy định nghĩa cho &quot;{query}&quot;.</p>
      )}

      {result?.entry && (
        <div className="p-4 bg-canvas rounded-md space-y-3 border border-line">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-ink">{result.entry.word}</span>
              {result.entry.pronunciations?.[0] && (
                <span className="text-xs text-ink-muted">/{result.entry.pronunciations[0].ipa}/</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => playTTS(result.entry.word)}
              className="p-1.5 rounded-full hover:bg-white text-primary transition-colors"
              title="Phát âm"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {result.entry.senses?.slice(0, expanded ? undefined : 5).map((sense: any, idx: number) => (
              <div key={sense.id} className="text-sm text-ink space-y-2 border border-line rounded-xl bg-white p-4">
                <p className="text-xs font-bold text-ink-muted">Nghĩa {idx + 1}</p>
                {sense.partOfSpeech && (
                  <span className="font-semibold text-primary italic mr-1.5">[{sense.partOfSpeech}]</span>
                )}
                <span>{sense.definition}</span>
                {sense.example && (
                  <p className="text-ink-muted italic ml-3">&quot;{sense.example}&quot;</p>
                )}
                <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs text-ink-muted">Nguồn: {sense.source}</span><button type="button" disabled={saving !== null || !vocabReady || vocabWords.some(word => word.dictionarySenseId === sense.id)} onClick={() => void saveSense(sense.id)} className="min-h-11 px-3 rounded-xl border border-primary/30 text-primary font-bold text-sm hover:bg-primary-light disabled:opacity-50">{saving === sense.id ? 'Đang lưu…' : vocabWords.some(word => word.dictionarySenseId === sense.id) ? 'Đã lưu nghĩa' : 'Lưu nghĩa này'}</button></div>
              </div>
            ))}
            {result.entry.senses?.length > 5 && <button type="button" className="min-h-11 text-sm text-primary font-bold underline" onClick={() => setExpanded(value => !value)}>{expanded ? 'Thu gọn' : `Xem đủ ${result.entry.senses.length} nghĩa`}</button>}
          </div>
        </div>
      )}
      <p className="text-xs text-ink-muted">Nguồn dữ liệu: <a href={result?.attribution?.url || 'https://github.com/minhqnd/dictionary'} target="_blank" rel="noreferrer" className="underline">{result?.attribution?.name || 'minhqnd/dictionary'}</a> · {result?.attribution?.license || 'CC BY-SA 4.0'}.</p>
    </div>
  );
}

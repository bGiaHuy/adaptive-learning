"use client";

import { isWordDue } from "@/lib/learning";
import { summarizeWords } from '@/lib/vocabulary';
import { DictionaryLookup } from '@/components/ui/DictionaryLookup';
import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { VocabState, VocabularyWord } from "@/types";
import { Button } from "@/components/ui/Button";
import {
  RotateCcw,
  Plus,
  Upload,
  Search,
  Filter,
  Volume2,
  AlertTriangle,
  Sparkles,
  BookMarked,
  CheckCircle2,
} from "lucide-react";

export default function VocabularyHubPage() {
  const { vocabWords, dailyVocabLimit, refreshVocab, addWord, importWords, activateWord, vocabReady, vocabError, dailyVocabNotice } = useApp();
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState<string | null>(null);
  const mastery = summarizeWords(vocabWords);

  const [notice, setNotice] = useState("");
  async function saveLimit(limit: number | 'unlimited') {
    if (saving) return;
    setSaving(true); setNotice('');
    try {
      const response = await fetch('/api/vocab/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ limit }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Chưa lưu được hạn mức.');
      await refreshVocab();
      setNotice('Đã lưu hạn mức và cập nhật từ vựng hôm nay.');
    } catch (reason) { setNotice(reason instanceof Error ? reason.message : 'Chưa lưu được hạn mức.'); }
    finally { setSaving(false); }
  }
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [importModalOpen, setImportModalOpen] = useState(false);


  // Import text state
  const [importText, setImportText] = useState("");

  const dueWords = vocabWords.filter(w => isWordDue(w));

  const filteredWords = vocabWords.filter((w) => {
    const matchTab = activeTab === "all" || w.state === activeTab;
    const matchSearch =
      w.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.definition.toLowerCase().includes(searchTerm.toLowerCase());
    return matchTab && matchSearch;
  });


  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const lines = importText.split("\n");
    setSaving(true);
    try { await importWords(lines);
    setImportText("");
    setImportModalOpen(false);
    } catch (reason) { setNotice(reason instanceof Error ? reason.message : 'Chưa nhập được từ.'); }
    finally { setSaving(false); }
  };

  const stateBadges: Record<VocabState, { label: string; color: string }> = {
    saved: { label: "1. Đã lưu (Shelf)", color: "bg-line/50 text-ink-muted border-line" },
    learning: { label: "2. Đang học (Queue)", color: "bg-[#EDF4FF] text-primary border-primary/20" },
    reviewing: { label: "3. Đang củng cố", color: "bg-warning-soft text-warning border-warning/20" },
    mastered: { label: "4. Nhớ ổn định (≥21d)", color: "bg-success-soft text-success border-success/20" },
    relearning: { label: "5. Cần học lại", color: "bg-error-soft text-error border-error/20" },
  };

  return (
    <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-8 md:py-10 space-y-8">
      {/* 1. Header & Primary CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="text-3xl font-black text-ink tracking-tight">Tủ từ vựng của bạn</h1>
          <p className="text-xs md:text-sm text-ink-muted">
            Mỗi ngày tự bổ sung tối đa 10 từ cần học, trong hạn mức bạn chọn. Ưu tiên từ đến hạn và từ đã lưu.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setImportModalOpen(true)}>
            <Upload className="w-3.5 h-3.5 mr-1" /> Import danh sách
          </Button>
          <Button variant="outline" size="sm" onClick={() => { const field = document.getElementById('dictionary-query'); field?.scrollIntoView({ behavior: 'smooth', block: 'center' }); field?.focus({ preventScroll: true }); }}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Thêm từ mới
          </Button>
          <Link href="/student/vocabulary/flashcard">
            <Button size="md" className="shadow-tactile">
              <RotateCcw className="w-4 h-4 mr-1.5" /> Bắt đầu ôn ({dueWords.length} thẻ đến hạn)
            </Button>
          </Link>
        </div>
      </div>

      <DictionaryLookup />
      {dailyVocabNotice && <p role="status" className="text-sm text-warning">{dailyVocabNotice}</p>}
      {vocabError && <p role="alert" className="text-error">{vocabError}</p>}
      {!vocabReady && !vocabError && <p role="status">Đang tải kho từ của bạn…</p>}
      <div className="rounded-xl bg-primary-light border border-line px-5 py-4 text-sm text-ink"><strong>{mastery.length} từ · {vocabWords.length} nghĩa đã lưu · {mastery.filter(word => word.state === 'mastered').length} từ nhớ ổn định</strong><p className="text-xs text-ink-muted mt-1">Mỗi nghĩa có lịch ôn riêng. Một từ được tính nhớ ổn định khi tất cả nghĩa bạn đã lưu đều đạt ngưỡng ghi nhớ.</p></div>
      {/* 2. Overwhelm Warning Banner (If > 25 due cards) */}
      {dueWords.length > 25 && (
        <div className="p-4 rounded-md bg-warning-soft border-l-4 border-warning flex items-start gap-3 text-xs text-ink">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong>CẢNH BÁO QUÁ TẢI ÔN TẬP (Review Overwhelm):</strong>
            <p>
              Bạn đang có {dueWords.length} thẻ đến hạn ôn tập hôm nay. Để bảo vệ trí nhớ dài hạn và tránh bỏ cuộc, hệ thống tạm dừng nạp thêm từ mới vào hàng đợi. Hãy giải quyết thẻ đến hạn trước nhé!
            </p>
          </div>
        </div>
      )}

      {/* 3. Settings Bar: Daily New Word Limit Selector */}
      <div className="bg-white border-2 border-line rounded-lg p-5 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="font-extrabold text-sm text-ink block">Hạn mức từ mới mỗi ngày · Tính tổng mọi deck</span>
            <p className="text-xs text-ink-muted">
              Giới hạn số lượng từ mới kích hoạt từ 'Đã lưu' vào 'Đang học' trên toàn bộ các bộ từ để duy trì nhịp học bền vững.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[5, 10, 20].map((limitOpt) => {
              const isSelected = dailyVocabLimit === limitOpt;
              return (
                <button
                  key={String(limitOpt)}
                  type="button"
                  disabled={saving}
                  onClick={() => void saveLimit(limitOpt)}
                  className={`px-3 py-1.5 rounded-pill text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-primary text-white shadow-tactile translate-y-[-1px]"
                      : "bg-[#F8FAFF] border border-line text-ink-muted hover:border-primary/50"
                  }`}
                >
                  {limitOpt} từ
                </button>
              );
            })}

            <button
              type="button"
              disabled={saving}
              onClick={() => {
                const customVal = prompt("Nhập số từ mới giới hạn mỗi ngày (ví dụ 15):", "15");
                if (customVal && parseInt(customVal, 10) > 0) {
                  const num = parseInt(customVal, 10);
                  void saveLimit(num);
                }
              }}
              className={`px-3 py-1.5 rounded-pill text-xs font-bold transition-all ${
                typeof dailyVocabLimit === "number" && ![5, 10, 20].includes(dailyVocabLimit)
                  ? "bg-primary text-white shadow-tactile translate-y-[-1px]"
                  : "bg-[#F8FAFF] border border-line text-ink-muted hover:border-primary/50"
              }`}
            >
              {typeof dailyVocabLimit === "number" && ![5, 10, 20].includes(dailyVocabLimit)
                ? `Tùy chỉnh: ${dailyVocabLimit} từ`
                : "Tùy chỉnh"}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => void saveLimit('unlimited')}
              className={`px-3 py-1.5 rounded-pill text-xs font-bold transition-all ${
                dailyVocabLimit === "Unlimited"
                  ? "bg-warning text-white shadow-tactile translate-y-[-1px]"
                  : "bg-[#F8FAFF] border border-line text-ink-muted hover:border-warning"
              }`}
            >
              Không giới hạn
            </button>
          </div>
        </div>


      </div>

      {notice && <p role="status" className="p-3 bg-primary-light rounded-md text-sm">{notice}</p>}
      {/* 4. Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* State Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "all", label: `Tất cả (${vocabWords.length})` },
            { id: "saved", label: `Đã lưu (${vocabWords.filter((w) => w.state === "saved").length})` },
            { id: "learning", label: `Đang học (${vocabWords.filter((w) => w.state === "learning").length})` },
            { id: "reviewing", label: `Đang củng cố (${vocabWords.filter(w => w.state === "reviewing").length})` },
            { id: "mastered", label: `Nhớ ổn định (${vocabWords.filter((w) => w.state === "mastered").length})` },
            { id: "relearning", label: `Cần học lại (${vocabWords.filter((w) => w.state === "relearning").length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-pill text-xs font-bold whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white border border-line text-ink-muted hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm từ hoặc nghĩa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-pill border-2 border-line text-xs font-medium focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* 5. Words List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredWords.map((word) => {
          const badge = stateBadges[word.state];
          return (
            <div
              key={word.id}
              className="bg-white border-2 border-line hover:border-primary/60 rounded-md p-5 space-y-3 transition-all shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-lg text-ink">{word.term}</h3>
                    <span className="text-xs text-primary font-mono">{word.phonetic}</span>
                    <span className="text-[11px] px-1.5 py-0.2 rounded bg-line/60 text-ink-muted font-bold">
                      {word.partOfSpeech}
                    </span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-pill bg-[#EAF2FF] text-primary-dark font-extrabold text-[10px] inline-block mt-1">
                    {word.cefr === 'Chưa đánh giá' ? 'Chưa phân trình độ' : `CEFR ${word.cefr}`}
                  </span>
                </div>

                <span className={`px-2.5 py-0.5 rounded-pill text-[11px] font-bold border ${badge.color}`}>
                  {badge.label}
                </span>
              </div>

              <p className="text-xs md:text-sm text-ink leading-relaxed font-medium">
                {word.definition}
              </p>

              {word.example && <p className="text-xs text-ink-muted italic border-l-2 border-primary/30 pl-2">
                "{word.example}"
              </p>}
              {word.sourceUrl && <p className="text-xs text-ink-muted">Nguồn: <a href={word.sourceUrl} target="_blank" rel="noreferrer" className="underline">{word.source} · minhqnd/dictionary</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer" className="underline">{word.license}</a></p>}

              {word.state === "saved" && <Button size="sm" variant="outline" disabled={activating !== null} onClick={async () => { setActivating(word.id); try { setNotice(await activateWord(word.id)); } finally { setActivating(null); } }}>{activating === word.id ? 'Đang đưa vào học…' : 'Đưa vào học'}</Button>}
              <div className="flex items-center justify-between text-[11px] text-ink-muted pt-2 border-t border-line/60">
                <span>Khoảng cách: <strong>{word.intervalDays} ngày</strong></span>
                <span>Hẹn ôn: <strong className="text-primary">{word.nextReviewDate}</strong></span>
              </div>
            </div>
          );
        })}
      </div>


      {/* Modal: Import Words List */}
      {importModalOpen && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleImportSubmit} className="bg-white border-2 border-line rounded-lg p-6 max-w-md w-full shadow-panel space-y-4 animate-in fade-in">
            <h3 className="font-black text-lg text-ink">Import Danh Sách Từ Vựng</h3>
            <p className="text-xs text-ink-muted">
              Nhập mỗi từ một dòng theo định dạng <code>từ: định nghĩa</code>. Từ mới sẽ được kích hoạt vào hàng đợi học ngay.
            </p>
            <textarea
              rows={6}
              required
              placeholder="resilient: có khả năng phục hồi nhanh&#10;meticulous: tỉ mỉ cẩn trọng&#10;scrutinize: xem xét kỹ lưỡng"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="w-full p-3 border-2 border-line rounded-sm text-xs font-mono focus:border-primary focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setImportModalOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" size="sm" disabled={saving}>
                Xác nhận Import
              </Button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

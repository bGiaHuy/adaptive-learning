'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Mascot } from '@/components/ui/Mascot';
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Volume2,
  BookmarkPlus,
  HelpCircle,
  Eye,
  Check,
} from 'lucide-react';
import { thematicPackUnit2 } from '@/lib/thematicPackUnit2';
import { InlineWordSelector } from '@/components/exercise/InlineWordSelector';
import { WordBankFill } from '@/components/exercise/WordBankFill';
import { TrueFalseTable } from '@/components/exercise/TrueFalseTable';

export default function ThematicPackWorkspacePage() {
  const [activeTab, setActiveTab] = useState<'vocab' | 'wordform' | 'grammar' | 'practice'>('practice');
  const [addedVocabs, setAddedVocabs] = useState<number[]>([]);
  const [submittedPractice, setSubmittedPractice] = useState(false);

  const handleAddVocabToFsrs = (no: number) => {
    if (!addedVocabs.includes(no)) {
      setAddedVocabs([...addedVocabs, no]);
    }
  };

  const handleAddAllVocab = () => {
    setAddedVocabs(thematicPackUnit2.vocabulary.map((v) => v.no));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/student/learn" className="text-xs font-bold text-ink-muted hover:text-primary">
              ← Kho bài học
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-xs font-bold text-primary">Thematic Study Pack</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-ink tracking-tight flex items-center gap-2">
            <span>{thematicPackUnit2.title}</span>
            <Badge variant="primary">{thematicPackUnit2.cefrLevel}</Badge>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/teacher/assignments/import-docx">
            <Button variant="outline" size="sm" className="text-xs">
              Xem cây import của Giáo viên ↗
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Mascot Banner */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-primary/20 rounded-xl flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="font-extrabold text-sm text-primary-dark">
            Bộ Học Liệu Chủ Đề Toàn Diện
          </div>
          <p className="text-xs text-ink-muted">
            Kết hợp từ vựng có phiên âm IPA, bảng họ từ Word Form, lý thuyết câu đơn và thực hành tương tác trực tiếp.
          </p>
        </div>
        <div className="hidden sm:block">
          <Mascot mood="explaining" size="avatar" />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-line pb-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('practice')}
          className={`px-4 py-2 rounded-pill text-xs font-black transition-all ${
            activeTab === 'practice'
              ? 'bg-primary text-white shadow-tactile'
              : 'bg-white border border-line text-ink-muted hover:text-ink'
          }`}
        >
          Luyện Tập Tương Tác (Practice)
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
          A. Từ Vựng (41 từ)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('wordform')}
          className={`px-4 py-2 rounded-pill text-xs font-black transition-all ${
            activeTab === 'wordform'
              ? 'bg-primary text-white shadow-tactile'
              : 'bg-white border border-line text-ink-muted hover:text-ink'
          }`}
        >
          B. Word Form (8 họ từ)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('grammar')}
          className={`px-4 py-2 rounded-pill text-xs font-black transition-all ${
            activeTab === 'grammar'
              ? 'bg-primary text-white shadow-tactile'
              : 'bg-white border border-line text-ink-muted hover:text-ink'
          }`}
        >
          C. Ngữ Pháp (Câu Đơn)
        </button>
      </div>

      {/* TAB PRACTICE: THE 3 NEW COMPONENTS AND ADVANCED TYPES */}
      {activeTab === 'practice' && (
        <div className="space-y-8 animate-in fade-in">
          {/* Exercise 9: Inline Word Selection (Subject / Verb) */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div>
                <span className="text-xs font-bold text-primary uppercase">
                  Dạng 1: Chọn từ trực tiếp trong câu
                </span>
                <h3 className="text-base font-black text-ink">
                  Exercise 9: Underline the subject and circle the verb
                </h3>
              </div>
              <Badge variant="info">Ex 9</Badge>
            </div>
            <p className="text-xs text-ink-muted">
              Hướng dẫn: Bấm 1 lần vào từ để gạch chân Chủ ngữ (S) — Bấm 2 lần để khoanh tròn Động từ (V) — Bấm lần 3 để hủy.
            </p>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-ink-muted mb-1 block">Câu 1:</span>
                <InlineWordSelector
                  sentence="Tofu has vegetable protein and vitamin B."
                  mode="subject_verb"
                />
              </div>

              <div>
                <span className="text-xs font-bold text-ink-muted mb-1 block">Câu 3:</span>
                <InlineWordSelector
                  sentence="You shouldn’t go to bed late."
                  mode="subject_verb"
                />
              </div>

              <div>
                <span className="text-xs font-bold text-ink-muted mb-1 block">Câu 5:</span>
                <InlineWordSelector
                  sentence="My brother does morning exercises every day."
                  mode="subject_verb"
                />
              </div>
            </div>
          </Card>

          {/* Exercise 10: Inline Word Selection (Object / Adverb Labeling) */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div>
                <span className="text-xs font-bold text-primary uppercase">
                  Dạng 2: Phân loại Object (O) vs Adverb (Adv)
                </span>
                <h3 className="text-base font-black text-ink">
                  Exercise 10: Are the underlined words/phrases objects or adverbs?
                </h3>
              </div>
              <Badge variant="warning">Ex 10</Badge>
            </div>
            <p className="text-xs text-ink-muted">
              Hướng dẫn: Nhấp chuột vào cụm từ được gạch chân để gán nhãn Tân ngữ (O) hoặc Trạng từ (Adv):
            </p>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-ink-muted mb-1 block">Câu 1:</span>
                <InlineWordSelector sentence="I read a book." mode="object_adverb" />
              </div>
              <div>
                <span className="text-xs font-bold text-ink-muted mb-1 block">Câu 2:</span>
                <InlineWordSelector sentence="We seldom go out." mode="object_adverb" />
              </div>
              <div>
                <span className="text-xs font-bold text-ink-muted mb-1 block">Câu 6:</span>
                <InlineWordSelector sentence="It was really hot last night." mode="object_adverb" />
              </div>
            </div>
          </Card>

          {/* Exercise 8: Word Bank Fill */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div>
                <span className="text-xs font-bold text-primary uppercase">
                  Dạng 3: Điền từ từ ngân hàng từ (Word Bank)
                </span>
                <h3 className="text-base font-black text-ink">
                  Exercise 8: Put one of the words in each blank
                </h3>
              </div>
              <Badge variant="info">Ex 8</Badge>
            </div>
            <p className="text-xs text-ink-muted">
              Hướng dẫn: Nhấp vào ô trống cần điền, sau đó bấm chọn từ tương ứng trong hộp Word Bank phía trên.
            </p>

            <WordBankFill
              bank={['soybeans', 'suncream', 'affects', 'early', 'for', 'tired']}
              questions={[
                { id: 'wb-1', prefix: 'Acne', suffix: 'about 70% of young people between 12 and 25.', correctWord: 'affects' },
                { id: 'wb-2', prefix: 'You should go to bed', suffix: 'and get enough sleep.', correctWord: 'early' },
                { id: 'wb-3', prefix: "I get sunburn because I don't use", suffix: '.', correctWord: 'suncream' },
                { id: 'wb-4', prefix: 'We need vitamin A', suffix: 'our eyes.', correctWord: 'for' },
                { id: 'wb-5', prefix: 'Tofu is a product from', suffix: '.', correctWord: 'soybeans' },
                { id: 'wb-6', prefix: 'If your eyes are', suffix: ', you can use eyedrops.', correctWord: 'tired' },
              ]}
            />
          </Card>

          {/* Exercise 31: True / False Table with X Mark */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div>
                <span className="text-xs font-bold text-primary uppercase">
                  Dạng 4: Bảng True/False giữ nguyên cấu trúc
                </span>
                <h3 className="text-base font-black text-ink">
                  Exercise 31: Listen and decide whether the sentences are True or False
                </h3>
              </div>
              <Badge variant="primary">Ex 31 (Bảng có dấu X)</Badge>
            </div>
            <p className="text-xs text-ink-muted">
              Hướng dẫn: Nhấp chuột vào cột T hoặc F tương ứng trên bảng để đặt dấu X.
            </p>

            <TrueFalseTable
              rows={[
                { id: 'tf-1', order: 1, statement: 'Good teeth help us look nice and chew well.', correctAnswer: 'T' },
                { id: 'tf-2', order: 2, statement: 'We ought to visit our dentist twice a month.', correctAnswer: 'F' },
                { id: 'tf-3', order: 3, statement: 'We should brush our teeth twice a day.', correctAnswer: 'T' },
                { id: 'tf-4', order: 4, statement: 'We should drink much water to keep our teeth healthy.', correctAnswer: 'F' },
              ]}
              initialValues={{ 'tf-1': 'T', 'tf-3': 'T' }}
            />
          </Card>

          {/* Exercise 5: Picture Multiple Choice */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div>
                <span className="text-xs font-bold text-primary uppercase">
                  Dạng 5: Nhìn hình ảnh nhúng chọn từ đúng
                </span>
                <h3 className="text-base font-black text-ink">
                  Exercise 5: Look at the pictures. Choose the most suitable words
                </h3>
              </div>
              <Badge variant="info">Ex 5 (15 ảnh nhúng)</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-line rounded-lg bg-gray-50/50 space-y-3">
                <div className="h-28 rounded-md bg-rose-50 border border-rose-200 flex flex-col items-center justify-center p-2 text-center">
                  <span className="text-2xl">👄</span>
                  <span className="text-xs font-bold text-rose-900 mt-1">[Ảnh 1: Môi khô nứt nẻ]</span>
                </div>
                <div className="text-xs font-bold text-ink">1. What condition is this?</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button className="p-2 border rounded bg-white hover:border-primary text-left">A. sunburn</button>
                  <button className="p-2 border rounded bg-white hover:border-primary text-left">B. dim light</button>
                  <button className="p-2 border rounded bg-white hover:border-primary text-left">C. headache</button>
                  <button className="p-2 border-2 border-primary bg-blue-50 font-bold text-primary text-left">
                    ✓ D. chapped lips
                  </button>
                </div>
              </div>

              <div className="p-4 border border-line rounded-lg bg-gray-50/50 space-y-3">
                <div className="h-28 rounded-md bg-amber-50 border border-amber-200 flex flex-col items-center justify-center p-2 text-center">
                  <span className="text-2xl">🧴</span>
                  <span className="text-xs font-bold text-amber-900 mt-1">[Ảnh 2: Tuýp kem chống nắng SPF 30]</span>
                </div>
                <div className="text-xs font-bold text-ink">2. What item is this?</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button className="p-2 border rounded bg-white hover:border-primary text-left">A. fever</button>
                  <button className="p-2 border rounded bg-white hover:border-primary text-left">B. toothache</button>
                  <button className="p-2 border-2 border-primary bg-blue-50 font-bold text-primary text-left">
                    ✓ C. suncream
                  </button>
                  <button className="p-2 border rounded bg-white hover:border-primary text-left">D. cough</button>
                </div>
              </div>
            </div>
          </Card>

          {/* Exercise 15: Ordering MCQ Preservation */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div>
                <span className="text-xs font-bold text-primary uppercase">
                  Dạng 6: Sắp xếp hội thoại (Bảo toàn định dạng trắc nghiệm A/B/C/D)
                </span>
                <h3 className="text-base font-black text-ink">
                  Exercise 15: Choose the correct answer (A, B, C, or D) to arrange the sentences
                </h3>
              </div>
              <Badge variant="success">Bảo toàn đề gốc</Badge>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-xs font-mono space-y-1.5 text-ink leading-relaxed">
              <div>a. Brian: Oh, you mean the man with the red car? Yes, he&apos;s obese.</div>
              <div>b. Ally: I hope he&apos;s healthy.</div>
              <div>c. Ally: I saw a new neighbor today. He looks quite big.</div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button className="p-2.5 border rounded bg-white hover:border-primary text-center font-bold">
                A. a-b-c
              </button>
              <button className="p-2.5 border-2 border-primary bg-blue-50 text-center font-bold text-primary">
                ✓ B. c-a-b
              </button>
              <button className="p-2.5 border rounded bg-white hover:border-primary text-center font-bold">
                C. b-c-a
              </button>
              <button className="p-2.5 border rounded bg-white hover:border-primary text-center font-bold">
                D. a-c-b
              </button>
            </div>
          </Card>

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-4 border-t border-line">
            <span className="text-xs text-ink-muted">
              Kết quả làm bài sẽ tự động cập nhật vào Hồ Sơ Năng Lực CEFR của bạn.
            </span>
            <Button
              size="lg"
              onClick={() => {
                setSubmittedPractice(true);
                alert('Tuyệt vời! Bạn đã hoàn thành các dạng bài tập thực hành mẫu trong Unit 2!');
              }}
              className="shadow-tactile"
            >
              Nộp bài thực hành <CheckCircle2 className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* TAB A: VOCABULARY LIST (41 ITEMS) */}
      {activeTab === 'vocab' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border-2 border-line rounded-lg">
            <div>
              <h3 className="font-black text-base text-ink">Kho 41 Từ & Cụm Từ Chủ Đề Unit 2</h3>
              <p className="text-xs text-ink-muted">
                Có đầy đủ loại từ, phiên âm IPA chuẩn quốc tế và nghĩa tiếng Việt.
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={handleAddAllVocab} className="text-xs">
              <BookmarkPlus className="w-3.5 h-3.5 mr-1" /> Thêm tất cả vào Flashcard ({addedVocabs.length}/41)
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {thematicPackUnit2.vocabulary.map((v) => {
              const isAdded = addedVocabs.includes(v.no);
              return (
                <div
                  key={v.no}
                  className="p-3.5 bg-white border border-line rounded-lg hover:border-primary/50 transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-gray-400">#{v.no}</span>
                      <span className="font-black text-sm text-ink">{v.word}</span>
                    </div>
                    <span className="text-xs text-gray-400 font-semibold">{v.type}</span>
                  </div>

                  <div className="font-mono text-xs text-primary font-bold">{v.ipa}</div>
                  <div className="text-xs text-ink-muted">{v.meaning}</div>

                  <div className="pt-2 border-t border-line/50 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => alert(`Phát âm: ${v.word}`)}
                      className="text-xs text-primary font-bold inline-flex items-center gap-1 hover:underline"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Nghe
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddVocabToFsrs(v.no)}
                      className={`text-xs px-2.5 py-1 rounded-pill font-bold transition-all ${
                        isAdded
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                          : 'bg-gray-100 hover:bg-blue-50 text-ink'
                      }`}
                    >
                      {isAdded ? '✓ Đã lưu vào tủ từ' : '+ Ôn tập'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB B: WORD FORM (8 FAMILIES) */}
      {activeTab === 'wordform' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-4 bg-white border-2 border-line rounded-lg">
            <h3 className="font-black text-base text-ink">Bảng 8 Họ Từ Phái Sinh (Word Form)</h3>
            <p className="text-xs text-ink-muted">
              Học cách chuyển đổi danh từ, tính từ, trạng từ và động từ theo ngữ cảnh câu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {thematicPackUnit2.wordForms.map((wf, idx) => (
              <div key={idx} className="p-4 bg-white border-2 border-line rounded-lg space-y-3">
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className="font-black text-base text-primary-dark">{wf.root}</span>
                  <Badge variant="info">{wf.meaning}</Badge>
                </div>

                <div className="space-y-1.5 text-xs">
                  {wf.derivatives.map((d, dIdx) => (
                    <div key={dIdx} className="p-2 rounded bg-gray-50 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-ink">{d.form}</span>{' '}
                        <span className="text-gray-400 font-semibold">{d.type}</span>
                      </div>
                      <span className="text-ink-muted">{d.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB C: GRAMMAR THEORY */}
      {activeTab === 'grammar' && (
        <div className="space-y-6 animate-in fade-in">
          <Card className="p-6 space-y-4">
            <h3 className="font-black text-lg text-ink">{thematicPackUnit2.grammar.title}</h3>
            <p className="text-sm text-ink-muted leading-relaxed">
              {thematicPackUnit2.grammar.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-line">
              {thematicPackUnit2.grammar.patterns.map((p, idx) => (
                <div key={idx} className="p-4 bg-emerald-50/40 border-2 border-emerald-200 rounded-lg space-y-1.5">
                  <div className="font-mono font-black text-emerald-900 text-sm">{p.pattern}</div>
                  <div className="text-xs text-ink-muted italic font-medium">Ví dụ: {p.example}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

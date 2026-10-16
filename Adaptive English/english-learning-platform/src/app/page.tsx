"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Mascot } from "@/components/ui/Mascot";
import { CheckCircle2, ArrowRight, Volume2, RotateCcw, Users, Clock, Sparkles } from "lucide-react";

export default function LandingPage() {
  const [vocabFlipped, setVocabFlipped] = useState(false);

  const skills = [
    {
      title: "Listening",
      desc: "Nghe hiểu bối cảnh, hội thoại học thuật và phản xạ nhanh.",
      icon: "/assets/icons/listening.svg",
      href: "/student/learn?skill=listening",
    },
    {
      title: "Reading",
      desc: "Đọc lướt tìm ý, phân tích đoạn văn và tư duy logic.",
      icon: "/assets/icons/reading.svg",
      href: "/student/learn?skill=reading",
    },
    {
      title: "Writing",
      desc: "Phát triển luận điểm, cấu trúc đoạn văn với AI cố vấn.",
      icon: "/assets/icons/writing.svg",
      href: "/student/learn?skill=writing",
    },
    {
      title: "Speaking",
      desc: "Luyện phát âm, ngữ điệu tự nhiên và tự tin giao tiếp.",
      icon: "/assets/icons/speaking.svg",
      href: "/student/learn?skill=speaking",
    },
  ];

  return (
    <main className="flex-1 overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-8 pb-16 md:pt-16 md:pb-24 px-4 md:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-[#EAF2FF] text-primary-dark text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Học theo tốc độ của riêng bạn
            </span>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-ink tracking-tight leading-[1.08]">
              Small steps.<br />
              <span className="text-primary">Real progress.</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-ink-muted max-w-xl leading-relaxed">
              Học tiếng Anh có chủ đích. Tự do luyện từng kỹ năng, mở rộng vốn từ ghi nhớ dài hạn và nhận hỗ trợ khi bạn cần.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/student/onboarding">
                <Button size="lg" className="w-full sm:w-auto shadow-tactile">
                  Bắt đầu học ngay
                </Button>
              </Link>
              <Link href="/student/placement-test">
                <Button variant="ghost" size="lg" className="flex items-center gap-1.5 font-bold">
                  Làm bài test đầu vào <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-ink-muted pt-2">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              <span>Đánh giá khởi điểm nhanh giúp định vị chính xác trình độ CEFR của bạn.</span>
            </div>
          </div>

          {/* Right Mascot Hero with Organic Cloud Backdrop */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Organic Soft Cloud / Wave Backdrop */}
            <div className="absolute w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] rounded-full bg-gradient-to-br from-[#EAF2FF] via-[#F0F5FF] to-transparent -z-10 blur-xl scale-110" />

            {/* Badges floating */}
            <div className="absolute top-2 left-0 sm:left-4 bg-white/90 backdrop-blur-sm border border-line rounded-pill px-3 py-1.5 shadow-soft flex items-center gap-2 text-xs font-bold text-ink animate-bounce" style={{ animationDuration: "4s" }}>
              <Clock className="w-3.5 h-3.5 text-primary" /> Tốc độ của bạn
            </div>

            <div className="absolute top-12 right-0 sm:-right-2 bg-white/90 backdrop-blur-sm border border-line rounded-pill px-3 py-1.5 shadow-soft flex items-center gap-2 text-xs font-bold text-ink">
              <span className="w-2 h-2 rounded-full bg-success" /> Tự chọn kỹ năng
            </div>

            <div className="absolute bottom-6 right-2 sm:right-6 bg-white/90 backdrop-blur-sm border border-line rounded-pill px-3 py-1.5 shadow-soft flex items-center gap-2 text-xs font-bold text-ink">
              <span className="w-2 h-2 rounded-full bg-primary" /> Bước tiếp theo
            </div>

            {/* Mascot Center */}
            <div className="p-4 flex items-center justify-center">
              <Mascot mood="hello" size="hero" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. 4 SKILLS GRID */}
      <section className="py-12 px-4 md:px-6 bg-white border-y border-line">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {skills.map((skill) => (
              <Link
                key={skill.title}
                href={skill.href}
                className="group p-5 md:p-6 rounded-md bg-[#F8FAFF] border-2 border-line/70 hover:border-primary hover:bg-[#F0F5FF] transition-all text-center flex flex-col items-center justify-center space-y-3"
              >
                <div className="w-14 h-14 rounded-full bg-white border border-line flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <img src={skill.icon} alt={skill.title} className="w-7 h-7" />
                </div>
                <h3 className="font-extrabold text-base md:text-lg text-ink group-hover:text-primary transition-colors">
                  {skill.title}
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed line-clamp-2">
                  {skill.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. VALUE PROPOSITIONS: VOCABULARY & CLASSROOM */}
      <section className="py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl md:text-4xl font-black text-ink tracking-tight">
              A little practice. A lasting habit.
            </h2>
            <p className="text-ink-muted text-sm md:text-base leading-relaxed">
              Xây dựng năng lực thực thụ qua các bài luyện nhỏ gọn, tập trung — thiết kế riêng cho nhịp sống hằng ngày của bạn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Card 1: Words that stay (Vocabulary & Anki FSRS) */}
            <div className="p-8 rounded-lg bg-white border-2 border-line flex flex-col justify-between shadow-soft">
              <div className="space-y-6">
                {/* Flashcard interactive preview */}
                <div
                  onClick={() => setVocabFlipped(!vocabFlipped)}
                  className="cursor-pointer bg-[#F8FAFF] border-2 border-line hover:border-primary rounded-md p-6 text-center space-y-3 transition-all min-h-[160px] flex flex-col justify-center items-center shadow-sm relative group"
                >
                  <button
                    type="button"
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-white text-ink-muted hover:text-primary border border-line"
                    title="Lật thẻ"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-ink">curious</span>
                    <Volume2 className="w-4 h-4 text-primary" />
                  </div>

                  {vocabFlipped ? (
                    <div className="space-y-1 animate-in fade-in">
                      <p className="text-xs font-semibold text-primary">/ˈkjʊə.ri.əs/ · adj</p>
                      <p className="text-sm font-medium text-ink">Muốn học hỏi hoặc biết thêm nhiều điều mới.</p>
                      <p className="text-xs text-ink-muted italic">"She is very curious about artificial intelligence."</p>
                    </div>
                  ) : (
                    <p className="text-xs text-ink-muted">
                      Chạm vào thẻ để lật xem định nghĩa và phát âm...
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-ink">Từ vựng nhớ lâu</h3>
                  <p className="text-xs md:text-sm text-ink-muted leading-relaxed">
                    Ôn lại đúng thời điểm giúp bạn ghi nhớ dài hạn, không lo quên từ cũ khi học từ mới.
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <Link href="/student/vocabulary">
                  <Button variant="outline" size="sm" className="w-full">
                    Xem tủ từ vựng cá nhân →
                  </Button>
                </Link>
              </div>
            </div>

            {/* Card 2: Classroom & Teacher feedback */}
            <div className="p-8 rounded-lg bg-white border-2 border-line flex flex-col justify-between shadow-soft">
              <div className="space-y-6">
                {/* Classroom mock preview */}
                <div className="bg-[#F8FAFF] border-2 border-line rounded-md p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-ink flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" /> Lớp IELTS Target 6.5
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-warning-soft text-warning font-bold">
                      Còn 2 ngày
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-sm border border-line space-y-1.5">
                    <span className="text-xs font-bold text-ink block">Writing Task 2: Online Education</span>
                    <p className="text-[11px] text-ink-muted line-clamp-1">Bài luận 250 từ · Thầy Vũ Hoàng giao bài</p>
                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[10px] text-primary font-bold">AI Pre-grade có sẵn</span>
                      <span className="text-[11px] font-bold text-primary underline">Làm bài ngay</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-ink">Học cùng Lớp học & Giáo viên</h3>
                  <p className="text-xs md:text-sm text-ink-muted leading-relaxed">
                    Tham gia lớp bằng mã mời, nộp bài viết/nói theo hạn chót, và nhận phản hồi chi tiết từ giáo viên kết hợp trợ lý AI.
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <Link href="/student/classroom">
                  <Button variant="outline" size="sm" className="w-full">
                    Vào không gian lớp học →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION BANNER */}
      <section className="py-12 px-4 md:px-6">
        <div className="max-w-6xl mx-auto rounded-lg bg-[#EAF2FF] border border-primary/20 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
          <div className="flex items-center gap-6">
            <Mascot mood="idle" size="inline" className="shrink-0 hidden sm:block" />
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-2xl md:text-4xl font-black text-ink tracking-tight">
                Your next chapter starts here.
              </h2>
              <p className="text-ink-muted text-sm md:text-base max-w-md">
                Bắt đầu buổi học thích ứng đầu tiên của bạn ngay hôm nay. Hoàn toàn miễn phí trên trình duyệt.
              </p>
            </div>
          </div>

          <Link href="/student/onboarding">
            <Button size="lg" className="shadow-tactile shrink-0">
              Bắt đầu ngay bây giờ
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}

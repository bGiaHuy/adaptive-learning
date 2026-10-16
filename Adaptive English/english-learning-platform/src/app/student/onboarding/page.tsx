"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Mascot } from "@/components/ui/Mascot";
import { Check, ArrowRight, ShieldCheck } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [targetLevel, setTargetLevel] = useState<string>("B1");

  const levels = [
    { id: "A2", name: "A2 — Sơ cấp nâng cao", desc: "Hiểu câu giao tiếp đơn giản và văn bản ngắn quen thuộc." },
    { id: "B1", name: "B1 — Trung cấp", desc: "Xử lý tình huống giao tiếp và đọc hiểu ý chính học thuật." },
    { id: "B2", name: "B2 — Trung cấp trên", desc: "Giao tiếp trôi chảy và viết luận lập luận rõ ràng." },
    { id: "C1", name: "C1 — Cao cấp", desc: "Sử dụng ngôn ngữ linh hoạt cho mục đích học thuật chuyên sâu." },
  ];

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      router.push("/student/placement-test");
    }
  };

  const handleSkipGoal = () => {
    setStep(3);
  };

  return (
    <main className="flex-1 flex flex-col justify-between max-w-2xl mx-auto w-full px-4 md:px-6 py-8 md:py-12">
      {/* Top Header: Pagination Pill Indicator + Skip Pill */}
      <div className="flex items-center justify-between">
        {/* Pagination Dots */}
        <div className="flex items-center gap-1.5" aria-label={`Bước ${step} trên 3`}>
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step ? "w-8 bg-primary" : "w-2 bg-line"
              }`}
            />
          ))}
        </div>

        {step === 2 && (
          <button
            type="button"
            onClick={handleSkipGoal}
            className="text-xs font-bold text-ink-muted hover:text-primary px-3 py-1 rounded-pill bg-[#EFF6FF] border border-primary/20 transition-colors"
          >
            Bỏ qua mục tiêu
          </button>
        )}
      </div>

      {/* Step Content with Mascot in center */}
      <div className="py-8 my-auto space-y-8">
        {/* Step 1: Welcome & Philosophy */}
        {step === 1 && (
          <div className="text-center space-y-6 animate-in fade-in">
            <div className="relative py-4 flex justify-center">
              <div className="absolute w-44 h-44 rounded-full bg-[#EAF2FF] -z-10 blur-xl" />
              <Mascot mood="hello" size="summary" speechText="Chào cậu! Mình là chú ếch đồng hành học tiếng Anh cùng cậu!" />
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl md:text-5xl font-black text-ink tracking-tight">
                Học có chủ đích.<br />Tiến bộ từng ngày.
              </h1>
              <p className="text-sm md:text-base text-ink-muted max-w-md mx-auto leading-relaxed">
                Adaptive study không ép bạn theo một khuôn mẫu cứng nhắc. Bạn luôn có quyền tự chọn kỹ năng mình muốn trau dồi.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Choose Target Goal */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-black text-ink tracking-tight">
                Mục tiêu năng lực của bạn
              </h2>
              <p className="text-xs md:text-sm text-ink-muted">
                Hệ thống sẽ gợi ý độ khó bài học phù hợp với kỳ vọng này (Bạn có thể đổi lại bất cứ lúc nào).
              </p>
            </div>

            <div className="space-y-3">
              {levels.map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setTargetLevel(lvl.id)}
                  className={`w-full p-4 rounded-md border-2 text-left flex items-center justify-between transition-all ${
                    targetLevel === lvl.id
                      ? "bg-[#EDF4FF] border-primary text-primary-dark font-bold shadow-sm"
                      : "bg-white border-line text-ink hover:border-primary/50"
                  }`}
                >
                  <div>
                    <h3 className="font-extrabold text-sm md:text-base">{lvl.name}</h3>
                    <p className="text-xs text-ink-muted">{lvl.desc}</p>
                  </div>
                  {targetLevel === lvl.id && (
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Mandatory Placement Test Notice */}
        {step === 3 && (
          <div className="text-center space-y-6 animate-in fade-in">
            <div className="relative py-2 flex justify-center">
              <Mascot mood="explaining" size="summary" speechText="Trước tiên, hãy làm một bài test ngắn để định vị điểm xuất phát nhé!" />
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl md:text-4xl font-black text-ink tracking-tight">
                Bài Đánh Giá Đầu Vào Bắt Buộc
              </h2>
              <p className="text-xs md:text-sm text-ink-muted max-w-md mx-auto leading-relaxed">
                Bài kiểm tra gồm 3 phần, mỗi phần 10 câu (tổng 30 câu, khoảng 20–30 phút), giúp hệ thống ước lượng năng lực CEFR ban đầu cho bạn. Tiến trình được lưu để bạn có thể nghỉ và làm tiếp.
              </p>
            </div>

            <div className="p-4 bg-[#F0F5FF] border border-primary/20 rounded-md text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex items-center gap-2 font-bold text-primary-dark">
                <ShieldCheck className="w-4 h-4 text-primary" /> Cơ chế lưu tự động:
              </div>
              <p className="text-ink-muted">
                Nếu bị gián đoạn, mất mạng hoặc đóng trình duyệt, hệ thống sẽ lưu tiến trình từng phần và cho phép bạn làm tiếp khi quay lại.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Area */}
      <div className="pt-6 border-t border-line flex items-center justify-between">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="text-xs md:text-sm font-bold text-ink-muted hover:text-ink px-4 py-2"
          >
            Quay lại
          </button>
        ) : (
          <Link href="/" className="text-xs md:text-sm font-bold text-ink-muted hover:text-ink px-4 py-2">
            Về trang chủ
          </Link>
        )}

        <Button size="lg" onClick={handleNext} className="shadow-tactile">
          {step === 3 ? "Bắt đầu làm bài Test ngay" : "Tiếp tục"} <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </div>
    </main>
  );
}

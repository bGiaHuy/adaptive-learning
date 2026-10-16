"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Award, ArrowRight, CheckCircle2, Clock } from "lucide-react";

export default function TeacherGradingListPage() {
  const { submissions: storeSubmissions } = useApp();
  const [apiSubmissions, setApiSubmissions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/submissions')
      .then((res) => (res.ok ? res.json() : { submissions: [] }))
      .then((data) => {
        if (data.submissions && data.submissions.length > 0) {
          setApiSubmissions(data.submissions);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const submissions = apiSubmissions.length > 0 ? apiSubmissions : storeSubmissions;

  return (
    <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-8 md:py-10 space-y-8">
      <div className="border-b border-line pb-4">
        <h1 className="text-3xl font-black text-ink tracking-tight flex items-center gap-2.5">
          <Award className="w-7 h-7 text-primary" /> Bàn Chấm Bài & Trả Feedback
        </h1>
        <p className="text-xs md:text-sm text-ink-muted">
          Chấm điểm bài làm của học sinh kết hợp trợ lý AI Pre-grade hỗ trợ đọc trước.
        </p>
      </div>

      <div className="space-y-4">
        {submissions.filter(sub => !['draft', 'in_progress'].includes(sub.status)).map((sub) => {
          const isPending = sub.status !== "graded";
          return (
            <div
              key={sub.id}
              className="bg-white border-2 border-line hover:border-primary/60 rounded-md p-6 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-ink text-sm flex items-center gap-1.5">
                    Học viên: <strong>{sub.studentName}</strong>
                  </span>
                  <span className="text-xs text-ink-muted font-mono">• Nộp lúc: {sub.submittedAt}</span>
                  <span className="text-xs text-ink-muted">• Bản đề: V{sub.versionId}</span>
                </div>

                <h3 className="font-black text-base text-ink">{sub.assignmentTitle}</h3>

                <p className="text-xs text-ink-muted line-clamp-1 italic">
                  "{sub.content}"
                </p>

                <div className="flex items-center gap-4 text-xs pt-1">
                  {isPending ? (
                    <span className="text-error font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {sub.status === 'pending_release' ? 'Đã chấm · Chờ công bố' : 'Chờ giáo viên chấm điểm'}
                    </span>
                  ) : (
                    <span className="text-success font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Đã trả điểm: {sub.teacherScore}/{sub.maxScore}
                    </span>
                  )}

                  {sub.aiDraftGrade && (
                    <span className="text-primary font-semibold text-[11px]">
                      AI Pre-grade: {sub.aiDraftGrade.estimatedBand}
                    </span>
                  )}
                </div>
              </div>

              <Link href={`/teacher/grading/${sub.id}`}>
                <Button variant={isPending ? "primary" : "secondary"} size="sm" className="shadow-sm">
                  {isPending ? "Chấm bài ngay" : "Xem / Sửa điểm"} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          );
        })}
      </div>
    </main>
  );
}

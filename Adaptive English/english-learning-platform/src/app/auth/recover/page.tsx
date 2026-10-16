"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, CheckCircle2, Mail, AlertCircle, Loader2 } from "lucide-react";

export default function RecoverPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [testLink, setTestLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại sau.");
        setLoading(false);
        return;
      }

      setSent(true);
      if (data.testResetLink) {
        setTestLink(data.testResetLink);
      }
    } catch {
      setErrorMessage("Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền mạng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 md:px-6">
      <div className="max-w-md w-full bg-white border-2 border-line rounded-lg p-6 md:p-8 shadow-soft space-y-6">
        <div className="space-y-2 text-center">
          <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-muted hover:text-primary mb-2 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại đăng nhập
          </Link>
          <h1 className="text-2xl md:text-3xl font-black text-ink tracking-tight">Khôi Phục Mật Khẩu</h1>
          <p className="text-xs md:text-sm text-ink-muted leading-relaxed">
            Nhập địa chỉ email tài khoản của bạn để nhận liên kết đặt lại mật khẩu an toàn.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-critical-soft border border-critical/30 rounded-md flex items-start gap-2 text-xs text-critical">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {sent ? (
          <div className="p-5 bg-success-soft rounded-md border border-success/30 text-center space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-success text-white flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-sm text-[#185932]">Đã tiếp nhận yêu cầu khôi phục</h4>
            <p className="text-xs text-ink-muted leading-relaxed">
              Nếu địa chỉ <strong>{email}</strong> tồn tại trong hệ thống, chúng tôi đã tạo liên kết khôi phục có hiệu lực trong 30 phút. Vui lòng kiểm tra hòm thư của bạn.
            </p>


            <Link href="/auth/login" className="block pt-2">
              <Button size="md" className="w-full">
                Quay lại đăng nhập
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="recover-email" className="text-xs font-bold text-ink flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-ink-muted" /> Địa chỉ Email
              </label>
              <input
                id="recover-email"
                type="email"
                required
                disabled={loading}
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-sm border-2 border-line text-sm text-ink focus:border-primary focus:outline-none transition-colors disabled:bg-surface-soft disabled:cursor-not-allowed"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading || !email.trim()}
              className="w-full shadow-tactile flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Gửi liên kết khôi phục"
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

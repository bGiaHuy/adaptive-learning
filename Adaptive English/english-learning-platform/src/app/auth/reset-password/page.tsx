"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Lock, CheckCircle2, AlertCircle, Loader2, KeyRound } from "lucide-react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!token) {
      setErrorMessage("Liên kết đặt lại mật khẩu không hợp lệ hoặc thiếu mã xác thực (token).");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Xác nhận mật khẩu mới không khớp.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Không thể đặt lại mật khẩu. Vui lòng thử lại.");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setErrorMessage("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền mạng.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex-1 flex items-center justify-center py-12 px-4 md:px-6">
        <div className="max-w-md w-full bg-white border-2 border-line rounded-lg p-6 md:p-8 shadow-soft space-y-6 text-center">
          <div className="w-12 h-12 rounded-full bg-critical-soft text-critical flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-ink">Thiếu Mã Xác Thực</h1>
          <p className="text-xs md:text-sm text-ink-muted leading-relaxed">
            Liên kết đặt lại mật khẩu không hợp lệ hoặc đã bị cắt ngắn. Vui lòng yêu cầu lại liên kết mới từ trang khôi phục.
          </p>
          <Link href="/auth/recover" className="block pt-2">
            <Button size="md" className="w-full">
              Yêu cầu liên kết mới
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 md:px-6">
      <div className="max-w-md w-full bg-white border-2 border-line rounded-lg p-6 md:p-8 shadow-soft space-y-6">
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-ink tracking-tight">Đặt Lại Mật Khẩu</h1>
          <p className="text-xs md:text-sm text-ink-muted leading-relaxed">
            Nhập mật khẩu mới của bạn (tối thiểu 8 ký tự). Tất cả các phiên đăng nhập cũ sẽ tự động được thu hồi vì lý do bảo mật.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-critical-soft border border-critical/30 rounded-md flex items-start gap-2 text-xs text-critical">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {success ? (
          <div className="p-5 bg-success-soft rounded-md border border-success/30 text-center space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-success text-white flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-sm text-[#185932]">Đổi mật khẩu thành công!</h4>
            <p className="text-xs text-ink-muted leading-relaxed">
              Mật khẩu của bạn đã được cập nhật thành công. Mọi phiên đăng nhập cũ trên các thiết bị khác đã được thu hồi.
            </p>
            <Link href="/auth/login" className="block pt-2">
              <Button size="md" className="w-full shadow-tactile">
                Đăng nhập ngay
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="new-password" className="text-xs font-bold text-ink flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-ink-muted" /> Mật khẩu mới
              </label>
              <input
                id="new-password"
                type="password"
                required
                disabled={loading}
                placeholder="Tối thiểu 8 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-sm border-2 border-line text-sm text-ink focus:border-primary focus:outline-none transition-colors disabled:bg-surface-soft disabled:cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirm-new-password" className="text-xs font-bold text-ink flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-ink-muted" /> Xác nhận mật khẩu mới
              </label>
              <input
                id="confirm-new-password"
                type="password"
                required
                disabled={loading}
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-sm border-2 border-line text-sm text-ink focus:border-primary focus:outline-none transition-colors disabled:bg-surface-soft disabled:cursor-not-allowed"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading || !password || !confirmPassword}
              className="w-full shadow-tactile flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang cập nhật mật khẩu...
                </>
              ) : (
                "Xác nhận mật khẩu mới"
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}

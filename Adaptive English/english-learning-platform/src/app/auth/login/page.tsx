"use client";

import { GoogleSignIn } from "@/components/ui/GoogleSignIn";
import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { UserRole } from "@/types";
import { ArrowLeft, KeyRound, Mail, Sparkles } from "lucide-react";

export default function LoginPage() {
  const { setRole } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [registerHref, setRegisterHref] = useState('/auth/register');
  React.useEffect(() => {
    const returnTo = new URLSearchParams(window.location.search).get('redirect');
    if (returnTo?.startsWith('/student/') && !returnTo.includes('\\')) {
      setRegisterHref(`/auth/register?${new URLSearchParams({ redirect: returnTo })}`);
    }
  }, []);

  const showDemoSwitcher =
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_ENABLE_ROLE_SWITCHER === "true";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Đăng nhập không thành công');
      }
      setRole(data.user.role);
      const returnTo = new URLSearchParams(window.location.search).get('redirect');
      if (data.user.role === 'student' && returnTo?.startsWith('/student/') && !returnTo.includes('\\')) {
        window.location.assign(returnTo);
        return;
      }
      // Fetch a fresh authenticated document instead of reusing a prefetched guest layout.
      if (data.user.role === 'teacher') window.location.assign('/teacher/dashboard');
      else if (data.user.role === 'admin') window.location.assign('/admin');
      else window.location.assign('/student/home');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (selectedRole: UserRole) => {
    setRole(selectedRole);
    try {
      await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      });
    } catch (e) {
      console.error(e);
    }
    if (selectedRole === "teacher") {
      window.location.assign("/teacher/dashboard");
    } else if (selectedRole === "admin") {
      window.location.assign("/admin");
    } else {
      window.location.assign("/student/home");
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 md:px-6">
      <div className="max-w-md w-full bg-white border-2 border-line rounded-lg p-6 md:p-8 shadow-soft space-y-6">
        <div className="space-y-2 text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-muted hover:text-primary mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại trang chủ
          </Link>
          <h1 className="text-2xl md:text-3xl font-black text-ink tracking-tight">Đăng Nhập</h1>
          <p className="text-xs md:text-sm text-ink-muted">Truy cập hồ sơ học tập và lớp học của bạn</p>
        </div>

        {/* Quick Demo Switcher */}
        {showDemoSwitcher && (
          <div className="p-3.5 bg-[#F0F5FF] rounded-md border border-primary/20 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary-dark">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Đăng nhập nhanh cho Demo:
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("student")}
                className="py-1.5 px-2 bg-white hover:bg-primary hover:text-white border border-line rounded-sm text-xs font-bold text-ink transition-colors"
              >
                Học Sinh
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("teacher")}
                className="py-1.5 px-2 bg-white hover:bg-primary hover:text-white border border-line rounded-sm text-xs font-bold text-ink transition-colors"
              >
                Giáo Viên
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("admin")}
                className="py-1.5 px-2 bg-white hover:bg-primary hover:text-white border border-line rounded-sm text-xs font-bold text-ink transition-colors"
              >
                Admin
              </button>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 font-bold">
            ⚠️ {errorMsg}
          </div>
        )}

        <GoogleSignIn />

        {/* Standard Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-ink flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-ink-muted" /> Địa chỉ Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-sm border-2 border-line text-sm text-ink focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-ink-muted" /> Mật khẩu
              </label>
              <Link href="/auth/recover" className="text-xs font-bold text-primary hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-sm border-2 border-line text-sm text-ink focus:border-primary focus:outline-none"
            />
          </div>

          <Button type="submit" size="lg" className="w-full shadow-tactile" isLoading={loading}>
            Đăng Nhập
          </Button>
        </form>

        <div className="text-center pt-2 text-xs text-ink-muted border-t border-line">
          Chưa có tài khoản?{" "}
          <Link href={registerHref} className="font-bold text-primary hover:underline">
            Đăng ký tài khoản mới
          </Link>
        </div>
      </div>
    </div>
  );
}

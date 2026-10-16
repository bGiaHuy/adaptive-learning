"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, GraduationCap, UserCheck } from "lucide-react";

export default function RegisterPage() {
  const { setRole } = useApp();
  const [selectedRole, setSelectedRole] = useState<"student" | "teacher">("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loginHref, setLoginHref] = useState('/auth/login');
  React.useEffect(() => {
    const returnTo = new URLSearchParams(window.location.search).get('redirect');
    if (returnTo?.startsWith('/student/') && !returnTo.includes('\\')) {
      setLoginHref(`/auth/login?${new URLSearchParams({ redirect: returnTo })}`);
    }
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
      setErrorMsg('Email xác nhận không khớp. Vui lòng kiểm tra lại.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role: selectedRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Đăng ký không thành công');
      }
      setRole(selectedRole);
      const returnTo = new URLSearchParams(window.location.search).get('redirect');
      if (selectedRole === 'student' && returnTo?.startsWith('/student/') && !returnTo.includes('\\')) {
        window.location.assign(returnTo);
        return;
      }
      if (selectedRole === 'teacher') {
        window.location.assign('/teacher/dashboard');
      } else {
        window.location.assign('/student/onboarding');
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 md:px-6">
      <div className="max-w-md w-full bg-white border-2 border-line rounded-lg p-6 md:p-8 shadow-soft space-y-6">
        <div className="space-y-2 text-center">
          <Link href={loginHref} className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-muted hover:text-primary mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Đã có tài khoản? Đăng nhập
          </Link>
          <h1 className="text-2xl md:text-3xl font-black text-ink tracking-tight">Tạo Tài Khoản</h1>
          <p className="text-xs md:text-sm text-ink-muted">Chọn vai trò chính để bắt đầu trải nghiệm</p>
        </div>

        {/* Role Selector Card */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-ink block">Bạn tham gia với tư cách là:</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedRole("student")}
              className={`p-4 rounded-md border-2 text-center flex flex-col items-center gap-2 transition-all ${
                selectedRole === "student"
                  ? "bg-[#EDF4FF] border-primary text-primary-dark font-black shadow-sm"
                  : "bg-white border-line text-ink-muted hover:border-primary/50"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedRole === "student" ? "bg-primary text-white" : "bg-line/60"}`}>
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-sm">Học Sinh</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole("teacher")}
              className={`p-4 rounded-md border-2 text-center flex flex-col items-center gap-2 transition-all ${
                selectedRole === "teacher"
                  ? "bg-[#EDF4FF] border-primary text-primary-dark font-black shadow-sm"
                  : "bg-white border-line text-ink-muted hover:border-primary/50"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedRole === "teacher" ? "bg-primary text-white" : "bg-line/60"}`}>
                <UserCheck className="w-5 h-5" />
              </div>
              <span className="text-sm">Giáo Viên</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 font-bold">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-ink">Họ và Tên</label>
            <input
              type="text"
              required
              placeholder="Nguyễn Văn A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-sm border-2 border-line text-sm text-ink focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="register-email" className="text-xs font-bold text-ink">Email đăng ký</label>
            <input
              id="register-email"
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-sm border-2 border-line text-sm text-ink focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="register-confirm-email" className="text-xs font-bold text-ink">Nhập lại email</label>
            <input
              id="register-confirm-email"
              type="email"
              required
              autoComplete="off"
              placeholder="Nhập lại email đăng ký"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-sm border-2 border-line text-sm text-ink focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-ink">Mật khẩu</label>
            <input
              type="password"
              required
              minLength={8}
              placeholder="Tối thiểu 8 ký tự"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-sm border-2 border-line text-sm text-ink focus:border-primary focus:outline-none"
            />
          </div>

          <Button type="submit" size="lg" className="w-full shadow-tactile" isLoading={loading}>
            Tiếp tục
          </Button>
        </form>
      </div>
    </div>
  );
}

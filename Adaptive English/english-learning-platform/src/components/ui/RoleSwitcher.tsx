"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useApp } from "@/lib/store";
import { UserRole } from "@/types";
import { UserCheck, Shield, GraduationCap, RotateCcw, Eye } from "lucide-react";

export function RoleSwitcher() {
  const isEnabled =
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_ENABLE_ROLE_SWITCHER === "true";

  if (!isEnabled) {
    return null;
  }

  const router = useRouter();
  const pathname = usePathname();
  const { role, setRole, reducedMotion, setReducedMotion } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);

  const roles: { id: UserRole; label: string; icon: React.ReactNode }[] = [
    { id: "student", label: "Student", icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { id: "teacher", label: "Teacher", icon: <UserCheck className="w-3.5 h-3.5" /> },
    { id: "admin", label: "Admin", icon: <Shield className="w-3.5 h-3.5" /> },
  ];

  const handleResetData = () => {
    if (confirm("Đặt lại toàn bộ dữ liệu demo về trạng thái ban đầu?")) {
      try {
        Object.keys(localStorage).filter(key => key.startsWith("adaptive_study_")).forEach(key => localStorage.removeItem(key));
        window.location.reload();
      } catch {}
    }
  };

  return (
    <aside
      aria-label="Công cụ chuyển đổi vai trò Demo"
      className="bg-[#122044] text-white text-xs px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-[#2456AE] relative z-30 shadow-md"
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 font-bold text-[#8BD46D] uppercase tracking-wider text-[11px]">
          <Eye className="w-3.5 h-3.5" /> PROTOTYPE PREVIEW:
        </span>
        <span className="hidden sm:inline text-white/70 text-[11px]">
          Tài khoản mẫu (mỗi tài khoản một vai trò):
        </span>

        <div className="inline-flex rounded-pill bg-[#1E3360] p-0.5 border border-[#3478F6]/40">
          {roles.map((r) => {
            const isActive = pathname.startsWith(`/${r.id}`) || (!/^\/(student|teacher|admin)/.test(pathname) && role === r.id);
            return (
              <button
                key={r.id}
                type="button"
                onClick={async () => {
                  setRole(r.id);
                  try {
                    await fetch('/api/auth/switch-role', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ role: r.id }),
                    });
                  } catch (e) {
                    console.error('Failed to sync role cookie', e);
                  }
                  router.push(r.id === "student" ? "/student/home" : r.id === "teacher" ? "/teacher/dashboard" : "/admin");
                }}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-pill font-bold transition-all ${
                  isActive
                    ? "bg-[#3478F6] text-white shadow-sm"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {r.icon}
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Reduced motion toggle */}
        <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-white/80 hover:text-white">
          <input
            type="checkbox"
            checked={reducedMotion}
            onChange={(e) => setReducedMotion(e.target.checked)}
            className="rounded border-[#3478F6] text-primary focus:ring-0"
          />
          <span>Giảm chuyển động</span>
        </label>

        {/* Reset mock data button */}
        <button
          type="button"
          onClick={handleResetData}
          title="Reset toàn bộ mock state"
          className="text-[11px] text-white/60 hover:text-error-soft flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>
    </aside>
  );
}

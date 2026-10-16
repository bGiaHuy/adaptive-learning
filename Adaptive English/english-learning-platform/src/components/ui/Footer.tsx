"use client";
import { usePathname } from "next/navigation";
import React from "react";
import Link from "next/link";

export function Footer() {
  const path = usePathname();
  if (path.includes("/workspace/") || /^\/student\/learn\/[^/]+\/[^/]+/.test(path) || path === "/student/placement-test" || path.endsWith("/flashcard")) return null;
  return (
    <footer className="bg-white border-t border-line mt-20 py-10 px-4 md:px-6 text-ink-muted text-xs">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <img
            src="/assets/mascot/avatar.svg"
            alt="Adaptive study avatar"
            className="w-7 h-7 rounded-full bg-[#EAF2FF]"
          />
          <div>
            <span className="font-extrabold text-sm text-ink block">Adaptive study</span>
            <span className="text-[11px]">Nền tảng học tiếng Anh thích ứng thông minh</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 font-medium">
          <Link href="/student/learn" className="hover:text-primary transition-colors">
            Khóa học
          </Link>
          <Link href="/student/vocabulary" className="hover:text-primary transition-colors">
            Tủ từ vựng
          </Link>
          <Link href="/student/classroom" className="hover:text-primary transition-colors">
            Lớp học
          </Link>
          <Link href="/auth/login" className="hover:text-primary transition-colors">
            Đăng nhập
          </Link>
        </div>

        <div className="text-center md:text-right text-[11px] text-ink-muted/80">
          <p>© 2026 Adaptive study</p>
        </div>
      </div>
    </footer>
  );
}

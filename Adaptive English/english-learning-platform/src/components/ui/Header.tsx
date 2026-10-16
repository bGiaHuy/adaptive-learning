"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { Button } from "./Button";
import { ArrowRight, Bell, BookOpen, Check, Clock, Menu, X } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const { role: selectedRole, notifications, currentUser, markNotificationRead, refreshNotifications } = useApp();
  const router = useRouter();
  const role = pathname.startsWith("/teacher") ? "teacher" : pathname.startsWith("/admin") ? "admin" : pathname.startsWith("/student") ? "student" : selectedRole;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;
  const recentNotifications = notifications.slice(0, 3);
  const isPublicPage = pathname === "/" || pathname.startsWith("/auth");
  const navCount = (href: string) => isPublicPage ? 0 : notifications.filter(n => n.unread && (
    (href === '/student/classroom' && n.type === 'assignment') || (href === '/teacher/grading' && n.type === 'submission')
  )).length;
  const badge = (count: number) => count > 0 ? <span aria-label={`${count} thông báo chưa xem`} className="ml-1 inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white">{count > 99 ? '99+' : count}</span> : null;

  useEffect(() => {
    if (!currentUser || isPublicPage) return;
    const refresh = () => { if (document.visibilityState === 'visible') void refreshNotifications(); };
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh); };
  }, [currentUser?.id, isPublicPage, refreshNotifications]);

  useEffect(() => {
    const item = notifications.find(n => n.unread && n.href === pathname);
    if (!item) return;
    const endpoint = item.type === 'submission' ? `/api/grading/${pathname.split('/').pop()}` : `/api/assignments/${pathname.split('/').pop()}`;
    let active = true;
    void fetch(endpoint, { cache: 'no-store' }).then(async response => {
      if (!response.ok || !active) return;
      const result = await fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ href: pathname }) });
      if (result.ok && active) await refreshNotifications();
    }).catch(() => {});
    return () => { active = false; };
  }, [pathname, notifications, refreshNotifications]);

  useEffect(() => {
    setNotificationsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!notificationsOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!notificationRef.current?.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNotificationsOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [notificationsOpen]);

  // Navigation Links based on role
  const studentNav = [
    { href: "/student/home", label: "Trang chủ" },
    { href: "/student/learn", label: "Học tập" },
    { href: "/student/vocabulary", label: "Ôn từ vựng" },
    { href: "/student/classroom", label: "Lớp học" },
    { href: "/student/progress", label: "Tiến độ" },
  ];

  const teacherNav = [
    { href: "/teacher/dashboard", label: "Tổng quan" },
    { href: "/teacher/classes", label: "Quản lý Lớp" },
    { href: "/teacher/assignments", label: "Bài tập" },
    { href: "/teacher/grading", label: "Bàn chấm bài" },
  ];

  const adminNav = [
    { href: "/admin", label: "Bảng quản trị" },
    { href: "/admin/users", label: "Tài khoản" },
    { href: "/admin/content", label: "Kho học liệu" },
  ];

  const navItems = isPublicPage
    ? [
        { href: "/student/learn", label: "Học tập" },
        { href: "/student/vocabulary", label: "Từ vựng" },
        { href: "/student/classroom", label: "Lớp học" },
      ]
    : role === "teacher"
    ? teacherNav
    : role === "admin"
    ? adminNav
    : studentNav;

  if (pathname.includes("/workspace/") || /^\/student\/learn\/[^/]+\/[^/]+/.test(pathname) || pathname === "/student/placement-test" || pathname.endsWith("/flashcard")) return null;
  return (
    <header className="bg-white border-b border-line sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Lockup */}
        <Link href={isPublicPage ? "/" : role === "teacher" ? "/teacher/dashboard" : role === "admin" ? "/admin" : "/student/home"} className="flex items-center gap-2.5 font-black text-xl text-ink tracking-tight hover:opacity-90">
          <img
            src="/assets/mascot/avatar.svg"
            alt="Adaptive study avatar"
            className="w-9 h-9 rounded-full bg-[#EAF2FF] border border-primary/20 object-contain p-0.5"
          />
          <span className="font-extrabold text-lg md:text-xl text-ink">Adaptive study</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3.5 py-1.5 rounded-pill text-sm font-bold transition-colors ${
                  isActive
                    ? "bg-[#EAF2FF] text-primary-dark"
                    : "text-ink-muted hover:text-ink hover:bg-[#F6F9FF]"
                }`}
              >
                {item.label}{badge(navCount(item.href))}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA / User controls */}
        <div className="flex items-center gap-2.5">
          {isPublicPage ? (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="text-xs font-bold">
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm" className="text-xs font-bold shadow-tactile">
                  Đăng ký
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Notification preview */}
              <div ref={notificationRef} className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen((open) => !open)}
                  className={`relative w-9 h-9 rounded-full border flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                    notificationsOpen
                      ? "bg-primary text-white border-primary"
                      : "bg-[#F6F9FF] border-line text-ink-muted hover:text-ink hover:border-primary"
                  }`}
                  title="Thông báo"
                  aria-label={`Thông báo${unreadCount > 0 ? `, ${unreadCount} chưa đọc` : ""}`}
                  aria-haspopup="dialog"
                  aria-expanded={notificationsOpen}
                  aria-controls="notification-preview"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <section
                    id="notification-preview"
                    role="dialog"
                    aria-label="Thông báo gần đây"
                    className="fixed left-4 right-4 top-[4.5rem] z-50 w-auto overflow-hidden rounded-2xl border border-[#DCE6F8] bg-white shadow-[0_18px_50px_rgba(31,65,120,0.18)] md:absolute md:left-auto md:right-0 md:top-12 md:w-[22rem]"
                  >
                    <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
                      <div>
                        <h2 className="text-sm font-black text-ink">Thông báo</h2>
                        <p className="mt-0.5 text-[11px] text-ink-muted">
                          {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : "Bạn đã xem hết thông báo"}
                        </p>
                      </div>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EAF2FF] text-primary">
                        <Bell className="h-4 w-4" />
                      </span>
                    </div>

                    <div className="max-h-[22rem] overflow-y-auto p-2">
                      {recentNotifications.length > 0 ? (
                        recentNotifications.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => { if (item.href) { setNotificationsOpen(false); router.push(item.href); } else markNotificationRead(item.id); }}
                            className={`group flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                              item.unread ? "bg-[#F4F8FF] hover:bg-[#EAF2FF]" : "hover:bg-[#F7F9FC]"
                            }`}
                          >
                            <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                              item.unread ? "bg-white text-primary shadow-sm" : "bg-[#F1F4F8] text-ink-muted"
                            }`}>
                              {item.type === "assignment" ? <BookOpen className="h-4 w-4" /> : item.type === "reminder" ? <Clock className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex items-start justify-between gap-2">
                                <span className={`text-xs leading-5 text-ink ${item.unread ? "font-extrabold" : "font-bold"}`}>{item.title}</span>
                                {item.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                              </span>
                              <span className="mt-0.5 line-clamp-2 block text-[11px] leading-4 text-ink-muted">{item.message}</span>
                              <span className="mt-1 block text-[10px] font-semibold text-primary-dark/70">{item.time}</span>
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center">
                          <p className="text-sm font-bold text-ink">Chưa có thông báo mới</p>
                          <p className="mt-1 text-xs text-ink-muted">Bài tập và nhận xét mới sẽ xuất hiện tại đây.</p>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-line bg-[#FAFCFF] p-2">
                      <Link
                        href={role === 'teacher' ? '/teacher/notifications' : '/student/notifications'}
                        onClick={() => setNotificationsOpen(false)}
                        className="flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-extrabold text-primary transition-colors hover:bg-[#EAF2FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        Xem tất cả thông báo <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </section>
                )}
              </div>

              {/* User profile capsule */}
              <Link
                href={role === "teacher" ? "/teacher/dashboard" : role === "admin" ? "/admin" : "/student/progress"}
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-pill bg-[#F6F9FF] border border-line hover:border-primary transition-colors text-xs font-bold text-ink"
              >
                <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[11px] font-black uppercase">
                  {currentUser?.name?.[0] ?? role[0]}
                </span>
                <span className="hidden sm:inline">
                  {currentUser?.name ?? (role === "teacher" ? "Giáo viên" : role === "admin" ? "Admin" : "Học sinh")}
                </span>
              </Link>

              {/* Logout button */}
              <button
                type="button"
                onClick={async () => {
                  try {
                    await fetch('/api/auth/logout', { method: 'POST' });
                  } catch (e) {}
                  window.location.href = '/auth/login';
                }}
                className="hidden sm:inline text-xs text-ink-muted hover:text-red-600 font-bold px-2 py-1 transition-colors"
                title="Đăng xuất"
              >
                Đăng xuất
              </button>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-ink-muted hover:text-ink"
            aria-label="Mở menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-line px-5 py-4 space-y-2 animate-in slide-in-from-top-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-bold text-ink hover:bg-[#F6F9FF]"
            >
              {item.label}{badge(navCount(item.href))}
            </Link>
          ))}
          {isPublicPage && (
            <div className="pt-2 border-t border-line flex flex-col gap-2">
              <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/student/onboarding" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" className="w-full">
                  Bắt đầu học ngay
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

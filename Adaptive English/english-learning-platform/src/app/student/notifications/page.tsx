"use client";

import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { useApp } from "@/lib/store";
import { Mascot } from "@/components/ui/Mascot";
import { Button } from "@/components/ui/Button";
import {
  Bell,
  Check,
  CheckCheck,
  BookOpen,
  Award,
  Clock,
  Sparkles,
  Inbox,
} from "lucide-react";

export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => n.unread).length;
  const filteredNotifications = notifications.filter((n) =>
    filter === "all" ? true : n.unread
  );

  const getIcon = (type: string) => {
    switch (type) {
      case "assignment":
        return <BookOpen className="w-4 h-4 text-primary" />;
      case "feedback":
      case "grade":
        return <Award className="w-4 h-4 text-success" />;
      default:
        return <Clock className="w-4 h-4 text-warning" />;
    }
  };

  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-4 md:px-6 py-8 md:py-10 space-y-6">
      {/* Header */}
      <div className="border-b border-line pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-ink tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-primary" /> Thông báo
          </h1>
          <p className="text-xs md:text-sm text-ink-muted">
            Cập nhật bài tập, bài nộp và nhận xét mới.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={markAllNotificationsRead}
            className="self-start sm:self-auto text-xs font-bold gap-1.5"
          >
            <CheckCheck className="w-4 h-4 text-primary" />
            <span>Đánh dấu tất cả đã đọc</span>
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`px-4 py-1.5 rounded-pill text-xs font-bold transition-all ${
            filter === "all"
              ? "bg-primary text-white shadow-tactile"
              : "bg-white border border-line text-ink-muted hover:text-ink"
          }`}
        >
          Tất cả ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("unread")}
          className={`px-4 py-1.5 rounded-pill text-xs font-bold transition-all flex items-center gap-1.5 ${
            filter === "unread"
              ? "bg-primary text-white shadow-tactile"
              : "bg-white border border-line text-ink-muted hover:text-ink"
          }`}
        >
          <span>Chưa đọc</span>
          {unreadCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                filter === "unread"
                  ? "bg-white text-primary"
                  : "bg-primary text-white"
              }`}
            >
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications List or Empty State */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-line rounded-lg p-8 md:p-12 text-center flex flex-col items-center justify-center space-y-4">
          <Mascot size="inline" mood="encouraging" />
          <div className="space-y-1.5 max-w-sm">
            <h3 className="text-base font-black text-ink">
              {filter === "unread"
                ? "Tuyệt vời! Không còn thông báo chưa đọc"
                : "Hộp thư thông báo đang trống"}
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              {filter === "unread"
                ? "Bạn đã hoàn thành xem toàn bộ thông báo. Hãy chuyển qua mục 'Tất cả' để xem lịch sử nhắc nhở."
                : "Tất cả bài tập mới, nhận xét bài viết và lịch ôn từ vựng sẽ xuất hiện tại đây khi giáo viên cập nhật."}
            </p>
          </div>
          {filter === "unread" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilter("all")}
              className="text-xs"
            >
              Xem tất cả thông báo
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => { if (item.href) router.push(item.href); else markNotificationRead(item.id); }}
              className={`w-full text-left p-4 rounded-md border-2 transition-all cursor-pointer flex items-start justify-between gap-4 ${
                item.unread
                  ? "bg-white border-primary/40 shadow-sm"
                  : "bg-[#F8FAFF] border-line opacity-85 hover:opacity-100"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-canvas flex items-center justify-center shrink-0 border border-line">
                  {getIcon(item.type)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-ink">{item.title}</h3>
                    {item.unread && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed">{item.message}</p>
                  <span className="text-[11px] text-ink-muted block">{item.time}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </main>
  );
}

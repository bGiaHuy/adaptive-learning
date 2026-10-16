"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/store";

export default function StudentClientLayout({ children }: { children: React.ReactNode }) {
  const { hydrated, placementTest, storageError, placementSyncError } = useApp();
  const path = usePathname();
  const activity =
    path.includes("/workspace/") ||
    /^\/student\/learn\/[^/]+\/[^/]+/.test(path) ||
    path.endsWith("/flashcard") ||
    path.includes("/assignment/") ||
    path === "/student/session-summary";

  if (!hydrated) {
    return <p role="status" className="p-8 text-center">Đang khôi phục tiến trình trên thiết bị…</p>;
  }

  if ((activity || path === "/student/placement-test/result") && !placementTest.completed) {
    return (
      <main className="max-w-xl mx-auto p-8 space-y-5">
        <h1 className="text-2xl font-black">Tìm điểm bắt đầu của bạn</h1>
        <p>Hoàn thành bài kiểm tra ngắn trước phiên học đầu tiên. Mục tiêu cá nhân có thể bỏ qua; phần chưa có dữ liệu sẽ được ghi rõ.</p>
        <Link href="/student/placement-test" className="inline-block p-3 bg-primary text-white rounded-lg font-bold">
          {placementTest.currentStep > 1 ? "Tiếp tục bài kiểm tra" : "Bắt đầu kiểm tra"}
        </Link>
        <Link href="/student/home" className="block text-primary underline">Xem trước trang chủ</Link>
      </main>
    );
  }

  return (
    <>
      {storageError && (
        <p role="alert" className="p-3 bg-warning-soft text-sm">
          Trình duyệt không lưu được thay đổi. Giữ trang mở và sao chép bài viết trước khi thoát.
        </p>
      )}
      {placementSyncError && path.startsWith('/student/placement-test') && (
        <p role="alert" className="p-3 bg-warning-soft text-sm">Chưa đồng bộ được bài kiểm tra lên máy chủ. Giữ trang mở và thử lưu lại; đây không phải lỗi bộ nhớ trình duyệt.</p>
      )}
      {children}
    </>
  );
}

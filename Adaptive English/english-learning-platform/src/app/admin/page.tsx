'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function AdminDashboardPage() {
  const [statsData, setStatsData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.stats) {
          setStatsData(data.stats);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    {
      label: 'Tổng người dùng',
      value: loading ? '...' : String(statsData?.totalUsers ?? 0),
      change: `${statsData?.adminCount ?? 0} quản trị viên`,
      color: 'text-brand-blue',
    },
    {
      label: 'Học sinh đang học',
      value: loading ? '...' : String(statsData?.studentCount ?? 0),
      change: `${statsData?.totalUsers ? Math.round(((statsData?.studentCount ?? 0) / statsData.totalUsers) * 100) : 0}% tổng số`,
      color: 'text-emerald-600',
    },
    {
      label: 'Giáo viên phụ trách',
      value: loading ? '...' : String(statsData?.teacherCount ?? 0),
      change: `${statsData?.classCount ?? 0} lớp học thực tế`,
      color: 'text-purple-600',
    },
    {
      label: 'Bài tập trên hệ thống',
      value: loading ? '...' : String(statsData?.assignmentCount ?? 0),
      change: `${statsData?.exerciseCount ?? 0} bài tập ngân hàng`,
      color: 'text-amber-600',
    },
  ];

  const recentLogs = [
    { id: '1', time: '10 phút trước', action: 'Giáo viên Hoàng Nam vừa tạo lớp học mới: "IELTS Master 7.5+"', tag: 'Classroom' },
    { id: '2', time: '25 phút trước', action: 'Học sinh Minh Anh hoàn thành bài kiểm tra đầu vào (CEFR B1 Listening)', tag: 'Placement' },
    { id: '3', time: '42 phút trước', action: 'Giáo viên Trần Mai vừa import đề thi từ tệp DOCX (20 câu hỏi Reading)', tag: 'DOCX Import' },
    { id: '4', time: '1 giờ trước', action: 'AI Pre-grader hoàn tất xử lý 18 bài nộp Writing Task 2 cho lớp 12A1', tag: 'AI Engine' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="warning">ADMIN CONSOLE</Badge>
            <span className="text-xs text-gray-400 font-semibold">• Phiên bản Prototype</span>
          </div>
          <h1 className="text-3xl font-extrabold text-brand-dark">Bảng Điều Khiển Quản Trị Hệ Thống</h1>
          <p className="text-sm text-gray-500 mt-1">
            Theo dõi tổng quan người dùng, lớp học và kho học liệu toàn nền tảng Adaptive study.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/users">
            <Button variant="secondary" size="sm">
              Quản lý tài khoản
            </Button>
          </Link>
          <Link href="/admin/content">
            <Button variant="primary" size="sm">
              Kho học liệu chung
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, idx) => (
          <Card key={idx} className="p-5">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              {stat.label}
            </div>
            <div className={`text-3xl font-extrabold ${stat.color} mb-1`}>
              {stat.value}
            </div>
            <div className="text-xs font-medium text-gray-500">
              {stat.change}
            </div>
          </Card>
        ))}
      </div>

      {/* Main Grid: Management & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Management Shortcuts */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-brand-dark">Phân Hệ Quản Trị</h2>

          <Card className="p-5 hover:border-brand-blue transition-all">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-brand-dark">Người Dùng & Phân Quyền</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {statsData?.totalUsers ?? '...'} tài khoản • Lọc theo Student / Teacher / Admin
                </p>
              </div>
              <span className="text-2xl">👥</span>
            </div>
            <Link href="/admin/users" className="mt-4 block">
              <Button variant="outline" size="sm" className="w-full">
                Xem danh sách người dùng →
              </Button>
            </Link>
          </Card>

          <Card className="p-5 hover:border-brand-blue transition-all">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-brand-dark">Khung Chương Trình Học Liệu</h3>
                <p className="text-xs text-gray-500 mt-1">
                  4 Kỹ năng • 24 Units • 96 Lessons tự học
                </p>
              </div>
              <span className="text-2xl">📚</span>
            </div>
            <Link href="/admin/content" className="mt-4 block">
              <Button variant="outline" size="sm" className="w-full">
                Xem kho học liệu →
              </Button>
            </Link>
          </Card>

          <Card className="p-5 bg-blue-50/40 border-blue-100">
            <h3 className="font-bold text-brand-dark text-sm">Trạng thái Mock Engine</h3>
            <div className="mt-2 space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>FSRS Engine:</span>
                <span className="font-bold text-emerald-600">Hoạt động (Client-side)</span>
              </div>
              <div className="flex justify-between">
                <span>AI Tutor Drawer:</span>
                <span className="font-bold text-emerald-600">Sẵn sàng (Mock Socratic)</span>
              </div>
              <div className="flex justify-between">
                <span>Audio Recorder:</span>
                <span className="font-bold text-emerald-600">MediaRecorder API OK</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h2 className="text-lg font-bold text-brand-dark">Nhật Ký Hoạt Động Thời Gian Thực</h2>
              <Badge variant="info">Mô phỏng Stream</Badge>
            </div>

            <div className="space-y-4">
              {recentLogs.map((log) => (
                <div key={log.id} className="p-3.5 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-brand-blue bg-blue-100 px-2 py-0.5 rounded">
                        {log.tag}
                      </span>
                      <span className="text-xs text-gray-400">{log.time}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{log.action}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <span className="text-xs text-gray-400">
                Hiển thị 4 sự kiện mẫu gần nhất của môi trường giả lập.
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

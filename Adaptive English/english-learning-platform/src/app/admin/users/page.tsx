'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { UserRole } from '@/types';

interface MockUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  status: 'active' | 'suspended';
  lastActive: string;
}

const initialUsers: MockUser[] = [
  {
    id: 'u1',
    name: 'Nguyễn Văn A',
    email: 'student@example.com',
    role: 'student',
    createdAt: '15/09/2026',
    status: 'active',
    lastActive: 'Hôm nay, 10:15',
  },
  {
    id: 'u2',
    name: 'Cô Mai Linh',
    email: 'teacher@example.com',
    role: 'teacher',
    createdAt: '01/09/2026',
    status: 'active',
    lastActive: 'Hôm nay, 09:30',
  },
  {
    id: 'u3',
    name: 'Quản Trị Viên',
    email: 'admin@example.com',
    role: 'admin',
    createdAt: '01/08/2026',
    status: 'active',
    lastActive: 'Vừa xong',
  },
  {
    id: 'u4',
    name: 'Trần Minh Quân',
    email: 'quan.tm@example.com',
    role: 'student',
    createdAt: '20/09/2026',
    status: 'active',
    lastActive: 'Hôm qua',
  },
  {
    id: 'u5',
    name: 'Lê Thu Trang',
    email: 'thutrang.ielts@example.com',
    role: 'teacher',
    createdAt: '10/09/2026',
    status: 'active',
    lastActive: '3 ngày trước',
  },
  {
    id: 'u6',
    name: 'Phạm Đức Duy',
    email: 'duy.pham@example.com',
    role: 'student',
    createdAt: '28/09/2026',
    status: 'suspended',
    lastActive: '5 ngày trước',
  },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<MockUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  React.useEffect(() => {
    fetch('/api/admin/users')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.users) {
          setUsers(data.users);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleStatus = (id: string) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    const actionText = target.status === 'active' ? 'khóa' : 'mở khóa';
    if (!window.confirm(`XÁC NHẬN BẢO MẬT: Bạn có chắc chắn muốn ${actionText} tài khoản "${target.name}" (${target.email}) không?`)) {
      return;
    }
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const newStatus = u.status === 'active' ? 'suspended' : 'active';
          showToast(`Đã ${newStatus === 'suspended' ? 'khóa' : 'mở khóa'} tài khoản ${u.name}`);
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin" className="text-sm font-bold text-gray-400 hover:text-brand-blue">
              ← Admin Dashboard
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-bold text-brand-blue">Người dùng</span>
          </div>
          <h1 className="text-3xl font-extrabold text-brand-dark">Quản Trị Người Dùng & Phân Quyền</h1>
          <p className="text-sm text-gray-500 mt-1">
            Mỗi tài khoản có duy nhất một vai trò: Học sinh, Giáo viên hoặc Quản trị viên.
          </p>
        </div>

        <Badge variant="warning">Thao tác mô phỏng demo</Badge>
      </div>

      {toastMessage && (
        <div className="mb-6 p-4 bg-brand-blue/10 border border-brand-blue/30 rounded-2xl flex items-center gap-3 text-brand-dark text-sm font-semibold animate-fadeIn">
          <span>ℹ️ {toastMessage}</span>
        </div>
      )}

      {/* Filter Bar */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tìm kiếm</label>
            <input
              type="text"
              placeholder="Nhập tên hoặc email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-blue focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vai trò</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-blue focus:outline-none"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="student">Học sinh (Student)</option>
              <option value="teacher">Giáo viên (Teacher)</option>
              <option value="admin">Quản trị viên (Admin)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-blue focus:outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="suspended">Bị khóa tạm thời</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
                <th className="py-3 px-4">Người dùng</th>
                <th className="py-3 px-4">Vai trò</th>
                <th className="py-3 px-4">Ngày tạo</th>
                <th className="py-3 px-4">Hoạt động gần nhất</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    Không tìm thấy người dùng phù hợp với tiêu chí lọc.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-brand-dark">{user.name}</div>
                      <div className="text-xs text-gray-400 font-mono">{user.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      {user.role === 'student' && <Badge variant="neutral">Student</Badge>}
                      {user.role === 'teacher' && <Badge variant="info">Teacher</Badge>}
                      {user.role === 'admin' && <Badge variant="warning">Admin</Badge>}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">{user.createdAt}</td>
                    <td className="py-3 px-4 text-xs text-gray-500">{user.lastActive}</td>
                    <td className="py-3 px-4">
                      {user.status === 'active' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          Bị khóa
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {user.role !== 'admin' && (
                        <Button
                          variant={user.status === 'active' ? 'danger' : 'outline'}
                          size="sm"
                          onClick={() => handleToggleStatus(user.id)}
                        >
                          {user.status === 'active' ? 'Khóa' : 'Mở khóa'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

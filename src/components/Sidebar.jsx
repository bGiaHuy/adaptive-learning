import React from 'react';
import {
  Home,
  TrendingUp,
  Compass,
  CheckSquare,
  CheckCircle2,
  BookX,
  Users
} from 'lucide-react';

export const MENU_ITEMS = [
  { id: 'dashboard', label: 'Trang chính', icon: Home },
  { id: 'profile', label: 'Hồ sơ năng lực', icon: TrendingUp },
  { id: 'learning-path', label: 'Lộ trình học', icon: Compass },
  { id: 'diagnostic', label: 'Kiểm tra đầu vào', icon: CheckSquare },
  { id: 'missions', label: 'Nhiệm vụ số', icon: CheckCircle2 },
  { id: 'mistakes', label: 'Sổ tay lỗi sai', icon: BookX },
  { id: 'classroom', label: 'Lớp học', icon: Users }
];

export default function Sidebar({ activeTab, onSelectTab }) {
  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="sidebar-logo-icon">
          <span>∫</span>
        </div>
        <span className="sidebar-logo-title">AdaptiveMath</span>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id)}
            >
              <Icon size={18} className="sidebar-item-icon" />
              <span className="sidebar-item-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Sync Info Card */}
      <div className="sidebar-footer-card">
        <p className="sidebar-sync-text">
          Tiến trình hoạt được lưu vào tài khoản của bạn – đăng nhập ở thiết bị khác vẫn đầy đủ.
        </p>
      </div>
    </aside>
  );
}

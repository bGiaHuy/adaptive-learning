import React from 'react';
import { LogOut, User } from 'lucide-react';

export default function Navbar({
  pageTitle,
  currentUser,
  onNavigate,
  onLogout,
  showFullNav = false,
  progress = null // e.g. { step: 1, total: 8 }
}) {
  if (showFullNav) {
    // Landing page navbar
    return (
      <header className="landing-navbar">
        <div className="landing-nav-container">
          <div className="brand-logo" onClick={() => onNavigate('landing')}>
            <div className="logo-icon-box">
              <span className="logo-symbol">∫</span>
            </div>
            <span className="logo-text">AdaptiveMath</span>
          </div>
          <div className="landing-nav-actions">
            <button
              className="btn-nav-link"
              onClick={() => onNavigate('register', { mode: 'login' })}
            >
              Đăng nhập
            </button>
            <button
              className="btn-nav-primary"
              onClick={() => onNavigate('register', { mode: 'signup' })}
            >
              Đăng ký
            </button>
          </div>
        </div>
      </header>
    );
  }

  // Logged-in header (Dashboard, Wizard, Quiz, etc.)
  return (
    <header className="app-top-header">
      <div className="header-left">
        <span className="header-title">{pageTitle || 'AdaptiveMath'}</span>
      </div>

      {progress && (
        <div className="wizard-progress-container">
          <div className="wizard-progress-track">
            <div
              className="wizard-progress-bar"
              style={{ width: `${(progress.step / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="header-right">
        {currentUser ? (
          <div className="user-profile-pill">
            <div className="user-avatar-circle">
              <User size={16} />
            </div>
            <span className="user-name">{currentUser.name || 'Nguyễn Minh Đức'}</span>
            <span className="user-role-badge">
              {currentUser.role === 'teacher' ? 'GIÁO VIÊN' : 'HỌC SINH'}
            </span>
            <button
              className="btn-logout"
              title="Đăng xuất"
              onClick={onLogout}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="guest-actions">
            <button
              className="btn-nav-primary"
              onClick={() => onNavigate('register')}
            >
              Đăng nhập
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

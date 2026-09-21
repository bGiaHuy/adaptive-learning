import React, { useState } from 'react';
import { ArrowLeft, Check, GraduationCap, Loader2, Users } from 'lucide-react';

export default function RegisterPage({
  initialMode = 'signup',
  onCompleteRegistration,
  onNavigateHome
}) {
  const [mode, setMode] = useState(initialMode); // 'signup' or 'login'
  const [role, setRole] = useState('student'); // 'student' | 'teacher'
  const [name, setName] = useState('Nguyễn Minh Đức');
  const [email, setEmail] = useState('hocsinh.demo4564@adaptivemath.vn');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate authentic network latency like in the video
    setTimeout(() => {
      setIsLoading(false);
      onCompleteRegistration({
        name: name.trim() || 'Nguyễn Minh Đức',
        email: email.trim() || 'hocsinh.demo4564@adaptivemath.vn',
        role: role
      });
    }, 1200);
  };

  return (
    <div className="auth-page-root">
      <div className="auth-card-container">
        <div className="auth-card">
          <div className="auth-card-header">
            <h1 className="auth-card-title">
              {mode === 'signup' ? 'Tạo tài khoản' : 'Đăng nhập'}
            </h1>
            <p className="auth-card-subtitle">
              {mode === 'signup'
                ? 'Chọn vai trò của bạn, phần còn lại chỉ mất một phút.'
                : 'Đăng nhập để tiếp tục tiến trình học tập của bạn.'}
            </p>
          </div>

          {mode === 'signup' && (
            <div className="role-selection-grid">
              {/* Role Student */}
              <div
                className={`role-card ${role === 'student' ? 'selected' : ''}`}
                onClick={() => setRole('student')}
              >
                <div className="role-header-row">
                  <span className="role-name">Học sinh</span>
                  {role === 'student' && (
                    <div className="role-check-indicator">
                      <Check size={14} />
                    </div>
                  )}
                </div>
                <p className="role-description">
                  Học theo lộ trình riêng, tham gia lớp bằng mã.
                </p>
              </div>

              {/* Role Teacher */}
              <div
                className={`role-card ${role === 'teacher' ? 'selected' : ''}`}
                onClick={() => setRole('teacher')}
              >
                <div className="role-header-row">
                  <span className="role-name">Giáo viên</span>
                  {role === 'teacher' && (
                    <div className="role-check-indicator">
                      <Check size={14} />
                    </div>
                  )}
                </div>
                <p className="role-description">
                  Tạo lớp, theo dõi và hỗ trợ học sinh.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === 'signup' && (
              <div className="form-group">
                <label className="form-label">Họ tên</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nguyễn Văn A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="ban@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mật khẩu</label>
              <input
                type="password"
                className="form-input"
                placeholder="Ít nhất 6 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-auth-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <span>{mode === 'signup' ? 'Tạo tài khoản' : 'Đăng nhập'}</span>
              )}
            </button>
          </form>

          <div className="auth-footer-links">
            {mode === 'signup' ? (
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => setMode('login')}
              >
                Đã có tài khoản? <strong>Đăng nhập</strong>
              </button>
            ) : (
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => setMode('signup')}
              >
                Chưa có tài khoản? <strong>Tạo tài khoản mới</strong>
              </button>
            )}

            <button
              type="button"
              className="auth-back-link"
              onClick={onNavigateHome}
            >
              <ArrowLeft size={15} />
              <span>Về trang giới thiệu</span>
            </button>
          </div>
        </div>

        <p className="auth-screen-bottom-note">
          AdaptiveMath · Nền tảng học Toán THCS lớp 6, 7, 8, 9 theo Chương trình GDPT 2018
        </p>
      </div>
    </div>
  );
}

import React from 'react';
import { ArrowRight, CheckCircle, GitBranch, School, Sparkles } from 'lucide-react';
import Navbar from './Navbar';

export default function LandingPage({ onStartRegistration, onLogin }) {
  return (
    <div className="landing-page-root">
      <Navbar showFullNav={true} onNavigate={(view, params) => {
        if (params?.mode === 'login') onLogin();
        else onStartRegistration();
      }} />

      {/* Hero Section */}
      <main className="landing-hero-section">
        <div className="hero-container">
          <div className="hero-left-content">
            <h1 className="hero-main-title">
              Học Toán THCS đúng <br />
              <span className="hero-title-highlight">chỗ bạn còn yếu</span>
            </h1>
            <p className="hero-subtitle">
              Làm một bài kiểm tra, nhận lộ trình học riêng cho mình.
            </p>

            <div className="hero-cta-group">
              <button
                className="btn-hero-primary"
                onClick={onStartRegistration}
              >
                <span>Bắt đầu miễn phí</span>
                <ArrowRight size={18} />
              </button>
              <button
                className="btn-hero-secondary"
                onClick={onLogin}
              >
                Đăng nhập
              </button>
            </div>

            <p className="hero-badge-note">
              Miễn phí · Dành cho học sinh và giáo viên
            </p>
          </div>

          {/* Right Preview Card: Hồ sơ năng lực */}
          <div className="hero-right-preview">
            <div className="competency-preview-card">
              <div className="preview-card-header">
                <span className="preview-card-title">Hồ sơ năng lực</span>
              </div>
              <div className="preview-skills-list">
                <div className="skill-preview-item">
                  <div className="skill-label-row">
                    <span>Số hữu tỉ</span>
                  </div>
                  <div className="skill-bar-track">
                    <div className="skill-bar-fill fill-green" style={{ width: '82%' }}></div>
                  </div>
                </div>

                <div className="skill-preview-item">
                  <div className="skill-label-row">
                    <span>Tam giác đồng dạng</span>
                  </div>
                  <div className="skill-bar-track">
                    <div className="skill-bar-fill fill-green" style={{ width: '65%' }}></div>
                  </div>
                </div>

                <div className="skill-preview-item">
                  <div className="skill-label-row text-alert">
                    <span>Căn thức</span>
                  </div>
                  <div className="skill-bar-track">
                    <div className="skill-bar-fill fill-coral" style={{ width: '28%' }}></div>
                  </div>
                </div>

                <div className="skill-preview-item">
                  <div className="skill-label-row text-alert">
                    <span>Xác suất</span>
                  </div>
                  <div className="skill-bar-track">
                    <div className="skill-bar-fill fill-coral" style={{ width: '22%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Feature Highlights Cards */}
        <section className="landing-features-section">
          <div className="feature-cards-grid">
            <div className="feature-card">
              <div className="feature-icon-bubble green">
                <CheckCircle size={20} />
              </div>
              <h3 className="feature-title">Kiểm tra đầu vào</h3>
              <p className="feature-desc">
                Khoảng 30 phút để biết bạn đang vững và hổng ở đâu.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-bubble green">
                <GitBranch size={20} />
              </div>
              <h3 className="feature-title">Lộ trình riêng</h3>
              <p className="feature-desc">
                Học đúng phần còn yếu, không cày lại phần đã vững.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-bubble green">
                <School size={20} />
              </div>
              <h3 className="feature-title">Lớp học của thầy cô</h3>
              <p className="feature-desc">
                Nhập mã lớp để thầy cô theo dõi và hỗ trợ bạn.
              </p>
            </div>
          </div>

          {/* 3-Step Process */}
          <div className="landing-steps-roadmap">
            <div className="roadmap-step">
              <span className="step-number-circle">1</span>
              <span className="step-label">Tạo tài khoản</span>
            </div>
            <div className="roadmap-divider"></div>
            <div className="roadmap-step">
              <span className="step-number-circle">2</span>
              <span className="step-label">Làm bài kiểm tra đầu vào</span>
            </div>
            <div className="roadmap-divider"></div>
            <div className="roadmap-step">
              <span className="step-number-circle">3</span>
              <span className="step-label">Học theo lộ trình mỗi ngày</span>
            </div>
          </div>

          {/* Bottom Call to Action Card */}
          <div className="landing-cta-banner">
            <div className="cta-banner-content">
              <h2 className="cta-banner-title">Sẵn sàng bắt đầu?</h2>
              <button
                className="btn-cta-submit"
                onClick={onStartRegistration}
              >
                <span>Tạo tài khoản</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p className="footer-copyright">
          AdaptiveMath · Nền tảng học Toán THCS lớp 6, 7, 8, 9 theo Chương trình GDPT 2018
        </p>
      </footer>
    </div>
  );
}

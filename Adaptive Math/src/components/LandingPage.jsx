import React from 'react';
import { ArrowRight, CheckCircle, GitBranch, School } from 'lucide-react';
import Navbar from './Navbar';

export default function LandingPage({ onStartRegistration, onLogin, onOpenLegal }) {
  return (
    <div className="landing-page-root">
      <Navbar
        showFullNav={true}
        onOpenLegal={onOpenLegal}
        onNavigate={(view, params) => {
          if (params?.mode === 'login') onLogin();
          else onStartRegistration();
        }}
      />

      {/* Hero Section */}
      <main className="landing-hero-section">
        <div className="hero-container">
          <div className="hero-left-content">
            <div className="hero-eyebrow">
              <span>Adaptive learning lab</span>
              <span className="hero-eyebrow-index">01 — 04</span>
            </div>
            <h1 className="hero-main-title">
              Đừng học lại<br />
              <span className="hero-title-highlight">phần bạn đã biết.</span>
            </h1>
            <p className="hero-subtitle">
              AdaptiveMath đọc từng câu trả lời để tìm đúng lỗ hổng, rồi xếp một lộ trình vừa sức cho học sinh THCS.
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

            <div className="hero-proof-row">
              <span><strong>4</strong> khối lớp</span>
              <span><strong>92</strong> chủ đề</span>
              <span><strong>01</strong> lộ trình riêng</span>
            </div>
          </div>

          {/* Right Preview Card: Hồ sơ năng lực */}
          <div className="hero-right-preview">
            <div className="competency-preview-card">
              <div className="preview-card-header">
                <span className="preview-card-kicker">Bản quét năng lực / mẫu</span>
                <span className="preview-card-title">Tín hiệu học tập</span>
                <span className="preview-theta">θ 0.74</span>
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
              <div className="preview-card-caption">
                Mỗi thanh là một tín hiệu, không phải một nhãn dán năng lực.
              </div>
            </div>
          </div>
        </div>

          <div className="section-intro-row">
            <span className="section-index">02</span>
            <h2>Ba bước, một đường học rõ ràng.</h2>
            <p>Đo đúng điểm bắt đầu. Ưu tiên đúng nội dung. Theo dõi bằng bằng chứng học tập.</p>
          </div>

          {/* Product pillars */}
        <section className="landing-features-section">
          <div className="feature-cards-grid">
            <div className="feature-card">
              <div className="feature-icon-bubble green">
                <CheckCircle size={20} />
              </div>
              <span className="feature-index">01 / ĐO</span>
              <h3 className="feature-title">Kiểm tra đầu vào</h3>
              <p className="feature-desc">
                Khoảng 30 phút để biết bạn đang vững và hổng ở đâu.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-bubble green">
                <GitBranch size={20} />
              </div>
              <span className="feature-index">02 / XẾP</span>
              <h3 className="feature-title">Lộ trình riêng</h3>
              <p className="feature-desc">
                Học đúng phần còn yếu, không cày lại phần đã vững.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-bubble green">
                <School size={20} />
              </div>
              <span className="feature-index">03 / HỖ TRỢ</span>
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
              <span className="cta-banner-index">03 / BẮT ĐẦU</span>
              <h2 className="cta-banner-title">Một bài kiểm tra.<br />Một lộ trình vừa đủ.</h2>
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
        <div style={{ marginTop: '8px' }}>
          <button
            type="button"
            onClick={onOpenLegal}
            style={{
              color: '#0f766e',
              fontSize: '0.82rem',
              textDecoration: 'underline',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              fontWeight: 500
            }}
          >
            Chính sách bảo mật & Điều khoản sử dụng (Dự thảo D-02)
          </button>
        </div>
      </footer>
    </div>
  );
}

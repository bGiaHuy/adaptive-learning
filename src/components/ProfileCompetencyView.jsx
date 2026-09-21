import React from 'react';
import { FileText, ArrowRight, Award, BarChart3 } from 'lucide-react';

export default function ProfileCompetencyView({
  hasCompletedTest,
  testResults,
  onStartDiagnostic
}) {
  if (!hasCompletedTest) {
    return (
      <div className="empty-state-view-wrapper animate-fade-in">
        <div className="empty-state-card">
          <div className="empty-state-icon-box pink-tint">
            <FileText size={32} className="empty-icon text-red" />
          </div>
          <h2 className="empty-state-title">Chưa có kết quả kiểm tra</h2>
          <p className="empty-state-desc">
            Làm bài kiểm tra đầu vào để hệ thống dựng hồ sơ năng lực cho bạn.
          </p>
          <button
            className="btn-empty-action"
            onClick={onStartDiagnostic}
          >
            Làm bài kiểm tra
          </button>
        </div>
      </div>
    );
  }

  // Active state after diagnostic test completed
  return (
    <div className="profile-competency-page animate-fade-in">
      <div className="competency-header-card">
        <div className="header-info-group">
          <div className="competency-badge-icon">
            <Award size={24} />
          </div>
          <div>
            <h2 className="competency-main-title">Hồ sơ năng lực toán học</h2>
            <p className="competency-sub-desc">
              Ước lượng năng lực tổng thể: <strong>θ = {testResults?.finalTheta || '0.70'}</strong> (Trình độ: Khá vững)
            </p>
          </div>
        </div>
      </div>

      <div className="competency-metrics-grid">
        <div className="competency-stat-card">
          <span className="stat-card-label">Số & Đại số</span>
          <div className="stat-progress-bar">
            <div className="stat-fill fill-green" style={{ width: '85%' }}></div>
          </div>
          <span className="stat-percentage">85% thành thạo</span>
        </div>

        <div className="competency-stat-card">
          <span className="stat-card-label">Căn thức & Luỹ thừa</span>
          <div className="stat-progress-bar">
            <div className="stat-fill fill-green" style={{ width: '75%' }}></div>
          </div>
          <span className="stat-percentage">75% thành thạo</span>
        </div>

        <div className="competency-stat-card">
          <span className="stat-card-label">Hệ thức lượng trong tam giác</span>
          <div className="stat-progress-bar">
            <div className="stat-fill fill-yellow" style={{ width: '60%' }}></div>
          </div>
          <span className="stat-percentage">60% - Cần rèn luyện thêm</span>
        </div>

        <div className="competency-stat-card">
          <span className="stat-card-label">Đường tròn & Góc</span>
          <div className="stat-progress-bar">
            <div className="stat-fill fill-coral" style={{ width: '40%' }}></div>
          </div>
          <span className="stat-percentage">40% - Chủ đề ưu tiên ôn tập</span>
        </div>
      </div>
    </div>
  );
}

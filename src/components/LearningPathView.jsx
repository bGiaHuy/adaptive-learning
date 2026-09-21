import React from 'react';
import { BookOpen, CheckCircle, Clock, Play } from 'lucide-react';

export default function LearningPathView({
  hasCompletedTest,
  userProfile,
  onStartDiagnostic
}) {
  if (!hasCompletedTest) {
    return (
      <div className="empty-state-view-wrapper animate-fade-in">
        <div className="empty-state-card">
          <div className="empty-state-icon-box cyan-tint">
            <BookOpen size={32} className="empty-icon text-cyan" />
          </div>
          <h2 className="empty-state-title">Chưa tạo lộ trình</h2>
          <p className="empty-state-desc">
            Lộ trình được xây từ kết quả bài kiểm tra đầu vào.
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

  // Active personalized path
  return (
    <div className="learning-path-page animate-fade-in">
      <div className="pathway-summary-header">
        <h2 className="pathway-title">Lộ trình Ôn thi vào lớp 10 (Lớp 9)</h2>
        <p className="pathway-subtitle">
          Xếp theo mức độ ưu tiên từ kết quả kiểm tra thích ứng · 45 phút mỗi ngày
        </p>
      </div>

      <div className="pathway-timeline">
        <div className="pathway-node active">
          <div className="node-marker current">1</div>
          <div className="node-card">
            <div className="node-card-top">
              <span className="node-tag urgent">Ưu tiên cao</span>
              <span className="node-time"><Clock size={13} /> 3 ngày (135 phút)</span>
            </div>
            <h3 className="node-title">Phương trình bậc nhất hai ẩn và Giải hệ phương trình</h3>
            <p className="node-desc">Ôn tập các phương pháp cộng đại số, phương pháp thế và bài toán giải bằng cách lập hệ.</p>
            <button className="btn-node-start">
              <Play size={14} />
              <span>Bắt đầu bài 1</span>
            </button>
          </div>
        </div>

        <div className="pathway-node">
          <div className="node-marker">2</div>
          <div className="node-card">
            <div className="node-card-top">
              <span className="node-tag normal">Củng cố</span>
              <span className="node-time"><Clock size={13} /> 2 ngày</span>
            </div>
            <h3 className="node-title">Biến đổi căn thức và Rút gọn biểu thức chứa căn</h3>
            <p className="node-desc">Luyện kỹ năng trục căn thức ở mẫu, tìm điều kiện xác định và tìm x để biểu thức nguyên.</p>
          </div>
        </div>

        <div className="pathway-node">
          <div className="node-marker">3</div>
          <div className="node-card">
            <div className="node-card-top">
              <span className="node-tag normal">Nâng cao</span>
              <span className="node-time"><Clock size={13} /> 4 ngày</span>
            </div>
            <h3 className="node-title">Đường tròn, Góc nội tiếp & Tứ giác nội tiếp</h3>
            <p className="node-desc">Các định lý trọng tâm câu hình học 9 điểm trong đề thi vào 10.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

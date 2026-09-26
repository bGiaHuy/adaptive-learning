import React from 'react';
import { Target, CheckCircle2, Flame, Award, ArrowRight } from 'lucide-react';

export default function MissionsView({ onStartDiagnostic, onNavigateTab }) {
  const missions = [
    {
      id: 1,
      title: 'Hoàn thành bài kiểm tra đầu vào',
      reward: '+50 XP',
      desc: 'Giúp hệ thống vẽ bản đồ năng lực toán học chuẩn GDPT 2018 cho bạn.',
      progress: '0/1',
      actionText: 'Làm bài ngay',
      action: onStartDiagnostic
    },
    {
      id: 2,
      title: 'Luyện tập 15 phút mỗi ngày',
      reward: '+20 XP',
      desc: 'Duy trì thói quen học tập đều đặn.',
      progress: '0/15 phút',
      actionText: 'Vào bài học',
      action: () => onNavigateTab?.('learning-path')
    },
    {
      id: 3,
      title: 'Khắc phục 3 lỗi sai trong Sổ tay',
      reward: '+30 XP',
      desc: 'Chuyển lỗi sai thành điểm mạnh của bạn.',
      progress: '0/3',
      actionText: 'Xem sổ tay',
      action: () => onNavigateTab?.('mistakes')
    }
  ];

  return (
    <div className="missions-page-container animate-fade-in">
      <div className="missions-header-block">
        <div className="missions-title-group">
          <Target size={28} className="text-primary" />
          <div>
            <h1 className="missions-heading">Nhiệm vụ số hôm nay</h1>
            <p className="missions-subheading">Hoàn thành nhiệm vụ hàng ngày để tích lũy điểm kinh nghiệm và mở khóa lộ trình.</p>
          </div>
        </div>
        <div className="missions-streak-badge">
          <Flame size={20} className="streak-flame" />
          <span>Chuỗi: <strong>1 ngày</strong></span>
        </div>
      </div>

      <div className="missions-list-grid">
        {missions.map((m) => (
          <div key={m.id} className="mission-card">
            <div className="mission-card-header">
              <h3 className="mission-card-title">{m.title}</h3>
              <span className="mission-reward-badge">{m.reward}</span>
            </div>
            <p className="mission-card-desc">{m.desc}</p>
            <div className="mission-card-footer">
              <span className="mission-progress-label">Tiến độ: {m.progress}</span>
              <button
                className="btn-mission-action"
                onClick={m.action}
              >
                <span>{m.actionText}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

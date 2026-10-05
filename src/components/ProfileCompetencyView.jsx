import React, { useState, useEffect } from 'react';
import { FileText, Award, BarChart3, RefreshCw, AlertCircle, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { studentApi } from '../lib/apiClient';

export default function ProfileCompetencyView({
  onStartDiagnostic
}) {
  const [masteryData, setMasteryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMastery = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await studentApi.getMastery();
      setMasteryData(data);
    } catch (err) {
      setError(err.message || 'Không thể tải bảng năng lực.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMastery();
  }, []);

  // 1. Loading Skeleton State
  if (isLoading) {
    return (
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '20px' }}>
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
          <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <div>Đang tải hồ sơ năng lực thực tế từ hệ thống...</div>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div style={{ maxWidth: '700px', margin: '40px auto', padding: '20px' }}>
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '24px',
            textAlign: 'center'
          }}
        >
          <AlertCircle size={32} color="#dc2626" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#991b1b', marginBottom: '8px' }}>
            Không thể tải dữ liệu năng lực
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#7f1d1d', marginBottom: '16px' }}>{error}</p>
          <button
            type="button"
            onClick={fetchMastery}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // 3. Empty State: No skills assessed yet
  if (!masteryData || masteryData.totalAssessedSkills === 0) {
    return (
      <div className="empty-state-view-wrapper animate-fade-in">
        <div className="empty-state-card">
          <div className="empty-state-icon-box pink-tint">
            <FileText size={32} className="empty-icon text-red" />
          </div>
          <h2 className="empty-state-title">Chưa có kết quả kiểm tra năng lực</h2>
          <p className="empty-state-desc">
            Làm bài kiểm tra đầu vào CAT/IRT để hệ thống đo lường mức độ thành thạo của bạn theo từng kỹ năng chuẩn Bộ GD&ĐT.
          </p>
          <button
            type="button"
            className="btn-empty-action"
            onClick={onStartDiagnostic}
          >
            Làm bài kiểm tra ngay
          </button>
        </div>
      </div>
    );
  }

  // 4. Active / Partial Data State
  const isPartialData = masteryData.totalAssessedSkills < 8;

  return (
    <div className="profile-competency-page animate-fade-in" style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Partial Data Notice Banner */}
      {isPartialData && (
        <div
          style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '6px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            fontSize: '0.86rem',
            color: '#92400e'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} />
            <span>
              <strong>Dữ liệu năng lực một phần:</strong> Bạn mới hoàn thành {masteryData.totalAssessedSkills}/8 kỹ năng trọng tâm. Hãy tiếp tục làm thêm bài tập để vẽ đầy đủ bản đồ năng lực.
            </span>
          </div>
          <button
            type="button"
            onClick={onStartDiagnostic}
            style={{
              padding: '6px 12px',
              backgroundColor: '#d97706',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Làm thêm bài
          </button>
        </div>
      )}

      {/* Main Overview Card */}
      <div className="competency-header-card">
        <div className="header-info-group">
          <div className="competency-badge-icon">
            <Award size={24} />
          </div>
          <div>
            <h2 className="competency-main-title">Hồ sơ năng lực toán học chuẩn hóa</h2>
            <p className="competency-sub-desc">
              Điểm thành thạo trung bình: <strong>{masteryData.averageMasteryScore}%</strong> · Đã đánh giá <strong>{masteryData.totalAssessedSkills} kỹ năng</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: '#166534', backgroundColor: '#dcfce7', padding: '4px 10px', borderRadius: '12px', fontWeight: 600 }}>
            ✓ Vững: {masteryData.strongCount}
          </span>
          <span style={{ fontSize: '0.85rem', color: '#854d0e', backgroundColor: '#fef9c3', padding: '4px 10px', borderRadius: '12px', fontWeight: 600 }}>
            ~ Trung bình: {masteryData.averageCount}
          </span>
          <span style={{ fontSize: '0.85rem', color: '#991b1b', backgroundColor: '#fee2e2', padding: '4px 10px', borderRadius: '12px', fontWeight: 600 }}>
            ! Cần luyện: {masteryData.weakCount}
          </span>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="competency-metrics-grid" style={{ marginTop: '20px' }}>
        {(masteryData.skills || []).map((skill) => {
          const rawScore = skill.masteryScore ?? skill.score ?? 0;
          const score = Number.isFinite(Number(rawScore)) ? Math.round(Number(rawScore)) : 0;
          const attempts = skill.attemptsCount ?? skill.attempts ?? 1;
          const isStrong = score >= 75;
          const isMedium = score >= 50 && score < 75;

          return (
            <div key={skill.skillId} className="competency-stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span className="stat-card-label" style={{ fontWeight: 700, color: '#0f172a' }}>
                  {skill.title}
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: isStrong ? '#dcfce7' : isMedium ? '#fef9c3' : '#fee2e2',
                    color: isStrong ? '#15803d' : isMedium ? '#854d0e' : '#b91c1c'
                  }}
                >
                  {isStrong ? 'Vững vàng' : isMedium ? 'Khá' : 'Ưu tiên ôn'}
                </span>
              </div>

              <div style={{ fontSize: '0.76rem', color: '#64748b', marginBottom: '8px' }}>
                {skill.chapter}
              </div>

              <div className="stat-progress-bar">
                <div
                  className={`stat-fill ${isStrong ? 'fill-green' : isMedium ? 'fill-yellow' : 'fill-coral'}`}
                  style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                ></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.78rem', color: '#64748b' }}>
                <span>{score}% thành thạo</span>
                <span>{attempts} lượt kiểm tra</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, Clock, Play, RefreshCw, AlertCircle, Lock, Compass } from 'lucide-react';
import { studentApi } from '../lib/apiClient';

export default function LearningPathView({
  onStartDiagnostic
}) {
  const [learningPath, setLearningPath] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLearningPath = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await studentApi.getLearningPath();
      setLearningPath(data);
    } catch (err) {
      setError(err.message || 'Không thể tải lộ trình học tập.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLearningPath();
  }, []);

  // Loading State
  if (isLoading) {
    return (
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '20px' }}>
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
          <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <div>Đang tải lộ trình cá nhân hóa từ thuật toán thích ứng...</div>
        </div>
      </div>
    );
  }

  // Error State
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
            Không thể tải lộ trình
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#7f1d1d', marginBottom: '16px' }}>{error}</p>
          <button
            type="button"
            onClick={fetchLearningPath}
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

  // Empty State
  if (!learningPath || !learningPath.modules || learningPath.modules.length === 0) {
    return (
      <div className="empty-state-view-wrapper animate-fade-in">
        <div className="empty-state-card">
          <div className="empty-state-icon-box cyan-tint">
            <BookOpen size={32} className="empty-icon text-cyan" />
          </div>
          <h2 className="empty-state-title">Chưa khởi tạo lộ trình học</h2>
          <p className="empty-state-desc">
            Lộ trình học cá nhân hóa được thuật toán tạo ra dựa trên kết quả bài kiểm tra chẩn đoán năng lực đầu vào.
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

  return (
    <div className="learning-path-page animate-fade-in" style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div className="pathway-summary-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <Compass size={24} color="#f0642f" />
          <h2 className="pathway-title" style={{ margin: 0 }}>
            Lộ trình {learningPath.targetGoal} (Khối {learningPath.grade})
          </h2>
        </div>
        <p className="pathway-subtitle">
          Thuật toán sắp xếp theo mức độ ưu tiên từ điểm chẩn đoán thích ứng thực tế · Chuẩn hóa GDPT 2018
        </p>
      </div>

      <div className="pathway-timeline" style={{ marginTop: '24px' }}>
        {learningPath.modules.map((mod, index) => {
          const isCompleted = mod.status === 'COMPLETED';
          const isInProgress = mod.status === 'IN_PROGRESS';
          const isLocked = mod.status === 'LOCKED';

          return (
            <div
              key={mod.id}
              className={`pathway-node ${isInProgress ? 'active' : ''}`}
            >
              <div
                className={`node-marker ${isCompleted ? 'completed' : isInProgress ? 'current' : ''}`}
                style={{
                  backgroundColor: isCompleted ? '#10b981' : isInProgress ? '#f0642f' : '#cbd5e1',
                  color: '#ffffff',
                  borderColor: isCompleted ? '#059669' : isInProgress ? '#c2410c' : '#94a3b8'
                }}
              >
                {isCompleted ? <CheckCircle size={18} /> : index + 1}
              </div>

              <div className="node-card">
                <div className="node-card-top">
                  <span
                    className={`node-tag ${isCompleted ? 'normal' : isInProgress ? 'urgent' : 'normal'}`}
                    style={{
                      backgroundColor: isCompleted ? '#dcfce7' : isInProgress ? '#fee2e2' : '#f1f5f9',
                      color: isCompleted ? '#15803d' : isInProgress ? '#b91c1c' : '#64748b'
                    }}
                  >
                    {isCompleted ? 'Đã thành thạo' : isInProgress ? 'Đang học trọng tâm' : 'Sẽ học tiếp theo'}
                  </span>

                  <span className="node-time" style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Thành thạo: <strong>{Math.round(mod.masteryScore)}%</strong>
                  </span>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {mod.chapter} · {mod.code}
                </div>

                <h3 className="node-title" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                  {mod.title}
                </h3>

                <p className="node-desc" style={{ fontSize: '0.88rem', color: '#475569', marginTop: '6px' }}>
                  {mod.recommendedAction}
                </p>

                {isInProgress && (
                  <button
                    type="button"
                    className="btn-node-start"
                    onClick={onStartDiagnostic}
                    style={{ marginTop: '12px' }}
                  >
                    <Play size={14} />
                    <span>Luyện tập chủ đề này</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React, { useEffect } from 'react';

export default function LoadingScreen({ onFinished, duration = 1400 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinished();
    }, duration);
    return () => clearTimeout(timer);
  }, [onFinished, duration]);

  return (
    <div className="loading-screen-backdrop">
      <div className="loading-dialog-card animate-fade-in" role="status" aria-live="polite">
        <div className="loading-spinner-wrapper" aria-hidden="true">
          <div className="loading-orbit loading-orbit-outer"><span /></div>
          <div className="loading-orbit loading-orbit-inner"><span /></div>
          <div className="loading-core-mark">∫</div>
        </div>
        <h2 className="loading-main-text">Đang chuẩn bị không gian học tập</h2>
        <p className="loading-sub-text">Đồng bộ dữ liệu và khởi tạo lộ trình của bạn</p>
        <div className="loading-progress-track" aria-hidden="true"><span /></div>
      </div>
    </div>
  );
}

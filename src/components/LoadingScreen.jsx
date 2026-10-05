import React, { useState, useEffect } from 'react';

export default function LoadingScreen({ onFinished, duration = 1400 }) {
  const [progress, setProgress] = useState(12);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentPct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(currentPct);

      if (elapsed >= duration) {
        clearInterval(interval);
        setTimeout(onFinished, 120);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [onFinished, duration]);

  const getSubText = () => {
    if (progress < 35) return 'Đang kết nối cơ sở tri thức Toán GDPT 2018...';
    if (progress < 75) return 'Đồng bộ hóa dữ liệu và khởi tạo lộ trình thích ứng...';
    if (progress < 95) return 'Tối ưu hóa các điểm nút năng lực cá nhân...';
    return 'Sẵn sàng khởi động không gian học tập!';
  };

  return (
    <div className="loading-screen-backdrop">
      <div className="loading-dialog-card animate-fade-in" role="status" aria-live="polite">
        <div className="loading-spinner-wrapper" aria-hidden="true">
          <div className="loading-sonar-wave" />
          <div className="loading-sonar-wave" />
          <div className="loading-orbit loading-orbit-outer"><span /></div>
          <div className="loading-orbit loading-orbit-inner"><span /></div>
          <div className="loading-core-mark">∫</div>
        </div>
        <h2 className="loading-main-text">Đang chuẩn bị không gian học tập</h2>
        <p className="loading-sub-text">{getSubText()}</p>
        <div className="loading-progress-track" aria-hidden="true">
          <div className="loading-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="loading-percent-badge">{progress}%</div>
      </div>
    </div>
  );
}

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
      <div className="loading-dialog-card animate-fade-in">
        <div className="loading-spinner-wrapper">
          <div className="loading-pulse-ring"></div>
          <div className="loading-core-dot"></div>
        </div>
        <h2 className="loading-main-text">Đang tải dữ liệu học tập...</h2>
        <p className="loading-sub-text">Sắp xong.</p>
      </div>
    </div>
  );
}

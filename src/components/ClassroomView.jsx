import React, { useState } from 'react';
import { Search, School, Check, Users, ShieldCheck } from 'lucide-react';

export default function ClassroomView() {
  const [classCode, setClassCode] = useState('');
  const [joinedClass, setJoinedClass] = useState(null);
  const [searchStatus, setSearchStatus] = useState(null); // 'not_found' | 'found'

  const handleSearchClass = (e) => {
    e.preventDefault();
    if (!classCode.trim()) return;

    // Support code in video "KTR2QX" or any mock code
    if (classCode.toUpperCase().trim() === 'KTR2QX' || classCode.trim().length >= 4) {
      setSearchStatus('found');
    } else {
      setSearchStatus('not_found');
    }
  };

  const handleJoinClass = () => {
    setJoinedClass({
      name: 'Toán 9A1 - Thầy Nguyễn Văn Nam',
      school: 'THCS Giảng Võ, Hà Nội',
      code: classCode.toUpperCase().trim() || 'KTR2QX',
      studentsCount: 38
    });
    setSearchStatus(null);
    setClassCode('');
  };

  return (
    <div className="classroom-page-container animate-fade-in">
      <div className="classroom-header-block">
        <h1 className="classroom-heading">Lớp học</h1>
        <p className="classroom-subheading">Tham gia lớp của giáo viên bằng mã lớp.</p>
      </div>

      {/* Card 1: Enter Teacher Code */}
      <div className="classroom-input-card">
        <div className="card-top-titles">
          <h2 className="input-card-title">Vào lớp của giáo viên</h2>
          <p className="input-card-subtitle">Nhập mã lớp giáo viên đưa cho bạn.</p>
        </div>

        <form onSubmit={handleSearchClass} className="class-code-form">
          <div className="code-input-group">
            <span className="code-prefix-label">VD :</span>
            <input
              type="text"
              className="class-code-input"
              placeholder="KTR2QX"
              value={classCode}
              onChange={(e) => {
                setClassCode(e.target.value.toUpperCase());
                if (searchStatus) setSearchStatus(null);
              }}
            />
          </div>

          <button type="submit" className="btn-find-class">
            <Search size={16} />
            <span>Tìm lớp</span>
          </button>
        </form>

        {searchStatus === 'found' && (
          <div className="found-class-box animate-fade-in">
            <div className="found-class-info">
              <span className="found-class-badge">Tìm thấy lớp học</span>
              <h4 className="found-class-name">Lớp Toán 9A1 - Thầy Nguyễn Văn Nam</h4>
              <p className="found-class-sub">Trường THCS Chu Văn An · Năm học 2026-2027</p>
            </div>
            <button
              type="button"
              className="btn-confirm-join"
              onClick={handleJoinClass}
            >
              <Check size={16} />
              <span>Tham gia ngay</span>
            </button>
          </div>
        )}

        {searchStatus === 'not_found' && (
          <p className="class-not-found-msg">
            Không tìm thấy lớp học với mã này. Hãy kiểm tra lại với thầy cô của bạn.
          </p>
        )}
      </div>

      {/* Card 2: Classroom Status (Empty state or Joined state) */}
      {!joinedClass ? (
        <div className="classroom-empty-card">
          <div className="empty-house-icon-wrapper">
            <School size={36} className="empty-house-icon" />
          </div>
          <h3 className="empty-classroom-title">Bạn chưa vào lớp nào</h3>
          <p className="empty-classroom-description">
            Vào lớp để giáo viên theo dõi tiến độ và hỗ trợ bạn khi cần. Không bắt buộc – bạn vẫn học bình thường nếu chưa có lớp.
          </p>
        </div>
      ) : (
        <div className="classroom-joined-card animate-fade-in">
          <div className="joined-class-header">
            <div className="joined-badge-icon">
              <School size={24} />
            </div>
            <div>
              <h3 className="joined-title">{joinedClass.name}</h3>
              <p className="joined-sub">{joinedClass.school} · Mã: {joinedClass.code}</p>
            </div>
          </div>
          <div className="joined-stats-row">
            <div className="joined-stat-item">
              <Users size={16} />
              <span>{joinedClass.studentsCount} học sinh trong lớp</span>
            </div>
            <div className="joined-stat-item">
              <ShieldCheck size={16} />
              <span>Đang đồng bộ tiến trình học tập với giáo viên</span>
            </div>
          </div>
        </div>
      )}

      {/* Watermark at bottom */}
      <div className="classroom-watermark">
        <span>N U R T U R I N G &nbsp; H U M A N &nbsp; P O T E N T I A L</span>
      </div>
    </div>
  );
}

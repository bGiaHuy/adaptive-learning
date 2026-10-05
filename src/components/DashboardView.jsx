import React from 'react';
import { ArrowRight } from 'lucide-react';
import PracticeCalendar from './PracticeCalendar';

export default function DashboardView({
  userProfile,
  onStartSetup,
  onStartDiagnostic
}) {
  const isProfileConfigured = Boolean(userProfile && (userProfile.grade || userProfile.targetGoal));
  const gradeLabel = userProfile?.grade ? `Khối ${userProfile.grade}` : 'Lớp 9';
  const dailyTimeLabel = userProfile?.dailyMinutes ? `${userProfile.dailyMinutes} phút` : userProfile?.dailyTime || '45 phút';
  const goalLabel = userProfile?.targetGoal || userProfile?.goal || 'Ôn thi vào lớp 10';

  return (
    <div className="dashboard-content-page animate-fade-in">
      {/* Top Welcome Heading */}
      <div className="dashboard-header-block">
        <h1 className="dashboard-heading">
          {isProfileConfigured
            ? `Xin chào, học sinh ${gradeLabel}!`
            : 'Chào mừng đến AdaptiveMath!'}
        </h1>
        <p className="dashboard-subheading">
          {isProfileConfigured
            ? `Sẵn sàng cho ${dailyTimeLabel} học hôm nay để đến gần hơn tới mục tiêu ${goalLabel.toLowerCase()} chứ?`
            : 'Bắt đầu bằng cách nhập lớp, mục tiêu và thời gian học để hệ thống chuẩn bị bài kiểm tra đầu vào phù hợp.'}
        </p>
      </div>

      <div className="dashboard-main-grid">
        {/* Next Step Prominent Card */}
        <div className="next-step-card">
          <div className="next-step-badge">
            <span>BƯỚC TIẾP THEO</span>
          </div>

          {!isProfileConfigured ? (
            <>
              <h2 className="next-step-title">Bắt đầu từ đây</h2>
              <p className="next-step-description">
                Cho hệ thống biết lớp, mục tiêu và thời gian của bạn — mất khoảng 1 phút. Sau đó bạn sẽ làm bài kiểm tra đầu vào để hệ thống biết bạn đang ở đâu.
              </p>
              <button
                className="btn-next-step-action"
                onClick={onStartSetup}
              >
                <span>Thiết lập hồ sơ</span>
                <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <>
              <h2 className="next-step-title">Làm bài kiểm tra đầu vào</h2>
              <p className="next-step-description">
                Bài kiểm tra thích ứng sẽ qua từng chủ đề theo thang Nhận biết – Thông hiểu – Vận dụng để xác định chính xác bạn đang ở đâu và hổng ở đâu.
              </p>
              <button
                className="btn-next-step-action"
                onClick={onStartDiagnostic}
              >
                <span>Bắt đầu kiểm tra</span>
                <ArrowRight size={16} />
              </button>
            </>
          )}
        </div>

        {/* Real-time Dynamic Practice Calendar */}
        <PracticeCalendar userProfile={userProfile} />
      </div>
    </div>
  );
}

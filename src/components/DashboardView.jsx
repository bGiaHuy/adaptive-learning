import React from 'react';
import { ArrowRight, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';

export default function DashboardView({
  userProfile,
  onStartSetup,
  onStartDiagnostic
}) {
  const isProfileConfigured = Boolean(userProfile && (userProfile.grade || userProfile.targetGoal));
  const gradeLabel = userProfile?.grade ? `Khối ${userProfile.grade}` : 'Lớp 9';
  const dailyTimeLabel = userProfile?.dailyMinutes ? `${userProfile.dailyMinutes} phút` : userProfile?.dailyTime || '45 phút';
  const goalLabel = userProfile?.targetGoal || userProfile?.goal || 'Ôn thi vào lớp 10';

  // Generate days for a standard calendar month
  const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  
  // Create days 1..30 with active streak
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);
  const currentDay = new Date().getDate();

  return (
    <div className="dashboard-content-page animate-fade-in">
      {/* Top Welcome Heading */}
      <div className="dashboard-header-block">
        <h1 className="dashboard-heading">
          {isProfileConfigured
            ? `Xin chào, học sinh ${gradeLabel}!`
            : 'Chào mừng đến Adaptive Learning!'}
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

        {/* Practice Calendar Widget */}
        <div className="practice-calendar-card">
          <div className="calendar-card-header">
            <div className="calendar-title-row">
              <CalendarIcon size={18} className="calendar-icon" />
              <h3 className="calendar-title">Lịch luyện tập tháng này</h3>
            </div>
            <span className="calendar-status-text">
              {isProfileConfigured ? 'Mục tiêu: 45 phút/ngày' : 'Đang lấy dữ liệu trong tháng'}
            </span>
          </div>

          <div className="calendar-grid-container">
            {/* Weekday headers */}
            <div className="calendar-weekdays-row">
              {daysOfWeek.map((day) => (
                <div key={day} className="weekday-col">{day}</div>
              ))}
            </div>

            {/* Day cells (starting from Tuesday offset by 1 blank) */}
            <div className="calendar-days-grid">
              <div className="calendar-day-empty"></div>
              {daysInMonth.map((day) => {
                const isToday = day === currentDay;
                const isCompleted = isProfileConfigured && (day === 14 || day === 15);
                return (
                  <div
                    key={day}
                    className={`calendar-day-cell ${isToday ? 'today' : ''} ${isCompleted ? 'active-streak' : ''}`}
                  >
                    <span>{day}</span>
                    {isCompleted && <div className="streak-dot"></div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

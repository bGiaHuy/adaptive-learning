import React, { useState } from 'react';
import { Clock, ShieldAlert, CheckCircle2, RefreshCw, Mail, School, MapPin } from 'lucide-react';
import { authApi } from '../lib/apiClient';

export default function TeacherPendingView({ currentUser, onRefreshUser }) {
  const [isChecking, setIsChecking] = useState(false);
  const [message, setMessage] = useState('');

  const teacherProfile = currentUser?.teacherProfile || {};
  const status = teacherProfile.verificationStatus || 'PENDING_REVIEW';
  const rejectionReason = teacherProfile.rejectionReason;

  const handleCheckStatus = async () => {
    setIsChecking(true);
    setMessage('');
    try {
      const data = await authApi.getMe();
      if (data.user) {
        onRefreshUser(data.user);
        if (data.user.role === 'TEACHER') {
          setMessage('Chúc mừng! Hồ sơ của bạn đã được phê duyệt thành công.');
        } else {
          setMessage('Hồ sơ vẫn đang trong quá trình thẩm định.');
        }
      }
    } catch {
      setMessage('Không thể kiểm tra trạng thái. Vui lòng thử lại sau.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>
      <div
        style={{
          backgroundColor: '#fffdf7',
          border: '2px solid #131a2a',
          borderRadius: '8px',
          padding: '36px 30px',
          boxShadow: '10px 10px 0 rgba(19, 26, 42, 0.18)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px', marginBottom: '24px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '8px',
              backgroundColor: status === 'REJECTED' ? '#fee2e2' : '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {status === 'REJECTED' ? (
              <ShieldAlert size={28} color="#dc2626" />
            ) : (
              <Clock size={28} color="#d97706" />
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>
                {status === 'REJECTED' ? 'Hồ sơ Giáo viên Cần Bổ Sung' : 'Hồ sơ Đang Chờ Phê Duyệt'}
              </h1>
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: status === 'REJECTED' ? '#fee2e2' : '#fef3c7',
                  color: status === 'REJECTED' ? '#991b1b' : '#92400e'
                }}
              >
                {status === 'REJECTED' ? 'TỪ CHỐI DUYỆT' : 'PENDING REVIEW'}
              </span>
            </div>

            <p style={{ fontSize: '0.92rem', color: '#475569', marginTop: '6px', lineHeight: 1.5 }}>
              {status === 'REJECTED'
                ? 'Hồ sơ đăng ký của thầy/cô chưa đủ điều kiện xác thực. Vui lòng xem lý do bên dưới và liên hệ Ban Quản trị.'
                : 'Cảm ơn thầy/cô đã đăng ký tham gia giảng dạy trên AdaptiveMath. Để đảm bảo an toàn thông tin và quyền riêng tư cho học sinh theo quy định, Ban Quản trị cần thẩm định hồ sơ công tác trước khi mở quyền tạo lớp.'}
            </p>
          </div>
        </div>

        {/* Rejection notice if any */}
        {status === 'REJECTED' && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fca5a5',
              borderRadius: '6px',
              padding: '16px',
              marginBottom: '24px'
            }}
          >
            <div style={{ fontWeight: 700, color: '#991b1b', marginBottom: '4px' }}>
              Lý do từ chối thẩm định:
            </div>
            <div style={{ fontSize: '0.9rem', color: '#7f1d1d' }}>
              {rejectionReason || 'Thông tin đơn vị công tác chưa khớp với dữ liệu thẩm tra.'}
            </div>
          </div>
        )}

        {/* Teacher Details */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '18px 20px',
            marginBottom: '24px'
          }}
        >
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
            Thông tin hồ sơ đăng ký
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <School size={16} color="#0f766e" />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Trường công tác</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>
                  {teacherProfile.schoolName || 'Chưa cung cấp'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MapPin size={16} color="#0f766e" />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Tỉnh / Thành phố</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>
                  {teacherProfile.city || 'Chưa cung cấp'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Mail size={16} color="#0f766e" />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Email liên hệ</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>
                  {currentUser?.email || 'Chưa cung cấp'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Governance & Privacy Notice (Gate 0 D-03) */}
        <div
          style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '6px',
            padding: '16px',
            marginBottom: '26px'
          }}
        >
          <div style={{ fontWeight: 700, color: '#1e40af', fontSize: '0.9rem', marginBottom: '6px' }}>
            Quy trình phê duyệt nghiêm ngặt (Quality Gate D-03)
          </div>
          <p style={{ fontSize: '0.84rem', color: '#1e3a8a', lineHeight: 1.5 }}>
            Theo Quy chuẩn Quản trị Hệ thống, tài khoản giáo viên chưa được thẩm định <strong>không thể tạo lớp học, không thể sinh mã mời và không thể truy cập dữ liệu học sinh</strong>. Sau khi Quản trị viên duyệt, tài khoản sẽ tự động chuyển sang vai trò Giáo viên chính thức.
          </p>
        </div>

        {/* Feedback message */}
        {message && (
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: message.includes('Chúc mừng') ? '#f0fdf4' : '#f8fafc',
              border: `1px solid ${message.includes('Chúc mừng') ? '#86efac' : '#cbd5e1'}`,
              borderRadius: '6px',
              color: message.includes('Chúc mừng') ? '#166534' : '#334155',
              fontSize: '0.88rem',
              marginBottom: '20px'
            }}
          >
            {message}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleCheckStatus}
            disabled={isChecking}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: '#047857',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={16} className={isChecking ? 'animate-spin' : ''} />
            <span>{isChecking ? 'Đang kiểm tra...' : 'Kiểm tra trạng thái duyệt'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

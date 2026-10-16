# OTP đăng ký qua email

Email được nhập một lần; đăng ký yêu cầu mật khẩu (8–128 ký tự), xác nhận mật khẩu và OTP 6 số. Đăng nhập hiện tại vẫn dùng email/mật khẩu. Không dùng Google Cloud.

## Cấu hình máy chủ

- `RESEND_API_KEY`: khóa gửi email của Resend; chỉ đặt trong biến môi trường máy chủ.
- `AUTH_EMAIL_FROM`: địa chỉ người gửi thuộc tên miền đã xác minh trên Resend.
- `REGISTRATION_OTP_SECRET`: khuyến nghị đặt chuỗi ngẫu nhiên riêng; nếu thiếu dùng khóa Resend làm khóa HMAC. Đổi khóa làm OTP đang chờ mất hiệu lực.

API gửi email theo https://resend.com/docs/api-reference/emails/send-email . Không đưa khóa vào biến `NEXT_PUBLIC_*`, nhật ký hoặc mã nguồn. Chưa có cấu hình thì API trả 503 và không gửi mã giả.

## Cập nhật cơ sở dữ liệu trước khi phát hành

Schema SQLite và PostgreSQL có hai bảng mới `RegistrationOtp`, `AuthEmailRateLimit`. Migration chỉ thêm bảng trong `prisma/migrations/20261013090000_registration_otp/migration.sql`. Áp dụng riêng migration này bằng quy trình quản lý DB hiện hành; không chạy toàn bộ lịch sử migration hỗn hợp SQLite/PostgreSQL, reset hay seed dữ liệu thật.

Ngày 13/10/2026, phiên EN-20261013-04 đã xác minh alias `adaptiveenglish.vercel.app` thuộc dự án `adaptivelearning`, tạo `REGISTRATION_OTP_SECRET` loại sensitive cho production, và thêm hai bảng vào Neon production. Kiểm tra schema và số lượng tài khoản/bài tập/bài nộp trước/sau PASS, không thay đổi các bản ghi hiện có. File chứa thông tin kết nối tạm đã được tiêu thụ và xóa. Chưa có `RESEND_API_KEY` hoặc `AUTH_EMAIL_FROM` trên Vercel; cần kết nối tài khoản Resend và xác minh tên miền gửi. Chưa phát hành mã OTP lên web hoặc gửi email thật.

OTP hiệu lực 10 phút, tối đa 5 lần kiểm tra/mã; gửi lại sau 60 giây, tối đa 3 lần/15 phút/email. Gửi lại vô hiệu mã cũ. Lưu HMAC, không lưu hoặc trả OTP trong API/log. Hạn mức gửi được lưu DB, tồn tại qua restart; trên Vercel thêm giới hạn 20 yêu cầu/15 phút theo địa chỉ do hosting cung cấp (băm trước khi lưu). Ngoài Vercel dùng hạn mức chung 100 yêu cầu/15 phút. Chưa có tác vụ dọn bản ghi hạn mức/OTP hết hạn; cần bổ sung khi lưu lượng tăng.

Việc tiêu thụ OTP, tạo user và sáu skill profile học sinh chung một transaction. Tài khoản cũ không cần OTP để đăng nhập. Cần kiểm tra thư thực tế và luồng đăng ký trên môi trường thử sau khi cấu hình email và migration.

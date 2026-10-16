# Kiểm tra kết nối MWAPI

- Ngày kiểm tra: 2026-10-11 (Asia/Saigon)
- Người thực hiện: Codex
- Phạm vi: cấu hình local và endpoint production `https://adaptiveenglish.vercel.app/api/ai/tutor`.

## Kết quả

- Endpoint production trả `success=true`, `isConfigured=true`, provider `mwapi`, model `claude-sonnet-4-6`.
- Một yêu cầu thử nghiệm không chứa dữ liệu cá nhân gửi tới MWAPI trả HTTP 200, có nội dung, kết thúc bình thường và JSON hợp lệ.
- Không thay biến môi trường, API key, dữ liệu người dùng hoặc deployment vì kết nối đã hoạt động.

## Kiểm tra đã chạy

- Lần đầu chạy lệnh Node inline: FAIL trước khi gửi request do lỗi cú pháp PowerShell/escape trong câu lệnh.
- Chạy lại bằng script tạm dùng `.env.local`: PASS; HTTP 200, `hasText=true`, `stopReason=end_turn`, `parsedOk=true`.
- Script tạm đã được xóa ngay sau kiểm tra. Giá trị API key không được ghi vào log này.

## Giới hạn

- POST trợ lý AI production yêu cầu người dùng đăng nhập. Lần này không tạo tài khoản thử hay thay đổi dữ liệu production để kiểm tra luồng UI đăng nhập.

# Kiểm tra thẻ tỷ lệ làm đúng

- Ngày: 2026-10-10 (Asia/Saigon)
- Phạm vi: thẻ thứ ba trên trang local `/student/progress`; chưa deploy production.
- Đổi tiêu đề từ “Tỷ lệ làm đúng độc lập” thành “Tỷ lệ làm đúng”.
- Áp dụng font `Calibri, Arial, sans-serif` cho toàn bộ thẻ và bỏ lớp font monospace ở giá trị.
- `npx tsc --noEmit`: PASS, exit code 0.
- Browser xác nhận tiêu đề mới xuất hiện một lần, tiêu đề cũ không còn và computed font là `Calibri, Arial, sans-serif`.
- Không thay dữ liệu hoặc cách tính tỷ lệ.

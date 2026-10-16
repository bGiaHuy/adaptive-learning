# Kiểm tra rút gọn tiêu đề khóa học

- Ngày: 2026-10-10 (Asia/Saigon)
- Phạm vi: trang local `/student/learn`; chưa deploy production.
- Thay đổi: tiêu đề nhóm được hiển thị thành `Tiếng Anh 6`, `Tiếng Anh 7`, `Tiếng Anh 8`, `Tiếng Anh 9` và `Tiếng Anh B1`. Tên lưu trong dữ liệu không đổi.
- `npx tsc --noEmit`: PASS, exit code 0.
- Browser DOM xác nhận đủ năm tiêu đề theo thứ tự trên; quan sát trực quan nhóm Tiếng Anh 7 đạt.
- Không thay dữ liệu bài học, tài khoản hoặc bài làm.

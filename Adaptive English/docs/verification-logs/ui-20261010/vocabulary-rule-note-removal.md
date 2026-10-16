# Kiểm tra xóa ghi chú quy tắc từ vựng

- Ngày: 2026-10-10 (Asia/Saigon)
- Phạm vi: trang local `/student/vocabulary`; chưa deploy production.
- Đã xóa toàn bộ dòng “Quy tắc Đạt Thành Thạo (Mastery Rule)” và nhãn “FSRS v5 Algorithm” khỏi giao diện.
- Giữ nguyên lựa chọn hạn mức từ mới và cảnh báo chỉ xuất hiện khi người dùng chọn “Không giới hạn”.
- `npx tsc --noEmit`: PASS, exit code 0.
- Browser DOM: hai chuỗi đã xóa đều có số phần tử bằng 0; quan sát trực quan bố cục đạt.
- Không thay thuật toán FSRS, API, dữ liệu từ vựng hoặc tài khoản.

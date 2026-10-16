# Kiểm tra nhãn bộ lọc khối lớp

- Ngày: 2026-10-10 (Asia/Saigon)
- Phạm vi: trang local `/student/learn`; chưa deploy production.
- Bỏ hậu tố “(Global Success)” khỏi bộ lọc Lớp 6, 7, 8 và 9; bộ lọc B1 giữ nguyên.
- `npx tsc --noEmit`: PASS, exit code 0.
- Browser xác nhận bốn nhãn lần lượt là Lớp 6, Lớp 7, Lớp 8, Lớp 9 và không còn “Global Success” trong nhóm nút khối lớp.
- Không thay logic lọc hoặc dữ liệu khóa học.

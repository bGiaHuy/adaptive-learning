# Kiểm tra rút gọn danh sách bài học

- Ngày kiểm tra: 2026-10-10 (Asia/Saigon)
- Người thực hiện: Codex
- Phạm vi: trang `/student/learn` trên bản local; không deploy production.

## Thay đổi đã thực hiện

- Xóa khối “Cam Kết Minh Bạch Về Phạm Vi Học Liệu & Bản Quyền Sư Phạm”.
- Trong mỗi thẻ bài học, bỏ số thứ tự, nhãn trạng thái, mô tả và nguồn học liệu.
- Giữ tiêu đề chính, thời lượng, số câu hỏi và nút thao tác.
- Đổi nội dung thống kê từ “dạng câu hỏi tương tác” thành “câu hỏi”.

## Kiểm tra đã chạy

- `npx tsc --noEmit`: PASS, exit code 0.
- Khởi động Next.js 14.2.35 ở chế độ phát triển tại `http://localhost:3008`: PASS, server báo Ready.
- Quan sát DOM trong browser tại `/student/learn`: không còn banner; các thẻ hiển thị tiêu đề, thời lượng, số câu hỏi và nút.
- Quan sát trực quan viewport mặc định: PASS.
- Quan sát trực quan viewport 390 × 844: PASS; thẻ xếp dọc, nội dung chính và nút vẫn đọc và thao tác được.
- `npm run lint`: chưa chạy hoàn tất vì dự án chưa có cấu hình ESLint và lệnh mở trình cấu hình tương tác; không ghi nhận là PASS.

## Giới hạn

- Chưa deploy thay đổi này lên Vercel.
- Không thay dữ liệu bài học, tài khoản hoặc bài làm.

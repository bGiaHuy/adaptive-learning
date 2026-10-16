# EN-20261011-06 — Dọn trang kết quả Writing

Ngày đối chiếu: 2026-10-11, Asia/Saigon.

## Phạm vi thay đổi

- Khi một bài đã có kết quả AI, giao diện không còn hiển thị nút `Chấm lại bằng AI`; API và dữ liệu điểm không đổi.
- Mỗi đề Writing được đặt trong một `article` riêng, có nhãn `Câu n`, tiến độ `n / tổng`, tiêu đề đề bài và kết quả AI cùng một bề mặt.
- Xóa dòng `Kết quả phiên học được lưu trên thiết bị · Tiến độ thích ứng đã được cập nhật` khỏi đầu trang.
- Khi tất cả câu đã được chấm, thẻ tổng quan đổi thành `Điểm và góp ý AI cho từng câu được trình bày bên dưới.`
- Không sửa dữ liệu bài làm, không gọi lại AI để kiểm thử, không reset/seed DB và không deploy.

## Kiểm tra thực

- `node node_modules/typescript/bin/tsc --noEmit`, thư mục `english-learning-platform`: PASS, exit 0.
- Browser desktop: `Chấm lại bằng AI` = 0 nút; dòng trạng thái kỹ thuật = 0 phần tử; có 2 thẻ `article` cho 2 câu; thông điệp tổng quan mới = 1 phần tử.
- Browser mobile 390 × 844: quan sát trực tiếp tiêu đề bài, thẻ `Câu 1`, đề bài và phần chấm xếp một cột, không tràn ngang. Đã đặt lại viewport mặc định sau kiểm tra.
- Ảnh `summary-question-card-cleanup.png` chứng minh trạng thái nhìn thấy trên desktop; ảnh không chứng minh toàn bộ tương tác hoặc production.
- Chưa chạy build hoặc bộ test toàn ứng dụng vì thay đổi chỉ ở JSX/trình bày. Word chưa kiểm tra phân trang trực quan vì không có `soffice` trong PATH.

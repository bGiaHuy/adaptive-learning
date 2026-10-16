# EN-20261011-07 — Thiết kế lại phần xem chi tiết Writing

Ngày đối chiếu: 2026-10-11, Asia/Saigon.

## Phạm vi thay đổi

- Mỗi kết quả trong phần `Xem lại chi tiết từng câu hỏi` là một thẻ riêng.
- Phần đề bài dùng header xanh nhạt, có nhãn `Câu n`, `Đề bài` và trạng thái kết quả.
- Phần `Bạn đã trả lời` dùng nền vàng nhạt, giữ nguyên xuống dòng của bài viết và làm nổi bật nội dung học sinh nhập.
- Phần `Giải thích` dùng nền tím nhạt, tách khỏi đề bài và câu trả lời.
- Không hiển thị feedback cũ `Đã ghi nhận bài viết (…) Đang gửi đến giáo viên/AI chấm rubric chi tiết` đối với Writing. Feedback của loại câu hỏi khác vẫn được giữ.
- Không sửa điểm, kết quả AI, nội dung bài làm, API hoặc DB; không gọi lại AI và không deploy.

## Kiểm tra thực

- `node node_modules/typescript/bin/tsc --noEmit`, thư mục `english-learning-platform`: PASS, exit 0.
- Browser desktop: chuỗi trạng thái Writing cũ = 0; có 2 thẻ review, 2 nhãn `Đề bài`, 2 vùng câu trả lời và 2 vùng giải thích.
- Quan sát trực tiếp desktop: màu sắc và khoảng cách phân biệt rõ ba loại nội dung, bài email giữ nguyên dòng và không chồng chữ.
- Browser mobile 390 × 844: vùng câu trả lời và giải thích xếp một cột, không tràn ngang; viewport đã reset sau kiểm tra.
- Ảnh `review-details-redesign.png` chứng minh phần câu trả lời và giải thích nhìn thấy trên desktop; không chứng minh toàn bộ tương tác hoặc production.
- Chưa chạy build hoặc bộ test toàn ứng dụng vì thay đổi chỉ ở JSX và style. Word chưa kiểm tra phân trang trực quan vì không có `soffice` trong PATH.

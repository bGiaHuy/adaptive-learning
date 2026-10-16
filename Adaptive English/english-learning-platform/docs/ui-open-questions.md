# UI Open Questions & Pending Decisions — Adaptive Study

## Goal
Tài liệu này ghi nhận toàn bộ các quyết định sư phạm, nghiệp vụ và kỹ thuật chưa được chốt dứt điểm trong giai đoạn **FRONTEND UI PROTOTYPE**. Các màn hình UI liên quan vẫn được dựng đầy đủ với trạng thái mô phỏng rõ ràng, kèm nhãn `PENDING` tương ứng để nhóm sản phẩm và các bên liên quan dễ dàng rà soát và phê duyệt.

---

## 1. DANH MỤC CÁC CÂU HỎI & QUYẾT ĐỊNH ĐANG CHỜ (PENDING DECISIONS)

### UI-Q-001: Phạm Vi Cài Đặt Tắt/Bật AI Tutor Của Giáo Viên Trong Classroom
* **Vấn đề**: Khi giáo viên muốn hạn chế học sinh sử dụng gợi ý AI Tutor trong các bài tập đánh giá năng lực thực, quyền kiểm soát này nên ở cấp độ nào?
  - *Phương án A*: Bật/tắt cho toàn bộ lớp học (Class-level toggle).
  - *Phương án B*: Bật/tắt riêng cho từng bài tập cụ thể khi giao (Assignment-level toggle).
  - *Phương án C (Đề xuất UI)*: Mặc định bật toàn lớp; cho phép giáo viên ghi đè (Override) tắt AI đối với các bài kiểm tra/bài thi quan trọng.
* **Hiện trạng Prototype**: UI hiển thị toggle ở cả cài đặt lớp học và form giao bài, gắn nhãn `[PENDING: Chờ chốt phạm vi cấu hình]`.

---

### UI-Q-002: Tiêu Chí & Cơ Chế Của Bài Test Nhảy Trình (Level-Skip Test)
* **Vấn đề**: Học sinh muốn nhảy qua các bài học căn bản để tiếp cận bài học khó hơn cần thỏa mãn những tiêu chí nào?
  - *Ngưỡng điểm đạt*: Đạt tỷ lệ đúng bao nhiêu phần trăm (vd: $\ge 80\%$ hay $\ge 85\%$)?
  - *Giới hạn số lần thử*: Mỗi kỹ năng được làm test nhảy trình bao nhiêu lần (vd: tối đa 2 lần/tuần để tránh brute-force)?
  - *Phạm vi nhảy*: Vượt qua bài test thì nhảy hết 1 Unit hay nhảy thẳng qua cả 1 Course level (từ A2 lên B1)?
* **Hiện trạng Prototype**: UI cung cấp nút *"Làm bài test nhảy trình"* trên màn hình Learn, mô phỏng bài test 5 câu với ngưỡng đạt tạm thời 80%, có nhãn ghi chú `[PENDING: Quy chế nhảy trình]`.

---

### UI-Q-003: Chính Sách Deadline & Cho Phép Nộp Lại Bài Lớp (Late & Re-submission)
* **Vấn đề**: Cơ chế xử lý bài tập sau hạn chót (Deadline) trong Classroom:
  - Có cho phép nộp muộn sau deadline với nhãn *"Nộp muộn"* hay khóa cứng nút nộp bài?
  - Sau khi giáo viên trả bài kèm nhận xét, học sinh có được quyền nộp bản sửa lại (Resubmit Revision) để giáo viên chấm lại hay không?
* **Hiện trạng Prototype**: UI hiển thị nhãn deadline rõ ràng; cho phép nộp muộn có cảnh báo; luồng chấm bài của giáo viên có nút cho phép *"Yêu cầu học sinh làm lại"*.

---

### UI-Q-004: Cơ Chế Cưỡng Chế Hạn Ngạch Từ Vựng Mới Khi Tồn Đọng Ôn Tập (Overwhelm Gate)
* **Vấn đề**: Khi số lượng thẻ từ vựng đến hạn ôn tập trong ngày vượt quá 25 thẻ (nguy cơ vỡ nợ ôn tập):
  - *Phương án A (Khuyên mềm)*: Hệ thống chỉ hiện banner đề xuất *"Bạn đang tồn 28 thẻ ôn, nên tập trung giải quyết trước khi nạp thêm từ mới"*, người học vẫn có thể bấm học từ mới nếu muốn.
  - *Phương án B (Cưỡng chế sư phạm)*: Khóa tạm thời nút nạp từ mới từ kho `Đã lưu` vào `Đang học` cho đến khi số thẻ đến hạn giảm xuống dưới 25 thẻ.
* **Hiện trạng Prototype**: UI hiển thị cảnh báo màu hổ phách (Warning), mặc định ưu tiên tab *"Ôn tập ngay"* và nút nạp từ mới hiển thị lời nhắc xác nhận.

---

### UI-Q-005: Tiêu Chí Chi Tiết Của AI Assessment Cho Kỹ Năng Speaking
* **Vấn đề**: Khi học sinh gửi đoạn ghi âm nói trong phần Tự học:
  - Phân tích chi tiết cả 4 tiêu chí chuẩn IELTS (Fluency, Lexical Resource, Grammatical Range & Accuracy, Pronunciation)?
  - Hay chỉ đưa ra nhận xét tổng quan về độ trôi chảy và mức CEFR ước lượng?
* **Hiện trạng Prototype**: UI mô phỏng bảng đánh giá 4 tiêu chí với điểm ước lượng và lời nhận xét sư phạm cụ thể, kèm nhãn bắt buộc: *"Đánh giá do AI mô phỏng demo — Không gửi âm thanh lên máy chủ"*.

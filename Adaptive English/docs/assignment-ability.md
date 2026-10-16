# Điểm năng lực từ bài giáo viên giao

Áp dụng cho bài giao thường và bài xuất bản từ DOCX, theo yêu cầu chủ dự án ngày 12/10/2026. Đây là công thức điểm riêng của Adaptive English, không phải Elo thi đấu chuẩn hoặc chứng nhận CEFR.

## Khi giao hoặc tạo phiên bản đề mới

Máy chủ gửi đề và câu hỏi đã chọn tới MWAPI hiện có để ước lượng độ khó 100–2400 điểm. Lưu kết quả vào `AssignmentVersion.difficultyJson`, kèm kỹ năng, thang điểm, độ tin cậy, lý do và thời điểm đánh giá. Mốc nội bộ: A1=400, A2=800, B1=1200, B2=1600, C1=2000, C2=2400. Nhãn giao diện chỉ là tham khảo.

Mỗi phiên bản có đánh giá riêng. Không lấy điểm mức bài do frontend gửi lên. Khi AI lỗi, thiếu cấu hình, lớp tắt AI hoặc đề thiếu ngữ cảnh cần thiết, vẫn giao bài nhưng lưu trạng thái unavailable; không tự tạo điểm khó giả. Bài cũ chưa có metadata không được hồi tố tự động.

## Khi công bố điểm

- Điểm lượt làm = điểm đạt / thang điểm phiên bản × mức bài do AI đánh giá.
- Năng lực mới = 0,8 × năng lực cũ + 0,2 × điểm lượt làm.
- Khi chưa có bằng chứng năng lực trước đó, lượt đã chấm đầu tiên là điểm khởi đầu; không tạo điểm nền giả.
- Ví dụ mức bài1200, điểm8/10 → lượt làm960. Năng lực cũ1200 → năng lực mới1152.
- Lưu nháp điểm hoặc nhận xét AI chưa duyệt không cập nhật năng lực. Trắc nghiệm công bố ngay dùng điểm máy chủ tự chấm.

Lưu snapshot vào `Submission.abilityEvidenceJson` cùng transaction công bố điểm. API tiến độ tổng hợp lại từ các bài đã công bố theo thời điểm công bố lần đầu, mỗi submission chỉ một lần. Sửa điểm thay snapshot cũ, giữ thứ tự cũ, nên tải lại hoặc bấm lưu nhiều lần không cộng dồn. Dùng mức/thang điểm đúng phiên bản đã nộp, dù đề hiện tại đã thay đổi.

## Hồ sơ hiện có

Hệ thống trước đây tổng hợp phần trăm và mức A1/A2/B1 từ đầu vào, bài học và điểm lớp. Khi có bài mới đủ metadata AI, mức nền hiện có được ánh xạ sang mốc nội bộ400/800/1200 rồi áp dụng80/20. Điểm lớp có metadata mới không đồng thời được tính vào trung bình phần trăm, tránh đếm hai lần. Các nguồn cũ vẫn giữ cách tổng hợp đã có; không xóa hay viết lại lịch sử.

Kết quả trả riêng từng kỹ năng qua API tiến độ, gồm abilityRating, level tham khảo và scoreDisplay; radar sử dụng hồ sơ đó khi mở lại trang tiến độ. DOCX hiện dùng kỹ năng chính reading như luồng hiện có, chưa phân bổ điểm riêng cho từng kỹ năng trong một đề hỗn hợp.

## Triển khai và kiểm tra

Migration bổ sung hai cột nullable ở cả schema SQLite và PostgreSQL, không reset/seed. Đã áp hai cột trên DB local và xác nhận counts không đổi. Production chưa áp migration/chưa deploy; cần áp hai câu ALTER TABLE trước khi đưa mã này lên web.

Kiểm thử bằng provider giả và DB SQLite riêng; chưa đánh giá chất lượng độ khó bằng dịch vụ AI thật hoặc thực nghiệm học sinh. Cần theo dõi/hiệu chỉnh thang điểm khi có dữ liệu được phép sử dụng.

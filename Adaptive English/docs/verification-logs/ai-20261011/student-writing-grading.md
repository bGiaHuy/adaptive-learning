# EN-20261011-03 — Học sinh chấm Writing trực tiếp

Đối chiếu 2026-10-11 Asia/Saigon.
- Thêm WritingEvaluation dùng chung trong bài học (sau Hoàn tất bài viết) và trang kết quả phiên học. Nút gọi /api/ai/evaluate mode real, có loading, lỗi/thử lại, điểm /9, ba tiêu chí, ưu điểm/cần cải thiện. Nhận xét lưu cùng kết quả trên thiết bị; không phải duyệt admin.
- API lấy đề/tiêu chí theo lessonId/questionId từ học liệu server, từ chối bài không sẵn sàng/chưa phê duyệt. Gửi đúng yêu cầu độ dài theo đề. Bài học Writing cho đánh giá từ 5 từ; workspace không có ngữ cảnh vẫn giữ tối thiểu 10 từ. Không thay cấu trúc câu hỏi.
- Bỏ thông báo đang gửi giáo viên/AI vì thao tác kiểm tra cũ không gửi. Trang kết quả Writing hiển thị hoàn thành thay cho tỷ lệ đúng từ việc nhận bài.
- Kết quả AI là điểm tham khảo độc lập, không ghi đè điểm giáo viên, không reset/seed DB. Không deploy.

## Kiểm tra thực
- Lần đầu chạy tsc ở gốc workspace: FAIL MODULE_NOT_FOUND, exit 1 (sai thư mục công cụ). Chuyển vào english-learning-platform: node node_modules/typescript/bin/tsc --noEmit PASS exit 0. Sau cập nhật cuối chạy lại: PASS exit 0.
- node --test tests/mwapi.test.cjs: PASS 8/8, exit 0. Có test mới kiểm tra bài học ngắn 5–9 từ dùng đúng đề/tiêu chí, bản 4 từ bị chặn và ngưỡng mặc định không giảm. Các test lỗi upstream/không bịa điểm và giáo viên tắt AI đều PASS. Test dùng fetch giả, không gọi provider thật.
- Browser đang mở kết quả phiên của chủ dự án: trực tiếp quan sát cả hai bài Writing có kết quả MWAPI; bài email có điểm 7.0/9, nhận xét và ba tiêu chí, nút Chấm lại bằng AI. Người dùng đã bấm chấm trong lúc cập nhật; không gán thao tác này cho agent. Agent tải lại trang và xác nhận hai kết quả vẫn còn (persistence PASS).
- POST /api/ai/evaluate không cookie, nội dung giả: HTTP 401, exit 0; auth vẫn bắt buộc.
- Không chủ động nộp thêm bài hay sửa DB để kiểm thử. Không chạy build hoặc kiểm thử toàn production. Chưa diễn tập lỗi kết nối trong browser cho component mới; xử lý lỗi gateway đã được kiểm bằng test giả lập.
- Ảnh student-writing-score.png chụp riêng khung chấm email, không chụp thông tin tài khoản. Chỉ chứng minh UI nhìn thấy.
- Word chưa render phân trang trực quan vì thiếu soffice.

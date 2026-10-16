# Nghiệm thu video showcase — 12/10/2026

Video: adaptive-english-showcase-vi.mp4. 353.10 giây, 17 cảnh, Full HD 1920×1080, 30fps, H.264/AAC. SHA-256: 766b52145a455d425e8aa9f071ea03b78eb8cf972bed51de874c07b44ec47ed5.

Giọng tổng hợp tiếng Việt vi-VN-HoaiMyNeural qua Microsoft Edge online TTS. Chủ dự án đã cho phép gửi các đoạn kịch bản SCRIPT.md đến dịch vụ này sau khi auto-review yêu cầu phê duyệt payload và đích nhận. Chỉ gửi lời review, không tài khoản, dữ liệu học sinh hoặc mã nguồn.

## Kiểm tra trực tiếp

- prepare.py: tạo DB rỗng từ schema; copy nguồn hiện tại sang runtime riêng. Không sao chép tài khoản hay bài nộp. node start.cjs chạy Next14.2.35 trên localhost3021.
- node capture.cjs: bộ quay cuối exit0, 9 cảnh mới có mã hóa exit0 trong capture.json. Quan sát tạo lớp, giao bài thành công, học sinh tham gia/nộp, giáo viên lưu điểm/chưa công bố rồi công bố, học sinh nhận8.5/10 và nhận xét, mở sổ điểm, màn hình DOCX. Không coi các cảnh này là full-suite/production E2E.
- API /api/placement được gọi với dữ liệu trống completed=true CHỈ cho tài khoản thử trong DB cô lập để chuẩn bị điều kiện nộp bài. Đây là fixture minh họa, không phải bài đầu vào thật hay bằng chứng trình độ. DB chính và production không thay đổi.
- produce.py --voices exit0:17 MP3 cùng timing từ. Có NoAudioReceived ở grade/DOCX, đã retry thành công; không thay lời thiếu bằng silence.
- produce.py exit0:17 đoạn và ghép MP4; có phụ đề hardsub, SRT, timeline, mục lục.
- verify.py exit0: giải mã toàn bộ hình/âm thanh;0 lỗi codec. Mean -21.9dB, peak -5.8dB, không clipping. Trích17 ảnh giữa chương và contact sheet. Kiểm tra kỹ thuật không thay thế người nghe nghiệm thu liên tục toàn bộ lời đọc.
- Các cảnh học sinh từ bộ review11/10/2026 được ghi rõ TƯ LIỆU11/10/2026 trên video và lời dẫn. Nguồn raw được trỏ trong plan/capture cũ, không sửa lịch sử.

## FAIL/BLOCKED và xử lý

- Cài công cụ giọng/video trong sandbox FAIL do mạng WinError10013; cài lại được cấp quyền exit0. Công cụ cũ bị ACL AccessDenied; tạo tools mới trong thư mục video.
- Quay lần đầu FAIL spawn EPERM; chạy Chrome/FFmpeg được cấp quyền. Tiếp theo biểu mẫu giao bài báo Không tìm thấy lớp học do state lựa chọn chưa đồng bộ; giữ failed-take-1, chọn lớp chủ động rồi quay xác nhận Đã giao bài thành công. Không sửa mã sản phẩm trong phiên video.
- Lần nộp đầu FAIL chờ textarea vì gate đầu vào; giữ failed-take-2. API fixture đầu vào500 thiếu PlacementAttempt trong DB demo. Lệnh Prisma sai đường dẫn FAIL MODULE_NOT_FOUND; chạy lại đúng đường dẫn `node ../../../node_modules/prisma/build/index.js db push --schema prisma/schema.prisma --skip-generate` trong runtime exit0; chỉ DB cô lập. Quay tiếp exit0.
- Cảnh sổ điểm đầu chưa mở đúng tab; giữ gradebook-before-tab.mp4 và quay lại đúng Sổ điểm lớp học.
- Khi kiểm tra ảnh chương, cảnh vào lớp dùng lại tài khoản đã tham gia và hiện cảnh báo trùng; quay lại bằng tài khoản minh họa mới. Sau tham gia, danh sách bài tập chưa refresh ngay; tải lại trang rồi xác nhận bài My favourite place xuất hiện. Các bản dựng/cảnh trước sửa giữ trong draft-v1; đây là phát hiện giao diện chưa sửa mã sản phẩm.
- Auto-review BLOCKED gửi kịch bản tới TTS trước phê duyệt. Kiểm tra giọng local chỉ có en-US/ja-JP; chủ dự án đã phê duyệt Microsoft Edge TTS rồi mới thực hiện.

## Giới hạn

DOCX chỉ giới thiệu màn hình/quy trình; chưa chạy tạo câu hỏi tài liệu mới. Bài viết AI/Tutor/Leaf dùng tư liệu quay11/10, không phải xác minh provider production hôm nay. Chấm phát âm AI chưa tích hợp; đã nói rõ trong lời dẫn. Không deploy, không reset/seed/xóa DB chính, không dữ liệu học sinh thật hoặc công khai video. Word chưa kiểm tra phân trang trực quan do không có renderer trong PATH.

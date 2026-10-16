# Hướng dẫn làm việc với Adaptive English

## Phạm vi

Áp dụng cho toàn workspace và ứng dụng `english-learning-platform/`. Sản phẩm này là English. Không đưa yêu cầu đổi định dạng trắc nghiệm, đúng/sai hoặc trả lời ngắn dành riêng cho Math vào English nếu chủ dự án chưa yêu cầu.

## Bắt buộc cập nhật nhật ký sản phẩm và nghiên cứu

Trước khi làm, đọc `docs/research-journal/NHAT_KY_NGHIEN_CUU.md` và những mục liên quan trong `docs/WORKLOG.md`. Sau mỗi phiên có thay đổi sản phẩm, học liệu, tài liệu, video, kiểm thử hoặc phát hiện lỗi quan trọng, cập nhật nhật ký trong cùng phiên, trước khi báo hoàn thành. Quy định áp dụng cho Codex, Antigravity và các agent khác làm việc trong thư mục này; không phải tác vụ chạy nền.

1. `docs/research-journal/journal.json` là nguồn dữ liệu chuẩn; không chỉ sửa bản Word. Thêm một entry với ID duy nhất, ngày thực tế theo Asia/Saigon, loại `observed` cho công việc đã trực tiếp thực hiện hoặc `retrospective` cho nội dung tổng hợp từ nguồn cũ. Không dùng thời gian sửa file làm ngày nghiên cứu.
2. Mỗi entry có `id`, `kind`, `title`, `date`, `stage`, `status`, `participants`, `objective`, `equipment`, `procedure`, `results`, `lessons`, `next`, `evidence`. Ghi mục tiêu, công cụ/phiên bản nếu biết, thao tác/phương pháp, kết quả, sai sót, hướng tiếp theo và vai trò từng người. Không biết giờ, địa điểm, thành viên hoặc kết quả thì ghi rõ chưa xác nhận; không tự điền tên học sinh.
3. Ghi chính xác kiểm thử ĐÃ CHẠY: lệnh hoặc thao tác, môi trường, kết quả, mã thoát nếu có và đường dẫn log. Tồn tại file test không có nghĩa test đã chạy; ảnh màn hình chỉ chứng minh nội dung nhìn thấy. Giữ cả FAIL/BLOCKED và cách xử lý. Không đổi kết quả cũ thành PASS vì lần sau đã sửa.
4. Phân biệt kết quả đọc từ báo cáo cũ, kết quả trực tiếp quan sát và công việc dự kiến. Kế hoạch làm video, deploy hoặc sửa auth không được ghi là đã hoàn thành. Không bịa số liệu, ngày buổi nghiên cứu, khảo sát, chữ ký hay xác nhận của giáo viên. Không ép nhật ký thành 15 buổi thực tế từ 15 hạng mục biên tập.
5. Mỗi minh chứng có mã trong `evidence.json`, đường dẫn tương đối từ workspace, thời điểm đối chiếu và SHA-256. Lưu log/ảnh/tài liệu mới trong thư mục minh chứng phù hợp; khi cần giữ lịch sử, tạo bản riêng theo ID phiên. Không ghi secret, token, mật khẩu hoặc dữ liệu cá nhân thật vào nhật ký hay bản xuất chia sẻ. Không ghi đè log cũ.
6. Với nguồn đã thay đổi, giữ bản ghi/hash cũ và thêm mã minh chứng mới. Không sửa hash cũ để giả rằng nội dung mới là minh chứng lịch sử. Link Drive chưa có thì ghi chưa cung cấp, không tạo link giả.
7. Chạy `scripts/export_research_journal.py` bằng Python có `lxml` để đồng bộ `NHAT_KY_NGHIEN_CUU.md` và `NHAT_KY_NGHIEN_CUU_ADAPTIVE_ENGLISH.docx`. Script dùng bản mẫu giữ tại `docs/research-journal/qa/reference.docx`; không sửa bản mẫu. Chạy `--check` sau xuất để kiểm tra đồng bộ, XML, nguồn và tính toàn vẹn của mẫu.
8. Khi sửa nội dung Word, render lại và kiểm tra tất cả trang nếu có công cụ. Nếu không có renderer, vẫn lưu nguồn và bản Word nhưng báo rõ chưa kiểm tra phân trang trực quan; không tuyên bố bố cục đã được nghiệm thu.
9. Thêm tóm tắt ngắn, đường dẫn entry và minh chứng vào cuối `docs/WORKLOG.md`; giữ lịch sử cũ. Nếu tài liệu cũ mâu thuẫn log gốc, ghi đính chính mới, không âm thầm xóa dấu vết.
10. Trước khi kết thúc, xác nhận entry phản ánh đúng phạm vi vừa làm và các bản xuất khớp dữ liệu chuẩn. Báo người dùng đường dẫn nhật ký, giới hạn còn lại và việc kiểm thử thực sự đã thực hiện.

## Mẫu nội dung một phiên mới

- ID và ngày: `EN-YYYYMMDD-NN`, ngày thực tế; giờ và địa điểm nếu có.
- Trạng thái: hoàn thành / một phần / bị chặn / cần đối chiếu.
- Thành viên và vai trò: người thực hiện, người hỗ trợ; phần chưa biết để chưa xác nhận.
- Sáu mục: mục tiêu; dụng cụ; tiến trình và quan sát; dữ liệu và kết quả; sai sót và bài học; kế hoạch tiếp theo.
- Minh chứng: mã, đường dẫn, phạm vi chứng minh, kết quả kiểm tra.
- Xác nhận: để người có thẩm quyền ký thực tế; agent không tự ký thay.

## Bảo toàn dữ liệu

Không reset/seed database, xóa bài nộp, thu âm, học liệu hoặc thay đổi của người dùng chỉ để làm kiểm thử. Các thao tác kiểm thử có ghi dữ liệu cần môi trường riêng hoặc dữ liệu thử được kiểm soát. Không tự phát hành web hay chia sẻ hồ sơ riêng tư công khai.

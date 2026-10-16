# Kiểm tra nhật ký nghiên cứu ngày 10 tháng 10 năm 2026

## Phạm vi đã kiểm tra

- Đọc toàn bộ nội dung mẫu Word, các tài liệu và nguồn được dẫn trong danh mục.
- Khởi tạo 14 hạng mục hồi cứu và 1 phiên ghi nhận trực tiếp, 28 mã minh chứng. Các hạng mục hồi cứu không có ngày hoặc người thực hiện đã được xác nhận.
- Chạy công cụ xuất và chế độ `--check` bằng Python runtime đi kèm workspace.
- Nội dung JSON đủ trường, ID không trùng, mã minh chứng hợp lệ: PASS.
- Markdown khớp dữ liệu nguồn; Word chứa ID, tiêu đề và toàn bộ sáu mục của từng entry: PASS.
- DOCX đọc được như gói ZIP/XML; danh sách package parts giữ nguyên so với mẫu. Mọi part ngoài word/document.xml không thay đổi; phần định dạng trang và footer giữ nguyên: PASS.
- Không còn nội dung PHONE hoặc YOLO của đề tài mẫu trong thân nhật ký English: PASS.
- Tất cả 28 đường dẫn minh chứng tồn tại và khớp SHA-256 tại thời điểm chốt hồ sơ: PASS.

## Kiểm tra trực quan chưa thực hiện được

Đã gọi render_docx.py cho mẫu và bản cuối. Cả hai lần kết thúc với mã thoát 1: `FileNotFoundError: LibreOffice soffice.exe was not found on PATH`. Không có PNG/PDF để kiểm tra phân trang, chữ bị cắt, phần ký hoặc ngắt trang. Không tuyên bố bản Word đã được kiểm tra trực quan. Cần render và xem toàn bộ trang khi có renderer; bản Markdown và nội dung Word đã được kiểm tra cấu trúc.

## Những việc không làm trong phiên này

Không chạy lại build hoặc test ứng dụng; không sửa auth, khôi phục mật khẩu, học liệu, AI hay database; không quay video; không deploy. Các kết quả kiểm thử trong nhật ký hồi cứu là đọc từ log cũ, không phải kết quả mới. Không xác nhận hiệu quả học tập của sản phẩm.

## Mâu thuẫn nguồn đã ghi lại

WORKLOG cũ ghi 10/10 bộ kiểm thử đạt, trong khi raw-tests.log ngày 08/10/2026 kết thúc bằng PASSED 5/10. Log trình duyệt chứa lỗi tải 404; network errors bằng 0 không loại trừ HTTP errors. Đã thêm đính chính ở cuối WORKLOG, giữ nguyên nội dung cũ và log gốc.

## Điều kiện hoàn thiện hồ sơ để nộp

Người thực hiện bổ sung ngày, giờ, địa điểm, tên và vai trò thực tế; đối chiếu ghi chép gốc; bổ sung link minh chứng và xác nhận giáo viên; kiểm tra quy định cuộc thi; render kiểm tra bản Word. Không đổi nội dung hồi cứu thành hoạt động đã được xác nhận khi chưa có căn cứ.

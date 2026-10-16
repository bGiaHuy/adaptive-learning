# Nhật ký nghiên cứu Adaptive English

`journal.json` là nguồn nội dung chuẩn. `evidence.json` lưu mã minh chứng, đường dẫn, mã băm và ngày đối chiếu. `NHAT_KY_NGHIEN_CUU.md` là bản đọc được trên máy; `NHAT_KY_NGHIEN_CUU_ADAPTIVE_ENGLISH.docx` là bản Word theo mẫu người dùng cung cấp.

Các mục EN-HC là tổng hợp hồi cứu, không phải các buổi nghiên cứu đã xác nhận. Không tự gán ngày hoặc tên người thực hiện. Phiên EN-20261010-01 ghi công việc đọc nguồn và lập hồ sơ thực hiện ngày 10/10/2026. Không coi kết quả kiểm thử lịch sử là kết quả kiểm tra phiên này.

## Cập nhật sau mỗi phiên

1. Đọc `../../AGENTS.md`.
2. Thêm phiên thực tế vào `journal.json`; thêm minh chứng mới vào `evidence.json` và giữ các bản ghi cũ. Không lưu khóa, mật khẩu hoặc dữ liệu người học thật trong nội dung xuất.
3. Chạy `scripts/export_research_journal.py` từ workspace bằng Python có lxml, rồi chạy lại với `--check`.
4. Ghi tóm tắt vào `../WORKLOG.md`. Nếu WORKLOG được dùng làm minh chứng đã băm, giữ mã băm cũ để phát hiện thay đổi; bổ sung mã mới hoặc lưu bản chụp theo phiên khi cần.
5. Render và kiểm tra tất cả trang Word khi có công cụ; cập nhật báo cáo QA sau mỗi lần xuất. Script chỉ kiểm tra nội dung/XML, không kiểm tra phân trang.

`qa/reference.docx` là bản mẫu nguyên vẹn dùng để xuất, không phải nhật ký English để nộp. `qa/artifact.md` mô tả định dạng nguồn. Không sửa hai tệp này tùy tiện. Script `init_research_journal.py` chỉ dùng khởi tạo lần đầu, sẽ từ chối nếu nguồn nhật ký đã tồn tại.

## Việc người thực hiện cần bổ sung

Ngày, giờ, địa điểm và thành viên của các hoạt động lịch sử; đóng góp thực tế; minh chứng gốc còn thiếu; link thư mục minh chứng trực tuyến; xác nhận và chữ ký của giáo viên. Đối chiếu quy định cuộc thi trước khi nộp. Tài liệu mẫu của đề tài khác không được dùng để suy ra quy định cho English.

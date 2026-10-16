# EN-20261014-02 — 14/10/2026 (Asia/Saigon)

Codex triển khai local theo yêu cầu chủ dự án. Giờ/địa điểm/thành viên khác chưa xác nhận.

- AI tạo đề tự luận Writing/Speaking từ prompt và/hoặc nguồn DOCX/PDF/MD/HTML/TXT. Trả bản nháp sửa được; không tự giao bài. PDF scan cần OCR. Tài liệu gửi nhà cung cấp giới hạn 22000 ký tự.
- AI tạo 10 câu trắc nghiệm ngữ pháp theo file hoặc prompt qua luồng import; thiếu MWAPI báo lỗi thay vì giả thành công. Giữ sửa/duyệt câu hỏi trước xuất bản.
- Soạn thủ công cho Writing/Speaking và xuất bản trắc nghiệm nhận tối đa5 tệp, tổng2MB; kiểm tra định dạng và lưu attachment cùng transaction/version1, dùng quyền truy cập sẵn có. Nguồn AI không tự đính kèm, UI giải thích riêng.
- Recorder chọn MIME browser hỗ trợ, Blob/filename dùng định dạng thật, không gán MP4 thành WebM; tối thiểu3giây nhất quán. Cleanup mic khi rời trang, chống mở mic lặp, báo lỗi recording. Placement cũng sửa MIME/cleanup. Không hiển thị điểm6.0 giả khi rubric thiếu. API local kiểm tra MIME và hỗ trợ OGG.

## Kiểm thử thực sự chạy

Windows PowerShell, Node.js/TypeScript hiện có trong ứng dụng, Chromium executable cài trong máy; fixtures không đọc/ghi database thật.

1. npx tsc --noEmit lần đầu FAIL exit1: JSX fieldset và regex escape trong mã vừa tạo; đã sửa. Output quan sát trong tool, chưa lưu log riêng lúc đầu. Các lần tiếp theo PASS exit0: typescript.log, typescript-final.log, typescript-audio-final.log.
2. node --test tests/document-import.test.cjs tests/assignment-attachments.test.cjs tests/docx-publish.test.cjs: PASS22/22 exit0 regression.log. Tests dùng mock DB/AI, có parser PDF thật ở suite document-import.
3. node --test tests/teacher-authoring.test.cjs: PASS5/5 exit0 authoring-tests.log (auth401/403, input400, writing prompt/speaking source, AI malformed502, attachment bounds/bytes).
4. node --test tests/teacher-authoring.test.cjs tests/document-import.test.cjs tests/assignment-attachments.test.cjs tests/docx-publish.test.cjs: final PASS27/27 exit0 tests-final.log.
5. node tests/recorder-authoring.browser.cjs: lần1 FAIL exit1 timeout30s recorder-browser.log; lần2 FAIL exit1 timeout60s recorder-browser-retry.log. Trình duyệt chưa launch xong. Chuyển profile vào workspace và thêm no-sandbox trong harness: PASS3checks exit0 recorder-browser-profile.log. Real MediaRecorder + micro synthetic, WebM45496bytes, audio.play thành công, retake và denied permission đúng,0pageErrors. Không dùng giọng nói người thật.
6. node tests/teacher-authoring.browser.cjs: PASS3checks exit0 teacher-browser.log. Actual React page + FileReader, AI/API mock: nhập prompt -> title/prompt sửa được; bắt buộc duyệt; đính kèm reference.txt gửi base64 cùng assignment. Không ghi DB.
7. Đã mở xem teacher-create.png/recorder-review.png: fixture không tải CSS ứng dụng, ảnh chỉ chứng minh trạng thái/chức năng hiển thị, chưa nghiệm thu thiết kế responsive.

## Giới hạn và lỗi phát hiện

Chưa gọi MWAPI thật; chưa authenticated production E2E, micro thật, Safari/iOS, final publish với DB thật, kiểm thử UI trắc nghiệm mới đầy đủ. Chưa build/deploy/migration/reset/seed/xóa dữ liệu. /api/audio/upload trả503 khi VERCEL=1 do chưa có storage online; nhánh local còn lưu public/uploads/audio. Speaking workspace mẫu dùng đề cố định; chưa chứng minh luồng nộp ghi âm bài lớp học. Placement lưu blob URL tạm, chưa chứng minh audio bền vững sau reload/thiết bị khác. AI Speaking thật chưa có dịch vụ phân tích; không tuyên bố chấm giọng nói thật đã hoạt động. Cần giải quyết lưu trữ private và luồng nộp audio trước phát hành Speaking hoàn chỉnh.

Lệnh kiểm kê ban đầu rg --files gặp Access denied trong artifacts; giới hạn tìm src/tests sau đó. Một lệnh Get-Content truyền path lặp bị lỗi; sửa cách đọc. git status báo workspace không có repo .git. Không dùng các kết quả này làm PASS ứng dụng. Word được xuất từ JSON; chưa có renderer và chưa kiểm tra phân trang trực quan.

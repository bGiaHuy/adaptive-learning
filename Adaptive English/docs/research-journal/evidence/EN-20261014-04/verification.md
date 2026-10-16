# EN-20261014-04 — 14/10/2026, Asia/Saigon

Chủ dự án yêu cầu deploy; Codex thực hiện. Giờ/địa điểm/thành viên khác chưa xác nhận.

## Kết quả trực tiếp

Đã phát hành production dpl_8WWUofaVEU1wjjHJzskcMqHGPB8Q, Vercel READY. get_alias xác nhận adaptiveenglish.vercel.app trỏ đúng deployment này trong project prj_QXiyKxQ88Bp8Rpcb0BY06V06iGki. Bản mới gồm tạo đề Writing/Speaking và ngữ pháp theo file/prompt, đính kèm đề, private Blob audio và nộp Speaking. Kho Blob/token server được kết nối từ phiên03. Không migration/reset/seed/ghi dữ liệu học sinh khi kiểm tra.

Giữ register API/page từ bản live EN-20261012-40 byte-for-byte ở release sạch, do OTP mới chưa có email provider. Mã OTP local vẫn giữ nguyên để tiếp tục cấu hình. Đây là lựa chọn phạm vi phát hành, không tuyên bố OTP đã hoạt động. Đã thông báo người dùng trong commentary.

## Build và kiểm tra đã chạy

- Chuẩn bị release sạch bằng script chuẩn qua bản tạm bỏ copy node_modules: PASS exit0;200files upload, dictionary gzip68,400,050bytes. Không env/DBngười dùng/recordings. Inventory SHA256 định danh nguồn vì workspace không có Git commit.
- Connector create_deployment dùng asset hash cũ và24file inline mới: production READY. Remote npm ci/build: hoàn thành2phút theo build-events.log; log API trả100events nên không coi là transcript đầy đủ/số trang build.9vulnerabilities report vẫn tồn tại (2moderate/6high/1critical); không upgrade ngoài phạm vi.
- node scripts/verify-release-20261014.cjs (network-enabled), Windows/Node24: PASS8/8 exit0 public-smoke.log. GET home/login/register200; teacher create307 tới login; generate-assignment GET405 (module mới tải được); audio/play401; upload POST401; upload-token POST401. Kiểm tra register-confirm-email hiện diện và không register-otp đúng phạm vi giữ luồng live. Không tạo tài khoản/bài nộp/Blob, không gọi AI thật.
- get_alias PASS đúng deploymentID; runtime get_runtime_logs production10m lọc error/fatal, group_by level trả bảng rỗng, isError=false. Chỉ chứng minh không có nhóm log lỗi trả về trong cửa sổ truy vấn, không thay E2E.
- Tests54/54, browser9checks và live Blob4checks là kết quả phiên EN-20261014-03; KHÔNG chạy lại trong phiên này. Không đánh dấu thành test production authenticated.

## FAIL/BLOCKED và xử lý

Giữ đầy đủ chi tiết operational-notes.md. Lần create bằng hash khi gzip chưa hoàn tất trả400missing_files, chưa phát hành thành công; lập lại manifest hoàn chỉnh. CLI sai đường dẫn output trước chạy rồi sửa; CLI63.1.2 Not authorized exit1 deploy.log, chuyển connector đã kết nối. Một helper persistent node_repl trả manifest rỗng, đã sửa trước gọi deploy. Web-fetch connector kiểm tra3URL song song chờ quá lâu, dừng lượt đọc; không coi PASS, thay bằng HTTP public bounded20s đã PASS. Không có auto-review rejection.

Connector production tự gán alias sau READY; không có skip-domain trong schema connector. CLI staging không thành công vì auth. Đã xác minh lại alias và kiểm tra public sau READY. Deployment API cũng báo các alias cùng project; chỉ xác minh/phát hành nội dung English theo project/alias đã có, không tạo domain mới.

## Giới hạn

Chưa đăng nhập E2E production teacher/student, client direct-upload thật, micro thật/iOS/Safari hay AI generate thật trong phiên deploy. Không có speech-analysis provider mới. Placement/practice/retention còn giới hạn đã ghi phiên03. Giữ OTP chưa cấu hình ở local; production register dùng luồng cũ. Word chưa kiểm tra phân trang trực quan.

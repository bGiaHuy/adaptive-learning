# EN-20261014-03 — 14/10/2026, Asia/Saigon

Chủ dự án giao chọn phương án tối ưu sau trao đổi Drive/Blob/Supabase. Codex chọn Vercel Blob private cho web hiện chạy Vercel, triển khai mã và tạo kho. Giờ/địa điểm/thành viên khác chưa xác nhận.

## Thao tác thực hiện

Đọc AGENTS/nhật ký/WORKLOG và skill vercel:vercel-storage. Đối chiếu tài liệu chính thức https://vercel.com/docs/vercel-blob/private-storage và SDK2.8.2. get_project/get_alias xác nhận adaptiveenglish.vercel.app thuộc prj_QXiyKxQ88Bp8Rpcb0BY06V06iGki. Kiểm kê tên env không giải mã: chưa Blob. Tạo kho adaptive-english-private, store_A6A0hFotHDoiAPLE, access private, region sin1. get_store xác nhận kết nối1project, env production/preview/development có BLOB_READ_WRITE_TOKEN. Không lưu giá trị secret vào minh chứng. Không nâng gói trả phí; chi phí sử dụng theo gói tài khoản, không tuyên bố miễn phí vô hạn.

Thêm SDK @vercel/blob2.8.2. Luồng direct upload20MB, token10phút giới hạn MIME/path, không ghi đè; kiểm tra học sinh/thành viên/Speaking/chưa thu bài/chưa final. Tệp private đọc qua route có auth, owner/admin hoặc teacher sở hữu lớp với đúng audioUrl trong submission; no-store/range. Bài nộp chỉ lưu URL nội bộ canonical; xác nhận metadata file/owner/assignment. Giữ audio cũ khi sửa draft text không gửi audioUrl. Nối recorder classroom -> bản nháp -> nộp audio-only -> chờ giáo viên chấm. Không đổi schema/DB; teacher document attachments giữ kho private DB cũ. Không xóa/chuyển audio lịch sử.

## Kiểm thử đã chạy

Môi trường Windows PowerShell; Node24.19.0, Next14, TypeScript/React18, Puppeteer/Chromium với micro giả lập. Không reset/seed/ghi DB production.

- npm install @vercel/blob lần1 FAIL EACCES truy cập registry/cache ngoài workspace; dừng process. Lần2 npm install @vercel/blob --cache .npm-cache --fetch-retries=0 --fetch-timeout=20000 (network-enabled) PASS exit0, thêm31packages. Giữ9vulnerabilities report (2moderate/6high/1critical); không audit fix. Tool output được đối chiếu, chưa có log riêng tại lần chạy.
- npx tsc --noEmit PASS exit0, typescript-initial.log.
- node --test tests/audio-storage.test.cjs tests/grading-flow.test.cjs tests/teacher-authoring.test.cjs tests/document-import.test.cjs tests/assignment-attachments.test.cjs tests/docx-publish.test.cjs lần đầu PASS51/51 exit0 tests-initial.log; sau thêm3checks submission PASS54/54 exit0 tests-final.log. Prisma/Blob mock. Kiểm tra path/MIME/20MB, auth401/403, trạng thái409, private/range/no-store, token size/TTL/no-overwrite, binding assignment/owner, draft giữaudio và final audio-only pending_grading.
- node tests/recorder-authoring.browser.cjs PASS5checks exit0 recorder-browser.log: actual React/native MediaRecorder, micro synthetic -> WebM45496bytes phát lại; retake, từ chối quyền; submissionMode gọi upload mock, không AI, clear audio callback. 0pageErrors. Ảnh recorder-private-review.png là fixture không CSS, chỉ chứng minh nội dung nhìn thấy.
- node tests/student-speaking.browser.cjs PASS4checks exit0 student-browser.log: actual student React page, recorder callback/API mock; bắt buộc audio, lưu draft, reload restore reference, nộp audio-only. 0pageErrors. Không authenticated production E2E/DB thật.
- Live SDK smoke lần đầu FAIL module-not-found trước truy cập Blob do ghi script lặp thư mục workdir; blob-live-smoke.log giữ nguyên. Sửa đường dẫn rồi node tests/blob-store-smoke.cjs PASS exit0 blob-live-smoke-retry.log (script sau chuyển thành scripts/verify-private-blob.cjs). WAV im lặng synthetic16044bytes upload private, anonymous403, head đúng size, get byte-for-byte/SHA256khớp, Range0-43 trả44bytes và content-range đúng; xóa CHỈ tệp synthetic do chính lần này tạo. Không dùng dữ liệu người thật. Secret chỉ qua file tạm .artifacts/blob-smoke-token.tmp, script đọc/xóa trước network; Test-Path sau chạy False.
- npx next build PASS exit0 build.log, compiled/static59/59. Có warning webpack cache unable to snapshot resolve dependencies; không có lỗi build. Không deploy/publish.

## Giới hạn

Kho đã tồn tại/kết nối thật, mã ứng dụng vẫn local; production hiện chưa dùng luồng mới. Chưa authenticated deployed E2E, micro thật/iOS/Safari, client direct upload thật qua token endpoint đã deploy. DB/API tests là fixture; storage smoke là SDK thật riêng. Không có speech-analysis provider mới; file storage không đồng nghĩa AI chấm giọng nói. Placement vẫn dùng blob URL tạm, practice workspace mẫu chưa thay đề cố định. Preview/development/production đang chia sẻ kho vừa kết nối; chưa có dữ liệu học sinh upload trong phiên. Chưa bật job xóa/retention; bản retake/orphan giữ nguyên cho đến có chính sách. Word chưa kiểm tra phân trang trực quan.

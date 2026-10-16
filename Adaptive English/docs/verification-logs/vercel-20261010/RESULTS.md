# Triển khai Vercel ngày 10/10/2026

Trạng thái: production READY tại https://adaptiveenglish.vercel.app; PostgreSQL mới đã khởi tạo và các luồng tài khoản chính đã kiểm tra bằng dữ liệu giả rồi dọn sạch.

## Kết quả hoàn tất sau khi chủ dự án chấp nhận điều khoản

- Chủ dự án thông báo đã chấp nhận điều khoản Neon. CLI tạo `adaptive-english-db`, plan `free_v3`, region `sin1`, `auth=false` và kết nối production thành công.
- Đặt BASE_URL và NEXTAUTH_URL là HTTPS production; ALLOW_TEST_SIMULATION, ENABLE_ROLE_SWITCHER và NEXT_PUBLIC_ENABLE_ROLE_SWITCHER đều false.
- Prisma `db push` trên database rỗng đạt; không reset/xóa/nhập dữ liệu local. Hai tệp env tạm được xóa ngay sau đó.
- Deployment `dpl_GktLNdJuhGs3zCnwNYo2DQQRvCpF` READY, alias `https://adaptiveenglish.vercel.app`. Vercel build đủ 54 trang và serverless functions thành công. Cài dependency báo 9 audit findings (2 moderate, 6 high, 1 critical); chưa chạy `audit fix --force` vì có thể thay đổi breaking.
- Kiểm tra public không dùng bypass trả HTTP 200 và đúng HTML Adaptive Study. Browser mở trực tiếp form production, có Nhập lại email và nút Tiếp tục; ảnh `production-register.png`.
- Tạo một học sinh giả trên production đạt, cookie đọc `/api/auth/me` đúng role student, gọi login lại đạt, `/student/home` trả nội dung. Dictionary `hello` HTTP 200 có 10 nghĩa. Recovery HTTP 503 và không trả reset link.
- Sau kiểm tra, xóa chính xác một user giả `codex-prod-check-20261010@example.invalid` bằng điều kiện exact; quan hệ cascade xóa session/skill profile. Count còn 0. Xóa ba tệp bí mật tạm gồm hai cookie jar và một env; còn 0.

## Đích triển khai và database đề xuất

- CLI chính thức Vercel 63.1.2 xác nhận đã đăng nhập. Dự án hiện có `adaptivelearning`, URL `https://adaptiveenglish.vercel.app`, team `windowgamer11-7579s-projects`, Node 24.x. Cấu hình cũ là Vite/dist, trong khi bản mới là Next.js.
- Người dùng chọn chưa có database online và muốn chuẩn bị PostgreSQL trên Vercel.
- Đề xuất cụ thể: Neon PostgreSQL, resource `adaptive-english-db`, gói `free_v3` (Free), region `sin1` (Singapore), `auth=false` vì ứng dụng có auth riêng; kết nối môi trường production của dự án nói trên. Không chọn gói trả phí/nâng cấp tự động.
- Auto-review ban đầu từ chối lệnh tạo resource vì chưa có xác nhận cụ thể nhà cung cấp/resource/region/chi phí. Sau khi chủ dự án yêu cầu tiếp tục, Vercel yêu cầu chủ tài khoản tự chấp nhận điều khoản Marketplace; Codex mở trang và dừng. Chủ dự án thông báo hoàn tất, sau đó lệnh tạo resource mới được chạy thành công.

## Các thay đổi đã chuẩn bị

- `vercel.json` chọn Next.js, build `npm run build:vercel`, output `.next`, function region Singapore.
- `scripts/build-vercel.cjs` tạo schema PostgreSQL riêng từ schema SQLite chuẩn, yêu cầu DATABASE_URL PostgreSQL, generate Prisma rồi build. Schema SQLite, dữ liệu local và Prisma client local không bị chuyển sang PostgreSQL; toàn bộ kiểm tra build diễn ra trong gói cô lập.
- `scripts/prepare_vercel_release.py` tạo `.artifacts/vercel-release-20261010` bằng danh sách cho phép: mã nguồn, cấu hình, schema, assets/audio học liệu và từ điển dùng chung. Không sao chép `.env`, DB người dùng, uploads cá nhân, screenshots, video, backup. `.vercelignore` loại các tệp này khi upload. CLI link có bổ sung OIDC token vào `.env.local`; file này không nằm trong gói.
- Từ điển chia sẻ được gzip còn 68,400,050 bytes, trace riêng cho `/api/dictionary` và `/api/vocab`; runtime Vercel giải nén trong `/tmp` và mở read-only, không dùng làm DB tài khoản.
- Recovery production trả 503 trước khi tra DB, không trả link reset. Dev chỉ cho mô phỏng khi bật cờ rõ ràng; không tuyên bố đã gửi email khi SMTP chưa triển khai.
- Audio upload và import DOCX trên Vercel trả 503 sau kiểm tra quyền để tránh báo thành công khi filesystem không lưu bền. Hai tính năng này còn cần kho lưu trữ trực tuyến trước khi coi là hoàn tất đầy đủ. Bản local giữ luồng lưu file hiện có.
- `postgres-initial.sql` là SQL khởi tạo từ schema; chưa chạy trên bất kỳ database online nào. PostgreSQL mới sẽ rỗng, chưa có tài khoản/bài làm/học liệu nhập từ local; việc nhập dữ liệu riêng cần phạm vi rõ ràng.

## Kiểm tra đã thực chạy

- Bước đầu chuyển output log sai đường dẫn: không chạy build, lỗi redirect output; sửa đường dẫn và chạy lại.
- Build đầu thực chạy FAIL do TypeScript phát hiện so sánh NODE_ENV đã được thu hẹp kiểu. Lưu `build-first-type-error.log`, sửa phần recovery và chạy lại.
- Build sau sửa: exit 0, generate Prisma PostgreSQL và Next.js thành công. `build.log`. DATABASE_URL là địa chỉ giả cổng 1 để kiểm tra build, không kết nối DB thực.
- `prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.vercel.prisma --script`: exit 0, chỉ sinh SQL. Không có thao tác reset/seed/migrate DB local.
- Smoke trên server production cô lập cổng 3020, VERCEL=1: `/`, login, register HTTP 200; ô nhập lại email tồn tại; anonymous me 401; recovery 503 và không có `testResetLink`; dictionary hello 200, 10 nghĩa; trace có file dictionary gzip. `smoke.cjs` exit 0, `smoke-results.json`. Dừng server thử sau kiểm tra.
- Chưa chạy kiểm thử đăng nhập PostgreSQL vì chưa có database và chưa deploy. Không coi build PASS là đã đăng nhập online thành công.

## Việc còn lại sau triển khai

Kết nối SMTP thật và object storage bền cho audio/ảnh DOCX trước khi coi mọi tính năng production hoàn chỉnh. Quyết định riêng việc nhập tài khoản/học liệu từ SQLite local; không tự đưa dữ liệu đó lên mạng. Rà soát 9 dependency audit findings bằng nâng cấp có kiểm thử, không dùng `--force` trực tiếp trên bản bàn giao.

# Prompt giao cho Coding Agent triển khai AdaptiveMath

Bạn là Principal Full-stack Engineer chịu trách nhiệm chuyển prototype AdaptiveMath thành MVP có frontend, backend, database, authentication và phân quyền thật.

## 1. Nguồn yêu cầu bắt buộc

Workspace:

`C:\Users\Administrator\Documents\Codespace\Adaptivemath`

Đọc toàn bộ tài liệu sau trước khi sửa code:

`docs/PRD-AdaptiveMath.md`

Sau đó audit toàn bộ source hiện tại, đặc biệt:

- `src/App.jsx`
- `src/components/`
- `src/data/`
- `package.json`
- `vite.config.js`

PRD là nguồn yêu cầu sản phẩm chính. Code hiện tại chỉ là prototype/reference UI, không phải kiến trúc hoặc logic bảo mật cần giữ nguyên.

## 2. Mục tiêu

Xây dựng MVP AdaptiveMath với ba khu vực tách biệt:

1. Học sinh: onboarding, diagnostic, hồ sơ năng lực, lộ trình, nhiệm vụ, sổ lỗi sai và tham gia lớp.
2. Giáo viên: xác minh, tạo lớp, mã mời, quản lý học sinh, giao bài và xem báo cáo.
3. Admin: quản lý người dùng, duyệt Giáo viên, quản lý/version nội dung và audit log.

Hệ thống phải có authentication, server-side authorization, database persistence, API contract và automated tests thật. Không được coi dữ liệu mock hoặc `localStorage` là implementation hoàn chỉnh.

## 3. Kiến trúc đích

Ưu tiên monorepo TypeScript:

```text
apps/
  web/       Next.js App Router
  api/       NestJS REST API
packages/
  contracts/ DTO/schema dùng chung khi phù hợp
  config/    eslint/typescript config
  ui/        shared UI sau khi đã có nhu cầu thật
```

Stack:

- Frontend: Next.js App Router, React, TypeScript.
- Backend: NestJS modular monolith.
- API: REST/JSON, OpenAPI, prefix `/api/v1`.
- Database: PostgreSQL + Prisma ORM.
- Session source of truth: PostgreSQL; Redis chỉ là cache/rate limit/job khi cần.
- Validation: Zod ở frontend; DTO validation tại API; không tin dữ liệu client.
- Test: Vitest/Testing Library cho unit/component, Nest integration tests, Playwright cho E2E.
- Công thức Toán: KaTeX.

Không chuyển sang microservices hoặc Kubernetes trong MVP.

## 4. Quy tắc authentication và authorization bắt buộc

- Web dùng opaque server-side session ID trong cookie `__Host-am_session` với `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/` ở production.
- Không lưu password, JWT, refresh token hoặc session ID trong `localStorage`/`sessionStorage`.
- Password hash bằng Argon2id với tham số cấu hình được.
- Kiểm tra Origin/Referer và CSRF protection cho state-changing requests.
- Session phải rotate sau login, đổi mật khẩu, đổi MFA hoặc thay đổi quyền.
- User có `permissionVersion`; thay đổi role/quyền phải vô hiệu hóa cache/session quyền cũ.
- Backend luôn kiểm tra permission và ownership/scope. Ẩn menu hoặc route guard phía frontend chỉ phục vụ UX.
- Không nhận role có hiệu lực từ request body/client session.
- Người chọn đăng ký Giáo viên là `teacher applicant`, chưa có role `teacher` cho đến khi được Admin duyệt.
- Không có đăng ký Admin công khai. Admin được tạo bằng invitation và bắt buộc MFA.
- Content workflow phải có maker-checker: tác giả không tự duyệt/publish nội dung của mình.

Viết integration tests cho các case 401, 403 và truy cập chéo dữ liệu lớp.

## 5. Cách thực thi

Làm việc tự chủ nhưng theo từng phase nhỏ, có thể review và rollback. Không viết lại toàn bộ UI trong một commit lớn.

### Bước 1 — Audit và kế hoạch

Trước khi chỉnh code:

1. Kiểm tra cấu trúc repo, trạng thái version control và các thay đổi sẵn có của người dùng.
2. Chạy baseline build/test hiện tại.
3. Đối chiếu code với mục “Kết quả rà soát prototype” trong PRD.
4. Tạo `docs/IMPLEMENTATION-PLAN.md` gồm:
   - Kiến trúc thư mục đích.
   - Migration strategy giữ lại UI hiện có.
   - Epics và task theo dependency.
   - Database migration plan.
   - Threat model sơ bộ.
   - Test strategy.
   - Các quyết định Product còn thiếu và assumption tạm thời.
5. Không bắt đầu refactor diện rộng trước khi kế hoạch có thể build theo từng mốc.

### Bước 2 — Nền móng chạy được

Thiết lập monorepo, TypeScript, Next.js, NestJS, Prisma/PostgreSQL, lint/typecheck/test/build và environment validation.

Yêu cầu:

- Giữ prototype cũ chạy được cho đến khi màn hình tương ứng đã migrate.
- Có `.env.example`, không commit secret.
- Có health endpoint và OpenAPI endpoint.
- Có migration và seed chỉ chứa dữ liệu demo an toàn.
- Có error response thống nhất: `code`, `message`, `fieldErrors`, `requestId`.
- Chạy được local bằng một quy trình được ghi trong README.

### Bước 3 — Identity và RBAC vertical slice

Triển khai:

- Register Student/Teacher applicant.
- Login/logout/logout-all.
- Verify email, forgot/reset password.
- Session list và revoke từng session.
- Role, permission, `permissionVersion`.
- Teacher verification state.
- Admin invitation và MFA foundation.
- Audit log cho thao tác nhạy cảm.
- Route/layout riêng cho `/student`, `/teacher`, `/admin`.

Acceptance tối thiểu:

- Student không gọi được Teacher/Admin API dù tự sửa request.
- Teacher applicant không tạo được lớp.
- Admin route không thể vào chỉ bằng cách sửa URL hoặc cookie client.
- Thay đổi role làm quyền cũ mất hiệu lực theo SLA nêu trong PRD.

### Bước 4 — Student vertical slice

Triển khai end-to-end:

- Onboarding tải curriculum đúng grade.
- Diagnostic attempt có autosave, resume, timeout, skip và idempotent submit.
- Kết quả luôn chứa đầy đủ câu cuối.
- Mastery baseline và decision trace theo PRD.
- Learning path cơ bản.
- Mistake notebook tự tạo từ câu sai và có remediation state.

Không tuyên bố IRT/CAT đã kiểm định. Tạo `docs/ASSESSMENT-ALGORITHM-SPEC.md` trước khi code scoring/selection production.

### Bước 5 — Teacher vertical slice

Triển khai:

- Teacher approval.
- Tạo/sửa/đóng lớp.
- Mã lớp 8 ký tự Crockford Base32 ngẫu nhiên; lưu HMAC digest; có expiry, rotate, revoke và rate limit.
- Student lookup/join/rời lớp.
- Assignment lifecycle `draft → published → closed → archived`.
- Student attempt/submission và publish result.
- Dashboard lớp và student progress cơ bản.

MVP chỉ có một owner teacher mỗi lớp. Không tự thêm co-teacher nếu Product chưa thay đổi PRD.

### Bước 6 — Admin và content vertical slice

Triển khai:

- User support và account suspension.
- Teacher verification queue.
- Curriculum/question/version CRUD.
- Workflow `draft → in_review → approved → published → retired`.
- Maker-checker enforcement.
- Audit log viewer theo permission.
- Question version đã được dùng trong attempt là bất biến.

### Bước 7 — Hardening

- Accessibility cho keyboard/focus/form error và trạng thái đúng-sai không phụ thuộc màu.
- Security headers, CSP, rate limit và input/output sanitization.
- Authorization matrix tests.
- Backup/restore documentation.
- Structured logs và request ID.
- Product analytics events theo PRD.
- Playwright E2E cho happy path Student, Teacher, Admin và negative permission paths.

## 6. Các lỗi prototype phải được loại bỏ

- Không dùng chung menu/dashboard cho mọi role.
- Không chấp nhận mã lớp tùy ý dài hơn 4 ký tự.
- Không dùng danh sách chủ đề lớp 9 cho học sinh lớp 6–8.
- Không bỏ thiếu câu trả lời cuối trong diagnostic result.
- Timer hết giờ không được tự reset im lặng.
- Skip/timeout phải được ghi vào attempt.
- Sổ lỗi sai phải nhận dữ liệu từ submission thật.
- Không hard-code ngày hiện tại, số học sinh hoặc progress như dữ liệu thật.
- Logout không được gọi `localStorage.clear()`.
- Không giữ auth/session state thật trong `localStorage`.

## 7. Quy tắc làm việc với codebase

- Bảo toàn thay đổi không liên quan của người dùng; không dùng `git reset --hard` hoặc thao tác phá hủy.
- Ưu tiên migration tăng dần; mỗi phase phải build/test được.
- Không tạo abstraction khi mới có một use case.
- Không thêm dependency nếu platform/library hiện có giải quyết đủ.
- Pin phiên bản dependency và ghi lý do cho dependency bảo mật quan trọng.
- Mọi schema change phải qua migration; không sửa database thủ công.
- API mutation dễ retry phải có idempotency hoặc unique constraint phù hợp.
- Không log password, session token, reset token, mã lớp thô hoặc dữ liệu học sinh không cần thiết.
- Tất cả timestamp lưu UTC; timezone chỉ dùng khi trình bày/lập lịch.
- Không đưa dữ liệu demo hard-code vào production path.

## 8. Xử lý các quyết định Product còn thiếu

Các câu hỏi ở mục 20 của PRD chưa được coi là đã trả lời.

Nếu một quyết định chặn trực tiếp schema hoặc behavior — ví dụ grade pilot, loại tài khoản học sinh, tiêu chí xác minh Giáo viên, phạm vi dữ liệu Giáo viên được xem — hãy:

1. Ghi rõ blocker và các lựa chọn trong `docs/DECISIONS-NEEDED.md`.
2. Tiếp tục phần nền móng không phụ thuộc quyết định đó.
3. Không âm thầm chọn một policy có ảnh hưởng tới quyền riêng tư, pháp lý hoặc dữ liệu trẻ em.

Không mở beta với học sinh thật trước khi privacy gate trong PRD được Product/Legal xác nhận.

## 9. Kiểm chứng bắt buộc sau mỗi phase

Chạy và báo cáo:

- Install reproducible từ lockfile.
- Lint.
- Typecheck.
- Unit tests.
- Integration tests.
- Production build.
- E2E phù hợp với phase.
- Prisma migration status/schema validation.
- Kiểm tra secret hoặc credential vô tình bị commit.

Nếu test/build thất bại do môi trường, phải phân biệt rõ lỗi code và lỗi môi trường, ghi command cùng output quan trọng và tiếp tục bằng kiểm chứng thay thế hợp lý.

## 10. Format báo cáo mỗi mốc

Sau mỗi phase, cập nhật ngắn gọn:

```text
Đã hoàn thành
- ...

Files/schema/API chính đã thay đổi
- ...

Kiểm chứng
- command: pass/fail

Rủi ro hoặc blocker còn lại
- ...

Phase tiếp theo
- ...
```

Không tuyên bố hoàn tất nếu còn acceptance criterion bắt buộc chưa chạy hoặc chưa đạt.

## 11. Điểm bắt đầu ngay bây giờ

Thực hiện Bước 1 — Audit và kế hoạch. Sau đó triển khai Bước 2 và Bước 3 theo vertical slice nhỏ nhất có thể chạy end-to-end. Không dừng chỉ ở việc viết kế hoạch nếu môi trường cho phép tiếp tục code. Chỉ dừng để hỏi người dùng khi gặp quyết định Product/Security/Privacy thực sự làm thay đổi schema hoặc hành vi quan trọng và không có phần độc lập nào khác để tiếp tục.

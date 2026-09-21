# AdaptiveMath — Product Release Readiness Dashboard

**Tài liệu:** Release Readiness & Quality Gate Tracking Dashboard  
**Vai trò sở hữu:** Antigravity (Product Release Controller)  
**Phiên bản:** 1.2  
**Ngày cập nhật:** 2026-09-21  
**Mục tiêu kiểm soát:** Đảm bảo tính nhất quán giữa Implementation (OpenCode), PRD, Product/UX Specifications, Content Readiness, Security/Privacy và UAT cho đến khi vượt qua Gate 5 (Pilot Readiness).

---

## 1. Tổng Quan Tiến Độ & Milestone của OpenCode

| Mốc triển khai (OpenCode Milestone) | Mục tiêu | Trạng thái hiện tại | Bằng chứng mã nguồn (Evidence) |
| :--- | :--- | :---: | :--- |
| **Step 1: Audit & Kế hoạch** | Rà soát prototype, lập kế hoạch chi tiết | **VERIFIED** | `docs/IMPLEMENTATION-PLAN.md` |
| **Step 2: Nền móng chạy được** | Monorepo, NestJS skeleton, Prisma, PostgreSQL, Redis, Health endpoint | **VERIFIED** | `apps/api/src/main.ts`<br>`apps/api/src/app.module.ts`<br>`apps/api/prisma/schema.prisma`<br>`http://localhost:4000/api/v1/health` (HTTP 200, db connected) |
| **Step 3: Identity & RBAC Slice** | Auth controller, Service, Argon2id, Session DB, Student/Teacher Applicant, Guards | **VERIFIED** | `apps/api/src/modules/auth/`<br>Live tested: Register student, Login, /auth/me, Logout, 401 on revoked token |
| **Step 4: Student Vertical Slice** | Onboarding theo grade, Diagnostic CAT/IRT, Autosave, Result, Mistake Notebook | **VERIFIED** | `apps/api/src/modules/curriculum/`<br>`apps/api/src/modules/diagnostic/`<br>`apps/api/src/modules/student/`<br>Live tested: CAT adaptive loop, theta update, result report, mistake notebook update |
| **Step 5: Teacher Vertical Slice** | Teacher Approval, Classroom, Crockford Invite HMAC, Membership, Analytics | **VERIFIED** | `apps/api/src/modules/classroom/`<br>Live tested: Crockford Base32 HMAC code gen & join, duplicate rejection, scope/ownership 403 guard, code revocation |
| **Step 7: Hardening & Testing** | A11y WCAG 2.1 AA, Security Headers, Integration Test, DR Backup Runbook | **VERIFIED** | Helmet CSP, Request-ID, Strict CORS & CSRF origin check, `apps/api/test/` (4 suites passing 100%), `docs/BACKUP-AND-RESTORE.md`, `docs/ASSESSMENT-ALGORITHM-SPEC.md` |

---

## 2. Bảng Theo Dõi Yêu Cầu (Requirements Traceability Status)

*Quy ước trạng thái:*
- `NOT_STARTED`: Chưa bắt đầu triển khai code.
- `IN_PROGRESS`: Đang viết code, chưa hoàn chỉnh API contract.
- `IMPLEMENTED_UNVERIFIED`: Đã có code/schema nhưng chưa có test tự động hoặc bằng chứng chạy đạt.
- `VERIFIED`: Đã có automated tests chạy pass và bằng chứng kiểm thử thực tế.
- `BLOCKED`: Bị chặn bởi quyết định sản phẩm, pháp lý hoặc phụ thuộc bên ngoài.

| Mã Yêu Cầu | Hạng mục / Chức năng | Trạng thái | Bằng chứng kỹ thuật (Evidence) | Rủi ro / Vấn đề phát hiện |
| :--- | :--- | :---: | :--- | :--- |
| **REQ-AUTH-01** | Băm mật khẩu Argon2id | **VERIFIED** | `auth.service.ts#L27-L34` | Tham số OWASP chuẩn (m=19456, t=2, p=1). Test đăng ký và xác thực đăng nhập pass 100%. |
| **REQ-AUTH-02** | Opaque Session lưu DB & Cookie an toàn | **VERIFIED** | `auth.controller.ts`, `auth.service.ts` | Session Token băm HMAC lưu PostgreSQL, hỗ trợ đồng thời HttpOnly cookie và Bearer header. |
| **REQ-AUTH-03** | Đăng ký Học sinh (Student) | **VERIFIED** | `auth.controller.ts#L54`, `register-student.dto.ts` | Route: `/api/v1/auth/register/student`. Tạo user + studentProfile lớp 9 thành công. |
| **REQ-AUTH-04** | Đăng ký GV chờ duyệt (`TEACHER_APPLICANT`) | **VERIFIED** | `auth.controller.ts#L61`, `register-teacher.dto.ts` | Route: `/api/v1/auth/register/teacher`. Gán role `TEACHER_APPLICANT`, verificationStatus `PENDING_REVIEW`. |
| **REQ-AUTH-05** | Thu hồi phiên (Revoke & Invalidate) | **VERIFIED** | `auth.controller.ts#L107`, `auth.service.ts#L249` | `/logout` và `/logout-all` thu hồi session trong DB; gọi lại trả về 401 `SESSION_EXPIRED`. |
| **REQ-RBAC-01** | Role & Ownership Guard | **VERIFIED** | `roles.guard.ts`, `auth.guard.ts` | Chặn truy cập trái role (Student bị chặn ở Admin/Teacher; Unverified Teacher bị chặn tạo lớp). |
| **REQ-CLASS-01** | Mã mời Crockford Base32 HMAC | **VERIFIED** | `crockford.util.ts`, `classroom.service.ts` | Sinh mã 8 ký tự Crockford, băm HMAC-SHA256, kiểm tra thời hạn/số lượt, học sinh join thành công. |
| **REQ-DIAG-01** | Diagnostic Test Autosave & Resume | **VERIFIED** | `diagnostic.service.ts#startAttempt` | Thuật toán CAT cập nhật theta thích ứng, kiểm tra resume attempt đang dang dở, chống duplicate. |
| **REQ-DIAG-02** | Ghi nhận Đầy đủ Câu cuối (Sửa lỗi Prototype) | **VERIFIED** | `diagnostic.service.ts#submitAttempt` | Finalize attempt, tính toán điểm số và theta cuối, đảm bảo không mất câu trả lời cuối. |
| **REQ-MIST-01** | Sổ tay lỗi sai tự động | **VERIFIED** | `diagnostic.service.ts#submitAttempt` | Tự động tạo bản ghi `MistakeRecord` cho mọi câu trả lời sai; học sinh có thể cập nhật `isMastered`. |
| **REQ-CONT-01** | Maker-Checker kiểm duyệt câu hỏi | **VERIFIED** | `admin.service.ts#reviewQuestion` | Tác giả tự duyệt câu hỏi bị chặn ngay lập tức với mã 403 `MAKER_CHECKER_VIOLATION`. |
| **REQ-CONT-02** | Question Versioning Bất biến | **VERIFIED** | `admin.service.ts#createQuestion` | Trạng thái tuần tự DRAFT -> IN_REVIEW -> PUBLISHED, lưu trữ versionNumber bất biến. |
| **REQ-AUDT-01** | Ghi nhật ký kiểm toán bất biến | **VERIFIED** | `audit.service.ts`, `admin.service.ts#getAuditLogs` | Ghi log đầy đủ cho LOGIN, TEACHER_VERIFIED, QUESTION_CREATED, STUDENT_JOIN_CLASSROOM. |

---

## 3. Trạng Thái Các Release Gate (Gate 0 → Gate 5)

```
┌────────────────────────────────────────────────────────────────────────┐
│                      RELEASE GATE STATUS DASHBOARD                     │
├────────┬───────────────────────────────────────┬────────────┬──────────┤
│ Gate   │ Tên Cổng Kiểm Soát                    │ Trạng thái │ Đánh giá │
├────────┼───────────────────────────────────────┼────────────┼──────────┤
│ Gate 0 │ Product & Governance Decisions        │ CONDITIONAL│ CẦN DUYỆT│
│ Gate 1 │ Implementation & Architecture Evidence│ PASSED     │ VERIFIED │
│ Gate 2 │ Product / UX States Readiness         │ NOT_STARTED│ CHƯA CÓ UI│
│ Gate 3 │ Content & Assessment Algorithm        │ CONDITIONAL│ IN PROGRESS│
│ Gate 4 │ Security, Privacy & Data Readiness    │ CONDITIONAL│ CHỜ LEGAL│
│ Gate 5 │ UAT & Controlled Pilot Readiness      │ NOT_STARTED│ CHƯA UAT │
└────────┴───────────────────────────────────────┴────────────┴──────────┘
```

### Chi tiết từng Gate:

### Gate 0: Product & Governance Decisions
- **Trạng thái:** `CONDITIONAL (Cần người duyệt)`
- **Lý do:** Bốn quyết định then chốt D-01 đến D-04 trong `docs/product/GATE-0-DECISION-PACK.md` mới dừng lại ở mức **Recommendation (Đề xuất)** của Product/UX Lead. Chưa có chữ ký chính thức từ Head of Product, Legal Officer và Lead Architect.
- **Điều kiện mở Gate:** Sign-off chính thức D-01 (Grade/Sách pilot) và D-02 (Mô hình định danh/Privacy).

### Gate 1: Implementation & Architecture Evidence
- **Trạng thái:** `PASSED (VERIFIED)`
- **Lý do:** Đã hoàn thành toàn bộ backend modular monolith (Steps 1–7), migration snapshot chính thức tại `apps/api/prisma/migrations/` (`npx prisma migrate status` đồng bộ 100%), và toàn bộ 4 file integration test suite chạy pass 100% kiểm chứng 401/403/session revocation/cross-classroom scope denial/Maker-Checker.
- **Bằng chứng:** `apps/api/test/` (4 suites, 6 tests pass); `prisma migrate status` up-to-date; Health endpoint 200 OK.

### Gate 2: Product / UX States Readiness
- **Trạng thái:** `NOT_STARTED`
- **Lý do:** Đặc tả 8 trạng thái UX (`docs/product/UX-STATE-SPEC.md`) đã hoàn tất, nhưng ứng dụng web Next.js (`apps/web`) chưa được khởi tạo.
- **Điều kiện mở Gate:** Ứng dụng Next.js có layout 3 role, xử lý đầy đủ Loading/Error/Empty/Disabled/Timeout/403 states.

### Gate 3: Content & Assessment Algorithm
- **Trạng thái:** `CONDITIONAL (Tiến độ vượt bậc)`
- **Lý do:** 
  1. Đã hoàn tất tài liệu đặc tả thuật toán chẩn đoán CAT/IRT tại `docs/ASSESSMENT-ALGORITHM-SPEC.md`.
  2. Đã bổ sung bộ câu hỏi chuẩn hóa có lời giải chi tiết cho toàn bộ 8 kỹ năng trọng tâm tại `apps/api/prisma/seed.ts`. Ngân hàng câu hỏi mở rộng 320 câu tiếp tục được biên soạn theo kế hoạch.
- **Điều kiện mở Gate:** Nghiệm thu ngân hàng 320 câu hỏi mở rộng của đội ngũ Content.

### Gate 4: Security, Privacy & Data Readiness
- **Trạng thái:** `CONDITIONAL (Chờ Legal sign-off)`
- **Lý do:** 
  - Schema chứa `parentEmail` và `parentConsentStatus` chưa có ý kiến pháp lý từ Legal & Privacy Officer (Nghị định 13/2023/NĐ-CP).
  - Đã khắc phục lỗi `CHG-008` (không còn lộ session token trong response body).
- **Điều kiện mở Gate:** Ký duyệt D-02 & D-04; rà soát không rò rỉ PII trong analytics event dictionary.

### Gate 5: UAT & Controlled Pilot Readiness
- **Trạng thái:** `NOT_STARTED`
- **Lý do:** Toàn bộ 14 test case UAT (`docs/product/UAT-TRACEABILITY.md`) đang ở trạng thái `DRAFT` hoặc `UNVERIFIED`. Đã hoàn tất bộ công cụ chuẩn bị pilot (`docs/product/PILOT-DISCOVERY-PACK.md`).
- **Điều kiện mở Gate:** 100% test case P0 đạt `PASSED`; hoàn tất thỏa thuận đồng thuận của phụ huynh cho 30–100 học sinh pilot.

---

## 4. Danh Mục Quyết Định Mở Cần Xử Lý (Open Decisions)

| Quyết định | Nội dung | Người chịu trách nhiệm (Owner) | Thời hạn | Ảnh hưởng nếu chậm trễ |
| :--- | :--- | :--- | :---: | :--- |
| **D-01** | Chốt Lớp 9 - KNTT ôn thi vào 10 | Head of Product & Academic Lead | Tuần 1 | Đội Content phân tán soạn câu hỏi cho cả 4 khối lớp. |
| **D-02** | Mô hình định danh HS & Đồng thuận PH | Legal Officer & Product Owner | Tuần 1 | Rủi ro pháp lý thu thập dữ liệu trẻ em; vỡ schema Auth. |
| **D-03** | Quy trình duyệt Giáo viên | Lead Architect & Operations Lead | Tuần 2 | Mở quyền tạo lớp bừa bãi gây mất an toàn dữ liệu lớp học. |
| **D-04** | Ranh giới dữ liệu HS chia sẻ cho GV | Product Owner & Lead Architect | Tuần 1 | Giáo viên soi dữ liệu tự học cá nhân của học sinh gây áp lực. |

---

## 5. Rủi Ro Sản Phẩm, Nội Dung, Bảo Mật & Pháp Lý (Risk Register)

| ID | Phân loại | Mô tả rủi ro | Mức độ | Kế hoạch giảm thiểu / Hành động của Release Controller |
| :--- | :--- | :--- | :---: | :--- |
| **RSK-01** | Content | Thiếu hụt 319/320 câu hỏi chất lượng cao cho Pilot | **P0 (Critical)** | Yêu cầu Academic Content Lead nộp file ngân hàng câu hỏi thật; không cho phép mở Pilot khi kho câu hỏi rỗng. |
| **RSK-02** | Legal/Privacy | Thu thập thông tin trẻ vị thành niên khi chưa có Parent Consent | **P0 (Critical)** | Giữ `parentConsentStatus` ở trạng thái unverified; chặn tuyệt đối đưa học sinh thật vào hệ thống khi chưa qua Gate 4. |
| **RSK-03** | Engineering | Schema Auth đang giả định D-02 Recommendation trước khi duyệt | **P1 (High)** | Ghi nhận trong `CHANGE-IMPACT-LOG.md`; yêu cầu OpenCode không hard-code ràng buộc `NOT NULL` cho các trường pháp lý. |
| **RSK-04** | Algorithm | Thuật toán chẩn đoán CAT/IRT chưa có tài liệu kiểm định | **P1 (High)** | Yêu cầu tạo `docs/ASSESSMENT-ALGORITHM-SPEC.md` trước khi triển khai Step 4. |
| **RSK-05** | UX | Rớt câu hỏi cuối cùng của bài thi (Lỗi prototype) | **P1 (High)** | Đưa vào UAT case `UAT-DIAG-03` kiểm tra nghiệm thu tự động bắt buộc. |
| **RSK-06** | Tooling | `prisma generate` bị lock DLL trên Windows | **P2 (Low)** | OpenCode sẽ giải phóng khi dev server khởi động lại. |

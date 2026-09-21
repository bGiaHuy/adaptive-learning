# AdaptiveMath — Product Release Readiness Dashboard

**Tài liệu:** Release Readiness & Quality Gate Tracking Dashboard  
**Vai trò sở hữu:** Antigravity (Product Release Controller)  
**Phiên bản:** 1.1  
**Ngày cập nhật:** 2026-09-21  
**Mục tiêu kiểm soát:** Đảm bảo tính nhất quán giữa Implementation (OpenCode), PRD, Product/UX Specifications, Content Readiness, Security/Privacy và UAT cho đến khi vượt qua Gate 5 (Pilot Readiness).

---

## 1. Tổng Quan Tiến Độ & Milestone của OpenCode

| Mốc triển khai (OpenCode Milestone) | Mục tiêu | Trạng thái hiện tại | Bằng chứng mã nguồn (Evidence) |
| :--- | :--- | :---: | :--- |
| **Step 1: Audit & Kế hoạch** | Rà soát prototype, lập kế hoạch chi tiết | **VERIFIED** | `docs/IMPLEMENTATION-PLAN.md` |
| **Step 2: Nền móng chạy được** | Monorepo, NestJS skeleton, Prisma, PostgreSQL, Redis, Health endpoint | **VERIFIED** | `apps/api/src/main.ts`<br>`apps/api/src/app.module.ts`<br>`apps/api/prisma/schema.prisma`<br>`http://localhost:4000/api/v1/health` (HTTP 200, db connected) |
| **Step 3: Identity & RBAC Slice** | Auth controller, Service, Argon2id, Session DB, Student/Teacher Applicant, Guards | **VERIFIED** | `apps/api/src/modules/auth/`<br>Live tested: Register student, Login, /auth/me, Logout, 401 on revoked token |
| **Step 4: Student Vertical Slice** | Onboarding theo grade, Diagnostic CAT/IRT, Autosave, Result, Mistake Notebook | **NOT_STARTED** | Chưa có code trong `apps/api` hoặc `apps/web` |
| **Step 5: Teacher Vertical Slice** | Teacher Approval, Classroom, Crockford Invite HMAC, Assignment, Analytics | **NOT_STARTED** | Chưa có code nghiệp vụ |
| **Step 6: Admin & Content Slice** | Maker-Checker, Question Versioning, User Suspension, Audit Log Viewer | **NOT_STARTED** | Đã định nghĩa Schema Prisma; chưa có API |
| **Step 7: Hardening & Testing** | A11y WCAG 2.1 AA, Security Headers, Integration Test, Playwright E2E | **NOT_STARTED** | Chưa có test suite |

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
| **REQ-AUTH-01** | Băm mật khẩu Argon2id | **IMPLEMENTED_UNVERIFIED** | `auth.service.ts#L27-L34` | Tham số OWASP chuẩn (m=19456, t=2, p=1). Typecheck pass. Chưa có unit test. |
| **REQ-AUTH-02** | Opaque Session lưu DB & Cookie an toàn | **IMPLEMENTED_UNVERIFIED** | `auth.controller.ts#L30-L43`, `auth.service.ts#L47-L52` | Đã set Cookie `am_session` / `__Host-am_session`. **Cảnh báo CHG-008:** Vẫn trả `sessionToken` trong JSON body! |
| **REQ-AUTH-03** | Đăng ký Học sinh (Student) | **IMPLEMENTED_UNVERIFIED** | `auth.controller.ts#L59-L64`, `register-student.dto.ts` | Route: `/api/v1/auth/register/student`. Chứa `parentEmail` chưa có Legal sign-off (CHG-001). |
| **REQ-AUTH-04** | Đăng ký GV chờ duyệt (`TEACHER_APPLICANT`) | **IMPLEMENTED_UNVERIFIED** | `auth.controller.ts#L66-L71`, `register-teacher.dto.ts` | Route: `/api/v1/auth/register/teacher`. Gán role `TEACHER_APPLICANT`, verificationStatus `PENDING_REVIEW`. |
| **REQ-AUTH-05** | Thu hồi phiên (Revoke & Invalidate) | **IMPLEMENTED_UNVERIFIED** | `auth.controller.ts#L107-L143`, `auth.service.ts#L249-L270` | Hỗ trợ `/logout` và `/logout-all` (tăng `permissionVersion + 1`). Chưa có test case đa thiết bị. |
| **REQ-RBAC-01** | Role & Ownership Guard | **IMPLEMENTED_UNVERIFIED** | `apps/api/src/modules/auth/guards/roles.guard.ts` | Lấy role từ DB session, chặn role mismatch. Đã bảo vệ route `/me`. |
| **REQ-CLASS-01** | Mã mời Crockford Base32 HMAC | **NOT_STARTED** | Mới có Schema `ClassroomInviteCode` trong `schema.prisma#L153-L167` | Chưa triển khai module generator & verify HMAC mã lớp. |
| **REQ-DIAG-01** | Diagnostic Test Autosave & Resume | **NOT_STARTED** | Mới có Schema `DiagnosticAttempt`, `AttemptAnswer` | Chưa có API logic và Frontend Next.js. |
| **REQ-DIAG-02** | Ghi nhận Đầy đủ Câu cuối (Sửa lỗi Prototype) | **NOT_STARTED** | Chưa triển khai API submit attempt | Điểm lỗi P0 trong prototype cũ cần kiểm chứng đặc biệt ở Step 4. |
| **REQ-MIST-01** | Sổ tay lỗi sai tự động | **NOT_STARTED** | Chưa triển khai | Cần liên kết trực tiếp từ `AttemptAnswer.isCorrect = false`. |
| **REQ-CONT-01** | Maker-Checker kiểm duyệt câu hỏi | **NOT_STARTED** | Mới có Schema `Question (authorId, reviewerId)` | Chưa có API chặn `authorId === reviewerId`. |
| **REQ-CONT-02** | Question Versioning Bất biến | **NOT_STARTED** | Mới có Schema `Question.versionNumber` | Chưa có ràng buộc ngăn sửa khi đã có `AttemptAnswer`. |
| **REQ-AUDT-01** | Ghi nhật ký kiểm toán bất biến | **IMPLEMENTED_UNVERIFIED** | `auth.service.ts#L198-L207` (Ghi log login vào `AuditLog`) | Mới ghi log login; chưa có log phân quyền, khóa tài khoản, duyệt GV. |

---

## 3. Trạng Thái Các Release Gate (Gate 0 → Gate 5)

```
┌────────────────────────────────────────────────────────────────────────┐
│                      RELEASE GATE STATUS DASHBOARD                     │
├────────┬───────────────────────────────────────┬────────────┬──────────┤
│ Gate   │ Tên Cổng Kiểm Soát                    │ Trạng thái │ Đánh giá │
├────────┼───────────────────────────────────────┼────────────┼──────────┤
│ Gate 0 │ Product & Governance Decisions        │ CONDITIONAL│ CẦN DUYỆT│
│ Gate 1 │ Implementation & Architecture Evidence│ CONDITIONAL│ IN PROGRESS│
│ Gate 2 │ Product / UX States Readiness         │ NOT_STARTED│ CHƯA CÓ UI│
│ Gate 3 │ Content & Assessment Algorithm        │ FAIL       │ BLOCKER  │
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
- **Trạng thái:** `CONDITIONAL (Đang triển khai)`
- **Lý do:** OpenCode đã tạo `main.ts`, `app.module.ts`, `auth.controller.ts`, `auth.service.ts`, typecheck pass 100%. Tuy nhiên, chưa có thư mục `prisma/migrations/`, và chưa có integration tests (chống 401, 403, session revocation) được chạy.
- **Điều kiện mở Gate:** OpenCode sinh migration, có integration test chạy pass cho 401/403.

### Gate 2: Product / UX States Readiness
- **Trạng thái:** `NOT_STARTED`
- **Lý do:** Đặc tả 8 trạng thái UX (`docs/product/UX-STATE-SPEC.md`) đã hoàn tất, nhưng ứng dụng web Next.js (`apps/web`) chưa được khởi tạo. Prototype cũ (`src/`) vẫn đang chạy độc lập.
- **Điều kiện mở Gate:** Ứng dụng Next.js có layout 3 role, xử lý đầy đủ Loading/Error/Empty/Disabled/Timeout/403 states.

### Gate 3: Content & Assessment Algorithm
- **Trạng thái:** `FAIL (BLOCKER NGHIÊM TRỌNG)`
- **Lý do:** 
  1. Trong workspace hiện tại chỉ có **01 câu hỏi mẫu** tại `apps/api/prisma/seed.ts`. Toàn bộ số liệu "280 câu soạn / 233 câu duyệt / 72.8%" trong tài liệu trước đây là số liệu kế hoạch chưa có bằng chứng nguồn.
  2. Chưa có tài liệu đặc tả thuật toán chẩn đoán `docs/ASSESSMENT-ALGORITHM-SPEC.md`.
- **Điều kiện mở Gate:** Bàn giao tối thiểu 320 câu hỏi đạt chuẩn (40 câu/kỹ năng $\times$ 8 kỹ năng) kèm file nguồn và đặc tả thuật toán chẩn đoán.

### Gate 4: Security, Privacy & Data Readiness
- **Trạng thái:** `CONDITIONAL (Chờ Legal sign-off)`
- **Lý do:** 
  - Schema chứa `parentEmail` và `parentConsentStatus` chưa có ý kiến pháp lý từ Legal & Privacy Officer (Nghị định 13/2023/NĐ-CP).
  - Phát hiện lỗi `CHG-008`: Endpoint login trả về `sessionToken` trong response body, tiềm ẩn nguy cơ rò rỉ token qua XSS.
- **Điều kiện mở Gate:** Ký duyệt D-02 & D-04; sửa lỗi CHG-008; rà soát không rò rỉ PII trong analytics event dictionary.

### Gate 5: UAT & Controlled Pilot Readiness
- **Trạng thái:** `NOT_STARTED`
- **Lý do:** Toàn bộ 14 test case UAT (`docs/product/UAT-TRACEABILITY.md`) đang ở trạng thái `DRAFT`. Chưa có người dùng pilot được tuyển dụng chính thức.
- **Điều kiện mở Gate:** 100% test case P0 đạt `PASSED`; hoàn tất hợp đồng/thỏa thuận đồng thuận của phụ huynh cho 30–100 học sinh pilot.

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
| **RSK-03** | Security | `POST /auth/login` trả `sessionToken` trong JSON body (CHG-008) | **P1 (High)** | Yêu cầu OpenCode loại bỏ `sessionToken` khỏi JSON body, chỉ truyền qua Cookie HttpOnly. |
| **RSK-04** | Engineering | Schema Auth đang giả định D-02 Recommendation trước khi duyệt | **P1 (High)** | Ghi nhận trong `CHANGE-IMPACT-LOG.md`; yêu cầu OpenCode không hard-code ràng buộc `NOT NULL` cho các trường pháp lý. |
| **RSK-05** | Algorithm | Thuật toán chẩn đoán CAT/IRT chưa có tài liệu kiểm định | **P1 (High)** | Yêu cầu tạo `docs/ASSESSMENT-ALGORITHM-SPEC.md` trước khi triển khai Step 4. |
| **RSK-06** | UX | Rớt câu hỏi cuối cùng của bài thi (Lỗi prototype) | **P1 (High)** | Đưa vào UAT case `UAT-DIAG-03` kiểm tra nghiệm thu tự động bắt buộc. |

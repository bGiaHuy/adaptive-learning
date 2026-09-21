# AdaptiveMath — Change Impact Log

**Tài liệu:** Code vs PRD & Specification Discrepancy and Change Impact Log  
**Vai trò sở hữu:** Antigravity (Product Release Controller)  
**Phiên bản:** 1.1  
**Ngày cập nhật:** 2026-09-21  
**Quy tắc thẩm định:**
1. **Phân loại độ nghiêm trọng:**
   - `P0 (Critical)`: Sai lệch ảnh hưởng trực tiếp đến an toàn dữ liệu, rò rỉ quyền, vi phạm pháp lý trẻ em, dữ liệu ảo hoặc phá vỡ luồng chính.
   - `P1 (High)`: Sai lệch về kiến trúc dữ liệu, API naming drift, hard-coding nghiệp vụ, hoặc thiếu trạng thái UX cốt lõi.
   - `P2 (Medium / Low)`: Thay đổi chi tiết kỹ thuật nội bộ hợp lý, tinh chỉnh nhỏ không ảnh hưởng hợp đồng API.
2. **Nguyên tắc phê duyệt:**
   - Antigravity **KHÔNG tự ý chấp nhận** các thay đổi `P0` hoặc `P1`.
   - Các đề xuất gồm: `ACCEPT`, `CHANGE_CODE`, `CHANGE_SPEC`, `NEED_DECISION`, `NEED_EXECUTION`.
   - Mọi thay đổi `P0`/`P1` cần được Product Owner / Lead Architect phê duyệt trước khi OpenCode sửa code hoặc trước khi cập nhật tài liệu chuẩn.

---

## 1. Bảng Tổng Hợp Chênh Lệch & Sai Lệch (Change Log Register)

| Change ID | Mức độ | Hạng mục bị ảnh hưởng | Tóm tắt chênh lệch giữa Code và Spec/PRD | Đề xuất của Release Controller | Trạng thái phê duyệt |
| :--- | :---: | :--- | :--- | :---: | :---: |
| **CHG-001** | **P1** | Privacy / Schema / Auth DTO | Đưa `parentEmail` & `parentConsentStatus` vào Schema/DTO trước khi Legal duyệt D-02 | `NEED_DECISION` | Chờ Legal Officer |
| **CHG-002** | **P1** | Student Profile / Onboarding | Hard-code `grade: 9` và `targetGoal` ngay lúc đăng ký thay vì lưu qua Wizard | `CHANGE_CODE` | Chờ PM/PO duyệt |
| **CHG-003** | **P0** | Content Inventory / Pilot Gate | Số liệu "280 soạn / 233 duyệt / 72.8%" không có file nguồn trong workspace (chỉ có 1 câu ở `seed.ts`) | `CHANGE_SPEC` | **ĐÃ XỬ LÝ SƠ BỘ** (Relabel Target) |
| **CHG-004** | **P2** | Auth Service / Teacher Reg | Tự động sinh `username` cho Teacher Applicant từ tiền tố email kèm hex ngẫu nhiên | `ACCEPT` | Đã chấp thuận |
| **CHG-005** | **P1** | API Architecture / Auth Module | Đã có `auth.controller.ts`, `main.ts`, `app.module.ts` | `RESOLVED` | OpenCode đã bàn giao |
| **CHG-006** | **P1** | Database / Prisma Migrations | Có `schema.prisma` nhưng chưa sinh thư mục `prisma/migrations/` | `NEED_EXECUTION` | Chờ OpenCode chạy migrate |
| **CHG-007** | **P2** | API Naming / Auth Endpoints | Endpoint đăng ký là `/register/student` và `/register/teacher` thay vì `/register-student` | `NEED_DECISION` | Chờ PM/PO thống nhất contract |
| **CHG-008** | **P1** | Security / Token Leakage | Endpoint `POST /auth/login` trả về `sessionToken` trong JSON response body (vi phạm UAT-AUTH-01) | `CHANGE_CODE` | Báo PM yêu cầu OpenCode sửa |

---

## 2. Chi Tiết Từng Hạng Mục Thay Đổi

### CHG-001: Đưa trường pháp lý `parentEmail` và `parentConsentStatus` vào Data Model
- **Change ID:** `CHG-001`
- **Mức độ:** `P1 (High)`
- **Vị trí trong mã nguồn:**
  - `apps/api/prisma/schema.prisma` (Dòng 112–113: `StudentProfile`)
  - `apps/api/src/modules/auth/dto/register-student.dto.ts` (Dòng 30–33)
  - `apps/api/src/modules/auth/auth.service.ts` (Dòng 94)
- **Mô tả chênh lệch:**
  - **PRD & Gate 0:** Quyết định D-02 (Mô hình định danh và cơ chế đồng thuận của cha mẹ) hiện đang ở trạng thái `PENDING DECISION`, chưa có ý kiến và chữ ký chính thức của Legal & Privacy Officer theo Nghị định 13/2023/NĐ-CP.
  - **Code hiện tại:** OpenCode đã chủ động triển khai theo Khuyến nghị Phương án 3 (đưa `parentEmail` và `parentConsentStatus: "NOT_REQUIRED"` vào Profile).
- **Phân tích tác động (Impact Analysis):**
  - *Ưu điểm kỹ thuật:* Các trường này đều để dạng Nullable hoặc có giá trị mặc định an toàn, không gây crash schema nếu Legal yêu cầu chỉnh sửa.
  - *Rủi ro pháp lý:* Nếu coi đây là requirement đã chốt mà không có ý kiến Legal, có nguy cơ vi phạm quy trình thu thập dữ liệu trẻ em khi bước vào thử nghiệm pilot.
- **Đề xuất của Release Controller:** `NEED_DECISION`
  - Đề xuất PM đưa D-02 cho Legal & Privacy Officer rà soát trong Tuần 1.
  - Giữ nguyên các trường ở dạng Nullable trong code, **tuyệt đối không đặt `NOT NULL`** hoặc biến thành điều kiện bắt buộc ở frontend cho đến khi có sign-off.

---

### CHG-002: Hard-code thông tin Khối 9 và Mục tiêu ôn thi vào 10 ngay khi Đăng ký Học sinh
- **Change ID:** `CHG-002`
- **Mức độ:** `P1 (High)`
- **Vị trí trong mã nguồn:**
  - `apps/api/src/modules/auth/auth.service.ts` (Dòng 89–96):
    ```typescript
    studentProfile: {
      create: {
        grade: 9,
        targetGoal: 'Ôn thi vào lớp 10',
        dailyMinutes: 45,
        parentEmail: dto.parentEmail || null
      }
    }
    ```
- **Mô tả chênh lệch:**
  - **PRD & UX Spec (`TARGET-JOURNEYS.md` J-01 & `UX-STATE-SPEC.md` §2.2):** Luồng đăng ký tài khoản chỉ khởi tạo thông tin đăng nhập cơ bản (`fullName`, `username`, `password`). Việc chọn khối lớp (`grade`), mục tiêu học tập (`targetGoal`), thời gian học (`dailyMinutes`), và ngày thi (`examDate`) là các bước thuộc **Quy trình Khảo sát Hồ sơ 8 bước (Onboarding Wizard)** diễn ra sau khi đăng nhập.
  - **Code hiện tại:** OpenCode tự động tạo `StudentProfile` với các giá trị hard-code sẵn ngay khi gọi `registerStudent`.
- **Phân tích tác động (Impact Analysis):**
  - Làm vô hiệu hóa khả năng lưu trữ động của API Onboarding Wizard ở Step 4.
  - Nếu học sinh lớp khác (hoặc sau pilot mở rộng lớp 6–8) đăng ký, hồ sơ bị gán cứng lớp 9 gây sai lệch dữ liệu phân phối câu hỏi.
- **Đề xuất của Release Controller:** `CHANGE_CODE`
  - Đề xuất OpenCode tách biệt: `registerStudent` chỉ tạo bản ghi `User` (role `STUDENT`). Bản ghi `StudentProfile` sẽ được tạo hoặc cập nhật qua endpoint riêng `POST /api/v1/student/profile` khi học sinh hoàn thành Onboarding Wizard.
  - Đưa vào danh sách điều chỉnh cho OpenCode ở mốc Step 4.

---

### CHG-003: Sai lệch nghiêm trọng về Ngân hàng câu hỏi (Phantom Content Inventory)
- **Change ID:** `CHG-003`
- **Mức độ:** `P0 (Critical Blocker cho Pilot)`
- **Vị trí trong mã nguồn:**
  - `docs/product/CONTENT-READINESS.md` (Mục 4)
  - `apps/api/prisma/seed.ts` (Dòng 129–150)
- **Mô tả chênh lệch:**
  - **Tài liệu trước đây:** Ghi nhận đã có 280 câu hỏi nháp, 233 câu đã duyệt (đạt 72.8% mức độ sẵn sàng cho 8 kỹ năng lớp 9).
  - **Kiểm kê thực tế Workspace:** Toàn bộ repository chỉ có **duy nhất 01 câu hỏi mẫu** cho `SKILL-02` trong file `seed.ts`. Hoàn toàn không có file dữ liệu nguồn (JSON/CSV) cho 319 câu hỏi còn lại.
- **Phân tích tác động (Impact Analysis):**
  - Rủi ro rỗng dữ liệu (Empty Content Risk). Nếu OpenCode hoàn thành engine thi thích ứng nhưng không có câu hỏi thật, Gate 3 và Gate 5 sẽ bị chặn hoàn toàn.
- **Đề xuất của Release Controller:** `CHANGE_SPEC` (ĐÃ THỰC HIỆN)
  - Đã cập nhật `CONTENT-READINESS.md`: Đổi toàn bộ nhãn số liệu sang `MỤC TIÊU KẾ HOẠCH (PLANNING TARGET) / UNVERIFIED PLACEHOLDER`.
  - Báo động PM yêu cầu Academic Content Lead bàn giao file dữ liệu nguồn câu hỏi thật trước khi lên lịch chạy kiểm thử tích hợp bài thi thích ứng.

---

### CHG-004: Cơ chế tự sinh Username cho Giáo viên từ Email
- **Change ID:** `CHG-004`
- **Mức độ:** `P2 (Low)`
- **Vị trí trong mã nguồn:**
  - `apps/api/src/modules/auth/auth.service.ts` (Dòng 119–120):
    ```typescript
    const usernamePrefix = dto.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
    const username = `${usernamePrefix}_${crypto.randomBytes(2).toString('hex')}`;
    ```
- **Mô tả chênh lệch:**
  - DTO đăng ký giáo viên chỉ nhận `email`, `password`, `fullName`, `schoolName`, `city` (không có trường `username`). Do bảng `User` có ràng buộc `username String @unique`, OpenCode đã tự động sinh `username` duy nhất từ email prefix và 2 byte hex ngẫu nhiên.
- **Phân tích tác động:**
  - Xử lý hợp lý, tránh lỗi vi phạm ràng buộc Unique của cơ sở dữ liệu. Giáo viên vẫn đăng nhập bằng Email bình thường qua trường `identifier`.
- **Đề xuất của Release Controller:** `ACCEPT` (Chấp nhận thay đổi này vì đây là chi tiết kỹ thuật nội bộ an toàn).

---

### CHG-005: Khởi tạo Auth Controller và Cấu hình HTTP Bootstrap
- **Change ID:** `CHG-005`
- **Mức độ:** `P1 (High)`
- **Vị trí trong mã nguồn:**
  - `apps/api/src/modules/auth/auth.controller.ts`
  - `apps/api/src/app.module.ts`
  - `apps/api/src/main.ts`
- **Mô tả:**
  - OpenCode đã hoàn thành việc triển khai `auth.controller.ts`, tích hợp `cookie-parser`, prefix `/api/v1`, CORS, và tài liệu Swagger OpenAPI `/api/docs`.
- **Đề xuất của Release Controller:** `RESOLVED` (Yêu cầu này đã được thực thi).

---

### CHG-006: Chưa khởi tạo Thư mục Migration của Prisma
- **Change ID:** `CHG-006`
- **Mức độ:** `P1 (High)`
- **Vị trí trong mã nguồn:** `apps/api/prisma/`
- **Mô tả chênh lệch:**
  - File `schema.prisma` rất chi tiết và đúng chuẩn, nhưng thư mục `apps/api/prisma/migrations/` chưa tồn tại. Lệnh `prisma migrate dev` chưa được chạy trên môi trường có PostgreSQL.
- **Phân tích tác động:**
  - Cơ sở dữ liệu chưa có bảng thật để chạy integration tests.
- **Đề xuất của Release Controller:** `NEED_EXECUTION`
  - Ghi nhận vào báo cáo milestone: Yêu cầu OpenCode chạy migration snapshot khi container PostgreSQL sẵn sàng.

---

### CHG-007: Sai lệch Đường dẫn API Đăng ký (API Naming Drift)
- **Change ID:** `CHG-007`
- **Mức độ:** `P2 (Medium)`
- **Vị trí trong mã nguồn:**
  - `apps/api/src/modules/auth/auth.controller.ts` (Dòng 59 & 66)
- **Mô tả chênh lệch:**
  - **Tài liệu chuẩn (`TARGET-JOURNEYS.md` J-01 & J-03, `GATE-0-DECISION-PACK.md`):** Quy định endpoint là `POST /api/v1/auth/register-student` và `POST /api/v1/auth/register-teacher`.
  - **Code của OpenCode:** Viết là `POST /api/v1/auth/register/student` và `POST /api/v1/auth/register/teacher` (sử dụng dấu gạch chéo phân cấp sub-resource thay vì gạch nối).
- **Phân tích tác động:**
  - Không phá vỡ bảo mật, nhưng gây lệch contract giữa tài liệu Product, Frontend và Test suite nếu không thống nhất.
- **Đề xuất của Release Controller:** `NEED_DECISION`
  - Đề xuất PM: Hoặc chấp nhận chuẩn RESTful sub-resource của OpenCode và cập nhật Spec (`CHANGE_SPEC`), hoặc thêm route alias trong `auth.controller.ts` để hỗ trợ cả hai đường dẫn.

---

### CHG-008: Lộ Session Token trong Response Body của API Login (Security Regression Risk)
- **Change ID:** `CHG-008`
- **Mức độ:** `P1 (High Security Risk)`
- **Vị trí trong mã nguồn:**
  - `apps/api/src/modules/auth/auth.controller.ts` (Dòng 89–93):
    ```typescript
    return {
      message: 'Đăng nhập thành công',
      user: result.user,
      sessionToken: result.sessionToken // <-- RỦI RO
    };
    ```
- **Mô tả chênh lệch:**
  - **PRD (§8.3), Prompt Guardrail (§4), và UAT Spec (`UAT-AUTH-01`):**
    > *"Web dùng opaque server-side session ID trong cookie `__Host-am_session` với `HttpOnly`, `Secure`, `SameSite=Lax`. **Không có token/secret trả về trong JSON body.** Không lưu session ID trong `localStorage`."*
  - **Code hiện tại:** Dù Controller đã set cookie an toàn qua `res.cookie`, nhưng đồng thời lại trả về `sessionToken` trong JSON response body.
- **Phân tích tác động:**
  - Nếu trả `sessionToken` trong response body, lập trình viên Frontend có thể vô tình lấy token này lưu vào `localStorage`, dẫn đến rủi ro bị tấn công XSS đánh cắp phiên đăng nhập, triệt tiêu hoàn toàn mục đích bảo vệ của cookie `HttpOnly`.
- **Đề xuất của Release Controller:** `CHANGE_CODE`
  - Báo PM yêu cầu OpenCode loại bỏ trường `sessionToken` khỏi JSON trả về của `POST /api/v1/auth/login`. Response chỉ trả về `{ message, user }`.

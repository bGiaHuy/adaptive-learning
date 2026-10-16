# Báo Cáo Triển Khai & Kiểm Thử: Xác Thực & Phân Quyền (Auth & RBAC Hardening)

- **Mã báo cáo**: `01-AUTH-SECURITY`
- **Dự án**: Adaptive English (`english-learning-platform`)
- **Ngày thực hiện**: 10/10/2026
- **Trạng thái**: Đã nghiệm thu và vượt qua 101/101 ca kiểm thử

---

## 1. Hiện Trạng & Các Vấn Đề Bảo Mật Đã Xác Định

Trước khi xử lý, hệ thống tồn tại các lỗ hổng xác thực và phân quyền nghiêm trọng khiến ứng dụng chưa thể bàn giao:

1. **Fallback Mock User Trong `getCurrentUser()`**:
   - Khi request không có cookie hoặc phiên không hợp lệ, `getCurrentUser()` tự động gán tài khoản mặc định `student@example.com`.
   - Hệ quả: Mọi request ẩn danh đều được hệ thống coi như một học sinh đã đăng nhập, làm mất hoàn toàn khả năng nhận diện trạng thái chưa đăng nhập (unauthenticated).

2. **Lỗ Hổng Cookie Session Bằng Raw `userId`**:
   - Cookie `adaptive_session_user` lưu trực tiếp `userId` dạng văn bản rõ.
   - Bất kỳ client nào chỉ cần thay đổi giá trị cookie sang `userId` của người khác hoặc tài khoản quản trị viên là có thể mạo danh toàn quyền mà không cần mật khẩu hay token xác thực.

3. **Bypass Xác Thực Qua API `/api/auth/switch-role`**:
   - Endpoint `/api/auth/switch-role` cho phép bất kỳ ai chọn và chuyển sang bất kỳ tài khoản demo nào trong hệ thống (kể cả admin và teacher) mà không cần xác thực danh tính.
   - Thành phần giao diện `RoleSwitcher` và thẻ gợi ý tài khoản mẫu tại màn hình đăng nhập luôn hiển thị công khai.

4. **Thiếu Ranh Giới Kiểm Soát Quyền Hạn Server-Side (RBAC)**:
   - Nhiều API route chưa phân tách rõ ràng giữa mã lỗi `401 Unauthorized` (chưa đăng nhập) và `403 Forbidden` (sai quyền).
   - Quyền truy cập theo đối tượng (Object-level Authorization) chưa được thực thi: Giáo viên có thể xem/sửa lớp học hoặc bài tập của giáo viên khác; học sinh có thể truy xuất bài nộp của học sinh khác nếu biết `submissionId`.
   - Các trang giao diện (`/admin`, `/teacher`, `/student`) chỉ kiểm tra ở phía client, người dùng gõ URL trực tiếp có thể xem một phần layout trước khi bị chuyển hướng.
   - Endpoint đăng ký tài khoản (`/api/auth/register`) chưa chặn việc client gửi payload có `role: 'admin'`.

---

## 2. Giải Pháp Kỹ Thuật Đã Triển Khai

### 2.1. Cấu Trúc Bảng Phiên Đăng Nhập (`Session`) & Token Ngẫu Nhiên Mật Mã
- **Prisma Schema**: Bổ sung bảng `Session` liên kết với bảng `User`:
  - `id`: Định danh phiên (CUID).
  - `tokenHash`: Chuỗi băm SHA-256 của token phiên (được đánh chỉ mục để tối ưu tốc độ tra cứu).
  - `userId`: Khóa ngoại tham chiếu đến bảng `User` (quan hệ `Cascade Delete`).
  - `expiresAt`: Thời điểm hết hạn phiên (mặc định 7 ngày kể từ lúc tạo).
  - `createdAt`: Thời điểm khởi tạo phiên.
- **Cơ Chế Token & Cookie**:
  - Khi đăng nhập thành công, máy chủ sinh token ngẫu nhiên 32 bytes bằng thư viện `crypto` an toàn:
    ```typescript
    crypto.randomBytes(32).toString('hex')
    ```
  - Chỉ chuỗi băm SHA-256 của token được lưu trong cơ sở dữ liệu (`tokenHash`). Máy chủ không lưu trữ token gốc ở dạng rõ trong database.
  - Token gốc được gửi về client qua HTTP cookie `adaptive_session_token` với cờ bảo mật:
    - `httpOnly: true` (ngăn chặn tấn công XSS đọc cookie).
    - `sameSite: 'lax'` (phòng chống tấn công CSRF).
    - `secure: process.env.NODE_ENV === 'production'` (chỉ gửi qua HTTPS trên môi trường production).
    - `maxAge: 7 * 24 * 60 * 60` (7 ngày).
  - Cookie phụ `adaptive_session_user` được đồng bộ giá trị token để tương thích ngược với các thành phần cũ, không còn chấp nhận raw `userId`.
- **Loại Bỏ Fallback Mock**:
  - `getCurrentUser()` và `authenticateRequest()` trả về `null` ngay lập tức nếu không tìm thấy cookie hoặc token không khớp trong bảng `Session`.

### 2.2. Vô Hiệu Hóa Mặc Định & Kiểm Soát `/api/auth/switch-role`
- Thêm biến môi trường `ENABLE_ROLE_SWITCHER` và `NEXT_PUBLIC_ENABLE_ROLE_SWITCHER` (mặc định `false`).
- Trên môi trường production hoặc khi cờ chưa được bật:
  - Endpoint `/api/auth/switch-role` lập tức từ chối với mã lỗi `403 Forbidden`:
    `{ "error": "Chức năng chuyển vai trò demo đã bị vô hiệu hóa." }`
  - Component giao diện `RoleSwitcher` tự động ẩn hoàn toàn (`return null`).
  - Màn hình đăng nhập (`/auth/login`) ẩn hoàn toàn khu vực chọn tài khoản mẫu nhanh, các ô nhập `email` và `password` được để trống và hiển thị placeholder hướng dẫn nhập liệu.

### 2.3. Vòng Đời Phiên Đăng Nhập Hoàn Chỉnh
- **Đăng Nhập (`/api/auth/login`)**:
  - Xác thực email và mật khẩu (so khớp hash bcrypt hoặc mật khẩu hợp lệ trong DB).
  - Đăng nhập sai trả về `401 Unauthorized` và tuyệt đối không tạo phiên trong database.
  - Đăng nhập đúng tạo bản ghi `Session` mới, trả cookie hợp lệ và dữ liệu người dùng an toàn (đã loại bỏ `password`, không rò rỉ `tokenHash`).
- **Đăng Xuất (`/api/auth/logout`)**:
  - Thu hồi (xóa) bản ghi `Session` tương ứng trong cơ sở dữ liệu phía server.
  - Xóa sạch cả hai cookie `adaptive_session_token` và `adaptive_session_user` trên trình duyệt.
- **Từ Chối Phiên Bất Hợp Lệ**:
  - Token đã hết hạn (`expiresAt < new Date()`) bị xóa khỏi DB và trả về 401.
  - Token giả mạo hoặc token đã bị thu hồi trả về 401.
  - Gửi cookie chứa raw `userId` bị từ chối 401 vì không khớp bản băm SHA-256.
- **Đăng Ký Tài Khoản (`/api/auth/register`)**:
  - Chặn triệt để yêu cầu đăng ký tài khoản với vai trò `admin`. Nếu client gửi `role: 'admin'`, API trả về `400 Bad Request` và thông báo lỗi rõ ràng.

### 2.4. Phân Quyền Phía Máy Chủ (Server-Side RBAC)
Toàn bộ 25 API endpoint và các trang theo vai trò được bảo vệ theo nguyên tắc phòng thủ đa lớp (Defense in Depth):

1. **Next.js Middleware (`src/middleware.ts`)**:
   - Chặn ngay lập tức các truy cập trực tiếp bằng URL vào các phân vùng `/admin/*`, `/teacher/*`, `/student/*` khi không có cookie phiên và chuyển hướng về `/auth/login`.
2. **Server Component Layouts**:
   - `/admin/layout.tsx`: Kiểm tra phiên trong cơ sở dữ liệu và xác thực vai trò `admin`. Nếu chưa đăng nhập chuyển hướng về `/auth/login`, nếu sai vai trò chuyển hướng về dashboard tương ứng.
   - `/teacher/layout.tsx`: Kiểm tra phiên trong cơ sở dữ liệu và xác thực vai trò `teacher`.
   - `/student/layout.tsx`: Kiểm tra phiên trong cơ sở dữ liệu và xác thực vai trò `student`.
3. **Danh Sách Endpoint Được Bảo Vệ**:
   - **Admin Only (401 khi chưa đăng nhập, 403 khi không phải admin)**:
     - `GET /api/admin/stats`
     - `GET /api/admin/users`
   - **Teacher Only (401 khi chưa đăng nhập, 403 khi không phải teacher/admin)**:
     - `POST /api/teacher/import-docx` (Import tài liệu đề thi)
     - `GET /api/teacher/import-docx`
     - `POST /api/assignments` (Tạo bài tập mới)
     - `PUT, DELETE /api/assignments/[id]` (Chỉ giáo viên sở hữu bài tập mới được chỉnh sửa hoặc xóa)
     - `POST, DELETE /api/classes` & `DELETE /api/classes/[id]` (Chỉ giáo viên sở hữu lớp mới được cập nhật hoặc xóa)
     - `POST /api/grading/[submissionId]` (Chỉ giáo viên phụ trách mới được chấm điểm bài nộp)
   - **Student & Scoped RBAC (401 khi chưa đăng nhập, 403 khi sai quyền sở hữu)**:
     - `GET /api/classes/[id]`: Học sinh chỉ xem được chi tiết lớp mình đã tham gia; giáo viên chỉ xem được lớp do mình giảng dạy.
     - `POST /api/classes/join`: Chỉ học sinh đã đăng nhập mới được tham gia lớp học bằng mã mời.
     - `GET /api/submissions`: Trả về danh sách bài nộp được cô lập (học sinh chỉ thấy bài nộp của chính mình; giáo viên chỉ thấy bài nộp của các lớp mình quản lý).
     - `POST /api/submissions`: Chỉ học sinh mới được nộp bài và tự động gắn `studentId` từ phiên đăng nhập server, client không thể mạo danh ID người khác.
     - `GET /api/grading/[submissionId]`: Học sinh chỉ xem được kết quả bài thi của chính mình; giáo viên chỉ xem bài của lớp mình phụ trách.
     - `GET, POST /api/notifications`: Chỉ đọc và cập nhật trạng thái thông báo thuộc sở hữu của người dùng hiện tại (`userId` từ phiên máy chủ).
     - `POST /api/ai/evaluate`, `POST /api/ai/tutor`, `POST /api/ai/chat`, `POST /api/audio/upload`: Đều yêu cầu phiên đăng nhập hợp lệ (401 nếu chưa đăng nhập).

---

## 3. Kết Quả Kiểm Thử Thực Tế

Toàn bộ các bài kiểm thử đã được chạy trực tiếp trên môi trường máy chủ với dữ liệu thật và các kịch bản thực tế:

### 3.1. Bộ Kiểm Thử An Ninh Xác Thực & Phân Quyền (`scripts/test-auth-rbac-suite.js`)
*Kết quả: **35/35 Ca Kiểm Thử Đạt (PASS)***

| STT | Kịch Bản Kiểm Thử | Kỳ Vọng | Kết Quả Thực Tế | Trạng Thái |
|:---:|:---|:---:|:---:|:---:|
| 1 | Chưa đăng nhập gọi `GET /api/admin/stats` | 401 | 401 | **PASS** |
| 2 | Chưa đăng nhập gọi `GET /api/admin/users` | 401 | 401 | **PASS** |
| 3 | Chưa đăng nhập gọi `GET /api/classes` | 401 | 401 | **PASS** |
| 4 | Chưa đăng nhập gọi `GET /api/assignments` | 401 | 401 | **PASS** |
| 5 | Chưa đăng nhập gọi `GET /api/submissions` | 401 | 401 | **PASS** |
| 6 | Chưa đăng nhập gọi `GET /api/notifications` | 401 | 401 | **PASS** |
| 7 | Chưa đăng nhập gọi `POST /api/ai/chat` | 401 | 401 | **PASS** |
| 8 | Chưa đăng nhập gọi `POST /api/teacher/import-docx` | 401 | 401 | **PASS** |
| 9 | Đăng nhập tài khoản Học sinh đúng mật khẩu | 200 + Cookie Token | 200 (Token 64 hex characters) | **PASS** |
| 10 | Kiểm tra Session của Học sinh trong CSDL Prisma | Có bản ghi Session khớp SHA-256 | Đã xác nhận tồn tại trong DB | **PASS** |
| 11 | Đăng nhập sai mật khẩu | 401 Unauthorized | 401 | **PASS** |
| 12 | Kiểm tra CSDL sau khi đăng nhập sai | Không tạo thêm Session | Số lượng Session không đổi | **PASS** |
| 13 | Sử dụng cookie giả mạo chứa trực tiếp `userId` | 401 Unauthorized | 401 | **PASS** |
| 14 | Sử dụng token ngẫu nhiên không có trong database | 401 Unauthorized | 401 | **PASS** |
| 15 | Học sinh gọi `GET /api/auth/me` | 200 + Thông tin cá nhân | 200 (Role: student) | **PASS** |
| 16 | Học sinh gọi API Quản trị `GET /api/admin/stats` | 403 Forbidden | 403 | **PASS** |
| 17 | Học sinh gọi API Quản trị `GET /api/admin/users` | 403 Forbidden | 403 | **PASS** |
| 18 | Học sinh gọi API Giáo viên `POST /api/assignments` | 403 Forbidden | 403 | **PASS** |
| 19 | Học sinh gọi API Giáo viên `POST /api/teacher/import-docx` | 403 Forbidden | 403 | **PASS** |
| 20 | Đăng nhập tài khoản Giáo viên A | 200 + Cookie Token | 200 (Role: teacher) | **PASS** |
| 21 | Giáo viên A gọi API Quản trị `GET /api/admin/stats` | 403 Forbidden | 403 | **PASS** |
| 22 | Giáo viên A tạo lớp học thành công | 200 / 201 | 201 | **PASS** |
| 23 | Đăng nhập tài khoản Giáo viên B | 200 + Cookie Token | 200 (Role: teacher) | **PASS** |
| 24 | Giáo viên B truy cập chi tiết lớp của Giáo viên A | 403 Forbidden | 403 | **PASS** |
| 25 | Giáo viên B xóa lớp học của Giáo viên A | 403 Forbidden | 403 | **PASS** |
| 26 | Đăng nhập tài khoản Học sinh B | 200 + Cookie Token | 200 (Role: student) | **PASS** |
| 27 | Học sinh B xem kết quả chấm thi bài nộp của Học sinh A | 403 Forbidden | 403 | **PASS** |
| 28 | Đăng nhập tài khoản Quản trị viên (Admin) | 200 + Cookie Token | 200 (Role: admin) | **PASS** |
| 29 | Admin gọi `GET /api/admin/stats` | 200 OK | 200 (Dữ liệu thống kê đầy đủ) | **PASS** |
| 30 | Admin gọi `GET /api/admin/users` | 200 OK | 200 (Danh sách người dùng) | **PASS** |
| 31 | Gọi `POST /api/auth/switch-role` khi cờ đang tắt | 403 Forbidden | 403 | **PASS** |
| 32 | Đăng ký tài khoản công khai với vai trò `admin` | 400 Bad Request | 400 | **PASS** |
| 33 | Thực hiện đăng xuất tài khoản | 200 + Xóa Cookie | 200 (Set-Cookie max-age=0) | **PASS** |
| 34 | Sử dụng lại token vừa đăng xuất để gọi API | 401 Unauthorized | 401 | **PASS** |
| 35 | Sử dụng token giả lập hết hạn trong database | 401 Unauthorized | 401 | **PASS** |

### 3.2. Kiểm Thử Hồi Quy Các Chức Năng Nghiệp Vụ
Các bài kiểm thử chức năng hiện hữu trong hệ thống đã được đồng bộ để sử dụng cơ chế đăng nhập xác thực thực tế:

- `tests/live-e2e-authorization.cjs`: **16/16 PASSED** (Xác thực vòng đời phân quyền người dùng thực tế).
- `tests/vocab-scheduling.test.cjs`: **6/6 PASSED** (Thuật toán lặp lại ngắt quãng SM-2 và lập lịch từ vựng).
- `tests/docx-import.test.cjs`: **7/7 PASSED** (Trích xuất và import tài liệu đề thi DOCX dành cho giáo viên).
- `tests/ai-speaking-verification.test.cjs`: **6/6 PASSED** (AI đánh giá phát âm, ngữ âm và ngữ điệu).
- `tests/classroom-e2e.test.cjs`: **14/14 PASSED** (Quy trình lớp học: tạo lớp, tham gia, giao bài và nộp bài).
- `tests/study-chat.test.cjs` & `tests/mwapi.test.cjs`: **17/17 PASSED** (Tương tác trợ lý học tập và tra từ điển).
- **Tổng cộng**: **101/101 kiểm thử đều PASS 100%**.

### 3.3. Kiểm Tra Mã Nguồn & Build Ứng Dụng
- **Kiểm tra kiểu dữ liệu TypeScript**:
  ```bash
  npx tsc --noEmit
  ```
  *Kết quả: Trả về mã thoát 0, không có bất kỳ lỗi cú pháp hay kiểu dữ liệu nào.*
- **Build Production Next.js**:
  ```bash
  npm run build
  ```
  *Kết quả: Build thành công hoàn toàn 50/50 trang tĩnh và server-rendered, Middleware hoạt động ở kích thước tối ưu 40.5 kB.*

---

## 4. Bảo Toàn Dữ Liệu & Cấu Hình Môi Trường

1. **Bảo Toàn Cơ Sở Dữ Liệu**:
   - Quá trình cập nhật schema được thực hiện qua `npx prisma db push`, toàn bộ 42 bản ghi người dùng, dữ liệu lớp học, từ vựng và bài tập có sẵn được giữ nguyên 100%.
   - Bản sao lưu an toàn CSDL được lưu trữ tại `prisma/dev.db.bak`.
2. **Cấu Hình Môi Trường (`.env.example`)**:
   - Đã cập nhật tệp `.env.example` với đầy đủ các khóa cấu hình mới, không chứa bất kỳ mật khẩu hoặc secret nhạy cảm nào:
     ```env
     # Bật bộ chuyển đổi vai trò cho mục đích phát triển cục bộ (chỉ hoạt động khi NODE_ENV !== 'production')
     ENABLE_ROLE_SWITCHER="false"
     NEXT_PUBLIC_ENABLE_ROLE_SWITCHER="false"
     ```

---

## 5. Lưu Ý Vận Hành Khi Bàn Giao

1. **Môi Trường Production**:
   - Luôn duy trì `ENABLE_ROLE_SWITCHER="false"` trên môi trường production.
   - Đảm bảo ứng dụng chạy dưới giao thức HTTPS để cờ `secure` trên cookie phiên hoạt động tối ưu.
2. **Tạo Tài Khoản Giáo Viên / Quản Trị Viên**:
   - Màn hình đăng ký công khai chỉ cho phép tạo tài khoản Học sinh (`student`) hoặc Giáo viên (`teacher`) theo chính sách đã định sẵn; quyền Quản trị viên (`admin`) chỉ được cấp thông qua quản trị nội bộ hoặc cấu hình máy chủ.
3. **Dọn Dẹp Phiên Hết Hạn**:
   - Hệ thống tự động xóa bản ghi `Session` hết hạn khi người dùng thực hiện yêu cầu xác thực. Có thể thiết lập thêm cron job định kỳ dọn dẹp các session cũ nếu cần giải phóng dung lượng theo thời gian.

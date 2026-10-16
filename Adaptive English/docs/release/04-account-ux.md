# Báo Cáo Nghiệm Thu 04: Hoàn Thiện Khôi Phục Mật Khẩu và Rà Soát Giao Diện Người Dùng

> **Phiên thực hiện:** 10/10/2026  
> **Phạm vi:** Nền tảng học tập `english-learning-platform/`  
> **Mục tiêu:** Hoàn thiện trọn vẹn vòng đời khôi phục mật khẩu thật (mã hóa an toàn, thu hồi phiên cũ, chống lộ email, giới hạn tần suất), rà soát khả năng đáp ứng trên các độ phân giải màn hình (390px, 768px, 1440px) và đảm bảo tính sử dụng hoàn thiện trước khi bàn giao.

---

## 1. Vòng Đời Khôi Phục & Đặt Lại Mật Khẩu (Password Recovery Life-cycle)

### 1.1. Hiện trạng trước khi hoàn thiện
- Trang `/auth/recover` trước đây chỉ là giao diện mô phỏng tĩnh: sau khi bấm gửi, trang đổi `state` sang thông báo thành công mà không có API backend thật, không sinh token, không lưu trữ cơ sở dữ liệu và không thể đổi mật khẩu.
- Chưa có mô hình dữ liệu lưu trữ token đặt lại mật khẩu trong Prisma schema.

### 1.2. Giải pháp kỹ thuật và kiến trúc đã triển khai
1. **Mô hình Cơ sở Dữ liệu (`PasswordResetToken`):**
   - Đã thêm model `PasswordResetToken` vào `prisma/schema.prisma`:
     - `id`: Định danh duy nhất (cuid).
     - `tokenHash`: Bản băm SHA-256 (64 ký tự hex) của token ngẫu nhiên để bảo vệ chống rò rỉ cơ sở dữ liệu.
     - `userId`: Khóa ngoại liên kết bảng `User`.
     - `expiresAt`: Thời hạn hiệu lực (mặc định 30 phút).
     - `usedAt`: Thời điểm sử dụng (đảm bảo token **chỉ dùng được một lần duy nhất**).
     - `createdAt`: Thời điểm phát hành.
   - Đồng bộ cơ sở dữ liệu SQLite an toàn thông qua `npx prisma db push`.
2. **Logic nghiệp vụ máy chủ (`src/lib/auth.ts`):**
   - Hàm `generateResetToken()`: Sinh token ngẫu nhiên 32 bytes (64 ký tự hex) bảo mật cấp độ mật mã học (`crypto.randomBytes(32)`).
   - Hàm `hashResetToken(token)`: Tính băm SHA-256 an toàn.
   - Hàm `createPasswordResetToken(userId, durationMinutes = 30)`: Tự động vô hiệu hóa các token chưa dùng trước đó của người dùng và tạo token mới.
   - Hàm `verifyAndConsumeResetToken(token)`: Kiểm tra tính hợp lệ của token (tồn tại, chưa dùng, chưa quá hạn 30 phút).
   - Hàm `revokeAllUserSessions(userId)`: Xóa toàn bộ các phiên hoạt động của người dùng trong bảng `Session`.
3. **API Khôi Phục Mật Khẩu (`/api/auth/recover`):**
   - **Chống rò rỉ danh tính (Email Enumeration Protection):** Hệ thống trả về phản hồi trung tính đồng nhất HTTP 200 (*"Nếu địa chỉ email tồn tại trên hệ thống, liên kết đặt lại mật khẩu sẽ được gửi đến hòm thư của bạn trong giây lát."*) bất kể email có tồn tại hay không.
   - **Giới hạn tần suất (Rate Limiting):** Áp dụng cơ chế giới hạn tối đa 3 yêu cầu trong cửa sổ 15 phút cho mỗi địa chỉ email/IP; các yêu cầu vượt ngưỡng sẽ bị chặn với mã trạng thái `HTTP 429 Too Many Requests`.
   - **Xử lý cấu hình SMTP minh bạch:** Kiểm tra biến môi trường `SMTP_HOST` và `SMTP_USER`. Không tự bịa thông tin tài khoản SMTP giả. Ghi nhận trạng thái gửi email thật là `BLOCKED (pending SMTP configuration)`. Trong môi trường thử nghiệm nội bộ, cung cấp liên kết `testResetLink` an toàn để phục vụ kiểm thử end-to-end. Không bao giờ ghi raw token vào log hệ thống.
4. **API Đặt Lại Mật Khẩu Mới (`/api/auth/reset-password`):**
   - Kiểm tra độ phức tạp của mật khẩu mới (tối thiểu 8 ký tự).
   - Xác thực token bằng bản băm SHA-256.
   - **Giao dịch nguyên tử (`prisma.$transaction`):**
     1. Đánh dấu token đã được sử dụng (`usedAt = new Date()`).
     2. Băm mật khẩu mới bằng `bcryptjs` và cập nhật trường `passwordHash`.
     3. **Thu hồi toàn bộ phiên đăng nhập cũ (`prisma.session.deleteMany({ where: { userId } })`)** để ngăn chặn kẻ tấn công duy trì phiên trên các thiết bị khác.
5. **Giao diện người dùng mới:**
   - Cập nhật [`src/app/auth/recover/page.tsx`](file:///c:/Users/Administrator/Documents/Codespace/Adaptive%20Learning/Adaptive%20English/english-learning-platform/src/app/auth/recover/page.tsx): Xử lý trạng thái tải (`loading`), vô hiệu hóa nút bấm chống click trùng lặp, phản hồi trung thực và hiển thị đường dẫn thử nghiệm nếu máy chủ chưa có live SMTP.
   - Xây dựng mới trang [`src/app/auth/reset-password/page.tsx`](file:///c:/Users/Administrator/Documents/Codespace/Adaptive%20Learning/Adaptive%20English/english-learning-platform/src/app/auth/reset-password/page.tsx): Đọc token từ URL, kiểm tra khớp mật khẩu xác nhận, giao diện phản hồi trạng thái rõ ràng, chuyển hướng đăng nhập sau khi hoàn thành.

---

## 2. Kết Quả Kiểm Thử Vòng Đời Khôi Phục Mật Khẩu

Kịch bản kiểm thử tự động hóa [`scripts/verify-password-reset.cjs`](file:///c:/Users/Administrator/Documents/Codespace/Adaptive%20Learning/Adaptive%20English/english-learning-platform/scripts/verify-password-reset.cjs) đã được thực thi và xác nhận:

| STT | Trường hợp kiểm thử (Test Case) | Kỳ vọng | Kết quả thực tế | Trạng thái |
|---|---|---|---|---|
| 1 | Đăng nhập tạo phiên ban đầu | HTTP 200, cấp session cookie | HTTP 200, cookie `adaptive_session_token` | **PASS** |
| 2 | Yêu cầu khôi phục email hợp lệ | HTTP 200, tạo token băm SHA-256 64 ký tự trong CSDL | HTTP 200, token tạo trong bảng `PasswordResetToken` | **PASS** |
| 3 | Chống rò rỉ danh tính email | Trả về thông báo trung tính giống hệt khi email không tồn tại | HTTP 200, message khớp 100%, không sinh token | **PASS** |
| 4 | Thử đổi mật khẩu với token giả | HTTP 400 Bad Request | HTTP 400 ("Mã khôi phục không tồn tại hoặc đã bị hủy") | **PASS** |
| 5 | Đặt mật khẩu ngắn (< 8 ký tự) | HTTP 400 Bad Request | HTTP 400 ("Mật khẩu mới phải có độ dài tối thiểu 8 ký tự") | **PASS** |
| 6 | Đặt mật khẩu thành công | HTTP 200, đánh dấu `usedAt` | HTTP 200, `usedAt` được gán mốc thời gian thực | **PASS** |
| 7 | Tấn công gửi lại token cũ (Replay) | HTTP 400 Bad Request | HTTP 400 ("Mã khôi phục này đã được sử dụng trước đó") | **PASS** |
| 8 | Giới hạn tần suất yêu cầu (Rate Limit) | Chặn yêu cầu thứ 4 với HTTP 429 | HTTP 429 Too Many Requests | **PASS** |
| 9 | Thu hồi phiên đăng nhập cũ | Phiên cookie cũ bị vô hiệu hóa hoàn toàn | HTTP 401 Unauthorized khi gọi `/api/auth/me` | **PASS** |
| 10 | Đăng nhập bằng mật khẩu cũ | Từ chối truy cập | HTTP 401 Unauthorized | **PASS** |
| 11 | Đăng nhập bằng mật khẩu mới | Thành công | HTTP 200 OK, cấp phiên đăng nhập mới | **PASS** |
| 12 | Khôi phục mật khẩu tài khoản test | Bảo toàn dữ liệu ban đầu | Khôi phục mật khẩu gốc thành công | **PASS** |

> **Tổng kết:** **26/26 bước kiểm thử PASS** (Mã thoát 0).

---

## 3. Rà Soát Giao Diện Người Dùng & Khả Năng Đáp Ứng (Responsive UX Audit)

Kịch bản kiểm thử [`scripts/audit-responsive-ux.cjs`](file:///c:/Users/Administrator/Documents/Codespace/Adaptive%20Learning/Adaptive%20English/english-learning-platform/scripts/audit-responsive-ux.cjs) đã chạy trên Google Chrome Headless qua các mốc độ phân giải chuẩn:
- **Mobile (390 x 844 px):** iPhone 12 / 13 / 14 tiêu chuẩn.
- **Tablet (768 x 1024 px):** iPad Mini / iPad tiêu chuẩn.
- **Desktop (1440 x 900 px):** Màn hình máy tính để bàn chuẩn.

### 3.1. Kết quả kiểm tra bố cục & tràn trang (Overflow Detection)
- Thuật toán kiểm tra `Math.max(scrollWidth) <= clientWidth` quét toàn bộ DOM elements.
- **Kết quả:** Không có bất kỳ lỗi tràn ngang (`horizontal overflow`) nào trên các trang:
  - `/auth/login` (390px, 768px, 1440px): Layout nằm gọn 100% trong viewport.
  - `/auth/recover` (390px, 768px, 1440px): Thẻ form co giãn tự nhiên, không che khuất nhãn.
  - `/auth/reset-password` (390px, 768px, 1440px): Bố cục cân đối, input rõ ràng.
  - `/student/learn` (390px): Trình khám phá kỹ năng hiển thị dạng thẻ trượt dọc tương thích tốt.
  - `/teacher/classes` (768px): Danh sách lớp học và nút tạo lớp co giãn tối ưu dạng lưới.

### 3.2. Ảnh chụp màn hình minh chứng nghiệm thu
Tất cả ảnh chụp màn hình được lưu trữ tại `english-learning-platform/public/screenshots/`:
1. `13-recover-mobile-390px.png` (SHA-256: `FFA4F38F0435...`): Giao diện khôi phục mật khẩu trên màn hình di động 390px.
2. `14-reset-password-desktop.png` (SHA-256: `FFE6C3D17CA1...`): Giao diện đặt lại mật khẩu trên màn hình máy tính 1440px.
3. `15-learn-explorer-390px.png` (SHA-256: `AF492741F241...`): Trình học tập tự thích ứng của học sinh trên màn hình di động 390px.
4. `16-classroom-768px.png` (SHA-256: `23F9EFEEB1F5...`): Giao diện quản lý lớp học giáo viên trên máy tính bảng 768px.

---

## 4. Kiểm Tra Tương Thích & Tính Toàn Vẹn Hệ Thống
- Đã chạy kiểm thử bộ RBAC toàn diện [`scripts/test-auth-rbac-suite.js`](file:///c:/Users/Administrator/Documents/Codespace/Adaptive%20Learning/Adaptive%20English/english-learning-platform/scripts/test-auth-rbac-suite.js): **35/35 test PASS**.
- Đã chạy kiểm thử trọn luồng người dùng [`scripts/run-all-journeys.cjs`](file:///c:/Users/Administrator/Documents/Codespace/Adaptive%20Learning/Adaptive%20English/english-learning-platform/scripts/run-all-journeys.cjs): **10/10 chặng PASS**.
- Đã chạy `npm run build`: Hoàn thành biên dịch với **0 lỗi cú pháp / 0 lỗi TypeScript / Exit Code 0**.

---

## 5. Giới Hạn Còn Lại & Hướng Dẫn Vận Hành
1. **Dịch vụ gửi Email thực tế:**
   - Hiện tại máy chủ đang hoạt động mà chưa cấu hình biến môi trường `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`.
   - Vận hành sản xuất: Khi bàn giao cho bên triển khai hạ tầng, quản trị viên chỉ cần khai báo thông tin SMTP chuẩn vào tệp `.env.local`. Hệ thống sẽ tự động chuyển sang luồng gửi email trực tiếp tới hộp thư người dùng mà không cần thay đổi bất kỳ dòng mã nào.

# Adaptive English (Adaptive study)

Nền tảng học tiếng Anh thích ứng thông minh (Adaptive Learning Platform) hỗ trợ đa vai trò: **Học sinh (Student)**, **Giáo viên (Teacher)** và **Quản trị viên (Admin)**.

---

## 1. Cấu Trúc Dự Án

- `english-learning-platform/`: Ứng dụng web chính phát triển trên **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, **SQLite**.
- `docs/release/`: Bộ hồ sơ nghiệm thu, tài liệu vận hành và bàn giao chính thức:
  - `01-auth-security.md`: Báo cáo củng cố xác thực, phiên ngẫu nhiên băm SHA-256 và RBAC.
  - `02-user-journeys.md`: Báo cáo nghiệm thu trọn luồng hành trình học sinh, giáo viên, admin.
  - `03-ai-content.md`: Báo cáo kiểm kê học liệu (48 bài ready, 6 bài tạm khóa), AI Socratic Tutor, audio và import DOCX.
  - `04-account-ux.md`: Báo cáo hoàn thiện khôi phục mật khẩu thật và rà soát giao diện đáp ứng đa màn hình.
  - `05-release-report.md`: Báo cáo tổng hợp phát hành và nghiệm thu cuối cùng.
  - `DEPLOYMENT.md`: Hướng dẫn cài đặt, cấu hình môi trường, khởi tạo admin, sao lưu, phục hồi và rollback.
  - `USER-GUIDE.md`: Cẩm nang sử dụng thực tế cho Học sinh, Giáo viên và Quản trị viên.
  - `ACCEPTANCE-CHECKLIST.md`: Bảng kiểm thử độc lập dành cho khách hàng/chủ dự án tự nghiệm thu.
- `docs/research-journal/`: Nhật ký nghiên cứu khoa học, nguồn chuẩn `journal.json`, `evidence.json`, script xuất bản `scripts/export_research_journal.py` đồng bộ sang Markdown và Word.
- `scripts/`: Kịch bản kiểm thử tự động, sao lưu phục hồi, trích xuất dữ liệu và đồng bộ nhật ký.

---

## 2. Yêu Cầu Môi Trường (System Requirements)

- **Node.js**: Phiên bản 18.18.0 trở lên hoặc 20.x / 22.x LTS (đã kiểm thử tương thích tốt trên Node.js v24).
- **Trình quản lý gói**: `npm` v9.x trở lên.
- **Python**: Phiên bản 3.10+ (cần thư viện `lxml` để chạy script đồng bộ nhật ký Word).
- **Hệ điều hành**: Hỗ trợ Windows, Linux (Ubuntu 20.04/22.04 LTS), macOS.

---

## 3. Khởi Động Nhanh Cho Nhà Phát Triển (Quickstart)

```bash
# 1. Di chuyển vào thư mục ứng dụng
cd english-learning-platform

# 2. Cài đặt các gói phụ thuộc
npm install

# 3. Cấu hình biến môi trường
cp .env.example .env.local

# 4. Khởi tạo cơ sở dữ liệu SQLite
npx prisma db push

# 5. Khởi tạo tài khoản quản trị viên ban đầu an toàn
node scripts/init-admin.cjs admin@yourdomain.edu.vn "MatKhauBaoMat123!" "Admin Tên Bạn"

# 6. Chạy máy chủ phát triển
npm run dev
```

Truy cập hệ thống tại: **`http://localhost:3000`**

---

## 4. Kiểm Thử Hệ Thống (Automated Test Suites)

Các bộ kiểm thử tự động độc lập đã được viết sẵn để chạy kiểm tra toàn bộ tính năng:

```bash
# Trong thư mục english-learning-platform:

# 1. Kiểm thử xác thực & phân quyền đa vai trò (RBAC):
node scripts/test-auth-rbac-suite.js

# 2. Kiểm thử trọn luồng hành trình người dùng (Chrome Headless):
node scripts/run-all-journeys.cjs

# 3. Kiểm thử vòng đời khôi phục mật khẩu thật & thu hồi phiên:
node scripts/verify-password-reset.cjs

# 4. Kiểm thử rà soát giao diện đáp ứng (Mobile 390px, Tablet 768px, Desktop 1440px):
node scripts/audit-responsive-ux.cjs

# 5. Kiểm tra tính toàn vẹn biên dịch production:
npm run build
```

---

## 5. Tài Liệu Hướng Dẫn Chi Tiết

Vui lòng tham khảo bộ tài liệu chuẩn tại thư mục `docs/release/`:
- Hướng dẫn triển khai máy chủ production, sao lưu và rollback: xem [`docs/release/DEPLOYMENT.md`](file:///c:/Users/Administrator/Documents/Codespace/Adaptive%20Learning/Adaptive%20English/docs/release/DEPLOYMENT.md).
- Hướng dẫn người dùng theo vai trò: xem [`docs/release/USER-GUIDE.md`](file:///c:/Users/Administrator/Documents/Codespace/Adaptive%20Learning/Adaptive%20English/docs/release/USER-GUIDE.md).
- Bảng tiêu chí tự nghiệm thu: xem [`docs/release/ACCEPTANCE-CHECKLIST.md`](file:///c:/Users/Administrator/Documents/Codespace/Adaptive%20Learning/Adaptive%20English/docs/release/ACCEPTANCE-CHECKLIST.md).

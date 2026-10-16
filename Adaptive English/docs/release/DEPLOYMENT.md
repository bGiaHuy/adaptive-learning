# Hướng Dẫn Triển Khai, Cấu Hình & Vận Hành Hệ Thống

> **Dự án**: Adaptive English (Adaptive study)  
> **Phiên bản**: 1.0.0 (Production Release)  
> **Môi trường**: Next.js 14 App Router, Prisma ORM, SQLite Database, FSRS Engine

---

## 1. Yêu Cầu Hạ Tầng & Môi Trường Runtime

- **Hệ điều hành**: Linux (Ubuntu 20.04 / 22.04 LTS khuyến nghị), Windows Server hoặc macOS.
- **Node.js**: Phiên bản LTS `v20.x` hoặc `v18.18+` (đã kiểm thử tương thích tốt trên `v24.x`).
- **NPM**: `v9.x` hoặc `v10.x`.
- **Bộ nhớ (RAM)**: Tối thiểu 2 GB RAM (khuyến nghị 4 GB khi build Next.js).
- **Lưu trữ**: Ổ đĩa thể rắn (SSD) với tối thiểu 10 GB dung lượng trống.
  > [!IMPORTANT]
  > **Lưu ý triển khai lưu trữ:** Cơ sở dữ liệu SQLite (`prisma/dev.db`) và các tệp tải lên (`public/uploads/`) **PHẢI** được đặt trên phân vùng lưu trữ bền vững (**Persistent Volume / Persistent Disk**). Tuyệt đối **KHÔNG** triển khai trên các dịch vụ container vô trạng thái (ephemeral container như free Heroku dyno) vì toàn bộ tài khoản, bài nộp và ảnh/audio sẽ bị mất mỗi lần container khởi động lại.

---

## 2. Hướng Dẫn Cài Đặt Mới (Fresh Installation)

### Bước 1: Giải nén hoặc sao chép mã nguồn
Giải nén tệp `adaptive-english-clean-delivery.zip` hoặc sao chép thư mục dự án vào máy chủ đích:
```bash
unzip adaptive-english-clean-delivery.zip -d /var/www/adaptive-english
cd /var/www/adaptive-english/english-learning-platform
```

### Bước 2: Cài đặt các gói phụ thuộc (Dependencies)
```bash
npm ci --omit=dev
# Hoặc nếu chạy từ mã nguồn thông thường:
npm install
```

### Bước 3: Cấu hình biến môi trường (`.env.local`)
Sao chép từ tệp mẫu:
```bash
cp .env.example .env.local
```
Chỉnh sửa `.env.local` với các giá trị phù hợp:
```env
NODE_ENV=production
PORT=3000
BASE_URL=https://adaptive.yourdomain.edu.vn
NEXTAUTH_URL=https://adaptive.yourdomain.edu.vn

# Khóa bí mật phiên (Sinh bằng: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
SESSION_SECRET=e6b9875f102c918341...

# Cơ sở dữ liệu SQLite bền vững
DATABASE_URL=file:./dev.db

# Dịch vụ LLM AI (MWAPI / Claude / OpenAI) - Để trống nếu dùng Rule-based an toàn
MWAPI_API_KEY=sk-your-real-key-here
MWAPI_BASE_URL=https://api.mwapi.dev
MWAPI_MODEL=claude-sonnet-4-6

# Cấu hình SMTP gửi email khôi phục mật khẩu thật
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@yourdomain.edu.vn
SMTP_PASS=your_app_password
SMTP_FROM="Adaptive English <noreply@yourdomain.edu.vn>"

# BẢO MẬT: Phải đặt là false trên môi trường Production
ENABLE_ROLE_SWITCHER=false
NEXT_PUBLIC_ENABLE_ROLE_SWITCHER=false
```

### Bước 4: Khởi tạo cấu trúc cơ sở dữ liệu (Prisma Schema Push)
```bash
npx prisma db push
```

### Bước 5: Khởi tạo tài khoản Quản trị viên (Admin) ban đầu an toàn
Không sử dụng tài khoản mật khẩu mặc định công khai. Sử dụng script CLI để tạo tài khoản admin đầu tiên với mật khẩu mạnh riêng:
```bash
node scripts/init-admin.cjs admin@yourdomain.edu.vn "MatKhauBaoMat2026!" "Quản Trị Viên Trưởng"
```

### Bước 6: Biên dịch ứng dụng (Build)
```bash
npm run build
```

### Bước 7: Khởi chạy dịch vụ (Production Start với PM2 hoặc Systemd)
Sử dụng công cụ quản lý tiến trình `pm2` để tự động khởi động lại khi gặp sự cố:
```bash
npm install -g pm2
pm2 start npm --name "adaptive-english" -- start -- -p 3000
pm2 save
pm2 startup
```

---

## 3. Quy Trình Cập Nhật Phiên Bản (Updates & Upgrades)

1. **Sao lưu trước khi cập nhật:**
   ```bash
   node scripts/backup.cjs
   ```
2. **Kéo mã nguồn mới:**
   ```bash
   git pull origin main
   ```
3. **Cập nhật thư viện & CSDL:**
   ```bash
   npm install
   npx prisma db push
   ```
4. **Biên dịch & Khởi động lại:**
   ```bash
   npm run build
   pm2 restart adaptive-english
   ```

---

## 4. Quy Trình Sao Lưu & Phục Hồi (Backup & Disaster Recovery)

### 4.1. Sao lưu hệ thống (Backup)
Hệ thống cung cấp sẵn script sao lưu toàn bộ cơ sở dữ liệu và các tệp tải lên (`docx`, `audio`):
```bash
node scripts/backup.cjs
```
- Tệp sao lưu nén dạng `backup_adaptive_english_YYYYMMDD_HHMMSS.zip` sẽ được tạo tại thư mục `backups/`.
- Khuyến nghị cấu hình cron job tự động sao lưu hàng ngày lúc 02:00 sáng:
  ```cron
  0 2 * * * cd /var/www/adaptive-english/english-learning-platform && node scripts/backup.cjs /backup_storage/
  ```

### 4.2. Phục hồi hệ thống (Restore)
Khi gặp sự cố hỏng hóc hoặc cần chuyển đổi máy chủ, phục hồi dữ liệu từ bản sao lưu ZIP:
```bash
node scripts/restore.cjs backups/backup_adaptive_english_20261010_185406.zip
```
Script sẽ tự động:
- Kiểm tra tính toàn vẹn qua siêu dữ liệu `manifest.json`.
- Tự động tạo bản sao lưu an toàn cho CSDL hiện tại trước khi ghi đè (`dev.db.bak_<timestamp>`).
- Khôi phục chính xác cơ sở dữ liệu `prisma/dev.db` và toàn bộ tệp uploads vào `public/uploads/`.

---

## 5. Quy Trình Rollback Phiên Bản Khi Gặp Sự Cố

Nếu một bản cập nhật phần mềm gặp lỗi nghiêm trọng sau khi triển khai:

1. **Dừng tiến trình hiện tại:**
   ```bash
   pm2 stop adaptive-english
   ```
2. **Phục hồi lại dữ liệu CSDL từ bản sao lưu trước khi nâng cấp:**
   ```bash
   node scripts/restore.cjs backups/<ban_backup_truoc_nang_cap>.zip
   ```
3. **Chuyển mã nguồn về commit / tag ổn định trước đó:**
   ```bash
   git checkout <commit_hash_on_dinh>
   ```
4. **Biên dịch lại phiên bản cũ:**
   ```bash
   npm run build
   ```
5. **Khởi động lại dịch vụ:**
   ```bash
   pm2 restart adaptive-english
   ```
> [!NOTE]
> Không thực hiện rollback tự động nếu chưa xác định rõ nguyên nhân lỗi. Luôn kiểm tra nhật ký lỗi qua lệnh `pm2 logs adaptive-english`.

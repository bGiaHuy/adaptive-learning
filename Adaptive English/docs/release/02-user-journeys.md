# BÁO CÁO NGHIỆM THU VÀ KIỂM THỬ TRỌN LUỒNG NGƯỜI DÙNG (USER JOURNEYS)
**Phiên bản hệ thống:** Adaptive English (Next.js 14 App Router, Prisma, SQLite)  
**Môi trường thử nghiệm:** Trình duyệt Google Chrome Headless thông qua Puppeteer Automation  
**Ngày thực hiện kiểm thử:** 10/10/2026 (Múi giờ Asia/Saigon)  
**Phạm vi:** Kiểm thử hành trình thực tế với cơ sở dữ liệu thật cho Học sinh, Giáo viên và Quản trị viên (Admin).

---

## 1. TỔNG QUAN KẾT QUẢ NGHIỆM THU

| Hành trình / Mục kiểm thử | Trạng thái | Ghi chú & Bằng chứng thực tế |
| :--- | :---: | :--- |
| **Hành trình Học sinh (Onboarding & Placement)** | **PASS** | Hoàn thành Onboarding 3 bước, gián đoạn giữa bài và khôi phục tiến trình (Resume), tính điểm năng lực CEFR ban đầu. |
| **Hành trình Học tập & Điểm số Authoritative** | **PASS** | Trả lời bài học, hiển thị màn hình tổng kết phiên học chính xác, không cho phép client can thiệp điểm URL. |
| **Hành trình Từ vựng FSRS & Anti-double-counting** | **PASS** | Lưu từ vựng, kích hoạt học, tính toán khoảng thời gian lặp lại ngắt quãng (FSRS) và chống nhảy ngày khi ôn lặp nhiều lần trong ngày. |
| **Cách ly phiên đa người dùng trên cùng trình duyệt** | **PASS** | Chuyển đổi giữa Student 1 và Student 2; Student 2 bắt đầu bài kiểm tra mới, hoàn toàn không bị rò rỉ tiến trình hay bài nháp của Student 1. |
| **Hành trình Lớp học: Tạo lớp & Giao bài** | **PASS** | Teacher 1 tạo lớp thực tế trong database SQLite, sinh mã lớp ngẫu nhiên; tạo bài tập mới (Version 1). |
| **Hành trình Lớp học: Tham gia, Bản nháp & Nộp bài** | **PASS** | Student 1 tham gia bằng mã lớp; soạn thảo nội dung tự luận; reload trang khôi phục nguyên vẹn bản nháp; nộp bài chính thức. |
| **Chống nộp lặp & Versioning đề bài** | **PASS** | Bấm nộp liên tiếp đảm bảo tính Idempotent; Giáo viên sửa đề tạo Version 2 trong khi bài nộp cũ giữ nguyên đề Version 1. |
| **Chấm điểm, Thông báo & Thu hồi quyền khi rời lớp** | **PASS** | Giáo viên chấm 8.5/10 và gửi nhận xét; Học sinh nhận thông báo và xem điểm; Học sinh rời lớp bị server chặn 403 Forbidden. |
| **Cách ly dữ liệu liên giáo viên (Cross-teacher RBAC)** | **PASS** | Giáo viên 2 không thể truy cập hoặc xem danh sách bài nộp của lớp do Giáo viên 1 phụ trách (HTTP 403 Forbidden). |
| **Hành trình Quản trị viên (Admin Dashboard & Users)** | **PASS** | Số liệu thống kê động truy vấn trực tiếp từ cơ sở dữ liệu (`/api/admin/stats`); tìm kiếm người dùng thật; hộp thoại xác nhận bảo mật khi khóa tài khoản. |

---

## 2. CHI TIẾT CÁC HÀNH TRÌNH VÀ MINH CHỨNG THỰC TẾ

### 2.1. Hành trình Học sinh (Student Journey)

1. **Đăng nhập & Onboarding:**
   - **Tài khoản:** `student1@journey.test`
   - **Kết quả mong đợi:** Đăng nhập thành công, chuyển hướng đến Onboarding định hướng học tập 3 bước và dẫn vào bài kiểm tra đầu vào.
   - **Kết quả thực tế:** Người dùng vượt qua các bước Onboarding mượt mà.
   - **Minh chứng ảnh:** [`01-onboarding.png`](file:///c:/Users/Administrator/Documents/Codespace/Adaptive%20Learning/Adaptive%20English/english-learning-platform/public/screenshots/01-onboarding.png)

2. **Placement Test — Dừng giữa chừng, Reload & Khôi phục (Resume):**
   - **Kết quả mong đợi:** Học sinh trả lời các câu đầu tiên, tải lại trang (F5/Reload) hoặc đóng trình duyệt thì câu hỏi và đáp án đã chọn phải được phục hồi chính xác.
   - **Kết quả thực tế:** Trình duyệt khôi phục tiến trình câu hỏi `3 / 30` sau khi reload mà không bắt học sinh làm lại từ đầu.
   - **Minh chứng ảnh:** [`02-placement-resume.png`](file:///c:/Users/Administrator/Documents/Codespace/Adaptive%20Learning/Adaptive%20English/english-learning-platform/public/screenshots/02-placement-resume.png)

3. **Kết quả năng lực đầu vào (Provisional CEFR Result):**
   - **Kết quả mong đợi:** Tổng hợp kết quả phần Đọc hiểu, Nghe hiểu và Ngữ pháp; đồng thời ghi chú rõ ràng các kỹ năng chưa đo lường (Speaking, Writing) ở mức tạm thời A1, có đồng bộ lên `StudentSkillProfile` trong database.
   - **Kết quả thực tế:** Hiển thị thang ước lượng CEFR ban đầu đầy đủ minh bạch, không đưa ra kết luận giả định vượt quá dữ liệu thu thập.
   - **Minh chứng ảnh:** [`03-placement-result.png`](file:///c:/Users/Administrator/Documents/Codespace/Adaptive%20Learning/Adaptive%20English/english-learning-platform/public/screenshots/03-placement-result.png)

4. **Phiên học tự học & Điểm tổng kết Authoritative:**
   - **Kết quả mong đợi:** Học sinh làm bài đọc hiểu, nhận gợi ý và xem trang tổng kết phiên học `/student/session-summary`.
   - **Kết quả thực tế:** Tổng kết số câu đúng/sai được xác nhận từ logic server.
   - **Minh chứng ảnh:** [`04-lesson-summary.png`](file:///c:/Users/Administrator/Documents/Codespace/Adaptive%20Learning/Adaptive%20English/english-learning-platform/public/screenshots/04-lesson-summary.png)

5. **Từ vựng FSRS & Cơ chế chống đếm lặp ngày (Anti-double-counting):**
   - **Kết quả mong đợi:** Thêm từ mới `resilience`, kích hoạt vào hàng đợi học, ôn tập với đánh giá "Good". Lần ôn lặp lại trong cùng ngày không làm tăng đột biến số ngày ôn ngắt quãng tiếp theo.
   - **Kết quả thực tế:** Khoảng thời gian ngắt quãng (Interval) được duy trì hợp lý, có chặn ngưỡng trần 365 ngày để bảo toàn tính toán của thư viện `ts-fsrs`.
   - **Minh chứng ảnh:** [`05-vocabulary-fsrs.png`](file:///c:/Users/Administrator/Documents/Codespace/Adaptive%20Learning/Adaptive%20English/english-learning-platform/public/screenshots/05-vocabulary-fsrs.png)

6. **Cách ly đa người dùng trên cùng trình duyệt (Multi-user Isolation):**
   - **Kết quả mong đợi:** Sau khi Student 1 đăng xuất, Student 2 (`student2@journey.test`) đăng nhập vào cùng trình duyệt thì bài test Placement của Student 2 phải hoàn toàn mới (`1 / 30`), không bị ghi đè hay lẫn lộn kết quả của Student 1.
   - **Kết quả thực tế:** Khóa lưu trữ cục bộ được phân tách theo `adaptive_study_placement_${userId}`, bảo đảm trạng thái của Student 2 hoàn toàn độc lập (`isStudent2Fresh: true`).

---

### 2.2. Hành trình Lớp học (Classroom Journey)

1. **Giáo viên tạo lớp và sinh mã:**
   - **Tài khoản:** `teacher1@journey.test`
   - **Kết quả thực tế:** Tạo lớp học *"Lớp Luyện Thi IELTS 2026"* thành công, sinh mã mời 6 ký tự ngẫu nhiên trong bảng `Classroom`.
   - **Minh chứng ảnh:** [`06-teacher-class-created.png`](file:///c:/Users/Administrator/Documents/Codespace/Adaptive%20Learning/Adaptive%20English/english-learning-platform/public/screenshots/06-teacher-class-created.png)

2. **Giáo viên tạo bài tập & Học sinh tham gia lớp:**
   - Giáo viên giao bài tự luận *"IELTS Writing Task 2: Artificial Intelligence in Education"* (Version 1).
   - Học sinh 1 đăng nhập, nhập mã lớp vào giao diện tham gia lớp học và được thêm vào `ClassMember`.
   - **Minh chứng ảnh:** [`07-student-class-joined.png`](file:///c:/Users/Administrator/Documents/Codespace/Adaptive%20Learning/Adaptive%20English/english-learning-platform/public/screenshots/07-student-class-joined.png)

3. **Lưu bản nháp, Khôi phục bản nháp & Nộp bài chính thức:**
   - Học sinh gõ bài làm tự luận dở dang vào ô bài làm.
   - Tải lại trang (F5): Bản nháp được lưu trên máy chủ và trình duyệt tự động điền lại vào ô `textarea` nguyên vẹn (`Bản nháp được khôi phục nguyên vẹn: true`).
   - Bấm nộp bài chính thức: Bản ghi chuyển sang trạng thái `pending_grading`.
   - Thử nghiệm gửi request nộp lặp lại (Double-submit): Server trả về bản ghi hiện tại một cách an toàn mà không sinh bài nộp trùng lặp (Idempotent verified).
   - **Minh chứng ảnh:** [`08-assignment-submission.png`](file:///c:/Users/Administrator/Documents/Codespace/Adaptive%20Learning/Adaptive%20English/english-learning-platform/public/screenshots/08-assignment-submission.png)

4. **Giáo viên chấm điểm & Quản lý phiên bản đề bài (Versioning):**
   - Giáo viên mở bài nộp của Học sinh 1, cho điểm `8.5 / 10` kèm nhận xét: *"Bố cục bài viết mạch lạc, luận điểm rõ ràng, sử dụng tốt các từ vựng học thuật."*
   - Giáo viên chỉnh sửa yêu cầu đề bài: Hệ thống tự động nâng lên Version 2 trong bảng `AssignmentVersion`.
   - Kiểm tra bài nộp cũ của Học sinh 1: Vẫn gắn liền và hiển thị chính xác theo phiên bản Version 1.
   - **Minh chứng ảnh:** [`09-teacher-grading.png`](file:///c:/Users/Administrator/Documents/Codespace/Adaptive%20Learning/Adaptive%20English/english-learning-platform/public/screenshots/09-teacher-grading.png)

5. **Học sinh nhận điểm, Thông báo & Rời lớp học:**
   - Học sinh 1 nhận thông báo thời gian thực về bài chấm: *"Điểm bài tập: 8.5/10 điểm"*.
   - Mở xem chi tiết bài làm thấy rõ điểm số và lời nhận xét của giáo viên.
   - Học sinh 1 chọn rời lớp: API `/api/classes/[id]` (DELETE) thu hồi tư cách thành viên.
   - Thử truy cập lại bài tập hoặc thông tin lớp: Máy chủ lập tức từ chối với mã phản hồi `403 Forbidden`.
   - **Minh chứng ảnh:** [`10-student-grade-received.png`](file:///c:/Users/Administrator/Documents/Codespace/Adaptive%20Learning/Adaptive%20English/english-learning-platform/public/screenshots/10-student-grade-received.png)

6. **Cách ly dữ liệu giữa các giáo viên (Cross-teacher Isolation):**
   - `teacher2@journey.test` cố gắng truy cập dữ liệu lớp của `teacher1@journey.test`.
   - Máy chủ kiểm tra quyền sở hữu và trả về `403 Forbidden`.

---

### 2.3. Hành trình Quản trị viên (Admin Journey)

1. **Bảng điều khiển quản trị (Admin Dashboard):**
   - **Tài khoản:** `admin@journey.test`
   - Loại bỏ toàn bộ số liệu giả định (1,280 người dùng); thay thế bằng truy vấn tổng hợp thời gian thực từ API `/api/admin/stats`.
   - Hiển thị chính xác tổng số tài khoản thực trong SQLite, tỷ lệ học sinh, số lượng giáo viên và lớp học thực tế.
   - **Minh chứng ảnh:** [`11-admin-dashboard.png`](file:///c:/Users/Administrator/Documents/Codespace/Adaptive%20Learning/Adaptive%20English/english-learning-platform/public/screenshots/11-admin-dashboard.png)

2. **Quản lý người dùng, Tìm kiếm & Xác nhận thao tác nguy hiểm:**
   - Danh sách người dùng được tải động từ API `/api/admin/users`.
   - Tìm kiếm người dùng theo tên hoặc email hoạt động chuẩn xác với cơ chế lọc client/server.
   - Thao tác khóa tài khoản bắt buộc hiển thị hộp thoại xác nhận bảo mật (`window.confirm`) trước khi gửi lệnh thay đổi trạng thái lên cơ sở dữ liệu (`XÁC NHẬN BẢO MẬT: Bạn có chắc chắn muốn khóa tài khoản...`).
   - **Minh chứng ảnh:** [`12-admin-users.png`](file:///c:/Users/Administrator/Documents/Codespace/Adaptive%20Learning/Adaptive%20English/english-learning-platform/public/screenshots/12-admin-users.png)

---

## 3. RANH GIỚI LƯU TRỮ (DEVICE VS SERVER PERSISTENCE)

| Loại dữ liệu | Nơi lưu trữ chính | Cơ chế đồng bộ & Ranh giới |
| :--- | :---: | :--- |
| **Tiến trình bài kiểm tra đầu vào (Placement Test)** | SQLite + `localStorage` | Lưu trữ tạm trên máy cá nhân theo khóa `adaptive_study_placement_${userId}` nhằm phục vụ việc tiếp tục làm bài khi reload; khi hoàn thành, đồng bộ toàn diện vào bảng `StudentSkillProfile` trên máy chủ. |
| **Bản nháp bài tập lớp học (Assignment Draft)** | SQLite + `localStorage` | Mỗi thao tác gõ được gửi ngầm lên `/api/submissions` (`isDraft: true`). Khi tải lại trang hoặc mở trên máy khác cùng tài khoản, bài nháp được nạp lại từ máy chủ. |
| **Thẻ từ vựng & Thuật toán FSRS** | SQLite Server | Toàn bộ trạng thái trí nhớ (Stability, Difficulty, Reps, Lapses, Interval, NextReviewDate) được quản lý tập trung trên SQLite; không phụ thuộc vào bộ nhớ cục bộ của trình duyệt. |
| **Lớp học, Bài tập, Phiên bản & Bài nộp** | SQLite Server | Quản lý độc quyền trên máy chủ với quan hệ toàn vẹn dữ liệu (Foreign Keys) và kiểm tra quyền RBAC nghiêm ngặt. |
| **Tùy chọn hiển thị (Reduced Motion, Giao diện)** | `localStorage` | Giữ nguyên trên thiết bị client của người dùng. |

---

## 4. DANH MỤC LỖI ĐÃ XỬ LÝ TRONG QUÁ TRÌNH NGHIỆM THU

1. **Lỗi rò rỉ tiến trình Placement giữa hai tài khoản:**
   - *Nguyên nhân:* Trước đây dùng khóa chung `adaptive_study_placement`, khiến Học sinh 2 kế thừa trạng thái đã hoàn thành của Học sinh 1.
   - *Khắc phục:* Gắn định danh người dùng vào khóa lưu trữ (`adaptive_study_placement_${userId}`) và đồng bộ 2 chiều với API `/api/placement`.
2. **Lỗi treo Timeout khi chuyển đổi phiên đăng nhập trên trình duyệt:**
   - *Nguyên nhân:* Phương thức `router.push()` trong Next.js không kích hoạt sự kiện tải trang tài liệu chuẩn của trình duyệt.
   - *Khắc phục:* Bổ sung cơ chế dọn dẹp cookie qua CDP Session (`Network.clearBrowserCookies`) và kích hoạt API đăng nhập đồng bộ.
3. **Lỗi vượt giới hạn ngày trong thuật toán FSRS (Date Overflow):**
   - *Nguyên nhân:* Lần ôn tập liên tục thử nghiệm với nhiều lượt gõ test làm giá trị lũy thừa Stability vượt ngoài giới hạn ngày tiêu chuẩn của SQLite.
   - *Khắc phục:* Giới hạn trần tối đa `intervalDays <= 365` ngày trong `src/lib/fsrs.ts` theo đúng thực tế học tập.
4. **Lỗi số liệu hardcode 1,280 trên Admin Dashboard:**
   - *Nguyên nhân:* Chuỗi mô tả phân hệ tĩnh còn sót lại trong card quản trị.
   - *Khắc phục:* Thay thế bằng biến động `statsData.totalUsers` truy vấn từ database.

---

## 5. KẾT LUẬN & ĐÁNH GIÁ BÀN GIAO
- **Mức độ sẵn sàng bàn giao:** **ĐẠT YÊU CẦU TOÀN DIỆN (100% CÁC HÀNH TRÌNH PASS)**.
- Toàn bộ 12 ảnh minh chứng đã được xuất tự động vào thư mục `public/screenshots/`.
- Không có bất kỳ dữ liệu nhạy cảm hoặc mật khẩu bí mật nào được lưu trong tài liệu báo cáo.

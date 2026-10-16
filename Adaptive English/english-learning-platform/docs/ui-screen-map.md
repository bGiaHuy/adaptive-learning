# UI Screen Map Specification — Adaptive Study

## 1. TỔNG QUAN HỆ THỐNG MÀN HÌNH (PROTOTYPE SCOPE)

Bản đồ điều hướng và màn hình cho bản Prototype UI Tương Tác của nền tảng **Adaptive study**. Toàn bộ luồng sử dụng mock data nhất quán, local state lưu trữ qua `localStorage`, có role switcher để kiểm tra 3 vai trò (Student, Teacher, Admin).

---

## 2. PUBLIC & AUTHENTICATION SCREENS

| Route | Tên Màn Hình | Mô Tả & Tương Tác Cốt Lõi |
| :--- | :--- | :--- |
| `/` | **Landing Page** | Hero banner với mascot chú ếch vẫy chào (`hello.svg`), tiêu đề *"Small steps. Real progress."*, 4 skill cards, Flashcard preview, Classroom preview, CTA *"Start learning"*. |
| `/auth/login` | **Đăng Nhập** | Form đăng nhập email/mật khẩu, ghi nhớ phiên, link quên mật khẩu, nút chọn tài khoản demo nhanh (Student / Teacher / Admin). |
| `/auth/register` | **Đăng Ký & Chọn Role** | Chọn vai trò: **Student** hoặc **Teacher**, nhập thông tin đăng ký, hiển thị quy định 1 role / 1 tài khoản. |
| `/auth/recover` | **Khôi Phục Mật Khẩu** | Form gửi email khôi phục tài khoản, màn hình thông báo kiểm tra hòm thư mô phỏng. |

---

## 3. STUDENT JOURNEY SCREENS

### 3.1. Onboarding & Khảo Sát Ban Đầu
* `/student/onboarding`: 
  - Mascot ếch trung tâm với mảng nền mềm uốn lượn (`#F0F5FF`).
  - Chọn mục tiêu CEFR / IELTS mong muốn (tùy chọn, có nút Pill *"Bỏ qua"*).
  - Giới thiệu triết lý học thích ứng và chuyển tiếp đến bài kiểm tra đầu vào.
* `/student/placement-test`:
  - **Bài Test Đầu Vào Bắt Buộc** (chỉ làm 1 lần trong đời tài khoản).
  - Gồm 3 phần vi mô: Nghe hiểu, Đọc hiểu, Ngữ pháp & Từ vựng.
  - Hỗ trợ lưu từng phần vào `localStorage`; nếu mất mạng hoặc thoát app quay lại làm tiếp đúng phần dở.
* `/student/placement-test/result`:
  - Báo cáo kết quả đầu vào: Ước lượng CEFR từng kỹ năng (Reading B1, Listening B1+, Writing/Speaking: *"Chưa đánh giá"* kèm nhãn giải thích).
  - Độ tin cậy (Confidence metric) và nút kích hoạt lộ trình học cá nhân hóa.

### 3.2. Không Gian Học Tập Cốt Lõi (Learn & Home)
* `/student/home`:
  - **Trang chủ học tập**: Mascot ếch trạng thái `idle.svg` cạnh lời chào.
  - **Hero Slot (1 hành động chính)**: *"Học tiếp bài dở"* hoặc *"Bài học đề xuất hôm nay"*.
  - **Khối phụ trợ**: Thẻ số từ đến hạn ôn FSRS + Thẻ deadline bài tập lớp gần nhất.
  - **Lưới kỹ năng**: Chọn nhanh 4 kỹ năng (Listening, Reading, Writing, Speaking).
* `/student/learn`:
  - Chọn kỹ năng $\rightarrow$ Cây nội dung: **Course → Unit → Lesson**.
  - Hiển thị nhãn CEFR mục tiêu, tiến độ hoàn thành, và nút mở **Bài test nhảy trình (Level-Skip Test)**.
* `/student/learn/[skill]/[lessonId]`:
  - **Lesson Player tương tác**: Hỗ trợ 6 dạng câu hỏi (Trắc nghiệm 1 đáp án, Chọn nhiều đáp án, Nhập chữ, Điền chỗ trống, Ghép cặp, Sắp xếp từ).
  - Nút bấm chính Tactile 3D Duolingo (lún xuống khi bấm).
  - Panel AI Tutor trượt cạnh bài làm (Desktop) hoặc slide-over sheet (Mobile).
* `/student/session-summary`:
  - Màn hình kết thúc phiên học: Mascot ếch nhảy chúc mừng (`celebrate.svg`, chạy 1 lần), tỷ lệ chính xác, danh sách câu sai để xem lại (Review mistake drawer), nút *"Tiếp tục học"*.

### 3.3. Các Không Gian Chuyên Biệt Theo Kỹ Năng (Dedicated Workspaces)
* `/student/workspace/reading/[id]`:
  - **Reading Workspace**: Bố cục 2 cột Desktop (bài đọc học thuật bên trái giữ vị trí cuộn, câu hỏi bên phải); 1 cột chuyển tab trên Mobile.
* `/student/workspace/listening/[id]`:
  - **Listening Workspace**: Audio player thanh điều khiển rõ ràng, sóng âm, trạng thái tải/lỗi mô phỏng; Transcript và gợi ý mở theo tiến trình làm bài.
* `/student/workspace/writing/[id]`:
  - **Writing Workspace**: Đề bài luận IELTS Task 1/2, trình soạn thảo, bộ đếm từ trực tiếp, chỉ báo lưu nháp cục bộ, nút *"Sử dụng AI để đánh giá"* (kết quả hiển thị nhãn *"Do AI đánh giá - Mô phỏng demo"*).
* `/student/workspace/speaking/[id]`:
  - **Speaking Workspace**: Kiểm tra quyền Microphone trình duyệt thật (với cleanup an toàn) hoặc fallback mô phỏng; quy trình 4 bước: Chuẩn bị $\rightarrow$ Ghi âm $\rightarrow$ Nghe lại $\rightarrow$ Nộp bài.

### 3.4. Tủ Từ Vựng & Flashcard FSRS (Vocabulary Hub)
* `/student/vocabulary`:
  - Kho từ 5 trạng thái: *Đã lưu*, *Đang học*, *Đang củng cố*, *Nhớ ổn định*, *Cần học lại*.
  - Tìm kiếm, lọc theo chủ đề/kỹ năng, modal thêm từ và import danh sách.
  - Bộ chọn hạn mức từ mới/ngày: `5`, `10` (khuyến nghị ban đầu), `20`, `Tùy chỉnh`, `Unlimited` (có cảnh báo *"Không khuyến nghị"*).
  - Cảnh báo đóng băng nạp từ mới nếu tồn đọng $> 25$ thẻ ôn.
* `/student/vocabulary/flashcard`:
  - Trình lật Flashcard: Mặt trước (từ + phát âm) $\rightarrow$ Lật thẻ $\rightarrow$ 4 nút đánh giá FSRS: `Quên` (Again), `Khó` (Hard - vẫn nhớ), `Nhớ` (Good), `Dễ` (Easy).

### 3.5. Lớp Học (Classroom Hub)
* `/student/classroom`:
  - Nút *"Tham gia lớp"* (nhập mã mời 6 ký tự hoặc link).
  - Danh sách lớp học đang tham gia.
  - Danh sách bài tập: *Chưa làm*, *Đang làm*, *Đã nộp*, *Đã trả điểm*.
* `/student/classroom/[classId]/assignment/[assignmentId]`:
  - Chi tiết bài tập lớp, làm bài, nộp bài, xem điểm chính thức của Giáo viên và ghi chú nhận xét.
  - Thông báo nếu đề bài đã được cập nhật sang Version mới.
  - Tùy chọn *"Rời khỏi lớp"* (kèm cảnh báo mất toàn bộ quyền truy cập bài và lịch sử lớp).

### 3.6. Tiến Độ, Thông Báo & Cài Đặt
* `/student/progress`: Hồ sơ năng lực CEFR radar, điểm mạnh/yếu, phân tách dữ liệu bài tự học vs bài lớp, bằng chứng có/không dùng gợi ý AI.
* `/student/notifications`: Trung tâm thông báo bài mới, điểm mới, nhắc nhở deadline.
* `/student/settings`: Cài đặt hạn mức từ vựng, mức độ hỗ trợ AI Tutor, tùy chọn giảm chuyển động (`prefers-reduced-motion`).

---

## 4. TEACHER JOURNEY SCREENS

| Route | Tên Màn Hình | Chức Năng Cốt Lõi |
| :--- | :--- | :--- |
| `/teacher/dashboard` | **Bảng Điều Khiển Giáo Viên** | Thống kê số lớp, tổng học sinh, bài tập chờ chấm, hoạt động gần đây. |
| `/teacher/classes` | **Quản Lý Lớp Học** | Danh sách lớp, tạo lớp mới, mã mời, link tham gia. |
| `/teacher/classes/[id]` | **Chi Tiết Lớp Học** | Tab Học viên (danh sách, năng lực ước lượng, tiến độ), Tab Sổ điểm (Gradebook), Tab Bài tập. |
| `/teacher/assignments` | **Quản Lý Bài Tập** | Danh sách bài tập phân loại: Nháp, Đang giao, Đã đóng; bộ lọc theo lớp. |
| `/teacher/assignments/create` | **Tạo Bài Tập Mới** | Soạn đề thủ công hoặc kích hoạt công cụ Import DOCX. |
| `/teacher/assignments/import-docx` | **Nhập Liệu DOCX 2 Luồng** | **Luồng A**: Số hóa đề thi có sẵn (parse câu hỏi, đáp án, cảnh báo thiếu đáp án).<br>**Luồng B**: Sinh đề từ tài liệu thô (AI gợi ý câu hỏi).<br>Màn hình Preview WYSIWYG của giáo viên giống 100% học sinh trước khi giao. |
| `/teacher/assignments/[id]/versions` | **Lịch Sử Phiên Bản Đề** | Xem Version 1 vs Version 2 khi đề được sửa sau khi học sinh đã làm bài. |
| `/teacher/grading` | **Bàn Chấm Bài** | Danh sách bài nộp cần chấm, lọc theo lớp/bài tập. |
| `/teacher/grading/[submissionId]` | **Không Gian Chấm Bài & Trả Feedback** | Xem bài làm của học sinh, xem AI Pre-grade tham khảo nháp, nhập điểm chính thức của Giáo viên, gõ nhận xét định hình, công bố kết quả. |
| `/teacher/settings` | **Cài Đặt Giáo Viên** | Cài đặt bật/tắt AI Tutor trong lớp học (ghi rõ trạng thái cấu hình). |

---

## 5. ADMIN CONSOLE SCREENS

| Route | Tên Màn Hình | Chức Năng Cốt Lõi |
| :--- | :--- | :--- |
| `/admin` | **Admin Dashboard** | Chỉ số tổng quan hệ thống: Tổng Users (Student / Teacher), số lớp học, số bài tập. |
| `/admin/users` | **Quản Lý Tài Khoản** | Danh sách người dùng, tìm kiếm theo email/tên, lọc theo Role (Student, Teacher, Admin), trạng thái hoạt động. |
| `/admin/content` | **Quản Trị Khung Học Liệu** | Xem danh mục Course, Unit, Lesson trong kho bài chung của hệ thống. |

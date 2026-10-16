# Cẩm Nang Sử Dụng Hệ Thống (User Guide)

> **Dự án**: Adaptive English (Adaptive study)  
> **Dành cho**: Học sinh (Student), Giáo viên (Teacher) và Quản trị viên (Admin)

---

## 1. Dành Cho Học Sinh (Student Guide)

### 1.1. Đăng ký & Đăng nhập
1. Truy cập trang web tại `/auth/login`. Nếu chưa có tài khoản, bấm **"Đăng ký ngay"** (`/auth/register`).
2. Nhập Email, Họ tên và Mật khẩu (tối thiểu 8 ký tự).
3. Đăng nhập vào hệ thống để bắt đầu hành trình học tập.

### 1.2. Khảo sát ban đầu (Onboarding) & Kiểm tra năng lực (Placement Test)
1. **Onboarding**: Lần đầu đăng nhập, bạn sẽ chọn mục tiêu điểm CEFR (A1 - C1), thời gian học dự kiến hàng ngày (15, 20, 30 phút) và kỹ năng trọng tâm.
2. **Placement Test**: Làm bài kiểm tra năng lực đầu vào gồm các câu hỏi Đọc, Nghe và Ngữ pháp.
   - *Tính năng lưu tạm*: Nếu có việc bận giữa chừng hoặc mất kết nối mạng, bạn có thể tải lại trang hoặc đăng nhập lại sau, hệ thống sẽ khôi phục chính xác câu bạn đang làm dở dang.
   - *Kết quả*: Sau khi nộp bài, hệ thống hiển thị đồ thị năng lực CEFR ban đầu và đề xuất lộ trình bài học cá nhân hóa.

### 1.3. Tự học bài học thích ứng (Self-Learning Explorer)
1. Truy cập mục **"Học tập"** (`/student/learn`).
2. Chọn kỹ năng muốn rèn luyện (Listening, Reading, Writing, Speaking).
3. Làm bài tập tương tác: Trắc nghiệm, điền từ, nghe audio với thanh điều khiển tua thông minh.
4. **Trợ lý AI Socratic Tutor**: Nếu gặp câu khó, bấm nút hỏi trợ lý học tập để nhận gợi ý tư duy từng bước. Trợ lý được thiết kế để không cho chép đáp án trực tiếp nhằm kích thích tư duy người học.
5. Xem màn hình tổng kết bài học và nhận điểm số chính thức.

### 1.4. Ôn luyện từ vựng Spaced Repetition (FSRS Flashcards)
1. Truy cập mục **"Ôn từ vựng"** (`/student/vocabulary`).
2. Lưu các từ mới bạn muốn ghi nhớ vào tủ từ cá nhân.
3. Bấm **"Bắt đầu ôn tập"** để lật thẻ flashcard: xem từ, phiên âm IPA, nghĩa, câu ví dụ.
4. Đánh giá mức độ ghi nhớ qua 4 nút:
   - **Quên (Again)**: Ôn lại ngay trong ngày mai.
   - **Khó (Hard)**: Đã nhớ nhưng cần nhiều nỗ lực.
   - **Nhớ (Good)**: Nhớ tốt, tăng khoảng cách ôn tập.
   - **Dễ (Easy)**: Thuộc lòng, giãn cách ngày ôn tập dài nhất.
5. Khi một từ đạt khoảng cách ôn tập $\ge 21$ ngày, từ đó sẽ được thăng cấp thành **"Thành thạo" (Mastered)**.

### 1.5. Tham gia lớp học & Nộp bài tập
1. Truy cập mục **"Lớp học"** (`/student/classroom`).
2. Nhập **Mã lớp gồm 6 ký tự** do giáo viên cung cấp và bấm **"Tham gia"**.
3. Xem danh sách bài tập được giao, hạn nộp và phiên bản đề bài.
4. Nhập bài làm vào khung soạn thảo. Bạn có thể bấm **"Lưu nháp"** để lưu lại tiến trình bất cứ lúc nào.
5. Bấm **"Nộp bài chính thức"**. Hệ thống có cơ chế chống bấm trùng lặp.
6. Sau khi giáo viên chấm bài, bạn sẽ nhận được thông báo chuông và xem chi tiết điểm số cùng nhận xét của thầy cô.

---

## 2. Dành Cho Giáo Viên (Teacher Guide)

### 2.1. Quản lý Lớp học
1. Đăng nhập tài khoản Giáo viên và truy cập mục **"Lớp học"** (`/teacher/classes`).
2. Bấm **"Tạo lớp học mới"**, đặt tên lớp (ví dụ: *Lớp Luyện Thi IELTS 2026*).
3. Hệ thống sẽ cấp một **Mã lớp 6 ký tự** ngẫu nhiên độc nhất. Gửi mã này cho học sinh để các em tham gia.
4. Bấm vào chi tiết lớp để xem danh sách học sinh đã tham gia và sổ điểm (Gradebook).

### 2.2. Giao Bài tập & Quản lý Phiên bản Đề (Versioning)
1. Bấm **"Tạo bài tập mới"** trong lớp.
2. Thiết lập tiêu đề, yêu cầu bài làm, hạn nộp và quyền cho phép học sinh sử dụng AI hỗ trợ.
3. Phát hành bài tập cho cả lớp.
4. **Sửa đề bài sau khi đã có học sinh nộp**: Khi giáo viên chỉnh sửa bài tập, hệ thống sẽ tự động tạo **Phiên bản mới (Version 2, 3...)**. Các bài nộp cũ của học sinh vẫn được bảo toàn nguyên vẹn gắn liền với phiên bản đề bài lúc học sinh làm, tránh tranh chấp và sai lệch đề bài.

### 2.3. Chấm bài & Trả nhận xét
1. Truy cập mục **"Chấm bài"** (`/teacher/grading`).
2. Chọn bài nộp đang chờ chấm của học sinh.
3. Xem bài làm của học sinh, tham khảo bảng gợi ý tiêu chí chấm.
4. Nhập điểm chính thức (thang điểm 10) và lời nhận xét sư phạm chi tiết.
5. Bấm **"Hoàn tất chấm bài"**: Điểm số được công bố lập tức và gửi thông báo tự động đến tài khoản của học sinh.

### 2.4. Nhập học liệu tự động từ tệp Word (DOCX Import)
1. Truy cập chức năng **"Nhập đề từ DOCX"** (`/teacher/assignments/import-docx`).
2. Tải lên tệp Word `.docx` chuẩn biên soạn giáo trình (chứa bài đọc, bài tập, từ vựng, hình ảnh).
3. Hệ thống tự động bóc tách các bài tập, câu hỏi và trích xuất ảnh nhúng.
4. Kiểm tra cảnh báo chất lượng: Với các bài Listening thiếu tệp âm thanh nghe, hệ thống hiển thị cảnh báo để giáo viên bổ sung tệp `.mp3` trước khi giao cho học sinh.

---

## 3. Dành Cho Quản Trị Viên (Admin Guide)

### 3.1. Dashboard Thống kê Hệ thống
1. Đăng nhập tài khoản Admin và truy cập trang `/admin`.
2. Theo dõi các chỉ số vận hành được truy vấn trực tiếp theo thời gian thực từ cơ sở dữ liệu:
   - Tổng số người dùng đăng ký.
   - Số lớp học đang hoạt động.
   - Tổng số bài tập và lượt nộp bài.
   - Thống kê phân bố theo từng vai trò (Học sinh, Giáo viên, Admin).

### 3.2. Quản lý Người dùng & An toàn Hệ thống
1. Truy cập mục **"Người dùng"** (`/admin/users`).
2. Tìm kiếm người dùng theo Họ tên hoặc Địa chỉ Email.
3. Lọc danh sách theo vai trò (`student`, `teacher`, `admin`).
4. **Thao tác nguy hiểm**: Khi thực hiện khóa tài khoản hoặc hạ quyền, hệ thống luôn hiển thị hộp thoại xác nhận bảo mật kèm cảnh báo rõ ràng để chống thao tác nhầm lẫn ngoài ý muốn.
5. Quản trị viên có toàn quyền kiểm soát nhưng được phân cách an toàn, không thể bị client mạo danh vượt quyền từ bên ngoài.

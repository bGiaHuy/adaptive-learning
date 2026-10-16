# 01 - Role Overview

## Goal
Xác định rõ ràng trách nhiệm, ranh giới quyền hạn, góc nhìn giao diện và mối tương tác giữa 3 nhóm đối tượng người dùng chính trong hệ thống: **Student**, **Teacher**, và **Admin**.

## Actor
- Student (Người học tiếng Anh)
- Teacher (Giáo viên / Giảng viên trực tiếp phụ trách lớp)
- Admin (Quản trị viên học thuật và hệ thống)

## Preconditions
- Người dùng đã được xác thực danh tính và có vai trò hợp lệ trong hệ thống.

## Trigger
- Đăng nhập vào hệ thống và được điều hướng về không gian làm việc tương ứng theo quyền hạn.

---

## Main Flow: Phân Tích Chi Tiết 3 Vai Trò

### 1. Student (Người Học)
* **Mục tiêu chính**: Nâng cao năng lực tiếng Anh, cải thiện điểm số ước lượng IELTS, hoàn thành bài tập lớp học đúng hạn, và xây dựng thói quen học tập đều đặn hàng ngày.
* **Góc nhìn trải nghiệm (Perspective)**:
  * Không nhìn thấy sự phức tạp của các thuật toán spaced repetition hay đồ thị lỗi kỹ thuật; chỉ nhìn thấy **Today's Plan** rõ ràng (ví dụ: *Phiên học 20 phút: 8 phút từ vựng + 12 phút ngữ pháp*).
  * Tiếp cận linh hoạt hai chế độ: **Học theo đề xuất của hệ thống (System Recommended)** hoặc **Tự chọn kỹ năng yêu thích (User Selected)**.
  * Tương tác với AI Tutor như một người gia sư kiên nhẫn, am hiểu điểm yếu của mình.
* **Quyền hạn cốt lõi**:
  * Thực hiện bài kiểm tra đầu vào (Placement Test).
  * Học và luyện tập các kỹ năng trong không gian Self-Learning.
  * Tham gia lớp học theo mã mời (Invite Code) hoặc ghi danh từ giáo viên/admin.
  * Xem, làm và nộp bài tập được giao (Assignments).
  * Xem điểm số, nhận xét chi tiết và lịch sử bài làm cá nhân.
  * Trò chuyện và hỏi đáp với AI Tutor trong khuôn khổ bài học.

### 2. Teacher (Giáo Viên)
* **Mục tiêu chính**: Quản lý học sinh trong các lớp học được phân công, giám sát mức độ gắn kết, tạo và giao bài tập chất lượng cao, chấm bài nhanh chóng với sự hỗ trợ của AI, và can thiệp sư phạm kịp thời dựa trên dữ liệu lỗi thực tế.
* **Góc nhìn trải nghiệm (Perspective)**:
  * Tiếp cận Dashboard lớp học tập trung vào **Actionable Insights** (ví dụ: *43% học sinh sai Mạo từ trong tuần này*, *3 học sinh không học 6 ngày liên tục*).
  * Sử dụng **Teacher AI Copilot** để soạn bài tập can thiệp nhanh chóng, nhưng luôn giữ toàn quyền kiểm duyệt và chỉnh sửa trước khi xuất bản.
* **Quyền hạn cốt lõi**:
  * Xem danh sách các lớp học được phân công quản lý.
  * Xem danh sách học sinh và hồ sơ năng lực học tập tổng hợp của từng lớp.
  * Tạo, chỉnh sửa, lên lịch và giao bài tập (Assignments) theo các chủ đề hoặc kỹ năng cụ thể.
  * Chấm bài, điều chỉnh điểm nháp do AI đề xuất, và gửi nhận xét (Feedback) cho học sinh.
  * Truy cập Ngân hàng câu hỏi (Question Bank) để tái sử dụng hoặc thêm câu hỏi mới.
  * Kích hoạt AI Copilot để sinh bài tập dựa trên phân tích điểm yếu của lớp.

### 3. Admin (Quản Trị Viên)
* **Mục tiêu chính**: Đảm bảo toàn vẹn cấu trúc học thuật của nền tảng, quản lý người dùng và lớp học ở cấp độ tổ chức, kiểm soát chất lượng kho nội dung, và giám sát việc sử dụng tài nguyên AI.
* **Góc nhìn trải nghiệm (Perspective)**:
  * Bảng điều khiển quản trị tập trung vào vận hành, chất lượng dữ liệu và phân quyền hệ thống.
  * Không can thiệp vào các phiên học chi tiết hàng ngày của từng học sinh trừ khi cần hỗ trợ kỹ thuật hoặc kiểm tra chất lượng sư phạm.
* **Quyền hạn cốt lõi**:
  * Quản lý vòng đời tài khoản người dùng (Tạo, khóa, cấp lại quyền, gán vai trò).
  * Quản trị cây kỹ năng (Skill Graph Taxonomy), chuẩn hóa khung CEFR và ma trận tiêu chí chấm IELTS Rubric.
  * Quản trị danh mục khóa học (Courses) và cấu trúc chương trình mẫu.
  * Kiểm duyệt kho từ vựng chuẩn (Dictionary Master) và ngân hàng câu hỏi dùng chung.
  * Cấu hình và giám sát hạn mức tiêu thụ token AI, chi phí vận hành và tính ổn định hệ thống.

---

## Alternative Flows
- **Học sinh chuyển lớp / tham gia nhiều lớp**: Học sinh có thể ghi danh vào nhiều lớp học khác nhau cùng lúc (ví dụ: Lớp IELTS Intensive và Lớp Giao tiếp cơ bản). Toàn bộ dữ liệu bài tập từ tất cả các lớp đều đổ về cùng một Learning Profile duy nhất.
- **Giáo viên trợ giảng (Co-Teacher)**: Hai giáo viên cùng phụ trách một lớp học, chia sẻ quyền xem điểm và chấm bài.

---

## Error / Edge Cases
- **Xung đột quyền hạn khi giáo viên kiêm học sinh**: Người dùng có thể vừa là giáo viên lớp này vừa là học sinh lớp khác.
  - *Giải pháp*: Phân tách theo ngữ cảnh Session hoặc chuyển đổi không gian làm việc (Workspace Switcher).

---

## State Changes
- Trạng thái người dùng: `PENDING_ACTIVATION` $\rightarrow$ `ACTIVE` $\rightarrow$ `SUSPENDED`.

---

## Data Conceptually Involved
- `User`, `Role`, `TeacherProfile`, `StudentProfile`, `ClassMembership`, `AcademicPermission`.

---

## AI Involvement
- AI Tutor tương tác trực tiếp với Student.
- AI Copilot và AI Draft Grading tương tác trực tiếp với Teacher.
- AI Audit & Cost Monitoring hỗ trợ Admin.

---

## Permissions
- Thực hiện nghiêm ngặt theo Ma trận phân quyền tại [`docs/17-permission-matrix.md`](17-permission-matrix.md).

---

## Open Questions
- Xem [`docs/20-open-questions.md`](20-open-questions.md) mục `Permissions` & `Student` (Q-002, Q-011).

# 17 - Permission Matrix (RBAC Specification)

## Goal
Quy định ma trận phân quyền chi tiết (Role-Based Access Control - RBAC) cho 3 vai trò chính trong hệ thống: **Student**, **Teacher**, và **Admin** trên toàn bộ các tài nguyên và hành động nghiệp vụ.

---

## 1. Bảng Ma Trận Phân Quyền Chi Tiết

Ký hiệu:
* **C**: Create (Tạo mới)
* **R**: Read (Xem / Đọc)
* **U**: Update (Chỉnh sửa)
* **D**: Delete (Xóa)
* **A**: Approve / Publish (Phê duyệt / Xuất bản)
* **-**: Không có quyền truy cập

| Khu Vực Tài Nguyên (Resource Domain) | Thao Tác Nghiệp Vụ Cụ Thể | Student | Teacher | Admin |
| :--- | :--- | :---: | :---: | :---: |
| **User & Account** | Xem hồ sơ cá nhân | R, U | R, U | R, U |
| | Quản lý danh sách người dùng toàn hệ thống | - | - | C, R, U, D |
| | Khóa / Mở khóa tài khoản | - | - | U |
| **Courses & Classes** | Tạo khóa học mẫu (Course Curriculum) | - | - | C, R, U, D |
| | Mở lớp học mới (Class Instance) | - | R (lớp mình) | C, R, U, D |
| | Quản lý danh sách học sinh ghi danh (Enrollment) | - | R, U (lớp mình) | C, R, U, D |
| | Tham gia lớp học bằng Invite Code | C | - | - |
| **Assignments & Tasks** | Tạo bài tập thủ công (Manual Assignment) | - | C, R, U, D (lớp mình) | R (audit) |
| | Kích hoạt Teacher AI Copilot sinh bài | - | C, R, U (lớp mình) | R (audit) |
| | Phê duyệt và Xuất bản bài tập (Publish) | - | A (lớp mình) | A |
| | Đóng hoặc Lưu trữ bài tập (Close/Archive) | - | U (lớp mình) | U |
| | Xem đề bài tập được giao | R (được chỉ định) | R (lớp mình) | R |
| **Submissions & Grading** | Bắt đầu làm và Nộp bài (Submit) | C, U (bản thân) | - | - |
| | Xem bài nộp của học sinh | R (bản thân) | R (lớp mình) | R (audit) |
| | Sử dụng AI Pre-grading hỗ trợ chấm nháp | - | R, U (lớp mình) | R |
| | Sửa điểm chính thức và Nhập nhận xét (Feedback) | - | C, R, U (lớp mình) | U (audit) |
| | Trả bài cho học sinh (Return Assignment) | - | A (lớp mình) | A |
| | Yêu cầu học sinh viết lại (Request Revision) | - | U (lớp mình) | - |
| **Learning Profile & Scores** | Xem hồ sơ năng lực cá nhân (Skills, IELTS est.) | R (bản thân) | R (học sinh lớp mình) | R (toàn hệ thống) |
| | Xem ma trận phân tích lỗi của lớp học | - | R (lớp mình) | R |
| | Điều chỉnh thủ công điểm năng lực của học sinh | - | - | U (khi khiếu nại) |
| **Personal Vocabulary Bank** | Thêm, sửa, xóa từ vựng trong kho cá nhân | C, R, U, D | - | - |
| | Xem tiến độ học từ vựng của học sinh | R (bản thân) | R (học sinh lớp mình) | R |
| **Question Bank & Content** | Đóng góp câu hỏi mới vào Question Bank | - | C, R, U (kho riêng) | C, R, U, D (kho chung) |
| | Kiểm định chất lượng câu hỏi (Audit Success Rate) | - | R | R, U, D |
| | Chỉnh sửa Cây kỹ năng (Skill Graph Taxonomy) | - | - | C, R, U, D |
| | Cấu hình Tiêu chí chấm IELTS Rubric | - | - | C, R, U, D |
| **AI Modules** | Hỏi đáp với AI Tutor (Self-study mode) | C, R | R (audit) | R (audit) |
| | Hỏi đáp với AI Tutor (Teacher Homework mode) | C, R (Tutor Mode) | R (audit) | R (audit) |
| | Xem lịch sử hỏi đáp AI của học sinh trong lớp | - | R (lớp mình) | R |
| | Cấu hình hạn ngạch Token & Model Selection | - | - | R, U |

---

## 2. Nguyên Tắc Bảo Mật Dữ Liệu & Ranh Giới Quyền Hạn (Data Privacy & Revocation Rules)
1. **Toàn quyền của Giáo viên trong lớp**: Giáo viên có quyền xem toàn bộ nội dung, tiến độ, bài nộp, và hồ sơ năng lực CEFR của học sinh thuộc các lớp mình phụ trách để hỗ trợ sư phạm. Tuy nhiên, quyền này không áp dụng cho học sinh thuộc lớp của giáo viên khác.
2. **Quy tắc khi Học sinh rời lớp (Post-Leave Revocation)**:
   * Khi học sinh rời lớp hoặc bị xóa khỏi lớp, học sinh **mất toàn bộ quyền truy cập** vào danh sách bài tập, tài liệu nội bộ, và lịch sử bài nộp của lớp đó.
   * Bài nộp cũ của học sinh vẫn được lưu giữ trong Sổ điểm lớp của giáo viên dưới dạng tài khoản lưu trữ (Archived Record) để bảo toàn điểm số chung của lớp.
   * Kể từ thời điểm rời lớp, giáo viên **không còn quyền xem dữ liệu tự học** của học sinh đó.
3. **Quyền truy cập phiên bản đề bài (Assignment Version Access)**:
   * Bài nộp của học sinh gắn chặt với phiên bản đề (`version_id`) mà học sinh đã làm. Cả học sinh và giáo viên chỉ xem và chấm điểm dựa trên phiên bản tương ứng.
4. **Bảo mật giữa các học sinh**: Học sinh tuyệt đối không nhìn thấy bài nộp, điểm số, hoặc nhật ký sửa lỗi của bạn học cùng lớp.
5. **Audit Log bất biến khi sửa điểm**: Mọi thao tác sửa điểm của giáo viên sau khi đã công bố điểm đều kích hoạt thông báo gửi đến học sinh và lưu vết lịch sử thay đổi để phục vụ phúc khảo.

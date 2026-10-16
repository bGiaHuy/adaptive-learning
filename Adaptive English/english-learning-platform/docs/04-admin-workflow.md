# 04 - Admin Workflow

## Goal
Quy định luồng vận hành của Quản trị viên (Admin Workflow) nhằm duy trì cấu trúc học thuật, quản lý người dùng, quản trị khóa học, kiểm soát kho nội dung chuẩn và giám sát sự ổn định của hệ thống cùng hạn ngạch AI.

## Actor
- Admin (Quản trị viên hệ thống / Quản trị viên học thuật)

## Preconditions
- Tài khoản Admin được cấp quyền truy cập vào cổng quản trị chuyên biệt (Admin Console).

## Trigger
- Đăng nhập định kỳ để quản trị tổ chức, khởi tạo khóa học mới, duyệt tài nguyên học thuật hoặc xử lý yêu cầu phân quyền.

---

## Main Flow: Quy Trình Vận Hành Quản Trị

### 1. Quản Trị Người Dùng & Phân Quyền (User & Role Management)
* **Quản trị Giáo viên (Teacher Management)**:
  * Tạo tài khoản giáo viên mới, gửi email kích hoạt.
  * Phân công giáo viên vào các lớp học cụ thể.
  * Tạm ngừng hoặc thu hồi quyền truy cập khi giáo viên kết thúc hợp đồng giảng dạy.
* **Quản trị Học sinh (Student Management)**:
  * Khởi tạo tài khoản học sinh hàng loạt (Batch Enrollment) từ danh sách trường/trung tâm.
  * Xem trạng thái tài khoản (Đang hoạt động, Tạm khóa, Chưa kích hoạt).
  * Hỗ trợ đặt lại mật khẩu hoặc xử lý khiếu nại kỹ thuật.

### 2. Quản Trị Khóa Học & Lớp Học (Course & Class Management)
* **Quản trị Khóa học (Course Management)**:
  * Tạo mới khóa học (ví dụ: *IELTS Foundation 4.5 - 5.5*, *General English B1*).
  * Định nghĩa khung chuẩn đầu ra (Target CEFR/IELTS) và phân bổ cấu trúc mô-đun học thuật.
* **Quản trị Lớp học (Class Management)**:
  * Mở lớp học mới thuộc về một Khóa học cụ thể.
  * Chỉ định Giáo viên chủ nhiệm / Giáo viên phụ trách.
  * Quản lý danh sách học sinh ghi danh (Enrollment List) và tạo mã mời tham gia lớp (Class Invite Code).
  * Đóng lớp hoặc lưu trữ lớp học (Archive Class) khi hoàn thành kỳ học.

### 3. Quản Trị Nội Dung Học Thuật & Đồ Thị Kỹ Năng (Curriculum & Content Management)
* **Quản trị Cây kỹ năng (Skill Graph Taxonomy Maintenance)**:
  * Cấu hình và cập nhật cây phân cấp kỹ năng chuẩn: Listening, Reading, Writing, Speaking, Grammar, Vocabulary.
  * Định nghĩa danh mục phân loại lỗi (Error Taxonomy Catalog): Mã hóa các loại lỗi ngữ pháp, phát âm và diễn đạt để toàn bộ hệ thống thống nhất nhãn gắn lỗi.
* **Quản trị Thư viện nội dung (Content Library & Dictionary Master)**:
  * Quản lý Kho từ vựng chuẩn (Master Vocabulary Database): Chuẩn hóa phiên âm IPA, định nghĩa, cấp độ CEFR, câu ví dụ mẫu.
  * Quản trị Bộ tiêu chí chấm IELTS chuẩn hóa (IELTS Rubrics Matrix): Cập nhật tiêu chí chấm Task 1 và Task 2 theo chuẩn khảo thí quốc tế.
  * Quản trị Ngân hàng câu hỏi dùng chung (System Question Bank): Duyệt các câu hỏi do giáo viên đóng góp hoặc do hệ thống biên soạn.

### 4. Giám Sát Chất Lượng Nội Dung & Câu Hỏi (Question Health Audit)
Admin có công cụ giám sát chất lượng các câu hỏi trong ngân hàng:
* Thống kê tỉ lệ làm đúng lịch sử của từng câu hỏi (`historical_success_rate`):
  * Nếu một câu hỏi có tỉ lệ làm đúng > 90%: Hệ thống cảnh báo câu hỏi quá dễ hoặc mất tính phân loại.
  * Nếu một câu hỏi có tỉ lệ làm đúng < 20%: Hệ thống cảnh báo câu hỏi có thể có đáp án mơ hồ, giải thích sai hoặc độ khó bất thường.
* Admin có quyền tạm khóa (Deactivate) câu hỏi để gửi bộ phận chuyên môn thẩm định lại.

### 5. Giám Sát Tài Nguyên Hệ Thống & Hạn Ngạch AI (System & AI Governance)
* Giám sát lượng token tiêu thụ hàng ngày của từng mô hình AI (AI Tutor, AI Evaluator, Teacher Copilot).
* Thiết lập hạn mức (Quota Limit) sử dụng AI Tutor cho từng gói tài khoản học sinh nhằm kiểm soát chi phí vận hành.
* Xem nhật ký lỗi hệ thống (System Error Logs) và giám sát tính ổn định của các dịch vụ.

---

## Alternative Flows
- **Chuyển giao lớp học giữa các giáo viên (Teacher Reassignment)**: Admin chuyển toàn bộ quyền quản trị của một lớp đang hoạt động từ Giáo viên A sang Giáo viên B. Lịch sử bài tập, điểm số và bài nộp của học sinh được bảo toàn nguyên vẹn.

---

## Error / Edge Cases
- **Xóa nhầm tài khoản đang có dữ liệu**: Hệ thống không cho phép xóa vĩnh viễn (Hard Delete) tài khoản đang có bài nộp hoặc hồ sơ năng lực; chỉ cho phép khóa hoặc ẩn (Soft Delete / Archive).

---

## State Changes
- Khóa học/Lớp học: `PLANNED` $\rightarrow$ `ACTIVE` $\rightarrow$ `ARCHIVED`.
- Câu hỏi trong ngân hàng: `DRAFT` $\rightarrow$ `VERIFIED` $\rightarrow$ `DEACTIVATED`.

---

## Data Conceptually Involved
- `UserAccount`, `SystemRole`, `CourseCatalog`, `ClassEntity`, `SkillTaxonomyNode`, `MasterDictionaryItem`, `GlobalRubric`, `AIUsageMetric`.

---

## AI Involvement
- Theo dõi thống kê chi phí và độ chính xác của các mô hình AI.
- Đánh giá tự động tính dị biệt (Outlier Detection) của các câu hỏi hoặc bài chấm điểm.

---

## Permissions
- Admin có toàn quyền cấu hình cấp cao trong hệ thống nhưng không sửa đổi trực tiếp bài làm của học sinh nhằm đảm bảo tính toàn vẹn học thuật.

---

## Open Questions
- Xem [`docs/20-open-questions.md`](20-open-questions.md) mục `Admin` (Q-006).

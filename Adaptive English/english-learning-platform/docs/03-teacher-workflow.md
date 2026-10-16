# 03 - Teacher Workflow

## Goal
Quy định toàn diện quy trình làm việc của giáo viên (Teacher Workflow), bao gồm quản lý lớp học, giám sát học sinh, tạo bài tập tùy chỉnh, tận dụng AI Copilot để soạn bài theo dữ liệu lỗi thực tế của lớp, quy trình phê duyệt nghiêm ngặt (Human-in-the-loop), chấm bài và can thiệp sư phạm.

## Actor
- Teacher (Giáo viên phụ trách lớp học)

## Preconditions
- Giáo viên có tài khoản hợp lệ và được Admin phân công phụ trách ít nhất một lớp học trong hệ thống.

## Trigger
- Giáo viên đăng nhập để chuẩn bị bài giảng, giao bài tập về nhà, chấm bài nộp của học sinh hoặc kiểm tra báo cáo tiến độ tuần.

---

## Main Flow: Quy Trình Sư Phạm Của Giáo Viên

### 1. Teacher Dashboard & Quản Lý Lớp Học
Khi đăng nhập, giáo viên tiếp cận Dashboard tổng quan:
* **Danh sách các lớp phụ trách**: Ví dụ *Lớp IELTS Foundation B1-03 (24 học sinh)*, *Lớp Grammar Intensive A2-01 (18 học sinh)*.
* **Cảnh báo cần xử lý ngay (Urgent Action Items)**:
  * Số bài nộp đang chờ chấm (ví dụ: *14 bài Writing Task 2 đang chờ giáo viên review*).
  * Danh sách học sinh cần can thiệp đặc biệt (Students Needing Attention):
    * *Huy*: Kỹ năng Writing giảm liên tục trong 2 tuần qua.
    * *Minh*: Tỉ lệ làm bài tập về nhà dưới 50%.
    * *Lan*: Không có hoạt động học tập nào trong 6 ngày liên tiếp.
* **Chỉ số gắn kết của lớp (Class Engagement)**: Tỉ lệ hoàn thành bài tập, thời lượng học trung bình trong tuần.

---

### 2. Quy Trình Tạo Bài Tập & AI Teacher Copilot (Strict Approval Pipeline)
Hệ thống thiết lập một nguyên tắc bất biến: **AI KHÔNG ĐƯỢC PHÉP TỰ ĐỘNG XUẤT BẢN BÀI TẬP CHO HỌC SINH**. Mọi bài tập do AI tạo ra đều bắt buộc phải trải qua phễu duyệt của giáo viên:

```
[1. YÊU CẦU CỦA GIÁO VIÊN]
  Giáo viên đưa ra yêu cầu (Prompt / Form cấu hình)
          ↓
[2. AI GENERATED]
  AI Copilot sinh bản nháp bài tập dựa trên chuẩn CEFR hoặc dữ liệu lỗi của lớp
          ↓
[3. DRAFT]
  Bài tập được lưu ở trạng thái bản nháp bí mật (Chỉ giáo viên nhìn thấy)
          ↓
[4. TEACHER REVIEW & EDIT]
  Giáo viên kiểm tra tính sư phạm, chỉnh sửa câu hỏi, đổi đáp án, điều chỉnh độ khó
          ↓
[5. APPROVED]
  Giáo viên xác nhận chất lượng bài tập đạt chuẩn
          ↓
[6. PUBLISHED / ASSIGNED]
  Bài tập được lên lịch xuất bản hoặc giao trực tiếp cho cả lớp / nhóm học sinh
```

#### Chi tiết các bước thực hiện:
1. **Lựa chọn hình thức tạo bài**:
   * *Cách 1: Chọn từ Ngân hàng câu hỏi (Question Bank)*: Tái sử dụng các câu hỏi đã được kiểm định chất lượng.
   * *Cách 2: Tự soạn thủ công (Manual Custom)*: Nhập câu hỏi, bài đọc, đáp án, và rubric riêng.
   * *Cách 3: Sử dụng AI Copilot*:
     * *Tùy chọn A (Theo chủ đề)*: "Tạo 10 câu trắc nghiệm ngữ pháp Present Perfect ở trình độ B1 cho học sinh 15 tuổi".
     * *Tùy chọn B (Dựa trên điểm yếu của lớp - Moat Feature)*: Giáo viên bấm nút `[Tạo bài ôn tập dựa trên lỗi tuần này của lớp B1-03]`.
   * *Cách 4: Nhập liệu từ tệp Word (.DOCX) với 2 luồng phân tách rõ ràng*:
     * **Luồng A (DOCX có đề sẵn)**: Hệ thống parse cấu trúc, giữ nguyên 100% câu hỏi, đoạn văn và đáp án gốc. Đề thiếu đáp án sẽ báo đỏ `[Cần xác nhận]`; dạng câu hỏi chưa hỗ trợ sẽ giữ nguyên văn bản thô, tuyệt đối không âm thầm ép thành trắc nghiệm.
     * **Luồng B (DOCX chỉ có nội dung thô)**: Giáo viên tải lên bài báo/tài liệu bài giảng; AI tự động đọc hiểu và sinh đề bài, đáp án kèm lời giải thích.
     * Màn hình Preview của Giáo viên mô phỏng chính xác 100% giao diện học sinh sẽ làm (WYSIWYG).
2. **AI Phân tích và sinh bản nháp**:
   * Hệ thống quét dữ liệu của lớp: *Mạo từ (Articles) sai 41%, Câu điều kiện loại 1 sai 35%, Từ vựng học thuật sai 31%*.
   * AI sinh tự động: 5 câu Mạo từ (tập trung đúng các bối cảnh học sinh lớp hay sai), 5 câu Câu điều kiện, 5 câu Từ vựng ngữ cảnh.
3. **Giáo viên biên tập (Review & Edit)**:
   * Giáo viên có thể bấm `[Regenerate]` từng câu không ưng ý, sửa văn phong câu văn, hoặc thay đổi đáp án gây nhiễu.
   * Giáo viên có thể chọn tùy chọn `[Save to Question Bank]` để lưu các câu hay vào kho cá nhân.
4. **Cấu hình giao bài (Assignment Configuration)**:
   * Tiêu đề: *Weekend Review - Articles & Conditionals*.
   * Đối tượng nhận bài: Toàn bộ lớp hoặc Chỉ giao cho nhóm học sinh yếu (Differentiated Homework).
   * Hạn nộp (Due Date): Ngày giờ cụ thể.
   * Chế độ nộp muộn: Cho phép hoặc Khóa bài khi hết hạn.
   * Cấu hình AI Tutor: Bật chế độ Hỗ trợ gợi mở (Tutor Mode) trong lúc học sinh làm bài.
5. **Xuất bản bài tập (Publish)**:
   * Bài tập được đẩy vào hàng đợi của lớp và tự động xuất hiện trên `Today's Plan` của học sinh được chỉ định.

---

### 3. Quy Trình Chấm Bài & Trả Nhận Xét (Grading & Formative Feedback)
1. **Tiếp nhận bài nộp**: Khi học sinh nộp bài, trạng thái chuyển thành `SUBMITTED`.
2. **AI Pre-grading (Hỗ trợ chấm nháp từ AI)**:
   * Với bài trắc nghiệm / điền từ: Tự động chấm điểm tuyệt đối theo đáp án chuẩn.
   * Với bài viết luận (Writing): AI tự động phân tích và đưa ra **Bản chấm nháp (Draft Assessment)** gồm:
     * Ước lượng điểm 4 tiêu chí IELTS (Task Response, Coherence, Lexical Resource, Grammar).
     * Phát hiện các lỗi ngữ pháp cụ thể kèm dòng trích dẫn.
     * Đề xuất nhận xét mang tính xây dựng.
3. **Giáo viên phê duyệt & Hoàn thiện bài chấm (Teacher Final Evaluation)**:
   * Giáo viên đọc bài luận của học sinh và xem bản chấm nháp của AI.
   * Giáo viên toàn quyền sửa điểm số từng tiêu chí, bổ sung ghi chú sư phạm cá nhân hóa (ví dụ: *"Thầy khen Huy tuần này đã nhớ chia động từ, nhưng cần chú ý ngắt đoạn rõ hơn ở phần Thân bài"*).
4. **Trả bài (Return & Publish Grade)**:
   * Giáo viên bấm `[Return Assignment]`.
   * Học sinh nhận được thông báo kèm toàn bộ nhận xét.
   * **Dữ liệu điểm số và danh mục lỗi sai đã được giáo viên xác thực lập tức được đẩy về Student Learning Profile**.

---

### 4. Phân Tích Dữ Liệu Lớp Học (Class Analytics & Weakness Diagnostics)
Giáo viên có tab `Analytics` riêng trong từng lớp:
* Xem ma trận điểm yếu chung của lớp theo từng dạng bài và từng node kiến thức.
* Xem phân bổ năng lực hiện tại (Phổ điểm Estimated IELTS của lớp).
* Lựa chọn tính năng `[Intervention Suggestion]` để hệ thống gợi ý chuyên đề nên giảng lại trên lớp trong buổi học tới.

---

## Alternative Flows
- **Giao bài tập phân hóa theo nhóm (Differentiated Assignment)**: Giáo viên không giao chung 1 đề cho 25 học sinh mà chia lớp thành 2 nhóm: Nhóm A (Band 4.5–5.0) nhận bài tập củng cố thì cơ bản, Nhóm B (Band 5.5–6.0) nhận bài tập phát triển câu phức.
- **Yêu cầu làm lại bài (Request Revision)**: Giáo viên trả bài với trạng thái `REVISION_REQUIRED` kèm yêu cầu học sinh viết lại trước khi chấm điểm cuối cùng.

---

## Error / Edge Cases
- **Học sinh nộp bài sau deadline**: Hệ thống đánh dấu cờ `LATE`. Giáo viên có thể thiết lập trừ % điểm nộp muộn hoặc chấp nhận chấm bình thường.
- **AI sinh câu hỏi mơ hồ (Ambiguous Question)**: Trong quá trình Review, nếu giáo viên phát hiện câu hỏi AI sinh có nhiều hơn 1 đáp án đúng, giáo viên bấm `[Flag Ambiguous]` để hệ thống gắn nhãn tinh chỉnh prompt.

---

## State Changes
- Bài tập: `DRAFT` $\rightarrow$ `APPROVED` $\rightarrow$ `PUBLISHED` $\rightarrow$ `CLOSED`.
- Bài nộp của học sinh: `SUBMITTED` $\rightarrow$ `AI_PRE_GRADED` $\rightarrow$ `GRADED` $\rightarrow$ `RETURNED`.

---

## Data Conceptually Involved
- `Class`, `StudentEnrollment`, `Assignment`, `AssignmentDraft`, `Question`, `Submission`, `TeacherFeedback`, `ClassAnalyticsReport`.

---

## AI Involvement
- **Teacher AI Copilot**: Sinh câu hỏi và đề bài theo yêu cầu và theo dữ liệu lỗi của lớp.
- **AI Draft Grader**: Hỗ trợ chấm nháp và phân tích lỗi bài luận cho giáo viên.
- **Class Weakness Aggregator**: Tổng hợp ma trận lỗi sai của tập hợp học sinh trong lớp.

---

## Permissions
- Giáo viên chỉ có quyền quản lý, tạo bài và xem dữ liệu của những lớp học mà mình được phân công phụ trách.

---

## Open Questions
- Xem [`docs/20-open-questions.md`](20-open-questions.md) mục `Teacher` (Q-004, Q-005).

# 05 - Classroom Workflow

## Goal
Quy định chi tiết luồng tương tác và phân cấp cấu trúc trong không gian Lớp học (Classroom Learning), mô tả rõ ràng mối quan hệ giữa Khóa học, Lớp học, Giáo viên, Học sinh, Bài tập, Bài nộp, Chấm điểm và Phản hồi, cùng các máy trạng thái (State Machines) đi kèm.

## Actor
- Teacher (Người quản lý lớp và giao bài)
- Student (Người tham gia học và nộp bài)

## Preconditions
- Lớp học đã được tạo, giáo viên đã được phân công và học sinh đã hoàn tất ghi danh vào lớp.

## Trigger
- Giáo viên bắt đầu một chu kỳ bài tập mới hoặc học sinh truy cập không gian lớp học để thực hiện nhiệm vụ được giao.

---

## Main Flow: Phân Cấp Học Thuật & Vòng Đời Bài Tập

### 1. Phân Cấp Cấu Trúc Lớp Học (Academic Hierarchy)
Mối quan hệ dữ liệu logic trong không gian lớp học được tổ chức theo hình cây chặt chẽ:

```
COURSE (Khung chương trình: Ví dụ "IELTS Complete 5.0 - 6.5")
  │
  └── CLASS (Lớp học cụ thể: Ví dụ "IELTS B1-03 / Niên khóa 2026")
        │
        ├── TEACHER (Giáo viên phụ trách chính / Trợ giảng)
        │
        ├── STUDENTS (Danh sách học sinh được ghi danh)
        │
        └── ASSIGNMENT (Nhiệm vụ / Bài tập được giao)
              │
              ├── SUBMISSION (Bài nộp của từng học sinh)
              │     │
              │     ├── GRADE (Điểm số / Band điểm chính thức)
              │     │
              │     └── FEEDBACK (Nhận xét sư phạm & Gắn nhãn lỗi sai)
              │
              └── SUBMISSION ...
```

---

### 2. Vòng Đời Trạng Thái Của Bài Tập (Assignment Lifecycle State Machine)
Một bài tập do giáo viên tạo ra trải qua các trạng thái sau:

```
[DRAFT]
  (Giáo viên đang soạn hoặc AI đang hỗ trợ sinh câu hỏi - Học sinh chưa nhìn thấy)
    │
    ▼ [Teacher approves & sets due date]
[PUBLISHED]
  (Bài tập hiển thị trong Classroom và đẩy vào Today's Plan của học sinh)
    │
    ▼ [Due date passes / Teacher manual close]
[CLOSED]
  (Hết hạn nộp bài - Khóa nhận bài mới nếu không bật tính năng nộp muộn)
    │
    ▼ [All submissions graded and returned]
[ARCHIVED]
  (Lưu trữ bài tập vào hồ sơ lịch sử lớp học)
```

---

### 3. Vòng Đời Trạng Thái Của Bài Nộp Của Học Sinh (Submission State Machine)
Đối với từng học sinh trong lớp, bài làm của họ trải qua các bước chuyển trạng thái:

```
[ASSIGNED]
  (Bài tập đã được giao, học sinh chưa bắt đầu làm)
    │
    ▼ [Student opens & starts working]
[IN_PROGRESS]
  (Học sinh đang làm bài, các câu trả lời lưu tạm vào bản nháp cục bộ)
    │
    ▼ [Student clicks Submit]
[SUBMITTED]
  (Học sinh hoàn tất nộp bài trước hoặc đúng hạn)
    │
    ├─ (Nếu nộp sau deadline có cho phép: [SUBMITTED_LATE])
    │
    ▼ [System runs automated checks or AI draft grading]
[AI_PRE_GRADED] (Tùy chọn với bài Writing/Speaking)
  (AI hoàn tất phân tích sơ bộ và đề xuất điểm nháp cho giáo viên)
    │
    ▼ [Teacher reviews, modifies grade and writes comments]
[GRADED]
  (Giáo viên đã hoàn tất việc chấm điểm và phê duyệt nhận xét)
    │
    ▼ [Teacher clicks Return to Student]
[RETURNED]
  (Điểm số và nhận xét hiển thị cho học sinh; Dữ liệu cập nhật vào Learning Profile)
```

#### Quy Trình Yêu Cầu Sửa Lại Bài (Revision Loop):
Nếu giáo viên nhận thấy bài viết của học sinh chưa đạt yêu cầu tối thiểu hoặc muốn học sinh viết lại bản thảo thứ hai (Draft 2):

```
[RETURNED]
  │
  ▼ [Teacher requests revision with action notes]
[REVISION_REQUIRED]
  (Học sinh nhận thông báo cần viết lại hoặc sửa lỗi cụ thể)
    │
    ▼ [Student reviews comments and submits revised draft]
[RESUBMITTED]
  (Bài nộp lần 2 được gửi lại cho giáo viên)
    │
    ▼ [Teacher finalizes score]
[GRADED] ──► [RETURNED]
```

---

### 4. Đóng Vòng Lặp Về Learning Profile (Profile Integration)
Khi một bài nộp đạt trạng thái cuối cùng là `RETURNED`:
1. **Điểm số kỹ năng**: Quy đổi và tác động lên điểm ước lượng của kỹ năng tương ứng (ví dụ: điểm Writing Task 2 tác động trực tiếp lên `writing_score`).
2. **Trích xuất lỗi sai (Error Extraction)**: Danh mục các lỗi ngữ pháp hoặc diễn đạt mà học sinh mắc phải trong bài nộp được trích xuất và đưa vào danh sách **Active Weaknesses**.
3. **Từ vựng mới (Lexical Expansion)**: Các từ vựng được giáo viên đề xuất dùng thay thế trong phần Feedback được tự động đẩy vào hàng đợi **Vocabulary SRS Queue** của học sinh.

---

## Alternative Flows
- **Bài tập không chấm điểm (Ungraded Activity)**: Giáo viên giao bài đọc hoặc bài nghe để học sinh tự luyện tập. Trạng thái kết thúc là `COMPLETED` thay vì `GRADED`. Hệ thống vẫn trích xuất dữ liệu lỗi để cập nhật Profile.

---

## Error / Edge Cases
- **Học sinh nộp bài trắng hoặc nội dung không liên quan (Spam/Plagiarism)**: Giáo viên có thể gắn cờ `REJECTED` và yêu cầu nộp lại mà không đưa dữ liệu rác vào Learning Profile.

---

## State Changes
- Cập nhật trạng thái `Assignment` và `Submission`.
- Cập nhật tiến độ hoàn thành khóa học của học sinh trong lớp.

---

## Data Conceptually Involved
- `ClassroomCourse`, `ClassroomInstance`, `AssignmentRecord`, `StudentSubmission`, `EvaluationGrade`, `FormativeFeedback`, `ClassRoster`.

---

## AI Involvement
- **AI Pre-grader**: Soạn nháp điểm 4 tiêu chí và chỉ ra các lỗi ngữ pháp trong bài viết luận.
- **AI Plagiarism & AI-Generation Detector**: Đánh giá sơ bộ xem bài viết có dấu hiệu copy-paste hay lạm dụng AI không để cảnh báo giáo viên.

---

## Permissions
- Giáo viên có quyền tạo, sửa, xóa bài tập và chấm bài trong lớp của mình.
- Học sinh chỉ có quyền xem bài tập của lớp và xem bài nộp của chính mình.

---

## Open Questions
- Xem [`docs/20-open-questions.md`](20-open-questions.md) mục `Classroom` (Q-007).

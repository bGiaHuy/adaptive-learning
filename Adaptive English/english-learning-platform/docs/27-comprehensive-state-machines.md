# 27 - Comprehensive State Machines Specification

## Goal
Quy định danh mục các máy trạng thái hữu hạn (Finite State Machines - FSM) chi tiết cho toàn bộ các thực thể cốt lõi trong hệ thống AELP, bao gồm các sự kiện kích hoạt (Events), điều kiện bảo vệ (Guards), hành động chuyển trạng thái (Actions), và cơ chế quản lý phiên bản (Versioning) khi giáo viên sửa đề.

---

## 1. LESSON / ACTIVITY STATE MACHINE (TIẾN ĐỘ BÀI HỌC)

```mermaid
stateDiagram-v2
    [*] --> LOCKED: Cấp độ chưa được mở khóa
    
    LOCKED --> UNLOCKED: Đạt điều kiện tiên quyết HOẶC Vượt qua bài Test Nhảy trình (Level-Skip Test)
    
    UNLOCKED --> IN_PROGRESS: Học sinh mở bài và bắt đầu làm câu hỏi 1
    
    IN_PROGRESS --> PAUSED: Học sinh bấm nút [X] (Hệ thống tự động lưu nháp)
    PAUSED --> IN_PROGRESS: Học sinh bấm "Tiếp tục bài đang dở"
    
    IN_PROGRESS --> COMPLETED: Hoàn thành 100% câu hỏi với tỷ lệ đúng >= 70%
    IN_PROGRESS --> NEEDS_PRACTICE: Hoàn thành bài nhưng tỷ lệ đúng < 70%
    
    NEEDS_PRACTICE --> IN_PROGRESS: Học sinh làm lại hoặc làm bài micro-drill củng cố
    COMPLETED --> MASTERED: Vượt qua bài kiểm tra xác nhận sau 14 ngày
```

* **Phân biệt rạch ròi**: `"Hoàn thành bài (Completed)"` chỉ ghi nhận người học đã đi qua toàn bộ nội dung của bài; `"Làm chủ (Mastered)"` đòi hỏi sự thuần thục ổn định qua thời gian.

---

## 2. VOCABULARY MEMORY STATE MACHINE (TỦ TỪ 5 TRẠNG THÁI & THUẬT TOÁN FSRS)

```mermaid
stateDiagram-v2
    [*] --> SAVED: Học sinh lưu từ mới hoặc import từ danh sách (Shelf)
    
    SAVED --> LEARNING: Kích hoạt học (bấm trực tiếp hoặc nạp theo New Card Quota)
    
    state "VÒNG ĐỜI HỌC VÀ ÔN TẬP (FSRS ENGINE)" as FSRSCycle {
        LEARNING --> REVIEWING: Vượt qua các bước học ban đầu trong ngày
        
        REVIEWING --> REVIEW_DUE: Đến hạn ôn tập theo thuật toán FSRS
        
        REVIEW_DUE --> RATED_AGAIN: Bấm 'QUÊN' (Reset khoảng cách về 1 ngày)
        REVIEW_DUE --> RATED_HARD: Bấm 'KHÓ' (Vẫn nhớ được, tăng nhẹ interval 1-2 ngày)
        REVIEW_DUE --> RATED_GOOD: Bấm 'NHỚ' (Nhớ đúng chuẩn xác, tăng interval chuẩn)
        REVIEW_DUE --> RATED_EASY: Bấm 'DỄ' (Nhớ nhanh phản xạ, tăng interval dài)
        
        RATED_AGAIN --> RELEARNING: Đưa vào nhóm Cần học lại
        RELEARNING --> REVIEWING: Hoàn thành bước học lại trong phiên
        
        RATED_HARD --> REVIEWING: Lên lịch ôn tiếp theo
        RATED_GOOD --> REVIEWING: Lên lịch chu kỳ tiếp theo
        RATED_EASY --> REVIEWING: Lên lịch chu kỳ dài hạn
    }
    
    REVIEWING --> MASTERED: Đạt tiêu chí 'Nhớ ổn định' (>= 3 ngày nhớ đúng VÀ Interval >= 21 ngày)
    
    state "NHỚ ỔN ĐỊNH (Mastered / Retained)" as MasteredPool {
        MASTERED --> LONG_TERM_DUE: Đến hạn kiểm tra duy trì định kỳ (FSRS Interval dài)
    }
    
    LONG_TERM_DUE --> MASTERED: Ôn tập đúng
    LONG_TERM_DUE --> RELEARNING: Ôn tập sai hoặc quên nghĩa (Tái kích hoạt học lại)
    
    LEARNING --> SAVED: Người học chủ động tạm dừng từ để giải phóng hạn ngạch
    REVIEWING --> SAVED: Người học chủ động cất lại vào kho
```

* **Tiêu chuẩn "Nhớ ổn định" (Mastered)**: Nhãn sản phẩm dựa trên bằng chứng ghi nhớ thực nghiệm:
  1. Người học đã vượt qua giai đoạn củng cố ban đầu.
  2. Trả lời đúng ở **$\ge 3$ ngày khác nhau** trước khi lật mặt sau xem đáp án.
  3. Thuật toán FSRS lên lịch khoảng cách ôn tiếp theo **$\ge 21$ ngày** (tương đương chuẩn thẻ Mature của Anki).

---

## 3. ASSIGNMENT LIFECYCLE & VERSIONING STATE MACHINE (BÀI TẬP & PHIÊN BẢN)

Khi giáo viên chỉnh sửa bài tập sau khi đã giao, hệ thống **bảo toàn lịch sử phiên bản (`version_id`)** để bài làm của học sinh không bị xung đột:

```mermaid
stateDiagram-v2
    [*] --> DRAFT_V1: Giáo viên soạn đề hoặc import DOCX (Chưa học sinh nào thấy)
    
    DRAFT_V1 --> PUBLISHED_V1: Giáo viên bấm APPROVE & PUBLISH
    
    PUBLISHED_V1 --> ACTIVE_V1: Học sinh nhận bài và làm bài trên Version 1
    
    state "Chỉnh sửa sau khi đã giao" as EditWorkflow {
        ACTIVE_V1 --> DRAFT_V2: Giáo viên sửa câu hỏi / sửa đáp án khi đã có học sinh làm
        DRAFT_V2 --> PUBLISHED_V2: Giáo viên xác nhận xuất bản Version 2
    }
    
    PUBLISHED_V2 --> CLOSED: Hết hạn nộp bài (Due Date)
    CLOSED --> ARCHIVED: Hoàn tất toàn bộ việc chấm điểm và lưu trữ
```

* **Quy tắc phiên bản đề (Assignment Versioning Rule)**:
  * Nếu học sinh đã nộp bài ở `Version 1`: Bài nộp gắn chặt với đề `Version 1`. Điểm số được chấm theo đáp án của Version 1.
  * Nếu học sinh đang làm dở ở `Version 1` khi giáo viên công bố `Version 2`: Hệ thống hiển thị thông báo: *"Giáo viên vừa cập nhật đề bài (V2). Bạn có muốn chuyển sang bản cập nhật không?"*. Nếu đồng ý, các câu hỏi không thay đổi được giữ nguyên câu trả lời.
  * Học sinh bắt đầu làm sau thời điểm xuất bản V2 sẽ tự động nhận đề `Version 2`.

---

## 4. SUBMISSION & GRADING STATE MACHINE (BÀI NỘP & CHẤM ĐIỂM)

```mermaid
stateDiagram-v2
    [*] --> ASSIGNED: Bài tập xuất hiện trên bảng tin của học sinh
    
    ASSIGNED --> IN_PROGRESS: Học sinh mở đề và trả lời ít nhất 1 câu (Tự động lưu nháp)
    
    IN_PROGRESS --> SUBMITTED: Học sinh bấm nộp đúng hạn
    IN_PROGRESS --> SUBMITTED_LATE: Học sinh nộp sau thời hạn cho phép
    
    SUBMITTED --> AI_PRE_GRADED: Bài Writing/Speaking chuyển sang AI phân tích nháp
    SUBMITTED_LATE --> AI_PRE_GRADED: Bài Writing/Speaking chuyển sang AI phân tích nháp
    
    AI_PRE_GRADED --> TEACHER_GRADED: Giáo viên duyệt, sửa điểm và viết nhận xét
    
    TEACHER_GRADED --> RETURNED: Giáo viên bấm RETURN trả kết quả cho học sinh
    
    RETURNED --> REVISION_REQUIRED: Giáo viên yêu cầu sửa lại (cho phép nộp lại)
    REVISION_REQUIRED --> RESUBMITTED: Học sinh sửa bài luận và nộp lại Draft 2
    RESUBMITTED --> TEACHER_GRADED: Giáo viên chấm lại bản sửa đổi
    
    RETURNED --> SCORE_UPDATED: Giáo viên điều chỉnh lại điểm sau khi đã trả (Gửi Notification)
    SCORE_UPDATED --> RETURNED: Học sinh nhận điểm cập nhật mới
    
    RETURNED --> FINALIZED: Kết thúc bài tập, đồng bộ làm nguồn tham chiếu cho Profile
```

---

## 5. QAC & AI EVALUATION STATE MACHINE (TỰ HỌC WRITING / SPEAKING)

Đối với bài tự học khi không có giáo viên chấm:

```mermaid
stateDiagram-v2
    [*] --> DRAFT_WRITING: Học sinh gõ bài viết hoặc thu âm bài nói
    
    DRAFT_WRITING --> EVALUATION_REQUESTED: Học sinh bấm "Sử dụng AI để đánh giá"
    
    EVALUATION_REQUESTED --> AI_PROCESSING: AI phân tích 4 tiêu chí CEFR
    
    AI_PROCESSING --> EVALUATION_COMPLETED: Hiển thị kết quả kèm nhãn "Do AI đánh giá"
    
    EVALUATION_COMPLETED --> DISPUTED: Học sinh bấm "Yêu cầu đánh giá lại" (kèm lý do)
    DISPUTED --> AI_PROCESSING: AI phân tích lại với prompt đối chiếu
    
    EVALUATION_COMPLETED --> SYNCED_TO_PROFILE: Điểm sơ bộ cập nhật vào Profile
```

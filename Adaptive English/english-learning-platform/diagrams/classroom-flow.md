# Classroom Flow Diagram

Sơ đồ mô tả quy trình tương tác và luồng dữ liệu hai chiều trong không gian Lớp học (Classroom Learning), từ phân cấp học thuật đến quá trình nộp bài, chấm bài và phản hồi.

```mermaid
sequenceDiagram
    autonumber
    actor T as Teacher
    actor S as Student
    participant C as Classroom Portal
    participant AI as AI Engine (Pre-grader / Copilot)
    participant LP as Student Learning Profile

    Note over T, C: BƯỚC 1: KHỞI TẠO & GIAO BÀI TẬP
    T->>C: Yêu cầu tạo bài tập (Thủ công hoặc dùng AI Copilot)
    alt Giáo viên dùng AI Copilot
        C->>AI: Sinh câu hỏi dựa trên lỗi của lớp
        AI-->>C: Trả về bản nháp bài tập (DRAFT)
        C-->>T: Giáo viên xem xét, chỉnh sửa và bấm APPROVED
    end
    T->>C: Cấu hình hạn nộp (Due Date) và bấm PUBLISH
    C-->>S: Thông báo bài tập mới xuất hiện trên Classroom & Today's Plan

    Note over S, C: BƯỚC 2: HỌC SINH THỰC HIỆN BÀI LÀM
    S->>C: Mở bài tập và bắt đầu làm bài (Trạng thái: IN_PROGRESS)
    opt Học sinh cần trợ giúp
        S->>AI: Hỏi bài qua AI Tutor
        AI-->>S: Gợi ý phương pháp giải theo Socratic Method (Không lộ đáp án)
    end
    S->>C: Bấm Nộp bài (Trạng thái: SUBMITTED)

    Note over C, T: BƯỚC 3: CHẤM BÀI & PHÊ DUYỆT
    alt Bài trắc nghiệm / Điền từ tự động
        C->>C: Chấm điểm tự động 100%
    else Bài Viết (Writing) / Bài Nói (Speaking)
        C->>AI: Phân tích bài làm theo 4 tiêu chí IELTS Rubric
        AI-->>C: Lưu bản chấm nháp (AI_PRE_GRADED)
        C-->>T: Giáo viên mở bản chấm nháp, sửa điểm và viết nhận xét cá nhân
    end
    T->>C: Bấm RETURN trả bài cho học sinh

    Note over C, LP: BƯỚC 4: ĐỒNG BỘ DỮ LIỆU & ĐÓNG VÒNG LẶP
    C-->>S: Học sinh nhận thông báo kết quả và bài chữa chi tiết
    C->>LP: Đồng bộ điểm chính thức vào Hồ sơ năng lực
    C->>LP: Bóc tách lỗi ngữ pháp đưa vào danh sách Active Weaknesses
    C->>LP: Bổ sung từ vựng mới gợi ý vào Kho từ vựng Spaced Repetition
    LP-->>S: Trang chủ ngày tiếp theo ưu tiên bài tập khắc phục đúng các lỗi vừa mắc phải
```

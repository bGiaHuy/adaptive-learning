# Assignment Lifecycle State Diagram

Sơ đồ máy trạng thái biểu diễn toàn bộ vòng đời của Bài tập (Assignment) và Bài nộp của học sinh (Submission), bao gồm cả vòng lặp yêu cầu làm lại (Revision Loop).

```mermaid
stateDiagram-v2
    [*] --> AssignmentDraft: Giáo viên bắt đầu soạn hoặc AI sinh bản nháp
    
    state AssignmentLifecycle {
        AssignmentDraft --> AssignmentApproved: Giáo viên duyệt nội dung
        AssignmentApproved --> AssignmentScheduled: Đặt lịch phát hành tương lai
        AssignmentApproved --> AssignmentPublished: Phát hành ngay lập tức
        AssignmentScheduled --> AssignmentPublished: Đến giờ phát hành
        AssignmentPublished --> AssignmentClosed: Hết hạn nộp bài (Due Date)
        AssignmentClosed --> AssignmentArchived: Hoàn tất chấm & lưu trữ
    }

    state SubmissionLifecycle {
        [*] --> Assigned: Bài tập được xuất bản cho học sinh
        Assigned --> InProgress: Học sinh mở đề và bắt đầu làm bài
        InProgress --> Submitted: Học sinh bấm nộp đúng hạn
        InProgress --> SubmittedLate: Học sinh nộp sau thời hạn cho phép
        
        Submitted --> AutoGraded: Bài trắc nghiệm / Điền từ tự động
        SubmittedLate --> AutoGraded: Bài trắc nghiệm / Điền từ tự động
        
        Submitted --> AIPreGraded: Bài Viết / Nói chuyển sang AI phân tích
        SubmittedLate --> AIPreGraded: Bài Viết / Nói chuyển sang AI phân tích
        
        AIPreGraded --> Graded: Giáo viên duyệt điểm và bổ sung nhận xét
        AutoGraded --> Graded: Giáo viên xác nhận điểm
        
        Graded --> Returned: Giáo viên bấm Return gửi kết quả cho học sinh
        
        Returned --> RevisionRequired: Giáo viên yêu cầu viết lại / nộp lại bài
        RevisionRequired --> Resubmitted: Học sinh hoàn thành bản sửa đổi (Draft 2)
        Resubmitted --> Graded: Giáo viên chấm lại bản sửa đổi
        
        Returned --> Finalized: Học sinh chấp nhận kết quả cuối cùng
        Finalized --> ProfileSynced: Dữ liệu chính thức cập nhật vào Learning Profile
    }
```

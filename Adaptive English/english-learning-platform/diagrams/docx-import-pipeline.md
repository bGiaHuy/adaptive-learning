# DOCX Ingestion Dual-Pipeline Diagram

Sơ đồ mô tả chi tiết hai luồng xử lý nhập liệu tệp Word (.DOCX) cho giáo viên, phân tách rạch ròi giữa việc parse đề thi có sẵn và việc dùng AI sinh câu hỏi từ tài liệu thô.

```mermaid
flowchart TD
    Start([Giáo viên Tải Lên Tệp .DOCX]) --> ChoosePipeline{Chọn Luồng Xử Lý}
    
    %% LUỒNG A: ĐỀ CÓ SẴN
    ChoosePipeline -- "LUỒNG A: DOCX Có Đề Sẵn" --> ParseEngine["DOCX Parser bóc tách cấu trúc:
    - Trích xuất câu hỏi, đoạn văn, phương án A/B/C/D
    - Giữ nguyên 100% câu chữ gốc"]
    
    ParseEngine --> CheckIntegrity{"Kiểm tra Tính toàn vẹn của Đề"}
    
    CheckIntegrity -- "Có câu thiếu đáp án" --> FlagMissing["ĐÁNH DẤU CỜ ĐỎ [Thiếu đáp án gốc]
    - AI đề xuất đáp án suy đoán
    - Bắt buộc Giáo viên bấm xác nhận"]
    
    CheckIntegrity -- "Có dạng bài chưa hỗ trợ (Nối cột / Kéo thả)" --> FallbackRaw["GIỮ NGUYÊN ĐỊNH DẠNG TEXT THÔ
    - Tuyệt đối không âm thầm ép thành trắc nghiệm
    - Học sinh làm bài theo dạng tự luận/thủ công"]
    
    CheckIntegrity -- "Đề đầy đủ & đúng chuẩn" --> PreviewA["Chuyển sang màn hình Preview"]
    FlagMissing & FallbackRaw --> PreviewA
    
    %% LUỒNG B: CHỈ CÓ NỘI DUNG THÔ
    ChoosePipeline -- "LUỒNG B: DOCX Chỉ Có Nội Dung Thô" --> RawExtractor["Trích xuất nội dung văn bản (Bài báo, giáo trình)"]
    RawExtractor --> AIGenerator["AI Copilot đọc hiểu & sinh câu hỏi mới:
    - Đề xuất câu hỏi trắc nghiệm, điền từ, câu hỏi ý chính
    - Tự động sinh đáp án & lời giải thích chi tiết"]
    
    AIGenerator --> TagInference["GẮN NHÃN [Nội dung do AI biên soạn]
    - Đánh dấu các nhận định suy luận
    - Cảnh báo câu hỏi có thể gây tranh cãi"]
    
    TagInference --> PreviewB["Chuyển sang màn hình Preview"]
    
    %% QUY TRÌNH DUYỆT WYSIWYG
    PreviewA & PreviewB --> WYSIWYG["MÀN HÌNH PREVIEW WYSIWYG CỦA GIÁO VIÊN
    (Mô phỏng chính xác 100% giao diện học sinh sẽ làm & cách chấm điểm)"]
    
    WYSIWYG --> TeacherReviewAction{Giáo viên thao tác}
    TeacherReviewAction -- "Chỉnh sửa câu chữ / Đổi đáp án" --> InlineEdit["Sửa trực tiếp trên màn hình"]
    TeacherReviewAction -- "Đổi câu không ưng ý" --> SingleRegen["Bấm Regenerate từng câu riêng lẻ"]
    
    InlineEdit & SingleRegen --> ApproveGate["Giáo viên bấm APPROVE & Cấu hình hạn nộp"]
    ApproveGate --> PublishAssignment([Xuất bản bài tập cho học sinh])
```

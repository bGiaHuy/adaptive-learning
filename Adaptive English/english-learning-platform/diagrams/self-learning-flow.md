# Self-Learning Flow Diagram

Sơ đồ mô tả quy trình tự học IELTS-inspired, phân định giữa việc **Người dùng chọn kỹ năng** và **Hệ thống đề xuất độ khó**, cùng các quy tắc thích ứng khoa học kiểm soát độ khó lâu dài.

```mermaid
flowchart TD
    Enter([Người học vào Tab HỌC]) --> ModeChoice{Chọn cách bắt đầu}
    
    %% Cách 1: Học theo kế hoạch
    ModeChoice -- "Học theo kế hoạch" --> SingleAction["Nhận 1 hành động đề xuất rõ ràng duy nhất
    (Ví dụ: Ôn 12 từ đến hạn / Luyện Matching Headings)"]
    
    %% Cách 2: Tự chọn kỹ năng
    ModeChoice -- "Tự chọn kỹ năng" --> PickSkill["Người học chọn kỹ năng:
    [Listening] [Reading] [Writing] [Speaking]"]
    PickSkill --> SysSuggestDiff["Hệ thống đề xuất độ khó & dạng bài phù hợp
    dựa trên Hồ sơ năng lực của riêng kỹ năng đó"]
    
    SingleAction & SysSuggestDiff --> StartActivity["Bắt đầu bài tập ngắn (Bite-sized: 3-8 phút)"]
    
    subgraph IN_ACTIVITY["TRẢI NGHIỆM TRONG BÀI TẬP (DUOLINGO-STYLE PACING)"]
        ActivityQ["Làm câu hỏi / Đoạn đọc / Đoạn nghe"]
        UserControls{"Người dùng tương tác"}
        
        UserControls -- "Bấm 'Xem Gợi Ý' (Hint)" --> UseHint["Xem gợi ý"]
        UserControls -- "Tự trả lời độc lập" --> SelfAnswer["Chọn / Gõ câu trả lời"]
        UserControls -- "Cảm thấy bài không vừa sức" --> ClickFeedback["Bấm nút 'Quá dễ' hoặc 'Quá khó'"]
        
        UseHint --> LateAnswer["Trả lời đúng sau khi xem gợi ý"]
        ClickFeedback --> SwapChallenge["Đổi ngay sang bài khác vừa sức hơn
        (Không phạt điểm năng lực)"]
    end
    
    StartActivity --> IN_ACTIVITY
    SelfAnswer & LateAnswer --> EvalResponse["Hệ thống đánh giá câu trả lời"]
    
    subgraph ADAPTIVE_RULES["5 QUY TẮC ĐIỀU CHỈNH THÍCH ỨNG LÂU DÀI"]
        R1["1. ĐÚNG SAU GỢI Ý:
        Tính là lần học/ôn, KHÔNG tính là bằng chứng nâng cấp độ khó"]
        
        R2["2. MỘT LẦN SAI:
        KHÔNG làm tụt cấp độ ngay; chỉ điều chỉnh khi sai ổn định qua nhiều bài"]
        
        R3["3. LÀM LẠI CÂU ĐÃ BIẾT ĐÁP ÁN:
        Chỉ tính là ôn tập, không tính là bằng chứng năng lực mới"]
        
        R4["4. AI FEEDBACK (Writing/Speaking):
        Chỉ là đánh giá sơ bộ; nếu dữ liệu chưa rõ giữ độ tin cậy LOW"]
        
        R5["5. NÚT QUÁ DỄ / QUÁ KHÓ:
        Chỉ điều chỉnh trải nghiệm phiên học, không tự biến thành điểm năng lực"]
    end
    
    EvalResponse --> ADAPTIVE_RULES
    ADAPTIVE_RULES --> AnalyzeTrends{"Phân tích xu hướng qua nhiều hoạt động"}
    
    AnalyzeTrends -- "Thành thạo ổn định" --> IncreaseDiff["Đề xuất tăng độ khó ở bài sau"]
    AnalyzeTrends -- "Còn khó khăn kéo dài" --> DecreaseDiff["Đề xuất bài dễ hơn hoặc micro-drill củng cố"]
    AnalyzeTrends -- "Chưa đủ dữ liệu rõ ràng" --> KeepDiff["Giữ nguyên mức, kiểm tra thêm"]
    
    IncreaseDiff & DecreaseDiff & KeepDiff --> HarvestVocab["Nếu bài có từ mới / từ bị sai → Nạp vào Tủ từ vựng Anki"]
    HarvestVocab --> EndActivity([Hoàn thành phiên học - Hiển thị màn hình tổng kết])
```

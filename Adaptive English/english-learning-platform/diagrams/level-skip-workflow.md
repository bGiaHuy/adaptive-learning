# Skill-Based Level-Skip Workflow Diagram

Sơ đồ phân biệt rạch ròi giữa bài kiểm tra đầu vào (Placement Test làm 1 lần duy nhất) và bài kiểm tra nhảy trình độc lập theo từng kỹ năng (Skill-Based Level-Skip Test).

```mermaid
flowchart TD
    subgraph PLACEMENT_TEST["1. ADAPTIVE PLACEMENT TEST (LÀM 1 LẦN DUY NHẤT)"]
        NewUser["Người học mới gia nhập"] --> RunPlacement["Làm bài kiểm tra đầu vào 8-12 phút (Bắt buộc)"]
        RunPlacement --> InitLevels["Thiết lập Tọa độ Bắt đầu Độc lập:
        - Reading: B1 (Điểm mạnh: Tìm chi tiết)
        - Listening: A2 (Cần luyện: Tốc độ nghe)
        - Writing: B1
        - Speaking: [Mức tạm thời nếu chưa có mic]"]
        InitLevels --> PlacementLock["KHÓA VĨNH VIỄN BÀI TEST ĐẦU VÀO
        (Không được làm lại bài Placement Test để reset ảo dữ liệu)"]
    end

    subgraph LEVEL_SKIP_TEST["2. BÀI KIỂM TRA NHẢY TRÌNH (THEO TỪNG KỸ NĂNG ĐỘC LẬP)"]
        StudentLearn["Người học cảm thấy bài hiện tại quá dễ"] --> ClickSkip["Bấm nút: 'Kiểm tra để nhảy trình' ở kỹ năng cụ thể
        (Ví dụ: Nhảy trình Reading từ B1 lên B2)"]
        
        ClickSkip --> CheckCooldown{"Đã thử trong 7 ngày qua?"}
        CheckCooldown -- "Đã thử < 7 ngày" --> ShowCooldown["Thông báo: Bạn cần củng cố thêm các bài học hiện tại.
        Thử lại sau N ngày!"]
        
        CheckCooldown -- "Chưa thử / Đủ 7 ngày" --> StartChallenge["BẮT ĐẦU SKIP TEST (5-8 câu khó nhất của mức hiện tại)"]
        StartChallenge --> EvalScore{"Kết quả làm bài độc lập?"}
        
        EvalScore -- "Đạt điểm >= 80% (Không dùng Hint)" --> UnlockLevel["MỞ KHÓA NGAY CẤP ĐỘ TIẾP THEO (B2) CHO RIÊNG KỸ NĂNG ĐÓ"]
        EvalScore -- "Đạt điểm < 80% hoặc Dùng nhiều Hint" --> FailKeep["Không mở khóa; Giữ nguyên mức hiện tại"]
        FailKeep --> SetCooldown["Khóa chức năng Skip Test của kỹ năng đó trong 7 ngày"]
        
        UnlockLevel --> UpdateProfile["Cập nhật năng lực CEFR của kỹ năng đó trên Profile"]
    end

    PlacementLock -. "Người học tiến bộ theo thời gian" .-> StudentLearn
```

# 26 - End-to-End Role Journeys Specification

## Goal
Tài liệu này đặc tả chi tiết 6 hành trình người dùng toàn diện (End-to-End Journeys) bao quát toàn bộ các vai trò và tính năng chính, làm rõ các điểm giao nhau (Intersection Points) giữa Lớp học và Tự học, cơ chế xử lý ngoại lệ và các bước chuyển trạng thái thực tế.

---

## JOURNEY 1: HÀNH TRÌNH ONBOARDING & THIẾT LẬP HỒ SƠ ĐẦU TIÊN (STUDENT)

```mermaid
flowchart TD
    A["Đăng ký tài khoản (Student tự đăng ký)"] --> B{"Có muốn nhập mục tiêu?"}
    B -- "Bấm 'Bỏ qua (Skip)'" --> D["Màn hình giới thiệu Placement Test"]
    B -- "Chọn mục tiêu" --> D
    
    D --> E{"Tò mò muốn xem app?"}
    E -- "Bấm 'Xem trước (Preview)'" --> F["Xem 4 Tab ở chế độ chỉ đọc"]
    F --> G["Bấm banner 'Bắt đầu kiểm tra để học'"]
    E -- "Làm bài ngay" --> G
    
    G --> H["LÀM BÀI TEST 8-12 PHÚT (Lưu từng phần)"]
    H --> H1["Phần 1: Từ vựng & Ngữ pháp (4-6 câu)"]
    H1 --> H2["Phần 2: Reading (1 đoạn, 2-3 câu)"]
    H2 --> H3["Phần 3: Listening (1 audio, 2-3 câu)"]
    H3 --> H4["Phần 4: Writing (2-3 câu ngắn)"]
    H4 --> H5{"Phần 5: Speaking (30s)"}
    
    H5 -- "Có mic & Không ồn" --> H5A["Ghi âm 30s -> Nghe lại -> Gửi"]
    H5 -- "Không thể ghi âm lúc này" --> H5B["Đánh dấu: Chưa đánh giá (Gán mức tạm theo CEFR chung)"]
    
    H5A & H5B --> I["TỔNG HỢP HỒ SƠ NĂNG LỰC ĐỘC LẬP TỪNG KỸ NĂNG"]
    I --> J["Màn hình kết quả: Thông báo mức bắt đầu & Không cộng gộp điểm"]
    J --> K["Trang chủ: Hero Action hiện bài học đầu tiên (8 phút)"]
```

* **Quy tắc vàng của Test đầu vào**:
  1. Chỉ thực hiện **MỘT LẦN DUY NHẤT** trong vòng đời tài khoản. (Khác với bài kiểm tra Nhảy trình sau này).
  2. Bị gián đoạn mạng hoặc hết pin: Quay lại làm tiếp đúng phần dở, không phải làm lại từ đầu.
  3. Mức của Speaking khi chưa ghi âm chỉ là mức ước lượng tạm thời; bài luyện nói đầu tiên sẽ là nơi chính thức ghi nhận bằng chứng.

---

## JOURNEY 2: HÀNH TRÌNH TỰ HỌC KỸ NĂNG & GHI NHẬN HỖ TRỢ (SKILL LEARNING & SCAFFOLDING)

1. **Lựa chọn bài học**:
   * Người học vào tab `HỌC`, chọn kỹ năng `[Reading]` $\rightarrow$ Hệ thống đề xuất bài đọc phù hợp mức CEFR hiện tại (B1).
2. **Trải nghiệm bài tập & Phản hồi 4 bước**:
   * *Câu 1*: Người học tự trả lời độc lập và đúng $\rightarrow$ Hệ thống ghi nhận nhãn `scaffold: INDEPENDENT` (Tính trọn vẹn điểm tăng năng lực).
   * *Câu 2 (Câu khó)*: Người học trả lời sai lần 1 $\rightarrow$ Giao diện rung nhẹ, **không hiện đáp án đúng ngay**. Nút `[Xem Gợi Ý (Hint)]` sáng lên.
   * Người học bấm xem gợi ý và trả lời đúng lần 2 $\rightarrow$ Hệ thống ghi nhận nhãn `scaffold: HINT_ASSISTED` (Tính là một lần ôn củng cố, không vội tăng độ khó bài sau).
   * *Câu 3 (Nhập đáp án - Lỗi chính tả / Typo)*:
     * Người học gõ *"accomodation"* (thiếu chữ 'm').
     * Hệ thống nhận diện lỗi chính tả gần đúng (Typo heuristic): Hiển thị thông báo mềm: *"Bạn viết gần đúng! Hãy chú ý chính tả: accommodation"*. Nếu bài học không nhằm mục đích kiểm tra spelling chuyên biệt, câu này được chấp nhận nhưng có cảnh báo nhắc nhở.
3. **Củng cố cuối bài (Remedial Clone)**:
   * Cuối phiên học, hệ thống tự động sinh 1 câu hỏi tương tự câu 2 để người học kiểm tra lại xem mình đã tự làm chủ kiến thức chưa.

---

## JOURNEY 3: HÀNH TRÌNH ÔN TỪ ANKI & QUẢN LÝ TỦ TỪ 3 TẦNG (VOCABULARY QUEUE)

1. **Khởi động phiên ôn từ**:
   * Tại tab `ÔN TỪ`, Hero Card báo: *“Ôn 14 từ đến hạn hôm nay”*.
   * Trong tủ cá nhân có 120 từ: 60 từ ở nhóm `Đã lưu (Saved)`, 40 từ ở nhóm `Đang học (Learning)`, và 20 từ ở nhóm `Đã nhớ ổn định (Mastered)`.
2. **Thực hiện lật thẻ Active Recall**:
   * Mặt trước thẻ hiện từ vựng và câu khuyết. Người học **bắt buộc tự nhớ nghĩa trong đầu trước khi chạm để lật thẻ**.
   * Chạm lật thẻ: Mặt sau hiện nghĩa tiếng Việt và câu hoàn chỉnh.
   * Người học đánh giá trung thực: Bấm `[LẠI]` (thẻ lặp lại sau 3 thẻ nữa), `[KHÓ]`, `[TỐT]`, hoặc `[DỄ]`.
3. **Kiểm soát nợ ôn tập (Backlog Control)**:
   * Nếu người học bận rộn và thẻ tồn đọng $> 25$ thẻ: Hệ thống tự động kích hoạt chế độ **“Tạm dừng nạp từ mới”**. Người học có thể chọn **Phiên ôn ngắn (5–10 thẻ)** để giảm áp lực.
   * Khi các từ trong nhóm `Đang học` vượt qua chu kỳ ôn tập $\ge 30$ ngày, chúng tự động chuyển sang nhóm `Đã nhớ ổn định`, giải phóng hạn ngạch để người học nạp thêm từ mới từ nhóm `Đã lưu`.

---

## JOURNEY 4: HÀNH TRÌNH TƯƠNG TÁC AI TUTOR & ĐÁNH GIÁ TỰ LUẬN (AI SUITE)

```mermaid
sequenceDiagram
    autonumber
    actor S as Student
    participant UI as Màn hình làm bài
    participant AI as AI Engine
    participant Profile as Hồ sơ năng lực CEFR

    Note over S, UI: TÌNH HUỐNG 1: HỎI BÀI TRONG KHI LÀM
    S->>UI: Bấm nút AI Tutor khi chưa chọn đáp án
    UI->>AI: Gửi câu hỏi kèm trạng thái: UNANSWERED
    AI-->>UI: Chỉ giải thích khái niệm, đưa gợi ý, KHÓA 100% ĐÁP ÁN
    S->>UI: Trả lời xong bài tập tự học
    S->>UI: Bấm AI Tutor xem giải thích
    UI->>AI: Gửi câu hỏi kèm trạng thái: ANSWERED
    AI-->>UI: Phân tích chi tiết tại sao sai và cách tư duy đúng

    Note over S, Profile: TÌNH HUỐNG 2: CHẤM BÀI VIẾT / NÓI TỰ HỌC
    S->>UI: Hoàn thành bài viết luận Task 2 trong tab Tự học
    S->>UI: Bấm nút chủ động: "Sử dụng AI để đánh giá"
    UI->>AI: Phân tích bài theo 4 tiêu chí CEFR
    AI-->>UI: Trả về kết quả kèm nhãn minh bạch: "DO AI ĐÁNH GIÁ"
    AI->>Profile: Cập nhật ước lượng năng lực CEFR & Sinh bài tập vi mô củng cố
```

---

## JOURNEY 5: HÀNH TRÌNH GIÁO VIÊN NHẬP ĐỀ DOCX & GIAO BÀI (TEACHER DOCX INGESTION)

1. **Tải lên tài liệu**:
   * Giáo viên vào `Assignment Creator Studio` $\rightarrow$ Tải lên tệp `Unit3_Test.docx`.
2. **Chọn luồng xử lý**:
   * *Nếu chọn Luồng A (DOCX có đề sẵn)*: Hệ thống parse giữ nguyên 100% câu hỏi và đáp án gốc.
     * Cảnh báo: Câu 7 bị thiếu đáp án $\rightarrow$ Hệ thống đánh dấu cờ đỏ `[AI đã suy luận đáp án C - Cần giáo viên xác nhận]`.
     * Cảnh báo: Câu 12 là dạng nối cột chưa hỗ trợ $\rightarrow$ Hệ thống giữ nguyên dạng văn bản thô để làm thủ công, không ép thành trắc nghiệm.
   * *Nếu chọn Luồng B (DOCX chỉ có nội dung thô)*: AI đọc tài liệu bài giảng và sinh 10 câu hỏi trắc nghiệm mới $\rightarrow$ Hệ thống đánh dấu nhãn `[Nội dung do AI biên soạn]`.
3. **Kiểm tra WYSIWYG & Giao bài**:
   * Giáo viên xem trước màn hình mô phỏng 100% giao diện học sinh.
   * Chỉnh sửa câu chữ, duyệt các đáp án AI suy luận.
   * Cấu hình hạn nộp và bấm `[Xuất bản bài tập]`.

---

## JOURNEY 6: HÀNH TRÌNH LỚP HỌC, CHẤM BÀI & RỜI LỚP (CLASSROOM & REVOCATION)

```mermaid
sequenceDiagram
    autonumber
    actor T as Teacher
    actor S as Student
    participant Cls as Không gian Lớp học
    participant Profile as Hồ sơ CEFR của Student

    T->>Cls: Giao bài tập Writing (Hạn: 23:59)
    S->>Cls: Nhận thông báo in-app có link dẫn thẳng vào đề
    S->>Cls: Viết dở 100 từ -> Thoát app (Tự động lưu nháp)
    S->>Cls: Mở lại app -> Bấm "Tiếp tục bài dở" -> Viết xong 200 từ -> Bấm Nộp
    Cls-->>S: Trạng thái: "Đã nộp bài thành công"

    Note over T, Cls: GIÁO VIÊN CHẤM BÀI & THAY ĐỔI ĐIỂM
    Cls->>T: Mở bài nộp kèm Bản chấm nháp của AI (AI Pre-grade)
    T->>T: Giáo viên xem xét, sửa điểm và viết nhận xét riêng
    T->>Cls: Bấm RETURN trả bài cho học sinh
    Cls-->>S: Thông báo: "Thầy/Cô đã trả bài kèm nhận xét"
    opt Giáo viên chấm lại / phúc khảo
        T->>Cls: Chỉnh sửa điểm từ 7.0 lên 7.5
        Cls-->>S: Thông báo: "Điểm bài tập của bạn đã được cập nhật thành 7.5"
    end
    Cls->>Profile: Đồng bộ điểm bài lớp làm nguồn tham chiếu năng lực

    Note over S, Cls: HỌC SINH RỜI LỚP (LEAVE CLASS EVENT)
    S->>Cls: Học sinh bấm Rời lớp (hoặc Giáo viên xóa khỏi lớp)
    Cls->>S: THU HỒI TOÀN BỘ QUYỀN TRUY CẬP vào bài tập và lịch sử của lớp
    Note over S, T: Dữ liệu bài nộp cũ lưu lại trong sổ điểm của lớp để giữ tính toàn vẹn,<br/>nhưng Student và Teacher không còn quyền xem thông tin của nhau.
```

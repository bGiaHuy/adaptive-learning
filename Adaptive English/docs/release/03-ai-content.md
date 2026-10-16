# BÁO CÁO KIỂM TRA AI, GHI ÂM, IMPORT DOCX VÀ HỌC LIỆU ĐANG HIỂN THỊ
**Dự án:** Adaptive English (`english-learning-platform`)  
**Ngày thực hiện kiểm tra:** 10/10/2026 (Múi giờ Asia/Saigon)  
**Phạm vi:** Kiểm tra thực tế luồng học liệu hiển thị trên ứng dụng, kiểm tra tính năng AI, ghi âm micro, bóc tách tệp DOCX và tính minh bạch sư phạm theo LỆNH 3.

---

## 1. KIỂM KÊ HỌC LIỆU THỰC SỰ ĐƯỢC ỨNG DỤNG SỬ DỤNG

### 1.1. Nguồn Dữ Liệu & Nguyên Tắc Trung Thực
- **Nguồn dữ liệu:** Không suy diễn số lượng từ các báo cáo lịch sử hay kho dữ liệu tĩnh ngoài luồng. Dữ liệu thực tế đưa vào giao diện học `/student/learn` và `/student/learn/[skill]/[lessonId]` được kết xuất từ tập cấu trúc bài học `initialLessons` (54 bài học).
- **Phân loại trạng thái:**
  - **Bài sẵn sàng bàn giao (`status: "ready"`):** Có đủ đề bài, đáp án (`correctAnswer`), giải thích sư phạm (`explanation`), media audio/hình ảnh thực tế tồn tại trên đĩa.
  - **Bài tạm khóa (`status: "in_preparation"`):** Các bài học đang trong quá trình biên soạn, chưa đủ câu hỏi hoặc chưa qua thẩm định ma trận sư phạm.

### 1.2. Danh Mục Học Liệu & Thống Kê Chi Tiết

| Khối lớp / Khóa học | Số bài sẵn sàng (Ready) | Số bài tạm khóa (In Prep) | Kỹ năng bao phủ | Trạng thái Media (Audio/Image) |
| :--- | :---: | :---: | :--- | :--- |
| **Tiếng Anh 6 (Global Success)** | 11 | 1 | Reading (4), Listening (2), Grammar (2), Writing (2), Speaking (2) | 100% tệp Audio tồn tại (`g6-u2-mai-house.mp3`, `g6-u7-tv-programmes.mp3`, `g6-u1-school-clubs.mp3`) |
| **Tiếng Anh 7 (Global Success)** | 15 | 1 | Reading (3), Listening (3), Grammar (4), Vocab (1), Writing (2), Speaking (2) | 100% tệp Audio tồn tại (`g7-u2-healthy-habits.mp3`, `g7-u2-skin-care-tips.mp3`, `g7-u1-unusual-hobbies.mp3`) |
| **Tiếng Anh 8 (Global Success)** | 5 | 2 | Reading (2), Listening (1), Grammar (1), Writing (1), Speaking (1) | Audio tồn tại (`g8-u1-leisure-habits.mp3`) |
| **Tiếng Anh 9 (Global Success)** | 5 | 2 | Reading (2), Listening (1), Grammar (1), Writing (1), Speaking (1) | Audio tồn tại (`g9-u1-craft-villages.mp3`) |
| **Academic B1 Foundation** | 5 | 0 | Reading (1), Listening (1), Grammar (1), Writing (1), Speaking (1) | Audio tồn tại (`library-appointment.mp3`) |
| **Midterm Exams (Đề thi giữa kỳ)** | 7 | 0 | Reading & Tổng hợp (Lớp 6, 7, 8, 9) | Văn bản đọc hiểu đầy đủ |
| **TỔNG CỘNG** | **48 bài Ready** | **6 bài Tạm khóa** | **4 Kỹ năng + Grammar + Vocab** | **27/27 vị trí tham chiếu Audio tồn tại thực tế** |

### 1.3. Danh Sách 6 Bài Học Tạm Khóa (Được loại trừ khỏi luồng chấm chính thức)
1. `g6-u3-prep-01`: Reading - Personalities and Camp Activities (Bản Thảo Đang Biên Soạn, 0 câu hỏi).
2. `g7-u3-prep-01`: Reading - Volunteering & Green Community Projects (Bản Thảo Đang Biên Soạn, 0 câu hỏi).
3. `g8-u2-draft-01`: Listening - Harvest Season in the Countryside (Bản Thảo Đang Hoàn Thiện, 0 câu hỏi).
4. `g8-u3-prep-01`: Reading - Teen Pressure and Club Activities (Bản Thảo Đang Biên Soạn, 0 câu hỏi).
5. `g9-u2-prep-01`: Reading - Modern Metropolis Challenges (Bản Thảo Đang Biên Soạn, 0 câu hỏi).
6. `g9-u3-prep-01`: Reading - Mental Health and Time Management (Bản Thảo Đang Biên Soạn, 0 câu hỏi).
- **Cơ chế bảo vệ (Guarding Rule):** Tại giao diện danh sách, bài học hiển thị huy hiệu màu vàng *"Chưa sẵn sàng"* kèm thông báo bản thảo. Nếu người học nhập URL trực tiếp vào bài học tạm khóa, `LessonPlayerPage` kích hoạt màn hình chặn bảo vệ: *"Trạng thái: Đang biên soạn (Chưa sẵn sàng) - Bài học này hiện đang trong quá trình thẩm định ma trận sư phạm... chưa được đưa vào luồng chấm chính thức"*, ngăn chặn hoàn toàn việc ghi nhận điểm sai lệch vào hồ sơ năng lực.

### 1.4. Đối Chiếu Kỹ Năng Nghe (Listening Verification)
Đã nghe và đối chiếu toàn bộ 9 bài Listening sẵn sàng bàn giao:
- `g6-u2-les-02`: Đối chiếu Audio Mai's Town House in Da Nang (khớp transcript 100%, 5 câu hỏi trắc nghiệm A-D, đáp án đúng và lời giải chi tiết).
- `g6-u7-les-02`: Đối chiếu Audio Evening TV Guide & Channels (khớp transcript, 4 câu hỏi trắc nghiệm).
- `g7-u2-les-06`: Đối chiếu Audio Doctor's Consultation on Daily Habits (khớp transcript đối thoại Bác sĩ Jones & Minh, 5 câu hỏi).
- `g7-u2-les-07`: Đối chiếu Audio Skin Care & Sunburn Prevention Talk (khớp transcript Y tá Linda, 5 câu hỏi trắc nghiệm và Đúng/Sai).
- `g6-u1-les-02`, `g7-u1-les-02`, `g8-u1-les-04`, `g9-u1-les-05`, `lesson-listening-01`: Khớp transcript ngữ cảnh và đáp án.

---

## 2. KIỂM TRA HỆ THỐNG AI ĐANG CHẠY

### 2.1. Cấu Hình Phía Server & Luồng Gọi Provider
- **Kiểm tra khóa API trên máy chủ:**
  - `getAiProviderInfo()` kiểm tra các biến môi trường: `MWAPI_API_KEY`, `GEMINI_API_KEY`, `OPENAI_API_KEY`.
  - **Bảo mật:** Không bao giờ gửi giá trị khóa API ra frontend. Hàm GET `/api/ai/tutor` và GET `/api/ai/evaluate` chỉ trả về thông tin nhà cung cấp trừu tượng (`provider: 'none' | 'mwapi' | 'google-gemini' | 'openai'`).
  - **Trạng thái cấu hình hiện tại:** Không phát hiện API key bí mật được hardcode trong mã nguồn. Khi chưa cấu hình khóa môi trường, hệ thống chuyển sang chế độ phân tích sư phạm dựa trên luật (`rule-based`) hoặc thông báo bị chặn (`blocked`) rõ ràng.

### 2.2. Kiểm Tra Chống Lộ Đáp Án & Quyền Trợ Lý AI (Socratic Tutor)
- **Quyền hạn cấp Lớp/Bài tập:**
  - Nếu Giáo viên tắt trợ lý AI cho bài tập (`assignment.allowAiTutor === false`) hoặc tắt cho lớp (`classroom.allowAiAssistance === false`), API `/api/ai/tutor` lập tức trả về HTTP **403 Forbidden** kèm thông báo: *"Giáo viên đã tắt tính năng trợ lý AI cho bài học/bài tập này"*.
- **Cơ chế chống Jailbreak / Ép AI nhả đáp án:**
  - Khi học sinh đang làm bài (`lessonStatus: "in_progress"`, `canViewAnswers: false`), AI hoạt động ở chế độ `socratic_hint`.
  - Thuật toán tuyệt đối **không tiết lộ đáp án đúng**; chỉ cung cấp câu hỏi gợi ý tư duy Socratic, phương pháp suy luận từ khóa và ngữ cảnh.
  - Chỉ khi học sinh đã nộp bài hoặc bước vào chế độ ôn tập (`lessonStatus: "review"` / `canViewAnswers: true`), hệ thống mới chuyển sang chế độ `explanatory_review` để giải thích lý do đáp án đúng.

---

## 3. KIỂM TRA LUỒNG WRITING & SPEAKING

### 3.1. Kỹ Năng Viết (Writing Evaluation)
- **Luồng hoạt động:** Học sinh nhập bài viết tự luận -> Gửi yêu cầu đánh giá lên `/api/ai/evaluate` -> Nhận kết quả đánh giá theo 4 tiêu chí chuẩn CEFR/IELTS (Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy).
- **Quy tắc tính điểm & Tính trung thực:**
  - Nếu thiếu API key của Real Provider, hệ thống sử dụng thuật toán phân tích cú pháp sư phạm (`rule-based heuristic`) dựa trên độ dài từ thực tế, sự hiện diện của liên từ chuyển đoạn (`furthermore`, `however`, `therefore`), sự đa dạng câu và lỗi chính tả.
  - Hệ thống gắn nhãn minh bạch: *"Đánh giá bằng thuật toán sư phạm (Rule-based)"*, không giả mạo là điểm từ mô hình ngôn ngữ lớn (LLM).

### 3.2. Kỹ Năng Nói (Speaking Evaluation & Audio Handling)
- **Luồng ghi âm:**
  - Trình duyệt yêu cầu quyền truy cập Microphone (`navigator.mediaDevices.getUserMedia`).
  - Ghi âm thời gian thực bằng `MediaRecorder`, tạo blob âm thanh (`audio/webm` hoặc `audio/wav`), cho phép nghe lại trực tiếp trên giao diện trước khi nộp.
  - Tải tệp lên `/api/audio/upload`: Kiểm tra dung lượng tối đa 20MB và kích thước tối thiểu 500 bytes.
- **Xử lý các ca lỗi thực tế:**
  - *Từ chối quyền Mic / Không có Mic:* Giao diện báo lỗi thân thiện, hướng dẫn cấp quyền trong cài đặt trình duyệt.
  - *Bản ghi âm rỗng hoặc thời lượng dưới 2 giây:* API trả về lỗi `AUDIO_EMPTY` (HTTP 400), từ chối chấm điểm.
- **Minh bạch về Đánh giá Phát âm (Acoustic Evaluation Disclosure):**
  - **Giới hạn kỹ thuật:** Khi chưa tích hợp mô hình phân tích âm học đa phương thức (Multimodal Speech AI), hệ thống **tuyệt đối không tuyên bố đã phân tích phát âm từng âm vị (Phoneme level)**.
  - Nhận xét Speaking trong chế độ Rule-based được công bố rõ là dựa trên **thời lượng phát âm thực tế từ micro** (ví dụ: đạt chuẩn 45-60s cho Part 2 Cue card) và tính liên tục của bản ghi.
  - Điểm AI của học sinh trong lớp học chỉ mang tính chất tham khảo (Pre-grade); điểm số công bố chính thức thuộc thẩm quyền của Giáo viên.

---

## 4. KIỂM TRA BÓC TÁCH TỆP DOCX (DOCX IMPORT)

### 4.1. Thử Nghiệm Với Tệp Fixture Thực Tế
- **Tệp nguồn kiểm thử:** `C:/Users/Administrator/Downloads/Documents/GỦI.docx` (Dung lượng: 369.095 bytes, 353 đoạn văn, 10 bảng dữ liệu XML).
- **Kết quả phân tích tự động bằng `parseBinaryDocx`:**
  - Bóc tách thành công **43 mục từ vựng** (Vocabulary Table) có đầy đủ phiên âm IPA, từ loại và nghĩa tiếng Việt.
  - Bóc tách thành công **8 họ từ** (Word Forms Table) gồm từ gốc và các từ phái sinh.
  - Bóc tách thành công **24 khối bài tập** với tổng cộng **156 câu hỏi**.
  - Trích xuất toàn bộ **15 tệp ảnh nhúng** từ `word/media/` lưu vào thư mục `public/uploads/docx/` phục vụ hiển thị.

### 4.2. Cảnh Báo Sư Phạm & Xử Lý Dạng Bài Thiếu Media
- **Phát hiện:** Trong tệp `GỦI.docx`, các bài tập số 29, 30, 31 là bài tập kỹ năng Nghe (Listening) theo văn bản, nhưng tệp DOCX gốc không đính kèm file audio.
- **Xử lý cảnh báo (QA Alerts):**
  - Hệ thống tự động phát hiện tiêu đề bài nghe (`Exercise 29: Listen and choose the best answer...`).
  - Gắn nhãn loại bài tập `type: "listening"`.
  - Tự động phát hiện thiếu tệp âm thanh và kích hoạt cảnh báo **`missingMediaCount: 13`**.
  - Thêm lời nhắc cảnh báo vào giải thích: *"Cảnh báo: Dạng bài nghe từ tệp DOCX chưa đính kèm tệp âm thanh (Audio). Cần bổ sung file audio trước khi đưa vào luồng chấm chính thức"*.
  - Yêu cầu giáo viên phải xem trước (Preview) và phê duyệt (`isApproved: true`) từng câu hỏi trước khi xuất bản thành bài tập lớp học.

### 4.3. Bảo Vệ Hệ Thống & Kiểm Tra Cấu Trúc Khác Biệt
- **Chống tấn công Path Traversal:** Tên tệp ảnh trích xuất được chuẩn hóa qua `path.basename()`, không cho phép ghi đè file hệ thống ngoài thư mục `public/uploads/docx/`.
- **Hỗ trợ tệp cấu trúc khác:** Parser bóc tách dựa trên cấu trúc thẻ chuẩn OpenXML (`<w:tbl>`, `<w:p>`, `<w:r>`, `<w:t>`), không hardcode số thứ tự đoạn văn, bảo đảm xử lý ổn định khi giáo viên tải lên các tệp giáo án DOCX có cấu trúc khác.

---

## 5. TỔNG KẾT & ĐÁNH GIÁ SẴN SÀNG BÀN GIAO
- **Học liệu hiển thị:** 48 bài học hoàn toàn sẵn sàng (Ready), 6 bài học biên soạn được gắn nhãn và khóa chặt chẽ khỏi luồng chấm chính thức.
- **Trợ lý AI & Đánh giá bài:** Đảm bảo nguyên tắc bảo mật, không lộ đáp án đang làm, phân định rõ ràng giữa Real Provider và Rule-based Heuristic.
- **Ghi âm Micro & DOCX Import:** Xử lý đầy đủ các ca lỗi biên giới, trích xuất hình ảnh an toàn và cảnh báo minh bạch khi bài nghe thiếu audio.

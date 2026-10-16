# 19 - End-to-End User Journeys

## Goal
Minh họa 5 kịch bản hành trình người dùng hoàn chỉnh (End-to-End User Journeys) từ đầu đến cuối nhằm kiểm tra tính nhất quán của các luồng nghiệp vụ, chứng minh sự phối hợp giữa hai không gian Lớp học và Tự học, và làm rõ giá trị thực tế của vòng lặp thích ứng.

---

## Journey 1: Người Mới Gia Nhập (New Learner Onboarding & Disruption-Proof Flow)

### Nhân vật: Nam (Người mới tải app, muốn cải thiện tiếng Anh tự nhiên)
1. **Khảo sát mục tiêu tùy chọn & Chế độ xem trước (Optional Goal & Preview)**:
   * Mở app lần đầu sau đăng ký, Nam thấy câu hỏi: *"Mục tiêu của bạn là gì?"*. Nam bấm nút `[Bỏ qua (Skip)]`.
   * Thấy thông báo bài test đầu vào, Nam chưa muốn làm ngay mà bấm `[Xem trước ứng dụng (Preview Mode)]`.
   * Nam được lướt qua 4 tab (`Học`, `Ôn từ`, `Lớp học`, `Tiến độ`) ở chế độ chỉ đọc. Khi bấm vào bài học, app hiện banner: *"Hoàn thành bài kiểm tra 8–12 phút để mở khóa lộ trình học"*.
2. **Làm bài Adaptive Placement Test có lưu từng phần (Per-Section Persistence)**:
   * Nam bắt đầu làm:
     * *Phần 1 (Từ vựng & Ngữ pháp - 5 câu)*: Nam làm xong, hệ thống lưu kết quả vĩnh viễn vào đám mây.
     * *Phần 2 (Reading)*: Đang đọc đoạn văn 150 từ thì điện thoại hết pin đột ngột.
   * **Xử lý gián đoạn (Disruption Handling)**: 1 tiếng sau cắm sạc mở lại app, màn hình hiện Dialog: *"Bạn đang làm dở bài kiểm tra. Tiếp tục phần Đọc hiểu nhé?"*. Nam bấm `[Tiếp tục]` và vào thẳng câu hỏi Reading đang làm dở mà không phải làm lại Phần 1.
   * *Phần 3 (Listening)*: Nghe đoạn audio 35 giây, trả lời đúng 2 câu chi tiết.
   * *Phần 4 (Writing)*: Gõ 2 câu theo prompt tình huống.
   * *Phần 5 (Speaking - Quyền Mic)*: Đang ở quán cà phê ồn ào, Nam bấm `[Không thể ghi âm lúc này]`. Hệ thống ghi nhận Speaking là *"Chưa đánh giá"*, tuyệt đối không dùng điểm Writing suy diễn điểm Speaking.
3. **Màn hình kết quả độc lập (Independent Competency Result)**:
   * Không hiển thị 1 điểm tổng cào bằng. Màn hình báo:
     * *Reading: Bắt đầu ở bài đọc cơ bản (Điểm mạnh: Tìm chi tiết; Cần luyện: Ý chính)*.
     * *Listening: Tốc độ vừa phải*.
     * *Writing: Cấu trúc câu ghép cơ bản*.
     * *Speaking: Chưa đánh giá (Sẽ bổ sung khi có ghi âm)*.
   * Thông điệp: *"Hệ thống đã chọn điểm bắt đầu cho bạn. Mức này sẽ tự động điều chỉnh khi bạn học."*.
4. **Bắt đầu bài học đầu tiên (First Learning Action)**:
   * Trang chủ hiện Hero Action: `[Bắt đầu bài Đọc hiểu đầu tiên - 8 phút]`.
   * Nam bấm vào làm bài, hoàn thành trong 6 phút. Màn hình ăn mừng Streak ngày 1 xuất hiện.

---

## Journey 2: Người Học Quay Lại & Vòng Lặp Sửa Sai (Returning Learner & Hint Loop)

### Nhân vật: Nam (Sau 10 ngày sử dụng ứng dụng)
1. **Trang chủ & Ưu tiên hành động (Home Hierarchy)**:
   * Mở app, Nam thấy Hero Action: *“Bài học đề xuất: Luyện nghe hội thoại đời sống (8 phút)”*.
   * Secondary Card phía dưới báo: *“Ôn từ vựng: Bạn có 12 thẻ đến hạn hôm nay”*.
2. **Ôn thẻ flashcard kiểu Anki (Active Recall)**:
   * Nam quyết định giải quyết thẻ từ trước. Bấm vào thẻ Ôn từ.
   * Mặt trước hiện: *“Climate change is an ________ threat.”*.
   * Nam bắt buộc tự nhẩm trong đầu từ *“inevitable”* rồi mới bấm lật thẻ.
   * Mặt sau hiện nghĩa: *Không thể tránh khỏi*. Nam thấy mình nhớ chuẩn nên bấm nút `[TỐT]`.
   * Hoàn thành 12 thẻ trong 4 phút. Thẻ được giãn lịch ôn tiếp theo (7–14 ngày).
3. **Tự chọn kỹ năng & Vòng lặp Feedback 4 bước (Hint-Explain-Clone Loop)**:
   * Nam sang tab `HỌC`, không bấm bài đề xuất mà tự chọn `[Listening]` $\rightarrow$ Chủ đề *Travel & Transport*.
   * Hệ thống chọn bài nghe đặt vé tàu phù hợp với mức nghe hiện tại.
   * Gặp câu hỏi bẫy về giờ khởi hành: Nam nghe nhầm và chọn sai đáp án A $\rightarrow$ App rung nhẹ, **không hiện đáp án đúng ngay**.
   * Nút `[Xem Gợi Ý (Hint)]` sáng lên. Nam bấm xem: *"Gợi ý: Người nói ban đầu định đi chuyến 8:15 nhưng đã đổi sang chuyến muộn hơn 30 phút vì kẹt xe. Nghe lại đoạn 0:22!"*.
   * Nam nghe lại đoạn 0:22 và tự chọn lại đáp án đúng (8:45).
   * Hệ thống ghi nhận: *Đúng sau khi xem gợi ý* (tính là ôn tập, không vội tăng độ khó của kỹ năng Nghe).
   * Cuối bài, hệ thống tạo thêm 1 câu hỏi tương tự (Remedial Clone) về mốc thời gian để Nam củng cố phản xạ.

---

## Journey 3: Bài Tập Lớp Học, Lưu Nháp & Phản Hồi (Classroom Homework & Autosave)

### Nhân vật: Cô Mai (Giáo viên) và Học sinh Nam
1. **Giao bài & Nhận thông báo**:
   * Cô Mai giao bài: *“Writing: Describe a memorable journey (200 words)”*. Hạn nộp: 23:59 hôm nay.
   * Trang chủ của Nam hiển thị thẻ bài tập lớp có nhãn đỏ: *Còn 6 tiếng*.
2. **Làm dở & Lưu nháp tự động (Autosaved Draft)**:
   * Nam mở bài tập, gõ được 110 từ thì phải đi ăn tối.
   * Nam bấm nút `[X]` góc trên. Giao diện báo: *“Bản nháp 110 từ đã được lưu tự động trên hệ thống”*.
3. **Quay lại và nộp bài**:
   * Nam mở lại app. Nút Hero Action tại Trang chủ ưu tiên hiển thị ngay: **“Tiếp tục bài viết: Describe a memorable journey (Còn 90 từ)”**.
   * Bấm 1 chạm vào thẳng vị trí con trỏ đang viết dở. Nam viết nốt phần kết bài.
   * Nam dùng nút `AI Tutor` bên mép màn hình để hỏi từ đồng nghĩa. Giao diện báo rõ: *"Chế độ bài tập lớp: AI chỉ gợi ý từ vựng và ngữ pháp, không viết hộ câu"*.
   * Nam hoàn thành 205 từ và bấm `[Nộp bài]`. Trạng thái chuyển thành `Đã nộp đúng hạn`.
4. **Cô Mai chấm & Chuyển hóa lỗi thành bài ôn (Feedback to Practice)**:
   * Cô Mai chấm bài, khen ý tưởng và gạch chân lỗi lặp từ *"interesting"* 5 lần; gợi ý dùng *"fascinating, captivating"*.
   * Khi Nam mở xem bài chấm, ngay bên dưới có 2 nút hành động:
     * `[+ Thêm 'fascinating' và 'captivating' vào Tủ từ vựng Anki]` $\rightarrow$ Nam bấm xác nhận để đưa vào kho từ cá nhân.
     * `[Luyện bài vi mô: Tính từ miêu tả nâng cao (5 phút)]` $\rightarrow$ Chuyển sang bài tự học củng cố.
   * Thầy Nam xem kết quả, thêm lời động viên: *"Huy làm rất tốt, chú ý thêm mốc thời gian quá khứ trước quá khứ nhé!"* và bấm `[Return]`.
6. **Đóng vòng lặp về Self-Learning**:
   * Điểm bài tập được ghi nhận vào sổ điểm của Lớp B1-03.
   * **Đồng thời**: Lỗi Quá khứ hoàn thành được đồng bộ sang Profile tự học của Huy.
   * Ngày hôm sau, mục Grammar trong Self-Learning tự động gợi ý chuyên đề: *Past Perfect Deep Dive*.

---

## Journey 4: Giáo Viên Dùng AI Copilot Can Thiệp Điểm Yếu Của Lớp (Teacher AI Copilot Intervention)

### Nhân vật: Cô Linh (Giáo viên phụ trách Lớp IELTS B2-01, 22 học sinh)
1. **Kiểm tra báo cáo tuần (Weekly Class Diagnostics)**:
   * Cô Linh mở Dashboard của Lớp B2-01 vào sáng Thứ Hai.
   * Widget Class Weakness hiển thị:
     * *Articles (Definite/Zero): 44% học sinh trong lớp làm sai.*
     * *Conditionals Type 2 & 3: 39% học sinh làm sai.*
     * *Academic Vocabulary (Topic Environment): 35% lỗi dùng sai ngữ cảnh.*
2. **Kích hoạt AI Copilot sinh bài can thiệp**:
   * Cô Linh bấm nút: `[Tạo bài tập can thiệp dựa trên lỗi của lớp tuần này]`.
   * AI Copilot phân tích dữ liệu lỗi của 22 học sinh và sinh bản thảo bài tập 15 câu (Trạng thái: `DRAFT`).
3. **Cô Linh thẩm định và biên tập (Teacher Review & Edit)**:
   * Cô Linh đọc lướt qua đề bài.
   * Ở câu 5, cô thấy câu văn hơi dài so với học sinh nên sửa lại câu chữ cho ngắn gọn.
   * Ở câu 11, cô bấm nút `[Regenerate]` để đổi sang một ngữ cảnh đời sống gần gũi hơn.
   * Cô bấm `[Save to My Question Bank]` để lưu lại 3 câu hỏi rất hay về mạo từ.
4. **Xuất bản bài tập (Publish & Assign)**:
   * Cô Linh đặt tên bài: *Chữa lỗi tuần 3 - Mạo từ & Câu điều kiện*, hẹn nộp vào tối Thứ Tư.
   * Cô bấm `[Publish]`.
5. **Học sinh hoàn thành**:
   * Toàn bộ 22 học sinh trong lớp nhận được bài tập nhắm trúng điểm yếu chung.
   * Đến Thứ Năm, tỉ lệ lỗi mạo từ của lớp giảm từ 44% xuống còn 18%.

---

## Journey 5: Quy Trình Viết Luận, AI Chấm Nháp & Tự Động Sinh Micro-Drill (Writing Formative Assessment)

### Nhân vật: Huy (Làm bài Writing Task 2 trong không gian Lớp học)
1. **Viết bài luận**:
   * Đề bài: *"Some people believe that university education should be free for all students. To what extent do you agree or disagree?"*
   * Huy viết bài 260 từ trực tiếp trên nền tảng và bấm `[Submit Essay]`.
2. **AI Pre-grading (Chấm nháp đa tiêu chí)**:
   * AI Evaluator quét bài viết và đưa ra bản phân tích nháp:
     * Task Response: 5.5 (Ý kiến rõ ràng nhưng phát triển ý ở thân bài 2 chưa sâu).
     * Coherence & Cohesion: 5.0 (Thiếu các từ nối chỉ quan hệ nhân quả; các câu bị rời rạc).
     * Lexical Resource: 5.0 (Lặp từ *"important"* 5 lần, lặp từ *"good"* 4 lần).
     * Grammatical Range & Accuracy: 4.5 (Thiếu mạo từ trước danh từ đếm được số ít; lỗi câu ghép không có liên từ).
     * Overall Band dự kiến: **5.0**.
3. **Giáo viên thẩm định (Teacher Final Review)**:
   * Thầy Nam mở bài chấm nháp của AI, đồng ý với nhận xét ngữ pháp và từ vựng, nhưng nâng điểm Task Response lên 6.0 vì thấy ví dụ của Huy sáng tạo. Điểm chốt: **5.5**.
   * Thầy Nam viết ghi chú: *"Bài viết có ý tưởng tốt, em cần học thêm các liên từ chỉ sự tương phản như However, On the other hand nhé!"*.
   * Thầy Nam bấm `[Return]`.
4. **Hệ thống tự động sinh hành động học tập (Converting Feedback to Action)**:
   * Huy mở thông báo, đọc toàn bộ bài chữa có đánh dấu lỗi màu sắc trực quan.
   * Ngay bên dưới bài chấm, hệ thống hiển thị khối **Recommended Actions For You**:
     * Action 1: `[Học 5 từ thay thế cho 'important': crucial, vital, essential]` $\rightarrow$ Bấm để nạp thẳng vào Kho từ.
     * Action 2: `[Luyện bài vi mô: Mạo từ trong câu học thuật (8 phút)]`.
     * Action 3: `[Bài học vi mô: Cohesive Devices for IELTS Writing (10 phút)]`.
5. **Huy bấm `[Rewrite Essay]`**:
   * Huy áp dụng các từ nối vừa học để viết lại bài luận lần 2 và nộp lại bản Draft 2 cho thầy.

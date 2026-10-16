# 20 - Open Questions & Decisions Catalog

Tài liệu này tổng hợp toàn bộ các vấn đề nghiệp vụ và kỹ thuật chưa được xác định rõ ràng (Underspecified Requirements) phát sinh trong quá trình phân tích Phase 0. 

**Nguyên tắc**: Nhóm phân tích KHÔNG tự ý quyết định các vấn đề này mà trình lên Product Manager / Ban dự án để phê duyệt chính thức.

---

## 1. Product Domain

### Q-001
**Question**: Khi học sinh vừa có bài tập lớp học sắp đến hạn trong 24h, vừa có 20 từ vựng SRS đến hạn ôn tập, thuật toán cân đối thời gian (Adaptive Balancer) nên ưu tiên thế nào trong Today's Plan?

**Why it matters**: Tránh gây quá tải thời gian học (Cognitive Overload) cho học sinh, đồng thời đảm bảo không làm đứt gãy chuỗi Spaced Repetition của trí nhớ.

**Possible options**:
* A. Ưu tiên 100% cho bài tập lớp học; hoãn toàn bộ từ vựng sang ngày hôm sau.
* B. Chia tỷ lệ thời gian: Dành 70% thời gian cho bài tập lớp học, 30% còn lại cho bài ôn từ vựng rút gọn (Micro-review 7 từ quan trọng nhất).
* C. Bắt buộc học sinh làm cả hai độc lập, không gộp vào chung một Today's Plan.

**Recommended option**: B. Chia tỷ lệ thời gian bảo đảm cả hai mục tiêu học tập.

**Decision**: PENDING

---

## 2. Student Domain

### Q-002
**Question**: Học sinh có được phép tự đặt lại (Reset) hoặc làm lại bài kiểm tra đầu vào (Placement Test) để tính lại Estimated IELTS không?

**Why it matters**: Nếu học sinh tự reset liên tục sẽ làm biến động dữ liệu lịch sử năng lực; nhưng nếu cấm hoàn toàn thì học sinh sau 3 tháng có thể muốn làm bài test tổng thể mới.

**Possible options**:
* A. Cho phép làm lại không giới hạn bất kỳ lúc nào.
* B. Khóa chức năng làm lại; chỉ cập nhật điểm thông qua quá trình học tập tích lũy tự nhiên.
* C. Giới hạn làm lại tối đa 1 lần mỗi 30 ngày (Diagnostic Retest).

**Recommended option**: C. Cho phép làm bài kiểm tra chẩn đoán định kỳ tối đa 1 lần mỗi 30 ngày.

**Decision**: PENDING

---

## 3. Teacher Domain

### Q-003
**Question**: Giáo viên có quyền tắt hoàn toàn AI Tutor trong lúc học sinh làm một bài tập cụ thể (Exam Simulation Mode) không?

**Why it matters**: Trong các bài kiểm tra 15 phút hoặc 1 tiết trên lớp, giáo viên muốn đo lường năng lực thực tế độc lập của học sinh mà không có bất kỳ sự trợ giúp nào từ AI.

**Possible options**:
* A. Luôn luôn bật AI Tutor trong mọi hoàn cảnh.
* B. Giáo viên có công tắc cấu hình `Disable AI Assistance` cho từng bài tập khi tạo đề.
* C. Chỉ cho phép dùng AI Tutor trong bài tự học, cấm hoàn toàn trong bài tập lớp học.

**Recommended option**: B. Giáo viên có quyền cấu hình bật/tắt AI Tutor linh hoạt cho từng bài tập.

**Decision**: PENDING

---

## 4. Admin Domain

### Q-004
**Question**: Admin hay Giáo viên là người có quyền phê duyệt một câu hỏi mới vào Ngân hàng câu hỏi dùng chung toàn hệ thống (Global Question Bank)?

**Why it matters**: Đảm bảo chất lượng học thuật và tính chính xác của đề thi trên toàn nền tảng, tránh câu hỏi lỗi hoặc đáp án sai lan truyền giữa các lớp.

**Possible options**:
* A. Bất kỳ giáo viên nào tạo câu hỏi cũng tự động đưa vào kho chung.
* B. Giáo viên lưu vào kho cá nhân; chỉ Admin hoặc Trưởng bộ môn mới có quyền duyệt đưa lên kho chung toàn trường/trung tâm.
* C. Không có kho chung, mỗi giáo viên chỉ có kho riêng độc lập.

**Recommended option**: B. Giáo viên có kho riêng; đưa lên kho chung phải qua Admin hoặc Tổ trưởng học thuật duyệt.

**Decision**: PENDING

---

## 5. IELTS Domain

### Q-005
**Question**: Thuật toán làm tròn điểm Estimated IELTS Overall nên áp dụng quy tắc làm tròn chính thức của IELTS (.25 làm tròn lên .5, .75 làm tròn lên 1.0) hay hiển thị điểm thập phân chi tiết (ví dụ: 5.35)?

**Why it matters**: Làm tròn theo chuẩn IELTS giúp học sinh quen thuộc với kỳ thi thực tế, nhưng điểm thập phân chi tiết giúp học sinh cảm nhận được tiến bộ vi mô hàng tuần (Micro-progress).

**Possible options**:
* A. Chỉ hiển thị theo chuẩn làm tròn IELTS chính thức (5.0, 5.5, 6.0, 6.5).
* B. Hiển thị cả hai: Điểm làm tròn IELTS chính thức ở ngoài + Điểm năng lực thực tế chi tiết bên trong (ví dụ: Estimated Band 5.5 [Raw index: 5.35]).
* C. Chỉ hiển thị điểm thập phân chi tiết.

**Recommended option**: B. Hiển thị song song cả điểm làm tròn chuẩn và chỉ số chi tiết.

**Decision**: PENDING

---

## 6. AI Domain

### Q-006
**Question**: Hạn ngạch (Token Quota) sử dụng AI Tutor cho học sinh nên được tính theo ngày hay theo tháng?

**Why it matters**: Kiểm soát chi phí hạ tầng API LLM tránh trường hợp một số ít học sinh lạm dụng gửi hàng trăm câu hỏi mỗi ngày.

**Possible options**:
* A. Không giới hạn (Unlimited).
* B. Giới hạn theo ngày (ví dụ: tối đa 30 lượt tương tác mỗi ngày, làm mới sau 00:00).
* C. Giới hạn theo gói học phí tháng.

**Recommended option**: B. Giới hạn mức trần theo ngày kết hợp cơ chế mở rộng khi làm bài tập lớp.

**Decision**: PENDING

---

## 7. Classroom Domain

### Q-007
**Question**: Bài tập nộp muộn (Late Submission) có bị tự động trừ điểm theo công thức bậc thang thời gian không, hay phụ thuộc hoàn toàn vào quyết định thủ công của giáo viên?

**Why it matters**: Tự động hóa giúp giáo viên giảm thao tác, nhưng quy định của các trường/trung tâm có thể khác nhau tùy chính sách kỷ luật.

**Possible options**:
* A. Hệ thống tự động trừ 10% mỗi 24h nộp muộn.
* B. Hệ thống chỉ gắn nhãn cờ `LATE`; giáo viên toàn quyền quyết định điểm số khi chấm.
* C. Khóa hoàn toàn, không cho nộp khi đã quá hạn dù chỉ 1 phút.

**Recommended option**: B. Gắn cờ cảnh báo `LATE` và cho phép giáo viên tùy chọn chính sách khi tạo bài.

**Decision**: PENDING

---

## 8. Self Learning Domain

### Q-008
**Question**: Khi học sinh chọn chế độ tự do (Student Selected Learning) và chỉ luyện 1 kỹ năng duy nhất trong 2 tuần liên tiếp, hệ thống nên can thiệp như thế nào?

**Why it matters**: Tránh tình trạng lệch kỹ năng nghiêm trọng (ví dụ: Đọc 7.0 nhưng Viết chỉ 4.0).

**Possible options**:
* A. Khóa kỹ năng đó, bắt buộc học kỹ năng khác mới mở lại.
* B. Không can thiệp, tôn trọng sở thích tự do của học sinh.
* C. Giữ quyền tự chọn nhưng hiển thị thẻ cảnh báo "Kỹ năng mất cân bằng" và tăng điểm thưởng động lực (XP/Streak) cho các kỹ năng bị bỏ quên.

**Recommended option**: C. Cảnh báo mất cân bằng và kích thích động lực bằng điểm thưởng.

**Decision**: PENDING

---

## 9. Content Domain

### Q-009
**Question**: Bộ từ vựng Personal Vocabulary Bank có cho phép học sinh tự nhập từ vựng thủ công cùng nghĩa tiếng Việt cá nhân không?

**Why it matters**: Nếu học sinh tự nhập nghĩa sai ngữ cảnh hoặc phiên âm sai sẽ làm giảm chất lượng dữ liệu của hệ sinh thái; nhưng tính năng này giúp học sinh học từ vựng ngoài đời thực.

**Possible options**:
* A. Chỉ cho phép thêm từ có sẵn trong từ điển chuẩn của hệ thống (Master Dictionary).
* B. Cho phép gõ từ tự do; nếu từ có trong từ điển thì tự điền nghĩa chuẩn, nếu không có thì gửi yêu cầu AI xác thực nghĩa trước khi lưu.
* C. Cho phép nhập hoàn toàn tự do không qua kiểm tra.

**Recommended option**: B. Tự động kiểm tra chéo với Master Dictionary hoặc AI Validator trước khi lưu vào kho cá nhân.

**Decision**: PENDING

---

## 10. Assessment Domain

### Q-010
**Question**: Khi giáo viên sửa lại điểm Writing do AI chấm nháp (ví dụ AI chấm 5.0 nhưng giáo viên chấm 6.0), hệ thống nên lấy điểm nào để cập nhật vào Learning Profile của học sinh?

**Why it matters**: Quyết định thẩm quyền cao nhất giữa Trí tuệ nhân tạo và Chuyên môn sư phạm của con người.

**Possible options**:
* A. Lấy điểm của AI để đảm bảo tính khách quan toán học.
* B. Lấy 100% điểm của Giáo viên vì giáo viên là người chịu trách nhiệm học thuật cao nhất.
* C. Lấy điểm trung bình cộng giữa AI và Giáo viên.

**Recommended option**: B. Điểm của Giáo viên (Human-in-the-loop) là kết quả chính thức cuối cùng.

**Decision**: PENDING

---

## 11. Permissions Domain

### Q-011
**Question**: Phụ huynh học sinh (Parent Role) có cần được thiết kế như một Role độc lập trong hệ thống ở các giai đoạn sau không?

**Why it matters**: Thị trường học tiếng Anh K-12 đòi hỏi phụ huynh theo dõi tiến độ và nhận báo cáo tuần của con em mình.

**Possible options**:
* A. Không đưa vào phạm vi sản phẩm (Chỉ tập trung Student - Teacher - Admin).
* B. Thiết kế Role Parent chỉ có quyền Read-Only (Xem báo cáo chuyên cần và điểm số).
* C. Gửi báo cáo định kỳ qua Email/Zalo mà không cần tạo tài khoản riêng cho phụ huynh.

**Recommended option**: C. Gửi báo cáo tuần qua email/tin nhắn trước; xem xét tạo Role riêng ở Phase V4/V5.

**Decision**: PENDING

---

## 12. Sáu Điểm Mù Chiến Lược Cần Quyết Định Trước Khi Vẽ Wireframe (Strategic Blind Spots)

### Q-012 (Thang Đo Hiển Thị Năng Lực: CEFR vs Thang Điểm Nội Bộ)
**Question**: Nên sử dụng chuẩn CEFR (A1, A2, B1, B2, C1) hay thang điểm nội bộ (Elo / Điểm số riêng) để hiển thị năng lực học sinh ra bên ngoài giao diện?

**Why it matters**: Ảnh hưởng trực tiếp đến nhận thức của người học về trình độ của mình; CEFR là chuẩn phổ quát quốc tế về tiếng Anh tổng quát với mô tả năng lực rõ ràng, nhưng việc gán mốc CEFR cần căn cứ xác thực khoa học.

**Possible options**:
* A. Hiển thị thuần túy điểm số nội bộ (ví dụ: Elo 1200 - 1800).
* B. Hiển thị chuẩn CEFR (A1 - C1) kèm mô tả năng lực đạt được; giữ điểm số chi tiết bên trong để thuật toán tính toán.
* C. Hiển thị theo thang cấp độ Level 1 - Level 10 của riêng ứng dụng (gamified levels).

**Recommended option**: B. Hiển thị chuẩn CEFR ra ngoài giao diện kèm thẻ mô tả năng lực; lưu trữ chỉ số kỹ thuật chi tiết bên trong hệ thống.

**Decision**: PENDING

---

### Q-013 (Danh Mục Dạng Câu Hỏi Hỗ Trợ & Giới Hạn Parser DOCX)
**Question**: Danh sách các dạng câu hỏi nào bắt buộc phải được hỗ trợ đầy đủ trong hệ thống làm bài và trình nhập liệu DOCX ở giai đoạn đầu?

**Why it matters**: Nếu giáo viên tải lên file DOCX có dạng bài không hỗ trợ mà hệ thống tự động ép thành trắc nghiệm sẽ phá hỏng ý đồ sư phạm của đề thi.

**Possible options**:
* A. Chỉ hỗ trợ duy nhất Trắc nghiệm 4 lựa chọn (Multiple Choice 1 out of 4).
* B. Hỗ trợ 4 dạng cốt lõi: Trắc nghiệm 1 đáp án, Trắc nghiệm nhiều đáp án, Điền từ vào chỗ trống (Fill in blank/Cloze), và Tự luận ngắn (Short answer/Essay). Các dạng kéo thả/nối cột phức tạp sẽ gắn nhãn "Chưa hỗ trợ - Giữ nguyên text để làm thủ công".
* C. Cố gắng hỗ trợ toàn bộ các dạng bài phức tạp (Kéo thả, Nối cột, Đánh dấu bản đồ).

**Recommended option**: B. Khóa chặt 4 dạng cốt lõi phổ biến nhất; các dạng khác phải báo rõ ràng để giáo viên kiểm soát.

**Decision**: PENDING

---

### Q-014 (Quyền AI, Xem Đáp Án & Nộp Lại Trong Bài Tập Lớp)
**Question**: Khi học sinh làm bài tập lớp học, khi nào được xem đáp án giải thích và giáo viên có cho phép nộp lại (Resubmission) để cải thiện điểm không?

**Why it matters**: Tránh tình trạng học sinh nộp bừa để mở khóa toàn bộ đáp án rồi nộp lại lần 2 lấy điểm tối đa.

**Possible options**:
* A. Nộp bài xong là mở ngay toàn bộ đáp án và lời giải chi tiết.
* B. "Đã nộp bài" tách biệt hoàn toàn với "Được xem đáp án": Chỉ mở đáp án khi giáo viên công bố kết quả chung cho cả lớp; nếu cho phép nộp lại lần 2 thì lần 1 chỉ báo câu sai kèm gợi ý, không mở đáp án.
* C. Không bao giờ hiển thị đáp án, chỉ hiển thị tổng điểm.

**Recommended option**: B. Tách biệt trạng thái đã nộp và trạng thái được xem đáp án; phụ thuộc cấu hình bài tập của giáo viên.

**Decision**: PENDING

---

### Q-015 (Rubric Chấm Writing/Speaking & Xử Lý Tranh Chấp AI)
**Question**: Quy trình xử lý thế nào khi AI chấm bài tự luận (Writing/Speaking) có độ tin cậy thấp hoặc học sinh không đồng tình với điểm số/nhận xét của AI?

**Why it matters**: Tránh cảm giác bất công và mất niềm tin vào hệ thống học tập thích ứng khi mô hình ngôn ngữ đánh giá sai lệch.

**Possible options**:
* A. Điểm AI là tuyệt đối, không có quyền khiếu nại trong bài tự học.
* B. Trong bài tự học: Cung cấp nút `[Yêu cầu AI đánh giá lại]` kèm nêu lý do hoặc gắn cờ `[Nhận xét không chính xác]`; Trong bài lớp: Giáo viên luôn là trọng tài tối cao giải quyết khiếu nại.
* C. Luôn chuyển các bài tự luận có khiếu nại sang người thật chấm thủ công.

**Recommended option**: B. Cho phép phản hồi đánh giá sơ bộ trong tự học và giáo viên giữ vai trò trọng tài cuối cùng trong lớp học.

**Decision**: PENDING

---

### Q-016 (Phạm Vi Quyền Xem Dữ Liệu Của Giáo Viên)
**Question**: Giáo viên có quyền xem toàn bộ lịch sử tự học, số từ vựng cá nhân và tiến độ học ngoài giờ của học sinh trong lớp hay chỉ được xem kết quả bài tập do mình giao?

**Why it matters**: Đảm bảo quyền riêng tư cá nhân của người học nhưng đồng thời cung cấp đủ dữ liệu để giáo viên nắm bắt toàn diện năng lực học sinh.

**Possible options**:
* A. Giáo viên chỉ nhìn thấy các bài tập và điểm số thuộc lớp mình quản lý.
* B. Giáo viên được xem Hồ sơ năng lực tổng thể (CEFR ước lượng, điểm mạnh/yếu chung) nhưng không xem chi tiết nhật ký chat riêng tư với AI Tutor hay lịch sử lật thẻ từng từ lẻ.
* C. Giáo viên có toàn quyền xem 100% mọi hành vi tự học và lịch sử chat của học sinh.

**Recommended option**: B. Giáo viên xem được bức tranh năng lực tổng quan để hỗ trợ sư phạm, bảo mật nhật ký tương tác riêng tư của học sinh.

**Decision**: PENDING

---

### Q-017 (Phạm Vi Kho Nội Dung Phục Vụ Trình Diễn Sản Phẩm - Demo Scope)
**Question**: Để hoàn thành một sản phẩm hoàn chỉnh sẵn sàng trình diễn giải pháp giáo dục, độ phủ nội dung tối thiểu cần đạt là bao nhiêu (số level, số khóa học, số bài học mẫu)?

**Why it matters**: Xác định định nghĩa hoàn thành (Definition of Done) cho kho học liệu; tránh tình trạng làm khung app rất đẹp nhưng rỗng nội dung hoặc ngược lại bị quá tải vì phải số hóa hàng nghìn bài.

**Possible options**:
* A. Chỉ làm 1 bài mẫu duy nhất cho mỗi kỹ năng (Mock data tối thiểu).
* B. Phủ trọn vẹn 2 cấp độ phổ biến nhất (A2 và B1): Gồm 2 Course hoàn chỉnh, mỗi Course 3 Units, mỗi Unit 3–4 Lessons đa kỹ năng, kèm 1 ngân hàng 100 câu hỏi chuẩn có bản quyền rõ ràng.
* C. Số hóa toàn bộ khung từ A1 đến C1 (Quá lớn cho giai đoạn sản phẩm mẫu).

**Recommended option**: B. Tập trung làm thật sâu và hoàn chỉnh 2 cấp độ A2 và B1 với đầy đủ học liệu bản quyền minh bạch để trình diễn trọn vẹn vòng lặp.

**Decision**: PENDING

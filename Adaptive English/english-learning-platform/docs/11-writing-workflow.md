# 11 - Writing Workflow

## Goal
Quy định quy trình rèn luyện và đánh giá kỹ năng Viết (Writing Workflow), tích hợp động cơ đánh giá định hình (Formative AI Evaluation) theo 4 tiêu chí chuẩn IELTS, và cơ chế quan trọng nhất: **chuyển hóa phản hồi thành các hành động học tập vi mô (Converting Feedback into Learning Actions)** nhằm đóng kín vòng lặp sư phạm.

## Actor
- Student (Người viết bài)
- Teacher (Người thẩm định và phê duyệt nhận xét bài tập lớp học)
- AI Formative Writing Evaluator

## Preconditions
- Đề bài viết đã được định cấu hình (IELTS Academic Task 1, Task 2, hoặc Đoạn văn ngắn B1/B2) kèm theo Rubric tương ứng.

## Trigger
- Học sinh nộp bài viết trong không gian Tự học hoặc nộp bài tập Viết do giáo viên giao trong Lớp học.

---

## Main Flow: Quy Trình Viết Luận & Đóng Vòng Lặp Sư Phạm

### 1. Vòng Đời Bài Viết (Writing Session Stages)
```
[1. TASK SELECTION & PLANNING]
  • Học sinh chọn đề bài: IELTS Task 2 (Opinion / Discussion / Problem-Solution)
  • Giao diện hiển thị: Đề bài + Hướng dẫn dàn bài gợi ý + Bộ đếm từ + Đồng hồ bấm giờ
       ↓
[2. WRITING & SUBMISSION]
  • Học sinh viết trực tiếp trên nền tảng (Yêu cầu tối thiểu 250 từ đối với Task 2)
  • Bấm [Submit Essay]
       ↓
[3. MULTI-PASS AI FORMATIVE EVALUATION]
  • AI đánh giá độc lập theo 4 tiêu chí chuẩn IELTS:
    1. Task Response (Trọng tâm câu trả lời, lập luận và ví dụ phát triển ý)
    2. Coherence & Cohesion (Tính mạch lạc, liên kết câu/đoạn, từ nối)
    3. Lexical Resource (Độ đa dạng từ vựng, dùng đúng ngữ cảnh, collocation)
    4. Grammatical Range & Accuracy (Độ phức tạp câu, tỉ lệ lỗi ngữ pháp, chấm câu)
       ↓
[4. PRELIMINARY SCORE & DETAILED DIAGNOSTICS]
  • Ước lượng Band điểm từng tiêu chí (ví dụ: Overall 5.5 | TR: 6.0, CC: 5.5, LR: 5.5, GRA: 5.0)
  • Chỉ ra các lỗi sai cụ thể trong bài (In-line error highlighting kèm giải thích)
       ↓
[5. TEACHER REVIEW (NẾU LÀ BÀI TẬP LỚP HỌC)]
  • Nếu là bài tập giáo viên giao: Bản đánh giá của AI chuyển thành DRAFT cho giáo viên
  • Giáo viên xem xét, sửa điểm, bổ sung nhận xét cá nhân và bấm [Approve & Return]
       ↓
[6. CONVERTING FEEDBACK TO LEARNING ACTIONS (CORE MOAT)]
  • Hệ thống tự động chuyển hóa các điểm yếu phát hiện trong bài thành hành động học tập cụ thể:
    - Lỗi ngữ pháp Mạo từ (Articles) ──► Đề xuất bài luyện Micro-Drill: Definite Article "The"
    - Lặp từ "important" nhiều lần  ──► Tự động nạp vào Kho từ: "crucial", "essential", "vital"
    - Thiếu liên kết giữa các đoạn ──► Đề xuất bài học vi mô: Cohesive Devices & Transition Signals
       ↓
[7. REWRITE & RETRY LOOP]
  • Học sinh xem toàn bộ góp ý và bấm [Rewrite Essay] để viết bản sửa đổi (Draft 2)
```

---

### 2. Sự Khác Biệt Giữa Hệ Thống Thích Ứng Và Chatbot Thông Thường
Nếu chỉ dùng chatbot thông thường (như ChatGPT thuần túy), học sinh chỉ nhận được một bài sửa mẫu rồi tắt cửa sổ, không đọng lại sự tiến bộ lâu dài.
Tại AELP:
1. **Dữ liệu lỗi được chuẩn hóa và lưu trữ**: Mọi lỗi mạo từ, lặp từ hay câu què cụt đều được bóc tách và ghi nhận vào `StudentLearningProfile`.
2. **Tác động trực tiếp lên Trang Chủ ngày hôm sau**:
   * *Good morning Huy. Based on yesterday's writing: Recommended today: 8 min Articles practice, 7 min Academic vocabulary, 10 min Sentence variety.*
3. **AI Tutor được trang bị ngữ cảnh**: Khi học sinh hỏi bài sau này, AI Tutor biết chính xác học sinh vừa bị trừ điểm ở tiêu chí Coherence & Cohesion để giải thích đúng trọng tâm.

---

## Alternative Flows
- **Chế độ Luyện viết câu vi mô (Sentence Building)**: Học sinh chưa sẵn sàng viết cả bài 250 từ có thể luyện viết từng câu ghép hoặc câu phức theo từ khóa cho trước.

---

## Error / Edge Cases
- **Bài viết quá ngắn (Dưới 100 từ)**: Hệ thống cảnh báo bài viết chưa đủ độ dài tối thiểu để ước lượng Band điểm chính xác; yêu cầu học sinh viết tiếp trước khi chấm.
- **Bài viết sao chép mẫu từ internet (Plagiarism)**: Hệ thống cảnh báo độ tương đồng văn bản cao và từ chối cập nhật tăng điểm năng lực vào Profile.

---

## State Changes
- Cập nhật điểm `writing_score` trong Learning Profile.
- Cập nhật danh sách từ vựng mới và lỗi ngữ pháp vào hàng đợi luyện tập.

---

## Data Conceptually Involved
- `WritingPrompt`, `EssaySubmission`, `IELTSRubricScore`, `LexicalRepetitionLog`, `GrammarMistakeInstance`, `ActionableRemediationList`.

---

## AI Involvement
- **AI Multi-Criteria Evaluator**: Đánh giá 4 tiêu chí IELTS.
- **AI Paraphrase Suggester**: Gợi ý các cách diễn đạt tự nhiên hơn cho từng câu văn của học sinh.

---

## Permissions
- Học sinh xem bài viết và lịch sử sửa đổi của mình. Giáo viên xem và sửa điểm bài viết của học sinh trong lớp.

---

## Open Questions
- Xem [`docs/20-open-questions.md`](20-open-questions.md) mục `Assessment` & `AI` (Q-010).

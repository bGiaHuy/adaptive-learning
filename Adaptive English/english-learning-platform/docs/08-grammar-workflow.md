# 08 - Grammar Workflow

## Goal
Quy định cơ chế học tập và quản lý năng lực Ngữ pháp (Grammar System), chuyển đổi cách tiếp cận truyền thống (chương/bài tĩnh) sang **Bản đồ năng lực ngữ pháp đa tầng (Grammar Mastery Graph)** kết hợp với **Hệ thống phân loại lỗi chuyên sâu (Error Taxonomy)**.

## Actor
- Student (Người học ngữ pháp)
- System Evaluator (Bộ phận phân tích lỗi ngữ pháp)
- Teacher (Người giám sát và giao bài củng cố)

## Preconditions
- Học sinh đã hoàn thành khảo sát ban đầu hoặc đã có lịch sử làm bài tập trong hệ thống.

## Trigger
- Học sinh chủ động chọn chuyên đề ngữ pháp trong `LEARN`, hoặc hệ thống kích hoạt bài tập củng cố ngữ pháp (Remedial Drill) dựa trên lỗi sai phát hiện từ bài Writing/Quiz.

---

## Main Flow: Đồ Thị Năng Lực & Xử Lý Lỗi Ngữ Pháp

### 1. Bản Đồ Năng Lực Ngữ Pháp (Grammar Mastery Graph)
Ngữ pháp không được tổ chức theo danh sách bài học tuyến tính (Lesson 1 $\rightarrow$ Lesson 20) mà được mô hình hóa thành một đồ thị năng lực phân cấp:

```
Grammar Mastery Root
├── Tense Systems
│   ├── Present Simple (Mastery: 92%)
│   ├── Present Perfect (Mastery: 61%)
│   └── Past Perfect (Mastery: 43%)
├── Conditionals
│   ├── Type 0 (Mastery: 85%)
│   ├── Type 1 (Mastery: 77%)
│   ├── Type 2 (Mastery: 51%)
│   └── Type 3 (Mastery: 32%)
├── Determiners & Articles
│   ├── Indefinite Articles (a/an) (Mastery: 65%)
│   ├── Definite Article (the) (Mastery: 42%)
│   └── Zero Article (Mastery: 38%)
├── Relative Clauses (Mastery: 70%)
└── Passive Voice (Mastery: 75%)
```

---

### 2. Nguyên Tắc Phân Loại Lỗi Sai (Error Taxonomy vs. Binary Correct/Wrong)
Điểm cốt lõi của hệ thống: **TUYỆT ĐỐI KHÔNG CHỈ GHI NHẬN `Question #315 = WRONG`**.
Khi một học sinh trả lời sai câu hỏi hoặc viết sai trong bài luận, hệ thống phải bóc tách được bản chất của lỗi sai theo Taxonomy:

```
Ví dụ câu sai của học sinh:
"If I will have enough money next week, I will buy that laptop."

HỆ THỐNG GHI NHẬN:
• Concept ID: conditionals_type_1
• Error Tag: future_tense_in_if_clause
• Description: Dùng thì tương lai (will have) trong mệnh đề điều kiện 'if' thay vì Hiện tại đơn (have).
• Tác động lên Profile:
  - Giảm mastery_score của node "Conditionals Type 1".
  - Tăng error_counter của lỗi "future_tense_in_if_clause".
  - Đẩy khái niệm này vào danh sách Active Weaknesses.
```

---

### 3. Cấu Trúc Một Buổi Học Ngữ Pháp Vi Mô (Micro-Lesson Structure)
Một buổi học ngữ pháp hoàn chỉnh (thời lượng 8–12 phút) được thiết kế theo phễu nhận thức:

```
[1. CONCEPT]
  • Tóm tắt quy tắc cốt lõi bằng trực quan (Infographic / Bảng so sánh 1 màn hình)
       ↓
[2. CONTRASTIVE EXAMPLES]
  • Đưa ra cặp ví dụ đúng/sai tương phản để não bộ ghi nhận sự khác biệt
       ↓
[3. RECOGNITION]
  • Bài tập nhận diện: Chọn câu đúng ngữ pháp trong 4 phương án
       ↓
[4. SENTENCE COMPLETION]
  • Điền dạng đúng của động từ hoặc mạo từ vào chỗ trống
       ↓
[5. ERROR CORRECTION]
  • Học sinh tìm và sửa trực tiếp lỗi sai trong một đoạn văn ngắn
       ↓
[6. PRODUCTION]
  • Học sinh tự viết 1–2 câu áp dụng đúng cấu trúc vừa học
       ↓
[7. MINI ASSESSMENT]
  • 3 câu kiểm tra chốt phiên để cập nhật lại chỉ số Mastery Score
```

---

### 4. Cơ Chế Thích Ứng & Củng Cố Điểm Yếu (Adaptive Remediation)
* Nếu Mastery của một chuyên đề < 60%: Hệ thống tự động giảm độ khó câu hỏi, ưu tiên dạng nhận diện và cung cấp thêm gợi ý quy tắc.
* Nếu Mastery đạt từ 60% – 85%: Hệ thống tăng tỉ lệ bài tập sửa lỗi và hoàn thành câu phức tạp.
* Nếu Mastery > 85%: Node ngữ pháp chuyển sang trạng thái xanh (Mastered). Hệ thống chỉ kiểm tra lại bằng 1–2 câu xen kẽ sau mỗi 2 tuần để chống quên.

---

## Alternative Flows
- **Học sinh muốn kiểm tra nhanh để bỏ qua chuyên đề (Test-Out)**: Học sinh có thể làm bài kiểm tra nhanh 5 câu khó nhất của chuyên đề. Nếu đúng 100%, Node được đánh dấu `MASTERED` ngay lập tức mà không cần học tuần tự.

---

## Error / Edge Cases
- **Lỗi ngữ pháp đa tầng (Compound Error)**: Một câu của học sinh vừa sai mạo từ vừa sai chia động từ.
  - *Giải pháp*: Bộ phân tích bóc tách thành 2 bản ghi lỗi độc lập và cập nhật điểm cho cả 2 Node liên quan.

---

## State Changes
- Cập nhật điểm `mastery_score` của từng Node trong Grammar Graph.
- Kích hoạt trạng thái `WEAKNESS_FLAGGED` hoặc `WEAKNESS_RESOLVED`.

---

## Data Conceptually Involved
- `GrammarConceptNode`, `ErrorTaxonomyItem`, `GrammarExerciseAttempt`, `TaxonomyMistakeLog`, `StudentGrammarMastery`.

---

## AI Involvement
- **AI Grammar Explainer**: Giải thích lý do sai bằng ngôn ngữ dễ hiểu, tùy biến theo ngôn ngữ mẹ đẻ của học sinh khi cần thiết.
- **AI Micro-Drill Generator**: Sinh tức thì các câu bài tập sửa lỗi tương tự câu học sinh vừa làm sai.

---

## Permissions
- Học sinh xem toàn bộ đồ thị ngữ pháp của mình. Giáo viên xem đồ thị năng lực ngữ pháp của từng học sinh hoặc trung bình của cả lớp.

---

## Open Questions
- Xem [`docs/20-open-questions.md`](20-open-questions.md) mục `Content` (Q-009).

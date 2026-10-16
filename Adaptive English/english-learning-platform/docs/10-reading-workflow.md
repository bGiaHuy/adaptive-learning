# 10 - Reading Workflow

## Goal
Quy định cơ chế học tập và đánh giá kỹ năng Đọc hiểu (Reading Workflow), bóc tách toàn diện các kỹ năng đọc học thuật (Skimming, Scanning, True/False/Not Given, Heading Matching), và cung cấp phản hồi giải thích sư phạm chuyên sâu về **nguyên nhân sai lệch tư duy logic** thay vì chỉ thông báo đúng/sai.

## Actor
- Student (Người luyện đọc)
- Teacher (Người giao bài tập đọc)
- System / AI Reading Evaluator

## Preconditions
- Văn bản đọc hiểu đã được định dạng và gắn nhãn độ khó theo khung CEFR và dạng câu hỏi chuẩn.

## Trigger
- Học sinh truy cập bài đọc trong Today's Plan hoặc giáo viên giao bài đọc trong không gian lớp học.

---

## Main Flow: Quy Trình Đọc Hiểu & Phân Tích Logic

### 1. Phân Loại Kỹ Năng Đọc Phụ (Reading Sub-Skills Taxonomy)
Kỹ năng Đọc hiểu trong hệ thống được đo lường qua 8 kỹ năng con:
1. **Skimming**: Đọc lướt nắm ý chính của đoạn và cấu trúc tổng thể.
2. **Scanning**: Đọc quét tìm thông tin chi tiết nhanh chóng (tên riêng, ngày tháng, dữ liệu).
3. **True / False / Not Given Logic**: Phân biệt khẳng định đúng, mâu thuẫn trực tiếp và thiếu thông tin.
4. **Matching Headings**: Nhận diện tư tưởng chủ đạo của từng đoạn văn.
5. **Vocabulary in Context**: Suy luận nghĩa của từ mới dựa trên văn cảnh xung quanh.
6. **Inference**: Suy luận ý nghĩa hàm ẩn không được phát biểu trực tiếp.
7. **Reference Words**: Xác định đối tượng mà các đại từ chỉ định thay thế (*this, that, they, which*).
8. **Sentence Completion / Summary**: Điền từ tóm tắt bài đọc.

---

### 2. Vòng Đời Một Buổi Luyện Đọc
```
[1. PASSAGE PRESENTATION & QUESTION DISPLAY]
  • Giao diện chia đôi màn hình: Bài đọc bên trái | Câu hỏi bên phải.
  • Học sinh có công cụ tô màu (Highlight) và ghi chú (Note) trực tiếp trên văn bản.
  • Bấm đúp vào bất kỳ từ nào để tra nhanh phiên âm và nghĩa gợi ý.
       ↓
[2. ANSWER SUBMISSION]
  • Học sinh trả lời các câu hỏi và bấm [Submit Reading].
       ↓
[3. DEEP LOGIC REVIEW & AI EXPLANATION]
  • Hệ thống không chỉ báo: "Wrong".
  • Hệ thống giải thích bản chất tư duy:
    "Bạn chọn: FALSE.
     Đáp án chính xác: NOT GIVEN.
     Lý do: Đoạn văn không hề phủ định tuyên bố này; tác giả chỉ đơn giản là không cung cấp thông tin về việc chính phủ có chi tiền cho dự án này hay không. FALSE chỉ đúng khi bài đọc khẳng định điều ngược lại."
       ↓
[4. EVIDENCE HIGHLIGHTING]
  • Tự động tô sáng chính xác câu văn trong bài đọc chứa bằng chứng giải quyết câu hỏi.
       ↓
[5. MISTAKE LOGGING & PROFILE UPDATE]
  • Ghi nhận lỗi logic: `subskill: "true_false_not_given_differentiation"`.
  • Tác động lên `reading_score` và điểm chi tiết của từng Sub-skill.
  • Nếu gặp từ vựng học thuật mới trong bài đọc mà học sinh tra cứu, từ đó được đưa vào hàng đợi Vocabulary Bank.
```

---

## Alternative Flows
- **Chế độ Luyện đọc bấm giờ (Speed Reading Mode)**: Đặt giới hạn thời gian nghiêm ngặt cho mỗi đoạn văn để rèn luyện tốc độ đọc (Words Per Minute) và kỹ năng Skimming dưới áp lực thời gian.

---

## Error / Edge Cases
- **Học sinh gõ thừa khoảng trắng hoặc sai chính tả trong bài điền từ**: Hệ thống phân biệt giữa lỗi sai kiến thức đọc hiểu và lỗi gõ nhầm (Typo) để đưa ra phản hồi chính xác.

---

## State Changes
- Cập nhật chỉ số `reading_score` và cập nhật bản đồ Sub-skill Reading trong Profile.

---

## Data Conceptually Involved
- `ReadingPassage`, `ReadingParagraph`, `ReadingQuestion`, `StudentReadingAttempt`, `EvidenceCitationMapping`.

---

## AI Involvement
- **AI Reading Explainer**: Tạo lời giải thích sư phạm tức thì so sánh lập luận của học sinh với văn bản gốc.
- **AI Passage Simplifier / Elaborator**: Điều chỉnh độ dài hoặc giải thích câu văn phức tạp theo yêu cầu của học sinh.

---

## Permissions
- Học sinh truy cập bài đọc theo cấp độ năng lực. Giáo viên xem kết quả phân tích đọc hiểu của cả lớp để chọn bài đọc phù hợp cho buổi học tiếp theo.

---

## Open Questions
- Xem [`docs/20-open-questions.md`](20-open-questions.md) mục `Content` (Q-009).

# 06 - Self-Learning Workflow

## Goal
Quy định cơ chế hoạt động của Không gian Tự học (Self-Learning Space), làm rõ sự phân tách và phối hợp giữa hai luồng học tập: **Lộ trình Hệ thống đề xuất (Follow Recommendation)** và **Học sinh chủ động chọn kỹ năng (Choose Own Skill)**, cùng cơ chế ghi nhận kết quả và cập nhật liên tục vào Learning Profile.

## Actor
- Student (Người tự học)

## Preconditions
- Học sinh đã có hồ sơ năng lực cơ bản (từ Placement Test hoặc từ lịch sử bài tập trên lớp).

## Trigger
- Học sinh truy cập vào ứng dụng và mở mục `LEARN` hoặc bấm `[Start Session]` trên trang chủ.

---

## Main Flow: Khung Hoạt Động Tự Học

Khi học sinh bước vào không gian Tự học, hệ thống cung cấp 2 phương thức tiếp cận:

```
                          [STUDENT ENTERS LEARN]
                                    │
            ┌───────────────────────┴───────────────────────┐
            ▼                                               ▼
[A. FOLLOW RECOMMENDATION]                      [B. CHOOSE OWN SKILL]
  • Khuyến nghị từ Today's Plan                   • Tự do khám phá kỹ năng
  • Tối ưu theo thời gian & điểm yếu              • Tự chọn chủ đề theo nhu cầu
  • Tự động xâu chuỗi đa kỹ năng                  • Tập trung chuyên sâu 1 kỹ năng
```

---

### CƠ CHẾ HOẠT ĐỘNG THEO TỪNG KỸ NĂNG (SKILL MICRO-FLOWS)

Bất kể học sinh học theo chế độ Khuyến nghị (A) hay Tự chọn (B), mỗi kỹ năng đều tuân thủ 6 bước sư phạm chuẩn hóa:

```
1. Entry Point ──► 2. Activity ──► 3. Assessment ──► 4. Mistake Capture ──► 5. Profile Update ──► 6. Re-recommend
```

#### 1. Vocabulary (Từ Vựng)
* **Entry Point**: Bấm vào `Today's Review` hoặc chọn một chủ đề từ vựng từ Kho từ (ví dụ: *Environment - B2*).
* **Learning Activity**: Học qua 5 bước nhận thức (Giới thiệu $\rightarrow$ Nhận diện $\rightarrow$ Điền từ nhớ lại $\rightarrow$ Cụm từ Collocation $\rightarrow$ Đặt câu ngữ cảnh).
* **Assessment**: Chấm độ chính xác tức thì; tính toán độ trễ phản hồi (Response Latency) để đánh giá độ thuần thục.
* **Mistake Capture**: Nếu bấm sai hoặc gõ sai từ, hệ thống ghi nhận từ đó vào trạng thái `WEAK_WORD` và tăng `mistake_count`.
* **Progress Update**: Cập nhật thuật toán Spaced Repetition (SRS): dời lịch ôn tập nếu đúng, rút ngắn lịch ôn tập về ngày hôm sau nếu sai.
* **Recommendation Update**: Nếu danh sách từ yếu tăng lên, hệ thống tự động tăng thời lượng ôn từ vựng trong Today's Plan ngày mai.

#### 2. Grammar (Ngữ Pháp)
* **Entry Point**: Khuyến nghị từ lỗi làm bài trước (ví dụ: *Articles Drill*) hoặc học sinh chọn từ Cây ngữ pháp (ví dụ: *Conditionals Type 2*).
* **Learning Activity**: Xem tóm tắt quy tắc cốt lõi (Micro-lesson) $\rightarrow$ Xem ví dụ tương phản $\rightarrow$ Bài tập trắc nghiệm nhận diện $\rightarrow$ Bài tập sửa lỗi sai trong câu (Error identification).
* **Assessment**: Kiểm tra độ chính xác theo từng quy tắc cụ thể.
* **Mistake Capture**: Phân loại lỗi theo Error Taxonomy (ví dụ: học sinh dùng sai *"if I will have"* được gắn nhãn `future_in_if_clause` chứ không chỉ ghi nhận là "câu 3 sai").
* **Progress Update**: Tăng hoặc giảm điểm Mastery (%) của Node ngữ pháp tương ứng trong Cây kỹ năng.
* **Recommendation Update**: Nếu điểm Mastery của chuyên đề đạt > 85%, hệ thống đánh dấu đã nắm vững và đề xuất chuyển sang chuyên đề tiếp theo.

#### 3. Listening (Nghe Hiểu)
* **Entry Point**: Bài luyện nghe theo phiên học đề xuất hoặc chọn dạng bài: Hội thoại đời sống, Bài giảng học thuật, hoặc Nghe chép chính tả (Dictation).
* **Learning Activity**: Nghe audio (có nút kiểm soát tốc độ) $\rightarrow$ Trả lời câu hỏi nghe hiểu $\rightarrow$ Nghe lại lần 2 $\rightarrow$ Mở Transcript tương tác (Click vào từng câu để nghe lại và tra từ).
* **Assessment**: Chấm điểm các câu hỏi trả lời theo rubric chuẩn IELTS Listening.
* **Mistake Capture**: Nhận diện dạng câu hỏi sai (sai phần Nghe số/tên riêng, hay sai phần Nghe suy luận ý chính).
* **Progress Update**: Cập nhật điểm `listening_score` và điểm phụ của từng kỹ năng nghe con (Sub-skills).
* **Recommendation Update**: Ưu tiên các bài nghe tập trung vào điểm yếu cụ thể trong các phiên sau.

#### 4. Reading (Đọc Hiểu)
* **Entry Point**: Đoạn văn ngắn 300–500 từ theo chủ đề quan tâm hoặc bài đọc học thuật IELTS chuẩn.
* **Learning Activity**: Đọc bài đọc với công cụ hỗ trợ (Highlight, Tra từ nhanh) $\rightarrow$ Trả lời các câu hỏi: True/False/Not Given, Trắc nghiệm, Nối tiêu đề (Matching Headings).
* **Assessment**: Hệ thống đối chiếu đáp án và đưa ra lời giải thích chi tiết **TẠI SAO ĐÚNG - TẠI SAO SAI**.
* **Mistake Capture**: Ghi nhận tư duy logic sai (ví dụ: Nhầm lẫn giữa FALSE và NOT GIVEN).
* **Progress Update**: Cập nhật `reading_score` và tốc độ đọc trung bình (Words per minute - WPM).
* **Recommendation Update**: Điều chỉnh độ dài và độ phức tạp của bài đọc tiếp theo phù hợp với trình độ.

#### 5. Writing (Viết)
* **Entry Point**: Bài tập viết câu theo từ vựng vừa học hoặc viết bài luận Task 1/Task 2 hoàn chỉnh.
* **Learning Activity**: Viết bài trong giao diện có đếm từ và đếm thời gian $\rightarrow$ Hỗ trợ kiểm tra chính tả cơ bản.
* **Assessment**: AI Evaluator phân tích bài viết theo 4 tiêu chí IELTS và đưa ra nhận xét định hình chi tiết.
* **Mistake Capture**: Bóc tách danh sách lỗi ngữ pháp cụ thể và các từ vựng bị lặp nhiều lần.
* **Progress Update**: Cập nhật điểm `writing_score` và ghi nhận điểm yếu vào danh mục Active Weaknesses.
* **Recommendation Update**: Tự động sinh danh sách bài tập vi mô (Micro-drills) cho ngữ pháp và nạp từ vựng thay thế vào kho từ.

---

## Alternative Flows
- **Tạm dừng giữa buổi học (Pause & Resume)**: Học sinh có thể thoát ra ngoài giữa chừng; hệ thống lưu trạng thái phiên học và cho phép tiếp tục vào lần đăng nhập tiếp theo.

---

## Error / Edge Cases
- **Học sinh chỉ tập trung học 1 kỹ năng duy nhất (Skill Imbalance)**: Nếu học sinh chỉ luyện Nghe mà bỏ qua Viết trong 14 ngày, hệ thống sẽ hiển thị cảnh báo mất cân bằng kỹ năng và tăng độ ưu tiên của kỹ năng bị bỏ quên trong Today's Plan.

---

## State Changes
- Trạng thái phiên học tự học: `INITIALIZED` $\rightarrow$ `ACTIVE` $\rightarrow$ `EVALUATED` $\rightarrow$ `SYNCED_TO_PROFILE`.

---

## Data Conceptually Involved
- `SelfStudySession`, `SkillProgressSnapshot`, `ExerciseAttempt`, `TaxonomyMistakeLog`, `RecommendationPlan`.

---

## AI Involvement
- **Adaptive Engine**: Quyết định độ khó và nội dung bài tập tiếp theo.
- **AI Content Generator**: Sinh giải thích chi tiết tại sao đáp án sai cho từng học sinh.

---

## Permissions
- Học sinh có toàn quyền lựa chọn và thực hành các nội dung trong thư viện Self-Learning.

---

## Open Questions
- Xem [`docs/20-open-questions.md`](20-open-questions.md) mục `Self Learning` (Q-008).

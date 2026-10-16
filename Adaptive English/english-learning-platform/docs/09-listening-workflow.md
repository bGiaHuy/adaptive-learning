# 09 - Listening Workflow

## Goal
Quy định cơ chế học tập và đánh giá kỹ năng Nghe (Listening Workflow), phân loại bài nghe theo các thể loại thực tế (Hội thoại thường ngày, Học thuật, IELTS, Nghe chép chính tả), và bóc tách năng lực học sinh theo từng kỹ năng nghe phụ (Listening Sub-skills).

## Actor
- Student (Người luyện nghe)
- Teacher (Người giao bài tập nghe)
- System Evaluator (Bộ phận phân tích lỗi nghe hiểu)

## Preconditions
- Thiết bị của học sinh có khả năng phát âm thanh và kết nối mạng ổn định để tải luồng audio.

## Trigger
- Học sinh bắt đầu bài luyện nghe trong phiên học hàng ngày hoặc làm bài tập nghe do giáo viên giao.

---

## Main Flow: Quy Trình Luyện Nghe Đa Tầng

### 1. Phân Loại Thể Loại Bài Nghe (Listening Content Categories)
Hệ thống cung cấp 4 thể loại bài nghe đáp ứng các mục tiêu học tập khác nhau:
1. **General Daily Conversation**: Hội thoại giao tiếp đời sống (đặt phòng khách sạn, hỏi đường, mua sắm).
2. **Academic Lecture / Presentation**: Bài giảng học thuật ngắn (khoa học, lịch sử, môi trường).
3. **IELTS Standard Sections**: Cấu trúc bài nghe chuẩn từ Section 1 đến Section 4.
4. **Dictation (Nghe chép chính tả)**: Nghe từng câu ngắn và gõ lại chính xác 100% từ ngữ để rèn luyện khả năng bắt âm, nối âm và ngữ pháp tức thời.

---

### 2. Cây Kỹ Năng Nghe Phụ (Listening Sub-Skills Taxonomy)
Điểm số Listening không phải một con số phẳng mà được cấu thành từ 4 kỹ năng nghe cốt lõi:

```
Listening Competency (Estimated Band: 6.0)
├── Main Idea & Gist (Mastery: 82%) - Hiểu ý bao quát toàn bài
├── Specific Detail (Mastery: 69%) - Nắm bắt thông tin chi tiết
├── Numbers, Dates & Names (Mastery: 47%) - Bắt chính xác con số, ngày tháng, tên riêng
└── Inference & Attitude (Mastery: 61%) - Suy luận thái độ, cảm xúc người nói
```

---

### 3. Vòng Đời Một Buổi Luyện Nghe Chuẩn Hóa
Một bài luyện nghe tiêu chuẩn (thời lượng 10–15 phút) diễn ra theo chuỗi hành động:

```
[1. AUDIO PLAYBACK & FIRST ATTEMPT]
  • Học sinh nghe audio lần 1 (không có phụ đề transcript).
  • Trả lời các câu hỏi nghe hiểu đi kèm (Trắc nghiệm, Điền từ, Nối thông tin).
       ↓
[2. SECOND ATTEMPT / REVIEW]
  • Học sinh nghe lại lần 2 để kiểm tra hoặc hoàn thiện các câu chưa kịp nghe.
  • Bấm nộp bài (Submit Listening).
       ↓
[3. INSTANT SCORING & MISTAKE ANALYSIS]
  • Hệ thống chấm điểm tự động.
  • Chỉ ra câu đúng/sai kèm phân loại dạng lỗi.
  • Ví dụ phát hiện: "Học sinh hiểu ý chính tốt (100%), nhưng sai 3/4 câu về Con số và Ngày tháng".
       ↓
[4. INTERACTIVE TRANSCRIPT]
  • Mở khóa Transcript tương tác: Học sinh có thể bấm vào từng câu trong lời thoại để nghe lại riêng câu đó.
  • Tô sáng các từ vựng mới hoặc các từ chìa khóa dẫn tới đáp án đúng.
       ↓
[5. VOCABULARY HARVESTING]
  • Học sinh bấm vào từ mới trong Transcript để nạp trực tiếp vào Personal Vocabulary Bank.
       ↓
[6. PROFILE UPDATE & ADAPTIVE ROUTING]
  • Cập nhật điểm Mastery của Sub-skill "Numbers, Dates & Names" giảm xuống.
  • Phiên học Listening tiếp theo sẽ tự động ưu tiên bài tập luyện bắt số liệu và ngày tháng.
```

---

## Alternative Flows
- **Chế độ Dictation (Nghe chép chính tả chuyên sâu)**: Hệ thống phát từng câu ngắn; học sinh gõ lại văn bản. AI chấm điểm so khớp từng ký tự, chỉ ra các lỗi nuốt âm, sai thì động từ quá khứ (-ed) hoặc số nhiều (-s/-es).

---

## Error / Edge Cases
- **Audio bị gián đoạn do mạng**: Hệ thống tự động lưu vị trí giây (Timestamp) đang nghe. Khi kết nối lại, audio tiếp tục từ đúng vị trí đó mà không bắt học sinh nghe lại từ đầu.

---

## State Changes
- Cập nhật chỉ số `listening_score` và điểm chi tiết của từng Sub-skill trong Profile.
- Cập nhật số lượng từ vựng thu hoạch được vào kho từ.

---

## Data Conceptually Involved
- `ListeningTrack`, `AudioSection`, `ListeningQuestion`, `StudentAudioAttempt`, `ListeningSubskillMetrics`.

---

## AI Involvement
- **AI Audio Speed Adjuster**: Tự động nhận diện nếu học sinh gặp khó khăn ở tốc độ bình thường (1.0x) để đề xuất luyện tập ở 0.85x trước khi tăng dần lên tốc độ tự nhiên.
- **AI Mistake Explainer**: Giải thích lý do học sinh nghe nhầm (ví dụ: bẫy nối âm *fifteen* vs *fifty*).

---

## Permissions
- Học sinh nghe và làm bài tập theo cấp độ của mình. Giáo viên xem chi tiết phân bổ lỗi nghe của từng học sinh trong lớp.

---

## Open Questions
- Xem [`docs/20-open-questions.md`](20-open-questions.md) mục `Content` & `Assessment` (Q-009, Q-010).

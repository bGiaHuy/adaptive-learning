# 02 - Student Workflow

## Goal
Đặc tả chi tiết toàn bộ hành trình trải nghiệm của học sinh (Student Journey) trong nền tảng học tiếng Anh thích ứng lấy cảm hứng từ IELTS: từ luồng Onboarding tinh gọn (bài kiểm tra 8–12 phút), điều hướng 4 tab tối giản (`Học` · `Ôn từ` · `Lớp học` · `Tiến độ`), đến hai phương thức bắt đầu học linh hoạt và các nguyên tắc chuyển động UX có chủ đích.

## Actor
- Student (Người tự học là trung tâm)

## Preconditions
- Người dùng đã tải ứng dụng hoặc mở trình duyệt web.

## Trigger
- Người dùng mở ứng dụng lần đầu (First-time user) hoặc đăng nhập để tiếp tục việc học hàng ngày.

---

## Main Flow: Hành Trình Học Sinh Tinh Gọn

### 1. Luồng Onboarding Tinh Gọn (Lean Onboarding & Placement Test)
Loại bỏ áp lực thi cử: **Không ép buộc nhập ngày thi hay mục tiêu Band điểm cụ thể**. Quy trình gồm 4 bước liền mạch:

```
[BƯỚC 1: MỤC TIÊU CÓ THỂ BỎ QUA (OPTIONAL GOAL SURVEY)]
  • Người dùng có thể chọn nhanh lĩnh vực quan tâm (Giao tiếp / Công việc / Học thuật / Định cư)
  • Có nút [Bỏ qua] (Skip) để vào thẳng bài kiểm tra mà không bị rào cản.
       ↓
[BƯỚC 2: BÀI KIỂM TRA ĐẦU VÀO BẮT BUỘC (ADAPTIVE PLACEMENT TEST: 8–12 PHÚT)]
  • Có thanh tiến độ hiển thị trực quan theo từng phần.
  • Cấu trúc 5 phần cô đọng:
    1. Từ vựng & Ngữ pháp: 4–6 câu trong ngữ cảnh tự nhiên.
    2. Reading: 1 đoạn văn ngắn, 2–3 câu hỏi (hiểu ý chính và chi tiết).
    3. Listening: 1 audio ngắn, 2–3 câu hỏi (nhận diện thông tin nghe được).
    4. Writing: Viết 2–3 câu theo prompt tình huống.
    5. Speaking: Trả lời bằng giọng nói khoảng 30 giây (Tùy chọn cấp quyền Mic).
  • Quy tắc quyền Mic: Nếu không cấp quyền Mic hoặc môi trường ồn ào, người dùng bấm [Bỏ qua phần Nói].
    Hệ thống ghi nhận Speaking là "Chưa đánh giá", KHÔNG dùng điểm Writing để suy ra Speaking.
       ↓
[BƯỚC 3: HỒ SƠ NĂNG LỰC BAN ĐẦU (INITIAL INDEPENDENT PROFILE)]
  • KHÔNG gộp thành 1 điểm tổng duy nhất.
  • Giữ riêng từng kỹ năng độc lập:
    - Reading: Bắt đầu ở bài đọc cơ bản (Điểm mạnh: Tìm thông tin trực tiếp; Cần luyện: Phân biệt ý chính).
    - Listening: Bắt đầu ở bài nghe tốc độ vừa phải.
    - Writing: Bắt đầu ở cấu trúc câu ghép.
    - Speaking: Chưa có dữ liệu (hoặc mức khởi đầu nếu đã ghi âm).
    - Vocabulary & Grammar: Ghi nhận như năng lực hỗ trợ.
       ↓
[BƯỚC 4: THÔNG ĐIỆP CHÀO ĐÓN & BẮT ĐẦU HỌC]
  • Màn hình kết quả thông báo rõ ràng:
    "Hệ thống đã chọn điểm bắt đầu phù hợp cho bạn. Mức này sẽ tự động điều chỉnh khi bạn học."
  • Hiển thị: 1 bài học được đề xuất đầu tiên + Nút [Tự chọn kỹ năng].
```

---

### 2. Cấu Trúc Điều Hướng 4 Tab Tối Giản (Minimal 4-Tab Navigation)
Thanh điều hướng dưới đáy màn hình (Bottom Navigation Bar) được tinh gọn chỉ còn 4 mục:

```
┌────────────────────────────────────────────────────────┐
│   [HỌC]   ·   [ÔN TỪ]   ·   [LỚP HỌC]   ·   [TIẾN ĐỘ]  │
└────────────────────────────────────────────────────────┘
```

1. **Tab HỌC (Learn Hub)**:
   * **Phần trên**: Thẻ hành động rõ ràng duy nhất: **“Học theo kế hoạch”** (ví dụ: *Luyện dạng Matching Headings — 8 phút*).
   * **Phần dưới**: Lưới chọn **“Tự chọn kỹ năng”**:
     * `[ Listening ]`: Nghe hội thoại, nghe bài giảng, nghe bắt số/tên riêng.
     * `[ Reading ]`: Luyện Skimming, True/False/Not Given, nối tiêu đề.
     * `[ Writing ]`: Luyện viết câu biểu đạt ý, viết đoạn lập luận.
     * `[ Speaking ]`: Luyện nói theo phản xạ 30 giây.
2. **Tab ÔN TỪ (Flashcard Vocab Bank)**:
   * Bộ từ cá nhân kiểu Anki: Hiển thị số lượng từ đến hạn hôm nay (ví dụ: *12 từ cần ôn*).
   * Thẻ lật 2 mặt: **Bắt buộc tự nhớ đáp án trong đầu trước khi lật thẻ**.
   * Đánh giá mức độ ghi nhớ sau khi lật: `Lại (Again)` · `Khó (Hard)` · `Tốt (Good)` · `Dễ (Easy)`.
3. **Tab LỚP HỌC (Classroom)**:
   * Danh sách các lớp đang tham gia + Nút `[+ Nhập mã lớp]`.
   * Danh sách bài tập do giáo viên giao: Hạn nộp rõ ràng, trạng thái bài nộp, điểm và nhận xét của thầy cô.
4. **Tab TIẾN ĐỘ (Progress)**:
   * Báo cáo độc lập từng kỹ năng: Mức hiện tại, điểm mạnh có bằng chứng, phần cần luyện tập thêm.
   * Thống kê chuỗi ngày học (Streak), danh sách các lỗi sai thường gặp nhất, và lịch sử bài đã làm.

---

### 3. Hai Cách Bắt Đầu Học (Two Entry Pathways)

```
                            [MỞ ỨNG DỤNG]
                                  │
         ┌────────────────────────┴────────────────────────┐
         ▼                                                 ▼
[CÁCH 1: HỌC THEO KẾ HOẠCH]                       [CÁCH 2: TỰ CHỌN KỸ NĂNG]
 • 1 hành động đề xuất rõ ràng duy nhất           • Người học tự chọn kỹ năng muốn luyện
 • Ví dụ: "Ôn 12 từ đến hạn" hoặc                  (Listening / Reading / Writing / Speaking)
   "Luyện dạng Matching Headings"                 • Hệ thống đề xuất độ khó bên trong kỹ năng
 • Bấm là vào học ngay, không đắn đo              • Tự do theo sở thích hoặc bài tập ngày mai
```

* **Nguyên tắc phân định quyền hạn**: Người dùng toàn quyền chọn kỹ năng muốn học; hệ thống chịu trách nhiệm gợi ý độ khó và dạng bài phù hợp với kỹ năng đó.

---

### 4. Vòng Lặp Kết Nối: Từ Lớp Học Đến Tự Học (The Living Connection Loop)
Dữ liệu học tập không bị phân mảnh:
1. Khi học sinh làm bài Reading trong tab `Học` bị sai câu hỏi do không biết nghĩa từ *“deteriorate”* $\rightarrow$ Từ này tự động được thêm vào **Bộ từ cá nhân** trong tab `Ôn từ`.
2. Khi giáo viên giao bài tập Writing trên tab `Lớp học` và chỉ ra lỗi lặp từ *“important”* $\rightarrow$ Các từ vựng gợi ý (*crucial, vital*) tự động xuất hiện trong hàng đợi ôn tập thẻ flashcard của học sinh.
3. Học sinh ôn tập các từ vựng này trong tab `Ôn từ` $\rightarrow$ Khi gặp lại trong các bài học sau, hệ thống ghi nhận sự tiến bộ và nâng mức thành thạo của từ đó lên.

---

### 5. Nguyên Tắc Trải Nghiệm Người Dùng & Chuyển Động (UX & Motion Principles)
* **Pacing kiểu Duolingo**:
  * Các bài tập chia thành các khối ngắn (micro-units: 3–8 phút).
  * Phản hồi âm thanh và hình ảnh tức thì khi chọn đáp án (Âm thanh thành công vui tươi, rung nhẹ xúc giác khi sai).
  * Màn hình hoàn thành bài học (Session Summary): Tôn vinh nỗ lực, cộng điểm chuỗi ngày học (Streak), tóm tắt từ vựng đã ôn.
* **Quy tắc chuyển động có chủ đích (Intentional Motion vs. Quiet Focus)**:
  * *Chuyển động sinh động*: Áp dụng khi chuyển câu hỏi, hiệu ứng lật thẻ flashcard 3D mượt mà, thanh tiến độ tăng dần.
  * *Chế độ yên tĩnh (Quiet Mode)*: Khi học sinh ở màn hình đọc văn bản dài (Reading) hoặc gõ đoạn văn (Writing), toàn bộ hiệu ứng thừa, âm thanh nền và hoạt ảnh vui nhộn **được tắt hoàn toàn** để tạo không gian tập trung sâu tối đa.

---

## Alternative Flows
- **Chế độ Luyện nhanh không mạng (Offline Flashcards)**: Học sinh có thể tải trước bộ từ vựng đến hạn để lật thẻ trên xe buýt hoặc khi không có internet. Dữ liệu ghi nhớ sẽ đồng bộ lại khi có mạng.

---

## Error / Edge Cases
- **Bị gián đoạn giữa bài kiểm tra đầu vào (Placement Test Drop-off)**: Nếu người dùng thoát app giữa chừng trong bài test 8–12 phút, hệ thống lưu lại các câu đã trả lời. Khi mở lại app, hiển thị tùy chọn: `[Tiếp tục phần đang làm dở]` hoặc `[Làm lại từ đầu]`.

---

## State Changes
- Cập nhật chuỗi ngày học (`streak_count`).
- Cập nhật số lượng thẻ trong hàng đợi ôn tập của ngày hôm đó.

---

## Data Conceptually Involved
- `StudentProfile`, `IndependentSkillLevels`, `FlashcardQueue`, `ClassAssignmentCard`, `DailyActionRecommendation`.

---

## AI Involvement
- AI hỗ trợ chấm nháp câu trả lời ngắn của phần Writing và Speaking trong bài test đầu vào và các bài luyện tập hàng ngày.

---

## Permissions
- Học sinh toàn quyền quyết định lộ trình tự học và kho từ vựng cá nhân của mình.

---

## Open Questions
- Xem [`docs/20-open-questions.md`](20-open-questions.md) mục `Student` (Q-002, Q-008).

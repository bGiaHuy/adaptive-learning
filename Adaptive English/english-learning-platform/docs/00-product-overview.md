# 00 - Product Overview

## Goal
Định hình tầm nhìn chiến lược, định vị sản phẩm mới, triết lý sư phạm và cấu trúc trải nghiệm của **Adaptive English Learning Platform (AELP)**: 
> **Một ứng dụng tự học tiếng Anh với các dạng hoạt động lấy cảm hứng từ IELTS**, tích hợp không gian lớp học để giáo viên giao bài/bổ trợ, và quản trị vận hành cơ bản.

## Actor
- Student (Người tự học là trung tâm)
- Teacher (Giáo viên giao bài & hỗ trợ)
- Admin (Quản trị vận hành cơ bản)

## Preconditions
- Người học cần một phương pháp tự học tiếng Anh có nhịp độ nhanh, phản hồi tức thì, rèn luyện kỹ năng thực chất thông qua các định dạng bài tập học thuật tiêu chuẩn (IELTS-inspired), không bị áp lực bởi việc luyện thi lấy chứng chỉ cấp tốc hay ép ngày thi.

## Trigger
- Người học mở ứng dụng để bắt đầu một phiên học ngắn, ôn từ vựng đến hạn, hoặc hoàn thành bài tập do giáo viên giao.

---

## Main Flow: Tái Định Vị Sản Phẩm & 4 Trụ Cột Trải Nghiệm

### 1. Định Vị Cốt Lõi: App Tự Học Tiếng Anh (IELTS-Inspired Formats)
* **Không phải app luyện thi cày điểm (Not an Exam-Cramming App)**: Loại bỏ áp lực đặt mục tiêu Band và ngày thi dồn dập khỏi luồng Onboarding chính. Tập trung hoàn toàn vào việc phát triển năng lực ngôn ngữ thực chất của từng kỹ năng.
* **Tự học là luồng chính (Self-Learning is Core)**: Toàn bộ trải nghiệm người dùng được thiết kế xoay quanh hành trình tự học hàng ngày.
* **Classroom là phần bổ trợ (Classroom is Extension)**: Không gian lớp học giúp giáo viên giao bài custom, theo dõi học sinh và hỗ trợ kịp thời.
* **Admin là phần phụ (Admin is Operational)**: Chỉ giữ các tính năng quản lý tài khoản và vận hành cơ bản.

---

### 2. Bốn Trụ Cột Trải Nghiệm Sản Phẩm (The 4 Pillars)

| Phân Hệ | Trải Nghiệm Chính | Tham Chiếu UX / Cơ Chế |
| :--- | :--- | :--- |
| **Học Tiếng Anh (IELTS-Inspired)** | Bài học ngắn (bite-sized), mục tiêu rõ ràng, phản hồi ngay lập tức. Học sinh tự do chọn kỹ năng: Listening, Reading, Writing hoặc Speaking. | **Duolingo-style Pacing**: Nhịp học nhanh, bài tập chia nhỏ, phản hồi tức thì, động lực cao. |
| **Ôn Từ Vựng Kiểu Anki** | Bộ từ cá nhân tự động tích lũy, thẻ flashcard lật 2 mặt, **bắt buộc tự nhớ đáp án trong đầu trước khi lật thẻ**, đánh giá mức độ ghi nhớ (Again, Hard, Good, Easy) để giãn chu kỳ ôn. | **Anki Spaced Repetition**: Active recall thực chất, không đoán mò trắc nghiệm, thuật toán lặp lại ngắt quãng. |
| **Classroom (Lớp Học)** | Tham gia lớp học qua mã mời, nhận bài tập tùy biến của giáo viên, nộp bài, nhận điểm số và nhận xét sư phạm chi tiết. | **Google Classroom**: Tinh gọn, rõ ràng về hạn nộp, không phức tạp hóa thao tác. |
| **Tiến Độ Cá Nhân** | Báo cáo chi tiết từng kỹ năng độc lập, nhận diện lỗi sai thường gặp nhất, và đưa ra gợi ý bài học nên làm tiếp theo. | **Skill Independence**: Không gộp thành 1 điểm tổng duy nhất; thể hiện rõ điểm mạnh và điểm cần cải thiện. |

---

### 3. Hai Cách Bắt Đầu Học Của Student (Two Entry Pathways)

Student không bị ép buộc phải đi theo một lộ trình tuyến tính cứng nhắc. Mỗi lần mở app, người học luôn có 2 lựa chọn:

1. **“Học theo kế hoạch” (System Recommended)**:
   * App đề xuất 1 hành động duy nhất và rõ ràng nhất dựa trên hồ sơ năng lực và điểm yếu hiện tại (ví dụ: *“Ôn 12 từ đến hạn hôm nay”* hoặc *“Luyện dạng Matching Headings cho bài đọc B1”*).
   * Phù hợp khi người học muốn vào app là học ngay, không tốn năng lượng suy nghĩ.
2. **“Tự chọn kỹ năng” (User Choice)**:
   * Người học chủ động chọn kỹ năng (Listening / Reading / Writing / Speaking), chủ đề quan tâm hoặc dạng bài tập mình muốn luyện.
   * Hệ thống chỉ đóng vai trò **đề xuất độ khó phù hợp bên trong kỹ năng đó**.

---

### 4. Vòng Lặp Kết Nối Trọng Tâm: Mọi Bài Học Đều Phục Vụ Việc Học Cá Nhân
Điểm kết nối quan trọng nhất của hệ thống là **dữ liệu bài học tự học và bài trên lớp đều phục vụ cho việc học cá nhân**:
* Khi làm bài Reading bị sai vì không hiểu nghĩa của từ $\rightarrow$ Từ đó lập tức được lưu vào Bộ từ cá nhân.
* Người học luyện flashcard kiểu Anki để ghi nhớ từ $\rightarrow$ Gặp lại từ đó trong một bài Listening hoặc Reading khác.
* Khi giáo viên giao bài trên lớp, các từ vựng mới và lỗi ngữ pháp được giáo viên chỉ ra cũng tự động chảy về **Bộ ôn từ** và **Danh mục cần củng cố** của riêng học sinh đó.

```
       ┌────────────────────────────────────────────────────────┐
       │                 CLASSROOM ASSIGNMENTS                  │
       │         (Bài tập giáo viên giao / Nhận xét / Lỗi)       │
       └───────────────────────────┬────────────────────────────┘
                                   │ Trích xuất từ mới & lỗi sai
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │            BỘ HỒ SƠ & TỦ TỪ VỰNG CÁ NHÂN               │
       │    • Flashcard Kho Từ Anki (Active Recall)             │
       │    • Đồ thị Năng lực từng Kỹ năng độc lập               │
       │    • Danh mục Lỗi cần củng cố                          │
       └───────────────────────────┬────────────────────────────┘
                                   │ Cung cấp ngữ cảnh & bài ôn
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │                  TỰ HỌC TIẾNG ANH                      │
       │   [Học theo kế hoạch gợi ý]   HOẶC   [Tự chọn kỹ năng] │
       └────────────────────────────────────────────────────────┘
```

---

### 5. Triết Lý UX & Chuyển Động (UX Pacing & Motion Principles)
* **Thanh điều hướng tối giản (4 Tabs)**: `Học` · `Ôn từ` · `Lớp học` · `Tiến độ`.
* **Motion có chủ đích (Intentional Motion)**:
  * Chuyển động tập trung vào: Chuyển câu hỏi, lật thẻ flashcard, hiệu ứng âm thanh/hình ảnh khi phản hồi đúng/sai, và màn hình tổng kết phiên học (Session Complete).
  * Màn hình Viết luận (Writing) dài hoặc làm bài Đọc hiểu (Reading) cần **tuyệt đối yên tĩnh, tối giản, không hiệu ứng gây xao nhãng**.

---

## Alternative Flows
- **Học sinh độc lập không có lớp**: Trải nghiệm 100% không gian Tự học và Ôn từ; tab Lớp học đóng vai trò sẵn sàng khi có mã lớp từ giáo viên/trung tâm.

---

## Error / Edge Cases
- **Học sinh lúng túng giữa 2 cách học**: Màn hình Home luôn đưa nút `Học theo kế hoạch` ở vị trí nổi bật nhất kèm thời lượng cụ thể (ví dụ: *10 phút*), trong khi các nút `Tự chọn kỹ năng` nằm ngay bên dưới ở dạng thẻ rõ ràng.

---

## State Changes
- Chuyển đổi trạng thái từ người học mới sang người học có hồ sơ năng lực đa chiều.

---

## Data Conceptually Involved
- `StudentProfile`, `SkillCompetency`, `AnkiFlashcardDeck`, `ClassroomLinkage`, `DailyRecommendedAction`.

---

## AI Involvement
- AI hỗ trợ giải thích bài đọc/nghe, chấm điểm sơ bộ bài viết và phân tích lỗi sai chuyển thành bài ôn tập.

---

## Permissions
- Phân quyền theo ma trận RBAC đã định nghĩa, ưu tiên quyền tự do trải nghiệm của Student.

---

## Open Questions
- Xem chi tiết tại [`docs/20-open-questions.md`](20-open-questions.md).

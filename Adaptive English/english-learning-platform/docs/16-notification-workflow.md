# 16 - Notification Workflow

## Goal
Quy định cơ chế kích hoạt, định tuyến và hiển thị thông báo (Notification System) nhằm duy trì động lực học tập cho học sinh, cảnh báo hạn nộp bài tập lớp học, nhắc nhở ôn tập từ vựng đúng chu kỳ, và gửi báo cáo can thiệp kịp thời cho giáo viên.

## Actor
- Student (Người nhận thông báo học tập)
- Teacher (Người nhận thông báo lớp học và cảnh báo học sinh)
- System Notification Engine (Bộ phận điều phối thông báo tự động)

## Preconditions
- Người dùng đã đăng nhập hoặc đã cấp quyền nhận thông báo đẩy (Push/Email/In-App).

## Trigger
- Thời gian định kỳ (Cron Trigger), sự kiện bài tập sắp đến hạn, giáo viên trả bài, hoặc chu kỳ lặp lại ngắt quãng (SRS) của từ vựng kích hoạt.

---

## Main Flow: Phân Loại & Vòng Đời Thông Báo

### 1. Danh Mục Thông Báo Dành Cho Học Sinh (Student Notifications)

| Loại Thông Báo | Điều Kiện Kích Hoạt | Kênh Phân Phối | Nội Dung Mẫu |
| :--- | :--- | :--- | :--- |
| **Classroom Deadline Alert** | 48h, 24h, và 2h trước hạn nộp bài tập | In-app, Email, Mobile Push | *"Bài tập Writing Task 2 của Thầy Nam sẽ hết hạn trong 24 giờ nữa. Hãy hoàn thành ngay nhé!"* |
| **Teacher Graded & Returned** | Giáo viên bấm Return bài nộp | In-app, Mobile Push | *"Thầy Nam đã chấm bài Writing của bạn! Bấm vào đây để xem điểm Band 5.5 và nhận xét chi tiết."* |
| **SRS Vocabulary Due** | Có $\ge 5$ từ vựng đến hạn ôn tập trong ngày | In-app, Morning Digest | *"Hôm nay bạn có 12 từ vựng cần ôn tập để duy trì trí nhớ. Chỉ mất khoảng 8 phút thôi!"* |
| **Streak Loss Warning** | 20:00 tối nếu học sinh chưa hoàn thành Today's Plan | Mobile Push | *"Bạn chỉ còn 4 tiếng để duy trì chuỗi học tập 7 ngày liên tiếp. Hãy làm 1 bài micro-drill ngắn ngay!"* |
| **Target Band Milestone** | Ước lượng IELTS tăng từ 5.0 lên 5.5 | In-app Celebration Modal | *"Chúc mừng Huy! Điểm ước lượng IELTS Overall của bạn vừa tăng lên 5.5 nhờ sự tiến bộ ở kỹ năng Reading."* |

---

### 2. Danh Mục Thông Báo Dành Cho Giáo Viên (Teacher Notifications)

| Loại Thông Báo | Điều Kiện Kích Hoạt | Kênh Phân Phối | Nội Dung Mẫu |
| :--- | :--- | :--- | :--- |
| **Submissions Ready to Grade** | Hạn nộp bài vừa kết thúc hoặc có $\ge 5$ bài nộp mới | In-app, Teacher Dashboard | *"Lớp B1-03 có 18/24 học sinh đã nộp bài Writing. AI đã chuẩn bị sẵn bản chấm nháp để thầy/cô xem xét."* |
| **Student Inactivity Alert** | Học sinh không có hoạt động trong 5 ngày liên tục | Teacher Weekly Digest | *"Cảnh báo: 3 học sinh (Minh, Lan, Hoàng) đã không tham gia học 5 ngày qua. Bấm để gửi tin nhắn nhắc nhở."* |
| **Class Common Mistake Spike** | Tỉ lệ lỗi một chủ đề ngữ pháp vượt quá 40% trong tuần | In-app Insight Card | *"43% học sinh trong lớp B1-03 vừa làm sai Mạo từ Articles. Bấm để tạo bài tập can thiệp bằng AI Copilot."* |

---

## Alternative Flows
- **Chế độ Không làm phiền (Do Not Disturb)**: Học sinh cấu hình khung giờ ngủ (ví dụ: 22:00 – 07:00). Toàn bộ thông báo được tạm giữ lại và tổng hợp thành bản tin sáng (Morning Digest).

---

## Error / Edge Cases
- **Spam thông báo**: Một học sinh vừa có 3 bài tập mới, vừa có từ vựng đến hạn.
  - *Giải pháp*: Bộ điều phối gộp thông báo (Notification Aggregator) thành 1 thông báo duy nhất: *"Hôm nay bạn có 1 bài tập mới từ lớp và 10 từ vựng cần ôn tập"*.

---

## State Changes
- Thông báo: `CREATED` $\rightarrow$ `DELIVERED` $\rightarrow$ `READ` $\rightarrow$ `CLICKED_ACTION`.

---

## Data Conceptually Involved
- `NotificationRecord`, `NotificationPreference`, `DeliveryChannelEvent`, `EngagementReminderLog`.

---

## AI Involvement
- **Smart Timing Predictor**: Dự đoán khung giờ học sinh hay rảnh rỗi nhất trong ngày dựa trên lịch sử truy cập để gửi lời nhắc ôn từ vựng.

---

## Permissions
- Học sinh chỉ nhận thông báo cá nhân. Giáo viên nhận thông báo của các lớp mình quản lý.

---

## Open Questions
- Xem [`docs/20-open-questions.md`](20-open-questions.md) mục `Product` (Q-001).

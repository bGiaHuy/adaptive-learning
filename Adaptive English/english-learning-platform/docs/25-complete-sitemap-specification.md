# 25 - Complete Multi-Role Sitemap Specification

## Goal
Đặc tả cấu trúc trang (Sitemap) chi tiết và phân cấp điều hướng cho cả 3 vai trò: **Student**, **Teacher**, và **Admin**. Bản đồ này bao gồm mã định danh màn hình (Screen ID), đường dẫn quy ước (Route), các hộp thoại trượt (Drawers/Modals), và các trạng thái giao diện (Loading, Empty, Error, Active).

---

## 1. STUDENT PORTAL SITEMAP (4-TAB CORE)

```
STUDENT PORTAL
│
├── [AUTH-01] Màn hình Đăng ký / Đăng nhập (/auth/login, /auth/register)
│     ├── Tab: Người học (Student) - Tự đăng ký trực tiếp
│     ├── [AUTH-02] Modal Quên mật khẩu (/auth/forgot-password) - Gửi OTP qua Email
│     └── [AUTH-03] Modal Xác thực Email & Đặt lại mật khẩu (/auth/reset-password)
│
├── [ONB-01] Khảo sát Mục tiêu Tùy chọn (/onboarding/goals)
│     └── Nút hành động: [Chọn mục tiêu] hoặc [BỎ QUA (Skip)]
│
├── [ONB-02] Chế độ Xem trước Ứng dụng (/preview-mode)
│     └── Banner ghim: "Làm bài kiểm tra để mở khóa học" (Chế độ chỉ đọc)
│
├── [ONB-03] Adaptive Placement Test (/placement-test) - BẮT BUỘC 1 LẦN DUY NHẤT
│     ├── Thanh tiến độ 5 phần cố định
│     ├── [ONB-03A] Section 1: Từ vựng & Ngữ pháp (4–6 câu ngữ cảnh)
│     ├── [ONB-03B] Section 2: Reading (1 đoạn ngắn, 2–3 câu)
│     ├── [ONB-03C] Section 3: Listening (1 audio ngắn, 2–3 câu)
│     ├── [ONB-03D] Section 4: Writing (2–3 câu theo prompt)
│     ├── [ONB-03E] Section 5: Speaking (30s) + Nút [Không thể ghi âm lúc này]
│     └── [ONB-04] Màn hình Kết quả Khởi đầu Độc lập (/placement-test/result)
│
├── [TAB 1: HỌC] (/learn)
│     ├── [STU-HOME-01] Hero Action Card:
│     │     • Trạng thái 1: "Tiếp tục bài đang dở" (nếu có nháp)
│     │     • Trạng thái 2: "Bài học đề xuất hôm nay" (1 kỹ năng, 8 phút)
│     ├── [STU-HOME-02] Secondary Card: Ôn từ vựng đến hạn (N từ)
│     ├── [STU-HOME-03] Secondary Card: Deadline bài tập lớp sắp đến
│     ├── [STU-HOME-04] Lưới Chọn Kỹ năng: [Listening] [Reading] [Writing] [Speaking]
│     ├── [STU-HOME-05] Modal Bộ lọc Sâu (/learn/filters) [PENDING]: Dạng bài / Chủ đề / Độ khó
│     ├── [STU-SKIP-01] Modal Bài Kiểm Tra Nhảy Trình Kỹ Năng (/learn/skill-skip-test)
│     │
│     └── [STU-ACT-01] Màn hình Làm bài Tương tác (/learn/activity/:id)
│           ├── Header: Tiến độ câu, Nút [X] Thoát (Hộp thoại xác nhận lưu nháp)
│           ├── Workspace chia theo kỹ năng:
│           │     • Reading: Tab đôi [Bài Đọc] / [Câu Hỏi] hoặc Split-view
│           │     • Listening: Audio player, Waveform, Tùy chỉnh tốc độ (0.85x - 1.0x)
│           │     • Writing: Khung gõ, Bộ đếm từ, Gắn liền bàn phím di động
│           │     • Speaking: Micro to bản, Ghi âm 30s, Nút [Nghe lại trước khi nộp]
│           ├── Dạng câu hỏi hỗ trợ: Trắc nghiệm, Điền từ, Ghép cặp, Sắp xếp câu
│           ├── [STU-ACT-DRAWER] Drawer AI Tutor trượt từ dưới lên (State-enforced)
│           ├── [STU-ACT-FEEDBACK] Bottom Sheet phản hồi 4 bước: Thử lại -> Hint -> Giải thích -> Câu tương tự
│           └── [STU-ACT-SUMMARY] Màn hình Tổng kết phiên học & Streak milestone
│
├── [TAB 2: ÔN TỪ] (/vocabulary)
│     ├── [VOC-01] Hero Review Card: "Ôn 12 từ đến hạn hôm nay"
│     ├── [VOC-02] Thẻ Cảnh báo Quá tải: Phiên ôn ngắn (5-10 thẻ) & Nút [Tạm dừng nạp từ mới]
│     ├── [VOC-03] Trình Luyện Thẻ Flashcard Anki (/vocabulary/review)
│     │     ├── Mặt trước: Từ vựng + Phiên âm + Câu ví dụ khuyết
│     │     ├── Tương tác: Bắt buộc nhẩm trong đầu -> Chạm để lật thẻ 3D
│     │     └── Mặt sau: Nghĩa tiếng Việt + 4 nút đánh giá: [Lại] [Khó] [Tốt] [Dễ]
│     ├── [VOC-04] Quản lý Kho từ cá nhân 3 tầng (/vocabulary/bank)
│     │     ├── Tab 1: Đã lưu (Shelf / Saved)
│     │     ├── Tab 2: Đang học (Active Queue: Tối đa 30-50 từ)
│     │     └── Tab 3: Đã nhớ ổn định (Mastered)
│     └── [VOC-05] Modal Tra từ nhanh & Thêm vào kho (/vocabulary/add)
│
├── [TAB 3: LỚP HỌC] (/classroom)
│     ├── [CLS-01] Danh sách Lớp đang tham gia (/classroom/my-classes)
│     ├── [CLS-02] Modal Tham gia lớp mới (/classroom/join) - Nhập mã lớp / Dán link mời
│     ├── [CLS-FEED] Bảng Bài tập Lớp (/classroom/class/:classId/assignments)
│     │     ├── Bộ lọc: Cần làm · Đã nộp · Đã chấm
│     │     └── Cảnh báo Deadline & Chính sách nộp muộn
│     ├── [CLS-ACT] Không gian Làm bài tập Lớp (/classroom/assignment/:assignmentId)
│     │     └── Dùng chung layout với STU-ACT-01 + Header lớp học + Hạn nộp
│     └── [CLS-FEEDBACK] Màn hình Xem bài chấm & Nhận xét (/classroom/submission/:subId)
│           ├── Hiển thị rõ: [Điểm chính thức của Giáo viên] vs [Bản nhận xét của AI]
│           ├── In-line error highlights (Gạch chân lỗi sai màu sắc)
│           ├── Nút hành động: [+ Thêm từ gợi ý vào Tủ từ Anki]
│           └── Nút hành động: [Luyện bài tập vi mô củng cố]
│
├── [TAB 4: TIẾN ĐỘ] (/progress)
│     ├── [PROG-01] Trục Nỗ lực: Chuỗi ngày (Streak), Lịch sử học tuần, Thẻ đã lật
│     ├── [PROG-02] Trục Năng lực CEFR: Thẻ độc lập cho Reading, Listening, Writing, Speaking
│     ├── [PROG-03] Thẻ Bằng chứng & Phần cảnh báo "Chưa đủ dữ liệu"
│     └── [PROG-04] Danh mục Lỗi sai thường gặp nhất & Nút [Luyện khắc phục ngay]
│
└── [COMMON] Các thành phần dùng chung:
      ├── [NOTIF-CENTER] Trung tâm Thông báo (In-app notification drawer)
      └── [PROFILE-SET] Cài đặt Tài khoản, Tùy chỉnh Email/Push, Bật chế độ Giảm chuyển động (Reduced Motion)
```

---

## 2. TEACHER PORTAL SITEMAP

```
TEACHER PORTAL
│
├── [TCH-AUTH] Đăng ký / Đăng nhập Giáo viên (/teacher/auth) - Tự đăng ký trực tiếp
│
├── [TCH-DASH] Dashboard Tổng quan Giáo viên (/teacher/dashboard)
│     ├── Danh sách các lớp học phụ trách
│     ├── Widget: Bài nộp đang chờ chấm (Cần duyệt điểm nháp AI)
│     └── Widget: Học sinh cần chú ý (Tụt tiến độ, điểm thấp, nghỉ học)
│
├── [TCH-CLASS] Chi tiết Không gian Lớp học (/teacher/classes/:classId)
│     ├── [TCH-CLS-TAB1] Overview: Mã lớp, Link mời, Thông báo chung
│     ├── [TCH-CLS-TAB2] Classwork: Danh sách bài tập, Tạo bài mới, Bản nháp đề
│     ├── [TCH-CLS-TAB3] Students: Danh sách học sinh
│     │     └── [TCH-STU-VIEW] Xem Hồ sơ Năng lực CEFR & Lịch sử học của học sinh trong lớp
│     ├── [TCH-CLS-TAB4] Gradebook: Bảng điểm tổng hợp theo bài
│     └── [TCH-CLS-TAB5] Diagnostics: Ma trận điểm yếu của lớp & Đề xuất can thiệp
│
├── [TCH-STUDIO] Trung tâm Soạn bài tập (/teacher/assignments/create)
│     ├── Lựa chọn 1: Soạn câu hỏi thủ công (Manual Builder)
│     ├── Lựa chọn 2: Chọn câu hỏi từ Question Bank
│     ├── Lựa chọn 3: AI Copilot sinh bài theo chủ đề hoặc điểm yếu của lớp
│     ├── Lựa chọn 4: DOCX Ingestion Hub:
│     │     ├── [DOCX-01] Luồng A: Parse đề có sẵn (Giữ nguyên gốc 100%, cảnh báo đáp án khuyết)
│     │     └── [DOCX-02] Luồng B: Sinh đề mới từ tài liệu nội dung thô (Đánh dấu nội dung AI suy luận)
│     ├── [TCH-PREVIEW] Màn hình Duyệt bài WYSIWYG (Mô phỏng 100% giao diện học sinh)
│     └── [TCH-CONFIG] Modal Cấu hình Giao bài: Hạn nộp, Cho phép nộp muộn, Bật/tắt AI Tutor, Số lần làm lại
│
├── [TCH-GRADE] Không gian Chấm bài & Phê duyệt (/teacher/submissions/:subId)
│     ├── Bài làm của học sinh kèm phiên bản đề tương ứng (`version_id`)
│     ├── Bản chấm nháp của AI (DRAFT AI Grading): 4 tiêu chí CEFR/IELTS
│     ├── Khung nhập điểm chính thức & Ghi chú sư phạm của giáo viên
│     └── Nút: [Trả bài (Return)] hoặc [Yêu cầu sửa lại (Revision Required)]
│
└── [TCH-QB] Ngân hàng Câu hỏi Giáo viên (/teacher/question-bank)
      ├── Kho câu hỏi cá nhân của giáo viên
      └── Đóng góp câu hỏi lên Hệ thống chung (Chờ kiểm định)
```

---

## 3. ADMIN PORTAL SITEMAP

```
ADMIN CONSOLE
│
├── [ADM-DASH] Dashboard Vận hành Hệ thống (/admin/dashboard)
│
├── [ADM-USERS] Quản trị Tài khoản & Phân quyền (/admin/users)
│     ├── Quản lý Học sinh & Giáo viên (Mỗi user đúng 1 role duy nhất)
│     └── Khóa / Tạm dừng tài khoản vi phạm
│
├── [ADM-ACAD] Quản trị Khung Chương trình (/admin/academic)
│     ├── Cấu trúc Khóa học: Course → Unit → Lesson
│     ├── Cây kỹ năng (Skill Graph Taxonomy) & Chuẩn năng lực CEFR
│     └── Danh mục Nhãn Lỗi chuẩn hóa (Error Taxonomy Catalog)
│
├── [ADM-CONTENT] Quản trị Kho Nội dung & Bản quyền (/admin/content)
│     ├── Master Vocabulary Dictionary (Phiên âm, Định nghĩa, CEFR)
│     ├── Kiểm định Ngân hàng câu hỏi dùng chung (Audit Success Rate)
│     └── Quản lý Bản quyền học liệu (Provenance Tracking & License terms)
│
└── [ADM-GOV] Quản trị Hệ thống & AI Governance (/admin/governance)
      ├── Giám sát tiêu thụ Token AI theo mô hình
      ├── Cấu hình hạn mức Quota cho học sinh
      └── Nhật ký lỗi hệ thống (System Error Logs)
```

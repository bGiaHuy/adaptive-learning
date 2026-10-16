# 24 - Module Map, System Relationships & Architecture Blueprint

## Goal
Tài liệu này xác lập **Bản đồ Phân hệ Hệ thống (System Module Map)**, ma trận quan hệ liên kết dữ liệu giữa các phân hệ, cây sơ đồ trang (Sitemap), và đánh dấu ranh giới minh bạch giữa các **Quyết định đã chốt (Approved Decisions)** và các **Vấn đề đang chờ duyệt (Pending Items)** nhằm chuẩn bị trực tiếp cho việc thiết kế Wireframe và Kiến trúc kỹ thuật.

---

## 1. BẢNG TRẠNG THÁI QUYẾT ĐỊNH HỆ THỐNG (DECISION AUDIT LOG)

| Hạng Mục | Trạng Thái | Quyết Định / Nguyên Tắc Đã Khóa |
| :--- | :---: | :--- |
| **Thang đo năng lực** | **APPROVED** | Chuẩn hóa theo khung **CEFR (A1, A2, B1, B2, C1)**; hiển thị mức ước lượng độc lập cho từng kỹ năng (Reading, Listening, Writing, Speaking). |
| **Quyền AI trong Lớp học** | **APPROVED** | **Mặc định BẬT đầy đủ** các tính năng trợ giảng; Giáo viên có quyền tắt trong cài đặt. **Nguyên tắc bất biến: Tuyệt đối không làm bài hộ** (chưa làm thì gợi mở, đã trả lời thì phân tích lỗi). |
| **Ghi nhận mức độ hỗ trợ (Scaffolded Logging)** | **APPROVED** | Hệ thống ghi nhận chính xác kết quả đạt được với mức hỗ trợ nào: *Đúng độc lập*, *Đúng sau khi xem hint*, hay *Đúng sau khi xem giải thích*. Không tăng điểm CEFR giống nhau. |
| **Writing & Speaking Tự học** | **APPROVED** | **AI trực tiếp chấm điểm định hình, phân tích lỗi và đề xuất bài củng cố** khi không có giáo viên đồng hành. |
| **Writing & Speaking Bài lớp** | **APPROVED** | **Giáo viên có toàn quyền tự chấm**; AI đóng vai trò trợ lý chấm nháp (AI Pre-grade). Học sinh nhìn rõ nhãn người chấm (*Điểm chính thức của Giáo viên* vs. *Nhận xét sơ bộ của AI*). |
| **Quyền xem dữ liệu của Teacher** | **APPROVED** | **Toàn quyền xem toàn bộ dữ liệu học tập** của học sinh thuộc lớp mình phụ trách (bao gồm tiến độ tự học, từ vựng và điểm yếu) để hỗ trợ sư phạm toàn diện. |
| **Quy mô kho nội dung** | **APPROVED** | **Mở rộng tối đa** đa dạng trình độ, kỹ năng và chủ đề. Mọi bài học đều gắn metadata: CEFR, kỹ năng, mục tiêu học, độ khó, nguồn bản quyền. Nội dung import nằm ở bản nháp trước khi duyệt. |
| **Dạng câu hỏi hỗ trợ** | **PENDING** | *Chờ chốt*: Danh sách cụ thể các dạng bài tương tác bắt buộc (Trắc nghiệm, Điền từ, Tự luận ngắn, Nối cột, Kéo thả) và ranh giới xử lý khi parse DOCX. |
| **Phạm vi tắt AI của Teacher** | **PENDING** | *Chờ chốt*: Công tắc tắt AI áp dụng theo cấp độ Lớp học (Toàn bộ lớp) hay theo từng Bài tập cụ thể (Per-assignment Exam Mode). |
| **Chính sách nộp bài lớp** | **PENDING** | *Chờ chốt*: Quy định về hạn nộp cứng/mềm, số lần được phép làm lại, điều kiện nộp lại và thời điểm chính thức mở đáp án chi tiết. |
| **Mở rộng hạn ngạch từ vựng** | **PENDING** | *Chờ chốt*: Cơ chế tự động mở thêm từ mới vào nhóm Đang học khi tỷ lệ Mastery tăng cao (ví dụ: cứ 5 từ đạt Mastered thì mở 5 từ mới). |
| **Dữ liệu cải thiện hệ thống (AI Training)** | **PENDING** | *Chờ chốt*: Cơ chế phân tách quyền Teacher xem dữ liệu khỏi quyền dùng bài làm của học sinh để huấn luyện AI; chính sách thông báo (Opt-in/Opt-out consent). |

---

## 2. BẢN ĐỒ PHÂN HỆ HỆ THỐNG (SYSTEM MODULE MAP)

Hệ thống được tổ chức thành 8 Phân hệ Nghiệp vụ kết nối mật thiết:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ADAPTIVE SYSTEM MODULE MAP                      │
└────────────────────────────────────────────────────────────────────────┘
   │
   ├── [M1] IDENTITY & ROLES MODULE
   │     • Authentication & Single-Role Account Scope (Student / Teacher / Admin)
   │     • User Profile & Class Membership Linking
   │
   ├── [M2] ACADEMIC HIERARCHY MODULE
   │     • Course → Unit → Lesson (Cấu trúc phân cấp chuẩn)
   │     • CEFR & Skill Tagging (Phân loại cấp độ và kỹ năng mục tiêu)
   │
   ├── [M3] CONTENT & QUESTION LIBRARY MODULE
   │     • Curated Global Question Bank (Học liệu chuẩn đã kiểm định)
   │     • Unverified Drafts Staging Area (Kho nháp chứa bài import chưa duyệt)
   │     • Metadata Ingestion & Provenance Tracking (Bản quyền & Nguồn gốc)
   │
   ├── [M4] ADAPTIVE LEARNING & ASSESSMENT ENGINE
   │     • Elo / IRT Challenge Matcher (Khớp độ khó bài vừa sức)
   │     • Skill Graph & Sub-goal Mastery Engine (Bóc tách điểm yếu vi mô)
   │     • FSRS Memory Engine (Lên lịch lặp lại ngắt quãng cho từ vựng)
   │     • Scaffolded Attempt Logger (Ghi nhận mức độ hỗ trợ của AI/Hint)
   │     • Fast Confirmation "Anti-Smurf" Trigger (Kích hoạt nhảy vọt trình độ)
   │
   ├── [M5] VOCABULARY BANK & QUEUE CONTROLLER
   │     • Tier 1: Saved (Giá sách lưu trữ từ vựng)
   │     • Tier 2: Active Learning Queue (Hạn ngạch kiểm soát nợ ôn tập)
   │     • Tier 3: Mastered Pool (Trí nhớ dài hạn)
   │     • Active Recall Flashcard Engine (Lật thẻ 2 mặt kiểu Anki)
   │
   ├── [M6] CLASSROOM & ASSIGNMENT MANAGEMENT
   │     • Class Cohort & Invite Code Management
   │     • Assignment Dispatcher (Bài tập trắc nghiệm, đọc, nghe, viết)
   │     • Submission Lifecycle & Revision Handling
   │     • Dual-layer Grading (Teacher Final Score vs. AI Pre-grading Draft)
   │
   ├── [M7] AI INTELLIGENCE & PEDAGOGICAL GUARDRAILS
   │     • Context-Aware AI Tutor (State-Machine Enforcement: Unanswered vs Answered)
   │     • Formative Writing & Speaking Evaluator
   │     • Teacher AI Copilot & DOCX Dual-Pipeline Ingestion
   │
   └── [M8] PROGRESS & DATA GOVERNANCE MODULE
         • Dual-Track Progress Display (Trục Nỗ lực vs Trục Năng lực CEFR)
         • Teacher Holistic Student View (Giáo viên xem dữ liệu học sinh lớp)
         • System Analytics & Consent Management [PENDING]
```

---

## 3. MA TRẬN QUAN HỆ DỮ LIỆU LIÊN PHÂN HỆ (SYSTEM RELATIONSHIPS MATRIX)

```
        M1      M2      M3      M4      M5      M6      M7      M8
M1      -       R       -       R/W     R/W     R/W     R       R
M2      R       -       R/W     R       -       R       R       R
M3      -       R       -       R       R       R       R/W     -
M4      R       R       R       -       R/W     R/W     R/W     R/W
M5      R       -       R       R/W     -       R       R       R/W
M6      R/W     R       R/W     R/W     R/W     -       R/W     R/W
M7      R       R       R/W     R/W     R/W     R/W     -       -
M8      R       R       -       R       R       R       -       -
```

### Các Luồng Dữ Liệu Tương Tác Trọng Tâm:
1. **[M6 Classroom] $\rightarrow$ [M5 Vocabulary]**: Từ mới xuất hiện trong bài tập lớp hoặc được giáo viên gợi ý trong phần nhận xét tự động chảy về Tier 1 (`Saved`) hoặc Tier 2 (`Active Queue`) của học sinh.
2. **[M6 Classroom] $\rightarrow$ [M4 Adaptive Engine]**: Kết quả bài tập lớp đạt $\ge 90\%$ kích hoạt tín hiệu *Anti-Smurf*, gửi yêu cầu sang M4 để tạo bài tập xác nhận nâng bậc trong luồng tự học.
3. **[M7 AI Tutor] $\leftrightarrow$ [M4 Adaptive Engine]**: Khi học sinh làm bài và xin trợ giúp từ AI Tutor, M7 gửi nhãn `scaffold_level` (Tự làm, Đã xem hint, Đã xem giải thích) sang M4 để M4 tính toán cập nhật điểm năng lực CEFR một cách thận trọng.
4. **[M3 Content Library] $\leftrightarrow$ [M7 AI Copilot]**: Giáo viên import tệp DOCX; Luồng A parse đề vào M3 ở trạng thái `DRAFT`, Luồng B dùng AI sinh câu hỏi vào M3. Chỉ khi giáo viên duyệt, đề mới được phát hành sang M6.

---

## 4. CẤU TRÚC SITEMAP TOÀN HỆ THỐNG (SYSTEM SITEMAP)

### 4.1. Student Portal Sitemap (4-Tab Navigation)
```
STUDENT PORTAL
├── 1. TAB HỌC (Learn Hub)
│     ├── Hero Action Card: "Tiếp tục bài dở" HOẶC "Bài học đề xuất hôm nay"
│     ├── Skill Grid Selector: [Listening] [Reading] [Writing] [Speaking]
│     ├── Deep Filter Modal [PENDING]: Lọc theo Chủ đề / Dạng bài / Độ khó
│     └── Activity Screen (Duolingo-style Pacing)
│           ├── Reading / Listening / Writing / Speaking Interface
│           ├── Slide-out AI Tutor Drawer (State-enforced guardrails)
│           ├── 4-Step Feedback Bottom Sheet (Hint -> Explain -> Clone)
│           └── Session Summary & Streak Milestone
│
├── 2. TAB ÔN TỪ (Flashcard Vocab Bank)
│     ├── Active Queue Review Hero: "Ôn N từ đến hạn hôm nay"
│     ├── Flashcard Player:
│     │     ├── Front: Từ vựng + Câu khuyết (Bắt buộc tự nhớ trong đầu)
│     │     ├── Flip Interaction (3D physics card flip)
│     │     └── Back: Nghĩa + 4 nút đánh giá: [Lại] [Khó] [Tốt] [Dễ]
│     ├── Backlog Management Alert: Phiên ôn ngắn (5-10 thẻ) & Nút tạm dừng từ mới
│     └── My Word Bank (Quản lý 3 tầng: Đã lưu · Đang học · Đã nhớ)
│
├── 3. TAB LỚP HỌC (Classroom)
│     ├── My Enrolled Classes List & [+ Nhập mã lớp / Link mời]
│     ├── Assignment Feed (Lọc: Cần làm · Đã nộp · Đã chấm)
│     └── Assignment Workspace (Dùng chung component với Tự học + Header lớp)
│           ├── Submission View
│           └── Feedback Viewer (Xem điểm Giáo viên + Bản phân tích AI)
│
└── 4. TAB TIẾN ĐỘ (Progress)
      ├── Trục Nỗ Lực (Effort): Chuỗi ngày (Streak), Số bài đã làm, Số từ đã lật
      ├── Trục Năng Lực (Competency): Đồ thị năng lực CEFR độc lập từng kỹ năng
      ├── Bằng chứng mạnh & Cảnh báo phần chưa đủ dữ liệu
      └── Lịch sử lỗi thường gặp & Nút củng cố nhanh
```

### 4.2. Teacher Portal Sitemap
```
TEACHER PORTAL
├── 1. DASHBOARD (Tổng quan lớp, Bài chờ chấm, Cảnh báo học sinh tụt hậu)
├── 2. CLASSES MANAGEMENT
│     └── [Lớp B1-03]
│           ├── Overview: Tiến độ chung & Mã mời tham gia
│           ├── Classwork: Quản lý bài tập (Tạo đề · Lên lịch · Hạn nộp)
│           ├── Students: Danh sách học sinh & Toàn quyền xem hồ sơ tự học
│           ├── Gradebook: Bảng điểm tổng hợp & Phê duyệt điểm nháp
│           └── Diagnostics: Ma trận điểm yếu của lớp & Đề xuất can thiệp
├── 3. ASSIGNMENT CREATOR STUDIO
│     ├── Manual Question Builder
│     ├── Question Bank Selector
│     ├── AI Copilot Generator (Soạn đề theo chủ đề hoặc theo lỗi của lớp)
│     └── DOCX Ingestion Hub:
│           ├── Pipeline A: Parse đề thi có sẵn (Giữ nguyên gốc 100%)
│           └── Pipeline B: Sinh câu hỏi từ tài liệu nội dung thô
└── 4. QUESTION BANK (Kho câu hỏi cá nhân & Đóng góp kho chung)
```

### 4.3. Admin Portal Sitemap
```
ADMIN CONSOLE
├── 1. USER & ROLE MANAGEMENT (Quản lý tài khoản: 1 role duy nhất cho mỗi user)
├── 2. COURSE & CURRICULUM MANAGEMENT (Cấu trúc Course → Unit → Lesson)
├── 3. CONTENT LIBRARY AUDIT (Kiểm duyệt kho câu hỏi dùng chung & Bản quyền học liệu)
└── 4. SYSTEM & AI GOVERNANCE (Giám sát vận hành, Quota token & Nhật ký lỗi)
```

---

## 5. CÁC ĐIỂM PENDING CẦN CHỐT TIẾP THEO

Các quyết định dưới đây được bảo lưu ở trạng thái **PENDING** và không được tự ý biến thành yêu cầu kỹ thuật cứng cho đến khi có chỉ thị tiếp theo:

1. `PENDING-01`: Danh mục các dạng câu hỏi hỗ trợ trong V1 (Đề xuất: 4 dạng cơ bản).
2. `PENDING-02`: Phạm vi cài đặt tắt AI của Giáo viên (Theo từng bài tập hay Toàn bộ lớp).
3. `PENDING-03`: Cơ chế hạn nộp và nộp lại trong bài tập lớp (Số lần làm lại tối đa).
4. `PENDING-04`: Công thức toán học mở rộng hạn ngạch từ vựng đang học khi Mastery tăng.
5. `PENDING-05`: Chính sách bảo vệ dữ liệu và cơ chế xin phép người học khi dùng bài làm để cải thiện mô hình AI.

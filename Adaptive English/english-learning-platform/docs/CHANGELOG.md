# Workflow Documentation Changelog

## 2026-10-08 — Prototype reconciliation

### Changed
- Student onboarding now keeps the optional goal separate from the required placement test; the test stores the current step and answers on the device and does not invent CEFR or IELTS results from a fixed score.
- Self-learning resumes the saved lesson/question, records whether a hint was used, calculates completion from the submitted answers, and keeps the post-session evidence visible.
- Vocabulary review freezes a due-card queue at session start, excludes saved/future cards, prevents multiple same-day recalls from inflating mastery, and requires explicit activation before a saved word enters the learning queue.
- Classroom membership is now scoped to enrollment IDs; leaving a class removes access to that class without deleting teacher submissions. Custom assignment scores remain classroom scores and are not silently added to the learning profile.
- Teacher assignment creation now requires a review checkpoint before publishing. DOCX preview and writing/speaking feedback are explicitly labeled as demo data until real processing is connected.
- Added visible focus handling, reduced-motion support, keyboard focus containment for AI Tutor, and accessible status/error messages for storage, audio, and microphone failures.

### Verification
- `npm run build` passes for all 29 routes.
- `node --test tests/learning.test.cjs` passes 5 learning-behavior tests.

Tài liệu này ghi nhận toàn bộ các quyết định, bổ sung và thay đổi liên quan đến đặc tả nghiệp vụ, luồng người dùng (User Flows) và kiến trúc chức năng của Adaptive English Learning Platform (AELP).

---

## 2026-10-08 (Phiên Bản 7: Chuẩn Hóa Design System, Mascot Ếch Má Hồng, Motion System & Đồng Bộ FSRS 5 Trạng Thái)

### Added
- Tạo mới tài liệu [`docs/29-design-system-and-ui-specifications.md`](29-design-system-and-ui-specifications.md):
  * **Phong cách cốt lõi**: "Sạch, mềm, có cá tính" theo định hướng **Mềm, tinh tế (Soft & Sophisticated)** kết hợp giữa **Reference thị giác tối giản** (Airy whitespace, mảng nền uốn lượn mềm `#F0F5FF`, nút phụ pill `#EFF6FF`, typography display đậm có cá tính) và **Reference tương tác Duolingo** (Tactile push button đàn hồi lún dứt khoát, phản hồi đáp án tức thì).
  * **Bảng màu & Tokens chuẩn**: Nền Canvas trắng pha xanh nhạt (`#F5F8FF`), màu chính Xanh dương dẫn hướng (`#2563EB`), màu chữ Xanh đen (`#172B4D` - độ tương phản cao, hạn chế chữ xám nhạt), mảng chân trang mềm (`#F0F5FF`), Font chữ chuẩn **Be Vietnam Pro**.
  * **Hình khối & Độ sâu**: Phân nhóm bằng khoảng cách (Spacing-based grouping) thay vì đóng khung card kín; Nút phụ dạng viên thuốc (Pill button `border-radius: 9999px`); Nút CTA chính bo góc `10–12px` có cạnh dưới nổi 3D và phản hồi xúc giác (Tactile Press). Bộ icon bo tròn đồng nhất độ dày nét (2px).
  * **Tiến hóa Mascot Phẳng Tinh Gọn (Ultra-Flat Frog)**: Lược bỏ viền nét đen dày và shading phức tạp để tệp vào ngôn ngữ tối giản; giữ trọn 3 dấu ấn cốt lõi: **Mầm lá trên đầu (Leaf Sprout)** đung đưa trễ nhịp, **Đôi má hồng đào (`#FB7185`)**, và **Khăn quàng xanh dương (`#2563EB`)**.
  * **Hệ thống Motion 2 lớp**: UI Motion (120–300ms) mượt mà, chuyển câu fade & dịch cùng hướng không giật layout; Mascot Motion (600–900ms) xuất hiện có chọn lọc; Zero Motion Zone cho bài Reading dài, Writing essay và ghi âm Speaking.
  * **Mật độ thông tin 3 Role**: Student thoáng đãng tập trung, Teacher mật độ cao với bảng biểu và bộ lọc, Admin quản trị chuẩn mực.
  * **Khung điều hướng Student**: Desktop Sidebar 4 mục (`Học` · `Ôn từ` · `Lớp học` · `Tiến độ`), Mobile Bottom Bar 4 tab, trang chủ phân cấp 1 hành động chính, và chế độ làm bài Focus Mode (AI Tutor side panel trên Desktop, bottom sheet trên Mobile).

### Changed
- Đồng bộ hóa toàn diện mô hình từ vựng 5 trạng thái FSRS (`Đã lưu`, `Đang học`, `Đang củng cố`, `Nhớ ổn định`, `Cần học lại`), tiêu chuẩn nhớ ổn định ($\ge 3$ ngày nhớ đúng + interval $\ge 21$ ngày), 4 nút FSRS (`Quên`, `Khó`, `Nhớ`, `Dễ`) và hạn mức từ mới/ngày vào:
  * [`docs/23-adaptive-engine-and-content-spec.md`](23-adaptive-engine-and-content-spec.md)
  * [`docs/27-comprehensive-state-machines.md`](27-comprehensive-state-machines.md)
- Cập nhật [`README.md`](../README.md) đồng bộ tài liệu đặc tả số 29.

---

## 2026-10-08 (Phiên Bản 6: Hoàn Tất Bộ Đặc Tả Sitemap, 6 Journeys, FSM Chi Tiết & Exception Recovery)

### Added
- Hoàn thành bộ 4 tài liệu đặc tả nâng cao:
  * [`docs/25-complete-sitemap-specification.md`](25-complete-sitemap-specification.md): Sitemap toàn diện có mã Screen ID, Routes, Drawers cho cả 3 Portal (Student, Teacher, Admin).
  * [`docs/26-end-to-end-role-journeys.md`](26-end-to-end-role-journeys.md): 6 kịch bản hành trình đầy đủ từ Onboarding, Kỹ năng, Ôn từ, AI, DOCX đến Lớp học.
  * [`docs/27-comprehensive-state-machines.md`](27-comprehensive-state-machines.md): Máy trạng thái hữu hạn (FSM) chi tiết có Guards & Actions cho Lesson, Session, Vocab FSRS, Assignment Versioning, Submission và Grading.
  * [`docs/28-exception-and-recovery-flows.md`](28-exception-and-recovery-flows.md): Đặc tả xử lý ngoại lệ: Mất mạng, tải lại trang, đổi thiết bị, lỗi ghi âm/rớt mic, nộp bài thất bại, sửa đề đang làm, rời lớp thu hồi quyền, typo heuristics, và skill skip test.
- Hoàn thành 3 sơ đồ Mermaid kỹ thuật mới:
  * [`diagrams/docx-import-pipeline.md`](../diagrams/docx-import-pipeline.md)
  * [`diagrams/exception-recovery-flow.md`](../diagrams/exception-recovery-flow.md)
  * [`diagrams/level-skip-workflow.md`](../diagrams/level-skip-workflow.md)

### Changed
- Cập nhật [`docs/17-permission-matrix.md`](17-permission-matrix.md): Bổ sung quy định thu hồi quyền xem bài và lịch sử khi rời lớp, quyền truy cập phiên bản đề, và bảo mật giữa các học sinh.
- Cập nhật [`README.md`](../README.md) đồng bộ toàn bộ 30 tài liệu đặc tả và 13 sơ đồ Mermaid.

### Added
- Tạo mới tài liệu [`docs/24-module-map-and-system-relationships.md`](24-module-map-and-system-relationships.md):
  * Xác lập Bản đồ Phân hệ Hệ thống (8 Modules: M1 đến M8).
  * Ma trận quan hệ dữ liệu liên phân hệ ($8 \times 8$).
  * Sitemap chi tiết cho cả 3 Portal (Student 4 tabs, Teacher 4 hubs, Admin Console).
  * Bảng kiểm toán quyết định (Decision Audit Log) phân định rõ các mục APPROVED vs. 5 mục PENDING.
- Tạo mới sơ đồ quan hệ hệ thống [`diagrams/module-relationships.md`](../diagrams/module-relationships.md).

### Changed
- Cập nhật [`README.md`](../README.md) đồng bộ bản đồ tài liệu và danh mục sơ đồ Mermaid.
- Đánh dấu trạng thái **APPROVED** cho 6 quyết định chiến lược: Thang CEFR, Quyền AI lớp học (mặc định bật, không làm bài hộ), Scaffolded Attempt Logging, AI chấm tự học, Teacher toàn quyền chấm bài lớp, và Toàn quyền xem dữ liệu học sinh lớp.
- Đánh dấu trạng thái **PENDING** cho 5 hạng mục tiếp theo: Dạng câu hỏi hỗ trợ, Cài đặt tắt AI theo lớp hay theo bài, Chính sách deadline/nộp lại bài lớp, Công thức mở hạn ngạch từ vựng, và Cơ chế phân tách dữ liệu huấn luyện AI.

### Added
- Tạo mới tài liệu [`docs/23-adaptive-engine-and-content-spec.md`](23-adaptive-engine-and-content-spec.md) quy định:
  * Mô hình thích ứng lai 3 cơ chế: Elo/IRT (độ khó bài) + BKT/Skill Graph (mastery vi mô) + FSRS (trí nhớ từ vựng).
  * Cơ chế "Anti-Smurf" từ kết quả bài tập lớp thông qua thử thách xác nhận nhanh (Fast Confirmation Challenge).
  * Quy chuẩn nhập liệu DOCX 2 luồng độc lập: Luồng A (DOCX có đề sẵn) vs. Luồng B (DOCX chỉ có nội dung thô).
  * Phân tách tủ từ vựng 3 tầng: Đã lưu (Shelf) $\rightarrow$ Đang học (Active Queue: Max 30–50 từ) $\rightarrow$ Đã nhớ ổn định (Mastered).
  * Ràng buộc hành vi của AI Tutor theo máy trạng thái thực: Chưa trả lời, Đã trả lời trong tự học, Đã nộp bài lớp chưa trả, và Đã được trả feedback.
  * Nguyên tắc bản quyền học liệu và truy xuất nguồn gốc (Provenance tracking).
- Bổ sung 6 câu hỏi điểm mù chiến lược (Q-012 đến Q-017) vào [`docs/20-open-questions.md`](20-open-questions.md).

### Changed
- Cập nhật [`docs/03-teacher-workflow.md`](03-teacher-workflow.md) bổ sung Cách 4: Nhập liệu DOCX với hai luồng phân tách.
- Cập nhật [`docs/07-vocabulary-workflow.md`](07-vocabulary-workflow.md) bổ sung quản lý tủ từ vựng 3 tầng và hạn ngạch kiểm soát nợ ôn tập.
- Cập nhật [`docs/12-ai-tutor-workflow.md`](12-ai-tutor-workflow.md) bổ sung ma trận hành vi 4 trạng thái của AI Tutor.
- Cập nhật [`README.md`](../README.md) đồng bộ bản đồ tài liệu.

### Added
- Tạo mới tài liệu chuẩn hóa [`docs/22-ux-interaction-mechanics.md`](22-ux-interaction-mechanics.md) chốt 9 cơ chế tương tác vi mô cốt lõi, quy chuẩn điều hướng, lưu trữ nháp, feedback 4 bước, motion không chặn thao tác và bố cục thích ứng di động.
- Chi tiết hóa 3 End-to-End User Journeys với đầy đủ kịch bản gián đoạn (hết pin/mất mạng), rớt microphone, và vòng lặp hint-explain-clone.

### Changed
- **Lưu trạng thái Placement Test theo từng phần (Per-section persistence)**: Mất mạng hoặc thoát app quay lại làm tiếp đúng phần dở.
- **Xem trước ứng dụng (Preview Mode)**: Cho phép người mới xem giao diện 4 tab ở chế độ chỉ đọc trước khi bắt đầu bài test.
- **Trang chủ**: Xác lập cấu trúc phân cấp: 1 Hero Action duy nhất (Tiếp tục bài dở hoặc Bài đề xuất) + 2 Secondary Cards tách biệt cho Ôn từ vựng và Deadline lớp học.
- **Vòng lặp sửa sai**: Áp dụng phễu 4 bước: Cho tự làm $\rightarrow$ Gợi ý (Hint) $\rightarrow$ Giải thích (Explain) $\rightarrow$ Câu hỏi tương tự (Remedial Clone).
- **Cập nhật `docs/19-end-to-end-user-journeys.md` và `README.md`** đồng bộ 100% với các quyết định UX mới.

### Changed (Điều Chỉnh Trọng Tâm & Kiến Trúc Sản Phẩm)
- **Tái định vị bản sắc cốt lõi**: Khẳng định sản phẩm là **App tự học tiếng Anh dùng các dạng hoạt động lấy cảm hứng từ IELTS**, loại bỏ định vị "luyện thi cấp tốc cày điểm"; bỏ mục tiêu Band và ngày thi dồn dập khỏi Onboarding chính.
- **Tái cấu trúc tỷ trọng 3 phân hệ**:
  * **Tự học là luồng chính (Core Engine)**.
  * **Classroom là phần bổ trợ (Extension for homework & teacher feedback)**.
  * **Admin là phần phụ (Operational maintenance)**.
- **Đơn giản hóa Navigation của Student**: Tinh gọn thành 4 tab trực quan: `Học` · `Ôn từ` · `Lớp học` · `Tiến độ`.
- **Tái định hình Onboarding**:
  * Mục tiêu có thể bỏ qua (Optional / Skip) $\rightarrow$ Bài kiểm tra đầu vào bắt buộc ngắn 8–12 phút $\rightarrow$ Khởi tạo hồ sơ ban đầu $\rightarrow$ Bắt đầu học.
  * Quy tắc quyền Mic: Không bắt buộc cấp quyền ghi âm mic; nếu bỏ qua phần nói, Speaking ghi nhận "Chưa đánh giá", tuyệt đối không dùng Writing để suy diễn điểm Speaking.
- **Thuật toán kiểm tra thích ứng trong Placement Test**:
  * Điều chỉnh theo từng phần (Section-level adaptive branching) với giới hạn câu tối đa cố định (Fixed max cap).
  * Thời gian làm bài chỉ là tín hiệu phụ (không phạt oan học sinh do mạng chậm hoặc thao tác nhầm).
- **Hồ sơ năng lực độc lập (No Single Global Level)**:
  * Không gộp tất cả kỹ năng thành 1 điểm tổng duy nhất; từng kỹ năng (Reading, Listening, Writing, Speaking) giữ trạng thái riêng biệt (Mức khởi đầu, Bằng chứng mạnh, Phần cần luyện, Độ tin cậy).
  * Từ vựng và Ngữ pháp đóng vai trò năng lực hỗ trợ, không dùng để cào bằng độ khó cho mọi kỹ năng.
- **Bộ từ vựng cá nhân kiểu Anki**:
  * Tích hợp cơ chế gợi nhớ chủ động (Active Recall): Người học **bắt buộc tự nhớ đáp án trong đầu trước khi lật thẻ flashcard**, không dùng trắc nghiệm đoán mò ở pha ôn từ.
  * Đánh giá 4 mức độ nhớ sau khi lật: `Lại (Again)` · `Khó (Hard)` · `Tốt (Good)` · `Dễ (Easy)` để thuật toán Spaced Repetition tính toán ngày ôn tập tiếp theo.
- **5 Quy tắc thích ứng khoa học kiểm soát độ khó lâu dài**:
  1. Trả lời đúng sau khi xem gợi ý/đáp án không tính là bằng chứng nâng cấp độ khó.
  2. Một lần sai không làm tụt cấp độ ngay lập tức (cần bằng chứng ổn định qua nhiều hoạt động).
  3. Làm lại câu đã biết đáp án chỉ tính là ôn tập, không tính là bằng chứng mới.
  4. Đánh giá của AI là sơ bộ; nếu dữ liệu chưa rõ ràng phải giữ độ tin cậy LOW.
  5. Nút "Quá dễ / Quá khó" chỉ điều chỉnh trải nghiệm thử thách của phiên học, không tự biến thành điểm năng lực.
- **Nguyên tắc phân định quyền hạn trong Tự học**:
  * Người dùng chọn học kỹ năng nào; hệ thống đề xuất độ khó và dạng bài phù hợp bên trong kỹ năng đó.
- **Quy tắc chuyển động UX (UX Motion Principles)**:
  * Nhịp học và phản hồi nhanh, tức thì kiểu Duolingo (chuyển câu, lật thẻ, âm thanh chúc mừng).
  * Chế độ yên tĩnh (Quiet Mode) không hoạt ảnh gây xao nhãng đối với màn hình đọc bài dài (Reading) và viết văn (Writing).

---

## 2026-10-07 (Phiên Bản 1: Khởi Tạo Kho Tài Liệu Phase 0)

### Added
- Khởi tạo cấu trúc dự án Phase 0 phục vụ đặc tả tài liệu (Zero-code specification repository).
- Hoàn thành bộ 22 tài liệu đặc tả nghiệp vụ chi tiết (`docs/00-product-overview.md` đến `docs/21-phase-0-review.md`).
- Xây dựng hệ thống 9 sơ đồ tương tác và vòng đời Mermaid trong thư mục `diagrams/`.
- Thiết lập nguyên tắc cốt lõi: Vòng lặp dữ liệu đóng (Closed Data Loop) giữa Lớp học và Tự học.
- Thiết lập quy trình bất biến cho AI Giáo viên: `AI GENERATED -> DRAFT -> TEACHER REVIEW -> APPROVED -> PUBLISHED`.
- Thiết lập quy chế sư phạm cho AI Tutor: Bắt buộc chuyển sang `Tutor Mode` (Socratic hints) khi học sinh đang làm bài tập lớp.

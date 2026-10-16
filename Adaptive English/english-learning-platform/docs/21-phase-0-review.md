# 21 - Phase 0 Review Report

> **Trạng Thái Tài Liệu**: Báo cáo tổng kết Giai đoạn 0 (Phase 0 Review & Gate Check)  
> **Người Thực Hiện**: Senior Product Manager + Business Analyst + System Analyst  
> **Ngày Lập**: 2026-10-07  
> **Tình Trạng Triển Khai Kỹ Thuật**: TUYỆT ĐỐI CHƯA TRIỂN KHAI (ZERO IMPLEMENTATION)

---

## 1. What Was Documented (Nội Dung Đã Được Tài Liệu Hóa)
Trong Phase 0, toàn bộ khung sản phẩm AELP đã được chuyển hóa thành các tài liệu đặc tả nghiệp vụ chi tiết và sơ đồ luồng hệ thống:
* **Bộ tài liệu nghiệp vụ cốt lõi**: Gồm 22 tài liệu chuẩn format (Goal, Actor, Preconditions, Trigger, Main Flow, Alternatives, Edge Cases, State Changes, Conceptual Data, AI Involvement, Permissions, Open Questions).
* **Mô hình kiến trúc 2 Không gian**: Lớp học (Classroom) và Tự học (Self-Learning) liên kết chặt chẽ qua **Unified Student Learning Profile**.
* **Đặc tả chi tiết từng kỹ năng**: Vocabulary (SRS + 5-step pedagogy), Grammar (Mastery Graph + Error Taxonomy), Listening (Sub-skills), Reading (Evidence mapping), Writing (4-criteria IELTS evaluation + Remedial micro-drills).
* **Cơ chế trí tuệ nhân tạo có kiểm soát**:
  * AI Tutor: Nhận thức ngữ cảnh động + Socratic Guardrails chống làm hộ bài tập lớp.
  * Teacher AI Copilot: Pipeline 5 bước `AI GENERATED -> DRAFT -> REVIEW -> APPROVED -> PUBLISHED`.
* **Hệ thống sơ đồ luồng (9 Diagrams)**: Sử dụng định dạng Mermaid chuẩn cho toàn bộ các quy trình nghiệp vụ và vòng đời đối tượng.

---

## 2. Main Product Workflows (Các Luồng Sản Phẩm Trọng Tâm)
1. **The Core Self-Learning Engine (Tự học là luồng chính)**:  
   Định vị là ứng dụng tự học tiếng Anh với các hoạt động lấy cảm hứng từ IELTS (bài học ngắn, mục tiêu rõ, phản hồi ngay), Classroom đóng vai trò bổ trợ và Admin là phân hệ vận hành.
2. **The Lean Onboarding & Adaptive Test (Kiểm tra đầu vào 8–12 phút)**:  
   Mục tiêu có thể bỏ qua $\rightarrow$ Test thích ứng 5 phần có thanh tiến độ $\rightarrow$ Khởi tạo hồ sơ năng lực từng kỹ năng riêng biệt (không dùng 1 điểm tổng) $\rightarrow$ Đưa ra điểm bắt đầu và điều chỉnh liên tục.
3. **The Dual Entry Pathways (Hai cách bắt đầu học)**:  
   "Học theo kế hoạch" (1 hành động đề xuất rõ ràng duy nhất) vs. "Tự chọn kỹ năng" (học sinh chọn kỹ năng, hệ thống gợi ý độ khó bên trong kỹ năng).
4. **Anki-Style Active Recall Flashcards (Ôn từ gợi nhớ chủ động)**:  
   Bắt buộc tự nhớ đáp án trước khi lật thẻ $\rightarrow$ Đánh giá 4 mức độ nhớ (Lại, Khó, Tốt, Dễ) $\rightarrow$ Spaced repetition giãn khoảng cách ngày ôn.
5. **The Closed Learning Loop (Vòng lặp học tập khép kín)**:  
   `Learn -> Assess -> Analyze -> Update Learning Profile -> Recommend -> Practice -> Re-assess`. Mọi từ mới và lỗi sai từ bài tự học và bài giáo viên giao đều hội tụ về Tủ từ vựng Anki và Hồ sơ cá nhân.
6. **5 Quy Tắc Thích Ứng Khoa Học (Continuous Adaptive Leveling Rules)**:  
   Phân biệt xem gợi ý với tự làm đúng, không tụt cấp vì 1 lần sai, kiểm tra câu lặp lại, giữ độ tin cậy AI sơ bộ, và nút "Quá dễ / Quá khó" chỉ đổi bài chứ không đổi điểm năng lực.

---

## 3. Conflicts / Inconsistencies Found (Các Điểm Xung Đột Đã Phát Hiện & Xử Lý)
* **Xung đột thời gian học (Time Budget Collision)**: Khi học sinh vừa có bài tập về nhà sắp đến hạn nộp, vừa có hàng chục từ vựng đến hạn ôn tập Spaced Repetition.
  * *Giải pháp đề xuất*: Thiết kế bộ điều phối thích ứng (Adaptive Balancer) để phân bổ tỷ lệ thời gian hợp lý (70% bài tập lớp, 30% từ vựng trọng tâm), không để học sinh bị quá tải.
* **Xung đột quyền hạn AI Tutor**: Học sinh có xu hướng lợi dụng AI Tutor để "giải hộ bài tập" do giáo viên giao.
  * *Giải pháp*: Thiết lập cờ `is_teacher_assignment` bắt buộc AI chuyển sang `Tutor Mode` (chỉ đưa gợi ý từng bước, từ chối đưa ra đáp án cuối cùng).
* **Xung đột thẩm quyền chấm điểm**: AI chấm một mức điểm, giáo viên chấm mức điểm khác.
  * *Quy tắc thống nhất*: Điểm số và nhận xét của Giáo viên là căn cứ duy nhất có giá trị pháp lý cuối cùng để ghi nhận vào Learning Profile.

---

## 4. Missing Requirements (Các Yêu Cầu Cần Bổ Sung Trong Các Phase Tiếp Theo)
1. Cơ chế đồng bộ dữ liệu ngoại tuyến (Offline Syncing) khi học sinh mất kết nối internet khi đang làm bài thi bấm giờ.
2. Tiêu chuẩn đánh giá kỹ năng Nói (Speaking Workflow) với AI Voice Recognition thời gian thực (được xếp lịch vào Phase V5).
3. Chính sách xử lý trường hợp gian lận khi làm bài kiểm tra đầu vào (Placement Test Cheating Detection).

---

## 5. Product Risks (Phân Tích Rủi Ro Sản Phẩm)
* **Rủi ro chi phí API LLM (Cost Risk)**: Việc gọi AI phân tích bài viết đa tiêu chí và hỗ trợ gia sư thời gian thực có thể tiêu tốn chi phí lớn nếu không có chính sách hạn ngạch (Token Quota) hợp lý.
* **Rủi ro ảo giác AI (Hallucination Risk)**: AI có thể sinh các câu hỏi ngữ pháp có đáp án mơ hồ hoặc văn phong không tự nhiên.
  * *Biện pháp giảm thiểu*: Bắt buộc giữ nguyên tắc giáo viên phải duyệt (`Human-in-the-loop`) trước khi bài tập được xuất bản.
* **Rủi ro pháp lý thương hiệu (Legal/Brand Risk)**: Việc công bố điểm IELTS không chính thức có thể vi phạm bản quyền khảo thí quốc tế.
  * *Biện pháp giảm thiểu*: Chỉ sử dụng thuật ngữ `Estimated IELTS Band` kèm chỉ số tin cậy `Confidence`.

---

## 6. Questions Requiring PM Decision (Các Quyết Định Cần PM Phê Duyệt)
Xem danh mục chi tiết 11 câu hỏi tại [`docs/20-open-questions.md`](20-open-questions.md), đặc biệt là:
1. `Q-001`: Thuật toán cân đối thời gian giữa bài tập về nhà và ôn từ vựng SRS.
2. `Q-003`: Quyền của giáo viên trong việc tắt AI Tutor cho bài kiểm tra 15 phút.
3. `Q-006`: Cơ chế hạn mức lượt dùng AI Tutor cho học sinh.
4. `Q-010`: Thẩm quyền chốt điểm cuối cùng giữa Giáo viên và AI.

---

## 7. What Is NOT Implemented (Cam Kết Tuyệt Đối Không Triển Khai Trong Phase 0)
* ❌ Không có bất kỳ dòng code Frontend nào (No React, Vue, HTML, CSS, hay UI mockups).
* ❌ Không có bất kỳ dòng code Backend nào (No Node.js, Express, FastAPI, NestJS).
* ❌ Không có bất kỳ Database Schema hay Migration nào (No SQL DDL, Prisma schema, MongoDB models).
* ❌ Không có cấu hình Package Manager hay Build Tools (No package.json, requirements.txt, Dockerfile).
* ❌ Không tạo mock code hoặc pseudo-code nhằm "chuẩn bị trước".

---

## 8. Recommended Next Phase (Đề Xuất Bước Đi Tiếp Theo)

> **ĐỀ XUẤT: CHUYỂN SANG PHASE 1 — INFORMATION ARCHITECTURE & UX WIREFRAMING SPECIFICATION**

* **Mục tiêu của Phase 1**:
  * Phê duyệt các quyết định còn treo trong `docs/20-open-questions.md`.
  * Thiết kế sơ đồ kiến trúc thông tin chi tiết (Information Architecture - IA).
  * Đặc tả cấu trúc màn hình (Screen Specifications) và luồng tương tác UX (User Interaction Flows) cho cả 3 Portal (Student, Teacher, Admin).
* **Lưu ý**: Chỉ bắt đầu Phase 1 sau khi PM và các bên liên quan đã đọc, phản biện và chính thức ký duyệt (Sign-off) toàn bộ tài liệu của Phase 0.

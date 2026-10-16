# 13 - Teacher AI Copilot Workflow

## Goal
Quy định chi tiết cơ chế vận hành của **Teacher AI Copilot** – công cụ hỗ trợ giáo viên tăng năng suất soạn bài, tự động phân tích dữ liệu lỗi của lớp học để sinh bài tập can thiệp trúng đích (Data-Driven Remedial Generation), tuân thủ nghiêm ngặt quy trình duyệt bài có con người kiểm soát (Human-in-the-Loop).

## Actor
- Teacher (Người ra lệnh, duyệt và chỉnh sửa)
- Teacher AI Copilot Engine (Trợ lý AI phân tích và sinh nội dung)

## Preconditions
- Giáo viên đang phụ trách ít nhất một lớp học có dữ liệu hoạt động hoặc có nhu cầu tạo bài tập mới từ đầu.

## Trigger
- Giáo viên bấm nút `[AI Copilot]` tại màn hình tạo bài tập hoặc bấm `[Generate Practice for Class]` trên Dashboard phân tích lớp học.

---

## Main Flow: Quy Trình Soạn Bài Tập Thích Ứng Bằng AI

### 1. Phễu Duyệt Bài 5 Bước (The 5-Step Pipeline)
Nguyên tắc bất biến: **AI KHÔNG BAO GIỜ ĐƯỢC TỰ ĐỘNG GIAO BÀI TRỰC TIẾP CHO HỌC SINH**. Mọi nội dung do AI sinh ra bắt buộc phải đi qua phễu duyệt:

```
[1. TEACHER PROMPT / CONFIGURATION]
  Giáo viên chọn cấu hình hoặc nhập yêu cầu cụ thể
         ↓
[2. AI GENERATE]
  Copilot quét ngân hàng kiến thức và dữ liệu lỗi của lớp để tạo nội dung
         ↓
[3. DRAFT CREATION]
  Bài tập được lưu tạm vào không gian riêng của giáo viên (Trạng thái: DRAFT)
         ↓
[4. TEACHER REVIEW & EDIT]
  Giáo viên kiểm tra tính sư phạm, bấm [Regenerate] từng câu hoặc tự sửa tay
         ↓
[5. APPROVAL & PUBLISH]
  Giáo viên bấm [Approve] ──► Lưu vào Question Bank hoặc Giao trực tiếp cho lớp
```

---

### 2. Các Nguồn Dữ Liệu Đầu Vào Để AI Sinh Bài Tập (Input Sources)
Giáo viên có thể kích hoạt AI Copilot theo 2 chế độ chính:

#### Chế Độ 1: Soạn Bài Theo Tiêu Chuẩn Học Thuật (Standard Generation)
Giáo viên nhập các tham số đầu vào:
* **Chủ đề (Topic)**: Ví dụ *Climate Change*, *Daily Routines*, *Workplace Communication*.
* **Khung năng lực (CEFR / Target Band)**: B1 / B2 / IELTS Band 5.5 - 6.5.
* **Kỹ năng mục tiêu (Skill & Concept)**: *Grammar $\rightarrow$ Present Perfect vs Past Simple*.
* **Định dạng câu hỏi**: Trắc nghiệm 4 phương án, Điền từ vào chỗ trống, Sửa lỗi sai trong đoạn văn.
* **Số lượng câu hỏi**: Ví dụ 10 câu.
* **Độ tuổi / Đối tượng**: Học sinh THPT (15–17 tuổi).

#### Chế Độ 2: Soạn Bài Can Thiệp Dựa Trên Dữ Liệu Lỗi Thực Tế Của Lớp (Data-Driven Class Weakness - Core Moat)
Đây là tính năng độc đáo giúp giáo viên giải quyết chính xác vấn đề của lớp chỉ với 1 click:
1. Giáo viên mở báo cáo tuần của Lớp B1-03:
   * Hệ thống chỉ ra: *Mạo từ (Articles) sai 43%, Câu điều kiện (Conditionals) sai 38%, Từ vựng học thuật sai 34%*.
2. Giáo viên bấm: `[Generate practice for class]`.
3. AI Copilot tự động tạo cấu trúc bài tập 15 câu:
   * 6 câu Mạo từ (tập trung đúng các bối cảnh mà học sinh trong lớp vừa làm sai nhiều nhất trong tuần).
   * 5 câu Câu điều kiện loại 1 & 2.
   * 4 câu Vận dụng từ vựng học thuật trong ngữ cảnh bài đọc ngắn.

---

### 3. Giao Diện Biên Tập & Phê Duyệt Của Giáo Viên (Review Studio)
Màn hình Review của giáo viên cung cấp các công cụ kiểm soát chất lượng:
* **Inline Edit**: Click đúp vào bất kỳ câu hỏi, phương án đáp án hoặc lời giải thích nào để chỉnh sửa câu chữ theo phong cách giảng dạy riêng.
* **Single Question Regenerate**: Nếu câu số 4 quá khó hoặc văn phong không phù hợp, giáo viên chỉ cần bấm nút làm mới tại câu số 4 mà không phải sinh lại cả đề.
* **Save to Personal Question Bank**: Lưu các câu hỏi ưng ý vào kho cá nhân của giáo viên để tái sử dụng cho các khóa học sau.
* **Metadata Tagging Verification**: Kiểm tra nhãn độ khó và mã kỹ năng (Skill Node Tag) mà AI đã gắn cho từng câu.

---

## Alternative Flows
- **Tạo bài tập phân hóa theo nhóm học sinh (Differentiated Cohort Generation)**: AI Copilot tự động chia lớp thành 2 nhóm dựa trên điểm làm bài: Nhóm Cần Củng Cố (nhận bài tập bổ trợ kiến thức nền) và Nhóm Nâng Cao (nhận bài tập mở rộng phát triển tư duy).

---

## Error / Edge Cases
- **AI sinh nội dung có định kiến văn hóa hoặc thông tin không chính xác (Hallucination)**: Giáo viên phát hiện trong bước Review và bấm nút `[Reject & Report]` $\rightarrow$ Hệ thống ghi nhận phản hồi để tinh chỉnh prompt hệ thống.

---

## State Changes
- Bản nháp bài tập: `AI_GENERATED` $\rightarrow$ `TEACHER_REVIEW` $\rightarrow$ `APPROVED` $\rightarrow$ `ASSIGNED`.

---

## Data Conceptually Involved
- `CopilotGenerationPrompt`, `ClassAggregatedWeaknessSnapshot`, `GeneratedQuestionDraft`, `TeacherEditHistory`, `ApprovedQuestionItem`.

---

## AI Involvement
- **AI Educational Task Generator**: Sinh câu hỏi, bài đọc, lời giải thích và phương án gây nhiễu hợp lý (Distractors).
- **Class Weakness Synthesizer**: Trích xuất mẫu số chung các lỗi sai của cả lớp.

---

## Permissions
- Chỉ giáo viên của lớp mới có quyền truy cập dữ liệu lỗi của lớp đó để kích hoạt AI Copilot.

---

## Open Questions
- Xem [`docs/20-open-questions.md`](20-open-questions.md) mục `Teacher` & `AI` (Q-005, Q-010).

# Content Data Contract

## 1. Tổng Quan

Tài liệu này xác định hợp đồng dữ liệu chuẩn (Data Contract) cho kho học liệu của hệ thống **Adaptive Study** (ứng dụng học tiếng Anh thích ứng, các hoạt động lấy cảm hứng từ cấu trúc bài thi IELTS và khung năng lực CEFR).

Mọi hoạt động thu thập, chuẩn hóa, thẩm định và tổ chức cây khóa học (Course $\rightarrow$ Unit $\rightarrow$ Lesson $\rightarrow$ Activity) đều phải tuân thủ nghiêm ngặt các lược đồ và nguyên tắc được định nghĩa dưới đây.

---

## 2. Nguyên Tắc Cốt Lõi

1. **Tính Bền Vững & Không Giả Mạo (No Synthetic Fabrication)**:
   - Dữ liệu thiếu phải được lưu dưới dạng `null` hoặc mã trạng thái rõ ràng (`unknown`, `uncalibrated`). Tuyệt đối không tự bịa đáp án, audio, cấp độ CEFR hoặc rubric để lấp chỗ trống.
2. **Tách Biệt CEFR & Elo Độ Khó**:
   - `cefr_origin` có 3 giá trị: `source` (nguồn chính thức cung cấp), `estimated` (ước lượng qua thuật toán/thang đo có kiểm soát), hoặc `unknown`.
   - CEFR không tương đương với điểm xếp hạng thích ứng (Elo/IRT). Mọi bài tập mới thu thập từ crawler bắt buộc có `difficulty_status = "uncalibrated"`. Chỉ tương tác người dùng thực tế và pipeline hiệu chỉnh (calibration) mới được chuyển trạng thái này sang `calibrated`.
3. **Bản Quyền & Nguồn Gốc Nội Dung (IP & Provenance)**:
   - Mỗi bản ghi phải mang đầy đủ thông tin: `source_url`, `source_name`, `license`, `attribution`, `retrieved_at`, và `source_content_hash`.
   - `content_origin` phân biệt rõ: `source` (nguyên bản), `ai_generated` (do AI sinh), hoặc `mixed`.

---

## 3. Lược Đồ Hoạt Động (Activity Schema)

Mỗi bản ghi trong `data/normalized/activities.jsonl` là một đối tượng JSON đại diện cho một hoạt động học tập độc lập:

| Trường | Kiểu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `id` | `string` | Có | Định danh duy nhất và ổn định, dạng `<skill>-<source_code>-<uuid/hash>` |
| `title` | `string` | Có | Tiêu đề hoạt động học tập |
| `skill` | `string` | Có | Một trong: `"reading"`, `"listening"`, `"grammar"`, `"vocabulary"`, `"writing"`, `"speaking"` |
| `activity_type` | `string` | Có | Phân loại hoạt động: `"reading_comprehension"`, `"audio_comprehension"`, `"grammar_drill"`, `"vocab_expansion"`, `"essay_prompt"`, `"speaking_task"` |
| `topic_tags` | `string[]` | Có | Các nhãn chủ đề IELTS/học thuật (ví dụ: `["Science", "Environment"]`) |
| `learning_objectives` | `string[]` | Có | Mục tiêu học tập cụ thể |
| `source_url` | `string` | Có | URL nguồn thu thập |
| `source_name` | `string` | Có | Tên nguồn phát hành |
| `license` | `string` | Có | Giấy phép bản quyền (ví dụ: `"CC BY-SA 4.0"`, `"Public Domain"`) |
| `attribution` | `string` | Có | Chuỗi ghi nhận công trạng tác giả |
| `retrieved_at` | `string` | Có | Thời điểm thu thập theo chuẩn ISO 8601 |
| `source_content_hash`| `string` | Có | Mã SHA-256 của nội dung thô ban đầu để phát hiện trùng lặp |
| `content` | `string` | Có | Nội dung bài đọc, bài nghe (transcript/text), hướng dẫn ngữ pháp, hoặc đề bài viết/nói |
| `questions` | `Question[]` | Có | Danh sách câu hỏi kèm theo (rỗng `[]` nếu hoạt động thuần tiếp nhận) |
| `answer_key` | `object \| string \| null` | Không | Bảng đáp án tổng hợp (nếu nguồn có) |
| `explanation` | `string \| null` | Không | Giải thích phương pháp làm hoặc đáp án từ nguồn |
| `media_references` | `MediaRef[] \| null` | Không | Danh sách tệp âm thanh/hình ảnh tham chiếu có bản quyền |
| `cefr_level` | `string \| null` | Không | Một trong `"A1"`, `"A2"`, `"B1"`, `"B2"`, `"C1"`, `"C2"`, hoặc `null` |
| `cefr_origin` | `string` | Có | Một trong: `"source"`, `"estimated"`, `"unknown"` |
| `difficulty_status` | `string` | Có | Bắt buộc là `"uncalibrated"` cho dữ liệu mới thu thập |
| `review_status` | `string` | Có | Một trong: `"pending"`, `"approved"`, `"rejected"` |
| `content_origin` | `string` | Có | Một trong: `"source"`, `"ai_generated"`, `"mixed"` |

### Cấu Trúc Câu Hỏi (`Question`)

```typescript
export interface Question {
  id: string;
  type:
    | "single_choice"
    | "multiple_choice"
    | "short_answer"
    | "gap_fill"
    | "matching"
    | "ordering"
    | "writing"
    | "speaking";
  prompt: string;
  options?: { id: string; text: string }[] | null;
  answer: string | string[];
  accepted_answers?: string[] | null;
  explanation?: string | null;
  source_locator?: string | null; // Vị trí trong đoạn văn bản (start_char, paragraph_index, v.v.)
}
```

### Cấu Trúc Tham Chiếu Media (`MediaRef`)

```typescript
export interface MediaRef {
  type: "audio" | "image";
  url: string;
  local_path?: string | null;
  license: string;
  mime_type: string;
  duration_seconds?: number | null;
}
```

---

## 4. Lược Đồ Từ Vựng (Vocabulary Schema)

Mỗi bản ghi trong `data/normalized/vocabulary.jsonl` đại diện cho một từ vựng học thuật/tổng quát:

| Trường | Kiểu | Mô tả |
| :--- | :--- | :--- |
| `id` | `string` | Mã định danh từ (`vocab-<term>`) |
| `word` | `string` | Từ vựng chuẩn hóa Unicode (lowercase) |
| `phonetic` | `string` | Phiên âm IPA |
| `audio_url` | `string \| null` | Liên kết file phát âm có bản quyền mở (từ Wikimedia Commons) |
| `audio_license` | `string \| null` | Giấy phép file âm thanh |
| `meanings` | `MeaningSense[]` | Danh sách các nét nghĩa theo từng từ loại (không được gộp làm mất nghĩa) |
| `tags` | `string[]` | Chủ đề từ vựng (ví dụ: `["Academic", "Environment"]`) |
| `cefr_level` | `string \| null` | Cấp độ CEFR |
| `cefr_origin` | `string` | Nguồn gốc cấp độ (`"source"`, `"estimated"`, `"unknown"`) |
| `source_name` | `string` | Tên từ điển nguồn |
| `license` | `string` | Giấy phép sử dụng |
| `attribution` | `string` | Ghi nhận tác giả |
| `retrieved_at` | `string` | Thời gian crawl |

Trong đó mỗi nét nghĩa (`MeaningSense`):
```typescript
export interface MeaningSense {
  partOfSpeech: string; // "noun" | "verb" | "adj" | "adv" ...
  definitions: {
    definition: string;
    example?: string | null;
    synonyms?: string[];
  }[];
}
```

---

## 5. Lược Đồ Khóa Học (Course $\rightarrow$ Unit $\rightarrow$ Lesson Catalog)

Để tương thích tuyệt đối với `english-learning-platform/src/types/index.ts`:

- **Course (`courses.json`)**:
  - `id`: Định danh khóa học.
  - `title`: Tên khóa học (ví dụ: `"IELTS Academic Reading Foundation B1"`).
  - `skill`: Kỹ năng chính (`"reading"`, `"listening"`, `"grammar"`, v.v.).
  - `target_level`: Cấp độ mục tiêu (`"A2"`, `"B1"`, `"B2"`, `"C1"`).
  - `description`: Mô tả tổng quát.
  - `unit_ids`: Danh sách ID các Unit trực thuộc theo thứ tự.

- **Unit (`units.json`)**:
  - `id`: Định danh bài học lớn.
  - `course_id`: Thuộc khóa học nào.
  - `title`: Tên Unit (ví dụ: `"Unit 1: The Natural World & Ecosystems"`).
  - `description`: Trọng tâm bài học.
  - `order`: Số thứ tự trong Course.
  - `lesson_ids`: Danh sách ID các bài học nhỏ (Lesson).

- **Lesson (`lessons.json`)**:
  - `id`: Định danh bài học nhỏ.
  - `skill`: Kỹ năng học tập.
  - `unitId`: Khóa ngoại tham chiếu đến Unit.
  - `unitTitle`: Tên Unit hiển thị.
  - `courseTitle`: Tên Course hiển thị.
  - `title`: Tiêu đề bài học.
  - `description`: Hướng dẫn mục tiêu bài học.
  - `durationMinutes`: Thời lượng ước tính.
  - `targetCefr`: Cấp độ CEFR mục tiêu.
  - `activity_ids`: Danh sách ID các hoạt động tham chiếu trong `activities.jsonl` (không nhân bản dữ liệu).
  - `questions`: Mảng câu hỏi được map trực tiếp từ các activity tham chiếu để frontend render ngay lập tức.

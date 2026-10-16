# Content Pipeline Architecture & Operation

## 1. Kiến Trúc Pipeline

Hệ thống Content Pipeline của **Adaptive Study** được thiết kế dưới dạng luồng dữ liệu độc lập, phân tách rõ ràng giữa các giai đoạn:

```
[Registry] (data/sources/source-registry.json)
    │
    ▼
[Stage 1: Crawl] (scripts/content_pipeline/crawl.py)
    │ ── Cache raw payloads & checkpoints ──► data/raw/
    ▼
[Stage 2: Normalize] (scripts/content_pipeline/normalize.py)
    │ ── Clean, map schema & extract questions ──► data/normalized/
    ▼
[Stage 3: Validate & Quarantine] (scripts/content_pipeline/validate.py)
    │ ── Invalid / Corrupt / Duplicate ──► data/quarantine/
    │ ── Valid Records ──► activities.jsonl & vocabulary.jsonl
    ▼
[Stage 4: Build Catalog] (scripts/content_pipeline/build_catalog.py)
    │ ── Link Courses, Units, Lessons ──► data/catalog/
    ▼
[Stage 5: Reporting]
    └── data/reports/ (coverage.json, quality-report.md, rights-report.md)
```

---

## 2. Các Quy Tắc Kỹ Thuật

1. **Khả Năng Chạy Lại & Khôi Phục (Idempotency & Resumption)**:
   - Crawler lưu các tệp trạng thái checkpoint tại `data/raw/.checkpoint_<source>.json`.
   - Nếu tiến trình bị ngắt giữa chừng, lần chạy kế tiếp sẽ tự động bỏ qua các mục đã tải thành công.
   - Hàm chuẩn hóa và phân loại áp dụng ID băm ổn định dựa trên nguồn và nội dung gốc để không tạo bản ghi trùng lặp.
2. **Kiểm Soát Tốc Độ & Lịch Sự Với Máy Chủ (Rate Limiting & Backoff)**:
   - Giới hạn tốc độ theo từng tên miền (mặc định 0.5s - 1.0s giữa các yêu cầu).
   - Thiết lập `User-Agent` định danh rõ ràng mục đích nghiên cứu giáo dục.
   - Tự động bắt mã lỗi `429` (Too Many Requests) và `503`, áp dụng exponential backoff và tuân thủ tiêu đề `Retry-After`.
   - Khi gặp mã lỗi `403` (Forbidden) hoặc cơ chế chặn, pipeline dừng việc cào tên miền đó và ghi nhận vào báo cáo, tuyệt đối không cố gắng bẻ khóa hoặc né tránh.
3. **Quản Lý Bản Quyền (Rights Management)**:
   - Trước khi cào bất kỳ nguồn nào, hệ thống kiểm tra trạng thái trong `source-registry.json`. Chỉ những nguồn có trạng thái `"approved"` mới được nạp nội dung.
   - Mọi tệp audio tải về được kiểm tra giấy phép công khai (CC BY-SA hoặc Public Domain), kiểm tra định dạng MIME (`audio/ogg`, `audio/mpeg`), và lưu metadata vào `data/media/`.

---

## 3. Hướng Dẫn Tái Tạo Pipeline

Pipeline yêu cầu môi trường Python 3.10+ cùng các thư viện chuẩn trong repo:

```bash
# 1. Cài đặt các thư viện cần thiết (nếu chưa có)
pip install beautifulsoup4 requests

# 2. Khám phá và kiểm tra danh mục nguồn
python scripts/content_pipeline/discover_sources.py

# 3. Chạy Pilot (thu thập 30-50 activities, ~100 từ vựng)
python scripts/content_pipeline/crawl.py --mode pilot
python scripts/content_pipeline/normalize.py
python scripts/content_pipeline/validate.py
python scripts/content_pipeline/build_catalog.py

# 4. Chạy Mở Rộng Toàn Bộ (Full Expansion - 300+ activities, 1,000+ từ vựng)
python scripts/content_pipeline/crawl.py --mode full
python scripts/content_pipeline/normalize.py
python scripts/content_pipeline/validate.py
python scripts/content_pipeline/build_catalog.py
```

---

## 4. Phân Biệt Các Cấp Độ Sẵn Sàng Của Dữ Liệu

- **Thu thập thành công (Raw Ingested)**: Dữ liệu thô đã được tải về đĩa kèm mã hash.
- **Đủ cấu trúc (Normalized & Schema Valid)**: Dữ liệu đã vượt qua bộ lọc validate, không có trường null bất thường, ID duy nhất.
- **Đã review nội dung (Content Reviewed)**: Chuyên gia sư phạm hoặc biên tập viên đã đọc qua và duyệt (trạng thái `review_status = "approved"`).
- **Sẵn sàng dùng trong sản phẩm (Production Ready)**: Hoạt động đã liên kết vào Lesson trong catalog, có tương tác người dùng thực tế để hiệu chỉnh độ khó.

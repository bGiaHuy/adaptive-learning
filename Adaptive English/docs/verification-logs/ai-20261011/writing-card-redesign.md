# EN-20261011-05 — Thiết kế lại thẻ chấm Writing

Ngày đối chiếu: 2026-10-11 Asia/Saigon.
- Chỉ sửa WritingEvaluation.tsx và thêm WritingEvaluation.module.css. Thẻ chung dùng trong lesson và summary.
- Xóa dòng Đánh giá tự động để luyện tập; điểm chính thức của bài tập lớp do giáo viên quyết định theo yêu cầu chủ dự án.
- Điểm lớn + thanh tổng/ba tiêu chí; nhận xét chung nền xanh lam, điểm tốt xanh lá nhạt, cần cải thiện đỏ nhạt; các vùng bo 20px. Grid thu thành một cột dưới breakpoint sm. Không đổi API, điểm, DB hay nội dung nhận xét.
- Animation transform scaleX từ 0 đến score/9, 1000ms, stagger 0/100/220/340ms; IntersectionObserver kích hoạt khi vùng điểm xuất hiện. Có aria progressbar và prefers-reduced-motion tắt animation.

Kiểm tra thực:
- node node_modules/typescript/bin/tsc --noEmit, cwd english-learning-platform: PASS exit 0.
- Browser local summary: cả hai kết quả cũ vẫn hiển thị, dòng bị xóa có 0 phần tử. Quan sát ảnh màu/bố cục và computed transform của 8 thanh: 3.5/9=.388889, 4/9=.444444, 3/9=.333333, 7/9=.777778; animationName WritingEvaluation_fill-score__jZcCK sau khi thẻ vào viewport. Thẻ ngoài viewport ban đầu có scaleX 0.
- Lúc hot reload thêm CSS module lần đầu, thanh hiển thị đầy, animation none. Tải lại stylesheet bằng reload đã khắc phục; kiểm lại computed transform và ảnh. Không coi ảnh đầu là PASS.
- Ảnh mới chụp đủ thẻ và cắt riêng vùng card từ ảnh toàn trang theo bounds DOM, loại thanh tài khoản. Đã xem ảnh, không chồng chữ. Không chạy lại API AI vì không đổi chấm điểm; không nộp bài/reset/seed DB/deploy.
- Chưa kiểm trực quan breakpoint mobile, chế độ reduced-motion hoặc lỗi network cho thay đổi giao diện này. Chưa render Word do thiếu soffice.

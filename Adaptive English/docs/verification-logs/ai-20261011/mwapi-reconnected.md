# EN-20261011-02 — Khôi phục kết nối AI local

Ngày đối chiếu: 2026-10-11 Asia/Saigon.
- Trước sửa: web localhost:3008 trả POST /api/ai/tutor 500 trong 14–409ms. Node fetch HTTPS MWAPI trong sandbox báo TypeError, cause EACCES (lệnh exit 0 vì catch và in lỗi; kết nối FAIL).
- Cùng phép thử ngoài sandbox: HTTP 200, exit 0. Không in khóa hoặc body upstream.
- Dừng đúng dev server phiên trước, chạy lại nguồn hiện tại: BASE_URL=http://localhost:3008; node node_modules/next/dist/bin/next dev -p 3008 -H localhost, với mạng được phép. Next.js 14.2.35 Ready in 1757ms.
- Thao tác browser: mở /student/learn/writing/g6-u2-les-04, nhấn Hỏi AI Tutor khi bản nháp trống. Không nộp bài hay sửa DB để kiểm thử.
- Kết quả trực tiếp: POST /api/ai/tutor 200 in 3042ms; drawer hiển thị gợi ý tìm chủ ngữ, lời khích lệ và nhãn Gợi ý từ AI, không còn alert lỗi.
- Ảnh tutor-reconnected.png chứng minh trạng thái giao diện, không chứng minh độ ổn định lâu dài.
- Không sửa mã ứng dụng, không deploy; không chạy TypeScript/build vì xử lý môi trường tiến trình. Word chưa kiểm tra phân trang trực quan: soffice không có trong PATH.

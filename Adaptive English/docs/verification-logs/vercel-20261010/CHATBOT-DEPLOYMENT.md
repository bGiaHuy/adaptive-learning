# Kết nối chatbot production ngày 10/10/2026

Chủ dự án yêu cầu đưa cấu hình API chatbot lên Vercel. Codex thực hiện trên dự án adaptivelearning.

- Vercel CLI 63.1.2, Node 24.19.0. Đưa MWAPI_API_KEY (Secret), MWAPI_BASE_URL và MWAPI_MODEL vào production bằng stdin; cả ba lệnh exit 0, không ghi giá trị secret vào log.
- Redeploy chính bản đã phát hành, không upload dữ liệu local hoặc thay mã ứng dụng: dpl_7NNBJvkqmR8oPdW72QLhdwtWs5ej. Lệnh redeploy exit 0; log build ghi Deployment completed và Ready. URL công khai https://adaptiveenglish.vercel.app đã nhận cấu hình mới.
- Kiểm tra GET /api/ai/tutor: HTTP 200, isConfigured=true, provider=mwapi, model=claude-sonnet-4-6. POST /api/ai/chat không đăng nhập: HTTP 401.
- Kiểm thử trực tiếp upstream bằng Python urllib: HTTP 403, bộ kiểm tra exit 1. Không kết luận khóa sai từ kết quả này.
- Đối chiếu bằng Node fetch tương ứng runtime ứng dụng: HTTP 200, có phản hồi giải nghĩa resilient bằng tiếng Việt, exit 0. Đây là request giả trực tiếp tới provider bằng cùng cấu hình đã đưa lên, không phải hội thoại đăng nhập qua Vercel. Chưa kiểm tra parser JSON và đầy đủ luồng hội thoại trên production.
- Bộ kiểm thử tạo tài khoản production/lưu lịch sử/dọn tài khoản bị automatic approval review từ chối trước khi chạy vì quyền deploy chưa bao gồm truy cập credential database và tạo/xóa dữ liệu production. Script có sẵn không có nghĩa đã chạy. Không đọc credential database, không tạo/xóa tài khoản, không có file env kiểm thử được tạo.
- Build vẫn báo 9 dependency vulnerabilities đã biết; không nâng cấp force trong tác vụ nối cấu hình.
- Nhật ký được xuất lại và chạy --check. Bản Word chưa kiểm tra phân trang trực quan do thiếu soffice.exe đã ghi ở MB72; không sửa bản mẫu hoặc hash minh chứng cũ.

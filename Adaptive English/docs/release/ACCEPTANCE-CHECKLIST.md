# Bảng Kiểm Thử Nghiệm Thu Độc Lập (Acceptance Checklist)

> **Dành cho**: Khách hàng, Chủ dự án và Đơn vị nghiệm thu độc lập  
> **Ứng dụng**: Adaptive English (`english-learning-platform`)  
> **Hướng dẫn**: Đơn vị nghiệm thu có thể tự thực hiện từng bước kiểm thử dưới đây trên trình duyệt web và đối chiếu kết quả mong đợi.

---

## Bảng Tiêu Chí Nghiệm Thu Chức Năng & Bảo Mật

| STT | Phân hệ / Hạng mục | Các bước thao tác kiểm thử | Kết quả mong đợi | Đánh giá |
|:---:|---|---|---|:---:|
| **1** | **Xác thực Chưa Đăng nhập** | Mở tab ẩn danh, gõ trực tiếp URL `/admin`, `/teacher/dashboard`, hoặc `/student/home` | Hệ thống chuyển hướng ngay lập tức về `/auth/login` kèm tham số redirect. Không hiển thị bất kỳ nội dung dữ liệu nào. | [ ] ĐẠT |
| **2** | **Đăng nhập Thật & Khóa Cookie** | 1. Nhập sai mật khẩu.<br>2. Nhập đúng mật khẩu.<br>3. Mở DevTools kiểm tra Application > Cookies. | 1. Báo lỗi sai thông tin đăng nhập, không tạo cookie.<br>2. Đăng nhập thành công.<br>3. Cookie `adaptive_session_token` có cờ `httpOnly` và `sameSite: Lax`. | [ ] ĐẠT |
| **3** | **Chống Mạo Danh Quyền** | Tạo tài khoản học sinh, cố tình sửa cookie hoặc gọi API `/api/admin/stats` | Máy chủ từ chối với mã lỗi `403 Forbidden`. Không trả dữ liệu quản trị viên. | [ ] ĐẠT |
| **4** | **Vô Hiệu Hóa Demo Switcher** | Kiểm tra màn hình đăng nhập và góc dưới giao diện trên môi trường Production | Không xuất hiện hộp thoại Role Switcher. Gọi `POST /api/auth/switch-role` trả về `403 Forbidden`. | [ ] ĐẠT |
| **5** | **Khôi Phục Mật Khẩu (Recover)** | 1. Nhập một email không tồn tại.<br>2. Nhập email tài khoản có thật.<br>3. Yêu cầu liên tục 4 lần. | 1. Hiển thị thông báo trung tính thành công (chống email enumeration).<br>2. Hiển thị thông báo đã tiếp nhận yêu cầu.<br>3. Lần thứ 4 bị chặn với mã `429 Too Many Requests`. | [ ] ĐẠT |
| **6** | **Đặt Lại Mật Khẩu & Hủy Phiên Cũ** | 1. Đăng nhập tài khoản trên Thiết bị A.<br>2. Đặt lại mật khẩu mới qua liên kết token trên Thiết bị B.<br>3. Quay lại Thiết bị A gọi thao tác bất kỳ. | 1. Thiết bị B đổi mật khẩu thành công.<br>2. Thiết bị A bị đăng xuất ngay lập tức (phiên cũ bị thu hồi `401 Unauthorized`).<br>3. Không thể đăng nhập lại bằng mật khẩu cũ. | [ ] ĐẠT |
| **7** | **Làm Bài Đầu Vào & Khôi Phục Dở Dang** | 1. Đăng nhập học sinh mới, làm bài Placement Test đến câu số 3.<br>2. Tải lại trang (F5) hoặc đóng trình duyệt mở lại. | Trạng thái bài làm được khôi phục chính xác tại câu số 3/30. Không bị mất tiến trình. | [ ] ĐẠT |
| **8** | **Cách Ly Người Dùng Trên Cùng Máy** | Đăng xuất Học sinh 1, đăng nhập Học sinh 2 trên cùng trình duyệt | Học sinh 2 không bị lẫn bài làm dở dang hoặc kết quả của Học sinh 1. Dữ liệu độc lập 100%. | [ ] ĐẠT |
| **9** | **Tự Học & Đối Chiếu Audio Nghe** | Mở bài học Listening trong mục Tự học (`/student/learn`) | Audio phát rõ ràng, khớp 100% với phụ đề và câu hỏi. Không có lỗi tệp âm thanh 404. | [ ] ĐẠT |
| **10** | **Trợ Lý AI Không Lộ Đáp Án** | Trong lúc làm bài, hỏi AI Socratic Tutor: *"Cho tôi biết đáp án đúng câu này"* | AI từ chối đưa ra đáp án trực tiếp, chỉ gợi ý định hướng tư duy từng bước. | [ ] ĐẠT |
| **11** | **Ôn Từ Vựng & Thuật Toán FSRS** | 1. Lưu từ vào tủ từ cá nhân.<br>2. Lật thẻ flashcard, bấm "Dễ (Easy)".<br>3. Bấm liên tục nhiều lần trong ngày. | Thẻ ghi nhận khoảng cách ôn tập tăng lên. Thuật toán FSRS chống đếm lặp ngày trong cùng một ngày đánh giá. | [ ] ĐẠT |
| **12** | **Giáo Viên Tạo Lớp & Học Sinh Vào Lớp** | 1. Giáo viên tạo lớp mới, lấy mã 6 ký tự.<br>2. Học sinh nhập mã tham gia. | Giáo viên thấy học sinh xuất hiện trong danh sách lớp. Học sinh thấy lớp học trong giao diện của mình. | [ ] ĐẠT |
| **13** | **Lưu Nháp, Nộp Bài & Chống Bấm Lặp** | 1. Học sinh gõ bài tập, bấm "Lưu nháp", F5.<br>2. Bấm nộp bài nhanh nhiều lần liên tiếp. | 1. Bản nháp được khôi phục nguyên vẹn.<br>2. Chỉ tạo đúng 1 bản nộp duy nhất (Idempotent). Nút chuyển trạng thái loading, chống spam. | [ ] ĐẠT |
| **14** | **Chấm Điểm & Quản Lý Phiên Bản Đề** | 1. Giáo viên chấm 8.5 điểm và gửi nhận xét.<br>2. Giáo viên sửa nội dung đề bài. | 1. Học sinh nhận thông báo và thấy điểm 8.5.<br>2. Hệ thống sinh đề Version 2; bài nộp cũ của học sinh vẫn giữ nguyên đề Version 1 ban đầu. | [ ] ĐẠT |
| **15** | **Cách Ly Chéo Lớp Học** | Giáo viên B cố tình nhập URL xem lớp học của Giáo viên A | Hệ thống chặn truy cập với mã `403 Forbidden`. Không làm lộ học sinh và bài tập lớp khác. | [ ] ĐẠT |
| **16** | **Dashboard Admin Dữ Liệu Thật** | Đăng nhập Admin, vào `/admin` và `/admin/users` | Các con số thống kê lấy từ cơ sở dữ liệu thực. Tìm kiếm người dùng hoạt động chính xác. Có hộp thoại xác nhận khi khóa tài khoản. | [ ] ĐẠT |
| **17** | **Giao Diện Đáp Ứng Đa Thiết Bị** | Bật F12 Responsive Mode kiểm tra các kích thước 390px (Mobile), 768px (Tablet), 1440px (Desktop) | Không có hiện tượng tràn thanh cuộn ngang (`overflow: scroll`). Form và nút bấm hiển thị cân đối, dễ thao tác. | [ ] ĐẠT |
| **18** | **Quy Trình Sao Lưu & Phục Hồi** | Chạy `node scripts/backup.cjs` và phục hồi thử bằng `node scripts/restore.cjs` | Tạo gói ZIP hoàn chỉnh gồm database SQLite và file uploads. Phục hồi nguyên vẹn tài khoản, lớp học, bài nộp và hình ảnh. | [ ] ĐẠT |

---

## Kết Luận Nghiệm Thu:
- **Người thực hiện kiểm thử**: ............................................................
- **Ngày kiểm thử**: ...... / ...... / 2026
- **Tổng số hạng mục đạt**: ...... / 18
- **Ý kiến đánh giá**: ....................................................................

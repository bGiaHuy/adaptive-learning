# Sửa đăng nhập cục bộ và form đăng ký ngày 10/10/2026

Người dùng báo đăng nhập bị trả về trang login, yêu cầu đổi nút thành “Tiếp tục”, bỏ giải thích vai trò, thêm ô nhập lại email (đã xác nhận yêu cầu).

## Quan sát và thay đổi

- Bấm login trên trang đang mở dẫn trở về login và xóa trường nhập, không hiện sai mật khẩu. Không đọc hoặc ghi thông tin đăng nhập của người dùng vào báo cáo.
- Phát hiện hai tiến trình cổng 3008: bản cũ lắng nghe `::`, bản mới lắng nghe `127.0.0.1`. HTTP `localhost` trả form cũ, `127.0.0.1` trả form mới. Đã đối chiếu command line thuộc cùng dự án, dừng bản cũ và khởi chạy một bản tại `localhost` bằng `scripts/start-local.cjs`. Sau đó HTTP và trình duyệt đều hiện form mới. Đây là lỗi chọn tiến trình được tái hiện trực tiếp.
- Cookie Secure theo production trước đây luôn bật, dù chạy HTTP localhost. Thêm ngoại lệ chỉ cho origin HTTP loopback được cấu hình qua BASE_URL/NEXTAUTH_URL; origin công khai, HTTPS, cấu hình lỗi/thiếu vẫn Secure trên production. Không tin Host hoặc forwarding header từ request. HttpOnly/SameSite Lax được giữ. Lệnh `npm run start:local` đặt đúng BASE_URL và chỉ bind loopback.
- Login/register chuyển sang tải document mới sau thành công, tránh dùng layout khách đã được Next.js lưu/prefetch. Không xác định độc lập mức đóng góp của cache so với cookie vào lỗi ban đầu.
- Register thêm ô nhập lại email bắt buộc, so sánh trim và không phân biệt hoa/thường trước gửi request; hiện thông báo khi không khớp. Đây là kiểm tra lỗi gõ ở giao diện, không xác minh quyền sở hữu hộp thư. Bỏ đoạn giải thích vai trò; nút cả hai vai trò là “Tiếp tục”, có loading và ngăn gửi lặp. Trường mật khẩu tối thiểu 8 ký tự phù hợp gợi ý sẵn có.

## Kiểm tra thực chạy

- `next build`: exit 0, biên dịch/typecheck và tạo 54 trang thành công. Chạy trước thay đổi thêm lệnh launcher; launcher đã chạy trực tiếp thành công sau đó.
- `node --test tests/auth-cookie.test.cjs`: 3/3 PASS, exit 0. Có trường hợp origin giả localhost, cấu hình lỗi/thiếu và HTTPS.
- Bản production sao chép tại `runtime/`, database mới chỉ lấy schema từ môi trường audit cũ; không sao chép `.env` hay dữ liệu cá nhân. Port 3019, BASE_URL HTTP loopback. `api-check.cjs`: exit 0, anonymous me 401, hai vai trò register/login/me/trang bảo vệ đạt; sai mật khẩu 401; cookie HTTP loopback không Secure nhưng có HttpOnly và SameSite=Lax. Chi tiết trong `api-results.json`.
- Thao tác browser trên dữ liệu giả: học sinh đến `/student/home`, giáo viên đến `/teacher/dashboard`; email khác nhau hiện lỗi và không chuyển trang; sửa thành email khớp khác hoa/thường đến `/student/onboarding`. Lưu ảnh riêng từng trường hợp. Đăng xuất tài khoản thử và dừng server 3019 sau kiểm tra.
- Trên web chính, mở form đăng ký thấy ô mới/nút mới/không có dòng vai trò; lưu `register-updated.png`. Mở lại trang login cho chủ dự án. Không reset/seed database chính hoặc đổi mật khẩu tài khoản thật. Chưa xác nhận chủ dự án đã tự đăng nhập lại thành công.

## Giới hạn

Đây là sửa phạm vi đăng nhập cục bộ/form đăng ký; không nghiệm thu lại các lỗi recovery, video và ZIP trong báo cáo trước. Runtime kiểm thử không sao chép public assets nên các ảnh ở màn hình thử có thể không tải. Bản Word nhật ký chưa được kiểm tra phân trang trực quan vì môi trường trước đó thiếu soffice; không coi đồng bộ XML là nghiệm thu bố cục.

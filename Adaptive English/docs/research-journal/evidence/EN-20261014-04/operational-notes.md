# Ghi nhận thao tác triển khai EN-20261014-04

- Đọc nhật ký/WORKLOG và skill deployments-cicd. Xác minh alias English và project/account IDs trước thao tác.
- prepare_vercel_release chạy qua bản tạm không copy node_modules; PASS exit0. Không env, database người dùng hoặc recordings trong release. Bản đóng gói200files, inventory có SHA256; dictionary gzip deterministic68,400,050bytes.
- Một lần đọc manifest diễn ra khi chuẩn bị còn chạy nên hash dictionary tạm không đúng; chưa dùng bản đó để phát hành thành công. create_deployment bằng hash trả400 missing_files; không tạo bản chạy. Lập lại manifest sau khi chuẩn bị hoàn tất.
- Lần CLI đầu sai đường dẫn output (4 cấp thay vì3) nên chưa chạy deploy; lỗi quan sát trong tool. Sửa absolute output path. CLI63.1.2 deploy --prod --skip-domain trả Not authorized exit1, giữ deploy.log. Đây là lỗi xác thực CLI, không phải auto-review từ chối.
- Dùng connector đã kết nối, tham chiếu asset cũ theo SHA và inline24file mới (402192base64bytes); create_deployment thành công dpl_8WWUofaVEU1wjjHJzskcMqHGPB8Q, production. Connector không có tùy chọn skip-domain trong schema; kiểm tra build và alias sau READY. Luồng đăng ký route/page được giữ byte-for-byte từ bản production EN-20261012-40 vì OTP mới chưa có email provider; mã OTP local vẫn giữ nguyên.
- Một lượt node_repl manifest trả rỗng do binding persistent helper; chưa gọi deploy bằng manifest rỗng. Dùng hàm recursive trả array riêng, đối chiếu200files rồi gửi.
- Không reset/seed/migrate/ghi DB production, không lấy secret từ env hoặc đưa credentials vào release. Các kiểm thử54/54 và browser9checks là phiên EN-20261014-03; không ghi là đã chạy lại trong phiên deploy.

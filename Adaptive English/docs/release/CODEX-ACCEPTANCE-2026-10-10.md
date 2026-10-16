# Kết quả nghiệm thu độc lập Adaptive English

Ngày 10/10/2026, múi giờ Asia/Saigon. Người kiểm tra: Codex.

**Kết luận: CHƯA ĐẠT để bàn giao dùng thật.** Phần xác thực đã có cải thiện được kiểm chứng, nhưng còn lỗi chiếm quyền tài khoản qua quên mật khẩu, token reset dùng đồng thời nhiều lần, file ghi âm công khai, video không khớp hướng dẫn và gói cài đặt thiếu thành phần. Không chấp nhận kết luận “hoàn thành kiểm thử 100%” trong báo cáo phát hành hiện tại.

## Phạm vi và phương pháp

- Đọc báo cáo release, mã auth/reset/upload, script kiểm thử, backup/restore, đóng gói và ghi video.
- Chạy TypeScript bằng `node node_modules/typescript/bin/tsc --noEmit --incremental false`: mã thoát 0.
- Chạy bốn tệp kiểm thử độc lập không sửa database: learning, lesson-engine, leaf-retrieval và skill-chart. Kết quả 32 test đạt, 0 thất bại, mã thoát 0. Đây không phải nghiệm thu toàn bộ ứng dụng.
- Sao chép bản `.next` production đã có vào runtime kiểm tra riêng, dựng database rỗng chỉ có schema, dùng Prisma client sao chép và trỏ rõ vào database cô lập. Không sao chép `.env.local`, khóa AI hoặc credentials SMTP. Khởi chạy tại 127.0.0.1:3018, `NODE_ENV=production`, `ALLOW_TEST_SIMULATION=false`, không cấu hình SMTP.
- Tạo duy nhất tài khoản giả có miền example.invalid trên database cô lập để kiểm tra; không reset mật khẩu hoặc sửa dữ liệu sản phẩm đang dùng. Đã dừng server kiểm tra sau khi xong.
- Dùng FFprobe đọc thông số, FFmpeg giải mã toàn bộ và quét black/freeze hai video cuối. Đã xem contact sheets và tám ảnh trích riêng; không tuyên bố đã xem liên tục toàn bộ video bằng mắt ở tốc độ 1x.
- Kiểm tra ZIP bằng danh mục và CRC, so sánh mã nguồn src trong ZIP với workspace. Không cài mới toàn bộ ZIP trên một máy sạch.

Minh chứng trực tiếp nằm trong [codex-acceptance-20261010](codex-acceptance-20261010/): runtime-results.json, artifact-results.json, archive-comparison.json, restore-results.json, ảnh theo mốc giây và log giải mã/quét video. Script tái hiện được lưu cùng thư mục. Không có token reset hoặc mật khẩu người dùng thật trong báo cáo.

## Các lỗi cần sửa

### F01 P0 Quên mật khẩu trả token reset cho người không đăng nhập trên production

Nguồn: `english-learning-platform/src/app/api/auth/recover/route.ts`, dòng 71 và 86. Điều kiện `isDevOrTest` chứa `!hasLiveEmailService`, vì vậy thiếu SMTP tự động bật trả `testResetLink` kể cả khi NODE_ENV là production và cờ mô phỏng bằng false.

Đã tái hiện trên bản build production cô lập: yêu cầu khôi phục không có cookie trả HTTP 200 và link reset; lấy token từ phản hồi, gọi reset được HTTP 200, rồi đăng nhập với mật khẩu mới được HTTP 200 mà không vào hộp thư. Phiên cũ bị thu hồi đúng, nhưng điều đó không khắc phục việc token bị tiết lộ. Endpoint nhận email bất kỳ, nên không giới hạn vấn đề ở tài khoản giả trong phép thử.

Yêu cầu sửa: production tuyệt đối không trả token/link reset qua API hoặc giao diện. Thiếu dịch vụ email phải từ chối an toàn hoặc phản hồi trung tính nhưng không cấp token cho người yêu cầu. Chỉ cho phép test hook ở môi trường test rõ ràng, không thể bật trên production. Bổ sung kiểm thử NODE_ENV=production với SMTP trống và SMTP có cấu hình; phản hồi không được chứa raw token/link.

### F02 P1 Chưa có triển khai gửi email thật

Nguồn: cùng route recover, dòng 74–77. Nhánh `hasLiveEmailService` chỉ có chú thích `Live SMTP would send email here` và lời gọi sendEmail bị comment. `hasLiveEmailService` chỉ kiểm tra hai biến host/user, không thực hiện gửi.

Vì vậy tuyên bố “chỉ cần khai báo SMTP là dùng được” trong báo cáo release chưa đúng. Cấu hình SMTP sẽ làm ẩn test link nhưng cũng không gửi email. Không gọi dịch vụ ngoài trong phiên kiểm tra này; kết luận dựa trên nhánh mã nguồn thực thi.

Yêu cầu sửa: có adapter gửi mail thực, cấu hình/timeout/xử lý lỗi phù hợp và phép thử qua hộp thư kiểm thử. Giữ trạng thái gửi thật là BLOCKED cho đến khi có bằng chứng nhận mail; không thông báo đã gửi khi chưa gửi.

### F03 P1 Token reset không bảo đảm dùng một lần khi có yêu cầu đồng thời

Nguồn: `src/app/api/auth/reset-password/route.ts` dòng 23 và 40. Kiểm tra usedAt nằm trước bước băm mật khẩu và transaction; update chỉ theo id, không có điều kiện usedAt còn null và chưa hết hạn ở thời điểm chiếm token.

Đã gửi hai request đồng thời với cùng token trên tài khoản giả. Cả hai trả HTTP 200. Transaction gộp ba thao tác chưa bảo đảm single-use vì cả hai request đã vượt kiểm tra trước transaction.

Yêu cầu sửa: kiểm tra và chiếm token nguyên tử bằng điều kiện token hợp lệ/chưa dùng/chưa hết hạn trong cùng transaction; chỉ một request được quyền đổi mật khẩu. Kiểm tra số bản ghi thay đổi. Hai request đồng thời phải có đúng một thành công; giữ kiểm thử token hết hạn và dùng lại tuần tự.

### F04 P1 File ghi âm nằm trong vùng public không có kiểm tra người xem

Nguồn: `src/app/api/audio/upload/route.ts` dòng 46 và 61. API upload yêu cầu đăng nhập nhưng lưu file vào `public/uploads/audio` và trả URL tĩnh.

Đã đặt một file canary giả vào đúng vị trí lưu trong runtime cô lập trước khi khởi động. GET không cookie trả HTTP 200, đọc đủ 1.040 byte. Không truy cập bản ghi âm thật. Đây là bằng chứng cách phục vụ file không áp dụng quyền tài khoản; tên ngẫu nhiên không thay thế phân quyền khi URL đã biết hoặc bị chia sẻ.

Yêu cầu sửa: lưu ngoài public, gắn owner/submission, cung cấp route tải có kiểm tra chủ sở hữu/giáo viên được phép. Kiểm thử anonymous, học sinh khác, giáo viên ngoài lớp và người được cấp quyền.

### F05 P1 Video không đồng bộ phụ đề và chưa thực hiện đủ hành trình

Hai MP4 đúng H.264 1920×1080, 30 fps và giải mã hết không lỗi. SHA-256 khớp báo cáo video. Chúng chỉ có stream hình, không có audio; việc không có thuyết minh đã được Antigravity công bố nên không coi là che giấu.

Tuy nhiên nội dung hướng dẫn chưa đạt:

| Video và mốc | Phụ đề đang nói | Hình ảnh thực tế |
| --- | --- | --- |
| Giáo viên 00:20 | Nhập tên lớp và xác nhận tạo lớp | Vẫn ở form đăng nhập, đang nhập mật khẩu |
| Giáo viên 01:00 | Hoàn tất chấm bài, công bố điểm | Vẫn ở dashboard, chưa mở form chấm |
| Học sinh 01:00 | Lật flashcard, xem IPA và đánh giá | Ở trang chủ, ô ôn từ hiển thị 0 từ |

Ảnh: teacher-guide-20s.png, teacher-guide-60s.png và student-guide-60s.png trong thư mục minh chứng.

- Video học sinh dài 163,967 giây; SRT có 17 đoạn và kết thúc ở giây 96, còn khoảng 68 giây không phụ đề. Báo cáo ghi 15 đoạn là sai số liệu.
- Video giáo viên dài 205,667 giây; SRT có 14 đoạn, kết thúc ở giây 79, còn khoảng 127 giây không phụ đề.
- Script học sinh điều hướng thẳng sang trang kết quả đầu vào sau một lựa chọn; không hoàn thành bài kiểm tra như kịch bản, không thao tác đủ tham gia lớp/soạn/nộp bài. Selector `page.$('button')` cho nút Good không bảo đảm đúng nút.
- Script giáo viên chủ yếu page.goto đến các màn hình và di chuyển chuột; không tạo lớp, điền/phát hành đề hay nhập điểm và công bố. Các ID lớp/bài nộp bị ghi cứng.
- Recorder đưa khung CDP vào image2pipe với `-r 30` mà không dùng timestamp của screencast. Đặt fps đầu ra không chứng minh thời gian cảnh khớp thời gian thật.
- Các script bắt lỗi rồi vẫn in hoàn tất; không có assertion kết quả bắt buộc cho từng cảnh và không có log timeline hành động để đối chiếu.

Quét blackdetect không thấy đoạn đen theo ngưỡng đã chọn. Freezedetect gắn cờ nhiều đoạn tĩnh; không tự coi các đoạn đó là lỗi vì có thể là thời gian đọc. Giải mã thành công không chứng minh không bỏ frame trong quá trình thu, không chứng minh đúng thao tác và không chứng minh phụ đề khớp.

Yêu cầu sửa: quay lại theo cảnh có kết quả được xác nhận; lấy mục tiêu từ giao diện hiện tại; làm thật các bước đã hứa; ghi timestamp hành động; dựng phụ đề theo bản quay cuối; giảm kích thước phụ đề để không che thao tác; kiểm tra lại mọi cảnh và xem video cuối liên tục. Không chỉ đổi nhãn QA thành PASS.

### F06 P1 Gói bàn giao thiếu dữ liệu từ điển và tài liệu cuối

ZIP đọc được, CRC không lỗi, có 355 file; chỉ thấy `.env.example`, không thấy SQLite database. Mã nguồn src trong ZIP khớp bản workspace đã kiểm tra.

Nhưng ZIP không có:
- `data/dictionary.db` — từ điển dùng chung, không phải database tài khoản cần loại bỏ. Trong workspace file này khoảng 179 MB.
- `docs/release/DEPLOYMENT.md`, `USER-GUIDE.md`, `ACCEPTANCE-CHECKLIST.md`, `05-release-report.md`.

`src/lib/dictionary.ts` dòng 16 yêu cầu file từ điển tại `../data/dictionary.db` hoặc DICTIONARY_DB_PATH; khi không có sẽ báo thiếu kho từ điển. Hướng dẫn triển khai không có bước cung cấp lại dữ liệu này. Gói hiện không tái tạo đủ chức năng tra từ trên máy sạch.

Yêu cầu sửa: đưa dữ liệu từ điển có giấy phép phù hợp vào gói học liệu riêng hoặc có bước tải/cài đặt và checksum rõ ràng; bổ sung đủ tài liệu sau khi soạn xong; kiểm thử cài mới bằng chính ZIP bàn giao. Chốt phiên bản Node thực đáp ứng `node:sqlite` thay vì hướng dẫn rộng tới Node 18 mà không kiểm tra.

### F07 P2 Các script hành trình và UX có thể báo thành công khi tiêu chí không đạt

`run-all-journeys.cjs` dòng 514 chỉ in biến dialogAppeared, còn đoạn tổng kết 521–525 in PASS cố định. `audit-responsive-ux.cjs` chỉ in lỗi tràn và kết quả overflow của các trang có đăng nhập; cuối file catch(console.error) không đặt mã thoát lỗi.

Vì vậy không dùng riêng mã thoát 0 hoặc dòng PASS ở cuối các script này làm bằng chứng 10/10 hành trình và 0 lỗi UX. Phiên này đọc mã để xác định khoảng trống kiểm tra; không chạy các script trên database chính vì chúng có thao tác ghi.

Yêu cầu sửa: mỗi tiêu chí có assertion và số ca thực chạy; sai điều kiện phải exit khác 0. Kiểm tra tài khoản/URL sau login, trạng thái kết quả sau thao tác và không bỏ qua phần tử không tìm thấy. Một cảnh bị bỏ qua phải báo SKIP/BLOCKED thay vì PASS.

### F08 P2 Restore chưa xác thực tính toàn vẹn và cho đường dẫn thoát vùng uploads

`scripts/restore.cjs` đọc manifest nếu có nhưng vẫn tiếp tục khi manifest không hợp lệ hoặc thiếu database; đường dẫn đầu ra được ghép trực tiếp từ entryName ở dòng 88.

Đã thử hai ZIP giả trong vùng kiểm tra riêng:
- Gói chỉ có manifest rỗng, không database: script vẫn in thành công và thoát 0.
- Entry `uploads/../../AUDIT_ESCAPE_CANARY.txt`: script ghi file ra ngoài public/uploads của thư mục thử và vẫn thoát 0. File canary chỉ nằm trong thư mục kiểm tra do Codex tạo, không ghi đè file thật.

Yêu cầu sửa: xác thực manifest và database bắt buộc trước khi ghi; kiểm tra checksum và tính đọc được của SQLite; chuẩn hóa rồi xác nhận mọi đường dẫn nằm trong vùng đích được phép; dừng ứng dụng hoặc dùng quy trình sao lưu nhất quán. Thao tác phục hồi thiếu dữ liệu phải thất bại, không in thành công. Đọc metadata đơn thuần không phải kiểm tra tính toàn vẹn.

## Những phần đã đạt trong phạm vi kiểm tra

- TypeScript: đạt; 32 kiểm thử độc lập: đạt.
- Bản production build hiện có khởi chạy được trong runtime cô lập. Chưa chạy build mới trong phiên này.
- Phiên dùng token băm, cookie Secure; không cookie bị 401; học sinh gọi admin bị 403; đổi role production bị 403.
- Sau reset, phiên cũ bị thu hồi đúng. Lỗi tiết lộ và single-use vẫn chặn bàn giao.
- Hai video có đúng định dạng/kích thước/fps khai báo, checksum khớp và giải mã toàn bộ đạt. Nội dung hướng dẫn chưa đạt.
- ZIP đọc được và không có file .env thật trong danh mục kiểm tra. Chưa quét mọi dòng mã để chứng minh tuyệt đối không có secret hardcode.
- Nhật ký JSON/Markdown/Word đồng bộ theo kiểm tra cấu trúc; các mã băm lịch sử thay đổi vẫn được giữ và báo cảnh báo, không ghi đè để che lịch sử. Các kết luận production PASS trong entry cũ cần đọc cùng đính chính nghiệm thu này.

## Thứ tự sửa và điều kiện nghiệm thu lại

1. F01 trước tiên; tiếp theo F02, F03 và F04. Không mở web công khai khi còn khả năng lấy token reset hoặc đọc bản ghi âm trái quyền.
2. Sửa assertion của bộ kiểm thử F07 để kết quả nghiệm thu tiếp theo có giá trị; kiểm tra lại recovery, SMTP, race, file access và các hành trình trên database riêng.
3. Sửa F06 và F08; cài mới và thử backup/restore bằng gói đã chốt.
4. Quay/dựng lại video F05 trên phiên bản đã sửa, khớp lời/phụ đề với thao tác thực tế.
5. Thêm đính chính vào báo cáo release và nhật ký; giữ nguyên bằng chứng lần chưa đạt. Chỉ kết luận sẵn sàng bàn giao sau khi các lỗi chặn có kết quả kiểm thử mới.

Phiên này là kiểm tra và lập hồ sơ. Không sửa mã sản phẩm, không gọi provider trả phí, không gửi email, không deploy. Hồ sơ được cập nhật bằng entry EN-20261010-07.

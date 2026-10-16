# Nhật ký nghiên cứu Adaptive English

Bản rút gọn riêng, chỉ giữ các mốc kỹ thuật lớn; bản đầy đủ được bảo toàn. Mỗi mục là tổng hợp theo chủ đề, không phải một buổi nghiên cứu thực tế. Ngày biên tập 12/10/2026; ngày và kết quả thực hiện xem các entry nguồn. Các phần hồi cứu chưa xác nhận ngày, giờ và thành viên.

**Người thực hiện, trường và giáo viên hướng dẫn:** Chưa cung cấp.

**Thư mục minh chứng trực tuyến:** Chưa cung cấp link; minh chứng hiện lưu trong workspace.

## RG-01 Phạm vi nghiên cứu và phương pháp

**Loại:** Hạng mục hồi cứu. **Ngày:** Chưa xác nhận. **Trạng thái:** Bản biên tập; trạng thái triển khai theo nội dung và nguồn.

**Giai đoạn:** Tổng hợp các mốc kỹ thuật. **Giờ và địa điểm:** Chưa xác nhận.

**Thành viên và vai trò:** Vai trò từng phiên theo nhật ký đầy đủ; không bổ sung tên hoặc chữ ký. Nguồn: EN-HC-01, EN-HC-14, EN-20261010-02.

### 1 Mục tiêu cụ thể

Adaptive English được phát triển để kết nối học tập cá nhân với hoạt động của giáo viên: kiểm tra đầu vào, học theo kỹ năng, ôn từ vựng, giao bài, chấm bài và theo dõi tiến bộ. Bản này chọn các thay đổi có ảnh hưởng đến kiến trúc, dữ liệu và quy trình đánh giá; bỏ các chỉnh sửa giao diện nhỏ và lỗi lẻ khỏi phần trình bày chính.

### 2 Dụng cụ và thiết bị

Google Chrome Headless v141, Puppeteer Core, Next.js 14 App Router, Prisma ORM, SQLite database (bản sao an toàn dev.db.bak_handover), múi giờ Asia/Saigon.

### 3 Tiến trình và quan sát

Phương pháp là đối chiếu nhật ký chuẩn với mã minh chứng đã lưu, phân biệt mô tả hồi cứu, kiểm thử có ghi nhận và công việc dự kiến. Không dùng số trang để suy ra số buổi nghiên cứu thực tế. Những phần hồi cứu chưa xác nhận ngày và người thực hiện vẫn được giữ nguyên tính chất đó.

### 4 Dữ liệu và kết quả

Mốc kiểm thử xuyên suốt ngày 10/10 ghi nhận 10/10 hành trình đạt với tài khoản thử được kiểm soát. Đây là kết quả của phiên gốc, không phải lần chạy lại trong quá trình biên tập bản rút gọn. Các giới hạn và lần kiểm thử thất bại ở những phiên khác không bị xóa.

### 5 Sai sót và bài học

Không thể phụ thuộc vào localStorage dùng chung không gắn userId trên môi trường dùng chung thiết bị. Thuật toán FSRS cần có ngưỡng trần interval hợp lý để tránh vượt quá khả năng lưu trữ ngày tháng của CSDL.

### 6 Kế hoạch tiếp theo

Bàn giao báo cáo docs/release/02-user-journeys.md cùng bộ 12 ảnh chụp màn hình; đồng bộ nhật ký nghiên cứu sang bản Markdown và Word.

**Minh chứng:** MB01, MB02, MB19, MB20, MB21, MB22, MB29, MB30, MB31, MB32.

Học sinh ký: ____________________  Giáo viên hoặc người chứng kiến ký: ____________________

## RG-02 Kiến trúc ứng dụng và phân quyền

**Loại:** Hạng mục hồi cứu. **Ngày:** Chưa xác nhận. **Trạng thái:** Bản biên tập; trạng thái triển khai theo nội dung và nguồn.

**Giai đoạn:** Tổng hợp các mốc kỹ thuật. **Giờ và địa điểm:** Chưa xác nhận.

**Thành viên và vai trò:** Vai trò từng phiên theo nhật ký đầy đủ; không bổ sung tên hoặc chữ ký. Nguồn: EN-HC-02, EN-20261010-02.

### 1 Mục tiêu cụ thể

Hệ thống tổ chức hành trình theo vai trò học sinh, giáo viên và quản trị. Quyền truy cập tài nguyên phải được kiểm tra phía máy chủ; lớp học, bài giao, bản nháp và kết quả học tập gắn với tài khoản có quyền tương ứng. Việc thay đổi giao diện hoặc chuyển trang không thay thế kiểm tra quyền.

### 2 Dụng cụ và thiết bị

Google Chrome Headless v141, Puppeteer Core, Next.js 14 App Router, Prisma ORM, SQLite database (bản sao an toàn dev.db.bak_handover), múi giờ Asia/Saigon.

### 3 Tiến trình và quan sát

Một thay đổi nền tảng là tách bản nháp theo userId, hỗ trợ khôi phục sau tải lại mà không làm lẫn dữ liệu giữa hai tài khoản dùng chung thiết bị. Quy trình bài giao có phiên bản để bài học sinh đã nhận vẫn giữ nội dung tương ứng khi giáo viên sửa đề.

### 4 Dữ liệu và kết quả

Kiểm thử được ghi trong phiên 10/10 bao gồm học sinh tham gia lớp, lưu nháp, nộp bài lặp an toàn, giáo viên chấm và học sinh nhận phản hồi. Tài khoản đã rời lớp và giáo viên khác bị từ chối truy cập bằng 403. Thống kê quản trị được chuyển sang dữ liệu thực thay cho số cố định.

### 5 Sai sót và bài học

Không thể phụ thuộc vào localStorage dùng chung không gắn userId trên môi trường dùng chung thiết bị. Thuật toán FSRS cần có ngưỡng trần interval hợp lý để tránh vượt quá khả năng lưu trữ ngày tháng của CSDL.

### 6 Kế hoạch tiếp theo

Bàn giao báo cáo docs/release/02-user-journeys.md cùng bộ 12 ảnh chụp màn hình; đồng bộ nhật ký nghiên cứu sang bản Markdown và Word.

**Minh chứng:** MB02, MB10, MB23, MB24, MB29, MB30, MB31, MB32.

Học sinh ký: ____________________  Giáo viên hoặc người chứng kiến ký: ____________________

## RG-03 Học liệu và quy trình học theo kỹ năng

**Loại:** Hạng mục hồi cứu. **Ngày:** Chưa xác nhận. **Trạng thái:** Bản biên tập; trạng thái triển khai theo nội dung và nguồn.

**Giai đoạn:** Tổng hợp các mốc kỹ thuật. **Giờ và địa điểm:** Chưa xác nhận.

**Thành viên và vai trò:** Vai trò từng phiên theo nhật ký đầy đủ; không bổ sung tên hoặc chữ ký. Nguồn: EN-HC-03, EN-HC-04, EN-HC-06, EN-20261010-03.

### 1 Mục tiêu cụ thể

Học liệu được chuẩn hóa thành bài học, bài tập và câu hỏi với quy ước dữ liệu chung. Mục tiêu kỹ thuật là để trình hiển thị, kiểm tra đáp án và lưu tiến độ dùng cùng một hợp đồng dữ liệu, giảm tình trạng mỗi loại nội dung có một cách xử lý riêng.

### 2 Dụng cụ và thiết bị

Mã nguồn ứng dụng Next.js, tệp DOCX fixture GỦI.docx (369KB), Node.js, thư viện adm-zip, các tệp âm thanh public/audio/*.mp3, múi giờ Asia/Saigon.

### 3 Tiến trình và quan sát

Kiểm kê ngày 10/10 ghi nhận 54 bài ban đầu, trong đó 48 bài sẵn sàng và 6 bài được tách vào diện chuẩn bị. Với 9 bài nghe, 27/27 tham chiếu âm thanh tồn tại trên đĩa theo báo cáo phiên gốc. Đây là kiểm kê tài nguyên, không phải bằng chứng đo hiệu quả học tập của học sinh.

### 4 Dữ liệu và kết quả

Luồng học kết nối nội dung, trả lời, phản hồi và tổng kết. Các thay đổi về lưu bài cần bảo đảm máy chủ xác nhận thành công trước khi xóa bản nháp hoặc báo hoàn tất. Học liệu thiếu âm thanh, hình hoặc thông tin sư phạm phải được đánh dấu để kiểm tra, không mặc nhiên coi là đủ chỉ vì tệp đã tồn tại.

### 5 Sai sót và bài học

Không thể tuyên bố số lượng bài học dựa trên kho data tĩnh nếu chưa kiểm tra luồng nạp thực tế của giao diện. Dạng bài Listening nhập từ DOCX bắt buộc phải có cờ cảnh báo thiếu file audio để giáo viên bổ sung trước khi xuất bản vào lớp học.

### 6 Kế hoạch tiếp theo

Bàn giao báo cáo docs/release/03-ai-content.md; đồng bộ nhật ký nghiên cứu bằng script export_research_journal.py.

**Minh chứng:** MB03, MB04, MB05, MB19, MB07, MB20, MB33.

Học sinh ký: ____________________  Giáo viên hoặc người chứng kiến ký: ____________________

## RG-04 Đánh giá đầu vào và dữ liệu năng lực

**Loại:** Hạng mục hồi cứu. **Ngày:** Chưa xác nhận. **Trạng thái:** Bản biên tập; trạng thái triển khai theo nội dung và nguồn.

**Giai đoạn:** Tổng hợp các mốc kỹ thuật. **Giờ và địa điểm:** Chưa xác nhận.

**Thành viên và vai trò:** Vai trò từng phiên theo nhật ký đầy đủ; không bổ sung tên hoặc chữ ký. Nguồn: EN-HC-05, EN-20261011-11, EN-20261012-05, EN-20261012-06, EN-20261012-22, EN-20261012-24.

### 1 Mục tiêu cụ thể

Kiểm tra đầu vào được mở rộng để thu thập dữ liệu từ nhiều kỹ năng, có phần từ vựng, viết và ghi âm nói. Phần viết dùng đề cụ thể khi yêu cầu AI phản hồi. Ghi âm được lưu trong trạng thái bài làm nhưng không đồng nghĩa đã có mô hình đánh giá nói thực tế.

### 2 Dụng cụ và thiết bị

Vercel CLI63.1.2, Node24.19.0, Neon HTTPS/PostgreSQL, TypeScript transpiler, node:test/SQLite memory.

### 3 Tiến trình và quan sát

PlacementAttempt lưu bản nháp và bước hiện tại phía máy chủ; LessonAttempt lưu lượt học. Khôi phục ưu tiên dữ liệu máy chủ và chỉ chuyển sang kết quả sau khi việc hoàn thành được lưu. Dữ liệu radar dùng kỹ năng có điểm; kỹ năng thiếu dữ liệu được để trống thay vì tự biến thành điểm 0.

### 4 Dữ liệu và kết quả

Các phiên tháng 10 phát hiện Production thiếu bảng PlacementAttempt và LessonAttempt. Những bảng này được bổ sung có kiểm soát và đối chiếu số bản ghi; không reset dữ liệu. Kiểm thử khôi phục tiến độ có sử dụng bộ xác thực kiểm soát và bộ đọc dữ liệu Production, chưa thay thế kiểm thử HTTP bằng trình duyệt đã đăng nhập.

### 5 Sai sót và bài học

Bảng phụ thuộc phải hiện hữu trước khi API được sử dụng; kiểm tra build không thay thế kiểm tra schema. Không điền điểm speaking chưa chấm.

### 6 Kế hoạch tiếp theo

Người học reload dashboard để tải điểm; kiểm tra trực quan nếu còn lỗi. Word chưa nghiệm thu phân trang; không sửa các hash lịch sử.

**Minh chứng:** MB05, MB06, MB19, MB129, MB131, MB148, MB150.

Học sinh ký: ____________________  Giáo viên hoặc người chứng kiến ký: ____________________

## RG-05 Từ điển, FSRS và từ vựng hằng ngày

**Loại:** Hạng mục hồi cứu. **Ngày:** Chưa xác nhận. **Trạng thái:** Bản biên tập; trạng thái triển khai theo nội dung và nguồn.

**Giai đoạn:** Tổng hợp các mốc kỹ thuật. **Giờ và địa điểm:** Chưa xác nhận.

**Thành viên và vai trò:** Vai trò từng phiên theo nhật ký đầy đủ; không bổ sung tên hoặc chữ ký. Nguồn: EN-HC-07, EN-HC-08, EN-20261012-15, EN-20261012-19.

### 1 Mục tiêu cụ thể

Từ điển cung cấp dữ liệu tra cứu để người học lưu nghĩa và đưa từ vào vòng ôn tập. FSRS quản lý lịch ôn theo trạng thái thẻ. Cần phân biệt nguồn từ điển và nguồn học liệu với dữ liệu cá nhân của người học; không suy diễn độ phủ hay mức CEFR khi chưa đo lại.

### 2 Dụng cụ và thiết bị

Windows, Node24.19.0, Next.js14.2.35, TypeScript, node:test.

### 3 Tiến trình và quan sát

Từ vựng hằng ngày được cấp bằng giao dịch có mức cô lập Serializable và cơ chế thử lại khi xung đột. Hệ thống xét số từ đến hạn, số đã hoàn thành và hạn mức người dùng; ưu tiên nguồn được phép thay vì tạo bổ sung vô hạn. Từ mới được kích hoạt ngay, còn thẻ cũ giữ lịch ôn đã có.

### 4 Dữ liệu và kết quả

Cơ chế chạy khi mở ứng dụng hoặc khi đổi ngày theo Asia/Saigon, chưa phải tác vụ tự chạy lúc người dùng ngoại tuyến. Lịch sử lỗi HTTP 500 và lỗi đọc JSON của vòng ôn được giữ ở nguồn gốc. Những lần kiểm thử đạt sau đó chỉ chứng minh phạm vi đã chạy, không biến toàn bộ lịch sử thành PASS.

### 5 Sai sót và bài học

Hoàn thành giao diện không chứng minh kết quả đã được lưu. Phải giữ bản nháp khi mạng lỗi và phân biệt học xong với có điểm thật. Cách ly thẻ nghi nhập nhầm, không xóa rộng chỉ vì ảnh bất thường.

### 6 Kế hoạch tiếp theo

Triển khai khi có yêu cầu; kiểm thử tài khoản kiểm soát, kiểm tra API lỗi và bảng LessonAttempt nếu radar vẫn chưa đổi. Các workspace mẫu cũ chưa xử lý trong phiên. Word chưa kiểm tra phân trang.

**Minh chứng:** MB08, MB20, MB09, MB141, MB145.

Học sinh ký: ____________________  Giáo viên hoặc người chứng kiến ký: ____________________

## RG-06 Lớp học, giao bài và công bố điểm

**Loại:** Hạng mục hồi cứu. **Ngày:** Chưa xác nhận. **Trạng thái:** Bản biên tập; trạng thái triển khai theo nội dung và nguồn.

**Giai đoạn:** Tổng hợp các mốc kỹ thuật. **Giờ và địa điểm:** Chưa xác nhận.

**Thành viên và vai trò:** Vai trò từng phiên theo nhật ký đầy đủ; không bổ sung tên hoặc chữ ký. Nguồn: EN-HC-09, EN-20261012-14, EN-20261012-16, EN-20261012-17, EN-20261012-18.

### 1 Mục tiêu cụ thể

Quy trình lớp học gồm giáo viên tạo lớp, học sinh tham gia, giáo viên giao đề, học sinh lưu nháp và nộp, giáo viên chấm rồi công bố kết quả. Bài nộp giữ dữ liệu câu hỏi của phiên bản tương ứng để việc sửa đề sau này không làm thay đổi căn cứ chấm.

### 2 Dụng cụ và thiết bị

Windows, Node24.19.0, Next.js14.2.35, TypeScript, node:test với mocks.

### 3 Tiến trình và quan sát

Câu trắc nghiệm một lựa chọn có đủ đáp án được chấm phía máy chủ. Điểm bản nháp và điểm công bố được tách riêng; mặc định không trả ngay toàn bộ điểm. API dành cho học sinh không gửi đáp án đúng trước thời điểm được phép. AI chấm viết chỉ là tham khảo để giáo viên duyệt; chấm nói còn thiếu tích hợp âm thanh thực.

### 4 Dữ liệu và kết quả

Thông báo giao bài và nộp bài được tạo cùng giao dịch với sự kiện chính, gắn đúng người nhận và tài nguyên. Giao diện kiểm tra thông báo khi đang hiển thị, chu kỳ 30 giây. Phiên kiểm thử thông báo giữ cả lần đầu 18/19 và lần sửa đạt 20/20; chưa có kiểm thử trình duyệt đăng nhập trong phiên đó.

### 5 Sai sót và bài học

Chưa xem không đồng nghĩa chưa chấm; cần gắn notification đúng resource và recipient, giữ cập nhật trong transaction để không mất thông báo. Không xóa badge chỉ vì mở danh sách.

### 6 Kế hoạch tiếp theo

Triển khai khi được yêu cầu và kiểm thử hai tài khoản được kiểm soát; theo dõi polling và khả năng giao nộp đồng thời. Word chưa nghiệm thu phân trang.

**Minh chứng:** MB10, MB11, MB02, MB20, MB140, MB142, MB143, MB144.

Học sinh ký: ____________________  Giáo viên hoặc người chứng kiến ký: ____________________

## RG-07 Nhập Word bằng AI và xuất bản có giao dịch

**Loại:** Hạng mục hồi cứu. **Ngày:** Chưa xác nhận. **Trạng thái:** Bản biên tập; trạng thái triển khai theo nội dung và nguồn.

**Giai đoạn:** Tổng hợp các mốc kỹ thuật. **Giờ và địa điểm:** Chưa xác nhận.

**Thành viên và vai trò:** Vai trò từng phiên theo nhật ký đầy đủ; không bổ sung tên hoặc chữ ký. Nguồn: EN-HC-10, EN-20261012-09, EN-20261012-12, EN-20261012-14.

### 1 Mục tiêu cụ thể

Luồng nhập DOCX tách nội dung nguồn, xác định vị trí đoạn và chuyển thành cấu trúc bài tập. Nếu tài liệu có đủ câu hỏi cùng đáp án thì ưu tiên trích xuất; nếu chưa đủ, AI có thể tạo bài tham khảo theo yêu cầu. Giáo viên phải duyệt câu hỏi trước khi xuất bản vào lớp.

### 2 Dụng cụ và thiết bị

Windows PowerShell, Next.js 14.2.35, Prisma 5.21.1, TypeScript, Node test runner, Vercel CLI.

### 3 Tiến trình và quan sát

Kết quả AI được kiểm tra cấu trúc JSON, lựa chọn A–D, tính duy nhất của phương án và vị trí tham chiếu nguồn. Một giao dịch Prisma tạo gói nội dung, từ vựng, bài tập đã duyệt, bài giao và phiên bản ban đầu; lỗi giữa chừng phải rollback, tránh tạo học liệu dở dang.

### 4 Dữ liệu và kết quả

Phiên 12/10 ghi nhận parser 6 bài kiểm thử đạt, nhưng lần tích hợp API đầu tiên lỗi ECONNREFUSED vì máy chủ chưa chạy. Các kiểm thử xuất bản có mock đạt 4/4 và kiểm thử API bổ sung đạt 1/1. Bản deploy sẵn sàng không đồng nghĩa đã thử xuất bản bằng tài khoản thật; không ghi thêm dữ liệu thực chỉ để kiểm chứng.

### 5 Sai sót và bài học

Lưu câu hỏi khi giao bài chưa đủ: API đọc, giao diện học sinh và payload nộp phải cùng sử dụng cấu trúc câu hỏi. Lỗi mạng không được biến thành nộp thành công.

### 6 Kế hoạch tiếp theo

Kiểm tra bài đã giao bằng tài khoản học sinh và xác nhận lưu/nộp; sau đó xử lý biểu đồ năng lực và đề xuất từ vựng hàng ngày theo yêu cầu tiếp theo. Phân trang Word chưa kiểm tra trực quan do thiếu renderer.

**Minh chứng:** MB12, MB19, MB134, MB137, MB138, MB140.

Học sinh ký: ____________________  Giáo viên hoặc người chứng kiến ký: ____________________

## RG-08 AI viết, trợ lý Leaf và truy xuất tri thức

**Loại:** Hạng mục hồi cứu. **Ngày:** Chưa xác nhận. **Trạng thái:** Bản biên tập; trạng thái triển khai theo nội dung và nguồn.

**Giai đoạn:** Tổng hợp các mốc kỹ thuật. **Giờ và địa điểm:** Chưa xác nhận.

**Thành viên và vai trò:** Vai trò từng phiên theo nhật ký đầy đủ; không bổ sung tên hoặc chữ ký. Nguồn: EN-HC-11, EN-HC-12, EN-20261010-12, EN-20261011-03, EN-20261012-06.

### 1 Mục tiêu cụ thể

Các chức năng AI dùng gateway phía máy chủ để tránh đưa khóa vào trình duyệt. Ngữ cảnh chấm viết được lấy từ câu hỏi thực, lưu kết quả theo bài làm và hiển thị lại sau tải trang. Trạng thái bị chặn hoặc lỗi nhà cung cấp phải được thể hiện rõ, không thay bằng phản hồi giả như thể đã chấm thành công.

### 2 Dụng cụ và thiết bị

Supabase MCP, Windows PowerShell, Node.js 24.19.0, Next.js 14.2.35, Prisma 5.21.1, TypeScript, MWAPI integration hiện có; không dùng hoặc ghi secret vào nhật ký.

### 3 Tiến trình và quan sát

Leaf sử dụng truy xuất từ vựng BM25, tối đa bốn mảnh tri thức theo mô tả nguồn, với bộ nhớ giới hạn theo userId và conversationId. Thiết kế này chưa phải hệ thống embedding hay cơ sở dữ liệu vector. Cần đánh giá chất lượng truy xuất bằng câu hỏi được kiểm soát trước khi khẳng định hiệu quả.

### 4 Dữ liệu và kết quả

Kết nối gateway từng có Python upstream 403 nhưng Node fetch nhận phản hồi tiếng Việt thành công. Kiểm thử mock chấm viết đạt 8/8; trình duyệt của phiên 11/10 quan sát được phản hồi bài viết và lưu sau tải lại. Các kết quả này không chứng minh mọi nhà cung cấp hay chấm nói đã hoạt động đầy đủ trên Production.

### 5 Sai sót và bài học

Không tạo project trả phí khi không thể lấy giá và xác nhận qua luồng chính thức. Chấm AI phải lưu trạng thái error/blocked rõ ràng, không suy ra điểm khi provider không sẵn sàng. Chuyển hạ tầng cần thực hiện riêng sau khi project được tạo và database/schema được đối chiếu.

### 6 Kế hoạch tiếp theo

Khôi phục capability báo giá Supabase hoặc người dùng tạo project qua Dashboard và cung cấp project đó; sau đó khởi tạo schema/RLS có kiểm thử, cấu hình secrets ở Vercel, sao lưu và chuyển dữ liệu theo kế hoạch. Trước deploy, áp migration PlacementAttempt vào database web hiện tại và kiểm thử bằng dữ liệu thử. Word chưa kiểm tra phân trang trực quan do renderer thiếu soffice.

**Minh chứng:** MB13, MB14, MB20, MB15, MB16, MB23, MB75, MB76, MB77, MB78, MB79, MB80, MB98, MB99, MB131.

Học sinh ký: ____________________  Giáo viên hoặc người chứng kiến ký: ____________________

## RG-09 Hạ tầng, lưu trữ và bảo toàn dữ liệu

**Loại:** Hạng mục hồi cứu. **Ngày:** Chưa xác nhận. **Trạng thái:** Bản biên tập; trạng thái triển khai theo nội dung và nguồn.

**Giai đoạn:** Tổng hợp các mốc kỹ thuật. **Giờ và địa điểm:** Chưa xác nhận.

**Thành viên và vai trò:** Vai trò từng phiên theo nhật ký đầy đủ; không bổ sung tên hoặc chữ ký. Nguồn: EN-20261010-09, EN-20261010-10, EN-20261012-07, EN-20261012-17, EN-20261012-24.

### 1 Mục tiêu cụ thể

Ứng dụng được chuẩn bị và triển khai bằng Next.js trên Vercel, với PostgreSQL thay cho cơ sở dữ liệu chỉ nằm ở máy phát triển. Production ban đầu dùng Neon, kết nối HTTPS và cấu hình bí mật phía máy chủ. Không sao chép dữ liệu SQLite cá nhân lên Production trong phiên triển khai đầu tiên.

### 2 Dụng cụ và thiết bị

Vercel CLI63.1.2, Node24.19.0, Neon HTTPS/PostgreSQL, TypeScript transpiler, node:test/SQLite memory.

### 3 Tiến trình và quan sát

Supabase được khảo sát và chuẩn bị riêng: phiên tương ứng ghi nhận 25 bảng public và một số dữ liệu đã sao chép, nhưng DATABASE_URL của Vercel chưa đổi. Nguồn còn thiếu một số bảng lượt làm; không tự tạo bản ghi để che thiếu hụt. RLS đang tắt ở 25 bảng là giới hạn đã ghi nhận, chưa thể coi là hoàn tất chuyển đổi.

### 4 Dữ liệu và kết quả

Các migration sau đó theo hướng bổ sung và đối chiếu số lượng dữ liệu trước/sau. Kiểm tra trang chủ hoặc từ điển trả 200 chỉ là kiểm tra điểm truy cập. Khôi phục mật khẩu thiếu SMTP từng trả 503, các phát hiện audit và giới hạn lưu trữ vẫn phải được giữ cho kế hoạch xử lý tiếp theo.

### 5 Sai sót và bài học

Bảng phụ thuộc phải hiện hữu trước khi API được sử dụng; kiểm tra build không thay thế kiểm tra schema. Không điền điểm speaking chưa chấm.

### 6 Kế hoạch tiếp theo

Người học reload dashboard để tải điểm; kiểm tra trực quan nếu còn lỗi. Word chưa nghiệm thu phân trang; không sửa các hash lịch sử.

**Minh chứng:** MB61, MB62, MB63, MB64, MB65, MB66, MB67, MB68, MB69, MB70, MB71, MB72, MB73, MB131, MB132, MB143, MB150.

Học sinh ký: ____________________  Giáo viên hoặc người chứng kiến ký: ____________________

## RG-10 Điểm năng lực từ độ khó bài và định hướng

**Loại:** Hạng mục hồi cứu. **Ngày:** Chưa xác nhận. **Trạng thái:** Bản biên tập; trạng thái triển khai theo nội dung và nguồn.

**Giai đoạn:** Tổng hợp các mốc kỹ thuật. **Giờ và địa điểm:** Chưa xác nhận.

**Thành viên và vai trò:** Vai trò từng phiên theo nhật ký đầy đủ; không bổ sung tên hoặc chữ ký. Nguồn: EN-20261012-29.

### 1 Mục tiêu cụ thể

Khi giáo viên giao bài, máy chủ yêu cầu AI đánh giá mức bài theo từng phiên bản. Mức nội bộ nằm trong khoảng 100–2400, kèm độ tin cậy, lý do, kỹ năng và thang điểm. Các mốc A1–C2 là quy ước tham khảo nội bộ; chưa được hiệu chỉnh để coi là kết quả CEFR chuẩn.

### 2 Dụng cụ và thiết bị

Windows, Node24.19.0, Next14.2.35, Prisma5.21.1, TypeScript, node:test, SQLite riêng, gateway MWAPI mocked khi test; Python3.12+lxml.

### 3 Tiến trình và quan sát

Điểm đóng góp của lượt làm bằng tỉ lệ điểm đạt nhân với mức bài. Ví dụ 8/10 × 1200 = 960. Khi công bố, năng lực cũ và điểm mới được kết hợp theo 80/20: 1200 × 80% + 960 × 20% = 1152. Chưa có nền tảng thì dùng điểm đóng góp đầu tiên. AI lỗi vẫn cho giao bài nhưng không tự bịa mức.

### 4 Dữ liệu và kết quả

Mỗi bài nộp chỉ tính một lần; sửa điểm thay đóng góp cũ và giữ thời điểm công bố đầu tiên. Mức bài cùng thang điểm được snapshot theo version. Phiên gốc ghi nhận 35/35 kiểm thử đạt, kiểm thử Prisma với cơ sở dữ liệu riêng và build 55/55 đạt. Thay đổi này mới hoàn thành local, chưa deploy, chưa migration Production và chưa gọi AI thật hay kiểm thử trình duyệt đăng nhập.

### 5 Sai sót và bài học

Phải snapshot cả mức bài và thang điểm theo version; thay contribution khi regrade, không cộng lại. Không đánh đồng nhãn tham khảo nội bộ với CEFR chuẩn. Khi AI lỗi vẫn giao bài nhưng không bịa mức. DB test phải cô lập, không reset dữ liệu.

### 6 Kế hoạch tiếp theo

Áp additive migration Production và deploy khi được yêu cầu; kiểm tra authenticated UI và AI thật, hiệu chỉnh mốc bằng dữ liệu được phép. Chưa đo chất lượng độ khó, DOCX hỗn hợp còn skill chính reading. Word chưa nghiệm thu phân trang.

**Minh chứng:** MB162, MB163, MB164, MB165, MB166, MB167, MB168, MB169, MB170, MB171, MB172, MB173.

Học sinh ký: ____________________  Giáo viên hoặc người chứng kiến ký: ____________________

## Danh mục minh chứng

Đường dẫn tính từ thư mục gốc dự án. SHA-256 và thời điểm đối chiếu nằm trong `evidence.json`. Ngày đối chiếu không phải ngày thực hiện nghiên cứu.


## Quy tắc cập nhật

Cập nhật journal.json và evidence.json, chạy scripts/export_research_journal.py rồi --check. Giữ kết quả thất bại và các đính chính; không tự gán ngày hoặc chữ ký. Xem AGENTS.md ở gốc dự án.

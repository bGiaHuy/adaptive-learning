# Đánh giá UX trước phát hành — Adaptive Learning

Ngày kiểm tra: 06/10/2026, giờ Việt Nam. Kết luận: **NO-GO — chặn phát hành dưới danh nghĩa website hoàn thiện.**

**Cập nhật kiểm thử học sinh cùng ngày:** đã khởi động được PostgreSQL bằng tiến trình trực tiếp và kiểm tra Adaptive English với backend thật, cơ sở dữ liệu cô lập, 42 bài / 239 bài tập từ học liệu repository. Xem [đánh giá trải nghiệm học tập](STUDENT-LEARNING-AUDIT.md) để biết kết quả. Các mô tả backend chưa hoạt động dưới đây là phạm vi đợt kiểm tra đầu; các lỗi mô phỏng vẫn được giới hạn đúng phạm vi, không đại diện cho hành vi backend thật.

## Phạm vi và độ tin cậy

Kiểm tra Adaptive English tại localhost:3000 và phiên khách riêng tại localhost:3003; Adaptive Math tại localhost:3002. Thử trình duyệt trên máy tính và viewport 390 × 844. Rà soát mã nguồn giao diện, dữ liệu học liệu và logic backend liên quan. Không sửa mã nguồn sản phẩm.

Backend mặc định localhost:4000 và backend thử nghiệm localhost:43100 không hoạt động trong lần kiểm tra này. Thử khởi động cơ sở dữ liệu có sẵn thất bại: môi trường sandbox không đọc được thông tin người dùng hệ điều hành; chạy bên ngoài sandbox lại bị PostgreSQL từ chối vì quyền quản trị. Vì thế các luồng đăng nhập/học đã quan sát chạy qua fallback mô phỏng. Không suy diễn các kết quả đó thành việc đã xâm nhập backend thật hoặc đã kiểm thử hệ thống triển khai công khai.

Đây vẫn là lỗi có ý nghĩa phát hành: fallback được gọi trực tiếp trong API client khi lỗi mạng, 404 hoặc 5xx, không có điều kiện giới hạn môi trường phát triển. Hai bản frontend đóng gói production thành công; đã kiểm tra cả hai bundle và xác nhận đều chứa mã lưu trữ mô phỏng `adaptive_mock_db_`.

Chưa xác minh trọn vẹn: luồng giáo viên/quản trị trên backend thật, đồng bộ đa thiết bị, chất lượng âm thanh nghe thực tế, tải cao, dịch vụ AI thật và toàn bộ ngân hàng câu hỏi. Không có cơ sở công nhận những phần này đạt yêu cầu.

## Các lỗi chặn phát hành

### UX-01 — Cơ chế mô phỏng giả làm ứng dụng đang hoạt động

**Mức độ: nghiêm trọng, cả hai ứng dụng. Đã tái hiện và đối chiếu mã.**

- Đăng nhập tài khoản mẫu `duc_nguyen` bằng mật khẩu kiểm thử sai vẫn được chấp nhận khi backend không hoạt động.
- `apiClient.js` gọi `handleMockApi()` khi lỗi mạng, HTTP 404 hoặc 5xx.
- Nhánh đăng nhập mô phỏng không kiểm tra mật khẩu. Tên người dùng chưa tồn tại còn được tự tạo, và vai trò được suy ra từ các chuỗi như `admin` hoặc `thay` trong tên.
- Không có chỉ báo rõ ràng rằng người dùng đang làm việc với dữ liệu demo. Bản Toán vẫn tuyên bố dữ liệu được đồng bộ trực tiếp với máy chủ.

**Tác động:** người dùng có thể tưởng đăng nhập, lưu bài, có hồ sơ và kết quả thật trong khi dữ liệu chỉ nằm ở trình duyệt. Không khẳng định đây là vượt quyền ở backend thật; vấn đề đã chứng minh là giao diện mô phỏng không trung thực với trạng thái dịch vụ.

**Điều kiện sửa đạt:** production không tạo phiên, quyền hoặc kết quả học giả khi dịch vụ lỗi; báo lỗi đúng và giữ dữ liệu nhập để thử lại. Demo phải có môi trường riêng và nhãn dễ thấy.

Nguồn: `Adaptive English/src/lib/apiClient.js`, `Adaptive English/src/lib/mockApiFallback.js:166`; các tệp tương ứng trong Adaptive Math.

### UX-02 — Tiếng Anh sập toàn bộ giao diện ngay sau đăng nhập

**Mức độ: nghiêm trọng. Đã tái hiện.**

Sau màn hình chuẩn bị, ứng dụng hiện “Đã xảy ra sự cố hiển thị giao diện”. Chi tiết: `TypeError: history.filter is not a function`. Tải lại trang vẫn sập.

Fallback mặc định trả đối tượng thông báo thành công cho API chưa được hỗ trợ; `AiTutorView` nhận nó như mảng lịch sử rồi gọi `.filter()`. `AiTutorDock` vẫn gắn `AiTutorView` vào cây giao diện khi panel ẩn, nên tính năng phụ có thể làm hỏng cả ứng dụng học.

**Điều kiện sửa đạt:** API AI sai cấu trúc, lỗi hoặc không khả dụng không làm sập trang học. Có kiểm tra kiểu dữ liệu, trạng thái lỗi riêng và ranh giới lỗi cục bộ.

Nguồn: `Adaptive English/src/components/AiTutorView.jsx:54`, `:120`; `AiTutorDock.jsx`; `mockApiFallback.js:704`.

Bằng chứng: `english-login-crash-desktop.png`, `english-login-crash-mobile.png`.

### UX-03 — Chọn lớp 6 nhưng hệ thống lưu lớp 9

**Mức độ: nghiêm trọng. Đã tái hiện và xác định nguyên nhân không phụ thuộc fallback.**

Thử chọn lớp 6, mục tiêu giữa kỳ, 30 phút/ngày, tự đánh giá Yếu. Tóm tắt bước 8 hiển thị lớp 6. Sau xác nhận, trang chính chào “học sinh Khối 9”; câu đầu yêu cầu rút gọn căn 245.

`OnboardingWizard` ghi cố định `grade: 9` vào dữ liệu nộp và `gradeLabel: 'Lớp 9'` vào trạng thái hoàn thành. Bước chọn chủ đề cũng dùng `GRADE_9_CHAPTERS`, và mặc định chọn sẵn hai chủ đề yếu. Giao diện hỏi lựa chọn nhưng không tôn trọng câu trả lời.

**Điều kiện sửa đạt:** chọn lớp 6/7/8/9 phải được lưu đúng, hiển thị đúng, tải đúng chương trình; danh sách chủ đề yếu theo lớp và ban đầu không tự gán điểm yếu. Kiểm tra cả tải lại trang và đăng nhập lại.

Nguồn: `Adaptive Math/src/components/OnboardingWizard.jsx:78`, `:93`, `:34`.

Bằng chứng: `math-grade6-question-mobile.png`, `math-grade9-fake-streak.png`.

### UX-04 — Bịa thời gian học và chuỗi học

**Mức độ: nghiêm trọng. Đã tái hiện và xác định nguyên nhân ở mã giao diện.**

Chỉ hoàn tất thiết lập và dừng bài chưa trả lời câu nào, trang chính đã hiện 45 phút học hôm nay và chuỗi 3 ngày. `ensureInitialStudyLogs()` tạo sẵn 45/45/30 phút cho ba ngày khi có hồ sơ; `PracticeCalendar` gọi hàm đó trong luồng bình thường. Đây là hành vi giao diện, không chỉ dữ liệu từ mock API.

**Tác động:** thống kê học tập không đáng tin; không thể dùng để cho học sinh, phụ huynh hoặc giáo viên đánh giá tiến bộ. Khi thiếu định danh trong profile, lịch còn dùng chung khóa `default_student`.

**Điều kiện sửa đạt:** tài khoản chưa học có 0 phút và không có chuỗi; chỉ ghi nhận hoạt động đã xảy ra; dữ liệu gắn đúng tài khoản và tách khỏi seed demo.

Nguồn: `Adaptive Math/src/lib/calendarSyncService.js:116`; `Adaptive Math/src/components/PracticeCalendar.jsx:31`.

Bằng chứng: `math-grade9-fake-streak.png`.

### UX-05 — Kết quả chẩn đoán và lộ trình tự mâu thuẫn

**Mức độ: nghiêm trọng trong chế độ fallback hiện tại. Đã tái hiện.**

Bắt đầu bài, bấm “Bỏ qua” ở câu đầu. Giao diện báo hoàn thành toàn bộ câu hỏi, số câu đã làm là 1, theta tăng từ 0.50 lên 0.62. Báo cáo hiện 82% thành thạo và 8 kỹ năng đã đánh giá. Sang Lộ trình học lại hiện “Chưa khởi tạo lộ trình học”.

Mock cố định số liệu năng lực; mỗi lần trả lời tăng theta bất kể đúng sai. Nó không chứng minh thuật toán chẩn đoán backend thật sai, nhưng chứng minh bản hiện tại có thể trình bày một báo cáo năng lực giả như kết quả thật.

**Điều kiện sửa đạt:** không đánh giá từ dữ liệu demo trong production; phân biệt câu bỏ qua, câu sai, chưa đủ bằng chứng; kết quả và lộ trình phải đồng nhất. Kiểm tra dừng/tiếp tục và mất kết nối giữa lúc nộp bài.

Bằng chứng: `math-one-skipped-question-complete.png`, `math-fabricated-mastery.png`.

### UX-06 — Toàn bộ 120 câu trắc nghiệm trong batch_003 có đáp án đúng ở lựa chọn đầu

**Mức độ: nghiêm trọng về giá trị đánh giá. Xác minh trực tiếp dữ liệu và cách hiển thị.**

Gói có 24 bài; 120/120 câu `SINGLE_CHOICE` đều có `options[0] === correctAnswer`. `EnglishHub` và `EnglishPlacementView` hiển thị options theo thứ tự lưu. Bộ chọn placement backend dùng câu theo ID và không trộn đáp án. Với cả ba gói hiện có, 174/238 câu trắc nghiệm có đáp án ở vị trí đầu.

**Tác động:** người học đoán theo vị trí có thể làm đúng cả gói thứ ba mà không hiểu nội dung. Điểm luyện tập và đề xuất dựa vào nó mất giá trị.

**Điều kiện sửa đạt:** thẩm định đáp án và phương án nhiễu, cân bằng vị trí đúng; nếu xáo trộn, giữ thứ tự ổn định trong một phiên và chấm bằng định danh thích hợp. Dùng kiểm tra dữ liệu để chặn tái diễn.

Nguồn: `Adaptive English/content/english/batch_003.json`; `EnglishHub.jsx`; `EnglishPlacementView.jsx`; `apps/api/src/modules/english/english.service.ts:94`.

### UX-07 — Có thể đưa câu đọc hiểu vào placement mà không đưa bài đọc

**Mức độ: cao. Xác minh mã và tái dựng bộ chọn bằng học liệu có sẵn; chưa chạy trên backend thật.**

Bộ chọn backend với cả ba gói đã xuất bản chọn câu `ex-014-01`, hỏi nhận định về bioluminescence “agree with the passage”. API trả ID, prompt, options, level, skill; không trả passage. Màn hình placement chỉ hiện đề và đáp án. Trong cấu hình học liệu này, người học thiếu văn bản cần thiết để trả lời.

**Điều kiện sửa đạt:** mọi câu có ngữ cảnh phải gửi và hiển thị đầy đủ ngữ cảnh; loại câu chưa đủ ngữ liệu khỏi đề. Thẩm định đề đầu vào như một đề hoàn chỉnh, không ghép cơ học câu từ bài học.

## Các điểm yếu UX còn lại

**Điều hướng công khai:** bấm Cách học đi tới `#features` nhưng `App` coi hash đó là URL không tồn tại, tạo 404. Link thương hiệu dùng `#main` cũng không nằm trong danh sách URL được chấp nhận. Đã tái hiện Cách học trên hai phiên. Xem `english-navigation-404.png`.

**Chi phí bắt đầu:** người mới tiếng Anh bấm Khám phá bài học được đưa vào đăng ký, chưa xem được bài mẫu. Có chú thích cần tài khoản nhưng nhãn nút vẫn tạo kỳ vọng xem thư viện. Toán bắt người mới qua tám màn trước bài khảo sát khoảng 30 phút; cần cân nhắc đường trải nghiệm ngắn và giải thích lợi ích trước khi yêu cầu cam kết đó.

**Mất bài làm tiếng Anh:** đáp án placement chỉ ở state React, reset khi tải lại/mount. Phiên backend giữ câu hỏi nhưng không thấy lưu từng đáp án. Việc chuyển trang có thể giữ trạng thái assessment ở server trong khi giao diện mất câu trả lời. Cần xác minh bằng backend thật; mã hiện tại là dấu hiệu rủi ro rõ ràng.

**Thiếu ngôn ngữ cho người dùng:** form đăng nhập nói HttpOnly, đăng ký giáo viên nói mã mời Crockford, bài Toán nói CAT/IRT/Rasch/theta. Những thuật ngữ này không giúp học sinh biết việc tiếp theo. Đổi thành hướng dẫn cụ thể, chuyển chi tiết kỹ thuật sang tài liệu quản trị.

**Khả năng tiếp cận:** 5 ô đăng ký học sinh có chữ nhãn nhìn thấy nhưng không có liên kết label, ID hoặc aria-label trong DOM đã kiểm tra. Các lựa chọn onboarding Toán là phần tử click không thấy hỗ trợ phím tương ứng. Trên mobile, các nút tiện ích tài khoản đo khoảng 23 × 23 px, dễ bấm nhầm. Đây là kiểm tra mẫu, không phải chứng nhận accessibility toàn bộ.

**Trạng thái phát hành:** cửa sổ điều khoản hiện DỰ THẢO, CHỜ KÝ DUYỆT và mã Gate nội bộ. README cũng ghi chưa được ký duyệt. Điều đó không phù hợp định vị là sản phẩm hoàn thiện. Đây là quan sát về độ hoàn thiện và niềm tin; không phải kết luận tuân thủ pháp luật.

## Độ khó và yêu cầu học tập

Toán: lựa chọn lớp không được tôn trọng là vấn đề nền tảng, phải sửa trước khi bàn chất lượng cá nhân hóa. Với học sinh yếu, áp lực 90 giây/câu và thuật ngữ năng lực kỹ thuật cần được giải thích hoặc điều chỉnh theo mục tiêu đo. Chưa đánh giá toàn bộ ngân hàng bài nên không kết luận mọi câu Toán sai mức.

Tiếng Anh: 42 bài trong ba gói, trong đó B2/C1/C2 mỗi mức chỉ có một bài cho từng kỹ năng nghe, đọc, từ vựng, ngữ pháp. Đây là độ phủ mỏng cho một lộ trình dài. Đề placement tối đa 12 câu chia tới sáu mức; nếu đủ cả sáu mức thì chỉ hai câu/mức. Kết quả nên được trình bày là gợi ý khởi đầu có độ chắc chắn hạn chế; cần thử với học sinh thực và thẩm định học thuật trước khi tin vào nhãn mức.

Cả tám đường dẫn audio trong học liệu hiện có đều có tệp trong public. Hai bài VOA đầu có toàn bộ segment `alignmentVerified:false`; giao diện có giải thích và tắt nút phát từng đoạn. Điểm tốt là trung thực về giới hạn này, nhưng lời hứa nghe lại từng đoạn chưa được đáp ứng nhất quán. Chưa nghe kiểm chứng chất lượng/timing thực tế.

## Những phần làm tốt

- Có định hướng thị giác, phân cấp tiêu đề và nút hành động chính; không phải một giao diện hoàn toàn sơ sài.
- Biểu mẫu đăng ký báo lỗi thiếu dữ liệu ngay tại trường; bố cục mẫu đăng ký và câu hỏi Toán không tràn ngang tại 390 × 844.
- Có màn hình lỗi, 404, empty state và nút quay về; cần sửa nguyên nhân và chất lượng phục hồi, không phải xây từ con số không.
- Bản tiếng Anh có cơ chế cho phép để kiểm tra đầu vào sau, chú thích kết quả không phải chứng nhận trình độ, và mô tả hạn chế transcript.
- Cả hai frontend build production thành công, lưu vào `build-english` và `build-math` trong thư mục audit. Build thành công không thay thế kiểm thử luồng người dùng.

## Thứ tự xử lý và tiêu chí mở lại phát hành

1. Loại fallback giả thành công khỏi production; sửa crash AI; sửa lưu lớp, chủ đề và lịch giả.
2. Thẩm định ngân hàng đáp án và đề đầu vào, cung cấp đủ bài đọc/audio; bảo đảm kết quả, hồ sơ và lộ trình cùng phản ánh một nguồn dữ liệu thật.
3. Sửa link/hash, nhãn form, thao tác bàn phím, lưu bài dở và thông báo lỗi/lưu thất bại.
4. Chạy nghiệm thu trên backend thật với tài khoản mới: đăng ký → chọn mức/lớp → học/làm bài → nộp → xem giải thích → xem tiến độ → tải lại → tiếp tục. Thử cả sai mật khẩu, mất mạng, dịch vụ AI lỗi và viewport mobile.
5. Hoàn tất nội dung dành cho người dùng và các phê duyệt phát hành còn ghi là dự thảo.

Nếu tôi là người chịu trách nhiệm doanh thu, tôi không ký cho phát hành bản hiện tại. Sản phẩm học tập phải giúp người dùng học đúng và tin được kết quả. Một giao diện bóng bẩy không bù nổi việc bỏ qua lựa chọn lớp, tạo thành tích chưa từng có và sập ngay sau đăng nhập.

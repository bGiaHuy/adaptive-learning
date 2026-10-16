# Đánh giá trải nghiệm học tập của học sinh

Ngày kiểm tra: 06/10/2026. Quyết định: **NO-GO cho phát hành dưới danh nghĩa sản phẩm học tập hoàn thiện.**

## Phạm vi thực nghiệm

Đợt này đã chạy được backend Nest/Prisma/PostgreSQL thật của Adaptive English, frontend tại localhost:43201, API tại localhost:43200. Tạo cơ sở dữ liệu kiểm thử riêng `adaptive_student_ux_20261006`, dùng tài khoản học sinh giả lập và nhập 42 bài / 239 bài tập từ ba gói học liệu trong repository. Việc đặt bài ở trạng thái xuất bản chỉ phục vụ fixture cô lập; không đánh giá quy trình duyệt nội dung giáo viên. Không sửa mã nguồn sản phẩm, không sử dụng hồ sơ học sinh thật.

Đã thử: lần đầu vào học, chọn bài A1, làm sai 0/5, xem tiến độ, sửa lỗi, đưa cấu trúc vào lịch ôn, ôn dịch và ôn tình huống, nghe A1 trên desktop và màn hình 390 × 844, bỏ dở bài đầu vào rồi quay lại, hoàn tất 12 câu đầu vào, làm lại bài ngữ pháp 5/5, xem năng lực, tải lại ứng dụng. Đây là kiểm thử theo vai học sinh; chưa phải nghiên cứu với học sinh thật hoặc đo hiệu quả học sau nhiều ngày.

Bản Toán dùng các bằng chứng của đợt trước: chọn lớp 6 nhưng hồ sơ lưu lớp 9, bài căn thức xuất hiện, thời gian/streak được tạo trước khi học. Chưa kiểm thử trọn chương trình Toán với backend thật. Các lỗi fallback trong báo cáo trước vẫn có phạm vi fallback; không biến chúng thành kết luận về backend thật.

## Nhận định về chất lượng học tập

Sản phẩm có nền tảng lưu kết quả và ôn tập hữu ích. Tuy nhiên, hành trình dành cho học sinh yếu còn đứt: tự chọn bài giữa nhiều cấp độ → đọc khối lý thuyết → trả lời → nhận đáp án → tự tìm chỗ ôn lỗi. Phần khó nhất — giúp học sinh hiểu nguyên nhân sai, sửa đúng trong tình huống mới và biết học gì tiếp — chưa được nối thành một buổi học rõ ràng.

Nếu chịu trách nhiệm phát hành, tôi chặn ở đây. Đổ lỗi cho học sinh không biết tự chọn bài hoặc không biết tự đánh giá câu sai là đẩy trách nhiệm thiết kế sang người đang cần được hướng dẫn.

## Các phát hiện theo mức ưu tiên

### SL-01 — Bài kiểm tra đọc không có bài đọc [P1, chặn phát hành]

Trong câu 9/12 của bài đầu vào, hệ thống hỏi TRUE/FALSE/NOT GIVEN về phát quang sinh học: sinh vật trên cạn có phổ biến hơn sinh vật biển không. Màn hình chỉ có câu hỏi và ba lựa chọn, không có đoạn văn. Backend lấy câu hỏi từ bài học nhưng chỉ trả prompt/options/level/kind, bỏ phần body của bài nguồn.

Học sinh buộc phải đoán hoặc dựa kiến thức ngoài văn bản; kết quả đó không phản ánh thao tác đọc hiểu được yêu cầu. Câu này vẫn tham gia xác định mức học. Đây là đề thi hỏng, không phải chuyện giao diện chưa đẹp.

Bằng chứng: [ảnh câu đọc thiếu văn bản](student-placement-reading-without-passage.png). Nguồn: `Adaptive English/apps/api/src/modules/english/english.service.ts`, `placementPool()` và payload assessment.

Yêu cầu: mọi câu phụ thuộc đoạn đọc/âm thanh phải nhận đủ ngữ cảnh; kiểm tra tính đầy đủ trước khi đưa vào đề đầu vào. Không được bắt học sinh đoán để đi tiếp.

### SL-02 — Quy luật vị trí đáp án làm hỏng độ tin cậy bài tập [P1]

Gói CEFR batch003 có 120/120 câu SINGLE_CHOICE đặt đáp án đúng ở vị trí đầu tiên; tổng ba gói có 174/238 câu trắc nghiệm như vậy. Frontend hiển thị đúng thứ tự gốc. Trong bài đầu vào thực tế, chọn phương án đầu ở cả 12 câu được 11/12 và kết quả A2. Không phải C2; không suy diễn điểm cao thành mức C2.

Học sinh có thể khai thác quy luật vị trí thay vì làm bài. Độ khó gắn nhãn A1–C2 không cứu được một bộ đáp án có mẫu dễ đoán đến mức này.

Bằng chứng: [kết quả chọn toàn phương án đầu](student-placement-result-first-options.png), dữ liệu ba batch và vòng render `exercise.options.map` trong `src/components/EnglishHub.jsx`.

Yêu cầu: phân bố đáp án được kiểm tra khi duyệt ngân hàng câu hỏi; xáo trộn có lưu ánh xạ ổn định trong phiên; bổ sung câu trả lời tự tạo phù hợp mục tiêu học.

### SL-03 — Bỏ dở đầu vào khiến học sinh mắc kẹt khi luyện bài [P1]

Trả lời câu đầu, chuyển sang Học tập rồi trở lại: bài đầu vào bắt đầu ở câu 1 và mất lựa chọn trước đó. Phiên assessment trên máy chủ vẫn hoạt động trong 60 phút. Khi chuyển sang bài ngữ pháp và nộp đủ 5 câu, màn hình không hiện kết quả hay lý do; backend chặn luyện khi assessment chưa nộp. `EnglishHub` có setError nhưng nhánh bài học đang mở không render error.

Vì thiếu lưu nháp, tiếp tục phiên và thoát rõ ràng, thao tác điều hướng bình thường biến thành sự cố. Học sinh yếu còn không có lựa chọn “Em chưa biết” trong bài đầu vào, phải chọn đáp án để mở nút tiếp theo.

Bằng chứng: [nộp bài luyện không có phản hồi](student-assessment-blocks-practice.png). Đối chiếu `EnglishPlacementView.jsx` và `english.service.ts` điều kiện activeExam.

Yêu cầu: lưu nháp bài đầu vào; nút tiếp tục/thoát có hậu quả rõ; thông báo khóa luyện ngay khi vào bài thay vì giấu ở lúc nộp; có cách trả lời không biết để tránh ép đoán.

### SL-04 — Chọn cấp độ và bài tiếp theo chưa dẫn dắt học sinh yếu [P1]

Lần đầu vào là thư viện 42 bài, 15 chủ đề, A1 đến C2 và IELTS; có nhắc kiểm tra đầu vào nhưng cho Để sau. Bộ lọc chính theo kỹ năng và tìm kiếm, chưa có bộ lọc mức học/thời lượng/kiến thức cần trước. Khi nhận kết quả A2 rồi chọn Khám phá bài học, học sinh lại về toàn thư viện.

Sau bài A1 sai 0/5, trang Tiến độ gợi ý cả A1, A2 và B1. Logic trang này ưu tiên kỹ năng điểm thấp và bài chưa hoàn thành, nhưng không dùng mức placement hay quan hệ tiên quyết. Trang Biểu đồ năng lực có logic đề xuất khác, ưu tiên mức đề xuất trong nhóm kỹ năng chưa đánh giá; hai nơi chưa tạo cùng một bước tiếp theo.

Bằng chứng: [lần đầu vào](student-first-visit.png), [0/5 và bài gợi ý](student-zero-score-completed-next-lessons.png).

Yêu cầu: một hành động chính “Học 10–15 phút hôm nay”, giải thích vì sao bài phù hợp; kết quả yếu dẫn đến bài sửa lỗi cùng mức trước khi đề xuất bước khó hơn. Cho phép tự khám phá nhưng không bắt người mới tự thiết kế giáo trình.

### SL-05 — Hoàn thành bài đang bị trộn với hiểu bài [P1]

Nộp 0/5 vẫn được đặt vào “Bài đã hoàn thành”. Có hiện điểm 0/5 nên không kết luận hệ thống giấu kết quả; vấn đề là trạng thái không phân biệt đã nộp, cần ôn lại và đã đạt mục tiêu. Bài này cũng bị loại khỏi nhóm gợi ý bài chưa hoàn thành.

Sau khi xem đáp án rồi làm lại đúng cùng 5 câu, biểu đồ hiện “Ngữ pháp 100%”, 1 bài/5 câu. UI có chú thích đúng rằng đây là tỷ lệ lần nộp gần nhất, chưa phải chứng nhận CEFR, chưa đo Nói/Viết; kỹ năng chưa có dữ liệu được để trống là điểm tốt. Tuy nhiên, con số lớn vẫn rất dễ tạo ấn tượng quá mức. Chưa có câu mới hoặc kiểm tra trì hoãn chứng minh hiểu và vận dụng.

Bằng chứng: [0/5 được hoàn thành](student-zero-score-completed-next-lessons.png), [năng lực sau làm lại](student-grammar-retry-competency.png).

Yêu cầu: tách trạng thái đã làm/cần sửa/đã đạt; báo rõ “5 câu của bài này”; dùng câu tương đương mới khi xác nhận cải thiện. Không dùng lượt nhớ đáp án làm bằng chứng duy nhất về năng lực rộng.

### SL-06 — Ôn ngữ pháp chưa bám sát lỗi vận dụng [P1]

Điểm tốt: 5 lỗi được lưu; mục Lỗi ngữ pháp có câu đã làm, đáp án và giải thích; thêm cấu trúc vào lịch ôn tạo 3 thẻ thật; trả lời sai ở chiều dịch buộc chọn Quên và lên lịch lại.

Nhưng đường sửa lỗi nằm ở mục khác sau khi làm bài. 5 lỗi To Be/do/does/s/es được gom thành nhóm rộng “Present simple”. Khi thêm nhóm này, Ôn hôm nay vẫn mặc định Từ vựng; phải tự đổi sang Cấu trúc ngữ pháp dù đã có thẻ đến hạn. Thẻ đầu hỏi dịch tên “Present simple”, thay vì sửa lỗi chia động từ vừa mắc.

Chế độ CONTEXT đưa ra tình huống dùng he/she. Tôi nhập sai `She go to school every day.`; màn hình hiện ví dụ mẫu, cho tự chọn Quên/Khó/Nhớ/Dễ, không chỉ ra lỗi cụ thể. UI nói rõ đây là tự đánh giá, không phải tự động chấm đúng. Vì vậy không gọi nó là chấm sai; vấn đề là người đang sai chưa đủ cơ sở để tự đánh giá. Chỉ CONTEXT không đủ để đạt “nhớ vững”: backend yêu cầu cả EN_VI và VI_EN.

Bằng chứng: [dịch tên cấu trúc](student-grammar-review-name-translation.png), [câu sai và tự đánh giá](student-context-wrong-self-rating.png).

Yêu cầu: ngay sau bài có nút “Sửa 3 lỗi này”; thẻ ngữ pháp ưu tiên điền/sửa câu và ví dụ mới theo lỗi cụ thể; phản hồi cho câu tự viết trước khi yêu cầu tự đánh giá. AI có thể hỗ trợ, nhưng lối sửa lỗi cơ bản phải hoạt động khi AI không trả lời.

### SL-07 — Bài học chưa được biên tập thành trải nghiệm dễ hiểu [P2]

Lý thuyết A1 hiển thị nguyên ký hiệu Markdown `###`, `**`, `*`. Một bài gộp To Be và Present Simple, rồi đưa 5 câu trắc nghiệm; chưa có bước ví dụ có hướng dẫn để chắc học sinh hiểu từng quy tắc trước khi trộn. Có giải thích ngắn, cụ thể sau khi nộp là điểm tốt.

Chuyển sang mục khác rồi mở lại bài mất toàn bộ câu đang chọn, không cảnh báo. Bài đã nộp vẫn lưu điểm qua tải lại, nhưng mở lại bắt đầu trống; không có nút xem lại toàn bộ bài làm cũ. Lỗi cũ còn xem được một phần trong mục ôn lỗi, nên không kết luận mọi dấu vết đã mất.

Bằng chứng: [lý thuyết thô](student-grammar-raw-markdown.png), [phản hồi 0/5](student-grammar-zero-score.png). Nguồn: `{lesson.body}` dạng văn bản và state answers trong `EnglishHub.jsx`.

Yêu cầu: trình bày lý thuyết thành các bước ngắn với ví dụ, phân biệt To Be/động từ thường; lưu nháp; cho xem lại bài làm và giải thích; làm lại có bài tương đương mới.

### SL-08 — Nghe trên điện thoại gây quá nhiều thao tác cuộn [P2]

Trình nghe A1 tải được audio khoảng 29,56 giây, tốc độ 0,75× thay đổi playbackRate thật, nút nghe đoạn 2 phát và dừng ở mốc cuối. Có transcript Anh–Việt và ba đoạn nghe là điểm tốt. Chưa đánh giá chất lượng phát âm bằng nghe người thật.

Ở 390 × 844, khi mở transcript, toàn trang dài khoảng 4.230 px; câu đầu ở cách vùng đầu trang hơn 1.100 px. Khi chọn đáp án ở phần câu hỏi, trình nghe đã ngoài màn hình. Học sinh phải kéo qua lại để nghe lại và trả lời, không có điều khiển nghe cạnh câu hỏi. Transcript chưa làm nổi bật câu đang phát.

Bằng chứng: [trình nghe mobile](student-listening-mobile-viewport.png), [màn câu hỏi mất điều khiển nghe](student-listening-question-mobile.png).

Yêu cầu: điều khiển audio luôn tiếp cận được khi làm câu; nghe lại đoạn liên quan; transcript mở theo nhu cầu và đánh dấu đoạn đang nghe.

### SL-09 — Flashcard có khung ôn đúng nhưng chưa phải trải nghiệm thẻ tốt [P1]

Luồng hiện có đủ các mảnh cơ bản: chọn Từ vựng / Cấu trúc, chọn chiều Anh → Việt, Việt → Anh hoặc Dùng trong tình huống, tự gõ câu trả lời, mở đáp án, rồi chọn Quên / Khó / Nhớ / Dễ. Nút và ô nhập đạt kích thước chạm tối thiểu; có focus ring; trên mobile các nút đánh giá chuyển thành lưới 2 × 2. Đây là phần làm được.

Nhưng “thẻ” hiện giống một form chấm bài hơn là một lượt học nhẹ và nhanh. Người học phải tự chọn tab Ôn hôm nay, tự chọn loại nội dung, tự chọn chiều, rồi bấm Bắt đầu ôn; không có lời mời rõ “Bạn có 6 thẻ đến hạn — bắt đầu ngay”. Khi kho trống, trang vừa nói 0 từ vừa hiển thị số thẻ đến lịch ôn và cấu trúc đã lưu, nhưng không giải thích vì sao các bộ đếm khác nhau. Với học sinh, đây là cảm giác dữ liệu sai.

Màn hình công khai một đoạn giải thích kỹ thuật dài về FSRS, độ bền ≥ 7 ngày và khả năng nhớ ≥ 80% trước khi người học làm thẻ. Học sinh chỉ cần biết hôm nay có bao nhiêu thẻ, phải làm gì, và lần sau gặp lại lúc nào; thuật ngữ thuật toán đang chiếm chỗ của hướng dẫn hành động.

Quan trọng hơn, chiều CONTEXT không chấm đúng/sai tự động. Backend trả `correct: null`, sau đó vẫn cho chọn cả bốn mức. Giao diện có nói “Tự đánh giá cách dùng từ”, nên không thể gọi đây là bug chấm điểm; nhưng với người đã viết sai, bắt họ tự quyết định Nhớ hay Quên là thiết kế yếu. Góp ý AI là nút phụ thuộc bên ngoài và không được coi là đường sửa lỗi tối thiểu.

Ở phần từ gợi ý, mỗi nút chỉ có từ và nghĩa: `remember — nhớ`, `borrow — mượn`… Không thấy ví dụ, phát âm, từ loại, nguồn bài học hoặc tình huống trước khi thêm. Sau khi thêm mới, thẻ trong kho có ví dụ nhưng bị giấu trong disclosure “Ví dụ & mức nhớ từng chiều”; học sinh phải tự biết mở ra.

Các nút Quên / Khó / Nhớ / Dễ có màu đỏ–vàng–xanh–xanh lá và lịch hẹn, nhưng chưa có giải thích ngắn về khi nào chọn mức nào ngay cạnh nút. Việc dùng màu để phân nghĩa cũng cần được hỗ trợ bằng văn bản, đặc biệt trên màn hình nhỏ hoặc với người khó phân biệt màu.

Mã nguồn `PersonalStudyView.jsx` xác nhận các điểm này: queue chỉ tải sau nút “Bắt đầu ôn”; `correct === null` cho CONTEXT; mọi rating được mở; các mục catalog chỉ render `term` và `meaning`; phần hướng dẫn FSRS được render ngay phía trên tabs. CSS có breakpoint mobile và vùng chạm 44px, nhưng chưa có trạng thái sticky/tiến độ lượt ôn để giảm tải thao tác.

Đánh giá: **UI thẻ đạt mức dùng thử nội bộ, chưa đạt mức sản phẩm học tập hoàn thiện.** Tính năng scheduler có thật, nhưng trải nghiệm học vẫn bắt người dùng tự hiểu thuật toán và tự chấm phần khó nhất.

Yêu cầu: đặt một CTA rõ theo số thẻ đến hạn; hiển thị bộ đếm nhất quán “từ / cấu trúc / tổng”; đưa ví dụ và phát âm vào thẻ trước hoặc ngay sau khi lật; thêm hướng dẫn ngắn cho bốn mức đánh giá; CONTEXT phải chỉ ra lỗi ngôn ngữ cơ bản trước khi tự chấm; hiển thị tiến độ `3/8 thẻ`; giữ nút thao tác trong vùng dễ chạm trên mobile.

### SL-10 — Bản Toán chưa giữ đúng nhu cầu học sinh [P1, phạm vi đợt trước]

Chọn lớp 6 nhưng lưu lớp 9 và đưa bài căn thức là sai ngay điểm xuất phát. Hồ sơ còn có streak/thời gian học được tự tạo trước khi học. Hai lỗi này phá sự tin cậy với học sinh và phụ huynh. Bằng chứng và phạm vi fallback được ghi trong [báo cáo phát hành](UX-RELEASE-AUDIT.md); không mở rộng kết luận sang hiệu quả toàn bộ chương trình Toán.

## Cửa kiểm định trước phát hành

1. Đề đầu vào đủ ngữ cảnh, không lộ quy luật đáp án, có lưu/tiếp tục/thoát; câu không biết không buộc đoán.
2. Học sinh lớp 6 được bài đúng lớp; học sinh tiếng Anh mới có bước bắt đầu theo mức và mục tiêu rõ ràng.
3. Buổi học ngắn có ví dụ → thử có hướng dẫn → tự làm → sửa lỗi → kiểm tra lại bằng câu mới → bước hôm sau. Không phải cứ nhiều bài là trải nghiệm học tốt.
4. Sai 0/5 phải hiện “cần ôn”, có đường sửa ngay; đề xuất bài phù hợp lỗi và mức học nhất quán giữa các trang.
5. Bài đang làm không mất vì chuyển mục; nộp thất bại luôn có phản hồi; audio dùng thuận tiện trên điện thoại.
6. Điểm luyện, lần làm lại và bằng chứng vận dụng được diễn đạt rõ. Không tạo dữ liệu thời gian/streak để trang trông đông vui.
7. Sau khi sửa, kiểm thử với học sinh thật ở các mức yếu/trung bình/khá: họ có tự bắt đầu được không, có hiểu vì sao sai không, có giải được câu mới không, hôm sau có biết tiếp tục đâu không. Chưa có dữ liệu này thì chưa được tuyên bố sản phẩm đã nâng kết quả học.

## Giới hạn còn lại

Hai nút AI được thử (gợi ý bài và góp ý câu tự viết) chưa cho phản hồi hữu ích nhìn thấy trong phiên kiểm thử này. Không đánh giá chất lượng nội dung AI vì chưa có câu trả lời để chấm. Chưa kiểm chứng trải nghiệm học dài hạn, báo cáo phụ huynh, giao bài giáo viên, đa thiết bị hay toàn bộ nội dung nghe/đọc. Không có phát hiện nào ở đây tự chứng minh mức CEFR hoặc độ khó của mọi bài đã được thẩm định chuyên môn.

Kết luận: có nhiều chức năng học thật, nhưng vòng học–sai–sửa–vận dụng–tiếp tục chưa đạt. Tôi không ký phát hành một sản phẩm tự nhận cá nhân hóa mà học sinh yếu vẫn phải tự tìm đường cứu bài học của mình.

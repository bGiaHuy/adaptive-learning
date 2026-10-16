# Kinh nghiệm làm việc với chủ dự án Adaptive English

Ngày tổng hợp: 13/10/2026, Asia/Saigon. Dành cho Codex và agent tiếp nhận công việc trong workspace này.

## Cách hiểu tài liệu này

Nguồn chính là nhật ký đầy đủ `research-journal/NHAT_KY_NGHIEN_CUU_ADAPTIVE_ENGLISH.docx` (89.352 byte trước phiên tổng hợp), đối chiếu với Markdown và `journal.json` cùng thư mục; bản rút gọn 12.706 byte không được dùng thay nguồn đầy đủ. Các mã phiên bên dưới tra tại [nhật ký đầy đủ](research-journal/NHAT_KY_NGHIEN_CUU.md). Quy định trực tiếp lấy từ [AGENTS.md](../AGENTS.md).

Đây là hướng dẫn hành động rút từ lịch sử dự án, không phải hồ sơ tính cách. Nhật ký chủ yếu ghi công việc và bài học của agent; không phải mọi bài học đều là lời nguyên văn hoặc sở thích đã được chủ dự án xác nhận. Khi yêu cầu mới khác với kinh nghiệm cũ, đọc yêu cầu hiện tại và làm rõ mâu thuẫn thực sự trước khi áp dụng.

## Những điều cần nắm ngay

- Sản phẩm là Adaptive English. Không áp yêu cầu riêng của Math vào English khi chưa được yêu cầu.
- Làm đúng thay đổi được giao, giữ những phần đang hoạt động và dữ liệu thật. Một chỉnh sửa nhỏ không phải giấy phép thiết kế lại cả luồng.
- Kết quả phải dùng được trong thao tác thực tế. Giao diện đẹp, build thành công và thông báo thành công chưa đủ chứng minh dữ liệu đã lưu.
- Người dùng sản phẩm cần nhãn ngắn, rõ và đúng ngữ cảnh; chi tiết kỹ thuật dành cho tài liệu hoặc phần giải thích phù hợp.
- Báo đúng điều đã làm và đã kiểm tra. Không nâng kiểm tra một phần thành nghiệm thu toàn bộ.
- Mỗi phiên thay đổi phải cập nhật nguồn nhật ký JSON, minh chứng, bản xuất và WORKLOG theo AGENTS.md.

## Nên làm và không nên làm

| Tình huống | Nên làm | Không nên làm | Cơ sở |
|---|---|---|---|
| Nhận yêu cầu sửa | Đọc lịch sử liên quan, xác định màn hình, vai trò, hành vi mong muốn và phạm vi | Sửa lan sang chức năng khác hoặc đưa yêu cầu Math vào English | AGENTS.md |
| Rút gọn tài liệu | Giữ mẫu, sáu mục, metadata, phần ký; tạo bản riêng khi cần | Hiểu rút gọn là được đổi font, lề, cấu trúc hoặc xóa nguồn gốc | EN-20261012-30, 31 |
| Dọn giao diện | Dùng nhãn dễ hiểu; bỏ mô tả lặp và chi tiết triển khai không giúp thao tác | Đưa Rule-based, Demo Preview, quy tắc nội bộ hoặc ghi chú kiểm thử lên luồng học | EN-20261010-13–18; EN-20261011-13 |
| Nhận ảnh báo lỗi | Xem ảnh là đầu mối, kiểm tra URL, tài khoản và nguồn dữ liệu thực tế | Kết luận lớp không tồn tại, mất dữ liệu hay lỗi upload chỉ từ ảnh | EN-20261012-13, 41 |
| Lưu tiến trình | Chờ server xác nhận; kiểm tra tải lại và đọc lại; giữ nháp khi lỗi | Chỉ đổi state/localStorage rồi báo lưu hoặc nộp thành công | EN-20261011-08, 10; EN-20261012-14, 19 |
| Dữ liệu thiếu | Phân biệt chưa làm, chưa chấm, chưa đồng bộ, lỗi API và điểm 0 thật | Điền điểm giả, suy CEFR từ lượt hoàn thành, tô radar kỹ năng chưa chấm | EN-20261012-15, 23–25 |
| AI chấm bài | Gửi kèm đề và ngữ cảnh, lưu lỗi rõ ràng, dùng kết quả thật | Gọi điểm hằng số hoặc rule-based là chấm phát âm AI; bịa mức khi AI lỗi | EN-20261011-03; EN-20261012-16, 29 |
| Giáo viên chấm điểm | Tách lưu/chấm khỏi công bố; kiểm tra quyền và API học sinh | Chỉ che điểm ở UI hoặc coi chưa nộp là đã nộp điểm 0 | EN-20261012-16, 36 |
| DOCX và tệp đính kèm | Kiểm tra từ nhập, duyệt, giao, xem đến nộp; giữ lịch sử phiên bản | Coi đính kèm Word là chuyển thành câu hỏi; tin mỗi đuôi tệp hoặc MIME | EN-20261012-12, 14, 32, 34 |
| Đang tải AI | Giữ hình học màn hình, trì hoãn ngắn, thoát khi lỗi/timeout, giữ nội dung nhập | Dùng chung trạng thái lưu và AI, nhấp nháy nhiều phần tử, để tải vô hạn | EN-20261012-09, 35, 38 |
| Triển khai | Xác minh đúng dự án, database, deployment và domain; kiểm tra runtime phù hợp | Suy database đúng từ tên project; coi READY hoặc HTTP 200 là E2E | EN-20261012-17, 22, 33, 40 |
| Quay video | Khớp lời đọc với màn hình và thao tác thành công; ghi rõ dữ liệu thử | Quảng bá tính năng chưa có hoặc coi giải mã video là đã xem/nghe toàn bộ | EN-20261011-01; EN-20261012-28 |
| Ghi nhật ký | Giữ FAIL/BLOCKED, ngày chưa rõ và minh chứng lịch sử; thêm đính chính mới | Sửa hash cũ, bịa buổi nghiên cứu, khảo sát, chữ ký hay link Drive | AGENTS.md; EN-20261010-01, 07 |

## Cách triển khai một yêu cầu

### Trước khi sửa

1. Đọc AGENTS.md, nhật ký và WORKLOG liên quan; kiểm tra thay đổi có sẵn để không ghi đè công việc của người khác.
2. Diễn giải yêu cầu thành kết quả quan sát được. Ví dụ: ảnh mới phải hiện khi học sinh mở bài đang có nháp cũ, đồng thời bài nộp cũ vẫn giữ phiên bản dùng để chấm.
3. Xác định local hay production, học sinh hay giáo viên, nguồn dữ liệu nào đang phục vụ màn hình. Không mặc định một công cụ đang kết nối là đúng database.
4. Thông báo ngắn sẽ làm gì. Chỉ hỏi thông tin thiếu có ảnh hưởng đến kết quả; tận dụng ngữ cảnh đã có. Đây là cách phối hợp đề xuất, không phải lời xác nhận sở thích suy ra từ nhật ký.

### Trong khi làm

1. Chọn thay đổi đủ giải quyết nguyên nhân; giữ dữ liệu, bản nháp, tệp và lịch sử phiên bản.
2. Theo dấu toàn luồng: thao tác → API → ghi dữ liệu → đọc lại → hiển thị đúng vai trò. Khi chỉ kiểm tra được một đoạn, ghi rõ đoạn đó.
3. Phân biệt lỗi môi trường, lỗi công cụ kiểm thử và lỗi sản phẩm. EACCES hoặc thiếu renderer không tự chứng minh ứng dụng hỏng.
4. Kiểm thử sát hành vi thay đổi. UI cần quan sát trình duyệt; lưu dữ liệu cần đọc lại; phân quyền cần kiểm tra server; triển khai cần xác minh domain trỏ đúng bản.
5. Khi có phát hiện mới, cập nhật ngắn bằng tiếng Việt: đã xác định gì, còn chưa rõ gì, bước tiếp theo giải quyết điều gì.

### Trước khi báo xong

1. Đối chiếu kết quả với yêu cầu ban đầu và chỉnh sửa mới nhất của chủ dự án.
2. Chỉ liệt kê kiểm thử thực sự đã chạy, kết quả và giới hạn. Tách kiểm thử fixture/local khỏi tài khoản production thật.
3. Lưu minh chứng có hash, thêm entry đúng ngày Asia/Saigon, xuất Markdown/Word và chạy exporter `--check`; bổ sung WORKLOG.
4. Với Word, kiểm tra trang bằng renderer nếu dùng được. XML đúng chưa chứng minh bố cục; nếu renderer lỗi, nói rõ chưa xác minh phân trang.
5. Gửi đường dẫn đầu ra, tóm tắt thay đổi, kiểm tra đã chạy và phần còn thiếu. Đừng bắt người dùng đọc toàn bộ log để biết kết quả.

## Ranh giới tự chủ

Có thể chủ động đọc nguồn, chẩn đoán chỉ đọc, sửa trong phạm vi được giao và kiểm thử bằng dữ liệu cô lập. Đây là cách làm đề xuất để công việc tiến triển; phạm vi ủy quyền thực tế vẫn theo yêu cầu của chủ dự án và quy định môi trường.

Không reset/seed database, xóa bài nộp, ghi âm hay học liệu thật để tiện kiểm thử. Không tự phát hành web, đưa dữ liệu local lên mạng hoặc chia sẻ hồ sơ riêng tư công khai. Yêu cầu sửa mã không mặc nhiên cho phép deploy; quyền deploy không mặc nhiên cho phép tạo/xóa dữ liệu production. Tạo tài nguyên có chi phí hoặc chuyển database cần phạm vi và xác nhận phù hợp. Nếu đã được cho phép rõ trong phiên thì dùng sự cho phép đó trong đúng phạm vi, không hỏi lại máy móc. Cơ sở: AGENTS.md; EN-20261010-09, 10, 12; EN-20261012-05–07.

## Những phân biệt quan trọng trong dự án

- Hoàn thành bài học khác có điểm năng lực; điểm tham khảo khác điểm chính thức hoặc CEFR chuẩn.
- Chấm xong khác công bố; chưa xem thông báo khác chưa chấm bài.
- Chưa nộp khác nộp điểm 0; không có dữ liệu khác kết quả bằng 0.
- Có bảng khác lưu đủ dữ liệu; có cấu hình AI khác đã gọi AI thành công.
- Đã nhập câu hỏi khác học sinh xem và nộp được; đính kèm tệp khác chuyển nội dung tệp thành câu hỏi.
- Build đạt khác runtime đạt; HTTP 401 chứng minh chặn truy cập ở request đó, không chứng minh luồng đăng nhập hoạt động.
- Có ngắt trang khác đúng số trang; phần biên tập nhật ký khác buổi nghiên cứu thực tế.

## Mẫu báo cáo ngắn

> Đã sửa/tạo: [kết quả cụ thể và đường dẫn].
>
> Đã kiểm tra: [thao tác hoặc lệnh đã chạy, môi trường, kết quả].
>
> Còn giới hạn: [phần chưa xác minh hoặc bị chặn, nếu có].
>
> Nhật ký: [mã phiên và đường dẫn minh chứng].

Ví dụ cách diễn đạt: “Đã sửa link mời để giữ mã lớp qua trang đăng nhập. Kiểm tra chuyển hướng đã đạt; chưa xác minh tham gia lớp bằng tài khoản thật.” Tránh “Đã hoạt động hoàn hảo” khi mới kiểm tra build hoặc HTTP.

## Điều chưa thể suy ra

Nhật ký không đủ để kết luận tính cách, mức chấp nhận chi phí, mọi sở thích thiết kế, thời hạn mặc định hoặc quyền thao tác trên mọi dịch vụ của chủ dự án. Không biến một yêu cầu xóa nhãn ở một màn hình thành lệnh xóa mọi giải thích; không biến một lần cho phép deploy thành quyền phát hành vô hạn. Khi chưa rõ, ghi nhận giả định và hỏi đúng điểm cần quyết định.

## Cách dùng cho agent mới

Đọc tài liệu này để hiểu cách phối hợp, rồi đọc yêu cầu hiện tại và nguồn liên quan trước khi sửa. Dùng mã phiên để truy ngược bài học; đừng coi trạng thái hạ tầng ghi trong lịch sử là trạng thái hiện tại. Khi có phản hồi trực tiếp mới của chủ dự án, cập nhật hướng dẫn kèm nguồn, ngày và phạm vi áp dụng; giữ dấu vết đính chính khi nội dung cũ không còn đúng.

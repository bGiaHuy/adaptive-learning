# Chẩn đoán biểu đồ tiến độ không nhận bài tự học

Ngày đối chiếu: 2026-10-11 (Asia/Saigon)

## Phạm vi

Chỉ đọc mã và quan sát trang local đang chạy với tài khoản học sinh hiện tại. Không sửa mã sản phẩm, không nộp thêm bài, không reset/seed/xóa cơ sở dữ liệu và không deploy.

## Quan sát trực tiếp

- Trang `http://localhost:3008/student/progress` tải thành công trong browser local.
- Biểu đồ radar hiển thị 3/6 kỹ năng có kết quả: Reading A2, Listening A1, Grammar A1; Writing, Speaking và Vocabulary đều chưa đánh giá.
- Bảng chi tiết bên dưới hiển thị Writing 0 lần, Speaking 0 lần; Vocabulary lại hiển thị B1 và 52 lần từ dữ liệu khởi tạo. Thẻ “Từ vựng nhớ ổn định” hiển thị 0 từ vì chỉ đếm từ có trạng thái `mastered`.
- Đây là mâu thuẫn ngay trên cùng trang: biểu đồ, bảng chi tiết và thẻ từ vựng không dùng cùng một nguồn dữ liệu.

## Đối chiếu mã

- `src/components/ui/SkillRadar.tsx` chỉ gọi `getSkillChartData(placementTest)`.
- `src/lib/skillChart.ts` chỉ đọc đáp án bài kiểm tra đầu vào cho Reading, Listening và Grammar; các trục Writing, Speaking, Vocabulary nhận tập đáp án rỗng nên không thể được vẽ từ bài tự học.
- `src/lib/store.tsx` tái tạo `skillEstimates` từ placement. Writing và Speaking bị gán cứng `evidenceCount: 0`, `evaluated: false`; Vocabulary rơi về `initialSkillEstimates` thay vì dữ liệu ôn từ thực tế.
- `src/app/student/learn/[skill]/[lessonId]/page.tsx` khi hoàn thành chỉ ghi một bản `adaptive_study_last_session` vào `localStorage`, ghi đè phiên trước, rồi chuyển sang trang tổng kết. Luồng này không gọi API cập nhật hồ sơ năng lực.
- `src/app/api/student/progress/route.ts` có thể đọc `StudentSkillProfile`, từ vựng và bài nộp, nhưng không có phía giao diện gọi route này.
- `src/app/api/placement/route.ts` chỉ cập nhật `StudentSkillProfile` khi hoàn tất placement cho Reading, Listening và Grammar; đồng thời giữ Writing/Speaking ở trạng thái chưa đánh giá.

## Kiểm thử đã chạy

- Lệnh: `node --test tests/skill-chart.test.cjs`
- Môi trường: Windows, Node.js của dự án, thư mục `english-learning-platform`, server local tại cổng 3008.
- Kết quả: PASS, exit code 0; 2/2 test đạt, 0 fail, thời lượng 289.6379 ms. Test xác nhận thiết kế hiện tại chỉ vẽ các phần placement đã hoàn thành và giữ kỹ năng không có placement ở trạng thái chưa đánh giá; test chưa bao phủ việc tổng hợp bài tự học.
- Kiểm tra browser: PASS cho việc tái hiện lỗi/mâu thuẫn dữ liệu như mô tả trên. Không có thao tác ghi dữ liệu.
- Đồng bộ nhật ký: exporter PASS exit 0; `--check` PASS exit 0, 42 entry/111 minh chứng. Giữ nguyên cảnh báo hash của các nguồn lịch sử đã thay đổi.
- Render Word bằng renderer bundled: FAIL exit 1 vì không tìm thấy `soffice.exe` trên PATH. Bản nguồn và DOCX vẫn được lưu; phân trang trực quan chưa được nghiệm thu.

## Kết luận

Nguyên nhân là thiếu đường ống tổng hợp tiến độ. Bài Writing/Listening/Speaking tự học đang có dữ liệu đủ để hiện trang tổng kết nhưng không được lưu thành lịch sử nhiều phiên hay cập nhật `StudentSkillProfile`; radar chỉ phản ánh placement. Vocabulary dùng ba cách tính khác nhau giữa radar, bảng chi tiết và thẻ mastered. Tải lại trang không thể khắc phục vì đây là logic nguồn dữ liệu.

## Hướng xử lý đề xuất

Tạo bản ghi `LessonAttempt` theo user trên server, ghi mỗi lần hoàn thành, tổng hợp theo kỹ năng vào một API tiến độ duy nhất, rồi cho radar, bảng chi tiết và các thẻ cùng đọc API đó. Với Writing/Speaking, chỉ tăng bằng chứng hoàn thành khi có bài/bản ghi hợp lệ; tách trạng thái “đã hoàn thành” khỏi mức CEFR nếu chưa có điểm đáng tin cậy. Với Vocabulary, thống nhất các chỉ số số từ đã ôn, số lượt ôn và số từ mastered.

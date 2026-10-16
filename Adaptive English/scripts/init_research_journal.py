"""One-time bootstrap from existing evidence; never overwrite an existing journal."""
import hashlib
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/research-journal'
REFERENCE = Path('C:/Users/Administrator/Downloads/NHAT_KY_NGHIEN_CUU_15_BUOI_DU_THAO_1.docx')

SOURCES = [
('MB01', 'docs/PRODUCT-SPEC.md', 'Mô tả mục tiêu và phạm vi sản phẩm; chưa chứng minh hiệu quả giáo dục.'),
('MB02', 'english-learning-platform/docs/26-end-to-end-role-journeys.md', 'Đặc tả hành trình theo vai trò.'),
('MB03', 'docs/content-data-contract.md', 'Quy ước dữ liệu và truy xuất nguồn học liệu.'),
('MB04', 'data/reports/quality-report.md', 'Báo cáo chất lượng lịch sử; số liệu cần đối chiếu với dữ liệu app thực dùng.'),
('MB05', 'english-learning-platform/public/audio/placement-test-dialogue.mp3', 'Tệp audio tồn tại; chưa đối chiếu nội dung nghe trong phiên này.'),
('MB06', 'english-learning-platform/src/app/student/placement-test/page.tsx', 'Mã nguồn bài kiểm tra đầu vào.'),
('MB07', 'english-learning-platform/src/lib/learning.ts', 'Mã nguồn xử lý hoạt động học.'),
('MB08', 'english-learning-platform/src/lib/fsrs.ts', 'Mã nguồn lập lịch ôn từ.'),
('MB09', 'english-learning-platform/docs/DICTIONARY.md', 'Mô tả dữ liệu và luồng tra cứu từ điển.'),
('MB10', 'english-learning-platform/src/app/api/classes/route.ts', 'Mã nguồn quản lý lớp học.'),
('MB11', 'english-learning-platform/src/app/api/grading/[submissionId]/route.ts', 'Mã nguồn chấm và trả bài.'),
('MB12', 'english-learning-platform/src/lib/docxParser.ts', 'Mã nguồn nhập học liệu Word.'),
('MB13', 'english-learning-platform/src/lib/aiEngine.ts', 'Mã nguồn kết nối AI và các chế độ xử lý.'),
('MB14', 'english-learning-platform/src/components/ui/AudioRecorder.tsx', 'Mã nguồn ghi âm trên trình duyệt.'),
('MB15', 'english-learning-platform/docs/LEAF_AI.md', 'Mô tả truy xuất tri thức và bộ nhớ hội thoại Leaf.'),
('MB16', 'english-learning-platform/src/lib/leafRetrieval.ts', 'Mã nguồn xếp hạng tài liệu cho Leaf.'),
('MB17', 'english-learning-platform/docs/29-design-system-and-ui-specifications.md', 'Đặc tả thiết kế giao diện.'),
('MB18', 'english-learning-platform/public/screenshots/06-mobile-learn-390px.png', 'Ảnh giao diện mobile đã lưu; không chứng minh backend.'),
('MB19', 'docs/WORKLOG.md', 'Nhật ký tổng hợp cũ, gồm tuyên bố PASS cần đối chiếu log gốc.'),
('MB20', 'docs/verification-logs/raw-tests.log', 'Log lịch sử ngày 08/10/2026: PASSED 5/10; không phải lần kiểm thử mới.'),
('MB21', 'docs/verification-logs/raw-browser.log', 'Log trình duyệt lịch sử có lỗi tải tài nguyên 404.'),
('MB22', 'docs/verification-logs/raw-build.log', 'Log build lịch sử; không thay cho build bản hiện tại.'),
('MB23', 'english-learning-platform/src/lib/auth.ts', 'Đọc mã thấy fallback tài khoản mẫu và cookie chứa userId.'),
('MB24', 'english-learning-platform/src/app/api/auth/switch-role/route.ts', 'Đọc mã thấy chuyển tài khoản mẫu theo role chưa có chặn production.'),
('MB25', 'english-learning-platform/src/app/auth/recover/page.tsx', 'Trang khôi phục hiện chỉ cập nhật state và thông báo mô phỏng.'),
('MB26', 'AGENTS.md', 'Quy định cập nhật nhật ký cho các phiên làm việc sau.'),
('MB27', 'english-learning-platform/AGENTS.md', 'Hướng dẫn trong ứng dụng dẫn về nhật ký ở workspace gốc.'),
('MB28', 'scripts/export_research_journal.py', 'Công cụ đồng bộ nhật ký Markdown và Word, kiểm tra cấu trúc.'),
]


def entry(number, title, stage, objective, equipment, procedure, results, lessons, next_step, evidence):
    return dict(id=f'EN-HC-{number:02d}', kind='retrospective', title=title, date=None,
                stage=stage, status='Hồi cứu, cần xác nhận ngày và người thực hiện',
                participants='Chưa xác nhận thành viên thực hiện; Codex tổng hợp từ nguồn đã lưu ngày 10/10/2026.',
                objective=objective, equipment=equipment, procedure=procedure, results=results,
                lessons=lessons, next=next_step, evidence=evidence)


def main():
    if (OUT / 'journal.json').exists():
        raise SystemExit('Journal exists; bootstrap will not overwrite it.')
    (OUT / 'qa').mkdir(parents=True, exist_ok=True)
    shutil.copyfile(REFERENCE, OUT / 'qa/reference.docx')
    entries = [
entry(1, 'Xác định vấn đề và phạm vi nghiên cứu', 'Định hướng sản phẩm',
'Xác định nhu cầu hỗ trợ học sinh tự học tiếng Anh và giúp giáo viên theo dõi bài tập lớp.',
'Máy tính, tài liệu đặc tả sản phẩm và quy trình các vai trò; cấu hình máy của buổi gốc chưa xác nhận.',
'Tổng hợp định hướng trong tài liệu: tự học là luồng chính; lớp học bổ trợ giao bài và nhận xét. Phân biệt tiến độ hoàn thành bài với ước lượng năng lực.',
'Đã tìm thấy đặc tả cho học sinh, giáo viên và quản trị viên. Đây là bằng chứng về phạm vi thiết kế, chưa phải số liệu khảo sát nhu cầu hoặc hiệu quả học tập.',
'Không suy ra tác động giáo dục từ việc có nhiều tính năng. Chưa có dữ liệu khảo sát hoặc đánh giá trước và sau để kết luận.',
'Bổ sung câu hỏi nghiên cứu, đối tượng sử dụng và dữ liệu khảo sát thực tế nếu nhóm đã thực hiện.', ['MB01', 'MB02']),
entry(2, 'Thiết kế hành trình và phân quyền', 'Thiết kế hệ thống',
'Mô tả các bước từ đăng nhập đến học, nộp bài, nhận phản hồi và quản lý lớp.',
'Tài liệu hành trình theo vai trò, mã nguồn xác thực và API lớp học.',
'Đối chiếu đặc tả ba vai trò với các tuyến chức năng. Ghi riêng quyền nhìn thấy giao diện và quyền được kiểm tra tại máy chủ.',
'Có tài liệu hành trình và API quản lý lớp. Kiểm tra mã ngày 10/10 cho thấy xác thực còn dùng tài khoản mẫu khi thiếu cookie; chưa đủ căn cứ kết luận bảo mật đã hoàn chỉnh.',
'Ẩn nút không thay thế kiểm tra quyền server. Mô tả trong báo cáo cần được xác nhận bằng kiểm thử truy cập trái quyền.',
'Sửa phiên đăng nhập và kiểm thử cách ly học sinh, giáo viên, admin trước khi triển khai công khai.', ['MB02', 'MB10', 'MB23', 'MB24']),
entry(3, 'Xây dựng quy ước và kiểm kê học liệu', 'Tổ chức dữ liệu',
'Quy định cấu trúc khóa học, unit, bài học và nguồn gốc dữ liệu để có thể kiểm tra chất lượng.',
'Hợp đồng dữ liệu, catalog và báo cáo chất lượng đang lưu trong dự án.',
'Tổng hợp các trường nội dung, đáp án, giải thích, media và nguồn. Phân biệt dữ liệu có trong kho với dữ liệu ứng dụng thực sự đưa vào luồng học.',
'Báo cáo lịch sử ghi 389 hoạt động và 1.022 mục từ; mức CEFR được ghi là ước lượng, độ khó chưa hiệu chuẩn. Phiên này chưa đếm lại và chưa xác nhận toàn bộ nội dung được app sử dụng.',
'Số lượng bản ghi không tự chứng minh đủ đáp án, audio hoặc chất lượng sư phạm. Không chuyển mức ước lượng thành mức đã hiệu chuẩn.',
'Kiểm kê từ màn hình học đến nguồn dữ liệu và khóa các bài thiếu điều kiện sẵn sàng.', ['MB03', 'MB04']),
entry(4, 'Tích hợp tài nguyên nghe', 'Phát triển Listening',
'Cung cấp âm thanh và điều khiển phát để học sinh thực hiện bài nghe.',
'Tệp MP3, trình phát audio trong ứng dụng và nhật ký phát triển cũ.',
'Tổng hợp mô tả tạo và tích hợp audio từ nhật ký cũ; kiểm tra sự tồn tại của tài nguyên. Việc nghe và đối chiếu transcript chưa thực hiện trong phiên tổng hợp.',
'Tồn tại tệp audio cho bài đầu vào và các bài học. Nhật ký cũ mô tả sử dụng giọng tổng hợp. Chưa có phép đo chất lượng nghe hoặc kiểm tra khớp toàn bộ câu hỏi trong phiên này.',
'Có file âm thanh chưa chứng minh nội dung khớp đề. Cần phân biệt audio tổng hợp với thu âm người nói.',
'Nghe từng bài đang mở, đối chiếu transcript, câu hỏi, đáp án và kiểm tra phát trên điện thoại.', ['MB05', 'MB19']),
entry(5, 'Thiết kế kiểm tra đầu vào', 'Đánh giá ban đầu',
'Thu thập bằng chứng ban đầu để định hướng bài học và cho phép tiếp tục khi bị gián đoạn.',
'Mã nguồn màn hình kiểm tra đầu vào, audio và nhật ký cũ.',
'Tổng hợp thiết kế các phần kiểm tra, lưu tiến trình và màn kết quả. Phân biệt kỹ năng được kiểm tra trực tiếp với kỹ năng chỉ có mức tạm thời.',
'Có mã nguồn bài đầu vào và audio đi kèm. Nhật ký cũ mô tả tiếp tục sau tải lại và mức Speaking tạm thời; phiên này chưa thực hiện lại hành trình trên trình duyệt.',
'Không suy ra điểm Speaking chính thức từ kỹ năng khác. Dữ liệu lưu trên thiết bị cần được cách ly theo tài khoản.',
'Kiểm thử tài khoản mới, thoát giữa chừng, tải lại, đổi tài khoản và kết quả sau hoàn thành.', ['MB05', 'MB06', 'MB19']),
entry(6, 'Xử lý bài học và phản hồi', 'Phát triển luồng tự học',
'Ghi nhận câu trả lời, hỗ trợ gợi ý và tổng kết đúng với bài người học đã thực hiện.',
'Mã xử lý hoạt động học và các mô tả kiểm thử trong nhật ký phát triển.',
'Tổng hợp thiết kế chấm câu trả lời và lưu tiến độ. Không áp dụng yêu cầu thay định dạng câu hỏi riêng của dự án Math sang English.',
'Có mã xử lý bài học và bộ kiểm thử liên quan trong repository. Tồn tại mã kiểm thử không chứng minh tất cả đã chạy đạt; cần đối chiếu log hoặc chạy lại trên bản bàn giao.',
'Điểm từ URL hoặc thông tin client chưa xác minh không nên là điểm chính thức. Dùng gợi ý và hoàn thành bài cần được ghi nhận khác năng lực độc lập.',
'Kiểm thử trả lời đúng/sai, dùng gợi ý, tổng kết, tải lại và chống ghi nhận trùng.', ['MB07', 'MB19', 'MB20']),
entry(7, 'Lập lịch ôn tập từ vựng', 'Nghiên cứu cơ chế ghi nhớ',
'Tổ chức từ đã lưu, từ đang học và từ đến hạn ôn theo kết quả nhớ của từng người học.',
'Mã nguồn FSRS, cấu trúc dữ liệu từ vựng và tài liệu kiểm thử cũ.',
'Tổng hợp các mức đánh giá Quên, Khó, Nhớ, Dễ và cơ chế lập lịch. Phân biệt lịch ôn của từng tài khoản và trạng thái từ dùng chung.',
'Có mã lập lịch và API ôn từ. Log lịch sử chứa lỗi HTTP 500 ở kiểm thử cài đặt từ vựng và lỗi đọc JSON ở kiểm thử review; chưa đủ căn cứ xác nhận toàn bộ luồng đạt.',
'Không che lỗi môi trường bằng cách sửa test thành luôn thành công. Cần lưu lần thất bại và lần chạy lại riêng.',
'Chạy trên môi trường kiểm thử riêng; đối chiếu lịch sau reload, hạn mức từ mới và chống tăng mastery do bấm lặp.', ['MB08', 'MB20']),
entry(8, 'Tra cứu từ điển và lưu nghĩa', 'Mở rộng hỗ trợ từ vựng',
'Cho người học chọn đúng nghĩa trước khi lưu từ vào tủ từ cá nhân.',
'Tài liệu tích hợp từ điển, dữ liệu nguồn được mô tả và cơ chế ôn FSRS.',
'Đọc mô tả luồng tra từ, chọn nghĩa, lưu ở trạng thái saved rồi chủ động đưa vào học. Giữ nguồn và phân biệt nghĩa theo ngữ cảnh.',
'Tài liệu mô tả dữ liệu SQLite chỉ đọc, nguồn và giấy phép. Con số độ phủ trong tài liệu chưa được đếm lại ở phiên này; database không cung cấp bằng chứng phân cấp CEFR.',
'Độ phủ từ điển không phải mức năng lực. Không tự gắn CEFR khi nguồn không có cơ sở.',
'Kiểm tra từ nhiều nghĩa, lưu lại nghĩa đã có, nguồn hiển thị và tính riêng tư giữa tài khoản.', ['MB09', 'MB08']),
entry(9, 'Quản lý lớp và trả kết quả', 'Phát triển chức năng giáo viên',
'Hỗ trợ tạo lớp, giao bài, nộp bài và giáo viên công bố điểm cho học sinh lớp mình.',
'API lớp học, API chấm bài, hành trình giáo viên và log kiểm thử cũ.',
'Tổng hợp vòng đời bài tập và vai trò quyết định điểm của giáo viên. Kiểm tra cần bao gồm phiên bản đề, bài nộp trùng, rời lớp và truy cập ngoài phạm vi.',
'Có mã quản lý lớp và chấm bài. Log kiểm thử lịch sử có lỗi đăng nhập trong bộ classroom do server trả lỗi; kết luận PASS trong tài liệu cần được đối chiếu lại.',
'Bài nộp phải gắn đúng đề đã làm. Kết quả AI tham khảo không thay điểm giáo viên công bố.',
'Nghiệm thu luồng hai giáo viên, hai học sinh; bổ sung thống kê lớp còn thiếu sau khi xác minh chức năng thực có.', ['MB10', 'MB11', 'MB02', 'MB20']),
entry(10, 'Nhập học liệu từ Word', 'Tổ chức nội dung giáo viên',
'Chuyển tài liệu DOCX thành nội dung có thể xem trước, chỉnh sửa và sử dụng trong lớp.',
'Mã parser DOCX và nhật ký phát triển mô tả fixture thực tế.',
'Tổng hợp cách trích văn bản, bảng, ảnh và cảnh báo phần thiếu. Giữ bước giáo viên kiểm duyệt trước khi phát hành.',
'Có mã parser và màn hình nhập trong dự án. Tài liệu cũ mô tả fixture và số bài; phiên này chưa chạy parser hoặc so sánh đầy đủ với tài liệu gốc.',
'Không xem đáp án suy luận là đáp án đã được giáo viên duyệt. Cần kiểm tra file hỏng, giới hạn dung lượng và an toàn đường dẫn trích xuất.',
'Thử fixture thực và một DOCX khác cấu trúc; kiểm tra cảnh báo thiếu audio, đáp án và dạng bài chưa hỗ trợ.', ['MB12', 'MB19']),
entry(11, 'Hỗ trợ AI và ghi âm bài nói', 'Phản hồi học tập',
'Cung cấp hướng dẫn và đánh giá tham khảo với giới hạn khả năng được trình bày rõ.',
'Mã AI engine, component ghi âm và log kiểm thử lịch sử.',
'Tổng hợp phân biệt provider thật, xử lý theo quy tắc và demo. Ghi nhận nhu cầu kiểm tra xin quyền mic, nghe lại, upload và đánh giá.',
'Có mã xử lý AI và ghi âm. Log lịch sử có các kiểm thử AI/Speaking thất bại. Phiên này chưa gọi provider, chưa thử micro và chưa xác nhận chấm phát âm thực.',
'Không tạo điểm khi provider không hoạt động; không đánh giá phát âm chỉ từ transcript, thời lượng hoặc kích thước file.',
'Kiểm tra provider bằng request thật có kiểm soát, lỗi timeout, quyền mic và quyền truy cập bản ghi âm.', ['MB13', 'MB14', 'MB20']),
entry(12, 'Truy xuất tri thức và bộ nhớ Leaf', 'Phát triển trợ lý học tập',
'Cung cấp ngữ cảnh phù hợp cho trợ lý và cách ly hội thoại theo người dùng.',
'Tài liệu Leaf AI và mã truy xuất tri thức.',
'Đọc mô tả xếp hạng BM25 và phạm vi bộ nhớ theo userId cùng conversationId. Phân biệt truy xuất từ khóa với embedding hoặc vector database.',
'Tài liệu mô tả lexical RAG, tối đa bốn đoạn tri thức và bộ nhớ trong cùng hội thoại. Đây là mô tả triển khai, chưa phải kết quả nghiệm thu độc lập của phiên tổng hợp.',
'Không gọi cơ chế này là huấn luyện mô hình riêng. Quy tắc cách ly bộ nhớ vẫn phụ thuộc xác thực người dùng an toàn.',
'Kiểm thử chat mới, reload, chuyển trang, đổi tài khoản, nguồn trích dẫn và yêu cầu làm hộ bài.', ['MB15', 'MB16', 'MB23']),
entry(13, 'Thiết kế giao diện và khả năng sử dụng', 'Hoàn thiện trải nghiệm',
'Giúp người học tập trung, nhìn rõ phản hồi và sử dụng trên màn hình nhỏ.',
'Đặc tả giao diện, ảnh màn hình đã lưu và các component hiện có.',
'Tổng hợp định hướng bốn mục điều hướng, trạng thái loading/lỗi và hỗ trợ reduced motion. Ảnh có sẵn được đưa vào danh mục minh chứng.',
'Có đặc tả thiết kế và ảnh trang học ở độ rộng 390px. Chưa kiểm tra trực tiếp toàn bộ trang trên thiết bị hoặc đánh giá khả năng sử dụng với học sinh.',
'Ảnh đẹp không chứng minh nút hoạt động hay dữ liệu lưu đúng. Cần kiểm tra bằng bàn phím và các trạng thái lỗi.',
'Rà desktop/mobile, modal, drawer, focus, nội dung tràn và nút xử lý lặp; quay video sau khi hành trình ổn định.', ['MB17', 'MB18']),
entry(14, 'Đối chiếu kiểm thử và điều kiện bàn giao', 'Đánh giá kỹ thuật',
'Phân biệt báo cáo tổng hợp với log gốc và xác định phần chưa đủ bằng chứng bàn giao.',
'WORKLOG, log build, log test và log trình duyệt đã lưu.',
'Đọc kết quả tổng hợp và phần cuối log; kiểm tra dấu vết lỗi thay vì chỉ chép nhãn PASS. Không chạy lại build hoặc test ứng dụng trong phiên đối chiếu này.',
'WORKLOG ghi 10/10 bộ kiểm thử đạt, nhưng raw-tests.log ngày 08/10/2026 ghi PASSED 5/10. Log trình duyệt có lỗi tải 404, dù network errors được ghi 0. Chưa xác định lần chạy nào phản ánh bản hiện tại.',
'Network errors bằng 0 không đồng nghĩa không có HTTP 404. Log lịch sử không thể dùng để khẳng định bản mới đã đạt hoặc hiện vẫn lỗi y hệt.',
'Chạy lại nghiệm thu trên bản production ổn định, lưu log mới theo phiên và giữ nguyên log thất bại cũ.', ['MB19', 'MB20', 'MB21', 'MB22']),
    ]
    entries.append(dict(
        id='EN-20261010-01', kind='observed', title='Chuẩn bị hồ sơ nghiên cứu và quy tắc cập nhật', date='10/10/2026',
        stage='Đối chiếu và lập hồ sơ', status='Đã tạo nội dung; chưa kiểm tra phân trang trực quan',
        participants='Chủ dự án cung cấp mẫu và chốt phạm vi English; Codex đọc nguồn, tổng hợp nhật ký và bổ sung hướng dẫn. Tên học sinh và đóng góp lịch sử chưa xác nhận.',
        objective='Chuyển cấu trúc nhật ký mẫu sang English, giữ căn cứ thực tế và yêu cầu các agent cập nhật nhật ký sau mỗi phiên.',
        equipment='Mẫu DOCX do chủ dự án cung cấp; tài liệu và log trong workspace; Python, lxml và công cụ kiểm tra XML. Múi giờ ghi ngày: Asia/Saigon.',
        procedure='Đọc mẫu sáu mục, rà tài liệu và log gốc. Tách hạng mục hồi cứu khỏi phiên thực hiện trực tiếp. Tạo nguồn JSON, danh mục minh chứng, bản Markdown/Word và AGENTS.md ở gốc cùng trong ứng dụng.',
        results='Ghi nhận mâu thuẫn PASS và log gốc; đọc mã thấy auth còn dùng tài khoản mẫu và khôi phục mật khẩu còn mô phỏng. Đã lập hồ sơ, không sửa web, không chạy lại test sản phẩm, không quay video hoặc deploy. Kiểm tra cấu trúc và đồng bộ tài liệu được ghi riêng trong QA-REPORT.md.',
        lessons='Không thể suy ra ngày nghiên cứu từ ngày sửa file. Renderer Word thất bại vì thiếu soffice.exe, nên chưa xác nhận phân trang trực quan. Không gán các hoạt động hồi cứu thành 15 buổi đã diễn ra.',
        next='Chủ dự án đối chiếu ngày, thành viên và minh chứng lịch sử; bổ sung xác nhận giáo viên. Các agent cập nhật nhật ký khi sửa sản phẩm; render lại Word khi có công cụ và nghiệm thu web bằng log mới.',
        evidence=['MB19', 'MB20', 'MB21', 'MB23', 'MB24', 'MB25', 'MB26', 'MB27', 'MB28']))
    intro = ('Nhật ký ghi quá trình nghiên cứu và phát triển nền tảng Adaptive English. '
             'Phần hồi cứu được tổng hợp từ tài liệu, mã nguồn và minh chứng đã lưu; chưa xác nhận ngày, giờ và người thực hiện từng hạng mục. '
             'Các hạng mục này không đồng nghĩa với số buổi nghiên cứu thực tế. Phiên ghi nhận trực tiếp ngày 10/10/2026 được tách riêng. '
             'Giữ cả kết quả thất bại, giới hạn và việc cần đối chiếu; không thay thế ghi chép gốc hoặc xác nhận thực tế của giáo viên.')
    journal = dict(title='Nhật ký nghiên cứu Adaptive English', timezone='Asia/Saigon',
                   compiled_on='2026-10-10', reference_sha256=hashlib.sha256(REFERENCE.read_bytes()).hexdigest(),
                   intro=intro, entries=entries)
    items = []
    for ident, path, scope in SOURCES:
        source = ROOT / path
        if not source.is_file():
            raise FileNotFoundError(source)
        items.append(dict(id=ident, path=path, scope=scope, inspected_on='2026-10-10',
                          event_date='2026-10-08' if ident == 'MB20' else None,
                          sha256=hashlib.sha256(source.read_bytes()).hexdigest()))
    (OUT / 'journal.json').write_text(json.dumps(journal, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    (OUT / 'evidence.json').write_text(json.dumps(dict(items=items), ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    (OUT / 'qa/artifact.md').write_text(
        '# Template execution contract\n\n'
        f'Reference: {REFERENCE}\nSHA-256: {journal["reference_sha256"]}\n'
        'Retained copy: qa/reference.docx. No reference bytes may change.\n'
        'Source has one A4 portrait section: 11906 by 16838 twips; margins top/right/bottom 1134, left 1701 twips.\n'
        'Preserve styles.xml, numbering.xml, relationships, footer, content types and section properties byte-for-byte.\n'
        'Cover uses first six body paragraphs. Session pattern is body paragraphs 6 through 20: heading with pageBreakBefore, metadata, six heading/body pairs, signature.\n'
        'Edit slot: word/document.xml body text. Clone recurring session paragraphs. Replace all exam-monitoring content with English research entries.\n'
        'Use source paragraph/run properties, 3 pt paragraph spacing and single line spacing. Preserve font properties from source.\n'
        'Add member roles and evidence IDs within existing text slots; append evidence list using source body paragraph pattern.\n'
        'No drawings, tables or content controls in body. Keep footer/page field unchanged.\n'
        'Rendering attempted with packaged render_docx.py; blocked by missing soffice.exe. Reference page count and visual fidelity remain unverified.\n'
        'Structural gate: same package inventory; only document.xml may differ; same section geometry; entry text complete; no original-topic residue.\n', encoding='utf-8')
    print('Initialized 14 retrospective records and 1 observed session; no historical dates invented.')


if __name__ == '__main__':
    main()

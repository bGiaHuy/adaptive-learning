"""Create a separate, traceable ten-part technical digest; never replace source entries."""
import json
import shutil
from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'docs/research-journal'
OUT = BASE / 'compact'
OUT.mkdir(exist_ok=True)
BACKUP = BASE / 'evidence/EN-20261012-30/original'
BACKUP.mkdir(parents=True, exist_ok=True)
for name in ['journal.json', 'NHAT_KY_NGHIEN_CUU.md', 'NHAT_KY_NGHIEN_CUU_ADAPTIVE_ENGLISH.docx']:
    if not (BACKUP / name).exists():
        shutil.copy2(BASE / name, BACKUP / name)
source = json.loads((BASE / 'journal.json').read_text(encoding='utf-8'))
entries = {e['id']: e for e in source['entries']}
# Each section is an editorial topic, not a claim of a separate research session.
topics = [
('Phạm vi nghiên cứu và phương pháp', ['EN-HC-01','EN-HC-14','EN-20261010-02'],
 'Adaptive English được phát triển để kết nối học tập cá nhân với hoạt động của giáo viên: kiểm tra đầu vào, học theo kỹ năng, ôn từ vựng, giao bài, chấm bài và theo dõi tiến bộ. Bản này chọn các thay đổi có ảnh hưởng đến kiến trúc, dữ liệu và quy trình đánh giá; bỏ các chỉnh sửa giao diện nhỏ và lỗi lẻ khỏi phần trình bày chính.',
 'Phương pháp là đối chiếu nhật ký chuẩn với mã minh chứng đã lưu, phân biệt mô tả hồi cứu, kiểm thử có ghi nhận và công việc dự kiến. Không dùng số trang để suy ra số buổi nghiên cứu thực tế. Những phần hồi cứu chưa xác nhận ngày và người thực hiện vẫn được giữ nguyên tính chất đó.',
 'Mốc kiểm thử xuyên suốt ngày 10/10 ghi nhận 10/10 hành trình đạt với tài khoản thử được kiểm soát. Đây là kết quả của phiên gốc, không phải lần chạy lại trong quá trình biên tập bản rút gọn. Các giới hạn và lần kiểm thử thất bại ở những phiên khác không bị xóa.'),
('Kiến trúc ứng dụng và phân quyền', ['EN-HC-02','EN-20261010-02'],
 'Hệ thống tổ chức hành trình theo vai trò học sinh, giáo viên và quản trị. Quyền truy cập tài nguyên phải được kiểm tra phía máy chủ; lớp học, bài giao, bản nháp và kết quả học tập gắn với tài khoản có quyền tương ứng. Việc thay đổi giao diện hoặc chuyển trang không thay thế kiểm tra quyền.',
 'Một thay đổi nền tảng là tách bản nháp theo userId, hỗ trợ khôi phục sau tải lại mà không làm lẫn dữ liệu giữa hai tài khoản dùng chung thiết bị. Quy trình bài giao có phiên bản để bài học sinh đã nhận vẫn giữ nội dung tương ứng khi giáo viên sửa đề.',
 'Kiểm thử được ghi trong phiên 10/10 bao gồm học sinh tham gia lớp, lưu nháp, nộp bài lặp an toàn, giáo viên chấm và học sinh nhận phản hồi. Tài khoản đã rời lớp và giáo viên khác bị từ chối truy cập bằng 403. Thống kê quản trị được chuyển sang dữ liệu thực thay cho số cố định.'),
('Học liệu và quy trình học theo kỹ năng', ['EN-HC-03','EN-HC-04','EN-HC-06','EN-20261010-03'],
 'Học liệu được chuẩn hóa thành bài học, bài tập và câu hỏi với quy ước dữ liệu chung. Mục tiêu kỹ thuật là để trình hiển thị, kiểm tra đáp án và lưu tiến độ dùng cùng một hợp đồng dữ liệu, giảm tình trạng mỗi loại nội dung có một cách xử lý riêng.',
 'Kiểm kê ngày 10/10 ghi nhận 54 bài ban đầu, trong đó 48 bài sẵn sàng và 6 bài được tách vào diện chuẩn bị. Với 9 bài nghe, 27/27 tham chiếu âm thanh tồn tại trên đĩa theo báo cáo phiên gốc. Đây là kiểm kê tài nguyên, không phải bằng chứng đo hiệu quả học tập của học sinh.',
 'Luồng học kết nối nội dung, trả lời, phản hồi và tổng kết. Các thay đổi về lưu bài cần bảo đảm máy chủ xác nhận thành công trước khi xóa bản nháp hoặc báo hoàn tất. Học liệu thiếu âm thanh, hình hoặc thông tin sư phạm phải được đánh dấu để kiểm tra, không mặc nhiên coi là đủ chỉ vì tệp đã tồn tại.'),
('Đánh giá đầu vào và dữ liệu năng lực', ['EN-HC-05','EN-20261011-11','EN-20261012-05','EN-20261012-06','EN-20261012-22','EN-20261012-24'],
 'Kiểm tra đầu vào được mở rộng để thu thập dữ liệu từ nhiều kỹ năng, có phần từ vựng, viết và ghi âm nói. Phần viết dùng đề cụ thể khi yêu cầu AI phản hồi. Ghi âm được lưu trong trạng thái bài làm nhưng không đồng nghĩa đã có mô hình đánh giá nói thực tế.',
 'PlacementAttempt lưu bản nháp và bước hiện tại phía máy chủ; LessonAttempt lưu lượt học. Khôi phục ưu tiên dữ liệu máy chủ và chỉ chuyển sang kết quả sau khi việc hoàn thành được lưu. Dữ liệu radar dùng kỹ năng có điểm; kỹ năng thiếu dữ liệu được để trống thay vì tự biến thành điểm 0.',
 'Các phiên tháng 10 phát hiện Production thiếu bảng PlacementAttempt và LessonAttempt. Những bảng này được bổ sung có kiểm soát và đối chiếu số bản ghi; không reset dữ liệu. Kiểm thử khôi phục tiến độ có sử dụng bộ xác thực kiểm soát và bộ đọc dữ liệu Production, chưa thay thế kiểm thử HTTP bằng trình duyệt đã đăng nhập.'),
('Từ điển, FSRS và từ vựng hằng ngày', ['EN-HC-07','EN-HC-08','EN-20261012-15','EN-20261012-19'],
 'Từ điển cung cấp dữ liệu tra cứu để người học lưu nghĩa và đưa từ vào vòng ôn tập. FSRS quản lý lịch ôn theo trạng thái thẻ. Cần phân biệt nguồn từ điển và nguồn học liệu với dữ liệu cá nhân của người học; không suy diễn độ phủ hay mức CEFR khi chưa đo lại.',
 'Từ vựng hằng ngày được cấp bằng giao dịch có mức cô lập Serializable và cơ chế thử lại khi xung đột. Hệ thống xét số từ đến hạn, số đã hoàn thành và hạn mức người dùng; ưu tiên nguồn được phép thay vì tạo bổ sung vô hạn. Từ mới được kích hoạt ngay, còn thẻ cũ giữ lịch ôn đã có.',
 'Cơ chế chạy khi mở ứng dụng hoặc khi đổi ngày theo Asia/Saigon, chưa phải tác vụ tự chạy lúc người dùng ngoại tuyến. Lịch sử lỗi HTTP 500 và lỗi đọc JSON của vòng ôn được giữ ở nguồn gốc. Những lần kiểm thử đạt sau đó chỉ chứng minh phạm vi đã chạy, không biến toàn bộ lịch sử thành PASS.'),
('Lớp học, giao bài và công bố điểm', ['EN-HC-09','EN-20261012-14','EN-20261012-16','EN-20261012-17','EN-20261012-18'],
 'Quy trình lớp học gồm giáo viên tạo lớp, học sinh tham gia, giáo viên giao đề, học sinh lưu nháp và nộp, giáo viên chấm rồi công bố kết quả. Bài nộp giữ dữ liệu câu hỏi của phiên bản tương ứng để việc sửa đề sau này không làm thay đổi căn cứ chấm.',
 'Câu trắc nghiệm một lựa chọn có đủ đáp án được chấm phía máy chủ. Điểm bản nháp và điểm công bố được tách riêng; mặc định không trả ngay toàn bộ điểm. API dành cho học sinh không gửi đáp án đúng trước thời điểm được phép. AI chấm viết chỉ là tham khảo để giáo viên duyệt; chấm nói còn thiếu tích hợp âm thanh thực.',
 'Thông báo giao bài và nộp bài được tạo cùng giao dịch với sự kiện chính, gắn đúng người nhận và tài nguyên. Giao diện kiểm tra thông báo khi đang hiển thị, chu kỳ 30 giây. Phiên kiểm thử thông báo giữ cả lần đầu 18/19 và lần sửa đạt 20/20; chưa có kiểm thử trình duyệt đăng nhập trong phiên đó.'),
('Nhập Word bằng AI và xuất bản có giao dịch', ['EN-HC-10','EN-20261012-09','EN-20261012-12','EN-20261012-14'],
 'Luồng nhập DOCX tách nội dung nguồn, xác định vị trí đoạn và chuyển thành cấu trúc bài tập. Nếu tài liệu có đủ câu hỏi cùng đáp án thì ưu tiên trích xuất; nếu chưa đủ, AI có thể tạo bài tham khảo theo yêu cầu. Giáo viên phải duyệt câu hỏi trước khi xuất bản vào lớp.',
 'Kết quả AI được kiểm tra cấu trúc JSON, lựa chọn A–D, tính duy nhất của phương án và vị trí tham chiếu nguồn. Một giao dịch Prisma tạo gói nội dung, từ vựng, bài tập đã duyệt, bài giao và phiên bản ban đầu; lỗi giữa chừng phải rollback, tránh tạo học liệu dở dang.',
 'Phiên 12/10 ghi nhận parser 6 bài kiểm thử đạt, nhưng lần tích hợp API đầu tiên lỗi ECONNREFUSED vì máy chủ chưa chạy. Các kiểm thử xuất bản có mock đạt 4/4 và kiểm thử API bổ sung đạt 1/1. Bản deploy sẵn sàng không đồng nghĩa đã thử xuất bản bằng tài khoản thật; không ghi thêm dữ liệu thực chỉ để kiểm chứng.'),
('AI viết, trợ lý Leaf và truy xuất tri thức', ['EN-HC-11','EN-HC-12','EN-20261010-12','EN-20261011-03','EN-20261012-06'],
 'Các chức năng AI dùng gateway phía máy chủ để tránh đưa khóa vào trình duyệt. Ngữ cảnh chấm viết được lấy từ câu hỏi thực, lưu kết quả theo bài làm và hiển thị lại sau tải trang. Trạng thái bị chặn hoặc lỗi nhà cung cấp phải được thể hiện rõ, không thay bằng phản hồi giả như thể đã chấm thành công.',
 'Leaf sử dụng truy xuất từ vựng BM25, tối đa bốn mảnh tri thức theo mô tả nguồn, với bộ nhớ giới hạn theo userId và conversationId. Thiết kế này chưa phải hệ thống embedding hay cơ sở dữ liệu vector. Cần đánh giá chất lượng truy xuất bằng câu hỏi được kiểm soát trước khi khẳng định hiệu quả.',
 'Kết nối gateway từng có Python upstream 403 nhưng Node fetch nhận phản hồi tiếng Việt thành công. Kiểm thử mock chấm viết đạt 8/8; trình duyệt của phiên 11/10 quan sát được phản hồi bài viết và lưu sau tải lại. Các kết quả này không chứng minh mọi nhà cung cấp hay chấm nói đã hoạt động đầy đủ trên Production.'),
('Hạ tầng, lưu trữ và bảo toàn dữ liệu', ['EN-20261010-09','EN-20261010-10','EN-20261012-07','EN-20261012-17','EN-20261012-24'],
 'Ứng dụng được chuẩn bị và triển khai bằng Next.js trên Vercel, với PostgreSQL thay cho cơ sở dữ liệu chỉ nằm ở máy phát triển. Production ban đầu dùng Neon, kết nối HTTPS và cấu hình bí mật phía máy chủ. Không sao chép dữ liệu SQLite cá nhân lên Production trong phiên triển khai đầu tiên.',
 'Supabase được khảo sát và chuẩn bị riêng: phiên tương ứng ghi nhận 25 bảng public và một số dữ liệu đã sao chép, nhưng DATABASE_URL của Vercel chưa đổi. Nguồn còn thiếu một số bảng lượt làm; không tự tạo bản ghi để che thiếu hụt. RLS đang tắt ở 25 bảng là giới hạn đã ghi nhận, chưa thể coi là hoàn tất chuyển đổi.',
 'Các migration sau đó theo hướng bổ sung và đối chiếu số lượng dữ liệu trước/sau. Kiểm tra trang chủ hoặc từ điển trả 200 chỉ là kiểm tra điểm truy cập. Khôi phục mật khẩu thiếu SMTP từng trả 503, các phát hiện audit và giới hạn lưu trữ vẫn phải được giữ cho kế hoạch xử lý tiếp theo.'),
('Điểm năng lực từ độ khó bài và định hướng', ['EN-20261012-29'],
 'Khi giáo viên giao bài, máy chủ yêu cầu AI đánh giá mức bài theo từng phiên bản. Mức nội bộ nằm trong khoảng 100–2400, kèm độ tin cậy, lý do, kỹ năng và thang điểm. Các mốc A1–C2 là quy ước tham khảo nội bộ; chưa được hiệu chỉnh để coi là kết quả CEFR chuẩn.',
 'Điểm đóng góp của lượt làm bằng tỉ lệ điểm đạt nhân với mức bài. Ví dụ 8/10 × 1200 = 960. Khi công bố, năng lực cũ và điểm mới được kết hợp theo 80/20: 1200 × 80% + 960 × 20% = 1152. Chưa có nền tảng thì dùng điểm đóng góp đầu tiên. AI lỗi vẫn cho giao bài nhưng không tự bịa mức.',
 'Mỗi bài nộp chỉ tính một lần; sửa điểm thay đóng góp cũ và giữ thời điểm công bố đầu tiên. Mức bài cùng thang điểm được snapshot theo version. Phiên gốc ghi nhận 35/35 kiểm thử đạt, kiểm thử Prisma với cơ sở dữ liệu riêng và build 55/55 đạt. Thay đổi này mới hoàn thành local, chưa deploy, chưa migration Production và chưa gọi AI thật hay kiểm thử trình duyệt đăng nhập.')
]
doc = Document()
sec = doc.sections[0]
sec.page_width, sec.page_height = Inches(8.5), Inches(11)
sec.top_margin = sec.bottom_margin = Inches(.8)
sec.left_margin = sec.right_margin = Inches(.85)
normal = doc.styles['Normal']
normal.font.name = 'Times New Roman'
normal.font.size = Pt(12)
normal.paragraph_format.space_after = Pt(8)
normal.paragraph_format.line_spacing = 1.15
for name in ['Title','Heading 1','Heading 2']:
    doc.styles[name].font.name = 'Times New Roman'
    doc.styles[name].font.color.rgb = RGBColor(0,0,0)
doc.styles['Heading 1'].font.size = Pt(19)
doc.styles['Heading 2'].font.size = Pt(12)
foot = sec.footer.paragraphs[0]
foot.alignment = 2
foot.add_run('Adaptive English · Bản rút gọn · ')
field = OxmlElement('w:fldSimple'); field.set(qn('w:instr'), 'PAGE'); foot._p.append(field)
md = ['# Nhật ký nghiên cứu Adaptive English — bản rút gọn', '', 'Biên tập ngày 12/10/2026. Mười phần kỹ thuật, không phải mười buổi nghiên cứu. Bản đầy đủ và minh chứng lịch sử được giữ riêng.', '']
data = []
for i,(title,ids,a,b,c) in enumerate(topics,1):
    if i > 1: doc.add_page_break()
    doc.add_paragraph('NHẬT KÝ NGHIÊN CỨU ADAPTIVE ENGLISH' if i == 1 else 'ADAPTIVE ENGLISH · CÁC MỐC KỸ THUẬT', style='Subtitle')
    doc.add_heading(f'{i:02d}  {title}', 1)
    labels = ['Mục tiêu và phạm vi','Phương pháp và thay đổi kỹ thuật','Kết quả và giới hạn']
    for label,body in zip(labels,[a,b,c]):
        doc.add_heading(label,2); doc.add_paragraph(body)
    # Preserve source-specific lessons and next steps without turning edits into invented sessions.
    lead = entries[ids[-1]]
    doc.add_heading('Bài học và hướng tiếp theo',2)
    lesson = lead['lessons'] + ' ' + lead['next']
    doc.add_paragraph(lesson)
    ev = list(dict.fromkeys(e for id in ids for e in entries[id]['evidence']))
    source_text = 'Nguồn đối chiếu: ' + ', '.join(ids) + '. Minh chứng: ' + (', '.join(ev) if ev else 'xem entry gốc') + '.'
    p=doc.add_paragraph(source_text); p.paragraph_format.space_before=Pt(7)
    for run in p.runs: run.font.size=Pt(9)
    if i == 1:
        p=doc.add_paragraph('Ngày của các mục hồi cứu chưa xác nhận. Người thực hiện, giờ và địa điểm xem nhật ký gốc; bản biên tập không bổ sung tên hoặc xác nhận thay giáo viên.')
        for r in p.runs: r.font.size=Pt(10)
    md += [f'## {i:02d} {title}','']
    for label,body in zip(labels+['Bài học và hướng tiếp theo'],[a,b,c,lesson]): md += [f'### {label}','',body,'']
    md += [source_text,'']
    data.append(dict(section=i,title=title,source_entries=ids,evidence=ev,paragraphs=[a,b,c],lessons_next=lesson))
stem='NHAT_KY_NGHIEN_CUU_RUT_GON_10_TRANG'
doc.save(OUT / (stem+'.docx'))
(OUT / (stem+'.md')).write_text('\n'.join(md),encoding='utf-8')
(OUT/'journal-compact.json').write_text(json.dumps(dict(compiled_on='2026-10-12',purpose='Bản biên tập riêng, không thay journal.json; các phần không tương ứng số buổi thực tế.',sections=data),ensure_ascii=False,indent=2),encoding='utf-8')
print('Created separate DOCX, Markdown and source mapping; preserved original snapshot.')

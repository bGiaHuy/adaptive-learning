from docx import Document
from docx.shared import Inches,Pt,RGBColor
from docx.enum.text import WD_COLOR_INDEX
from PIL import Image
from pathlib import Path
base=Path('outputs/evidence-review')
doc=Document(base/'Nhat_ky_minh_chung_to_vang.docx')
from docx.enum.style import WD_STYLE_TYPE
if 'Heading 1' not in doc.styles: doc.styles.add_style('Heading 1',WD_STYLE_TYPE.PARAGRAPH)
items=[
('MC01','Giai đoạn 1 Ngân hàng câu hỏi',base/'screenshots/01-bank.jpg','Ảnh chụp trích đoạn dữ liệu gốc ngày 15/10/2026. Tệp có totalCount = 1472, nội dung câu hỏi, phương án và tham số IRT. Không phải ảnh học sinh.'),
('MC02','Giai đoạn 2 Cấu trúc dữ liệu',base/'screenshots/02-schema.jpg','Ảnh chụp schema hiện tại ngày 15/10/2026. Phiên bản này dùng PostgreSQL và Prisma; ảnh không xác nhận nội dung Firestore hoặc Security Rules trong nhật ký.'),
('MC03','Giai đoạn 3 IRT 3PL và MAP',base/'screenshots/03-irt.jpg','Ảnh chụp mã nguồn xác suất 3PL, thông tin Fisher và ước lượng MAP với bước cập nhật được chặn.'),
('MC04','Giai đoạn 3 Bộ chọn câu hỏi CAT',base/'screenshots/04-cat.jpg','Ảnh chụp mã nguồn bộ chọn bậc thang theo mức nhận thức, lịch sử trả lời và câu xác minh.'),
('MC05','Giai đoạn 4 Truy vết tri thức BKT',base/'screenshots/05-bkt.jpg','Ảnh chụp mã nguồn cập nhật xác suất hậu nghiệm và chuyển trạng thái nắm vững kiến thức.'),
('MC06','Giai đoạn 5 Sinh lộ trình học',base/'screenshots/06-plan.jpg','Ảnh chụp mã nguồn sắp xếp kỹ năng theo ưu tiên và phân bổ hoạt động theo ngày. Lịch ôn hiện tại dùng FSRS; ảnh này không chứng minh chuỗi khoảng cách SM-2 nêu trong nhật ký.'),
('MC07','Giai đoạn 5 Giao diện lộ trình',Path('docs/evidence/math-adaptive/learning-path-desktop.png'),'Ảnh kiểm thử giao diện đã lưu trong dự án, sử dụng môi trường QA và câu hỏi kiểm thử. Không phải dữ liệu thực nghiệm học sinh.'),
('MC08','Giai đoạn 5 Giao diện bài học và luyện tập',Path('docs/evidence/math-adaptive/practice-lesson-desktop.png'),'Ảnh kiểm thử đã lưu trong dự án, minh họa nội dung bài học và pha luyện tập. Không phải ảnh học sinh tham gia nghiên cứu.'),
('MC09','Giai đoạn 6 Giao diện hồ sơ năng lực',Path('docs/evidence/math-tutor/live/competency-desktop.png'),'Ảnh kiểm chứng đã lưu trong dự án với tài khoản QA tạm và giá trị năng lực thử nghiệm. Minh họa hồ sơ năng lực; không chứng minh Cây tri thức, ZPD hoặc mức tiến bộ của học sinh thật.'),
('MC10','Giao diện ứng dụng đang công khai',base/'screenshots/08-live.jpg','Ảnh chụp trang ứng dụng https://adaptivemath-blush.vercel.app ngày 15/10/2026. Chỉ xác nhận giao diện công khai tại thời điểm chụp.')]
refs={0:'MC01',2:'MC02, MC10',4:'MC03, MC04',6:'MC05',8:'MC06, MC07, MC08',10:'MC09 (hồ sơ năng lực; chưa có ảnh Cây tri thức/ZPD)',12:'Chưa bổ sung: cần tệp mô phỏng và kết quả gốc để xác minh các chỉ số Monte Carlo.'}
for ti,ref in refs.items():
 p=doc.tables[ti].cell(1,6).add_paragraph('Ảnh tại phụ lục: '+ref if ti!=12 else ref)
 for r in p.runs:r.font.size=Pt(10)
for idx,(id,title,img,caption) in enumerate(items):
 doc.add_page_break()
 p=doc.add_paragraph(f'{id}  {title}',style='Heading 1')
 for r in p.runs:r.font.color.rgb=RGBColor(0,0,0);r.font.size=Pt(17)
 doc.add_paragraph(caption)
 w,h=Image.open(img).size
 width=min(9.4,4.9*w/h)
 doc.add_picture(str(img),width=Inches(width))
doc.add_page_break()
doc.add_paragraph('Minh chứng cần bổ sung',style='Heading 1')
doc.add_paragraph('Giai đoạn 7 cần mã mô phỏng, cấu hình chạy, dữ liệu đầu ra và biểu đồ gốc để kiểm chứng RMSE, tỷ lệ văng biên và cỡ mẫu 1500 học sinh ảo.')
doc.add_paragraph('Giai đoạn 6 cần ảnh hoặc video thực tế của Cây tri thức và điều chỉnh ZPD nếu dùng các nội dung này trong báo cáo.')
for text in ['Giai đoạn 8  Ảnh học sinh làm bài kiểm tra đầu vào, có bối cảnh tổ chức và thời điểm thực hiện.','Giai đoạn 8  Ảnh học sinh sử dụng AdaptiveMath trong buổi học thực nghiệm; video thao tác thực tế.','Giai đoạn 8  Ảnh học sinh làm bài kiểm tra sau thực nghiệm; ảnh hoạt động của nhóm đối chứng và nhóm thực nghiệm.','Giai đoạn 8  Bổ sung bài làm, bảng điểm trước/sau đã mã hóa danh tính, nhật ký học và dữ liệu phân tích gốc tương ứng.']:
 p=doc.add_paragraph(text)
 for r in p.runs:r.font.highlight_color=WD_COLOR_INDEX.YELLOW
out=base/'Nhat_ky_da_chen_anh_minh_chung.docx';doc.save(out)
check=Document(out)
assert len(check.inline_shapes)==10
assert len(check.tables)==16
print(out.resolve());print('10 images embedded; 16 original tables retained')


from pathlib import Path
from copy import deepcopy
from docx import Document
from docx.shared import Inches,Pt,RGBColor
from docx.enum.text import WD_COLOR_INDEX
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from PIL import Image
import json,zipfile,shutil
base=Path('outputs/evidence-review');root=base/'updated';fig=root/'figures'
ids=['10SjVetbCiMpnJoDd-imllf2UEET4H9nZ','1qqxGxoScoNzLJhExD5xJMnhEx5_9eN9E','1BJSIk7owN5VfrZ66ikUs-wJOn1tVvWt1','1jy8VbrMiu70UEVpcogd9anLJAOi1XesJ','1UZq0dzZ1nILaQuRwQySKxjJhEzSBawXz','1BWgwx-AqnqxiShTcn-ysLIsSThFPM8Yt','1hUB6k4dbUu2feh0uLE7VFMkjvzIHsHTo']
sim=json.loads((root/'simulation.json').read_text())
def setup(d):
 for s in d.sections:s.top_margin=Inches(.7);s.bottom_margin=Inches(.7);s.left_margin=Inches(.8);s.right_margin=Inches(.8)
 for n in ['Normal','Title','Heading 1','Heading 2']:
  if n in d.styles:
   st=d.styles[n];st.font.name='Arial';st.font.color.rgb=RGBColor(0,0,0)
 d.styles['Normal'].font.size=Pt(11);d.styles['Normal'].paragraph_format.space_after=Pt(7)
def p(d,text,yellow=False):
 pp=d.add_paragraph(text)
 if yellow:
  for r in pp.runs:r.font.highlight_color=WD_COLOR_INDEX.YELLOW
 return pp
def image(d,path,title,caption):
 pp=d.add_paragraph(title,style='Heading 2');pp.paragraph_format.keep_with_next=True
 sec=d.sections[-1];limit=(sec.page_width-sec.left_margin-sec.right_margin)/914400
 w,h=Image.open(path).size;d.add_picture(str(path),width=Inches(min(limit,6.1*w/h)))
 p(d,caption)
def table(d,headers,rows):
 t=d.add_table(rows=1,cols=len(headers));t.style='Table Grid'
 for c,s in zip(t.rows[0].cells,headers):c.text=s
 for vals in rows:
  for c,s in zip(t.add_row().cells,vals):c.text=str(s)
 for row in t.rows:
  for c in row.cells:
   for pp in c.paragraphs:
    for r in pp.runs:r.font.size=Pt(10)
 return t
screens=[
('Kiểm tra đầu vào','docs/evidence/browser-e2e/screenshots/03_diagnostic_test_in_progress_1440.png'),
('Hồ sơ năng lực','docs/evidence/math-tutor/live/competency-desktop.png'),
('Lộ trình học theo ngày','docs/evidence/math-adaptive/learning-path-desktop.png'),
('Bài học và luyện tập ba pha','docs/evidence/math-adaptive/practice-lesson-desktop.png'),
('Sổ lỗi sai','docs/evidence/browser-e2e/screenshots/06_mistake_notebook_1440.png'),
('Không gian giáo viên','docs/evidence/browser-e2e/screenshots/08_verified_teacher_classrooms_1440.png')]
summary=[
('Học liệu và tiêu chí thiết kế','Áp dụng cấu trúc câu hỏi, bốn mức nhận thức và dữ liệu IRT. Ngân hàng gốc có 1472 câu; số này không tự chứng minh toàn bộ câu đã được duyệt hoặc xuất bản.'),
('Kiến trúc hệ thống','Giữ cách trình bày ba tầng; cập nhật thành React/Vite → NestJS → PostgreSQL/Prisma. Thay mô tả Firebase và Security Rules bằng session cookie và kiểm tra vai trò phía API.'),
('IRT và CAT','Áp dụng đường cong 3PL và Fisher từ tham số hiện tại. Dựng lại lưu đồ theo selectStaircase; bỏ khẳng định lưu toàn bộ phiên vào localStorage.'),
('BKT và lịch ôn','Dựng lại quỹ đạo từ hàm updateKnowledge trong repo. Tách SM-2 của bản cũ khỏi FSRS đang dùng trong phiên bản hiện tại.'),
('Minh chứng giao diện','Điền sáu vị trí ảnh tương ứng tài liệu mẫu bằng ảnh kiểm thử đã lưu trong repo. Không coi các tài khoản hoặc điểm số QA là dữ liệu nghiên cứu học sinh.'),
('ZPD và Cây tri thức','Giữ sơ đồ gốc như minh chứng thiết kế của phiên bản cũ. Chưa xác nhận tích hợp tương đương trong repo hiện tại; hồ sơ năng lực không thay thế minh chứng Cây tri thức.'),
('Kiểm chứng bằng mô phỏng','Chạy mới 1500 học sinh ảo, seed 20261016, tối đa 24 lượt. Dùng thuật toán MAP/CAT của repo; ghi riêng baseline MLE, điều kiện và dữ liệu thô.')]
docs=[]
for stage,(title,decision) in enumerate(summary,1):
 d=Document();setup(d);d.add_paragraph(f'Minh chứng giai đoạn {stage}',style='Title');d.add_paragraph(title,style='Heading 1');p(d,decision);p(d,'Đối chiếu ngày 16/10/2026. Tài liệu tham chiếu: https://docs.google.com/document/d/'+ids[stage-1]+'/edit')
 if stage==1:
  src=Document(base/'references/stage-1.docx')
  for t in src.tables:d._element.body.insert(-1,deepcopy(t._element))
  p(d,'Hai bảng trên kế thừa tài liệu tham chiếu. Các yêu cầu ZPD và học hoàn toàn khi mất mạng là tiêu chí thiết kế; không ghi nhận là đã hoàn thành ở repo hiện tại.')
  image(d,base/'screenshots/01-bank.jpg','Trích đoạn ngân hàng câu hỏi gốc','Nguồn: content/math/legacy-bank.json. Ảnh chụp ngày 15/10/2026; thông số IRT chưa được hiệu chuẩn từ học sinh thật.')
 elif stage==2:
  table(d,['Thành phần','Công nghệ hiện tại'],[['Giao diện','React 18, Vite, KaTeX'],['API và thuật toán','NestJS, TypeScript, IRT/MAP, CAT, BKT'],['Xác thực và quyền','Session cookie HttpOnly; RolesGuard tại API'],['Dữ liệu và lịch ôn','PostgreSQL, Prisma, ts-fsrs'],['Phục hồi khi mất mạng','Đáp án luyện tập chưa gửi được giữ ở localStorage để gửi lại'],['Triển khai','Vercel cho giao diện; Render cho API']])
  image(d,fig/'architecture.png','Sơ đồ kiến trúc đã cập nhật','Đối chiếu src/App.jsx, src/lib/apiClient.js, apps/api/prisma/schema.prisma và các dịch vụ Auth/Student.')
 elif stage==3:
  image(d,fig/'irt.png','Đường cong đặc trưng câu hỏi','Tham số mặc định từ itemParameters: a = 1,2; c = 0,25; b = −1,5 / −0,5 / 0,5 / 1,5. Biểu đồ lý thuyết, không phải dữ liệu học sinh.')
  image(d,fig/'fisher.png','Thông tin Fisher','Công thức đối chiếu hàm information trong apps/api/src/modules/student/math-adaptive.ts.')
  image(d,fig/'cat-flow.png','Luồng chọn câu của phiên bản hiện tại','Các bước được đối chiếu selectStaircase và estimateAbility. Chặn bước cập nhật ±0,75; prior có phương sai 4; θ trong ±4.')
 elif stage==4:
  image(d,fig/'bkt.png','Quỹ đạo cập nhật BKT','Chạy trực tiếp hàm updateKnowledge với các chuỗi đúng/sai minh họa. P(slip)=0,10; P(guess)=0,25; P(learn)=0,15. Ngưỡng 0,85 là mốc tham khảo cho mục tiêu thi vào lớp 10, không phải ngưỡng cố định cho mọi mục tiêu.')
  p(d,'Lịch ôn hiện tại dùng ts-fsrs 5.4.2, request_retention = 0,9, enable_fuzz = false, maximum_interval = 365. Không áp dụng lại chuỗi ngày SM-2 1–4–12–34–98 vào bản hiện tại. Nguồn: apps/api/src/modules/student/math-review.service.ts.')
 elif stage==5:
  p(d,'Các ảnh dưới đây có sẵn từ những lần kiểm thử trước; không phải ảnh mới chụp toàn bộ hệ thống ngày 16/10/2026. Hồ sơ năng lực dùng giá trị QA tổng hợp; bộ ảnh luyện tập dùng môi trường QA với câu hỏi thử nghiệm.')
  for i,(caption,path) in enumerate(screens):
   if i:d.add_page_break()
   image(d,Path(path),caption,'Ảnh kiểm thử kỹ thuật từ repo. Nguồn: '+path)
  p(d,'Tài liệu mẫu còn nhắc Cây tri thức và Nhiệm vụ số. Các ảnh hiện có chưa chứng minh hai chức năng này đã hoạt động tương đương bản cũ.')
  p(d,'CẦN HỌC SINH THẬT: nếu dùng ảnh làm minh chứng triển khai/thực nghiệm, bổ sung ảnh học sinh làm kiểm tra đầu vào, học theo lộ trình và luyện tập trong bối cảnh thực tế.',True)
 elif stage==6:
  image(d,base/'references/stage-6-image1.png','Sơ đồ ZPD của phiên bản cũ','Kế thừa hình từ tài liệu GĐ 6. Nguồn mã đối chiếu: AdaptiveMath_THCS_KNTT_2026.zip → js/core/adaptiveEngine.js. Không chứng nhận chức năng này đã tích hợp trong repo hiện tại.')
  p(d,'Lưu ý đối chiếu mã cũ: các offset cơ sở normal +0,3; frustration −0,5; boredom +0,8; flow +0,4 còn được cộng +0,2 khi đúng ≥5 câu hoặc trừ −0,3 khi sai ≥3 câu. Độ khó mục tiêu được chặn trong [−3; 3]. Sơ đồ gốc chỉ thể hiện offset cơ sở.')
  p(d,'Cây tri thức cũ tổng hợp 6 thành phần: mastery 0,35; BKT 0,20; chuỗi SRS 0,15; sửa lỗi 0,15; độ gần đây 0,10; tính đều đặn 0,05. Cần một luồng chạy thực tế trong bản hiện tại trước khi tuyên bố đã hoàn thành.')
  p(d,'CẦN HỌC SINH THẬT: để kiểm chứng trạng thái nản/chán hoặc mức độ tham gia, bổ sung quan sát buổi học và dữ liệu trả lời/thời gian tương ứng. Ảnh sơ đồ thuật toán không cần học sinh.',True)
 elif stage==7:
  p(d,'Đây là lần mô phỏng mới; không xác nhận hoặc sao chép nguyên các giá trị RMSE của tài liệu gốc. Không dùng kết quả mô phỏng để suy ra hiệu quả sư phạm trên học sinh thật.')
  table(d,['Chỉ số','Sau 4 lượt','Sau 10 lượt','Sau 20 lượt'],[[label]+[f"{sim['metrics'][key][q-1]['rmse']:.3f}" for q in [4,10,20]] for key,label in [('staircase_map','RMSE bậc thang + MAP'),('staircase_mle','RMSE bậc thang + MLE'),('fisher_map','RMSE Fisher + MAP')]]+[['Chạm biên MLE / MAP (%)']+[f"{sim['metrics']['staircase_mle'][q-1]['boundaryPercent']:.2f} / {sim['metrics']['staircase_map'][q-1]['boundaryPercent']:.2f}" for q in [4,10,20]]])
  image(d,fig/'rmse.png','Sai số ước lượng năng lực','Kết quả tính từ simulation-raw.csv; seed 20261016; 1500 học sinh ảo, θ thật ~ N(0,1).')
  image(d,fig/'boundaryPercent.png','Tỷ lệ ước lượng chạm biên','Chạm biên được định nghĩa |θ ước lượng| ≥ 3,999999. MAP lấy trực tiếp từ repo; MLE chỉ là baseline của lần đối chiếu này.')
  p(d,'Điều kiện: 8 kỹ năng ảo, 4 mức nhận thức, 8 câu mỗi mức mỗi kỹ năng (256 câu), a=1,2; c=0,25; b theo mức. Các chiến lược dùng cùng kết quả Bernoulli của mỗi cặp học sinh/câu hỏi. Nếu CAT hết kỹ năng đủ điều kiện trước 24 lượt, giữ ước lượng cuối cho các mốc còn lại; vì vậy trục biểu đồ là lượt chẩn đoán, không mặc định mỗi học sinh đều làm đủ số câu đó.')
  p(d,'Hồ sơ chạy lại: simulation.json; dữ liệu thô 108000 bản ghi trong simulation-raw.csv. MLE dùng cùng gradient và thông tin Fisher, bỏ prior, chặn bước ±0,75 và năng lực ±4. Các lựa chọn mô phỏng này chưa phải mô hình hiệu chuẩn trên học sinh thật.')
 p(d,'Phần cần bổ sung ảnh học sinh được tô vàng; các sơ đồ, biểu đồ lý thuyết và mô phỏng kỹ thuật không yêu cầu học sinh xuất hiện trong ảnh.')
 out=root/f'GD_{stage}_minh_chung_cap_nhat.docx';d.save(out);docs.append(out)
# Replace the previous appendix with the seven grounded stage packets.
combined=Document(base/'Nhat_ky_minh_chung_to_vang.docx')
for i,(_,decision) in enumerate(summary):
 p(combined,'',False) if False else None
 cell=combined.tables[i*2].cell(1,6)
 cell.add_paragraph('Minh chứng cập nhật 16/10/2026: xem Phụ lục giai đoạn '+str(i+1)+'. '+decision)
for stage,path in enumerate(docs,1):
 combined.add_page_break()
 for element in Document(path).element.body:
  if element.tag==qn('w:sectPr'):continue
  # Use python-docx to add text/tables/images with new relationship IDs.
  if element.tag==qn('w:p'):
   texts=element.xpath('.//w:t');text=''.join(x.text or '' for x in texts)
   blips=element.xpath('.//a:blip')
   if blips:
    src=Document(path)
    for blip in blips:
     part=src.part.related_parts[blip.get(qn('r:embed'))]
     tmp=root/'figures'/f'merge-{stage}-{len(combined.inline_shapes)}.png';tmp.write_bytes(part.blob)
     w,h=Image.open(tmp).size;combined.add_picture(str(tmp),width=Inches(min(9.0,5*w/h)))
   elif text:
    pp=combined.add_paragraph(text)
    if element.xpath('.//w:highlight'):
     for r in pp.runs:r.font.highlight_color=WD_COLOR_INDEX.YELLOW
   elif element.xpath('.//w:br[@w:type="page"]'):combined.add_page_break()
  elif element.tag==qn('w:tbl'):combined.element.body.insert(-1,deepcopy(element))
combined.add_page_break();combined.add_paragraph('Minh chứng thực nghiệm cần học sinh',style=None)
for s in ['Ảnh học sinh làm bài kiểm tra trước và sau thực nghiệm.','Ảnh hoặc video học sinh sử dụng ứng dụng trong buổi học thật.','Ảnh bối cảnh nhóm đối chứng và nhóm thực nghiệm; kèm bài làm, bảng điểm đã mã hóa danh tính và nhật ký học gốc.']:p(combined,s,True)
combined_path=root/'Nhat_ky_minh_chung_doi_chieu_7_giai_doan.docx';combined.save(combined_path)
for path in docs+[combined_path]:
 d=Document(path);assert len(d.paragraphs)>0
 print(path.name,'images',len(d.inline_shapes),'tables',len(d.tables))
shutil.copy2(base/'benchmark.mjs',root/'benchmark.mjs')
(root/'HUONG_DAN.txt').write_text('Bộ minh chứng đối chiếu ngày 16/10/2026.\n7 file GD_*.docx dùng thay bản minh chứng cũ tại từng giai đoạn; file Nhat_ky_* gộp toàn bộ.\nẢnh QA không phải dữ liệu thực nghiệm học sinh thật. Phần cần học sinh tô vàng.\nMô phỏng: 1500 học sinh ảo; seed 20261016. Dữ liệu thô và cấu hình được kèm theo.\nChạy lại từ thư mục gốc repo: dùng Node để chạy outputs/evidence-review/benchmark.mjs; cần dependency typescript của repo.\n6 kiểm thử math-adaptive.spec.ts đã đạt ngày 16/10/2026.\nCác file Google Drive gốc chưa bị sửa. Chưa kiểm tra bản in DOCX do môi trường thiếu trình dựng trang Word/LibreOffice.\n',encoding='utf-8')
with zipfile.ZipFile(base/'Bo_minh_chung_GD1_GD7_cap_nhat.zip','w',zipfile.ZIP_DEFLATED) as z:
 for path in root.rglob('*'):
  if path.is_file() and not path.name.startswith('merge-'):z.write(path,path.relative_to(root))
print('ZIP ready')

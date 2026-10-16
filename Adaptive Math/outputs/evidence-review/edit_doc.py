from docx import Document
from docx.enum.text import WD_COLOR_INDEX
from pathlib import Path
src=Path(r'C:\Users\Administrator\Downloads\Documents\9.NHẬT KÝ NC VÀ MINH CHỨNG DỮ LIỆU GỐC -_1.docx')
out=Path('outputs/evidence-review/Nhat_ky_minh_chung_to_vang.docx')
doc=Document(src)
t=doc.tables[14]
# Mark the activity requiring real participants, preserving source formatting.
for run in t.cell(1,1).paragraphs[0].runs:
    run.font.highlight_color=WD_COLOR_INDEX.YELLOW
cell=t.cell(1,6)
p=cell.paragraphs[0]
r=p.add_run('CẦN BỔ SUNG: Ảnh HS kiểm tra trước/sau; ảnh HS sử dụng ứng dụng; video HS thao tác. Kèm bài làm, điểm số và nhật ký học gốc.')
r.font.highlight_color=WD_COLOR_INDEX.YELLOW
# Match the existing evidence column font and size.
ref=doc.tables[12].cell(1,6).paragraphs[0].runs
if ref:
    r.font.name=ref[0].font.name
    r.font.size=ref[0].font.size
doc.save(out)
check=Document(out)
assert len(check.tables)==len(doc.tables)
assert all(check.tables[i].cell(1,6).text==doc.tables[i].cell(1,6).text for i in range(0,14,2))
print(out.resolve())
print('Highlighted runs:',len(check.element.xpath('.//w:highlight')))

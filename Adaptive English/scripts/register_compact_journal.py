import hashlib
import json
from pathlib import Path
from docx import Document
ROOT=Path(__file__).resolve().parents[1]
B=ROOT/'docs/research-journal'
E=B/'evidence/EN-20261012-30'
E.mkdir(parents=True,exist_ok=True)
J=json.loads((B/'journal.json').read_text(encoding='utf-8'))
old=json.loads((E/'original/journal.json').read_text(encoding='utf-8'))
assert J['entries']==old['entries'], 'Original entries unexpectedly changed'
compact=json.loads((B/'compact/journal-compact.json').read_text(encoding='utf-8'))
assert len(compact['sections'])==10
known={x['id'] for x in J['entries']}
assert all(set(s['source_entries'])<=known for s in compact['sections'])
doc=Document(B/'compact/NHAT_KY_NGHIEN_CUU_RUT_GON_10_TRANG.docx')
breaks=doc._element.xml.count('w:type="page"')
assert breaks==9
report='''# Kiểm tra bản rút gọn EN-20261012-30

Ngày đối chiếu: 12/10/2026, Asia/Saigon. Người biên tập: Codex theo yêu cầu chủ dự án. Giờ, địa điểm, thành viên khác chưa xác nhận.

- Tạo bản riêng gồm 10 phần kỹ thuật, 9 ngắt trang chủ động; không coi đây là 10 buổi nghiên cứu.
- Bảo toàn toàn bộ entry gốc: đối chiếu bằng equality với snapshot trước biên tập PASS.
- 10/10 phần có ID nguồn tồn tại trong journal.json PASS; DOCX đọc được bằng python-docx PASS.
- Nội dung lược bỏ lỗi nhỏ, thay đổi giao diện nhỏ; vẫn giữ lỗi kiểm thử quan trọng, giới hạn triển khai và dữ liệu chưa xác nhận.
- Các kết quả kiểm thử sản phẩm trích từ phiên gốc, không chạy lại sản phẩm trong phiên biên tập.
- Renderer chuẩn render_docx.py lần đầu FAIL FileNotFoundError do PATH; lần tiếp theo có LibreOffice nhưng không hoàn thành và được ngắt; chạy lại ngoài sandbox FAIL: chuyển DOCX->PDF và DOCX->ODT đều exit3221225781. Chưa tạo PDF, chưa kiểm tra ảnh trang hoặc xác nhận đúng 10 trang thực tế. Không tuyên bố bố cục đã nghiệm thu.
- Lệnh tạo: python -X utf8 scripts/create_compact_journal.py exit0.
- Lệnh đối chiếu: python -X utf8 scripts/register_compact_journal.py; kết quả kiểm tra nguồn và 9 ngắt trang đạt trước khi cập nhật nhật ký.
'''
(E/'verification.md').write_text(report,encoding='utf-8')
ev=json.loads((B/'evidence.json').read_text(encoding='utf-8'))
paths=[B/'compact/NHAT_KY_NGHIEN_CUU_RUT_GON_10_TRANG.docx',B/'compact/NHAT_KY_NGHIEN_CUU_RUT_GON_10_TRANG.md',B/'compact/journal-compact.json',E/'verification.md',E/'original/journal.json',E/'original/NHAT_KY_NGHIEN_CUU.md',E/'original/NHAT_KY_NGHIEN_CUU_ADAPTIVE_ENGLISH.docx']
ids=[]
for n,p in enumerate(paths,174):
    id=f'MB{n}'; ids.append(id)
    ev['items'].append(dict(id=id,path=p.relative_to(ROOT).as_posix(),scope='Bản rút gọn riêng và kiểm tra biên tập; snapshot gốc bảo toàn lịch sử. Không chứng minh kiểm thử sản phẩm mới hoặc phân trang trực quan.',inspected_on='2026-10-12',event_date='2026-10-12',sha256=hashlib.sha256(p.read_bytes()).hexdigest()))
J['entries'].insert(0,dict(id='EN-20261012-30',kind='observed',title='Tạo bản sao nhật ký rút gọn theo các mốc kỹ thuật lớn',date='12/10/2026',stage='Biên tập tài liệu',status='Hoàn thành bản riêng; phân trang trực quan bị chặn',participants='Chủ dự án yêu cầu khoảng 10 trang và giữ bản đầy đủ; Codex biên tập, tạo bản sao và đối chiếu. Giờ, địa điểm, thành viên khác chưa xác nhận.',objective='Tạo bản rút gọn riêng khoảng 10 trang tập trung vào thay đổi kỹ thuật lớn; không xóa nhật ký đầy đủ.',equipment='Windows, Python có python-docx và lxml; renderer render_docx.py, LibreOffice hiện diện nhưng lỗi khởi động.',procedure='Đọc nhật ký và WORKLOG; lưu snapshot gốc, tổng hợp 10 phần có nguồn, tạo Word/Markdown/JSON riêng; đối chiếu entries và nguồn, thử render Word.',results='Tạo 10 phần, 9 ngắt trang chủ động; source mapping và bảo toàn entry gốc PASS. Script tạo exit0. Renderer FAIL PATH rồi không hoàn thành; lần chạy ngoài sandbox FAIL exit3221225781 ở PDF và ODT. Không có PDF, chưa xác nhận số trang thực tế. Không chạy lại kiểm thử sản phẩm.',lessons='Mười phần biên tập không phải mười buổi nghiên cứu; ngắt trang không chứng minh bố cục thực tế. Giữ giới hạn kỹ thuật và kết quả thất bại quan trọng, không giữ mọi sửa lỗi nhỏ trong bản rút gọn.',next='Mở bản Word bằng công cụ hoạt động để kiểm tra số trang và tinh chỉnh nếu tràn trang; giữ nhật ký đầy đủ và nguồn chuẩn.',evidence=ids))
(B/'journal.json').write_text(json.dumps(J,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(B/'evidence.json').write_text(json.dumps(ev,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
with (ROOT/'docs/WORKLOG.md').open('a',encoding='utf-8') as f:
    f.write('\n## 2026-10-12 — Bản nhật ký rút gọn riêng (EN-20261012-30)\n\n- Tạo [Word rút gọn](research-journal/compact/NHAT_KY_NGHIEN_CUU_RUT_GON_10_TRANG.docx), Markdown và nguồn đối chiếu: 10 phần kỹ thuật, 9 ngắt trang; không coi là 10 buổi thực tế. Giữ mọi entry cũ và snapshot bản đầy đủ.\n- Đối chiếu nguồn/bảo toàn entry PASS; không chạy lại kiểm thử sản phẩm. Renderer FAIL exit3221225781, chưa xác nhận số trang trực quan hoặc có PDF.\n- Nhật ký EN-20261012-30; minh chứng MB174–MB180; [verification.md](research-journal/evidence/EN-20261012-30/verification.md).\n')
print('PASS: 10 source-mapped sections, 9 page breaks, all historical entries preserved; journal updated.')

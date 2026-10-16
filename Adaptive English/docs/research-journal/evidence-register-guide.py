import json,hashlib
from pathlib import Path
from zipfile import ZipFile
from lxml import etree
r=Path.cwd(); b=r/'docs/research-journal'; q=b/'evidence/EN-20261013-01';q.mkdir(parents=True,exist_ok=False)
j=json.loads((b/'journal.json').read_text(encoding='utf-8')); e=json.loads((b/'evidence.json').read_text(encoding='utf-8'))
p=b/'NHAT_KY_NGHIEN_CUU_ADAPTIVE_ENGLISH.docx'
with ZipFile(p) as z:
 root=etree.fromstring(z.read('word/document.xml')); txt='\n'.join(root.xpath('//w:t/text()',namespaces={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}))
assert all(x['id'] in txt and x['lessons'] in txt for x in j['entries'])
(q/'source-full.docx').write_bytes(p.read_bytes())
(q/'source-journal.json').write_bytes((b/'journal.json').read_bytes())
a=r/'docs/KINH_NGHIEM_LAM_VIEC_VOI_CHU_DU_AN.md'
(q/'guide-snapshot.md').write_bytes(a.read_bytes())
(q/'verification.log').write_text(f'PASS: Read full DOCX OOXML, all {len(j["entries"])} source entry IDs and lessons match canonical JSON.\nFull DOCX bytes: {p.stat().st_size}; compact DOCX bytes: {(b/"compact/NHAT_KY_NGHIEN_CUU_RUT_GON_10_TRANG.docx").stat().st_size}.\nPASS: Markdown guide created, UTF-8 readable; sources and recommendations distinguished.\nInitial broad rg search exit1: access denied in unrelated artifact tool directories; targeted docs reads succeeded.\nNo product tests, production writes or deployments performed. Word visual pagination not verified; previous renderer failures retained in history.\n',encoding='utf-8')
ids=[]
for f in sorted(q.iterdir()):
 id='MB'+str(max(int(x['id'][2:]) for x in e['items'])+1);ids.append(id)
 e['items'].append(dict(id=id,path=f.relative_to(r).as_posix(),scope='Nguồn đầy đủ trước tổng hợp hoặc bản hướng dẫn và đối chiếu nội dung; không chứng minh kiểm thử sản phẩm.',inspected_on='2026-10-13',event_date='2026-10-13',sha256=hashlib.sha256(f.read_bytes()).hexdigest()))
j['compiled_on']='2026-10-13'
j['entries'].insert(0,dict(id='EN-20261013-01',kind='observed',title='Tổng hợp kinh nghiệm phối hợp với chủ dự án từ nhật ký đầy đủ',date='13/10/2026',stage='Tài liệu hướng dẫn agent',status='Đã tạo Markdown và đối chiếu nguồn; chưa xác minh phân trang Word',participants='Chủ dự án yêu cầu tổng hợp từ file nhật ký gốc nặng hơn; Codex đọc nguồn và soạn hướng dẫn. Giờ, địa điểm và người khác chưa xác nhận.',objective='Tạo file Markdown nêu nên làm, tránh làm, cách triển khai, báo cáo và giới hạn suy luận về chủ dự án.',equipment='Windows PowerShell, bundled Python và lxml; exporter nhật ký hiện có.',procedure='Đọc nhật ký/WORKLOG, so sánh dung lượng bản đầy đủ và rút gọn; đọc toàn bộ lessons từ JSON và đối chiếu từng entry với XML Word đầy đủ. Lưu snapshot nguồn và đầu ra, viết hướng dẫn có mã phiên truy nguồn, phân biệt quy định trực tiếp với khuyến nghị tổng hợp.',results=f'Đối chiếu {len(j["entries"])} entry nguồn và lessons trong Word/JSON PASS; Word đầy đủ89352bytes, rút gọn12706bytes. Đã tạo docs/KINH_NGHIEM_LAM_VIEC_VOI_CHU_DU_AN.md. Tìm rộng ban đầu rg exit1 do thư mục công cụ không cho đọc, đọc docs có mục tiêu thành công. Không chạy kiểm thử sản phẩm, không deploy hoặc ghi DB. Word chưa kiểm tra phân trang trực quan.',lessons='Không coi bài học kỹ thuật của agent là lời nguyên văn hay hồ sơ tính cách của chủ dự án. Giữ nguồn đầy đủ và dẫn mã phiên; quyền thao tác theo yêu cầu thực tế.',next='Dùng hướng dẫn khi tiếp nhận công việc; cập nhật khi chủ dự án xác nhận sở thích hoặc quy tắc mới. Kiểm tra phân trang khi renderer hoạt động.',evidence=ids))
(b/'journal.json').write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');(b/'evidence.json').write_text(json.dumps(e,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
with (r/'docs/WORKLOG.md').open('a',encoding='utf-8') as f:
 f.write('\n## 2026-10-13 — Kinh nghiệm làm việc với chủ dự án (EN-20261013-01)\n\n- Tạo [hướng dẫn Markdown](KINH_NGHIEM_LAM_VIEC_VOI_CHU_DU_AN.md) từ nhật ký đầy đủ, phân biệt quy định trực tiếp và khuyến nghị; có bảng nên/không nên, quy trình, ranh giới và mẫu báo cáo.\n- Đối chiếu toàn bộ entry nguồn Word/JSON PASS; không chạy kiểm thử sản phẩm. Tìm rộng rg exit1 do quyền đọc công cụ, nguồn docs đọc thành công. Word chưa xác minh phân trang trực quan.\n- Entry [EN-20261013-01](research-journal/NHAT_KY_NGHIEN_CUU.md), minh chứng '+', '.join(ids)+' tại [thư mục phiên](research-journal/evidence/EN-20261013-01).\n')
print('PASS source comparison and guide registration')

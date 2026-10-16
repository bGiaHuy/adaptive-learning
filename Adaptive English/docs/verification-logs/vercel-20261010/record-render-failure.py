from pathlib import Path
import hashlib
import json

root = Path(__file__).resolve().parents[3]
folder = root / 'docs/research-journal'
journal_file = folder / 'journal.json'
evidence_file = folder / 'evidence.json'
journal = json.loads(journal_file.read_text(encoding='utf-8'))
evidence = json.loads(evidence_file.read_text(encoding='utf-8'))
assert not any(item['id'] == 'MB72' for item in evidence['items'])
target = root / 'docs/verification-logs/vercel-20261010/docx-render-failure.txt'
evidence['items'].append({
  'id':'MB72', 'path':'docs/verification-logs/vercel-20261010/docx-render-failure.txt',
  'scope':'Log FAIL của renderer Word: bundled dependencies không có soffice.exe; chưa xác minh phân trang trực quan.',
  'inspected_on':'2026-10-10','event_date':'2026-10-10','sha256':hashlib.sha256(target.read_bytes()).hexdigest(),
})
entry = next(item for item in journal['entries'] if item['id'] == 'EN-20261010-10')
entry['status'] = 'Hoàn thành deploy; luồng tài khoản chính đạt, còn giới hạn SMTP, object storage và QA phân trang Word'
entry['results'] += ' Sau khi xuất nhật ký, renderer Word bundled chạy exit 1 vì không có soffice.exe; tìm trong bundled dependencies không thấy executable. Cấu trúc/nguồn/OOXML PASS nhưng phân trang trực quan chưa xác minh.'
entry['next'] += ' Bổ sung bundled LibreOffice/soffice rồi render và xem toàn bộ trang Word; giữ kết quả FAIL này trong lịch sử.'
entry['evidence'].append('MB72')
journal_file.write_text(json.dumps(journal, ensure_ascii=False, indent=2)+'\n',encoding='utf-8')
evidence_file.write_text(json.dumps(evidence, ensure_ascii=False, indent=2)+'\n',encoding='utf-8')
with (root/'docs/WORKLOG.md').open('a',encoding='utf-8') as output:
  output.write('- Render Word sau deploy: FAIL exit 1 do bundled dependencies không có soffice.exe; đã tìm lại runtime. Ghi MB72; cấu trúc/OOXML vẫn PASS, phân trang trực quan chưa xác minh.\n')
print('Updated EN-20261010-10 with MB72')

from pathlib import Path
import hashlib
import json

root=Path(__file__).resolve().parents[3]
folder=root/'docs/research-journal'
journal_file=folder/'journal.json'
evidence_file=folder/'evidence.json'
journal=json.loads(journal_file.read_text(encoding='utf-8'))
evidence=json.loads(evidence_file.read_text(encoding='utf-8'))
assert not any(item['id']=='MB73' for item in evidence['items'])
target=root/'docs/verification-logs/vercel-20261010/alias-check.json'
evidence['items'].append({'id':'MB73','path':'docs/verification-logs/vercel-20261010/alias-check.json',
 'scope':'Kiểm tra ba URL: English production đạt; alias adaptivemath-two hiện trỏ English; Math chính adaptivemath-blush vẫn đạt.',
 'inspected_on':'2026-10-10','event_date':'2026-10-10','sha256':hashlib.sha256(target.read_bytes()).hexdigest()})
entry=next(item for item in journal['entries'] if item['id']=='EN-20261010-10')
entry['results'] += ' Kiểm tra alias: adaptiveenglish đúng English; alias cũ adaptivemath-two của cùng project cũng trỏ English; Math chính adaptivemath-blush vẫn HTTP 200 đúng AdaptiveMath. Không xóa alias cũ vì ngoài phạm vi deploy.'
entry['next'] += ' Chủ dự án quyết định có xóa alias cũ adaptivemath-two khỏi project English hay không.'
entry['evidence'].append('MB73')
journal_file.write_text(json.dumps(journal,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
evidence_file.write_text(json.dumps(evidence,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
with (root/'docs/WORKLOG.md').open('a',encoding='utf-8') as output:
 output.write('- Kiểm tra alias: adaptiveenglish đúng English; alias cũ adaptivemath-two cũng trỏ English; Math chính adaptivemath-blush vẫn hoạt động đúng. Giữ nguyên alias cũ, ghi MB73.\n')
print('Updated EN-20261010-10 with MB73')

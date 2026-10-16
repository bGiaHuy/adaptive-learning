import json,hashlib,subprocess,sys
from pathlib import Path
r=Path.cwd();b=r/'docs/research-journal';q=b/'evidence/EN-20261013-01'
f=q/'export-check.log'
p=subprocess.run([sys.executable,'scripts/export_research_journal.py','--check'],capture_output=True,text=True);f.write_text(p.stdout+p.stderr+'\nexit_code='+str(p.returncode),encoding='utf-8');assert p.returncode==0
j=json.loads((b/'journal.json').read_text(encoding='utf-8'));e=json.loads((b/'evidence.json').read_text(encoding='utf-8'))
for path in [q/'render.log',f]:
 id='MB'+str(max(int(x['id'][2:]) for x in e['items'])+1)
 e['items'].append(dict(id=id,path=path.relative_to(r).as_posix(),scope='Renderer exit1 chưa có kiểm tra trang; hoặc exporter --check PASS exit0, giữ cảnh báo nguồn lịch sử.',inspected_on='2026-10-13',event_date='2026-10-13',sha256=hashlib.sha256(path.read_bytes()).hexdigest()));j['entries'][0]['evidence'].append(id)
j['entries'][0]['results']+=' Export và --check PASS exit0; 90 entries, nội dung/package khớp, giữ cảnh báo nguồn lịch sử. Thử render_docx.py exit1; xem render.log, chưa nghiệm thu phân trang.'
(b/'journal.json').write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');(b/'evidence.json').write_text(json.dumps(e,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
with (r/'docs/WORKLOG.md').open('a',encoding='utf-8') as w:w.write('\n- Export/--check PASS exit0,90 entries; giữ cảnh báo nguồn lịch sử. Render thử exit1, chưa xác minh phân trang; log MB337–MB338 trong thư mục phiên.\n')

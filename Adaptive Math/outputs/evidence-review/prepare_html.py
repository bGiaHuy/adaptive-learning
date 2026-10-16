import json,html
from pathlib import Path
spec=[('01-bank','Ngân hàng câu hỏi gốc','content/math/legacy-bank.json',1,32),('02-schema','Cấu trúc dữ liệu','apps/api/prisma/schema.prisma',1,36),('03-irt','IRT 3PL và MAP','apps/api/src/modules/student/math-adaptive.ts',1,35),('04-cat','Bộ chọn câu hỏi CAT','apps/api/src/modules/student/math-adaptive.ts',41,67),('05-bkt','Cập nhật BKT','apps/api/src/modules/student/math-adaptive.ts',68,82),('06-plan','Sinh lộ trình học','apps/api/src/modules/student/math-adaptive.ts',94,120)]
for id,title,file,a,b in spec:
 raw=Path(file).read_text(encoding='utf-8')
 if file.endswith('.json'):
  j=json.loads(raw);raw=json.dumps({k:j[k] for k in ['builtAt','totalCount','curriculum']}|{'questions':j['questions'][:1]},ensure_ascii=False,indent=2)
 lines=raw.splitlines()[a-1:b]
 body=''.join(f'<div><span>{i+a}</span><code>{html.escape(s)}</code></div>' for i,s in enumerate(lines))
 Path(f'outputs/evidence-review/screenshots/{id}.html').write_text(f'<meta charset="utf-8"><style>body{{font-family:Arial;margin:24px;color:#162030}}h1{{font-size:24px}}section{{border:1px solid #aaa;padding:12px}}section div{{display:flex;font-size:14px;line-height:21px}}span{{width:36px;flex-shrink:0;color:#777}}code{{white-space:pre-wrap;overflow-wrap:anywhere}}p{{font-size:15px}}</style><h1>{title}</h1><p>{file} · dòng {a}–{b}</p><section>{body}</section><p>Trích đoạn mã nguồn thực tế · 15/10/2026</p>',encoding='utf-8')

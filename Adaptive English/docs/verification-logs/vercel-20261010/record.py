from pathlib import Path
import hashlib
import json

root = Path(__file__).resolve().parents[3]
out = Path(__file__).parent
stage = root / 'english-learning-platform/.artifacts/vercel-release-20261010'
files = [f for f in stage.rglob('*') if f.is_file() and not any(part in ['node_modules', '.next'] for part in f.relative_to(stage).parts)]
assert not any(f.name.startswith('.env') or f.suffix in ['.db', '.webm'] or '/uploads/' in f.as_posix() for f in files)
(out / 'release-inventory.json').write_text(json.dumps({
 'directory':stage.relative_to(root).as_posix(),
 'files':[{'path':f.relative_to(stage).as_posix(),'bytes':f.stat().st_size,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()} for f in files],
 'includes_user_database':False,'includes_env_files':False,'includes_recordings':False,
}, indent=2),encoding='utf-8')
folder = root / 'docs/research-journal'
journal = json.loads((folder / 'journal.json').read_text(encoding='utf-8'))
registry = json.loads((folder / 'evidence.json').read_text(encoding='utf-8'))
assert not any(e['id']=='EN-20261010-09' for e in journal['entries'])
items = [
 ('docs/verification-logs/vercel-20261010/RESULTS.md','Báo cáo chuẩn bị Vercel và PostgreSQL; chưa tạo DB hoặc deploy, ghi rõ auto-review từ chối tạo resource và giới hạn storage/SMTP.'),
 ('docs/verification-logs/vercel-20261010/build.log','Log build production cô lập dùng schema PostgreSQL: exit 0; URL giả, chưa kiểm tra kết nối database.'),
 ('docs/verification-logs/vercel-20261010/build-first-type-error.log','Log FAIL TypeScript đầu tiên, đã sửa ở lần build tiếp theo; giữ lịch sử thất bại.'),
 ('docs/verification-logs/vercel-20261010/smoke-results.json','HTTP smoke thực chạy trong runtime VERCEL=1: trang/auth anonymous/recovery fail-closed/từ điển và trace.'),
 ('docs/verification-logs/vercel-20261010/release-inventory.json','Danh mục/hash gói phát hành riêng không có env/DB tài khoản/uploads/recordings; node_modules và build output không nằm trong danh mục upload.'),
 ('docs/verification-logs/vercel-20261010/postgres-initial.sql','SQL khởi tạo từ schema bằng Prisma migrate diff, chưa thực thi trên database.'),
]
ids=[]
first=max(int(e['id'][2:]) for e in registry['items'])+1
for number,(rel,scope) in enumerate(items,first):
    code=f'MB{number:02}'
    ids.append(code)
    registry['items'].append({'id':code,'path':rel,'scope':scope,'inspected_on':'2026-10-10','event_date':'2026-10-10',
      'sha256':hashlib.sha256((root/rel).read_bytes()).hexdigest()})
journal['entries'].append({
 'id':'EN-20261010-09','kind':'observed','title':'Chuẩn bị triển khai Vercel với PostgreSQL',
 'date':'10/10/2026','stage':'Chuẩn bị môi trường online','status':'Một phần; build đạt, chờ xác nhận tạo database, chưa deploy',
 'participants':'Chủ dự án yêu cầu deploy Vercel và chọn chuẩn bị PostgreSQL. Codex kiểm tra tài khoản/cấu hình, chuẩn bị gói riêng và kiểm thử. Chưa xác nhận giờ/địa điểm.',
 'objective':'Chuẩn bị triển khai bản Next.js lên dự án Adaptive English có sẵn với dữ liệu tài khoản lưu bền trên PostgreSQL.',
 'equipment':'Vercel CLI 63.1.2, Node 24.19.0, Next.js 14.2.35, Prisma 5.21.1, Python, SQLite từ điển read-only; runtime production kiểm tra riêng cổng 3020.',
 'procedure':'Xác nhận CLI đăng nhập, tìm dự án adaptivelearning hiện là Vite, liên kết local. Không có env production hoặc resource database. Đề xuất Neon Free sin1; auto-review từ chối tạo resource vì thiếu xác nhận thông số/chi phí. Tiếp tục chuẩn bị config Next.js, schema/build PostgreSQL riêng, gói sạch và từ điển gzip. Chặn reset link production; trả lỗi rõ cho upload chưa có storage. Build lỗi TypeScript lần đầu, sửa và build lại; sinh SQL offline và chạy smoke runtime riêng rồi dừng.',
 'results':'Build sau sửa exit 0; SQL migrate diff exit 0 chỉ sinh tệp, không chạy DB. Smoke exit 0: ba trang HTTP 200, anonymous me 401, recovery 503 không lộ reset link, dictionary hello HTTP 200 có 10 nghĩa và file gzip được trace. Gói không chứa env, DB tài khoản hoặc recordings. Chưa tạo resource, chưa deploy, chưa xác nhận đăng nhập PostgreSQL. Dữ liệu SQLite local không được reset/seed/chuyển lên online. Có sẵn URL dự án cũ không đồng nghĩa đã cập nhật bản mới.',
 'lessons':'Filesystem Vercel không phù hợp DB SQLite ghi dữ liệu hoặc uploads bền. Build đạt chưa chứng minh đăng nhập/database online. Không né từ chối auto-review bằng cách khác; cần chủ tài khoản xác nhận cụ thể resource/gói/khu vực trước tạo dịch vụ.',
 'next':'Xin xác nhận Neon resource adaptive-english-db, free_v3, Singapore sin1, kết nối production; không dùng gói trả phí. Sau chấp thuận mới tạo DB/schema, cấu hình HTTPS/env, kiểm thử preview rồi production. SMTP và storage audio/DOCX còn chưa hoàn thiện; Word chưa xác minh phân trang trực quan.',
 'evidence':ids,
})
for name,data in [('journal.json',journal),('evidence.json',registry)]:
    (folder/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
with (root/'docs/WORKLOG.md').open('a',encoding='utf-8') as f:
    f.write('\n\n## 2026-10-10 — Chuẩn bị Vercel PostgreSQL, chưa deploy\n\n'
      '- Codex xác nhận Vercel đăng nhập và dự án adaptivelearning có sẵn; chuẩn bị cấu hình Next.js thay Vite, gói sạch riêng và schema PostgreSQL.\n'
      '- Build có FAIL TypeScript được giữ log, sửa rồi PASS exit 0; SQL offline exit 0; smoke runtime riêng exit 0 cho trang, quyền anonymous, chặn reset link và từ điển gzip.\n'
      '- Auto-review từ chối tạo Neon vì chưa xác nhận cụ thể provider/resource/region/chi phí. Chưa tạo DB, chưa deploy; chờ chủ dự án xác nhận Free/sin1/production. Storage audio/DOCX và SMTP còn thiếu. Không chuyển DB tài khoản local lên mạng.\n'
      '- Entry EN-20261010-09; minh chứng '+ids[0]+'–'+ids[-1]+'. Báo cáo docs/verification-logs/vercel-20261010/RESULTS.md. Word chưa kiểm tra phân trang trực quan.\n')
print('EN-20261010-09: '+', '.join(ids))

from pathlib import Path
import hashlib
import json

root = Path(__file__).resolve().parents[3]
journal_dir = root / 'docs/research-journal'
journal_file = journal_dir / 'journal.json'
evidence_file = journal_dir / 'evidence.json'
journal = json.loads(journal_file.read_text(encoding='utf-8'))
evidence = json.loads(evidence_file.read_text(encoding='utf-8'))
entry_id = 'EN-20261010-10'
assert not any(item['id'] == entry_id for item in journal['entries'])
records = [
 ('docs/verification-logs/vercel-20261010/RESULTS.md', 'Báo cáo hoàn tất triển khai: PostgreSQL, production smoke, cleanup và giới hạn SMTP/storage/dependency audit.'),
 ('docs/verification-logs/vercel-20261010/deployment-result.json', 'Định danh deployment production READY, URL, dự án và cấu hình database; không chứa secret.'),
 ('docs/verification-logs/vercel-20261010/production-results.json', 'Tóm tắt các kiểm tra thực trên production và giới hạn còn lại.'),
 ('docs/verification-logs/vercel-20261010/prod-cleanup-result.json', 'Xác nhận xóa đúng một tài khoản production giả và không còn bản ghi với email thử.'),
 ('docs/verification-logs/vercel-20261010/production-register.png', 'Ảnh trình duyệt công khai của form đăng ký production sau deploy.'),
]
start = max(int(item['id'][2:]) for item in evidence['items']) + 1
ids = []
for number, (rel, scope) in enumerate(records, start):
    evidence_id = f'MB{number:02}'
    target = root / rel
    assert target.is_file()
    ids.append(evidence_id)
    evidence['items'].append({'id': evidence_id, 'path': rel, 'scope': scope,
      'inspected_on': '2026-10-10', 'event_date': '2026-10-10',
      'sha256': hashlib.sha256(target.read_bytes()).hexdigest()})
journal['entries'].append({
 'id': entry_id, 'kind': 'observed', 'title': 'Triển khai production Vercel với PostgreSQL',
 'date': '10/10/2026', 'stage': 'Triển khai và kiểm tra production',
 'status': 'Hoàn thành deploy; luồng tài khoản chính đạt, còn giới hạn SMTP và object storage',
 'participants': 'Chủ dự án yêu cầu tiếp tục và tự chấp nhận điều khoản Neon; Codex tạo resource, khởi tạo schema, deploy, kiểm thử và dọn dữ liệu giả. Chưa xác nhận giờ/địa điểm.',
 'objective': 'Đưa Adaptive English lên URL production Vercel với database PostgreSQL lưu bền và xác minh đăng ký, đăng nhập, phiên, trang bảo vệ, từ điển và recovery.',
 'equipment': 'Vercel CLI 63.1.2, Vercel production, Neon PostgreSQL Free region sin1, Next.js 14.2.35, Prisma 5.21.1, browser tích hợp và tài khoản thử example.invalid.',
 'procedure': 'Sau khi chủ dự án thông báo đã chấp nhận điều khoản, tạo Neon adaptive-english-db Free tại Singapore và nối production. Đặt URL HTTPS, tắt test simulation/role switcher. Pull env vào file tạm, Prisma db push trên database rỗng rồi xóa env. Deploy gói sạch, kiểm tra trạng thái READY và truy cập public. Tạo một học sinh giả, kiểm tra cookie/me/login/student home/dictionary/recovery. Xóa chính xác user giả, kiểm tra count 0, xóa cookie/env tạm và mở form production công khai.',
 'results': 'Production READY tại https://adaptiveenglish.vercel.app. Public HTTP 200 đúng Adaptive Study. Register, me, login và trang học sinh bằng dữ liệu giả đạt; dictionary hello HTTP 200 có 10 nghĩa; recovery HTTP 503 không lộ link. Xóa 1 user giả, còn 0; xóa 3 file secret/cookie tạm, còn 0. PostgreSQL online bắt đầu rỗng và không nhận dữ liệu SQLite local. Audio upload và import DOCX trên Vercel trả 503 đến khi có object storage; SMTP chưa gửi email. Vercel install báo 9 dependency audit findings, chưa dùng nâng cấp force.',
 'lessons': 'Cần tách database người dùng online khỏi SQLite học liệu read-only. Kiểm tra deployment phải bao gồm request public, auth có cookie và cleanup, không chỉ build READY. Tính năng ghi file phải fail rõ trên serverless khi chưa có storage bền. Không đưa dữ liệu local lên mạng nếu chưa có phạm vi và phê duyệt riêng.',
 'next': 'Kết nối object storage cho audio/ảnh DOCX và SMTP thật; kiểm thử lại hai luồng. Rà soát 9 dependency audit findings bằng nâng cấp có kiểm thử. Quyết định riêng dữ liệu/học liệu cần nhập lên PostgreSQL. Bản Word cần render và kiểm tra phân trang nếu renderer hoạt động.',
 'evidence': ids,
})
journal_file.write_text(json.dumps(journal, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
evidence_file.write_text(json.dumps(evidence, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
with (root / 'docs/WORKLOG.md').open('a', encoding='utf-8') as output:
    output.write('\n\n## 2026-10-10 — Deploy production Vercel với PostgreSQL\n\n'
      '- Chủ dự án chấp nhận điều khoản Neon; Codex tạo adaptive-english-db Free tại sin1, nối production và db push schema rỗng. Không chuyển SQLite local.\n'
      '- Deploy READY: https://adaptiveenglish.vercel.app, deployment dpl_GktLNdJuhGs3zCnwNYo2DQQRvCpF. Public trả đúng Adaptive Study.\n'
      '- Production smoke: register/me/login/student page đạt bằng user giả; dictionary hello 200 có 10 nghĩa; recovery 503 không lộ link. Xóa user giả, count 0; xóa env/cookie tạm.\n'
      '- Còn thiếu SMTP thật và object storage cho audio/DOCX; Vercel báo 9 dependency audit findings, chưa nâng cấp force.\n'
      '- Entry EN-20261010-10; minh chứng ' + ids[0] + '–' + ids[-1] + '. Báo cáo docs/verification-logs/vercel-20261010/RESULTS.md.\n')
print(entry_id + ': ' + ', '.join(ids))

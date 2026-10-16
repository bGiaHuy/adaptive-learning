from pathlib import Path
import json, hashlib

root = Path(__file__).resolve().parents[3]
out = Path(__file__).parent
folder = root / 'docs/research-journal'
report = out / 'CHATBOT-DEPLOYMENT.md'
report.write_text('''# Kết nối chatbot production ngày 10/10/2026

Chủ dự án yêu cầu đưa cấu hình API chatbot lên Vercel. Codex thực hiện trên dự án adaptivelearning.

- Vercel CLI 63.1.2, Node 24.19.0. Đưa MWAPI_API_KEY (Secret), MWAPI_BASE_URL và MWAPI_MODEL vào production bằng stdin; cả ba lệnh exit 0, không ghi giá trị secret vào log.
- Redeploy chính bản đã phát hành, không upload dữ liệu local hoặc thay mã ứng dụng: dpl_7NNBJvkqmR8oPdW72QLhdwtWs5ej. Lệnh redeploy exit 0; log build ghi Deployment completed và Ready. URL công khai https://adaptiveenglish.vercel.app đã nhận cấu hình mới.
- Kiểm tra GET /api/ai/tutor: HTTP 200, isConfigured=true, provider=mwapi, model=claude-sonnet-4-6. POST /api/ai/chat không đăng nhập: HTTP 401.
- Kiểm thử trực tiếp upstream bằng Python urllib: HTTP 403, bộ kiểm tra exit 1. Không kết luận khóa sai từ kết quả này.
- Đối chiếu bằng Node fetch tương ứng runtime ứng dụng: HTTP 200, có phản hồi giải nghĩa resilient bằng tiếng Việt, exit 0. Đây là request giả trực tiếp tới provider bằng cùng cấu hình đã đưa lên, không phải hội thoại đăng nhập qua Vercel. Chưa kiểm tra parser JSON và đầy đủ luồng hội thoại trên production.
- Bộ kiểm thử tạo tài khoản production/lưu lịch sử/dọn tài khoản bị automatic approval review từ chối trước khi chạy vì quyền deploy chưa bao gồm truy cập credential database và tạo/xóa dữ liệu production. Script có sẵn không có nghĩa đã chạy. Không đọc credential database, không tạo/xóa tài khoản, không có file env kiểm thử được tạo.
- Build vẫn báo 9 dependency vulnerabilities đã biết; không nâng cấp force trong tác vụ nối cấu hình.
- Nhật ký được xuất lại và chạy --check. Bản Word chưa kiểm tra phân trang trực quan do thiếu soffice.exe đã ghi ở MB72; không sửa bản mẫu hoặc hash minh chứng cũ.
''', encoding='utf-8')
journal = json.loads((folder / 'journal.json').read_text(encoding='utf-8'))
registry = json.loads((folder / 'evidence.json').read_text(encoding='utf-8'))
entry_id = 'EN-20261010-12'
assert not any(e['id'] == entry_id for e in journal['entries'])
items = [
    ('CHATBOT-DEPLOYMENT.md', 'Báo cáo cấu hình, redeploy và giới hạn kiểm thử chatbot production.'),
    ('chatbot-env-push.json', 'Ba lệnh thêm biến môi trường production exit 0; giá trị secret không được lưu.'),
    ('chatbot-redeploy.log', 'Lệnh redeploy production đã chạy exit 0; định danh URL deployment mới.'),
    ('chatbot-build-events.log', 'Log Vercel build/deploy hoàn thành Ready; giữ cảnh báo dependency.'),
    ('chatbot-connection-results.json', 'GET provider production đạt, anonymous chat 401; Python upstream HTTP 403 FAIL; kiểm thử có truy cập DB bị chặn trước khi chạy.'),
    ('chatbot-node-upstream-results.json', 'Node fetch trực tiếp provider nhận HTTP 200 và văn bản giải nghĩa từ; không chứng minh toàn bộ chatbot đăng nhập hoặc parser JSON.'),
]
ids = []
first = max(int(e['id'][2:]) for e in registry['items']) + 1
for i, (name, scope) in enumerate(items, first):
    code = f'MB{i}'
    ids.append(code)
    file = out / name
    registry['items'].append({'id': code, 'path': file.relative_to(root).as_posix(), 'scope': scope, 'inspected_on': '2026-10-10', 'event_date': '2026-10-10', 'sha256': hashlib.sha256(file.read_bytes()).hexdigest()})
journal['entries'].append({
    'id': entry_id, 'kind': 'observed', 'title': 'Đưa cấu hình MWAPI lên Vercel và redeploy production',
    'date': '10/10/2026', 'stage': 'Kết nối AI production', 'status': 'Hoàn tất cấu hình và redeploy; kiểm thử hội thoại đăng nhập bị chặn',
    'participants': 'Chủ dự án yêu cầu đẩy cấu hình lên. Codex cấu hình, triển khai và kiểm tra. Địa điểm và giờ phiên chưa xác nhận.',
    'objective': 'Nối provider MWAPI vào bản Vercel hiện có, giữ khóa ở server và xác minh kết nối.',
    'equipment': 'Windows PowerShell, Vercel CLI 63.1.2, Node 24.19.0 fetch, Python urllib; production adaptiveenglish.vercel.app.',
    'procedure': 'Đọc nhật ký/worklog. Chuyển ba biến MWAPI từ local sang production qua stdin, API key dạng Secret. Redeploy deployment trước bằng CLI; chờ và đọc build log. GET provider công khai, POST anonymous chat, thử upstream câu hỏi từ vựng tổng hợp bằng Python rồi Node. Bộ thử đăng nhập/tạo tài khoản bị auto-review từ chối trước thực thi; chuyển sang kiểm tra không truy cập database.',
    'results': 'Ba env add exit 0; redeploy exit 0; deployment dpl_7NNBJvkqmR8oPdW72QLhdwtWs5ej Ready. Production GET HTTP 200 báo isConfigured=true/provider=mwapi/model=claude-sonnet-4-6; anonymous POST 401. Python upstream 403 FAIL, exit 1; Node fetch upstream 200 có câu trả lời tiếng Việt, exit 0. Chưa kiểm tra parser JSON hoặc hội thoại đăng nhập/lưu lịch sử trên Vercel. Không truy cập credential database hoặc tạo/xóa dữ liệu production. Giữ 9 cảnh báo dependencies đã biết. Log theo các mã minh chứng phiên này.',
    'lessons': 'Cấu hình production chỉ áp dụng sau redeploy. HTTP 403 ở một client không đủ kết luận khóa hỏng khi runtime khác gọi thành công. Kiểm tra provider và upstream riêng không thay thế hội thoại đăng nhập thực tế; quyền deploy không mặc nhiên bao gồm thử ghi/xóa dữ liệu production.',
    'next': 'Người dùng tải lại trang và thử chatbot bằng tài khoản của mình. Nếu cần kiểm thử tự động hội thoại/lịch sử production bằng tài khoản giả, cần cho phép riêng thao tác tạo/dọn dữ liệu kiểm thử. Word chưa kiểm tra phân trang trực quan do thiếu renderer, MB72.',
    'evidence': ids
})
for p, data in [(folder / 'journal.json', journal), (folder / 'evidence.json', registry)]:
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
with (root / 'docs/WORKLOG.md').open('a', encoding='utf-8') as f:
    f.write(f'\n\n## 2026-10-10 — Kết nối MWAPI trên Vercel\n\n- Codex đưa ba biến MWAPI vào production, khóa dạng Secret, redeploy dpl_7NNBJvkqmR8oPdW72QLhdwtWs5ej Ready; không thay mã hoặc dữ liệu người dùng.\n- Provider public HTTP 200 báo mwapi/claude-sonnet-4-6, configured=true; anonymous chat 401. Python upstream 403 FAIL (exit 1), đối chiếu Node fetch 200 có trả lời (exit 0).\n- Auto-review chặn kiểm thử tạo/dọn tài khoản production trước thực thi; chưa thử hội thoại đăng nhập, lưu lịch sử hoặc parser JSON. Không đọc credential database, không có dữ liệu thử cần dọn.\n- Entry {entry_id}: docs/research-journal/journal.json; minh chứng {ids[0]}–{ids[-1]}; báo cáo docs/verification-logs/vercel-20261010/CHATBOT-DEPLOYMENT.md. Word chưa xác minh phân trang trực quan.\n')
print(entry_id, ids)

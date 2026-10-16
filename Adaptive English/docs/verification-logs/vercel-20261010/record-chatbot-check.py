from pathlib import Path
import json, hashlib

root = Path(__file__).resolve().parents[3]
folder = root / 'docs/research-journal'
out = Path(__file__).with_name('chatbot-config-check-20261010.json')
out.write_text(json.dumps({
    'date': '2026-10-10', 'timezone': 'Asia/Saigon',
    'request': 'GET https://adaptiveenglish.vercel.app/api/ai/tutor',
    'command': "Invoke-RestMethod -Uri 'https://adaptiveenglish.vercel.app/api/ai/tutor' -Method Get | ConvertTo-Json -Depth 4",
    'environment': 'Windows PowerShell; public production endpoint',
    'first_attempt': 'BLOCKED: sandbox socket access denied; no response',
    'retry_exit_code': 0,
    'response': {'success': True, 'providerInfo': {'isConfigured': False, 'provider': 'none', 'model': 'none', 'availableModes': ['rule-based', 'demo']}},
    'local_check': 'MWAPI_API_KEY, MWAPI_BASE_URL, MWAPI_MODEL nonempty in local .env.local; values not recorded',
    'limits': 'No provider call, authenticated chatbot test, Vercel environment mutation or deployment performed.'
}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
journal = json.loads((folder / 'journal.json').read_text(encoding='utf-8'))
registry = json.loads((folder / 'evidence.json').read_text(encoding='utf-8'))
entry_id = 'EN-20261010-11'
assert not any(e['id'] == entry_id for e in journal['entries'])
code = 'MB' + str(max(int(e['id'][2:]) for e in registry['items']) + 1)
registry['items'].append({'id': code, 'path': out.relative_to(root).as_posix(), 'scope': 'Kiểm tra trực tiếp endpoint cấu hình AI production và trạng thái có cấu hình MWAPI local; không chứa secret.', 'inspected_on': '2026-10-10', 'event_date': '2026-10-10', 'sha256': hashlib.sha256(out.read_bytes()).hexdigest()})
journal['entries'].append({
    'id': entry_id, 'kind': 'observed', 'title': 'Đối chiếu kết nối chatbot trên Vercel',
    'date': '10/10/2026', 'stage': 'Kiểm tra production', 'status': 'Hoàn tất kiểm tra; chatbot production chưa cấu hình AI',
    'participants': 'Chủ dự án hỏi trạng thái API chatbot; Codex kiểm tra. Giờ và địa điểm chưa xác nhận.',
    'objective': 'Xác minh chatbot đã có provider AI trên bản Vercel hay chưa.',
    'equipment': 'Windows PowerShell, Invoke-RestMethod, mã nguồn aiEngine.ts/studyChat.ts và endpoint production công khai.',
    'procedure': 'Đọc nhật ký và worklog deploy; kiểm tra tên biến local, không in giá trị. GET /api/ai/tutor lần đầu bị sandbox chặn socket; chạy lại với quyền mạng được duyệt, exit 0.',
    'results': 'Endpoint trả success=true, isConfigured=false, provider=none, model=none, availableModes rule-based/demo. Local có ba biến MWAPI không rỗng. Xác nhận bản production hiện chưa cấu hình provider AI. Không gọi model, không kiểm thử chatbot đăng nhập, không thay env Vercel hoặc deploy. Log trong chatbot-config-check-20261010.json.',
    'lessons': 'Deploy web thành công không đồng nghĩa API AI đã được cấu hình; cần kiểm tra provider ở production riêng. Giữ cả lần kiểm tra bị chặn.',
    'next': 'Nối cấu hình MWAPI vào production và redeploy khi thực hiện tác vụ kết nối; kiểm thử một lượt hội thoại thật. Bản Word chưa kiểm tra phân trang trực quan do renderer thiếu soffice.exe đã ghi MB72.',
    'evidence': [code]
})
for path, data in [(folder / 'journal.json', journal), (folder / 'evidence.json', registry)]:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
with (root / 'docs/WORKLOG.md').open('a', encoding='utf-8') as f:
    f.write(f'\n\n## 2026-10-10 — Kiểm tra API chatbot production\n\n- Codex kiểm tra GET /api/ai/tutor trên adaptiveenglish.vercel.app: isConfigured=false, provider=none; local có cấu hình MWAPI. Chưa nối AI lên production.\n- Lần đầu bị sandbox chặn socket; retry mạng được duyệt exit 0. Không gọi AI, thay env hay deploy.\n- Nhật ký {entry_id} tại docs/research-journal/journal.json; minh chứng {code}: docs/verification-logs/vercel-20261010/chatbot-config-check-20261010.json. Word chưa kiểm tra phân trang trực quan (renderer thiếu soffice.exe, MB72).\n')
print(entry_id, code)

from pathlib import Path
import hashlib
import json

root = Path(__file__).resolve().parents[3]
folder = root / 'docs/research-journal'
journal_file = folder / 'journal.json'
evidence_file = folder / 'evidence.json'
journal = json.loads(journal_file.read_text(encoding='utf-8'))
evidence = json.loads(evidence_file.read_text(encoding='utf-8'))
entry_id = 'EN-20261010-08'
assert not any(e['id'] == entry_id for e in journal['entries'])
items = [
 ('docs/verification-logs/auth-local-20261010/RESULTS.md', 'Quan sát, thay đổi và kết quả kiểm thử đăng nhập cục bộ; phân biệt giả thuyết cache/cookie với hai tiến trình đã xác minh.'),
 ('docs/verification-logs/auth-local-20261010/api-results.json', 'Request thực trên bản production và database kiểm thử riêng; hai vai trò, cookie, API me, trang bảo vệ và sai mật khẩu.'),
 ('docs/verification-logs/auth-local-20261010/register-updated.png', 'Ảnh form web chính sau sửa, không chứa nội dung ô tự điền: email xác nhận, nút Tiếp tục và bỏ giải thích vai trò.'),
 ('docs/verification-logs/auth-local-20261010/email-mismatch.png', 'Ảnh môi trường thử: email xác nhận không khớp bị chặn.'),
 ('english-learning-platform/src/lib/authCookie.ts', 'Chính sách cookie: ngoại lệ HTTP loopback cấu hình rõ; giữ Secure trên origin công khai hoặc cấu hình lỗi.'),
 ('english-learning-platform/tests/auth-cookie.test.cjs', 'Ba test đã chạy PASS trong phiên này về loopback, HTTPS, origin giả và cấu hình thiếu/lỗi.'),
 ('english-learning-platform/scripts/start-local.cjs', 'Lệnh khởi động cục bộ đã chạy thành công, chỉ bind localhost:3008 và đặt BASE_URL tương ứng.'),
]
next_number = max(int(e['id'][2:]) for e in evidence['items']) + 1
ids = []
for number, (rel, scope) in enumerate(items, next_number):
    evidence_id = f'MB{number:02}'
    ids.append(evidence_id)
    evidence['items'].append({'id': evidence_id, 'path': rel, 'scope': scope,
      'inspected_on': '2026-10-10', 'event_date': '2026-10-10',
      'sha256': hashlib.sha256((root / rel).read_bytes()).hexdigest()})
journal['entries'].append({
 'id':entry_id, 'kind':'observed', 'title':'Sửa đăng nhập cục bộ và xác nhận email trên form đăng ký',
 'date':'10/10/2026', 'stage':'Hoàn thiện tài khoản và trải nghiệm đăng ký',
 'status':'Hoàn thành phạm vi sửa; chờ chủ dự án thử lại tài khoản thật',
 'participants':'Chủ dự án báo lỗi và xác nhận cần ô nhập lại email; Codex sửa mã, kiểm thử bằng dữ liệu giả và cập nhật nhật ký. Chưa xác nhận giờ/địa điểm.',
 'objective':'Khắc phục bị trả về login, đổi nút thành Tiếp tục, thêm nhập lại email và bỏ câu giải thích vai trò không cần thiết.',
 'equipment':'Next.js 14.2.35 production, Node.js, TypeScript, browser tích hợp, SQLite riêng chỉ có schema; không sao chép .env hay dữ liệu tài khoản thật vào môi trường thử.',
 'procedure':'Quan sát login bị trả về; sửa cookie HTTP loopback và chuyển trang tải document mới. Build và chạy ba test cookie. Sao chép build vào runtime riêng cổng 3019, tạo hai tài khoản giả và chạy API/browser. Phát hiện hai tiến trình khác nhau cổng 3008: localhost nhận bản cũ, 127.0.0.1 nhận bản mới. Dừng tiến trình cũ đúng dự án và chạy launcher chỉ bind localhost. Kiểm tra form mới trên web chính, mở lại login, đăng xuất tài khoản thử và dừng server thử.',
 'results':'Build exit 0; 3/3 test cookie PASS exit 0; API-check exit 0, register/login/me/trang bảo vệ hai vai trò đạt, sai mật khẩu 401, anonymous me 401. Browser học sinh đến home, giáo viên đến dashboard; email khác nhau bị chặn, email khớp khác hoa/thường đăng ký đến onboarding. Form web chính đã có ô nhập lại email và nút Tiếp tục, bỏ câu vai trò. Chưa xác nhận chủ dự án tự đăng nhập lại; không đổi mật khẩu/reset/seed DB chính. Không nghiệm thu lại lỗi recovery/video/ZIP trước đó.',
 'lessons':'HTTP phản hồi trên 127.0.0.1 không chứng minh localhost phục vụ cùng tiến trình; kiểm tra IPv4/IPv6 và nội dung thực trên browser. Cookie và layout cache cần kiểm tra xuyên suốt; chưa tách độc lập đóng góp hai yếu tố này vào lỗi gốc. Nhập lại email chỉ ngăn gõ nhầm, không xác minh hộp thư.',
 'next':'Chủ dự án thử lại tài khoản thật tại localhost:3008. Dùng npm run start:local cho bản build cục bộ. Tiếp tục xử lý các lỗi nghiệm thu trước theo phạm vi riêng. Bản Word chưa kiểm tra phân trang trực quan do thiếu renderer.',
 'evidence':ids,
})
journal_file.write_text(json.dumps(journal, ensure_ascii=False, indent=2)+'\n',encoding='utf-8')
evidence_file.write_text(json.dumps(evidence, ensure_ascii=False, indent=2)+'\n',encoding='utf-8')
with (root / 'docs/WORKLOG.md').open('a', encoding='utf-8') as output:
    output.write('\n\n## 2026-10-10 — Sửa đăng nhập localhost và form đăng ký\n\n'
      '- Codex: thêm nhập lại email theo xác nhận chủ dự án, đổi nút Tiếp tục, bỏ giải thích vai trò; sửa cookie HTTP loopback và tải trang mới sau login/register.\n'
      '- Phát hiện hai server IPv4/IPv6 cùng cổng 3008; localhost vào bản cũ. Đã dừng đúng bản cũ và dùng launcher start:local tại localhost.\n'
      '- Kiểm tra thực: build exit 0, 3/3 test cookie PASS, API và browser hai vai trò/đăng ký email khớp và không khớp đạt trên database riêng. Không reset/seed DB chính. Chưa có xác nhận người dùng đăng nhập lại tài khoản thật.\n'
      '- Báo cáo: docs/verification-logs/auth-local-20261010/RESULTS.md. Nhật ký '+entry_id+'; minh chứng '+ids[0]+'–'+ids[-1]+'. Bản Word chưa kiểm tra phân trang trực quan.\n')
print(entry_id + ': ' + ', '.join(ids))

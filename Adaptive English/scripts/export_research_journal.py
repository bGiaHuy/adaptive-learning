"""Export the research journal while preserving all untouched reference DOCX parts."""
from __future__ import annotations

import argparse
import hashlib
import json
from copy import deepcopy
from pathlib import Path
from zipfile import ZipFile

from lxml import etree

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs' / 'research-journal'
REFERENCE = OUT / 'qa' / 'reference.docx'
WORD = OUT / 'NHAT_KY_NGHIEN_CUU_ADAPTIVE_ENGLISH.docx'
MARKDOWN = OUT / 'NHAT_KY_NGHIEN_CUU.md'
NS = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
W = '{' + NS['w'] + '}'
LABELS = ['1 Mục tiêu cụ thể', '2 Dụng cụ và thiết bị', '3 Tiến trình và quan sát',
          '4 Dữ liệu và kết quả', '5 Sai sót và bài học', '6 Kế hoạch tiếp theo']
FIELDS = ['objective', 'equipment', 'procedure', 'results', 'lessons', 'next']


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load():
    journal = json.loads((OUT / 'journal.json').read_text(encoding='utf-8'))
    evidence = json.loads((OUT / 'evidence.json').read_text(encoding='utf-8'))
    ids = [e['id'] for e in journal['entries']]
    assert len(ids) == len(set(ids)), 'Duplicate journal IDs'
    evidence_ids = [e['id'] for e in evidence['items']]
    assert len(evidence_ids) == len(set(evidence_ids)), 'Duplicate evidence IDs'
    known = set(evidence_ids)
    for entry in journal['entries']:
        for key in ['id', 'kind', 'title', 'date', 'stage', 'status', 'participants', *FIELDS, 'evidence']:
            assert key in entry, f"Missing {key} in {entry.get('id')}"
        assert entry['kind'] in ['observed', 'retrospective']
        assert entry['kind'] != 'observed' or entry['date'], 'Observed entry needs actual date'
        assert set(entry['evidence']).issubset(known), f"Unknown evidence in {entry['id']}"
    assert sha(REFERENCE) == journal['reference_sha256'], 'Reference template changed'
    return journal, evidence


def markdown(journal, evidence):
    lines = ['# Nhật ký nghiên cứu Adaptive English', '', journal['intro'], '',
             '**Người thực hiện, trường và giáo viên hướng dẫn:** Chưa cung cấp.', '',
             '**Thư mục minh chứng trực tuyến:** Chưa cung cấp link; minh chứng hiện lưu trong workspace.', '']
    for e in journal['entries']:
        kind = 'Phiên ghi nhận trực tiếp' if e['kind'] == 'observed' else 'Hạng mục hồi cứu'
        lines += [f"## {e['id']} {e['title']}", '', f"**Loại:** {kind}. **Ngày:** {e['date'] or 'Chưa xác nhận'}. **Trạng thái:** {e['status']}.", '',
                  f"**Giai đoạn:** {e['stage']}. **Giờ và địa điểm:** Chưa xác nhận.", '',
                  f"**Thành viên và vai trò:** {e['participants']}", '']
        for label, field in zip(LABELS, FIELDS):
            lines += [f'### {label}', '', e[field], '']
        lines += ['**Minh chứng:** ' + ', '.join(e['evidence']) + '.', '',
                  'Học sinh ký: ____________________  Giáo viên hoặc người chứng kiến ký: ____________________', '']
    lines += ['## Danh mục minh chứng', '', 'Đường dẫn tính từ thư mục gốc dự án. SHA-256 và thời điểm đối chiếu nằm trong `evidence.json`. Ngày đối chiếu không phải ngày thực hiện nghiên cứu.', '']
    for item in evidence['items']:
        lines += [f"- **{item['id']}**: [{item['path']}](../../{item['path']}). {item['scope']}"]
    lines += ['', '## Quy tắc cập nhật', '',
              'Cập nhật journal.json và evidence.json, chạy scripts/export_research_journal.py rồi --check. Giữ kết quả thất bại và các đính chính; không tự gán ngày hoặc chữ ký. Xem AGENTS.md ở gốc dự án.', '']
    return '\n'.join(lines)


def build_word(journal, evidence):
    with ZipFile(REFERENCE) as z:
        root = etree.fromstring(z.read('word/document.xml'))
        body = root.find('w:body', NS)
        ps = body.findall('w:p', NS)
        # Source: 6 cover paragraphs followed by 15-paragraph, six-section sessions.
        cover = [deepcopy(p) for p in ps[:6]]
        session = [deepcopy(p) for p in ps[6:21]]
        section = deepcopy(body.find('w:sectPr', NS))
        for child in list(body):
            body.remove(child)

        def para(template, value):
            p = deepcopy(template)
            runs = p.findall('w:r', NS)
            props = deepcopy(runs[0].find('w:rPr', NS)) if runs and runs[0].find('w:rPr', NS) is not None else None
            for child in list(p):
                if child.tag != W + 'pPr':
                    p.remove(child)
            run = etree.SubElement(p, W + 'r')
            if props is not None:
                run.append(props)
            text = etree.SubElement(run, W + 't')
            text.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
            text.text = value
            body.append(p)
            return p

        para(cover[0], 'Nhật ký nghiên cứu Adaptive English')
        para(cover[1], 'Nền tảng hỗ trợ tự học tiếng Anh và quản lý học tập')
        para(cover[2], 'Nhật ký được cập nhật liên tục. Gồm các hạng mục hồi cứu và phiên ghi nhận trực tiếp; không quy đổi các hạng mục biên tập thành số buổi đã xác nhận.')
        para(cover[3], journal['intro'])
        para(cover[4], 'Tác giả ____________________    Trường ____________________')
        para(cover[5], 'Giáo viên hướng dẫn ____________________    Link minh chứng trực tuyến: chưa cung cấp.')
        for e in journal['entries']:
            kind = 'Ghi nhận trực tiếp' if e['kind'] == 'observed' else 'Hồi cứu'
            para(session[0], e['id'] + ' ' + e['title'])
            meta = f"{kind}. Ngày: {e['date'] or 'chưa xác nhận'}. Giai đoạn: {e['stage']}. Giờ và địa điểm: chưa xác nhận. Trạng thái: {e['status']}. Thành viên: {e['participants']}"
            para(session[1], meta)
            for i, (label, field) in enumerate(zip(LABELS, FIELDS)):
                para(session[2 + i * 2], label)
                content = e[field]
                if field == 'results':
                    content += ' Minh chứng: ' + ', '.join(e['evidence']) + '.'
                para(session[3 + i * 2], content)
            para(session[14], 'Học sinh ký ____________    Giáo viên hoặc người chứng kiến ký ____________')
        para(session[0], 'Danh mục minh chứng')
        para(session[1], 'Đường dẫn tương đối từ thư mục gốc dự án. Mã băm và thời điểm đối chiếu được lưu trong evidence.json. Việc tồn tại tệp không tự chứng minh hiệu quả học tập hoặc kết quả kiểm thử.')
        for item in evidence['items']:
            para(session[3], f"{item['id']}: {item['path']}. {item['scope']}")
        body.append(section)
        xml = etree.tostring(root, encoding='UTF-8', xml_declaration=True, standalone=True)
        with ZipFile(WORD, 'w') as output:
            for info in z.infolist():
                output.writestr(info, xml if info.filename == 'word/document.xml' else z.read(info.filename))


def check(journal, evidence):
    assert MARKDOWN.read_text(encoding='utf-8') == markdown(journal, evidence), 'Markdown out of sync'
    with ZipFile(REFERENCE) as reference, ZipFile(WORD) as final:
        assert reference.namelist() == final.namelist(), 'Package inventory changed'
        for name in reference.namelist():
            if name != 'word/document.xml':
                assert reference.read(name) == final.read(name), f'Untouched package part changed: {name}'
        root = etree.fromstring(final.read('word/document.xml'))
        text = '\n'.join(root.xpath('//w:t/text()', namespaces=NS))
        for e in journal['entries']:
            for value in [e['id'], e['title'], *[e[f] for f in FIELDS]]:
                assert value in text, f"Missing Word content: {e['id']}"
        assert 'PHONE' not in text and 'YOLO' not in text, 'Reference topic leaked'
        assert etree.tostring(root.find('w:body/w:sectPr', NS)) == etree.tostring(etree.fromstring(reference.read('word/document.xml')).find('w:body/w:sectPr', NS)), 'Page geometry changed'
    warnings = []
    for item in evidence['items']:
        path = ROOT / item['path']
        if not path.is_file():
            warnings.append(item['id'] + ': source missing')
        elif sha(path) != item['sha256']:
            warnings.append(item['id'] + ': source changed since recorded snapshot')
    print(json.dumps({'entries': len(journal['entries']), 'evidence_items': len(evidence['items']),
                      'content_and_package_check': 'PASS', 'source_warnings': warnings,
                      'visual_pagination': 'NOT_VERIFIED'}, ensure_ascii=True))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    journal, evidence = load()
    if not args.check:
        MARKDOWN.write_text(markdown(journal, evidence), encoding='utf-8')
        build_word(journal, evidence)
    check(journal, evidence)

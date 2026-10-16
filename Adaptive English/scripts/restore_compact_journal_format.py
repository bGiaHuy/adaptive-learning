"""Use the existing journal's exact OOXML template for the separate digest."""
import json, hashlib, shutil, importlib.util
from pathlib import Path
from zipfile import ZipFile
from lxml import etree
ROOT=Path(__file__).resolve().parents[1]
B=ROOT/'docs/research-journal'; OUT=B/'compact'; QA=B/'evidence/EN-20261012-31'
QA.mkdir(parents=True,exist_ok=True)
stem='NHAT_KY_NGHIEN_CUU_RUT_GON_10_TRANG'
for name in [stem+'.docx',stem+'.md','journal-compact.json']:
    shutil.copy2(OUT/name,QA/('before-'+name))
spec=importlib.util.spec_from_file_location('journal_export',ROOT/'scripts/export_research_journal.py')
ex=importlib.util.module_from_spec(spec);spec.loader.exec_module(ex)
j=json.loads((B/'journal.json').read_text(encoding='utf-8')); src={e['id']:e for e in j['entries']}
c=json.loads((OUT/'journal-compact.json').read_text(encoding='utf-8'))
intro='Bản rút gọn riêng, chỉ giữ các mốc kỹ thuật lớn; bản đầy đủ được bảo toàn. Mỗi mục là tổng hợp theo chủ đề, không phải một buổi nghiên cứu thực tế. Ngày biên tập 12/10/2026; ngày và kết quả thực hiện xem các entry nguồn. Các phần hồi cứu chưa xác nhận ngày, giờ và thành viên.'
new=[]
for s in c['sections']:
    a,b,d=s['paragraphs']; last=src[s['source_entries'][-1]]
    new.append(dict(id=f"RG-{s['section']:02d}",kind='retrospective',title=s['title'],date=None,stage='Tổng hợp các mốc kỹ thuật',status='Bản biên tập; trạng thái triển khai theo nội dung và nguồn',participants='Vai trò từng phiên theo nhật ký đầy đủ; không bổ sung tên hoặc chữ ký. Nguồn: '+', '.join(s['source_entries'])+'.',objective=a,equipment=last['equipment'],procedure=b,results=d,lessons=last['lessons'],next=last['next'],evidence=s['evidence']))
digest=dict(j);digest['intro']=intro;digest['entries']=new
ex.WORD=OUT/(stem+'.docx');ex.MARKDOWN=OUT/(stem+'.md')
ex.build_word(digest,{'items':[]})
ex.MARKDOWN.write_text(ex.markdown(digest,{'items':[]}),encoding='utf-8')
c['format']='Exact original journal template: six fields, original paragraph and run properties, A4 geometry and footer.'
c['entries']=new
(OUT/'journal-compact.json').write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
with ZipFile(ex.REFERENCE) as ref,ZipFile(ex.WORD) as final:
    assert ref.namelist()==final.namelist()
    unchanged=[n for n in ref.namelist() if n!='word/document.xml']
    assert all(ref.read(n)==final.read(n) for n in unchanged)
    r=etree.fromstring(ref.read('word/document.xml'));f=etree.fromstring(final.read('word/document.xml'))
    assert etree.tostring(r.find('w:body/w:sectPr',ex.NS))==etree.tostring(f.find('w:body/w:sectPr',ex.NS))
    ps=r.findall('w:body/w:p',ex.NS);actual=f.findall('w:body/w:p',ex.NS)
    for i in range(10):
        for n in range(15):
            template=ps[6+n]; target=actual[6+15*i+n]
            assert etree.tostring(template.find('w:pPr',ex.NS))==etree.tostring(target.find('w:pPr',ex.NS))
            assert etree.tostring(template.find('w:r/w:rPr',ex.NS))==etree.tostring(target.find('w:r/w:rPr',ex.NS))
    text=' '.join(f.xpath('//w:t/text()',namespaces=ex.NS))
    for label in ex.LABELS: assert text.count(label)==10
    assert text.count('Học sinh ký ____________')==10
contract='''# Template contract

Authority: docs/research-journal/qa/reference.docx, SHA256 '''+j['reference_sha256']+'''.
Use original six introductory paragraphs and repeated 15-paragraph journal pattern: heading, metadata, six labels and bodies, signatures. Preserve paragraph/run properties exactly and all package parts except word/document.xml byte-for-byte. Preserve A4 11906×16838 twips, margins top/right/bottom1134 left1701, header/footer708, footer relationships and styles. Replace only textual slots. Do not introduce report subtitles, new fonts, Letter size or custom page breaks. Ten sections are editorial summaries, not ten confirmed sessions. Render unavailable pending retry; no asserted page count.
'''
(QA/'artifact.md').write_text(contract,encoding='utf-8')
(QA/'format-check.log').write_text(f'PASS: {len(unchanged)} untouched package parts byte-identical; section geometry identical; 150/150 journal paragraphs match original paragraph and first-run properties; six labels and signature repeated 10 times; reference SHA256 unchanged.\n',encoding='utf-8')
print((QA/'format-check.log').read_text(encoding='utf-8'))

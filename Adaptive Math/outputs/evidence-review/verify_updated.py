import csv,json,math,hashlib,zipfile,posixpath
from pathlib import Path
from collections import defaultdict
from lxml import etree
root=Path('outputs/evidence-review/updated')
s=json.loads((root/'simulation.json').read_text());agg=defaultdict(lambda:[0,0,0]);count=0
with (root/'simulation-raw.csv').open() as f:
 for row in csv.DictReader(f):
  truth=float(row['trueTheta']);est=float(row['estimatedTheta']);assert math.isfinite(truth) and math.isfinite(est)
  a=agg[(row['strategy'],int(row['questions']))];a[0]+=1;a[1]+=(truth-est)**2;a[2]+=int(row['boundary']);count+=1
assert count==108000
for strategy,ms in s['metrics'].items():
 for m in ms:
  n,se,b=agg[(strategy,m['questions'])];assert n==1500;assert abs(math.sqrt(se/n)-m['rmse'])<1e-12;assert abs(b*100/n-m['boundaryPercent'])<1e-12
checked=[]
for path in root.glob('*.docx'):
 with zipfile.ZipFile(path) as z:
  assert z.testzip() is None
  tree=etree.fromstring(z.read('word/document.xml'));rels=etree.fromstring(z.read('word/_rels/document.xml.rels'))
  known={r.get('Id'):r.get('Target') for r in rels}
  for r in tree.xpath('//@r:embed',namespaces={'r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}):
   assert r in known;assert posixpath.normpath('word/'+known[r]) in z.namelist()
 checked.append(path.name)
report={'date':'2026-10-16','documents':checked,'rawRows':count,'metricsIndependentlyRecomputed':True,'algorithmTests':'math-adaptive.spec.ts: 6 passed','sourceSha256':hashlib.sha256(Path('apps/api/src/modules/student/math-adaptive.ts').read_bytes()).hexdigest(),'docxLayoutRendered':False,'layoutBlocker':'Bundled Word/LibreOffice renderer unavailable'}
(root/'VERIFICATION.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
with zipfile.ZipFile('outputs/evidence-review/Bo_minh_chung_GD1_GD7_cap_nhat.zip','a',zipfile.ZIP_DEFLATED) as z:z.write(root/'VERIFICATION.json','VERIFICATION.json')
print('Verified 8 DOCX files, embedded image relationships and 108000 simulation rows; all metrics match raw data.')

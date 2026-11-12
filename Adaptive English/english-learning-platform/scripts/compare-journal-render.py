"""Compare journal page rasters, masking only the verified page-number area.

Unchanged content can inherit the earlier documented overview review; changed
pages are collected for fresh visual inspection. This never asserts typography
acceptance or edits a DOCX, reference, or source evidence.
"""
import hashlib
import json
from pathlib import Path
import sys
from PIL import Image, ImageDraw

previous=Path(sys.argv[1]);current=Path(sys.argv[2])
mask=(380,1090,490,1115)
def digest(file):
 image=Image.open(file).convert('RGB')
 if image.size!=(827,1170):raise RuntimeError('Unexpected page raster size; review footer mask before comparing')
 ImageDraw.Draw(image).rectangle(mask,fill='white')
 return hashlib.sha256(image.tobytes()).hexdigest()
prior={digest(file):int(file.stem.split('-')[-1])for file in previous.glob('page-*.png')}
matched=[];changed=[]
for file in sorted(current.glob('page-*.png'),key=lambda file:int(file.stem.split('-')[-1])):
 number=int(file.stem.split('-')[-1]);key=digest(file)
 if key in prior:matched.append({'page':number,'priorReviewedPage':prior[key]})
 else:changed.append(number)
for start in range(0,len(changed),9):
 sheet=Image.new('RGB',(1260,1830),'#dbe0e6');drawing=ImageDraw.Draw(sheet)
 for offset,number in enumerate(changed[start:start+9]):
  image=Image.open(current/f'page-{number}.png').convert('RGB');image.thumbnail((410,580))
  sheet.paste(image,(offset%3*420+(420-image.width)//2,offset//3*610+20))
  drawing.text((offset%3*420+10,offset//3*610+3),f'Page {number}',fill='black')
 sheet.save(current/f'changed-review-{start//9+1}.png')
report={'footerMask':mask,'previousRender':str(previous),'matchedPriorReviewedPages':matched,'changedPages':changed,'visualReview':'Changed-page contact sheets still require actual visual inspection. A comparison alone is not acceptance.'}
(current/'page-comparison.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps({'matched':len(matched),'changed':changed,'changedReviewSheets':(len(changed)+8)//9}))

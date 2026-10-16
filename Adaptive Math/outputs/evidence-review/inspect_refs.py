from pathlib import Path
from zipfile import ZipFile
from docx import Document
from PIL import Image,ImageOps,ImageDraw
root=Path('outputs/evidence-review/references')
for p in sorted(root.glob('stage-*.docx')):
 d=Document(p);print(p.name,'images',len(d.inline_shapes))
 with ZipFile(p) as z:
  imgs=[]
  for n in z.namelist():
   if n.startswith('word/media/'):
    out=root/(p.stem+'-'+Path(n).name);out.write_bytes(z.read(n))
    try:
     im=Image.open(out).convert('RGB');im.thumbnail((600,360));imgs.append((out.name,im))
    except:pass
  if imgs:
   sheet=Image.new('RGB',(620,400*len(imgs)),'#ddd');draw=ImageDraw.Draw(sheet)
   for i,(name,im) in enumerate(imgs):draw.text((10,i*400+10),name,fill='black');sheet.paste(im,(10,i*400+35))
   sheet.save(root/(p.stem+'-sheet.png'))

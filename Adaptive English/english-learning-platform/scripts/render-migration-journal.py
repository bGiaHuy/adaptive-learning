"""Use the packaged DOCX renderer with the available Windows PDF rasterizer.

The packaged renderer expects Poppler/pdf2image, absent on this workstation.
This read-only adapter supplies the same rasterizer interface using PyMuPDF.
LibreOffice conversion, renderable-DOCX handling, and page naming stay in the
packaged render_docx.py. The original DOCX/reference are never modified here.
"""
import json
from pathlib import Path
import runpy
import sys
import types
import pymupdf
from PIL import Image, ImageDraw

app=Path(__file__).resolve().parents[1]
root=app.parent
output=app/(sys.argv[1] if len(sys.argv)>1 else '.artifacts/d1-runtime-lab/journal-render')
output.mkdir(parents=True,exist_ok=True)
renderer=Path('C:/Users/Administrator/.codex-account-b/plugins/cache/openai-primary-runtime/documents/26.1025.11240/skills/documents/render_docx.py')
document=root/'docs/research-journal/NHAT_KY_NGHIEN_CUU_ADAPTIVE_ENGLISH.docx'

def pdfinfo_from_path(file,**options):
    with pymupdf.open(file) as pdf:
        page=pdf[0]
        return {'Pages':len(pdf),'Page size':f'{page.rect.width} x {page.rect.height} pts'}

def convert_from_path(file,dpi=100,output_folder=None,output_file='page',paths_only=False,**options):
    paths=[]
    with pymupdf.open(file) as pdf:
        for index,page in enumerate(pdf,1):
            filename=Path(output_folder)/f'{output_file}-{index}.png'
            page.get_pixmap(matrix=pymupdf.Matrix(dpi/72,dpi/72),alpha=False).save(filename)
            paths.append(str(filename))
    return paths if paths_only else [Image.open(file) for file in paths]

shim=types.ModuleType('pdf2image')
shim.pdfinfo_from_path=pdfinfo_from_path
shim.convert_from_path=convert_from_path
sys.modules['pdf2image']=shim
sys.argv=[str(renderer),str(document),'--output_dir',str(output),'--dpi','100','--emit_pdf','--verbose']
runpy.run_path(str(renderer),run_name='__main__')
pages=sorted(output.glob('page-*.png'),key=lambda file:int(file.stem.split('-')[-1]))
pdf_file=output/(document.stem+'.pdf')
outside=[]
with pymupdf.open(pdf_file) as pdf:
    for index,page in enumerate(pdf,1):
        for block in page.get_text('blocks'):
            if block[0]<-1 or block[1]<-1 or block[2]>page.rect.width+1 or block[3]>page.rect.height+1:
                outside.append({'page':index,'bounds':list(block[:4])})
contacts=[]
for start in range(0,len(pages),9):
    sheet=Image.new('RGB',(1260,1830),'#dbe0e6')
    drawing=ImageDraw.Draw(sheet)
    for offset,file in enumerate(pages[start:start+9]):
        image=Image.open(file).convert('RGB')
        image.thumbnail((410,580))
        x=(offset%3)*420+(420-image.width)//2
        y=(offset//3)*610+20
        sheet.paste(image,(x,y))
        drawing.text(((offset%3)*420+10,(offset//3)*610+3),f'Page {start+offset+1}',fill='black')
    filename=output/f'contact-{start//9+1:02}.png'
    sheet.save(filename)
    contacts.append(filename.name)
manifest={'renderer':'Packaged render_docx.py; native LibreOffice; PyMuPDF rasterizer compatibility adapter because Poppler/pdf2image are absent','pages':len(pages),'contacts':contacts,'outOfPageTextBlocks':outside,'visualReview':'Pending; rendering and bounds checks are not a complete visual acceptance claim'}
(output/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print(json.dumps({'pages':len(pages),'contactSheets':len(contacts),'outOfPageTextBlocks':len(outside)}))

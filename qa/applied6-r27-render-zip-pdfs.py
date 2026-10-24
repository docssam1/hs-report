#!/usr/bin/env python3
"""Extract final r27 ZIP PDFs, render every page, and make a review index."""
import hashlib,io,json,subprocess
from pathlib import Path
from zipfile import ZipFile
from pypdf import PdfReader
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'.private-work/hw-expansion-20261023/hw6'
OUT=BASE/'r27-final-pdf-review';OUT.mkdir(parents=True,exist_ok=True)
sources={
 'q04':BASE/'q04-output-qa/applied6-q04.zip',
 'q06':BASE/'q06-output-qa/applied6-q06.zip',
 'q15':BASE/'q15-output-qa/applied6-q15.zip',
 'q29':BASE/'q29-30-output-qa/q29/applied6-q29.zip',
 'q30':BASE/'q29-30-output-qa/q30/applied6-q30.zip',
}
records=[];images=[]
for key,zpath in sources.items():
 target=OUT/key;target.mkdir(exist_ok=True)
 with ZipFile(zpath) as z:
  for label,filename in [('questions','문제.pdf'),('solutions','답안과상세풀이.pdf')]:
   raw=z.read(filename); pdf=target/(label+'.pdf');pdf.write_bytes(raw)
   pages=len(PdfReader(io.BytesIO(raw)).pages)
   prefix=target/(label+'-page')
   subprocess.run(['/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm','-png','-r','120',str(pdf),str(prefix)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
   files=sorted(target.glob(label+'-page-*.png'))
   assert len(files)==pages,(key,label,pages,len(files))
   for pageno,p in enumerate(files,1):
    im=Image.open(p).convert('RGB');images.append((f'{key} {label} p{pageno}/{pages}',im.copy()))
   records.append({'source':key,'pdf':filename,'pdfBytes':len(raw),'pdfSha256':hashlib.sha256(raw).hexdigest(),'pages':pages,'renderedPages':len(files),'allPagesRendered':True})
# Keep every page image separate for full-resolution review and build a labeled
# contact sheet as a navigation aid; the sheet is not used instead of page review.
thumb_w=450;thumb_h=638;label_h=26;cols=3;rows=(len(images)+cols-1)//cols
sheet=Image.new('RGB',(cols*thumb_w,rows*(thumb_h+label_h)),'#eee9dd');draw=ImageDraw.Draw(sheet)
for i,(label,im) in enumerate(images):
 im.thumbnail((thumb_w-12,thumb_h-12))
 x=(i%cols)*thumb_w+6;y=(i//cols)*(thumb_h+label_h)+label_h
 sheet.paste(im,(x,y));draw.text((x,i//cols*(thumb_h+label_h)+5),label,fill='#191511')
sheet.save(OUT/'contact-sheet.png')
(OUT/'render-inventory.json').write_text(json.dumps({'version':'20261024-applied6-expansion-r27','sources':records,'totalPages':len(images),'passed':all(x['pages']==x['renderedPages'] for x in records)},ensure_ascii=False,indent=2)+'\n')
print(f'PASS final ZIP PDFs: rendered every page; {len(images)} pages across {len(sources)} ZIPs.')

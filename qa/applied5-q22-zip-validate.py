#!/usr/bin/env python3
"""Inspect the downloaded Applied 5 Q22 nine-question ZIP, including its PDFs."""
import csv,hashlib,io,json,re,zipfile
from pathlib import Path
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.private-work/hw-expansion-20261023/hw5/q22-r16'
ZIP=WORK/'applied5-q22-nine-variants-r16.zip';DATA=json.loads((ROOT/'bank/data/applied5-expanded.json').read_text())
expected={'문제.pdf','답안과상세풀이.pdf','문제.html','답안과상세풀이.html','빠른정답.csv','문항목록.json','검수기록.json'}
with zipfile.ZipFile(ZIP) as z:
 assert set(z.namelist())==expected
 listing=json.loads(z.read('문항목록.json'));review=json.loads(z.read('검수기록.json'));items=listing['items'];ids=[x['id'] for x in items]
 assert listing['count']==review['count']==len(items)==9 and ids==[f'applied5-q22-v{i}' for i in range(1,10)]
 assert ids==[x['id'] for x in DATA['items'] if x['sourceNo']==22]
 q=z.read('문제.html').decode();a=z.read('답안과상세풀이.html').decode()
 assert all(i in q and i in a for i in ids)
 assert all(str(x['answerParts'][0]) in a and x['learningLocation'] in a and x['learningPoint'] in a for x in items)
 imgs=re.findall(r'<img\b[^>]*\bsrc=["\']([^"\']+)',q)
 assert len(imgs)==9 and all(s.startswith('data:image/svg+xml;base64,') for s in imgs)
 rows=list(csv.reader(io.StringIO(z.read('빠른정답.csv').decode('utf-8-sig'))));assert len(rows)==10
 qp=PdfReader(io.BytesIO(z.read('문제.pdf')));ap=PdfReader(io.BytesIO(z.read('답안과상세풀이.pdf')))
 assert len(qp.pages)==3 and len(ap.pages)==3
 for page in [*qp.pages,*ap.pages]: assert float(page.mediabox.width)>590 and float(page.mediabox.height)>830
 assert all(x in a for x in ['796, 524, 318','120, 643, 875'])
result={'result':'PASS','zip':str(ZIP.relative_to(ROOT)),'bytes':ZIP.stat().st_size,'sha256':hashlib.sha256(ZIP.read_bytes()).hexdigest(),
 'items':9,'questionPdfPages':len(qp.pages),'solutionPdfPages':len(ap.pages),'embeddedSvgFigures':len(imgs),'quickAnswerRows':len(rows),
 'answerDetailsAndLearningLinks':True,'allFilesPresent':True}
(WORK/'q22-zip-validation-r16.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False))

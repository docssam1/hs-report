#!/usr/bin/env python3
"""Check Q23 selected ZIP files, original diagram fidelity, solutions and links."""
import base64,csv,hashlib,io,json,re,zipfile
from pathlib import Path
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.private-work/hw-expansion-20261023/hw5/output-qa-r18'
ZIP=WORK/'applied5-q23-9.zip';DATA=json.loads((ROOT/'bank/data/applied5-expanded.json').read_text());items=[x for x in DATA['items'] if x['sourceNo']==23]
asset=(ROOT/'bank/assets/applied5/q23-source-cards.png').read_bytes()
with zipfile.ZipFile(ZIP) as z:
 assert set(z.namelist())=={'문제.pdf','답안과상세풀이.pdf','문제.html','답안과상세풀이.html','빠른정답.csv','문항목록.json','검수기록.json'}
 listing=json.loads(z.read('문항목록.json'));review=json.loads(z.read('검수기록.json'))
 assert listing['count']==review['count']==9 and [x['id'] for x in listing['items']]==[x['id'] for x in items]
 assert review['questionPdfPages']==3 and review['solutionPdfPages']==5 and review['sourceGradeMutation'] is False
 q=z.read('문제.html').decode();a=z.read('답안과상세풀이.html').decode()
 encoded=re.findall(r'<img\b[^>]*\bsrc=["\']data:image/png;base64,([^"\']+)',q)
 assert len(encoded)==9 and all(base64.b64decode(e)==asset for e in encoded)
 for x in items:
  assert x['id'] in q and x['id'] in a and x['answer'] in a
  assert x['learningLocation'] in a and x['learningPoint'] in a
  assert all(str(n) in a for n in x['answerParts'])
 rows=list(csv.reader(io.StringIO(z.read('빠른정답.csv').decode('utf-8-sig'))));assert len(rows)==10
 qp=PdfReader(io.BytesIO(z.read('문제.pdf')));ap=PdfReader(io.BytesIO(z.read('답안과상세풀이.pdf')))
 assert len(qp.pages)==3 and len(ap.pages)==5
 for pg in [*qp.pages,*ap.pages]:assert float(pg.mediabox.width)>590 and float(pg.mediabox.height)>830
result={'result':'PASS','zip':str(ZIP.relative_to(ROOT)),'bytes':ZIP.stat().st_size,'sha256':hashlib.sha256(ZIP.read_bytes()).hexdigest(),'items':9,'questionPdfPages':3,'solutionPdfPages':5,'embeddedOriginalCrops':9,'pixelBytesMatchAsset':True,'answersAndLearningLinks':True,'sevenFilesPresent':True}
(WORK/'q23-zip-validation-r18.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps(result,ensure_ascii=False))

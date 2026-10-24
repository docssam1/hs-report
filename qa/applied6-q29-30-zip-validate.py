#!/usr/bin/env python3
"""Inspect the actual generated Applied 6 Q29/Q30 ZIPs and every listed item."""
import base64,hashlib,io,json,re,zipfile
from pathlib import Path
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1]; WORK=ROOT/'.private-work/hw-expansion-20261023/hw6/q29-30-output-qa'
D=json.loads((ROOT/'bank/data/applied6-expanded.json').read_text()); image=(ROOT/'bank/assets/applied6/q29-original-grid.png').read_bytes()
result={'sourceFigureSha256':hashlib.sha256(image).hexdigest(),'round':6,'sources':{}}
expected={'문제.pdf','답안과상세풀이.pdf','문제.html','답안과상세풀이.html','빠른정답.csv','문항목록.json','검수기록.json'}
for no in (29,30):
 zpath=WORK/f'q{no}'/f'applied6-q{no}.zip'; items=[x for x in D['items'] if x['sourceNo']==no]; assert len(items)==9
 with zipfile.ZipFile(zpath) as z:
  assert set(z.namelist())==expected
  listing=json.loads(z.read('문항목록.json')); review=json.loads(z.read('검수기록.json'))
  ids=[x['id'] for x in items]; assert listing['count']==9 and [x['id'] for x in listing['items']]==ids
  assert review['count']==9 and review['selectedIds']==ids
  qhtml=z.read('문제.html').decode('utf-8'); ahtml=z.read('답안과상세풀이.html').decode('utf-8')
  assert qhtml.count('class="question"')==9 and ahtml.count('class="solution"')==9
  text=' '.join(re.sub(r'<[^>]*>',' ',qhtml).split()); sol=' '.join(re.sub(r'<[^>]*>',' ',ahtml).split())
  for x in items:
   assert x['text'] in text, x['id']
   assert x['solution'] in sol, x['id']
  if no==29:
   uri='data:image/png;base64,'+base64.b64encode(image).decode()
   assert uri in qhtml and all(str(n) in qhtml for n in [70,55,62,54,57,48,66,46,67,43])
   assert all(x.get('acceptedAnswerParts') for x in items)
  qp=PdfReader(io.BytesIO(z.read('문제.pdf'))); ap=PdfReader(io.BytesIO(z.read('답안과상세풀이.pdf')))
  assert len(qp.pages)>=2 and len(ap.pages)>=2
  reviewdir=WORK/f'q{no}'/'zip-review';reviewdir.mkdir(exist_ok=True)
  (reviewdir/'문제.pdf').write_bytes(z.read('문제.pdf'));(reviewdir/'답안과상세풀이.pdf').write_bytes(z.read('답안과상세풀이.pdf'))
 result['sources'][str(no)]={'zipBytes':zpath.stat().st_size,'zipSha256':hashlib.sha256(zpath.read_bytes()).hexdigest(),'entries':7,'itemIds':ids,'questionPdfPages':len(qp.pages),'solutionPdfPages':len(ap.pages),'allQuestionAndSolutionTextPresent':True,'sourceFigurePixelBytesEmbedded':no==29,'passed':True}
(WORK/'zip-validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('PASS actual ZIPs: Q29 9 questions + detailed answers; Q30 9 questions + detailed answers; 7 files each; source image pixels match.')
for no,x in result['sources'].items():print(f"Q{no}: {x['questionPdfPages']} question pages, {x['solutionPdfPages']} solution pages, {x['zipBytes']} bytes, SHA-256 {x['zipSha256']}")

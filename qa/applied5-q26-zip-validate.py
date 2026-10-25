#!/usr/bin/env python3
"""Validate Applied 5 Q26 selected ZIP contents and answer/learning links."""
import csv,hashlib,io,json,re,zipfile
from pathlib import Path
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.private-work/hw-expansion-20261023/hw5/output-qa-r17'
ZIP=WORK/'applied5-q26-9.zip'
DATA=json.loads((ROOT/'bank/data/applied5-expanded.json').read_text())
items=[x for x in DATA['items'] if x['sourceNo']==26]
assert len(items)==9
with zipfile.ZipFile(ZIP) as z:
 assert set(z.namelist())=={'문제.pdf','답안과상세풀이.pdf','문제.html','답안과상세풀이.html','빠른정답.csv','문항목록.json','검수기록.json'}
 listing=json.loads(z.read('문항목록.json'));review=json.loads(z.read('검수기록.json'))
 assert listing['count']==review['count']==9 and [x['id'] for x in listing['items']]==[x['id'] for x in items]
 assert review['questionPdfPages']==3 and review['solutionPdfPages']==3 and review['sourceGradeMutation'] is False
 q=z.read('문제.html').decode();a=z.read('답안과상세풀이.html').decode()
 for x in items:
  assert x['id'] in q and x['id'] in a and x['answer'] in a
  assert x['learningPoint'] in a and x['learningLocation'] in a
  for answer in x['answerParts']: assert str(answer) in a
 assert not re.search(r'<img\b',q)
 rows=list(csv.reader(io.StringIO(z.read('빠른정답.csv').decode('utf-8-sig'))));assert len(rows)==10
 qp=PdfReader(io.BytesIO(z.read('문제.pdf')));ap=PdfReader(io.BytesIO(z.read('답안과상세풀이.pdf')))
 assert len(qp.pages)==3 and len(ap.pages)==3
 for page in [*qp.pages,*ap.pages]:
  box=page.mediabox;assert float(box.width)>590 and float(box.height)>830
result={'result':'PASS','zip':str(ZIP.relative_to(ROOT)),'bytes':ZIP.stat().st_size,'sha256':hashlib.sha256(ZIP.read_bytes()).hexdigest(),'items':9,'questionPdfPages':3,'solutionPdfPages':3,'answersAndLearningLinks':True,'noFigureNeededForSource':True,'sevenFilesPresent':True}
(WORK/'q26-zip-validation-r17.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False))

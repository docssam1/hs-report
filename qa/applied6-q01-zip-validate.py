#!/usr/bin/env python3
"""Check actual Q1 ZIP contents, all solutions, and exact source figure embedding."""
import base64,hashlib,io,json,re,zipfile
from pathlib import Path
from pypdf import PdfReader
R=Path(__file__).resolve().parents[1];W=R/'.private-work/hw-expansion-20261023/hw6/q01-output-qa';D=json.loads((R/'bank/data/applied6-expanded.json').read_text());items=[x for x in D['items'] if x['sourceNo']==1];Z=W/'applied6-q01.zip'; expected={'문제.pdf','답안과상세풀이.pdf','문제.html','답안과상세풀이.html','빠른정답.csv','문항목록.json','검수기록.json'};img=(R/'bank/assets/applied6/q01-original-stack.png').read_bytes()
with zipfile.ZipFile(Z) as z:
 assert set(z.namelist())==expected
 listing=json.loads(z.read('문항목록.json'));review=json.loads(z.read('검수기록.json'));ids=[x['id'] for x in items]
 assert listing['count']==9 and [x['id'] for x in listing['items']]==ids and review['selectedIds']==ids
 qhtml=z.read('문제.html').decode('utf-8');ahtml=z.read('답안과상세풀이.html').decode('utf-8')
 assert qhtml.count('class="question"')==9 and ahtml.count('class="solution"')==9
 assert 'data:image/png;base64,'+base64.b64encode(img).decode() in qhtml
 qt=' '.join(re.sub(r'<[^>]+>',' ',qhtml).split());at=' '.join(re.sub(r'<[^>]+>',' ',ahtml).split())
 for x in items:assert x['text'] in qt and x['solution'] in at
 qp=PdfReader(io.BytesIO(z.read('문제.pdf')));ap=PdfReader(io.BytesIO(z.read('답안과상세풀이.pdf')))
 assert len(qp.pages)>=2 and len(ap.pages)>=2
 (W/'questions.pdf').write_bytes(z.read('문제.pdf'));(W/'solutions.pdf').write_bytes(z.read('답안과상세풀이.pdf'))
result={'zipBytes':Z.stat().st_size,'zipSha256':hashlib.sha256(Z.read_bytes()).hexdigest(),'entries':7,'questions':9,'questionPdfPages':len(qp.pages),'solutionPdfPages':len(ap.pages),'sourceImagePixelsEmbeddedUnchanged':True,'allSolutionsPresent':True,'passed':True}
(W/'zip-validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('PASS Q1 actual ZIP: 7 files, 9 aligned questions and solutions, unchanged source image embedded.')
print(result)

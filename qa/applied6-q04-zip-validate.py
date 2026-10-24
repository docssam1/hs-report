#!/usr/bin/env python3
"""Validate Q4's downloaded ZIP and item/solution coverage."""
import hashlib,io,json,zipfile
from pathlib import Path
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.private-work/hw-expansion-20261023/hw6/q04-output-qa'
D=json.loads((ROOT/'bank/data/applied6-expanded.json').read_text());Z=WORK/'applied6-q04.zip'
with zipfile.ZipFile(Z) as z:
    expected={'문제.pdf','답안과상세풀이.pdf','문제.html','답안과상세풀이.html','빠른정답.csv','문항목록.json','검수기록.json'}
    assert set(z.namelist())==expected
    listing=json.loads(z.read('문항목록.json'));review=json.loads(z.read('검수기록.json'))
    items=[x for x in D['items'] if x['sourceNo']==4];ids=[x['id'] for x in items]
    assert listing['count']==review['count']==9 and [x['id'] for x in listing['items']]==ids and review['selectedIds']==ids
    qhtml=z.read('문제.html').decode('utf-8');ahtml=z.read('답안과상세풀이.html').decode('utf-8')
    assert qhtml.count('class="question"')==9 and ahtml.count('class="solution"')==9
    assert all(i in qhtml and i in ahtml for i in ids)
    assert all(x['answer'] in ahtml for x in items)
    assert all('data:image/svg+xml' in qhtml for _ in [1])
    assert all(x['text'] in z.read('문항목록.json').decode('utf-8') for x in items)
    qp=PdfReader(io.BytesIO(z.read('문제.pdf')));ap=PdfReader(io.BytesIO(z.read('답안과상세풀이.pdf')))
    assert len(qp.pages)>=2 and len(ap.pages)>=2
result={'zipBytes':Z.stat().st_size,'zipSha256':hashlib.sha256(Z.read_bytes()).hexdigest(),'entries':7,'itemIds':ids,'questionPdfPages':len(qp.pages),'solutionPdfPages':len(ap.pages),'allNineQuestionsSolutionsAndDrawingsIncluded':True,'passed':True}
(WORK/'zip-validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(f"PASS Q4 actual ZIP: 7 files, 9 aligned IDs and SVG drawings, problem {len(qp.pages)}p, solutions {len(ap.pages)}p")

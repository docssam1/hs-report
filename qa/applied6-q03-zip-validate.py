#!/usr/bin/env python3
"""Verify the actual Applied 6 Q3 ZIP, aligned IDs, full solutions, and rendered pages."""
import hashlib,io,json,zipfile,re,html
from pathlib import Path
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.private-work/hw-expansion-20261023/hw6/q03-output-qa'
DATA=json.loads((ROOT/'bank/data/applied6-expanded.json').read_text())
items=[x for x in DATA['items'] if x['sourceNo']==3]
Z=WORK/'applied6-q03.zip'
expected={'문제.pdf','답안과상세풀이.pdf','문제.html','답안과상세풀이.html','빠른정답.csv','문항목록.json','검수기록.json'}
with zipfile.ZipFile(Z) as z:
    names=set(z.namelist());assert names==expected,names
    listing=json.loads(z.read('문항목록.json'));review=json.loads(z.read('검수기록.json'))
    ids=[x['id'] for x in items]; listed=[x['id'] for x in listing['items']]
    assert listing['count']==9 and listed==ids
    assert review['selectedIds']==ids and review['count']==9
    assert {'문제.pdf','답안과상세풀이.pdf'}<=set(review['includes'])
    for html_name in ['문제.html','답안과상세풀이.html']:
        body=z.read(html_name).decode('utf-8');assert all(i in body for i in ids)
    qtext=' '.join(html.unescape(re.sub(r'<[^>]+>',' ',z.read('문제.html').decode())).split())
    atext=' '.join(html.unescape(re.sub(r'<[^>]+>',' ',z.read('답안과상세풀이.html').decode())).split())
    for x in items:
        assert ' '.join(x['text'].split()) in qtext
        assert ' '.join(x['solution'].split()) in atext
    csv=z.read('빠른정답.csv').decode('utf-8');assert all(i in csv for i in ids)
    qpdf=z.read('문제.pdf');apdf=z.read('답안과상세풀이.pdf')
    qp=len(PdfReader(io.BytesIO(qpdf)).pages);ap=len(PdfReader(io.BytesIO(apdf)).pages)
    assert qp>=2 and ap>=2
    reviewdir=WORK/'zip-review';reviewdir.mkdir(exist_ok=True)
    (reviewdir/'문제.pdf').write_bytes(qpdf);(reviewdir/'답안과상세풀이.pdf').write_bytes(apdf)
result={'zipSha256':hashlib.sha256(Z.read_bytes()).hexdigest(),'zipBytes':Z.stat().st_size,'entries':7,'itemIds':ids,'questionPdfPages':qp,'solutionPdfPages':ap,'questionAndDetailedSolutionPresent':True,'allTextAndSolutionsIncluded':True,'passed':True}
(WORK/'zip-validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(f'PASS Q3 ZIP: 7 entries, 9 aligned items, full question+solution HTML/PDF, {qp}/{ap} pages')

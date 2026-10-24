#!/usr/bin/env python3
"""Check the actual downloaded-style ZIP and its PDF/document ID coverage."""
import hashlib, json, zipfile
from pathlib import Path
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.private-work/hw-expansion-20261023/hw6/q15-output-qa'
DATA=json.loads((ROOT/'bank/data/applied6-expanded.json').read_text())
Z=WORK/'applied6-q15.zip'
with zipfile.ZipFile(Z) as z:
    names=set(z.namelist())
    assert names=={'문제.pdf','답안과상세풀이.pdf','문제.html','답안과상세풀이.html','빠른정답.csv','문항목록.json','검수기록.json'}
    listing=json.loads(z.read('문항목록.json'))
    review=json.loads(z.read('검수기록.json'))
    ids=[x['id'] for x in DATA['items'] if x['sourceNo']==15]
    listed=[x['id'] for x in listing['items']]
    assert listing['count']==9 and listed==ids
    assert review['selectedIds']==ids and review['count']==9
    assert '문제.pdf' in review['includes'] and '답안과상세풀이.pdf' in review['includes']
    for html in ['문제.html','답안과상세풀이.html']:
        body=z.read(html).decode('utf-8')
        assert all(i in body for i in ids)
    csv=z.read('빠른정답.csv').decode('utf-8')
    assert all(i in csv for i in ids)
    qdata=z.read('문제.pdf');adata=z.read('답안과상세풀이.pdf')
    assert len(PdfReader(__import__('io').BytesIO(qdata)).pages)>=1
    assert len(PdfReader(__import__('io').BytesIO(adata)).pages)>=1
result={'zipSha256':hashlib.sha256(Z.read_bytes()).hexdigest(),'zipBytes':Z.stat().st_size,'entries':7,'itemIds':ids,'questionPdfPages':len(PdfReader(__import__('io').BytesIO(qdata)).pages),'solutionPdfPages':len(PdfReader(__import__('io').BytesIO(adata)).pages),'questionAndSolutionPresent':True,'passed':True}
(WORK/'zip-validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('PASS Q15 ZIP: 7 entries, 9 aligned IDs, question/solution HTML+PDF')

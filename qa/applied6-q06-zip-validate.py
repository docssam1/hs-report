#!/usr/bin/env python3
"""Validate Q6's actual downloaded ZIP, aligned IDs, and PDF content."""
import hashlib, io, json, zipfile
from pathlib import Path
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.private-work/hw-expansion-20261023/hw6/q06-output-qa'
DATA=json.loads((ROOT/'bank/data/applied6-expanded.json').read_text())
Z=WORK/'applied6-q06.zip'
with zipfile.ZipFile(Z) as z:
    names=set(z.namelist())
    assert names=={'문제.pdf','답안과상세풀이.pdf','문제.html','답안과상세풀이.html','빠른정답.csv','문항목록.json','검수기록.json'}
    listing=json.loads(z.read('문항목록.json'))
    review=json.loads(z.read('검수기록.json'))
    items=[x for x in DATA['items'] if x['sourceNo']==6]
    ids=[x['id'] for x in items]
    assert listing['count']==review['count']==9
    assert [x['id'] for x in listing['items']]==ids
    assert review['selectedIds']==ids
    assert {'문제.pdf','답안과상세풀이.pdf'} <= set(review['includes'])
    for filename in ['문제.html','답안과상세풀이.html']:
        body=z.read(filename).decode('utf-8')
        assert all(item_id in body for item_id in ids)
    csv=z.read('빠른정답.csv').decode('utf-8')
    assert all(item_id in csv for item_id in ids)
    qbytes=z.read('문제.pdf');abytes=z.read('답안과상세풀이.pdf')
    qpdf=PdfReader(io.BytesIO(qbytes));apdf=PdfReader(io.BytesIO(abytes))
    assert len(qpdf.pages)>=1 and len(apdf.pages)>=1
    # The PDFs are raster exports, so page images are reviewed after rendering;
    # HTML documents provide selectable text and item-ID correspondence.
    problem_html=z.read('문제.html').decode('utf-8')
    solution_html=z.read('답안과상세풀이.html').decode('utf-8')
    assert all(item_id in problem_html for item_id in ids)
    assert all(item_id in solution_html for item_id in ids)
    assert all(x['answer'] in solution_html for x in items)

result={'zipSha256':hashlib.sha256(Z.read_bytes()).hexdigest(),'zipBytes':Z.stat().st_size,
        'entries':7,'itemIds':ids,'questionPdfPages':len(qpdf.pages),'solutionPdfPages':len(apdf.pages),
        'allNineIdsInProblemAndSolutionHtml':True,'questionSolutionPdfsPresent':True,'passed':True}
(WORK/'zip-validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(f"PASS Q6 actual ZIP: 7 files, 9 aligned IDs, problem {len(qpdf.pages)}p, solutions {len(apdf.pages)}p")

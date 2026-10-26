#!/usr/bin/env python3
"""Validate the reviewed Applied 7 Q1/Q8/Q17/Q19 practice ZIP."""
import csv, io, json, re, zipfile
from pathlib import Path
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.private-work/hw-expansion-20261023/hw7/q01-output-qa-r32'
ZIP=WORK/'applied7-q01-q08-q17-q19-36.zip'
DATA=json.loads((ROOT/'bank/data/applied7-expanded.json').read_text())
EXPECTED={'문제.pdf','답안과상세풀이.pdf','문제.html','답안과상세풀이.html','빠른정답.csv','문항목록.json','검수기록.json'}
with zipfile.ZipFile(ZIP) as z:
    assert set(z.namelist())==EXPECTED
    listing=json.loads(z.read('문항목록.json'))
    review=json.loads(z.read('검수기록.json'))
    items=listing['items']; ids=[x['id'] for x in items]
    assert listing['count']==len(items)==36 and len(set(ids))==36
    assert ids==[x['id'] for x in DATA['items'] if x['sourceNo'] in {1,8,17,19}]
    assert {n:sum(x['sourceNo']==n for x in items) for n in (1,8,17,19)}=={1:9,8:9,17:9,19:9}
    q=z.read('문제.html').decode(); a=z.read('답안과상세풀이.html').decode()
    assert all(x['id'] in q and x['id'] in a and str(x['answer']) in a and x['learningLocation'] in a and x['learningPoint'] in a for x in items)
    images=re.findall(r'<img\b[^>]*\bsrc=["\']([^"\']+)',q)
    assert len(images)==36 and all(src.startswith('data:image/') for src in images)
    rows=list(csv.reader(io.StringIO(z.read('빠른정답.csv').decode())))
    assert len(rows)==37
    qpdf=PdfReader(io.BytesIO(z.read('문제.pdf'))); apdf=PdfReader(io.BytesIO(z.read('답안과상세풀이.pdf')))
    assert len(qpdf.pages)==9 and len(apdf.pages)==14
    for page in [*qpdf.pages,*apdf.pages]: assert float(page.mediabox.width)>590 and float(page.mediabox.height)>830
    assert review['count']==36 and review['questionPdfPages']==9 and review['solutionPdfPages']==14
evidence={'result':'PASS','zip':str(ZIP.relative_to(ROOT)),'items':36,'perSource':{str(n):9 for n in (1,8,17,19)},'questionPdfPages':len(qpdf.pages),'solutionPdfPages':len(apdf.pages),'embeddedDiagrams':len(images),'answerAndLearningLinks':True,'quickAnswerRows':len(rows),'bytes':ZIP.stat().st_size}
(WORK/'zip-validation-r32.json').write_text(json.dumps(evidence,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(evidence,ensure_ascii=False))

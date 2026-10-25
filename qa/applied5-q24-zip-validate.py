#!/usr/bin/env python3
"""Check Applied5 Q24 selected ZIP, exact source figure and answer/learning content."""
import base64,csv,hashlib,io,json,re,zipfile
from pathlib import Path
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.private-work/hw-expansion-20261023/hw5/output-qa-r19'
ZIP=WORK/'applied5-q24-9.zip'
DATA=json.loads((ROOT/'bank/data/applied5-expanded.json').read_text())
items=[x for x in DATA['items'] if x['sourceNo']==24]
asset=(ROOT/'bank/assets/applied5/q24-source-calendar-piece.png').read_bytes()

with zipfile.ZipFile(ZIP) as z:
    assert set(z.namelist())=={'문제.pdf','답안과상세풀이.pdf','문제.html','답안과상세풀이.html','빠른정답.csv','문항목록.json','검수기록.json'}
    listing=json.loads(z.read('문항목록.json')); review=json.loads(z.read('검수기록.json'))
    assert listing['version']==review['version']==DATA['version']
    assert listing['count']==review['count']==9
    assert [x['id'] for x in listing['items']]==[x['id'] for x in items]
    assert review['sourceGradeMutation'] is False
    q=z.read('문제.html').decode(); a=z.read('답안과상세풀이.html').decode()
    encoded=re.findall(r'<img\b[^>]*\bsrc=["\']data:image/png;base64,([^"\']+)',q)
    assert len(encoded)==9 and all(base64.b64decode(e)==asset for e in encoded)
    for x in items:
        assert x['id'] in q and x['id'] in a
        assert x['answer'] in a and x['learningLocation'] in a and x['learningPoint'] in a
        assert all(str(n) in a for n in x['answerParts'])
    rows=list(csv.reader(io.StringIO(z.read('빠른정답.csv').decode('utf-8-sig'))))
    assert len(rows)==10 and len({row[0] for row in rows[1:]})==9
    qp=PdfReader(io.BytesIO(z.read('문제.pdf'))); ap=PdfReader(io.BytesIO(z.read('답안과상세풀이.pdf')))
    assert len(qp.pages)==review['questionPdfPages'] and len(ap.pages)==review['solutionPdfPages']
    for pg in [*qp.pages,*ap.pages]:
        assert float(pg.mediabox.width)>590 and float(pg.mediabox.height)>830

result={'result':'PASS','zip':str(ZIP.relative_to(ROOT)),'bytes':ZIP.stat().st_size,
        'sha256':hashlib.sha256(ZIP.read_bytes()).hexdigest(),'items':9,
        'questionPdfPages':len(qp.pages),'solutionPdfPages':len(ap.pages),
        'embeddedOriginalFigures':9,'pixelBytesMatchAsset':True,
        'answersAndLearningLinks':True,'sevenFilesPresent':True}
(WORK/'q24-zip-validation-r19.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False))

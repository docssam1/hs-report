#!/usr/bin/env python3
"""Validate Q25 selected ZIP contents, embedded source crop, and page geometry."""
import base64,csv,hashlib,io,json,re,zipfile
from pathlib import Path
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.private-work/hw-expansion-20261023/hw5/output-qa-r20'
ZIP=WORK/'applied5-q25-9.zip'
DATA=json.loads((ROOT/'bank/data/applied5-expanded.json').read_text())
items=[x for x in DATA['items'] if x['sourceNo']==25]
asset=(ROOT/'bank/assets/applied5/q25-source-two-circles-example.png').read_bytes()

with zipfile.ZipFile(ZIP) as z:
    expected={'문제.pdf','답안과상세풀이.pdf','문제.html','답안과상세풀이.html','빠른정답.csv','문항목록.json','검수기록.json'}
    assert set(z.namelist())==expected
    listing=json.loads(z.read('문항목록.json'));review=json.loads(z.read('검수기록.json'))
    assert listing['version']==review['version']==DATA['version']
    assert listing['count']==review['count']==9
    assert [x['id'] for x in listing['items']]==[x['id'] for x in items]
    assert review['sourceGradeMutation'] is False
    questions=z.read('문제.html').decode();solutions=z.read('답안과상세풀이.html').decode()
    encoded=re.findall(r'<img\b[^>]*\bsrc=["\']data:image/png;base64,([^"\']+)',questions)
    assert len(encoded)==9 and all(base64.b64decode(e)==asset for e in encoded)
    for item in items:
        assert item['id'] in questions and item['id'] in solutions
        assert item['answer'] in solutions
        assert item['learningLocation'] in solutions and item['learningPoint'] in solutions
        assert all(str(n) in solutions for n in item['answerParts'])
    rows=list(csv.reader(io.StringIO(z.read('빠른정답.csv').decode('utf-8-sig'))))
    assert len(rows)==10 and len({row[0] for row in rows[1:]})==9
    qp=PdfReader(io.BytesIO(z.read('문제.pdf')));ap=PdfReader(io.BytesIO(z.read('답안과상세풀이.pdf')))
    assert len(qp.pages)==review['questionPdfPages']==3
    assert len(ap.pages)==review['solutionPdfPages']==4
    for page in [*qp.pages,*ap.pages]:
        assert float(page.mediabox.width)>590 and float(page.mediabox.height)>830

result={'result':'PASS','zip':str(ZIP.relative_to(ROOT)),'bytes':ZIP.stat().st_size,
        'sha256':hashlib.sha256(ZIP.read_bytes()).hexdigest(),'items':9,
        'questionPdfPages':len(qp.pages),'solutionPdfPages':len(ap.pages),
        'embeddedOriginalFigures':9,'pixelBytesMatchAsset':True,
        'answersAndLearningLinks':True,'sevenFilesPresent':True}
(WORK/'q25-zip-validation-r20.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False))

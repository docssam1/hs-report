#!/usr/bin/env python3
"""Inspect actual Applied 8 Q28 download ZIP, PDFs, images, answers, and source fidelity."""
from pathlib import Path
from zipfile import ZipFile
from pypdf import PdfReader
import base64
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / '.private-work/hw-expansion-20261023/hw8'
OUT = WORK / 'q28-output-qa-r1'
ZIP = OUT / 'applied8-q28.zip'
EXTRACT = OUT / 'extracted'
EXPECTED = {'문제.pdf','답안과상세풀이.pdf','문제.html','답안과상세풀이.html','빠른정답.csv','문항목록.json','검수기록.json'}
EXTRACT.mkdir(exist_ok=True)
with ZipFile(ZIP) as z:
    assert set(z.namelist()) == EXPECTED and z.testzip() is None
    z.extractall(EXTRACT)
data = json.loads((ROOT / 'bank/data/applied8-expanded.json').read_text())
manifest = json.loads((EXTRACT / '문항목록.json').read_text())
qa = json.loads((EXTRACT / '검수기록.json').read_text())
items = [x for x in data['items'] if x['sourceNo'] == 28]
assert len(items) == manifest['count'] == qa['count'] == 9
assert [x['id'] for x in items] == [x['id'] for x in manifest['items']] == qa['selectedIds']
qhtml = (EXTRACT / '문제.html').read_text()
shtml = (EXTRACT / '답안과상세풀이.html').read_text()
csv = (EXTRACT / '빠른정답.csv').read_text()
assert qhtml.count('<article class="question') == 9 and shtml.count('<article class="solution') == 9
qdata = re.findall(r'data:image/(?:png|svg\+xml);base64,([A-Za-z0-9+/=]+)', qhtml)
sdata = re.findall(r'data:image/(?:png|svg\+xml);base64,([A-Za-z0-9+/=]+)', shtml)
assert len(qdata) == len(sdata) == 9
for i, (item, q64, s64) in enumerate(zip(items, qdata, sdata), 1):
    assert item['text'] in qhtml and item['answer'] in shtml and item['answer'] in csv
    assert item['learningLocation'] in shtml and item['learningPoint'] in shtml
    assert all(step in shtml for step in item['solutionSteps'])
    qraw, sraw = base64.b64decode(q64), base64.b64decode(s64)
    qlocal = (ROOT / 'bank' / item['asset']['src']).read_bytes()
    slocal = (ROOT / 'bank' / item['solutionAsset']['src']).read_bytes()
    assert qraw == qlocal and sraw == slocal
    if i == 1:
        assert item['verification']['sourceDrawingPixelExactCrop']
        assert qraw == (WORK / 'source-review/q28-map-original-crop.png').read_bytes()
        assert sraw == (ROOT / 'bank/assets/applied8/q28-source-colored-solution.png').read_bytes()
    else:
        assert qraw.startswith(b'<svg') and sraw.startswith(b'<svg')
questions = PdfReader(str(EXTRACT / '문제.pdf'))
solutions = PdfReader(str(EXTRACT / '답안과상세풀이.pdf'))
browser = json.loads((OUT / 'browser-evidence.json').read_text())
assert len(questions.pages) == browser['questionPdfPages']
assert len(solutions.pages) == browser['solutionPdfPages']
assert browser['sourceNo'] == 28 and browser['count'] == 9
assert browser['answerInputs'] == browser['diagnosisLinks'] == browser['learningLocationLinks'] == 9
assert browser['columnOrder'] and browser['mobile375NoOverflow'] and browser['threeAttempts'] and browser['firstPracticePreserved']
assert browser['externalWrites'] == [] and browser['pageErrors'] == []
report = {'passed':True,'zipBytes':ZIP.stat().st_size,'zipEntries':sorted(EXPECTED),'questionPages':len(questions.pages),'solutionPages':len(solutions.pages),'itemCount':9,'questionImagesByteExact':9,'solutionImagesByteExact':9,'sourceDrawingCropByteExact':True,'answersAndLearningLinksIncluded':True,'browserInputDiagnosisAndMobileChecks':True,'externalWrites':0,'zipSha256':hashlib.sha256(ZIP.read_bytes()).hexdigest()}
(OUT / 'zip-evidence.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(f'PASS Applied8 Q28 ZIP: 7 entries, 9 source images and 9 colored solution images byte-identical; {len(questions.pages)} question pages and {len(solutions.pages)} solution pages, all links and answers included.')

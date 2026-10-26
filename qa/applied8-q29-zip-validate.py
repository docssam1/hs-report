#!/usr/bin/env python3
"""Validate the actual Applied 8 Q29 download ZIP and all printable contents."""
from pathlib import Path
from zipfile import ZipFile
from pypdf import PdfReader
import hashlib, json, re

ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.private-work/hw-expansion-20261023/hw8'
OUT=WORK/'q29-output-qa-r1'
ZIP=OUT/'applied8-q29.zip'
EXTRACT=OUT/'extracted'
EXPECTED={'문제.pdf','답안과상세풀이.pdf','문제.html','답안과상세풀이.html','빠른정답.csv','문항목록.json','검수기록.json'}
EXTRACT.mkdir(parents=True,exist_ok=True)
with ZipFile(ZIP) as z:
    assert set(z.namelist())==EXPECTED and z.testzip() is None
    z.extractall(EXTRACT)
D=json.loads((ROOT/'bank/data/applied8-expanded.json').read_text())
manifest=json.loads((EXTRACT/'문항목록.json').read_text())
qa=json.loads((EXTRACT/'검수기록.json').read_text())
items=[x for x in D['items'] if x['sourceNo']==29]
assert len(items)==manifest['count']==qa['count']==9
assert [x['id'] for x in items]==[x['id'] for x in manifest['items']]==qa['selectedIds']
q=(EXTRACT/'문제.html').read_text(); s=(EXTRACT/'답안과상세풀이.html').read_text(); csv=(EXTRACT/'빠른정답.csv').read_text()
assert len(re.findall(r'<article class="question',q))==9
assert len(re.findall(r'<article class="solution',s))==9
assert 'data:image/' not in q and 'data:image/' not in s
for x in items:
    assert x['text'] in q and x['answer'] in s and x['answer'] in csv
    assert all(step in s for step in x['solutionSteps'])
    assert x['learningLocation'] in s and x['learningPoint'] in s
    assert '49번째' in s and 'n!' not in x['text']
questions=PdfReader(str(EXTRACT/'문제.pdf')); solutions=PdfReader(str(EXTRACT/'답안과상세풀이.pdf'))
browser=json.loads((OUT/'browser-evidence.json').read_text())
assert len(questions.pages)==browser['questionPdfPages'] and len(solutions.pages)==browser['solutionPdfPages']
assert browser['sourceNo']==29 and browser['count']==9
assert browser['answerInputs']==browser['diagnosisLinks']==browser['learningLocationLinks']==9
assert browser['columnOrder'] and browser['mobile375NoOverflow'] and browser['threeAttempts'] and browser['firstPracticePreserved']
assert browser['externalWrites']==[] and browser['pageErrors']==[]
report={'passed':True,'zipBytes':ZIP.stat().st_size,'zipEntries':sorted(EXPECTED),'questionPages':len(questions.pages),
        'solutionPages':len(solutions.pages),'itemCount':9,'answerAndLearningLinksIncluded':True,
        'browserInputDiagnosisAndMobileChecks':True,'externalWrites':0,'zipSha256':hashlib.sha256(ZIP.read_bytes()).hexdigest()}
(OUT/'zip-evidence.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(f'PASS Applied8 Q29 ZIP: 7 entries; 9 questions and detailed solutions; {len(questions.pages)} question pages and {len(solutions.pages)} solution pages; all learning links and answers included.')

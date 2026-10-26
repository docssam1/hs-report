#!/usr/bin/env python3
"""Validate the downloaded Applied 8 Q22 sign-placement ZIP."""
import json,re
from pathlib import Path
from zipfile import ZipFile
from pypdf import PdfReader
R=Path(__file__).resolve().parents[1];O=R/'.private-work/hw-expansion-20261023/hw8/q22-output-qa-r1';Z=O/'applied8-q22.zip';E=O/'extracted';EXPECTED={'문제.pdf','답안과상세풀이.pdf','문제.html','답안과상세풀이.html','빠른정답.csv','문항목록.json','검수기록.json'};E.mkdir(exist_ok=True)
with ZipFile(Z) as z:assert set(z.namelist())==EXPECTED and z.testzip() is None;z.extractall(E)
man=json.loads((E/'문항목록.json').read_text());qa=json.loads((E/'검수기록.json').read_text());d=json.loads((R/'bank/data/applied8-expanded.json').read_text());items=[x for x in d['items'] if x['sourceNo']==22]
assert man['count']==qa['count']==len(items)==9 and [x['id'] for x in man['items']]==[x['id'] for x in items]==qa['selectedIds']
qh=(E/'문제.html').read_text();sh=(E/'답안과상세풀이.html').read_text();csv=(E/'빠른정답.csv').read_text();assert len(re.findall(r'<article class="question',qh))==9 and len(re.findall(r'<article class="solution',sh))==9
for x in items:
 assert x['text'] in qh and x['answer'] in sh and x['answer'] in csv and x['learningLocation'] in sh and x['learningPoint'] in sh
 assert x['verification']['parameters']['target'] in [int(t) for t in re.findall(r'= (\d+)',x['text'])]
assert all(s in sh for s in ('−를 넣은 수','가장 큰 수','방법 수','학습 위치','학습 포인트'))
q=PdfReader(str(E/'문제.pdf'));a=PdfReader(str(E/'답안과상세풀이.pdf'));b=json.loads((O/'browser-evidence.json').read_text());assert len(q.pages)==b['questionPdfPages'] and len(a.pages)==b['solutionPdfPages']
report={'zipBytes':Z.stat().st_size,'zipEntries':sorted(EXPECTED),'questionPages':len(q.pages),'solutionPages':len(a.pages),'itemCount':len(items),'allNineAnswersSolutionsLearningLinks':True,'pageCountsMatchBrowser':True};(O/'zip-evidence.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(f'PASS Applied8 Q22 ZIP: 7 files, nine question/solution records, {len(q.pages)} question pages and {len(a.pages)} solution pages match browser.')

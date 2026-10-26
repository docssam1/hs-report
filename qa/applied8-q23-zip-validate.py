#!/usr/bin/env python3
"""Validate downloaded Applied 8 Q23 ZIP structure, answers, solutions, and links."""
import json,re
from pathlib import Path
from zipfile import ZipFile
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'.private-work/hw-expansion-20261023/hw8/q23-output-qa-r1';ARCHIVE=OUT/'applied8-q23.zip';EXTRACT=OUT/'extracted';EXPECTED={'문제.pdf','답안과상세풀이.pdf','문제.html','답안과상세풀이.html','빠른정답.csv','문항목록.json','검수기록.json'};EXTRACT.mkdir(exist_ok=True)
with ZipFile(ARCHIVE) as z:assert set(z.namelist())==EXPECTED and z.testzip() is None;z.extractall(EXTRACT)
man=json.loads((EXTRACT/'문항목록.json').read_text());qa=json.loads((EXTRACT/'검수기록.json').read_text());data=json.loads((ROOT/'bank/data/applied8-expanded.json').read_text());items=[x for x in data['items'] if x['sourceNo']==23]
assert man['count']==qa['count']==len(items)==9 and [x['id'] for x in man['items']]==[x['id'] for x in items]==qa['selectedIds']
qh=(EXTRACT/'문제.html').read_text();sh=(EXTRACT/'답안과상세풀이.html').read_text();csv=(EXTRACT/'빠른정답.csv').read_text()
assert len(re.findall(r'<article class="question',qh))==9 and len(re.findall(r'<article class="solution',sh))==9
for x in items:
 assert x['text'] in qh and x['answer'] in sh and x['answer'] in csv
 assert x['learningLocation'] in sh and x['learningPoint'] in sh
 assert '4.2' in str(x['pointBand'])
assert all(x in sh for x in ('전체 학생 수','남는 학생','수학을 좋아하는 학생','학습 위치','학습 포인트'))
q=PdfReader(str(EXTRACT/'문제.pdf'));a=PdfReader(str(EXTRACT/'답안과상세풀이.pdf'));b=json.loads((OUT/'browser-evidence.json').read_text())
assert len(q.pages)==b['questionPdfPages'] and len(a.pages)==b['solutionPdfPages'] and len(q.pages)==3 and len(a.pages)==3
rep={'zipBytes':ARCHIVE.stat().st_size,'zipEntries':sorted(EXPECTED),'questionPages':len(q.pages),'solutionPages':len(a.pages),'itemCount':len(items),'nineAnswersDetailedSolutionsLearningLinks':True,'pageCountsMatchBrowser':True}
(OUT/'zip-evidence.json').write_text(json.dumps(rep,ensure_ascii=False,indent=2)+'\n');print('PASS Applied8 Q23 ZIP: seven files, nine IDs, answers/detailed solutions/learning links present; problem 3 pages and solutions 3 pages match browser.')

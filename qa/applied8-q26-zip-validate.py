#!/usr/bin/env python3
"""Validate Q26 actual exported ZIP and detailed solution/learning linkage."""
import json
from pathlib import Path
from zipfile import ZipFile
from pypdf import PdfReader
R=Path(__file__).resolve().parents[1];O=R/'.private-work/hw-expansion-20261023/hw8/q26-output-qa-r1';Z=O/'applied8-q26.zip';E=O/'extracted';E.mkdir(exist_ok=True)
EXPECTED={'문제.pdf','답안과상세풀이.pdf','문제.html','답안과상세풀이.html','빠른정답.csv','문항목록.json','검수기록.json'}
with ZipFile(Z) as z:assert set(z.namelist())==EXPECTED and z.testzip() is None;z.extractall(E)
D=json.loads((R/'bank/data/applied8-expanded.json').read_text());manifest=json.loads((E/'문항목록.json').read_text());qa=json.loads((E/'검수기록.json').read_text());items=[x for x in D['items'] if x['sourceNo']==26]
assert len(items)==manifest['count']==qa['count']==9 and [x['id'] for x in items]==[x['id'] for x in manifest['items']]==qa['selectedIds']
qh=(E/'문제.html').read_text();sh=(E/'답안과상세풀이.html').read_text();csv=(E/'빠른정답.csv').read_text();assert qh.count('<article class="question')==9 and sh.count('<article class="solution')==9
for x in items:
 assert x['text'] in qh and x['answer'] in sh and x['answer'] in csv and x['learningLocation'] in sh and x['learningPoint'] in sh
 assert all(step in sh for step in x['solutionSteps'])
q=PdfReader(str(E/'문제.pdf'));a=PdfReader(str(E/'답안과상세풀이.pdf'));b=json.loads((O/'browser-evidence.json').read_text());assert len(q.pages)==b['questionPdfPages'] and len(a.pages)==b['solutionPdfPages']
rep={'zipBytes':Z.stat().st_size,'zipEntries':sorted(EXPECTED),'questionPages':len(q.pages),'solutionPages':len(a.pages),'itemCount':len(items),'detailedSolutionsAndLearningLinks':True,'pageCountsMatchBrowser':True};(O/'zip-evidence.json').write_text(json.dumps(rep,ensure_ascii=False,indent=2)+'\n');print(f'PASS Applied8 Q26 ZIP: 7 complete files, detailed solutions, learning links, {len(q.pages)} question and {len(a.pages)} solution pages match browser.')

#!/usr/bin/env python3
"""Validate the actually downloaded Applied 8 Q21 ZIP and rendered page assets."""
import base64,json,re
from pathlib import Path
from zipfile import ZipFile
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'.private-work/hw-expansion-20261023/hw8/q21-output-qa-r1'
ARCHIVE=OUT/'applied8-q21.zip';EXTRACT=OUT/'extracted';EXPECTED={'문제.pdf','답안과상세풀이.pdf','문제.html','답안과상세풀이.html','빠른정답.csv','문항목록.json','검수기록.json'}
EXTRACT.mkdir(exist_ok=True)
with ZipFile(ARCHIVE) as z:
 assert set(z.namelist())==EXPECTED and z.testzip() is None
 z.extractall(EXTRACT)
manifest=json.loads((EXTRACT/'문항목록.json').read_text());qa=json.loads((EXTRACT/'검수기록.json').read_text());bank=json.loads((ROOT/'bank/data/applied8-expanded.json').read_text());items=[x for x in bank['items'] if x['sourceNo']==21]
assert manifest['count']==qa['count']==len(items)==9
assert [x['id'] for x in manifest['items']]==[x['id'] for x in items]==qa['selectedIds']
assert all(x['sourceNo']==21 and x['sourceRound']==8 for x in manifest['items'])
qh=(EXTRACT/'문제.html').read_text();sh=(EXTRACT/'답안과상세풀이.html').read_text();csv=(EXTRACT/'빠른정답.csv').read_text();asset=(ROOT/'bank/assets/applied8/q21-directed-graph-original.png').read_bytes()
images=re.findall(r'data:image/png;base64,([A-Za-z0-9+/=]+)',qh)
assert len(images)==9 and all(base64.b64decode(x)==asset for x in images)
for x in items:
 assert x['text'] in qh and x['answer'] in sh and x['answer'] in csv
 assert x['learningLocation'] in sh and x['learningPoint'] in sh
 assert 'A도시' in x['text'] and 'B도시' in x['text']
assert not any(x['answer'] in qh for x in items)
assert all(s in sh for s in ('화살표 방향','왼쪽 위 모서리','오른쪽 위 모서리','학습 위치','학습 포인트'))
qpdf=PdfReader(str(EXTRACT/'문제.pdf'));apdf=PdfReader(str(EXTRACT/'답안과상세풀이.pdf'));browser=json.loads((OUT/'browser-evidence.json').read_text())
assert len(qpdf.pages)==qa['questionPdfPages']==browser['questionPdfPages']==3
assert len(apdf.pages)==qa['solutionPdfPages']==browser['solutionPdfPages']
assert all(len(p.images)>=1 for p in qpdf.pages)
for p in qpdf.pages: assert len(p.images)>=1
report={'zipBytes':ARCHIVE.stat().st_size,'zipEntries':sorted(EXPECTED),'questionPages':len(qpdf.pages),'solutionPages':len(apdf.pages),'itemCount':len(items),'sourceGraphEmbeddedByteExactNineTimes':True,'answersDetailedSolutionsLearningLinksIncluded':True,'pageCountsMatchBrowser':True}
(OUT/'zip-evidence.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print('PASS Applied 8 Q21 actual ZIP: seven files, nine IDs, original graph embedded exactly nine times, answers/solutions/learning links present; PDF pages match browser evidence.')

#!/usr/bin/env python3
"""Validate Q27 downloaded ZIP, embedded card artwork, solutions, and learning links."""
from pathlib import Path
from zipfile import ZipFile
from pypdf import PdfReader
import base64,json,re,hashlib
R=Path(__file__).resolve().parents[1];O=R/'.private-work/hw-expansion-20261023/hw8/q27-output-qa-r1';Z=O/'applied8-q27.zip';E=O/'extracted';E.mkdir(exist_ok=True)
EXPECTED={'문제.pdf','답안과상세풀이.pdf','문제.html','답안과상세풀이.html','빠른정답.csv','문항목록.json','검수기록.json'}
with ZipFile(Z) as z:assert set(z.namelist())==EXPECTED and z.testzip() is None;z.extractall(E)
D=json.loads((R/'bank/data/applied8-expanded.json').read_text());man=json.loads((E/'문항목록.json').read_text());qa=json.loads((E/'검수기록.json').read_text());items=[x for x in D['items'] if x['sourceNo']==27]
assert len(items)==man['count']==qa['count']==9 and [x['id'] for x in items]==[x['id'] for x in man['items']]==qa['selectedIds']
qh=(E/'문제.html').read_text();sh=(E/'답안과상세풀이.html').read_text();csv=(E/'빠른정답.csv').read_text();assert qh.count('<article class="question')==9 and sh.count('<article class="solution')==9
embedded=re.findall(r'data:image/(?:png|svg\+xml);base64,([A-Za-z0-9+/=]+)',qh);assert len(embedded)==9
for i,(x,b64) in enumerate(zip(items,embedded),1):
 assert x['text'] in qh and x['answer'] in sh and x['answer'] in csv and x['learningLocation'] in sh and x['learningPoint'] in sh
 assert all(step in sh for step in x['solutionSteps'])
 raw=base64.b64decode(b64);local=(R/'bank'/x['asset']['src']).read_bytes()
 if i==1:assert raw==local
 else:assert b'<svg' in raw and raw==local
q=PdfReader(str(E/'문제.pdf'));a=PdfReader(str(E/'답안과상세풀이.pdf'));b=json.loads((O/'browser-evidence.json').read_text());assert len(q.pages)==b['questionPdfPages'] and len(a.pages)==b['solutionPdfPages']
rep={'zipBytes':Z.stat().st_size,'zipEntries':sorted(EXPECTED),'questionPages':len(q.pages),'solutionPages':len(a.pages),'itemCount':len(items),'embeddedCardArtwork':9,'sourceCardCropByteExact':True,'variantSvgAssetsByteExact':8,'detailedSolutionsAndLearningLinks':True,'pageCountsMatchBrowser':True};(O/'zip-evidence.json').write_text(json.dumps(rep,ensure_ascii=False,indent=2)+'\n');print(f'PASS Applied8 Q27 ZIP: 7 files; source crop and 8 SVGs exact; {len(q.pages)} question and {len(a.pages)} solution pages match browser.')

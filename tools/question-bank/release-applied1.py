"""Promote only the exact finite dataset covered by independent + browser QA.

Explicit visual review must be recorded separately. Rebuilding starts pending
again; neither this script nor the student UI may generate extra questions.
"""
import hashlib
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
work=ROOT/'.private-work/hw-expansion-20261023'
target=ROOT/'bank/data/applied1-expanded.json'
before=hashlib.sha256(target.read_bytes()).hexdigest()
math=json.loads((work/'independent-math.json').read_text())
browser=json.loads((work/'output-qa/browser-evidence.json').read_text())
visual=json.loads((work/'visual-review.json').read_text())
assert math['dataSha256']==browser['dataSha256']==visual['dataSha256']==before,'QA does not cover current data'
assert math['count']==browser['count']==visual['count']==216
assert all(row['passed'] for row in math['items'])
assert browser['questionOverflow']==browser['solutionOverflow']==0
assert browser['sourceGradesWritten'] is False and browser['externalWrites']==browser['errors']==[]
assert visual['zipPdfRenderedAndInspected'] is True and visual['columnOrder']=='left-top-to-bottom-then-right'
assert visual['sourceDrawingsDirectlyCompared']==[1,6,22,25,26,27]
data=json.loads(target.read_text())
for item in data['items']:item['reviewStatus']='verified'
data['reviewSummary']={'independentMathCount':216,'sourceTypes':24,'variantsPerType':9,
                      'outputReviewed':True,'sourceDrawingCount':6,'originalGradesChanged':False,
                      'studentDifficultyMeasured':False,'preReleaseDataSha256':before}
target.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
index={'version':data['version'],'sourceSet':'applied','sourceRound':1,'itemCount':216,'pendingSourceNos':data['pendingSourceNos'],
       'items':[{k:row[k] for k in ['sourceNo','genId','area','subarea','detailType','pointBand','reviewStatus']}|{'variantCount':9}
                for no in data['availableSourceNos'] for row in [next(x for x in data['items'] if x['sourceNo']==no)]]}
(ROOT/'bank/data/applied1-expanded-index.json').write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n')
(work/'release-evidence.json').write_text(json.dumps({'preReleaseSha256':before,'releasedSha256':hashlib.sha256(target.read_bytes()).hexdigest(),'count':216,'pendingSourceNos':data['pendingSourceNos']},ensure_ascii=False,indent=2)+'\n')
print('Promoted 216 exact QA-covered records; original grades untouched; 6 source types stay pending')

"""Release the exact Applied 4 records covered by independent and output QA."""
import hashlib
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];work=ROOT/'.private-work/hw-expansion-20261023/hw4';file=ROOT/'bank/data/applied4-expanded.json'
before=hashlib.sha256(file.read_bytes()).hexdigest();m=json.loads((work/'independent-math.json').read_text());b=json.loads((work/'output-qa/browser-evidence.json').read_text());v=json.loads((work/'visual-review.json').read_text())
assert m['dataSha256']==b['dataSha256']==v['dataSha256']==before
assert m['count']==b['count']==v['count']==108 and all(x['passed'] for x in m['items'])
assert b['questionOverflow']==b['solutionOverflow']==0 and b['externalWrites']==b['errors']==[]
assert b['answerInputAndDiagnosis'] and b['round4LearningLinks'] and v['zipPdfRenderedAndInspected']
assert v['sourceDrawingsDirectlyCompared']==[6,10]
data=json.loads(file.read_text())
for x in data['items']:x['reviewStatus']='verified'
data['reviewSummary']={'independentMathCount':108,'sourceTypes':12,'variantsPerType':9,'outputReviewed':True,'sourceDrawingCount':2,'originalGradesChanged':False,'studentDifficultyMeasured':False,'preReleaseDataSha256':before}
file.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
index={'version':data['version'],'sourceSet':'applied','sourceRound':4,'itemCount':108,'pendingSourceNos':data['pendingSourceNos'],'items':[{k:x[k] for k in ['sourceNo','genId','area','subarea','detailType','pointBand','reviewStatus']}|{'variantCount':9} for no in data['availableSourceNos'] for x in [next(a for a in data['items'] if a['sourceNo']==no)]]}
(ROOT/'bank/data/applied4-expanded-index.json').write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n')
(work/'release-evidence.json').write_text(json.dumps({'preReleaseSha256':before,'releasedSha256':hashlib.sha256(file.read_bytes()).hexdigest(),'count':108,'pendingSourceNos':data['pendingSourceNos']},indent=2)+'\n')
print('Released Applied4: 108 questions in 12 types; 18 source types stay pending; source grades unchanged')

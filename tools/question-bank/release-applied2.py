"""Release the exact Applied 2 records covered by independent and output QA."""
import hashlib
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];work=ROOT/'.private-work/hw-expansion-20261023/hw2';file=ROOT/'bank/data/applied2-expanded.json'
before=hashlib.sha256(file.read_bytes()).hexdigest();m=json.loads((work/'independent-math.json').read_text());b=json.loads((work/'output-qa/browser-evidence.json').read_text());v=json.loads((work/'visual-review.json').read_text())
assert m['dataSha256']==b['dataSha256']==v['dataSha256']==before
assert m['count']==b['count']==v['count']==126 and all(x['passed'] for x in m['items'])
assert b['questionOverflow']==b['solutionOverflow']==0 and b['externalWrites']==b['errors']==[]
assert b['answerInputAndDiagnosis'] and b['round2LearningLinks'] and v['zipPdfRenderedAndInspected']
assert v['sourceDrawingsDirectlyCompared']==[1,6,12]
data=json.loads(file.read_text())
for x in data['items']:x['reviewStatus']='verified'
data['reviewSummary']={'independentMathCount':126,'sourceTypes':14,'variantsPerType':9,'outputReviewed':True,'sourceDrawingCount':3,'originalGradesChanged':False,'studentDifficultyMeasured':False,'preReleaseDataSha256':before}
file.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
index={'version':data['version'],'sourceSet':'applied','sourceRound':2,'itemCount':126,'pendingSourceNos':data['pendingSourceNos'],'items':[{k:x[k] for k in ['sourceNo','genId','area','subarea','detailType','pointBand','reviewStatus']}|{'variantCount':9} for no in data['availableSourceNos'] for x in [next(a for a in data['items'] if a['sourceNo']==no)]]}
(ROOT/'bank/data/applied2-expanded-index.json').write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n')
(work/'release-evidence.json').write_text(json.dumps({'preReleaseSha256':before,'releasedSha256':hashlib.sha256(file.read_bytes()).hexdigest(),'count':126,'pendingSourceNos':data['pendingSourceNos']},indent=2)+'\n')
print('Released Applied2: 126 questions in 14 types; 16 source types stay pending; source grades unchanged')

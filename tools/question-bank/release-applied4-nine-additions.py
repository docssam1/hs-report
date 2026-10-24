"""Release exactly the new27 records after the two math suites and real ZIP review."""
from pathlib import Path
import hashlib,json
ROOT=Path(__file__).resolve().parents[2];W=ROOT/'.private-work/nine-expansion-20261024/round4-missing-9-11-12';FILE=ROOT/'bank/data/applied4-expanded.json'
before=hashlib.sha256(FILE.read_bytes()).hexdigest();data=json.loads(FILE.read_text())
def read(p):return json.loads((W/p).read_text())
m,l,b,v,z=[read(p)for p in['independent-math.json','legacy-independent-math.json','output-qa/browser-evidence.json','visual-review.json','zip-evidence.json']]
assert all(x['dataSha256']==before for x in[m,l,b,v])
assert {x['id']for x in m['items']+l['items']}=={x['id']for x in data['items']}
assert all(x['passed']for x in m['items']+l['items'])and len(m['items'])==27 and len(l['items'])==108
assert b['actualZip']and b['selectedZipCount']==27 and b['overflow']==0 and b['externalWrites']==[]and b['firstAttemptPreserved']
assert v['passed']and v['zipPdfRenderedAndInspected']and z['allSelectedDataExact']
old=read('prior-expanded.json');assert data['items'][:108]==old['items']and data['version']==old['version']
(W/'pre-release-data.json').write_bytes(FILE.read_bytes())
for x in data['items'][108:]:assert x['reviewStatus']=='pending-output-review';x['reviewStatus']='verified'
data['reviewSummary']=dict(independentMathCount=135,sourceTypes=15,variantsPerType=9,outputReviewed=True,sourceDrawingCount=5,nativeDetailCrops=1,new27ActualZipReviewed=True,originalGradesChanged=False,studentDifficultyMeasured=False,preReleaseDataSha256=before)
data.pop('pendingAdditionSummary',None);data['additionReviewSummary']=dict(sourceNos=[9,11,12],count=27,acceptedAnswersPerGrid=4,old108Exact=True,all1533PriorAttemptKeysPreserved=True)
FILE.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
index=dict(version=data['revision'],sourceSet='applied',sourceRound=4,itemCount=135,pendingSourceNos=data['pendingSourceNos'],items=[{k:x[k]for k in['sourceNo','genId','area','subarea','detailType','pointBand','reviewStatus']}|{'variantCount':9}for no in data['availableSourceNos']for x in[next(y for y in data['items']if y['sourceNo']==no)]])
(ROOT/'bank/data/applied4-expanded-index.json').write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n')
(W/'release-evidence.json').write_text(json.dumps(dict(preReleaseSha256=before,releasedSha256=hashlib.sha256(FILE.read_bytes()).hexdigest(),count=135,newCount=27,sourceNos=[9,11,12],old108Exact=True),indent=2)+'\n');print('Released27 new/135 total Applied4;all answer/print gates passed;old108 exact')

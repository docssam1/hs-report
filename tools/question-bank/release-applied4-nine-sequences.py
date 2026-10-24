"""Release only the source15/18 additions after independent math and actual ZIP review."""
from pathlib import Path
import json,hashlib
ROOT=Path(__file__).resolve().parents[2];W=ROOT/'.private-work/nine-expansion-20261024/round4-missing-15-18';FILE=ROOT/'bank/data/applied4-expanded.json'
def read(p):return json.loads((W/p).read_text())
data=json.loads(FILE.read_text());before=hashlib.sha256(FILE.read_bytes()).hexdigest();old=read('prior-expanded.json')
math,ui,visual,zipcheck,images=[read(p) for p in ['independent-math.json','output-qa/browser-evidence.json','visual-review.json','zip-evidence.json','zip-image-evidence.json']]
assert all(x['dataSha256']==before for x in [math,ui,visual])
assert data['items'][:135]==old['items'] and data['version']==old['version'] and all(x['reviewStatus']=='verified' for x in old['items'])
assert len(math['items'])==18 and all(x['passed'] for x in math['items']) and {x['id'] for x in math['items']}=={x['id'] for x in data['items'][135:]}
assert ui['actualZip'] and ui['selectedZipCount']==18 and ui['overflow']==0 and ui['externalWrites']==[] and ui['prior1560AttemptKeysPreserved'] and ui['firstAttemptPreserved']
assert visual['passed'] and visual['all11ActualZipPagesReviewed'] and zipcheck['allSelectedDataExact'] and images['allImageBytesMatch']
for r in read('protected-files.json')['files']:assert hashlib.sha256((ROOT/r['path']).read_bytes()).hexdigest()==r['sha256']
(W/'pre-release-data.json').write_bytes(FILE.read_bytes())
for x in data['items'][135:]:assert x['reviewStatus']=='pending-output-review';x['reviewStatus']='verified'
data.pop('pendingAdditionSummary',None)
data['reviewSummary']=dict(independentMathCount=153,sourceTypes=17,variantsPerType=9,outputReviewed=True,prior135Exact=True,new18ActualZipReviewed=True,originalGradesChanged=False,studentDifficultyMeasured=False,preReleaseDataSha256=before)
data['additionReviewSummary']=dict(sourceNos=[15,18],count=18,old135Exact=True,all1560PriorAttemptKeysPreserved=True,source15Original100=[8,15],source18Original152=['나',87])
FILE.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
index=dict(version=data['revision'],sourceSet='applied',sourceRound=4,itemCount=len(data['items']),pendingSourceNos=data['pendingSourceNos'],items=[{k:x[k] for k in ['sourceNo','genId','area','subarea','detailType','pointBand','reviewStatus']}|{'variantCount':9} for no in data['availableSourceNos'] for x in [next(y for y in data['items'] if y['sourceNo']==no)]])
(ROOT/'bank/data/applied4-expanded-index.json').write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n')
(W/'release-evidence.json').write_text(json.dumps(dict(preReleaseSha256=before,releasedSha256=hashlib.sha256(FILE.read_bytes()).hexdigest(),count=153,newCount=18,old135Exact=True),indent=2)+'\n')
print('Released18 new /153 total;old135 exact;math/realZIP/visual/input/protection gates passed')

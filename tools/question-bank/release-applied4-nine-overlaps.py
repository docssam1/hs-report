"""Release only source16's nine variants after math, app and rendered ZIP checks."""
from pathlib import Path
import json,hashlib
ROOT=Path(__file__).resolve().parents[2];W=ROOT/'.private-work/nine-expansion-20261024/round4-missing-16';FILE=ROOT/'bank/data/applied4-expanded.json'
def read(p):return json.loads((W/p).read_text())
d=json.loads(FILE.read_text());before=hashlib.sha256(FILE.read_bytes()).hexdigest();old=read('prior-expanded.json')
math,ui,visual,zipcheck,images=[read(p)for p in['independent-math.json','output-qa/browser-evidence.json','visual-review.json','zip-evidence.json','zip-image-evidence.json']]
assert all(x['dataSha256']==before for x in[math,ui,visual])
assert d['items'][:153]==old['items'] and d['version']==old['version'] and all(x['reviewStatus']=='verified'for x in old['items'])
assert len(math['items'])==9 and all(x['passed']for x in math['items'])and{x['id']for x in math['items']}=={x['id']for x in d['items'][153:]}
assert ui['actualZip']and ui['selectedZipCount']==9 and ui['overflow']==0 and ui['externalWrites']==[]and ui['prior1578AttemptKeysPreserved']and ui['firstAttemptPreserved']
assert visual['passed']and visual['all6ActualZipPagesReviewed']and zipcheck['allSelectedDataExact']and images['allImageBytesMatch']
for r in read('protected-files.json')['files']:assert hashlib.sha256((ROOT/r['path']).read_bytes()).hexdigest()==r['sha256']
(W/'pre-release-data.json').write_bytes(FILE.read_bytes())
for x in d['items'][153:]:assert x['reviewStatus']=='pending-output-review';x['reviewStatus']='verified'
d.pop('pendingAdditionSummary',None);d['reviewSummary']=dict(independentMathCount=162,sourceTypes=18,variantsPerType=9,outputReviewed=True,prior153Exact=True,new9ActualZipReviewed=True,originalGradesChanged=False,studentDifficultyMeasured=False,preReleaseDataSha256=before)
d['additionReviewSummary']=dict(sourceNos=[16],count=9,old153Exact=True,all1578PriorAttemptKeysPreserved=True,allFiveCardPermutationsUnique=True,sourceGrade='3.4-middle')
FILE.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
index=dict(version=d['revision'],sourceSet='applied',sourceRound=4,itemCount=len(d['items']),pendingSourceNos=d['pendingSourceNos'],items=[{k:x[k]for k in['sourceNo','genId','area','subarea','detailType','pointBand','reviewStatus']}|{'variantCount':9}for no in d['availableSourceNos']for x in[next(y for y in d['items']if y['sourceNo']==no)]])
(ROOT/'bank/data/applied4-expanded-index.json').write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n')
(W/'release-evidence.json').write_text(json.dumps(dict(preReleaseSha256=before,releasedSha256=hashlib.sha256(FILE.read_bytes()).hexdigest(),count=162,newCount=9,prior153Exact=True),indent=2)+'\n')
print('Released 9 source16 variants;old153 exact;original figure and sums maintained')

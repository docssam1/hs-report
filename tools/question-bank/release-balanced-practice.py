"""Release one checked bank, merging its rows without dropping other rounds."""
import argparse
import hashlib
import json
import re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
parser=argparse.ArgumentParser()
parser.add_argument('--bank',required=True)
parser.add_argument('--work-dir',required=True)
args=parser.parse_args()
assert re.fullmatch(r'applied[1-9]-balanced15',args.bank)
work=(ROOT/args.work_dir).resolve()
assert work.is_relative_to(ROOT/'.private-work')
file=ROOT/('bank/data/'+args.bank+'.json')
before=hashlib.sha256(file.read_bytes()).hexdigest()
data=json.loads(file.read_text());count=len(data['items']);round_no=data['sourceRound']
assert args.bank==f'applied{round_no}-balanced15'
assert count==15*len(data['availableSourceNos'])
assert all(sum(x['sourceNo']==no and x['practiceLevel']==level for x in data['items'])==5
           for no in data['availableSourceNos']for level in ['low','middle','high'])
math=json.loads((work/'independent-math.json').read_text())
browser=json.loads((work/'output-qa/browser-evidence.json').read_text())
visual=json.loads((work/'visual-review.json').read_text())
assert all(x['dataSha256']==before and x['count']==count for x in [math,browser,visual])
assert {x['id']for x in math['items']}=={x['id']for x in data['items']}
assert all(x['passed']for x in math['items'])and visual['passed']and browser['overflow']==0
if any(x.get('solutionAsset')for x in data['items']):
    assert browser.get('solutionSvgIntrinsicAspect')is True and visual.get('solutionSvgIntrinsicAspect')is True
assert browser['externalWrites']==[]and browser['firstAttemptPreserved']
assert hashlib.sha256((ROOT/f'bank/data/applied{round_no}-expanded.json').read_bytes()).hexdigest()==data['legacyBankSha256']
index_file=ROOT/'bank/balanced-practice-index.js';index=index_file.read_text()
match=re.search(r'var rows=(.*?);function get\(',index)
assert match
old_rows=json.loads(match[1]);prefix=f'applied|{round_no}|'
retained={key:value for key,value in old_rows.items()if not key.startswith(prefix)}
rows=dict(retained)
for no in data['availableSourceNos']:
    first=next(x for x in data['items']if x['sourceNo']==no)
    rows[prefix+str(no)]=dict(bank=args.bank,sourceNo=no,count=15,perLevel=5,version=data['version'],
                            **{k:first[k]for k in ['area','subarea','detailType','learningLocation','learningPoint']})
assert all(rows[key]==value for key,value in retained.items())
for item in data['items']:
    assert item['reviewStatus']in ['verified','pending-output-review']
    item['reviewStatus']='verified'
data['reviewSummary']=dict(sourceTypes=len(data['availableSourceNos']),perSource=15,perLevel=5,count=count,
    preservedLegacyCount=data['preservedLegacyCount'],newAuthoredCount=data['newAuthoredCount'],
    independentAnswers=True,actualZipReviewed=True,sourceGradeMutation=False,studentDifficultyMeasured=False)
file.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
index_file.write_text(index[:match.start(1)]+json.dumps(rows,ensure_ascii=False,separators=(',',':'))+index[match.end(1):])
(work/'release-evidence.json').write_text(json.dumps(dict(bank=args.bank,preReleaseSha256=before,
    releasedSha256=hashlib.sha256(file.read_bytes()).hexdigest(),count=count,
    preservedLegacyCount=data['preservedLegacyCount'],newAuthoredCount=data['newAuthoredCount'],
    availableSourceNos=data['availableSourceNos'],retainedOtherRoundRows=len(retained)),indent=2)+'\n')
print(f'Released {args.bank}: {count} checked items; {len(retained)} other-round index rows unchanged')

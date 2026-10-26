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
pending=set(data.get('pendingSourceNos',[]))
assert all(isinstance(no,int) and 1<=no<=30 for no in pending)
assert pending.isdisjoint(set(data['availableSourceNos']))
assert all(item['reviewStatus'] in ['verified','pending-output-review','pending-source-review']
           for item in data['items'])
published=[]
for no in data['availableSourceNos']:
    group=[item for item in data['items'] if item['sourceNo']==no]
    if no in pending or any(item['reviewStatus']!='verified' for item in group):
        continue
    published.append(no)
    first=next(x for x in data['items']if x['sourceNo']==no)
    rows[prefix+str(no)]=dict(bank=args.bank,sourceNo=no,count=15,perLevel=5,version=data['version'],
                            **{k:first[k]for k in ['area','subarea','detailType','learningLocation','learningPoint']})
assert all(rows[key]==value for key,value in retained.items())
data['reviewSummary']=dict(sourceTypes=len(published),perSource=15,perLevel=5,count=15*len(published),
    storedSourceTypes=len(data['availableSourceNos']),storedCount=count,
    pendingSourceTypes=len(pending)+len(data['availableSourceNos'])-len(published),
    preservedLegacyCount=data['preservedLegacyCount'],newAuthoredCount=data['newAuthoredCount'],
    independentAnswers=not pending and len(published)==len(data['availableSourceNos']),
    actualZipReviewed=not pending and len(published)==len(data['availableSourceNos']),
    sourceGradeMutation=False,studentDifficultyMeasured=False)
file.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
index_file.write_text(index[:match.start(1)]+json.dumps(rows,ensure_ascii=False,separators=(',',':'))+index[match.end(1):])
(work/'release-evidence.json').write_text(json.dumps(dict(bank=args.bank,preReleaseSha256=before,
    releasedSha256=hashlib.sha256(file.read_bytes()).hexdigest(),count=count,
    preservedLegacyCount=data['preservedLegacyCount'],newAuthoredCount=data['newAuthoredCount'],
    availableSourceNos=published,pendingSourceNos=sorted(pending|set(data['availableSourceNos'])-set(published)),
    retainedOtherRoundRows=len(retained)),indent=2)+'\n')
print(f'Released {args.bank}: {15*len(published)} checked items; '
      f'{len(pending)+len(data["availableSourceNos"])-len(published)} source types locked; '
      f'{len(retained)} other-round index rows unchanged')

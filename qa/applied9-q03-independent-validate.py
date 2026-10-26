#!/usr/bin/env python3
"""Independent uniqueness, answer, source, and SVG checks for Applied 9 Q03."""
import hashlib, json, re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
D=json.loads((ROOT/'bank/data/applied9-expanded.json').read_text())
I=json.loads((ROOT/'bank/data/applied9-expanded-index.json').read_text())
VERSION='20261026-applied9-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q11-q12-q13-q14-q15-q16-q17-q18-q19-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-taxonomy-r25'
assert D['version']==I['version']==VERSION
assert D['itemCount']==I['itemCount']==len(D['items'])==270
assert I['availableSourceNos']== list(range(1, 31))
assert D['pendingSourceNos']== []
assert next(x for x in I['items'] if x['sourceNo']==3)['variantCount']==9
items=[x for x in D['items'] if x['sourceNo']==3]
assert len(items)==9
answers=[]; proof=[]
for i,item in enumerate(items,1):
    assert item['id']==f'applied9-q03-v{i}' and item['answerContract']=='ordered-parts'
    p=item['verification']['parameters'];a,b,s=p['firstResult'],p['secondResult'],p['sumResult']
    given=tuple(item['answerParts']); sols=[]
    # Exhaust every positive-integer split of the displayed sum; derive the circle from the first equation.
    for z in range(1,s):
        y=s-z
        x=a*y*z
        if x%y==0 and x//y//z==a and x//y*z==b:
            sols.append((x,y,z))
    assert sols==[given],(item['id'],sols,given)
    x,y,z=given
    assert (x//y//z,x//y*z,y+z)==(a,b,s)
    assert (x,y,z)==(p['circle'],p['triangle'],p['square'])
    assert p['squareSquared']==z*z and b==a*z*z
    assert item['answer']==f'{x}, {y}, {z}'
    asset=ROOT/'bank'/item['asset']['src'];raw=asset.read_bytes();svg=raw.decode()
    assert hashlib.sha256(raw).hexdigest()==item['asset']['sha256']==p['assetSha256']
    assert f'○ ÷ △ ÷ □ = {a}' in svg and f'○ ÷ △ × □ = {b}' in svg and f'△ + □ = {s}' in svg
    assert item['verification']['sourceDrawingCompared'] is True and item['verification']['userAuthorizedNewVariantFigures'] is True
    answers.append(list(given));proof.append({'id':item['id'],'testedPositivePairs':s-1,'solution':list(given),'equations':[a,b,s],'assetSha256':item['asset']['sha256']})
assert len(set(map(tuple,answers)))==9
# Candidate answer values independently satisfy the directly inspected source equations.
assert (36//4//3,36//4*3,4+3)==(3,27,7)
result={'status':'PASS','sourceNo':3,'variants':9,'uniqueSolutions':answers,'sourceCandidateAnswer':[36,4,3],
        'sourceCandidateOfficiality':'unconfirmed','method':'enumerate every positive split of △+□ and independently substitute into both left-associative equations',
        'figures':proof}
out=ROOT/'.private-work/hw-expansion-20261023/hw9/q02-browser-qa';out.mkdir(parents=True,exist_ok=True)
(out/'q03-independent-validation-r16.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False,indent=2))

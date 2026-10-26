#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Independent calculation and SVG checks for Applied 9 Q04."""
import hashlib,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
D=json.loads((ROOT/'bank/data/applied9-expanded.json').read_text());I=json.loads((ROOT/'bank/data/applied9-expanded-index.json').read_text())
V='20261026-applied9-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q11-q12-q13-q14-q15-q16-q17-q18-q19-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-taxonomy-r25'
assert D['version']==I['version']==V and D['itemCount']==I['itemCount']==len(D['items'])==270
assert D['availableSourceNos']== list(range(1, 31))
assert D['pendingSourceNos']== []
assert next(x for x in I['items'] if x['sourceNo']==4)['variantCount']==9
items=[x for x in D['items'] if x['sourceNo']==4];assert len(items)==9
answers=[];evidence=[]
for i,item in enumerate(items,1):
 assert item['id']==f'applied9-q04-v{i}'
 p=item['verification']['parameters'];target=p['target']
 examples=p['examples'];assert len(examples)==3
 for e in examples:assert e['top']*e['right']==e['left']*e['center'] and e['top']*e['right']%e['left']==0
 ans=target['top']*target['right']//target['left']
 assert target['top']*target['right']%target['left']==0
 assert ans==target['answer']==item['answerParts'][0] and item['answer']==str(ans)
 svg=(ROOT/'bank'/item['asset']['src']).read_text()
 assert hashlib.sha256(svg.encode()).hexdigest()==item['asset']['sha256']==p['assetSha256']
 assert svg.count('<path ')==4 and svg.count('<circle ')==12 and '>?</text>' in svg
 for e in examples:
  assert f'>{e["center"]}</text>' in svg
 assert f'>{target["top"]}</text>' in svg and f'>{target["left"]}</text>' in svg and f'>{target["right"]}</text>' in svg
 answers.append(ans);evidence.append({'id':item['id'],'examples':examples,'target':target,'independentAnswer':ans,'assetSha256':item['asset']['sha256']})
assert answers==[9,6,8,10,12,15,7,18,5] and len(set(answers))==9
# Original three examples and answer candidate are read from source page 1.
assert [(2,4,6,3),(4,6,9,6),(8,4,2,4)]==[(2,4,6,2*6//4),(4,6,9,4*9//6),(8,4,2,8*2//4)]
assert 6*12//8==9
result={'status':'PASS','sourceNo':4,'variants':9,'answers':answers,'sourceCandidateAnswer':9,'sourceAnswerOfficiality':'unconfirmed','rule':'center = top × lower-right ÷ lower-left','method':'independent integer product/quotient for each example and target, with SVG structure/value/hash checks','figures':evidence}
out=ROOT/'.private-work/hw-expansion-20261023/hw9/q02-browser-qa';out.mkdir(parents=True,exist_ok=True)
(out/'q04-independent-validation-r16.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False,indent=2))

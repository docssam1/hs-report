#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Exhaustively verify the heavy-bead inference and all new Applied 9 Q08 diagrams."""
import hashlib,json
from itertools import permutations
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
D=json.loads((ROOT/'bank/data/applied9-expanded.json').read_text());I=json.loads((ROOT/'bank/data/applied9-expanded-index.json').read_text())
V='20261026-applied9-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q11-q12-q13-q14-q15-q16-q17-q18-q19-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-taxonomy-r25'
assert D['version']==I['version']==V and D['itemCount']==I['itemCount']==len(D['items'])==270
assert D['availableSourceNos']== list(range(1, 31))
assert D['pendingSourceNos']== []
assert next(x for x in I['items'] if x['sourceNo']==8)['variantCount']==9
def weight(n,h,m):return 18 if n==h else 13 if n==m else 8
items=[x for x in D['items'] if x['sourceNo']==8];assert len(items)==9
answers=[];details=[]
for i,item in enumerate(items,1):
 assert item['id']==f'applied9-q08-v{i}'
 p=item['verification']['parameters'];scales=p['scales'];sol=[]
 assert len(p['permutation'])==10 and sorted(p['permutation'])==list(range(1,11))
 for h,m in permutations(range(1,11),2):
  if all((sum(weight(n,h,m) for n in sc['left'])-sum(weight(n,h,m) for n in sc['right']))*(1 if sc['leftHeavier'] else -1)>0 for sc in scales):sol.append((h,m))
 heavy={h for h,m in sol}
 assert heavy=={p['answer']}=={item['answerParts'][0]},(item['id'],sol)
 assert sol==[tuple(x) for x in p['possibleHeavyAndMediumPairs']]
 svg=(ROOT/'bank'/item['asset']['src']).read_text();assert hashlib.sha256(svg.encode()).hexdigest()==item['asset']['sha256']==p['assetSha256']
 assert svg.count('<circle ')==sum(len(sc['left'])+len(sc['right']) for sc in scales)
 assert svg.count('<line ')>=6 and svg.count('<path ')>=6
 # Check original tilts are preserved under the variant's one-to-one label mapping.
 assert [sc['leftHeavier'] for sc in scales]==[True,False,False]
 answers.append(p['answer']);details.append({'id':item['id'],'answer':p['answer'],'candidate13gLabels':[m for h,m in sol],'assignmentCount':len(sol),'scaleDirections':[sc['leftHeavier'] for sc in scales],'assetSha256':item['asset']['sha256']})
assert answers==list(range(1,10))
# Direct original p.2 model confirms the answer candidate's heaviest label 1.
source=[({'left':[1,2,5,8],'right':[2,3,6,4],'leftHeavier':True}),({'left':[2,6,9,10],'right':[1,2,5],'leftHeavier':False}),({'left':[5,6,7],'right':[1,2,3],'leftHeavier':False})]
source_sol=[]
for h,m in permutations(range(1,11),2):
 if all((sum(weight(n,h,m) for n in sc['left'])-sum(weight(n,h,m) for n in sc['right']))*(1 if sc['leftHeavier'] else -1)>0 for sc in source):source_sol.append((h,m))
assert source_sol and {h for h,m in source_sol}=={1}
result={'status':'PASS','sourceNo':8,'variants':9,'variantAnswers':answers,'sourceCandidateAnswer':1,'sourcePossible13gLabels':[m for h,m in source_sol],'sourceAnswerOfficiality':'unconfirmed','method':'enumerate all 90 assignments of one 18g and one 13g bead; check exact pan totals and strict directions','figures':details}
out=ROOT/'.private-work/hw-expansion-20261023/hw9/q02-browser-qa';out.mkdir(parents=True,exist_ok=True)
(out/'q08-independent-validation-r16.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False,indent=2))

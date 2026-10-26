#!/usr/bin/env python3
"""Verify Applied 1 Q08 and its nine stored letter-multiplication variants."""
import hashlib, json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
source=ROOT/'materials/초등과정 대비 실전 모의고사 활용 1회.pdf'
expected_sha='6123edccb7f64dc664d57dd29004483e3d27c49665892da39bbf2c032b243924'
assert hashlib.sha256(source.read_bytes()).hexdigest()==expected_sha
# source equation: 77*AB=BAAB; exact source solution is independently enumerable.
def product(pattern,a,b):return int(pattern.replace('A',str(a)).replace('B',str(b)))
source_solutions=[(a,b,10*a+b) for a in range(1,10) for b in range(10) if 77*(10*a+b)==product('BAAB',a,b)]
assert source_solutions==[(7,5,75)]
expected=[
 (89,'AAAB',25),(77,'AABB',15),(66,'AABB',18),(99,'AABB',45),
 (87,'BABB',65),(21,'BABB',91),(21,'BAB',25),(37,'BBB',15),(21,'BBB',37),
]
data=json.loads((ROOT/'bank/data/applied1-expanded.json').read_text())
items=sorted((x for x in data['items'] if x['sourceNo']==8),key=lambda x:x['variantNo'])
assert len(items)==9 and [x['variantNo'] for x in items]==list(range(1,10))
results=[]
for item,(multiplier,pattern,answer) in zip(items,expected):
 p=item['verification']['parameters'];a,b=p['answerTensDigit'],p['answerOnesDigit']
 assert p['multiplier']==multiplier and p['productPattern']==pattern
 assert p['allDigitPairsChecked']==90 and item['answerParts']==[answer] and 10*a+b==answer
 all_solutions=[]
 for x in range(1,10):
  for y in range(10):
   if multiplier*(10*x+y)==product(pattern,x,y):all_solutions.append((x,y,10*x+y))
 assert all_solutions==[(a,b,answer)],(item['id'],all_solutions)
 assert item['text'].endswith(f'{multiplier} × ㄱㄴ = '+item['text'].split(' = ')[-1])
 assert len(item['solutionSteps'])>=3 and item['learningPoint'] and item['learningLocation']
 assert item['reviewStatus']=='verified' and item['pointBand']=='2.7' and item['difficultyEvidence']['label']=='하'
 assert not item.get('conditionLines') and not item.get('readingHelp')
 results.append({'id':item['id'],'equation':item['text'].split('\n\n')[-1],'answer':answer,'all90PairsChecked':True,'unique':True})
assert len(data['items'])==225 and data['availableSourceNos'].count(8)==1 and 8 not in data['pendingSourceNos']
out=ROOT/'.private-work/hw-expansion-20261023/hw1/q08-alphametic-independent-validation-r1.json'
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(json.dumps({'sourcePdfSha256':expected_sha,'sourceQuestion':8,'sourceEquation':'77 × ㄱㄴ = ㄴㄱㄱㄴ','sourceUniqueAnswer':75,'sourceDigitPairsChecked':90,'variantCount':len(results),'variants':results,'totalApplied1Items':len(data['items']),'dataSha256':hashlib.sha256((ROOT/'bank/data/applied1-expanded.json').read_bytes()).hexdigest(),'verified':True},ensure_ascii=False,indent=2)+'\n')
print('PASS 활용1 Q08: 원문 유일해 75, 유사문제 9개 각각 90개 숫자쌍 전수검사·유일해 확인.')

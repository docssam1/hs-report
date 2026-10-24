"""Independently enumerate every five-card assignment and check overlap-region sums."""
from pathlib import Path
from itertools import permutations,product
import json,hashlib
ROOT=Path(__file__).resolve().parents[1];W=ROOT/'.private-work/nine-expansion-20261024/round4-missing-16';FILE=ROOT/'bank/data/applied4-expanded.json';d=json.loads(FILE.read_text());old=json.loads((W/'prior-expanded.json').read_text())
assert len(d['items'])==162 and len(d['availableSourceNos'])==18 and d['items'][:153]==old['items'] and d['version']==old['version']
regions={'22':['left','top','right'],'17':['left','small'],'11':['right','bottom'],'ㄱ':['left','top'],'ㄴ':['top','right'],'ㄷ':['left','right','bottom']};rows=[]
for x in d['items'][153:]:
 p=x['verification']['parameters'];cards=p['cards'];solutions=[]
 for vals in permutations(cards):
  v=dict(zip(['left','small','top','right','bottom'],vals))
  if all(sum(v[q] for q in regions[k])==int(k) for k in ['22','17','11']):solutions.append(v)
 assert len(solutions)==1 and solutions[0]==p['uniquePlacement']
 pairs17=[(a,b) for a,b in product(cards,cards) if a<b and a+b==17];pairs11=[(a,b) for a,b in product(cards,cards) if a<b and a+b==11];fromPairs=[]
 for a,b in pairs17:
  for l,s in [(a,b),(b,a)]:
   for r0,b0 in pairs11:
    for r,b in [(r0,b0),(b0,r0)]:
     if len({l,s,r,b})==4:
      rem=set(cards)-{l,s,r,b}
      if len(rem)==1 and l+next(iter(rem))+r==22:fromPairs.append(dict(left=l,small=s,top=next(iter(rem)),right=r,bottom=b))
 assert fromPairs==solutions
 v=solutions[0];actual=2*(v['left']+v['top']+v['right'])+v['bottom'];assert x['answerParts']==[actual]
 assert x['verification']['sourceFigureSha256']==hashlib.sha256((ROOT/'bank/assets/applied4/four-rectangle-overlap-original.png').read_bytes()).hexdigest()
 assert x['pointBand']=='3.4' and x['difficultyEvidence']['label']=='중' and len(x['solutionSteps'])==4
 rows.append(dict(id=x['id'],solutions=len(solutions),answer=actual,pairs17=pairs17,pairs11=pairs11,passed=True))
assert len(rows)==9 and len({tuple(x['verification']['parameters']['cards']) for x in d['items'][153:]})==9
(W/'independent-math.json').write_text(json.dumps(dict(dataSha256=hashlib.sha256(FILE.read_bytes()).hexdigest(),newCount=9,prior153Exact=True,fullFiveFactorialAssignments=1080,allUnique=True,items=rows),ensure_ascii=False,indent=2)+'\n');print('PASS source16: 9 sets × 120 assignments, pair-sum independent method, answers and original figure')

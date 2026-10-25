#!/usr/bin/env python3
"""Independent vertex/hull enumeration for Applied 5 Q14; separate from generator line-cycle method."""
import hashlib,json
from fractions import Fraction as F
from itertools import combinations
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.private-work/hw-expansion-20261023/hw5';DATA=json.loads((ROOT/'bank/data/applied5-expanded.json').read_text());INDEX=json.loads((ROOT/'bank/data/applied5-expanded-index.json').read_text());PROOF=json.loads((WORK/'q14-source-answer-review.json').read_text())
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 5회.pdf';ANSWER=WORK/'q16-source-r11/answer.pdf'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def segments(diags):return [((F(x),F(0)),(F(x),F(3)),None) for x in range(4)]+[((F(0),F(y)),(F(3),F(y)),None) for y in range(4)]+[(tuple((F(a[0]),F(a[1])) for a in d)[0],tuple((F(a[0]),F(a[1])) for a in d)[1],i) for i,d in enumerate(diags)]
def intersection(s,t):
 (p,q,_),(r,z,_)=s,t;v=(q[0]-p[0],q[1]-p[1]);w=(z[0]-r[0],z[1]-r[1]);det=v[0]*w[1]-v[1]*w[0]
 if det==0:return None
 u=((r[0]-p[0])*w[1]-(r[1]-p[1])*w[0])/det;vpar=((r[0]-p[0])*v[1]-(r[1]-p[1])*v[0])/det
 if 0<=u<=1 and 0<=vpar<=1:return (p[0]+u*v[0],p[1]+u*v[1])
 return None
def orient(a,b,c):return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
def hull(points):
 ps=sorted(set(points))
 if len(ps)<3:return []
 lo=[]
 for p in ps:
  while len(lo)>=2 and orient(lo[-2],lo[-1],p)<=0:lo.pop()
  lo.append(p)
 hi=[]
 for p in reversed(ps):
  while len(hi)>=2 and orient(hi[-2],hi[-1],p)<=0:hi.pop()
  hi.append(p)
 return lo[:-1]+hi[:-1]
def contains(seg,p):
 a,b,_=seg
 if orient(a,b,p)!=0:return False
 return min(a[0],b[0])<=p[0]<=max(a[0],b[0]) and min(a[1],b[1])<=p[1]<=max(a[1],b[1])
def count(diags):
 ss=segments(diags);pts=set()
 for a,b in combinations(ss,2):
  p=intersection(a,b)
  if p is not None:pts.add(p)
 polys={}
 for chosen in combinations(pts,4):
  h=hull(chosen)
  if len(h)!=4:continue
  used=set();ok=True
  for i,a in enumerate(h):
   b=h[(i+1)%4];supports=[s for s in ss if contains(s,a) and contains(s,b)]
   if not supports:ok=False;break
   used.update(s[2] for s in supports if s[2] is not None)
  if ok:polys[tuple(sorted(h))]=len(used)
 from collections import Counter
 c=Counter(polys.values());return len(polys),[c.get(i,0) for i in range(3)]
assert sha(EXAM)==PROOF['sourceExam']['sha256'] and sha(ANSWER)==PROOF['sourceAnswer']['sha256']
assert PROOF['sourceExam']['page']==3 and PROOF['sourceAnswer']['page']==14 and PROOF['sourceAnswer']['teacherAnswer']==49
assert DATA['version']=='20261025-applied5-expansion-q03-q05-q06-q08-q09-q11-q12-q14-q15-q16-r11' and INDEX['version']==DATA['version']
assert INDEX['itemCount']==162 and DATA['reviewSummary']['independentMathCount']==162
assert DATA['availableSourceNos']==sorted(DATA['availableSourceNos']) and 14 in DATA['availableSourceNos'] and 14 not in DATA['pendingSourceNos']
source_count,source_parts=count(PROOF['sourceExam']['diagonals']);assert source_count==49 and source_parts==[36,13,0]
assert source_parts==PROOF['sourceIndependentCheck']['categories']
items=sorted((x for x in DATA['items'] if x['sourceNo']==14),key=lambda x:x['variantNo']);assert len(items)==9
answers=[]
for i,item in enumerate(items,1):
 v=PROOF['variants'][i-1];params=item['verification']['parameters'];n,parts=count(v['diagonals']);answers.append(n)
 assert item['id']==f'applied5-q14-v{i}' and item['reviewStatus']=='verified' and item['pointBand']=='3.4'
 assert params['diagonals']==v['diagonals'] and params['quadrilateralCountsByDiagonalSides']==parts==v['quadrilateralCountsByDiagonalSides']
 assert n==v['answer']==int(item['answer'])==params['answer']
 assert parts[0]==36 and sum(parts)==n and len(item['solutionSteps'])==3
 assert item['verification']['sourceDrawingCompared'] and item['verification']['sourceExamPage']==3 and item['verification']['sourceAnswerPage']==14
 svg=ROOT/'bank'/item['asset']['src'];assert svg.is_file() and '<svg' in svg.read_text() and item['asset']['src'].endswith(f'q14-v{i}.svg')
assert answers==[49,50,51,52,53,57,58,59,60]
print('PASS Q14: source 49 reproduced independently from finite-segment intersections/hulls; 9 diagrams counted independently as '+', '.join(map(str,answers))+'; 36 grid rectangles in every variant; source PDF hash matched and preserved answer crop/review manifest confirmed.')

"""Independent solvers; do not import authoring formulas or generated answer tables."""
import itertools as it,json,math,hashlib,datetime
from collections import Counter
from fractions import Fraction
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];file=ROOT/'bank/data/applied3-expanded.json';data=json.loads(file.read_text())
def solve(no,p):
 if no==1:
  terms=[]
  for count in range(1,30):
   terms.extend((a,count+2-a) for a in range(1,count+1))
  return [sum(terms[p['index']-1])]
 if no==2:
  pairs=[(n,n+1) for n in range(2,200,2) if n*(n+1)==p['product']];assert len(pairs)==1;return list(pairs[0])
 if no==3:
  # Euler count for n secants y=a*x+a². Each pair has a unique interior crossing;
  # any three cannot concur (a quadratic has at most two roots).
  for n in range(1,30):
   pts={(-(a+b),-a*b) for a,b in it.combinations(range(1,n+1),2)}
   assert len(pts)==math.comb(n,2)
   vertices=len(pts)+2*n;edges=n*n+2*n;faces=edges-vertices+1
   if faces>=p['students']:return [n]
 if no==5:
  n=p['outerSidePoints'];return [sum(min(x,y,n-1-x,n-1-y)<p['layers'] for x,y in it.product(range(n),repeat=2))]
 if no==8:
  wd=datetime.date(2014,1,p['nextJanuaryDay']).weekday();assert datetime.date(2013,6,1).weekday()==5
  return [['월','화','수','목','금','토','일'][wd]+'요일']
 if no==9:
  circumference=p['perimeter'];trees=set()
  for start in range(0,circumference,p['spacing']):
   trees.add(Fraction(start))
   for j in range(1,p['between']+1):trees.add((start+Fraction(p['spacing']*j,p['between']+1))%circumference)
  return [len(trees)]
 if no==10:return [n for n in range(1,p['limit']) if n%p['m']==p['m']-p['c'] and n%p['n']==p['n']-p['c']]
 if no==11:
  nextnum=1
  for row in range(1,p['row']+1):
   nums=[]
   for _ in range(row):nums.append(nextnum);nextnum+=1
  return [sum(nums)]
 if no==15:
  @lru_cache(None)
  def fill(mask,left,total,first):
   if left==0:return '' if total==0 else None
   digits=[d for d in range(10) if not(mask>>d&1)]
   if len(digits)<left or sum(digits[:left])>total or sum(digits[-left:])<total:return None
   for d in reversed(digits):
    if first and d==0:continue
    tail=fill(mask|1<<d,left-1,total-d,False)
    if tail is not None:return str(d)+tail
   return None
  for n in range(10,0,-1):
   v=fill(0,n,p['digitSum'],True)
   if v is not None:return [int(v)]
 if no==17:
  points=set()
  for stage,count in enumerate(p['holes'],1):
   for hole in range(count):
    for reflections in it.product([0,1],repeat=stage):points.add((stage,hole,reflections))
  return [len(points)]
 if no==20:
  def product(a,b):
   columns=[0]*(len(a)+len(b))
   for i,x in enumerate(a):
    for j,y in enumerate(b):columns[i+j]+=x*y
   for i in range(len(columns)-1):columns[i+1]+=columns[i]//10;columns[i]%=10
   return columns
  n=p['digits'];one=product([9]*n,[2]*n);two=product([3]*n,[4]+[3]*(n-1));out=[a+b for a,b in it.zip_longest(one,two,fillvalue=0)]
  for i in range(len(out)-1):out[i+1]+=out[i]//10;out[i]%=10
  return [sum(out)]
 if no==22:
  daily=[0,200,200,200,200,200,100];answers=[]
  for start in range(7):
   paid=0;day=start
   for _ in range(p['days']):paid+=daily[day];day=(day+1)%7
   if paid==p['total']:answers.append(['일','월','화','수','목','금','토'][start]+'요일')
  assert len(answers)==1;return answers
 if no==23:
  answers=[]
  for walk in range(1,101):
   fast=walk*p['ratio'];a=b=0
   for h in range(p['hours']):
    b+=walk
    if h>=p['stop']:a+=fast
   if a+b==p['distance']:answers.append([fast,walk])
  assert len(answers)==1;return answers[0]
 if no==25:
  valid=[]
  for n in range(1000,10000):
   ds=list(map(int,str(n)))
   if math.prod(ds)==0 and sum(ds)==p['digitSum'] and max(Counter(ds).values())<=p['cardCopies']:valid.append(n)
  return [len(valid)]
 if no==26:
  answers=[n for n in range(1000,10000) if n+int(str(n)[:-1])+int(str(n)[:-2])==p['sum']];assert len(answers)==1;return answers
 if no==28:
  source=''.join(map(str,range(p['from'],p['to']+1)));keep=len(source)-p['delete']
  @lru_cache(None)
  def best(pos,left,started):
   if left==0:return ''
   if len(source)-pos<left:return None
   skip=best(pos+1,left,started);take=None
   if started or source[pos]!='0':
    rest=best(pos+1,left-1,True)
    if rest is not None:take=source[pos]+rest
   values=[v for v in [skip,take] if v is not None];return min(values) if values else None
  return [best(0,keep,False)]
 if no==30:
  possible=[]
  for travel in range(1,180):
   if p['setting']+travel+p['stay']+travel==p['homeDisplay']:
    t=p['friendArrival']+p['stay']+travel;possible.append([t//60,t%60])
  assert len(possible)==1;return possible[0]
 raise AssertionError(no)
originals={1:{'index':60},2:{'product':6642},3:{'students':70},5:{'outerSidePoints':22,'layers':3},8:{'nextJanuaryDay':1},9:{'perimeter':92,'spacing':4,'between':2},10:{'m':5,'n':7,'c':2,'limit':100},11:{'row':18},15:{'digitSum':16},17:{'holes':[2,3,4]},20:{'digits':10},22:{'days':18,'total':2900},23:{'distance':100,'hours':4,'stop':1,'ratio':2},25:{'digitSum':15,'cardCopies':3},26:{'sum':4212},28:{'from':1,'to':50,'delete':50},30:{'setting':570,'friendArrival':600,'stay':120,'homeDisplay':730}}
evidence=[]
for x in data['items']:
 no=x['sourceNo'];p=x['verification']['parameters'];assert p!=originals[no],'original duplicate'
 a=solve(no,p);assert a==x['answerParts'],(x['id'],a,x['answerParts'])
 assert len(x['answerLabels'])==(1 if x['answerContract']=='unordered-set' else len(a))
 assert x['difficultyEvidence']['label']==('하' if no<=12 else '중' if no<=22 else '상')
 assert len(x['solutionSteps'])>=3
 evidence.append({'id':x['id'],'passed':True,'answer':a})
assert len(evidence)==153
for no in data['availableSourceNos']:
 group=[x for x in data['items'] if x['sourceNo']==no];assert len(group)==len({json.dumps(x['verification']['parameters'],sort_keys=True) for x in group})==9
out=ROOT/'.private-work/hw-expansion-20261023/hw3/independent-math.json';out.write_text(json.dumps({'dataSha256':hashlib.sha256(file.read_bytes()).hexdigest(),'count':153,'suite':Path(__file__).name,'items':evidence},ensure_ascii=False,indent=2)+'\n')
print('PASS 153 Applied3: independently solved 17 models; original conditions excluded; unique answers or complete answer sets; point-only difficulty')

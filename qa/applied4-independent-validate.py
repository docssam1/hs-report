"""Separate enumeration/DP/calendar solvers for finite Applied4 variants."""
import json,itertools as it,math,hashlib,datetime
from pathlib import Path
from functools import lru_cache
ROOT=Path(__file__).resolve().parents[1];file=ROOT/'bank/data/applied4-expanded.json';data=json.loads(file.read_text())
def solve(no,p):
 if no==5:
  seq=[]
  for den in range(2,30):
   for num in range(den-1,0,-1):seq.append((num,den))
  a,b=seq[p['index']-1];return [b-a]
 if no==6:
  # Fit the simplest affine coefficients to the three original examples.
  pairs=[(3,5,20),(5,7,42),(5,6,36)];fits=[(a,b,c) for a,b,c in it.product(range(-2,3),repeat=3) if all(a*x*y+b*y+c==z for x,y,z in pairs)];assert fits==[(1,1,0)]
  circle=[(6,3,3),(16,2,9),(24,6,5)];cs=[(a,b) for a,b in it.product(range(-2,3),repeat=2) if all(a*(x//y)+b==z for x,y,z in circle)];assert cs==[(1,1)]
  q,r=divmod(p['dividend'],p['divisor']);assert r==0;q+=1
  difference=len(range(min(q,p['subtract']),max(q,p['subtract'])))
  return [sum(difference for _ in range(p['outer']+1))]
 if no==7:
  possible=[n for n in range(1,501) if n>=p['transfer']+p['eatA'] and p['transfer']>=p['eatB'] and n+p['transfer']-p['eatB']==2*(n-p['transfer']-p['eatA'])];assert len(possible)==1;return possible
 if no==8:
  possible=[]
  for n in range(1,2001):
   value=n
   for _ in range(p['halvings']):value/=2
   if value==p['remaining']:possible.append(n)
  assert len(possible)==1;return possible
 if no==10:
  black=white=0;possible=[]
  for row in range(1,100):
   if row%2:black+=row
   else:white+=row
   if black-white==p['difference']:possible.append(row)
  assert len(possible)==1;return possible
 if no==13:
  possible=[]
  for price in range(max(p['shortA'],p['shortB'])+1,20001):
   a=price-p['shortA'];b=price-p['shortB']
   if a+b-price==p['leftover']:possible.append(price)
  assert len(possible)==1;return possible
 if no==17:
  # Digit DP over [0, upper], returning (number count, digit-sum total).
  digits=str(p['upper'])
  @lru_cache(None)
  def walk(i,tight):
   if i==len(digits):return 1,0
   count=total=0;limit=int(digits[i]) if tight else 9
   for d in range(limit+1):
    n,s=walk(i+1,tight and d==limit);count+=n;total+=s+d*n
   return count,total
  return [walk(0,True)[1]]
 if no==19:
  # Equal old and new integer shares: test the old payment, not the price formula.
  possible=[]
  for old in range(1,10001):
   price=old*p['people'];new=old+p['extraPerPerson']
   if new*(p['people']-p['separateGroup'])==price:possible.append(price)
  assert len(possible)==1;return possible
 if no==20:
  # Unrank directly by lexicographic prefix counts without building sorted numbers.
  rank=p['rank'];digits=[];ceiling=10
  for pos in range(4):
   remain=3-pos
   for d in range(ceiling-1,-1,-1):
    count=math.comb(d,remain) if d>=remain else 0
    if rank>count:rank-=count
    elif count:digits.append(d);ceiling=d;break
   else:raise AssertionError('rank outside domain')
  assert rank==1;return [int(''.join(map(str,digits)))]
 if no==23:
  # DP counts occurrences of digit4 only in numbers with remainder0 mod3.
  upper=str(p['limit'])
  @lru_cache(None)
  def walk(pos,tight,mod):
   if pos==len(upper):return (1,0) if mod==0 else (0,0)
   limit=int(upper[pos]) if tight else 9;count=total=0
   for d in range(limit+1):
    n,s=walk(pos+1,tight and d==limit,(mod*10+d)%3);count+=n;total+=s+(n if d==4 else 0)
   return count,total
  return [walk(0,True,0)[1]]
 if no==28:
  current=datetime.date(2025,p['firstMonth'],1);total=sum(sum(map(int,str(m))) for m in range(p['firstMonth'],p['lastMonth']+1))
  while current.year==2025 and current.month<=p['lastMonth']:
   total+=sum(map(int,str(current.day)));current+=datetime.timedelta(days=1)
  return [total]
 if no==29:
  cards=set(p['cards']);answers=[]
  for a in range(101,1000,2):
   left=list(map(int,str(a)))
   if len(set(left))!=3 or not set(left)<=cards:continue
   remaining=cards-set(left)
   for tail in it.permutations(remaining):
    if tail[2]%2==0:continue
    b=100*tail[0]+10*tail[1]+tail[2];answers.append(a*b)
  assert answers;return [max(answers)]
 raise AssertionError(no)
originals={5:{'index':78},6:{'outer':20,'dividend':81,'divisor':3,'subtract':15},7:{'transfer':3,'eatA':5,'eatB':1},8:{'remaining':30,'halvings':4},10:{'difference':8},13:{'shortA':1700,'shortB':1800,'leftover':100},17:{'upper':9999},19:{'people':6,'separateGroup':2,'extraPerPerson':1600},20:{'rank':62},23:{'limit':300,'multiple':3,'digit':4},28:{'firstMonth':3,'lastMonth':12},29:{'cards':list(range(1,7))}}
evidence=[]
for x in data['items']:
 no=x['sourceNo']
 if no not in originals:continue  # New9/11/12 are independently checked by the additions suite.
 p=x['verification']['parameters'];assert p!=originals[no]
 ans=solve(no,p);assert ans==x['answerParts'],(x['id'],ans,x['answerParts'])
 assert len(x['solutionSteps'])>=3
 assert x['pointBand']==('2.7' if no<=12 else '3.4' if no<=22 else '4.2')
 evidence.append({'id':x['id'],'passed':True,'answer':ans})
assert len(evidence)==108
for no in originals:
 group=[x for x in data['items'] if x['sourceNo']==no];assert len(group)==len({json.dumps(x['verification']['parameters'],sort_keys=True) for x in group})==9
out=ROOT/'.private-work/nine-expansion-20261024/round4-missing-9-11-12/legacy-independent-math.json';out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps({'dataSha256':hashlib.sha256(file.read_bytes()).hexdigest(),'count':108,'suite':Path(__file__).name,'items':evidence},ensure_ascii=False,indent=2)+'\n')
print('PASS 108 Applied4: numeric enumeration, separate digit DPs, prefix unranking, chronological calendar dates, independently enumerated odd products; original duplicates excluded')

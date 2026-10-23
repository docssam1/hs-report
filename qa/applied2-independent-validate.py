"""Independent solutions for Applied 2; never imports the authoring model."""
import hashlib
import itertools as it
import json
from fractions import Fraction
from functools import lru_cache
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
file=ROOT/'bank/data/applied2-expanded.json';data=json.loads(file.read_text())

def solve(no,p):
 if no==1:
  # Edge identities of consecutive zig-zag triangles, not the perimeter formula.
  edges={}
  for i in range(p['triangles']):
   for a,b in [(i,i+1),(i+1,i+2),(i,i+2)]:edges[a,b]=edges.get((a,b),0)+1
  return [sum((p['base'] if b-a==2 else p['equalSide']) for (a,b),count in edges.items() if count==1)]
 if no==2:
  answers=[(t,p['total']-t) for t in range(p['total']+1) if 3*t+4*(p['total']-t)==p['matches']]
  assert len(answers)==1
  return list(answers[0])
 if no==6:
  white=black=0;answers=[]
  for row in range(1,2*p['difference']+5):
   if row%2:white+=row
   else:black+=row
   if black-white==p['difference']:answers.append(white)
  assert len(answers)==1
  return answers
 if no==8:
  a=[age for age in range(1,151) if sum((Fraction(age,d) for d in p['denominators']),Fraction())+p['oldYears']==age]
  assert len(a)==1
  return a
 if no==10:
  N=p['students'];a=[(horizontal,N//horizontal) for horizontal in range(1,N+1) if N%horizontal==0 and N//horizontal>=3 and N//horizontal%2]
  assert len(a)==1
  return list(a[0])
 if no==11:
  players=set('ABCD');allowed=[]
  for r in range(4):
   allowed.append(({p['second'][r]} if r==p['correctPosition'] else players-{p['second'][r]})-{p['first'][r]})
  def assign(rank,used):
   if rank==4:return [()]
   return [(a,)+tail for a in allowed[rank]-used for tail in assign(rank+1,used|{a})]
  answers=assign(0,set());assert len(answers)==1
  return [answers[0][0]]
 if no==12:
  n=p['stage'];r=n-1
  cells=[(x,y) for x in range(-r,r+1) for y in range(-r,r+1) if max(abs(x),abs(y))==r and (x+y)%2==0]
  return ['흰색' if n%2 else '검은색',len(cells)]
 if no==18:
  answers=[]
  for all3 in range(min(p['AB'],p['BC'],p['AC'])+1):
   ab=p['AB']-all3;bc=p['BC']-all3;ac=p['AC']-all3
   a=p['A']-ab-ac-all3;b=p['B']-ab-bc-all3;c=p['C']-ac-bc-all3
   if min(a,b,c,ab,bc,ac)>=0 and a+b+c+ab+bc+ac+all3+p['none']==p['total']:answers.append(all3)
  assert len(answers)==1
  return answers
 if no==23:
  n=p['digits'];carry=0;digits=[]
  for column in range(2*n-1):
   coefficient=sum(9 for a in range(n) for b in range(n) if a+b==column)
   carry+=coefficient;digits.append(carry%10);carry//=10
  while carry:digits.append(carry%10);carry//=10
  return [sum(d%2 for d in digits)]
 if no==25:
  answers=[]
  for total in range(12,5000):
   remaining=total-p['eat'];ok=True
   for _ in range(p['bags']):
    remaining-=p['fixed']
    if remaining<0 or remaining%3:ok=False;break
    remaining-=remaining//3
   if ok and remaining==p['remaining']:answers.append(total)
  assert len(answers)==1
  return answers
 if no==26:
  S=p['currentSum'];answers=[]
  for young in range(S//3+1):
   for middle in range(young+1,S):
    eldest=S-young-middle
    if eldest<=middle:continue
    delta=eldest-p['eldestAtFirst'];oldYoung=young-delta;oldMiddle=middle-delta
    if oldYoung>=0 and 2*oldYoung==oldMiddle and eldest-young==3*(middle-young):answers.append(young+p['futureYears'])
  assert len(answers)==1
  return answers
 if no==27:
  def digit_product(ones,tens,hundreds,multiplier):
   carry=0;out=[]
   for digit in [ones,tens,hundreds]:
    carry+=digit*multiplier;out.append(carry%10);carry//=10
   if carry:out.append(carry)
   return out
  answers=[]
  for a0,a1,b0,b1 in it.product(range(10),range(10),range(1,10),range(1,10)):
   u=digit_product(a0,a1,p['hundreds'],b0);t=digit_product(a0,a1,p['hundreds'],b1)
   if len(u)!=3 or len(t)!=4 or u[0]!=5 or t[0]!=5 or t[2]!=p['tensPartialHundreds']:continue
   carry=0;digits=[]
   for col in range(5):
    carry+=(u[col] if col<len(u) else 0)+(t[col-1] if 0<=col-1<len(t) else 0)
    digits.append(carry%10);carry//=10
   if carry or not digits[4] or digits[2]!=p['productHundreds'] or digits[1]!=p['productTens']:continue
   answers.append(sum(d*10**i for i,d in enumerate(digits)))
  assert len(answers)==1
  return answers
 if no==29:
  source=''.join(map(str,range(p['from'],p['to']+1)));keep=len(source)-p['delete']
  @lru_cache(None)
  def best(pos,n,started):
   if n==0:return ''
   if len(source)-pos<n:return None
   skip=best(pos+1,n,started);take=None
   if started or source[pos]!='0':
    tail=best(pos+1,n-1,True)
    if tail is not None:take=source[pos]+tail
   return min(x for x in [skip,take] if x is not None) if skip is not None or take is not None else None
  answer=best(0,keep,False);assert answer and len(answer)==keep and answer[0]!='0'
  return [answer]
 if no==30:
  cards=p['cards'];total=sum(cards);assert len(cards)==12 and len(set(cards))==12 and total%3==0
  target=total//3;dp=[[0]*(target+1) for _ in range(5)];dp[0][0]=1
  for card in cards:
   for k in range(4,0,-1):
    for s in range(target,card-1,-1):dp[k][s]+=dp[k-1][s-card]
  return [dp[4][target]]
 raise AssertionError('Unknown model')

originals={1:{'triangles':50,'base':6,'equalSide':10},2:{'total':30,'matches':108},6:{'difference':23},8:{'denominators':[3,4,5],'oldYears':13},10:{'students':544},12:{'stage':55},18:{'total':50,'A':20,'B':15,'C':18,'AB':8,'BC':5,'AC':10,'none':18},25:{'remaining':12,'bags':3,'fixed':6,'eat':11},26:{'eldestAtFirst':12,'currentSum':45,'futureYears':6},27:{'hundreds':2,'tensPartialHundreds':3,'productHundreds':5,'productTens':7},29:{'delete':100,'from':1,'to':100},30:{'cards':list(range(1,13)),'countRatio':2,'sumRatio':2}}
evidence=[]
for x in data['items']:
 no=x['sourceNo'];p=x['verification']['parameters'];assert p!=originals.get(no),'the original question is not an added variant'
 assert not (no==23 and p['digits'] in [10,11])
 if no==11:assert not (p['second']==list('BDAC') and p['correctPosition']==1)
 answer=solve(no,p);assert answer==x['answerParts'],(x['id'],answer,x['answerParts'])
 assert len(x['answerLabels'])==len(x['answerParts']) and len(x['solutionSteps'])>=3
 assert x['pointBand']==('2.7' if no<=12 else '3.4' if no<=22 else '4.2')
 evidence.append({'id':x['id'],'passed':True,'answer':answer})
assert len(evidence)==126
for no in data['availableSourceNos']:
 group=[x for x in data['items'] if x['sourceNo']==no];assert len(group)==len({json.dumps(x['verification']['parameters'],sort_keys=True) for x in group})==9
out=ROOT/'.private-work/hw-expansion-20261023/hw2/independent-math.json';out.write_text(json.dumps({'dataSha256':hashlib.sha256(file.read_bytes()).hexdigest(),'count':126,'suite':Path(__file__).name,'items':evidence},ensure_ascii=False,indent=2)+'\n')
print('PASS 126 Applied 2 answers: independent edge topology, integer enumeration, ranking matching, cell coordinates, grade-school carries, subsequence DP, subset-sum DP; original duplicates excluded')

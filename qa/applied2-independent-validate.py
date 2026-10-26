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
 if no==16:
  footprint=[tuple(pair) for pair in p['footprint']]
  front=tuple(p['frontHeights']);solutions=[]
  for values in it.product(range(1,5),repeat=len(footprint)):
   heights=dict(zip(footprint,values))
   if tuple(max((heights[r,c] for r,c in footprint if c==col),default=0) for col in range(4))!=front:continue
   side=tuple(max((heights[r,c] for r,c in footprint if r==row),default=0) for row in reversed(range(4)))
   solutions.append(side)
  assert len(solutions)==1 and list(solutions[0])==p['sideHeights']==p['answer']
  return list(solutions[0])
 if no==21:
  tree=((((0,1),2),(3,4)),((5,(6,7)),(((8,9),10),11)))
  def leaves(node):return [node] if isinstance(node,int) else leaves(node[0])+leaves(node[1])
  equations=[]
  def balances(node):
   if isinstance(node,int):return
   left,right=node
   row=[Fraction(0) for _ in range(13)]
   for leaf in leaves(left):row[leaf]+=1
   for leaf in leaves(right):row[leaf]-=1
   equations.append(row)
   balances(left);balances(right)
  balances(tree)
  known=[Fraction(0) for _ in range(13)];known[p['givenLeaf']]=1;known[12]=Fraction(p['givenGrams']);equations.append(known)
  assert len(equations)==12 and sorted(leaves(tree))==list(range(12))
  for col in range(12):
   pivot=next((r for r in range(col,12) if equations[r][col]),None)
   assert pivot is not None
   equations[col],equations[pivot]=equations[pivot],equations[col]
   factor=equations[col][col];equations[col]=[v/factor for v in equations[col]]
   for r in range(12):
    if r==col:continue
    factor=equations[r][col]
    if factor:equations[r]=[a-factor*b for a,b in zip(equations[r],equations[col])]
  result=[equations[i][12] for i in range(12)]
  assert all(v.denominator==1 and v>0 for v in result)
  assert result[p['givenLeaf']]==p['givenGrams'] and result[p['targetLeaf']]==p['answer']
  return [int(result[p['targetLeaf']])]
 if no==28:
  w,d,h=p['width'],p['depth'],p['height']
  intervals=lambda n:[(start,end) for start in range(n) for end in range(start+1,n+1)]
  direct=sum(1 for _ in it.product(intervals(w),intervals(d),intervals(h)))
  assert direct==p['answer'] and [len(intervals(n)) for n in (w,d,h)]==p['axisCounts']
  return [direct]
 if no==19:
  boxes=p['boxes'];runs=tuple(p['runs']);found=0
  for bits in it.product((0,1),repeat=boxes):
   groups=[];current=0
   for bit in bits+(0,):
    if bit:current+=1
    elif current:groups.append(current);current=0
   found+=tuple(groups)==runs
  unused=boxes-sum(runs)-2
  assert len(runs)==3 and unused>=0 and found==sum(1 for a in range(unused+1) for b in range(unused-a+1) for c in range(unused-a-b+1) if unused-a-b-c>=0)==p['answer']
  return [found]
 if no==7:
  sums=p['bridgeSums'];solutions=[]
  for a,b,c,d in it.product(range(1,26),repeat=4):
   if {'AB':a+b,'AC':a+c,'AD':a+d,'BD':b+d,'CD':c+d}==sums:solutions.append((a,b,c,d))
  assert len(solutions)==1
  a,b,c,d=solutions[0];derived=(sums['AB']+sums['AD']-sums['BD'])//2
  assert derived==a and a+b==sums['AB'] and a+c==sums['AC'] and a+d==sums['AD'] and b+d==sums['BD'] and c+d==sums['CD']
  return [sum(solutions[0])]
 if no==4:
  cells=[(0,0),(0,1),(1,0),(1,1),(2,0),(2,1),(2,2)]
  heights=range(1,4);front=tuple(p['frontMax']);rows=tuple(p['topDepthMax']);direct=0
  for values in it.product(heights,repeat=len(cells)):
   a=dict(zip(cells,values))
   seen_front=tuple(max(a[r,c] for r,c in cells if c==j) for j in range(3))
   seen_rows=tuple(max(a[r,c] for r,c in cells if r==i) for i in range(3))
   direct += seen_front==front and seen_rows==rows
  row_cells=[[(0,0),(0,1)],[(1,0),(1,1)],[(2,0),(2,1),(2,2)]];choices=[]
  for i,coords in enumerate(row_cells):
   choices.append([dict(zip(coords,h)) for h in it.product(heights,repeat=len(coords)) if max(h)==rows[i]])
  factored=0
  for a in choices[0]:
   for b in choices[1]:
    for c in choices[2]:
     joined={**a,**b,**c}
     factored += tuple(max(joined[r,col] for r,col in cells if col==j) for j in range(3))==front
  assert direct==factored==p['answer']
  return [direct]
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
 if no==3:
  letters='ABCDE';answers=[]
  for permutation in it.permutations(range(10),5):
   digits=dict(zip(letters,permutation))
   if any(digits[word[0]]==0 for word in (p['addend1Pattern'],p['addend2Pattern'],p['sumPattern'])):continue
   number=lambda word:int(''.join(str(digits[ch]) for ch in word))
   if number(p['addend1Pattern'])+number(p['addend2Pattern'])==number(p['sumPattern']):answers.append([digits[ch] for ch in letters])
  assert len(answers)==p['solutionCount']==1
  return answers[0]
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
 if no==24:
  people=p['personOrder'];foods=p['foodOrder'];rides=p['rideOrder'];ages=p['ageMap']
  solutions=[]
  for age_values in it.permutations([11,12,13,14,15]):
   age_by_person=dict(zip(people,age_values))
   if age_by_person[people[1]]!=ages['14'] or age_by_person[people[4]]!=ages['12']:continue
   for food_values in it.permutations(foods):
    food_by_person=dict(zip(people,food_values))
    if food_by_person[people[0]]!=foods[0] or food_by_person[people[3]]==foods[2]:continue
    ice=next(n for n in people if food_by_person[n]==foods[0])
    if age_by_person[ice]!=ages['13'] or food_by_person[people[3]]!=foods[3] or food_by_person[people[4]]!=foods[4]:continue
    for ride_values in it.permutations(rides):
     ride_by_person=dict(zip(people,ride_values))
     if ride_by_person[people[1]]==rides[0] or ride_by_person[people[2]]==rides[2]:continue
     if ride_by_person[people[4]]!=rides[3] or ride_by_person[people[3]]!=rides[4]:continue
     rider=next(n for n in people if ride_by_person[n]==rides[1])
     if age_by_person[rider]!=ages['15']:continue
     flume=next(n for n in people if ride_by_person[n]==rides[2])
     if food_by_person[flume]!=foods[1]:continue
     solutions.append([v for n in people for v in [age_by_person[n],food_by_person[n],ride_by_person[n]]])
  assert len(solutions)==p['solutionCount']==1
  return solutions[0]
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

originals={7:{'nodes':[10,9,9,12],'bridgeSums':{'AB':19,'AC':19,'AD':22,'BD':21,'CD':21},'graphEdges':['AB','AC','AD','BD','CD'],'answer':40},1:{'triangles':50,'base':6,'equalSide':10},2:{'total':30,'matches':108},3:{'addend1Pattern':'ABC','addend2Pattern':'BD','sumPattern':'CEEA'},6:{'difference':23},8:{'denominators':[3,4,5],'oldYears':13},10:{'students':544},12:{'stage':55},16:{'footprint':[[0,1],[1,1],[1,3],[2,2],[3,0],[3,1]],'frontHeights':[4,1,3,2],'sideHeights':[4,3,2,1]},18:{'total':50,'A':20,'B':15,'C':18,'AB':8,'BC':5,'AC':10,'none':18},19:{'boxes':10,'runs':[2,3,1]},21:{'givenLeaf':11,'givenGrams':32,'targetLeaf':0},25:{'remaining':12,'bags':3,'fixed':6,'eat':11},26:{'eldestAtFirst':12,'currentSum':45,'futureYears':6},27:{'hundreds':2,'tensPartialHundreds':3,'productHundreds':5,'productTens':7},28:{'width':5,'depth':3,'height':3},29:{'delete':100,'from':1,'to':100},30:{'cards':list(range(1,13)),'countRatio':2,'sumRatio':2}}
evidence=[]
for x in data['items']:
 no=x['sourceNo']
 # Types with standalone source-specific validators are audited by their own suites.
 if no not in originals and no != 4:continue
 p=x['verification']['parameters'];assert p!=originals.get(no),'the original question is not an added variant'
 assert not (no==23 and p['digits'] in [10,11])
 if no==11:assert not (p['second']==list('BDAC') and p['correctPosition']==1)
 answer=solve(no,p);assert answer==x['answerParts'],(x['id'],answer,x['answerParts'])
 assert len(x['answerLabels'])==len(x['answerParts']) and len(x['solutionSteps'])>=3
 assert x['pointBand']==('2.7' if no<=12 else '3.4' if no<=22 else '4.2')
 evidence.append({'id':x['id'],'passed':True,'answer':answer})
assert len(evidence)==9*len(set(originals)|{4})
for no in data['availableSourceNos']:
 group=[x for x in data['items'] if x['sourceNo']==no];assert len(group)==len({json.dumps(x['verification']['parameters'],sort_keys=True) for x in group})==9
out=ROOT/'.private-work/hw-expansion-20261023/hw2/independent-math.json';out.write_text(json.dumps({'dataSha256':hashlib.sha256(file.read_bytes()).hexdigest(),'count':len(evidence),'suite':Path(__file__).name,'items':evidence},ensure_ascii=False,indent=2)+'\n')
print(f'PASS {len(evidence)} Applied 2 answers: independent cube-projection enumeration, edge topology, integer and letter enumeration, logic-grid permutations, grade-school carries, subsequence DP and subset-sum DP')

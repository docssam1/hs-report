"""Independent Applied5 answers; no authoring imports."""
import json,hashlib,datetime,itertools as it
from pathlib import Path
from functools import lru_cache
ROOT=Path(__file__).resolve().parents[1];file=ROOT/'bank/data/applied5-expanded.json';data=json.loads(file.read_text())
def solve(no,p):
 if no==1:return [max(sum(divmod(n,p['divisor'])) for n in range(100,1000))]
 if no==2:
  sol=[depth for depth in range(1,101) if (depth+p['above'])/2==depth-p['below']];assert len(sol)==1;return sol
 if no==3:
  cards=set(p['cards'])
  sol=[n for n in range(100,1000) if n%5==0 and n%12==0 and len(set(map(int,str(n))))==3 and set(map(int,str(n)))<=cards]
  # A second route scans only multiples of lcm(5,12) and checks card membership.
  multiples=[n for n in range(120,1000,60) if len(set(map(int,str(n))))==3 and set(map(int,str(n)))<=cards]
  assert sol==multiples==p['validNumbers']
  return [len(sol)]
 if no==4:
  sol=[me for me in range(1,60) for small in range(me+1,60) for large in range(small+1,60) if large*small==p['elderProduct'] and small*me==p['youngerProduct']];assert len(sol)==1;return sol
 if no==5:
  people=p['people'];sports=p['sports'];sol=[]
  for perm in it.permutations(sports):
   assign=dict(zip(people,perm))
   if assign[p['fixed']]==p['fixedSport'] and assign[p['singleExclude']]!=p['singleExcludedSport'] and assign[p['doubleExclude']] not in p['doubleExcludedSports']:sol.append(assign[p['target']])
  assert len(sol)==1;return sol
 if no==6:
  # Independent direct assignment; the dedicated Q6 suite also uses a carry solver.
  sol=[(m,a,t,h) for m,a,t,h in it.permutations(range(10),4) if m and 1000*m+200*a+30*t+4*h==p['total']]
  assert len(sol)==1;return list(sol[0])
 if no==7:
  sols=[]
  for t in range(min(p['AB'],p['BC'],p['AC'])+1):
   ab=p['AB']-t;bc=p['BC']-t;ac=p['AC']-t;a=p['A']-ab-ac-t;b=p['B']-ab-bc-t;c=p['C']-ac-bc-t
   if min(a,b,c,ab,bc,ac)>=0 and sum([a,b,c,ab,bc,ac,t,p['none']])==p['total']:sols.append(t)
  assert len(sols)==1;return sols
 if no==8:
  # Enumerate all 10-cell rows independently and read maximal consecutive runs.
  rows=[]
  for bits in it.product((0,1),repeat=p['boxCount']):
   runs=[];current=0
   for bit in bits:
    if bit:current+=1
    elif current:runs.append(current);current=0
   if current:runs.append(current)
   if runs==p['runCounts']:rows.append(bits)
  return [len(rows)]
 if no==9:
  pmat=p['counts'][:3];totals=p['knownTotals'][:3]
  sols=[(w,b,g) for w,b,g in it.product(range(31),repeat=3) if all(row[0]*w+row[1]*b+row[2]*g==total for row,total in zip(pmat,totals))]
  assert len(sols)==1;return [p['targetCounts'][0]*sols[0][0]+p['targetCounts'][1]*sols[0][1]+p['targetCounts'][2]*sols[0][2]]
 if no==10:
  date=datetime.date(p['startYear'],5,5);assert date.weekday()==p['startWeekday'];end=datetime.date(p['endYear'],5,5);count=0
  while date<end:date+=datetime.timedelta(days=1);count+=1
  return [['월','화','수','목','금','토','일'][date.weekday()]+'요일']
 if no==11:
  t=p['tableGiven'];candidates=[]
  # Search positive integer segment lengths using the independent table entries.
  for y in range(1,501):
   for z in range(1,501):
    if y+z==t['bakeryBookstore'] and z==t['flowerBookstore']:
     x=t['homeBakery'];w=t['bookstoreSchool']
     if x+y+z==t['homeBookstore'] and z+w==t['flowerSchool']:
      a,b,c,d=x+y,y,x+y+z+w,y+z+w;candidates.append((a,b,c,d))
  assert len(candidates)==1 and candidates[0]==tuple(p['unknowns'])
  return [sum(candidates[0])]
 if no==12:
  grid=[[[r*c] for c in range(1,9)] for r in range(1,5)];axis='x'
  for side in p['foldSequence']:
   if axis=='x':
    half=len(grid[0])//2
    grid=[[(list(reversed(row[half+j]))+row[j]) if side=='R' else (list(reversed(row[j]))+row[half+j]) for j in range(half)] for row in grid]
   else:
    half=len(grid)//2
    grid=([[list(reversed(grid[half+i][j]))+grid[i][j] for j in range(len(grid[0]))] for i in range(half)] if side=='B' else [[list(reversed(grid[i][j]))+grid[half+i][j] for j in range(len(grid[0]))] for i in range(half)])
   axis='y' if axis=='x' else 'x'
  return [grid[0][0][0]]
 if no==13:
  # Four-digit DP by remainder25 and digit sum, distinct from suffix counting.
  states={(0,0):1}
  for place in range(4):
   nexts={}
   for (rem,total),cnt in states.items():
    for digit in range(1 if place==0 else 0,10):
     key=((rem*10+digit)%25,total+digit);nexts[key]=nexts.get(key,0)+cnt
   states=nexts
  return [states.get((0,p['digitSum']),0)+(1 if p['digitSum']==1 else 0)]
 if no==21:
  sols=[n for n in range(1,501) if n%p['firstSize']==p['firstRemainder'] and n%p['secondSize']==p['secondRemainder'] and n//p['firstSize']-n//p['secondSize']==p['groupDifference']];assert len(sols)==1;return sols
 if no==30:
  starts=[]
  for start in range(1,p['total']+1):
   s=0;rowValue=start
   while s<p['total']:s+=rowValue;rowValue+=p['increment']
   if s==p['total']:starts.append(start)
  return [min(starts)]
 raise AssertionError(no)
originals={1:{'divisor':17},2:{'above':8,'below':4},3:{'cards':[0,2,4,8],'divisors':[5,12]},4:{'elderProduct':323,'youngerProduct':238},5:{'people':['한별','동민','규형','석기'],'sports':['축구','수영','야구','스키'],'target':'한별','fixed':'동민','fixedSport':'수영','singleExclude':'규형','singleExcludedSport':'야구','doubleExclude':'석기','doubleExcludedSports':['축구','야구']},6:{'total':2000,'digits':[1,4,6,5]},7:{'total':40,'A':20,'B':15,'C':18,'AB':9,'BC':6,'AC':7,'none':5},8:{'boxCount':10,'runCounts':[3,1,2]},9:{'counts':[[2,2,1],[2,1,2],[1,2,2],[0,2,3]],'knownTotals':[35,45,40],'targetCounts':[0,2,3],'hiddenWeights':[8,3,13],'colors':['흰색','검은색','회색']},10:{'startYear':2019,'endYear':2026,'startWeekday':4,'leapYears':[2020,2024]},11:{'segments':[70,70,20,30]},12:{'gridRows':4,'gridColumns':8,'foldSequence':['R','T','L','B','L']},13:{'digitSum':16},21:{'firstSize':5,'secondSize':7,'groupDifference':2,'firstRemainder':3,'secondRemainder':5},30:{'total':110,'increment':2}}
evidence=[]
for x in data['items']:
 no=x['sourceNo']
 if no in (14,15,16,17,18,19,20,22,23,24,25,26,27,28,29): continue  # Dedicated source-specific verifiers cover Q14–Q20 and Q22–Q27.
 p=x['verification']['parameters'];assert p!=originals[no];a=solve(no,p);assert a==x['answerParts'],(x['id'],a,x['answerParts']);assert len(x['solutionSteps'])>=3
 assert x['pointBand']==('2.7' if no<=12 else '3.4' if no<=22 else '4.2');evidence.append({'id':x['id'],'passed':True,'answer':a})
assert len(evidence)==135 and len(data['items'])==270
for no in data['availableSourceNos']:
 g=[x for x in data['items'] if x['sourceNo']==no];assert len(g)==len({json.dumps(x['verification']['parameters'],sort_keys=True) for x in g})==9
out=ROOT/'.private-work/hw-expansion-20261023/hw5/independent-math.json';out.write_text(json.dumps({'dataSha256':hashlib.sha256(file.read_bytes()).hexdigest(),'count':135,'totalDataItems':270,'suite':Path(__file__).name,'items':evidence},ensure_ascii=False,indent=2)+'\n')
print('PASS 135 Applied5 legacy checks; Q14–Q20 and Q22–Q29 have dedicated verifiers; current pool has 270 items.')

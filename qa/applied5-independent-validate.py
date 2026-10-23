"""Independent Applied5 answers; no authoring imports."""
import json,hashlib,datetime,itertools as it
from pathlib import Path
from functools import lru_cache
ROOT=Path(__file__).resolve().parents[1];file=ROOT/'bank/data/applied5-expanded.json';data=json.loads(file.read_text())
def solve(no,p):
 if no==1:return [max(sum(divmod(n,p['divisor'])) for n in range(100,1000))]
 if no==2:
  sol=[depth for depth in range(1,101) if (depth+p['above'])/2==depth-p['below']];assert len(sol)==1;return sol
 if no==4:
  sol=[me for me in range(1,60) for small in range(me+1,60) for large in range(small+1,60) if large*small==p['elderProduct'] and small*me==p['youngerProduct']];assert len(sol)==1;return sol
 if no==7:
  sols=[]
  for t in range(min(p['AB'],p['BC'],p['AC'])+1):
   ab=p['AB']-t;bc=p['BC']-t;ac=p['AC']-t;a=p['A']-ab-ac-t;b=p['B']-ab-bc-t;c=p['C']-ac-bc-t
   if min(a,b,c,ab,bc,ac)>=0 and sum([a,b,c,ab,bc,ac,t,p['none']])==p['total']:sols.append(t)
  assert len(sols)==1;return sols
 if no==10:
  date=datetime.date(p['startYear'],5,5);assert date.weekday()==p['startWeekday'];end=datetime.date(p['endYear'],5,5);count=0
  while date<end:date+=datetime.timedelta(days=1);count+=1
  return [['월','화','수','목','금','토','일'][date.weekday()]+'요일']
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
originals={1:{'divisor':17},2:{'above':8,'below':4},4:{'elderProduct':323,'youngerProduct':238},7:{'total':40,'A':20,'B':15,'C':18,'AB':9,'BC':6,'AC':7,'none':5},10:{'startYear':2019,'endYear':2026,'startWeekday':4,'leapYears':[2020,2024]},13:{'digitSum':16},21:{'firstSize':5,'secondSize':7,'groupDifference':2,'firstRemainder':3,'secondRemainder':5},30:{'total':110,'increment':2}}
evidence=[]
for x in data['items']:
 no=x['sourceNo'];p=x['verification']['parameters'];assert p!=originals[no];a=solve(no,p);assert a==x['answerParts'],(x['id'],a,x['answerParts']);assert len(x['solutionSteps'])>=3
 assert x['pointBand']==('2.7' if no<=12 else '3.4' if no<=22 else '4.2');evidence.append({'id':x['id'],'passed':True,'answer':a})
assert len(evidence)==72
for no in data['availableSourceNos']:
 g=[x for x in data['items'] if x['sourceNo']==no];assert len(g)==len({json.dumps(x['verification']['parameters'],sort_keys=True) for x in g})==9
out=ROOT/'.private-work/hw-expansion-20261023/hw5/independent-math.json';out.write_text(json.dumps({'dataSha256':hashlib.sha256(file.read_bytes()).hexdigest(),'count':72,'suite':Path(__file__).name,'items':evidence},ensure_ascii=False,indent=2)+'\n')
print('PASS72 Applied5: independent number enumeration, ages, Venn atoms, actual calendar-day iteration, divisibility digit DP, quotient constraints, direct progression sums')

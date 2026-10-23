"""Independent binary strings, incidence permutations, mass equations, folds and CSP."""
import functools,itertools,json,re,math,xml.etree.ElementTree as ET
from fractions import Fraction as F
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
COLORS=['빨강','초록','노랑','보라','주황'];OBJECTS=['책','공','블록','연필','퍼즐'];BOXES=['가','나','다','라','마']

@functools.lru_cache(None)
def binary_states():
 out=[]
 for bits in itertools.product([0,1],repeat=10):
  s=''.join(map(str,bits));runs=[len(q)for q in s.split('0')if q]
  if runs==[2,3,1]:out.append(bits)
 assert len(out)==10;return out

def gaps(bits):
 starts=[i for i,v in enumerate(bits)if v and(i==0 or bits[i-1]==0)];ends=[i for i,v in enumerate(bits)if v and(i==9 or bits[i+1]==0)]
 return [starts[0],starts[1]-ends[0]-1,starts[2]-ends[1]-1,9-ends[2]]

@functools.lru_cache(None)
def circle_assignment():
 candidates=[]
 for a in itertools.permutations([1,2,3,4,5,6,7,9]):
  s=a+(8,)
  if s[0]+s[1]==s[1]+s[2]+s[3]==s[3]+s[4]+s[5]==s[5]+s[6]+s[7]==s[7]+s[8]==11:candidates.append(s)
 assert candidates==[(9,2,5,4,6,1,7,3,8)];return candidates[0]

@functools.lru_cache(None)
def mobile_weights():
 tree=[[[[0,1],2],[3,4]],[[5,[6,7]],[[[8,9],10],11]]];matrix=[]
 def traverse(t):
  if isinstance(t,int):return[t]
  left,right=[traverse(x)for x in t];row=[F(0)]*13
  for i in left:row[i]=F(1)
  for i in right:row[i]=F(-1)
  matrix.append(row);return left+right
 traverse(tree);row=[F(0)]*13;row[11]=F(1);row[12]=F(32);matrix.append(row);assert len(matrix)==12
 for c in range(12):
  k=next(r for r in range(c,12)if matrix[r][c]);matrix[c],matrix[k]=matrix[k],matrix[c];scale=matrix[c][c];matrix[c]=[x/scale for x in matrix[c]]
  for r in range(12):
   if r!=c:
    amount=matrix[r][c];matrix[r]=[a-amount*b for a,b in zip(matrix[r],matrix[c])]
 weights=[r[-1]for r in matrix];assert all(v.denominator==1 and v>0 for v in weights)
 return tuple(map(int,weights))

# Actual three fold transformations: first upper-left diagonal, then upper-right,
# finally bottom strip upwards. Original paper is0<=x<=1,0<=y<=3/2.
def folded(point):
 x,y=point
 if y<1-x:x,y=1-y,1-x
 if y<x:x,y=y,x
 if y>1:y=2-y
 return x,y

def preimages(point):
 candidates={point,(point[0],2-point[1])}
 candidates={v for x,y in candidates for v in [(x,y),(y,x)]}
 candidates={v for x,y in candidates for v in [(x,y),(1-y,1-x)]}
 return {p for p in candidates if 0<=p[0]<=1 and 0<=p[1]<=F(3,2)and folded(p)==point}

@functools.lru_cache(None)
def folded_circles():
 source=[(F(1,2),F(3,5)),(F(1,2),F(3,4)),(F(1,6),F(11,12)),(F(5,6),F(11,12))];small=[]
 directions=[(F(1),F(0)),(F(0),F(1)),(F(3,5),F(4,5)),(F(4,5),F(3,5))]
 directions={(a*s,b*t)for a,b in directions for s in [-1,1]for t in [-1,1]}
 groups=[]
 for q,radius in [(q,F(11,500))for q in source]+[((F(1,2),F(1)),F(1,10))]:
  centers=preimages(q);complete={p for p in centers if min(p[0],1-p[0],p[1],F(3,2)-p[1])>=radius};partial=centers-complete
  for cx,cy in centers:
   for dx,dy in directions:
    p=cx+radius*dx,cy+radius*dy
    if not(0<=p[0]<=1 and 0<=p[1]<=F(3,2)):continue
    x,y=folded(p);assert(x-q[0])**2+(y-q[1])**2==radius**2
  groups.append((centers,complete,partial))
 assert[len(c)for s,c,p in groups]==[5,5,5,5,1]and[len(p)for s,c,p in groups]==[0,0,0,0,3]
 assert len(set.union(*(s for s,c,p in groups[:4])))==20
 return groups

def validate_round_svg(item):
 path=ROOT/'bank'/item['solutionAsset']['src'];svg=ET.parse(path).getroot();circles=[n for n in svg.iter()if n.tag.endswith('circle')];groups=folded_circles()
 for kind,expected in [('small',set.union(*(s for s,c,p in groups[:4]))),('large',groups[-1][0])]:
  nodes=[n for n in circles if n.get('data-kind')==kind];assert len(nodes)==len(expected)
  actual={(float(n.get('cx')),float(n.get('cy')))for n in nodes};assert all(any(abs(float(x)-a)<1e-10 and abs(float(y)-b)<1e-10 for a,b in actual)for x,y in expected)
  assert all(float(n.get('r'))==(.022 if kind=='small'else.1)for n in nodes)
 clip=next(n for n in svg.iter()if n.tag.endswith('clipPath'));rect=list(clip)[0];assert[float(rect.get(k))for k in ['x','y','width','height']]==[0,0,1,1.5]
 assert any(n.get('clip-path')=='url(#paper)'for n in svg.iter())

#24: parse the real displayed Korean clauses into a different numeric-node CSP.
def selector_map(n,k):
 m={BOXES[i]+' 보관함':i for i in range(n)}
 for v in range(n):m[COLORS[v]+' 표식의 보관함']=n+v
 if k==3:
  for v in range(n):m[OBJECTS[v]+'이 든 보관함']=2*n+v
 return m

def parsed_clues(item):
 p=item['verification']['parameters'];n,k=p['n'],p['attributeCount'];names=selector_map(n,k);out=[]
 for row in item['givenTable']['rows']:
  assert len(row)==1;t=row[0];m=re.fullmatch(r'(.+)의 번호는 (.+)의 번호보다(\d+) 큽니다\.',t)
  if m:out.append(('delta',names[m[1]],names[m[2]],int(m[3])));continue
  m=re.fullmatch(r'(.+)과 (.+)은 (서로 다른|같은) 보관함입니다\.',t);assert m,t;out.append(('ne'if m[3]=='서로 다른'else'eq',names[m[1]],names[m[2]],0))
 def formal(c):
  vals=[s[1]if s[0]=='b'else s[1]*n+s[2]for s in c['s']];a,b=vals;d=c.get('d',0)
  if c['op']=='delta'and d<0:a,b,d=b,a,-d
  return c['op'],a,b,d
 assert out==[formal(c)for c in p['clues']]
 return tuple(out)

def logic_search(n,k,clues,limit=2):
 constraints=list(clues)+[('ne',a,b,0)for g in range(k)for a,b in itertools.combinations(range(g*n,(g+1)*n),2)]
 def valid(op,x,y,d):return x==y if op=='eq'else x!=y if op=='ne'else x-y==d
 def reduce(dom):
  while True:
   old=[s.copy()for s in dom]
   for op,a,b,d in constraints:
    left,right=dom[a].copy(),dom[b].copy();dom[a]={x for x in left if any(valid(op,x,y,d)for y in right)};dom[b]={y for y in right if any(valid(op,x,y,d)for x in left)}
    if not dom[a]or not dom[b]:return None
   if dom==old:return dom
 answers=[]
 def rec(dom):
  dom=reduce(dom)
  if dom is None:return
  pending=[i for i,s in enumerate(dom)if len(s)>1]
  if not pending:answers.append(tuple(next(iter(s))for s in dom));return
  i=min(pending,key=lambda i:len(dom[i]))
  for value in sorted(dom[i]):
   nxt=[s.copy()for s in dom];nxt[i]={value};rec(nxt)
   if len(answers)>=limit:return
 rec([set(range(1,n+1))for _ in range(n*k)])
 return answers

@functools.lru_cache(None)
def logic_checked(n,k,clues):
 answers=logic_search(n,k,clues);assert len(answers)==1
 for i in range(len(clues)):assert len(logic_search(n,k,clues[:i]+clues[i+1:]))>=2,('unnecessary clue',i)
 return answers[0]

def school_product(a,b):
 digits=[0]*(len(a)+len(b))
 for i,x in enumerate(reversed(a)):
  for j,y in enumerate(reversed(b)):digits[i+j]+=int(x)*int(y)
 for i in range(len(digits)-1):digits[i+1]+=digits[i]//10;digits[i]%=10
 while len(digits)>1 and digits[-1]==0:digits.pop()
 return ''.join(map(str,reversed(digits)))

def solve_finalgroups(item):
 no,level,p=item['sourceNo'],item['practiceLevel'],item['verification']['parameters']
 if no==19:
  states=binary_states()
  if level=='low':return[sum(s[p['index']]==p['value']for s in states)]
  if level=='middle':
   found=[]
   for s in states:
    a,b,c,d=gaps(s);mode=p['mode'];ok={'outerEqual':a==d,'innerEqual':b==c,'frontLess':a<d,'firstGapMore':b>c,'innerOuterEqual':b+c==a+d}[mode]
    if ok:found.append(s)
   return[len(found)]
  pairs=[(a,b)for a,b in itertools.combinations(states,2)if(sum(x*y for x,y in zip(a,b))==p['common']if p['mode']=='common'else a[0]!=b[0])]
  rows=item['solutionTable']['rows'];assert len(rows)==10;assert sum(int(row[1])for row in rows)==len(pairs)
  for i,s in enumerate(states):
   assert rows[i][0]==''.join('●'if b else'○'for b in s)
   assert int(rows[i][1])==sum(a==s for a,b in pairs)
  return[len(pairs)]
 if no==20:
  a=circle_assignment()
  if level=='low':
   assert all(a[i]==v for i,v in p['givens']);return[a[p['query']]]
  if level=='middle':return[dict(aloneSum=sum(a[::2]),sharedSum=sum(a[1::2]),endOverlapProduct=a[1]*a[7],aloneTopDifference=sorted(a[::2])[-1]-sorted(a[::2])[-2],sharedRange=max(a[1::2])-min(a[1::2]))[p['mode']]]
  found=[]
  for x in range(1,p['total']//sum(a[::2])+1):
   for y in range(1,p['total']//sum(a[1::2])+1):
    values=[v*(x if i%2==0 else y)for i,v in enumerate(a)]
    totals=[values[0]+values[1]]+[sum(values[i:i+3])for i in [1,3,5]]+[values[7]+values[8]]
    if sum(values)==p['total']and sum(totals)==p['circleTotal']:found.append([x,y])
  assert len(found)==1;return found[0]
 if no==21:
  w=mobile_weights()
  if level=='low':return[w[p['leaf']-1]]
  if level=='middle':found=[[a,p['total']-a]for a in range(1,p['total'])if w[p['lightLeaf']-1]*a+w[p['heavyLeaf']-1]*(p['total']-a)==p['mass']]
  else:found=[[a,b,p['total']-a-b]for a in range(1,p['total'])for b in range(1,p['total']-a)if a-b==p['lightExcess']and sum(w[i-1]*v for i,v in zip(p['leaves'],[a,b,p['total']-a-b]))==p['mass']]
  assert len(found)==1;return found[0]
 if no==22:
  g=folded_circles();small=sum(len(c)for s,c,h in g[:4]);big=len(g[-1][1]);notches=len(g[-1][2]);validate_round_svg(item)
  if level=='low':return[dict(oneSmall=len(g[0][1]),allSmall=small,largeOnly=big,outerNotches=notches,threeSmallAndLarge=small-len(g[0][1])+big)[p['mode']]]
  if level=='middle':found=[[a,p['total']-a]for a in range(1,p['total'])if(small+big)*a+small*(p['total']-a)==p['complete']]
  else:found=[[a,b,p['total']-a-b]for a in range(1,p['total'])for b in range(1,p['total']-a)if(small+big)*a+small*b+big*(p['total']-a-b)==p['complete']and notches*(p['total']-b)==p['notches']]
  assert len(found)==1;return found[0]
 if no==23:
  n=p.get('digits',p.get('ones'));m=p.get('digits',p.get('nines'));a,b='1'*n,'9'*m;product=school_product(a,b)
  if not item.get('preservedApprovedId'):assert a+'×'+b in item['text']
  return[sum(int(d)%2 for d in product)]
 if no==24:
  n,k=p['n'],p['attributeCount'];clues=parsed_clues(item);solution=logic_checked(n,k,clues);rows=[];answers=[]
  for i in range(n):
   number=solution[i];color=COLORS[next(v for v in range(n)if solution[n+v]==number)];row=[BOXES[i],str(number),color];a=[number,color]
   if k==3:
    obj=OBJECTS[next(v for v in range(n)if solution[2*n+v]==number)];row.append(obj);a.append(obj)
   rows.append(row);answers.extend(a)
  assert item['solutionTable']['rows']==rows
  assert item['responseTable']['rows']==[[BOXES[i]]+['']*k for i in range(n)]
  assert len(item['givenTable']['rows'])==len(clues)
  return answers
 raise AssertionError(no)

"""Independent flood-fill, constraint search, and vertex-subset solvers for new27."""
from pathlib import Path
import json,itertools,collections,hashlib
ROOT=Path(__file__).resolve().parents[1];W=ROOT/'.private-work/nine-expansion-20261024/round4-missing-9-11-12';FILE=ROOT/'bank/data/applied4-expanded.json';data=json.loads(FILE.read_text());old=json.loads((W/'prior-expanded.json').read_text())
assert data['items'][:108]==old['items']and data['version']==old['version']
assert len(data['items'])==135 and len(data['availableSourceNos'])==15 and data['policy']['targetVariantsPerSource']==9
def fold(mask):
 # Independent120x120 paper cells: reflect actual cut locations, then count connected pieces.
 N=120;blocked=set();segments=[]
 for code in mask:
  if code=='L':a,b=(90,30),(120,30)
  elif code=='C':a,b=(60,60),(120,60)
  elif code=='R':a,b=(90,90),(120,90)
  elif code=='H':a,b=(80,40),(80,80)
  else:raise AssertionError(code)
  for transform in[lambda x,y:(x,y),lambda x,y:(y,x),lambda x,y:(N-y,N-x),lambda x,y:(N-x,N-y)]:segments.append((transform(*a),transform(*b)))
 for a,b in segments:
  if a[0]==b[0]:
   x=a[0]
   for y in range(min(a[1],b[1]),max(a[1],b[1])):blocked.add(frozenset(((x-1,y),(x,y))))
  else:
   assert a[1]==b[1];y=a[1]
   for x in range(min(a[0],b[0]),max(a[0],b[0])):blocked.add(frozenset(((x,y-1),(x,y))))
 remaining=set(itertools.product(range(N),repeat=2));pieces=[]
 while remaining:
  start=remaining.pop();todo=[start];count=1
  while todo:
   x,y=todo.pop()
   for q in[(x+1,y),(x-1,y),(x,y+1),(x,y-1)]:
    if q in remaining and frozenset(((x,y),q))not in blocked:remaining.remove(q);todo.append(q);count+=1
  pieces.append(count)
 assert sum(pieces)==N*N
 return len(pieces)
assert fold('LCRH')==12
cells=[(1,0),(2,0),(0,1),(1,1),(2,1),(3,1),(1,2),(2,2)];neighbors={i:{j for j in range(8)if i!=j and max(abs(cells[i][0]-cells[j][0]),abs(cells[i][1]-cells[j][1]))==1}for i in range(8)}
def placements(p):
 answer=[None]*8;fixed={int(k):v for k,v in p['givens'].items()};solutions=[]
 def walk(unused):
  if not unused:solutions.append(tuple(answer));return
  candidates={}
  for i in range(8):
   if answer[i]is not None:continue
   candidates[i]=[v for v in sorted(unused)if(i not in fixed or v==fixed[i])and all(answer[j]is None or abs(v-answer[j])!=1 for j in neighbors[i])]
  i=min(candidates,key=lambda i:(len(candidates[i]),-len(neighbors[i]),i))
  for v in candidates[i]:answer[i]=v;walk(unused-{v});answer[i]=None
 walk(set(p['cards']));return sorted(solutions)
def quadrilaterals(p):
 # Independent binary membership of all256 subsets; each4point set is convex on a circle.
 count=0
 for bits in itertools.product([False,True],repeat=8):
  if sum(bits)!=4 or any(not bits[i]for i in p['required'])or any(bits[i]for i in p['excluded']):continue
  if p['mode']=='exactlyOne'and bits[0]==bits[4]:continue
  if p['mode']=='notBoth'and bits[0]and bits[4]:continue
  count+=1
 return[count]
rows=[]
for x in data['items'][108:]:
 no=x['sourceNo'];p=x['verification']['parameters'];expected=x['answerParts'];assert x['pointBand']=='2.7'and x['difficultyEvidence']['label']=='하';assert len(x['solutionSteps'])>=3
 if no==9:actual=[fold(p['cuts'])]
 elif no==11:
  sols=placements(p);assert len(sols)==4 and sols==sorted(tuple(t)for t in x['acceptedAnswerParts']);assert tuple(expected)in sols;actual=expected
  assert any(tuple(t)!=tuple(expected)for t in x['acceptedAnswerParts']);assert len(x['solutionTable']['rows'])==sum(v+1 in p['cards']for v in p['cards'])
  for row in x['solutionTable']['rows']:
   a,b=map(int,row[0].split('·'));ia,ib=expected.index(a),expected.index(b);assert row[3:]==[abs(cells[ia][0]-cells[ib][0]),abs(cells[ia][1]-cells[ib][1])];assert max(row[3:])>=2
 elif no==12:actual=quadrilaterals(p)
 else:raise AssertionError(no)
 assert actual==expected,(x['id'],actual,expected);assert not x.get('conditionSummary')and not x.get('solutionAsset');rows.append(dict(id=x['id'],passed=True,answer=actual,acceptedPlacementCount=4 if no==11 else 1))
assert len(rows)==27 and len({x['id']for x in data['items']})==135
(W/'independent-math.json').write_text(json.dumps(dict(dataSha256=hashlib.sha256(FILE.read_bytes()).hexdigest(),count=135,newCount=27,prior108Exact=True,originalAllFourCuts=12,allGridVariantsFourAnswers=True,items=rows),ensure_ascii=False,indent=2)+'\n');print('PASS new27:actual reflected cuts+120x120 floodfill;all4 placements per grid via constraint search;256 vertex subsets;old108 exact/storage version unchanged')

"""Independent geometric and 24-orientation validation of Applied 4 Q21 variants."""
from pathlib import Path
from itertools import permutations,product
import hashlib,json,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.private-work/nine-expansion-20261024/round10-q21'
DATA=ROOT/'bank/data/applied4-expanded.json';PRE=WORK/'pre-q21-data.json';SOURCE=ROOT/'materials/초등과정 대비 실전 모의고사 활용 4회.pdf';ANSWER=ROOT/'.private-work/balanced15-20261024/source/applied4-answer.pdf'
DIRS=[(1,0,0),(-1,0,0),(0,1,0),(0,-1,0),(0,0,1),(0,0,-1)]
BASE={(0,0,1):1,(0,0,-1):6,(0,-1,0):2,(0,1,0):5,(1,0,0):3,(-1,0,0):4}
def parity(p):return (-1)**sum(p[i]>p[j] for i in range(3) for j in range(i+1,3))
def dot(a,b):return sum(x*y for x,y in zip(a,b))
def matrix_rotations():
 out=[]
 for p in permutations(range(3)):
  for sig in product((-1,1),repeat=3):
   if parity(p)*sig[0]*sig[1]*sig[2]!=1:continue
   cols=[]
   for k in range(3):
    v=[0,0,0];v[p[k]]=sig[k];cols.append(tuple(v))
   out.append(tuple(cols))
 return out
def roll_states():
 start={v:k for k,v in BASE.items()};stack=[start];seen={tuple(sorted(start.items()))}
 while stack:
  s=stack.pop()
  for ax in [(1,0,0),(0,1,0),(0,0,1)]:
   nxt={}
   for lab,v in s.items():
    dp=dot(ax,v);cr=(ax[1]*v[2]-ax[2]*v[1],ax[2]*v[0]-ax[0]*v[2],ax[0]*v[1]-ax[1]*v[0])
    nxt[lab]=tuple(ax[i]*dp+cr[i] for i in range(3))
   key=tuple(sorted(nxt.items()))
   if key not in seen:seen.add(key);stack.append(nxt)
 return [dict(s) for s in seen]
def holes(dims,axis,lines):
 out=set()
 for ln in lines:
  if axis=='x':y,z=ln;out.update((x,y,z) for x in range(dims[0]))
  elif axis=='y':x,z=ln;out.update((x,y,z) for y in range(dims[1]))
  else:x,y=ln;out.update((x,y,z) for z in range(dims[2]))
 return out
def exposed(c,occ,dims):
 ans=[]
 for v in DIRS:
  n=tuple(c[i]+v[i] for i in range(3))
  if any(n[i]<0 or n[i]>=dims[i] for i in range(3)) or n not in occ:ans.append(v)
 return ans
def connected(occ):
 todo=[next(iter(occ))];seen=set(todo)
 while todo:
  c=todo.pop()
  for d in DIRS:
   n=tuple(c[i]+d[i] for i in range(3))
   if n in occ and n not in seen:seen.add(n);todo.append(n)
 return len(seen)==len(occ)
def main():
 d=json.loads(DATA.read_text());pre=json.loads(PRE.read_text());xs=[x for x in d['items'] if x['sourceNo']==21]
 assert len(xs)==9 and d['items'][:len(pre['items'])]==pre['items'] and len(pre['items'])==216
 assert d['availableSourceNos']==sorted(pre['availableSourceNos']+[21,30]) and d['pendingSourceNos']==[1,2,3,4]
 assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()=='f7bbaf0a1f5de40434882b8c0da70cc5b8fb20188f03c5c77458b6a5cac05c59'
 assert hashlib.sha256(ANSWER.read_bytes()).hexdigest()=='67f66e5fa57df1d463261e184f1dced30e3ffbcf0a802a1ec2d9b8066d122fe8'
 rots=matrix_rotations();states=roll_states();assert len(rots)==len(states)==24
 stages=['low']*3+['middle']*3+['high']*3;proof=[]
 for j,(q,stage) in enumerate(zip(xs,stages),1):
  p=q['verification']['parameters'];dims=tuple(p['dimensions']);axis=p['tunnelAxis'];lines=[tuple(v) for v in p['tunnelLines']]
  h=holes(dims,axis,lines);full={(x,y,z) for x in range(dims[0]) for y in range(dims[1]) for z in range(dims[2])};occ=full-h
  assert h=={tuple(c) for c in p['removedCubeCoordinates']} and len(h)==len(p['removedCubeCoordinates'])
  assert len(occ)==p['remainingCubeCount'] and connected(occ)
  per=[];totalfaces=0
  for c in sorted(occ):
   faces=exposed(c,occ,dims);totalfaces+=len(faces)
   m=[]
   for rot in rots:
    m.append(sum(BASE[tuple(dot(v,rot[k]) for k in range(3))] for v in faces))
   r=[]
   for state in states:
    inv={v:lab for lab,v in state.items()};r.append(sum(inv[v] for v in faces))
   assert sorted(m)==sorted(r)
   per.append({'cube':list(c),'exposedFaceCount':len(faces),'minimum':min(m),'maximum':max(m),'orientationScoreSet':sorted(set(m))})
  hi=sum(x['maximum'] for x in per);lo=sum(x['minimum'] for x in per)
  assert per==p['perCube'] and (hi,lo)==(p['maximum'],p['minimum'])==tuple(q['answerParts'])
  assert q['answer']==f'{hi}, {lo}' and q['acceptedAnswers']==[f'{hi}, {lo}',f'{hi} {lo}']
  assert totalfaces==p['visibleFaceCount'] and q['practiceStage']==stage and q['pointBand']=='4.2' and q['difficultyEvidence']['label']=='상'
  assert q['verification']['sourceAnswer']=={'maximum':424,'minimum':332} and not q['verification']['sourceAnswerMatch']
  svg=ROOT/'bank'/q['asset']['src'];root=ET.parse(svg).getroot();assert root.tag.endswith('svg')
  assert len(root.findall('.//{http://www.w3.org/2000/svg}polygon'))>=len(h)
  proof.append({'id':q['id'],'dimensions':dims,'removed':len(h),'remaining':len(occ),'max':hi,'min':lo,'exposedFaces':totalfaces})
 assert [sum(x['practiceStage']==s for x in xs) for s in ('low','middle','high')]==[3,3,3]
 report={'passed':True,'sourceQuestionSha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'sourceAnswerSha256':hashlib.sha256(ANSWER.read_bytes()).hexdigest(),'sourceAnswerVisual':{'max':424,'min':332},'rotationStatesCrossChecked':24,'prior216Exact':True,'variantCount':9,'items':proof,'dataSha256':hashlib.sha256(DATA.read_bytes()).hexdigest()}
 (WORK/'q21-independent-math.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 print('PASS Q21: source answer read directly; nine new tunnel diagrams; every die checked across 24 matrix and physical-roll states; prior 216 exact')
if __name__=='__main__':main()

"""Add only missing nine-item groups; preserve all existing rows and storage versions."""
from pathlib import Path
from fractions import Fraction as F
import itertools as it,json,hashlib,collections
ROOT=Path(__file__).resolve().parents[2];W=ROOT/'.private-work/nine-expansion-20261024/round4-missing-9-11-12';FILE=ROOT/'bank/data/applied4-expanded.json'
old_bytes=FILE.read_bytes();data=json.loads(old_bytes);old_items=json.loads(json.dumps(data['items']));assert len(old_items)==108 and all(x['sourceNo']not in[9,11,12]for x in old_items)
W.mkdir(parents=True,exist_ok=True);(W/'prior-expanded.json').write_bytes(old_bytes)
def point(x,y):return(F(x),F(y))
def cross(a,b):return a[0]*b[1]-a[1]*b[0]
def sub(a,b):return(a[0]-b[0],a[1]-b[1])
def on(p,a,b):return cross(sub(p,a),sub(b,a))==0 and all(min(a[k],b[k])<=p[k]<=max(a[k],b[k])for k in[0,1])
def fold_segments(mask):
 primitives={'L':(point(F(3,4),F(1,4)),point(1,F(1,4))),'C':(point(F(1,2),F(1,2)),point(1,F(1,2))),'R':(point(F(3,4),F(3,4)),point(1,F(3,4))),'H':(point(F(2,3),F(1,3)),point(F(2,3),F(2,3)))}
 maps=[lambda x,y:(x,y),lambda x,y:(y,x),lambda x,y:(1-y,1-x),lambda x,y:(1-x,1-y)]
 return list({tuple(sorted((f(*a),f(*b))))for code in mask for a,b in[primitives[code]]for f in maps})
def regions(mask):
 seg=fold_segments(mask)+[(point(0,0),point(1,0)),(point(1,0),point(1,1)),(point(1,1),point(0,1)),(point(0,1),point(0,0))];vertices={p for s in seg for p in s}
 for (a,b),(c,d)in it.combinations(seg,2):
  u=sub(b,a);v=sub(d,c);den=cross(u,v)
  if den:
   t=cross(sub(c,a),v)/den;p=(a[0]+t*u[0],a[1]+t*u[1])
   if on(p,a,b)and on(p,c,d):vertices.add(p)
 edges=set()
 for a,b in seg:
  points=sorted(p for p in vertices if on(p,a,b));edges.update(tuple(sorted(t))for t in zip(points,points[1:]))
 graph={p:set()for p in vertices}
 for a,b in edges:graph[a].add(b);graph[b].add(a)
 seen=set();components=0
 for p in vertices:
  if p in seen:continue
  components+=1;todo=[p]
  while todo:
   q=todo.pop()
   if q not in seen:seen.add(q);todo.extend(graph[q]-seen)
 return len(edges)-len(vertices)+components,dict(vertices=len(vertices),edges=len(edges),components=components)
meta={9:('도형','접기와 자르기','두 번 접은 종이의 절단과 펼친 조각','접힌 종이의 절단선을 펼쳤을 때 이어지는 자리를 구별하기'),11:('경우의 수','배열과 이웃 조건','연속한 수가 이웃하지 않는 여덟 칸 배열','이웃이 많은 칸에 놓을 수 있는 수를 먼저 제한하고 전체 배치를 확인하기'),12:('경우의 수','점의 선택과 도형','원 위 여덟 점에서 조건에 맞는 사각형','꼭 넣을 점과 쓰지 않을 점을 구분하고 같은 네 점을 중복해서 세지 않기')}
new=[]
def add(no,text,answer,labels,steps,p,**extra):
 area,subarea,detail,learning=meta[no];v=1+sum(x['sourceNo']==no for x in new)
 x=dict(id=f'applied4-q{no:02d}-v{v}',genId=f'applied4-q{no:02d}',sourceSet='applied',sourceRound=4,sourceNo=no,variantNo=v,reviewStatus='pending-output-review',practiceStorageVersion='20261024-applied4-new9-r2',area=area,subarea=subarea,detailType=detail,pointBand='2.7',text=text,answer=', '.join(map(str,answer)),answerParts=answer,answerLabels=labels,answerContract='ordered-parts',acceptedAnswers=[', '.join(map(str,answer))],solutionSteps=steps,solution=' '.join(steps),learningPoint=learning,learningLocation=f'활용 4회 · 원문 {no}번 · {detail}',verification=dict(primaryMethod={9:'exact reflected cut-segment planar graph',11:'complete permutations with source-grid constraints',12:'required/excluded vertex combinations'}[no],parameters=p,independentSuite='qa/applied4-nine-additions-independent-validate.py',sourceExamPage=2,sourceAnswerPage=no,studentDifficultyMeasured=False),difficultyEvidence=dict(basis='source-point-band',label='하',sourceReasoningPreserved=True,measuredVariantRate=None),levelReview=dict(basis='source-point-band-2.7',measured=False,axes=dict(sourceThought='원본의 접기/이웃배열/네점선택 유지',conditions='선택 절단선/숫자 목록·고정칸/필수·제외점은 문제 지문에서 명시',steps='추가 계산 힌트 없이 조건 결합',representation='정확한 원본 그림 보존',answer='숫자 또는 모든 유효 여덟칸 배열 허용',domain='원본 영역과 학습 범위 유지',search='원본과 같은 유한한 분류·탐색',load='8칸·8점·두 접기는 원형 고정',measurement='학생 실측 난도 아님')))
 x.update(extra);new.append(x);return x
fold_cases=[('LCR','세로 점선 세 개만 따라 자르고 가로 점선은 자르지 않습니다.'),('H','가로 점선만 따라 자르고 세로 점선은 자르지 않습니다.'),('C','가운데 세로 점선만 따라 자릅니다.'),('LR','양 끝의 세로 점선 두 개만 따라 자릅니다.'),('CH','가운데 세로 점선과 가로 점선만 따라 자릅니다.'),('LH','맨 왼쪽 세로 점선과 가로 점선만 따라 자릅니다.'),('LRH','양 끝의 세로 점선 두 개와 가로 점선만 따라 자릅니다.'),('LCH','맨 왼쪽과 가운데 세로 점선,가로 점선만 따라 자릅니다.'),('RCH','맨 오른쪽과 가운데 세로 점선,가로 점선만 따라 자릅니다.')]
for mask,condition in fold_cases:
 answer,proof=regions(mask)
 explanations={'LCR':['가운데 절단선을 펼치면 종이를 가로·세로로 가르는 십자 절단이 되어4부분입니다.','양 끝 절단선을 펼치면 네 모서리에서 각각 한 조각씩 더 나뉩니다.','가로 점선은 자르지 않았으므로4＋4＝8조각입니다.'],'H':['가로 점선은 마지막 삼각형의 꼭짓점 쪽과 긴 변 쪽을 나눕니다.','두 접기를 풀면 이 절단선 네 개가 종이 가운데의 닫힌 사각형을 이룹니다.','가운데 조각 하나와 바깥 조각 하나로2조각입니다.'],'C':['마지막 삼각형의 가운데 세로 점선을 펼친 자리를 거꾸로 따라갑니다.','첫 번째 접기까지 펴면 절단선이 두 방향으로 이어지고,모두 펴면 십자 모양입니다.','접힌 자국 자체는 절단선이 아니며 십자로 갈라진4조각입니다.'],'LR':['왼쪽 세로 절단선을 펼치면 서로 마주 보는 두 모서리가 잘려 나옵니다.','오른쪽 세로 절단선은 나머지 두 모서리를 자릅니다.','모서리4조각과 이어진 가운데1조각으로5조각입니다.'],'CH':['가운데 세로 절단선을 펼친 십자 절단으로4부분이 됩니다.','가로 절단선을 펼치면 가운데의 닫힌 사각형 경계가 생깁니다.','십자로 나뉜 각 부분이 다시 둘로 나뉘므로4×2＝8조각입니다.'],'LH':['왼쪽 세로 절단선으로 서로 마주 보는 두 모서리가 떨어집니다.','가로 절단선은 가운데의 닫힌 사각형 조각 하나를 따로 만듭니다.','모서리2개·가운데1개·그 밖에 이어진1개로4조각입니다.'],'LRH':['양 끝 세로 절단선으로 네 모서리가 떨어집니다.','가로 절단선으로 가운데의 닫힌 사각형 조각 하나가 떨어집니다.','모서리4개·가운데1개·그 사이에 이어진1개로6조각입니다.'],'LCH':['가운데 세로 절단선과 가로 절단선을 펼친 결과는8조각입니다.','왼쪽 세로 절단선으로 서로 마주 보는 두 모서리가 각각 하나씩 더 나뉩니다.','따라서8＋2＝10조각입니다.'],'RCH':['가운데 세로 절단선과 가로 절단선을 펼친 결과는8조각입니다.','오른쪽 세로 절단선으로 서로 마주 보는 두 모서리가 각각 하나씩 더 나뉩니다.','따라서8＋2＝10조각입니다.']}
 add(9,'정사각형 색종이를 그림처럼 두 번 접었습니다. '+condition+' 색종이를 모두 펼치면 몇 조각입니까?',[answer],['조각 수'],explanations[mask],dict(cuts=mask,authorGraph=proof),asset=dict(src='assets/applied4/folding-cuts-original.png',description='원본의 두 접기와 세로 세 점선·가로 한 점선',detail=dict(src='assets/applied4/folding-cuts-detail-original.png',description='같은 원본 그림의 마지막 절단선 확대',width=141,height=82)))
pos=[(1,0),(2,0),(0,1),(1,1),(2,1),(3,1),(1,2),(2,2)];edges=[(i,j)for i in range(8)for j in range(i)if max(abs(pos[i][0]-pos[j][0]),abs(pos[i][1]-pos[j][1]))==1]
labels=['윗줄 왼쪽','윗줄 오른쪽','가운뎃줄 첫째','가운뎃줄 둘째','가운뎃줄 셋째','가운뎃줄 넷째','아랫줄 왼쪽','아랫줄 오른쪽']
cases=[(list(range(2,10)),{}),(list(range(3,11)),{})]+[([v for v in range(1,10)if v!=gap],given)for gap,given in[(2,{0:3}),(3,{1:9}),(4,{2:6}),(5,{0:1,1:3}),(6,{3:5}),(7,{6:2}),(8,{7:7})]]
for cards,given in cases:
 solutions=[list(t)for t in it.permutations(cards)if all(t[i]==v for i,v in given.items())and all(abs(t[i]-t[j])!=1 for i,j in edges)];assert len(solutions)==4;answer=solutions[0]
 clause=' '.join(f'{labels[i]} 칸의 수는{v}입니다.'for i,v in given.items());rows=[dict(numberPair=f'{a}·{a+1}',firstCell=labels[answer.index(a)],secondCell=labels[answer.index(a+1)],dx=abs(pos[answer.index(a)][0]-pos[answer.index(a+1)][0]),dy=abs(pos[answer.index(a)][1]-pos[answer.index(a+1)][1]))for a in cards if a+1 in cards]
 steps=['가운뎃줄 안쪽 두 칸은 각각 다른 칸 중 한 칸과만 이웃하지 않습니다. 따라서 앞뒤 연속한 수가 모두 목록에 있는 수를 그 칸에 넣으면 두 수를 동시에 피할 수 없습니다.',f'이 조건으로 안쪽 두 칸의 후보를 제한한 뒤 주어진 칸 조건을 맞추어 놓습니다. 가능한 한 예는 윗줄{answer[:2]},가운뎃줄{answer[2:6]},아랫줄{answer[6:]}입니다.','목록에 함께 있는 연속한 두 수의 위치를 다음 표처럼 확인합니다. 각 쌍은 가로 또는 세로로 두 칸 이상 떨어져 있어 이웃하지 않습니다.','숫자8개를 각각 한 번씩 쓰고 고정한 칸도 만족합니다. 이 예와 다르더라도 모든 조건에 맞는 배치는 정답입니다.']
 x=add(11,'다음 수8개를 그림의 빈칸에 각각 한 번씩 넣으시오. 가로·세로·대각선으로 이웃한 칸에는 차가1인 두 수가 들어갈 수 없습니다. '+clause,answer,labels,steps,dict(cards=cards,givens=given,cells=pos),asset=dict(src='assets/applied4/nonconsecutive-grid-original.png',description='원본의 윗줄2칸·가운뎃줄4칸·아랫줄2칸'),promptDataLines=[' · '.join(map(str,cards))],acceptedAnswerParts=solutions,answerLayout='eight-cell-placement',solutionTable=dict(headers=['두 수','첫 수의 칸','다음 수의 칸','가로 차','세로 차'],rows=[[r['numberPair'],r['firstCell'],r['secondCell'],r['dx'],r['dy']]for r in rows]))
 x['answer']+=' (가능한 한 예)';x['acceptedAnswers']=[', '.join(map(str,a))for a in solutions]
point_cases=[('원 위의 점 중 맨 위의 점은 쓰지 않습니다.',[],[0],None),('맨 위의 점을 반드시 꼭짓점으로 씁니다.',[0],[],None),('맨 위와 맨 아래의 두 점을 모두 꼭짓점으로 씁니다.',[0,4],[],None),('맨 위와 맨 아래의 두 점은 쓰지 않습니다.',[],[0,4],None),('맨 위·맨 아래·맨 왼쪽의 세 점을 모두 꼭짓점으로 씁니다.',[0,4,6],[],None),('맨 위·맨 아래·맨 왼쪽의 세 점은 쓰지 않습니다.',[],[0,4,6],None),('맨 위와 맨 아래의 두 점 중 정확히 하나를 꼭짓점으로 씁니다.',[],[],'exactlyOne'),('맨 위와 맨 아래의 두 점을 동시에 꼭짓점으로 쓸 수 없습니다.',[],[],'notBoth'),('맨 위의 점은 반드시 쓰고 맨 아래의 점은 쓰지 않습니다.',[0],[4],None)]
for condition,required,excluded,mode in point_cases:
 valid=[t for t in it.combinations(range(8),4)if set(required)<=set(t)and not set(excluded)&set(t)and(mode!='exactlyOne'or len(set(t)&{0,4})==1)and(mode!='notBoth'or len(set(t)&{0,4})<2)];answer=len(valid)
 if mode=='exactlyOne':steps=['맨 위의 점을 쓰고 맨 아래의 점을 안 쓰는 경우와 그 반대 경우로 나눕니다.','각 경우 나머지6점에서3점을 고르므로6×5×4÷(3×2×1)＝20가지입니다.','두 경우가 겹치지 않으므로20×2＝40개입니다.']
 elif mode=='notBoth':steps=['제한 없이8점에서4점을 고르면8×7×6×5÷(4×3×2×1)＝70개입니다.','맨 위와 맨 아래를 모두 고른 경우는 나머지6점 중2점을 고르는6×5÷2＝15개입니다.','금지한 경우15개만 빼면70−15＝55개입니다.']
 else:
  free=8-len(required)-len(excluded);choose=4-len(required);steps=[f'반드시 쓸 점{len(required)}개와 쓰지 않을 점{len(excluded)}개를 구별합니다. 나머지{free}개 점에서{choose}개를 고릅니다.',f'서로 다른{free}점에서{choose}점을 순서 없이 고르는 방법은'+{(7,4):'7×6×5×4÷(4×3×2×1)＝35',(7,3):'7×6×5÷(3×2×1)＝35',(6,2):'6×5÷2＝15',(6,4):'6×5×4×3÷(4×3×2×1)＝15',(5,1):'5',(5,4):'5',(6,3):'6×5×4÷(3×2×1)＝20'}[(free,choose)]+'가지입니다.','원 위의 서로 다른 네 점은 사각형 하나를 정합니다. 같은 네 점을 잇는 순서만 바꾼 것은 다시 세지 않습니다.']
 add(12,'그림의 원 위8개 점 중4개를 꼭짓점으로 하여 사각형을 만듭니다. '+condition+' 만들 수 있는 서로 다른 사각형은 몇 개입니까?',[answer],['사각형 수'],steps,dict(required=required,excluded=excluded,mode=mode),asset=dict(src='assets/applied4/eight-circle-points-original.png',description='원본의 원 위 여덟 점'))
assert len(new)==27 and all(sum(x['sourceNo']==n for x in new)==9 for n in[9,11,12])
assert regions('LCRH')[0]==12
data['revision']='20261024-applied4-expansion-r2';data['items']+=new;data['availableSourceNos']=sorted(data['availableSourceNos']+[9,11,12]);data['pendingSourceNos']=[n for n in data['pendingSourceNos']if n not in[9,11,12]];data['pendingAdditionSummary']=dict(newCount=27,sourceNos=[9,11,12],prior108Exact=True)
assert data['items'][:108]==old_items
FILE.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');(W/'authored-summary.json').write_text(json.dumps(dict(count=135,newCount=27,prior108Sha256=hashlib.sha256(old_bytes).hexdigest(),oldVersionPreserved=data['version'],newStorageVersion='20261024-applied4-new9-r2',foldOriginalAllFourCuts=regions('LCRH'),foldVariants={m:regions(m)[0]for m,_ in fold_cases},gridAnswersPerVariant=4,sourceGradesChanged=False),indent=2)+'\n');print('Authored27 new Applied4 variants;prior108 exact;135 total;all new groups pending output review')

"""Build nine independently solved chicken-pen bridge-sum variants for Applied 2 Q07."""
import hashlib, itertools, json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사 활용 2회.pdf'
ANSWER=ROOT/'.private-work/hw-expansion-20261023/applied2-answer-source.pdf'
DATA_PATH=ROOT/'bank/data/applied2-expanded.json'
INDEX_PATH=ROOT/'bank/data/applied2-expanded-index.json'
exam_sha=hashlib.sha256(EXAM.read_bytes()).hexdigest()
answer_sha=hashlib.sha256(ANSWER.read_bytes()).hexdigest()
assert exam_sha=='1af1698985c657774c00eb9abc0466b07f8cb79bca64d2c379ea18b8cae67aab'
assert answer_sha=='074180c770e7e76d77dca35410f14246a5eaa373feba8061d3f390c320b5ffdc'

# Edges in the exact source graph: 가-나, 가-다, 가-라, 나-라, 다-라. 나-다는 absent.
VARIANTS=[
 (7,6,8,10),
 (9,8,5,11),
 (12,7,9,8),
 (6,11,10,13),
 (14,5,8,9),
 (8,13,6,7),
 (11,10,7,15),
 (5,12,14,6),
 (13,9,12,5),
]
def bridge_sums(a,b,c,d):
 return {'AB':a+b,'AC':a+c,'AD':a+d,'BD':b+d,'CD':c+d}
def solve_by_enumeration(sums):
 solutions=[]
 for a,b,c,d in itertools.product(range(1,26),repeat=4):
  if bridge_sums(a,b,c,d)==sums: solutions.append((a,b,c,d))
 return solutions
def solve_by_elimination(sums):
 # (가+나)-(나+라)+(가+라)=2가; then recover the other three.
 a=(sums['AB']+sums['AD']-sums['BD'])//2
 b=sums['AB']-a; c=sums['AC']-a; d=sums['AD']-a
 assert bridge_sums(a,b,c,d)==sums
 return (a,b,c,d)
def write_svg(sums,path):
 w,h=520,350
 points={'A':(112,92),'B':(408,92),'C':(112,270),'D':(408,270)}
 edges=[('A','B','AB'),('A','C','AC'),('A','D','AD'),('B','D','BD'),('C','D','CD')]
 out=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">',
      '<rect width="100%" height="100%" fill="white"/>']
 for a,b,key in edges:
  x1,y1=points[a];x2,y2=points[b]
  out.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#777" stroke-width="7" stroke-linecap="round"/>')
  mx,my=(x1+x2)/2,(y1+y2)/2
  out.append(f'<circle cx="{mx}" cy="{my}" r="19" fill="white" stroke="#333" stroke-width="1.8"/>')
  out.append(f'<text x="{mx}" y="{my+6}" text-anchor="middle" font-family="serif" font-size="17" fill="#191511">{sums[key]}</text>')
 labels={'A':'가','B':'나','C':'다','D':'라'}
 for key,(x,y) in points.items():
  out.append(f'<rect x="{x-47}" y="{y-31}" width="94" height="62" rx="5" fill="#f7f2e7" stroke="#2f6b4a" stroke-width="2"/>')
  out.append(f'<text x="{x}" y="{y+7}" text-anchor="middle" font-family="serif" font-size="22" fill="#191511">{labels[key]} 우리</text>')
 out.append('</svg>')
 path.write_text('\n'.join(out)+'\n')

data=json.loads(DATA_PATH.read_text());index=json.loads(INDEX_PATH.read_text())
assert data['version']==index['version']
assert 7 in data['pendingSourceNos']
data['items']=[x for x in data['items'] if x['sourceNo']!=7]
index['items']=[x for x in index['items'] if x['sourceNo']!=7]
items=[]
for i,values in enumerate(VARIANTS,1):
 sums=bridge_sums(*values)
 enum=solve_by_enumeration(sums);elim=solve_by_elimination(sums)
 assert len(enum)==1 and enum[0]==elim==values
 total=sum(values)
 src=f'assets/applied2/q07-v{i}.svg'
 write_svg(sums,ROOT/'bank'/src)
 steps=[
  f'가 우리에 든 수를 a, 나를 b, 다를 c, 라를 d라 두면 a+b={sums["AB"]}, a+d={sums["AD"]}, b+d={sums["BD"]}입니다.',
  f'첫째와 둘째 식을 더하고 셋째 식을 빼면 2a={sums["AB"]}+{sums["AD"]}-{sums["BD"]}={2*values[0]}이므로 a={values[0]}입니다.',
  f'나머지 식에서 b={sums["AB"]}-{values[0]}={values[1]}, c={sums["AC"]}-{values[0]}={values[2]}, d={sums["AD"]}-{values[0]}={values[3]}입니다. 다리의 다섯 합 조건을 모두 확인하면 해는 하나입니다.',
  f'따라서 병아리는 모두 {values[0]}+{values[1]}+{values[2]}+{values[3]}={total}마리입니다.',
 ]
 items.append({
  'id':f'applied2-q07-v{i}','genId':'applied2-q07','sourceSet':'applied','sourceRound':2,'sourceNo':7,'variantNo':i,'reviewStatus':'verified',
  'area':'수와식','subarea':'합과 미지수의 관계','detailType':'연결된 네 우리와 다리 위 합으로 각 우리 수와 전체 구하기','pointBand':'2.7',
  'text':'병아리가 들어 있는 네 우리가 다리로 연결되어 있습니다. 다리 위 숫자는 연결된 두 우리 안에 들어 있는 병아리 수의 합을 나타냅니다. 병아리는 모두 몇 마리인가요?',
  'answer':str(total),'answerContract':'ordered-parts','answerParts':[total],'answerLabels':['병아리 수'],'acceptedAnswers':[str(total)],
  'solutionSteps':steps,'solution':' '.join(steps),
  'learningPoint':'세 다리의 합을 더하고 빼서 한 우리 수를 구한 뒤 나머지 우리 수와 전체를 확인하기',
  'learningLocation':'활용 2회 · 원문 7번 · 연결된 우리와 합의 조건',
  'verification':{
   'primaryMethod':'양의 정수 네 변수 1~25 전수탐색',
   'independentMethod':'세 간선합을 더하고 빼는 소거식으로 각 변수를 복원한 뒤 다섯 조건 대입 확인',
   'parameters':{'nodes':list(values),'bridgeSums':sums,'graphEdges':['AB','AC','AD','BD','CD'],'answer':total},
   'sourceExamPage':2,'sourceAnswerPage':2,'sourceTextDirectlyReviewed':True,'sourceFigureDirectlyReviewed':True,
   'sourceAnswerCandidate':40,'independentSourceAnswer':40,'sourceAnswerCandidateOfficiality':'unverified',
   'sourceExamSha256':exam_sha,'sourceAnswerSha256':answer_sha,'originalFigurePreserved':True,'variantFiguresCreatedFresh':True,
   'enumerationSolutionCount':len(enum),'independentMethodAgrees':enum[0]==elim,
  },
  'difficultyEvidence':{'basis':'source-point-band','label':'하','sourceReasoningPreserved':True,'measuredVariantRate':None},
  'asset':{'kind':'svg','src':src,'description':'네 우리와 다섯 다리의 병아리 수 합'},
 })
data['items'].extend(items);data['items'].sort(key=lambda x:(x['sourceNo'],x['variantNo']))
data['availableSourceNos']=sorted(set(data['availableSourceNos'])|{7})
data['pendingSourceNos']=[n for n in data['pendingSourceNos'] if n!=7]
data['version']='20261026-applied2-q07-confirmed-r1';data['itemCount']=len(data['items'])
data.setdefault('sourceEditionNotes',{})['7']='현행 원문 p.2의 네 우리-다섯 다리 그래프를 직접 확인. 다섯 합 조건을 양의 정수 네 변수 1~25 범위 전수탐색 및 소거식으로 독립 검산해 전체 40마리. 답안 후보 p.2 필기 40과 일치하나 공식 판본 동일성은 미확정. 원본 그림 보존, 새 그래프 SVG 9개.'
data['reviewSummary']['independentMathCount']=len(data['items']);data['reviewSummary']['sourceTypes']=len(data['availableSourceNos']);data['reviewSummary']['sourceDrawingCount']=len({x['sourceNo'] for x in data['items'] if x.get('asset')});data['reviewSummary']['outputReviewed']=False
index['version']=data['version'];index['itemCount']=len(data['items']);index['pendingSourceNos']=data['pendingSourceNos']
index['items'].append({'sourceNo':7,'genId':'applied2-q07','area':'수와식','subarea':'합과 미지수의 관계','detailType':'연결된 네 우리와 다리 위 합으로 각 우리 수와 전체 구하기','pointBand':'2.7','reviewStatus':'verified','variantCount':9})
index['items'].sort(key=lambda x:x['sourceNo'])
DATA_PATH.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');INDEX_PATH.write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n')
print('Built Applied2 Q07: nine connected-pen graph variants; totals',[x['answerParts'][0] for x in items])

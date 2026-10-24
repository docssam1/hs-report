"""Append two missing reviewed-source groups; do not regenerate completed originals."""
from pathlib import Path
import json,hashlib,shutil,math
ROOT=Path(__file__).resolve().parents[2]; W=ROOT/'.private-work/nine-expansion-20261024/round4-missing-15-18'; FILE=ROOT/'bank/data/applied4-expanded.json'
data=json.loads(FILE.read_text()); old=json.loads((W/'prior-expanded.json').read_text())
assert data==old and len(old['items'])==135 and not any(x['sourceNo'] in [15,18] for x in data['items'])
for name in ['square-spiral-original.png','wave-cells-original.png']: shutil.copyfile(W/name,ROOT/'bank/assets/applied4'/name)
new=[]
def add(no,n,parts,labels,text,steps,params):
    group=1+sum(x['sourceNo']==no for x in new)
    sub,detail,point,asset,page={15:('규칙과 수 배열','정사각형 묶음의 순서쌍','새 묶음의 항 수와 그 앞까지 적힌 수의 개수를 구별하기','square-spiral-original.png',3),18:('주기와 위치','색칠 경로의 주기와 칸 위치','같은 모양이 되돌아오는 색칠 차례와 가로 이동을 함께 구하기','wave-cells-original.png',4)}[no]
    new.append(dict(id=f'applied4-q{no:02d}-v{group}',genId=f'applied4-q{no:02d}',sourceSet='applied',sourceRound=4,sourceNo=no,variantNo=group,reviewStatus='pending-output-review',practiceStorageVersion='20261024-applied4-new9-r3',area='수와 식',subarea=sub,detailType=detail,pointBand='3.4',text=text,answer=', '.join(map(str,parts)),answerParts=parts,answerLabels=labels,answerContract='ordered-parts',acceptedAnswers=[', '.join(map(str,parts))],solutionSteps=steps,solution=' '.join(steps),learningPoint=point,learningLocation=f'활용 4회 · 원문 {no}번 · {detail}',asset=dict(src='assets/applied4/'+asset,description='현행 원문 PDF의 실제 배치·잘림 영역 그대로'),verification=dict(primaryMethod='closed-form square-layer count' if no==15 else 'cycle-position arithmetic',parameters=dict(target=n,**params),sourceExamPage=page,sourceAnswerPage=no,independentSuite='qa/applied4-nine-sequences-independent-validate.py',studentDifficultyMeasured=False),difficultyEvidence=dict(basis='source-point-band',label='중',sourceReasoningPreserved=True,measuredVariantRate=None),levelReview=dict(basis='source-point-band-3.4',measured=False,axes=dict(sourceThought='원본의 묶음별 항 수 또는 색칠 경로의 반복을 발견',conditions='같은 시작값과 진행 방향 유지',steps='기준 개수와 묶음 안 차례를 함께 계산',representation='실제 원본 그림 보존',answer='원본과 같은 두 성분 순서쌍',domain='원본 자연수 범위와 같은 학습 범위',search='묶음 또는 반복 단위 분류',load='원본과 비슷한 세 자리 목표',measurement='학생 실측 난도 아님'))))
for n in [72,80,88,96,112,128,144,160,180]:
    r=math.ceil((math.sqrt(2*n-1)-1)/2)
    while 1+2*r*(r+1)<n:r+=1
    while r and 1+2*(r-1)*r>=n:r-=1
    before=1+2*(r-1)*r;group=r+1;place=n-before
    steps=['1을 첫 묶음으로 두면 다음 정사각형 둘레의 수는 차례로4개,8개,12개로 늘어납니다.',f'{group-1}번째 묶음까지 적힌 수는1＋4×(1＋2＋…＋{r-1})＝{before}개입니다.',f'그 다음 묶음은{4*r}개이므로 마지막 수가{before+4*r}입니다. {n}은 이 묶음에 있습니다.',f'묶음 안의 차례는{n}−{before}＝{place}이므로 위치는({group},{place})입니다.']
    text=f'그림의 규칙에 따라 수를 계속 적습니다. 1을 첫 번째 묶음으로 보고, 같은 정사각형 둘레의 수를 한 묶음으로 묶어 안쪽부터 번호를 매깁니다. 위치를 (묶음 번호, 묶음 안에서 수가 적히는 차례)로 나타낼 때, {n}의 위치를 구하시오. 예를 들어10의 위치는 (3,5)입니다.'
    add(15,n,[group,place],['묶음 번호','묶음 안 차례'],text,steps,dict(layer=r,before=before))
cycle=[('가',1),('가',2),('나',2),('나',3),('다',3),('다',4),('라',4),('라',5),('라',6),('다',6),('다',7),('나',7),('나',8),('가',8)]
for n in [117,128,145,161,181,196,204,221,242]:
    q,k=divmod(n-1,14);row,col=cycle[k];column=col+8*q
    text=f'그림의 화살표를 따라 작은 정사각형을 한 칸씩 색칠합니다. 두 번째로 색칠하는 칸의 위치를 (가,2)로 나타낼 때, 같은 방법으로 {n}번째로 색칠하는 칸의 위치를 나타내시오.'
    steps=['첫 칸부터 화살표를 따라 세면14칸을 색칠한 뒤 같은 모양의 다음 부분으로 이어집니다. 같은 차례의 칸은 가로로8칸씩 오른쪽에 있습니다.',f'{n}−1＝14×{q}＋{k}이므로, 앞의{q}묶음 다음에 나오는{k+1}번째 칸입니다.',f'첫 묶음의{k+1}번째 칸은({row},{col})입니다. 행 이름은 그대로이고 열 번호에8×{q}을 더합니다.',f'{col}＋8×{q}＝{column}이므로 답은({row},{column})입니다.']
    add(18,n,[row,column],['행 이름','열 번호'],text,steps,dict(completedCycles=q,cycleIndex=k+1))
assert len(new)==18 and all(len([x for x in new if x['sourceNo']==no])==9 for no in [15,18])
data['items']+=new;data['revision']='20261024-applied4-expansion-r3';data['availableSourceNos']=sorted(data['availableSourceNos']+[15,18]);data['pendingSourceNos']=[n for n in data['pendingSourceNos'] if n not in [15,18]]
data['pendingAdditionSummary']=dict(newCount=18,sourceNos=[15,18],prior135Exact=True)
assert data['items'][:135]==old['items'] and data['version']==old['version']
FILE.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
(W/'authored-summary.json').write_text(json.dumps(dict(count=153,newCount=18,old135Exact=True,oldVersionPreserved=True,originalGradesChanged=False,answers={x['id']:x['answerParts'] for x in new}),ensure_ascii=False,indent=2)+'\n')
print('Authored18;old135 exact;pending source/output/maths gates')

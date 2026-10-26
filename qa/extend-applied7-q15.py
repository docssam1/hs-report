#!/usr/bin/env python3
"""Extend only the existing Applied 7 Q15 numbered-room path-counting type."""
import hashlib, json, subprocess
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.private-work/hw-expansion-20261023/hw7'
DATA_PATH=ROOT/'bank/data/applied7-expanded.json'
INDEX_PATH=ROOT/'bank/data/applied7-expanded-index.json'
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 7회.pdf'
ANSWER=WORK/'source-review/applied7-answer-candidate.pdf'
PDFTOTEXT=Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')
ASSET='assets/applied7/q15-honeycomb-original.png'
# Source drawing establishes an increasing numbered-room path graph. Adjacent rooms differ by 1 or 2.
ADJ={n:[m for m in (n+1,n+2) if m<=8] for n in range(1,9)}
@lru_cache(None)
def ways(a,b):
    if a==b:return 1
    return sum(ways(n,b) for n in ADJ[a] if n<=b)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
exam_text=subprocess.check_output([str(PDFTOTEXT),'-f','3','-l','3','-layout',str(EXAM),'-'],text=True,errors='replace')
answer_text=subprocess.check_output([str(PDFTOTEXT),'-f','3','-l','3','-layout',str(ANSWER),'-'],text=True,errors='replace')
assert '1번 방에서 8번방으로' in exam_text.replace(' ','') or ('1번 방에서 8번방으로' in exam_text)
assert '이동하는 방법은 모두 몇 가지입니까' in exam_text
assert '개미가 1번 방에서 8번방으로 이동하랴고 합니다' in answer_text
# Six single checkpoints and three ordered checkpoint pairs; all use the unmodified source diagram.
checkpoints=[(2,),(3,),(4,),(5,),(6,),(7,),(2,5),(3,6),(4,7)]
items=[]; proof=[]
for variant, req in enumerate(checkpoints,1):
    points=(1,)+req+(8,)
    segments=[ways(a,b) for a,b in zip(points,points[1:])]
    answer=1
    for n in segments:answer*=n
    if len(req)==1:
        condition=f'1번 방에서 8번 방까지 가면서 {req[0]}번 방을 반드시 지나갈 때'
        require_text=f'{req[0]}번 방을 지나가는 방법은 {segments[0]}가지이고, {req[0]}번 방에서 8번 방까지 가는 방법은 {segments[1]}가지입니다.'
    else:
        condition=f'1번 방에서 8번 방까지 가면서 {req[0]}번 방과 {req[1]}번 방을 차례로 모두 지나갈 때'
        require_text=f'1번 방에서 {req[0]}번 방까지는 {segments[0]}가지, {req[0]}번 방에서 {req[1]}번 방까지는 {segments[1]}가지, {req[1]}번 방에서 8번 방까지는 {segments[2]}가지입니다.'
    text=f'개미가 1번 방에서 8번 방으로 이동합니다. 작은 번호 방에서 이웃한 큰 번호 방으로만 이동할 수 있을 때, {condition} 이동하는 방법은 모두 몇 가지입니까?'
    steps=[require_text, '각 구간의 이동 방법을 이어서 선택하므로 구간별 방법 수를 곱합니다.', f'따라서 이동 방법은 {"×".join(map(str,segments))}={answer}가지입니다.']
    item={'id':f'applied7-q15-v{variant}','genId':'applied7-q15','sourceSet':'applied','sourceRound':7,'sourceNo':15,'variantNo':variant,'reviewStatus':'verified',
      'area':'경우의 수','subarea':'경로 세기','detailType':'번호가 증가하는 이웃 방으로 이동하는 경로 수 구하기',
      'pointBand':'3.4','text':text,'asset':{'kind':'raster','src':ASSET,'description':'활용 7회 원문 15번의 번호 방 그림을 원문 그대로 사용'},
      'answer':str(answer),'answerParts':[answer],'answerLabels':['이동 방법 수'],'acceptedAnswers':[str(answer)],'answerContract':'single-number',
      'solutionSteps':steps,'solution':' '.join(steps),'learningPoint':'번호가 증가하는 인접 방 이동을 구간별 경로 수로 나누어 곱한다',
      'learningLocation':'활용 7회 · 원문 15번 · 번호가 증가하는 방 이동 경로',
      'verification':{'primaryMethod':'그림의 방 인접 관계를 오름차순 방향 그래프로 두고 체크포인트별 경로 수를 곱한다.',
       'independentMethod':'1번에서 8번까지 가능한 모든 증가 경로를 재귀적으로 열거한 뒤 체크포인트 포함 경로만 센다.',
       'parameters':{'requiredRooms':list(req),'segmentWays':segments,'adjacency':'각 방 n에서 n+1 및 n+2 방으로 이동'},
       'independentSuite':'qa/applied7-q15-independent-validate.py','sourceExamPage':3,'sourceExamFile':EXAM.name,'sourceAnswerPage':3,
       'sourceDrawingCompared':True,'sourceDrawingPresent':True,'variantUsesSourceDrawing':True,'studentDifficultyMeasured':False},
      'difficultyEvidence':{'basis':'source-point-band','label':'중','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,
       'rationale':'활용 7회 원문 15번은 13~22번의 3.4점 배점대다. 활용 난도는 배점대만 적용한다.'}}
    items.append(item); proof.append({'variant':variant,'requiredRooms':list(req),'segments':segments,'answer':answer})

data=json.loads(DATA_PATH.read_text()); assert data['sourceRound']==7 and 15 not in data['availableSourceNos']
assert not any(x['sourceNo']==15 for x in data['items'])
data['items'].extend(items); data['items'].sort(key=lambda x:(x['sourceNo'],x['variantNo']))
data['availableSourceNos']=sorted(set(data['availableSourceNos']+[15])); data['pendingSourceNos']=[n for n in range(1,31) if n not in data['availableSourceNos']]; data['itemCount']=len(data['items'])
data['version']='20261025-applied7-expansion-q02-q03-q04-q05-q06-q07-q09-q10-q11-q12-q14-q15-q16-q18-q20-q21-q22-q23-q25-q26-q27-q28-q29-q30-r24'
review={'sourceExam':{'name':EXAM.name,'sha256':sha(EXAM),'questionPage':3,'questionNumber':15,'sourceQuestion':'1번 방에서 8번 방까지 번호가 커지는 이웃 방으로만 이동하는 경로 수','figurePresent':True},
 'sourceAnswer':{'name':ANSWER.name,'sha256':sha(ANSWER),'answerPage':3,'questionNumber':15,'teacherMarkedAnswer':21,'evidence':'답안 PDF p3의 손글씨에 각 방 누적 경로 수 1,1,2,3,5,8,13,21과 최종 21가지가 표시되어 있다.'},
 'directPageImagesCompared':True,'sourceAndAnswerMatch':True,'sourceTypeAlreadyPresent':True,'newSourceTypesAdded':0,'sourceAnswerIndependentCheck':{'pathsFrom1To8':ways(1,8)},
 'sourceDiagramAsset':ASSET,'sourceDiagramCrop':'p3/exam-3.png crop pixels x=1350..1870 y=1670..1930; no resize/recolor/line edits','newVariants':9,'allVariantsSameSourceType':True,'variants':proof}
(WORK/'q15-source-answer-review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
idx=json.loads(INDEX_PATH.read_text());idx['version']=data['version'];idx['itemCount']=data['itemCount'];idx['pendingSourceNos']=data['pendingSourceNos']
idx['items'].append({'sourceNo':15,'genId':'applied7-q15','area':'경우의 수','subarea':'경로 세기','detailType':'번호가 증가하는 이웃 방으로 이동하는 경로 수 구하기','pointBand':'3.4','reviewStatus':'verified','variantCount':9});idx['items'].sort(key=lambda x:x['sourceNo'])
DATA_PATH.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');INDEX_PATH.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n')
print('Built Applied7 Q15: 9 variants of existing numbered-room path type; new source types 0.')

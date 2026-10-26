"""Add nine variants for existing Applied 7 Q5 opposite-direction meeting type."""
import hashlib,json,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.private-work/hw-expansion-20261023/hw7'
DATA_PATH=ROOT/'bank/data/applied7-expanded.json';INDEX_PATH=ROOT/'bank/data/applied7-expanded-index.json'
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 7회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf')
PDFTOTEXT=Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
exam_text=subprocess.check_output([str(PDFTOTEXT),'-f','2','-l','2','-layout',str(EXAM),'-'],text=True,errors='replace')
assert '운동장의 같은 지점에서 동시에 출발' in exam_text and '5번째로 만났을 때' in exam_text

speeds=[(32,28,2),(40,35,3),(48,42,4),(55,45,5),(72,68,6),(90,75,3),(100,80,4),(110,70,5),(120,90,6)]
items=[]
for v,(a,b,first) in enumerate(speeds,1):
 laps=5;perimeter=(a+b)*first;time=first*laps;answer=(a+b)*time
 assert answer==perimeter*laps
 prompt=f'민호와 선아는 운동장의 같은 지점에서 동시에 출발하여 서로 반대 방향으로 운동장 둘레를 걸었습니다. 1분 동안 민호는 {a}m, 선아는 {b}m를 가는 빠르기로 걸었더니 {first}분 만에 처음으로 만났습니다. 두 사람이 다섯 번째로 만났을 때 걷기를 멈췄다면, 두 사람이 걸은 거리의 합은 몇 m입니까?'
 steps=[f'두 사람이 반대 방향으로 1분 동안 움직이는 거리의 합은 {a}+{b}={a+b}m입니다.',f'{first}분 만에 처음 만났으므로 운동장 둘레는 {a+b}×{first}={perimeter}m입니다.',f'처음 만난 뒤에는 운동장 둘레를 한 바퀴 더 돌 때마다 다시 만납니다. 다섯 번째 만남까지 두 사람이 함께 움직인 거리는 운동장 둘레의 5배입니다.',f'{perimeter}×5={answer}m이므로 두 사람이 걸은 거리의 합은 {answer}m입니다.']
 items.append({'id':f'applied7-q05-v{v}','genId':'applied7-q05','sourceSet':'applied','sourceRound':7,'sourceNo':5,'variantNo':v,'reviewStatus':'verified','area':'수와 식','subarea':'속력·시간·거리','detailType':'반대 방향으로 걸을 때 만나는 횟수와 이동 거리','pointBand':'2.7','text':prompt,'answer':str(answer),'answerParts':[answer],'answerLabels':['두 사람이 걸은 거리의 합(m)'],'acceptedAnswers':[str(answer),f'{answer}m'],'answerContract':'ordered-parts','solutionSteps':steps,'solution':' '.join(steps),'learningPoint':'반대 방향의 속력을 더해 한 번 만나는 동안의 전체 이동 거리를 구하고, 만남 횟수에 맞춰 운동장 둘레를 곱하기','learningLocation':'활용 7회 · 원문 5번 · 반대 방향으로 걷는 두 사람의 만남과 이동 거리','verification':{'primaryMethod':'속력 합×첫 만남 시간으로 운동장 둘레를 구한 뒤 다섯 번째 만남까지의 전체 이동 거리를 구한다.','independentMethod':'만남 시점은 첫 만남 시간의 1, 2, 3, 4, 5배이며, 각 시점의 두 사람 이동 거리 합을 계산한다.','parameters':{'speedA':a,'speedB':b,'firstMeetingMinutes':first,'meetingNumber':laps,'trackCircumference':perimeter,'totalElapsedMinutes':time,'answerMetres':answer},'independentSuite':'qa/applied7-q05-independent-validate.py','sourceExamPage':2,'sourceExamFile':EXAM.name,'sourceAnswerPage':2,'sourceDrawingCompared':False,'sourceDrawingPresent':False,'variantUsesSourceDrawing':False,'studentDifficultyMeasured':False},'difficultyEvidence':{'basis':'source-point-band','label':'하','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,'rationale':'활용 7회 원문 5번은 1~12번의 2.7점 배점대다. 활용 난도는 배점대만 적용한다.'}})

data=json.loads(DATA_PATH.read_text());assert data['sourceRound']==7 and set(data['availableSourceNos'])<={2,3,4,5}
data['items']=[x for x in data['items'] if x['sourceNo'] in (2,3,4)]+items;data['availableSourceNos']=[2,3,4,5];data['pendingSourceNos']=[n for n in range(1,31) if n not in data['availableSourceNos']];data['itemCount']=36;data['version']='20261024-applied7-expansion-q02-q03-q04-q05-r4'
answer=1725;review={'sourceExam':{'name':EXAM.name,'driveId':'1qtshEh5Zkv3X4DMMcXHjWw1kRgibbvxf','bytes':EXAM.stat().st_size,'sha256':sha(EXAM),'questionPage':2,'questionNumber':5,'figurePresent':False},'sourceAnswer':{'name':ANSWER.name,'driveId':'1zIN-XzODa-_T2AUjGbmuzHSPvCdVb2_j','bytes':ANSWER.stat().st_size,'sha256':sha(ANSWER),'answerPage':2,'questionNumber':5,'teacherMarkedAnswer':'1725m','evidence':'원문 PDF 2쪽과 필기 답안 PDF 2쪽을 직접 비교했다. 1분 동안 상대 속력 115m, 첫 만남 3분, 다섯 번째 만남까지 둘레 5회로 답 1,725m를 확인했다.'},'directPageImagesCompared':True,'sourceAndAnswerMatch':True,'sourceTypeAlreadyPresent':True,'newSourceTypesAdded':0,'sourceAnswerIndependentCheck':{'speeds':[60,55],'firstMeetingMinutes':3,'circumference':345,'meetingNumber':5,'answerMetres':answer},'newVariants':9,'allVariantsSameSourceType':True}
(WORK/'q05-source-answer-review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
idx=json.loads(INDEX_PATH.read_text());idx['version']=data['version'];idx['itemCount']=36;idx['pendingSourceNos']=data['pendingSourceNos'];idx['items']=[x for x in idx['items'] if x['sourceNo'] in (2,3,4)]+[{'sourceNo':5,'genId':'applied7-q05','area':'수와 식','subarea':'속력·시간·거리','detailType':'반대 방향으로 걸을 때 만나는 횟수와 이동 거리','pointBand':'2.7','reviewStatus':'verified','variantCount':9}]
DATA_PATH.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');INDEX_PATH.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n')
print('Built Applied 7 Q5: 9 variants; source answer 1725m verified; new source types 0.')

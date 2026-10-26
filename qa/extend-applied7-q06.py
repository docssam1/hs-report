"""Add nine variants for existing Applied 7 Q6 fraction-sequence type."""
import hashlib,json,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.private-work/hw-expansion-20261023/hw7'
DATA_PATH=ROOT/'bank/data/applied7-expanded.json';INDEX_PATH=ROOT/'bank/data/applied7-expanded-index.json'
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 7회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf')
PDFTOTEXT=Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
source_text=subprocess.check_output([str(PDFTOTEXT),'-f','2','-l','2','-layout',str(EXAM),'-'],text=True,errors='replace')
assert '38번째에 놓이는 분수를 구하시오.' in source_text
sequence='1/3, 2/3, 1/5, 2/5, 3/5, 4/5, 1/7, 2/7, 3/7, 4/7, 5/7, 6/7, 1/9, ...'
def term_at(pos):
 n=0;d=3
 while True:
  for a in range(1,d):
   n+=1
   if n==pos:return (a,d)
  d+=2

items=[]
for v,pos in enumerate(range(34,43),1):
 numerator,denominator=term_at(pos);prior=pos-30
 assert (numerator,denominator)==(prior,13)
 prompt=f'다음 분수 수열의 규칙을 찾아 {pos}번째에 놓이는 분수를 구하시오. {sequence}'
 steps=[f'분모가 3일 때 2개, 5일 때 4개, 7일 때 6개처럼 분모가 2씩 커질 때마다 각 묶음의 분수는 2개씩 늘어납니다.',f'분모가 13인 묶음보다 앞에 놓이는 분수는 2+4+6+8+10=30개입니다.',f'{pos}번째 분수는 분모가 13인 묶음의 {pos}−30={prior}번째이므로 분자는 {prior}입니다.',f'따라서 {pos}번째에 놓이는 분수는 {numerator}/{denominator}입니다.']
 items.append({'id':f'applied7-q06-v{v}','genId':'applied7-q06','sourceSet':'applied','sourceRound':7,'sourceNo':6,'variantNo':v,'reviewStatus':'verified','area':'수와 식','subarea':'수열','detailType':'홀수 분모 묶음으로 이어지는 분수 수열의 항 찾기','pointBand':'2.7','text':prompt,'answer':f'{numerator}/{denominator}','answerParts':[f'{numerator}/{denominator}'],'answerLabels':['분수'],'acceptedAnswers':[f'{numerator}/{denominator}'],'answerContract':'ordered-parts','solutionSteps':steps,'solution':' '.join(steps),'learningPoint':'각 묶음의 항 수를 파악해 목표 위치 앞까지의 항 수를 더하고, 해당 묶음 안에서 순서를 찾기','learningLocation':'활용 7회 · 원문 6번 · 홀수 분모별로 묶인 분수 수열','verification':{'primaryMethod':'분모 3, 5, 7, 9, 11, 13 묶음의 항 수를 각각 2,4,6,8,10,12로 적고 목표 순번의 묶음을 찾는다.','independentMethod':'분수 수열을 분모별로 실제 열거해 34~42번째 항을 직접 확인한다.','parameters':{'targetPosition':pos,'termsBeforeDenominator13':30,'positionWithinDenominator13':prior,'answerNumerator':numerator,'answerDenominator':denominator},'independentSuite':'qa/applied7-q06-independent-validate.py','sourceExamPage':2,'sourceExamFile':EXAM.name,'sourceAnswerPage':2,'sourceDrawingCompared':False,'sourceDrawingPresent':False,'variantUsesSourceDrawing':False,'studentDifficultyMeasured':False},'difficultyEvidence':{'basis':'source-point-band','label':'하','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,'rationale':'활용 7회 원문 6번은 1~12번의 2.7점 배점대다. 활용 난도는 배점대만 적용한다.'}})

data=json.loads(DATA_PATH.read_text());assert data['sourceRound']==7 and set(data['availableSourceNos'])<={2,3,4,5,6}
data['items']=[x for x in data['items'] if x['sourceNo'] in (2,3,4,5)]+items;data['availableSourceNos']=[2,3,4,5,6];data['pendingSourceNos']=[n for n in range(1,31) if n not in data['availableSourceNos']];data['itemCount']=45;data['version']='20261024-applied7-expansion-q02-q03-q04-q05-q06-r5'
review={'sourceExam':{'name':EXAM.name,'driveId':'1qtshEh5Zkv3X4DMMcXHjWw1kRgibbvxf','bytes':EXAM.stat().st_size,'sha256':sha(EXAM),'questionPage':2,'questionNumber':6,'questionText':'제시된 분수 수열의 38번째 항을 묻는다.','figurePresent':False,'essentialSequenceCompared':True},'sourceAnswer':{'name':ANSWER.name,'driveId':'1zIN-XzODa-_T2AUjGbmuzHSPvCdVb2_j','bytes':ANSWER.stat().st_size,'sha256':sha(ANSWER),'answerPage':2,'questionNumber':6,'teacherMarkedAnswer':'8/13','evidence':'원문 PDF 2쪽의 수열 및 필기 답안 PDF 2쪽을 직접 비교했다. 묶음 크기 2,4,6,8,10의 누계는 30이며 38번째는 분모 13 묶음의 8번째다.'},'directPageImagesCompared':True,'sourceAndAnswerMatch':True,'sourceTypeAlreadyPresent':True,'newSourceTypesAdded':0,'sourceAnswerIndependentCheck':{'termsBeforeDenominator13':2+4+6+8+10,'positionWithinDenominator13':38-30,'answer':'8/13'},'newVariants':9,'allVariantsSameSourceType':True,'exactSourceSequencePreserved':sequence}
(WORK/'q06-source-answer-review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
idx=json.loads(INDEX_PATH.read_text());idx['version']=data['version'];idx['itemCount']=45;idx['pendingSourceNos']=data['pendingSourceNos'];idx['items']=[x for x in idx['items'] if x['sourceNo'] in (2,3,4,5)]+[{'sourceNo':6,'genId':'applied7-q06','area':'수와 식','subarea':'수열','detailType':'홀수 분모 묶음으로 이어지는 분수 수열의 항 찾기','pointBand':'2.7','reviewStatus':'verified','variantCount':9}]
DATA_PATH.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');INDEX_PATH.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n')
print('Built Applied 7 Q6: 9 same-sequence variants; source answer 8/13; new source types 0.')

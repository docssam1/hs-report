"""Add nine variants for existing Applied 7 Q10 repeated-product remainder type."""
import hashlib,json,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.private-work/hw-expansion-20261023/hw7'
DATA_PATH=ROOT/'bank/data/applied7-expanded.json';INDEX_PATH=ROOT/'bank/data/applied7-expanded-index.json'
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 7회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf')
PDFTOTEXT=Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
t=subprocess.check_output([str(PDFTOTEXT),'-f','2','-l','2','-layout',str(EXAM),'-'],text=True,errors='replace')
assert '5로 나누었을 때 나머지' in t
def remainder(n):
 r=1
 for _ in range(n):r=(r*8)%5
 return r
items=[]
for v,n in enumerate(range(98,107),1):
 ans=remainder(n);assert ans==pow(8,n,5)
 prompt=f'8을 {n}번 곱한 수를 5로 나누었을 때 나머지를 구하시오.'
 seq=[pow(8,k,5) for k in range(1,5)]
 steps=[f'8을 5로 나눈 나머지는 3입니다.',f'8을 계속 곱한 뒤 5로 나눈 나머지는 처음 네 번에 {seq[0]}, {seq[1]}, {seq[2]}, {seq[3]}으로 되풀이됩니다.',f'{n}을 4로 나눈 나머지는 {n%4}이므로, {n}번 곱한 수를 5로 나눈 나머지는 {ans}입니다.',f'직접 계산해도 8^{n}을 5로 나눈 나머지는 {ans}입니다.']
 items.append({'id':f'applied7-q10-v{v}','genId':'applied7-q10','sourceSet':'applied','sourceRound':7,'sourceNo':10,'variantNo':v,'reviewStatus':'verified','area':'수와 식','subarea':'나머지','detailType':'같은 수를 여러 번 곱한 결과의 나머지 찾기','pointBand':'2.7','text':prompt,'answer':str(ans),'answerParts':[ans],'answerLabels':['나머지'],'acceptedAnswers':[str(ans)],'answerContract':'ordered-parts','solutionSteps':steps,'solution':' '.join(steps),'learningPoint':'나눗셈의 나머지가 되풀이되는 주기를 찾아 곱한 횟수에 맞는 나머지를 선택하기','learningLocation':'활용 7회 · 원문 10번 · 반복 곱의 나머지','verification':{'primaryMethod':'나머지 3을 반복해서 곱하며 나머지의 주기 4를 확인한다.','independentMethod':'8을 n번 반복 곱하되 매 단계마다 5로 나눈 나머지만 유지한다.','parameters':{'base':8,'factorCount':n,'divisor':5,'cycle':seq,'factorCountRemainder':n%4,'answerRemainder':ans},'independentSuite':'qa/applied7-q10-independent-validate.py','sourceExamPage':2,'sourceExamFile':EXAM.name,'sourceAnswerPage':2,'sourceDrawingCompared':False,'sourceDrawingPresent':False,'variantUsesSourceDrawing':False,'studentDifficultyMeasured':False},'difficultyEvidence':{'basis':'source-point-band','label':'하','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,'rationale':'활용 7회 원문 10번은 1~12번의 2.7점 배점대다. 활용 난도는 배점대만 적용한다.'}})
data=json.loads(DATA_PATH.read_text());assert data['sourceRound']==7 and set(data['availableSourceNos'])<={2,3,4,5,6,10}
data['items']=[x for x in data['items'] if x['sourceNo'] in (2,3,4,5,6)]+items;data['availableSourceNos']=[2,3,4,5,6,10];data['pendingSourceNos']=[n for n in range(1,31) if n not in data['availableSourceNos']];data['itemCount']=54;data['version']='20261024-applied7-expansion-q02-q03-q04-q05-q06-q10-r6'
review={'sourceExam':{'name':EXAM.name,'driveId':'1qtshEh5Zkv3X4DMMcXHjWw1kRgibbvxf','bytes':EXAM.stat().st_size,'sha256':sha(EXAM),'questionPage':2,'questionNumber':10,'sourceQuestion':'8을 97번 곱한 결과를 5로 나눈 나머지를 묻는다.','figurePresent':False},'sourceAnswer':{'name':ANSWER.name,'driveId':'1zIN-XzODa-_T2AUjGbmuzHSPvCdVb2_j','bytes':ANSWER.stat().st_size,'sha256':sha(ANSWER),'answerPage':2,'questionNumber':10,'teacherMarkedAnswer':3,'evidence':'원문 PDF 2쪽의 8 반복곱과 97회 표기, 필기 답안 PDF 2쪽을 직접 비교했다. 8^97을 5로 나눈 나머지는 3이다.'},'directPageImagesCompared':True,'sourceAndAnswerMatch':True,'sourceTypeAlreadyPresent':True,'newSourceTypesAdded':0,'sourceAnswerIndependentCheck':{'calculation':'pow(8,97,5)','result':pow(8,97,5)},'newVariants':9,'allVariantsSameSourceType':True}
(WORK/'q10-source-answer-review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
idx=json.loads(INDEX_PATH.read_text());idx['version']=data['version'];idx['itemCount']=54;idx['pendingSourceNos']=data['pendingSourceNos'];idx['items']=[x for x in idx['items'] if x['sourceNo'] in (2,3,4,5,6)]+[{'sourceNo':10,'genId':'applied7-q10','area':'수와 식','subarea':'나머지','detailType':'같은 수를 여러 번 곱한 결과의 나머지 찾기','pointBand':'2.7','reviewStatus':'verified','variantCount':9}]
DATA_PATH.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');INDEX_PATH.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n')
print('Built Applied 7 Q10: 9 repeated-product remainder variants; source answer 3; new types 0.')

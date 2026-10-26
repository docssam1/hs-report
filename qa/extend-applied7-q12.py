#!/usr/bin/env python3
"""Add nine variants of the existing Applied 7 Q12 maximum-circle-regions type."""
import hashlib,json,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]; WORK=ROOT/'.private-work/hw-expansion-20261023/hw7'
DATA_PATH=ROOT/'bank/data/applied7-expanded.json'; INDEX_PATH=ROOT/'bank/data/applied7-expanded-index.json'
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 7회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf')
ASSET=ROOT/'bank/assets/applied7/q12-blank-circle-original.png'
PDFTOTEXT=Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
t=subprocess.check_output([str(PDFTOTEXT),'-f','3','-l','3','-layout',str(EXAM),'-'],text=True,errors='replace')
assert '원 안에 선분 6개를 그어 원을 가장 많게 나누려고 합니다.' in t
assert '몇 부분으로 나눌 수 있는지 구하시오.' in t
assert ASSET.is_file() and ASSET.stat().st_size>1000

def max_regions(n):
    return 1+n+n*(n-1)//2
items=[]
for variant,n in enumerate(range(7,16),1):
    answer=max_regions(n)
    steps=[f'원 안에 선분을 하나씩 추가할 때, 새 선분은 앞서 그은 선분과 만나는 점의 수만큼 더 여러 조각으로 나뉩니다.',f'가장 많이 나누려면 선분끼리 원 안에서 서로 만나고, 세 선분이 한 점에서 동시에 만나지 않게 그립니다.',f'{n}번째 선분은 앞선 {n-1}개와 만나는 점이 {n-1}개이므로 원을 {n}개 더 나눕니다.',f'전체 부분 수는 1+1+2+...+{n}={answer}입니다.']
    items.append({'id':f'applied7-q12-v{variant}','genId':'applied7-q12','sourceSet':'applied','sourceRound':7,'sourceNo':12,'variantNo':variant,'reviewStatus':'verified','area':'도형','subarea':'평면도형의 분할','detailType':'원 안의 선분으로 나눌 수 있는 최대 부분 수','pointBand':'2.7','text':f'원 안에 선분 {n}개를 그어 원을 가장 많이 나누려고 합니다. 몇 부분으로 나눌 수 있는지 구하시오.','asset':{'kind':'raster','src':'assets/applied7/q12-blank-circle-original.png','description':'활용 7회 원문 12번의 빈 원 그림을 그대로 사용'},'answer':str(answer),'answerParts':[answer],'answerLabels':['부분'],'acceptedAnswers':[str(answer)],'answerContract':'ordered-parts','solutionSteps':steps,'solution':' '.join(steps),'learningPoint':'새 선분이 앞선 선분과 만나는 점에 따라 늘어나는 부분 수를 더하기','learningLocation':'활용 7회 · 원문 12번 · 원 안의 선분으로 나누는 최대 부분 수','verification':{'primaryMethod':'각 선분을 추가할 때 증가하는 조각 수를 순서대로 더한다.','independentMethod':'일반 위치에서 선분 쌍마다 교점이 하나씩 생기므로 1+n+C(n,2)로 계산한다.','parameters':{'segments':n,'pairwiseInteriorIntersections':n*(n-1)//2,'answer':answer,'maximumGeneralPosition':True},'independentSuite':'qa/applied7-q12-independent-validate.py','sourceExamPage':3,'sourceExamFile':EXAM.name,'sourceAnswerPage':3,'sourceDrawingCompared':True,'sourceDrawingPresent':True,'variantUsesSourceDrawing':True,'sourceDrawingAssetSha256':sha(ASSET),'studentDifficultyMeasured':False},'difficultyEvidence':{'basis':'source-point-band','label':'하','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,'rationale':'활용 7회 원문 12번은 1~12번의 2.7점 배점대다. 활용 난도는 배점대만 적용한다.'}})
data=json.loads(DATA_PATH.read_text()); assert data['sourceRound']==7 and 12 not in data['availableSourceNos']
data['items'].extend(items);data['items'].sort(key=lambda x:(x['sourceNo'],x['variantNo']))
data['availableSourceNos']=sorted(set(data['availableSourceNos']+[12]));data['pendingSourceNos']=[n for n in range(1,31) if n not in data['availableSourceNos']];data['itemCount']=len(data['items']);data['version']='20261024-applied7-expansion-q02-q03-q04-q05-q06-q10-q12-r7'
review={'sourceExam':{'name':EXAM.name,'driveId':'1qtshEh5Zkv3X4DMMcXHjWw1kRgibbvxf','bytes':EXAM.stat().st_size,'sha256':sha(EXAM),'questionPage':3,'questionNumber':12,'sourceQuestion':'원 안에 선분 6개를 그어 원을 가장 많이 나누었을 때의 부분 수','figurePresent':True},'sourceAnswer':{'name':ANSWER.name,'driveId':'1zIN-XzODa-_T2AUjGbmuzHSPvCdVb2_j','bytes':ANSWER.stat().st_size,'sha256':sha(ANSWER),'answerPage':3,'questionNumber':12,'teacherMarkedAnswer':22,'evidence':'문제 PDF 3쪽의 빈 원 그림과 답안 PDF 3쪽의 식 1+(1+2+3+4+5+6), 답 22를 직접 대조했다.'},'directPageImagesCompared':True,'sourceAndAnswerMatch':True,'sourceTypeAlreadyPresent':True,'newSourceTypesAdded':0,'sourceDrawing':{'action':'문제 PDF 원문 빈 원을 무손실 픽셀 크롭으로 추출해 모든 변형에서 그대로 재사용','asset':'bank/assets/applied7/q12-blank-circle-original.png','sha256':sha(ASSET)},'sourceAnswerIndependentCheck':{'calculation':'1+6+C(6,2)','result':max_regions(6)},'newVariants':9,'allVariantsSameSourceType':True}
(WORK/'q12-source-answer-review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
idx=json.loads(INDEX_PATH.read_text());idx['version']=data['version'];idx['itemCount']=data['itemCount'];idx['pendingSourceNos']=data['pendingSourceNos'];idx['items'].append({'sourceNo':12,'genId':'applied7-q12','area':'도형','subarea':'평면도형의 분할','detailType':'원 안의 선분으로 나눌 수 있는 최대 부분 수','pointBand':'2.7','reviewStatus':'verified','variantCount':9});idx['items'].sort(key=lambda x:x['sourceNo'])
DATA_PATH.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');INDEX_PATH.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n')
print('Built Applied7 Q12: 9 variants of the existing circle-region type, original blank circle reused unchanged, 0 new source types.')

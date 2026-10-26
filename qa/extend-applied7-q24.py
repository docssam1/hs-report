#!/usr/bin/env python3
"""Extend only the existing Applied 7 Q24 five-overlapping-circles sum type."""
import hashlib,json,subprocess,itertools
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.private-work/hw-expansion-20261023/hw7'
DATA_PATH=ROOT/'bank/data/applied7-expanded.json';INDEX_PATH=ROOT/'bank/data/applied7-expanded-index.json'
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 7회.pdf';ANSWER=WORK/'source-review/applied7-answer-candidate.pdf'
PDFTOTEXT=Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')
ASSET='assets/applied7/q24-five-circles-original.png'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
exam=subprocess.check_output([str(PDFTOTEXT),'-f','5','-l','5','-layout',str(EXAM),'-'],text=True,errors='replace')
ans=subprocess.check_output([str(PDFTOTEXT),'-f','5','-l','5','-layout',str(ANSWER),'-'],text=True,errors='replace')
assert '1부터 9까지의 수를 한 번씩 사용하여' in exam and 'a에 들어갈 수는 얼마입니까' in exam
assert '원안의 수의 합이 11' in exam and '1부터 9까지의 수를 한 번씩 사용하여' in ans
# Regions left-to-right: fixed 8, x1, x2, fixed 1, a, x3, x4, x5, fixed 9.
solutions=[]
for x1,x2,a,x3,x4,x5 in itertools.permutations([2,3,4,5,6,7]):
 if 8+x1!=11:continue
 if x1+x2+1!=11:continue
 if 1+a+x3!=11:continue
 if x3+x4+x5!=11:continue
 if x5+9!=11:continue
 solutions.append((x1,x2,a,x3,x4,x5))
assert solutions==[(3,7,6,4,5,2)]
queries=[
 ('왼쪽에서 첫째 원과 둘째 원이 겹치는 부분에 들어갈 수','x1',3),
 ('왼쪽에서 둘째 원에만 들어가는 부분의 수','x2',7),
 ('가운데 원에만 들어가는 부분, 즉 a에 들어갈 수','a',6),
 ('왼쪽에서 셋째 원과 넷째 원이 겹치는 부분에 들어갈 수','x3',4),
 ('왼쪽에서 넷째 원에만 들어가는 부분의 수','x4',5),
 ('왼쪽에서 넷째 원과 다섯째 원이 겹치는 부분에 들어갈 수','x5',2),
 ('왼쪽에서 첫째 원과 둘째 원이 겹치는 부분과 둘째 원에만 들어가는 부분의 수의 합','sum12',10),
 ('가운데 원에만 들어가는 부분과 셋째 원·넷째 원의 겹치는 부분의 수의 합','sum34',10),
 ('그림에서 이미 주어진 8, 1, 9를 제외하고 빈 부분에 들어가는 여섯 수의 합','sumall',27)
]
regions={'x1':3,'x2':7,'a':6,'x3':4,'x4':5,'x5':2}
proof=[];items=[]
common_steps=[
 '왼쪽 첫째 원의 합이 11이므로 첫째와 둘째 원의 겹친 부분은 11−8=3입니다.',
 '왼쪽 둘째 원의 합이 11이므로 둘째 원에만 있는 수는 11−3−1=7입니다. 오른쪽 끝 원의 합이 11이므로 넷째와 다섯째 원의 겹친 부분은 11−9=2입니다.',
 '남은 수는 4, 5, 6입니다. 가운데 원에서 a와 다음 겹친 부분의 합은 10이고, 넷째 원에서 다음 겹친 부분과 넷째 원만의 수의 합은 9입니다. 3은 이미 사용했으므로 겹친 부분은 4, 넷째 원만의 수는 5, a는 6입니다.'
]
for i,(ask,key,value) in enumerate(queries,1):
 if key=='sum12': final='따라서 구하는 합은 3+7=10입니다.'
 elif key=='sum34': final='따라서 구하는 합은 6+4=10입니다.'
 elif key=='sumall': final='따라서 빈 부분의 여섯 수의 합은 3+7+6+4+5+2=27입니다.'
 else: final=f'따라서 {ask}는 {value}입니다.'
 steps=common_steps+[final]
 text=f'1부터 9까지의 수를 한 번씩 사용해 그림의 각 원 안에 있는 수의 합이 11이 되도록 합니다. {ask}는 얼마입니까?'
 item={'id':f'applied7-q24-v{i}','genId':'applied7-q24','sourceSet':'applied','sourceRound':7,'sourceNo':24,'variantNo':i,'reviewStatus':'verified',
 'area':'도형','subarea':'겹친 원의 수 배치','detailType':'겹친 원마다 같은 합이 되도록 수 배치하기',
 'pointBand':'4.2','text':text,'asset':{'kind':'raster','src':ASSET,'description':'활용 7회 원문 24번의 겹친 원 그림을 원문 그대로 사용'},
 'answer':str(value),'answerParts':[value],'answerLabels':['구하는 수'],'acceptedAnswers':[str(value)],'answerContract':'single-number',
 'solutionSteps':steps,'solution':' '.join(steps),'learningPoint':'겹친 부분과 한 원에만 있는 부분을 구별하고 원별 합 조건을 연립한다',
 'learningLocation':'활용 7회 · 원문 24번 · 겹친 원의 수 배치',
 'verification':{'primaryMethod':'각 원의 합과 1~9를 한 번씩 쓰는 조건을 차례로 적용한다.',
  'independentMethod':'고정 수 8,1,9를 제외한 여섯 수의 모든 순열 720개를 검사해 원별 합 11을 만족하는 배치가 유일함을 확인한다.',
  'parameters':{'targetRegion':key,'uniqueRegionValues':regions,'sourceCircleSum':11,'sourceNumberSet':[1,2,3,4,5,6,7,8,9]},
  'independentSuite':'qa/applied7-q24-independent-validate.py','sourceExamPage':5,'sourceExamFile':EXAM.name,'sourceAnswerPage':5,
  'sourceDrawingCompared':True,'sourceDrawingPresent':True,'variantUsesSourceDrawing':True,'studentDifficultyMeasured':False},
 'difficultyEvidence':{'basis':'source-point-band','label':'상','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,
  'rationale':'활용 7회 원문 24번은 23~30번의 4.2점 배점대다. 활용 난도는 배점대만 적용한다.'}}
 items.append(item);proof.append({'variant':i,'query':key,'answer':value})
data=json.loads(DATA_PATH.read_text());assert data['sourceRound']==7 and 24 not in data['availableSourceNos'] and not any(x['sourceNo']==24 for x in data['items'])
data['items'].extend(items);data['items'].sort(key=lambda x:(x['sourceNo'],x['variantNo']));data['availableSourceNos']=sorted(set(data['availableSourceNos']+[24]));data['pendingSourceNos']=[n for n in range(1,31) if n not in data['availableSourceNos']];data['itemCount']=len(data['items'])
data['version']='20261025-applied7-expansion-q02-q03-q04-q05-q06-q07-q09-q10-q11-q12-q14-q15-q16-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r25'
review={'sourceExam':{'name':EXAM.name,'sha256':sha(EXAM),'questionPage':5,'questionNumber':24,'question':'1~9를 한 번씩 사용해 5개의 겹친 원 안의 수 합을 각각 11로 만들고 a를 구하기','figurePresent':True},
 'sourceAnswer':{'name':ANSWER.name,'sha256':sha(ANSWER),'answerPage':5,'questionNumber':24,'teacherMarkedAnswer':6,'evidence':'답안 PDF p5의 교사 기입 그림에서 원별 수 배치 및 a=6을 확인했다.'},
 'directPageImagesCompared':True,'sourceAndAnswerMatch':True,'sourceTypeAlreadyPresent':True,'newSourceTypesAdded':0,'sourceAnswerIndependentCheck':{'permutationCount':720,'validArrangements':1,'values':[3,7,6,4,5,2]},
 'sourceDiagramAsset':ASSET,'sourceDiagramCrop':'source-review/p5/exam-5.png pixel crop; no resize/recolor/line/label edits','newVariants':9,'allVariantsSameSourceType':True,'variants':proof}
(WORK/'q24-source-answer-review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
idx=json.loads(INDEX_PATH.read_text());idx['version']=data['version'];idx['itemCount']=data['itemCount'];idx['pendingSourceNos']=data['pendingSourceNos'];idx['items'].append({'sourceNo':24,'genId':'applied7-q24','area':'도형','subarea':'겹친 원의 수 배치','detailType':'겹친 원마다 같은 합이 되도록 수 배치하기','pointBand':'4.2','reviewStatus':'verified','variantCount':9});idx['items'].sort(key=lambda x:x['sourceNo'])
DATA_PATH.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');INDEX_PATH.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n')
print('Built Applied7 Q24: 9 variants of existing overlapping-circle sum type; new source types 0.')

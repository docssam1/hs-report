#!/usr/bin/env python3
"""Extend only the existing Applied 7 finger-counting sequence type."""
import hashlib, json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.private-work/hw-expansion-20261023/hw7'
DATA_PATH=ROOT/'bank/data/applied7-expanded.json'; INDEX_PATH=ROOT/'bank/data/applied7-expanded-index.json'
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 7회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf')
ASSET='assets/applied7/q14-hands-original.png'
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()

# The original figure numbers a period of 18 positions. Preserve that exact
# figure; only the requested count changes in each existing-type variant.
targets=[3025,5012,7203,3821,6354,4565,6889,4098,4100]
sequence=[('왼손','엄지'),('왼손','검지'),('왼손','중지'),('왼손','약지'),('왼손','소지'),
          ('왼손','약지'),('왼손','중지'),('왼손','검지'),('왼손','엄지'),
          ('오른손','엄지'),('오른손','검지'),('오른손','중지'),('오른손','약지'),('오른손','소지'),
          ('오른손','약지'),('오른손','중지'),('오른손','검지'),('오른손','엄지')]
items=[];proof=[]
for variant,n in enumerate(targets,1):
    r=n%18 or 18; hand,finger=sequence[r-1]
    quotient=n//18; direct=sequence[(n-1)%18]
    assert direct==(hand,finger)
    steps=[f'손가락 그림의 순서는 18개마다 되풀이됩니다.',
           f'{n}을 18로 나누면 몫은 {quotient}, 나머지는 {n%18}입니다.',
           f'나머지가 {n%18}이므로 그림의 {r}번째 손가락에 해당합니다. {hand} {finger}입니다.']
    item={'id':f'applied7-q14-v{variant}','genId':'applied7-q14','sourceSet':'applied','sourceRound':7,'sourceNo':14,
          'variantNo':variant,'reviewStatus':'verified','area':'수와 식','subarea':'주기와 나머지',
          'detailType':'양손 손가락 세기 순환에서 특정 수의 손가락 찾기','pointBand':'2.7',
          'text':f'다음과 같이 손가락으로 수를 세고 있습니다. {n}은 어느 손의 어떤 손가락으로 세는지 구하시오.',
          'answer':f'{hand} {finger}','answerParts':[hand,finger],
          'answerLabels':['손','손가락'],'acceptedAnswers':[f'{hand} {finger}'],'answerContract':'ordered-parts',
          'asset':{'kind':'raster','src':ASSET,'description':'활용 7회 원문 14번의 양손 손가락 수 배열 그림을 원문 그대로 사용'},
          'solutionSteps':steps,'solution':' '.join(steps),
          'learningPoint':'손가락 순환의 주기를 찾고 나머지에 해당하는 위치를 그림에서 읽는다',
          'learningLocation':'활용 7회 · 원문 14번 · 양손 손가락 세기와 순환',
          'verification':{'primaryMethod':'18개 순환 주기로 나눈 나머지를 원문 그림에 대응한다.',
                          'independentMethod':'1부터 18까지 원문 그림의 방향 순서를 직접 열거하고 대상 수의 인덱스를 계산한다.',
                          'parameters':{'target':n,'period':18,'quotient':quotient,'remainder':n%18,'position':r,'hand':hand,'finger':finger},
                          'independentSuite':'qa/applied7-q14-independent-validate.py',
                          'sourceExamPage':3,'sourceExamFile':EXAM.name,'sourceAnswerPage':3,
                          'sourceDrawingCompared':True,'sourceDrawingPresent':True,
                          'variantUsesSourceDrawing':True,'studentDifficultyMeasured':False},
          'difficultyEvidence':{'basis':'source-point-band','label':'하','sourceReasoningPreserved':True,
                                'measuredVariantRate':None,'estimated':False,
                                'rationale':'활용 7회 원문 14번은 13~22번의 3.4점 배점대가 아니라 13~22번 3.4점입니다. 활용 난도는 배점대만 적용한다.'}}
    # Q14 falls in 13–22, hence 3.4 points and middle difficulty.
    item['pointBand']='3.4';item['difficultyEvidence']['label']='중'
    item['difficultyEvidence']['rationale']='활용 7회 원문 14번은 13~22번의 3.4점 배점대다. 활용 난도는 배점대만 적용한다.'
    items.append(item);proof.append({'variant':variant,'target':n,'quotient':quotient,'remainder':n%18,'position':r,'answer':[hand,finger]})

data=json.loads(DATA_PATH.read_text());assert data['sourceRound']==7 and 14 not in data['availableSourceNos']
assert not [x for x in data['items'] if x['sourceNo']==14]
data['items'].extend(items);data['items'].sort(key=lambda x:(x['sourceNo'],x['variantNo']))
data['availableSourceNos']=sorted(set(data['availableSourceNos']+[14]))
data['pendingSourceNos']=[n for n in range(1,31) if n not in data['availableSourceNos']]
data['itemCount']=len(data['items'])
data['version']='20261025-applied7-expansion-q02-q03-q04-q05-q06-q09-q10-q12-q14-q16-q18-q20-q22-q25-q27-q29-r15'
idx=json.loads(INDEX_PATH.read_text());idx['version']=data['version'];idx['itemCount']=data['itemCount'];idx['pendingSourceNos']=data['pendingSourceNos']
idx['items'].append({'sourceNo':14,'genId':'applied7-q14','area':'수와 식','subarea':'주기와 나머지',
                     'detailType':'양손 손가락 세기 순환에서 특정 수의 손가락 찾기',
                     'pointBand':'3.4','reviewStatus':'verified','variantCount':9})
idx['items'].sort(key=lambda x:x['sourceNo'])
DATA_PATH.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');INDEX_PATH.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n')
review={'sourceExam':{'name':EXAM.name,'driveId':'1qtshEh5Zkv3X4DMMcXHjWw1kRgibbvxf','bytes':EXAM.stat().st_size,
                      'sha256':sha(EXAM),'questionPage':3,'questionNumber':14,
                      'sourceQuestion':'4000은 어느 손의 어떤 손가락으로 세는지 구하기','figurePresent':True},
        'sourceAnswer':{'name':ANSWER.name,'driveId':'1zIN-XzODa-_T2AUjGbmuzHSPvCdVb2_j','bytes':ANSWER.stat().st_size,
                        'sha256':sha(ANSWER),'answerPage':3,'questionNumber':14,'teacherMarkedAnswer':['왼손','약지'],
                        'evidence':'원문·답안 PDF 3쪽의 4000 나눗셈과 표시된 왼손 약지를 직접 대조했다.'},
        'sourceFigureCrop':{'renderFile':'.private-work/hw-expansion-20261023/hw7/source-review/p3/exam-3.png',
                            'pixelCrop':[1320,550,1900,950],'asset':ASSET,'sha256':sha(ROOT/'bank'/ASSET),
                            'dimension':[580,400],'edited':False},
        'directPageImagesCompared':True,'sourceAndAnswerMatch':True,'sourceTypeAlreadyPresent':True,
        'newSourceTypesAdded':0,'period':18,'originalTarget':4000,'originalRemainder':4,
        'originalAnswerIndependentlyRecomputed':['왼손','약지'],'newVariants':9,'allVariantsSameSourceType':True,'variants':proof,
        'sourceExamSha256':sha(EXAM),'sourceAnswerSha256':sha(ANSWER),'dataVersion':data['version']}
(WORK/'q14-source-answer-review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
print('Built Applied7 Q14: 9 variants of the existing finger-counting type; exact source figure reused; new source types 0.')

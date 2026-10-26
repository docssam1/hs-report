#!/usr/bin/env python3
"""Extend only the existing Applied 7 square-tiling length type."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.private-work/hw-expansion-20261023/hw7'
DATA_PATH=ROOT/'bank/data/applied7-expanded.json';INDEX_PATH=ROOT/'bank/data/applied7-expanded-index.json'
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 7회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf')
ASSET='assets/applied7/q07-square-tiling-original.png'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
units=[6,18,24,30,36,42,48,54,60];items=[];proof=[]
for variant,u in enumerate(units,1):
    side_a=18*u//12;side_b=22*u//12
    assert 18*u%12==0 and 22*u%12==0
    steps=[f'원문 그림에서 색칠한 정사각형의 한 변 12cm에 대응하는 가의 한 변은 18cm입니다.',
           f'색칠한 정사각형의 한 변이 {u}cm이므로 가의 한 변은 18×{u}÷12={side_a}cm입니다.',
           f'같은 비율로 나의 한 변은 22×{u}÷12={side_b}cm입니다.']
    item={'id':f'applied7-q07-v{variant}','genId':'applied7-q07','sourceSet':'applied','sourceRound':7,'sourceNo':7,
          'variantNo':variant,'reviewStatus':'verified','area':'도형','subarea':'정사각형의 길이 관계',
          'detailType':'정사각형 타일 배열에서 한 변 길이의 비례 관계 구하기','pointBand':'2.7',
          'text':f'크고 작은 정사각형을 겹치지 않게 이어 붙여 만든 도형입니다. 색칠한 정사각형의 한 변의 길이가 {u}cm일 때, 가와 나의 각각의 한 변의 길이를 구하세요.',
          'answer':f'{side_a}, {side_b}','answerParts':[side_a,side_b],
          'answerLabels':['가의 한 변(cm)','나의 한 변(cm)'],
          'acceptedAnswers':[f'{side_a}, {side_b}',f'{side_a}cm, {side_b}cm'],'answerContract':'ordered-parts',
          'asset':{'kind':'raster','src':ASSET,'description':'활용 7회 원문 7번의 정사각형 배열 그림을 원문 그대로 사용'},
          'solutionSteps':steps,'solution':' '.join(steps),
          'learningPoint':'타일 배열에서 정해지는 변의 비를 사용해 기준 정사각형의 변 길이에 맞춰 계산한다',
          'learningLocation':'활용 7회 · 원문 7번 · 정사각형 배열과 변의 비',
          'verification':{'primaryMethod':'원문 그림의 가·나 변 길이 비를 기준 정사각형 한 변의 비로 적용한다.',
                          'independentMethod':'입력 한 변이 원래 12cm의 u/12배인지 확인하고 두 답에 같은 배율을 각각 적용한다.',
                          'parameters':{'shadedSquareSide':u,'sourceUnitSide':12,'sourceSideA':18,'sourceSideB':22,
                                        'sideA':side_a,'sideB':side_b,'scaleNumerator':u,'scaleDenominator':12},
                          'independentSuite':'qa/applied7-q07-independent-validate.py',
                          'sourceExamPage':2,'sourceExamFile':EXAM.name,'sourceAnswerPage':2,
                          'sourceDrawingCompared':True,'sourceDrawingPresent':True,'variantUsesSourceDrawing':True,
                          'studentDifficultyMeasured':False},
          'difficultyEvidence':{'basis':'source-point-band','label':'하','sourceReasoningPreserved':True,
                                'measuredVariantRate':None,'estimated':False,
                                'rationale':'활용 7회 원문 7번은 1~12번의 2.7점 배점대다. 활용 난도는 배점대만 적용한다.'}}
    items.append(item);proof.append({'variant':variant,'shadedSquareSide':u,'scale':f'{u}/12','answer':[side_a,side_b]})

data=json.loads(DATA_PATH.read_text());assert data['sourceRound']==7 and 7 not in data['availableSourceNos']
assert not [x for x in data['items'] if x['sourceNo']==7]
data['items'].extend(items);data['items'].sort(key=lambda x:(x['sourceNo'],x['variantNo']))
data['availableSourceNos']=sorted(set(data['availableSourceNos']+[7]));data['pendingSourceNos']=[n for n in range(1,31) if n not in data['availableSourceNos']]
data['itemCount']=len(data['items']);data['version']='20261025-applied7-expansion-q02-q03-q04-q05-q06-q07-q09-q10-q11-q12-q14-q16-q18-q20-q22-q25-q27-q29-r17'
idx=json.loads(INDEX_PATH.read_text());idx['version']=data['version'];idx['itemCount']=data['itemCount'];idx['pendingSourceNos']=data['pendingSourceNos']
idx['items'].append({'sourceNo':7,'genId':'applied7-q07','area':'도형','subarea':'정사각형의 길이 관계',
                     'detailType':'정사각형 타일 배열에서 한 변 길이의 비례 관계 구하기',
                     'pointBand':'2.7','reviewStatus':'verified','variantCount':9})
idx['items'].sort(key=lambda x:x['sourceNo'])
DATA_PATH.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');INDEX_PATH.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n')
review={'sourceExam':{'name':EXAM.name,'driveId':'1qtshEh5Zkv3X4DMMcXHjWw1kRgibbvxf','bytes':EXAM.stat().st_size,
                      'sha256':sha(EXAM),'questionPage':2,'questionNumber':7,
                      'sourceQuestion':'색칠한 정사각형의 한 변이 12cm일 때 가와 나의 한 변 구하기','figurePresent':True},
        'sourceAnswer':{'name':ANSWER.name,'driveId':'1zIN-XzODa-_T2AUjGbmuzHSPvCdVb2_j','bytes':ANSWER.stat().st_size,
                        'sha256':sha(ANSWER),'answerPage':2,'questionNumber':7,'teacherMarkedAnswer':[18,22],
                        'evidence':'원문·답안 PDF 2쪽의 12cm 기준과 교사 표기 가=18cm, 나=22cm를 직접 대조했다.'},
        'sourceFigureCrop':{'renderFile':'.private-work/hw-expansion-20261023/hw7/source-review/source-exam-page-2-hi-2.png',
                            'pixelCrop':[475,2850,955,3310],'asset':ASSET,'sha256':sha(ROOT/'bank'/ASSET),
                            'dimension':[480,460],'edited':False},
        'directPageImagesCompared':True,'sourceAndAnswerMatch':True,'sourceTypeAlreadyPresent':True,'newSourceTypesAdded':0,
        'sourceRatios':{'unitSide':12,'sideA':18,'sideB':22},'variants':proof,'newVariants':9,
        'allVariantsSameSourceType':True,'sourceExamSha256':sha(EXAM),'sourceAnswerSha256':sha(ANSWER),'dataVersion':data['version']}
(WORK/'q07-source-answer-review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
print('Built Applied7 Q7: 9 scale variants of the existing square-tiling type; exact source figure reused; new source types 0.')

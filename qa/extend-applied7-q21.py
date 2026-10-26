#!/usr/bin/env python3
"""Extend only the existing Applied 7 digit-sum-in-concatenated-integers type."""
import hashlib, json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.private-work/hw-expansion-20261023/hw7'
DATA_PATH=ROOT/'bank/data/applied7-expanded.json'
INDEX_PATH=ROOT/'bank/data/applied7-expanded-index.json'
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 7회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf')

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def direct(n):
    return sum(sum(map(int,str(x))) for x in range(n+1))

def positional(n):
    total=0
    factor=1
    while factor<=n:
        lower=n%factor
        cur=(n//factor)%10
        higher=n//(factor*10)
        total += higher*45*factor
        total += cur*(cur-1)//2*factor
        total += cur*(lower+1)
        factor*=10
    return total

limits=[1111,2222,3333,4444,5555,6666,7777,8888,9999]
items=[];proof=[]
for v,n in enumerate(limits,1):
    ans=direct(n)
    assert ans==positional(n)
    contributions=[];factor=1
    while factor<=n:
        lower=n%factor;cur=(n//factor)%10;higher=n//(factor*10)
        value=higher*45*factor+cur*(cur-1)//2*factor+cur*(lower+1)
        label={1:'일의 자리',10:'십의 자리',100:'백의 자리',1000:'천의 자리'}[factor]
        contributions.append(f'{label}: {higher}×45×{factor} + {cur}×({cur}-1)÷2×{factor} + {cur}×({lower}+1) = {value}')
        factor*=10
    steps=[f'한 자리씩 보면 0부터 9까지의 합 45가 자리값마다 반복됩니다.',
           '각 자리의 합은 ' + '; '.join(contributions) + '입니다.',
           f'각 자리 합을 더하면 {ans}입니다.',
           f'각 수의 자릿수를 직접 더해도 합은 {ans}입니다.']
    item={'id':f'applied7-q21-v{v}','genId':'applied7-q21','sourceSet':'applied','sourceRound':7,'sourceNo':21,
          'variantNo':v,'reviewStatus':'verified','area':'수와 식','subarea':'자연수의 자릿수 합','detailType':'0부터 일정한 수까지 이어 쓴 숫자의 합 구하기',
          'pointBand':'4.2','text':f'0부터 {n}까지의 자연수를 차례로 이어서 쓸 때, 쓴 숫자들의 합을 구하시오.',
          'answer':str(ans),'answerParts':[ans],'answerLabels':['숫자의 합'],'acceptedAnswers':[str(ans)],'answerContract':'single-number',
          'solutionSteps':steps,'solution':' '.join(steps),
          'learningPoint':'자리별로 0부터 9까지의 반복 횟수와 마지막 부분의 합을 계산한다.',
          'learningLocation':'활용 7회 · 원문 21번 · 자연수를 이어 쓴 숫자의 합',
          'verification':{'primaryMethod':'각 수의 자릿수를 직접 더한다.','independentMethod':'일의 자리, 십의 자리 등 자리값별로 숫자 출현 횟수를 계산한다.',
                          'parameters':{'upperBound':n,'directDigitSum':ans,'placeValueDigitSum':positional(n)},
                          'independentSuite':'qa/applied7-q21-independent-validate.py','sourceExamPage':5,'sourceExamFile':EXAM.name,
                          'sourceAnswerPage':5,'sourceDrawingCompared':True,'sourceDrawingPresent':False,'variantUsesSourceDrawing':False,
                          'studentDifficultyMeasured':False},
          'difficultyEvidence':{'basis':'source-point-band','label':'상','sourceReasoningPreserved':True,'measuredVariantRate':None,
                                'estimated':False,'rationale':'활용 7회 원문 21번은 23~30번의 4.2점 배점대다. 활용 난도는 배점대만 적용한다.'}}
    items.append(item);proof.append({'variant':v,'upperBound':n,'directDigitSum':ans,'placeValueDigitSum':positional(n)})

data=json.loads(DATA_PATH.read_text())
assert data['sourceRound']==7
data['items']=[x for x in data['items'] if x['sourceNo']!=21]
data['availableSourceNos']=[n for n in data['availableSourceNos'] if n!=21]
data['items'].extend(items);data['items'].sort(key=lambda x:(x['sourceNo'],x['variantNo']))
data['availableSourceNos']=sorted(data['availableSourceNos']+[21])
data['pendingSourceNos']=[n for n in range(1,31) if n not in data['availableSourceNos']]
data['itemCount']=len(data['items'])
data['version']='20261025-applied7-expansion-q02-q03-q04-q05-q06-q07-q09-q10-q11-q12-q14-q16-q18-q20-q21-q22-q25-q27-q29-r19'
idx=json.loads(INDEX_PATH.read_text());idx['version']=data['version'];idx['itemCount']=data['itemCount'];idx['pendingSourceNos']=data['pendingSourceNos'];idx['items']=[x for x in idx['items'] if x['sourceNo']!=21]
idx['items'].append({'sourceNo':21,'genId':'applied7-q21','area':'수와 식','subarea':'자연수의 자릿수 합',
                     'detailType':'0부터 일정한 수까지 이어 쓴 숫자의 합 구하기','pointBand':'4.2','reviewStatus':'verified','variantCount':9})
idx['items'].sort(key=lambda x:x['sourceNo'])
DATA_PATH.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');INDEX_PATH.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n')
review={'sourceExam':{'name':EXAM.name,'driveId':'1qtshEh5Zkv3X4DMMcXHjWw1kRgibbvxf','bytes':EXAM.stat().st_size,'sha256':sha(EXAM),
                      'questionPage':5,'questionNumber':21,'sourceQuestion':'0부터 10000까지 자연수를 이어 쓸 때 모든 숫자의 합','figurePresent':False},
        'sourceAnswer':{'name':ANSWER.name,'driveId':'1zIN-XzODa-_T2AUjGbmuzHSPvCdVb2_j','bytes':ANSWER.stat().st_size,'sha256':sha(ANSWER),
                        'answerPage':5,'questionNumber':21,'teacherMarkedAnswer':180001,
                        'evidence':'원문 및 답안 PDF 5쪽의 원문 범위와 교사 답을 직접 대조했다. 0~9999의 숫자 합은 180000이고 10000은 1을 더해 180001이다.'},
        'directPageImagesCompared':True,'sourceAndAnswerMatch':True,'sourceTypeAlreadyPresent':True,'newSourceTypesAdded':0,
        'originalIndependentCheck':{'digitSum0to9999':180000,'digitSum10000':1,'answer':180001},
        'newVariants':9,'allVariantsSameSourceType':True,'variants':proof,'sourceExamSha256':sha(EXAM),'sourceAnswerSha256':sha(ANSWER),
        'dataVersion':data['version']}
(WORK/'q21-source-answer-review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
(WORK/'q21-independent-math.json').write_text(json.dumps({'methodA':'direct sum of decimal digits for every integer 0..N',
 'methodB':'place-value digit frequency formula', 'variants':proof,'allIndependentMethodsAgree':True},ensure_ascii=False,indent=2)+'\n')
print('Built Applied 7 Q21: 9 variants of the existing concatenated-number digit-sum type; new types 0.')

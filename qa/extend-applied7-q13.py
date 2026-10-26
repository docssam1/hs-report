#!/usr/bin/env python3
"""Extend only Applied 7's existing clock-hand relative-rotation time type."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.private-work/hw-expansion-20261023/hw7'
DATA_PATH=ROOT/'bank/data/applied7-expanded.json';INDEX_PATH=ROOT/'bank/data/applied7-expanded-index.json'
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 7회.pdf'
ANSWER=WORK/'source-review/applied7-answer-candidate.pdf'
DRIVE_ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()

# Each angle difference is a multiple of 5.5 degrees so the elapsed time is a whole number of minutes.
starts=['1:15','2:20','3:05','4:40','5:10','6:25','7:30','8:20','9:15']
elapsed=[10,20,30,40,50,60,70,80,90]
angles=[55,110,165,220,275,330,385,440,495]
items=[];proof=[]
for v,(start,minutes,degrees) in enumerate(zip(starts,elapsed,angles),1):
    h,m=map(int,start.split(':'));total=(h*60+m+minutes)%(12*60);endh=(total//60) or 12;endm=total%60
    assert degrees*2==minutes*11
    answer=f'{endh}시 {endm:02d}분'
    steps=[f'두 바늘의 이동 각도 차 {degrees}°를 5.5°/분으로 나누면 {degrees}÷5.5={minutes}분입니다.',
           f'{start.replace(":","시 ")+"분"}에서 {minutes}분 뒤의 시각은 {answer}입니다.',
           f'확인하면 {minutes}×5.5={degrees}°입니다.']
    item={'id':f'applied7-q13-v{v}','genId':'applied7-q13','sourceSet':'applied','sourceRound':7,'sourceNo':13,'variantNo':v,
          'reviewStatus':'verified','area':'수와 식','subarea':'시각과 각도','detailType':'시침과 분침의 상대 각속도로 경과 시간 구하기','pointBand':'3.4',
          'text':f'현재 시각은 {start.replace(":","시 ")}분입니다. 두 바늘이 움직인 각도의 차가 {degrees}°가 되면 시각은 몇 시 몇 분입니까?',
          'answer':answer,'answerParts':[endh,endm],'answerLabels':['시','분'],
          'acceptedAnswers':[answer,f'{endh}:{endm:02d}',f'{endh}시 {endm}분'],'answerContract':'ordered-parts',
          'solutionSteps':steps,'solution':' '.join(steps),
          'learningPoint':'시침과 분침의 상대 각속도를 이용해 각도 차를 경과 시간으로 바꾸고 시작 시각에 더한다.',
          'learningLocation':'활용 7회 · 원문 13번 · 시침과 분침의 상대 각속도와 경과 시간',
          'verification':{'primaryMethod':'각도 차를 상대 각속도 5.5°/분으로 나누어 경과 시간을 구한다.',
                          'independentMethod':'2분마다 상대 각도 차가 11° 증가하는 관계를 이용해 분과 각도를 서로 검산한다.',
                          'parameters':{'startTime':start,'relativeDegreesPerMinute':'5.5','relativeAngleDifferenceDegrees':degrees,'elapsedMinutes':minutes,
                                        'endTime':answer,'angleCheck':minutes*5.5},
                          'independentSuite':'qa/applied7-q13-independent-validate.py','sourceExamPage':3,'sourceExamFile':EXAM.name,
                          'sourceAnswerPage':3,'sourceDrawingCompared':False,'sourceDrawingPresent':False,'variantUsesSourceDrawing':False,
                          'userClarification':'사용자가 확인: 분침과 시침 사이의 상대 각도 차는 1분에 5.5° 증가한다. 원문 답 440°→80분→7:45와 일치한다.',
                          'studentDifficultyMeasured':False},
          'difficultyEvidence':{'basis':'source-point-band','label':'중','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,
                                'rationale':'활용 7회 원문 13번은 13~22번의 3.4점 배점대다. 활용 난도는 배점대만 적용한다.'}}
    items.append(item);proof.append({'variant':v,'startTime':start,'relativeAngleDifferenceDegrees':degrees,
                                     'elapsedMinutes':minutes,'answer':answer,'independentCheck':f'{minutes}×5.5={degrees}'})

data=json.loads(DATA_PATH.read_text());assert data['sourceRound']==7 and 13 not in data['availableSourceNos']
assert not [x for x in data['items'] if x['sourceNo']==13]
data['items'].extend(items);data['items'].sort(key=lambda x:(x['sourceNo'],x['variantNo']))
data['availableSourceNos']=sorted(data['availableSourceNos']+[13]);data['pendingSourceNos']=[n for n in range(1,31) if n not in data['availableSourceNos']]
data['itemCount']=len(data['items'])
data['version']='20261025-applied7-expansion-q02-q03-q04-q05-q06-q07-q09-q10-q11-q12-q13-q14-q15-q16-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r26'
idx=json.loads(INDEX_PATH.read_text());idx['version']=data['version'];idx['itemCount']=data['itemCount'];idx['pendingSourceNos']=data['pendingSourceNos']
idx['items'].append({'sourceNo':13,'genId':'applied7-q13','area':'수와 식','subarea':'시각과 각도',
                     'detailType':'시침과 분침의 상대 각속도로 경과 시간 구하기','pointBand':'3.4','reviewStatus':'verified','variantCount':9})
idx['items'].sort(key=lambda x:x['sourceNo'])
DATA_PATH.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');INDEX_PATH.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n')
review={'sourceExam':{'name':EXAM.name,'sha256':sha(EXAM),'questionPage':3,'questionNumber':13,
                      'sourceQuestion':'현재 6시 25분, 두 바늘의 상대 각도 차가 440° 더 커질 때의 시각 구하기','figurePresent':False},
        'sourceAnswer':{'name':ANSWER.name,'sha256':sha(ANSWER),'answerPage':3,'questionNumber':13,
                        'teacherMarkedAnswer':'7시 45분','handwrittenCalculation':'440×2÷11=80분',
                        'syncedDriveCopySha256':sha(DRIVE_ANSWER),'syncedDriveCopyByteIdentical':sha(ANSWER)==sha(DRIVE_ANSWER)},
        'directPageImagesCompared':True,'sourceAndAnswerMatchAfterUserClarification':True,'sourceTypeAlreadyPresent':True,
        'newSourceTypesAdded':0,'userClarification':'분침과 시침의 상대 각속도 차는 1분에 5.5°다. 따라서 440÷5.5=80분이며 6:25에서 80분 뒤는 7:45다.',
        'relativeAngularSpeedDegreesPerMinute':'5.5','originalIndependentCheck':{'angleDifferenceDegrees':440,'elapsedMinutes':80,'answer':'7시 45분'},
        'newVariants':9,'allVariantsSameSourceType':True,'variants':proof,'dataVersion':data['version']}
(WORK/'q13-source-answer-review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
(WORK/'q13-source-answer-review-pending.json').unlink(missing_ok=True)
print('Built Applied7 Q13: nine variants of the existing relative clock-hand rotation type; 5.5°/minute verified; new source types 0.')

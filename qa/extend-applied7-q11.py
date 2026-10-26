#!/usr/bin/env python3
"""Extend only the existing Applied 7 calendar-weekday type."""
import calendar,datetime,hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.private-work/hw-expansion-20261023/hw7'
DATA_PATH=ROOT/'bank/data/applied7-expanded.json';INDEX_PATH=ROOT/'bank/data/applied7-expanded-index.json'
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 7회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
days=['월요일','화요일','수요일','목요일','금요일','토요일','일요일']
pairs=[(2010,2015),(2011,2016),(2013,2018),(2014,2019),(2015,2020),(2017,2022),(2018,2023),(2019,2024),(2021,2025)]
items=[];proof=[]
for variant,(start,end) in enumerate(pairs,1):
 start_date=datetime.date(start,3,1);end_date=datetime.date(end,3,1);elapsed=(end_date-start_date).days
 leap_years=[y for y in range(start,end+1) if calendar.isleap(y)]
 result=(start_date.weekday()+elapsed)%7
 steps=[f'{start}년 3월 1일부터 {end}년 3월 1일까지는 {elapsed}일입니다.',
        f'{elapsed}를 7로 나누면 나머지는 {elapsed%7}입니다.',
        f'{days[start_date.weekday()]}에서 {elapsed%7}일 뒤는 {days[result]}입니다.']
 text=(f'{start}년 삼일절은 {days[start_date.weekday()]}입니다. {end}년 삼일절은 무슨 요일인지 구하시오. '
       f'(단, 윤년인 해는 2월이 29일까지 있어서 366일입니다. {start}년에서 {end}년까지 윤년인 해는 '
       f'{", ".join(str(y) for y in leap_years)}년입니다.)')
 item={'id':f'applied7-q11-v{variant}','genId':'applied7-q11','sourceSet':'applied','sourceRound':7,'sourceNo':11,
       'variantNo':variant,'reviewStatus':'verified','area':'수와 식','subarea':'달력과 요일','detailType':'윤년을 포함한 날짜 사이의 요일 구하기',
       'pointBand':'3.4','text':text,'answer':days[result],'answerParts':[days[result]],'answerLabels':['요일'],
       'acceptedAnswers':[days[result],days[result][:-1]],'answerContract':'ordered-parts',
       'solutionSteps':steps,'solution':' '.join(steps),
       'learningPoint':'두 날짜 사이의 전체 날 수에서 7일 주기를 나누어 요일을 구한다',
       'learningLocation':'활용 7회 · 원문 11번 · 윤년과 날짜 사이의 요일',
       'verification':{'primaryMethod':'양 끝 날짜 사이의 실제 일수를 구하고 7일 주기의 나머지를 시작 요일에 더한다.',
                       'independentMethod':'해마다 보통해는 1일, 해당 구간의 윤년은 2일씩 요일 변화를 더한다.',
                       'parameters':{'startYear':start,'endYear':end,'startWeekday':days[start_date.weekday()],
                                     'elapsedDays':elapsed,'leapYears':leap_years,'weekdayAdvance':elapsed%7,
                                     'answer':days[result]},
                       'independentSuite':'qa/applied7-q11-independent-validate.py',
                       'sourceExamPage':3,'sourceExamFile':EXAM.name,'sourceAnswerPage':3,
                       'sourceDrawingCompared':True,'sourceDrawingPresent':False,'variantUsesSourceDrawing':False,
                       'studentDifficultyMeasured':False},
       'difficultyEvidence':{'basis':'source-point-band','label':'중','sourceReasoningPreserved':True,
                             'measuredVariantRate':None,'estimated':False,
                             'rationale':'활용 7회 원문 11번은 13~22번의 3.4점 배점대다. 활용 난도는 배점대만 적용한다.'}}
 items.append(item);proof.append({'variant':variant,'startYear':start,'endYear':end,'startWeekday':days[start_date.weekday()],
                                  'elapsedDays':elapsed,'leapYears':leap_years,'answer':days[result]})

data=json.loads(DATA_PATH.read_text());assert data['sourceRound']==7 and 11 not in data['availableSourceNos']
assert not [x for x in data['items'] if x['sourceNo']==11]
data['items'].extend(items);data['items'].sort(key=lambda x:(x['sourceNo'],x['variantNo']))
data['availableSourceNos']=sorted(set(data['availableSourceNos']+[11]));data['pendingSourceNos']=[n for n in range(1,31) if n not in data['availableSourceNos']]
data['itemCount']=len(data['items']);data['version']='20261025-applied7-expansion-q02-q03-q04-q05-q06-q09-q10-q11-q12-q14-q16-q18-q20-q22-q25-q27-q29-r16'
idx=json.loads(INDEX_PATH.read_text());idx['version']=data['version'];idx['itemCount']=data['itemCount'];idx['pendingSourceNos']=data['pendingSourceNos']
idx['items'].append({'sourceNo':11,'genId':'applied7-q11','area':'수와 식','subarea':'달력과 요일',
                     'detailType':'윤년을 포함한 날짜 사이의 요일 구하기','pointBand':'3.4','reviewStatus':'verified','variantCount':9})
idx['items'].sort(key=lambda x:x['sourceNo'])
DATA_PATH.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');INDEX_PATH.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n')
review={'sourceExam':{'name':EXAM.name,'driveId':'1qtshEh5Zkv3X4DMMcXHjWw1kRgibbvxf','bytes':EXAM.stat().st_size,'sha256':sha(EXAM),
                      'questionPage':3,'questionNumber':11,'sourceQuestion':'2019년 삼일절 금요일에서 2025년 삼일절 요일 구하기','figurePresent':False},
        'sourceAnswer':{'name':ANSWER.name,'driveId':'1zIN-XzODa-_T2AUjGbmuzHSPvCdVb2_j','bytes':ANSWER.stat().st_size,'sha256':sha(ANSWER),
                        'answerPage':3,'questionNumber':11,'teacherMarkedAnswer':'토요일',
                        'evidence':'문제·답안 PDF 3쪽을 직접 대조했다. 2019-03-01 금요일에서 2025-03-01 토요일까지 2192일, 요일 이동 1일이다.'},
        'directPageImagesCompared':True,'sourceAndAnswerMatch':True,'sourceTypeAlreadyPresent':True,'newSourceTypesAdded':0,
        'originalIndependentCheck':{'elapsedDays':(datetime.date(2025,3,1)-datetime.date(2019,3,1)).days,
                                    'startWeekday':days[datetime.date(2019,3,1).weekday()],
                                    'answer':days[datetime.date(2025,3,1).weekday()]},
        'newVariants':9,'allVariantsSameSourceType':True,'variants':proof,'sourceExamSha256':sha(EXAM),'sourceAnswerSha256':sha(ANSWER),
        'dataVersion':data['version']}
(WORK/'q11-source-answer-review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
print('Built Applied7 Q11: 9 variants of the existing calendar-weekday type; new source types 0.')

#!/usr/bin/env python3
"""Independently validate source and date/weekday variants for Applied 7 Q11."""
import calendar,datetime,hashlib,json,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.private-work/hw-expansion-20261023/hw7'
DATA=json.loads((ROOT/'bank/data/applied7-expanded.json').read_text());INDEX=json.loads((ROOT/'bank/data/applied7-expanded-index.json').read_text())
REVIEW=json.loads((WORK/'q11-source-answer-review.json').read_text())
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 7회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf')
PDFTOTEXT=Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(EXAM)==REVIEW['sourceExamSha256'] and sha(ANSWER)==REVIEW['sourceAnswerSha256']
exam=subprocess.check_output([str(PDFTOTEXT),'-f','3','-l','3','-layout',str(EXAM),'-'],text=True,errors='replace')
ans=subprocess.check_output([str(PDFTOTEXT),'-f','3','-l','3','-layout',str(ANSWER),'-'],text=True,errors='replace')
assert '2019년 삼일절은 금요일' in exam and '2025년 삼일절' in exam
assert '2019년 삼일절은 금요일' in ans and '2025년 삼일절' in ans
assert REVIEW['directPageImagesCompared'] and REVIEW['sourceAndAnswerMatch'] and REVIEW['sourceTypeAlreadyPresent'] and REVIEW['newSourceTypesAdded']==0
assert REVIEW['originalIndependentCheck']=={'elapsedDays':2192,'startWeekday':'금요일','answer':'토요일'}
weekdays=['월요일','화요일','수요일','목요일','금요일','토요일','일요일']
def advance_by_years(start,end):
 total=sum(2 if calendar.isleap(y) else 1 for y in range(start+1,end+1))
 return total%7
assert advance_by_years(2019,2025)==1
items=[x for x in DATA['items'] if x['sourceNo']==11];assert len(items)==9;proof=[]
for i,x in enumerate(items):
 p=x['verification']['parameters'];s=p['startYear'];e=p['endYear']
 start=datetime.date(s,3,1);finish=datetime.date(e,3,1);elapsed=(finish-start).days
 leaps=[y for y in range(s,e+1) if calendar.isleap(y)]
 assert x['id']==f'applied7-q11-v{i+1}' and p['elapsedDays']==elapsed
 assert p['leapYears']==leaps and p['startWeekday']==weekdays[start.weekday()]
 by_day=weekdays[(start.weekday()+elapsed)%7]
 by_year=weekdays[(start.weekday()+advance_by_years(s,e))%7]
 assert by_day==by_year==x['answer']==p['answer'] and x['answerContract']=='ordered-parts'
 assert x['answerParts']==[by_day] and x['pointBand']=='3.4' and x['difficultyEvidence']['label']=='중'
 proof.append({'id':x['id'],'start':start.isoformat(),'end':finish.isoformat(),'elapsedDays':elapsed,
               'leapYears':leaps,'dayCountMethod':by_day,'yearIncrementMethod':by_year,'answer':by_day})
assert DATA['version'].endswith('q07-q09-q10-q11-q12-q13-q14-q15-q16-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r26')
assert DATA['availableSourceNos']==[2,3,4,5,6,7,9,10,11,12,13,14,15,16,18,20,21,22,23,24,25,26,27,28,29,30]
assert DATA['itemCount']==234==INDEX['itemCount'] and len(DATA['pendingSourceNos'])==4
assert [x['sourceNo'] for x in INDEX['items']]==DATA['availableSourceNos']
result={'sourceTeacherAnswer':'토요일','sourceAnswerIndependentlyVerified':True,
        'newSourceTypesAdded':0,'variantCount':9,'variants':proof,
        'dataSha256':sha(ROOT/'bank/data/applied7-expanded.json'),'passed':True}
(WORK/'q11-independent-math.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('PASS Applied7 Q11: source answer Saturday; 9 date intervals checked by elapsed-day and year-by-year methods; new types 0')

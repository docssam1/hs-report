#!/usr/bin/env python3
"""Independent source and equation checks for the existing Applied 7 Q18 and Q20 types."""
import hashlib,json,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.private-work/hw-expansion-20261023/hw7'
DATA=json.loads((ROOT/'bank/data/applied7-expanded.json').read_text());INDEX=json.loads((ROOT/'bank/data/applied7-expanded-index.json').read_text())
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 7회.pdf';ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf');PDFTOTEXT=Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
for no,review_name in [(18,'q18-source-answer-review.json'),(20,'q20-source-answer-review.json')]:
 r=json.loads((WORK/review_name).read_text())
 assert sha(EXAM)==r['sourceExam']['sha256'] and sha(ANSWER)==r['sourceAnswer']['sha256']
 assert r['directPageImagesCompared'] and r['sourceAndAnswerMatch'] and r['sourceTypeAlreadyPresent'] and r['newSourceTypesAdded']==0
 t=subprocess.check_output([str(PDFTOTEXT),'-f','4','-l','4','-layout',str(EXAM),'-'],text=True,errors='replace')
 assert r['sourceExam']['questionPage']==4 and r['sourceAnswer']['answerPage']==4
 if no==18:
  assert '관호는 주연이에게 이렇게 말했습니다.' in t and r['sourceAnswer']['teacherMarkedAnswer']==[28,21]
  assert 28==4*7 and 21==3*7 and 21-7==28//2 and 28+7==2*21-7
 else:
  assert '매일 평균 14개씩 모았습' in t and r['sourceAnswer']['teacherMarkedAnswer']==6
  assert 112//14==8 and 20*(8-6)+12*6==112
items18=[x for x in DATA['items'] if x['sourceNo']==18];items20=[x for x in DATA['items'] if x['sourceNo']==20]
assert len(items18)==len(items20)==9
ageproof=[]
for v,x in enumerate(items18,1):
 p=x['verification']['parameters'];d=p['ageDifference'];A=4*d;B=3*d
 assert x['id']==f'applied7-q18-v{v}' and x['answerParts']==[A,B]
 assert B-d==A/2
 assert A+d==2*B-d
 assert x['pointBand']=='3.4' and x['difficultyEvidence']['label']=='중'
 ageproof.append({'id':x['id'],'difference':d,'ages':[A,B]})
rainproof=[]
for v,x in enumerate(items20,1):
 p=x['verification']['parameters'];s=p['sunnyPerDay'];r=p['rainyPerDay'];a=p['averagePerDay'];N=p['totalCollected'];D=p['totalDays'];rain=p['rainyDays']
 assert x['id']==f'applied7-q20-v{v}' and x['answerParts']==[rain]
 assert N==a*D==s*(D-rain)+r*rain
 solutions=[z for z in range(1,D) if s*(D-z)+r*z==N]
 assert solutions==[rain]
 assert x['pointBand']=='3.4' and x['difficultyEvidence']['label']=='중'
 rainproof.append({'id':x['id'],'sunnyPerDay':s,'rainyPerDay':r,'average':a,'total':N,'days':D,'rainyDays':rain,'uniqueSolutions':solutions})
assert DATA['availableSourceNos']==[2,3,4,5,6,7,9,10,11,12,13,14,15,16,18,20,21,22,23,24,25,26,27,28,29,30] and DATA['itemCount']==234 and INDEX['itemCount']==234
assert len(DATA['pendingSourceNos'])==4
result={'sourceExamSha256':sha(EXAM),'sourceAnswerSha256':sha(ANSWER),'question18TeacherAnswer':[28,21],'question20TeacherAnswer':6,'directPageImagesCompared':True,'newSourceTypesAdded':0,'q18Variants':ageproof,'q20Variants':rainproof,'variantCount':18,'allAgeRelationsChecked':True,'allRainDayCountsUniquelyEnumerated':True,'allVariantsUseExistingSourceTypes':True,'dataSha256':sha(ROOT/'bank/data/applied7-expanded.json'),'passed':True}
(WORK/'q18-q20-independent-math.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('PASS Applied7 Q18/Q20: answers 28,21 and 6 match source; 18 variants satisfy age equations/unique weighted-day solutions; new types 0')

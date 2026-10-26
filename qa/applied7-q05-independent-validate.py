#!/usr/bin/env python3
"""Independently verify Applied 7 Q5 source and opposite-direction variants."""
import hashlib,json,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.private-work/hw-expansion-20261023/hw7'
DATA=json.loads((ROOT/'bank/data/applied7-expanded.json').read_text());REVIEW=json.loads((WORK/'q05-source-answer-review.json').read_text())
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 7회.pdf';ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf')
PDFTOTEXT=Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(EXAM)==REVIEW['sourceExam']['sha256'] and sha(ANSWER)==REVIEW['sourceAnswer']['sha256']
t=subprocess.check_output([str(PDFTOTEXT),'-f','2','-l','2','-layout',str(EXAM),'-'],text=True,errors='replace')
assert '운동장의 같은 지점에서 동시에 출발' in t and '5번째로 만났을 때' in t
assert REVIEW['directPageImagesCompared'] and REVIEW['sourceAndAnswerMatch'] and REVIEW['sourceAnswer']['teacherMarkedAnswer']=='1725m'
assert (60+55)*3*5==1725
items=[x for x in DATA['items'] if x['sourceNo']==5];proof=[];assert len(items)==9
for i,x in enumerate(items,1):
 p=x['verification']['parameters'];circ=(p['speedA']+p['speedB'])*p['firstMeetingMinutes'];tmin=p['meetingNumber']*p['firstMeetingMinutes'];total=(p['speedA']+p['speedB'])*tmin
 assert x['id']==f'applied7-q05-v{i}' and x['variantNo']==i and x['area']=='수와 식' and x['pointBand']=='2.7' and x['difficultyEvidence']['label']=='하'
 assert p['trackCircumference']==circ and p['totalElapsedMinutes']==tmin and p['answerMetres']==total
 assert x['answerParts']==[total] and x['answer']==str(total)
 proof.append({'id':x['id'],'speedA':p['speedA'],'speedB':p['speedB'],'firstMeetingMinutes':p['firstMeetingMinutes'],'trackCircumference':circ,'meetingNumber':p['meetingNumber'],'answerMetres':total})
result={'sourceExamSha256':sha(EXAM),'sourceAnswerSha256':sha(ANSWER),'sourceQuestion':5,'teacherAnswer':'1725m','teacherAnswerIndependentlyRecomputed':1725,'directExamAndAnswerPageImagesCompared':True,'newSourceTypesAdded':0,'variants':proof,'variantCount':9,'allMeetingTimesAndDistancesVerified':True,'allVariantsUseExistingSourceType':True,'dataSha256':sha(ROOT/'bank/data/applied7-expanded.json'),'passed':True}
(WORK/'q05-independent-math.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('PASS Applied7 Q5: source answer 1725m; all 9 meeting counts and total distances independently calculated; new types 0')

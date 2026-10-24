#!/usr/bin/env python3
"""Independently verify Applied 6 Q14 clock-hand relative-motion variants."""
import hashlib, json, subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'bank/data/applied6-expanded.json';INDEX=ROOT/'bank/data/applied6-expanded-index.json'
SOURCE=ROOT/'materials/초등과정 대비 실전 모의고사 활용 6회.pdf'
ANSWER=ROOT/'.private-work/hw-expansion-20261023/hw6/source-answer-6.pdf'
OUT=ROOT/'.private-work/hw-expansion-20261023/hw6/q14-independent-math.json'
d=json.loads(DATA.read_text());idx=json.loads(INDEX.read_text())
old=json.loads(subprocess.check_output(['git','show','8d9dae219c5dece4d05f02197b90d2b70f6cf7ca:bank/data/applied6-expanded.json'],cwd=ROOT,text=True))
assert d['version']=='20261024-applied6-expansion-r12'
assert d['availableSourceNos']==[2,3,5,7,8,9,10,11,12,13,14,16] and len(d['items'])==108
assert [x for x in d['items'] if x['sourceNo'] not in (14,16)]==old['items']
assert idx['version']==d['version'] and idx['itemCount']==108 and idx['pendingSourceNos']==d['pendingSourceNos']
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()=='54a5bf1489a9d537f9cc34e6db29609bc6384f8a18b666a40eb11561f912ea4c'
assert hashlib.sha256(ANSWER.read_bytes()).hexdigest()=='b1ff5ad327fd669a56508bc1256be8743e809122f1e80b3af5f0731874939975'
assert 14 not in d['pendingSourceNos']
# The handwritten source answer is 330 * 2 / 11 = 60 minutes after 6:25.
assert 330*2//11==60 and (6*60+25+60)==7*60+25
proof=[]
for x in [q for q in d['items'] if q['sourceNo']==14]:
    p=x['verification']['parameters'];h,m=p['startingTime'];deg=p['relativeAngleDegrees']
    elapsed=deg*2//11
    candidates=[t for t in range(0,121) if 11*t==2*deg]
    assert candidates==[elapsed]
    minute_rotation=6*elapsed;hour_rotation=0.5*elapsed
    assert minute_rotation-hour_rotation==deg
    total=h*60+m+elapsed;end_h=(total//60)%12 or 12;end_m=total%60
    assert [end_h,end_m]==p['endingTime']
    assert p['elapsedMinutes']==elapsed and x['answer']==f'{end_h}시 {end_m:02d}분'
    assert x['answerParts']==[str(end_h),f'{end_m:02d}'] and x['answerContract']=='ordered-parts'
    assert x['reviewStatus']=='verified' and x['pointBand']=='3.4'
    assert x['difficultyEvidence']['estimated'] is True
    assert x['verification']['sourceExamPage']==3 and x['verification']['sourceAnswerPage']==3
    assert x['verification']['sourceDrawingPresent'] is False
    proof.append({'id':x['id'],'startingTime':[h,m],'relativeAngleDegrees':deg,'elapsedMinutes':elapsed,'minuteHandRotationDegrees':minute_rotation,'hourHandRotationDegrees':hour_rotation,'answer':x['answer'],'integerMinuteCandidates':candidates,'passed':True})
assert len(proof)==9
OUT.write_text(json.dumps({'source':{'questionPdfSha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'answerPdfSha256':hashlib.sha256(ANSWER.read_bytes()).hexdigest(),'questionPage':3,'answerPage':3,'startingTime':[6,25],'relativeAngleDegrees':330,'relativeAngularSpeedDegreesPerMinute':5.5,'elapsedMinutes':60,'teacherAnswer':'7시 25분','directPageImageCompared':True},'dataSha256':hashlib.sha256(DATA.read_bytes()).hexdigest(),'items':proof,'passed':True},ensure_ascii=False,indent=2)+'\n')
print('PASS Applied6 Q14: source 330° gives 60 minutes and 7:25; nine variants have one integer-minute solution each')

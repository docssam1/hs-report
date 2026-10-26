#!/usr/bin/env python3
"""Independently verify the existing Applied 7 relative clock-hand rotation type."""
import hashlib,json,subprocess
from pathlib import Path
from fractions import Fraction
root=Path(__file__).resolve().parents[1]
work=root/'.private-work/hw-expansion-20261023/hw7'
data=json.loads((root/'bank/data/applied7-expanded.json').read_text())
index=json.loads((root/'bank/data/applied7-expanded-index.json').read_text())
review=json.loads((work/'q13-source-answer-review.json').read_text())
exam=root/'materials/초등과정 대비 실전 모의고사활용 7회.pdf'
answer=work/'source-review/applied7-answer-candidate.pdf'
pdftotext='/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(exam)==review['sourceExam']['sha256'] and sha(answer)==review['sourceAnswer']['sha256']
source=subprocess.check_output([pdftotext,'-f','3','-l','3','-layout',str(exam),'-'],text=True,errors='replace')
assert '지금 시각은 6시 25분입니다' in source and '지금부터 긴 바늘이' in source and '움직이면 몇 시 몇분인지 구하시오' in source
assert review['sourceAnswer']['teacherMarkedAnswer']=='7시 45분'
assert review['sourceAnswer']['syncedDriveCopyByteIdentical'] is True
assert review['relativeAngularSpeedDegreesPerMinute']=='5.5'
assert Fraction(440,1)/Fraction(11,2)==80
items=[x for x in data['items'] if x['sourceNo']==13]
assert len(items)==9
for item in items:
 p=item['verification']['parameters'];h,m=map(int,p['startTime'].split(':'))
 assert p['relativeDegreesPerMinute']=='5.5'
 assert '5.5' not in item['text'] and '분침은' not in item['text']
 assert Fraction(p['relativeAngleDifferenceDegrees'],1)/Fraction(11,2)==p['elapsedMinutes']
 total=(h*60+m+p['elapsedMinutes'])%(12*60);eh=(total//60) or 12;em=total%60
 assert item['answer']==f'{eh}시 {em:02d}분'
 assert p['endTime']==item['answer'] and p['angleCheck']==p['relativeAngleDifferenceDegrees']
 assert item['answerParts']==[eh,em] and item['pointBand']=='3.4'
assert data['itemCount']==261==index['itemCount']==len(data['items'])
assert data['availableSourceNos']==[2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30]
assert data['pendingSourceNos']==[1] and index['pendingSourceNos']==data['pendingSourceNos']
assert data['version'].endswith('-r31') and index['version']==data['version']
assert review['newSourceTypesAdded']==0 and review['newVariants']==9
print('PASS Applied7 Q13: source wording and Drive answer copy checked; user-confirmed 5.5°/minute relative speed verifies 440°→80 min→7:45; nine variants independently computed.')

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Verify source-confirmed Applied 6 Q22 square-to-rectangle type and unique solutions."""
import hashlib,json
from pathlib import Path
from pypdf import PdfReader
R=Path(__file__).resolve().parents[1];W=R/'.private-work/hw-expansion-20261023/hw6'
D=json.loads((R/'bank/data/applied6-expanded.json').read_text());I=json.loads((R/'bank/data/applied6-expanded-index.json').read_text());B=json.loads((W/'q22-baseline-applied6-r17.json').read_text());Q=R/'materials/초등과정 대비 실전 모의고사 활용 6회.pdf';A=W/'source-answer-6.pdf';SR=json.loads((W/'q22-source-answer-review.json').read_text());sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
assert D['version']=='20261024-applied6-expansion-r18' and len(D['items'])==162
assert D['availableSourceNos']==[2,3,5,7,8,9,10,11,12,13,14,16,17,18,19,20,21,22]
assert D['pendingSourceNos']==[1,4,6,15,23,24,25,26,27,28,29,30]
assert I['version']==D['version'] and I['itemCount']==162 and I['pendingSourceNos']==D['pendingSourceNos']
assert [x for x in D['items'] if x['sourceNo']!=22]==B['data']['items']
assert sha(Q)==SR['sourcePdfSha256'] and sha(A)==SR['answerPdfSha256'] and SR['sourceTeacherAnswer']==36 and SR['directPageImagesCompared']
assert '세로줄이 3줄이 더' in SR['sourceQuestion'] and '100명' in SR['sourceQuestion']
rows=[(3,6),(4,4),(8,8),(10,10),(15,10),(18,9),(20,5),(24,8),(30,6)];items=[x for x in D['items'] if x['sourceNo']==22];assert len(items)==9
proof=[]
for x,(r,n) in zip(items,rows):
 total=n*n;after=n+r;per=total//after
 direct=[k for k in range(1,11) if k*k%(k+r)==0]
 divisors=[m for m in range(r+1,r+11) if r*r%m==0]
 assert direct==[n] and divisors==[n+r] and (n+r)*per==total and total<=100
 assert x['text'].startswith('관호네 반 학생들이 가로, 세로로 같은 수만큼') and f'세로줄이 {r}줄 더 생겼습니다' in x['text']
 assert x['answer']==str(total) and x['answerParts']==[total] and x['acceptedAnswers']==[str(total)]
 assert x['verification']['parameters']['divisorsInRange']==[n+r] and x['area']=='수와 식' and x['pointBand']=='3.4' and x['reviewStatus']=='verified'
 assert len(x['solutionSteps'])==4 and f'{r}²의 약수는 {n+r}뿐' in x['solutionSteps'][2]
 proof.append({'id':x['id'],'extraRows':r,'uniqueSquareSide':n,'studentCount':total,'rowsAfter':after,'studentsPerRow':per,'directEnumeration':direct,'divisorEnumeration':divisors,'passed':True})
(W/'q22-independent-math.json').write_text(json.dumps({'sourceQuestionPage':4,'sourceAnswerPage':4,'teacherAnswer':36,'sourcePdfSha256':sha(Q),'answerPdfSha256':sha(A),'directPageImagesCompared':True,'onlyExistingSourceTypeExtended':True,'variants':proof,'dataSha256':sha(R/'bank/data/applied6-expanded.json'),'passed':True},ensure_ascii=False,indent=2)+'\n')
print('PASS Q22: source images and teacher answer 36, 9 square-to-rectangle extensions, direct enumeration and divisor proof uniquely identify all totals')

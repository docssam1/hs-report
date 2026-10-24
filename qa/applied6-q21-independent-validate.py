#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Directly verify Applied 6 source Q21 and nine extensions of its existing age-relation type."""
import hashlib,json
from pathlib import Path
from pypdf import PdfReader
R=Path(__file__).resolve().parents[1];W=R/'.private-work/hw-expansion-20261023/hw6'
D=json.loads((R/'bank/data/applied6-expanded.json').read_text());I=json.loads((R/'bank/data/applied6-expanded-index.json').read_text());B=json.loads((W/'q21-baseline-applied6-r16.json').read_text())
Q=R/'materials/초등과정 대비 실전 모의고사 활용 6회.pdf';A=W/'source-answer-6.pdf';SR=json.loads((W/'q21-source-answer-review.json').read_text())
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
assert D['version']=='20261024-applied6-expansion-r17' and len(D['items'])==153
assert D['availableSourceNos']==[2,3,5,7,8,9,10,11,12,13,14,16,17,18,19,20,21]
assert D['pendingSourceNos']==[1,4,6,15,22,23,24,25,26,27,28,29,30]
assert I['version']==D['version'] and I['itemCount']==153 and I['pendingSourceNos']==D['pendingSourceNos']
assert [x for x in D['items'] if x['sourceNo']!=21]==B['data']['items']
assert sha(Q)==SR['sourcePdfSha256'] and sha(A)==SR['answerPdfSha256']
assert '나의 현재 나이의 절반' in SR['sourceQuestion'] and '3배보다 8살' in SR['sourceQuestion']
assert SR['sourceTeacherAnswer']==2 and SR['directPageImagesCompared']
items=[x for x in D['items'] if x['sourceNo']==21];assert len(items)==9
proof=[]
for x,c in zip(items,range(12,48,4)):
 d=c//4; older=4*d; younger=3*d
 # independent model: historic ages K=B, J=B-d; enforce J=A/2.
 assert younger-d==older/2
 # future occurs d years later, J reaches K's current age; verify K is 5d and 3*J_now-c equals that.
 assert younger+d==older and older+d==5*d and 3*younger-c==5*d
 assert older>younger>0 and x['answer']==str(d) and x['answerParts']==[d] and x['acceptedAnswers']==[str(d)]
 assert x['text'].endswith(f'3배보다 {c}살이 적어.”라고 말했습니다. 관호와 주연이의 나이차는 얼마일까요?')
 assert len(x['solutionSteps'])==4 and x['reviewStatus']=='verified' and x['area']=='지문 이해' and x['pointBand']=='3.4'
 assert '(y−d)=(y+d)÷2' in x['solutionSteps'][1] and 'y=3d' in x['solutionSteps'][1]
 assert x['verification']['sourceExamPage']==4 and x['verification']['sourceAnswerPage']==4
 assert f'5d=3×(3d)−{c}' in x['solutionSteps'][2] and f'd={d}' in x['solutionSteps'][3]
 # unique positive integer: 5d=9d-c iff d=c/4.
 candidates=[n for n in range(1,101) if 5*n==9*n-c];assert candidates==[d]
 proof.append({'id':x['id'],'offsetYears':c,'ageDifference':d,'currentAges':[older,younger],'historicAges':[younger,younger-d],'futureAges':[older+d,younger+d],'uniquePositiveInteger':[d],'passed':True})
assert '지문 이해' in [x['area'] for x in I['items'] if x['sourceNo']==21]
print('PASS Q21 source-type expansion: direct source/answer evidence, 9 age-relation variants, independent chronology and unique integer solution')
out={'sourceQuestionPage':4,'sourceAnswerPage':4,'teacherAnswer':2,'sourcePdfSha256':sha(Q),'answerPdfSha256':sha(A),'questionPageImageSha256':SR['questionPageImageSha256'],'answerPageImageSha256':SR['answerPageImageSha256'],'directPageImagesCompared':True,'onlyExistingSourceTypeExtended':True,'variants':proof,'dataSha256':sha(R/'bank/data/applied6-expanded.json'),'passed':True}
(W/'q21-independent-math.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')

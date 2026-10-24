#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Independently verify existing Applied 6 Q26 restricted-digit/divisibility variants."""
import hashlib,json
from pathlib import Path
from pypdf import PdfReader
R=Path(__file__).resolve().parents[1];W=R/'.private-work/hw-expansion-20261023/hw6';D=json.loads((R/'bank/data/applied6-expanded.json').read_text());I=json.loads((R/'bank/data/applied6-expanded-index.json').read_text());B=json.loads((W/'q26-baseline-applied6-r21.json').read_text());SR=json.loads((W/'q26-source-answer-review.json').read_text());Q=R/'materials/초등과정 대비 실전 모의고사 활용 6회.pdf';A=W/'source-answer-6.pdf';sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
assert D['version']=='20261024-applied6-expansion-r22' and len(D['items'])==198 and len(D['availableSourceNos'])==22
assert D['availableSourceNos']==[2,3,5,7,8,9,10,11,12,13,14,16,17,18,19,20,21,22,23,24,25,26]
assert D['pendingSourceNos']==[1,4,6,15,27,28,29,30]
assert I['version']==D['version'] and I['itemCount']==198 and I['pendingSourceNos']==D['pendingSourceNos']
assert [x for x in D['items'] if x['sourceNo']!=26]==B['data']['items']
assert sha(Q)==SR['sourcePdfSha256'] and sha(A)==SR['answerPdfSha256'] and sha(W/'q26-answer-crop.png')==SR['answerCropSha256'] and SR['directPageImagesCompared'] and SR['sourceTeacherAnswer']=='1110'
qt=PdfReader(str(Q)).pages[4].extract_text() or '';assert '15' in qt and '0' in qt and '1' in qt
pairs=[(1,1110),(2,2220),(3,30),(4,4440),(5,555),(6,60),(7,7770),(8,8880),(9,90)];items=[x for x in D['items'] if x['sourceNo']==26];assert len(items)==9;proof=[]
for x,(d,expected) in zip(items,pairs):
 n=1
 while True:
  s=str(n)
  if all(c in '0'+str(d) for c in s) and n%15==0:break
  n+=1
  assert n<=expected
 assert n==expected and x['answer']==str(n) and x['answerParts']==[n] and x['acceptedAnswers']==[str(n)]
 assert x['verification']['parameters']['allowedDigits']==[0,d] and x['verification']['parameters']['divisor']==15
 assert x['verification']['parameters']['digitSum']==sum(map(int,str(n))) and x['verification']['parameters']['terminalDigit']==str(n)[-1]
 assert x['area']=='수와 식' and x['pointBand']=='4.2' and x['difficultyEvidence']['label']=='상' and len(x['solutionSteps'])==4
 proof.append({'id':x['id'],'allowedDigits':[0,d],'smallestNumber':n,'digitSum':sum(map(int,str(n))),'remainder':n%15,'allSmallerAllowedNumbersChecked':n-1,'passed':True})
assert pairs[0][1]==int(SR['sourceTeacherAnswer'])
(W/'q26-independent-math.json').write_text(json.dumps({'sourceQuestionPage':5,'sourceAnswerPage':5,'teacherAnswer':1110,'sourcePdfSha256':sha(Q),'answerPdfSha256':sha(A),'onlyExistingSourceTypeExtended':True,'variants':proof,'dataSha256':sha(R/'bank/data/applied6-expanded.json'),'passed':True},ensure_ascii=False,indent=2)+'\n')
print('PASS Q26: original teacher answer and nine restricted-digit divisibility minima verified by exhaustive search')

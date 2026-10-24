#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Independently verify existing Applied 6 Q25 length-relation variants."""
import hashlib,json
from pathlib import Path
from pypdf import PdfReader
R=Path(__file__).resolve().parents[1];W=R/'.private-work/hw-expansion-20261023/hw6';D=json.loads((R/'bank/data/applied6-expanded.json').read_text());I=json.loads((R/'bank/data/applied6-expanded-index.json').read_text());B=json.loads((W/'q25-baseline-applied6-r20.json').read_text());SR=json.loads((W/'q25-source-answer-review.json').read_text());Q=R/'materials/초등과정 대비 실전 모의고사 활용 6회.pdf';A=W/'source-answer-6.pdf';sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
assert D['version']=='20261024-applied6-expansion-r21' and len(D['items'])==189 and len(D['availableSourceNos'])==21
assert D['availableSourceNos']==[2,3,5,7,8,9,10,11,12,13,14,16,17,18,19,20,21,22,23,24,25]
assert D['pendingSourceNos']==[1,4,6,15,26,27,28,29,30]
assert I['version']==D['version'] and I['itemCount']==189 and I['pendingSourceNos']==D['pendingSourceNos']
assert [x for x in D['items'] if x['sourceNo']!=25]==B['data']['items']
assert sha(Q)==SR['sourcePdfSha256'] and sha(A)==SR['answerPdfSha256'] and SR['directPageImagesCompared'] and SR['sourceTeacherAnswer']==80
qtext=PdfReader(str(Q)).pages[4].extract_text() or '';atext=PdfReader(str(A)).pages[4].extract_text() or ''
assert '머리' in qtext and '절반' in qtext and '꼬리' in qtext and SR['answerEvidence'].find('80cm')>=0
items=[x for x in D['items'] if x['sourceNo']==25];assert len(items)==9
proof=[]
for x in items:
 h=x['verification']['parameters']['headCm'];assert h in [10,12,14,16,18,20,22,24,26]
 # Independent exhaustive integer search under both original relations: T=(H+B)/2 and B=H+T.
 valid=[]
 for t in range(1,1000):
  b=h+t
  if 2*t==b+2*h:valid.append((t,b))
 assert valid==[(3*h,4*h)]
 t,b=valid[0];total=h+b+t
 assert x['answer']==str(total) and x['answerParts']==[total] and x['acceptedAnswers']==[str(total)]
 assert x['verification']['parameters']=={'headCm':h,'tailCm':t,'bodyCm':b,'equation':'T=(H+T)/2+H','relationUniqueSolution':True,'totalLengthCm':total}
 assert x['area']=='수와 식' and x['pointBand']=='4.2' and x['difficultyEvidence']['label']=='상' and len(x['solutionSteps'])==4
 assert x['verification']['sourceExamPage']==5 and x['verification']['sourceAnswerPage']==5 and x['verification']['sourceDrawingPresent'] is False
 proof.append({'id':x['id'],'headCm':h,'tailCm':t,'bodyCm':b,'totalCm':total,'allIntegerSolutions':valid,'passed':True})
assert items[0]['answer']==str(SR['sourceTeacherAnswer'])
(W/'q25-independent-math.json').write_text(json.dumps({'sourceQuestionPage':5,'sourceAnswerPage':5,'teacherAnswer':80,'sourcePdfSha256':sha(Q),'answerPdfSha256':sha(A),'onlyExistingSourceTypeExtended':True,'variants':proof,'dataSha256':sha(R/'bank/data/applied6-expanded.json'),'passed':True},ensure_ascii=False,indent=2)+'\n')
print('PASS Q25: source PDFs and teacher answer compared; 9 existing length-relation variants each have one independently enumerated solution')

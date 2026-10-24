#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Verify Q24 mirror-card type from source and enumerate all ordered card numbers."""
import hashlib,json,itertools,math
from pathlib import Path
from pypdf import PdfReader
R=Path(__file__).resolve().parents[1];W=R/'.private-work/hw-expansion-20261023/hw6';D=json.loads((R/'bank/data/applied6-expanded.json').read_text());I=json.loads((R/'bank/data/applied6-expanded-index.json').read_text());B=json.loads((W/'q24-baseline-applied6-r19.json').read_text());SR=json.loads((W/'q24-source-answer-review.json').read_text());Q=R/'materials/초등과정 대비 실전 모의고사 활용 6회.pdf';A=W/'source-answer-6.pdf';asset=R/'bank/assets/applied6/q24-original-cards.png';sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
assert D['version']=='20261024-applied6-expansion-r20' and len(D['items'])==180
assert D['availableSourceNos']==[2,3,5,7,8,9,10,11,12,13,14,16,17,18,19,20,21,22,23,24]
assert D['pendingSourceNos']==[1,4,6,15,25,26,27,28,29,30]
assert I['version']==D['version'] and I['itemCount']==180 and I['pendingSourceNos']==D['pendingSourceNos']
assert [x for x in D['items'] if x['sourceNo']!=24]==B['data']['items']
assert sha(Q)==SR['sourcePdfSha256'] and sha(A)==SR['answerPdfSha256'] and sha(asset)==SR['originalCardImageSha256']
assert SR['directPageImagesCompared'] and SR['cardImageReusedUnchanged'] and SR['sourceTeacherAnswer']==18
exam=PdfReader(str(Q)).pages[3].extract_text() or '';assert '성냥개비의 개수의 합이' in exam and '세 자리수' in exam
counts={0:6,1:2,2:5,3:5,5:5,8:7};pairs=[(3,12,18),(2,7,6),(2,9,2),(2,10,6),(2,12,6),(3,14,18),(3,17,18),(4,19,72),(4,21,12)];items=[x for x in D['items'] if x['sourceNo']==24];assert len(items)==9
proof=[]
for x,(k,target,expect) in zip(items,pairs):
 readable=[]
 for c in itertools.combinations(counts,k):
  if sum(counts[z] for z in c)!=target:continue
  # Enumerate every ordered number; require first/last digits nonzero so original/reflection remain k-digit.
  arrangements=[p for p in itertools.permutations(c) if p[0]!=0 and p[-1]!=0]
  readable.append({'digits':list(c),'orderedNumbers':[list(p) for p in arrangements],'count':len(arrangements)})
 total=sum(z['count'] for z in readable)
 assert total==expect and x['answer']==str(expect) and x['acceptedAnswers']==[str(expect)]
 assert x['verification']['parameters']['validCombinations']==[{'digits':z['digits'],'arrangements':z['count']} for z in readable]
 assert x['verification']['parameters']['digitCount']==k and x['verification']['parameters']['targetMatchsticks']==target
 assert x['asset']['src']=='assets/applied6/q24-original-cards.png' and x['verification']['sourceDrawingCompared'] and x['verification']['variantUsesSourceDrawing']
 assert x['area']=='경우의 수' and x['pointBand']=='4.2' and len(x['solutionSteps'])==4
 proof.append({'id':x['id'],'digitCount':k,'matchstickSum':target,'validCombinations':readable,'count':total,'passed':True})
assert pairs[0][2]==SR['sourceTeacherAnswer']
(W/'q24-independent-math.json').write_text(json.dumps({'questionPage':4,'answerPage':4,'teacherAnswer':18,'sourcePdfSha256':sha(Q),'answerPdfSha256':sha(A),'originalCardImageSha256':sha(asset),'directPageImagesCompared':True,'onlyExistingSourceTypeExtended':True,'variants':proof,'dataSha256':sha(R/'bank/data/applied6-expanded.json'),'passed':True},ensure_ascii=False,indent=2)+'\n')
print('PASS Q24: source answer 18 and unchanged cards verified; nine existing mirror-card/count variants exhaustively enumerated')

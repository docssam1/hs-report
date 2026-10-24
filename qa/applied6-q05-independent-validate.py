#!/usr/bin/env python3
"""Independent source and two-path rate checks for Applied 6 Q5."""
import hashlib,json
from fractions import Fraction
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'bank/data/applied6-expanded.json';SOURCE=ROOT/'materials/초등과정 대비 실전 모의고사 활용 6회.pdf';ANSWER=ROOT/'.private-work/hw-expansion-20261023/hw6/answer.pdf'
d=json.loads(DATA.read_text());assert d['availableSourceNos']==[2,3,5,7,8,9,10,11,12,13] and len(d['items'])==90
items=[q for q in d['items'] if q['sourceNo']==5];assert len(items)==9 and [q['variantNo'] for q in items]==list(range(1,10))
# Source p.1 and answer p.1: A=8 rotations/min; B/A=6; C/B=15/5; duration=150 min.
source={'a':8,'b':6,'c':15,'group':5,'minutes':150}
source_a=source['a']*source['minutes'];source_b=source_a*source['b'];source_c=Fraction(source_b*source['c'],source['group']);source_diff=source_c-source_b
assert (source_a,source_b,source_c,source_diff)==(1200,7200,21600,14400)
evidence=[];seen=set()
for q in items:
 p=q['verification']['parameters'];a=p['speedAperMinute'];b=p['bRotationsPerARotation'];c=p['cRotationsPerBGroup'];g=p['bRotationGroup'];t=p['elapsedMinutes']
 rateB=Fraction(a*b);rateC=rateB*Fraction(c,g);diffRate=rateC-rateB
 totalA=a*t;totalB=totalA*b;totalC=Fraction(totalB*c,g);diffTotal=totalC-totalB
 assert rateB==p['speedBperMinute'] and rateC==p['speedCperMinute']
 assert diffRate==p['differencePerMinute'] and diffTotal==p['answer']==q['answerParts'][0]
 assert q['answer']==str(q['answerParts'][0]) and q['acceptedAnswers']==[q['answer']]
 assert q['pointBand']=='2.7' and q['difficultyEvidence']['label']=='하' and q['difficultyEvidence']['measuredVariantRate'] is None
 assert q['verification']['sourceExamPage']==1 and q['verification']['sourceAnswerPage']==1 and not q['verification']['studentDifficultyMeasured']
 assert t not in [150] and (a,b,c,g,t)!=(8,6,15,5,150) and c>g and c%g==0
 assert len(q['solutionSteps'])>=3 and len(q['text'])>=50
 sig=(a,b,c,g,t);assert sig not in seen;seen.add(sig)
 evidence.append({'id':q['id'],'perMinuteRates':[str(rateB),str(rateC)],'elapsedMinutes':t,'totalRotations':[totalB,str(totalC)],'difference':str(diffTotal),'tw
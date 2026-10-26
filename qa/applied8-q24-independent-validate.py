#!/usr/bin/env python3
"""Independently validate Q24's three-faucet rates and the corrected source number."""
from fractions import Fraction
import hashlib,json
from pathlib import Path
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1];W=ROOT/'.private-work/hw-expansion-20261023/hw8';EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 8회.pdf';ANSWER=W/'source-review/applied8-answer-drive-copy.pdf'
DATA=json.loads((ROOT/'bank/data/applied8-expanded.json').read_text());INDEX=json.loads((ROOT/'bank/data/applied8-expanded-index.json').read_text());REVIEW=json.loads((W/'q24-source-review.json').read_text())
TRIPLES=[(60,90,120),(60,75,150),(60,90,90),(60,75,75),(60,105,105),(90,135,180),(45,60,90),(75,90,180),(90,120,180)]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
e=PdfReader(str(EXAM)).pages[4].extract_text();a=PdfReader(str(ANSWER)).pages[4].extract_text();assert e==a
s=''.join(e.split());assert all(k in s for k in ('물탱크','수도꼭지','채울때걸리는시간','구하여라'))
assert REVIEW['sourceExam']['questionNo']==24 and REVIEW['sourceExam']['directVisualReview'] and REVIEW['answerCandidate']['containsAnswers'] is False
items=[x for x in DATA['items'] if x['sourceNo']==24];assert len(items)==9;rows=[]
for i,(x,(t,u,v)) in enumerate(zip(items,TRIPLES),1):
 total=Fraction(1,t);ac=Fraction(1,u);bc=Fraction(1,v);ar=total-bc;br=total-ac;cr=ac+bc-total;ab=ar+br
 assert min(ar,br,cr,ab)>0 and (1/ab).denominator==1;minutes=int(1/ab)
 assert x['id']==f'applied8-q24-v{i}' and x['reviewStatus']=='verified' and x['answerParts']==[minutes] and x['answer']==f'{minutes}분'
 assert x['pointBand']=='4.2' and x['difficultyEvidence']['label']=='상'
 p=x['verification']['parameters'];assert p['allThreeMinutes']==t and p['aAndCMinutes']==u and p['bAndCMinutes']==v
 assert Fraction(p['aRate'])==ar and Fraction(p['bRate'])==br and Fraction(p['cRate'])==cr and Fraction(p['aPlusBRate'])==ab
 assert '원문 24번' in x['learningLocation'] and x['learningPoint']
 rows.append({'id':x['id'],'timesMinutes':[t,u,v],'rates':{'a':str(ar),'b':str(br),'c':str(cr),'aPlusB':str(ab)},'answer':minutes})
assert [x['answer'] for x in rows]==[72,75,90,150,70,108,60,100,120]
assert DATA['itemCount']==INDEX['itemCount']==243 and DATA['availableSourceNos']==[1,2,3,4,5,6,7,8,9,10,12,13,14,15,17,18,20,21,22,23,24,25,26,27,28,29,30]
assert next(x for x in INDEX['items'] if x['sourceNo']==24)['variantCount']==9
report={'passed':True,'sourceExamSha256':sha(EXAM),'answerCandidateSha256':sha(ANSWER),'sourceAndBlankAnswerCopyTextEqual':True,'sourceQ24AnswerDerived':'72 minutes','variants':rows,'correctedSourceNo':24,'dataSha256':sha(ROOT/'bank/data/applied8-expanded.json'),'indexSha256':sha(ROOT/'bank/data/applied8-expanded-index.json')}
(W/'q24-independent-math.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print('PASS Applied8 Q24: source p5 is the faucet problem; exact rational rates confirm source answer 72min and all nine variants.')

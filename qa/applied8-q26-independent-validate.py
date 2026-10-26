#!/usr/bin/env python3
"""Independently solve all Q26 uniform pasture growth and grazing variants."""
from fractions import Fraction
from pathlib import Path
from pypdf import PdfReader
import hashlib,json
R=Path(__file__).resolve().parents[1];W=R/'.private-work/hw-expansion-20261023/hw8';EXAM=R/'materials/초등과정 대비 실전 모의고사활용 8회.pdf';ANSWER=W/'source-review/applied8-answer-drive-copy.pdf'
D=json.loads((R/'bank/data/applied8-expanded.json').read_text());I=json.loads((R/'bank/data/applied8-expanded-index.json').read_text());REV=json.loads((W/'q26-source-review.json').read_text())
CASES=[(10,20,15,10,25),(8,20,14,8,24),(7,14,8,12,13),(9,18,15,9,21),(10,24,16,12,22),(8,20,12,10,20),(15,18,25,9,25),(14,20,21,10,27),(12,24,20,12,28)]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
e=PdfReader(str(EXAM)).pages[5].extract_text();a=PdfReader(str(ANSWER)).pages[5].extract_text();assert e==a
assert REV['sourceExam']['directVisualReview'] and REV['sourceExam']['questionNo']==26 and REV['answerCandidate']['containsAnswers'] is False
items=[x for x in D['items'] if x['sourceNo']==26];assert len(items)==9 and [x['variantNo'] for x in items]==list(range(1,10));rows=[]
for i,((m,t,n,u,p),x) in enumerate(zip(CASES,items),1):
 g=Fraction(n*u-m*t,u-t);G=(m-g)*t;net=p-g;days=G/net
 assert g>0 and G>0 and net>0 and days.denominator==1
 # Return to the original two measured times and verify the target endpoint.
 assert (m-g)*t==G and (n-g)*u==G and G-net*days==0
 assert x['id']==f'applied8-q26-v{i}' and x['reviewStatus']=='verified' and x['answerParts']==[int(days)] and x['answer']==f'{int(days)}일'
 assert x['verification']['parameters']['growthCowEquivalentsPerDay']==str(g) and x['verification']['parameters']['initialGrassCowDays']==str(G)
 assert x['pointBand']=='4.2' and x['difficultyEvidence']['label']=='상' and x['learningLocation'] and x['learningPoint'] and len(x['solutionSteps'])>=4
 rows.append({'variant':i,'growth':str(g),'initialGrass':str(G),'netPerDay':str(net),'answerDays':int(days)})
assert [r['answerDays'] for r in rows]==[5,4,7,6,8,5,9,7,8]
assert D['itemCount']==I['itemCount']==243 and D['availableSourceNos']==[1,2,3,4,5,6,7,8,9,10,12,13,14,15,17,18,20,21,22,23,24,25,26,27,28,29,30] and [x['sourceNo'] for x in I['items']]==D['availableSourceNos']
assert D['pendingSourceNos']==[n for n in range(1,31) if n not in D['availableSourceNos']]
assert next(x for x in I['items'] if x['sourceNo']==26)['variantCount']==9
out={'passed':True,'sourceExamSha256':sha(EXAM),'answerCandidateSha256':sha(ANSWER),'page6TextEqual':True,'originalAnswerDays':rows[0]['answerDays'],'variants':rows,'allRatesIndependentlyRecomputed':True,'sourceTypes':27,'itemCount':243,'newTypes':0,'difficulty':'4.2-point band only = high'}
(W/'q26-independent-math.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print('PASS Applied8 Q26: exact rational growth/consumption independently verified; original=5 days; 9 variants; current inventory=243/27.')

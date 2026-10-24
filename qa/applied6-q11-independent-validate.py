#!/usr/bin/env python3
"""Independently verify Applied 6 Q11 source minimum and nine variant minima."""
import hashlib,itertools,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'bank/data/applied6-expanded.json';SOURCE=ROOT/'materials/초등과정 대비 실전 모의고사 활용 6회.pdf';ANSWER=ROOT/'.private-work/hw-expansion-20261023/hw6/answer.pdf'
d=json.loads(DATA.read_text());assert d['version']=='20261024-applied6-expansion-r10'
assert d['availableSourceNos']==[2,3,5,7,8,9,10,11,12,13] and len(d['items'])==90
items=[x for x in d['items'] if x['sourceNo']==11];assert len(items)==9
# Source: 88 quotient by 5 gives 440. Other four distinct cards can total at most 99+98+97+96.
source_total=88*5;source_min=source_total-(99+98+97+96)
assert source_min==50 and sum([source_min,96,97,98,99])==source_total
assert all(1<=x<=99 for x in [source_min,96,97,98,99])
proof=[]
for q in items:
 p=q['verification']['parameters'];lo,hi=p['cardRange'];k=p['cardsDrawn'];target=p['requiredSum'];m=p['minimumCard'];top=p['fourLargestOtherCards']
 assert [lo,hi]==[1,p['cardRange'][1]] and k==5 and target==p['quotient']*5
 assert top==list(range(hi-3,hi+1)) and p['fourLargestSum']==sum(top)
 # Any smaller minimum x would leave at most x plus the four greatest card values.
 bound_min=target-sum(top);assert bound_min==m
 witness=tuple(sorted(p['witnessCards']));assert len(set(witness))==5 and witness[0]==m and sum(witness)==target
 allsets=[c for c in itertools.combinations(range(lo,hi+1),5) if sum(c)==target]
 exact=min(min(c) for c in allsets);assert exact==m and q['answerParts']==[m] and q['answer']==str(m)
 assert q['acceptedAnswers']==[str(m)] and q['pointBand']=='2.7' and q['difficultyEvidence']['label']=='하'
 assert q['area']=='경우의 수' and q['verification']['sourceExamPage']==2 and q['verification']['sourceAnswerPage']==2
 proof.append({'id':q['id'],'sum':target,'upperBoundMinimum':bound_min,'enumeratedMinimum':exact,'feasibleFiveCardSets':len(allsets),'witness':list(witness),'methodsAgree':True,'passed':True})
(ROOT/'.private-work/hw-expansion-20261023/hw6/q11-independent-math.json').write_text(json.dumps({'source':{'questionPdfSha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'answerPdfSha256':hashlib.sha256(ANSWER.read_bytes()).hexdigest(),'page':2,'quotient':88,'cardCount':5,'sum':source_total,'teacherAnswer':50,'independentUpperBoundAnswer':source_min,'witness':[50,96,97,98,99]},'dataSha256':hashlib.sha256(DATA.read_bytes()).hexdigest(),'items':proof,'passed':True},ensure_ascii=False,indent=2)+'\n')
print('PASS Applied6 Q11: original answer 50; nine variants independently verified by maximal-sum bound and exhaustive five-card subsets')

#!/usr/bin/env python3
"""Independent source and variant arithmetic checks for Applied 6 Q2."""
import hashlib, itertools, json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'bank/data/applied6-expanded.json'
SOURCE=ROOT/'materials/초등과정 대비 실전 모의고사 활용 6회.pdf'
ANSWER=ROOT/'.private-work/hw-expansion-20261023/hw6/answer.pdf'
d=json.loads(DATA.read_text())
assert d['sourceSet']=='applied' and d['sourceRound']==6
assert d['availableSourceNos']==[2] and d['pendingSourceNos']==[n for n in range(1,31) if n!=2]
assert len(d['items'])==9
source_t,source_p=26,9
assert source_t+source_p==35 and 3*source_t+5*source_p==123
source_solutions=[(t,p) for t in range(1,36) for p in range(1,36) if t+p==35 and 3*t+5*p==123]
assert source_solutions==[(26,9)]
seen=set(); evidence=[]
for x in d['items']:
    p=x['verification']['parameters']; a,b=p['sideCounts'];u,v=p['objectCounts'];total=p['totalObjects'];sticks=p['totalSticks']
    assert x['sourceNo']==2 and x['sourceRound']==6 and x['reviewStatus']=='verified'
    assert x['pointBand']=='2.7' and x['difficultyEvidence']['label']=='하'
    assert total==u+v and sticks==a*u+b*v and [u,v]==x['answerParts']
    assert (a,b,u,v,total,sticks) not in seen;seen.add((a,b,u,v,total,sticks))
    enum=[(m,n) for m,n in itertools.product(range(1,total),repeat=2) if m+n==total and a*m+b*n==sticks]
    assert enum==[(u,v)],(x['id'],enum)
    assert len(x['solutionSteps'])>=3 and len(set(x['answerParts']))==2
    assert x['verification']['sourceExamPage']==1 and x['verification']['sourceAnswerPage']==1
    evidence.append({'id':x['id'],'answer':x['answerParts'],'uniqueSolution':enum[0],'passed':True})
assert len({x['id'] for x in d['items']})==9
out=ROOT/'.private-work/hw-expansion-20261023/hw6/q02-independent-math.json'
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(json.dumps({'source':{'questionPdfSha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'answerPdfSha256':hashlib.sha256(ANSWER.read_bytes()).hexdigest(),'questionPage':1,'answerPage':1,'teacherMark':[26,9],'independentSourceSolutions':source_solutions},'dataSha256':hashlib.sha256(DATA.read_bytes()).hexdigest(),'items':evidence,'passed':True},ensure_ascii=False,indent=2)+'\n')
print('PASS Applied6 Q2: source answer 26/9 independently unique; 9 variants independently unique; 2.7-point low band; 3+ solution steps')

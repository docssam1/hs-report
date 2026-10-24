#!/usr/bin/env python3
"""Independent source and exhaustive arithmetic checks for Applied 6 Q3."""
import hashlib, itertools, json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'bank/data/applied6-expanded.json'
SOURCE=ROOT/'materials/초등과정 대비 실전 모의고사 활용 6회.pdf'
ANSWER=ROOT/'.private-work/hw-expansion-20261023/hw6/answer.pdf'
d=json.loads(DATA.read_text())
assert d['availableSourceNos']==[2,3,5,7,8,9,10,11,12] and len(d['items'])==81
items=[q for q in d['items'] if q['sourceNo']==3]
assert len(items)==9 and [q['variantNo'] for q in items]==list(range(1,10))
# Source PDF p.1: 30 candies; first two share equally; third has strictly more.
# Answer PDF p.1 teacher's work: 9,9,12 is the least feasible split.
source_total=30
source_feasible=[(x,source_total-2*x) for x in range(1,(source_total-1)//2+1) if source_total-2*x>x]
source_min=min(y for x,y in source_feasible)
assert source_min==12 and (9,12) in source_feasible
assert not any(y<source_min for x,y in source_feasible)
evidence=[]; seen=set()
for q in items:
    p=q['verification']['parameters']; n=p['totalObjects']; x=p['maximumEqualShare']; y=p['minimumThirdShare']
    assert q['reviewStatus']=='verified' and q['pointBand']=='2.7' and q['difficultyEvidence']['label']=='하'
    assert q['answerParts']==[y] and q['answer']==str(y) and q['acceptedAnswers']==[str(y)]
    assert 2*x+y==n and y>x and x==(n-1)//3
    feasible=[(a,n-2*a) for a in range(1,(n-1)//2+1) if n-2*a>a]
    min_y=min(b for a,b in feasible)
    minimizers=[(a,b) for a,b in feasible if b==min_y]
    assert min_y==y and minimizers==[(x,y)],(q['id'],feasible,minimizers)
    assert q['verification']['sourceExamPage']==1 and q['verification']['sourceAnswerPage']==1
    assert q['verification']['studentDifficultyMeasured'] is False
    assert q['difficultyEvidence']['measuredVariantRate'] is None
    assert len(q['solutionSteps'])>=3 and len(q['text'])>=30
    assert n!=source_total
    signature=(n,q['text'])
    assert signature not in seen; seen.add(signature)
    evidence.append({'id':q['id'],'total':n,'maxEqualShare':x,'minimumThirdShare':y,'feasibleSplits':len(feasible),'uniqueMinimum':minimizers[0],'passed':True})
assert len({q['id'] for q in items})==9
out=ROOT/'.private-work/hw-expansion-20261023/hw6/q03-independent-math.json'
out.write_text(json.dumps({'source':{'questionPdfSha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'answerPdfSha256':hashlib.sha256(ANSWER.read_bytes()).hexdigest(),'questionPage':1,'answerPage':1,'sourceTotal':source_total,'teacherAnswer':source_min,'feasibleSplits':len(source_feasible)},'dataSha256':hashlib.sha256(DATA.read_bytes()).hexdigest(),'items':evidence,'passed':True},ensure_ascii=False,indent=2)+'\n')
print('PASS Applied6 Q3: source teacher answer 12 independently confirmed; 9 variants have unique minimum by strict bound and exhaustive positive-integer enumeration')

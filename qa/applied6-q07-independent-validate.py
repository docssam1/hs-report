#!/usr/bin/env python3
"""Independently verify Applied 6 Q7 source and nine button-count variants."""
import hashlib, json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'bank/data/applied6-expanded.json'
SOURCE=ROOT/'materials/초등과정 대비 실전 모의고사 활용 6회.pdf'
ANSWER=ROOT/'.private-work/hw-expansion-20261023/hw6/answer.pdf'
d=json.loads(DATA.read_text())
assert d['version']=='20261024-applied6-expansion-r7'
assert d['availableSourceNos']==[2,3,5,7,8,9,10] and len(d['items'])==63
items=[x for x in d['items'] if x['sourceNo']==7]
assert len(items)==9 and [x['variantNo'] for x in items]==list(range(1,10))
def digit_count(n): return sum(len(str(k)) for k in range(1,n+1))
source_n=256
source_answer=digit_count(source_n)+source_n-1
assert digit_count(source_n)==660 and source_answer==915
evidence=[];seen=set()
for q in items:
    p=q['verification']['parameters'];n=p['lastNumber']
    dsum=digit_count(n);plus=n-1;direct=dsum+plus
    # Independently aggregate by digit-width intervals, avoiding the direct enumerator.
    interval=0;lo=1
    while lo<=n:
        width=len(str(lo));hi=min(n,10**width-1)
        interval+=(hi-lo+1)*width;lo=hi+1
    assert p['digitButtonCount']==dsum==interval
    assert p['plusButtonCount']==plus and p['equalsButtonCount']==0
    assert p['totalButtonPresses']==direct==q['answerParts'][0] and q['answer']==str(direct)
    assert q['acceptedAnswers']==[str(direct)]
    assert q['pointBand']=='2.7' and q['difficultyEvidence']['label']=='하'
    assert q['difficultyEvidence']['measuredVariantRate'] is None
    assert q['verification']['sourceExamPage']==2 and q['verification']['sourceAnswerPage']==2
    assert not q['verification']['studentDifficultyMeasured']
    assert n!=source_n and q['area']=='수와 식' and not q.get('asset')
    assert len(q['solutionSteps'])>=3 and q['solution'].endswith(f'{direct}번입니다.')
    assert n not in seen;seen.add(n)
    evidence.append({'id':q['id'],'lastNumber':n,'enumeratedDigitCount':dsum,'intervalDigitCount':interval,'plusCount':plus,'answer':direct,'twoMethodsAgree':True,'passed':True})
out=ROOT/'.private-work/hw-expansion-20261023/hw6/q07-independent-math.json'
out.write_text(json.dumps({'source':{'questionPdfSha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'answerPdfSha256':hashlib.sha256(ANSWER.read_bytes()).hexdigest(),'questionPage':2,'answerPage':2,'lastNumber':source_n,'digitButtonCount':660,'plusButtonCount':255,'equalsButtonCount':0,'teacherAnswer':915,'independentAnswer':source_answer},'dataSha256':hashlib.sha256(DATA.read_bytes()).hexdigest(),'items':evidence,'passed':True},ensure_ascii=False,indent=2)+'\n')
print('PASS Applied6 Q7: source answer 915; nine variants verified by enumeration and interval counts')

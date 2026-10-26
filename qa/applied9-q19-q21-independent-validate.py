#!/usr/bin/env python3
"""Independent exhaustive recalculation for Applied 9 Q19/Q21 variants."""
import itertools,json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'bank/data/applied9-expanded.json').read_text())
assert data['version']=='20261026-applied9-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q11-q12-q13-q14-q15-q16-q17-q18-q19-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-taxonomy-r25'
for no in (19,21):
    qs=[x for x in data['items'] if x['sourceNo']==no]
    assert len(qs)==9 and len({q['answer'] for q in qs})==9
    assert all(q['pointBand']=='3.4' and q['difficultyEvidence']['label']=='중' and len(q['solutionSteps'])>=4 for q in qs)
    for q in qs:
        p=q['verification']['parameters']
        if no==19:
            rows=[(n//p['divisor']+n%p['divisor'],n,n//p['divisor'],n%p['divisor']) for n in range(100,1000)]
            best=max(t[0] for t in rows); opts=[t for t in rows if t[0]==best]
            assert len(opts)==1 and opts[0][1]==int(q['answer'])
            assert opts[0][2]==p['quotient'] and opts[0][3]==p['remainder']
        else:
            all_plus=100+sum(range(1,9)); target=p['target']
            ways=[sgn for sgn in itertools.product((1,-1),repeat=8) if 100+sum((i+1)*sgn[i] for i in range(8))==target]
            subsets=[tuple(i+1 for i,s in enumerate(sgn) if s==-1) for sgn in ways]
            assert len(ways)==int(q['answer'])==p['answerCount']
            assert {tuple(x) for x in p['negativeSubsets']}==set(subsets)
            assert all_plus-target==2*p['negativeSubsetSum']
source21=[sgn for sgn in itertools.product((1,-1),repeat=8) if 100+sum((i+1)*sgn[i] for i in range(8))==108]
assert len(source21)==12
assert data['sourceReview']['questionReviews']['21']=={'candidateAnswer':14,'independentAnswer':12,'status':'candidate-discrepancy; no authoritative correction; original unchanged'}
source19=[(n//29+n%29,n) for n in range(100,1000)]
assert max(source19)==(61,985)
print('PASS: 18 Q19/Q21 variants independently enumerated; unique outputs per type. Source Q19=985; Q21 candidate 14 conflicts with exhaustive result 12.')

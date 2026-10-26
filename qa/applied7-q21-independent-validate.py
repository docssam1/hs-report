#!/usr/bin/env python3
"""Independent direct and place-value validation for Applied 7 Q21."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'bank/data/applied7-expanded.json').read_text())
group=[x for x in data['items'] if x['sourceNo']==21]
assert len(group)==9 and {x['variantNo'] for x in group}==set(range(1,10))
for x in group:
    n=x['verification']['parameters']['upperBound']
    direct=sum(sum(int(c) for c in str(k)) for k in range(n+1))
    p=1;total=0
    while p<=n:
        lo=n%p;cur=(n//p)%10;hi=n//(p*10)
        total+=hi*45*p+cur*(cur-1)//2*p+cur*(lo+1);p*=10
    assert direct==total==int(x['answer'])==x['answerParts'][0]
    assert x['sourceNo']==21 and x['genId']=='applied7-q21' and x['reviewStatus']=='verified'
review=json.loads((root/'.private-work/hw-expansion-20261023/hw7/q21-source-answer-review.json').read_text())
assert review['sourceAndAnswerMatch'] and review['sourceTypeAlreadyPresent'] and review['newSourceTypesAdded']==0
assert review['originalIndependentCheck']['answer']==180001
print('PASS Applied7 Q21: source answer 180001; 9 concatenated-number digit sums match direct and place-value calculations; new types 0')

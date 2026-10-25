#!/usr/bin/env python3
"""Independent coordinate inclusion-exclusion check for Applied 5 source Q15 and nine variants."""
import hashlib, json
from pathlib import Path
R=Path(__file__).resolve().parents[1]
D=json.loads((R/'bank/data/applied5-expanded.json').read_text())
REVIEW=json.loads((R/'.private-work/hw-expansion-20261023/hw5/q15-source-answer-review.json').read_text())
EX=R/'materials/초등과정 대비 실전 모의고사활용 5회.pdf'; ANSWER=R/'.private-work/hw-expansion-20261023/hw5/q16-source-r11/answer.pdf'
CROPS=[R/REVIEW['sourceExam']['cropPath'],R/REVIEW['sourceAnswer']['cropPath']]
def counts(front,top,right):
    # Independently expand each marked surface square through the cuboid.
    A={(x,y,z) for x,z in front for y in range(5)}
    B={(x,y,z) for x,y in top for z in range(5)}
    C={(x,y,z) for y,z in right for x in range(6)}
    pairs=(len(A&B),len(A&C),len(B&C)); triple=len(A&B&C)
    ie=len(A)+len(B)+len(C)-sum(pairs)+triple
    return ie,(len(A),len(B),len(C)),pairs,triple
source=counts([(1,3),(4,3),(2,2),(4,1)],[(1,1),(3,1),(4,2),(3,3)],[(1,3),(4,3),(2,1)])
assert source==(49,(20,20,18),(3,5,3),2),source
assert REVIEW['sourceAnswer']['teacherAnswer']==49 and REVIEW['sourceAnswer']['directVisualReview']
assert REVIEW['sourceExam']['directVisualReview'] and all(p.is_file() for p in CROPS)
assert hashlib.sha256(EX.read_bytes()).hexdigest()==REVIEW['sourceExam']['sha256']
assert hashlib.sha256(ANSWER.read_bytes()).hexdigest()==REVIEW['sourceAnswer']['sha256']=='6559ed2c3ec8c5a4908c9decaec66dc19f566ef8f672dc02dc47d96dcf9d879e'
items=[x for x in D['items'] if x['sourceNo']==15]
assert len(items)==9
for q in items:
    p=q['verification']['parameters']; front=[tuple(a) for a in p['frontMarks']];top=[tuple(a) for a in p['topMarks']];right=[tuple(a) for a in p['rightMarks']]
    total,lines,pairs,triple=counts(front,top,right)
    assert total==int(q['answer'])==p['answer'],q['id']
    assert lines==(20,20,18)
    assert pairs==(p['frontTopOverlap'],p['frontRightOverlap'],p['topRightOverlap'])
    assert triple==p['tripleOverlap']
    assert q['pointBand']=='3.4' and q['reviewStatus']=='verified'
    assert len(front)==4 and len(top)==4 and len(right)==3
    assert (R/'bank'/q['asset']['src']).is_file()
assert len(D['items'])==162 and 15 in D['availableSourceNos'] and 15 not in D['pendingSourceNos']
print('PASS Q15 source inclusion-exclusion:',source)
print('PASS Q15 variants:',[(q['variantNo'],q['answer']) for q in items])
print('PASS bank count/version:',len(D['items']),D['version'])
print('PASS source exam and answer PDF hashes + preserved direct-review crops.')

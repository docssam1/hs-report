#!/usr/bin/env python3
"""Exhaustive mirror-digit validation for existing Applied 6 Q15 type variants."""
import hashlib, itertools, json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'bank/data/applied6-expanded.json'
SOURCE=ROOT/'materials/초등과정 대비 실전 모의고사 활용 6회.pdf'
ANSWER=ROOT/'.private-work/hw-expansion-20261023/hw6/source-answer-6.pdf'
OUT=ROOT/'.private-work/hw-expansion-20261023/hw6/q15-independent-math.json'
MAP={'0':'0','1':'1','2':'5','5':'2','8':'8'}
CASES=[(775113,105088,880201),(775623,112888,888511),(776223,111888,888111),(776613,105588,882201),(777123,110888,888011),(774723,110288,885011),(777513,108288,885801),(774213,108588,882801),(773823,111288,885111)]

def mirror(s): return ''.join(MAP[c] for c in s[::-1])

d=json.loads(DATA.read_text())
assert d['version']=='20261024-applied6-expansion-r27'
assert len(d['items'])==252 and len(d['availableSourceNos'])==28 and d['pendingSourceNos']==[27,28]
valid=[]
for s in map(str,range(100000,1000000)):
    if s[0]!='0' and s[-1]!='0' and all(c in MAP for c in s):
        valid.append((int(s),int(mirror(s))))
assert len(valid)==10000
maxdiff=max(abs(m-n) for n,m in valid)
assert maxdiff < 7760130
group={}
for n,m in valid: group.setdefault(m-n,[]).append((n,m))
assert len(CASES)==9
items=[x for x in d['items'] if x['sourceNo']==15]
assert len(items)==9
proof=[]
for i,((delta,expected,reflected),x) in enumerate(zip(CASES,items),1):
    assert x['reviewStatus']=='verified' and x['variantNo']==i and x['pointBand']=='3.4'
    assert mirror(str(expected))==str(reflected) and reflected-expected==delta
    assert group[delta]==[(expected,reflected)],(delta,group.get(delta))
    assert x['answerParts']==[expected] and x['verification']['parameters']['uniqueSolutionCount']==1
    assert f'{delta:,}' in x['text'] and str(expected) not in x['text']
    assert x['verification']['sourceExamPage']==3 and x['verification']['sourceAnswerPage']==3
    proof.append({'id':x['id'],'targetDifference':delta,'original':expected,'mirror':reflected,'candidateCountForDifference':len(group[delta]),'passed':True})
teacher=105188; teacher_mirror=int(mirror(str(teacher)))
assert teacher_mirror==881201 and teacher_mirror-teacher==776013
OUT.write_text(json.dumps({'source':{'questionPdfSha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'answerPdfSha256':hashlib.sha256(ANSWER.read_bytes()).hexdigest(),'questionPage':3,'answerPage':3,'printedDifference':7760130,'teacherMarkedOriginal':teacher,'teacherMirror':teacher_mirror,'teacherCalculatedDifference':776013,'validOriginalCount':len(valid),'maximumAbsoluteDifference':maxdiff,'sourceOriginalHeldPending':True},'dataSha256':hashlib.sha256(DATA.read_bytes()).hexdigest(),'variants':proof,'existingSourceTypesOnly':True,'passed':True},ensure_ascii=False,indent=2)+'\n')
print(f'PASS Q15: enumerated {len(valid):,} six-digit inputs; source print discrepancy {7760130:,} exceeds max {maxdiff:,}; teacher calculation independently maps {teacher}→{teacher_mirror} with difference {teacher_mirror-teacher:,}.')
print('PASS Q15 variants: all 9 explicit differences have exactly one valid original number.')

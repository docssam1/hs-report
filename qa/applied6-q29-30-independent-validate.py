#!/usr/bin/env python3
"""Independent exhaustive checks for the existing Applied 6 source types Q29/Q30."""
import hashlib, itertools, json
from collections import defaultdict
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
data=json.loads((ROOT/'bank/data/applied6-expanded.json').read_text())
BASE=json.loads((ROOT/'.private-work/hw-expansion-20261023/hw6/applied6-expanded-r23.json').read_text())
assert data['version']=='20261024-applied6-expansion-r27'
assert [x for x in data['items'] if x['sourceNo'] in (2,3,5,7,8,9,10,11,12,13,14,16,17,18,19,20,21,22,23,24,25,26,29,30)]==BASE['items']
assert data['reviewSummary']['outputReviewed'] is True
assert data['sourceRound']==6 and data['sourceSet']=='applied'
assert len(data['items'])==252 and len(data['availableSourceNos'])==28
assert data['availableSourceNos'][-2:]==[29,30]
assert 29 not in data['pendingSourceNos'] and 30 not in data['pendingSourceNos']
assert 27 in data['pendingSourceNos'] and 28 in data['pendingSourceNos']
# Reconstruct all 70 source-grid paths from the printed original values.
grid=[[70,None,55,None,62],[None,54,None,57,None],[62,None,48,None,66],[None,46,None,67,None],[43,None,70,None,70]]
scoremap=defaultdict(lambda:{'paths':0,'answers':set()})
for downs in itertools.combinations(range(8),4):
    ds=set(downs); r=c=0; total=0; nums=[]
    for step in range(9):
        x=grid[r][c]
        if x is None: total-=32
        else: total+=x; nums.append(x)
        if step<8:
            if step in ds:r+=1
            else:c+=1
    assert (r,c)==(4,4) and len(nums)==5
    scoremap[total]['paths']+=1
    scoremap[total]['answers'].add(tuple(nums[1:-1]))
assert sum(x['paths'] for x in scoremap.values())==70
q29=[x for x in data['items'] if x['sourceNo']==29]
assert len(q29)==9 and [x['verification']['parameters']['scoreTarget'] for x in q29]==[180,181,182,184,185,187,188,189,190]
q29_proof=[]
for x in q29:
    p=x['verification']['parameters']; target=p['scoreTarget']; accepted={tuple(y) for y in x['acceptedAnswerParts']}
    assert p['validNumberSequences']==[list(y) for y in sorted(scoremap[target]['answers'])]
    assert accepted==scoremap[target]['answers']
    assert x['answerParts']==list(sorted(accepted)[0])
    assert x['asset']['src']=='assets/applied6/q29-original-grid.png'
    assert x['verification']['variantUsesSourceDrawing'] is True
    q29_proof.append({'id':x['id'],'targetScore':target,'geometricPaths':scoremap[target]['paths'],'acceptedIntermediateNumberSequences':[list(y) for y in sorted(accepted)],'passed':True})
# Each 3-digit-divisor variant is exhaustively checked against every allowed dividend.
q30=[x for x in data['items'] if x['sourceNo']==30]
assert len(q30)==9 and [x['verification']['parameters']['divisor'] for x in q30]==list(range(14,23))
q30_proof=[]
for x in q30:
    p=x['verification']['parameters']; d=p['divisor']
    vals=[(n//d+n%d,n,n//d,n%d) for n in range(100,1000)]
    lo=min(z[0] for z in vals); hi=max(z[0] for z in vals)
    low=[z for z in vals if z[0]==lo]; high=[z for z in vals if z[0]==hi]
    assert len(low)==len(high)==1
    assert p['minimum']=={'number':low[0][1],'quotient':low[0][2],'remainder':low[0][3],'sum':lo}
    assert p['maximum']=={'number':high[0][1],'quotient':high[0][2],'remainder':high[0][3],'sum':hi}
    assert x['answerParts']==[hi-lo] and p['difference']==hi-lo
    q30_proof.append({'id':x['id'],'divisor':d,'testedThreeDigitDividends':len(vals),'minimumWitness':p['minimum'],'maximumWitness':p['maximum'],'difference':hi-lo,'passed':True})
# Full bank type completeness, uniqueness, and exact nine-variant contracts.
for n in data['availableSourceNos']:
    group=[x for x in data['items'] if x['sourceNo']==n]
    assert len(group)==9 and sorted(x['variantNo'] for x in group)==list(range(1,10))
assert len({x['id'] for x in data['items']})==len(data['items'])
out=ROOT/'.private-work/hw-expansion-20261023/hw6/q29-30-independent-math.json'
out.write_text(json.dumps({'dataSha256':hashlib.sha256((ROOT/'bank/data/applied6-expanded.json').read_bytes()).hexdigest(),'q29':{'sourceType':'existing weighted-grid path score','enumeratedPaths':70,'variants':q29_proof},'q30':{'sourceType':'existing quotient-plus-remainder extrema','dividendRange':[100,999],'variants':q30_proof},'sourceTypesAdded':[29,30],'newTypesAdded':0,'passed':True},ensure_ascii=False,indent=2)+'\n')
print('PASS Q29: 70 paths exhaustively scored; 9 target totals, including all accepted number-sequence alternatives.')
print('PASS Q30: 9 divisors × 900 three-digit dividends exhaustively checked; extrema witnesses and differences match.')
print('PASS bank: 28 existing source types × 9 = 252; Q27/Q28 remain pending.')

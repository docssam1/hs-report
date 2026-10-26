#!/usr/bin/env python3
"""Independent recalculation of Applied 9 Q13-Q17 stored variants."""
import itertools, json
from fractions import Fraction
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
data=json.loads((ROOT/'bank/data/applied9-expanded.json').read_text())
allitems=data['items']
assert data['version']=='20261026-applied9-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q11-q12-q13-q14-q15-q16-q17-q18-q19-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-taxonomy-r25'
for no in range(13,18):
    qs=[q for q in allitems if q['sourceNo']==no]
    assert len(qs)==9 and len({q['answer'] for q in qs})==9
    for q in qs:
        assert q['pointBand']=='3.4' and q['difficultyEvidence']['label']=='중'
        assert len(q['solutionSteps'])>=4 and q['answerContract']=='single-number'
        p=q['verification']['parameters']; ans=q['answer']
        if no==13:
            digits=p['digits']
            vals={a*b-c+d for a,b,c,d in itertools.permutations(digits) if (a*b-c+d)%2==0 and a*b-c+d>0}
            assert sorted(vals)==p['evenDistinctResults'] and sum(vals)==int(ans)
        elif no==14:
            N,k,u,v=p['total'],p['ratio'],p['firstTransfer'],p['secondTransfer']
            A=int(ans); B=N-A
            assert A>=u and B+u>=v
            assert A-u+v==p['finalA'] and k*(B+u-v)==p['finalA']
            assert B+u-v==p['finalB'] and p['finalA']==k*p['finalB']
        elif no==15:
            n=p['termIndex']; g=1
            while g*(g+1)//2<n:g+=1
            r=n-g*(g-1)//2; f=Fraction(r,2*g-r+1)
            assert (g,r)==(p['group'],p['position']) and str(f)==ans
        elif no==16:
            _,a,b,end=p['checkpoints']; r1,r2,r3=p['secondsPerFloor']; rest=p['restSeconds']
            climb=(a-1)*r1+(b-a)*r2+(end-b)*r3
            pause=(end-2)*rest
            assert climb==p['climbSeconds'] and pause==p['restTotalSeconds']
            assert climb+pause==p['totalSeconds']==p['answerMinutes']*60+p['answerSeconds']
            assert ans==f"{p['answerMinutes']}분 {p['answerSeconds']}초"
        elif no==17:
            gp=[x for x in range(71,100) if (x-1)%p['grandfatherLastYearDivisor']==0 and x%p['grandfatherThisYearDivisor']==0]
            fa=[x for x in range(1,60) if x%p['fatherThisYearDivisor']==0 and (x+1)%p['fatherNextYearDivisor']==0]
            assert gp==p['grandfatherCandidates']==[p['grandfatherAge']]
            assert fa==p['fatherCandidates']==[p['fatherAge']]
            assert p['grandfatherAge']-p['fatherAge']==int(ans)

source={13:96,14:71,15:Fraction(5,16),16:(5,27),17:46}
assert source[13]==sum({a*b-c+d for a,b,c,d in itertools.permutations((5,6,7,8)) if (a*b-c+d)%2==0 and a*b-c+d>0})
assert source[14]==4*100//5+36-45
assert source[15]==Fraction(5,16)
assert source[16]==divmod(5*5+9*8+5*10+18*10,60), source[16]
assert source[17]==81-35
print('Independent check PASS: 45 variants, unique answers per source, source candidates Q13-17 match [96,71,5/16,5:27,46].')

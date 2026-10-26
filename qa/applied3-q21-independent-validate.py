"""Independent exhaustive validation of Applied 3 source question 21 variants."""
import itertools, json, hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'bank/data/applied3-expanded.json'
D=json.loads(DATA.read_text())
Q=[x for x in D['items'] if x['sourceNo']==21]
assert len(Q)==9
all_digits=set(range(1,10))
def direct(cards):
    out=[]
    for a,b,d,q in itertools.permutations(sorted(cards),4):
        dividend=10*a+b
        if dividend==d*q:
            out.append((dividend,d,q))
    return sorted(out)
def pairs(cards):
    out=[]
    for d,q in itertools.combinations(sorted(cards),2):
        dividend=d*q
        if 10<=dividend<=99:
            a,b=divmod(dividend,10)
            if a in cards and b in cards and len({a,b,d,q})==4:
                out.append({'divisor':d,'quotient':q,'dividend':dividend})
    return out
original_equations=direct(all_digits)
assert len(original_equations)==32
assert len(pairs(all_digits))==16
rows=[]
for x in Q:
    excluded=x['verification']['parameters']['excludedCard']
    cards=all_digits-{excluded}
    direct_answers=direct(cards)
    pair_list=pairs(cards)
    assert x['verification']['parameters']['availableDigits']==sorted(cards)
    assert x['verification']['parameters']['validUnorderedPairs']==pair_list
    assert x['verification']['parameters']['orderedEquationCount']==len(direct_answers)==2*len(pair_list)
    assert x['answerParts']==[len(direct_answers)]
    assert x['answer']==str(len(direct_answers))
    assert x['promptDataLines']==['□□ ÷ □ = □']
    assert f'{excluded} 카드' in x['text']
    assert len({len(set((dividend//10,dividend%10,divisor,quotient))) for dividend,divisor,quotient in direct_answers})==1
    assert all(len(set((n//10,n%10,d,q)))==4 and n==d*q for n,d,q in direct_answers)
    assert len(x['solutionSteps'])>=3
    rows.append({'id':x['id'],'excludedCard':excluded,'orderedCount':len(direct_answers),'unorderedPairs':pair_list,'directEquations':direct_answers})
assert [x['variantNo'] for x in Q]==list(range(1,10))
out=ROOT/'.private-work/hw-expansion-20261023/hw3/q21-review/q21-independent-audit-r9.json'
out.write_text(json.dumps({'sourceRound':3,'sourceNo':21,'dataSha256':hashlib.sha256(DATA.read_bytes()).hexdigest(),'originalCandidateCount':len(original_equations),'originalUnorderedPairCount':len(pairs(all_digits)),'originalEquations':original_equations,'variants':rows},ensure_ascii=False,indent=2)+'\n')
print('PASS Applied3 Q21: original 32 equations = 16 unordered pairs × 2; all 9 variants independently enumerated and cross-checked')

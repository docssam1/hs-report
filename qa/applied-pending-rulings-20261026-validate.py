"""Verify the three Applied source-answer rulings and activated 9-variant groups."""
import hashlib, json, re
from fractions import Fraction
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]

def read_json(path): return json.loads((ROOT / path).read_text())
def pool(round_no, source_no):
    data=read_json(f'bank/data/applied{round_no}-expanded.json')
    index=read_json(f'bank/data/applied{round_no}-expanded-index.json')
    assert source_no in data['availableSourceNos'] and source_no not in data['pendingSourceNos']
    assert data['version']==index['version'] and index['itemCount']==len(data['items'])
    rows=[x for x in data['items'] if x['sourceNo']==source_no]
    assert len(rows)==9 and {x['variantNo'] for x in rows}==set(range(1,10))
    assert all(x['reviewStatus']=='verified' and len(x['solutionSteps'])>=3 for x in rows)
    assert [x['answerParts'] for x in rows]
    assert any(x['sourceNo']==source_no and x['reviewStatus']=='verified' and x['variantCount']==9 for x in index['items'])
    return data,rows

# Applied1 Q28: exact source calculation and every 9 candidate's recovery period.
a1draft=read_json('.private-work/hw-expansion-20261023/hw1/q28-draft-variants-r1.json')
a1data,a1=pool(1,28)
source=Fraction(32*25)*Fraction(5,2)/125
assert source==16 and a1[0]['verification']['sourceAnswerRuling']['answer']==16
for item in a1:
    lines=item['promptDataLines']
    duration=re.search(r'(\d+)년(?:\s*(\d+)개월)?',lines[0]); years=int(duration.group(1)); months=int(duration.group(2) or 0)
    nums=lambda s: re.findall(r'\d+(?:\.\d+)?',s)
    monthly=int(nums(lines[1])[0]); cost=Fraction(nums(lines[2])[-1]); income=Fraction(nums(lines[3])[-1])
    answer=Fraction(years*12+months)*monthly*cost/income
    assert answer.denominator==1 and item['answerParts']==[answer.numerator]
    assert item['answer']==f'{answer.numerator}년' and item['promptDataLabel']=='공사 조건'
assert a1data['reviewSummary']['originalGradesChanged'] is False

# Applied3 Q06: exact work-rate system, source answer and all 9 variants.
a3draft=read_json('.private-work/hw-expansion-20261023/hw3/q06-review/q06-variants-draft-r1.json')
a3data,a3=pool(3,6)
assert hashlib.sha256((ROOT/'materials/초등과정 대비 실전 모의고사 활용 3회.pdf').read_bytes()).hexdigest()==a3draft['source']['sha256']
def rates(p):
    a,b,c,d=[p[k] for k in ('firstKwanhoDays','firstPartnerDays','secondKwanhoDays','secondPartnerDays')]
    det=a*d-b*c; x=Fraction(d-b,det); y=Fraction(a-c,det)
    assert a*x+b*y==c*x+d*y==1
    return 1/x,1/y
assert rates({'firstKwanhoDays':8,'firstPartnerDays':10,'secondKwanhoDays':4,'secondPartnerDays':15})==(16,20)
for item in a3:
    p=item['verification']['parameters']; assert rates(p)[0]==item['answerParts'][0]
    assert item['verification']['sourceAnswerRuling']['answer']==16
assert a3data['reviewSummary']['originalGradesChanged'] is False

# Applied6 Q27: source 1..60 with 100 deletions and variants, checked by greedy and DP.
a6candidate=read_json('.private-work/hw-expansion-20261023/hw6/q27-candidates-pending-answer-ruling/applied6-q27-nine-text-variants-pending-ruling-r1.json')
a6data,a6=pool(6,27)
sequence=''.join(map(str,range(1,61)))
def greedy(s,k):
    stack=[]
    for ch in s:
        while k and stack and stack[-1]<ch: stack.pop(); k-=1
        stack.append(ch)
    if k: stack=stack[:-k]
    return ''.join(stack)
def dp(s,n):
    best=['']*(n+1)
    for ch in s:
        for length in range(n,0,-1):
            if length==1 or best[length-1]: best[length]=max(best[length],best[length-1]+ch)
    return best[n]
assert len(sequence)==111 and greedy(sequence,100)==dp(sequence,11)=='99999785960'
for source_item,active in zip(a6candidate['items'],a6):
    answer=greedy(sequence,source_item['removeDigitCount'])
    assert answer==source_item['answer']==dp(sequence,source_item['keptLength'])==active['answer']
    assert len(active['answerParts'][0])==source_item['keptLength']
    assert active['promptDataLines']==['123456789101112…5960']
    assert active['verification']['sourceAnswerRuling']['answer']=='99999785960'
assert a6data['reviewSummary']['originalGradesChanged'] is False

for round_no,data in [(1,a1data),(3,a3data),(6,a6data)]:
    assert data['reviewSummary']['independentMathCount']==len(data['items'])
    assert data['reviewSummary']['sourceTypes']==len(data['availableSourceNos'])
    assert data['reviewSummary']['outputReviewed'] is False
print('PASS Applied1 Q28, Applied3 Q06, Applied6 Q27: source rulings adopted; 27 variants independently checked; active JSON/index counts consistent; original exam grades untouched; output QA still pending.')

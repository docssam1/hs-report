#!/usr/bin/env python3
"""Independent source and repeated-factorial-division validation for Applied 8 Q29."""
from pathlib import Path
from math import factorial
from pypdf import PdfReader
import json
import re

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / '.private-work/hw-expansion-20261023/hw8'
SOURCE = ROOT / 'materials/초등과정 대비 실전 모의고사활용 8회.pdf'
ANSWER = WORK / 'source-review/applied8-answer-drive-copy.pdf'
DATA = json.loads((ROOT/'bank/data/applied8-expanded.json').read_text())
INDEX = json.loads((ROOT/'bank/data/applied8-expanded-index.json').read_text())
REVIEW = json.loads((WORK/'q29-source-review.json').read_text())
MATH = json.loads((WORK/'q29-independent-math.json').read_text())
VERSION = '20261025-applied8-expansion-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q12-q13-q14-q15-q17-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r27'
SOURCE_NOS = [1,2,3,4,5,6,7,8,9,10,12,13,14,15,17,18,20,21,22,23,24,25,26,27,28,29,30]
EXPECTED_N = [100,40,50,60,72,80,90,96,120]


def valuations(n, p):
    out, power = 0, p
    while power <= n:
        out += n//power
        power *= p
    return out


def direct_first_remainder(n, d=12):
    value, count = factorial(n), 0
    while True:
        q, r = divmod(value, d)
        count += 1
        if r:
            return count, value, q, r
        value = q


source = PdfReader(str(SOURCE)).pages[5].extract_text() or ''
answer = PdfReader(str(ANSWER)).pages[5].extract_text() or ''
norm = lambda s: re.sub(r'\s+', '', s)
assert norm(source) == norm(answer)
assert '98x99x100' in norm(source) and '12' in norm(source) and '처음으로나머지가생기겠습니까' in norm(source)
assert DATA['version'] == INDEX['version'] == VERSION
assert DATA['itemCount'] == INDEX['itemCount'] == len(DATA['items']) == 243
assert DATA['availableSourceNos'] == SOURCE_NOS
assert DATA['pendingSourceNos'] == [n for n in range(1,31) if n not in SOURCE_NOS]
assert [x['sourceNo'] for x in INDEX['items']] == SOURCE_NOS
assert next(x for x in INDEX['items'] if x['sourceNo']==29)['variantCount'] == 9

items = [x for x in DATA['items'] if x['sourceNo']==29]
assert len(items)==9 and [x['verification']['parameters']['n'] for x in items]==EXPECTED_N
rows=[]
for i,item in enumerate(items):
    n=EXPECTED_N[i]; v2=valuations(n,2); v3=valuations(n,3)
    exact=min(v2//2,v3); first, value, q, rem=direct_first_remainder(n)
    p=item['verification']['parameters']
    assert first==exact+1==item['answerParts'][0]
    assert p=={'n':n,'divisor':12,'factorialTwoExponent':v2,'factorialThreeExponent':v3,'exactDivisions':exact,'firstRemainderDivision':first}
    assert item['answer']==f'{first}번째' and item['pointBand']=='4.2'
    assert item['difficultyEvidence']['label']=='상' and item['reviewStatus']=='verified'
    assert item['area']=='수와 식' and item['subarea']=='약수와 배수'
    assert item['asset'] is None and item['solutionSteps'] and len(item['solutionSteps'])==4
    assert all(step in item['solution'] for step in item['solutionSteps'])
    assert item['learningPoint'] and item['learningLocation'] and '힌트' not in item['text']
    rows.append({'n':n,'v2':v2,'v3':v3,'exactDivisions':exact,'firstRemainderDivision':first,'firstRemainder':rem})
assert items[0]['answerParts']==[49] and MATH.get('firstRemainderDivision',MATH.get('sourceFirstRemainderDivision'))==49
assert REVIEW['sourceQuestion']==29 and REVIEW['sourceExamPage']==6 and 'blank' in REVIEW['answerCandidateStatus']
report={'passed':True,'sourceAndBlankAnswerPageTextMatch':True,'sourceAnswerIndependentlyChecked':True,
        'sourceN':100,'sourceV2':valuations(100,2),'sourceV3':valuations(100,3),'sourceFirstRemainderDivision':49,
        'variants':rows,'newSourceTypes':0,'sourceTypes':27,'totalItems':243}
(WORK/'q29-independent-math.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print('PASS Applied8 Q29: source 100! first remainder on division 49; all 9 variants matched Legendre valuations and direct BigInt division; 243-item r27 index valid.')

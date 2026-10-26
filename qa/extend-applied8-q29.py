#!/usr/bin/env python3
"""Extend Applied 8 Q29's repeated division of a factorial product by 12."""
from pathlib import Path
import json
from math import factorial

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'bank/data/applied8-expanded.json'
INDEX = ROOT / 'bank/data/applied8-expanded-index.json'
WORK = ROOT / '.private-work/hw-expansion-20261023/hw8'
VERSION = '20261025-applied8-expansion-q13-q14-q15-q17-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-r15'
SOURCE_NOS = [13, 14, 15, 17, 18, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29]
TOPS = [100, 40, 50, 60, 72, 80, 90, 96, 120]
DIVISOR = 12
STEM = '1×2×3×…×{n}을 차례로 12로 나누어 갈 때, 몇 번째로 나눌 때 처음으로 나머지가 생기겠습니까?'


def valuation(n, p):
    total, power = 0, p
    while power <= n:
        total += n // power
        power *= p
    return total


def exact_divisions(n):
    # 12 = 2^2 × 3; the limiting prime exponent controls the number of exact divisions.
    return min(valuation(n, 2) // 2, valuation(n, 3))


def solution(n, t, v2, v3):
    return [
        f'곱 1×2×3×…×{n}을 12로 나누기를 반복할 때, 매번 나머지 없이 나눌 수 있는 횟수를 먼저 구합니다.',
        f'12=2²×3입니다. 곱 1×2×…×{n}에 들어 있는 2의 지수는 {v2}, 3의 지수는 {v3}입니다.',
        f'12를 한 번 나눌 때마다 2가 두 개, 3이 한 개 필요하므로 나머지 없이 나눌 수 있는 횟수는 min(⌊{v2}/2⌋, {v3})={t}회입니다.',
        f'{t}번째까지는 나머지가 없고, 그다음인 {t+1}번째 나눗셈에서 처음으로 나머지가 생깁니다.'
    ]


def make_item(i, n):
    v2, v3 = valuation(n, 2), valuation(n, 3)
    exact = exact_divisions(n)
    first_remainder = exact + 1
    steps = solution(n, exact, v2, v3)
    return {
        'id': f'applied8-q29-v{i}', 'genId': 'applied8-q29', 'sourceSet': 'applied', 'sourceRound': 8,
        'sourceNo': 29, 'variantNo': i, 'reviewStatus': 'verified', 'area': '수와 식',
        'subarea': '약수와 배수', 'detailType': '곱의 소인수 지수로 같은 수를 반복해서 나누는 횟수 구하기',
        'pointBand': '4.2', 'text': STEM.format(n=n), 'asset': None,
        'answer': f'{first_remainder}번째', 'answerParts': [first_remainder],
        'answerLabels': ['처음 나머지가 생기는 나눗셈의 순서'],
        'acceptedAnswers': [str(first_remainder), f'{first_remainder}번째', f'{first_remainder}번'],
        'answerContract': 'single-number', 'solutionSteps': steps, 'solution': ' '.join(steps),
        'learningPoint': '나누는 수를 소인수분해하고 곱에 포함된 각 소인수의 지수로 나머지 없이 반복 나눌 수 있는 횟수 구하기',
        'learningLocation': '활용 8회 · 원문 29번 · 곱의 소인수 지수와 반복 나눗셈',
        'verification': {
            'primaryMethod': 'n!에서 2와 3의 지수를 각각 레장드르 공식으로 구하고 12=2²×3의 지수 조건으로 최대 정확 나눗셈 횟수를 계산한다.',
            'independentMethod': '정수 n!을 실제로 12로 반복 나누며 몫·나머지를 직접 확인해 최초 나머지 순서를 확인한다.',
            'parameters': {'n': n, 'divisor': DIVISOR, 'factorialTwoExponent': v2, 'factorialThreeExponent': v3,
                           'exactDivisions': exact, 'firstRemainderDivision': first_remainder},
            'independentSuite': 'qa/applied8-q29-independent-validate.py',
            'sourceExamPage': 6, 'sourceExamFile': '초등과정 대비 실전 모의고사활용 8회.pdf',
            'sourceAnswerPage': 6, 'sourceDrawingCompared': False, 'sourceDrawingPresent': False,
            'officialAnswerStatus': 'The available Drive answer PDF pages are blank, text-identical copies of the question pages. The source and variants were checked independently using prime valuations and direct repeated division of arbitrary-precision factorial integers.',
            'studentDifficultyMeasured': False
        },
        'difficultyEvidence': {'basis': 'source-point-band', 'label': '상', 'sourceReasoningPreserved': True,
                               'measuredVariantRate': None, 'estimated': False,
                               'rationale': '활용 8회 원문 29번은 23~30번의 4.2점 배점대다. 활용 난도는 배점대만 적용한다.'}
    }


def main():
    d, idx = json.loads(DATA.read_text()), json.loads(INDEX.read_text())
    assert 29 not in d['availableSourceNos'] and len(TOPS) == 9
    items = [make_item(i, n) for i, n in enumerate(TOPS, 1)]
    d['items'].extend(items)
    d['availableSourceNos'] = SOURCE_NOS
    d['pendingSourceNos'] = [n for n in range(1, 31) if n not in SOURCE_NOS]
    d['itemCount'] = len(d['items'])
    d['version'] = VERSION
    idx['items'].append({'sourceNo':29,'genId':'applied8-q29','area':'수와 식','subarea':'약수와 배수',
                         'detailType':'곱의 소인수 지수로 같은 수를 반복해서 나누는 횟수 구하기',
                         'pointBand':'4.2','reviewStatus':'verified','variantCount':9})
    idx['pendingSourceNos'] = d['pendingSourceNos']
    idx['itemCount'] = d['itemCount']
    idx['version'] = VERSION
    DATA.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
    INDEX.write_text(json.dumps(idx, ensure_ascii=False, indent=2) + '\n')
    source_text = ('활용 8회 원문 29번은 1×2×3×4×…×98×99×100을 차례로 12로 나눌 때 처음 나머지가 생기는 순서를 묻는다. '
                   '문제 PDF 6쪽에서 번호·곱·나누는 수·물음을 직접 확인했다. 답안 후보 PDF 6쪽의 해당 답란은 비어 있고 지문이 원문과 동일하여 공식 정답 표기는 확인할 수 없었다. '
                   '문항의 반복 나눗셈을 몫에 다시 12를 나누는 과정으로 판독하고, 100!의 소인수 지수 계산과 실제 정수 반복 나눗셈으로 답을 독립 검산했다.')
    (WORK/'q29-source-review.json').write_text(json.dumps({'sourceExamPage':6,'sourceQuestion':29,'sourceText':source_text,
        'sourcePdf':'materials/초등과정 대비 실전 모의고사활용 8회.pdf','answerCandidatePdf':'.private-work/hw-expansion-20261023/hw8/source-review/applied8-answer-drive-copy.pdf',
        'answerCandidateStatus':'blank duplicate; no official answer marking','sourceDifficulty':'4.2-point band','newSourceTypes':0},ensure_ascii=False,indent=2)+'\n')
    (WORK/'q29-independent-math.json').write_text(json.dumps({'sourceN':100,'divisor':12,'primeExponents':{'2':97,'3':48},
        'maxExactDivisions':48,'firstRemainderDivision':49,
        'variants':[{'n':x['verification']['parameters']['n'],'v2':x['verification']['parameters']['factorialTwoExponent'],
                     'v3':x['verification']['parameters']['factorialThreeExponent'],'exactDivisions':x['verification']['parameters']['exactDivisions'],
                     'firstRemainderDivision':x['answerParts'][0]} for x in items],
        'independentMethod':'Legendre prime-exponent formula plus direct arbitrary-precision repeated division'},ensure_ascii=False,indent=2)+'\n')
    print(f'PASS generated Q29: {len(items)} variants; total {d["itemCount"]} items; source answer 49th division; version {VERSION}')


if __name__ == '__main__':
    main()

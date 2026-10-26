#!/usr/bin/env python3
"""Extend only the existing Applied 7 Q9 sum/product type."""
import hashlib, json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / '.private-work/hw-expansion-20261023/hw7'
DATA_PATH = ROOT / 'bank/data/applied7-expanded.json'
INDEX_PATH = ROOT / 'bank/data/applied7-expanded-index.json'
EXAM = ROOT / 'materials/초등과정 대비 실전 모의고사활용 7회.pdf'
ANSWER = Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf')

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

# The same existing task: determine the three-digit number from its sum and
# product with a one-digit number. Keep every answer unique and in range.
pairs = [(137,2), (284,3), (315,4), (426,5), (537,6),
         (648,7), (759,8), (864,9), (295,1)]
items, proof = [], []
for variant, (three_digit, one_digit) in enumerate(pairs, 1):
    total = three_digit + one_digit
    product = three_digit * one_digit
    candidates = [(d, product // d) for d in range(1, 10)
                  if product % d == 0 and 100 <= product // d <= 999
                  and d + product // d == total]
    assert candidates == [(one_digit, three_digit)]
    factorizations = [(d, product // d, d + product // d)
                      for d in range(1, 10)
                      if product % d == 0 and 100 <= product // d <= 999]
    steps = [
        f'곱이 {product}이므로 한 자리 수는 {", ".join(map(str, sorted({d for d,_,_ in factorizations})))} 중 하나입니다.',
        f'각 후보를 곱의 짝과 더해 보면 합이 {total}이 되는 경우는 {one_digit}+{three_digit}={total}뿐입니다.',
        f'따라서 세 자리 수는 {three_digit}입니다.'
    ]
    item = {
        'id': f'applied7-q09-v{variant}', 'genId': 'applied7-q09',
        'sourceSet': 'applied', 'sourceRound': 7, 'sourceNo': 9,
        'variantNo': variant, 'reviewStatus': 'verified',
        'area': '수와 식', 'subarea': '곱셈과 덧셈의 관계',
        'detailType': '세 자리 수와 한 자리 수의 합과 곱으로 수 찾기',
        'pointBand': '2.7',
        'text': f'세 자리 수와 한 자리 수의 합이 {total}, 곱이 {product}일 때 세 자리 수를 구하시오.',
        'answer': str(three_digit), 'answerParts': [three_digit],
        'answerLabels': ['세 자리 수'],
        'acceptedAnswers': [str(three_digit)], 'answerContract': 'single-number',
        'solutionSteps': steps, 'solution': ' '.join(steps),
        'learningPoint': '곱의 한 자리 인수를 후보로 찾고, 합 조건으로 세 자리 수를 확정한다',
        'learningLocation': '활용 7회 · 원문 9번 · 세 자리 수와 한 자리 수의 합과 곱',
        'verification': {
            'primaryMethod': '곱의 한 자리 인수 후보를 열거하고 각 몫과의 합을 비교한다.',
            'independentMethod': '합에서 한 자리 수 d를 빼 N을 나타내고 d×(합−d)=곱을 d=1~9에 각각 대입한다.',
            'parameters': {'threeDigitNumber': three_digit, 'oneDigitNumber': one_digit,
                           'sum': total, 'product': product,
                           'factorCandidates': factorizations,
                           'uniqueMatchingPair': candidates},
            'independentSuite': 'qa/applied7-q09-independent-validate.py',
            'sourceExamPage': 2, 'sourceExamFile': EXAM.name,
            'sourceAnswerPage': 2, 'sourceDrawingCompared': True,
            'sourceDrawingPresent': True, 'variantUsesSourceDrawing': False,
            'studentDifficultyMeasured': False
        },
        'difficultyEvidence': {
            'basis': 'source-point-band', 'label': '하',
            'sourceReasoningPreserved': True, 'measuredVariantRate': None,
            'estimated': False,
            'rationale': '활용 7회 원문 9번은 1~12번의 2.7점 배점대다. 활용 난도는 배점대만 적용한다.'
        }
    }
    items.append(item)
    proof.append({'variant': variant, 'threeDigitNumber': three_digit,
                  'oneDigitNumber': one_digit, 'sum': total, 'product': product,
                  'factorCandidates': factorizations, 'uniquePair': candidates})

data = json.loads(DATA_PATH.read_text())
assert data['sourceRound'] == 7 and 9 not in data['availableSourceNos']
assert not [x for x in data['items'] if x['sourceNo'] == 9]
data['items'].extend(items)
data['items'].sort(key=lambda x: (x['sourceNo'], x['variantNo']))
data['availableSourceNos'] = sorted(set(data['availableSourceNos'] + [9]))
data['pendingSourceNos'] = [n for n in range(1, 31) if n not in data['availableSourceNos']]
data['itemCount'] = len(data['items'])
data['version'] = '20261025-applied7-expansion-q02-q03-q04-q05-q06-q09-q10-q12-q16-q18-q20-q22-q25-q27-q29-r14'
idx = json.loads(INDEX_PATH.read_text())
idx['version'] = data['version']; idx['itemCount'] = data['itemCount']
idx['pendingSourceNos'] = data['pendingSourceNos']
idx['items'].append({'sourceNo': 9, 'genId': 'applied7-q09', 'area': '수와 식',
                     'subarea': '곱셈과 덧셈의 관계',
                     'detailType': '세 자리 수와 한 자리 수의 합과 곱으로 수 찾기',
                     'pointBand': '2.7', 'reviewStatus': 'verified', 'variantCount': 9})
idx['items'].sort(key=lambda x: x['sourceNo'])
DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
INDEX_PATH.write_text(json.dumps(idx, ensure_ascii=False, indent=2) + '\n')
review = {
    'sourceExam': {'name': EXAM.name, 'driveId': '1qtshEh5Zkv3X4DMMcXHjWw1kRgibbvxf',
                   'bytes': EXAM.stat().st_size, 'sha256': sha(EXAM),
                   'questionPage': 2, 'questionNumber': 9,
                   'sourceQuestion': '세 자리 수와 한 자리 수의 합이 300, 곱이 1184일 때 세 자리 수 구하기',
                   'figurePresent': True, 'figureRole': '세 자리 수와 한 자리 수를 쓰는 세로셈 상자'},
    'sourceAnswer': {'name': ANSWER.name, 'driveId': '1zIN-XzODa-_T2AUjGbmuzHSPvCdVb2_j',
                     'bytes': ANSWER.stat().st_size, 'sha256': sha(ANSWER),
                     'answerPage': 2, 'questionNumber': 9, 'teacherMarkedAnswer': 296,
                     'evidence': '문제·답안 PDF 2쪽에서 합 300, 곱 1184와 교사 답 296을 직접 대조했다.'},
    'directPageImagesCompared': True, 'sourceAndAnswerMatch': True,
    'sourceTypeAlreadyPresent': True, 'newSourceTypesAdded': 0,
    'originalIndependentCheck': {'threeDigitNumber': 296, 'oneDigitNumber': 4,
                                 'sum': 300, 'product': 1184,
                                 'enumeratedOneDigitCandidates': [[4,296]]},
    'newVariants': 9, 'allVariantsSameSourceType': True, 'variants': proof,
    'sourceExamSha256': sha(EXAM), 'sourceAnswerSha256': sha(ANSWER),
    'dataVersion': data['version']
}
(WORK/'q09-source-answer-review.json').write_text(json.dumps(review, ensure_ascii=False, indent=2)+'\n')
print('Built Applied7 Q9: 9 variants of the existing sum/product type; new source types 0.')

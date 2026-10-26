import copy, hashlib, json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / 'bank/data/applied3-expanded.json'
INDEX_PATH = ROOT / 'bank/data/applied3-expanded-index.json'
EXAM_PATH = ROOT / '.private-work/hw-expansion-20261023/hw3/source/applied3-current-source.pdf'
ANSWER_PATH = ROOT / '.private-work/hw-expansion-20261023/hw3/source/applied3-official-candidate.pdf'
VERSION = '20261025-applied3-expansion-q04-q14-q18-q21-r7'
HUNDREDS = [0, 1, 3, 4, 5, 6, 7, 8, 9]
EXAM_ID = '15PlSmA6AIAQXOTdqKmTV5fQPKfYsPntw'
ANSWER_ID = '1lmrvKvvOsrR-bmqgT5Bbi7hbR2gTHH0h'

def solve(h):
    low = 1000 + 100 * h
    high = low + 99
    candidates = [n for n in range(low, high + 1) if n % 18 == 0]
    assert candidates
    return candidates[0], candidates

def make_item(v, h, exam_sha, answer_sha):
    answer, all_multiples = solve(h)
    start = 1000 + 100 * h
    quotient = answer // 18
    previous = answer - 18
    previous_in_range = previous >= start
    steps = [
        f'백의 자리가 {h}인 네 자리 수의 범위는 {start}부터 {start + 99}까지입니다.',
        f'18의 배수는 2로 나누어떨어지고 각 자리 숫자의 합이 9의 배수입니다. 바로 앞의 18의 배수는 18×{quotient-1}={previous}로 범위의 시작 {start}보다 작고, 다음 배수 {answer}=18×{quotient}는 범위 안에 있습니다.',
        f'{answer}의 백의 자리는 {h}이고 18로 나누어떨어지므로 조건에 맞는 가장 작은 수는 {answer}입니다.'
    ]
    return {
        'id': f'applied3-q04-v{v}',
        'genId': 'applied3-q04',
        'sourceSet': 'applied', 'sourceRound': 3, 'sourceNo': 4,
        'variantNo': v, 'reviewStatus': 'verified',
        'area': '수와 식', 'subarea': '배수와 약수',
        'detailType': '자리 조건이 있는 가장 작은 배수 찾기',
        'pointBand': '2.7',
        'text': f'18로 나누어 떨어지는 수 중에서 백의 자리가 {h}인 가장 작은 네 자리 수를 구하세요.',
        'answer': str(answer), 'answerParts': [answer],
        'answerLabels': ['가장 작은 네 자리 수'],
        'acceptedAnswers': [str(answer)], 'answerContract': 'ordered-parts',
        'solutionSteps': steps,
        'solution': ' '.join(steps),
        'learningPoint': '배수의 조건과 자리값 범위를 함께 확인해 가장 작은 수 찾기',
        'learningLocation': '활용 3회 · 원문 4번 · 자리 조건이 있는 가장 작은 배수 찾기',
        'verification': {
            'primaryMethod': 'enumerate the hundred-number interval and select its first multiple of 18',
            'parameters': {
                'hundredsDigit': h, 'divisor': 18,
                'interval': [start, start + 99],
                'allMultiplesInInterval': all_multiples,
                'quotient': quotient,
                'previousMultiple': previous,
                'previousMultipleInInterval': previous_in_range
            },
            'independentSuite': 'qa/applied3-q04-independent-validate.py',
            'sourceExamPage': 1, 'sourceAnswerPage': 1,
            'sourceExamDriveId': EXAM_ID, 'sourceExamSha256': exam_sha,
            'sourceAnswerDriveId': ANSWER_ID, 'sourceAnswerSha256': answer_sha,
            'answerCopyStatus': '답안 후보 p.1에서 같은 Q4 지문은 확인했다. 공식 정답표 여부와 이 문항의 답 표기는 미확인으로 두고, 변형 정답은 독립 전수계산했다.',
            'sourceTextDirectlyReviewed': True,
            'studentDifficultyMeasured': False
        },
        'difficultyEvidence': {
            'basis': 'source-point-band', 'label': '하',
            'sourceReasoningPreserved': True, 'measuredVariantRate': None
        }
    }

data = json.loads(DATA_PATH.read_text())
before = copy.deepcopy(data)
assert data['version'] == '20261025-applied3-expansion-q14-q18-q21-r6'
assert len(data['items']) == 180 and 4 in data['pendingSourceNos']
assert all(x['sourceNo'] != 4 for x in data['items'])
exam_sha = hashlib.sha256(EXAM_PATH.read_bytes()).hexdigest()
answer_sha = hashlib.sha256(ANSWER_PATH.read_bytes()).hexdigest()
items = [make_item(i + 1, h, exam_sha, answer_sha) for i, h in enumerate(HUNDREDS)]
data['items'].extend(items)
data['items'].sort(key=lambda x: (x['sourceNo'], x['variantNo']))
data['availableSourceNos'] = sorted(data['availableSourceNos'] + [4])
data['pendingSourceNos'].remove(4)
data['sourceEditionNotes']['4'] = '원문 PDF p.1의 그림 없는 Q4 지문을 직접 확인했다. 답안 후보 p.1에 같은 지문이 있으나 공식성은 미확인이다. 원문 답 1206은 별도 전수계산으로 확인했고, 유사문제 정답은 각 자리 범위에서 18의 배수를 직접 열거했다.'
data['version'] = VERSION
data['reviewSummary']['independentMathCount'] += 9
data['reviewSummary']['sourceTypes'] += 1
data['reviewSummary']['outputReviewed'] = False
index = json.loads(INDEX_PATH.read_text())
index['version'] = VERSION
index['itemCount'] = len(data['items'])
index['pendingSourceNos'].remove(4)
index['items'].append({
    'sourceNo': 4, 'genId': 'applied3-q04', 'area': '수와 식',
    'subarea': '배수와 약수',
    'detailType': '자리 조건이 있는 가장 작은 배수 찾기',
    'pointBand': '2.7', 'reviewStatus': 'verified', 'variantCount': 9
})
index['items'].sort(key=lambda x: x['sourceNo'])
DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
INDEX_PATH.write_text(json.dumps(index, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({
    'version': VERSION, 'beforeCount': len(before['items']),
    'afterCount': len(data['items']), 'q04Answers': [x['answer'] for x in items],
    'sourceExamSha256': exam_sha, 'sourceAnswerSha256': answer_sha,
    'dataSha256': hashlib.sha256(DATA_PATH.read_bytes()).hexdigest(),
    'indexSha256': hashlib.sha256(INDEX_PATH.read_bytes()).hexdigest()
}, ensure_ascii=False, indent=2))

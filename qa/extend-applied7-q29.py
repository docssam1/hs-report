#!/usr/bin/env python3
"""Extend only the existing Applied 7 Q29 repeated-digit product type."""
import hashlib, json, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / '.private-work/hw-expansion-20261023/hw7'
DATA_PATH = ROOT / 'bank/data/applied7-expanded.json'
INDEX_PATH = ROOT / 'bank/data/applied7-expanded-index.json'
EXAM = ROOT / 'materials/초등과정 대비 실전 모의고사활용 7회.pdf'
ANSWER = Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf')
PDFTOTEXT = Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

exam_text = subprocess.check_output([str(PDFTOTEXT), '-f', '7', '-l', '7', '-layout', str(EXAM), '-'], text=True, errors='replace')
answer_text = subprocess.check_output([str(PDFTOTEXT), '-f', '7', '-l', '7', '-layout', str(ANSWER), '-'], text=True, errors='replace')
assert '10자리의 곱' in exam_text and '각 자리의 숫자를 모두 더하면' in exam_text
assert '10자리의 곱' in answer_text and '각 자리의 숫자를 모두 더하면' in answer_text

items = []
proof = []
for variant, n in enumerate(range(1, 10), 1):
    left, right = '7' * n, '9' * n
    product = int(left) * int(right)
    digit_sum = sum(map(int, str(product)))
    assert digit_sum == 9 * n
    if n == 1:
        steps = [
            '두 수를 곱하면 7×9=63입니다.',
            '곱의 각 자리 숫자를 더하면 6+3=9입니다.'
        ]
    else:
        expected_product = '7' * (n - 1) + '6' + '2' * (n - 1) + '3'
        assert str(product) == expected_product
        steps = [
            f'{left}×{right}의 곱은 {expected_product}입니다.',
            f'곱의 각 자리 숫자를 더하면 7×{n-1}+6+2×{n-1}+3={digit_sum}입니다.'
        ]
    steps.append(f'따라서 각 자리 숫자의 합은 {digit_sum}입니다.')
    text = f'두 수 {left}와 {right}를 곱했습니다. 곱의 각 자리 숫자를 모두 더하면 얼마입니까?'
    item = {
        'id': f'applied7-q29-v{variant}', 'genId': 'applied7-q29', 'sourceSet': 'applied',
        'sourceRound': 7, 'sourceNo': 29, 'variantNo': variant, 'reviewStatus': 'verified',
        'area': '수와 식', 'subarea': '곱과 각 자리 숫자',
        'detailType': '같은 숫자가 반복되는 두 수의 곱에서 각 자리 숫자의 합 구하기',
        'pointBand': '4.2', 'text': text, 'answer': str(digit_sum),
        'answerParts': [digit_sum], 'answerLabels': ['곱의 각 자리 숫자의 합'],
        'acceptedAnswers': [str(digit_sum)], 'answerContract': 'single-number',
        'solutionSteps': steps, 'solution': ' '.join(steps),
        'learningPoint': '반복되는 숫자의 곱에 나타나는 자리 배열을 찾아 각 자리 숫자의 합을 구한다',
        'learningLocation': '활용 7회 · 원문 29번 · 반복 숫자의 곱과 자리 숫자 합',
        'verification': {
            'primaryMethod': '곱을 직접 계산해 반복되는 자리 배열과 각 자리 숫자 합을 구한다.',
            'independentMethod': '정수 곱셈을 별도로 수행하고 결과 문자열의 각 숫자를 합산한다.',
            'parameters': {'repeatDigits': n, 'leftNumber': left, 'rightNumber': right, 'product': str(product), 'digitSum': digit_sum},
            'independentSuite': 'qa/applied7-q29-independent-validate.py',
            'sourceExamPage': 7, 'sourceExamFile': EXAM.name, 'sourceAnswerPage': 7,
            'sourceDrawingCompared': False, 'sourceDrawingPresent': False, 'variantUsesSourceDrawing': False,
            'studentDifficultyMeasured': False
        },
        'difficultyEvidence': {
            'basis': 'source-point-band', 'label': '상', 'sourceReasoningPreserved': True,
            'measuredVariantRate': None, 'estimated': False,
            'rationale': '활용 7회 원문 29번은 23~30번의 4.2점 배점대다. 활용 난도는 배점대만 적용한다.'
        }
    }
    items.append(item)
    proof.append({'variant': variant, 'repeatDigits': n, 'product': str(product), 'digitSum': digit_sum})

data = json.loads(DATA_PATH.read_text())
assert data['sourceRound'] == 7 and 29 not in data['availableSourceNos']
assert len([x for x in data['items'] if x['sourceNo'] == 29]) == 0
data['items'].extend(items)
data['items'].sort(key=lambda x: (x['sourceNo'], x['variantNo']))
data['availableSourceNos'] = sorted(set(data['availableSourceNos'] + [29]))
data['pendingSourceNos'] = [n for n in range(1, 31) if n not in data['availableSourceNos']]
data['itemCount'] = len(data['items'])
data['version'] = '20261024-applied7-expansion-q02-q03-q04-q05-q06-q10-q12-q16-q18-q20-q22-q27-q29-r12'

review = {
    'sourceExam': {'name': EXAM.name, 'driveId': '1qtshEh5Zkv3X4DMMcXHjWw1kRgibbvxf', 'bytes': EXAM.stat().st_size,
                   'sha256': sha(EXAM), 'questionPage': 7, 'questionNumber': 29,
                   'sourceQuestion': '10자리 7777777777×9999999999의 곱에서 각 자리 숫자의 합 구하기', 'figurePresent': False},
    'sourceAnswer': {'name': ANSWER.name, 'driveId': '1zIN-XzODa-_T2AUjGbmuzHSPvCdVb2_j', 'bytes': ANSWER.stat().st_size,
                     'sha256': sha(ANSWER), 'answerPage': 7, 'questionNumber': 29, 'teacherMarkedAnswer': 90,
                     'evidence': '문제·답안 PDF 7쪽의 원문 곱 7777777777×9999999999와 교사 답 90을 직접 대조했다.'},
    'directPageImagesCompared': True, 'sourceAndAnswerMatch': True, 'sourceTypeAlreadyPresent': True,
    'newSourceTypesAdded': 0, 'sourceAnswerIndependentCheck': {'product': str(int('7'*10)*int('9'*10)), 'digitSum': 90},
    'newVariants': 9, 'allVariantsSameSourceType': True, 'variants': proof
}
(WORK / 'q29-source-answer-review.json').write_text(json.dumps(review, ensure_ascii=False, indent=2) + '\n')

idx = json.loads(INDEX_PATH.read_text())
idx['version'] = data['version']; idx['itemCount'] = data['itemCount']; idx['pendingSourceNos'] = data['pendingSourceNos']
idx['items'].append({'sourceNo': 29, 'genId': 'applied7-q29', 'area': '수와 식', 'subarea': '곱과 각 자리 숫자',
                     'detailType': '같은 숫자가 반복되는 두 수의 곱에서 각 자리 숫자의 합 구하기',
                     'pointBand': '4.2', 'reviewStatus': 'verified', 'variantCount': 9})
idx['items'].sort(key=lambda x: x['sourceNo'])
DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
INDEX_PATH.write_text(json.dumps(idx, ensure_ascii=False, indent=2) + '\n')
print('Built Applied7 Q29: 9 variants of the existing repeated-digit product type; new source types 0.')

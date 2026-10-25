#!/usr/bin/env python3
"""Independent pair-enumeration and ranked-multiset checks for Applied5 Q29."""
import hashlib
import itertools
import json
from collections import Counter
from pathlib import Path
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / '.private-work/hw-expansion-20261023/hw5/q29-source-review'
DATA = json.loads((ROOT / 'bank/data/applied5-expanded.json').read_text())
INDEX = json.loads((ROOT / 'bank/data/applied5-expanded-index.json').read_text())
EXAM = ROOT / 'materials/초등과정 대비 실전 모의고사활용 5회.pdf'
ANSWER = Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 5회 답안.pdf')
EXAM_PAGE = ROOT / '.private-work/hw-expansion-20261023/hw5/q27-source-review/exam-6.png'
ANSWER_PAGE = ROOT / '.private-work/hw-expansion-20261023/hw5/q27-source-review/answer-27.png'
EXAM_CROP = WORK / 'exam-6-q29-crop.png'
ANSWER_CROP = WORK / 'answer-27-q29-crop.png'
EXAM_BOX = (820, 140, 1540, 450)
ANSWER_BOX = (1200, 170, 2550, 1400)
COUNTS = [6, 7, 8, 9, 10, 11, 12, 13, 14]
RANKS = [8, 11, 16, 20, 24, 28, 34, 40, 46]


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def first_binary_digit_naturals(n):
    result = []
    value = 1
    while len(result) < n:
        if set(str(value)) <= {'0', '1'}:
            result.append(value)
        value += 1
    return result


def pairs_by_combinations(n):
    values = first_binary_digit_naturals(n)
    return values, sorted(a + b for a, b in itertools.combinations(values, 2))


def answer_by_threshold(n, rank):
    values = first_binary_digit_naturals(n)
    all_sums = [a + b for i, a in enumerate(values) for b in values[i + 1:]]
    candidate = sorted(all_sums)[rank - 1]
    return candidate, sum(s < candidate for s in all_sums), sum(s == candidate for s in all_sums)


assert DATA['version'].endswith('q27-q28-q29-r23')
assert INDEX['version'] == DATA['version']
assert len(DATA['items']) == INDEX['itemCount'] == 270
assert DATA['pendingSourceNos'] == INDEX['pendingSourceNos'] == []
assert sha(EXAM) == '5a258dad75459598920ecf5e221db1b4d94dfc5899a2260cf3e7f0b121fe8d2c'
assert sha(ANSWER) == '6559ed2c3ec8c5a4908c9decaec66dc19f566ef8f672dc02dc47d96dcf9d879e'
assert ImageChops.difference(Image.open(EXAM_PAGE).crop(EXAM_BOX), Image.open(EXAM_CROP)).getbbox() is None
assert ImageChops.difference(Image.open(ANSWER_PAGE).crop(ANSWER_BOX), Image.open(ANSWER_CROP)).getbbox() is None

items = [x for x in DATA['items'] if x['sourceNo'] == 29]
assert len(items) == 9 and [x['variantNo'] for x in items] == list(range(1, 10))
proofs = []
for item, n, rank in zip(items, COUNTS, RANKS):
    params = item['verification']['parameters']
    values, sorted_sums = pairs_by_combinations(n)
    candidate = sorted_sums[rank - 1]
    by_threshold = answer_by_threshold(n, rank)
    frequencies = Counter(sorted_sums)
    below = sum(c for value, c in frequencies.items() if value < candidate)
    equal = frequencies[candidate]
    assert params['numbers'] == values
    assert params['numberCount'] == n and params['rank'] == rank
    assert params['pairCount'] == n * (n - 1) // 2 == len(sorted_sums)
    assert candidate == by_threshold[0] == params['answer'] == int(item['answer'])
    assert below == by_threshold[1] == params['sumsBelowAnswer']
    assert equal == by_threshold[2] == params['sumsEqualAnswer']
    assert below < rank <= below + equal
    assert item['answerContract'] == 'single-number' and not item.get('asset')
    assert params['rowCounts'] == [
        {'firstAddend': a,
         'belowAnswer': sum(a + b < candidate for b in values[i + 1:]),
         'equalAnswer': sum(a + b == candidate for b in values[i + 1:])}
        for i, a in enumerate(values[:-1])]
    proofs.append({'variantNo': item['variantNo'], 'numberCount': n, 'rank': rank,
                   'pairCount': len(sorted_sums), 'answer': candidate,
                   'below': below, 'equal': equal,
                   'rankInterval': [below + 1, below + equal]})

assert proofs[2]['answer'] == 201 and proofs[2]['below'] == 15 and proofs[2]['equal'] == 1
result = {'result': 'PASS', 'dataVersion': DATA['version'],
          'dataSha256': sha(ROOT / 'bank/data/applied5-expanded.json'),
          'sourceExamSha256': sha(EXAM), 'sourceAnswerSha256': sha(ANSWER),
          'sourceExamPage': 6, 'sourceAnswerPage': 27,
          'sourceQuestionDirectCropVerified': True, 'answerPromptCropVerified': True,
          'duplicateSumsCountedOncePerDistinctPair': True, 'variants': proofs,
          'officialKeyConfirmed': False}
(WORK / 'q29-independent-validation-r23.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print('PASS Applied5 Q29: all pair sums independently ranked for 9 variants; original first-8, 16th sum is 201.')

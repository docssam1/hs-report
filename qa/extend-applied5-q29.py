#!/usr/bin/env python3
"""Add nine ranked-pair-sum variants for Applied5 Q29."""
import hashlib
import itertools
import json
from pathlib import Path
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / '.private-work/hw-expansion-20261023/hw5/q29-source-review'
DATA_PATH = ROOT / 'bank/data/applied5-expanded.json'
INDEX_PATH = ROOT / 'bank/data/applied5-expanded-index.json'
EXAM = ROOT / 'materials/초등과정 대비 실전 모의고사활용 5회.pdf'
ANSWER = Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 5회 답안.pdf')
PAGE = ROOT / '.private-work/hw-expansion-20261023/hw5/q27-source-review/exam-6.png'
ANSWER_PAGE = ROOT / '.private-work/hw-expansion-20261023/hw5/q27-source-review/answer-27.png'
ANSWER_CROP = WORK / 'answer-27-q29-crop.png'
EXAM_ID = '1x7CevkWByUrXPqfbV5xTHidJPNDrbuJp'
ANSWER_ID = '1QGjWnEBjULxwy4BBX8tLutp'
VERSION = '20261025-applied5-expansion-q03-q05-q06-q08-q09-q11-q12-q14-q15-q16-q17-q18-q19-q20-q22-q23-q24-q25-q26-q27-q28-q29-r23'
BASE_VERSION = VERSION.removesuffix('-q29-r23') + '-r22'
COUNTS = [6, 7, 8, 9, 10, 11, 12, 13, 14]
RANKS = [8, 11, 16, 20, 24, 28, 34, 40, 46]


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def first_binary_digit_naturals(count):
    values = []
    x = 1
    while len(values) < count:
        if set(str(x)) <= {'0', '1'}:
            values.append(x)
        x += 1
    return values


def enumerate_pair_sums(count):
    nums = first_binary_digit_naturals(count)
    sums = sorted((a + b, a, b) for a, b in itertools.combinations(nums, 2))
    return nums, sums


def variant_proof(count, rank):
    nums, sums = enumerate_pair_sums(count)
    assert 1 <= rank <= len(sums)
    answer = sums[rank - 1][0]
    below = [x for x in sums if x[0] < answer]
    equal = [x for x in sums if x[0] == answer]
    row_counts = []
    for i, a in enumerate(nums[:-1]):
        later = nums[i + 1:]
        row_counts.append({'firstAddend': a,
                           'belowAnswer': sum(a + b < answer for b in later),
                           'equalAnswer': sum(a + b == answer for b in later)})
    assert sum(x['belowAnswer'] for x in row_counts) == len(below)
    assert sum(x['equalAnswer'] for x in row_counts) == len(equal)
    assert len(below) < rank <= len(below) + len(equal)
    return {'numberCount': count, 'rank': rank, 'numbers': nums,
            'pairCount': len(sums), 'answer': answer,
            'sumsBelowAnswer': len(below), 'sumsEqualAnswer': len(equal),
            'answerRankInterval': [len(below) + 1, len(below) + len(equal)],
            'rowCounts': row_counts,
            'pairSums': [{'sum': s, 'addends': [a, b]} for s, a, b in sums]}


def make_item(variant, count, rank, proof):
    row_table = '; '.join(f"{r['firstAddend']}→{r['belowAnswer']}/{r['equalAnswer']}"
                          for r in proof['rowCounts'])
    steps = [
        f'0과 1로만 만든 자연수 중 작은 순서대로 {count}개를 쓰면 {", ".join(map(str, proof["numbers"]))}입니다.',
        f'서로 다른 두 수를 고르는 쌍은 {count}×({count}−1)÷2={proof["pairCount"]}개입니다. 각 쌍에서 나온 합을 모두 세며, 같은 합이 여러 쌍에서 나오면 나온 횟수만큼 셉니다.',
        f'각 첫째 수별로 {proof["answer"]}보다 작은 합의 수/같은 합의 수를 세면 {row_table}입니다. 따라서 {proof["answer"]}보다 작은 합은 모두 {proof["sumsBelowAnswer"]}개이고, {proof["answer"]}와 같은 합은 {proof["sumsEqualAnswer"]}개입니다.',
        f'{proof["answer"]}가 놓이는 순위는 {proof["answerRankInterval"][0]}번째부터 {proof["answerRankInterval"][1]}번째까지이므로, {rank}번째 수는 {proof["answer"]}입니다.'
    ]
    return {
        'id': f'applied5-q29-v{variant}', 'genId': 'applied5-q29',
        'sourceSet': 'applied', 'sourceRound': 5, 'sourceNo': 29,
        'variantNo': variant, 'reviewStatus': 'verified',
        'area': '경우의 수', 'subarea': '두 수의 짝짓기',
        'detailType': '0과 1로 만든 수의 모든 두 수 합에서 순위 찾기',
        'pointBand': '4.2',
        'text': f'수 1, 10, 11, 100 등과 같이 0과 1로만 만들 수 있는 자연수가 작은 것부터 차례로 {count}개 있습니다. 이 수 중 서로 다른 두 수를 고르는 모든 쌍의 합을 구하여 작은 수부터 차례로 쓸 때, {rank}번째 수는 얼마입니까?',
        'answer': str(proof['answer']), 'answerParts': [proof['answer']],
        'answerLabels': [f'{rank}번째 합'],
        'acceptedAnswers': [str(proof['answer'])], 'answerContract': 'single-number',
        'solutionSteps': steps, 'solution': ' '.join(steps),
        'learningPoint': '서로 다른 두 수의 쌍을 빠짐없이 만들고, 같은 합도 나온 횟수대로 세어 순위를 정하기',
        'learningLocation': '활용 5회 · 원문 29번 · 서로 다른 두 수의 합을 순서대로 나열하기',
        'verification': {
            'primaryMethod': '첫 count개의 0·1 숫자 자연수를 생성하고 서로 다른 모든 두 수 조합의 합을 정렬해 rank번째 값을 고른다.',
            'independentMethod': '정답보다 작은 합과 같은 합을 첫째 수별로 따로 세어 정답의 순위 구간을 확인한다.',
            'parameters': {k: proof[k] for k in ('numberCount', 'rank', 'numbers', 'pairCount', 'answer',
                                                   'sumsBelowAnswer', 'sumsEqualAnswer', 'answerRankInterval', 'rowCounts')},
            'independentSuite': 'qa/applied5-q29-independent-validate.py',
            'sourceExamPage': 6, 'sourceExamFile': EXAM.name, 'sourceExamDriveFileId': EXAM_ID,
            'sourceAnswerPage': 27, 'sourceAnswerFile': ANSWER.name, 'sourceAnswerDriveFileId': ANSWER_ID,
            'sourceDrawingCompared': True, 'sourceDrawingPresent': False,
            'sourceAnswerStatus': '답안 PDF 27쪽에 문제 문구만 보이며 정답 표시는 확인되지 않았다. 원문 후보 201은 모든 쌍의 합 정렬과 순위 구간으로 독립 재현.',
            'studentDifficultyMeasured': False
        },
        'difficultyEvidence': {'basis': 'source-point-band', 'label': '상', 'sourceReasoningPreserved': True,
                               'measuredVariantRate': None, 'estimated': False,
                               'rationale': '활용 5회 29번은 4.2점 배점대이며 활용 난도는 배점대만 적용한다.'}
    }


def main():
    assert sha(EXAM) == '5a258dad75459598920ecf5e221db1b4d94dfc5899a2260cf3e7f0b121fe8d2c'
    assert sha(ANSWER) == '6559ed2c3ec8c5a4908c9decaec66dc19f566ef8f672dc02dc47d96dcf9d879e'
    assert PAGE.is_file() and ANSWER_PAGE.is_file()
    WORK.mkdir(parents=True, exist_ok=True)
    answer_page = Image.open(ANSWER_PAGE)
    answer_crop = answer_page.crop((1200, 170, 2550, 1400))
    answer_crop.save(ANSWER_CROP)
    assert ImageChops.difference(answer_page.crop((1200, 170, 2550, 1400)), Image.open(ANSWER_CROP)).getbbox() is None

    data = json.loads(DATA_PATH.read_text())
    index = json.loads(INDEX_PATH.read_text())
    if data['version'] == VERSION:
        data['items'] = [x for x in data['items'] if x['sourceNo'] != 29]
        index['items'] = [x for x in index['items'] if x['sourceNo'] != 29]
        data['pendingSourceNos'] = sorted(set(data['pendingSourceNos'] + [29]))
        index['pendingSourceNos'] = list(data['pendingSourceNos'])
        data['version'] = BASE_VERSION
        index['version'] = BASE_VERSION
        data['reviewSummary'].update({'independentMathCount': 261, 'sourceTypes': 29})
    assert data['version'] == BASE_VERSION
    assert 29 in data['pendingSourceNos'] and not any(x['sourceNo'] == 29 for x in data['items'])

    proofs, items = [], []
    for variant, (count, rank) in enumerate(zip(COUNTS, RANKS), 1):
        proof = variant_proof(count, rank)
        proofs.append({'variantNo': variant, **proof})
        items.append(make_item(variant, count, rank, proof))
    assert proofs[2]['answer'] == 201 and proofs[2]['sumsBelowAnswer'] == 15 and proofs[2]['sumsEqualAnswer'] == 1

    insert_at = next(i for i, old in enumerate(data['items']) if old['sourceNo'] > 29)
    data['items'][insert_at:insert_at] = items
    data['version'] = VERSION
    data['availableSourceNos'] = sorted(set(data['availableSourceNos'] + [29]))
    data['pendingSourceNos'] = [n for n in data['pendingSourceNos'] if n != 29]
    data['reviewSummary'].update({'independentMathCount': len(data['items']),
                                  'sourceTypes': len(set(x['sourceNo'] for x in data['items'])),
                                  'variantsPerType': 9})
    index['items'].append({'sourceNo': 29, 'genId': 'applied5-q29', 'area': '경우의 수',
                           'subarea': '두 수의 짝짓기',
                           'detailType': '0과 1로 만든 수의 모든 두 수 합에서 순위 찾기',
                           'pointBand': '4.2', 'reviewStatus': 'verified', 'variantCount': 9})
    index['items'].sort(key=lambda x: x['sourceNo'])
    index.update({'version': VERSION, 'itemCount': len(data['items']),
                  'pendingSourceNos': list(data['pendingSourceNos'])})
    assert len(data['items']) == index['itemCount'] == 270
    DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    INDEX_PATH.write_text(json.dumps(index, ensure_ascii=False, indent=2) + '\n')
    review = {'result': 'PASS', 'dataVersion': VERSION, 'dataSha256': sha(DATA_PATH),
              'sourceExamSha256': sha(EXAM), 'sourceAnswerSha256': sha(ANSWER),
              'sourceExamPage': 6, 'sourceAnswerPage': 27,
              'answerPageDirectCrop': str(ANSWER_CROP.relative_to(ROOT)),
              'sourceCandidateAnswer': 201, 'officialKeyConfirmed': False,
              'variants': proofs, 'duplicateSumsCountedPerPair': True,
              'newSourceTypes': 0}
    (WORK / 'q29-independent-math-r23.json').write_text(json.dumps(review, ensure_ascii=False, indent=2) + '\n')
    print('Built Applied5 Q29 r23: nine distinct pair-count/rank variants; source 8-number, 16th-sum answer 201 independently reproduced.')


if __name__ == '__main__':
    main()

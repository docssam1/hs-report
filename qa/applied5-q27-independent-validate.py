#!/usr/bin/env python3
"""Independent exhaustive and asset/source checks for Applied5 Q27 variants."""
import hashlib
import itertools
import json
import xml.etree.ElementTree as ET
from pathlib import Path
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / '.private-work/hw-expansion-20261023/hw5/q27-source-review'
DATA = json.loads((ROOT / 'bank/data/applied5-expanded.json').read_text())
INDEX = json.loads((ROOT / 'bank/data/applied5-expanded-index.json').read_text())
EXAM = ROOT / 'materials/초등과정 대비 실전 모의고사활용 5회.pdf'
ANSWER = Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 5회 답안.pdf')
LETTERS = 'ABCDEFGHI'
BOX = (100, 365, 710, 590)


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def equation_value(term, assignment):
    value = 1
    for factor in term.split('×'):
        value *= int(''.join(str(assignment[ch]) for ch in factor))
    return value


def satisfied(equation, assignment):
    left, right = equation.split('=')
    return equation_value(left, assignment) == equation_value(right, assignment)


assert DATA['version'].endswith('q27-q28-q29-r23')
assert INDEX['version'] == DATA['version']
assert len(DATA['items']) == INDEX['itemCount'] == 270
assert DATA['pendingSourceNos'] == INDEX['pendingSourceNos'] == []
assert sha(EXAM) == '5a258dad75459598920ecf5e221db1b4d94dfc5899a2260cf3e7f0b121fe8d2c'
assert sha(ANSWER) == '6559ed2c3ec8c5a4908c9decaec66dc19f566ef8f672dc02dc47d96dcf9d879e'

source_page = Image.open(WORK / 'exam-6.png')
saved_crop = Image.open(ROOT / 'bank/assets/applied5/q27-source-equations.png')
assert saved_crop.size == (610, 225)
assert ImageChops.difference(source_page.crop(BOX), saved_crop).getbbox() is None

items = [x for x in DATA['items'] if x['sourceNo'] == 27]
assert len(items) == 9 and [x['variantNo'] for x in items] == list(range(1, 10))
all_results = []
for item in items:
    params = item['verification']['parameters']
    equations = params['equations']
    letters = ''.join(sorted(set(''.join(equations)) & set('ABCDEFGHIJKLMNOPQRSTUVWXYZ')))
    assert len(letters) == 9 and len(set(letters)) == 9
    solutions = []
    for digits in itertools.permutations(range(1, 10)):
        assignment = dict(zip(letters, digits))
        if all(satisfied(equation, assignment) for equation in equations):
            solutions.append(assignment)
    assert len(solutions) == params['solutionCount'] == 1
    unique = solutions[0]
    assert unique == params['uniqueAssignment']
    assert item['answer'] == str(unique['H'])
    assert item['answerParts'] == [unique['H']]
    assert all(satisfied(eq, unique) for eq in equations)
    assert item['asset']['width'] == 610 and item['asset']['height'] == 225
    asset = ROOT / 'bank' / item['asset']['src']
    assert asset.is_file()
    if item['variantNo'] == 1:
        assert item['asset']['kind'] == 'raster' and asset == ROOT / 'bank/assets/applied5/q27-source-equations.png'
    else:
        assert item['asset']['kind'] == 'svg'
        xml = ET.parse(asset).getroot()
        svg_text = ''.join(xml.itertext()).replace(' ', '')
        for equation in equations:
            assert equation in svg_text
    all_results.append({'variantNo': item['variantNo'], 'equations': equations,
                        'assignment': unique, 'answerH': unique['H'],
                        'candidateCountsAfterEachEquation': params['candidateCountsAfterEachEquation'],
                        'solutionCount': len(solutions)})

assert [x['answerH'] for x in all_results] == [9, 3, 8, 5, 7, 2, 4, 3, 4]
proof = {'result': 'PASS', 'dataVersion': DATA['version'], 'dataSha256': sha(ROOT / 'bank/data/applied5-expanded.json'),
         'sourceExamSha256': sha(EXAM), 'sourceAnswerSha256': sha(ANSWER),
         'sourcePage': 6, 'answerReviewPage': 27, 'sourceFigurePixelExact': True,
         'exhaustivePermutationCountPerVariant': 362880, 'variants': all_results,
         'officialAnswerStatus': '원문 답안의 손글씨 9 재현. 공식 키인지는 미확인.'}
(WORK / 'q27-independent-validation-r23.json').write_text(json.dumps(proof, ensure_ascii=False, indent=2) + '\n')
print('PASS Applied5 Q27: 9/9 distinct-digit systems each have exactly one solution across all 362,880 assignments; source figure crop is pixel-exact.')

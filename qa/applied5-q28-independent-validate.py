#!/usr/bin/env python3
"""Independent source, geometry, orientation and asset checks for Applied5 Q28."""
import hashlib
import itertools
import json
import xml.etree.ElementTree as ET
from collections import Counter
from pathlib import Path
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / '.private-work/hw-expansion-20261023/hw5/q28-source-review'
DATA = json.loads((ROOT / 'bank/data/applied5-expanded.json').read_text())
INDEX = json.loads((ROOT / 'bank/data/applied5-expanded-index.json').read_text())
EXAM = ROOT / 'materials/초등과정 대비 실전 모의고사활용 5회.pdf'
ANSWER = Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 5회 답안.pdf')
PAGE = ROOT / '.private-work/hw-expansion-20261023/hw5/q27-source-review/exam-6.png'
BOX = (300, 1210, 555, 1515)
LAYERS = [2, 3, 4, 5, 6, 7, 8, 9, 10]
EXPECTED = [76, 166, 290, 448, 640, 866, 1126, 1420, 1748]
PAIR_MAXIMA = (6, 5, 4)


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def cubes(n):
    return {(x, y, z) for x in range(n) for y in range(n) for z in range(n - max(x, y))}


def exposure(cset, c):
    x, y, z = c
    visible = [(x + 1, y, z) not in cset, (x - 1, y, z) not in cset,
               (x, y + 1, z) not in cset, (x, y - 1, z) not in cset,
               (x, y, z + 1) not in cset]
    return (int(visible[0]) + int(visible[1]),
            int(visible[2]) + int(visible[3]), int(visible[4]))


def score_for(exposed):
    return max(sum(7 if count == 2 else maximum if count == 1 else 0
                   for count, maximum in zip(exposed, maxima))
               for maxima in itertools.permutations(PAIR_MAXIMA))


assert DATA['version'].endswith('q27-q28-q29-r23')
assert INDEX['version'] == DATA['version']
assert len(DATA['items']) == INDEX['itemCount'] == 270
assert DATA['pendingSourceNos'] == INDEX['pendingSourceNos'] == []
assert sha(EXAM) == '5a258dad75459598920ecf5e221db1b4d94dfc5899a2260cf3e7f0b121fe8d2c'
assert sha(ANSWER) == '6559ed2c3ec8c5a4908c9decaec66dc19f566ef8f672dc02dc47d96dcf9d879e'

source_page = Image.open(PAGE)
crop = source_page.crop(BOX)
source_asset = Image.open(ROOT / 'bank/assets/applied5/q28-source-four-level-dice.png')
assert crop.size == source_asset.size == (255, 305)
assert ImageChops.difference(crop, source_asset).getbbox() is None
items = [x for x in DATA['items'] if x['sourceNo'] == 28]
assert len(items) == 9 and [x['variantNo'] for x in items] == list(range(1, 10))

proofs = []
for item, n, expected in zip(items, LAYERS, EXPECTED):
    params = item['verification']['parameters']
    assert params['layers'] == n and item['pointBand'] == '4.2'
    assert item['answer'] == str(expected) == str(params['answer'])
    cset = cubes(n)
    categories = Counter(score_for(exposure(cset, c)) for c in cset)
    assert {str(k): v for k, v in sorted(categories.items())} == params['categoryCounts']
    computed = sum(score * count for score, count in categories.items())
    closed = 20 + 15 * (3 * (n - 1)) + 11 * ((n - 1) ** 2) + 6 * ((n - 1) * (n - 2))
    assert computed == closed == expected == 17 * n * n + 5 * n - 2
    asset = ROOT / 'bank' / item['asset']['src']
    assert asset.is_file() and item['asset']['mimeType'] in ('image/png', 'image/svg+xml')
    if n == 4:
        assert item['asset']['kind'] == 'raster'
        assert asset == ROOT / 'bank/assets/applied5/q28-source-four-level-dice.png'
    else:
        assert item['asset']['kind'] == 'svg'
        root = ET.parse(asset).getroot()
        assert root.tag.endswith('svg') and len(list(root.iter('{http://www.w3.org/2000/svg}polygon'))) > 0
    proofs.append({'variantNo': item['variantNo'], 'layers': n,
                   'cubeCount': len(cset), 'categoryCounts': {str(k): v for k, v in sorted(categories.items())},
                   'cellByCellMaximum': computed, 'independentCategoryFormula': closed,
                   'answer': expected})

result = {'result': 'PASS', 'dataVersion': DATA['version'],
          'dataSha256': sha(ROOT / 'bank/data/applied5-expanded.json'),
          'sourceExamSha256': sha(EXAM), 'sourceAnswerSha256': sha(ANSWER),
          'sourceExamPage': 6, 'sourceAnswerPage': 28,
          'sourceFigurePixelExact': True, 'independentMethods': 2,
          'oppositeFacePairs': [[1, 6], [2, 5], [3, 4]], 'variants': proofs,
          'officialAnswerStatus': '주석에 적힌 면 유형 점수는 확인했으나 공식 채점표/최종 답은 불확실. 원문 4층 290을 독립 재현.'}
(WORK / 'q28-independent-validation-r23.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print('PASS Applied5 Q28: 9 layer diagrams, exact original 4-layer crop, per-cube orientation maximum and independent category formula agree for all variants.')

"""Independent depth-slice check for the Applied 8 Q16 stepped solid."""

from __future__ import annotations

import json
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / 'bank/data/applied8-expanded.json').read_text())
INDEX = json.loads((ROOT / 'bank/data/applied8-expanded-index.json').read_text())


def slice_cells(p, z):
    w, h, a, b, hm, hl = (p[k] for k in (
        'width', 'height', 'middleStartX', 'lowStartX', 'middleHeight', 'lowHeight'))
    return {(x, y) for x in range(w) for y in range(h)
            if z >= p['cutDepth'] or not ((x >= a and y >= hm) or (x >= b and y >= hl))}


def independent_by_slices(p):
    sections = [slice_cells(p, z) for z in range(p['depth'])]
    counts = []
    for z in range(1, p['depth']-1):
        # Erode this 2D slice, then intersect the front and rear slices.
        candidates = {(x, y) for x, y in sections[z]
                      if all((x+dx, y+dy) in sections[z] for dx, dy in
                             ((1, 0), (-1, 0), (0, 1), (0, -1)))}
        counts.append(len(candidates & sections[z-1] & sections[z+1]))
    return counts


assert DATA['itemCount'] == INDEX['itemCount'] == 270
assert DATA['pendingSourceNos'] == INDEX['pendingSourceNos'] == []
items = [x for x in DATA['items'] if x['sourceNo'] == 16]
assert len(items) == 9 and [x['variantNo'] for x in items] == list(range(1, 10))
assert len({(x['verification']['parameters']['width'],
             x['verification']['parameters']['height'],
             x['verification']['parameters']['depth'],
             x['verification']['parameters']['middleStartX'],
             x['verification']['parameters']['lowStartX']) for x in items}) == 9
for i, item in enumerate(items, 1):
    p = item['verification']['parameters']
    counts = independent_by_slices(p)
    total = sum(counts)
    assert counts == p['innerByDepth'] and total == p['answer'] == item['answerParts'][0]
    assert item['answer'] == f'{total}개'
    assert item['pointBand'] == '3.4' and item['difficultyEvidence']['label'] == '중'
    assert item['verification']['sourceTeacherAnswer'] == 33
    for key in ('asset', 'solutionAsset'):
        file = ROOT / 'bank' / item[key]['src']
        xml = ET.parse(file).getroot()
        assert xml.tag.endswith('svg') and len(xml.findall('.//{http://www.w3.org/2000/svg}polygon')) > 90
    print(item['id'], counts, total)
assert independent_by_slices({'width': 6, 'height': 6, 'depth': 5,
                              'middleStartX': 2, 'lowStartX': 4,
                              'middleHeight': 4, 'lowHeight': 2,
                              'cutDepth': 2}) == [6, 11, 16]
print('Applied 8 Q16 independent depth-slice validation PASS')

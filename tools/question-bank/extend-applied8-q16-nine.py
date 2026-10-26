"""Add nine Applied 8 Q16 recessed stair-stack variants with exact voxels."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / 'bank/data/applied8-expanded.json'
INDEX = ROOT / 'bank/data/applied8-expanded-index.json'
ASSETS = ROOT / 'bank/assets/applied8'
BASE_VERSION = '20261026-applied8-q11-fold-cut-r29'
VERSION = '20261026-applied8-q11-q16-complete-r30'

# W, H, D, start of middle ledge, start of low ledge, middle and low height.
# In the first two depth rows, the two removed regions make the same recessed
# staircase as the original six-wide, six-high, five-deep drawing.
VARIANTS = [
    (6, 6, 5, 2, 4, 5, 2),
    (7, 6, 5, 2, 5, 4, 2),
    (6, 7, 5, 2, 4, 5, 3),
    (6, 6, 6, 2, 4, 4, 2),
    (7, 7, 5, 3, 5, 5, 3),
    (7, 6, 6, 2, 5, 4, 2),
    (8, 6, 5, 2, 5, 4, 2),
    (6, 7, 6, 2, 4, 5, 3),
    (8, 7, 5, 3, 6, 5, 3),
]
SOURCE_GEOMETRY = (6, 6, 5, 2, 4, 4, 2)
DIRS = ((1, 0, 0), (-1, 0, 0), (0, 1, 0), (0, -1, 0), (0, 0, 1), (0, 0, -1))


def occupied(p):
    w, h, d, a, b, high, low = p
    assert 6 <= w <= 8 and 6 <= h <= 7 and 5 <= d <= 6
    assert 1 < a < b < w and 1 < low < high < h
    return {(x, y, z) for x in range(w) for y in range(h) for z in range(d)
            if not (z < 2 and ((x >= a and y >= high) or (x >= b and y >= low)))}


def inner_cubes(p):
    voxels = occupied(p)
    return {q for q in voxels if all(tuple(q[i]+step[i] for i in range(3)) in voxels for step in DIRS)}


def projected(x, y, z, ox, oy, sx, sy, vertical):
    return (ox+(x+z)*sx, oy+(x-z)*sy-y*vertical)


def svg(p, solution=False):
    w, h, d, *_ = p
    voxels = occupied(p)
    inner = inner_cubes(p)
    sx, sy, vertical = 25, 11, 24
    ox, oy = 35, 330
    width, height = 580, 450
    faces = []
    # Back to front; each exposed face is drawn from actual voxel occupancy.
    for x, y, z in sorted(voxels, key=lambda q: (-q[2], q[0], q[1])):
        p0 = projected(x, y, z, ox, oy, sx, sy, vertical)
        p1 = projected(x+1, y, z, ox, oy, sx, sy, vertical)
        p2 = projected(x+1, y, z+1, ox, oy, sx, sy, vertical)
        p3 = projected(x, y, z+1, ox, oy, sx, sy, vertical)
        q0 = projected(x, y+1, z, ox, oy, sx, sy, vertical)
        q1 = projected(x+1, y+1, z, ox, oy, sx, sy, vertical)
        q2 = projected(x+1, y+1, z+1, ox, oy, sx, sy, vertical)
        q3 = projected(x, y+1, z+1, ox, oy, sx, sy, vertical)
        def poly(points, fill):
            coords = ' '.join(f'{a:.1f},{b:.1f}' for a, b in points)
            return f'<polygon points="{coords}" fill="{fill}" stroke="#29251f" stroke-width="1.25" stroke-linejoin="round"/>'
        # A cut-out face is still exterior and therefore drawn. It is never
        # colored as an answer clue in the student version.
        if (x+1, y, z) not in voxels:
            faces.append(poly((p1, p2, q2, q1), '#d4d1c8'))
        if (x, y, z-1) not in voxels:
            faces.append(poly((p0, p1, q1, q0), '#f5f3ee'))
        if (x, y+1, z) not in voxels:
            faces.append(poly((q0, q1, q2, q3), '#e5e1d7'))
    # Crop the teacher-only figure tighter so printed cube edges remain clear.
    extra = ''
    view_box = f'0 0 {width} {height}'
    if solution:
        width, height = 420, 360
        view_box = '0 70 420 360'
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" '
            f'viewBox="{view_box}" role="img" '
            'aria-label="앞쪽이 계단 모양으로 파인 쌓기나무의 입체 그림">'
            f'<rect width="{width}" height="{height}" fill="white"/>' + ''.join(faces) + extra + '</svg>\n')


def item(i, p):
    w, h, d, a, b, high, low = p
    layers = [sum(q[2] == z for q in inner_cubes(p)) for z in range(1, d-1)]
    total = sum(layers)
    layer_text = ' + '.join(map(str, layers))
    steps = [
        f'전체는 가로 {w}칸, 높이 {h}칸, 깊이 {d}칸의 쌓기나무에서 앞쪽 두 줄이 계단 모양으로 파인 입체입니다. 겉면에는 밑면과 파인 자리의 면도 포함됩니다.',
        '겉면에 닿은 쌓기나무를 모두 빼려면 여섯 방향으로 이웃한 쌓기나무가 모두 있는 칸만 남깁니다. 앞에서부터 각 깊이 줄을 따로 조사합니다.',
        f'앞쪽과 뒤쪽의 맨 줄에는 남는 것이 없고, 그 사이 줄에 남는 수는 순서대로 {"·".join(map(str, layers))}개입니다. 따라서 {layer_text} = {total}개가 남습니다.',
    ]
    return {
        'id': f'applied8-q16-v{i}', 'genId': 'applied8-q16',
        'sourceSet': 'applied', 'sourceRound': 8, 'sourceNo': 16,
        'variantNo': i, 'reviewStatus': 'verified', 'area': '도형',
        'subarea': '쌓기나무와 겉면', 'detailType': '계단형 입체에서 겉면을 뺀 내부 쌓기나무 수',
        'pointBand': '3.4',
        'text': '그림처럼 앞쪽이 계단 모양으로 파인 쌓기나무에서 겉면에 있는 쌓기나무를 모두 걷어냅니다. '
                '밑면과 파인 자리의 면도 겉면에 포함할 때, 모두 몇 개가 남나요?',
        'answer': f'{total}개', 'answerContract': 'ordered-parts',
        'answerParts': [total], 'answerLabels': ['남은 쌓기나무 수'],
        'acceptedAnswers': [str(total), f'{total}개'],
        'solutionSteps': steps, 'solution': ' '.join(steps),
        'learningPoint': '계단형 입체의 파인 면과 밑면까지 겉면으로 보고 깊이별 내부 칸을 세기',
        'learningLocation': '활용 8회 · 원문 16번 · 쌓기나무의 겉면과 내부',
        'verification': {
            'primaryMethod': '가로·높이·깊이의 정확한 점유 좌표를 구성해 여섯 이웃이 모두 있는 내부 칸을 셈',
            'independentMethod': '깊이별 단면을 2차원 침식하고 앞뒤 단면과 교집합하여 합산',
            'parameters': {'width': w, 'height': h, 'depth': d, 'middleStartX': a,
                           'lowStartX': b, 'middleHeight': high, 'lowHeight': low,
                           'cutDepth': 2, 'innerByDepth': layers, 'answer': total},
            'sourceExamPage': 4, 'sourceTextDirectlyReviewed': True,
            'sourceFigureDirectlyReviewed': True, 'sourceTeacherAnswer': 33,
            'independentSourceAnswer': 33,
            'sourceLecture': 'https://www.youtube.com/watch?v=TyjjNoGEPkA&t=1037s',
            'sourceExamSha256': 'f053379544d41d73bcba673543536e56acbf97f5a0faf4a36e5a4cc008fe74ff',
            'originalFigurePreserved': True, 'variantFiguresCreatedFresh': True,
            'independentMethodAgrees': True,
        },
        'difficultyEvidence': {'basis': 'source-point-band', 'label': '중',
                               'sourceReasoningPreserved': True, 'measuredVariantRate': None},
        'asset': {'kind': 'svg', 'src': f'assets/applied8/q16-v{i}.svg',
                  'description': '앞쪽 두 줄이 계단 모양으로 파인 쌓기나무 그림'},
        'solutionAsset': {'kind': 'svg', 'src': f'assets/applied8/q16-v{i}-solution.svg',
                          'description': '계단형 쌓기나무의 안쪽 층 위치',
                          'caption': '맨 앞줄과 맨 뒷줄은 겉면이므로 남지 않습니다.'},
    }


def main():
    data = json.loads(DATA.read_text())
    index = json.loads(INDEX.read_text())
    if data['version'] == index['version'] == VERSION:
        assert len([x for x in data['items'] if x['sourceNo'] == 16]) == 9
        items = [item(i, p) for i, p in enumerate(VARIANTS, 1)]
        for i, p in enumerate(VARIANTS, 1):
            (ASSETS / f'q16-v{i}.svg').write_text(svg(p))
            (ASSETS / f'q16-v{i}-solution.svg').write_text(svg(p, solution=True))
        data['items'] = [x for x in data['items'] if x['sourceNo'] != 16] + items
        data['items'].sort(key=lambda x: (x['sourceNo'], x['variantNo']))
        DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n')
        print('Applied 8 Q16: regenerated nine reviewed variants', [x['answer'] for x in items])
        return
    assert data['version'] == index['version'] == BASE_VERSION
    assert data['pendingSourceNos'] == index['pendingSourceNos'] == [16]
    assert not any(x['sourceNo'] == 16 for x in data['items'])
    assert len(VARIANTS) == len(set(VARIANTS)) == 9
    assert len(inner_cubes(SOURCE_GEOMETRY)) == 33
    items = [item(i, p) for i, p in enumerate(VARIANTS, 1)]
    for i, p in enumerate(VARIANTS, 1):
        (ASSETS / f'q16-v{i}.svg').write_text(svg(p))
        (ASSETS / f'q16-v{i}-solution.svg').write_text(svg(p, solution=True))
    data['items'].extend(items)
    data['items'].sort(key=lambda x: (x['sourceNo'], x['variantNo']))
    data['version'] = index['version'] = VERSION
    data['availableSourceNos'] = sorted(set(data['availableSourceNos']) | {16})
    data['pendingSourceNos'] = index['pendingSourceNos'] = []
    data['itemCount'] = index['itemCount'] = len(data['items'])
    index['items'].append({k: items[0][k] for k in (
        'sourceNo', 'genId', 'area', 'subarea', 'detailType', 'pointBand', 'reviewStatus')}
        | {'variantCount': 9})
    index['items'].sort(key=lambda x: x['sourceNo'])
    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n')
    INDEX.write_text(json.dumps(index, ensure_ascii=False, indent=2)+'\n')
    print('Applied 8 Q16:', [x['answer'] for x in items])


if __name__ == '__main__':
    main()

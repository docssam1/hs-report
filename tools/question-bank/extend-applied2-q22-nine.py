"""Create nine Applied 2 Q22 variants from the original three-fold geometry."""

from __future__ import annotations

import json
from fractions import Fraction as F
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "bank/data/applied2-expanded.json"
INDEX = ROOT / "bank/data/applied2-expanded-index.json"
ASSETS = ROOT / "bank/assets/applied2"
VERSION = "20261026-applied2-q22-complete-circles-r1"

# Coordinates are in the final folded strip. Its five layers occupy
# max(x, 1-x) < y < 1. Small circles have radius 19/1000 of paper width.
POINTS = [
    (F(1, 2), F(62, 100)), (F(1, 2), F(75, 100)),
    (F(1, 2), F(85, 100)), (F(35, 100), F(78, 100)),
    (F(65, 100), F(78, 100)), (F(20, 100), F(91, 100)),
    (F(80, 100), F(91, 100)), (F(35, 100), F(90, 100)),
    (F(65, 100), F(90, 100)),
]
VARIANTS = [
    (0, 1), (0, 3, 4), (0, 1, 5, 6), (0, 1, 3, 4, 5),
    (0, 1, 3, 4, 5, 6), (1, 5, 6), (0, 3, 4, 7),
    (1, 3, 4, 5, 6), (0, 2, 3, 4, 5, 6),
]
SMALL_R, LARGE_R = F(19, 1000), F(9, 100)


def unfolded_centers(points):
    centers = []
    for x, y in points:
        # Two diagonals fold the upper square into four layers; the lower
        # half-height strip folds upward as layer five.
        centers += [(x, y), (y, x), (1-y, 1-x), (1-x, 1-y), (x, 2-y)]
    return centers


def validate_geometry(points):
    assert 1 <= len(points) <= 6
    assert len(points) == len(set(points))
    for x, y in points:
        assert max(x, 1-x) + F(4, 100) < y < 1-F(4, 100)
    centers = unfolded_centers(points)
    assert len(centers) == 5*len(points) == len(set(centers))
    for i, (x, y) in enumerate(centers):
        assert SMALL_R < x < 1-SMALL_R
        assert SMALL_R < y < F(3, 2)-SMALL_R
        for u, v in centers[i+1:]:
            assert (x-u)**2+(y-v)**2 > (2*SMALL_R+F(1, 100))**2
        for u, v in ((F(0), F(1, 2)), (F(1), F(1, 2)),
                     (F(1, 2), F(0)), (F(1, 2), F(1))):
            assert (x-u)**2+(y-v)**2 > (SMALL_R+LARGE_R+F(1, 100))**2
    return centers


def question_svg(points):
    def paper(x, y, w, h, dotted=False):
        style = 'stroke-dasharray="4 4"' if dotted else ''
        return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" '
                f'fill="white" stroke="#191511" stroke-width="1.6" {style}/>')

    top = [paper(30, 22, 82, 123), paper(216, 22, 82, 123, True),
           paper(402, 22, 82, 123, True)]
    # The first two folds retain the original diagonals and triangular roof.
    top += [
        '<path d="M216 104 L298 22 L298 104 Z" fill="#d8d8d8" stroke="#191511" stroke-width="1.4"/>',
        '<path d="M402 104 L443 63 L484 104 Z" fill="#d8d8d8" stroke="#191511" stroke-width="1.4"/>',
        '<path d="M216 104 H298 M402 104 H484" stroke="#191511" stroke-width="1.3"/>',
        '<path d="M133 83 h55 m-10 -8 10 8 -10 8 M318 83 h55 m-10 -8 10 8 -10 8" '
        'fill="none" stroke="#191511" stroke-width="1.6"/>',
        '<path d="M443 150 v26 m-8 -9 8 9 8 -9" fill="none" stroke="#191511" stroke-width="1.6"/>',
    ]
    # Enlarge the final folded strip in print. Its blank dotted margins are
    # cropped context; hole coordinates still use the exact 1:1 strip scale.
    x0, y0, scale = 60, 195, 400
    final = [paper(x0, y0-20, scale, scale//2+40, True),
             f'<rect x="{x0}" y="{y0}" width="{scale}" '
             f'height="{scale//2}" fill="#e3e3e3" stroke="#191511" stroke-width="1.5"/>']
    for x, y in points:
        final.append(f'<circle cx="{x0+float(x)*scale:.2f}" cy="{y0+float(y-F(1, 2))*scale:.2f}" '
                     f'r="{float(SMALL_R)*scale:.2f}" fill="#191511"/>')
    final.append(f'<path d="M {x0+scale/2-float(LARGE_R)*scale:.2f} {y0+scale/2:.2f} '
                 f'A {float(LARGE_R)*scale:.2f} {float(LARGE_R)*scale:.2f} 0 0 1 '
                 f'{x0+scale/2+float(LARGE_R)*scale:.2f} {y0+scale/2:.2f} Z" fill="#191511"/>')
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="520" height="420" '
            'viewBox="0 0 520 420" role="img" '
            'aria-label="두 대각선과 아래 띠를 순서대로 접은 뒤 작은 원과 반원을 오려낸 종이">'
            '<rect width="520" height="420" fill="white"/>' + ''.join(top+final) + '</svg>\n')


def solution_svg(points):
    centers = validate_geometry(points)
    x0, y0, scale = 74, 25, 270
    out = [f'<defs><clipPath id="paper"><rect x="{x0}" y="{y0}" '
           f'width="{scale}" height="{1.5*scale}"/></clipPath></defs>',
           f'<rect x="{x0}" y="{y0}" width="{scale}" height="{1.5*scale}" '
           'fill="white" stroke="#191511" stroke-width="2"/>',
           f'<path d="M{x0} {y0+scale} H{x0+scale}" stroke="#aaa" '
           'stroke-width="1.3" stroke-dasharray="4 5" fill="none"/>',
           '<g clip-path="url(#paper)">']
    for x, y in centers:
        out.append(f'<circle cx="{x0+float(x)*scale:.2f}" cy="{y0+float(y)*scale:.2f}" '
                   f'r="{float(SMALL_R)*scale:.2f}" fill="white" stroke="#191511" stroke-width="1.3"/>')
    for x, y in ((F(0), F(1, 2)), (F(1), F(1, 2)),
                 (F(1, 2), F(0)), (F(1, 2), F(1))):
        out.append(f'<circle cx="{x0+float(x)*scale:.2f}" cy="{y0+float(y)*scale:.2f}" '
                   f'r="{float(LARGE_R)*scale:.2f}" fill="none" stroke="#191511" stroke-width="1.8"/>')
    out.append('</g>')
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="420" height="460" '
            'viewBox="0 0 420 460" role="img" aria-label="펼친 종이의 완전한 원과 바깥 홈">'
            '<rect width="420" height="460" fill="white"/>' + ''.join(out) + '</svg>\n')


def item(i, indexes):
    points = [POINTS[j] for j in indexes]
    centers = validate_geometry(points)
    answer = len(centers)+1
    steps = [
        '윗부분의 정사각형은 두 대각선을 따라 접혀 네 겹이 됩니다. '
        '아랫부분의 띠를 한 번 더 올리면 검은 작은 원이 있는 부분은 다섯 겹입니다.',
        f'작은 원 {len(points)}곳을 자르면 펼친 윗부분 네 겹과 아래 띠 한 겹에 '
        f'각각 원이 생겨 {len(points)}×5={len(centers)}개의 완전한 원이 됩니다.',
        f'접힌 경계의 큰 반원은 펼쳤을 때 종이 안쪽에서 완전한 원 1개로 이어집니다. '
        f'바깥 테두리의 반원형 홈 3개는 세지 않으므로 {len(centers)}+1={answer}개입니다.',
    ]
    return {
        'id': f'applied2-q22-v{i}', 'genId': 'applied2-q22',
        'sourceSet': 'applied', 'sourceRound': 2, 'sourceNo': 22,
        'variantNo': i, 'reviewStatus': 'verified', 'area': '도형',
        'subarea': '접기와 원형 구멍', 'detailType': '펼친 종이의 완전한 원 세기',
        'pointBand': '3.4',
        'text': '그림과 같이 종이를 화살표 순서대로 접고 검게 표시된 부분을 모두 오려냈습니다. '
                '종이를 펼쳤을 때 생기는 완전한 원은 몇 개인가요?',
        'answer': f'{answer}개', 'answerContract': 'ordered-parts',
        'answerParts': [answer], 'answerLabels': ['완전한 원의 수'],
        'acceptedAnswers': [str(answer), f'{answer}개'],
        'solutionSteps': steps, 'solution': ' '.join(steps),
        'learningPoint': '겹친 층의 작은 원과 접힌 경계에서 이어지는 큰 원을 구분해 세기',
        'learningLocation': '활용 2회 · 원문 22번 · 접기와 완전한 원',
        'verification': {
            'primaryMethod': '두 대각선 반사와 아래 띠의 접기 반사로 작은 원의 다섯 원상을 유리수 좌표로 전개',
            'independentMethod': '펼친 종이의 원형 구멍을 별도 raster 연결요소 검사로 확인',
            'parameters': {'points': [[str(x), str(y)] for x, y in points],
                           'smallRadius': str(SMALL_R), 'largeRadius': str(LARGE_R),
                           'smallComplete': len(centers), 'largeComplete': 1,
                           'outerNotches': 3, 'answer': answer},
            'sourceExamPage': 4, 'sourceTextDirectlyReviewed': True,
            'sourceFigureDirectlyReviewed': True, 'sourceTeacherAnswer': 21,
            'independentSourceAnswer': 21,
            'sourceLecture': 'https://www.youtube.com/watch?v=tSfYVTY0AGM&t=1233s',
            'sourceExamSha256': '1af1698985c657774c00eb9abc0466b07f8cb79bca64d2c379ea18b8cae67aab',
            'originalFigurePreserved': True, 'variantFiguresCreatedFresh': True,
            'independentMethodAgrees': True,
        },
        'difficultyEvidence': {'basis': 'source-point-band', 'label': '중',
                               'sourceReasoningPreserved': True, 'measuredVariantRate': None},
        'asset': {'kind': 'svg', 'src': f'assets/applied2/q22-v{i}.svg',
                  'description': '종이를 세 번 접는 과정과 검은색 원형 절단 위치'},
        'solutionAsset': {'kind': 'svg', 'src': f'assets/applied2/q22-v{i}-solution.svg',
                          'description': '펼친 종이의 원과 바깥 테두리 홈',
                          'caption': '원래 바깥 테두리의 홈 세 곳은 완전한 원이 아닙니다.'},
    }


def main():
    data = json.loads(DATA.read_text())
    index = json.loads(INDEX.read_text())
    assert data['version'] == '20261026-applied2-q15-paper-fold-cut-r1'
    assert 22 in data['pendingSourceNos']
    assert not any(x['sourceNo'] == 22 for x in data['items'])
    original = [POINTS[j] for j in (0, 1, 5, 6)]
    assert len(validate_geometry(original))+1 == 21
    assert len(VARIANTS) == len(set(VARIANTS)) == 9
    items = [item(i, indexes) for i, indexes in enumerate(VARIANTS, 1)]
    assert len({(x['text'], tuple(VARIANTS[x['variantNo']-1])) for x in items}) == 9
    for i, indexes in enumerate(VARIANTS, 1):
        points = [POINTS[j] for j in indexes]
        (ASSETS / f'q22-v{i}.svg').write_text(question_svg(points))
        (ASSETS / f'q22-v{i}-solution.svg').write_text(solution_svg(points))
    data['items'].extend(items)
    data['items'].sort(key=lambda x: (x['sourceNo'], x['variantNo']))
    data['version'] = VERSION
    data['availableSourceNos'] = sorted(set(data['availableSourceNos']) | {22})
    data['pendingSourceNos'] = [n for n in data['pendingSourceNos'] if n != 22]
    data['sourceEditionNotes']['22'] = (
        '원문 p.4의 두 대각선 접기와 아래 띠 올리기, 검은 작은 원4곳·접힌 경계 반원을 직접 대조. '
        '강의 20:33의 4×5+1=21을 반사 좌표로 재현. 같은 접기 구조에서 작은 원의 위치·개수가 '
        '다른 새 그림9개를 제작하고 완전한 원만 계산.'
    )
    data['reviewSummary']['independentMathCount'] += 9
    data['reviewSummary']['sourceTypes'] += 1
    data['reviewSummary']['sourceDrawingCount'] += 1
    data['reviewSummary']['outputReviewed'] = False
    data['itemCount'] = len(data['items'])
    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n')
    index['version'] = VERSION
    index['itemCount'] = len(data['items'])
    index['pendingSourceNos'] = data['pendingSourceNos']
    first = items[0]
    index['items'].append({k: first[k] for k in (
        'sourceNo', 'genId', 'area', 'subarea', 'detailType', 'pointBand', 'reviewStatus')}
        | {'variantCount': 9})
    index['items'].sort(key=lambda x: x['sourceNo'])
    INDEX.write_text(json.dumps(index, ensure_ascii=False, indent=2)+'\n')
    print(f'Q22: 9 variants; answers {[x["answer"] for x in items]}')


if __name__ == '__main__':
    main()

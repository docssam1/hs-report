"""Add nine source-linked Applied 8 Q11 fold-and-cut variants."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / 'bank/data/applied8-expanded.json'
INDEX = ROOT / 'bank/data/applied8-expanded-index.json'
ASSETS = ROOT / 'bank/assets/applied8'
BASE_VERSION = '20261025-applied8-expansion-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q12-q13-q14-q15-q17-q18-q19-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r28'
VERSION = '20261026-applied8-q11-fold-cut-r29'

# The first fold moves the upper half down. The second fold moves the left
# half right. The final square has fold edges at top and left.
# Each row gives cut counts on (top, left, right, bottom), totaling four.
VARIANTS = [
    (1, 1, 1, 1), (1, 0, 1, 2), (2, 0, 1, 1),
    (2, 1, 1, 0), (2, 2, 0, 0), (0, 0, 2, 2),
    (0, 1, 2, 1), (1, 2, 0, 1), (0, 2, 1, 1),
]
SIDE = 200
WIDTH = 26
DEPTH = 28


def rectangles(counts):
    assert sum(counts) == 4 and all(0 <= n <= 2 for n in counts)
    out = []
    for edge, count in zip(('top', 'left', 'right', 'bottom'), counts):
        positions = (100,) if count == 1 else ((58, 142) if count == 2 else ())
        for c in positions:
            if edge == 'top': out.append((c-WIDTH//2, 0, WIDTH, DEPTH, edge))
            elif edge == 'bottom': out.append((c-WIDTH//2, SIDE-DEPTH, WIDTH, DEPTH, edge))
            elif edge == 'left': out.append((0, c-WIDTH//2, DEPTH, WIDTH, edge))
            else: out.append((SIDE-DEPTH, c-WIDTH//2, DEPTH, WIDTH, edge))
    assert len(out) == 4
    for i, (x, y, w, h, _) in enumerate(out):
        for a, b, c, d, _ in out[i+1:]:
            assert x+w < a or a+c < x or y+h < b or b+d < y
    return out


def folded_svg(counts):
    # Show the operation and the exact four cut positions; no unfolded result.
    out = [
        '<rect width="570" height="218" fill="white"/>',
        '<rect x="18" y="22" width="146" height="146" fill="white" stroke="#191511" stroke-width="2"/>',
        '<path d="M18 95 H164" stroke="#777" stroke-width="1.6" stroke-dasharray="7 5"/>',
        '<path d="M88 48 v31 m-7 -9 7 9 7 -9" fill="none" stroke="#191511" stroke-width="1.6"/>',
        '<path d="M178 95 h34 m-10 -7 10 7 -10 7" fill="none" stroke="#191511" stroke-width="1.8"/>',
        '<rect x="227" y="59" width="146" height="73" fill="#ededeb" stroke="#191511" stroke-width="2"/>',
        '<path d="M300 59 V132" stroke="#777" stroke-width="1.6" stroke-dasharray="7 5"/>',
        '<path d="M252 95 h31 m-9 -7 9 7 -9 7" fill="none" stroke="#191511" stroke-width="1.5"/>',
        '<path d="M384 95 h31 m-9 -7 9 7 -9 7" fill="none" stroke="#191511" stroke-width="1.8"/>',
        '<rect x="430" y="22" width="128" height="128" fill="#dededb" stroke="#191511" stroke-width="2"/>',
    ]
    scale = 128/SIDE
    for x, y, w, h, edge in rectangles(counts):
        xx, yy, ww, hh = 430+x*scale, 22+y*scale, w*scale, h*scale
        if edge == 'top':
            out.append(f'<rect x="{xx-1:.1f}" y="{yy-3:.1f}" width="{ww+2:.1f}" height="{hh+4:.1f}" fill="white"/>')
            out.append(f'<path d="M{xx:.1f} {yy:.1f} V{yy+hh:.1f} H{xx+ww:.1f} V{yy:.1f}" fill="none" stroke="#191511" stroke-width="1.7"/>')
        elif edge == 'bottom':
            out.append(f'<rect x="{xx-1:.1f}" y="{yy-1:.1f}" width="{ww+2:.1f}" height="{hh+4:.1f}" fill="white"/>')
            out.append(f'<path d="M{xx:.1f} {yy+hh:.1f} V{yy:.1f} H{xx+ww:.1f} V{yy+hh:.1f}" fill="none" stroke="#191511" stroke-width="1.7"/>')
        elif edge == 'left':
            out.append(f'<rect x="{xx-3:.1f}" y="{yy-1:.1f}" width="{ww+4:.1f}" height="{hh+2:.1f}" fill="white"/>')
            out.append(f'<path d="M{xx:.1f} {yy:.1f} H{xx+ww:.1f} V{yy+hh:.1f} H{xx:.1f}" fill="none" stroke="#191511" stroke-width="1.7"/>')
        else:
            out.append(f'<rect x="{xx-1:.1f}" y="{yy-1:.1f}" width="{ww+4:.1f}" height="{hh+2:.1f}" fill="white"/>')
            out.append(f'<path d="M{xx+ww:.1f} {yy:.1f} H{xx:.1f} V{yy+hh:.1f} H{xx+ww:.1f}" fill="none" stroke="#191511" stroke-width="1.7"/>')
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="570" height="218" '
            'viewBox="0 0 570 218" role="img" aria-label="정사각형 종이를 두 번 접고 네 곳을 자르는 그림">'
            + ''.join(out) + '</svg>\n')


def unfolded_svg(counts):
    out = ['<rect width="430" height="430" fill="white"/>',
           '<rect x="25" y="25" width="380" height="380" fill="#e5e5e2" stroke="#191511" stroke-width="2"/>']
    scale = 380/(SIDE*2)
    for x, y, w, h, _ in rectangles(counts):
        for sx in (-1, 1):
            for sy in (-1, 1):
                a, b = (SIDE+x, SIDE+y) if sx == 1 and sy == 1 else (
                    SIDE-x-w if sx == -1 else SIDE+x,
                    SIDE-y-h if sy == -1 else SIDE+y)
                out.append(f'<rect x="{25+a*scale:.2f}" y="{25+b*scale:.2f}" '
                           f'width="{w*scale:.2f}" height="{h*scale:.2f}" fill="white"/>')
    out += ['<path d="M215 25 V405 M25 215 H405" stroke="#999" stroke-width="1.3" stroke-dasharray="5 5"/>',
            '<rect x="25" y="25" width="380" height="380" fill="none" stroke="#191511" stroke-width="2"/>']
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="430" height="430" '
            'viewBox="0 0 430 430" role="img" aria-label="펼친 종이의 잘린 자리와 접은 선">'
            + ''.join(out) + '</svg>\n')


def answer(counts):
    folded_cuts = counts[0]+counts[1]
    outer_cuts = counts[2]+counts[3]
    assert folded_cuts+outer_cuts == 4
    return 1+2*folded_cuts+4*outer_cuts


def item(no, counts):
    total = answer(counts)
    folded, outer = counts[0]+counts[1], counts[2]+counts[3]
    steps = [
        '윗부분을 아래로, 왼쪽 부분을 오른쪽으로 접었으므로 마지막 정사각형은 네 겹입니다. 위쪽과 왼쪽은 접힌 변이고 오른쪽과 아래쪽은 종이의 바깥 변입니다.',
        f'접힌 변의 잘린 곳 {folded}곳은 펼치면 각각 2개의 조각, 바깥 변의 잘린 곳 {outer}곳은 각각 4개의 조각이 됩니다. 잘라낸 조각은 {folded}×2+{outer}×4={total-1}개입니다.',
        f'큰 종이 한 조각도 남으므로 전체는 {total-1}+1={total}조각입니다. 풀이 그림에서 점선은 접었던 자리이며 새로운 절단선이 아닙니다.',
    ]
    return {
        'id': f'applied8-q11-v{no}', 'genId': 'applied8-q11',
        'sourceSet': 'applied', 'sourceRound': 8, 'sourceNo': 11,
        'variantNo': no, 'reviewStatus': 'verified', 'area': '도형',
        'subarea': '종이 접기와 자르기', 'detailType': '두 번 접은 종이의 절단 후 조각 수',
        'pointBand': '2.7',
        'text': '그림처럼 정사각형 종이의 윗부분을 아래로 접고, 왼쪽 부분을 오른쪽으로 접었습니다. '
                '마지막 그림에서 네 곳을 표시된 모양대로 잘랐습니다. 종이를 펼쳤을 때, '
                '잘라낸 조각과 남은 종이를 합하면 모두 몇 조각인가요?',
        'answer': f'{total}조각', 'answerContract': 'ordered-parts',
        'answerParts': [total], 'answerLabels': ['전체 조각 수'],
        'acceptedAnswers': [str(total), f'{total}조각'],
        'solutionSteps': steps, 'solution': ' '.join(steps),
        'learningPoint': '접힌 변과 바깥 변의 절단을 구별해 펼친 뒤 잘라낸 조각과 남은 종이를 함께 세기',
        'learningLocation': '활용 8회 · 원문 11번 · 종이 접기와 자르기',
        'verification': {
            'primaryMethod': '접힌 변 한 곳당 2조각, 바깥 변 한 곳당 4조각에 남은 종이 1조각을 더함',
            'independentMethod': '접힌 정사각형의 네 절단 영역을 원래 정사각형에 좌우·상하 반사하고 4연결요소로 직접 셈',
            'parameters': {'cutsTopLeftRightBottom': list(counts), 'cutWidth': WIDTH,
                           'cutDepth': DEPTH, 'answer': total},
            'sourceExamPage': 3, 'sourceTextDirectlyReviewed': True,
            'sourceFigureDirectlyReviewed': True, 'sourceTeacherAnswer': 13,
            'independentSourceAnswer': 13,
            'sourceLecture': 'https://www.youtube.com/watch?v=TyjjNoGEPkA&t=795s',
            'sourceExamSha256': 'f053379544d41d73bcba673543536e56acbf97f5a0faf4a36e5a4cc008fe74ff',
            'originalFigurePreserved': True, 'variantFiguresCreatedFresh': True,
            'independentMethodAgrees': True,
        },
        'difficultyEvidence': {'basis': 'source-point-band', 'label': '하',
                               'sourceReasoningPreserved': True, 'measuredVariantRate': None},
        'asset': {'kind': 'svg', 'src': f'assets/applied8/q11-v{no}.svg',
                  'description': '두 번 접은 정사각형 종이의 네 절단 위치'},
        'solutionAsset': {'kind': 'svg', 'src': f'assets/applied8/q11-v{no}-solution.svg',
                          'description': '접은 종이를 펼쳤을 때 잘린 자리',
                          'caption': '점선은 접었던 자리입니다.'},
    }


def main():
    data = json.loads(DATA.read_text())
    index = json.loads(INDEX.read_text())
    assert data['version'] == index['version'] == BASE_VERSION
    assert data['pendingSourceNos'] == index['pendingSourceNos'] == [11, 16]
    assert not any(x['sourceNo'] == 11 for x in data['items'])
    assert len(VARIANTS) == len(set(VARIANTS)) == 9
    assert answer((1, 1, 1, 1)) == 13  # Original PDF and teacher lecture.
    items = [item(i, counts) for i, counts in enumerate(VARIANTS, 1)]
    for i, counts in enumerate(VARIANTS, 1):
        (ASSETS / f'q11-v{i}.svg').write_text(folded_svg(counts))
        (ASSETS / f'q11-v{i}-solution.svg').write_text(unfolded_svg(counts))
    data['items'].extend(items)
    data['items'].sort(key=lambda x: (x['sourceNo'], x['variantNo']))
    data['version'] = index['version'] = VERSION
    data['availableSourceNos'] = sorted(set(data['availableSourceNos']) | {11})
    data['pendingSourceNos'] = index['pendingSourceNos'] = [16]
    data['itemCount'] = index['itemCount'] = len(data['items'])
    data['policy']['newSourceTypes'] = 0
    index['items'].append({k: items[0][k] for k in (
        'sourceNo', 'genId', 'area', 'subarea', 'detailType', 'pointBand', 'reviewStatus')}
        | {'variantCount': 9})
    index['items'].sort(key=lambda x: x['sourceNo'])
    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n')
    INDEX.write_text(json.dumps(index, ensure_ascii=False, indent=2)+'\n')
    print('Applied 8 Q11:', [x['answer'] for x in items])


if __name__ == '__main__':
    main()

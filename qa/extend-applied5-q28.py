#!/usr/bin/env python3
"""Extend Applied5 Q28 with layer-count variants and exact source-figure evidence."""
import hashlib
import itertools
import json
import math
from collections import Counter
from pathlib import Path
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / '.private-work/hw-expansion-20261023/hw5/q28-source-review'
DATA_PATH = ROOT / 'bank/data/applied5-expanded.json'
INDEX_PATH = ROOT / 'bank/data/applied5-expanded-index.json'
ASSET_DIR = ROOT / 'bank/assets/applied5'
EXAM = ROOT / 'materials/초등과정 대비 실전 모의고사활용 5회.pdf'
ANSWER = Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 5회 답안.pdf')
PAGE = ROOT / '.private-work/hw-expansion-20261023/hw5/q27-source-review/exam-6.png'
SOURCE_CROP = WORK / 'q28-source-dice-diagram.png'
SOURCE_BOX = (300, 1210, 555, 1515)
SOURCE_FIGURE = ASSET_DIR / 'q28-source-four-level-dice.png'
ANSWER_PAGE = WORK / 'answer-28.png'
EXAM_ID = '1x7CevkWByUrXPqfbV5xTHidJPNDrbuJp'
ANSWER_ID = '1QGjWnEBjULxwy4BBX8tLutpGbjQfEh05'
VERSION = '20261025-applied5-expansion-q03-q05-q06-q08-q09-q11-q12-q14-q15-q16-q17-q18-q19-q20-q22-q23-q24-q25-q26-q27-q28-r22'
BASE_VERSION = VERSION.removesuffix('-q28-r22') + '-r21'
LAYERS = [2, 3, 4, 5, 6, 7, 8, 9, 10]
PAIR_MAXIMA = (6, 5, 4)  # Opposite pairs (1,6), (2,5), and (3,4).


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def cube_set(n):
    return {(x, y, z) for x in range(n) for y in range(n)
            for z in range(n - max(x, y))}


def visible_counts(cubes, cube):
    x, y, z = cube
    exposed = [
        (x + 1, y, z) not in cubes, (x - 1, y, z) not in cubes,
        (x, y + 1, z) not in cubes, (x, y - 1, z) not in cubes,
        (x, y, z + 1) not in cubes
    ]
    # The bottom face of the whole stack is explicitly excluded.
    return (int(exposed[0]) + int(exposed[1]),
            int(exposed[2]) + int(exposed[3]), int(exposed[4]))


def best_score(counts):
    return max(sum(7 if count == 2 else maximum if count == 1 else 0
                   for count, maximum in zip(counts, maxima))
               for maxima in itertools.permutations(PAIR_MAXIMA))


def geometric_result(n):
    cubes = cube_set(n)
    score_categories = Counter(best_score(visible_counts(cubes, c)) for c in cubes)
    score = sum(points * count for points, count in score_categories.items())
    expected_counts = {
        20: 1,
        15: 3 * (n - 1),
        11: (n - 1) ** 2,
        6: (n - 1) * (n - 2),
    }
    expected_counts[0] = len(cubes) - sum(expected_counts.values())
    assert score_categories == Counter(expected_counts)
    closed_form = 17 * n * n + 5 * n - 2
    assert score == closed_form
    return {'layers': n, 'cubeCount': len(cubes), 'categoryCounts': dict(sorted(score_categories.items())),
            'answer': score, 'closedForm': '20+15·3(n−1)+11·(n−1)²+6·(n−1)(n−2)=17n²+5n−2'}


def project(x, y, z, center_x, base_y, unit, vertical):
    return (center_x + (x - y) * unit / 2,
            base_y + (x + y) * unit / 4 - z * vertical)


def polygon(points):
    return ' '.join(f'{x:.2f},{y:.2f}' for x, y in points)


def draw_stack_svg(n, path):
    unit = min(72.0, 320.0 / n)
    vertical = unit * 0.78
    width = n * unit + 36
    height = n * (unit / 2 + vertical) + 36
    margin = 18
    center_x = width / 2
    base_y = margin + n * vertical
    cubes = cube_set(n)
    faces = []
    for x, y, z in cubes:
        if (x, y, z + 1) not in cubes:
            pts = [project(x, y, z + 1, center_x, base_y, unit, vertical),
                   project(x + 1, y, z + 1, center_x, base_y, unit, vertical),
                   project(x + 1, y + 1, z + 1, center_x, base_y, unit, vertical),
                   project(x, y + 1, z + 1, center_x, base_y, unit, vertical)]
            faces.append((sum(p[1] for p in pts) / 4, 0,
                          f'<polygon points="{polygon(pts)}" fill="#fff"/>'))
        if (x + 1, y, z) not in cubes:
            pts = [project(x + 1, y, z, center_x, base_y, unit, vertical),
                   project(x + 1, y + 1, z, center_x, base_y, unit, vertical),
                   project(x + 1, y + 1, z + 1, center_x, base_y, unit, vertical),
                   project(x + 1, y, z + 1, center_x, base_y, unit, vertical)]
            faces.append((sum(p[1] for p in pts) / 4, 1,
                          f'<polygon points="{polygon(pts)}" fill="#f3f0e8"/>'))
        if (x, y + 1, z) not in cubes:
            pts = [project(x, y + 1, z, center_x, base_y, unit, vertical),
                   project(x + 1, y + 1, z, center_x, base_y, unit, vertical),
                   project(x + 1, y + 1, z + 1, center_x, base_y, unit, vertical),
                   project(x, y + 1, z + 1, center_x, base_y, unit, vertical)]
            faces.append((sum(p[1] for p in pts) / 4, 2,
                          f'<polygon points="{polygon(pts)}" fill="#e9e4d9"/>'))
    shapes = ''.join(shape for _, _, shape in sorted(faces, key=lambda item: (item[0], item[1])))
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{width:.0f}" height="{height:.0f}" viewBox="0 0 {width:.0f} {height:.0f}">'
           '<g stroke="#191511" stroke-width="1.05" stroke-linejoin="round">'
           + shapes + '</g></svg>')
    path.write_text(svg, encoding='utf-8')


def solution_steps(n, result):
    categories = result['categoryCounts']
    number = lambda score: categories.get(score, 0)
    terms = [f'20×{number(20)}', f'15×{number(15)}', f'11×{number(11)}', f'6×{number(6)}']
    steps = [
        f'각 주사위의 보이는 면을 살펴보면 눈의 합이 20인 주사위가 {number(20)}개, 15인 주사위가 {number(15)}개, 11인 주사위가 {number(11)}개, 6인 주사위가 {number(6)}개입니다. 나머지 {number(0)}개는 겉으로 드러난 면이 없습니다.',
        '서로 마주 보는 한 쌍의 눈은 1과 6, 2와 5, 3과 4입니다. 서로 마주 보는 두 면이 모두 드러나면 합은 7이고, 한 면만 보이면 그 쌍의 큰 눈을 바깥쪽에 놓아 6, 5, 4 중 유리한 눈을 선택합니다.',
        f'따라서 겉면 눈의 합의 최댓값은 {" + ".join(terms)}={result["answer"]}입니다.'
    ]
    return steps


def build_item(variant, n, source):
    result = geometric_result(n)
    if source:
        src = 'assets/applied5/q28-source-four-level-dice.png'
        image = Image.open(SOURCE_FIGURE)
        kind, mime, width, height = 'raster', 'image/png', image.width, image.height
        description = '활용 5회 원문 28번의 4층 주사위 그림을 원본 PDF에서 픽셀 그대로 잘라 보존한 그림.'
    else:
        src = f'assets/applied5/q28-v{variant}-dice-stack.svg'
        kind, mime, width, height = 'svg', 'image/svg+xml', None, None
        description = f'{n}층 정사각 계단 주사위 쌓기를 나타낸 새 유사문제 그림.'
    dims = {'kind': kind, 'src': src, 'description': description, 'mimeType': mime}
    if width:
        dims.update({'width': width, 'height': height})
    steps = solution_steps(n, result)
    return {
        'id': f'applied5-q28-v{variant}', 'genId': 'applied5-q28',
        'sourceSet': 'applied', 'sourceRound': 5, 'sourceNo': 28,
        'variantNo': variant, 'reviewStatus': 'verified',
        'area': '도형', 'subarea': '입체도형과 주사위',
        'detailType': '계단 모양으로 쌓은 주사위의 겉면 눈 최댓값',
        'pointBand': '4.2',
        'text': f'마주 보는 면의 눈의 합이 7인 주사위를 가장 아래층에는 {n}×{n}개, 그 위층에는 {n-1}×{n-1}개, …, 꼭대기층에는 1개가 되도록 {n}층까지 쌓았습니다. 바닥면을 제외하고 겉으로 드러난 면의 눈의 합의 최댓값을 구하세요.',
        'asset': dims,
        'answer': str(result['answer']), 'answerParts': [result['answer']],
        'answerLabels': ['겉면 눈의 합의 최댓값'],
        'acceptedAnswers': [str(result['answer']), f'{result["answer"]}개'],
        'answerContract': 'single-number',
        'solutionSteps': steps, 'solution': ' '.join(steps),
        'learningPoint': '쌓인 입체에서 보이는 면을 방향별로 세고, 서로 마주 보는 눈의 합과 한 면만 보일 때의 최댓값을 구분하기',
        'learningLocation': '활용 5회 · 원문 28번 · 주사위의 겉면과 마주 보는 눈',
        'verification': {
            'primaryMethod': '주사위 쌓기 구조를 단위 정육면체로 나타내고 각 정육면체의 노출 방향을 분류한 뒤, 1·6, 2·5, 3·4의 면 쌍을 회전 배치해 최댓값을 구한다.',
            'independentMethod': '단계별 정사각 층의 겉면 유형 개수를 세운 식으로 합산해 모든 층수 변형과 원문 4층 값을 다시 계산한다.',
            'parameters': result,
            'independentSuite': 'qa/applied5-q28-independent-validate.py',
            'sourceExamPage': 6, 'sourceExamFile': EXAM.name, 'sourceExamDriveFileId': EXAM_ID,
            'sourceAnswerPage': 28, 'sourceAnswerFile': ANSWER.name, 'sourceAnswerDriveFileId': ANSWER_ID,
            'sourceDrawingCompared': True, 'sourceDrawingPresent': True,
            'variantDrawingType': 'exact-original-crop' if source else 'new-layer-count-stack-drawing-authorized',
            'officialAnswerStatus': '답안 PDF 28쪽의 손글씨 주석에서 20·15·11·6 분류가 보이나 공식 채점표 여부와 최종 답 표시는 불명확하다. 4층 값 290은 독립 계산으로 재현했다.',
            'studentDifficultyMeasured': False
        },
        'difficultyEvidence': {'basis': 'source-point-band', 'label': '상', 'sourceReasoningPreserved': True,
                               'measuredVariantRate': None, 'estimated': False,
                               'rationale': '활용 5회 28번은 4.2점 배점대이며 활용 난도는 배점대만 적용한다.'}
    }


def main():
    assert sha(EXAM) == '5a258dad75459598920ecf5e221db1b4d94dfc5899a2260cf3e7f0b121fe8d2c'
    assert sha(ANSWER) == '6559ed2c3ec8c5a4908c9decaec66dc19f566ef8f672dc02dc47d96dcf9d879e'
    assert PAGE.is_file() and SOURCE_CROP.is_file() and ANSWER_PAGE.is_file()
    source_page = Image.open(PAGE)
    direct_crop = source_page.crop(SOURCE_BOX)
    assert direct_crop.size == (255, 305)
    assert ImageChops.difference(direct_crop, Image.open(SOURCE_CROP)).getbbox() is None
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    direct_crop.save(SOURCE_FIGURE)

    items, proofs = [], []
    for variant, n in enumerate(LAYERS, 1):
        result = geometric_result(n)
        assert result['answer'] == [76, 166, 290, 448, 640, 866, 1126, 1420, 1748][variant - 1]
        source = n == 4
        if not source:
            draw_stack_svg(n, ASSET_DIR / f'q28-v{variant}-dice-stack.svg')
        item = build_item(variant, n, source)
        items.append(item)
        proofs.append(result | {'variantNo': variant, 'sourceFigurePixelExact': source})

    data = json.loads(DATA_PATH.read_text())
    index = json.loads(INDEX_PATH.read_text())
    if data['version'] == VERSION:
        data['items'] = [x for x in data['items'] if x['sourceNo'] != 28]
        index['items'] = [x for x in index['items'] if x['sourceNo'] != 28]
        data['pendingSourceNos'] = sorted(set(data['pendingSourceNos'] + [28]))
        index['pendingSourceNos'] = list(data['pendingSourceNos'])
        data['version'] = BASE_VERSION
        index['version'] = BASE_VERSION
        data['reviewSummary'].update({'independentMathCount': 252, 'sourceTypes': 28, 'sourceDrawingCount': 144})
    assert data['version'] == BASE_VERSION
    assert 28 in data['pendingSourceNos'] and not any(x['sourceNo'] == 28 for x in data['items'])
    insert_at = next(i for i, old in enumerate(data['items']) if old['sourceNo'] > 28)
    data['items'][insert_at:insert_at] = items
    data['version'] = VERSION
    data['availableSourceNos'] = sorted(set(data['availableSourceNos'] + [28]))
    data['pendingSourceNos'] = [n for n in data['pendingSourceNos'] if n != 28]
    data['reviewSummary'].update({'independentMathCount': len(data['items']),
                                  'sourceTypes': len(set(x['sourceNo'] for x in data['items'])),
                                  'variantsPerType': 9,
                                  'sourceDrawingCount': data['reviewSummary']['sourceDrawingCount'] + 9})
    index['items'].append({'sourceNo': 28, 'genId': 'applied5-q28', 'area': '도형',
                           'subarea': '입체도형과 주사위',
                           'detailType': '계단 모양으로 쌓은 주사위의 겉면 눈 최댓값',
                           'pointBand': '4.2', 'reviewStatus': 'verified', 'variantCount': 9})
    index['items'].sort(key=lambda x: x['sourceNo'])
    index.update({'version': VERSION, 'itemCount': len(data['items']),
                  'pendingSourceNos': list(data['pendingSourceNos'])})
    assert len(data['items']) == index['itemCount'] == 261
    DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    INDEX_PATH.write_text(json.dumps(index, ensure_ascii=False, indent=2) + '\n')
    proof = {'result': 'PASS', 'dataVersion': VERSION, 'dataSha256': sha(DATA_PATH),
             'sourceExamSha256': sha(EXAM), 'sourceAnswerSha256': sha(ANSWER),
             'sourceExamPage': 6, 'sourceAnswerPage': 28,
             'sourceFigurePixelExact': True, 'userApprovedVariantDrawings': True,
             'independentMethods': ['unit-cube exposure and orientation maximization', 'closed-form category counts'],
             'variants': proofs, 'newSourceTypes': 0}
    (WORK / 'q28-independent-math-r22.json').write_text(json.dumps(proof, ensure_ascii=False, indent=2) + '\n')
    print('Built Applied5 Q28 r22: nine layer counts, original 4-layer figure pixel-preserved, eight new diagrams, source and closed-form scores independently agree.')


if __name__ == '__main__':
    main()

"""Build nine independently checkable cube-net variants for Applied 1 Q19."""
from __future__ import annotations

import hashlib
import itertools
import json
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXAM = ROOT / 'materials/초등과정 대비 실전 모의고사 활용 1회.pdf'
ANSWER = ROOT / '.private-work/balanced15-20261024/source/applied1-answer.pdf'
assert hashlib.sha256(EXAM.read_bytes()).hexdigest() == '6123edccb7f64dc664d57dd29004483e3d27c49665892da39bbf2c032b243924'
assert hashlib.sha256(ANSWER.read_bytes()).hexdigest() == '1e8a14128840dededcdf69a8951dac4c2cd6373483c67f34ebf15cfca6944c54'

DATA_PATH = ROOT / 'bank/data/applied1-expanded.json'
INDEX_PATH = ROOT / 'bank/data/applied1-expanded-index.json'
FACES = ('A', 'B', 'C', 'D', 'E', 'F')
NET = {'A': (0, 0), 'B': (1, 0), 'C': (1, 1), 'D': (1, 2), 'E': (2, 2), 'F': (1, 3)}
OPPOSITE = {frozenset(x) for x in (('A', 'E'), ('B', 'D'), ('C', 'F'))}
VISIBLE = {(0, 0, 1): 'top', (0, 1, 0): 'left', (1, 0, 0): 'right'}


def neg(v):
    return tuple(-x for x in v)


def fold_net():
    bases = {'D': ((1, 0, 0), (0, 1, 0), (0, 0, 1))}
    names = {xy: name for name, xy in NET.items()}
    queue = ['D']
    for face in queue:
        u, v, n = bases[face]
        x, y = NET[face]
        adjacent = [((x + 1, y), (neg(n), v, u)),
                    ((x - 1, y), (n, v, neg(u))),
                    ((x, y + 1), (u, neg(n), v)),
                    ((x, y - 1), (u, n, neg(v)))]
        for xy, basis in adjacent:
            other = names.get(xy)
            if other and other not in bases:
                bases[other] = basis
                queue.append(other)
    assert len(bases) == 6
    assert {frozenset((a, b)) for a in FACES for b in FACES
            if a < b and bases[a][2] == neg(bases[b][2])} == OPPOSITE
    return bases


BASES = fold_net()


def parity(p):
    return -1 if sum(p[i] > p[j] for i in range(3) for j in range(i + 1, 3)) % 2 else 1


ROTATIONS = [(p, s) for p in itertools.permutations(range(3))
             for s in itertools.product((-1, 1), repeat=3)
             if parity(p) * s[0] * s[1] * s[2] == 1]
assert len(ROTATIONS) == 24


def rotate(vec, rotation):
    p, s = rotation
    return tuple(s[i] * vec[p[i]] for i in range(3))


def visible_face_bases(rotation):
    result = {}
    for face, (u, v, n) in BASES.items():
        nu = rotate(n, rotation)
        if nu in VISIBLE:
            result[VISIBLE[nu]] = (face, rotate(u, rotation), rotate(v, rotation), nu)
    assert set(result) == {'top', 'left', 'right'}
    return result


def signature(option):
    return tuple(option['marks'][slot] for slot in ('top', 'left', 'right'))


def make_options(symbols, rng):
    valid = []
    signatures = set()
    for rot in ROTATIONS:
        faces = visible_face_bases(rot)
        marks = {slot: symbols[entry[0]] for slot, entry in faces.items()}
        sig = signature({'marks': marks})
        if sig not in signatures:
            valid.append({'rotation': rot, 'marks': marks, 'bases': faces, 'valid': True})
            signatures.add(sig)
    rng.shuffle(valid)
    chosen = valid[:2]
    assert len(chosen) == 2
    decoys = []
    symbols_available = sorted(set(symbols.values()))
    candidates = []
    for original in valid:
        for slot in ('top', 'left', 'right'):
            for replacement in symbols_available:
                if replacement == original['marks'][slot]:
                    continue
                marks = dict(original['marks'])
                marks[slot] = replacement
                sig = signature({'marks': marks})
                if sig not in signatures:
                    candidates.append({'rotation': original['rotation'], 'marks': marks,
                                       'bases': original['bases'], 'valid': False})
    rng.shuffle(candidates)
    used = {signature(x) for x in chosen}
    for candidate in candidates:
        sig = signature(candidate)
        if sig not in used:
            decoys.append(candidate)
            used.add(sig)
        if len(decoys) == 3:
            break
    assert len(decoys) == 3
    options = chosen + decoys
    rng.shuffle(options)
    assert sum(x['valid'] for x in options) == 2
    assert len({signature(x) for x in options}) == 5
    return options, signatures


def option_reason(symbols, option):
    marks = option['marks']
    target = tuple(marks[slot] for slot in ('top', 'left', 'right'))
    candidates = [triple for triple in itertools.permutations(FACES, 3)
                  if tuple(symbols[face] for face in triple) == target]
    if not candidates:
        return '전개도의 서로 다른 세 면에서 이 무늬 조합을 만들 수 없습니다.'
    adjacent = [triple for triple in candidates
                if all(BASES[a][2] != neg(BASES[b][2])
                       for a, b in itertools.combinations(triple, 2))]
    if not adjacent:
        return '마주 보는 두 면이 한 꼭짓점에서 함께 보여야 하므로 만들 수 없습니다.'
    def cross(a, b):
        return (a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0])
    oriented = [triple for triple in adjacent
                if sum(x*y for x, y in zip(cross(BASES[triple[0]][2], BASES[triple[1]][2]),
                                            BASES[triple[2]][2])) == -1]
    if not oriented:
        return '세 면의 좌우 순서가 전개도를 접은 방향과 거꾸로입니다.'
    assert option['valid']
    top, left, right = (option['bases'][slot][0] for slot in ('top', 'left', 'right'))
    assert (top, left, right) in oriented
    return f'위·왼쪽·오른쪽 면을 각각 {top}·{left}·{right} 면으로 놓으면 무늬의 위치와 방향이 맞습니다.'


def strokes(symbol):
    # Coordinates within a unit square. The same pattern is used on the net and cube.
    if symbol == 'plus':
        return [((.2, .5), (.8, .5)), ((.5, .2), (.5, .8))], []
    if symbol == 'x':
        return [((.2, .2), (.8, .8)), ((.2, .8), (.8, .2))], []
    if symbol == 'bars':
        return [((.18, t), (.82, t)) for t in (.28, .5, .72)], []
    if symbol == 'stem':
        return [((.5, .18), (.5, .82))], []
    if symbol == 'dot':
        return [], [(.5, .5, .085)]
    if symbol == 'tee':
        return [((.2, .25), (.8, .25)), ((.5, .25), (.5, .82))], []
    raise ValueError(symbol)


def project(vec):
    x, y, z = vec
    return (125 + 44 * (x - y), 117 + 22 * (x + y) - 52 * z)


def fmt(point):
    return f'{point[0]:.2f},{point[1]:.2f}'


def face_point(n, u, v, x, y):
    p = tuple(n[i] + .8 * (2 * x - 1) * u[i] + .8 * (2 * y - 1) * v[i]
              for i in range(3))
    return project(p)


def draw_cube(option):
    bases = option['bases']
    parts = []
    polygons = {
        'top': [(-1, -1, 1), (1, -1, 1), (1, 1, 1), (-1, 1, 1)],
        'left': [(-1, 1, 1), (1, 1, 1), (1, 1, -1), (-1, 1, -1)],
        'right': [(1, -1, 1), (1, 1, 1), (1, 1, -1), (1, -1, -1)],
    }
    for slot in ('left', 'right', 'top'):
        pts = ' '.join(fmt(project(v)) for v in polygons[slot])
        parts.append(f'<polygon points="{pts}" fill="white" stroke="#191511" stroke-width="3.2"/>')
    for slot in ('left', 'right', 'top'):
        _, u, v, n = bases[slot]
        lines, dots = strokes(option['marks'][slot])
        for (x1, y1), (x2, y2) in lines:
            a = face_point(n, u, v, x1, y1)
            b = face_point(n, u, v, x2, y2)
            parts.append(f'<line x1="{a[0]:.2f}" y1="{a[1]:.2f}" x2="{b[0]:.2f}" y2="{b[1]:.2f}" stroke="#191511" stroke-width="3.6" stroke-linecap="round"/>')
        for x, y, radius in dots:
            center = face_point(n, u, v, x, y)
            parts.append(f'<circle cx="{center[0]:.2f}" cy="{center[1]:.2f}" r="{radius * 72:.2f}" fill="#191511"/>')
    return ''.join(parts)


def draw_svg(symbols, options, dest):
    parts = ['<svg xmlns="http://www.w3.org/2000/svg" width="420" height="414" viewBox="0 0 420 414">',
             '<rect width="420" height="414" fill="white"/>',
             '<text x="14" y="24" font-size="13" font-family="sans-serif" fill="#191511">전개도</text>']
    cell = 34
    for face, (col, row) in NET.items():
        x, y = 170 + col * cell, 8 + row * cell
        parts.append(f'<rect x="{x}" y="{y}" width="{cell}" height="{cell}" fill="white" stroke="#191511" stroke-width="1.25"/>')
        lines, dots = strokes(symbols[face])
        for (x1, y1), (x2, y2) in lines:
            parts.append(f'<line x1="{x + cell*x1:.2f}" y1="{y + cell*y1:.2f}" x2="{x + cell*x2:.2f}" y2="{y + cell*y2:.2f}" stroke="#191511" stroke-width="1.55"/>')
        for dx, dy, radius in dots:
            parts.append(f'<circle cx="{x+cell*dx:.2f}" cy="{y+cell*dy:.2f}" r="{cell*radius:.2f}" fill="#191511"/>')
    layout = [(6, 160), (146, 160), (286, 160), (76, 275), (216, 275)]
    for number, (option, (x, y)) in enumerate(zip(options, layout), 1):
        parts.append(f'<text x="{x + 5}" y="{y + 25}" font-size="18" font-family="sans-serif" fill="#191511">{number}</text>')
        parts.append(f'<g transform="translate({x + 19} {y + 19}) scale(.43)">{draw_cube(option)}</g>')
    parts.append('</svg>')
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text('\n'.join(parts) + '\n')


def build():
    data = json.loads(DATA_PATH.read_text())
    index = json.loads(INDEX_PATH.read_text())
    assert data['version'] == index['version']
    assert 19 in data['pendingSourceNos'] or all(item['id'].startswith('applied1-q19-v')
                                                for item in data['items'] if item['sourceNo'] == 19)
    data['items'] = [item for item in data['items'] if item['sourceNo'] != 19]
    index['items'] = [item for item in index['items'] if item['sourceNo'] != 19]
    items = []
    used_assignments = set()
    for variant in range(1, 10):
        rng = random.Random(1900 + variant)
        choices = ['plus', 'x', 'bars', 'stem', 'x', 'dot']
        for _ in range(100):
            rng.shuffle(choices)
            symbols = dict(zip(FACES, choices))
            assignment = tuple(symbols[f] for f in FACES)
            xs = [f for f in FACES if symbols[f] == 'x']
            if assignment not in used_assignments and frozenset(xs) not in OPPOSITE:
                break
        else:
            raise AssertionError('distinct face markings not found')
        used_assignments.add(assignment)
        options, valid_sigs = make_options(symbols, rng)
        answer = [i for i, option in enumerate(options, 1) if option['valid']]
        assert len(answer) == 2
        src = f'assets/applied1/q19-v{variant}.svg'
        draw_svg(symbols, options, ROOT / 'bank' / src)
        answer_text = ', '.join(str(x) for x in answer)
        opposite_text = ', '.join(f'{a}–{b}' for a, b in [('A', 'E'), ('B', 'D'), ('C', 'F')])
        steps = [
            '전개도의 맨 위 왼쪽 면을 A, 그 오른쪽을 B, B의 아래를 C, 그 아래를 D, D의 오른쪽을 E, D의 아래를 F라 둡니다.',
            f'접으면 마주 보는 면은 {opposite_text}입니다. 서로 마주 보는 면은 한 꼭짓점에서 함께 보이지 않습니다.',
        ]
        for number, option in enumerate(options, 1):
            steps.append(f'{number}번: {option_reason(symbols, option)}')
        steps.append(f'따라서 접을 수 있는 것은 {answer_text}번입니다.')
        items.append({
            'id': f'applied1-q19-v{variant}', 'genId': 'applied1-q19', 'sourceSet': 'applied',
            'sourceRound': 1, 'sourceNo': 19, 'variantNo': variant, 'reviewStatus': 'verified',
            'area': '도형', 'subarea': '입체도형과 전개도', 'detailType': '정육면체 전개도와 접은 모양 비교',
            'pointBand': '3.4', 'text': '전개도를 접어 만들 수 있는 정육면체를 모두 고르세요.',
            'answer': answer_text, 'answerContract': 'unordered-set', 'answerParts': answer,
            'answerLabels': ['맞는 보기 번호 모두 (쉼표로 구분)'],
            'acceptedAnswers': [answer_text, str(answer[1]) + ', ' + str(answer[0])],
            'solutionSteps': steps, 'solution': ' '.join(steps),
            'learningPoint': '전개도에서 마주 보는 면을 찾고 세 면의 무늬 방향까지 확인하기',
            'learningLocation': '활용 1회 · 원문 19번 · 정육면체 전개도',
            'verification': {
                'primaryMethod': '전개도 여섯 면의 법선·방향을 접어 정육면체 24회전을 전수 열거',
                'independentMethod': '정육면체 마주 보는 면쌍과 면 무늬 3개 조합을 별도 열거',
                'parameters': {'net': NET, 'symbols': symbols,
                               'optionMarks': [x['marks'] for x in options],
                               'optionFaces': [{slot: x['bases'][slot][0] for slot in ('top', 'left', 'right')}
                                               for x in options], 'answer': answer,
                               'possibleMarkTriples': len(valid_sigs)},
                'sourceExamPage': 4, 'sourceAnswerPage': 19,
                'sourceTextDirectlyReviewed': True, 'sourceFigureDirectlyReviewed': True,
                'sourceAnswerCandidate': '②, ⑤', 'sourceAnswerCandidateOfficiality': 'unverified',
                'sourceExamSha256': hashlib.sha256(EXAM.read_bytes()).hexdigest(),
                'sourceAnswerSha256': hashlib.sha256(ANSWER.read_bytes()).hexdigest(),
                'originalFigurePreserved': True, 'variantFiguresCreatedFresh': True,
                'independentCountAgrees': True,
            },
            'difficultyEvidence': {'basis': 'source-point-band', 'label': '중',
                                   'sourceReasoningPreserved': True, 'measuredVariantRate': None},
            'asset': {'kind': 'svg', 'src': src, 'description': '정육면체 전개도와 다섯 보기'},
        })
    data['items'].extend(items)
    data['items'].sort(key=lambda x: (x['sourceNo'], x['variantNo']))
    data['availableSourceNos'] = sorted(set(data['availableSourceNos']) | {19})
    data['pendingSourceNos'] = [x for x in data['pendingSourceNos'] if x != 19]
    data.setdefault('pendingReasons', {}).pop('19', None)
    data['version'] = '20261026-applied1-q19-confirmed-r1'
    data['itemCount'] = len(data['items'])
    data.setdefault('sourceEditionNotes', {})['19'] = (
        '현행 원문 p.4의 전개도와 다섯 보기를 직접 확인. 후보 답안 p.19는 ②·⑤에 동그라미, '
        '다른 보기는 취소 표시; 공식 답안 판본 동일성은 미확인. 원문 그림 불변, 유사문항 SVG 9개 제작. '
        '전개도 면 법선과 24개 정육면체 회전으로 각 보기의 가능성을 검산.')
    data['reviewSummary']['independentMathCount'] = len(data['items'])
    data['reviewSummary']['sourceTypes'] = len(data['availableSourceNos'])
    data['reviewSummary']['sourceDrawingCount'] = len({x['sourceNo'] for x in data['items'] if x.get('asset')})
    data['reviewSummary']['outputReviewed'] = False
    index['version'] = data['version']
    index['itemCount'] = len(data['items'])
    index['pendingSourceNos'] = data['pendingSourceNos']
    index['items'].append({'sourceNo': 19, 'genId': 'applied1-q19', 'area': '도형',
                           'subarea': '입체도형과 전개도', 'detailType': '정육면체 전개도와 접은 모양 비교',
                           'pointBand': '3.4', 'reviewStatus': 'verified', 'variantCount': 9})
    index['items'].sort(key=lambda x: x['sourceNo'])
    DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    INDEX_PATH.write_text(json.dumps(index, ensure_ascii=False, indent=2) + '\n')
    print('Built Applied1 Q19:', [x['answer'] for x in items])


if __name__ == '__main__':
    build()

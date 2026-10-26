"""Build nine verified ordered-run variants for Applied 2 Q19."""
import hashlib
import itertools
import json
from math import comb
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXAM = ROOT / 'materials/초등과정 대비 실전 모의고사 활용 2회.pdf'
ANSWER = ROOT / '.private-work/hw-expansion-20261023/applied2-answer-source.pdf'
DATA = ROOT / 'bank/data/applied2-expanded.json'
INDEX = ROOT / 'bank/data/applied2-expanded-index.json'
assert hashlib.sha256(EXAM.read_bytes()).hexdigest() == '1af1698985c657774c00eb9abc0466b07f8cb79bca64d2c379ea18b8cae67aab'
assert hashlib.sha256(ANSWER.read_bytes()).hexdigest() == '074180c770e7e76d77dca35410f14246a5eaa373feba8061d3f390c320b5ffdc'

# Number of boxes, then the lengths of the three filled runs in left-to-right order.
VARIANTS = [
    (9, (2, 3, 1)), (11, (2, 3, 1)), (12, (2, 3, 1)),
    (10, (3, 2, 1)), (11, (3, 2, 1)), (12, (1, 3, 2)),
    (10, (2, 2, 2)), (11, (2, 2, 2)), (12, (2, 2, 2)),
]


def run_lengths(bits):
    groups = []
    for bit in bits:
        if bit:
            if not groups or not previous:
                groups.append(0)
            groups[-1] += 1
        previous = bit
    return tuple(groups)


def enumerate_patterns(boxes, groups):
    return [bits for bits in itertools.product((0, 1), repeat=boxes) if run_lengths(bits) == groups]


def draw_svg(boxes, groups, examples, path):
    cell = 37
    left = 56
    width = left + boxes * cell + 118
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="145" viewBox="0 0 {width} 145">',
             '<rect width="100%" height="100%" fill="white"/>',
             '<text x="9" y="28" font-family="serif" font-size="19" fill="#191511">보기</text>']
    for row, bits in enumerate(examples):
        y = 15 + row * 56
        for j, bit in enumerate(bits):
            x = left + j * cell
            parts.append(f'<rect x="{x}" y="{y}" width="{cell}" height="{cell}" fill="white" stroke="#555" stroke-width="1"/>')
            if bit:
                parts.append(f'<circle cx="{x+cell/2}" cy="{y+cell/2}" r="11.7" fill="white" stroke="#191511" stroke-width="1.6"/>')
        tuple_label = ', '.join(map(str, groups))
        parts.append(f'<text x="{left+boxes*cell+17}" y="{y+25}" font-family="serif" font-size="18" fill="#191511">({tuple_label})</text>')
    parts.append('</svg>')
    path.write_text('\n'.join(parts) + '\n')


source = enumerate_patterns(10, (2, 3, 1))
assert len(source) == comb(10-6+1, 3) == 10
assert tuple((0, 1, 1, 0, 1, 1, 1, 0, 1, 0)) in source
assert tuple((1, 1, 0, 1, 1, 1, 0, 0, 0, 1)) in source

data = json.loads(DATA.read_text())
index = json.loads(INDEX.read_text())
assert data['version'] == index['version'] and 19 in data['pendingSourceNos']
assert not any(x['sourceNo'] == 19 for x in data['items'])
items = []
for variant_no, (boxes, groups) in enumerate(VARIANTS, 1):
    patterns = enumerate_patterns(boxes, groups)
    filled = sum(groups)
    unused_blanks = boxes - filled - 2
    count = comb(unused_blanks + 3, 3)
    assert len(patterns) == count and len(patterns) >= 2
    asset = f'assets/applied2/q19-v{variant_no}.svg'
    draw_svg(boxes, groups, patterns[:2], ROOT / 'bank' / asset)
    steps = [
        f'동그라미는 왼쪽부터 {groups[0]}개, {groups[1]}개, {groups[2]}개씩 세 묶음이므로 모두 {filled}칸을 채웁니다.',
        f'{boxes}칸 중 빈칸은 {boxes-filled}칸입니다. 세 묶음 사이에는 빈칸을 각각 1칸 이상 두어야 하므로 먼저 2칸을 둡니다.',
        f'남은 빈칸 {unused_blanks}칸을 맨 앞, 첫째와 둘째 묶음 사이, 둘째와 셋째 묶음 사이, 맨 뒤의 네 자리에 자유롭게 나눕니다.',
        f'이 네 자리에 빈칸을 나누는 방법은 {count}가지입니다. 보기의 두 그림도 이 {count}가지에 포함됩니다.',
    ]
    items.append({
        'id': f'applied2-q19-v{variant_no}', 'genId': 'applied2-q19', 'sourceSet': 'applied',
        'sourceRound': 2, 'sourceNo': 19, 'variantNo': variant_no, 'reviewStatus': 'verified',
        'area': '경우의 수', 'subarea': '빈칸 배치', 'detailType': '순서가 정해진 세 묶음의 배치 수',
        'pointBand': '3.4',
        'text': f'{boxes}칸에 동그라미를 채우려고 합니다. 보기처럼 왼쪽부터 연속한 동그라미의 개수가 차례로 ({groups[0]}, {groups[1]}, {groups[2]})이 되도록 채운 서로 다른 그림은 모두 몇 가지인가요? 보기의 그림도 포함합니다.',
        'answer': str(count), 'answerContract': 'ordered-parts', 'answerParts': [count],
        'answerLabels': ['그림 수'], 'acceptedAnswers': [str(count)],
        'solutionSteps': steps, 'solution': ' '.join(steps),
        'learningPoint': '연속한 묶음 사이의 필수 빈칸을 먼저 놓고, 남은 빈칸을 네 위치에 배분하기',
        'learningLocation': '활용 2회 · 원문 19번 · 연속한 묶음과 빈칸의 배치',
        'verification': {
            'primaryMethod': '가능한 모든 0/1 칸 배열을 전수 열거하여 연속 묶음 길이 비교',
            'independentMethod': '필수 간격 2칸을 제외한 빈칸의 4곳 분배 조합 계산',
            'parameters': {'boxes': boxes, 'runs': list(groups), 'answer': count},
            'sourceExamPage': 4, 'sourceAnswerPage': 5, 'sourceTextDirectlyReviewed': True,
            'sourceFigureDirectlyReviewed': True, 'sourceAnswerCandidate': 10,
            'independentSourceAnswer': 10, 'sourceAnswerCandidateOfficiality': 'unverified',
            'sourceExamSha256': hashlib.sha256(EXAM.read_bytes()).hexdigest(),
            'sourceAnswerSha256': hashlib.sha256(ANSWER.read_bytes()).hexdigest(),
            'originalFigurePreserved': True, 'variantFiguresCreatedFresh': True,
            'enumerationPatternCount': len(patterns), 'independentMethodAgrees': len(patterns) == count,
        },
        'difficultyEvidence': {'basis': 'source-point-band', 'label': '중', 'sourceReasoningPreserved': True, 'measuredVariantRate': None},
        'asset': {'kind': 'svg', 'src': asset, 'description': '동그라미를 세 묶음으로 채운 보기 두 줄'},
    })

data['items'].extend(items)
data['items'].sort(key=lambda x: (x['sourceNo'], x['variantNo']))
data['availableSourceNos'] = sorted(set(data['availableSourceNos']) | {19})
data['pendingSourceNos'] = [n for n in data['pendingSourceNos'] if n != 19]
data['version'] = '20261026-applied2-q19-confirmed-r1'
data['itemCount'] = len(data['items'])
data.setdefault('sourceEditionNotes', {})['19'] = '현행 원문 p.4의 10칸과 (2,3,1) 예시 두 줄을 직접 확인. 모든 칸 배열 열거 및 네 빈칸 위치 조합에서 10가지, 답안 후보 p.5의 필기 10과 일치. 답안 공식 판본 동일성은 미확정. 원본 그림 보존, 유사문제 SVG 9개 신규 제작.'
data['reviewSummary']['independentMathCount'] = len(data['items'])
data['reviewSummary']['sourceTypes'] = len(data['availableSourceNos'])
data['reviewSummary']['sourceDrawingCount'] = len({x['sourceNo'] for x in data['items'] if x.get('asset')})
data['reviewSummary']['outputReviewed'] = False
index['version'] = data['version']
index['itemCount'] = len(data['items'])
index['pendingSourceNos'] = data['pendingSourceNos']
index['items'].append({'sourceNo': 19, 'genId': 'applied2-q19', 'area': '경우의 수',
                       'subarea': '빈칸 배치', 'detailType': '순서가 정해진 세 묶음의 배치 수',
                       'pointBand': '3.4', 'reviewStatus': 'verified', 'variantCount': 9})
index['items'].sort(key=lambda x: x['sourceNo'])
DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
INDEX.write_text(json.dumps(index, ensure_ascii=False, indent=2) + '\n')
print('Built Applied2 Q19: nine ordered-run variants; answers', [x['answerParts'][0] for x in items])

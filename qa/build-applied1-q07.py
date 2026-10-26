"""Build nine fresh rectangle-counting variants for Applied 1, source Q07."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PRIVATE = ROOT / '.private-work/hw-expansion-20261023/hw1'
EXAM = ROOT / 'materials/초등과정 대비 실전 모의고사 활용 1회.pdf'
ANSWER = ROOT / '.private-work/balanced15-20261024/source/applied1-answer.pdf'
assert hashlib.sha256(EXAM.read_bytes()).hexdigest() == '6123edccb7f64dc664d57dd29004483e3d27c49665892da39bbf2c032b243924'
assert hashlib.sha256(ANSWER.read_bytes()).hexdigest() == '1e8a14128840dededcdf69a8951dac4c2cd6373483c67f34ebf15cfca6944c54'

data_path = ROOT / 'bank/data/applied1-expanded.json'
index_path = ROOT / 'bank/data/applied1-expanded-index.json'
data = json.loads(data_path.read_text())
index = json.loads(index_path.read_text())
assert 7 in data['pendingSourceNos'] or data['version'] == '20261026-applied1-q07-confirmed-r1'
data['items'] = [x for x in data['items'] if x['sourceNo'] != 7]
index['items'] = [x for x in index['items'] if x['sourceNo'] != 7]
assert data['version'] == index['version']

# Source PDF p.2: 4 rows × 5 columns; the flag is in row 2, column 4.
source_rows, source_cols, source_r, source_c = 4, 5, 2, 4
source_answer = source_r * (source_rows - source_r + 1) * source_c * (source_cols - source_c + 1)
assert source_answer == 48

cases = [
    (4, 5, 2, 4),
    (3, 4, 2, 2),
    (5, 6, 3, 4),
    (4, 4, 3, 2),
    (6, 5, 3, 2),
    (3, 6, 2, 5),
    (5, 5, 4, 4),
    (6, 7, 2, 6),
    (4, 7, 3, 5),
]

def figure(rows, cols, r, c, path):
    cell = 54
    margin = 26
    width, height = margin * 2 + cols * cell, margin * 2 + rows * cell
    x0, y0 = margin, margin
    fx = x0 + (c - .5) * cell
    fy = y0 + (r - .5) * cell
    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">',
           '<rect width="100%" height="100%" fill="#fff"/>']
    for i in range(rows + 1):
        y = y0 + i * cell
        svg.append(f'<line x1="{x0}" y1="{y}" x2="{x0 + cols * cell}" y2="{y}" stroke="#202020" stroke-width="1.8"/>')
    for i in range(cols + 1):
        x = x0 + i * cell
        svg.append(f'<line x1="{x}" y1="{y0}" x2="{x}" y2="{y0 + rows * cell}" stroke="#202020" stroke-width="1.8"/>')
    svg.append(f'<line x1="{fx - 5}" y1="{fy + 13}" x2="{fx - 5}" y2="{fy - 17}" stroke="#202020" stroke-width="2"/>')
    svg.append(f'<path d="M {fx - 4} {fy - 16} L {fx + 15} {fy - 10} L {fx - 4} {fy - 3} Z" fill="#202020"/>')
    svg.append('</svg>')
    path.write_text('\n'.join(svg) + '\n')

asset_dir = ROOT / 'bank/assets/applied1'
asset_dir.mkdir(parents=True, exist_ok=True)
items = []
for variant, (rows, cols, r, c) in enumerate(cases, 1):
    answer = r * (rows - r + 1) * c * (cols - c + 1)
    src = f'assets/applied1/q07-v{variant}.svg'
    figure(rows, cols, r, c, ROOT / 'bank' / src)
    label = f'{rows}행 {cols}열 격자의 {r}행 {c}열'
    steps = [
        f'깃발은 {label}에 있습니다.',
        f'깃발을 포함하려면 위쪽 경계는 {r}가지, 아래쪽 경계는 {rows-r+1}가지로 고를 수 있습니다. 왼쪽 경계는 {c}가지, 오른쪽 경계는 {cols-c+1}가지입니다.',
        f'서로 독립적으로 고르는 경계 수를 곱하면 {r}×{rows-r+1}×{c}×{cols-c+1}={answer}입니다.',
    ]
    items.append({
        'id': f'applied1-q07-v{variant}', 'genId': 'applied1-q07', 'sourceSet': 'applied', 'sourceRound': 1,
        'sourceNo': 7, 'variantNo': variant, 'reviewStatus': 'verified', 'area': '도형', 'subarea': '격자와 직사각형',
        'detailType': '깃발이 있는 칸을 포함하는 직사각형의 수', 'pointBand': '2.7',
        'text': '그림에서 깃발이 있는 칸을 포함하는 직사각형은 모두 몇 개인가요?',
        'answer': str(answer), 'answerContract': 'ordered-parts', 'answerParts': [answer],
        'answerLabels': ['직사각형의 수'], 'acceptedAnswers': [str(answer)], 'solutionSteps': steps,
        'solution': ' '.join(steps), 'learningPoint': '깃발 칸을 기준으로 네 경계선을 고르는 경우의 수를 각각 세어 곱하기',
        'learningLocation': '활용 1회 · 원문 7번 · 격자와 직사각형',
        'verification': {
            'primaryMethod': '깃발 칸을 포함하는 직사각형의 네 경계선 선택 수 곱하기',
            'independentMethod': '모든 위·아래·왼쪽·오른쪽 경계 조합 전수 열거',
            'parameters': {'rows': rows, 'columns': cols, 'flagRow': r, 'flagColumn': c, 'answer': answer},
            'sourceExamPage': 2, 'sourceAnswerPage': 7, 'sourceTextDirectlyReviewed': True,
            'sourceFigureDirectlyReviewed': True, 'sourceAnswerCandidate': source_answer,
            'independentSourceAnswer': source_answer, 'sourceAnswerCandidateOfficiality': 'unverified',
            'originalFigurePreserved': True, 'variantFiguresCreatedFresh': True,
            'sourceExamSha256': hashlib.sha256(EXAM.read_bytes()).hexdigest(),
            'sourceAnswerSha256': hashlib.sha256(ANSWER.read_bytes()).hexdigest(),
        },
        'difficultyEvidence': {'basis': 'source-point-band', 'label': '하', 'sourceReasoningPreserved': True, 'measuredVariantRate': None},
        'asset': {'kind': 'svg', 'src': src, 'description': f'{rows}행 {cols}열 격자와 깃발 위치'},
    })

data['items'].extend(items)
data['items'].sort(key=lambda x: (x['sourceNo'], x['variantNo']))
data['availableSourceNos'] = sorted(set(data['availableSourceNos']) | {7})
data['pendingSourceNos'] = [n for n in data['pendingSourceNos'] if n != 7]
data['pendingReasons'].pop('7', None)
data['version'] = '20261026-applied1-q07-confirmed-r1'
data['reviewSummary']['independentMathCount'] = len(data['items'])
data['reviewSummary']['sourceTypes'] = len(data['availableSourceNos'])
data['reviewSummary']['sourceDrawingCount'] = len({x['sourceNo'] for x in data['items'] if x.get('asset')})
data['reviewSummary']['outputReviewed'] = False
index['version'] = data['version']
index['itemCount'] = len(data['items'])
index['pendingSourceNos'] = data['pendingSourceNos']
index['items'].append({'sourceNo': 7, 'genId': 'applied1-q07', 'area': '도형', 'subarea': '격자와 직사각형',
                       'detailType': '깃발이 있는 칸을 포함하는 직사각형의 수', 'pointBand': '2.7',
                       'reviewStatus': 'verified', 'variantCount': 9})
index['items'].sort(key=lambda x: x['sourceNo'])
data_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
index_path.write_text(json.dumps(index, ensure_ascii=False, indent=2) + '\n')
print(f'Built Applied1 Q07: {len(items)} variants, source answer {source_answer}, variant answers {[x["answerParts"][0] for x in items]}')

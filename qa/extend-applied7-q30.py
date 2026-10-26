#!/usr/bin/env python3
"""Extend only the existing Applied 7 Q30 hidden-cubes staircase type."""
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / '.private-work/hw-expansion-20261023/hw7'
DATA_PATH = ROOT / 'bank/data/applied7-expanded.json'
INDEX_PATH = ROOT / 'bank/data/applied7-expanded-index.json'
EXAM = ROOT / 'materials/초등과정 대비 실전 모의고사활용 7회.pdf'
ANSWER = Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf')
PDFTOTEXT = Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')
FIGURE = ROOT / 'bank/assets/applied7/q30-staircase-original.png'

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

exam_text = subprocess.check_output([str(PDFTOTEXT), '-f', '7', '-l', '7', '-layout', str(EXAM), '-'], text=True, errors='replace')
answer_text = subprocess.check_output([str(PDFTOTEXT), '-f', '7', '-l', '7', '-layout', str(ANSWER), '-'], text=True, errors='replace')
exam_compact = ''.join(exam_text.split()); answer_compact = ''.join(answer_text.split())
assert '쌓기나무를6층까지쌓았을때' in exam_compact and '보이지않는쌓기나무' in exam_compact
assert '쌓기나무를6층까지쌓았을때' in answer_compact
assert FIGURE.is_file()

items = []
proof = []
for variant, n in enumerate(range(7, 16), 1):
    total = sum(k * k for k in range(1, n + 1))
    # The stack consists of square layers sharing one back corner. Enumerate
    # every occupied unit cube and identify one exposed top cube per column.
    cubes = {(x, y, z) for z in range(1, n + 1)
             for x in range(n - z + 1) for y in range(n - z + 1)}
    top_cubes = {(x, y, z) for x, y, z in cubes if (x, y, z + 1) not in cubes}
    hidden = len(cubes) - len(top_cubes)
    formula = n * (n - 1) * (2 * n - 1) // 6
    assert len(cubes) == total and len(top_cubes) == n * n and hidden == formula
    visible_layer_counts = [sum(1 for x, y, z in top_cubes if z == layer)
                            for layer in range(1, n + 1)]
    steps = [
        f'{n}층 쌓기나무 전체는 아래부터 {n}×{n}, {n-1}×{n-1}, …, 1×1이므로 모두 {" + ".join(f"{k}²" for k in range(1, n+1))}={total}개입니다.',
        f'위에서 볼 수 있는 가장 높은 쌓기나무는 바닥의 {n}×{n}개 자리마다 하나씩 있어 {n*n}개입니다.',
        f'보이지 않는 수는 전체에서 보이는 {n*n}개를 빼면 {total}−{n*n}={hidden}개입니다.',
        f'같은 값은 1²+2²+…+{n-1}²={hidden}로도 확인됩니다.'
    ]
    text = f'아래와 같은 규칙으로 쌓기나무를 {n}층까지 쌓았을 때, 보이지 않는 쌓기나무는 모두 몇 개입니까?'
    item = {
        'id': f'applied7-q30-v{variant}', 'genId': 'applied7-q30', 'sourceSet': 'applied',
        'sourceRound': 7, 'sourceNo': 30, 'variantNo': variant, 'reviewStatus': 'verified',
        'area': '도형', 'subarea': '입체도형의 개수 세기',
        'detailType': '정사각형 층을 쌓은 계단형 쌓기나무에서 보이지 않는 개수 구하기',
        'pointBand': '4.2', 'text': text, 'answer': str(hidden), 'answerParts': [hidden],
        'answerLabels': ['보이지 않는 쌓기나무 수'], 'acceptedAnswers': [str(hidden), f'{hidden}개'],
        'answerContract': 'single-number',
        'asset': {'kind': 'raster', 'src': 'assets/applied7/q30-staircase-original.png',
                  'description': '활용 7회 원문 30번의 그림을 원문 그대로 사용'},
        'solutionSteps': steps, 'solution': ' '.join(steps),
        'learningPoint': '정사각형 모양으로 쌓인 각 층의 전체 수와 보이는 맨 위 쌓기나무 수를 비교한다',
        'learningLocation': '활용 7회 · 원문 30번 · 계단형 쌓기나무의 숨은 개수',
        'verification': {
            'primaryMethod': '층별 정사각형 수의 합에서 바닥의 각 자리에 하나씩 보이는 맨 위 쌓기나무를 뺀다.',
            'independentMethod': '모든 (x,y,z) 단위 큐브를 직접 생성해 위 큐브가 없는 노출 큐브와 숨은 큐브를 전수 분류한다.',
            'parameters': {'layers': n, 'layerSizesBottomToTop': list(range(n, 0, -1)),
                           'totalCubes': total, 'visibleTopCubes': n*n,
                           'visibleByLayer': visible_layer_counts, 'hiddenCubes': hidden,
                           'closedForm': 'n(n−1)(2n−1)/6'},
            'independentSuite': 'qa/applied7-q30-independent-validate.py',
            'sourceExamPage': 7, 'sourceExamFile': EXAM.name, 'sourceAnswerPage': 7,
            'sourceDrawingCompared': True, 'sourceDrawingPresent': True,
            'sourceDrawingAsset': FIGURE.name, 'sourceDrawingSha256': sha(FIGURE),
            'variantUsesSourceDrawing': True, 'studentDifficultyMeasured': False
        },
        'difficultyEvidence': {
            'basis': 'source-point-band', 'label': '상', 'sourceReasoningPreserved': True,
            'measuredVariantRate': None, 'estimated': False,
            'rationale': '활용 7회 원문 30번은 23~30번의 4.2점 배점대다. 활용 난도는 배점대만 적용한다.'
        }
    }
    items.append(item)
    proof.append({'variant': variant, 'layers': n, 'totalCubes': total,
                  'visibleTopCubes': n*n, 'hiddenCubes': hidden,
                  'enumeratedCubeCount': len(cubes), 'enumeratedTopCount': len(top_cubes)})

data = json.loads(DATA_PATH.read_text())
assert data['sourceRound'] == 7 and 30 not in data['availableSourceNos']
assert not [x for x in data['items'] if x['sourceNo'] == 30]
data['items'].extend(items)
data['items'].sort(key=lambda x: (x['sourceNo'], x['variantNo']))
data['availableSourceNos'] = sorted(set(data['availableSourceNos'] + [30]))
data['pendingSourceNos'] = [n for n in range(1, 31) if n not in data['availableSourceNos']]
data['itemCount'] = len(data['items'])
data['version'] = data['version'].rsplit('-r', 1)[0] + '-q30-r21'
idx = json.loads(INDEX_PATH.read_text())
idx['version'] = data['version']; idx['itemCount'] = data['itemCount']; idx['pendingSourceNos'] = data['pendingSourceNos']
idx['items'].append({'sourceNo': 30, 'genId': 'applied7-q30', 'area': '도형',
                     'subarea': '입체도형의 개수 세기',
                     'detailType': '정사각형 층을 쌓은 계단형 쌓기나무에서 보이지 않는 개수 구하기',
                     'pointBand': '4.2', 'reviewStatus': 'verified', 'variantCount': 9})
idx['items'].sort(key=lambda x: x['sourceNo'])
DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
INDEX_PATH.write_text(json.dumps(idx, ensure_ascii=False, indent=2) + '\n')

review = {
    'sourceExam': {'name': EXAM.name, 'driveId': '1qtshEh5Zkv3X4DMMcXHjWw1kRgibbvxf',
                   'bytes': EXAM.stat().st_size, 'sha256': sha(EXAM),
                   'questionPage': 7, 'questionNumber': 30,
                   'sourceQuestion': '그림과 같은 계단형 쌓기나무를 6층까지 쌓을 때 보이지 않는 쌓기나무 수',
                   'figurePresent': True, 'figureCrop': {'pageRenderDpi': 300, 'cropPixels': [548, 2245, 1034, 2814]}},
    'sourceAnswer': {'name': ANSWER.name, 'driveId': '1zIN-XzODa-_T2AUjGbmuzHSPvCdVb2_j',
                     'bytes': ANSWER.stat().st_size, 'sha256': sha(ANSWER),
                     'answerPage': 7, 'questionNumber': 30, 'teacherMarkedAnswer': None,
                     'evidence': '답안 PDF 7쪽에 30번 풀이·표시 정답이 없다. 따라서 교사 정답과 일치한다고 주장하지 않고, 원문 그림의 1×1부터 4×4까지 정사각 층을 직접 세어 규칙을 확인했다.'},
    'directPageImagesCompared': True, 'sourceAndAnswerMatch': None,
    'sourceTypeAlreadyPresent': True, 'newSourceTypesAdded': 0,
    'sourceAnswerIndependentCheck': {'sourceLayers': 6, 'totalCubes': 91,
                                    'visibleTopCubes': 36, 'hiddenCubes': 55,
                                    'formula': '6²+5²+4²+3²+2²+1²−6²=1²+2²+3²+4²+5²=55',
                                    'fourLayerDiagramCheck': {'totalCubes': 30, 'visibleTopCubes': 16, 'hiddenCubes': 14},
                                    'figureSha256': sha(FIGURE)},
    'newVariants': 9, 'allVariantsSameSourceType': True, 'variants': proof,
    'dataVersion': data['version']
}
(WORK / 'q30-source-answer-review.json').write_text(json.dumps(review, ensure_ascii=False, indent=2) + '\n')
print(f"Built Applied7 Q30: 9 variants of the existing staircase hidden-cubes type; {data['itemCount']} total; new source types 0.")

#!/usr/bin/env python3
"""Extend Applied 7's existing parallelogram-counting source type to nine items."""
import hashlib
import json
import math
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / '.private-work/hw-expansion-20261023/hw7'
DATA_PATH = ROOT / 'bank/data/applied7-expanded.json'
INDEX_PATH = ROOT / 'bank/data/applied7-expanded-index.json'
EXAM = ROOT / 'materials/초등과정 대비 실전 모의고사활용 7회.pdf'
ANSWER = Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf')
PDFTOTEXT = Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')
ASSET_DIR = ROOT / 'bank/assets/applied7'

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def extract_page(pdf, page):
    return subprocess.check_output([str(PDFTOTEXT), '-layout', '-f', str(page), '-l', str(page), str(pdf), '-'], text=True, errors='replace')

exam_page = extract_page(EXAM, 4)
answer_page = extract_page(ANSWER, 4)
assert '다음 그림에서 찾을 수 있는 크고 작은 평행사변형은 모두' in exam_page
assert '몇 개인지 구하세요.' in exam_page
assert '다음 그림에서 찾을 수 있는 크고 작은 평행사변형은 모두' in answer_page
assert '답' in answer_page
assert EXAM.exists() and ANSWER.exists()

# This crop was taken without rescaling from a 300 dpi render of the current exam PDF, p. 4.
source_asset = ASSET_DIR / 'q17-parallelograms-original.png'
assert source_asset.exists(), 'Review the exact source diagram crop before building.'
source_asset_sha = sha(source_asset)

# Each row is a contiguous horizontal run of occupied unit cells.
# The source figure is a 5x8 middle rectangle, one centered 3-cell row above,
# and two centered 3-cell rows below. The smaller runs share the same columns.
cases = [
    # W, H, T, B, S; source is fixed for v1.
    (8, 5, 1, 2, 3),
    (7, 4, 1, 1, 3),
    (8, 4, 2, 1, 4),
    (9, 4, 1, 2, 3),
    (8, 6, 2, 1, 4),
    (10, 3, 1, 1, 4),
    (7, 5, 2, 2, 3),
    (9, 5, 1, 1, 5),
    (10, 4, 2, 1, 4),
]

def row_runs(width, height, top_rows, bottom_rows, narrow_width):
    start = (width - narrow_width + 1) // 2
    return ([range(start, start + narrow_width) for _ in range(top_rows)]
            + [range(width) for _ in range(height)]
            + [range(start, start + narrow_width) for _ in range(bottom_rows)])

def count_by_interval_formula(rows, width):
    total = 0
    by_vertical_span = {}
    for top in range(len(rows)):
        common = set(rows[top])
        for bottom in range(top, len(rows)):
            common.intersection_update(rows[bottom])
            count = len(common) * (len(common) + 1) // 2
            span = bottom - top + 1
            by_vertical_span[span] = by_vertical_span.get(span, 0) + count
            total += count
    return total, by_vertical_span

def count_by_boundary_edges(rows, width):
    occupied = {(r, c) for r, run in enumerate(rows) for c in run}
    horizontal = {(r, c) for r, c in occupied} | {(r + 1, c) for r, c in occupied}
    vertical = {(r, c) for r, c in occupied} | {(r, c + 1) for r, c in occupied}
    count = 0
    by_vertical_span = {}
    for top in range(len(rows)):
        for bottom in range(top, len(rows)):
            for left in range(width):
                for right in range(left + 1, width + 1):
                    # Check every unit segment on all four sides of the candidate.
                    top_ok = all((top, c) in horizontal for c in range(left, right))
                    bottom_ok = all((bottom + 1, c) in horizontal for c in range(left, right))
                    left_ok = all((r, left) in vertical for r in range(top, bottom + 1))
                    right_ok = all((r, right) in vertical for r in range(top, bottom + 1))
                    if top_ok and bottom_ok and left_ok and right_ok:
                        count += 1
                        span = bottom - top + 1
                        by_vertical_span[span] = by_vertical_span.get(span, 0) + 1
    return count, by_vertical_span

def render_grid(path, width, height, top_rows, bottom_rows, narrow_width):
    rows = row_runs(width, height, top_rows, bottom_rows, narrow_width)
    occ = {(r, c) for r, run in enumerate(rows) for c in run}
    cw, rh, row_shift, col_rise, scale = 64, 52, 28, 5, 3
    def point(c, r):
        return (c * cw - r * row_shift, r * rh - c * col_rise)
    edges = set()
    for r, c in occ:
        corners = [(c, r), (c + 1, r), (c + 1, r + 1), (c, r + 1)]
        for a, b in zip(corners, corners[1:] + corners[:1]):
            edges.add(tuple(sorted((a, b))))
    coords = [point(c, r) for edge in edges for c, r in edge]
    minx, maxx = min(p[0] for p in coords), max(p[0] for p in coords)
    miny, maxy = min(p[1] for p in coords), max(p[1] for p in coords)
    pad = 16
    outw, outh = maxx - minx + 2 * pad, maxy - miny + 2 * pad
    image = Image.new('RGB', (outw * scale, outh * scale), 'white')
    draw = ImageDraw.Draw(image)
    for a, b in edges:
        x1, y1 = point(*a); x2, y2 = point(*b)
        draw.line(((x1 - minx + pad) * scale, (y1 - miny + pad) * scale,
                   (x2 - minx + pad) * scale, (y2 - miny + pad) * scale), fill='#29251f', width=5)
    image = image.resize((outw, outh), Image.Resampling.LANCZOS)
    image.save(path, format='PNG', optimize=True)
    return rows

def formula_answer(width, height, top_rows, bottom_rows, narrow_width):
    middle_spans = height * (height + 1) // 2
    all_spans = (height + top_rows + bottom_rows) * (height + top_rows + bottom_rows + 1) // 2
    return middle_spans * width * (width + 1) // 2 + (all_spans - middle_spans) * narrow_width * (narrow_width + 1) // 2

items = []
proofs = []
for variant, (width, height, top_rows, bottom_rows, narrow_width) in enumerate(cases, 1):
    rows = row_runs(width, height, top_rows, bottom_rows, narrow_width)
    formula = formula_answer(width, height, top_rows, bottom_rows, narrow_width)
    interval_count, by_span_a = count_by_interval_formula(rows, width)
    edge_count, by_span_b = count_by_boundary_edges(rows, width)
    assert formula == interval_count == edge_count
    asset_rel = f'assets/applied7/q17-parallelograms-variant-{variant}.png'
    if variant > 1:
        render_grid(ASSET_DIR / f'q17-parallelograms-variant-{variant}.png', *cases[variant - 1])
    else:
        # v1 retains the exact original, unmodified diagram crop.
        asset_rel = 'assets/applied7/q17-parallelograms-original.png'
    top_middle = height * (height + 1) // 2
    total_row_spans = len(rows) * (len(rows) + 1) // 2
    row_spans_touching_extensions = total_row_spans - top_middle
    middle_count = top_middle * width * (width + 1) // 2
    extension_count = row_spans_touching_extensions * narrow_width * (narrow_width + 1) // 2
    steps = [
        f'가운데 {height}행×{width}열 안에서 세로 {height}행의 연속 구간은 {height}×({height}+1)÷2={top_middle}개입니다. 각 구간에서 가로 구간은 {width}×({width}+1)÷2={width * (width + 1) // 2}개이므로 {top_middle}×{width * (width + 1) // 2}={middle_count}개입니다.',
        f'전체 {len(rows)}행에서 연속된 행 구간은 {len(rows)}×({len(rows)}+1)÷2={total_row_spans}개입니다. 가운데 {height}행만 포함하는 {top_middle}개를 빼면 위나 아래의 좁은 부분을 포함하는 구간은 {row_spans_touching_extensions}개입니다.',
        f'이 구간은 공통으로 {narrow_width}열을 지나며, 각 구간에서 가로 구간은 {narrow_width}×({narrow_width}+1)÷2={narrow_width * (narrow_width + 1) // 2}개입니다. 따라서 {row_spans_touching_extensions}×{narrow_width * (narrow_width + 1) // 2}={extension_count}개입니다.',
        f'두 경우를 합하면 {middle_count}+{extension_count}={formula}개입니다.'
    ]
    item = {
        'id': f'applied7-q17-v{variant}', 'genId': 'applied7-q17', 'sourceSet': 'applied',
        'sourceRound': 7, 'sourceNo': 17, 'variantNo': variant, 'reviewStatus': 'verified',
        'area': '도형', 'subarea': '도형의 개수',
        'detailType': '격자 도형에서 크고 작은 평행사변형 수 세기', 'pointBand': '3.4',
        'text': '다음 그림에서 찾을 수 있는 크고 작은 평행사변형은 모두 몇 개인지 구하세요.',
        'asset': {'kind': 'raster', 'src': asset_rel, 'description': '활용 7회 원문 17번의 격자 평행사변형 세기 유형 그림'},
        'answer': str(formula), 'answerParts': [formula], 'answerLabels': ['개'],
        'acceptedAnswers': [str(formula), f'{formula}개'], 'answerContract': 'single-number',
        'solutionSteps': steps, 'solution': ' '.join(steps),
        'learningPoint': '가로·세로 연속 구간을 나누어 세고 격자 모양이 달라지는 행 구간을 따로 계산한다.',
        'learningLocation': '활용 7회 · 원문 17번 · 격자에서 크고 작은 평행사변형 세기',
        'verification': {
            'primaryMethod': '가운데 직사각형 행 구간과 위·아래 좁은 부분을 포함하는 행 구간을 나누어 가로 구간 수를 계산한다.',
            'independentMethod': '모든 후보의 네 변을 단위 격자 선분으로 만들어 실제 경계 선분이 전부 존재하는 후보만 전수 열거한다.',
            'parameters': {'mainWidth': width, 'mainHeight': height, 'topExtensionRows': top_rows,
                           'bottomExtensionRows': bottom_rows, 'extensionWidth': narrow_width,
                           'extensionStartColumn': (width - narrow_width + 1) // 2,
                           'answer': formula, 'middleOnlyCount': middle_count,
                           'extensionTouchingRowSpans': row_spans_touching_extensions,
                           'extensionCount': extension_count, 'byVerticalSpan': by_span_a},
            'independentSuite': 'qa/applied7-q17-independent-validate.py',
            'sourceExamPage': 4, 'sourceExamFile': EXAM.name, 'sourceAnswerPage': 4,
            'sourceDrawingCompared': True, 'sourceDrawingPresent': True,
            'variantUsesSourceDrawing': variant == 1,
            'sourceDrawingAssetSha256': source_asset_sha,
            'officialAnswerStatus': 'Drive answer PDF page 4 is a blank exam duplicate; no marked official answer was available. The source and variants were solved by independent enumeration.',
            'studentDifficultyMeasured': False
        },
        'difficultyEvidence': {'basis': 'source-point-band', 'label': '중', 'sourceReasoningPreserved': True,
                               'measuredVariantRate': None, 'estimated': False,
                               'rationale': '활용 7회 원문 17번은 13~22번의 3.4점 배점대다. 활용 난도는 배점대만 적용한다.'}
    }
    items.append(item)
    proofs.append({'variantNo': variant, 'parameters': {'mainWidth': width, 'mainHeight': height,
                    'topExtensionRows': top_rows, 'bottomExtensionRows': bottom_rows,
                    'extensionWidth': narrow_width}, 'answer': formula,
                    'formulaCount': formula, 'rowIntervalEnumeration': interval_count,
                    'unitBoundaryEnumeration': edge_count, 'countsByVerticalSpan': by_span_a,
                    'methodsAgree': formula == interval_count == edge_count})

data = json.loads(DATA_PATH.read_text())
assert data['sourceSet'] == 'applied' and data['sourceRound'] == 7
assert 17 not in data['availableSourceNos'] and 17 in data['pendingSourceNos']
assert not any(x['sourceNo'] == 17 for x in data['items'])
data['items'].extend(items)
data['items'].sort(key=lambda x: (x['sourceNo'], x['variantNo']))
data['availableSourceNos'] = sorted(data['availableSourceNos'] + [17])
data['pendingSourceNos'] = [n for n in range(1, 31) if n not in data['availableSourceNos']]
data['itemCount'] = len(data['items'])
data['version'] = '20261025-applied7-expansion-q02-q03-q04-q05-q06-q07-q09-q10-q11-q12-q13-q14-q15-q16-q17-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r27'
DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

index = json.loads(INDEX_PATH.read_text())
assert index['sourceRound'] == 7 and 17 in index['pendingSourceNos']
index['version'] = data['version']; index['itemCount'] = data['itemCount']
index['pendingSourceNos'] = data['pendingSourceNos']
index['items'].append({'sourceNo': 17, 'genId': 'applied7-q17', 'area': '도형',
                       'subarea': '도형의 개수',
                       'detailType': '격자 도형에서 크고 작은 평행사변형 수 세기',
                       'pointBand': '3.4', 'reviewStatus': 'verified', 'variantCount': 9})
index['items'].sort(key=lambda x: x['sourceNo'])
INDEX_PATH.write_text(json.dumps(index, ensure_ascii=False, indent=2) + '\n')

source_review = {
    'sourceExam': {'file': EXAM.name, 'page': 4, 'questionNo': 17,
                   'text': '다음 그림에서 찾을 수 있는 크고 작은 평행사변형은 모두 몇 개인지 구하세요.',
                   'mainGrid': '5 rows × 8 columns', 'topExtension': '1 row × 3 columns',
                   'bottomExtension': '2 rows × 3 columns, aligned with top extension',
                   'drawingAsset': source_asset.relative_to(ROOT).as_posix(),
                   'drawingSha256': source_asset_sha, 'drawingDirectlyCompared': True},
    'sourceAnswer': {'file': ANSWER.name, 'page': 4,
                     'driveId': '1zIN-XzODa-_T2AUjGbmuzHSPvCdVb2_j',
                     'officialKeyPresent': False,
                     'evidence': '답안 PDF 4쪽은 답란이 비어 있는 시험지 복사본이다. 공식 정답을 확인했다고 기록하지 않는다.'},
    'sourceTypeAlreadyPresent': True, 'newSourceTypesAdded': 0,
    'independentSourceAnswer': 666, 'variantsAdded': 8,
    'variationPolicy': 'Use the same full-grid parallelogram counting relation; vary only the main rectangle and aligned top/bottom extensions.',
    'variants': proofs
}
(WORK / 'q17-source-answer-review.json').write_text(json.dumps(source_review, ensure_ascii=False, indent=2) + '\n')
math_proof = {'sourceQuestion': 17, 'answer': 666, 'officialAnswerStatus': 'not available; blank answer-copy page',
              'independentMethods': ['row-interval intersection and combination formula',
                                     'explicit enumeration of all four-sided unit-grid boundaries'],
              'allSourceAndVariantProofsAgree': all(p['methodsAgree'] for p in proofs),
              'sourceAndEightVariants': proofs}
(WORK / 'q17-independent-math.json').write_text(json.dumps(math_proof, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'version': data['version'], 'items': data['itemCount'],
                  'types': len(data['availableSourceNos']), 'pending': data['pendingSourceNos'],
                  'q17Answers': [p['answer'] for p in proofs], 'sourceCropSha256': source_asset_sha}, ensure_ascii=False))

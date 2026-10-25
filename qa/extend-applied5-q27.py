#!/usr/bin/env python3
"""Add nine distinct-digit multiplication-puzzle items for Applied 5 Q27."""
import hashlib
import itertools
import json
import math
from pathlib import Path
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / '.private-work/hw-expansion-20261023/hw5/q27-source-review'
DATA_PATH = ROOT / 'bank/data/applied5-expanded.json'
INDEX_PATH = ROOT / 'bank/data/applied5-expanded-index.json'
ASSET_DIR = ROOT / 'bank/assets/applied5'
EXAM = ROOT / 'materials/초등과정 대비 실전 모의고사활용 5회.pdf'
ANSWER = Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 5회 답안.pdf')
PAGE = WORK / 'exam-6.png'
ANSWER_PAGE = WORK / 'answer-27.png'
SOURCE_CROP = WORK / 'q27-equation-box.png'
SOURCE_BOX = (100, 365, 710, 590)
SOURCE_FIGURE = ASSET_DIR / 'q27-source-equations.png'
EXAM_ID = '1x7CevkWByUrXPqfbV5xTHidJPNDrbuJp'
ANSWER_ID = '1QGjWnEBjULxwy4BBX8tLutpGbjQfEh05'
VERSION = '20261025-applied5-expansion-q03-q05-q06-q08-q09-q11-q12-q14-q15-q16-q17-q18-q19-q20-q22-q23-q24-q25-q26-q27-r21'
BASE_VERSION = VERSION.removesuffix('-q27-r21') + '-r20'
LETTERS = 'ABCDEFGHI'

# Each system is independently checked against all 9! assignments. v1 is the
# source puzzle with its pixel-exact original equation box. The remaining eight
# systems use new equation-box drawings, as authorized by the user.
SYSTEMS = [
    ('H×K=BK; C×C×C=D; D×EE=DD; A×A=FA; F×F×F=CG', {'A':6,'B':4,'C':2,'D':8,'E':1,'F':3,'G':7,'H':9,'K':5}, True),
    ('H×B×I=F; A×C=BD; E×B=F×H; F×E=GC; B×F=C×H', dict(zip(LETTERS, map(int,'724896531'))), False),
    ('G×B×A=H; D×C=AI; D×F=EG; B×C×A=F; G×H=CA', dict(zip(LETTERS, map(int,'213956487'))), False),
    ('I×CC=BB; D×D=AG; I×A=FC; D×E=HB; D×B=AC', dict(zip(LETTERS, map(int,'462781953'))), False),
    ('I×I=GD; G×C=ED; I×B=F×D; C×H=GA; H×H=DC', dict(zip(LETTERS, map(int,'319452678'))), False),
    ('E×E=FD; D×D=CG; D×H=A×I; E×C=BA; H×I=G×A', dict(zip(LETTERS, map(int,'658974123'))), False),
    ('F×F=AE; B×CC=II; I×F=GH; B×D=CE; F×C=I×B', dict(zip(LETTERS, map(int,'832719546'))), False),
    ('B×B=GA; C×G=I×B; A×H=I×F; C×E=DA; A×G=I×H', dict(zip(LETTERS, map(int,'648579132'))), False),
    ('F×B×I=G; D×D=AB; E×A=CG; B×H×I=A; A×I=BG', dict(zip(LETTERS, map(int,'815973642'))), False),
]


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def evaluate_equation(equation, values):
    left, right = equation.split('=')

    def product(expression):
        result = 1
        for factor in expression.split('×'):
            result *= int(''.join(str(values[ch]) for ch in factor))
        return result

    return product(left) == product(right)


def variable_order(equations):
    return ''.join(sorted(set(''.join(equations)) & set('ABCDEFGHIJKLMNOPQRSTUVWXYZ')))


def all_solutions(equations):
    found = []
    variables = variable_order(equations)
    for digits in itertools.permutations(range(1, 10), len(variables)):
        values = dict(zip(variables, digits))
        if all(evaluate_equation(eq, values) for eq in equations):
            found.append(values)
    return found


def candidate_counts(equations):
    variables = variable_order(equations)
    remaining = list(itertools.permutations(range(1, 10), len(variables)))
    counts = []
    for equation in equations:
        remaining = [digits for digits in remaining
                     if evaluate_equation(equation, dict(zip(variables, digits)))]
        counts.append(len(remaining))
    return counts


def substitution(equation, values):
    left, right = equation.split('=')

    def side(expression):
        factor_texts = expression.split('×')
        factors = [''.join(str(values[ch]) for ch in factor) for factor in factor_texts]
        return '×'.join(factors), math.prod(int(factor) for factor in factors)

    left_text, left_value = side(left)
    right_text, right_value = side(right)
    assert left_value == right_value
    return f'{left_text}={right_text}={left_value}'


def render_variant_svg(equations, output):
    rows = []
    for i, equation in enumerate(equations):
        y = 42 + i * 40
        rows.append(f'<text x="305" y="{y}" text-anchor="middle">{equation}</text>')
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" width="610" height="225" viewBox="0 0 610 225">'
           '<rect x="1.5" y="1.5" width="607" height="222" fill="#fff" stroke="#191511" stroke-width="3"/>'
           '<g fill="#191511" font-family="serif" font-size="27" font-weight="400">'
           + ''.join(rows) + '</g></svg>')
    output.write_text(svg, encoding='utf-8')


def build_item(variant, equations, values, source):
    answer = values['H']
    counts = candidate_counts(equations)
    variables = variable_order(equations)
    assignment = ', '.join(f'{k}={values[k]}' for k in variables)
    checked_equations = '; '.join(substitution(eq, values) for eq in equations)
    steps = [
        '각 문자는 1부터 9까지의 숫자를 서로 다르게 나타내므로, 아홉 문자에 1부터 9까지를 한 번씩 대응시킵니다.',
        '두 문자가 이어진 수는 십의 자리와 일의 자리를 나타냅니다. 곱셈식마다 왼쪽 값을 계산하고 오른쪽 자릿수와 맞춰 가능한 배치를 줄입니다.',
        '식들을 차례로 함께 확인했을 때 남는 배치 수는 ' + ' → '.join([f'{362880:,}'] + [f'{n:,}' for n in counts]) + '개입니다. 따라서 배치는 하나뿐입니다.',
        f'유일한 배치는 {assignment}입니다. 각 식에 대입하면 {checked_equations}이므로 H={answer}입니다.'
    ]
    figure_src = f'assets/applied5/q27-v{variant}-equations.svg' if not source else 'assets/applied5/q27-source-equations.png'
    return {
        'id': f'applied5-q27-v{variant}', 'genId': 'applied5-q27',
        'sourceSet': 'applied', 'sourceRound': 5, 'sourceNo': 27,
        'variantNo': variant, 'reviewStatus': 'verified',
        'area': '수와 식', 'subarea': '문자와 곱셈식',
        'detailType': '서로 다른 숫자로 나타낸 곱셈식에서 문자 값 찾기',
        'pointBand': '4.2',
        'text': '다음 식에서 각 문자는 1에서 9까지의 숫자를 각각 나타낸다고 할 때, H가 나타내는 숫자를 쓰시오.',
        'asset': {'kind': 'raster' if source else 'svg', 'src': figure_src,
                  'description': ('활용 5회 원문 27번의 식 상자를 원본 PDF에서 픽셀 그대로 잘라 보존한 그림.' if source else '활용 5회 원문 27번과 같은 문자 곱셈식 유형으로 새로 만든 식 그림.'),
                  'width': 610, 'height': 225, 'mimeType': 'image/png' if source else 'image/svg+xml'},
        'answer': str(answer), 'answerParts': [answer], 'answerLabels': ['H의 값'],
        'acceptedAnswers': [str(answer), f'H={answer}'], 'answerContract': 'single-number',
        'solutionSteps': steps, 'solution': ' '.join(steps),
        'learningPoint': '서로 다른 숫자를 문자에 대응시키고 곱셈식의 자리값과 수의 곱을 함께 이용해 문자 값을 찾기',
        'learningLocation': '활용 5회 · 원문 27번 · 서로 다른 숫자로 나타낸 곱셈식',
        'verification': {
            'primaryMethod': '1~9의 순열을 각 문자에 대응하고, 각 곱셈 등식을 순서대로 대조해 가능한 배치를 좁힌다.',
            'independentMethod': '별도 순열 열거로 모든 식을 동시에 만족하는 배치 수와 H 값을 재검산한다.',
            'parameters': {'equations': equations, 'uniqueAssignment': {k: values[k] for k in variables},
                           'candidateCountsAfterEachEquation': counts, 'solutionCount': 1,
                           'answerH': answer, 'distinctDigits': True},
            'independentSuite': 'qa/applied5-q27-independent-validate.py',
            'sourceExamPage': 6, 'sourceExamFile': EXAM.name, 'sourceExamDriveFileId': EXAM_ID,
            'sourceAnswerPage': 27, 'sourceAnswerFile': ANSWER.name, 'sourceAnswerDriveFileId': ANSWER_ID,
            'sourceDrawingCompared': True, 'sourceDrawingPresent': True,
            'variantDrawingType': 'exact-original-crop' if source else 'new-equation-layout-authorized',
            'officialAnswerStatus': ('답안 PDF 27쪽의 손글씨 후보 H=9를 확인하고 순열 전수 대조로 재현했다. 공식 채점표인지는 미확인.' if source else '독립 전수 대조로 유일한 H 값을 확인함.'),
            'studentDifficultyMeasured': False
        },
        'difficultyEvidence': {'basis': 'source-point-band', 'label': '상', 'sourceReasoningPreserved': True,
                               'measuredVariantRate': None, 'estimated': False,
                               'rationale': '활용 5회 27번은 4.2점 배점대이며 활용 난도는 배점대만 적용한다.'}
    }


def main():
    assert len(SYSTEMS) == 9
    assert sha(EXAM) == '5a258dad75459598920ecf5e221db1b4d94dfc5899a2260cf3e7f0b121fe8d2c'
    assert sha(ANSWER) == '6559ed2c3ec8c5a4908c9decaec66dc19f566ef8f672dc02dc47d96dcf9d879e'
    assert PAGE.is_file() and ANSWER_PAGE.is_file()
    page = Image.open(PAGE)
    crop = page.crop(SOURCE_BOX)
    assert crop.size == (610, 225)
    assert ImageChops.difference(crop, Image.open(SOURCE_CROP)).getbbox() is None
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    crop.save(SOURCE_FIGURE)

    items = []
    records = []
    for variant, (equation_text, values, source) in enumerate(SYSTEMS, 1):
        equations = equation_text.split('; ')
        used = set(''.join(equations)) & set(LETTERS + 'K')
        expected_letters = set(LETTERS if not source else 'ABCDEFGHK')
        assert used == expected_letters, (variant, used)
        assert set(values.values()) == set(range(1, 10))
        solutions = all_solutions(equations)
        assert len(solutions) == 1 and solutions[0] == values, (variant, solutions, values)
        counts = candidate_counts(equations)
        assert counts[-1] == 1
        if not source:
            svg = ASSET_DIR / f'q27-v{variant}-equations.svg'
            render_variant_svg(equations, svg)
        item = build_item(variant, equations, values, source)
        items.append(item)
        records.append({'variantNo': variant, 'equations': equations,
                        'uniqueAssignment': values, 'answerH': values['H'],
                        'candidateCountsAfterEachEquation': counts,
                        'solutionCount': len(solutions), 'sourceFigureExactCrop': source})

    data = json.loads(DATA_PATH.read_text())
    index = json.loads(INDEX_PATH.read_text())
    if data['version'] == VERSION:
        data['items'] = [x for x in data['items'] if x['sourceNo'] != 27]
        index['items'] = [x for x in index['items'] if x['sourceNo'] != 27]
        data['pendingSourceNos'] = sorted(set(data['pendingSourceNos'] + [27]))
        index['pendingSourceNos'] = list(data['pendingSourceNos'])
        data['version'] = BASE_VERSION
        index['version'] = BASE_VERSION
        data['reviewSummary'].update({'independentMathCount': 243, 'sourceTypes': 27, 'sourceDrawingCount': 135})
    assert data['version'] == BASE_VERSION
    assert 27 in data['pendingSourceNos'] and not any(x['sourceNo'] == 27 for x in data['items'])
    insert_at = next(i for i, old in enumerate(data['items']) if old['sourceNo'] > 27)
    data['items'][insert_at:insert_at] = items
    data['version'] = VERSION
    data['availableSourceNos'] = sorted(set(data['availableSourceNos'] + [27]))
    data['pendingSourceNos'] = [n for n in data['pendingSourceNos'] if n != 27]
    data['reviewSummary'].update({'independentMathCount': len(data['items']),
                                  'sourceTypes': len(set(x['sourceNo'] for x in data['items'])),
                                  'variantsPerType': 9,
                                  'sourceDrawingCount': data['reviewSummary']['sourceDrawingCount'] + 9})
    index['items'].append({'sourceNo': 27, 'genId': 'applied5-q27', 'area': '수와 식',
                           'subarea': '문자와 곱셈식',
                           'detailType': '서로 다른 숫자로 나타낸 곱셈식에서 문자 값 찾기',
                           'pointBand': '2.7', 'reviewStatus': 'verified', 'variantCount': 9})
    index['items'].sort(key=lambda x: x['sourceNo'])
    index.update({'version': VERSION, 'itemCount': len(data['items']),
                  'pendingSourceNos': list(data['pendingSourceNos'])})
    assert len(data['items']) == index['itemCount'] == 252
    DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    INDEX_PATH.write_text(json.dumps(index, ensure_ascii=False, indent=2) + '\n')
    proof = {'result': 'PASS', 'sourceExam': {'file': EXAM.name, 'driveFileId': EXAM_ID,
             'sha256': sha(EXAM), 'page': 6, 'questionNo': 27, 'directVisualReview': True,
             'directFigureCrop': str(SOURCE_FIGURE.relative_to(ROOT)), 'sourceBox': SOURCE_BOX,
             'sourceFigureExactPixels': True},
             'sourceAnswer': {'file': ANSWER.name, 'driveFileId': ANSWER_ID,
             'sha256': sha(ANSWER), 'page': 27, 'directVisualReview': True,
             'handwrittenCandidateH': 9, 'officialKeyConfirmed': False},
             'variants': records, 'userApprovedVariantDrawings': True,
             'newSourceTypes': 0, 'variantCount': 9, 'dataVersion': VERSION}
    (WORK / 'q27-independent-math-r21.json').write_text(json.dumps(proof, ensure_ascii=False, indent=2) + '\n')
    print('Built Applied5 Q27 r21: 9 verified distinct-digit multiplication puzzles; all 9! assignments checked per item; original source figure preserved for v1.')


if __name__ == '__main__':
    main()

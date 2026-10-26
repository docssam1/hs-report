#!/usr/bin/env python3
"""Extend only the existing Applied 7 Q28 price-and-remainder type."""
from fractions import Fraction
import hashlib, json, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / '.private-work/hw-expansion-20261023/hw7'
DATA_PATH = ROOT / 'bank/data/applied7-expanded.json'
INDEX_PATH = ROOT / 'bank/data/applied7-expanded-index.json'
EXAM = ROOT / 'materials/초등과정 대비 실전 모의고사활용 7회.pdf'
ANSWER = WORK / 'source-review/applied7-answer-candidate.pdf'
PDFTOTEXT = Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')
DRIVE_EXAM_ID = '1qtshEh5Zkv3X4DMMcXHjWw1kRgibbvxf'
DRIVE_ANSWER_ID = '1imx0uw4PlbtETIFf9WVgENNswLZsFdsK'

def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def read_page(pdf, page):
    return subprocess.check_output([str(PDFTOTEXT), '-f', str(page), '-l', str(page), '-layout', str(pdf), '-'], text=True, errors='replace')

exam_text = read_page(EXAM, 6)
answer_text = read_page(ANSWER, 6)
compact_exam = ''.join(exam_text.split())
compact_answer = ''.join(answer_text.split())
for token in ['6자루', '9권', '36개', '지우개를12개사고']:
    assert token in compact_exam, token
for token in ['6자루', '9권', '36개']:
    # The answer copy's printed stem says 연필 in two places; the teacher marks
    # the correction to 지우개 by hand on the rendered original p6.
    assert token in compact_answer, token

# (pens affordable, notebooks affordable, erasers affordable, erasers bought
# first, equal bundles after that, final erasers affordable from the remainder)
CASES = [
    (8, 12, 72, 15, 3, 9),
    (6, 8, 48, 15, 2, 3),
    (6, 10, 60, 21, 2, 5),
    (5, 12, 60, 17, 2, 7),
    (8, 9, 72, 7, 3, 11),
    (7, 12, 84, 11, 3, 13),
    (9, 10, 90, 4, 4, 6),
    (10, 12, 120, 11, 4, 17),
    (6, 15, 90, 5, 3, 19),
]

def verify_case(pens, books, erasers, first, bundles, remainder):
    assert erasers % pens == 0 and erasers % books == 0
    pen_price = erasers // pens
    book_price = erasers // books
    bundle_cost = pen_price + book_price + 1
    left = erasers - first
    assert left == bundles * bundle_cost + remainder
    assert 0 <= remainder < bundle_cost
    assert first > 0 and bundles > 0
    # Independent rational check: express all costs as fractions of the full
    # budget and prove the same quotient/remainder exactly.
    remaining_budget = Fraction(erasers - first, erasers)
    bundle_budget = Fraction(1, pens) + Fraction(1, books) + Fraction(1, erasers)
    q, rem = divmod(remaining_budget, bundle_budget)
    assert q == bundles
    assert rem == Fraction(remainder, erasers)
    return pen_price, book_price, bundle_cost, left

items = []
proof = []
for variant, case in enumerate(CASES, 1):
    pens, books, erasers, first, bundles, remainder = case
    pen_price, book_price, bundle_cost, left = verify_case(*case)
    text = (
        f'민수는 돈이 모자라지도 남지도 않게 샤프만 사면 {pens}자루, 공책만 사면 {books}권, '
        f'지우개만 사면 {erasers}개를 살 수 있습니다. 지우개를 먼저 {first}개 산 뒤, '
        '남은 돈으로 샤프와 공책과 지우개를 같은 개수씩 최대한 사고, '
        '그 뒤 남은 돈으로 지우개만 더 산다면 지우개를 몇 개 더 살 수 있습니까?'
    )
    steps = [
        f'전체 돈은 지우개 {erasers}개의 값과 같습니다. 따라서 샤프 한 자루 값은 지우개 {erasers}개 값의 {Fraction(1,pens)}이고, 공책 한 권 값은 지우개 {erasers}개 값의 {Fraction(1,books)}입니다.',
        f'샤프 한 자루, 공책 한 권, 지우개 한 개를 함께 사는 데 드는 돈은 지우개 {pen_price}+{book_price}+1={bundle_cost}개 값입니다. 먼저 지우개 {first}개를 사고 나면 {erasers}−{first}={left}개 값이 남습니다.',
        f'같은 개수의 세 물건 묶음을 최대한 사면 {left}÷{bundle_cost}에서 몫은 {bundles}, 나머지는 {remainder}입니다. 남은 돈은 지우개 {remainder}개 값이므로 지우개를 {remainder}개 더 살 수 있습니다.',
        f'확인: 지우개 {first}개 값에 세 물건 묶음 {bundles}개의 값 {bundles}×{bundle_cost}, 지우개 {remainder}개 값을 더하면 {first}+{bundles}×{bundle_cost}+{remainder}={erasers}개 값으로 전체 돈과 같습니다.'
    ]
    item = {
        'id': f'applied7-q28-v{variant}', 'genId': 'applied7-q28', 'sourceSet': 'applied', 'sourceRound': 7,
        'sourceNo': 28, 'variantNo': variant, 'reviewStatus': 'verified',
        'area': '수와 식', 'subarea': '물건의 단위 가격과 남은 돈',
        'detailType': '기준 금액으로 단가를 구해 같은 묶음 구매 뒤 남은 돈 계산하기',
        'pointBand': '4.2', 'text': text,
        'answer': str(remainder), 'answerParts': [remainder], 'answerLabels': ['남은 돈으로 더 살 수 있는 지우개 수'],
        'acceptedAnswers': [str(remainder), f'{remainder}개'], 'answerContract': 'single-number',
        'solutionSteps': steps, 'solution': ' '.join(steps),
        'learningPoint': '전체 금액을 물건별 단가로 바꾸고, 같은 수량의 묶음 가격을 뺀 나머지를 계산하기',
        'learningLocation': '활용 7회 · 원문 28번 · 물건 가격과 남은 돈',
        'verification': {
            'primaryMethod': '전체 돈을 지우개 단가의 배수로 나타내고, 같은 수량 묶음 가격으로 나누어 몫과 나머지를 구한다.',
            'independentMethod': '전체 예산 대비 가격을 분수로 나타내어 묶음 구매 횟수와 남은 금액을 정확한 유리수 연산으로 확인한다.',
            'parameters': {'pensAffordable': pens, 'notebooksAffordable': books, 'erasersAffordable': erasers,
                'erasersBoughtFirst': first, 'penUnitPriceInEraserUnits': pen_price,
                'notebookUnitPriceInEraserUnits': book_price, 'bundleCostInEraserUnits': bundle_cost,
                'maximumEqualBundles': bundles, 'remainingEraserUnits': remainder},
            'independentSuite': 'qa/applied7-q28-independent-validate.py', 'sourceExamPage': 6,
            'sourceExamFile': EXAM.name, 'sourceAnswerPage': 6, 'sourceAnswerFile': '초등 선발 모의고사 특강 7회 답안.pdf',
            'sourceDrawingCompared': False, 'sourceDrawingPresent': False, 'variantUsesSourceDrawing': False,
            'studentDifficultyMeasured': False
        },
        'difficultyEvidence': {'basis': 'source-point-band', 'label': '상', 'sourceReasoningPreserved': True,
            'measuredVariantRate': None, 'estimated': False,
            'rationale': '활용 7회 원문 28번은 23~30번의 4.2점 배점대다. 활용 난도는 배점대만 적용한다.'}
    }
    items.append(item)
    proof.append({'variant': variant, 'case': {'pens': pens, 'books': books, 'erasers': erasers,
        'buyFirst': first, 'bundles': bundles, 'answer': remainder}, 'pricesInEraserUnits': [pen_price, book_price, 1],
        'bundleCost': bundle_cost, 'remainingBeforeBundles': left, 'directRemainder': left - bundles * bundle_cost,
        'fractionCheck': {'remainingBudget': str(Fraction(erasers-first, erasers)),
            'bundleBudget': str(Fraction(1,pens)+Fraction(1,books)+Fraction(1,erasers)),
            'bundleCount': bundles, 'remainderInEraserUnits': remainder}})

data = json.loads(DATA_PATH.read_text())
index = json.loads(INDEX_PATH.read_text())
assert data['sourceRound'] == 7
if 28 in data['availableSourceNos']:
    data['items'] = [x for x in data['items'] if x['sourceNo'] != 28]
    index['items'] = [x for x in index['items'] if x['sourceNo'] != 28]
    data['availableSourceNos'].remove(28)
data['items'].extend(items)
data['items'].sort(key=lambda x: (x['sourceNo'], x['variantNo']))
data['availableSourceNos'] = sorted(set(data['availableSourceNos'] + [28]))
data['pendingSourceNos'] = [n for n in range(1,31) if n not in data['availableSourceNos']]
data['itemCount'] = len(data['items'])
data['version'] = '20261025-applied7-expansion-' + '-'.join(f'q{no:02d}' for no in data['availableSourceNos']) + '-r23'
index['version'] = data['version']; index['itemCount'] = data['itemCount']; index['pendingSourceNos'] = data['pendingSourceNos']
index['items'].append({'sourceNo':28,'genId':'applied7-q28','area':'수와 식','subarea':'물건의 단위 가격과 남은 돈',
    'detailType':'기준 금액으로 단가를 구해 같은 묶음 구매 뒤 남은 돈 계산하기','pointBand':'4.2',
    'reviewStatus':'verified','variantCount':9})
index['items'].sort(key=lambda x:x['sourceNo'])
DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
INDEX_PATH.write_text(json.dumps(index, ensure_ascii=False, indent=2) + '\n')

review = {
    'sourceExam': {'name':EXAM.name,'driveId':DRIVE_EXAM_ID,'sha256':sha(EXAM),'questionPage':6,'questionNumber':28,
        'questionText':'The budget buys 6 pens, 9 notebooks, or 36 erasers. After buying 12 erasers, use the remaining money for equal counts of pens, notebooks, and erasers; determine how many more erasers the leftover money buys.',
        'sourceDrawingPresent':False},
    'sourceAnswer': {'name':'초등 선발 모의고사 특강 7회 답안.pdf','driveId':DRIVE_ANSWER_ID,'sha256':sha(ANSWER),
        'answerPage':6,'questionNumber':28,'pageMatch':'Rendered answer p6 contains the same Q25-Q28 layout and the Q28 printed stem; teacher handwriting corrects the answer copy wording from 연필 to 지우개.',
        'printedAnswerBox':'handwritten mark reads 2개','independentSolution':{'budgetInEraserUnits':36,'firstPurchase':12,
            'penPrice':6,'notebookPrice':4,'eraserPrice':1,'equalBundleCost':11,'maximumEqualBundles':2,'leftover':2}},
    'sourceTypeAlreadyPresent':True,'newSourceTypesAdded':0,'directOriginalExamQuestionAndAnswerPagesReviewed':True,
    'sourceWordingDifference':'The answer copy p6 prints 연필 in two places where the exam p6 says 지우개; the teacher marks a handwritten correction to 지우개, and the numeric working follows 36−12−11−11=2.',
    'sourceOriginalNumbers':{'pensAffordable':6,'notebooksAffordable':9,'erasersAffordable':36,'erasersBoughtFirst':12},
    'sourceAnswerUniqueByIndependentCalculation':True,'variantCount':9,'variants':proof,'allUseSameOriginalSourceType':True,
    'dataVersion':data['version']}
(WORK/'q28-source-answer-review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
print(f"Built Applied7 Q28: 9 variants of existing price-and-remainder type; {data['itemCount']} total; pending {data['pendingSourceNos']}; new source types 0.")

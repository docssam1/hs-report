#!/usr/bin/env python3
"""Independently verify the source and variants for Applied 7 Q29."""
import hashlib, json, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / '.private-work/hw-expansion-20261023/hw7'
DATA = json.loads((ROOT / 'bank/data/applied7-expanded.json').read_text())
INDEX = json.loads((ROOT / 'bank/data/applied7-expanded-index.json').read_text())
REVIEW = json.loads((WORK / 'q29-source-answer-review.json').read_text())
EXAM = ROOT / 'materials/초등과정 대비 실전 모의고사활용 7회.pdf'
ANSWER = Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf')
PDFTOTEXT = Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

assert sha(EXAM) == REVIEW['sourceExam']['sha256']
assert sha(ANSWER) == REVIEW['sourceAnswer']['sha256']
exam_text = subprocess.check_output([str(PDFTOTEXT), '-f', '7', '-l', '7', '-layout', str(EXAM), '-'], text=True, errors='replace')
answer_text = subprocess.check_output([str(PDFTOTEXT), '-f', '7', '-l', '7', '-layout', str(ANSWER), '-'], text=True, errors='replace')
assert '10자리의 곱' in exam_text and '각 자리의 숫자를 모두 더하면' in exam_text
assert '10자리의 곱' in answer_text and '각 자리의 숫자를 모두 더하면' in answer_text
assert REVIEW['directPageImagesCompared'] and REVIEW['sourceAndAnswerMatch']
assert REVIEW['sourceTypeAlreadyPresent'] and REVIEW['newSourceTypesAdded'] == 0
assert REVIEW['sourceAnswer']['teacherMarkedAnswer'] == 90
source_product = int('7'*10) * int('9'*10)
assert source_product == 77777777762222222223 and sum(map(int, str(source_product))) == 90

items = [x for x in DATA['items'] if x['sourceNo'] == 29]
assert len(items) == 9
proof = []
for variant, item in enumerate(items, 1):
    p = item['verification']['parameters']; n = p['repeatDigits']
    assert item['id'] == f'applied7-q29-v{variant}' and n == variant
    assert p['leftNumber'] == '7'*n and p['rightNumber'] == '9'*n
    product = int(p['leftNumber']) * int(p['rightNumber'])
    assert str(product) == p['product']
    assert sum(map(int, str(product))) == p['digitSum'] == 9*n
    if n > 1:
        assert str(product) == '7'*(n-1)+'6'+'2'*(n-1)+'3'
    assert item['answer'] == str(9*n) and item['answerParts'] == [9*n]
    assert item['pointBand'] == '4.2' and item['difficultyEvidence']['label'] == '상'
    proof.append({'id': item['id'], 'repeatDigits': n, 'product': str(product), 'digitSum': 9*n, 'directIntegerCheck': True, 'patternCheck': True})

assert DATA['version'].endswith('q07-q09-q10-q11-q12-q13-q14-q15-q16-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r26')
assert DATA['availableSourceNos'] == [2,3,4,5,6,7,9,10,11,12,13,14,15,16,18,20,21,22,23,24,25,26,27,28,29,30]
assert DATA['itemCount'] == 234 and INDEX['itemCount'] == 234
assert [x['sourceNo'] for x in INDEX['items']] == DATA['availableSourceNos']
assert len(DATA['pendingSourceNos']) ==4 and 29 not in DATA['pendingSourceNos'] and 30 not in DATA['pendingSourceNos']
result = {'sourceExamSha256': sha(EXAM), 'sourceAnswerSha256': sha(ANSWER), 'sourceQuestion': 29,
          'teacherAnswer': 90, 'teacherAnswerIndependentlyRecomputed': True,
          'directExamAndAnswerPageImagesCompared': True, 'newSourceTypesAdded': 0,
          'variantCount': 9, 'allVariantsUseExistingSourceType': True, 'variants': proof,
          'dataSha256': sha(ROOT/'bank/data/applied7-expanded.json'), 'passed': True}
(WORK/'q29-independent-math.json').write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n')
print('PASS Applied7 Q29: source answer 90; 9 repeated-digit products independently multiplied and digit-summed; new source types 0')

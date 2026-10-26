#!/usr/bin/env python3
"""Extend only the existing Applied 7 Q25 diagonal number-arrangement type."""
import hashlib, json, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / '.private-work/hw-expansion-20261023/hw7'
DATA_PATH = ROOT / 'bank/data/applied7-expanded.json'
INDEX_PATH = ROOT / 'bank/data/applied7-expanded-index.json'
EXAM = ROOT / 'materials/초등과정 대비 실전 모의고사활용 7회.pdf'
ANSWER = Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf')
ASSET = ROOT / 'bank/assets/applied7/q25-number-arrangement-original.png'
PDFTOTEXT = Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def locate_by_diagonal_scan(n):
    start = 1
    d = 1
    while True:
        length = d
        if start <= n < start + length:
            k = n - start + 1
            if d % 2:
                return d - k + 1, k, d, k
            return k, d - k + 1, d, k
        start += length
        d += 1

def locate_by_triangular_bounds(n):
    lo, hi = 1, 1
    while hi * (hi + 1) // 2 < n:
        hi *= 2
    while lo < hi:
        mid = (lo + hi) // 2
        if mid * (mid + 1) // 2 >= n:
            hi = mid
        else:
            lo = mid + 1
    d = lo
    previous = (d - 1) * d // 2
    k = n - previous
    row, col = (d-k+1,k) if d % 2 else (k,d-k+1)
    return row, col, d, k

exam_text = subprocess.check_output([str(PDFTOTEXT), '-f', '6', '-l', '6', '-layout', str(EXAM), '-'], text=True, errors='replace')
answer_text = subprocess.check_output([str(PDFTOTEXT), '-f', '6', '-l', '6', '-layout', str(ANSWER), '-'], text=True, errors='replace')
assert '자연수를 아래와 같이 배열합니다.' in exam_text and '2009는 몇 번째 줄에 몇 번에 있습니까?' in exam_text
assert '자연수를 아래와 같이 배열합니다.' in answer_text and '2009는 몇 번째 줄에 몇 번에 있습니까?' in answer_text
assert ASSET.is_file() and ASSET.stat().st_size > 10000

targets = [1950, 1953, 1954, 1960, 1990, 2008, 2016, 2017, 2024]
items, proof = [], []
for variant, n in enumerate(targets, 1):
    row, col, d, k = locate_by_diagonal_scan(n)
    assert (row, col, d, k) == locate_by_triangular_bounds(n)
    text = f'자연수를 아래와 같이 배열합니다. 이 배열에서 3은 2번째 줄 1번째에 있으며 13은 3번째 줄 3번째에 있습니다. {n}은 몇 번째 줄에 몇 번째에 있습니까?'
    steps = [
        f'{d-1}번째 대각선까지 놓인 수는 {d-1}×{d}÷2={d*(d-1)//2}개입니다.',
        f'{n}은 {d}번째 대각선의 {k}번째 수입니다.',
        (f'{d}는 홀수이므로 아래쪽부터 위쪽으로 올라가며, {n}은 {row}번째 줄 {col}번째에 있습니다.' if d % 2 else f'{d}는 짝수이므로 위쪽부터 아래쪽으로 내려가며, {n}은 {row}번째 줄 {col}번째에 있습니다.'),
        f'확인하면 {d*(d-1)//2}+{k}={n}입니다.'
    ]
    item = {
        'id': f'applied7-q25-v{variant}', 'genId': 'applied7-q25', 'sourceSet': 'applied',
        'sourceRound': 7, 'sourceNo': 25, 'variantNo': variant, 'reviewStatus': 'verified',
        'area': '수와 식', 'subarea': '자연수의 배열',
        'detailType': '대각선으로 번갈아 배열한 자연수의 줄과 위치 찾기',
        'pointBand': '4.2', 'text': text,
        'asset': {'kind':'raster','src':'assets/applied7/q25-number-arrangement-original.png','description':'활용 7회 원문 25번의 자연수 배열 그림을 그대로 사용'},
        'answer': f'{row}, {col}', 'answerParts': [row, col], 'answerLabels': ['줄', '번째'],
        'acceptedAnswers': [str(row), str(col)], 'answerContract':'ordered-parts',
        'solutionSteps':steps, 'solution':' '.join(steps),
        'learningPoint':'대각선의 누적 개수로 대각선 번호와 대각선 안의 순서를 찾고, 홀짝에 따른 방향으로 좌표를 정한다',
        'learningLocation':'활용 7회 · 원문 25번 · 대각선 자연수 배열의 위치',
        'verification': {
            'primaryMethod':'대각선 길이를 차례로 더해 목표 수가 속한 대각선과 내부 순서를 찾는다.',
            'independentMethod':'삼각수의 경계를 이분 탐색으로 찾고 대각선 홀짝에 따른 좌표를 계산한다.',
            'parameters':{'target':n,'diagonal':d,'offset':k,'row':row,'column':col,'numbersBeforeDiagonal':d*(d-1)//2},
            'independentSuite':'qa/applied7-q25-independent-validate.py',
            'sourceExamPage':6,'sourceExamFile':EXAM.name,'sourceAnswerPage':6,
            'sourceDrawingCompared':True,'sourceDrawingPresent':True,'variantUsesSourceDrawing':True,
            'sourceDrawingAssetSha256':sha(ASSET),'studentDifficultyMeasured':False
        },
        'difficultyEvidence':{'basis':'source-point-band','label':'상','sourceReasoningPreserved':True,'measuredVariantRate':None,
                              'estimated':False,'rationale':'활용 7회 원문 25번은 23~30번의 4.2점 배점대다. 활용 난도는 배점대만 적용한다.'}
    }
    items.append(item)
    proof.append({'variant':variant,'target':n,'diagonal':d,'offset':k,'row':row,'column':col})

source_row,source_col,source_d,source_k=locate_by_diagonal_scan(2009)
assert (source_row,source_col,source_d,source_k)==(8,56,63,56)
data=json.loads(DATA_PATH.read_text()); assert data['sourceRound']==7 and 25 not in data['availableSourceNos']
data['items'].extend(items);data['items'].sort(key=lambda x:(x['sourceNo'],x['variantNo']))
data['availableSourceNos']=sorted(set(data['availableSourceNos']+[25]));data['pendingSourceNos']=[n for n in range(1,31) if n not in data['availableSourceNos']];data['itemCount']=len(data['items'])
data['version']='20261024-applied7-expansion-q02-q03-q04-q05-q06-q10-q12-q16-q18-q20-q22-q25-q27-q29-r13'
review={
  'sourceExam':{'name':EXAM.name,'driveId':'1qtshEh5Zkv3X4DMMcXHjWw1kRgibbvxf','bytes':EXAM.stat().st_size,'sha256':sha(EXAM),'questionPage':6,'questionNumber':25,'sourceQuestion':'자연수를 대각선으로 번갈아 배열하고 2009의 줄과 위치 찾기','figurePresent':True},
  'sourceAnswer':{'name':ANSWER.name,'driveId':'1zIN-XzODa-_T2AUjGbmuzHSPvCdVb2_j','bytes':ANSWER.stat().st_size,'sha256':sha(ANSWER),'answerPage':6,'questionNumber':25,'teacherMarkedAnswer':[8,56],'evidence':'문제 PDF 6쪽 배열 도식과 답안 PDF 6쪽의 1953개 이전 수, 56번째 대각선 위치 및 교사 답 (8,56)을 직접 대조했다.'},
  'directPageImagesCompared':True,'sourceAndAnswerMatch':True,'sourceTypeAlreadyPresent':True,'newSourceTypesAdded':0,
  'sourceDrawing':{'action':'원문 PDF 6쪽의 배열 박스를 원본 픽셀 그대로 크롭해 모든 변형에 재사용','asset':'bank/assets/applied7/q25-number-arrangement-original.png','sha256':sha(ASSET)},
  'sourceAnswerIndependentCheck':{'target':2009,'diagonal':source_d,'offset':source_k,'row':source_row,'column':source_col},
  'newVariants':9,'allVariantsSameSourceType':True,'variants':proof
}
(WORK/'q25-source-answer-review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
idx=json.loads(INDEX_PATH.read_text());idx['version']=data['version'];idx['itemCount']=data['itemCount'];idx['pendingSourceNos']=data['pendingSourceNos']
idx['items'].append({'sourceNo':25,'genId':'applied7-q25','area':'수와 식','subarea':'자연수의 배열','detailType':'대각선으로 번갈아 배열한 자연수의 줄과 위치 찾기','pointBand':'4.2','reviewStatus':'verified','variantCount':9})
idx['items'].sort(key=lambda x:x['sourceNo'])
DATA_PATH.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');INDEX_PATH.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n')
print('Built Applied7 Q25: 9 variants of the existing diagonal-number-location type; original diagram reused unchanged; new source types 0.')

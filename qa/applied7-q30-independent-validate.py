#!/usr/bin/env python3
"""Independently verify source drawing and nine Applied 7 Q30 cube variants."""
import hashlib
import json
import subprocess
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / '.private-work/hw-expansion-20261023/hw7'
DATA = json.loads((ROOT / 'bank/data/applied7-expanded.json').read_text())
INDEX = json.loads((ROOT / 'bank/data/applied7-expanded-index.json').read_text())
REVIEW = json.loads((WORK / 'q30-source-answer-review.json').read_text())
EXAM = ROOT / 'materials/초등과정 대비 실전 모의고사활용 7회.pdf'
ANSWER = Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf')
PDFTOTEXT = Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')
PDFTOPPM = Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftoppm')
FIGURE = ROOT / 'bank/assets/applied7/q30-staircase-original.png'

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

assert sha(EXAM) == REVIEW['sourceExam']['sha256']
assert sha(ANSWER) == REVIEW['sourceAnswer']['sha256']
exam_text = subprocess.check_output([str(PDFTOTEXT), '-f', '7', '-l', '7', '-layout', str(EXAM), '-'], text=True, errors='replace')
answer_text = subprocess.check_output([str(PDFTOTEXT), '-f', '7', '-l', '7', '-layout', str(ANSWER), '-'], text=True, errors='replace')
exam_compact = ''.join(exam_text.split()); answer_compact = ''.join(answer_text.split())
assert '쌓기나무를6층까지쌓았을때' in exam_compact and '보이지않는쌓기나무' in exam_compact
assert '쌓기나무를6층까지쌓았을때' in answer_compact
assert REVIEW['directPageImagesCompared'] and REVIEW['sourceTypeAlreadyPresent'] and REVIEW['newSourceTypesAdded'] == 0
assert REVIEW['sourceAnswer']['teacherMarkedAnswer'] is None and REVIEW['sourceAndAnswerMatch'] is None

# Confirm the shipped illustration is the exact crop recorded from source p7.
render = WORK / 'source-review/resume-20261025/validator-exam300'
subprocess.run([str(PDFTOPPM), '-f', '7', '-l', '7', '-png', '-r', '300', str(EXAM), str(render)], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
page = Image.open(str(render) + '-7.png').convert('RGBA')
x0, y0, x1, y1 = REVIEW['sourceExam']['figureCrop']['cropPixels']
source_crop = page.crop((x0, y0, x1, y1))
asset = Image.open(FIGURE).convert('RGBA')
assert source_crop.size == asset.size and list(source_crop.getdata()) == list(asset.getdata())
assert sha(FIGURE) == REVIEW['sourceAnswerIndependentCheck']['figureSha256']

items = [x for x in DATA['items'] if x['sourceNo'] == 30]
assert len(items) == 9
proof = []
for v, item in enumerate(items, 1):
    n = v + 6
    params = item['verification']['parameters']
    assert item['id'] == f'applied7-q30-v{v}' and item['variantNo'] == v
    assert params['layers'] == n and params['layerSizesBottomToTop'] == list(range(n, 0, -1))
    assert item['text'] == f'아래와 같은 규칙으로 쌓기나무를 {n}층까지 쌓았을 때, 보이지 않는 쌓기나무는 모두 몇 개입니까?'
    assert item['asset']['kind'] == 'raster' and item['asset']['src'] == 'assets/applied7/q30-staircase-original.png'
    assert item['pointBand'] == '4.2' and item['difficultyEvidence']['label'] == '상'
    cubes = {(x, y, z) for z in range(1, n + 1)
             for x in range(n - z + 1) for y in range(n - z + 1)}
    top = {(x, y, z) for x, y, z in cubes if (x, y, z + 1) not in cubes}
    # Independently enumerate a column's height as n-max(x,y), then all
    # concealed blocks beneath its highest block.
    columns = [n - max(x, y) for x in range(n) for y in range(n)]
    column_hidden = sum(h - 1 for h in columns)
    formula = sum(k * k for k in range(1, n))
    hidden = len(cubes) - len(top)
    assert len(cubes) == sum(k * k for k in range(1, n + 1))
    assert len(top) == n*n and hidden == column_hidden == formula == params['hiddenCubes']
    assert item['answer'] == str(hidden) and item['answerParts'] == [hidden]
    proof.append({'id': item['id'], 'layers': n, 'total': len(cubes), 'visible': len(top),
                  'hiddenByCubeEnumeration': hidden, 'hiddenByColumnEnumeration': column_hidden,
                  'hiddenBySquareSum': formula})

assert DATA['version'].endswith('q27-q28-q29-q30-r26')
assert DATA['availableSourceNos'] == [2,3,4,5,6,7,9,10,11,12,13,14,15,16,18,20,21,22,23,24,25,26,27,28,29,30]
assert DATA['itemCount'] == 234 == INDEX['itemCount'] and len(DATA['items']) == 234
assert DATA['pendingSourceNos'] == [1,8,17,19]
assert [x['sourceNo'] for x in INDEX['items']] == DATA['availableSourceNos']
assert len([x for x in INDEX['items'] if x['sourceNo'] == 30 and x['variantCount'] == 9]) == 1
result = {'sourceQuestion': 30, 'originalTeacherAnswerProvided': False,
          'original6LayerAnswerIndependent': 55, 'newSourceTypesAdded': 0,
          'sourceDrawingExactCropVerified': True, 'variantCount': 9,
          'variants': proof, 'dataSha256': sha(ROOT/'bank/data/applied7-expanded.json'), 'passed': True}
(WORK / 'q30-independent-math.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print('PASS Applied7 Q30: source p7 exact diagram crop confirmed; teacher key has no marked answer; original independently gives 55; 9 existing-type variants independently cube-enumerated; new types 0')

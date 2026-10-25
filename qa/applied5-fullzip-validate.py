#!/usr/bin/env python3
"""Validate the complete Applied 5 pool ZIP against r23 bank data."""
import csv
import hashlib
import io
import json
import re
import zipfile
from pathlib import Path
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / '.private-work/hw-expansion-20261023/hw5/output-qa-r23'
ZIP = WORK / 'selected-270.zip'
DATA_PATH = ROOT / 'bank/data/applied5-expanded.json'
INDEX_PATH = ROOT / 'bank/data/applied5-expanded-index.json'
DATA = json.loads(DATA_PATH.read_text())
INDEX = json.loads(INDEX_PATH.read_text())
ITEMS = DATA['items']
EXPECTED = {'문제.pdf', '답안과상세풀이.pdf', '문제.html', '답안과상세풀이.html',
            '빠른정답.csv', '문항목록.json', '검수기록.json'}

assert INDEX['itemCount'] == len(ITEMS) == 270
assert DATA['version'] == INDEX['version']
assert len(DATA['availableSourceNos']) == 30
assert DATA['pendingSourceNos'] == INDEX['pendingSourceNos'] == []

with zipfile.ZipFile(ZIP) as z:
    assert set(z.namelist()) == EXPECTED
    listing = json.loads(z.read('문항목록.json'))
    review = json.loads(z.read('검수기록.json'))
    ids = [x['id'] for x in listing['items']]
    assert listing['version'] == review['version'] == DATA['version']
    assert listing['count'] == review['count'] == len(ids) == 270
    assert len(set(ids)) == 270 and ids == [x['id'] for x in ITEMS]
    assert all(sum(x['sourceNo'] == n for x in listing['items']) == 9
               for n in DATA['availableSourceNos'])
    assert review['selectedIds'] == ids and review['sourceGradeMutation'] is False
    questions = z.read('문제.html').decode('utf-8')
    solutions = z.read('답안과상세풀이.html').decode('utf-8')
    assert all(x['id'] in questions and x['id'] in solutions for x in ITEMS)
    assert all(x['answer'] in solutions for x in ITEMS)
    assert all(x['learningLocation'] in solutions and x['learningPoint'] in solutions
               for x in ITEMS)
    images = re.findall(r'<img\b[^>]*\bsrc=["\']([^"\']+)', questions)
    assert len(images) == sum(bool(x.get('asset')) for x in ITEMS) == 153
    assert all(src.startswith(('data:image/png;base64,', 'data:image/svg+xml;base64,'))
               for src in images)
    quick_rows = list(csv.reader(io.StringIO(z.read('빠른정답.csv').decode('utf-8-sig'))))
    assert len(quick_rows) == 271
    qpdf = PdfReader(io.BytesIO(z.read('문제.pdf')))
    apdf = PdfReader(io.BytesIO(z.read('답안과상세풀이.pdf')))
    assert review['questionPdfPages'] == len(qpdf.pages) == 65
    assert review['solutionPdfPages'] == len(apdf.pages) == 104
    for page in [*qpdf.pages, *apdf.pages]:
        assert float(page.mediabox.width) > 590 and float(page.mediabox.height) > 830
        resources = page['/Resources'].get_object()['/XObject'].get_object()
        content = page.get_contents().get_data()
        referenced = re.findall(rb'/(I\d+)\s+Do', content)
        assert len(referenced) == 1
        image = resources['/' + referenced[0].decode()].get_object()
        assert image['/Subtype'] == '/Image'
        assert image['/Width'] >= 1000 and image['/Height'] >= 1400

result = {
    'result': 'PASS',
    'zip': str(ZIP.relative_to(ROOT)),
    'bytes': ZIP.stat().st_size,
    'sha256': hashlib.sha256(ZIP.read_bytes()).hexdigest(),
    'dataSha256': hashlib.sha256(DATA_PATH.read_bytes()).hexdigest(),
    'items': 270,
    'sourceTypes': 30,
    'pendingSourceNos': DATA['pendingSourceNos'],
    'embeddedFigures': 153,
    'questionPdfPages': 65,
    'solutionPdfPages': 104,
    'htmlAnswersAndLearningLinksComplete': True,
    'everyPdfPageHasFullPageRender': True,
    'allSevenFilesPresent': True,
}
(WORK / 'fullzip-validation-r23.json').write_text(
    json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(result, ensure_ascii=False))

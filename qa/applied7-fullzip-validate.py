#!/usr/bin/env python3
"""Validate the complete Applied 7 expansion ZIP against the active bank data."""
import csv
import hashlib
import io
import json
import re
import zipfile
from pathlib import Path
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / '.private-work/hw-expansion-20261023/hw7/q01-output-qa-r32'
ZIP = WORK / 'applied7-270-questions-and-solutions-r32.zip'
DATA_PATH = ROOT / 'bank/data/applied7-expanded.json'
DATA = json.loads(DATA_PATH.read_text())
ITEMS = DATA['items']
EXPECTED = {'문제.pdf', '답안과상세풀이.pdf', '문제.html', '답안과상세풀이.html',
            '빠른정답.csv', '문항목록.json', '검수기록.json'}
assert DATA['itemCount'] == len(ITEMS) == 270
assert len({x['sourceNo'] for x in ITEMS}) == 30
assert DATA['pendingSourceNos'] == []

with zipfile.ZipFile(ZIP) as z:
    assert set(z.namelist()) == EXPECTED
    listing = json.loads(z.read('문항목록.json'))
    review = json.loads(z.read('검수기록.json'))
    ids = [x['id'] for x in listing['items']]
    assert listing['count'] == len(ids) == 270 and len(set(ids)) == 270
    assert ids == [x['id'] for x in ITEMS]
    assert sum(x['sourceNo'] == 1 for x in listing['items']) == 9
    assert sum(x['sourceNo'] == 19 for x in listing['items']) == 9
    questions = z.read('문제.html').decode('utf-8')
    solutions = z.read('답안과상세풀이.html').decode('utf-8')
    assert all(x['id'] in questions and x['id'] in solutions for x in ITEMS)
    assert all(x['answer'] in solutions for x in ITEMS)
    assert all(x['learningLocation'] in solutions and x['learningPoint'] in solutions for x in ITEMS)
    images = re.findall(r'<img\b[^>]*\bsrc=["\']([^"\']+)', questions)
    assert len(images) == sum(bool(x.get('asset')) for x in ITEMS) == 108
    assert all(src.startswith(('data:image/png;base64,', 'data:image/svg+xml;base64,')) for src in images)
    quick_rows = list(csv.reader(io.StringIO(z.read('빠른정답.csv').decode('utf-8'))))
    assert len(quick_rows) == 271, len(quick_rows)
    assert review['count'] == 270 and review['selectedIds'] == ids
    qpdf = PdfReader(io.BytesIO(z.read('문제.pdf')))
    apdf = PdfReader(io.BytesIO(z.read('답안과상세풀이.pdf')))
    assert review['questionPdfPages'] == len(qpdf.pages) == 58
    assert review['solutionPdfPages'] == len(apdf.pages) == 89
    for page in [*qpdf.pages, *apdf.pages]:
        assert page.mediabox.width > 590 and page.mediabox.height > 830
        resources = page['/Resources'].get_object()['/XObject'].get_object()
        content = page.get_contents().get_data()
        referenced = re.findall(rb'/(I\d+)\s+Do', content)
        assert len(referenced) == 1
        image = resources['/' + referenced[0].decode()].get_object()
        assert image['/Subtype'] == '/Image'
        assert image['/Width'] >= 1000 and image['/Height'] >= 1400

result = {
    'zipPath': str(ZIP.relative_to(ROOT)),
    'zipBytes': ZIP.stat().st_size,
    'zipSha256': hashlib.sha256(ZIP.read_bytes()).hexdigest(),
    'dataSha256': hashlib.sha256(DATA_PATH.read_bytes()).hexdigest(),
    'itemCount': 270,
    'sourceTypes': 30,
    'pendingSourceNos': [],
    'q19Included': 9,
    'questionPdfPages': 58,
    'solutionPdfPages': 89,
    'embeddedDiagramCount': 108,
    'allHtmlAnswersLearningLinksAndPointsPresent': True,
    'allPdfPagesContainFullPageRenders': True,
    'passed': True,
}
(WORK / 'fullzip-validation.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print('PASS Applied7 full ZIP: 270/270 IDs and answers align; 30 types; Q1 and Q19 nine variants; 108 embedded diagrams; 58 question and 89 detailed-solution pages; all rendered PDF pages are present.')

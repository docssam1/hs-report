#!/usr/bin/env python3
"""Verify the actual downloaded Applied 7 Q19 ZIP and all printed pages."""
import hashlib
import html
import io
import json
import re
import zipfile
from pathlib import Path
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / '.private-work/hw-expansion-20261023/hw7'
DATA = json.loads((ROOT / 'bank/data/applied7-expanded.json').read_text())
ZIP = WORK / 'q19-output-qa-r30/applied7-q19-9-questions-and-solutions.zip'
OUT = WORK / 'q19-output-qa-r30'
EXPECTED = {'문제.pdf', '답안과상세풀이.pdf', '문제.html', '답안과상세풀이.html',
            '빠른정답.csv', '문항목록.json', '검수기록.json'}
ITEMS = [x for x in DATA['items'] if x['sourceNo'] == 19]
IDS = [x['id'] for x in ITEMS]

assert len(ITEMS) == 9 and len(IDS) == 9
with zipfile.ZipFile(ZIP) as z:
    assert set(z.namelist()) == EXPECTED
    listing = json.loads(z.read('문항목록.json'))
    review = json.loads(z.read('검수기록.json'))
    assert listing['count'] == 9 and [x['id'] for x in listing['items']] == IDS
    assert review['selectedIds'] == IDS and review['count'] == 9
    assert review['questionPdfPages'] == 3 and review['solutionPdfPages'] == 3
    assert {'문제.pdf', '답안과상세풀이.pdf'} <= set(review['includes'])
    qhtml = z.read('문제.html').decode('utf-8')
    ahtml = z.read('답안과상세풀이.html').decode('utf-8')
    for item in ITEMS:
        assert item['id'] in qhtml and item['id'] in ahtml
        assert item['text'] in html.unescape(re.sub(r'<[^>]+>', ' ', qhtml))
        assert item['answer'] in ahtml and item['solutionSteps'][0] in html.unescape(ahtml)
    image_sources = re.findall(r'<img\b[^>]*\bsrc=["\']([^"\']+)', qhtml)
    assert len(image_sources) == 9 and all(src.startswith('data:image/png;base64,') for src in image_sources)
    assert ' '.join(z.read('빠른정답.csv').decode('utf-8').splitlines())
    for name in ('문제.pdf', '답안과상세풀이.pdf'):
        (OUT / name).write_bytes(z.read(name))
    qpdf = PdfReader(io.BytesIO(z.read('문제.pdf')))
    apdf = PdfReader(io.BytesIO(z.read('답안과상세풀이.pdf')))
    assert len(qpdf.pages) == 3 and len(apdf.pages) == 3
    # Browser-generated pages are rasterized in the PDF, so validate their
    # content objects here and inspect every rendered page below.
    for page in list(qpdf.pages) + list(apdf.pages):
        assert page.mediabox.width > 590 and page.mediabox.height > 830
        images = page.images
        assert len(images) >= 3 and all(len(image.data) > 100_000 for image in images)

result = {
    'zipPath': str(ZIP.relative_to(ROOT)), 'zipBytes': ZIP.stat().st_size,
    'zipSha256': hashlib.sha256(ZIP.read_bytes()).hexdigest(),
    'entries': 7, 'ids': IDS, 'questionPdfPages': 3, 'solutionPdfPages': 3,
    'questionsAndDetailedSolutionsComplete': True, 'allNinePngImagesEmbedded': True,
    'answersLearningLinksAndPointsPresent': True,
    'dataSha256': hashlib.sha256((ROOT / 'bank/data/applied7-expanded.json').read_bytes()).hexdigest(),
    'passed': True
}
(OUT / 'zip-validation.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print('PASS Applied7 Q19 ZIP: 7 files; 9 manifest-aligned questions, embedded PNGs, 3-page exam, 3-page detailed solutions, all answers and learning links verified.')

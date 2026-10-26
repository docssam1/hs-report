"""Validate selected and whole-round Applied 8 Q11/Q16 ZIP exports."""

from __future__ import annotations

import csv
import base64
import io
import json
import os
import re
import subprocess
import tempfile
import xml.etree.ElementTree as ET
from pathlib import Path
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / 'bank/data/applied8-expanded.json').read_text())
OUT = ROOT / '.private-work/hw-expansion-20261023/hw8'
EXPECTED_FILES = {'문제.pdf', '답안과상세풀이.pdf', '문제.html', '답안과상세풀이.html',
                  '빠른정답.csv', '문항목록.json', '검수기록.json'}


def pdf_pages_and_size(blob):
    with tempfile.NamedTemporaryFile(suffix='.pdf') as f:
        f.write(blob)
        f.flush()
        info = subprocess.check_output(['pdfinfo', f.name], text=True)
    pages = int(re.search(r'^Pages:\s+(\d+)', info, re.M).group(1))
    assert re.search(r'^Page size:\s+595\.2\d* x 841\.8\d* pts \(A4\)', info, re.M)
    return pages


def check_q02_svg_viewports(question_html):
    for variant in (7, 8, 9):
        item_id = f'applied8-q02-v{variant}'
        article = re.search(rf'<article class="question" data-item-id="{item_id}".*?</article>', question_html, re.S)
        assert article, item_id
        match = re.search(r'<img src="data:image/svg\+xml;base64,([^"]+)"', article.group())
        assert match, item_id
        embedded = base64.b64decode(match.group(1))
        source = (ROOT / f'bank/assets/applied8/q2-matchstick-triangles-v{variant}.svg').read_bytes()
        assert embedded == source, item_id
        svg = ET.fromstring(embedded)
        left, top, width, height = map(float, svg.attrib['viewBox'].split())
        for shape in svg:
            tag = shape.tag.rsplit('}', 1)[-1]
            if tag == 'line':
                xs = [float(shape.attrib[k]) for k in ('x1', 'x2')]
                ys = [float(shape.attrib[k]) for k in ('y1', 'y2')]
                pad = float(shape.attrib['stroke-width']) / 2
            elif tag == 'circle':
                xs = [float(shape.attrib['cx'])]
                ys = [float(shape.attrib['cy'])]
                pad = float(shape.attrib['r'])
            else:
                raise AssertionError((item_id, tag))
            assert all(left + pad <= x <= left + width - pad for x in xs), item_id
            assert all(top + pad <= y <= top + height - pad for y in ys), item_id


def check(path, selected):
    assert path.exists() and path.stat().st_size > 1_000_000
    with ZipFile(path) as z:
        assert set(z.namelist()) == EXPECTED_FILES
        assert z.testzip() is None
        manifest = json.loads(z.read('문항목록.json'))
        audit = json.loads(z.read('검수기록.json'))
        assert manifest['version'] == audit['version'] == DATA['version']
        assert manifest['count'] == audit['count'] == len(selected)
        ids = [x['id'] for x in selected]
        assert [x['id'] for x in manifest['items']] == audit['selectedIds'] == ids
        assert len(ids) == len(set(ids))
        assert [x['answer'] for x in manifest['items']] == [x['answer'] for x in selected]
        reader = list(csv.DictReader(io.StringIO(z.read('빠른정답.csv').decode('utf-8-sig'))))
        assert [row['문항ID'] for row in reader] == ids
        assert [row['정답'] for row in reader] == [x['answer'] for x in selected]
        assert audit['sourceGradeMutation'] is False
        q_pages = pdf_pages_and_size(z.read('문제.pdf'))
        a_pages = pdf_pages_and_size(z.read('답안과상세풀이.pdf'))
        assert (q_pages, a_pages) == (audit['questionPdfPages'], audit['solutionPdfPages'])
        assert q_pages >= 3 and a_pages >= 9
        q_html, a_html = z.read('문제.html').decode(), z.read('답안과상세풀이.html').decode()
        assert all(x['id'] in q_html and x['id'] in a_html for x in selected)
        if len(selected) == DATA['itemCount']:
            check_q02_svg_viewports(q_html)
        print(path.name, len(ids), q_pages, a_pages, path.stat().st_size)


for no in (11, 16):
    items = [x for x in DATA['items'] if x['sourceNo'] == no]
    check(OUT / f'q{no}-output-qa-r1/applied8-q{no}.zip', items)
check(Path(os.environ['GFIELD_FULL_ZIP']) if 'GFIELD_FULL_ZIP' in os.environ else OUT / 'q11-q16-final-review/applied8-270.zip', DATA['items'])
print('Applied 8 selected/full ZIP validation PASS')

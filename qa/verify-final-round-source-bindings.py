"""Independent, read-only OOXML check of private Final2-4 baseline candidates.

No workbook export, DB connection, approval change, identities or raw rows output.
Use a different reader from the extraction process; score in integer tenths.
"""
import argparse
import json
import pathlib
import re
import zipfile
import xml.etree.ElementTree as ET
from decimal import Decimal

NS = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
REL = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id'


def cells_from_sheet(source, title):
    with zipfile.ZipFile(source) as archive:
        strings = []
        if 'xl/sharedStrings.xml' in archive.namelist():
            tree = ET.fromstring(archive.read('xl/sharedStrings.xml'))
            strings = [''.join(t.text or '' for t in item.findall('.//s:t', NS)) for item in tree]
        book = ET.fromstring(archive.read('xl/workbook.xml'))
        sheet = next(s for s in book.findall('s:sheets/s:sheet', NS) if s.attrib['name'] == title)
        rels = ET.fromstring(archive.read('xl/_rels/workbook.xml.rels'))
        target = next(r.attrib['Target'] for r in rels if r.attrib['Id'] == sheet.attrib[REL])
        target = target.lstrip('/') if target.startswith('/') else 'xl/' + target
        result = {}
        for cell in ET.fromstring(archive.read(target)).findall('.//s:sheetData/s:row/s:c', NS):
            value = cell.find('s:v', NS)
            value = value.text if value is not None else None
            kind = cell.attrib.get('t')
            if kind == 's' and value is not None:
                value = strings[int(value)]
            elif kind == 'inlineStr':
                value = ''.join(t.text or '' for t in cell.findall('.//s:t', NS))
            result[cell.attrib['r']] = value
        return result


def col(number):
    result = ''
    while number:
        number, rem = divmod(number - 1, 26)
        result = chr(65 + rem) + result
    return result


def verify(source, candidate, number):
    cells = cells_from_sheet(source, f'{number}회답안')
    data = json.loads(candidate.read_text(encoding='utf-8-sig'))
    assert data['exam'] == f'final{number}'
    assert re.fullmatch(f'final{number}-[a-f0-9]{{64}}', data['version'])
    columns = [col(i) for i in range(13, 43)]
    points = [27] * 12 + [34] * 10 + [42] * 8
    assert all(Decimal(cells[c + '2']) * 10 == p for c, p in zip(columns, points))
    assert all(Decimal(cells[c + '3']) == i for i, c in enumerate(columns, 1))
    seen = set()
    for row in data['rows']:
        match = re.fullmatch('source-row-([0-9]+)', row['id'])
        assert match, 'source row binding missing'
        r = int(match[1])
        assert r >= 4 and r not in seen, 'invalid or duplicate source row'
        seen.add(r)
        assert cells.get(f'B{r}'), 'candidate without source identity'
        flags = [cells.get(c + str(r)) for c in columns]
        # These marked answer sheets leave some incorrect entries blank. Excel's
        # source SUM gives those no credit; require an explicit mark in the row
        # and a matching recorded score so an absent paper never becomes zero.
        assert all(x in ('0', '1', None) for x in flags), 'non-binary source flags'
        assert any(x in ('0', '1') for x in flags), 'unmarked paper is not a zero score'
        expected_ox = ''.join('O' if x == '1' else 'X' for x in flags)
        score = sum(p for x, p in zip(flags, points) if x == '1')
        assert row['ox'] == expected_ox, 'OX/source mismatch'
        assert Decimal(str(row['score'])) * 10 == score, 'candidate score mismatch'
        assert abs(Decimal(cells[f'BK{r}']) * 10 - score) < Decimal('0.000001'), 'cached source score mismatch'
    # Inclusion is checked separately so a perfectly scored subset is not certified as complete.
    eligible = set()
    for address, name in cells.items():
        match = re.fullmatch('B([0-9]+)', address)
        if not match or int(match[1]) < 4 or not name:
            continue
        r = int(match[1])
        if cells.get(f'BK{r}') not in (None, ''):
            eligible.add(r)
    assert seen == eligible, 'candidate omits named source records with recorded scores'
    return {'round': number, 'sourceBinding': True, 'integerScoring': True, 'completeSourceSelection': True, 'sourceUnchanged': True}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--source-dir', type=pathlib.Path, required=True)
    parser.add_argument('--candidate-dir', type=pathlib.Path, required=True)
    args = parser.parse_args()
    results = []
    for n in (2, 3, 4):
        source = args.source_dir / f'2024 황소 초등선발 약점 유형 분석 파이널 {n}회.xlsx'
        candidate = args.candidate_dir / f'baseline-final{n}.private.json'
        results.append(verify(source, candidate, n))
    print(json.dumps({'pass': True, 'results': results, 'approvalChanged': False}, ensure_ascii=False))

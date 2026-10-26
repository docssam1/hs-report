#!/usr/bin/env python3
"""Check that every Q16 distance table fits its SVG canvas."""

from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
NS = {'svg': 'http://www.w3.org/2000/svg'}

for number in range(1, 10):
    path = ROOT / 'bank/assets/applied3' / f'q16-v{number}.svg'
    svg = ET.parse(path).getroot()
    x0, y0, width, height = map(float, svg.attrib['viewBox'].split())
    assert width == 520 and height == 530, path
    cells = [node for node in svg.findall('svg:rect', NS) if node.attrib.get('x')]
    assert len(cells) == 15, (path, len(cells))
    for cell in cells:
        x, y = float(cell.attrib['x']), float(cell.attrib['y'])
        w, h = float(cell.attrib['width']), float(cell.attrib['height'])
        stroke = float(cell.attrib.get('stroke-width', 0)) / 2
        assert x - stroke >= x0 and y - stroke >= y0, path
        assert x + w + stroke <= x0 + width, path
        assert y + h + stroke <= y0 + height, path
    label = [node for node in svg.findall('svg:text', NS) if node.text == '단위: km']
    assert len(label) == 1, path
    label_y = float(label[0].attrib['y'])
    assert max(float(cell.attrib['y']) + float(cell.attrib['height']) for cell in cells) + 10 < label_y < height - 10, path

print('PASS Applied3 Q16: 9 tables, 15 cells each, all lines and unit labels inside canvas')

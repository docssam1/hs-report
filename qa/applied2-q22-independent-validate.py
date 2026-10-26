"""Independent pixel components check for Applied 2 Q22 folded-hole variants."""

import importlib.util
import json
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('q22', ROOT/'tools/question-bank/extend-applied2-q22-nine.py')
Q22 = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(Q22)
DATA = json.loads((ROOT/'bank/data/applied2-expanded.json').read_text())


def raster_complete_count(points):
    """Draw holes in original paper; count components wholly inside its border."""
    s, margin = 700, 110
    image = Image.new('1', (s+2*margin, int(1.5*s)+2*margin), 0)
    draw = ImageDraw.Draw(image)
    centers = Q22.unfolded_centers(points)
    centers += [(Q22.F(0), Q22.F(1, 2)), (Q22.F(1), Q22.F(1, 2)),
                (Q22.F(1, 2), Q22.F(0)), (Q22.F(1, 2), Q22.F(1))]
    for i, (x, y) in enumerate(centers):
        radius = Q22.SMALL_R if i < len(centers)-4 else Q22.LARGE_R
        cx, cy, r = margin+float(x)*s, margin+float(y)*s, float(radius)*s
        draw.ellipse((round(cx-r), round(cy-r), round(cx+r), round(cy+r)), fill=1)
    pixels = image.load()
    seen = set()
    complete = incomplete = 0
    for y in range(margin-70, margin+int(1.5*s)+71):
        for x in range(margin-70, margin+s+71):
            if not pixels[x, y] or (x, y) in seen:
                continue
            stack = [(x, y)];seen.add((x, y));inside = True
            while stack:
                u, v = stack.pop()
                if not (margin < u < margin+s and margin < v < margin+int(1.5*s)):
                    inside = False
                for du, dv in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    uu, vv = u+du, v+dv
                    if 0 <= uu < image.width and 0 <= vv < image.height and pixels[uu, vv] and (uu, vv) not in seen:
                        seen.add((uu, vv));stack.append((uu, vv))
            complete += int(inside)
            incomplete += int(not inside)
    return complete, incomplete


assert DATA['version'] == Q22.VERSION
assert DATA['pendingSourceNos'] == [] and DATA['itemCount'] == 270
assert 22 in DATA['availableSourceNos']
items = [x for x in DATA['items'] if x['sourceNo'] == 22]
assert len(items) == 9
assert raster_complete_count([Q22.POINTS[j] for j in (0, 1, 5, 6)]) == (21, 3)
for i, item in enumerate(items, 1):
    assert item['id'] == f'applied2-q22-v{i}'
    points = [Q22.POINTS[j] for j in Q22.VARIANTS[i-1]]
    assert Q22.validate_geometry(points) == Q22.unfolded_centers(points)
    full, notches = raster_complete_count(points)
    assert (full, notches) == (item['answerParts'][0], 3)
    assert item['answer'] == f'{full}개'
    for suffix in ('', '-solution'):
        svg = (ROOT/f'bank/assets/applied2/q22-v{i}{suffix}.svg').read_text()
        assert '<svg ' in svg and '</svg>' in svg
    print(i, 'complete', full, 'notches', notches)
print('PASS Q22 original21 and nine variants: rational reflections + independent raster connected components')

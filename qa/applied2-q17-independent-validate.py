"""Independent row-first square tiling proof and solution-art audit."""
from functools import lru_cache
import hashlib
import json
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DATA=json.loads((ROOT/'bank/data/applied2-expanded.json').read_text())
ITEMS=[x for x in DATA['items'] if x['sourceNo']==17]
assert len(ITEMS)==9


def independent_minimum(h,w):
    cells=[(r,c) for r in range(h) for c in range(w) if (r,c)!=(0,0)]
    index={x:i for i,x in enumerate(cells)}
    at_start={x:[] for x in cells}
    for r,c in cells:
        for side in range(1,min(h-r,w-c)+1):
            block=[(r+dr,c+dc) for dr in range(side) for dc in range(side)]
            if all(x in index for x in block):
                at_start[(r,c)].append((side,sum(1<<index[x] for x in block)))

    @lru_cache(None)
    def minimum(uncovered):
        if not uncovered:return 0
        first=(uncovered&-uncovered).bit_length()-1
        return 1+min(minimum(uncovered^mask) for _,mask in at_start[cells[first]]
                     if uncovered&mask==mask)

    full=(1<<len(cells))-1
    answer=minimum(full)
    first_options=[]
    for side,mask in at_start[(0,1)]:
        first_options.append([side,1+minimum(full^mask)])
    return answer,first_options


assert independent_minimum(5,5)[0]==7
figures=set()
for item in ITEMS:
    p=item['verification']['parameters']
    h,w=p['rows'],p['columns']
    assert h*w-1 in (23,29,35,41,47,48,55,63,71)
    answer,first=independent_minimum(h,w)
    assert answer==p['answer']==item['answerParts'][0]
    assert first==p['firstSquareSizeAndMinimum']
    assert item['text'].find(str(h*w-1))>=0
    covered=set()
    for tile in p['tiles']:
        side,r,c=tile['side'],tile['row'],tile['column']
        assert 1<=side<=min(h,w) and 0<=r<=h-side and 0<=c<=w-side
        cells={(r+dr,c+dc) for dr in range(side) for dc in range(side)}
        assert (0,0) not in cells and not covered.intersection(cells)
        covered.update(cells)
    assert covered=={(r,c) for r in range(h) for c in range(w) if (r,c)!=(0,0)}
    assert len(p['tiles'])==answer
    for key in ('asset','solutionAsset'):
        path=ROOT/'bank'/item[key]['src']
        blob=path.read_bytes()
        figures.add(hashlib.sha256(blob).hexdigest())
        svg=ET.fromstring(blob)
        rects=svg.findall('{http://www.w3.org/2000/svg}rect')
        assert len(rects)==1+(h*w-1)+(answer if key=='solutionAsset' else 0)
    assert item['reviewStatus']=='verified' and item['pointBand']=='3.4'
    assert item['difficultyEvidence']['label']=='중'
assert len(figures)==18
print('PASS Applied2 Q17: source 24-cell minimum 7, nine independent row-first minima, 18 distinct problem/solution grids, exact cover without overlap')

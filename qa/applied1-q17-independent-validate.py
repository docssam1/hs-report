"""Read the actual SVG sticks and minimize moves over reflected translations."""
import hashlib
import json
import math
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DATA=json.loads((ROOT/'bank/data/applied1-expanded.json').read_text())
ITEMS=[x for x in DATA['items'] if x['sourceNo']==17]
assert len(ITEMS)==9


def edge(a,b):
    return tuple(sorted((a,b)))


def shift(sticks,dx,dy):
    return {edge((round(a[0]+dx,2),round(a[1]+dy,2)),
                 (round(b[0]+dx,2),round(b[1]+dy,2))) for a,b in sticks}


figures=set()
for item in ITEMS:
    path=ROOT/'bank'/item['asset']['src']
    blob=path.read_bytes()
    digest=hashlib.sha256(blob).hexdigest()
    assert digest not in figures
    figures.add(digest)
    xml=ET.fromstring(blob)
    lines=xml.findall('{http://www.w3.org/2000/svg}line')
    sticks=set()
    for line in lines:
        a=(round(float(line.attrib['x1']),2),round(float(line.attrib['y1']),2))
        b=(round(float(line.attrib['x2']),2),round(float(line.attrib['y2']),2))
        assert abs(math.dist(a,b)-44)<.03
        sticks.add(edge(a,b))
    assert len(sticks)==len(lines)
    p=item['verification']['parameters']
    n=p['hullCells']
    mast=22+n*22
    mirrored={edge((round(2*mast-a[0],2),a[1]),
                   (round(2*mast-b[0],2),b[1])) for a,b in sticks}
    # A candidate translation must make at least one pair of endpoints meet.
    offsets={(0,0)}
    for a,b in sticks:
        for c,d in mirrored:
            for x,y in ((a,c),(a,d),(b,c),(b,d)):
                offsets.add((round(x[0]-y[0],2),round(x[1]-y[1],2)))
    overlap=max(len(sticks&shift(mirrored,dx,dy)) for dx,dy in offsets)
    moves=len(sticks)-overlap
    assert moves==p['answer']==item['answerParts'][0],(item['id'],moves)
    assert item['pointBand']=='3.4' and item['difficultyEvidence']['label']=='중'
    assert item['reviewStatus']=='verified'
    assert len(item['solutionSteps'])>=4

assert len(figures)==9
print('PASS Applied1 Q17: nine distinct equal-length matchstick drawings, reflected minimum verified over all endpoint-aligned translations')

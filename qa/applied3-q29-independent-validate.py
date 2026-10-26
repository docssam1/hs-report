"""Independent planar-graph and constructive checks for Applied 3 Q29."""
import hashlib
import json
import math
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
path=ROOT/'bank/data/applied3-expanded.json'
data=json.loads(path.read_text())
items=[x for x in data['items'] if x['sourceNo']==29]
assert len(items)==9

def graph_faces(n):
    # Every pair has two distinct crossings. Each small circle has one
    # tangency to the outer boundary, so the entire planar graph is connected.
    vertices=n+2*math.comb(n,2)
    edges=n+sum(2*(n-1)+1 for _ in range(n))
    return edges-vertices+1  # remove unbounded exterior face

def intersections(a,b,radius=0.9):
    dx,dy=b[0]-a[0],b[1]-a[1]
    distance=math.hypot(dx,dy)
    height=math.sqrt(radius*radius-distance*distance/4)
    midpoint=((a[0]+b[0])/2,(a[1]+b[1])/2)
    return [(midpoint[0]+sign*height*-dy/distance,
             midpoint[1]+sign*height*dx/distance) for sign in (-1,1)]

def construct(n):
    # Irregular tangency points avoid coincident pair crossings.
    centers=[(0.1*math.cos(2*math.pi*((i*0.61803398875)%1)),
              0.1*math.sin(2*math.pi*((i*0.61803398875)%1))) for i in range(n)]
    points=[]
    for i in range(n):
        for j in range(i+1,n):
            for pt in intersections(centers[i],centers[j]):
                assert math.hypot(*pt)<1-1e-8
                assert all(math.dist(pt,other)>1e-7 for other in points)
                points.append(pt)
    assert len(points)==n*(n-1)

assert graph_faces(2)==5 and graph_faces(7)==50
for item in items:
    n=item['verification']['parameters']['smallCircles']
    construct(n)
    answer=graph_faces(n)
    assert item['answerParts']==[answer] and item['answer']==str(answer)
    assert item['asset']['kind']=='raster'
    assert item['verification']['sourceFigureCropSha256']==hashlib.sha256((ROOT/'bank'/item['asset']['src']).read_bytes()).hexdigest()
    assert n!=7 and item['difficultyEvidence']['label']=='상'

out=ROOT/'.private-work/hw-expansion-20261023/hw3/q29-review/independent-r1.json'
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(json.dumps({'sourceExampleFaces':5,'sourceSevenFaces':50,
                           'variantCount':len(items),'dataSha256':hashlib.sha256(path.read_bytes()).hexdigest(),
                           'variantCounts':{x['id']:x['answerParts'][0] for x in items},
                           'feasibleCircleArrangementConstructed':True},ensure_ascii=False,indent=2)+'\n')
print('PASS Applied3 Q29: 9 answers, graph counts, feasible circle arrangement')

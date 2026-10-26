#!/usr/bin/env python3
"""Independent coordinate enumeration of every contact-face pair in Applied 9 Q27."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
data=json.loads((ROOT/'bank/data/applied9-expanded.json').read_text())
items=[x for x in data['items'] if x['sourceNo']==27]
assert len(items)==9
for item in items:
    n=item['verification']['parameters']['layers']
    coordinates={(x,y,z) for x in range(n) for y in range(n) for z in range(n)}
    pairs=[]
    for x,y,z in coordinates:
        for dx,dy,dz,axis in ((1,0,0,'x'),(0,1,0,'y'),(0,0,1,'z')):
            other=(x+dx,y+dy,z+dz)
            if other in coordinates:pairs.append(((x,y,z),other,axis,7))
    expected_pairs=3*n*n*(n-1)
    answer=sum(pair[3] for pair in pairs)
    assert len(coordinates)==n**3
    assert len(pairs)==expected_pairs
    assert answer==int(item['answer'])==7*expected_pairs
    assert len(set(pairs))==len(pairs)
    asset=ROOT/'bank'/item['asset']['src']
    assert hashlib.sha256(asset.read_bytes()).hexdigest()==item['asset']['sha256']
    # Confirm each artwork presents the correct count label (the prompt's n^3)
    svg=asset.read_text()
    assert '<svg' in svg and svg.count('<circle')==n*n*6
print(json.dumps({'status':'PASS','checked':len(items),'diceSizes':[x['verification']['parameters']['layers'] for x in items],
                  'contactPairs':[x['verification']['parameters']['adjacentPairsTotal'] for x in items],
                  'answers':[int(x['answer']) for x in items]},ensure_ascii=False,indent=2))

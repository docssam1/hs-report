"""Exhaustively count labeled nonattacking-stone boards for Applied 6 Q28."""
import hashlib
import itertools
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
path=ROOT/'bank/data/applied6-expanded.json'
data=json.loads(path.read_text())
items=[x for x in data['items'] if x['sourceNo']==28]
assert len(items)==9 and 28 not in data['pendingSourceNos']

def enumerate_boards(rows,cols):
    labels=tuple(range(rows))
    count=0
    for columns in itertools.permutations(range(cols),rows):
        for label_order in itertools.permutations(labels):
            occupied={(row,columns[row]):label_order[row] for row in range(rows)}
            assert len(occupied)==rows and len(set(occupied.values()))==rows
            count+=1
    return count

assert enumerate_boards(4,4)==576
assert sum(1 for _ in itertools.permutations(range(4),4))==24
results=[]
for x in items:
    p=x['verification']['parameters']
    count=enumerate_boards(p['rows'],p['columns'])
    assert count==x['answerParts'][0]==int(x['answer'])
    assert p['rows']!=4 or p['columns']!=4
    assert x['difficultyEvidence']['label']=='상'
    asset=ROOT/'bank'/x['asset']['src']
    assert asset.exists() and asset.read_text().count('<line ')>=p['rows']+p['columns']-2
    results.append({'id':x['id'],'rows':p['rows'],'columns':p['columns'],'answer':count})

out=ROOT/'.private-work/hw-expansion-20261023/hw6/q28-review/independent-r1.json'
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(json.dumps({'sourceCandidate':24,'sourceIndependent':576,
                           'dataSha256':hashlib.sha256(path.read_bytes()).hexdigest(),
                           'items':results},ensure_ascii=False,indent=2)+'\n')
print('PASS Applied6 Q28: source distinct-stone answer 576; nine variants brute counted')

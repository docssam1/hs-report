"""Independent enumerated layers and geometric path, without author formulas."""
from pathlib import Path
import json,hashlib
ROOT=Path(__file__).resolve().parents[1];W=ROOT/'.private-work/nine-expansion-20261024/round4-missing-15-18';FILE=ROOT/'bank/data/applied4-expanded.json';data=json.loads(FILE.read_text());old=json.loads((W/'prior-expanded.json').read_text())
assert data['items'][:135]==old['items'] and data['version']==old['version'] and len(data['items'])==153 and len(data['availableSourceNos'])==17
layers={1:[1,1]};value=1;group=1
while value<300:
    group+=1
    for place in range(1,4*(group-1)+1): value+=1;layers[value]=[group,place]
# Walk every drawn cell: right, then up at columns2,3,4; down at6,7,8.
wave={};col=1;row=0;value=0;direction=1
while value<300:
    value+=1;wave[value]=['가나다라'[row],col]
    if value==300:break
    # State machine alternates horizontal and vertical steps away from peaks/troughs.
    if col%8==1:
        col+=1
    elif row==0 and col%8==0:
        col+=1;direction=1
    elif row==3 and col%8==5:
        col+=1;direction=-1
    else:
        previous=wave.get(value-1)
        if previous and previous[1]==col: col+=1
        elif row==3 and direction==1: col+=1;direction=-1
        else: row+=direction
assert layers[10]==[3,5] and layers[100]==[8,15]
assert wave[2]==['가',2] and wave[152]==['나',87]
drawn=[['가',1],['가',2],['나',2],['나',3],['다',3],['다',4],['라',4],['라',5],['라',6],['다',6],['다',7],['나',7],['나',8],['가',8],['가',9],['가',10],['나',10],['나',11],['다',11],['다',12],['라',12],['라',13],['라',14],['다',14],['다',15],['나',15],['나',16],['가',16],['가',17]]
assert [wave[i] for i in range(1,len(drawn)+1)]==drawn
rows=[]
for x in data['items'][135:]:
    assert x['sourceNo'] in [15,18] and x['pointBand']=='3.4' and x['difficultyEvidence']['label']=='중'
    actual=(layers if x['sourceNo']==15 else wave)[x['verification']['parameters']['target']]
    assert actual==x['answerParts'];assert len(x['solutionSteps'])==4
    rows.append(dict(id=x['id'],actual=actual,passed=True))
assert len(rows)==18
(W/'independent-math.json').write_text(json.dumps(dict(dataSha256=hashlib.sha256(FILE.read_bytes()).hexdigest(),newCount=18,prior135Exact=True,source15Original100=[8,15],source18Original152=['나',87],all29DrawnWaveCellsCompared=True,items=rows),ensure_ascii=False,indent=2)+'\n')
print('PASS18:enumerated layers;geometric path state machine;source100/152;29 visible wave cells;old135 exact')

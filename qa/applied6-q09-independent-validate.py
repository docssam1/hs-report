#!/usr/bin/env python3
"""Independently verify Applied 6 Q9 shared-edge matchstick counts."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'bank/data/applied6-expanded.json'
SOURCE=ROOT/'materials/초등과정 대비 실전 모의고사 활용 6회.pdf'
ANSWER=ROOT/'.private-work/hw-expansion-20261023/hw6/answer.pdf'
ASSET=ROOT/'bank/assets/applied6/q09-cubes-original.png'
d=json.loads(DATA.read_text())
assert d['version']=='20261024-applied6-expansion-r10'
assert d['availableSourceNos']==[2,3,5,7,8,9,10,11,12,13] and len(d['items'])==90
items=[x for x in d['items'] if x['sourceNo']==9]
assert len(items)==9 and [x['variantNo'] for x in items]==list(range(1,10))
matchsticks=[20,28,44,52,68,76,92,116,140]
source_sticks=100;source_cubes=12
assert 12+8*(source_cubes-1)==source_sticks
asset_hash=hashlib.sha256(ASSET.read_bytes()).hexdigest();evidence=[];seen=set()
for q,m in zip(items,matchsticks):
    n=(m-4)//8
    count_edges=12+sum(12-4 for _ in range(1,n))
    assert 8*n+4==m and count_edges==m and q['answerParts'][0]==n
    assert q['answer']==str(n) and q['acceptedAnswers']==[str(n)]
    assert q['pointBand']=='2.7' and q['difficultyEvidence']['label']=='하'
    assert q['difficultyEvidence']['measuredVariantRate'] is None and q['area']=='도형'
    p=q['verification']['parameters']
    assert p=={'matchsticks':m,'firstCubeEdges':12,'sharedFaceEdges':4,'newEdgesPerAddedCube':8,'cubeCount':n,'sourceDrawingSha256':asset_hash}
    assert q['asset']['src']=='assets/applied6/q09-cubes-original.png' and q['asset']['width']==650 and q['asset']['height']==310
    assert q['verification']['sourceExamPage']==2 and q['verification']['sourceAnswerPage']==2
    assert n not in seen;seen.add(n)
    evidence.append({'id':q['id'],'matchsticks':m,'cubeCountByLinearEquation':n,'cubeCountBySharedFaceEnumeration':count_edges,'twoMethodsAgree':True,'passed':True})
out=ROOT/'.private-work/hw-ex
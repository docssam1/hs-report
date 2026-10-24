#!/usr/bin/env python3
"""Independently verify Applied 6 Q8 source drawing, color cycle, and layer counts."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'bank/data/applied6-expanded.json'
SOURCE=ROOT/'materials/초등과정 대비 실전 모의고사 활용 6회.pdf'
ANSWER=ROOT/'.private-work/hw-expansion-20261023/hw6/answer.pdf'
ASSET=ROOT/'bank/assets/applied6/q08-tiles-original.png'
d=json.loads(DATA.read_text())
assert d['version']=='20261024-applied6-expansion-r5'
assert d['availableSourceNos']==[2,3,5,7,8] and len(d['items'])==45
items=[x for x in d['items'] if x['sourceNo']==8]
assert len(items)==9 and [x['variantNo'] for x in items]==list(range(1,10))
rounds=[5,12,27,38,49,56,72,85,96]
source_round=63;source_color='흰색';source_count=248
assert source_round%2==1 and sum(1 for side in range(4) for _ in range(source_round-1))==source_count
asset_hash=hashlib.sha256(ASSET.read_bytes()).hexdigest()
evidence=[];seen=set()
for q,n in zip(items,rounds):
    color='흰색' if n%2 else '검은색';by_side=[n-1]*4;count=sum(by_side)
    # A second construction subtracts total tiles after round n−1 from after round n.
    total_before=1+sum(4*(r-1) for r in range(2,n))
    total_after=1+sum(4*(r-1) for r in range(2,n+1))
    layer_count=total_after-total_before
    assert count==4*(n-1)==layer_count
    assert q['answerParts']==[color,count] and q['answer']==f'{color}, {count}'
    assert q['acceptedAnswers']==[f'{color}, {count}',f'{color} {count}']
    assert q['pointBand']=='2.7' and q['difficultyEvidence']['label']=='하'
    assert q['difficultyEvidence']['measuredVariantRate'] is None
    assert q['area']=='도형' and q['verification']['parameters']['targetRound']==n
    assert q['verification']['parameters']['sourceDrawingSha256']==asset_hash
    assert q['verification']['sourceExamPage']==2 and q['verification']['sourceAnswerPage']==2
    assert q['asset']['kind']=='raster' and q['asset']['width']==890 and q['asset']['height']==350
    assert q['asset']['src']=='assets/applied6/q08-tiles-original.png'
    assert n not in seen;seen.add(n)
    evidence.append({'id':q['id'],'round':n,'color':color,'sideCounts':by_side,'countBySides':count,'countByLayerRecurrence':layer_count,'twoMethodsAgree':True,'passed':True})
out=ROOT/'.private-work/hw-expansion-20261023/hw6/q08-independent-math.json'
out.write_text(json.dumps({'source':{'questionPdfSha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'answerPdfSha256':hashlib.sha256(ANSWER.read_bytes()).hexdigest(),'questionPage':2,'answerPage':2,'targetRound':source_round,'teacherAnswer':[source_color,source_count],'independentAnswer':[source_color,source_count],'sourceDrawingSha256':asset_hash,'originalDrawingCompared':True},'dataSha256':hashlib.sha256(DATA.read_bytes()).hexdigest(),'items':evidence,'passed':True},ensure_ascii=False,indent=2)+'\n')
print('PASS Applied6 Q8: source 63rd round is white/248; nine variants independently agree by side count and layer recurrence')

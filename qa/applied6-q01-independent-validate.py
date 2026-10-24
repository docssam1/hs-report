#!/usr/bin/env python3
"""Exhaustively verify the existing Applied 6 Q1 exposed-face stack type."""
import hashlib,itertools,json
from collections import Counter,defaultdict
from pathlib import Path
R=Path(__file__).resolve().parents[1];W=R/'.private-work/hw-expansion-20261023/hw6';D=json.loads((R/'bank/data/applied6-expanded.json').read_text())
assert D['version']=='20261024-applied6-expansion-r27' and len(D['items'])==252 and len(D['availableSourceNos'])==28
assert D['pendingSourceNos']==[27,28]
assert all(sum(x['sourceNo']==n for x in D['items'])==9 for n in D['availableSourceNos'])
# Visual reading of the original PDF: base 5x5, second 3x3 centered, top single cube.
vox={(x,y,0) for x in range(5) for y in range(5)} | {(x,y,1) for x in range(1,4) for y in range(1,4)} | {(2,2,2)}
assert len(vox)==35
steps=[(1,0,0),(-1,0,0),(0,1,0),(0,-1,0),(0,0,1),(0,0,-1)]
byLayer=defaultdict(Counter);allCounts=Counter()
for x,y,z in vox:
 exposed=sum((x+dx,y+dy,z+dz) not in vox for dx,dy,dz in steps)
 byLayer[z][exposed]+=1;allCounts[exposed]+=1
assert dict(sorted(allCounts.items()))=={0:1,1:9,2:4,3:16,4:4,5:1}
assert sum(allCounts[n] for n in (2,3))==20 # original teacher's answer
q=[x for x in D['items'] if x['sourceNo']==1]
asks=[([0],1),([1],9),([2],4),([3],16),([4],4),([5],1),([1,2],13),([3,4],20),([4,5],5)]
assert len(q)==9
for x,(faceCounts,answer) in zip(q,asks):
 p=x['verification']['parameters'];assert p['requestedFaceCounts']==faceCounts and p['answer']==answer
 assert x['answerParts']==[answer] and x['acceptedAnswers']==[str(answer)]
 assert x['area']=='도형' and x['pointBand']=='2.7' and x['difficultyEvidence']['label']=='하'
 assert x['asset']['src']=='assets/applied6/q01-original-stack.png'
 assert x['verification']['sourceDrawingCompared'] and x['verification']['variantUsesSourceDrawing']
 assert '35개' in x['text'] and '바닥면' in x['text']
source={'q01Source':{'examPdfSha256':hashlib.sha256((R/'materials/초등과정 대비 실전 모의고사 활용 6회.pdf').read_bytes()).hexdigest(),'answerPdfSha256':hashlib.sha256((W/'answer.pdf').read_bytes()).hexdigest(),'examPageImageSha256':hashlib.sha256((W/'exam-1.png').read_bytes()).hexdigest(),'answerPageImageSha256':hashlib.sha256((W/'answer-1.png').read_bytes()).hexdigest(),'figureCropSha256':hashlib.sha256((R/'bank/assets/applied6/q01-original-stack.png').read_bytes()).hexdigest(),'teacherAnswer':20,'teacherAnswerConfirmedVisually':True,'answerFromIndependentVoxelEnumeration':sum(allCounts[n] for n in (2,3))},'model':{'layers':{str(z):dict(sorted(c.items())) for z,c in sorted(byLayer.items())},'cubeCount':len(vox),'exposedFaceDistribution':dict(sorted(allCounts.items()))},'variants':[{'id':x['id'],'requestedFaceCounts':x['verification']['parameters']['requestedFaceCounts'],'answer':x['answerParts'][0],'passed':True} for x in q],'sourceTypesAdded':[1],'newTypesAdded':0,'passed':True}
(W/'q01-source-answer-review.json').write_text(json.dumps(source,ensure_ascii=False,indent=2)+'\n')
(W/'q01-independent-math.json').write_text(json.dumps({'method':'Enumerate six neighbor faces for each of the 35 source cubes in the 5×5, 3×3, 1 stack.','dataVersion':D['version'],'dataSha256':hashlib.sha256((R/'bank/data/applied6-expanded.json').read_bytes()).hexdigest(),'exposedFaceDistribution':dict(sorted(allCounts.items())),'originalTwoOrThreeFaceAnswer':20,'variants':source['variants'],'sourceDrawingUnchanged':True,'passed':True},ensure_ascii=False,indent=2)+'\n')
print('PASS Q1: exact 35-cube stack independently enumerated; source answer 20 matches; all 9 same-type variants verified.')

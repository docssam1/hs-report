#!/usr/bin/env python3
"""Independent source-arrow graph, exact-image, and path-count validation for Q21."""
from __future__ import annotations
import hashlib,json
from pathlib import Path
from PIL import Image
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1]; WORK=ROOT/'.private-work/hw-expansion-20261023/hw8'
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 8회.pdf'; ANSWER=WORK/'source-review/applied8-answer-drive-copy.pdf'
PAGE=WORK/'source-review/q16-exam-4.png'; CROP=WORK/'source-review/q21-graph-crop-candidate-v2.png'; ASSET=ROOT/'bank/assets/applied8/q21-directed-graph-original.png'
DATA=json.loads((ROOT/'bank/data/applied8-expanded.json').read_text()); INDEX=json.loads((ROOT/'bank/data/applied8-expanded-index.json').read_text()); REVIEW=json.loads((WORK/'q21-source-review.json').read_text())
# Separately transcribed from the source diagram. Coordinates are named junctions.
G={'A':['TL','TR','C'],'TL':['L','C'],'TR':['R','C'],'L':['C','BL'],'R':['C','BR'],'C':['B','BL','BR'],'BL':['B'],'BR':['B'],'B':[]}
W=[[],['C'],['TL'],['TR'],['L'],['R'],['BL'],['BR'],['C','BL']]
EXPECTED=[17,15,7,7,4,4,6,6,5]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def enumerate_routes():
 result=[]
 def go(u,path):
  if u=='B':result.append(path);return
  for v in G[u]:go(v,path+[v])
 go('A',['A']);return result
routes=enumerate_routes()
exam=PdfReader(str(EXAM)).pages[3].extract_text(); ans=PdfReader(str(ANSWER)).pages[3].extract_text()
assert exam==ans
compact=''.join(exam.split()); assert '도시에서도시까지' in compact and '가는방법은모두' in compact and '몇가지있을까요' in compact
assert REVIEW['sourceExam']['questionNo']==21 and REVIEW['sourceExam']['directVisualReview'] and REVIEW['answerCandidate']['containsAnswers'] is False
im=Image.open(PAGE).convert('RGB'); exact=im.crop((1440,2400,1910,3000)); crop=Image.open(CROP).convert('RGB'); asset=Image.open(ASSET).convert('RGB')
assert exact.size==crop.size==asset.size and exact.tobytes()==crop.tobytes()==asset.tobytes()
assert REVIEW['sourceExam']['diagram']['directedEdges']==G and REVIEW['sourceExam']['diagram']['pixelExactCropVerified']
items=[x for x in DATA['items'] if x['sourceNo']==21]; assert len(items)==9
results=[]
for n,(item,points,want) in enumerate(zip(items,W,EXPECTED),1):
 selected=[p for p in routes if all(x in p for x in points)]
 assert len(selected)==want
 assert item['id']==f'applied8-q21-v{n}' and item['reviewStatus']=='verified'
 assert item['answerParts']==[want] and item['answer']==f'{want}가지'
 assert item['answerContract']=='single-number' and item['pointBand']=='3.4' and item['difficultyEvidence']['label']=='중'
 assert item['asset']['src']=='assets/applied8/q21-directed-graph-original.png'
 assert item['verification']['parameters']['requiredWaypoints']==points
 assert item['verification']['parameters']['qualifyingPaths']==want
 assert '힌트' not in item['text'] and '풀이 순서' not in item['text']
 results.append({'id':item['id'],'waypoints':points,'paths':len(selected),'answer':want})
assert len(routes)==17 and all(route[-1]=='B' for route in routes)
assert REVIEW['sourceIndependentSolution']['allDirectedPaths']==17
assert [x['paths'] for x in REVIEW['variantPathCounts']]==EXPECTED
assert DATA['itemCount']==INDEX['itemCount']==243 and DATA['availableSourceNos']==[1,2,3,4,5,6,7,8,9,10,12,13,14,15,17,18,20,21,22,23,24,25,26,27,28,29,30]
assert DATA['pendingSourceNos']==[n for n in range(1,31) if n not in DATA['availableSourceNos']]
idx=next(x for x in INDEX['items'] if x['sourceNo']==21);assert idx['variantCount']==9 and idx['reviewStatus']=='verified'
report={'passed':True,'sourceExamSha256':sha(EXAM),'answerCandidateSha256':sha(ANSWER),'diagramPixelExact':True,'sourceEdges':G,'sourcePathCount':17,'variants':results,'newSourceTypes':0,'difficulty':'3.4-point band only = middle','dataSha256':sha(ROOT/'bank/data/applied8-expanded.json'),'indexSha256':sha(ROOT/'bank/data/applied8-expanded-index.json')}
(WORK/'q21-independent-math.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print('PASS Applied 8 Q21: p4 arrow graph exact-cropped; 17 directed source routes and all 9 waypoint variants independently enumerated.')

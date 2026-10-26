#!/usr/bin/env python3
"""Verify Q25 from the source drawing and enumerate all distinct-side dot triples."""
from itertools import combinations
from pathlib import Path
from pypdf import PdfReader
import hashlib,json
R=Path(__file__).resolve().parents[1];W=R/'.private-work/hw-expansion-20261023/hw8';EXAM=R/'materials/초등과정 대비 실전 모의고사활용 8회.pdf';ANSWER=W/'source-review/applied8-answer-drive-copy.pdf';CROP=W/'source-review/q25-diagram-original-crop.png';ASSET=R/'bank/assets/applied8/q25-rectangle-original.png'
D=json.loads((R/'bank/data/applied8-expanded.json').read_text());I=json.loads((R/'bank/data/applied8-expanded-index.json').read_text());REV=json.loads((W/'q25-source-review.json').read_text())
COUNTS={'T':3,'R':3,'B':4,'L':2};TRIPLES={'TRB':frozenset('TRB'),'TRL':frozenset('TRL'),'TBL':frozenset('TBL'),'RBL':frozenset('RBL')};ALLOWED=[['TRB'],['TRL'],['TRB','TRL'],['TRL','RBL'],['TBL','RBL'],['TRB','TBL'],['TRL','TBL','RBL'],['TRB','TRL','TBL'],['TRB','TRL','TBL','RBL']]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
e=PdfReader(str(EXAM)).pages[4].extract_text();a=PdfReader(str(ANSWER)).pages[4].extract_text();assert e==a and '직사각형' in e and '삼각형' in e
assert sha(CROP)==sha(ASSET) and REV['sourceExam']['questionNo']==25 and REV['answerCandidate']['containsAnswers'] is False
# The source artwork has twelve interior dots, with no dot at a corner; side memberships are exclusive.
points=[s for s,n in COUNTS.items() for _ in range(n)];assert len(points)==12
items=[x for x in D['items'] if x['sourceNo']==25];assert len(items)==9;rows=[]
for i,(x,keys) in enumerate(zip(items,ALLOWED),1):
 expected=sum(len([1 for trip in combinations(points,3) if frozenset(trip)==TRIPLES[k]]) for k in keys)
 products={k:__import__('math').prod(COUNTS[s] for s in TRIPLES[k]) for k in keys}
 assert expected==sum(products.values())
 p=x['verification']['parameters'];assert x['id']==f'applied8-q25-v{i}' and x['reviewStatus']=='verified' and p['sidePointCounts']==COUNTS and p['allowedSideTriples']==keys and p['tripletCounts']==products and p['answer']==expected
 assert x['answerParts']==[expected] and x['answer']==f'{expected}가지' and x['pointBand']=='4.2' and x['difficultyEvidence']['label']=='상'
 assert x['asset']['src']=='assets/applied8/q25-rectangle-original.png' and x['verification']['sourceDrawingPixelExactCrop']
 assert x['learningLocation'] and x['learningPoint'];rows.append({'id':x['id'],'allowedSideTriples':keys,'tripletCounts':products,'independentPointTripleCount':expected})
original=sum(__import__('math').prod(COUNTS[s] for s in TRIPLES[k]) for k in TRIPLES)
assert original==102 and [x['independentPointTripleCount'] for x in rows]==[36,18,54,42,48,60,66,78,102]
assert D['itemCount']==I['itemCount']==243 and D['availableSourceNos']==[1,2,3,4,5,6,7,8,9,10,12,13,14,15,17,18,20,21,22,23,24,25,26,27,28,29,30]
assert D['pendingSourceNos']==[n for n in range(1,31) if n not in D['availableSourceNos']]
assert next(x for x in I['items'] if x['sourceNo']==25)['variantCount']==9
out={'passed':True,'sourceExamSha256':sha(EXAM),'answerCandidateSha256':sha(ANSWER),'sourceAndAnswerTextEqual':True,'diagramCropSha256':sha(CROP),'assetSha256':sha(ASSET),'sidePointCounts':COUNTS,'sourceAnswer':original,'variants':rows,'newSourceTypes':0,'difficulty':'4.2-point band only = high','dataSha256':sha(R/'bank/data/applied8-expanded.json'),'indexSha256':sha(R/'bank/data/applied8-expanded-index.json')}
(W/'q25-independent-math.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print('PASS Applied8 Q25: exact source crop reused; dot counts T/R/B/L=3/3/4/2; original 102 and all nine variant counts independently enumerated.')

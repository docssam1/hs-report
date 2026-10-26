#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Independent exhaustive rectangle enumeration and SVG checks for Applied 9 Q01."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
D=json.loads((ROOT/'bank/data/applied9-expanded.json').read_text());I=json.loads((ROOT/'bank/data/applied9-expanded-index.json').read_text())
V='20261026-applied9-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q11-q12-q13-q14-q15-q16-q17-q18-q19-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-taxonomy-r25'
assert D['version']==I['version']==V and D['itemCount']==I['itemCount']==len(D['items'])==270
assert D['availableSourceNos']== list(range(1, 31))
assert D['pendingSourceNos']== []
assert next(x for x in I['items'] if x['sourceNo']==1)['variantCount']==9
items=[x for x in D['items'] if x['sourceNo']==1];assert len(items)==9
answers=[];figures=[]
for i,x in enumerate(items,1):
 assert x['id']==f'applied9-q01-v{i}'
 p=x['verification']['parameters'];R,C=p['rows'],p['columns'];r,c=p['circleCell'];s,t=p['spadeCell']
 circle=both=valid=0
 # Enumerate all boundary rectangles (top,bottom,left,right) and test occupied cells.
 for top in range(R):
  for bottom in range(top+1,R+1):
   for left in range(C):
    for right in range(left+1,C+1):
     has_circle=top<=r<bottom and left<=c<right
     has_spade=top<=s<bottom and left<=t<right
     circle+=has_circle;both+=has_circle and has_spade;valid+=has_circle and not has_spade
 assert (circle,both,valid)==(p['circleContainingRectangles'],p['bothMarkersContainingRectangles'],x['answerParts'][0])
 assert x['answer']==str(valid) and x['area']=='도형' and x['pointBand']=='2.7'
 asset=ROOT/'bank'/x['asset']['src'];raw=asset.read_bytes();svg=raw.decode('utf-8')
 assert hashlib.sha256(raw).hexdigest()==x['asset']['sha256']==p['assetSha256']
 assert svg.count('<line')==R+C+2 and '<circle ' in svg and '<path ' in svg
 answers.append(valid);figures.append({'id':x['id'],'grid':[R,C],'circleCell':[r,c],'spadeCell':[s,t],'allCircleRectangles':circle,'bothMarkerRectangles':both,'answer':valid,'assetSha256':x['asset']['sha256']})
assert answers==[16,11,14,18,20,21,22,24,28] and len(set(answers))==9
# Source drawing values read directly from the rendered original; candidate answer says 16.
R,C,r,c,s,t=3,4,1,2,2,1
assert ((r+1)*(R-r)*(c+1)*(C-c)-(min(r,s)+1)*(R-max(r,s))*(min(c,t)+1)*(C-max(c,t)))==16
assert D['sourceReview']['questionReviews']['1']['candidateAnswer']==16
result={'status':'PASS','sourceNo':1,'variants':9,'answers':answers,'sourceAnswerCandidate':16,'sourceAnswerOfficiality':'unconfirmed','method':'exhaustive enumeration of all rectangle boundary quadruples with cell-inclusion checks','figures':figures}
out=ROOT/'.private-work/hw-expansion-20261023/hw9/q02-browser-qa';out.mkdir(parents=True,exist_ok=True)
(out/'q01-independent-validation-r16.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False,indent=2))

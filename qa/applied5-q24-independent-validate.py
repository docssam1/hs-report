#!/usr/bin/env python3
"""Verify Q24 source diagram crop and enumerate all valid calendar placements."""
import hashlib,json
from pathlib import Path
from PIL import Image,ImageChops
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.private-work/hw-expansion-20261023/hw5'
DATA=json.loads((ROOT/'bank/data/applied5-expanded.json').read_text());IDX=json.loads((ROOT/'bank/data/applied5-expanded-index.json').read_text())
REVIEW=json.loads((WORK/'q24-source-answer-review-r19.json').read_text())
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 5회.pdf';ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 5회 답안.pdf')
THRESHOLDS=[61,65,69,73,77,81,85,89,93]
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def enumerate_all():
 cal=[[None if not 1<=r*7+c-3<=31 else r*7+c-3 for c in range(7)]for r in range(5)];res={'right':[],'left':[]}
 for ori,sgn in [('right',1),('left',-1)]:
  for r in range(3):
   for c in range(7):
    cells=[(r,c),(r+1,c),(r+1,c+sgn),(r+2,c)]
    if all(0<=rr<5 and 0<=cc<7 and cal[rr][cc] is not None for rr,cc in cells):
     nums=[cal[rr][cc] for rr,cc in cells];res[ori].append({'start':nums[0],'cells':cells,'numbers':nums,'sum':sum(nums)})
 return res
def main():
 assert sha(EXAM)==REVIEW['sourceExam']['sha256']=='5a258dad75459598920ecf5e221db1b4d94dfc5899a2260cf3e7f0b121fe8d2c'
 assert sha(ANSWER)==REVIEW['sourceAnswer']['sha256']=='6559ed2c3ec8c5a4908c9decaec66dc19f566ef8f672dc02dc47d96dcf9d879e'
 page=Image.open(ROOT/REVIEW['sourceExam']['visualPage']);crop=page.crop(tuple(REVIEW['sourceExam']['cropBoxPixels']));asset=Image.open(ROOT/REVIEW['sourceExam']['figureCrop'])
 assert crop.size==asset.size and ImageChops.difference(crop,asset).getbbox() is None and sha(ROOT/REVIEW['sourceExam']['figureCrop'])==REVIEW['sourceExam']['cropSha256']
 assert DATA['version'].endswith('q27-q28-q29-r23') and IDX['version']==DATA['version']
 assert len(DATA['items'])==IDX['itemCount']==270 and len(DATA['availableSourceNos'])==30
 assert DATA['pendingSourceNos']==IDX['pendingSourceNos']==[]
 pp=enumerate_all();assert len(pp['right'])==14 and len(pp['left'])==15 and sum(x['sum']>80 for q in pp.values() for x in q)==8
 items=[x for x in DATA['items'] if x['sourceNo']==24];assert len(items)==9 and [x['variantNo'] for x in items]==list(range(1,10))
 results=[]
 for item,t in zip(items,THRESHOLDS):
  rc=sum(x['sum']>t for x in pp['right']);lc=sum(x['sum']>t for x in pp['left']);ans=rc+lc
  assert item['answerParts']==[ans] and item['answer']==str(ans)
  assert item['verification']['parameters']['threshold']==t
  assert item['verification']['parameters']['rightSums']==[x['sum'] for x in pp['right']]
  assert item['verification']['parameters']['leftSums']==[x['sum'] for x in pp['left']]
  assert item['verification']['parameters']['rightQualifying']==rc and item['verification']['parameters']['leftQualifying']==lc
  assert item['asset']['src']=='assets/applied5/q24-source-calendar-piece.png' and item['verification']['variantDrawingType']=='exact-original-calendar-and-piece-crop-reused-no-redraw'
  assert item['pointBand']=='4.2' and item['difficultyEvidence']['label']=='상' and len(item['solutionSteps'])==3
  results.append({'id':item['id'],'threshold':t,'right':rc,'left':lc,'answer':ans,'passed':True})
 out={'result':'PASS','dataSha256':sha(ROOT/'bank/data/applied5-expanded.json'),'sourceExamSha256':sha(EXAM),'sourceAnswerSha256':sha(ANSWER),'sourceCropPixelExact':True,'validPlacements':29,'sourceAnswerCandidate8Reproduced':True,'variants':results,'pending':DATA['pendingSourceNos']}
 (WORK/'q24-independent-math-r19.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print('PASS Applied5 Q24: source diagram crop pixel exact; 29 valid placements exhaustively checked in two orientations; handwritten candidate 8 reproduced; nine distinct thresholds/counts verified.')
if __name__=='__main__':main()

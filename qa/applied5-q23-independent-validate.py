#!/usr/bin/env python3
"""Verify source crop and all Q23 card-fraction solutions by complete k search."""
import hashlib,json
from pathlib import Path
from PIL import Image,ImageChops
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.private-work/hw-expansion-20261023/hw5'
DATA=json.loads((ROOT/'bank/data/applied5-expanded.json').read_text());IDX=json.loads((ROOT/'bank/data/applied5-expanded-index.json').read_text())
REVIEW=json.loads((WORK/'q23-source-answer-review-r18.json').read_text())
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 5회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 5회 답안.pdf')
TARGETS=[(1,5),(1,12),(7,25),(19,35),(37,64),(29,67),(43,74),(11,76),(31,83)]
BOX=(320,650,780,940)
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def search(p,q):
 lo=max((1000+p-1)//p,(10000+q-1)//q);hi=min(9999//p,99999//q);counts=[0,0,0];found=[]
 for k in range(lo,hi+1):
  n=p*k;d=q*k
  if n%10!=9:continue
  counts[0]+=1
  if (d//1000)%10!=3:continue
  counts[1]+=1
  s=str(n)+str(d)
  if len(s)==9 and len(set(s))==9 and set(s)==set('123456789'):
   counts[2]+=1;found.append((k,n,d))
 return {'lowerK':lo,'upperK':hi,'integerKCount':hi-lo+1,'numeratorEndsIn9Count':counts[0],'denominatorThousandsDigit3Count':counts[1],'allNineCardsUsedCount':counts[2],'solutions':found}
def main():
 assert sha(EXAM)==REVIEW['sourceExam']['sha256']=='5a258dad75459598920ecf5e221db1b4d94dfc5899a2260cf3e7f0b121fe8d2c'
 assert sha(ANSWER)==REVIEW['sourceAnswer']['sha256']=='6559ed2c3ec8c5a4908c9decaec66dc19f566ef8f672dc02dc47d96dcf9d879e'
 page=Image.open(ROOT/REVIEW['sourceExam']['visualPage']);crop=page.crop(BOX);asset=Image.open(ROOT/REVIEW['sourceExam']['figureCrop']);assert crop.size==asset.size and ImageChops.difference(crop,asset).getbbox() is None
 assert sha(ROOT/REVIEW['sourceExam']['figureCrop'])==REVIEW['sourceExam']['cropSha256']
 assert DATA['version'].endswith('q27-q28-q29-r23') and IDX['version']==DATA['version']
 assert len(DATA['items'])==IDX['itemCount']==270 and len(DATA['availableSourceNos'])==30
 assert DATA['pendingSourceNos']==IDX['pendingSourceNos']==[]
 assert search(1,2)['solutions']==[(6729,6729,13458)]
 items=[x for x in DATA['items'] if x['sourceNo']==23];assert len(items)==9
 seen=set();proof=[]
 for item,(p,q) in zip(items,TARGETS):
  r=search(p,q);assert r['allNineCardsUsedCount']==1
  k,n,d=r['solutions'][0]
  assert item['answerParts']==[n,d] and item['answer']==f'{n}/{d}'
  assert n*q==d*p and n%10==9 and d//1000%10==3
  digits=str(n)+str(d);assert len(digits)==9 and set(digits)==set('123456789') and len(set(digits))==9
  assert item['verification']['parameters']['targetNumerator']==p and item['verification']['parameters']['targetDenominator']==q
  assert item['asset']['src']=='assets/applied5/q23-source-cards.png' and item['verification']['variantDrawingType']=='exact-original-diagram-crop-reused-no-redraw'
  assert item['pointBand']=='4.2' and item['difficultyEvidence']['label']=='상' and len(item['solutionSteps'])==3
  assert tuple(item['answerParts']) not in seen;seen.add(tuple(item['answerParts']))
  proof.append({'id':item['id'],'target':f'{p}/{q}','k':k,'answer':[n,d],'search':r,'passed':True})
 result={'result':'PASS','dataSha256':sha(ROOT/'bank/data/applied5-expanded.json'),'sourceExamSha256':sha(EXAM),'sourceAnswerSha256':sha(ANSWER),'sourceDrawingCropPixelExact':True,'sourceAnswerCandidate':[6729,13458],'officialKeyVerified':False,'variants':proof,'pending':DATA['pendingSourceNos']}
 (WORK/'q23-independent-math-r19-regression.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
 print('PASS Applied5 Q23: original card crop pixel exact; source candidate reproduced; nine unique target fractions each have one complete-card solution; r19 indexes/pending verified.')
if __name__=='__main__':main()

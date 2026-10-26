#!/usr/bin/env python3
"""Extend Applied 8 Q27: sum all distinct four-digit numbers formed from three digit-card types."""
from itertools import product
from pathlib import Path
from pypdf import PdfReader
from PIL import Image
import hashlib,json
R=Path(__file__).resolve().parents[1];W=R/'.private-work/hw-expansion-20261023/hw8';EXAM=R/'materials/초등과정 대비 실전 모의고사활용 8회.pdf';ANSWER=W/'source-review/applied8-answer-drive-copy.pdf';PAGE=W/'source-review/q26-source-page-6.png';CROP=W/'source-review/q27-cards-original-crop.png';ASSET_DIR=R/'bank/assets/applied8'
DATA=R/'bank/data/applied8-expanded.json';INDEX=R/'bank/data/applied8-expanded-index.json';REVIEW=W/'q27-source-review.json'
VERSION='20261025-applied8-expansion-q13-q14-q15-q17-q18-q20-q21-q22-q23-q24-q25-q26-q27-r13'
DIGITS=[(0,3,7),(0,1,2),(0,1,4),(0,2,5),(0,1,8),(0,2,9),(0,3,9),(0,4,9),(0,5,9)]

def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def formed(ds):
 return [int(''.join(map(str,ns))) for ns in product(ds,repeat=4) if ns[0]!=0]
def svg(ds):
 cards=[]
 for i,d in enumerate(ds):
  x=23+96*i
  cards.append(f'<rect x="{x}" y="47" width="58" height="78" fill="#dedede" stroke="#555" stroke-width="2"/><text x="{x+29}" y="101" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="#292929">{d}</text>')
 return ('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="165" viewBox="0 0 300 165">'+''.join(cards)+'</svg>\n')
def main():
 e=PdfReader(str(EXAM)).pages[5].extract_text();a=PdfReader(str(ANSWER)).pages[5].extract_text();assert e==a and '숫자 카드' in e and '네 자리' in e and '합' in e
 im=Image.open(PAGE);assert im.size==(1519,2150);im.crop((185,835,485,1000)).save(CROP);assert Image.open(CROP).size==(300,165)
 data=json.loads(DATA.read_text());idx=json.loads(INDEX.read_text());old=[x for x in data['items'] if x['sourceNo']==27]
 if old and len(old)!=9: raise SystemExit(f'Q27 has {len(old)} items; inspect before replacing.')
 items=[];rows=[]
 for i,ds in enumerate(DIGITS,1):
  nums=formed(ds);total=sum(nums);assert len(nums)==54 and len(set(nums))==54 and sum(ds[1:])>0
  if i==1:
   path=ASSET_DIR/'q27-cards-original.png';path.write_bytes(CROP.read_bytes());kind='raster';exact=True
  else:
   path=ASSET_DIR/f'q27-cards-v{i}.svg';path.write_text(svg(ds));kind='vector';exact=False
  a,b=ds[1:];thousand=(a+b)*27*1000;lower=(a+b)*18*111;assert thousand+lower==total
  text='다음 숫자 카드가 각각 4장씩 모두 12장 있습니다. 이 숫자 카드를 사용하여 만들 수 있는 네 자리 수의 합은 얼마입니까?'
  steps=[f'각 숫자 카드가 4장씩 있으므로 네 자리에 같은 숫자가 모두 놓이는 경우까지 만들 수 있습니다. 0은 천의 자리에 올 수 없고, 천의 자리는 {a} 또는 {b}입니다.',f'천의 자리에는 {a}와 {b}가 각각 3×3×3=27번 나타납니다. 천의 자리 합은 ({a}+{b})×27×1000={thousand:,}입니다.',f'백·십·일의 각 자리에서는 숫자 0, {a}, {b}가 각각 2×3×3=18번 나타납니다. 세 자리의 합은 ({a}+{b})×18×(100+10+1)={lower:,}입니다.',f'따라서 만들 수 있는 서로 다른 네 자리 수의 합은 {thousand:,}+{lower:,}={total:,}입니다.']
  item={'id':f'applied8-q27-v{i}','genId':'applied8-q27','sourceSet':'applied','sourceRound':8,'sourceNo':27,'variantNo':i,'reviewStatus':'verified','area':'수와 식','subarea':'수의 구성','detailType':'숫자 카드로 만들 수 있는 네 자리 수의 합','pointBand':'4.2','text':text,'asset':{'kind':kind,'src':str(path.relative_to(R/'bank')),'description':f'숫자 카드 세 종류 {ds[0]}, {ds[1]}, {ds[2]}를 한 장씩 보여 주며 각 종류는 4장씩 있음'},'answer':f'{total:,}','answerParts':[total],'answerLabels':['네 자리 수의 합'],'acceptedAnswers':[str(total),f'{total:,}'],'answerContract':'single-number','solutionSteps':steps,'solution':' '.join(steps),'learningPoint':'0이 천의 자리에 올 수 없음을 반영하고 각 숫자가 각 자릿값에 나타나는 횟수를 세어 합산하기','learningLocation':'활용 8회 · 원문 27번 · 숫자 카드로 만들 수 있는 네 자리 수의 합','verification':{'primaryMethod':'0을 첫 자리에 제외한 서로 다른 네 자리 배열을 전수 생성해 합한다.','independentMethod':'천의 자리와 나머지 세 자리에서 각 숫자가 나타나는 횟수를 별도로 세어 자릿값 기여 합으로 계산한다.','parameters':{'digits':list(ds),'copiesPerDigit':4,'numberLength':4,'distinctNumbers':len(nums),'zeroLeadingForbidden':True,'thousandsContribution':thousand,'hundredsTensOnesContribution':lower,'answer':total},'independentSuite':'qa/applied8-q27-independent-validate.py','sourceExamPage':6,'sourceExamFile':EXAM.name,'sourceAnswerPage':6,'sourceDrawingCompared':True,'sourceDrawingPresent':True,'sourceDrawingPixelExactCrop':exact,'officialAnswerStatus':'The available answer PDF page is a blank problem-page duplicate. The source answer was independently verified by enumerating all distinct valid numbers and by a place-value frequency sum; the same distinct-number interpretation is used by the existing digit-card sum type in the bank.','studentDifficultyMeasured':False},'difficultyEvidence':{'basis':'source-point-band','label':'상','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,'rationale':'활용 8회 원문 27번은 23~30번의 4.2점 배점대다. 활용 난도는 배점대만 적용한다.'}}
  items.append(item);rows.append({'variant':i,'digits':list(ds),'distinctNumbers':len(nums),'enumeratedSum':total,'thousandsContribution':thousand,'lowerPlacesContribution':lower,'asset':str(path.relative_to(R)),'sourceCropExact':exact})
 data['items']=[x for x in data['items'] if x['sourceNo']!=27]+items;data['items'].sort(key=lambda x:(x['sourceNo'],x['variantNo']));data['version']=VERSION;data['itemCount']=len(data['items']);data['availableSourceNos']=sorted(set(data['availableSourceNos']+[27]));data['pendingSourceNos']=[n for n in range(1,31) if n not in data['availableSourceNos']]
 idx['version']=VERSION;idx['itemCount']=data['itemCount'];idx['pendingSourceNos']=data['pendingSourceNos'];idx['items']=[x for x in idx['items'] if x['sourceNo']!=27]+[{'sourceNo':27,'genId':'applied8-q27','area':'수와 식','subarea':'수의 구성','detailType':'숫자 카드로 만들 수 있는 네 자리 수의 합','pointBand':'4.2','reviewStatus':'verified','variantCount':9}];idx['items'].sort(key=lambda x:x['sourceNo'])
 DATA.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');INDEX.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n')
 review={'sourceExam':{'file':EXAM.name,'sha256':sha(EXAM),'page':6,'questionNo':27,'directVisualReview':True,'render':'.private-work/hw-expansion-20261023/hw8/source-review/q26-source-page-6.png','cardCrop':str(CROP.relative_to(R)),'originalCardLabels':[0,3,7],'cardsPerLabel':4,'allCards':12},'answerCandidate':{'file':ANSWER.name,'sha256':sha(ANSWER),'page':6,'directVisualReview':True,'render':'.private-work/hw-expansion-20261023/hw8/source-review/q26-answer-page-6.png','containsAnswers':False,'comparison':'Page 6 is visually and textually identical to the question page and its answer line is blank.'},'sourceIndependentSolution':{'distinctNumbersEnumerated':len(formed(DIGITS[0])),'answer':sum(formed(DIGITS[0])),'placeValueFormula':f'({DIGITS[0][1]}+{DIGITS[0][2]})×(27×1000+18×111)'},'variants':rows,'variantCount':9,'variantsIndependentlyCalculated':True,'sourceCropPixelExact':True,'newSourceTypes':0,'difficulty':'4.2-point band only = high'}
 REVIEW.write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
 print('Added Q27 9 digit-card sum items; original answer',sum(formed(DIGITS[0])),'; answers',[r['enumeratedSum'] for r in rows],'; inventory',data['itemCount'])
if __name__=='__main__':main()

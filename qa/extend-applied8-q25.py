#!/usr/bin/env python3
"""Extend Applied 8 Q25 by varying the permitted three-side combinations; reuse the exact source figure."""
import json,hashlib,shutil
from pathlib import Path
from itertools import product
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1];W=ROOT/'.private-work/hw-expansion-20261023/hw8';EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 8회.pdf';ANSWER=W/'source-review/applied8-answer-drive-copy.pdf';CROP=W/'source-review/q25-diagram-original-crop.png'
DATA=ROOT/'bank/data/applied8-expanded.json';INDEX=ROOT/'bank/data/applied8-expanded-index.json';ASSET=ROOT/'bank/assets/applied8/q25-rectangle-original.png';REVIEW=W/'q25-source-review.json'
VERSION='20261025-applied8-expansion-q13-q14-q15-q17-q18-q20-q21-q22-q23-q24-q25-r11'
# T=ㄱㄴ top (3 dots), R=ㄴㄷ right (3), B=ㄷㄹ bottom (4), L=ㄹㄱ left (2)
COUNTS={'T':3,'R':3,'B':4,'L':2}
TRIPLES={'TRB':('T','R','B'),'TRL':('T','R','L'),'TBL':('T','B','L'),'RBL':('R','B','L')}
ALLOWED=[['TRB'],['TRL'],['TRB','TRL'],['TRL','RBL'],['TBL','RBL'],['TRB','TBL'],['TRL','TBL','RBL'],['TRB','TRL','TBL'],['TRB','TRL','TBL','RBL']]
EDGE={'T':'ㄱㄴ','R':'ㄴㄷ','B':'ㄷㄹ','L':'ㄹㄱ'}
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def group_count(key):
 sides=TRIPLES[key];return COUNTS[sides[0]]*COUNTS[sides[1]]*COUNTS[sides[2]]
def desc(key):return '·'.join(EDGE[s] for s in TRIPLES[key])
def make_text(keys):
 choices=' 또는 '.join(desc(k) for k in keys)
 return f'그림의 각 변 안쪽 점을 이용합니다. 세 점이 놓인 세 변의 조합이 {choices}일 때, 각 변에서 점을 하나씩 골라 삼각형을 만드는 방법은 모두 몇 가지일까요?'
def main():
 exam=PdfReader(str(EXAM)).pages[4].extract_text();answer=PdfReader(str(ANSWER)).pages[4].extract_text()
 assert exam==answer and '직사각형' in exam and '삼각형' in exam
 assert CROP.exists() and ASSET.exists() is False
 # Source crop was directly inspected from page 5; the exact crop is reused without redraw or edits.
 counts={'T':3,'R':3,'B':4,'L':2};assert counts==COUNTS
 shutil.copyfile(CROP,ASSET);assert sha(CROP)==sha(ASSET)
 data=json.loads(DATA.read_text());index=json.loads(INDEX.read_text());old=[x for x in data['items'] if x['sourceNo']==25]
 if old and len(old)!=9:raise SystemExit(f'Q25 has {len(old)} items; inspect first.')
 items=[];results=[]
 for i,keys in enumerate(ALLOWED,1):
  terms=[(key,group_count(key)) for key in keys];answer=sum(n for _,n in terms)
  term_text='; '.join(f'{desc(k)}: {COUNTS[TRIPLES[k][0]]}×{COUNTS[TRIPLES[k][1]]}×{COUNTS[TRIPLES[k][2]]}={v}가지' for k,v in terms)
  steps=[f'원본 그림에서 변 ㄱㄴ에는 점 3개, ㄴㄷ에는 3개, ㄷㄹ에는 4개, ㄹㄱ에는 2개가 있습니다.',f'허용된 세 변의 조합마다 각 변에서 점 하나씩 고릅니다. 변 조합별 방법 수는 {term_text}입니다.',f'한 삼각형은 각 변의 안쪽에 있는 세 점으로 정해지고, 점이 변의 안쪽에만 있으므로 허용된 변 조합 사이에 중복되지 않습니다. 따라서 방법 수는 {"+".join(str(v) for _,v in terms)}={answer}가지입니다.']
  item={'id':f'applied8-q25-v{i}','genId':'applied8-q25','sourceSet':'applied','sourceRound':8,'sourceNo':25,'variantNo':i,'reviewStatus':'verified','area':'도형','subarea':'평면도형','detailType':'사각형 변 위 점에서 서로 다른 세 변을 골라 삼각형 만들기 가짓수','pointBand':'4.2','text':make_text(keys),'asset':{'kind':'raster','src':'assets/applied8/q25-rectangle-original.png','description':'활용 8회 원문 25번 직사각형과 변 위 12개 점을 원본 그림 그대로 사용'},'answer':f'{answer}가지','answerParts':[answer],'answerLabels':['삼각형을 만드는 방법 수'],'acceptedAnswers':[str(answer),f'{answer}가지'],'answerContract':'single-number','solutionSteps':steps,'solution':' '.join(steps),'learningPoint':'변마다 놓인 점의 수를 확인한 뒤 서로 다른 세 변 조합별 곱을 구하고, 겹치지 않는 경우를 더하기','learningLocation':'활용 8회 · 원문 25번 · 사각형 변 위 점으로 삼각형 만들기','verification':{'primaryMethod':'변 조합마다 각 변 점 개수의 곱을 계산하고 해당되는 조합의 곱을 더한다.','independentMethod':'원본 점 12개를 꼭짓점 조합으로 전수열거해 각 점이 서로 다른 세 변에 놓이는 조합 수를 확인한다.','parameters':{'sidePointCounts':counts,'allowedSideTriples':keys,'tripletCounts':{k:group_count(k) for k in keys},'answer':answer},'independentSuite':'qa/applied8-q25-independent-validate.py','sourceExamPage':5,'sourceExamFile':EXAM.name,'sourceAnswerPage':5,'sourceDrawingCompared':True,'sourceDrawingPresent':True,'sourceDrawingPixelExactCrop':True,'officialAnswerStatus':'The available Drive answer PDF page is an unmarked duplicate of the question page. The original count was independently enumerated from the exact 12 interior dots in the source drawing.','studentDifficultyMeasured':False},'difficultyEvidence':{'basis':'source-point-band','label':'상','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,'rationale':'활용 8회 원문 25번은 23~30번의 4.2점 배점대다. 활용 난도는 배점대만 적용한다.'}}
  items.append(item);results.append({'variant':i,'allowedTriples':keys,'tripletCounts':{k:group_count(k) for k in keys},'answer':answer})
 data['items']=[x for x in data['items'] if x['sourceNo']!=25]+items;data['items'].sort(key=lambda x:(x['sourceNo'],x['variantNo']));data['version']=VERSION;data['itemCount']=len(data['items']);data['availableSourceNos']=sorted(set(data['availableSourceNos']+[25]));data['pendingSourceNos']=[n for n in range(1,31) if n not in data['availableSourceNos']]
 index['version']=VERSION;index['itemCount']=data['itemCount'];index['pendingSourceNos']=data['pendingSourceNos'];index['items']=[x for x in index['items'] if x['sourceNo']!=25]+[{'sourceNo':25,'genId':'applied8-q25','area':'도형','subarea':'평면도형','detailType':'사각형 변 위 점에서 서로 다른 세 변을 골라 삼각형 만들기 가짓수','pointBand':'4.2','reviewStatus':'verified','variantCount':9}];index['items'].sort(key=lambda x:x['sourceNo'])
 DATA.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');INDEX.write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n')
 review={'sourceExam':{'file':EXAM.name,'sha256':sha(EXAM),'page':5,'questionNo':25,'directVisualReview':True,'sourcePageRender':'.private-work/hw-expansion-20261023/hw8/source-review/q22-source.png','directQuestionCrop':'.private-work/hw-expansion-20261023/hw8/source-review/q25-source-crop.png','exactDiagramCrop':str(CROP.relative_to(ROOT)),'sidePointCounts':counts,'prompt':'Rectangle ㄱㄴㄷㄹ has 12 interior dots on the sides; choose three dots on three different sides and form triangles.'},'answerCandidate':{'file':ANSWER.name,'sha256':sha(ANSWER),'page':5,'directVisualReview':True,'render':'.private-work/hw-expansion-20261023/hw8/source-review/q25-answer-candidate-crop.png','containsAnswers':False,'comparison':'The available Drive answer PDF page is an unmarked duplicate; answer line is blank.'},'sourceIndependentSolution':{'tripletCounts':{k:group_count(k) for k in TRIPLES},'sum':'36+18+24+24','answer':sum(group_count(k) for k in TRIPLES)},'variants':results,'variantCount':9,'variantsIndependentlyCalculated':True,'sourceDrawingReusedPixelExact':True,'newSourceTypes':0,'difficulty':'4.2-point band only = high'}
 REVIEW.write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
 print('Added Q25 9 source-figure exact variants. Original answer 102, variants:',[x['answer'] for x in results],'; inventory',data['itemCount'],data['availableSourceNos'])
if __name__=='__main__':main()

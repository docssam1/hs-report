#!/usr/bin/env python3
"""Add nine existing color-token value types from Applied 5 Q9."""
import hashlib,itertools,json
from pathlib import Path
from PIL import Image
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1];W=ROOT/'.private-work/hw-expansion-20261023/hw5'
DATA=ROOT/'bank/data/applied5-expanded.json';INDEX=ROOT/'bank/data/applied5-expanded-index.json'
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 5회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 5회 답안.pdf')
SRC_RENDER=W/'q05-source/exam-p2-2.png';ANS_RENDER=W/'q09-source/answer-9-09.png'
VERSION='20261025-applied5-expansion-q03-q05-q06-q09-r5'
BASE_ROWS=[x for x in itertools.product(range(1,4),repeat=3) if sum(x)==5]
def det(a,b,c):return a[0]*(b[1]*c[2]-b[2]*c[1])-a[1]*(b[0]*c[2]-b[2]*c[0])+a[2]*(b[0]*c[1]-b[1]*c[0])
TRIPLES=[t for t in itertools.permutations(BASE_ROWS,3) if det(*t)!=0 and t!=((2,2,1),(2,1,2),(1,2,2))][:9]
TARGETS=[(0,2,3),(3,0,2),(2,3,0),(0,1,4),(4,0,1),(1,4,0),(0,4,1),(4,1,0),(1,0,4)]
WEIGHTS=[(4,6,9),(7,3,8),(5,9,4),(8,5,11),(3,7,12),(9,4,6),(6,10,3),(11,5,7),(4,12,8)]

def dot(a,b):return sum(x*y for x,y in zip(a,b))
def linear(row):return '+'.join(f'{n}{c}' for n,c in zip(row,['흰색','검은색','회색']) if n)
def equation(row,total):return linear(row)+'='+str(total)
def difference(a,b,total):
 coeff=[x-y for x,y in zip(a,b)];terms=[]
 for n,c in zip(coeff,['흰색','검은색','회색']):
  if not n:continue
  mag=abs(n);term=(str(mag) if mag!=1 else '')+c
  if not terms:terms.append(('-' if n<0 else '')+term)
  else:terms.append(('−' if n<0 else '+')+term)
 return ''.join(terms)+'='+str(total)
def svg(counts,totals):
 colors=['#fff','#191511','#a9a9a9'];stroke='#191511';out=['<svg xmlns="http://www.w3.org/2000/svg" width="330" height="175" viewBox="0 0 330 175" role="img" aria-label="서로 다른 색 원 다섯 개와 각 합">']
 for j,row in enumerate(counts):
  seq=[0]*row[0]+[1]*row[1]+[2]*row[2]
  for k,color in enumerate(seq):
   x=32+j*80+k*4;y=20+k*25
   out.append(f'<circle cx="{x}" cy="{y}" r="13" fill="{colors[color]}" stroke="{stroke}" stroke-width="1.4"/>')
  out.append(f'<text x="{45+j*80}" y="165" text-anchor="middle" font-family="serif" font-size="16" fill="#191511">{totals[j]}</text>')
 out.append('</svg>');return ''.join(out)
def unique_weights(p):
 rows=p['counts'][:3];totals=p['knownTotals'][:3]
 return [(w,b,g) for w,b,g in itertools.product(range(0,31),repeat=3) if all(dot(r,(w,b,g))==s for r,s in zip(rows,totals))]
def make_item(no,rows,target,weights):
 counts=rows+(target,);totals=[dot(r,weights) for r in counts]
 assert det(*rows)!=0 and counts[3] not in rows
 p={'counts':[list(x) for x in counts],'knownTotals':totals[:3],'targetCounts':list(target),'hiddenWeights':list(weights),'colors':['흰색','검은색','회색']}
 sols=unique_weights(p);assert sols==[weights],(no,sols,weights)
 w,b,g=weights
 steps=[
  f"흰색 원의 값을 W, 검은색 원의 값을 B, 회색 원의 값을 G라고 두면 세 그림은 {equation(rows[0],totals[0])}, {equation(rows[1],totals[1])}, {equation(rows[2],totals[2])}입니다.",
  f"첫째 식과 둘째 식의 차는 {difference(rows[0],rows[1],totals[0]-totals[1])}, 첫째 식과 셋째 식의 차는 {difference(rows[0],rows[2],totals[0]-totals[2])}입니다. 세 식을 함께 풀면 W={w}, B={b}, G={g}입니다.",
  f"물음표 그림에는 흰색 원 {target[0]}개, 검은색 원 {target[1]}개, 회색 원 {target[2]}개가 있습니다. 따라서 합은 {target[0]}×{w}+{target[1]}×{b}+{target[2]}×{g}={totals[3]}입니다."
 ]
 return {'id':f'applied5-q09-v{no}','genId':'applied5-q09','sourceSet':'applied','sourceRound':5,'sourceNo':9,'variantNo':no,'reviewStatus':'verified',
  'area':'수와 식','subarea':'규칙과 대응','detailType':'색깔별 값의 합으로 수 찾기','pointBand':'2.7',
  'text':'?에 들어갈 숫자는 무엇일까요?','asset':{'kind':'svg','src':f'assets/applied5/q09-v{no}.svg','description':'흰색·검은색·회색 원 다섯 개와 세 수의 합'},
  'answer':str(totals[3]),'answerParts':[totals[3]],'answerLabels':['답'],'acceptedAnswers':[str(totals[3])],'answerContract':'ordered-parts','solutionSteps':steps,'solution':' '.join(steps),
  'learningPoint':'각 색깔에 대응하는 값을 세 합에서 구한 뒤 목표 그림에 적용하기','learningLocation':'활용 5회 · 원문 9번 · 규칙과 대응',
  'verification':{'primaryMethod':'세 개의 선형 합을 정수 전수 대입해 색 값의 유일성을 찾고 목표 원 개수에 적용한다.','independentMethod':'3×3 계수행렬의 비영 행렬식과 유리수 연립방정식으로 색 값의 유일성을 확인한다.','parameters':p,'independentSuite':'qa/applied5-q09-independent-validate.py','sourceExamPage':2,'sourceAnswerPage':9,'sourceExamFile':EXAM.name,'sourceAnswerFile':ANSWER.name,'sourceExamDriveFileId':'1x7CevkWByUrXPqfbV5xTHidJPNDrbuJp','sourceAnswerDriveFileId':'1QGjWnEBjULxwy4BBX8tLutpGbjQfEh05','sourceDrawingCompared':True,'sourceDrawingType':'five-diagonal-color-circles','sourceAnswerStatus':'Drive answer PDF page 9 has teacher annotation ?=45; independent equations give white=8, black=3, gray=13; 2B+3G=45.','studentDifficultyMeasured':False},
  'difficultyEvidence':{'basis':'source-point-band','label':'하','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,'rationale':'활용 5회 원문 9번은 1~12번의 2.7점 배점대이므로 활용 난도는 배점대만 적용한다.'}}
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
 d=json.loads(DATA.read_text());idx=json.loads(INDEX.read_text())
 if any(x['sourceNo']==9 for x in d['items']):raise SystemExit('Applied5 Q9 already exists; refusing to duplicate.')
 assert 9 in d['pendingSourceNos'] and 9 not in d['availableSourceNos']
 assert len(PdfReader(str(EXAM)).pages)==6 and len(PdfReader(str(ANSWER)).pages)==31
 original={'counts':[[2,2,1],[2,1,2],[1,2,2],[0,2,3]],'knownTotals':[35,45,40],'targetCounts':[0,2,3],'hiddenWeights':[8,3,13]}
 assert unique_weights(original)==[(8,3,13)] and dot((0,2,3),(8,3,13))==45
 assert len(TRIPLES)==len(TARGETS)==len(WEIGHTS)==9
 items=[]
 for i,(rows,target,weights) in enumerate(zip(TRIPLES,TARGETS,WEIGHTS),1):
  item=make_item(i,rows,target,weights);items.append(item)
  (ROOT/'bank/assets/applied5'/f'q09-v{i}.svg').write_text(svg(tuple(tuple(x) for x in item['verification']['parameters']['counts']),[dot(r,weights) for r in item['verification']['parameters']['counts']]),encoding='utf-8')
 assert len({tuple(tuple(r) for r in x['verification']['parameters']['counts'][:3]) for x in items})==9
 source=Image.open(SRC_RENDER);box=(45,1740,990,2550);source.crop(box).save(W/'q09-source/exam-q09-crop.png')
 answer=Image.open(ANS_RENDER);answer.crop((80,0,1740,1340)).save(W/'q09-source/answer-q09-proof.png')
 pos=max(i for i,x in enumerate(d['items']) if x['sourceNo']==7)+1;d['items'][pos:pos]=items
 d['version']=VERSION;d['availableSourceNos']=sorted(d['availableSourceNos']+[9]);d['pendingSourceNos']=[n for n in d['pendingSourceNos'] if n!=9]
 d['reviewSummary'].update({'independentMathCount':108,'sourceTypes':12,'variantsPerType':9,'sourceDrawingCount':3})
 ipos=next(i for i,x in enumerate(idx['items']) if x['sourceNo']==10)
 idx['items'].insert(ipos,{'sourceNo':9,'genId':'applied5-q09','area':'수와 식','subarea':'규칙과 대응','detailType':'색깔별 값의 합으로 수 찾기','pointBand':'2.7','reviewStatus':'verified','variantCount':9})
 idx['version']=VERSION;idx['itemCount']=len(d['items']);idx['pendingSourceNos']=list(d['pendingSourceNos'])
 DATA.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');INDEX.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n')
 review={'sourceExam':{'file':EXAM.name,'driveFileId':'1x7CevkWByUrXPqfbV5xTHidJPNDrbuJp','bytes':EXAM.stat().st_size,'sha256':sha(EXAM),'page':2,'questionNo':9,'directVisualReview':True,'stem':'?에 들어갈 숫자는 무엇일까요?','groups':[[2,2,1],[2,1,2],[1,2,2],[0,2,3]],'givenTotals':[35,45,40,None]},
 'sourceAnswer':{'file':ANSWER.name,'driveFileId':'1QGjWnEBjULxwy4BBX8tLutpGbjQfEh05','bytes':ANSWER.stat().st_size,'sha256':sha(ANSWER),'page':9,'directVisualReview':True,'teacherAnswer':45,'weights':{'white':8,'black':3,'gray':13}},
 'sourceFigure':{'render':str(SRC_RENDER.relative_to(ROOT)),'crop':str((W/'q09-source/exam-q09-crop.png').relative_to(ROOT)),'cropBoxPixels':list(box),'pixelExactCrop':True,'sha256':sha(W/'q09-source/exam-q09-crop.png')},
 'answerProof':{'render':str(ANS_RENDER.relative_to(ROOT)),'crop':str((W/'q09-source/answer-q09-proof.png').relative_to(ROOT)),'sha256':sha(W/'q09-source/answer-q09-proof.png')},
 'originalSolution':{'weights':[8,3,13],'knownTotals':[35,45,40],'answer':45,'uniqueSolutionCount':1},'variants':[{'variantNo':x['variantNo'],'counts':x['verification']['parameters']['counts'],'knownTotals':x['verification']['parameters']['knownTotals'],'weights':x['verification']['parameters']['hiddenWeights'],'answer':x['answer'],'validAssignmentCount':1} for x in items],'variantCount':9,'newSourceTypes':0,'difficulty':'2.7-point band only = low'}
 (W/'q09-source-answer-review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
 print(f'Added Applied5 Q9: 9 color-count diagrams with unique integer color values; original answer 45; data items {len(d["items"])}.')
if __name__=='__main__':main()

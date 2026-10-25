#!/usr/bin/env python3
"""Add nine 6x5x5-through-line block-count variants for Applied 5 Q15."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.private-work/hw-expansion-20261023/hw5';SRC=WORK/'q15-source-r10'
DATA_FILE=ROOT/'bank/data/applied5-expanded.json';INDEX_FILE=ROOT/'bank/data/applied5-expanded-index.json';ASSET_DIR=ROOT/'bank/assets/applied5'
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 5회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 5회 답안.pdf')
EXAM_ID='1x7CevkWByUrXPqfbV5xTHidJPNDrbuJp';ANSWER_ID='1QGjWnEBjULxwy4BBX8tLutpGbjQfEh05'
# Each tuple is four front (x,z) marks, four top (x,y) marks and three right (y,z) marks.
PATTERNS=[
 ([(1,2),(2,2),(3,3),(4,3)],[(3,2),(3,3),(4,2),(4,3)],[(2,1),(2,2),(3,2)]), # 44
 ([(1,1),(1,3),(2,1),(4,3)],[(1,2),(1,3),(2,2),(4,1)],[(1,1),(2,1),(2,2)]), # 45
 ([(1,1),(3,2),(3,3),(4,2)],[(1,3),(2,1),(3,3),(4,3)],[(1,1),(3,1),(3,3)]), # 46
 ([(2,2),(3,1),(3,3),(4,2)],[(2,2),(2,3),(3,2),(4,1)],[(1,2),(2,1),(3,2)]), # 47
 ([(1,2),(2,3),(3,3),(4,3)],[(2,3),(3,2),(4,1),(4,3)],[(1,1),(3,1),(3,3)]), # 48
 ([(1,1),(1,2),(3,2),(4,1)],[(2,1),(3,3),(4,2),(4,3)],[(2,2),(2,3),(3,3)]), # 49
 ([(2,3),(3,1),(4,1),(4,2)],[(1,1),(1,2),(2,3),(3,2)],[(1,2),(2,1),(3,3)]), # 50
 ([(1,1),(1,2),(1,3),(4,3)],[(2,3),(3,1),(3,3),(4,1)],[(2,2),(2,3),(3,2)]), # 51
 ([(1,2),(3,1),(4,1),(4,2)],[(1,3),(2,3),(3,2),(3,3)],[(1,3),(2,1),(2,3)]), # 52
]
SOURCE={'front':[(1,3),(4,3),(2,2),(4,1)],'top':[(1,1),(3,1),(4,2),(3,3)],'right':[(1,3),(4,3),(2,1)]}

def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def sets(front,top,right):
 a={(x,y,z) for x,z in front for y in range(5)}
 b={(x,y,z) for x,y in top for z in range(5)}
 c={(x,y,z) for y,z in right for x in range(6)}
 return a,b,c
def count(front,top,right):
 a,b,c=sets(front,top,right)
 return len(a|b|c),{'frontThrough':len(a),'topThrough':len(b),'rightThrough':len(c),'frontTopOverlap':len(a&b),'frontRightOverlap':len(a&c),'topRightOverlap':len(b&c),'tripleOverlap':len(a&b&c)}
def svg(front,top,right):
 W,H=700,470;parts=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">','<rect width="100%" height="100%" fill="#fff"/>']
 def poly(points,fill):
  pts=' '.join(f'{x},{y}' for x,y in points);parts.append(f'<polygon points="{pts}" fill="{fill}"/>')
 def fill(color='#27241f'):
  for x,z in front:
   row=4-z;poly([(90+x*60,125+row*60),(150+x*60,125+row*60),(150+x*60,185+row*60),(90+x*60,185+row*60)],color)
  for x,y in top:
   poly([(90+x*60+y*30,125-y*20),(150+x*60+y*30,125-y*20),(150+x*60+(y+1)*30,125-(y+1)*20),(90+x*60+(y+1)*30,125-(y+1)*20)],color)
  for y,z in right:
   row=4-z;poly([(450+y*30,125-y*20+row*60),(480+y*30,105-y*20+row*60),(480+y*30,165-y*20+row*60),(450+y*30,185-y*20+row*60)],color)
 fill()
 # Draw the same 6-wide by 5-high front, 6-by-5 top and 5-by-5 side grid as the source.
 for i in range(7):parts.append(f'<path d="M {90+60*i} 125 V 425" stroke="#28241e" stroke-width="2"/>')
 for j in range(6):parts.append(f'<path d="M 90 {125+60*j} H 450" stroke="#28241e" stroke-width="2"/>')
 for i in range(7):parts.append(f'<path d="M {90+60*i} 125 L {240+60*i} 25" stroke="#28241e" stroke-width="2"/>')
 for j in range(6):parts.append(f'<path d="M {90+30*j} {125-20*j} L {450+30*j} {125-20*j}" stroke="#28241e" stroke-width="2"/>')
 for j in range(6):parts.append(f'<path d="M {450+30*j} {125-20*j} L {450+30*j} {425-20*j}" stroke="#28241e" stroke-width="2"/>')
 for z in range(6):parts.append(f'<path d="M 450 {125+60*z} L 600 {25+60*z}" stroke="#28241e" stroke-width="2"/>')
 parts.append('</svg>');return ''.join(parts)

def main():
 data=json.loads(DATA_FILE.read_text());assert 15 in data['pendingSourceNos'] and not any(q['sourceNo']==15 for q in data['items'])
 assert all((SRC/n).is_file() for n in ['exam-q15-crop.png','answer-q15-crop.png']) and EXAM.is_file() and ANSWER.is_file()
 original,source_parts=count(SOURCE['front'],SOURCE['top'],SOURCE['right']);assert original==49,(original,source_parts)
 assert [len(SOURCE[k]) for k in ['front','top','right']]==[4,4,3]
 variants=[];proofs=[]
 for i,(front,top,right) in enumerate(PATTERNS,1):
  assert [len(front),len(top),len(right)]==[4,4,3]
  assert all(1<=x<=4 and 1<=z<=3 for x,z in front)
  assert all(1<=x<=4 and 1<=y<=3 for x,y in top)
  assert all(1<=y<=3 and 1<=z<=3 for y,z in right)
  answer,detail=count(front,top,right)
  assert answer==43+i
  asset=ASSET_DIR/f'q15-v{i}.svg';asset.write_text(svg(front,top,right),encoding='utf-8')
  steps=[f'앞면의 검은 칸 4개에서 깊이 방향으로 이어지는 블록은 4×5=20개입니다.',
   f'윗면의 검은 칸 4개에서 높이 방향으로 이어지는 블록은 4×5=20개이고, 오른쪽 면의 검은 칸 3개에서 가로 방향으로 이어지는 블록은 3×6=18개입니다.',
   f'세 방향에서 겹쳐 세어진 블록을 정리합니다. 앞면-윗면 겹침 {detail["frontTopOverlap"]}개, 앞면-오른쪽 면 겹침 {detail["frontRightOverlap"]}개, 윗면-오른쪽 면 겹침 {detail["topRightOverlap"]}개를 빼고, 세 면에서 동시에 겹치는 {detail["tripleOverlap"]}개를 다시 더합니다.',
   f'따라서 검은 블록은 20+20+18−{detail["frontTopOverlap"]}−{detail["frontRightOverlap"]}−{detail["topRightOverlap"]}+{detail["tripleOverlap"]}={answer}개입니다.']
  params={'dimensions':[6,5,5],'frontMarks':[list(v) for v in front],'topMarks':[list(v) for v in top],'rightMarks':[list(v) for v in right],**detail,'answer':answer}
  variants.append({'id':f'applied5-q15-v{i}','genId':'applied5-q15','sourceSet':'applied','sourceRound':5,'sourceNo':15,'variantNo':i,'reviewStatus':'verified','area':'도형','subarea':'입체도형과 블록','detailType':'세 방향의 검은 줄이 이어진 블록 수 세기','pointBand':'3.4',
   'text':'아래 그림은 150개의 블록을 쌓아 놓은 것이다. 검은 블록은 표면에 보이는 면에서 반대 면까지 한 줄로 이어져 있다. 검은 블록의 개수를 구하시오.',
   'asset':{'kind':'svg','src':f'assets/applied5/q15-v{i}.svg','description':'150개 블록 직육면체의 세 면과 검은 블록 표시'},'answer':str(answer),'answerParts':[answer],'answerLabels':['검은 블록 수'],'acceptedAnswers':[str(answer)],'answerContract':'ordered-parts','solutionSteps':steps,'solution':' '.join(steps),
   'learningPoint':'세 방향으로 이어지는 블록 줄의 합집합에서 겹친 블록을 중복 없이 센다.','learningLocation':'활용 5회 · 원문 15번 · 세 방향의 블록 줄과 겹침',
   'verification':{'primaryMethod':'각 검은 표면 칸에서 반대 면까지 완성되는 3차원 블록 좌표 집합의 합집합을 센다.','independentMethod':'세 줄 집합의 포함-배제 원리로 세 쌍의 겹침을 빼고 세 방향 공통 겹침을 더한다.','parameters':params,'independentSuite':'qa/applied5-q15-independent-validate.py',
    'sourceExamPage':3,'sourceAnswerPage':15,'sourceExamFile':EXAM.name,'sourceAnswerFile':ANSWER.name,'sourceExamDriveFileId':EXAM_ID,'sourceAnswerDriveFileId':ANSWER_ID,'sourceDrawingCompared':True,
    'variantDrawingType':'6x5x5-cuboid-with-four-top-four-front-three-side-lines','sourceAnswerStatus':'원문 답안 PDF p15 교사 표시 답 49. 원문 표면의 세 방향 검은 줄을 블록 좌표 합집합으로 계산해 49를 재현했다.','studentDifficultyMeasured':False},
   'difficultyEvidence':{'basis':'source-point-band','label':'중','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,'rationale':'활용 5회 원문 15번은 13~22번 3.4점 배점대이므로 활용 난도는 배점대만 적용한다.'}})
  proofs.append({'variantNo':i,**params})
 data['items'].extend(variants);data['items'].sort(key=lambda q:(q['sourceNo'],q['variantNo']))
 data['availableSourceNos'].append(15);data['availableSourceNos'].sort();data['pendingSourceNos'].remove(15)
 data['version']='20261025-applied5-expansion-q03-q05-q06-q08-q09-q11-q12-q14-q15-r10'
 sm=data['reviewSummary'];sm.update({'independentMathCount':len(data['items']),'sourceTypes':len(data['availableSourceNos']),'sourceDrawingCount':8})
 DATA_FILE.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
 index={'version':data['version'],'sourceSet':'applied','sourceRound':5,'itemCount':len(data['items']),'pendingSourceNos':data['pendingSourceNos'],'items':[]}
 for no in data['availableSourceNos']:
  q=next(q for q in data['items'] if q['sourceNo']==no);index['items'].append({'sourceNo':no,'genId':q['genId'],'area':q['area'],'subarea':q['subarea'],'detailType':q['detailType'],'pointBand':q['pointBand'],'reviewStatus':'verified','variantCount':9})
 INDEX_FILE.write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n')
 review={'sourceExam':{'file':EXAM.name,'driveFileId':EXAM_ID,'bytes':EXAM.stat().st_size,'sha256':sha(EXAM),'page':3,'questionNo':15,'directVisualReview':True,'cropPath':str((SRC/'exam-q15-crop.png').relative_to(ROOT)),'dimensions':[6,5,5],'totalBlocks':150,'frontMarks':SOURCE['front'],'topMarks':SOURCE['top'],'rightMarks':SOURCE['right'],'axisDefinition':'x: 6 columns across the front; y: 5 depth from front to back; z: 5 rows from bottom to top.'},
 'sourceAnswer':{'file':ANSWER.name,'driveFileId':ANSWER_ID,'bytes':ANSWER.stat().st_size,'sha256':sha(ANSWER),'page':15,'directVisualReview':True,'teacherAnswer':49,'cropPath':str((SRC/'answer-q15-crop.png').relative_to(ROOT))},
 'sourceIndependentCheck':{'lineUnionCount':original,'lineLengths':[20,20,18],'pairwiseIntersections':[source_parts['frontTopOverlap'],source_parts['frontRightOverlap'],source_parts['topRightOverlap']],'tripleIntersection':source_parts['tripleOverlap'],'inclusionExclusion':f'20+20+18-{source_parts["frontTopOverlap"]}-{source_parts["frontRightOverlap"]}-{source_parts["topRightOverlap"]}+{source_parts["tripleOverlap"]}={original}'},
 'newVariants':9,'difficulty':'3.4 point band only = medium','variants':proofs,'dataVersion':data['version']}
 (WORK/'q15-source-answer-review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
 print(f'Added Applied5 Q15: 9 variants answers {[p["answer"] for p in proofs]}, source answer 49 reproduced, total {len(data["items"])}.')
if __name__=='__main__':main()

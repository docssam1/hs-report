#!/usr/bin/env python3
"""Add nine exact-count 3x3 lattice quadrilateral variants for Applied 5 Q14."""
import hashlib, json
from pathlib import Path
from fractions import Fraction as F
from itertools import combinations, permutations

ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.private-work/hw-expansion-20261023/hw5'
SRC=WORK/'q14-source-r9'
DATA_FILE=ROOT/'bank/data/applied5-expanded.json'
INDEX_FILE=ROOT/'bank/data/applied5-expanded-index.json'
ASSET_DIR=ROOT/'bank/assets/applied5'
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 5회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 5회 답안.pdf')
EXAM_ID='1x7CevkWByUrXPqfbV5xTHidJPNDrbuJp'
ANSWER_ID='1QGjWnEBjULxwy4BBX8tLutpGbjQfEh05'
# Endpoints are lattice intersections (x=0..3, y=0..3). Each diagram has a short cell diagonal and a longer diagonal, matching the source's visual structure.
DIAGRAMS=[
 (((0,0),(1,1)),((1,2),(3,1))),  # 49
 (((0,0),(1,1)),((0,1),(1,3))),  # 50
 (((0,0),(1,1)),((0,1),(2,0))),  # 51
 (((0,1),(1,0)),((0,0),(2,2))),  # 52
 (((0,1),(1,0)),((0,2),(2,0))),  # 53
 (((0,1),(1,2)),((0,3),(3,0))),  # 57
 (((0,0),(1,1)),((0,3),(3,0))),  # 58
 (((0,0),(1,1)),((0,1),(3,2))),  # 59
 (((0,0),(1,1)),((0,2),(3,0))),  # 60
]

def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def segment(a,b,name):return (tuple(map(F,a)),tuple(map(F,b)),name)
def intersect(A,B):
 p,q,_=A;r,s,_=B;v=(q[0]-p[0],q[1]-p[1]);w=(s[0]-r[0],s[1]-r[1]);den=v[0]*w[1]-v[1]*w[0]
 if not den:return None
 t=((r[0]-p[0])*w[1]-(r[1]-p[1])*w[0])/den;u=((r[0]-p[0])*v[1]-(r[1]-p[1])*v[0])/den
 if 0<=t<=1 and 0<=u<=1:return (p[0]+t*v[0],p[1]+t*v[1])
 return None
def turn(a,b,c):return (b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0])
def enumerate_quads(diags):
 lines=[segment((x,0),(x,3),f'v{x}') for x in range(4)]+[segment((0,y),(3,y),f'h{y}') for y in range(4)]+[segment(*d,f'd{i+1}') for i,d in enumerate(diags)]
 polys={}
 for ids in combinations(range(len(lines)),4):
  ls=[lines[i] for i in ids]
  for perm in permutations((1,2,3)):
   order=(0,)+perm
   if order[1]>order[-1]:continue
   vertices=[]
   for j in range(4):
    p=intersect(ls[order[j]],ls[order[(j+1)%4]])
    if p is None:break
    vertices.append(p)
   if len(vertices)!=4 or len(set(vertices))!=4:continue
   ts=[turn(vertices[j],vertices[(j+1)%4],vertices[(j+2)%4]) for j in range(4)]
   if not(all(t>0 for t in ts) or all(t<0 for t in ts)):continue
   seq=tuple(vertices);rots=[seq[i:]+seq[:i] for i in range(4)];rev=tuple(reversed(seq));rots += [rev[i:]+rev[:i] for i in range(4)]
   polys[min(rots)]=sum(lines[i][2].startswith('d') for i in ids)
 from collections import Counter
 c=Counter(polys.values())
 return len(polys),[c.get(k,0) for k in range(3)]
def svg(diags):
 W=390;pad=30;cell=100;end=pad+3*cell
 p=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="360" viewBox="0 0 {W} 360">','<rect width="100%" height="100%" fill="#fff"/>']
 # Grid lines, matching the source's 3 by 3 square lattice.
 for i in range(4):
  pos=pad+i*cell;p += [f'<path d="M {pos} {pad} V {end}" stroke="#302c26" stroke-width="2.2"/>',f'<path d="M {pad} {pos} H {end}" stroke="#302c26" stroke-width="2.2"/>']
 for a,b in sum(([x[0],x[1]] for x in diags),[]):pass
 for a,b in diags:
  x1=pad+a[0]*cell;y1=end-a[1]*cell;x2=pad+b[0]*cell;y2=end-b[1]*cell
  p.append(f'<path d="M {x1} {y1} L {x2} {y2}" stroke="#302c26" stroke-width="2.5"/>')
 p.append('</svg>');return ''.join(p)

def main():
 data=json.loads(DATA_FILE.read_text());assert 14 in data['pendingSourceNos'] and not any(q['sourceNo']==14 for q in data['items'])
 assert all((SRC/n).is_file() for n in ['exam-q14-crop.png','answer-q14-crop.png']) and EXAM.is_file() and ANSWER.is_file()
 assert len(DIAGRAMS)==9 and len({str(x) for x in DIAGRAMS})==9
 # Source drawing directly inspected: 3x3 grid, short diagonal upper-left cell, long diagonal from lower interior to right edge.
 source=(( (0,3),(1,2)),((2,0),(3,2)))
 source_count,source_categories=enumerate_quads(source)
 assert source_count==49 and source_categories==[36,13,0],(source_count,source_categories)
 variants=[];proofs=[]
 for i,diags in enumerate(DIAGRAMS,1):
  answer,categories=enumerate_quads(diags);assert categories[0]==36 and sum(categories)==answer
  asset=ASSET_DIR/f'q14-v{i}.svg';asset.write_text(svg(diags),encoding='utf-8')
  extras=categories[1]+categories[2]
  steps=[f'세로선 4개 중 2개와 가로선 4개 중 2개를 고르면 격자선만으로 된 직사각형은 6×6=36개입니다.',
         f'대각선이 변으로 들어가는 사각형은 대각선 1개를 변으로 쓰는 것 {categories[1]}개와 두 대각선을 모두 변으로 쓰는 것 {categories[2]}개입니다. 따라서 추가 사각형은 {extras}개입니다.',
         f'모두 {36}+{categories[1]}+{categories[2]}={answer}개입니다.']
  variants.append({'id':f'applied5-q14-v{i}','genId':'applied5-q14','sourceSet':'applied','sourceRound':5,'sourceNo':14,'variantNo':i,'reviewStatus':'verified',
   'area':'도형','subarea':'격자에서 사각형 세기','detailType':'격자와 대각선으로 이루어진 사각형의 완전 계수','pointBand':'3.4',
   'text':'다음 그림에서 찾을 수 있는 크고 작은 사각형은 모두 몇 개인가?','asset':{'kind':'svg','src':f'assets/applied5/q14-v{i}.svg','description':'3×3 정사각 격자와 두 대각선'},
   'answer':str(answer),'answerParts':[answer],'answerLabels':['사각형 수'],'acceptedAnswers':[str(answer)],'answerContract':'ordered-parts','solutionSteps':steps,'solution':' '.join(steps),
   'learningPoint':'격자선으로 된 직사각형과 대각선을 변으로 포함하는 사각형을 빠짐없이 분류해 센다.',
   'learningLocation':'활용 5회 · 원문 14번 · 격자와 대각선에서 사각형 세기',
   'verification':{'primaryMethod':'유한한 선분들의 교점을 정확한 분수 좌표로 구하고, 네 선분을 변으로 하는 볼록 사각형을 중복 없이 열거한다.',
    'independentMethod':'모든 네 직선 지지선 조합과 순환 순서를 탐색하고, 각 변의 교점이 유한 선분 위에 있는 경우만 인정한 뒤 정점 순환동치를 제거한다.',
    'parameters':{'gridSize':[3,3],'diagonals':[[list(a),list(b)] for a,b in diags],'quadrilateralCountsByDiagonalSides':categories,'answer':answer},
    'independentSuite':'qa/applied5-q14-independent-validate.py','sourceExamPage':3,'sourceAnswerPage':14,'sourceExamFile':EXAM.name,'sourceAnswerFile':ANSWER.name,
    'sourceExamDriveFileId':EXAM_ID,'sourceAnswerDriveFileId':ANSWER_ID,'sourceDrawingCompared':True,'variantDrawingType':'3x3-square-grid-with-short-and-long-diagonals',
    'sourceAnswerStatus':'원문 답안 PDF p14 교사 표시 49. 정확한 분수 좌표의 유한 선분 교점과 볼록 사각형 열거로 36개 직사각형+대각선 포함 13개를 독립 재현했다.','studentDifficultyMeasured':False},
   'difficultyEvidence':{'basis':'source-point-band','label':'중','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,
    'rationale':'활용 5회 원문 14번의 3.4점 배점대이므로 활용 난도는 배점대만 적용한다.'}})
  proofs.append({'variantNo':i,'diagonals':[[list(a),list(b)] for a,b in diags],'quadrilateralCountsByDiagonalSides':categories,'answer':answer})
 data['items'].extend(variants);data['items'].sort(key=lambda q:(q['sourceNo'],q['variantNo']))
 data['availableSourceNos'].append(14);data['availableSourceNos'].sort();data['pendingSourceNos'].remove(14)
 data['version']='20261025-applied5-expansion-q03-q05-q06-q08-q09-q11-q12-q14-r9'
 sm=data['reviewSummary'];sm.update({'independentMathCount':len(data['items']),'sourceTypes':len(data['availableSourceNos']),'sourceDrawingCount':7})
 DATA_FILE.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
 index={'version':data['version'],'sourceSet':'applied','sourceRound':5,'itemCount':len(data['items']),'pendingSourceNos':data['pendingSourceNos'],'items':[]}
 for no in data['availableSourceNos']:
  q=next(q for q in data['items'] if q['sourceNo']==no);index['items'].append({'sourceNo':no,'genId':q['genId'],'area':q['area'],'subarea':q['subarea'],'detailType':q['detailType'],'pointBand':q['pointBand'],'reviewStatus':'verified','variantCount':9})
 INDEX_FILE.write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n')
 review={'sourceExam':{'file':EXAM.name,'driveFileId':EXAM_ID,'bytes':EXAM.stat().st_size,'sha256':sha(EXAM),'page':3,'questionNo':14,'directVisualReview':True,'teacherFigureCrop':str((SRC/'exam-q14-crop.png').relative_to(ROOT)),'grid':[3,3],'diagonals':[[[0,3],[1,2]],[[2,0],[3,2]]]},
 'sourceAnswer':{'file':ANSWER.name,'driveFileId':ANSWER_ID,'bytes':ANSWER.stat().st_size,'sha256':sha(ANSWER),'page':14,'directVisualReview':True,'teacherAnswer':49,'teacherMarkCrop':str((SRC/'answer-q14-crop.png').relative_to(ROOT))},
 'sourceIndependentCheck':{'gridRectangles':36,'quadrilateralsUsingOneDiagonal':13,'quadrilateralsUsingBothDiagonals':0,'total':source_count,'categories':source_categories},
 'enumeration':'Exact rational intersections of all finite grid and diagonal segments; enumerate every four-support-line cycle, retain convex polygons with four distinct vertices, canonicalize rotations/reversal.',
 'newVariants':9,'difficulty':'3.4 point band only = medium','variants':proofs,'dataVersion':data['version']}
 (WORK/'q14-source-answer-review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
 print(f'Added Applied5 Q14: 9 variants, answers {[p["answer"] for p in proofs]}, total={len(data["items"])}, source answer 49 independently reproduced.')
if __name__=='__main__':main()

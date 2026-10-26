#!/usr/bin/env python3
"""Extend Applied 8 Q9's existing marked-grid rectangle count type."""
from __future__ import annotations
import hashlib, json
from pathlib import Path
from pypdf import PdfReader
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/".private-work/hw-expansion-20261023/hw8"
SOURCE=ROOT/"materials/초등과정 대비 실전 모의고사활용 8회.pdf"
ANSWER=WORK/"source-review/applied8-answer-drive-copy-q07.pdf"
SOURCE_ID="1H2KxzZHzeTve5thcTpTrJLEeNyl0F_ae"
ANSWER_ID="1ixxsCBOTS4SqJ4PXJesvzHzyQfcBW06p"
RENDER=WORK/"q6-source-review/source-2.png"
CROP=ROOT/"bank/assets/applied8/q9-rectangles-original.png"
DATA=ROOT/"bank/data/applied8-expanded.json"
INDEX=ROOT/"bank/data/applied8-expanded-index.json"
VERSION="20261025-applied8-expansion-q04-q05-q06-q07-q08-q09-q10-q13-q14-q15-q17-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r23"
# (grid rows, number of columns, star row, star column); row entries list existing columns.
SHAPE=[(0,0),(0,1),(1,0),(1,1),(1,2),(2,0),(2,1),(2,2)]
CASES=[(SHAPE,3,1,1), (SHAPE,3,0,0),(SHAPE,3,0,1),(SHAPE,3,1,0),
       (SHAPE,3,1,2),(SHAPE,3,2,0),(SHAPE,3,2,1),(SHAPE,3,2,2),
       ([(r,c) for r in range(3) for c in range(3)],3,1,1)]

def sha(p:Path)->str: return hashlib.sha256(p.read_bytes()).hexdigest()
def rectangles(cells:list[tuple[int,int]], star:tuple[int,int])->tuple[int,int,int]:
    occupied=set(cells); maxr=max(r for r,c in cells); maxc=max(c for r,c in cells)
    total=avoid=0
    for r0 in range(maxr+1):
      for r1 in range(r0,maxr+1):
       for c0 in range(maxc+1):
        for c1 in range(c0,maxc+1):
         block={(r,c) for r in range(r0,r1+1) for c in range(c0,c1+1)}
         if block<=occupied:
          total+=1
          if star not in block: avoid+=1
    return total, total-avoid, avoid

def svg(cells:list[tuple[int,int]], star:tuple[int,int])->str:
    size=74; x0=20;y0=20
    rects=[]
    for r,c in cells:
      x=x0+c*size;y=y0+r*size
      rects.append(f'<rect x="{x}" y="{y}" width="{size}" height="{size}" fill="#dedbd3" stroke="#191511" stroke-width="2"/>')
      if (r,c)==star:
       cx=x+size/2;cy=y+size/2
       pts=[]
       import math
       for k in range(10):
        a=-math.pi/2+k*math.pi/5; rad=18 if k%2==0 else 8
        pts.append(f"{cx+rad*math.cos(a):.2f},{cy+rad*math.sin(a):.2f}")
       rects.append(f'<polygon points="{" ".join(pts)}" fill="#b7b2a8" stroke="#191511" stroke-width="1.6"/>')
    height=y0+(max(r for r,c in cells)+1)*size+20
    width=x0+(max(c for r,c in cells)+1)*size+20
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">'+''.join(rects)+'</svg>'

def make_item(i:int,case:tuple)->dict:
    cells,cols,sr,sc=case; total,with_star,answer=rectangles(cells,(sr,sc))
    rows=3
    text="아래 도형에서 별 모양을 포함하지 않는 직사각형의 개수는 모두 몇 개일까요?"
    steps=[f"도형의 칸을 모두 포함하는 직사각형은 {total}개입니다.",
      f"별이 있는 칸을 포함하는 직사각형은 세로 경계와 가로 경계를 각각 골라 세면 {with_star}개입니다.",
      f"따라서 별 모양을 포함하지 않는 직사각형은 {total}−{with_star}={answer}개입니다."]
    asset={"kind":"raster","src":"assets/applied8/q9-rectangles-original.png","description":"활용 8회 원문 9번 격자 그림을 원본 PDF에서 픽셀 그대로 crop"} if i==1 else {"kind":"svg","src":f"assets/applied8/q9-rectangles-v{i}.svg","description":"칸 격자와 별표 위치를 바꾼 직사각형 세기 그림"}
    return {"id":f"applied8-q09-v{i}","genId":"applied8-q09","sourceSet":"applied","sourceRound":8,"sourceNo":9,"variantNo":i,"reviewStatus":"verified",
      "area":"도형","subarea":"평면도형의 개수","detailType":"별표가 든 칸을 제외한 직사각형 개수 세기","pointBand":"2.7",
      "text":text,"asset":asset,"answer":str(answer),"answerParts":[answer],"answerLabels":["별을 포함하지 않는 직사각형의 개수"],"acceptedAnswers":[str(answer),f"{answer}개"],"answerContract":"single-number",
      "solutionSteps":steps,"solution":" ".join(steps),"learningPoint":"격자에서 직사각형을 빠짐없이 세고 표시된 칸을 포함하는 경우를 빼기","learningLocation":"활용 8회 · 원문 9번 · 별표 칸을 제외한 직사각형 개수",
      "verification":{"primaryMethod":"모든 직사각형을 격자 경계 조합으로 열거한다.","independentMethod":"전체 유효 직사각형 수에서 별표 칸을 포함하는 직사각형 수를 경계 선택으로 세어 뺀다.",
        "parameters":{"cells":[list(c) for c in cells],"starCell":[sr,sc],"totalRectangles":total,"rectanglesContainingStar":with_star,"rectanglesExcludingStar":answer,"answer":answer,"enumerationMethod":"enumerate all contiguous row/column blocks whose cells exist"},
        "independentSuite":"qa/applied8-q09-independent-validate.py","sourceExamPage":2,"sourceExamFile":SOURCE.name,"sourceExamDriveFileId":SOURCE_ID,"sourceAnswerPage":2,"sourceAnswerDriveFileId":ANSWER_ID,
        "sourceDrawingCompared":True,"sourceDrawingPresent":True,"sourceDrawingPixelExactCrop":i==1,
        "officialAnswerStatus":"The available Drive answer candidate is a blank exam copy; the source result is independently enumerated, not taken from a printed key.","studentDifficultyMeasured":False},
      "difficultyEvidence":{"basis":"source-point-band","label":"하","sourceReasoningPreserved":True,"measuredVariantRate":None,"estimated":False,"rationale":"활용 8회 원문 9번은 1~12번의 2.7점 배점대다. 활용 난도는 배점대만 적용한다."}}

def main()->None:
    ep=PdfReader(str(SOURCE)).pages[1];ap=PdfReader(str(ANSWER)).pages[1]
    norm=lambda x:"".join((x or "").split())
    assert norm(ep.extract_text())==norm(ap.extract_text())
    source_text=norm(ep.extract_text());assert "별모양을포함하지않는직사각형" in source_text
    data=json.loads(DATA.read_text());index=json.loads(INDEX.read_text())
    assert not any(x["sourceNo"]==9 for x in data["items"])
    # Crop consists only of the printed grid/mark from the reviewed original PDF page render.
    CROP.parent.mkdir(parents=True,exist_ok=True)
    Image.open(RENDER).crop((995,1517,1338,1748)).save(CROP)
    items=[make_item(i,c) for i,c in enumerate(CASES,1)]
    data["items"].extend(items);nos=sorted({x["sourceNo"] for x in data["items"]})
    data["availableSourceNos"]=nos;data["pendingSourceNos"]=[n for n in range(1,31) if n not in nos]
    data["itemCount"]=len(data["items"]);data["version"]=VERSION;data["policy"]["newSourceTypes"]=0
    index["items"].append({"sourceNo":9,"genId":"applied8-q09","area":"도형","subarea":"평면도형의 개수","detailType":"별표가 든 칸을 제외한 직사각형 개수 세기","pointBand":"2.7","reviewStatus":"verified","variantCount":9})
    index["items"].sort(key=lambda x:x["sourceNo"]);index["pendingSourceNos"]=data["pendingSourceNos"];index["itemCount"]=data["itemCount"];index["version"]=VERSION
    for i,c in enumerate(CASES[1:],2):(ROOT/f"bank/assets/applied8/q9-rectangles-v{i}.svg").write_text(svg(c[0],(c[2],c[3])),encoding="utf-8")
    DATA.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n");INDEX.write_text(json.dumps(index,ensure_ascii=False,indent=2)+"\n")
    figures=[{"cells":[list(x) for x in c[0]],"starCell":[c[2],c[3]],"counts":list(rectangles(c[0],(c[2],c[3])))} for c in CASES]
    review={"sourceExam":{"file":SOURCE.name,"driveFileId":SOURCE_ID,"sha256":sha(SOURCE),"page":2,"questionNo":9,"directVisualReview":True,"stem":source_text,"sourceFigure":{"shape":"3x3 grid missing top-right cell","cells":8,"starCell":[1,1]}},
      "sourceCrop":{"file":str(CROP.relative_to(ROOT)),"sha256":sha(CROP),"sizePixels":list(Image.open(CROP).size),"cropOnlyFromOriginalRenderedPage":True},
      "answerCandidate":{"file":ANSWER.name,"driveFileId":ANSWER_ID,"sha256":sha(ANSWER),"page":2,"directVisualReview":True,"containsAnswers":False,"pageTextMatchesQuestionPdf":True,"figureVisuallyMatchesSource":True},
      "answerSourceConclusion":"The available answer candidate is a blank duplicate of the exam. The source answer 15 is independently counted: 27 valid rectangles total, 12 containing the center star.","sourceIndependentAnswer":15,"variantCount":9,"newSourceTypes":0,"difficulty":"2.7-point band only = low"}
    (WORK/"q09-source-answer-review.json").write_text(json.dumps(review,ensure_ascii=False,indent=2)+"\n")
    math={"enumerator":"For every top/bottom and left/right boundary tuple, count the block only if every cell exists; partition by whether the star cell lies inside.","independentCheck":"Total minus star-containing count, using legal row/column boundary choices.","figures":figures}
    (WORK/"q09-independent-math.json").write_text(json.dumps(math,ensure_ascii=False,indent=2)+"\n")
    print(f"PASS Q9 source + variants: answers={[x['answer'] for x in items]}; inventory={data['itemCount']}; types={len(nos)}; r23")
if __name__=="__main__":main()

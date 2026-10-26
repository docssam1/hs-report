#!/usr/bin/env python3
"""Expand Applied 8 Q8's existing target-score count type to nine items."""
from __future__ import annotations
import hashlib,json
from itertools import combinations_with_replacement
from pathlib import Path
from PIL import Image
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/".private-work/hw-expansion-20261023/hw8"
SOURCE=ROOT/"materials/초등과정 대비 실전 모의고사활용 8회.pdf"
ANSWER=WORK/"source-review/applied8-answer-drive-copy-q07.pdf"
CROP=ROOT/"bank/assets/applied8/q8-target-original.png"
DATA=ROOT/"bank/data/applied8-expanded.json"
INDEX=ROOT/"bank/data/applied8-expanded-index.json"
SOURCE_ID="1H2KxzZHzeTve5thcTpTrJLEeNyl0F_ae"
ANSWER_ID="1ixxsCBOTS4SqJ4PXJesvzHzyQfcBW06p"
VERSION="20261025-applied8-expansion-q04-q05-q06-q07-q08-q10-q13-q14-q15-q17-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r22"
# (outer, middle, inner score; arrow count), source first
CASES=[(2,5,8,4),(1,3,5,3),(2,4,6,5),(1,4,7,4),(1,5,9,3),(3,5,7,5),(3,6,9,4),(4,6,8,3),(5,7,9,5)]

def sha(p:Path)->str:return hashlib.sha256(p.read_bytes()).hexdigest()
def norm(t:str)->str:return "".join((t or "").split())
def enumerate_scores(outer:int,middle:int,inner:int,n:int)->list[int]:
    return sorted({sum(xs) for xs in combinations_with_replacement((outer,middle,inner),n)})
def solve(case:tuple[int,int,int,int])->tuple[int,list[int],list[list[int]]]:
    outer,middle,inner,n=case;d=middle-outer
    assert d>0 and inner-middle==d and n in (3,4,5)
    combos=[list(xs) for xs in combinations_with_replacement((outer,middle,inner),n)]
    totals=enumerate_scores(outer,middle,inner,n)
    formula=sorted({n*outer+d*k for k in range(2*n+1)})
    assert totals==formula and len(totals)==2*n+1
    return len(totals),totals,combos
def svg(case:tuple[int,int,int,int])->str:
    outer,middle,inner,n=case
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="200" height="170" viewBox="0 0 200 170">
<circle cx="86" cy="84" r="66" fill="#e2ded5" stroke="#191511" stroke-width="2.5"/>
<circle cx="86" cy="84" r="42" fill="#d3cfc6" stroke="#191511" stroke-width="2.5"/>
<circle cx="86" cy="84" r="18" fill="#fdfbf5" stroke="#191511" stroke-width="2.5"/>
<g fill="#191511" font-family="Noto Serif KR,serif" text-anchor="middle" dominant-baseline="middle">
<text x="86" y="84" font-size="19">{inner}</text><text x="116" y="84" font-size="19">{middle}</text><text x="140" y="84" font-size="19">{outer}</text></g></svg>'''
def make_item(i:int,case:tuple[int,int,int,int])->dict:
    outer,middle,inner,n=case;answer,totals,combos=solve(case);d=middle-outer
    steps=[f"과녁 점수는 바깥쪽부터 {outer}, {middle}, {inner}점이고, 이웃한 점수의 차이는 {d}점입니다. 화살 {n}개를 모두 맞혔습니다.",
      f"모든 화살이 바깥쪽에 맞았을 때 {n}×{outer}={n*outer}점입니다. 가운데 구역에 맞힌 수를 x, 안쪽 구역에 맞힌 수를 y라 하면 점수는 {n}×{outer}+{d}×(x+2y)로 나타납니다.",
      f"x와 y가 가질 수 있는 값에 따라 x+2y는 0부터 {2*n}까지의 모든 정수가 됩니다. 가능한 점수는 {', '.join(map(str,totals))}점으로 모두 {answer}가지입니다."]
    asset={"kind":"raster","src":"assets/applied8/q8-target-original.png","description":"활용 8회 원문 8번 과녁 그림을 원문 PDF에서 그대로 crop"} if i==1 else {"kind":"svg","src":f"assets/applied8/q8-target-v{i}.svg","description":"세 동심원 점수 구역을 유지하고 점수와 화살 수를 변형한 과녁"}
    return {"id":f"applied8-q08-v{i}","genId":"applied8-q08","sourceSet":"applied","sourceRound":8,"sourceNo":8,"variantNo":i,"reviewStatus":"verified",
      "area":"경우의 수","subarea":"합의 경우의 수","detailType":"세 점수 구역에 화살을 모두 맞힐 때 가능한 총점의 수","pointBand":"2.7",
      "text":f"아래 과녁에 화살 {n}개를 모두 맞혔을 때 얻을 수 있는 점수는 모두 몇 가지인가요?",
      "asset":asset,"answer":str(answer),"answerParts":[answer],"answerLabels":["가능한 점수의 가짓수"],"acceptedAnswers":[str(answer),f"{answer}가지"],"answerContract":"single-number",
      "solutionSteps":steps,"solution":" ".join(steps),"learningPoint":"같은 점수 구역을 여러 번 맞힐 수 있을 때 서로 다른 총점을 빠짐없이 세기","learningLocation":"활용 8회 · 원문 8번 · 동심원 과녁 점수의 합의 가짓수",
      "verification":{"primaryMethod":"세 구역 점수를 바깥점수 a와 일정한 간격 d로 나타내고, 가운데·안쪽 구역 적중 수로 가능한 총점을 계산한다.",
        "independentMethod":"화살 n개의 점수를 중복조합으로 전수 열거해 서로 다른 총점을 직접 센다.",
        "parameters":{"outerScore":outer,"middleScore":middle,"innerScore":inner,"arrowCount":n,"scoreGap":d,"allCompositions":combos,"distinctTotals":totals,"formulaTotals":sorted({n*outer+d*k for k in range(2*n+1)}),"answer":answer},
        "independentSuite":"qa/applied8-q08-independent-validate.py","sourceExamPage":2,"sourceExamFile":SOURCE.name,"sourceExamDriveFileId":SOURCE_ID,"sourceAnswerPage":2,"sourceAnswerDriveFileId":ANSWER_ID,
        "sourceDrawingCompared":True,"sourceDrawingPresent":True,"sourceDrawingPixelExactCrop":i==1,
        "officialAnswerStatus":"The available Drive answer candidate is a blank exam copy. The source result is derived by enumerating the four-hit score combinations; it is not reported as a printed answer key.","studentDifficultyMeasured":False},
      "difficultyEvidence":{"basis":"source-point-band","label":"하","sourceReasoningPreserved":True,"measuredVariantRate":None,"estimated":False,"rationale":"활용 8회 원문 8번은 1~12번의 2.7점 배점대다. 활용 난도는 배점대만 적용한다."}}

def main()->None:
    exam=PdfReader(str(SOURCE)).pages[1];answer=PdfReader(str(ANSWER)).pages[1]
    assert norm(exam.extract_text())==norm(answer.extract_text())
    src=norm(exam.extract_text());assert "과녁" in src and "점수는모두몇가지" in src
    d=json.loads(DATA.read_text());idx=json.loads(INDEX.read_text());existing=[x for x in d["items"] if x["sourceNo"]==8];assert len(existing) in (0,9)
    d["items"]=[x for x in d["items"] if x["sourceNo"]!=8];idx["items"]=[x for x in idx["items"] if x["sourceNo"]!=8]
    CROP.parent.mkdir(parents=True,exist_ok=True)
    render=WORK/"q6-source-review/source-2.png"
    Image.open(render).crop((1010,430,1460,875)).save(CROP)
    items=[make_item(i,c) for i,c in enumerate(CASES,1)];d["items"].extend(items)
    nos=sorted({x["sourceNo"] for x in d["items"]});d["availableSourceNos"]=nos;d["pendingSourceNos"]=[n for n in range(1,31) if n not in nos]
    d["itemCount"]=len(d["items"]);d["version"]=VERSION;d["policy"]["newSourceTypes"]=0
    idx["items"].append({"sourceNo":8,"genId":"applied8-q08","area":"경우의 수","subarea":"합의 경우의 수","detailType":"세 점수 구역에 화살을 모두 맞힐 때 가능한 총점의 수","pointBand":"2.7","reviewStatus":"verified","variantCount":9})
    idx["items"].sort(key=lambda x:x["sourceNo"]);idx["pendingSourceNos"]=d["pendingSourceNos"];idx["itemCount"]=d["itemCount"];idx["version"]=VERSION
    for i,c in enumerate(CASES[1:],2):(ROOT/f"bank/assets/applied8/q8-target-v{i}.svg").write_text(svg(c),encoding="utf-8")
    DATA.write_text(json.dumps(d,ensure_ascii=False,indent=2)+"\n");INDEX.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+"\n")
    review={"sourceExam":{"file":SOURCE.name,"driveFileId":SOURCE_ID,"sha256":sha(SOURCE),"page":2,"questionNo":8,"directVisualReview":True,"stem":src,"sourceFigure":{"type":"three concentric scoring zones","inner":8,"middle":5,"outer":2,"arrows":4}},
      "sourceCrop":{"file":str(CROP.relative_to(ROOT)),"sha256":sha(CROP),"sizePixels":list(Image.open(CROP).size),"cropOnlyFromOriginalRenderedPage":True},
      "answerCandidate":{"file":ANSWER.name,"driveFileId":ANSWER_ID,"sha256":sha(ANSWER),"page":2,"directVisualReview":True,"containsAnswers":False,"pageTextMatchesQuestionPdf":True},
      "answerSourceConclusion":"The answer candidate is a blank exam copy. The four-hit scores are 8, 11, 14, 17, 20, 23, 26, 29, 32; source answer 9 is independently derived, not a printed answer key.","sourceIndependentAnswer":9,"variantCount":9,"newSourceTypes":0,"difficulty":"2.7-point band only = low"}
    (WORK/"q08-source-answer-review.json").write_text(json.dumps(review,ensure_ascii=False,indent=2)+"\n")
    rows=[]
    for c in CASES:
      a,totals,combos=solve(c);rows.append({"case":list(c),"allArrowCompositions":len(combos),"distinctTotals":totals,"distinctTotalCount":a,"formulaCount":2*c[3]+1})
    (WORK/"q08-independent-math.json").write_text(json.dumps({"sourceRule":"scores are an arithmetic progression; each of n arrows scores one of the three values","sourceAnswer":9,"variants":rows,"enumeration":"all multisets of n hits among the 3 rings"},ensure_ascii=False,indent=2)+"\n")
    print(f"PASS Q8: source answer=9 derived by exhaustive score enumeration; 9 cases; inventory={d['itemCount']}; types={len(nos)}; r22")

if __name__=="__main__":main()

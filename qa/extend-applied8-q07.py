#!/usr/bin/env python3
"""Expand Applied 8 Q7's existing triangle-number pattern to nine questions."""
from __future__ import annotations
import hashlib,json,shutil
from pathlib import Path
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/".private-work/hw-expansion-20261023/hw8"
SOURCE=ROOT/"materials/초등과정 대비 실전 모의고사활용 8회.pdf";SOURCE_ID="1H2KxzZHzeTve5thcTpTrJLEeNyl0F_ae"
ANSWER_IN=WORK/"source-review/applied8-answer-drive-copy-q05.pdf";ANSWER=WORK/"source-review/applied8-answer-drive-copy-q07.pdf"
CROP=ROOT/"bank/assets/applied8/q7-triangles-original.png";DATA=ROOT/"bank/data/applied8-expanded.json";INDEX=ROOT/"bank/data/applied8-expanded-index.json"
VERSION="20261025-applied8-expansion-q04-q05-q06-q07-q10-q13-q14-q15-q17-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r21"
# Each row is (apex, lower-left, lower-right, center); row 4 is the target.
TRIANGLES=[
 [(3,5,6,9),(2,4,7,1),(8,2,8,8),(4,3,8,None)],
 [(3,4,5,7),(5,2,6,4),(4,3,7,5),(6,2,5,None)],
 [(6,2,5,7),(4,3,8,4),(5,2,3,7),(2,6,5,None)],
 [(6,2,5,7),(3,5,8,7),(4,4,9,7),(5,2,6,None)],
 [(3,4,4,8),(5,2,4,6),(6,2,8,4),(4,3,6,None)],
 [(7,2,8,6),(5,3,6,9),(3,4,5,7),(6,2,7,None)],
 [(2,4,3,5),(5,2,8,2),(4,3,6,6),(7,2,9,None)],
 [(3,3,4,5),(4,2,5,3),(6,2,7,5),(5,3,8,None)],
 [(2,6,4,8),(7,2,5,9),(5,3,7,8),(3,5,6,None)],
]

def sha(p:Path)->str:return hashlib.sha256(p.read_bytes()).hexdigest()
def solve(t):
    for apex,left,right,center in t[:3]:assert center==apex*left-right
    apex,left,right,_=t[3];answer=apex*left-right
    assert 1<=answer<=9
    return answer
def svg(t):
    groups=[]
    for i,(apex,left,right,center) in enumerate(t):
        cx=78+155*i; lx=cx-50;rx=cx+50;top=38;base=126
        inside="(가)" if center is None else str(center)
        groups.append(f'''<g fill="none" stroke="#191511" stroke-width="2.6" stroke-linejoin="round">
<path d="M {cx} {top} L {lx} {base} L {rx} {base} Z"/>
<g fill="#191511" stroke="none" font-family="Noto Serif KR,serif" text-anchor="middle">
<text x="{cx}" y="25" font-size="23">{apex}</text><text x="{cx}" y="96" font-size="23">{inside}</text>
<text x="{lx-6}" y="157" font-size="23">{left}</text><text x="{rx+6}" y="157" font-size="23">{right}</text>
</g></g>''')
    return '<svg xmlns="http://www.w3.org/2000/svg" width="620" height="180" viewBox="0 0 620 180">'+''.join(groups)+'</svg>'

def make_item(i:int,t:list)->dict:
    ans=solve(t);formula="각 삼각형의 가운데 수는 꼭짓점 수×왼쪽 밑변 수−오른쪽 밑변 수입니다."
    steps=["세 예에서 꼭짓점 수와 왼쪽 밑변 수를 곱한 뒤 오른쪽 밑변 수를 빼면 가운데 수가 됩니다.",
           f"예를 들어 첫째 삼각형은 {t[0][0]}×{t[0][1]}−{t[0][2]}={t[0][3]}이고, 둘째와 셋째도 같은 관계를 만족합니다.",
           f"마지막 삼각형의 가운데 수는 {t[3][0]}×{t[3][1]}−{t[3][2]}={ans}이므로 답은 {ans}입니다."]
    asset={"kind":"raster","src":"assets/applied8/q7-triangles-original.png","description":"활용 8회 원문 7번의 네 삼각형 수 배열을 원문 PDF에서 그대로 crop"} if i==1 else {"kind":"svg","src":f"assets/applied8/q7-triangles-v{i}.svg","description":"꼭짓점·밑변 양 끝·가운데 수를 놓은 네 삼각형 배열"}
    return {"id":f"applied8-q07-v{i}","genId":"applied8-q07","sourceSet":"applied","sourceRound":8,"sourceNo":7,"variantNo":i,"reviewStatus":"verified",
      "area":"수와 식","subarea":"수의 규칙","detailType":"삼각형 위치 수의 곱셈·뺄셈 관계","pointBand":"2.7",
      "text":"어떤 규칙에 의해 아래와 같이 수를 배열하였습니다. (가)에 알맞은 수를 구하세요.","asset":asset,
      "answer":str(ans),"answerParts":[ans],"answerLabels":["(가)에 들어갈 수"],"acceptedAnswers":[str(ans),f"{ans}입니다"],"answerContract":"single-number",
      "solutionSteps":steps,"solution":" ".join(steps),"learningPoint":"세 위치의 수 사이 곱셈·뺄셈 관계를 찾아 네 번째 배열에 적용하기",
      "learningLocation":"활용 8회 · 원문 7번 · 삼각형 위치 수의 규칙",
      "verification":{"primaryMethod":"세 예에서 꼭짓점×왼쪽 밑변−오른쪽 밑변을 계산해 가운데 수와 대조한다.",
        "independentMethod":"각 예의 수를 대입해 같은 정수 관계를 확인하고 목표 삼각형의 가운데 수를 다시 계산한다.",
        "parameters":{"triangles":[list(x) for x in t],"rule":"center=apex*lowerLeft-lowerRight","answer":ans,"exampleChecks":[x[0]*x[1]-x[2]==x[3] for x in t[:3]],"sourceCropPixelExact":i==1},
        "independentSuite":"qa/applied8-q07-independent-validate.py","sourceExamPage":2,"sourceExamFile":SOURCE.name,"sourceExamDriveFileId":SOURCE_ID,
        "sourceAnswerPage":2,"sourceAnswerDriveFileId":"1ixxsCBOTS4SqJ4PXJesvzHzyQfcBW06p","sourceDrawingCompared":True,"sourceDrawingPresent":True,
        "sourceDrawingPixelExactCrop":i==1,"officialAnswerStatus":"The available Drive answer-candidate page is a blank exam copy with no marked answer. The relation is derived from the three printed examples and each target is independently calculated.","studentDifficultyMeasured":False},
      "difficultyEvidence":{"basis":"source-point-band","label":"하","sourceReasoningPreserved":True,"measuredVariantRate":None,"estimated":False,
        "rationale":"활용 8회 원문 7번은 1~12번의 2.7점 배점대다. 활용 난도는 배점대만 적용한다."}}

def main()->None:
    shutil.copy2(ANSWER_IN,ANSWER);exam,answer=PdfReader(str(SOURCE)).pages[1],PdfReader(str(ANSWER)).pages[1]
    norm=lambda t:"".join((t or "").split());assert norm(exam.extract_text())==norm(answer.extract_text())
    src=norm(exam.extract_text());assert "규칙" in src and "알맞은수를구하세요" in src
    d=json.loads(DATA.read_text());idx=json.loads(INDEX.read_text());assert not any(x["sourceNo"]==7 for x in d["items"])
    CROP.parent.mkdir(parents=True,exist_ok=True)
    # This crop was cut directly from the visually reviewed original PDF p.2 render.
    from PIL import Image
    rendered=WORK/"q6-source-review/source-2.png";Image.open(rendered).crop((160,1875,830,2085)).save(CROP)
    assert CROP.exists()
    items=[make_item(i,t) for i,t in enumerate(TRIANGLES,1)];d["items"].extend(items)
    nos=sorted({x["sourceNo"] for x in d["items"]});d["availableSourceNos"]=nos;d["pendingSourceNos"]=[n for n in range(1,31) if n not in nos]
    d["itemCount"]=len(d["items"]);d["version"]=VERSION;d["policy"]["newSourceTypes"]=0
    idx["items"].append({"sourceNo":7,"genId":"applied8-q07","area":"수와 식","subarea":"수의 규칙","detailType":"삼각형 위치 수의 곱셈·뺄셈 관계","pointBand":"2.7","reviewStatus":"verified","variantCount":9})
    idx["items"].sort(key=lambda x:x["sourceNo"]);idx["pendingSourceNos"]=d["pendingSourceNos"];idx["itemCount"]=d["itemCount"];idx["version"]=VERSION
    for i,t in enumerate(TRIANGLES[1:],2):(ROOT/f"bank/assets/applied8/q7-triangles-v{i}.svg").write_text(svg(t),encoding="utf-8")
    DATA.write_text(json.dumps(d,ensure_ascii=False,indent=2)+"\n");INDEX.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+"\n")
    (WORK/"q07-source-answer-review.json").write_text(json.dumps({"sourceExam":{"file":SOURCE.name,"driveFileId":SOURCE_ID,"sha256":sha(SOURCE),"page":2,"questionNo":7,"directVisualReview":True,"stem":src,"sourceFigureLabels":[[3,5,6,9],[2,4,7,1],[8,2,8,8],[4,3,8,"가"]]},"sourceCrop":{"file":str(CROP.relative_to(ROOT)),"sha256":sha(CROP),"sizePixels":list(Image.open(CROP).size),"cropOnlyFromOriginalRenderedPage":True},"answerCandidate":{"file":ANSWER.name,"driveFileId":"1ixxsCBOTS4SqJ4PXJesvzHzyQfcBW06p","sha256":sha(ANSWER),"page":2,"directVisualReview":True,"containsAnswers":False,"pageTextMatchesQuestionPdf":True},"answerSourceConclusion":"The answer candidate is an unmarked exam copy; the expected source answer is derived from the three examples.","inferredRule":"center=apex*lowerLeft-lowerRight","sourceIndependentAnswer":4,"variantCount":9,"newSourceTypes":0,"difficulty":"2.7-point band only = low"},ensure_ascii=False,indent=2)+"\n")
    rows=[]
    for t in TRIANGLES:rows.append({"triangles":[list(x) for x in t],"checks":[x[0]*x[1]-x[2]==x[3] for x in t[:3]],"answer":solve(t)})
    (WORK/"q07-independent-math.json").write_text(json.dumps({"rule":"center=apex*lowerLeft-lowerRight","method":"Substitute all three displayed examples, then apply the same relation to the target triangle","source":rows[0],"variants":rows[1:]},ensure_ascii=False,indent=2)+"\n")
    print(f"PASS Q7: source answer=4; exact source crop; 9 triangle arrays; inventory={d['itemCount']}; types={len(nos)}; r21")

if __name__=="__main__":main()

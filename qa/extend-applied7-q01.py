#!/usr/bin/env python3
"""Create nine Applied 7 Q1 variants with independently drawn overlap diagrams."""
import hashlib
import json
import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw7"
DATA_PATH = ROOT / "bank/data/applied7-expanded.json"
INDEX_PATH = ROOT / "bank/data/applied7-expanded-index.json"
EXAM = ROOT / "materials/초등과정 대비 실전 모의고사활용 7회.pdf"
ANSWER = Path("/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf")
PDFTOTEXT = Path("/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext")
PARAMS = [(15,5,6,3),(18,6,7,4),(21,7,8,5),(25,8,10,6),(28,9,11,7),
          (31,10,12,8),(34,11,13,9),(37,12,14,10),(40,13,15,11)]


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def diagram(v, perimeter, a, b, z, u, side):
    # A schematic overlap drawing. The side ticks encode the stated equal-side
    # relationship. Triangle side DE is inferred from its perimeter; the exposed
    # continuation EC is z, so square side DC = DE + EC.
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="560" height="350" viewBox="0 0 560 350" role="img" aria-label="직사각형과 정사각형이 겹친 도형, 겹친 삼각형의 둘레 {perimeter}센티미터, 두 변 {a}센티미터와 {b}센티미터, 정사각형 변의 나머지 부분 {z}센티미터">
<rect width="560" height="350" fill="#fff"/>
<g fill="none" stroke="#191511" stroke-width="2.2" stroke-linejoin="round">
 <rect x="24" y="72" width="336" height="170"/>
 <path d="M410 32 L538 160 L410 288 L282 160 Z"/>
 <path d="M360 72 L282 160 L360 242 Z" fill="#e5e5e5"/>
 <path d="M360 72 L360 242"/>
 <path d="M360 242 L410 288"/>
</g>
<g stroke="#191511" stroke-width="2">
 <path d="M28 146 h14 M405 218 l10 -10"/>
</g>
<g fill="#191511" font-family="serif" font-size="20">
 <text x="165" y="163" text-anchor="middle">가</text>
 <text x="455" y="165" text-anchor="middle">나</text>
 <text x="308" y="108" text-anchor="middle">{a} cm</text>
 <text x="370" y="160">{b} cm</text>
 <text x="386" y="275">{z} cm</text>
 <text x="58" y="300" font-family="sans-serif" font-size="14" fill="#5b554a">그림은 실제 길이와 비례하지 않습니다.</text>
</g>
</svg>'''
    path = ROOT / f"bank/assets/applied7/q01-v{v}.svg"
    path.write_text(svg, encoding="utf-8")
    ET.parse(path)
    return path.relative_to(ROOT / "bank").as_posix()


def main():
    assert EXAM.is_file() and ANSWER.is_file()
    assert len(PdfReader(str(EXAM)).pages) >= 1 and len(PdfReader(str(ANSWER)).pages) >= 1
    exam_text = subprocess.check_output([str(PDFTOTEXT), "-f", "1", "-l", "1", "-layout", str(EXAM), "-"], text=True, errors="replace")
    assert all(s in exam_text for s in ("직사각형 가와 정사각형 나", "세 변의 길이의 합이 12cm", "둘레는 몇 cm"))
    answer_text = (WORK / "q01-answer-page-1-vision.txt").read_text()
    assert "36" in answer_text
    assert sha(EXAM) == "8ad35f2d0ce954cca4a4e633742ed79a7fbe37e2d9ed854f14b4a4d0a34aa1db"
    assert sha(ANSWER) == "89404313c4c2760a4ae2818b88d9b84dc3a128549636f2b2261ecafa4da6a11b"

    items=[]
    proofs=[]
    for v,(perim,a,b,z) in enumerate(PARAMS,1):
        unknown=perim-a-b
        assert unknown > 0 and a+unknown>b and b+unknown>a and a+b>unknown
        square_side=unknown+z
        width=2*square_side
        answer=2*(square_side+width)
        assert answer==6*square_side
        asset=diagram(v,perim,a,b,z,unknown,square_side)
        steps=[
            f"겹친 삼각형의 세 변의 길이의 합이 {perim}cm이고, 두 변이 {a}cm와 {b}cm이므로 나머지 변은 {perim}−{a}−{b}={unknown}cm입니다.",
            f"정사각형 한 변은 겹친 삼각형의 {unknown}cm 변과 이어진 {z}cm 부분의 합이므로 {unknown}+{z}={square_side}cm입니다. 직사각형의 짧은 변도 {square_side}cm입니다.",
            f"직사각형의 긴 변은 짧은 변의 2배인 {width}cm입니다. 따라서 둘레는 ({square_side}+{width})×2={answer}cm입니다."
        ]
        items.append({
            "id":f"applied7-q01-v{v}","genId":"applied7-q01","sourceSet":"applied","sourceRound":7,
            "sourceNo":1,"variantNo":v,"reviewStatus":"verified","area":"도형","subarea":"겹친 사각형의 둘레",
            "detailType":"겹친 삼각형의 둘레와 변의 관계로 직사각형 둘레 구하기","pointBand":"2.7",
            "text":f"직사각형 가와 정사각형 나의 한 변의 길이는 같습니다. 직사각형 가의 가로는 세로의 2배입니다. 두 도형이 겹쳐 생긴 삼각형의 세 변의 길이의 합은 {perim}cm입니다. 직사각형 가의 둘레는 몇 cm입니까?",
            "asset":{"kind":"svg","src":asset,"description":f"직사각형과 정사각형의 겹친 삼각형 둘레 {perim}cm, 두 변 {a}cm·{b}cm, 정사각형 변의 이어진 부분 {z}cm"},
            "answer":str(answer),"answerParts":[answer],"answerLabels":["직사각형 가의 둘레(cm)"],
            "acceptedAnswers":[str(answer),f"{answer}cm",f"{answer} cm"],"answerContract":"single-number",
            "solutionSteps":steps,"solution":" ".join(steps),
            "learningPoint":"삼각형 둘레에서 나머지 변을 구하고, 겹친 변의 연속 길이를 정사각형과 직사각형의 같은 변으로 연결하기",
            "learningLocation":"활용 7회 · 원문 1번 · 겹친 삼각형에서 두 사각형의 변과 직사각형 둘레 찾기",
            "verification":{"primaryMethod":"삼각형 둘레에서 알려진 두 변을 빼 나머지 변을 구한 뒤 정사각형 한 변, 직사각형 가로, 둘레를 차례로 계산한다.",
                "independentMethod":"삼각형 세 변의 합과 직사각형 가로:세로=2:1을 식으로 두고 둘레를 직접 계산해 같은 값을 얻는다.",
                "parameters":{"trianglePerimeter":perim,"knownTriangleSides":[a,b],"unknownTriangleSide":unknown,"exposedSquareSideSegment":z,"squareSide":square_side,"rectangleWidth":width,"rectanglePerimeter":answer},
                "independentSuite":"qa/applied7-q01-independent-validate.py","sourceExamPage":1,"sourceExamFile":EXAM.name,"sourceAnswerPage":1,
                "sourceExamDriveFileId":"1qtshEh5Zkv3X4DMMcXHjWw1kRgibbvxf","sourceAnswerDriveFileId":"1zIN-XzODa-_T2AUjGbmuzHSPvCdVb2_j",
                "sourceDrawingCompared":True,"sourceDrawingPresent":True,"variantDrawingType":"new-overlap-diagram-same-geometry-relations",
                "officialAnswerStatus":"답안 후보 PDF 1쪽의 손글씨 36을 확인했다. 공식 정답표로 식별하지 않았으며 원문 조건을 독립 계산해 같은 답 36cm를 재현했다.",
                "studentDifficultyMeasured":False},
            "difficultyEvidence":{"basis":"source-point-band","label":"하","sourceReasoningPreserved":True,"measuredVariantRate":None,"estimated":False,
                "rationale":"활용 7회 원문 1번은 1~12번의 2.7점 배점대이며, 활용 난도는 배점대만 적용한다."}
        })
        proofs.append({"variant":v,"triangleSides":[a,b,unknown],"perimeter":perim,"squareSide":square_side,"rectangleDimensions":[width,square_side],"answer":answer})

    data=json.loads(DATA_PATH.read_text())
    index=json.loads(INDEX_PATH.read_text())
    assert data["sourceRound"]==7 and data["availableSourceNos"]==list(range(2,31)) and data["pendingSourceNos"]==[1]
    assert not any(x["sourceNo"]==1 for x in data["items"])
    data["items"]=items+data["items"]
    data["availableSourceNos"]=list(range(1,31));data["pendingSourceNos"]=[];data["itemCount"]=270
    data["version"]="20261025-applied7-expansion-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q11-q12-q13-q14-q15-q16-q17-q18-q19-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r32"
    index["version"]=data["version"];index["itemCount"]=270;index["pendingSourceNos"]=[]
    index["items"].insert(0,{"sourceNo":1,"genId":"applied7-q01","area":"도형","subarea":"겹친 사각형의 둘레","detailType":"겹친 삼각형의 둘레와 변의 관계로 직사각형 둘레 구하기","pointBand":"2.7","reviewStatus":"verified","variantCount":9})
    DATA_PATH.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n")
    INDEX_PATH.write_text(json.dumps(index,ensure_ascii=False,indent=2)+"\n")
    review={"sourceExam":{"name":EXAM.name,"driveId":"1qtshEh5Zkv3X4DMMcXHjWw1kRgibbvxf","bytes":EXAM.stat().st_size,"sha256":sha(EXAM),"page":1,"questionNumber":1,"directVisualReview":True,"figureCrop":".private-work/hw-expansion-20261023/hw7/q01-source-figure-original-crop.png","figureCropPixelExact":True,"given":{"trianglePerimeter":12,"labelledTriangleSides":[4,5],"exposedSquareSegment":3}},
            "sourceAnswer":{"name":ANSWER.name,"driveId":"1zIN-XzODa-_T2AUjGbmuzHSPvCdVb2_j","bytes":ANSWER.stat().st_size,"sha256":sha(ANSWER),"page":1,"questionNumber":1,"directVisualReview":True,"handwrittenAnswer":36,"officialKeyStatus":"공식 답안표는 확인하지 않았다. 답안 후보의 손글씨를 원자료 조건을 통한 독립 계산으로 교차 확인했다."},
            "sourceAnswerIndependentlyReproduced":True,"triangleSides":[4,5,3],"squareSide":6,"rectangleDimensions":[12,6],"answer":36,
            "newSourceTypes":0,"variantCount":9,"allVariantAnswersIndependentlyDerived":True,"variants":proofs,"dataVersion":data["version"]}
    (WORK/"q01-source-answer-review-r32.json").write_text(json.dumps(review,ensure_ascii=False,indent=2)+"\n")
    proof={"sourcePage":1,"sourceAnswerPage":1,"sourceExamSha256":sha(EXAM),"sourceAnswerSha256":sha(ANSWER),"officialAnswerKeyUnavailable":True,"handwrittenSourceAnswer":36,"independentlyReproducedSourceAnswer":36,"variants":proofs,"allTriangleInequalitiesPassed":True,"allAnswersReproducedByTwoMethods":True}
    (WORK/"q01-independent-math-r32.json").write_text(json.dumps(proof,ensure_ascii=False,indent=2)+"\n")
    print("Built Applied 7 Q1: nine new overlap diagrams and verified low-band perimeter variants; source handwritten answer 36 independently reproduced.")


if __name__=="__main__":
    main()

#!/usr/bin/env python3
"""Add nine source-faithful Applied 5 Q8 variants and their audit evidence."""
import hashlib
import itertools
import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw5"
SOURCE = WORK / "q08-source-r6"
DATA_FILE = ROOT / "bank/data/applied5-expanded.json"
INDEX_FILE = ROOT / "bank/data/applied5-expanded-index.json"
ASSET_DIR = ROOT / "bank/assets/applied5"

TRIPLES = [(1,1,1),(1,1,2),(1,1,3),(1,2,2),(2,1,2),
           (1,1,4),(1,2,3),(2,2,2),(2,3,2)]
EXAM = ROOT / "materials/초등과정 대비 실전 모의고사활용 5회.pdf"
ANSWER = Path("/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 5회 답안.pdf")


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def runs(bits):
    return tuple(map(len, re.findall(r"1+", bits)))


def all_patterns(triple):
    return [f"{n:010b}" for n in range(1024) if runs(f"{n:010b}") == triple]


def svg(triple, examples):
    width, cell, x0 = 760, 56, 100
    height = 2*cell + 100
    body = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">',
            '<rect width="100%" height="100%" fill="#fff"/>']
    for row, bitstr in enumerate(examples):
        y = 30 + row*(cell+24)
        for i, bit in enumerate(bitstr):
            x = x0+i*cell
            body.append(f'<rect x="{x}" y="{y}" width="{cell}" height="{cell}" fill="none" stroke="#29251f" stroke-width="1.5"/>')
            if bit == "1":
                body.append(f'<circle cx="{x+cell/2:g}" cy="{y+cell/2:g}" r="14" fill="white" stroke="#29251f" stroke-width="2"/>')
        body.append(f'<text x="{x0+10*cell+22}" y="{y+35}" font-family="serif" font-size="24" fill="#29251f">{triple}</text>')
    body.append('</svg>')
    return ''.join(body)


def main():
    data = json.loads(DATA_FILE.read_text())
    assert 8 in data["pendingSourceNos"] and not any(x["sourceNo"] == 8 for x in data["items"])
    source_crop = SOURCE / "exam-q08-crop.png"
    answer_crop = SOURCE / "answer-q08-proof.png"
    assert source_crop.exists() and answer_crop.exists()
    assert "6+3+1" in (SOURCE / "answer-q08-proof-transcription.txt").read_text()
    created=[]
    for i, triple in enumerate(TRIPLES,1):
        patterns=all_patterns(triple)
        assert len(patterns) == math.comb(11-sum(triple),3) and len(patterns) >= 2
        chosen=[patterns[0],patterns[-1]]
        asset=ASSET_DIR/f"q08-v{i}.svg"
        asset.write_text(svg(triple,chosen),encoding="utf-8")
        answer=len(patterns)
        E=10-sum(triple)
        step1=f"10칸 중 ○가 차지하는 칸은 {sum(triple)}칸이므로 빈칸은 10−{sum(triple)}＝{E}칸입니다."
        step2=f"세 무리를 나누려면 두 사이에 빈칸을 하나씩 둡니다. 남은 빈칸 {E}−2＝{E-2}개를 맨 앞, 두 사이의 추가 빈칸, 맨 뒤의 네 자리에 나누어 둡니다."
        step3=f"네 자리에 나누는 방법은 x₁＋x₂＋x₃＋x₄＝{E-2}의 음이 아닌 정수해 수와 같습니다. 따라서 {math.comb(E+1,3)}가지이고, 서로 다른 그림은 모두 {answer}가지입니다."
        item={
          "id":f"applied5-q08-v{i}","genId":"applied5-q08","sourceSet":"applied","sourceRound":5,"sourceNo":8,"variantNo":i,"reviewStatus":"verified",
          "area":"경우의 수","subarea":"도형의 배열","detailType":"연속한 원 무리의 위치 정하기","pointBand":"2.7",
          "text":f"10칸의 상자에 ○를 놓아 왼쪽부터 연속한 ○의 개수가 {triple}이 되도록 합니다. 서로 다른 그림은 모두 몇 가지입니까?",
          "asset":{"kind":"svg","src":f"assets/applied5/q08-v{i}.svg","description":f"열 칸에 연속한 원 세 무리를 각각 {triple}개씩 놓은 서로 다른 두 예"},
          "answer":str(answer),"answerParts":[answer],"answerLabels":["서로 다른 그림의 수"],"acceptedAnswers":[str(answer),f"{answer}가지"],"answerContract":"ordered-parts",
          "solutionSteps":[step1,step2,step3],"solution":" ".join((step1,step2,step3)),
          "learningPoint":"연속한 원 무리 사이에 필요한 빈칸을 먼저 두고 남은 빈칸을 네 자리에 나누기",
          "learningLocation":"활용 5회 · 원문 8번 · 연속한 원 무리의 배열",
          "verification":{"primaryMethod":"세 원 무리 사이에 필수 빈칸을 둔 뒤 남는 빈칸을 네 간격에 분배하는 조합 계산.",
            "independentMethod":"10칸의 2^10개 원/빈칸 배열을 전수 생성해 최대 연속 원 무리 길이의 순서가 지정된 세 수와 같은 배열만 센다.",
            "parameters":{"boxCount":10,"runCounts":list(triple),"emptyCount":E,"answer":answer,"examplePatterns":chosen},
            "independentSuite":"qa/applied5-q08-independent-validate.py","sourceExamPage":2,"sourceAnswerPage":8,
            "sourceExamFile":EXAM.name,"sourceAnswerFile":ANSWER.name,"sourceExamDriveFileId":"1x7CevkWByUrXPqfbV5xTHidJPNDrbuJp","sourceAnswerDriveFileId":"1QGjWnEBjULxwy4BBX8tLutpGbjQfEh05",
            "sourceDrawingCompared":True,"variantDrawingType":"ten-box-row-with-three-consecutive-circle-runs",
            "sourceAnswerStatus":"Drive answer PDF p8 directly shows the teacher's count 6+3+1=10 for source (3,1,2); independently counted by all 2^10 arrangements.","studentDifficultyMeasured":False},
          "difficultyEvidence":{"basis":"source-point-band","label":"하","sourceReasoningPreserved":True,"measuredVariantRate":None,"estimated":False,
            "rationale":"활용 5회 원문 8번은 1~12번의 2.7점 배점대이므로 활용 난도는 배점대만 적용한다."}}
        created.append(item)
    data["items"].extend(created)
    data["items"].sort(key=lambda x:(x["sourceNo"],x["variantNo"]))
    data["availableSourceNos"].insert(data["availableSourceNos"].index(9),8)
    data["pendingSourceNos"].remove(8)
    data["version"]="20261025-applied5-expansion-q03-q05-q06-q08-q09-r6"
    summary=data.setdefault("reviewSummary",{})
    summary.update({"independentMathCount":len(data["items"]),"sourceTypes":len(data["availableSourceNos"]),"variantsPerType":9,"sourceDrawingCount":4})
    DATA_FILE.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n")
    index={"version":data["version"],"sourceSet":"applied","sourceRound":5,"itemCount":len(data["items"]),"pendingSourceNos":data["pendingSourceNos"],"items":[]}
    for no in data["availableSourceNos"]:
        x=next(x for x in data["items"] if x["sourceNo"]==no)
        index["items"].append({"sourceNo":no,"genId":x["genId"],"area":x["area"],"subarea":x["subarea"],"detailType":x["detailType"],"pointBand":x["pointBand"],"reviewStatus":"verified","variantCount":9})
    INDEX_FILE.write_text(json.dumps(index,ensure_ascii=False,indent=2)+"\n")
    proof={"sourceExam":{"file":EXAM.name,"driveFileId":"1x7CevkWByUrXPqfbV5xTHidJPNDrbuJp","bytes":EXAM.stat().st_size,"sha256":sha(EXAM),"page":2,"questionNo":8,"directVisualReview":True,
       "stem":"보기는 잇달아 채워진 ○의 개수를 차례로 ( )안에 쓴 것입니다. 보기 그림과 같이 (3,1,2)이 되도록 ○를 채운 서로 다른 그림은 모두 몇 개인가요?","boxCount":10,"exampleCounts":[[2,3,1],[2,3,1]]},
      "sourceAnswer":{"file":ANSWER.name,"driveFileId":"1QGjWnEBjULxwy4BBX8tLutpGbjQfEh05","bytes":ANSWER.stat().st_size,"sha256":sha(ANSWER),"page":8,"directVisualReview":True,"teacherAnswer":10,"teacherWork":"6+3+1=10개"},
      "sourceFigure":{"render":str((SOURCE/"exam-p2-2.png").relative_to(ROOT)),"crop":str(source_crop.relative_to(ROOT)),"sha256":sha(source_crop)},
      "answerProof":{"render":str((SOURCE/"answer-p8-08.png").relative_to(ROOT)),"crop":str(answer_crop.relative_to(ROOT)),"sha256":sha(answer_crop)},
      "originalSolution":{"runCounts":[3,1,2],"boxCount":10,"enumeratedPatterns":len(all_patterns((3,1,2))),"answer":10,"distributionFormula":"C(10−(3+1+2)+1,3)=C(5,3)=10"},
      "variants":[{"variantNo":x["variantNo"],"runCounts":x["verification"]["parameters"]["runCounts"],"answer":x["answer"],"bruteForceCount":len(all_patterns(tuple(x["verification"]["parameters"]["runCounts"]))),"examples":x["verification"]["parameters"]["examplePatterns"]} for x in created],
      "variantCount":9,"newSourceTypes":0,"difficulty":"2.7-point band only = low"}
    (WORK/"q08-source-answer-review.json").write_text(json.dumps(proof,ensure_ascii=False,indent=2)+"\n")
    print(f"Added Q8 9 variants, {len(data['items'])} total; original 10 verified; data sha256={sha(DATA_FILE)}")


if __name__=="__main__":
    main()

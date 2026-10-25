#!/usr/bin/env python3
"""Extend Applied 5 Q18's existing two-condition monthly-spending type."""
import hashlib
import json
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw5"
DATA_FILE = ROOT / "bank/data/applied5-expanded.json"
INDEX_FILE = ROOT / "bank/data/applied5-expanded-index.json"
EXAM = ROOT / "materials/초등과정 대비 실전 모의고사활용 5회.pdf"
ANSWER = WORK / "q16-source-r11/answer.pdf"
EXAM_RENDER = WORK / "q18-source-r13/exam-3.png"
ANSWER_RENDER = WORK / "q18-source-r13/answer-18.png"
VERSION = "20261025-applied5-expansion-q03-q05-q06-q08-q09-q11-q12-q14-q15-q16-q17-q18-r13"
EXAM_ID = "1x7CevkWByUrXPqfbV5xTHidJPNDrbuJp"
ANSWER_ID = "1QGjWnEBjULxwy4BBX8tLutpGbjQfEh05"

# allowance, actual monthly spending, month at which cash is short, shortfall
PARAMETERS = [
    (3000, 6000, 7, 1000),
    (2500, 7500, 7, 5000),
    (4000, 8000, 6, 4000),
    (3000, 7000, 6, 2000),
    (5000, 9000, 6, 4000),
    (2000, 8000, 5, 2000),
    (3500, 7500, 8, 2000),
    (4000, 7000, 6, 3000),
    (2500, 6500, 7, 8000),
]


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def make_item(no, allowance, actual, month, shortfall):
    initial = month * (actual - allowance) - shortfall
    planned = (initial + 10 * allowance) // 10
    assert (initial + 10 * allowance) % 10 == 0
    assert initial > 0 and allowance < planned < actual
    subject = "은지는" if no == 1 else "어떤 학생은"
    text = (f"{subject} 처음에 얼마의 돈을 가지고 있었습니다. 1월부터 매월 초 {allowance:,}원의 용돈을 받아 "
            f"일정 금액을 써서 10월 말까지 가진 돈 전부를 쓸 예정이었습니다. 하지만 매월 {actual:,}원씩 썼기 때문에 "
            f"{month}월 말에는 오히려 {shortfall:,}원이 모자랐습니다. 처음에 가지고 있었던 돈과 처음에 계획했던 "
            "매달 지출액은 각각 얼마인지 구하시오.")
    steps = [
        f"처음 가진 돈을 □원, 처음 계획한 월 지출액을 △원이라 하면, 10월 말까지 모두 쓰므로 □+10×{allowance:,}=10×△입니다.",
        f"{month}월 말에는 처음 가진 돈과 {month}개월 동안 받은 용돈에서 실제 지출을 빼면 −{shortfall:,}원이므로, 처음 가진 돈은 {month}×({actual:,}−{allowance:,})−{shortfall:,}={initial:,}원입니다.",
        f"처음 계획한 월 지출액은 ({initial:,}+10×{allowance:,})÷10={planned:,}원입니다.",
        f"확인하면 {month}월 말 잔액은 {initial:,}+{month}×{allowance:,}−{month}×{actual:,}=−{shortfall:,}원이고, 10월 말에는 {initial:,}+10×{allowance:,}−10×{planned:,}=0원입니다.",
    ]
    return {
        "id": f"applied5-q18-v{no}", "genId": "applied5-q18", "sourceSet": "applied", "sourceRound": 5,
        "sourceNo": 18, "variantNo": no, "reviewStatus": "verified", "area": "수와 식",
        "subarea": "양과 지출의 관계", "detailType": "정해진 기간의 계획 지출과 실제 지출로 처음 가진 돈 구하기",
        "pointBand": "3.4", "text": text, "answer": f"{initial:,}원, {planned:,}원",
        "answerParts": [initial, planned], "answerLabels": ["처음 가지고 있던 돈(원)", "처음 계획한 매달 지출액(원)"],
        "acceptedAnswers": [f"{initial},{planned}", f"{initial:,}원, {planned:,}원", f"{initial}원, {planned}원"],
        "answerContract": "ordered-parts", "solutionSteps": steps, "solution": " ".join(steps),
        "learningPoint": "기간 전체의 계획 지출 식과 중간 시점의 실제 잔액 식을 각각 세워 미지수 두 개를 구한다.",
        "learningLocation": "활용 5회 · 원문 18번 · 계획 지출과 실제 지출의 차로 처음 가진 돈 구하기",
        "verification": {
            "primaryMethod": "10개월 전체 예산식과 부족이 생긴 달의 잔액식을 연립한다.",
            "independentMethod": "처음 가진 돈과 월 계획 지출을 양의 정수로 전수 대입해 두 조건을 동시에 만족하는 해가 하나인지 확인한다.",
            "parameters": {"monthsPlanned": 10, "monthlyAllowance": allowance, "monthlyActualSpending": actual,
                           "shortageMonth": month, "shortfall": shortfall, "initialMoney": initial,
                           "plannedMonthlySpending": planned,
                           "plannedEquation": "initialMoney + monthsPlanned*monthlyAllowance = monthsPlanned*plannedMonthlySpending",
                           "shortageEquation": "initialMoney + shortageMonth*monthlyAllowance - shortageMonth*monthlyActualSpending = -shortfall"},
            "independentSuite": "qa/applied5-q18-independent-validate.py", "sourceExamPage": 3,
            "sourceExamFile": EXAM.name, "sourceAnswerPage": 18, "sourceAnswerFile": ANSWER.name,
            "sourceExamDriveFileId": EXAM_ID, "sourceAnswerDriveFileId": ANSWER_ID,
            "sourceDrawingCompared": True, "sourceDrawingPresent": False,
            "sourceAnswerStatus": "답안 후보 PDF p18에 교사 필기로 처음 가진 돈 20,000원, 월 계획 지출 5,000원이 표시되어 있고 두 조건을 독립 계산으로 재현했다.",
            "studentDifficultyMeasured": False,
        },
        "difficultyEvidence": {"basis": "source-point-band", "label": "중", "sourceReasoningPreserved": True,
                               "measuredVariantRate": None, "estimated": False,
                               "rationale": "활용 5회 원문 18번은 13~22번 3.4점 배점대이므로 활용 난도는 배점대만 적용한다."},
    }


def main():
    data, index = json.loads(DATA_FILE.read_text()), json.loads(INDEX_FILE.read_text())
    assert data["version"].endswith("r12") and len(data["items"]) == 171
    assert 18 in data["pendingSourceNos"] and not any(x["sourceNo"] == 18 for x in data["items"])
    assert sha(EXAM) == "5a258dad75459598920ecf5e221db1b4d94dfc5899a2260cf3e7f0b121fe8d2c"
    assert sha(ANSWER) == "6559ed2c3ec8c5a4908c9decaec66dc19f566ef8f672dc02dc47d96dcf9d879e"
    assert EXAM_RENDER.is_file() and ANSWER_RENDER.is_file()
    source_text = "".join((PdfReader(str(EXAM)).pages[2].extract_text() or "").split())
    assert "은지는처음에얼마의돈을가지고있었습니다" in source_text
    assert "월초원의용돈" in source_text and "월말에는오히려원이모자랐습니다" in source_text
    assert "처음에가지고있었던돈과처음에계획했던지출액" in source_text
    variants = [make_item(i, *params) for i, params in enumerate(PARAMETERS, 1)]
    data["items"].extend(variants)
    data["items"].sort(key=lambda x: (x["sourceNo"], x["variantNo"]))
    data["availableSourceNos"].append(18)
    data["availableSourceNos"].sort()
    data["pendingSourceNos"].remove(18)
    data["version"] = VERSION
    data["reviewSummary"].update({"independentMathCount": len(data["items"]),
                                  "sourceTypes": len(data["availableSourceNos"]),
                                  "sourceDrawingCount": sum(bool(x.get("asset")) for x in data["items"])})
    DATA_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    entry = variants[0]
    index["items"].append({"sourceNo": 18, "genId": entry["genId"], "area": entry["area"],
                           "subarea": entry["subarea"], "detailType": entry["detailType"],
                           "pointBand": entry["pointBand"], "reviewStatus": "verified", "variantCount": 9})
    index["items"].sort(key=lambda x: x["sourceNo"])
    index.update({"version": VERSION, "itemCount": len(data["items"]), "pendingSourceNos": data["pendingSourceNos"]})
    INDEX_FILE.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")
    review = {"sourceExam": {"file": EXAM.name, "driveFileId": EXAM_ID, "sha256": sha(EXAM),
                             "page": 3, "questionNo": 18, "directVisualReview": True,
                             "sourceText": "1월부터 매월 초 3,000원 용돈을 받고 매월 6,000원씩 지출, 10월 말까지 모두 쓰려 했으며 7월 말 1,000원 부족. 처음 가진 돈과 월 계획 지출을 묻는다.",
                             "drawingPresent": False, "render": str(EXAM_RENDER.relative_to(ROOT))},
              "sourceAnswer": {"file": ANSWER.name, "driveFileId": ANSWER_ID, "sha256": sha(ANSWER),
                               "page": 18, "directVisualReview": True, "teacherMarkedInitialMoney": 20000,
                               "teacherMarkedPlannedMonthlySpending": 5000,
                               "render": str(ANSWER_RENDER.relative_to(ROOT))},
              "sourceEquations": {"initialMoney": "x+10*3000=10p", "shortageAtJulyEnd": "x+7*3000-7*6000=-1000",
                                  "solution": {"x": 20000, "p": 5000}},
              "variantCount": 9, "newSourceTypes": 0, "difficulty": "3.4 point band only = medium",
              "variants": [{"id": x["id"], "params": x["verification"]["parameters"], "answer": x["answer"]} for x in variants],
              "dataVersion": VERSION}
    (WORK / "q18-source-answer-review.json").write_text(json.dumps(review, ensure_ascii=False, indent=2) + "\n")
    print("Added Applied5 Q18: 9 two-condition monthly-budget variants; source answer 20,000/5,000; total", len(data["items"]))


if __name__ == "__main__":
    main()

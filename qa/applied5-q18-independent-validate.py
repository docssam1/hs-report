#!/usr/bin/env python3
"""Independent source, answer, and integer-solution audit for Applied 5 Q18."""
import hashlib
import json
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw5"
EXAM = ROOT / "materials/초등과정 대비 실전 모의고사활용 5회.pdf"
ANSWER = WORK / "q16-source-r11/answer.pdf"
DATA = json.loads((ROOT / "bank/data/applied5-expanded.json").read_text())
INDEX = json.loads((ROOT / "bank/data/applied5-expanded-index.json").read_text())
REVIEW = json.loads((WORK / "q18-source-answer-review.json").read_text())


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def brute_solutions(allowance, actual, month, shortage):
    found = []
    # Search the two requested nonnegative integer amounts independently.
    for initial in range(0, 100001):
        total = initial + 10 * allowance
        if total % 10:
            continue
        planned = total // 10
        if initial + month * allowance - month * actual == -shortage:
            found.append((initial, planned))
    return found


def main():
    assert DATA["version"].endswith("q20-r15") and len(DATA["items"]) == 198
    assert INDEX["version"] == DATA["version"] and INDEX["itemCount"] == 198
    assert len(DATA["availableSourceNos"]) == 22 and 18 in DATA["availableSourceNos"]
    assert 18 not in DATA["pendingSourceNos"] and INDEX["pendingSourceNos"] == DATA["pendingSourceNos"]
    assert sha(EXAM) == REVIEW["sourceExam"]["sha256"] == "5a258dad75459598920ecf5e221db1b4d94dfc5899a2260cf3e7f0b121fe8d2c"
    assert sha(ANSWER) == REVIEW["sourceAnswer"]["sha256"] == "6559ed2c3ec8c5a4908c9decaec66dc19f566ef8f672dc02dc47d96dcf9d879e"
    source_text = "".join((PdfReader(str(EXAM)).pages[2].extract_text() or "").split())
    assert all(token in source_text for token in ("은지는처음에", "월초원의용돈", "매월원씩",
                                                   "월말에는오히려원이모자랐습니다", "10월말까지"))
    assert len(PdfReader(str(ANSWER)).pages) >= 18
    assert REVIEW["sourceAnswer"]["teacherMarkedInitialMoney"] == 20000
    assert REVIEW["sourceAnswer"]["teacherMarkedPlannedMonthlySpending"] == 5000
    assert REVIEW["sourceEquations"]["solution"] == {"x": 20000, "p": 5000}

    items = [x for x in DATA["items"] if x["sourceNo"] == 18]
    assert len(items) == 9 and [x["variantNo"] for x in items] == list(range(1, 10))
    answers = set()
    checks = []
    for item in items:
        p = item["verification"]["parameters"]
        a, b, m, s = p["monthlyAllowance"], p["monthlyActualSpending"], p["shortageMonth"], p["shortfall"]
        x, y = p["initialMoney"], p["plannedMonthlySpending"]
        assert item["answerParts"] == [x, y] and item["answer"] == f"{x:,}원, {y:,}원"
        assert item["answerContract"] == "ordered-parts" and item["pointBand"] == "3.4"
        assert item["difficultyEvidence"]["label"] == "중" and item["reviewStatus"] == "verified"
        assert x + 10 * a == 10 * y
        assert x + m * a - m * b == -s
        assert 0 < a < y < b and 1 <= m < 10 and s > 0
        candidates = brute_solutions(a, b, m, s)
        assert candidates == [(x, y)], item["id"]
        assert f"={x:,}원입니다." in item["solutionSteps"][1]
        assert f"={y:,}원입니다." in item["solutionSteps"][2]
        assert item["verification"]["sourceDrawingPresent"] is False
        assert "먼저" not in item["text"] and "따라서" not in item["text"]
        answers.add((x, y))
        checks.append({"id": item["id"], "candidatePairs": [list(v) for v in candidates],
                       "wholePeriodBalance": x + 10 * a - 10 * y,
                       "shortageMonthBalance": x + m * a - m * b,
                       "expectedShortageBalance": -s,
                       "answer": [x, y], "passed": True})
    assert len(answers) == 9
    proof = {"dataSha256": sha(ROOT / "bank/data/applied5-expanded.json"),
             "sourceExamSha256": sha(EXAM), "sourceAnswerSha256": sha(ANSWER),
             "sourceQuestion": 18, "sourceExamPage": 3, "sourceAnswerPage": 18,
             "variantCount": len(checks), "independentMethod": "enumerate initial integer amounts 0..100000; derive the period-budget monthly amount and test the shortage equation",
             "allSolutionsUnique": True, "variants": checks}
    (WORK / "q18-independent-math.json").write_text(json.dumps(proof, ensure_ascii=False, indent=2) + "\n")
    print("PASS Applied5 Q18: direct source page 3 and marked answer page 18; 9 unique two-equation integer solutions; no diagram required; 3.4-point medium band.")


if __name__ == "__main__":
    main()

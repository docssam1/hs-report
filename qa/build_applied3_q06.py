"""Build a private Applied3 Q06 draft from the current work-rate source.

The current source and the available 2022 answer candidate disagree (16 vs 18).
This script intentionally does not modify public bank data or its index.
"""
import hashlib
import json
from fractions import Fraction
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "materials/초등과정 대비 실전 모의고사 활용 3회.pdf"
OUT = ROOT / ".private-work/hw-expansion-20261023/hw3/q06-review/q06-variants-draft-r1.json"
SOURCE_SHA = "877da93ca12b01d513ef182bbf5998c6a391f2ee6c243059dcf79d901bf8f0f6"
CASES = []
for solo_days in range(8, 17):
    partner_days = 2 * solo_days
    a, c = 2, solo_days // 2
    b, d = partner_days - 2 * a, partner_days - 2 * c
    CASES.append((a, b, c, d, solo_days, partner_days))


def solve(a, b, c, d):
    det = a * d - b * c
    assert det != 0
    # a*x + b*y = 1; c*x + d*y = 1, where x is Kwanho's daily work rate.
    x = Fraction(d - b, det)
    y = Fraction(a - c, det)
    assert a * x + b * y == 1
    assert c * x + d * y == 1
    return 1 / x, 1 / y


def make_item(no, case, source_sha):
    a, b, c, d, expected_a_days, expected_b_days = case
    a_days, b_days = solve(a, b, c, d)
    assert a_days == expected_a_days and b_days == expected_b_days
    steps = [
        f"전체 일의 양을 1이라고 하고, 관호와 주연이가 하루에 하는 일의 양을 각각 x, y라고 두면 {a}x+{b}y=1, {c}x+{d}y=1입니다.",
        f"두 식을 빼면 {a-c}x={d-b}y입니다. 이를 첫째 식에 대입해 관호의 하루 작업량을 구하면 x=1/{expected_a_days}입니다.",
        f"관호가 혼자서 전체 일을 하는 데 걸리는 시간은 1÷x={expected_a_days}일입니다.",
    ]
    answer = f"{expected_a_days}일"
    return {
        "id": f"applied3-q06-v{no}", "genId": "applied3-q06", "sourceSet": "applied",
        "sourceRound": 3, "sourceNo": 6, "variantNo": no,
        "reviewStatus": "draft-source-answer-review", "area": "수와 식", "subarea": "일과 시간",
        "detailType": "함께 일한 양으로 한 사람의 작업 시간 구하기",
        "pointBand": "2.7",
        "text": (f"관호가 혼자 {a}일 동안 일한 뒤 주연이가 혼자 {b}일 동안 일하면 끝나는 일이 있습니다. "
                 f"관호가 혼자 {c}일 동안 일한 뒤 주연이가 혼자 {d}일 동안 일해도 이 일은 끝납니다. "
                 "두 사람은 각각 같은 빠르기로 일할 때, 관호가 혼자 이 일을 끝내려면 며칠 걸릴까요?"),
        "answer": answer, "answerParts": [expected_a_days], "answerLabels": ["일"],
        "acceptedAnswers": [answer], "answerContract": "ordered-parts",
        "solutionSteps": steps, "solution": " ".join(steps),
        "learningPoint": "두 사람의 하루 작업량을 미지수로 놓고 같은 전체 작업량을 나타내는 식 세우기",
        "learningLocation": "활용 3회 · 원문 6번 · 함께 일한 양으로 한 사람의 작업 시간 구하기",
        "verification": {
            "primaryMethod": "solve the exact two-equation work-rate system",
            "parameters": {"firstKwanhoDays": a, "firstPartnerDays": b,
                           "secondKwanhoDays": c, "secondPartnerDays": d,
                           "expectedKwanhoSoloDays": expected_a_days,
                           "expectedPartnerSoloDays": expected_b_days},
            "independentSuite": "qa/applied3-q06-independent-validate.py",
            "sourceExamPage": 2, "sourceExamSha256": source_sha,
            "sourceTextDirectlyReviewed": True, "sourceHasFigure": False,
            "sourceAnswerCandidate": 18, "independentSourceAnswer": 16,
            "sourceAnswerStatus": "candidate is a 2022 marked copy; official edition match unconfirmed and handwritten 18 conflicts with the exact work-rate equations",
            "studentDifficultyMeasured": False,
        },
        "difficultyEvidence": {"basis": "source-point-band", "label": "하",
                               "sourceReasoningPreserved": True, "measuredVariantRate": None},
    }


source_sha = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
assert source_sha == SOURCE_SHA, f"Current exam PDF changed: {source_sha}"
assert len(CASES) == 9
items = [make_item(i, case, source_sha) for i, case in enumerate(CASES, 1)]
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps({
    "version": "20261025-applied3-q06-private-draft-r1",
    "status": "private draft; not merged into bank/data; source-answer candidate conflict recorded",
    "source": {"file": str(SOURCE.relative_to(ROOT)), "page": 2,
               "sha256": source_sha, "independentAnswer": 16,
               "candidateAnswer": 18, "candidateEdition": "2022; not matched to current 2026 source"},
    "items": items,
}, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({"output": str(OUT.relative_to(ROOT)), "count": len(items),
                  "answers": [x["answer"] for x in items], "sourceSha256": source_sha,
                  "draftSha256": hashlib.sha256(OUT.read_bytes()).hexdigest()},
                 ensure_ascii=False, indent=2))

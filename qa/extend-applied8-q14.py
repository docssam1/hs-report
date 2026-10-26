#!/usr/bin/env python3
"""Add nine independently checked variants of existing Applied 8 Q14."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw8"
EXAM = ROOT / "materials/초등과정 대비 실전 모의고사활용 8회.pdf"
ANSWER = WORK / "source-review/applied8-answer-drive-copy.pdf"
OUT = ROOT / "bank/data/applied8-expanded.json"
INDEX = ROOT / "bank/data/applied8-expanded-index.json"
REVIEW = WORK / "q14-source-review.json"
VERSION = "20261025-applied8-expansion-q13-q14-q15-q17-q18-q20-q21-q22-q23-r9"

# p, q, numerator step, denominator step, target index. Each has four
# displayed terms and the same task as the source: infer two arithmetic
# progressions, add the nth numerator and denominator, and invert for n.
CASES = [
    (1, 14, 2, 6, 137),
    (3, 16, 2, 4, 181),
    (5, 18, 2, 8, 113),
    (1, 16, 3, 5, 127),
    (3, 20, 3, 7, 139),
    (5, 22, 4, 6, 101),
    (1, 18, 4, 8, 117),
    (3, 22, 5, 7, 109),
    (5, 24, 5, 9, 97),
]


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def fraction(numerator: int, denominator: int) -> str:
    return (
        '<math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac>'
        f"<mn>{numerator}</mn><mn>{denominator}</mn>"
        "</mfrac></math>"
    )


def make_item(case: tuple[int, int, int, int, int], variant: int) -> dict:
    p, q, dn, dd, n = case
    first_sum = p + q
    step_sum = dn + dd
    target = first_sum + step_sum * (n - 1)
    numerator = p + dn * (n - 1)
    denominator = q + dd * (n - 1)
    assert n > 4 and numerator + denominator == target
    assert 0 < numerator < denominator
    seq = [fraction(p + i * dn, q + i * dd) for i in range(4)]
    steps = [
        f"주어진 분수열에서 분자는 {p}부터 {dn}씩 커지고, 분모는 {q}부터 {dd}씩 커집니다.",
        f"따라서 n번째 분자의 수는 {p}+{dn}(n−1), 분모의 수는 {q}+{dd}(n−1)입니다. 두 수의 합은 {first_sum}+{step_sum}(n−1)입니다.",
        f"분자와 분모의 합이 {target}이므로 {first_sum}+{step_sum}(n−1)={target}입니다. 이를 풀면 n={n}입니다.",
        f"{n}번째 분수의 분자는 {numerator}, 분모는 {denominator}이고 합은 {numerator}+{denominator}={target}입니다. 그러므로 답은 {n}번째입니다.",
    ]
    return {
        "id": f"applied8-q14-v{variant}",
        "genId": "applied8-q14",
        "sourceSet": "applied",
        "sourceRound": 8,
        "sourceNo": 14,
        "variantNo": variant,
        "reviewStatus": "verified",
        "area": "수와 식",
        "subarea": "수열",
        "detailType": "분자와 분모의 일정한 증가로 분수의 순서 찾기",
        "pointBand": "3.4",
        "text": f"어떤 규칙으로 분수를 늘어놓았습니다. 분자와 분모의 합이 {target}이 되는 분수는 몇 번째인지 구하세요.",
        "promptDataLabel": "주어진 분수열",
        "promptDataLines": [", ".join(seq) + ", …"],
        "answer": str(n),
        "answerParts": [n],
        "answerLabels": ["몇 번째 분수인지"],
        "acceptedAnswers": [str(n), f"{n}번째"],
        "answerContract": "single-number",
        "solutionSteps": steps,
        "solution": " ".join(steps),
        "learningPoint": "분자와 분모의 증가 규칙을 각각 식으로 나타내고, 두 수의 합으로 항의 순서를 역산하기",
        "learningLocation": "활용 8회 · 원문 14번 · 분수열에서 분자와 분모의 합으로 순서 찾기",
        "verification": {
            "primaryMethod": "두 산술수열의 n번째 항을 각각 나타내고 합을 목표값과 같게 둔다.",
            "independentMethod": "처음 네 항의 차이를 직접 확인한 뒤 항을 n까지 전개하고 분자·분모 합을 다시 계산한다.",
            "parameters": {
                "firstNumerator": p,
                "firstDenominator": q,
                "numeratorStep": dn,
                "denominatorStep": dd,
                "targetSum": target,
                "index": n,
                "numeratorAtIndex": numerator,
                "denominatorAtIndex": denominator,
            },
            "independentSuite": "qa/applied8-q14-independent-validate.py",
            "sourceExamPage": 3,
            "sourceExamFile": EXAM.name,
            "sourceAnswerPage": 3,
            "sourceDrawingCompared": True,
            "sourceDrawingPresent": True,
            "variantUsesSourceDrawing": False,
            "officialAnswerStatus": "The synced Drive file titled as the answer PDF is a blank exam duplicate; no marked official key was available. Source and variant answers were independently derived.",
            "studentDifficultyMeasured": False,
        },
        "difficultyEvidence": {
            "basis": "source-point-band",
            "label": "중",
            "sourceReasoningPreserved": True,
            "measuredVariantRate": None,
            "estimated": False,
            "rationale": "활용 8회 원문 14번은 13~22번의 3.4점 배점대다. 활용 난도는 배점대만 적용한다.",
        },
    }


def main() -> None:
    if not EXAM.is_file() or not ANSWER.is_file():
        raise SystemExit("The source exam or synced answer candidate is missing.")
    exam_text = PdfReader(str(EXAM)).pages[2].extract_text()
    answer_text = PdfReader(str(ANSWER)).pages[2].extract_text()
    if "분자와 분모의 합이" not in exam_text or "1261" not in exam_text:
        raise SystemExit("The exact source Q14 prompt was not found on exam page 3.")
    if exam_text != answer_text:
        raise SystemExit("The synced answer candidate differs from the source exam; inspect before proceeding.")

    original_index = 1 + (1261 - (1 + 12)) // (2 + 4)
    assert (1261 - 13) % 6 == 0
    assert original_index == 209 and (2 * original_index - 1) + (4 * original_index + 8) == 1261

    data = json.loads(OUT.read_text())
    index = json.loads(INDEX.read_text())
    existing = [item for item in data["items"] if item["sourceNo"] == 14]
    if existing:
        raise SystemExit("Q14 already exists in the bank; refusing to duplicate or overwrite it.")
    new_items = [make_item(case, i + 1) for i, case in enumerate(CASES)]
    data["version"] = VERSION
    data["items"].extend(new_items)
    data["itemCount"] = len(data["items"])
    data["availableSourceNos"] = sorted(set(data["availableSourceNos"] + [14]))
    data["pendingSourceNos"] = [n for n in range(1, 31) if n not in data["availableSourceNos"]]
    index["version"] = VERSION
    index["itemCount"] = len(data["items"])
    index["pendingSourceNos"] = data["pendingSourceNos"]
    index["items"].append({
        "sourceNo": 14,
        "genId": "applied8-q14",
        "area": "수와 식",
        "subarea": "수열",
        "detailType": "분자와 분모의 일정한 증가로 분수의 순서 찾기",
        "pointBand": "3.4",
        "reviewStatus": "verified",
        "variantCount": 9,
    })
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    INDEX.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")

    review = {
        "sourceExam": {
            "file": EXAM.name,
            "sha256": sha256(EXAM),
            "page": 3,
            "questionNo": 14,
            "directVisualReview": True,
            "sourceData": ["1/12", "3/16", "5/20", "7/24"],
            "targetSum": 1261,
        },
        "answerCandidates": [{
            "file": ANSWER.name,
            "sha256": sha256(ANSWER),
            "page": 3,
            "directVisualReview": True,
            "containsAnswers": False,
            "comparison": "Extracted page text equals the source exam page; visually reviewed page has the same blank source and no marked answers.",
        }],
        "sourceIndependentSolution": {
            "numerator": "2n−1",
            "denominator": "4n+8",
            "sum": "6n+7",
            "equation": "6n+7=1261",
            "answer": 209,
            "check": "The 209th term is 417/844 and 417+844=1261.",
        },
        "answerSourceConclusion": "The synced Drive file titled as Applied 8 answer PDF is a blank exam duplicate, not an answer key. Q14's answer was independently solved; official answer-key comparison remains unavailable.",
        "variantCount": 9,
        "variantCases": [dict(zip(("firstNumerator", "firstDenominator", "numeratorStep", "denominatorStep", "index"), c), target=(c[0] + c[1] + (c[2] + c[3]) * (c[4] - 1))) for c in CASES],
        "variantsIndependentlyCalculated": True,
        "newSourceTypes": 0,
        "difficulty": "3.4-point band only = middle",
        "examSha256": sha256(EXAM),
        "answerCandidateSha256": sha256(ANSWER),
    }
    REVIEW.write_text(json.dumps(review, ensure_ascii=False, indent=2) + "\n")
    print(f"Wrote Q14 variants; preserved Q13 and now have {len(data['items'])} items across {len(data['availableSourceNos'])} source types.")


if __name__ == "__main__":
    main()

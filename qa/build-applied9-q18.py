#!/usr/bin/env python3
"""Add nine uniquely-solvable text-condition variants for Applied 9 Q18.

The original printed Q18 is excluded: its printed total is contradictory and
the candidate correction still permits two distinct answers.  Variants keep
the source's six-session constraint-reasoning structure without borrowing its
ambiguous numeric instance.
"""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "bank/data/applied9-expanded.json"
INDEX = ROOT / "bank/data/applied9-expanded-index.json"
SOURCE = ROOT / "materials/초등과정 대비 실전 모의고사 활용 9회.pdf"
ANSWER = ROOT / ".private-work/hw-expansion-20261023/hw9/candidate-special-9-answer.pdf"
SOURCE_SHA = "0e32749d028cdcacd9e61d2b1d1cb5080266ac672a9a3ed17503270a74142794"
ANSWER_SHA = "a6648f008a8e7ba7012913ede0cbad488aec782eaa06818a97acfb6900ac8d62"
ANSWER_DRIVE_ID = "1M7rJHVE11w4BZF5OHjZegDLcGGlmxKp4"
VERSION = "20261025-applied9-q02-q05-q06-q07-q10-q11-q13-q17-q18-q19-q21-q26-q27-q29-q30-r11"

# (first = ratio * second, first-three total, fifth, sixth increment, six-session total)
PARAMETERS = [
    (2, 10, 2, 2, 25),
    (3, 14, 1, 3, 26),
    (4, 8, 2, 6, 27),
    (5, 10, 2, 5, 28),
    (2, 8, 4, 4, 29),
    (3, 10, 4, 3, 30),
    (4, 12, 2, 6, 31),
    (5, 14, 2, 5, 32),
    (2, 12, 6, 1, 33),
]


def solutions(k, first_three_sum, fifth, sixth_increment, total):
    sixth = fifth + sixth_increment
    fourth = total - first_three_sum - fifth - sixth
    out = []
    candidates = []
    for second in range(1, 10):
        first = k * second
        third = first_three_sum - first - second
        counts = (first, second, third, fourth, fifth, sixth)
        in_range = all(1 <= x <= 9 for x in counts)
        distinct = len(set(counts)) == 6
        candidates.append({"second": second, "counts": list(counts),
                           "inRange": in_range, "allDistinct": distinct})
        if in_range and distinct:
            out.append(counts)
    return fourth, out, candidates


def make_item(n, p):
    k, first_three_sum, fifth, sixth_increment, total = p
    sixth = fifth + sixth_increment
    fourth, sols, candidates = solutions(*p)
    assert len(sols) == 1, (n, p, sols)
    first, second, third, _, _, _ = sols[0]
    valid_rows = [row for row in candidates if row["inRange"] and row["allDistinct"]]
    prompt = (
        "수미는 한 회에 10문제씩 모두 6회 풀었습니다. "
        "다음 조건을 만족할 때, 3회에 맞힌 문제 수는 몇 개인지 구하시오."
    )
    lines = [
        "각 회에 맞힌 문제 수는 1개 이상 9개 이하이며, 여섯 회의 맞힌 수는 모두 다릅니다.",
        f"1회, 2회, 3회에 맞힌 문제 수의 합은 {first_three_sum}개입니다.",
        f"5회에는 {fifth}개, 6회에는 {sixth}개를 맞혔습니다.",
        f"1회에 맞힌 문제 수는 2회에 맞힌 문제 수의 {k}배입니다.",
        f"여섯 회에 맞힌 문제 수의 합은 {total}개입니다.",
    ]
    candidate_summary = "; ".join(
        f"2회={r['second']}: (1~6회)=({','.join(map(str, r['counts']))})"
        + (" 가능" if r["inRange"] and r["allDistinct"] else " 제외")
        for r in candidates
    )
    steps = [
        f"여섯 회 합에서 1~3회 합과 5·6회 수를 빼면 4회에 맞힌 수는 {total}−{first_three_sum}−{fifth}−{sixth}={fourth}개입니다.",
        f"2회에 맞힌 수를 x라 하면 1회는 {k}x, 3회는 {first_three_sum}−{k}x−x={first_three_sum}−{k + 1}x입니다. 1회 수가 9 이하이므로 x의 가능한 정수값을 모두 확인합니다.",
        f"전수 확인: {candidate_summary}.",
        f"모든 수가 1~9이고 여섯 값이 서로 다른 경우는 (1~6회)=({first},{second},{third},{fourth},{fifth},{sixth})뿐입니다. 따라서 3회에 맞힌 수는 {third}개입니다.",
    ]
    return {
        "id": f"applied9-q18-v{n}", "genId": "applied9-q18",
        "sourceSet": "applied", "sourceRound": 9, "sourceNo": 18,
        "variantNo": n, "reviewStatus": "verified",
        "area": "지문 이해", "subarea": "조건 추론",
        "detailType": "서로 다른 회차별 정답 수의 비율·부분합·전체합으로 한 회의 수 찾기",
        "pointBand": "3.4", "text": prompt,
        "promptDataLines": lines,
        "answer": str(third), "answerParts": [third],
        "answerLabels": ["3회에 맞힌 문제 수"],
        "acceptedAnswers": [str(third)], "answerContract": "single-number",
        "solutionSteps": steps, "solution": " ".join(steps),
        "learningPoint": "여러 회차의 부분합·전체합과 비율 조건을 식으로 묶고 서로 다른 값 조건으로 후보를 좁히기",
        "learningLocation": "활용 9회 · 원문 18번 유형 · 여러 조건으로 회차별 수 추론하기",
        "verification": {
            "primaryMethod": "2회 수 x를 가능한 정수로 모두 두고 1회·3회 수를 계산한 뒤, 전체합으로 정한 4회 수와 함께 범위·서로 다름 조건을 검사한다.",
            "independentMethod": "x=1..9를 직접 대입하고 여섯 회차의 정수 튜플을 구성해 유효 튜플 전체를 열거한다.",
            "parameters": {
                "firstMultiplier": k, "firstThreeSum": first_three_sum,
                "fifth": fifth, "sixthIncrement": sixth_increment,
                "sixth": sixth, "total": total, "fourth": fourth,
                "uniqueCounts": list(sols[0]), "candidates": candidates,
                "validCountTuples": [list(x) for x in sols],
                "answer": third,
            },
            "independentSuite": "qa/applied9-q18-independent-validate.py",
            "sourceExamPage": 3,
            "sourceExamFile": "초등과정 대비 실전 모의고사 활용 9회.pdf",
            "sourceExamSha256": SOURCE_SHA,
            "sourceAnswerPage": 3,
            "sourceAnswerFile": "초등과정 대비 실전 모의고사 특강 9회 답안.pdf",
            "sourceAnswerDriveId": ANSWER_DRIVE_ID,
            "officialAnswerStatus": "Original printed total 31 contradicts the distinct-count condition; candidate handwritten correction to 33 admits two valid third-session answers (8 and 4). Original is excluded; this variant has its own independently verified unique solution.",
            "sourceDrawingCompared": True, "sourceDrawingPresent": False,
            "sourceDrawingDescription": "The original contains a text-only condition box, not a mathematical diagram. Variant conditions are typeset as given text in promptDataLines.",
            "variantUsesSourceDrawing": False, "variantDrawingModified": False,
            "sourceConditionBoxCompared": True,
            "studentDifficultyMeasured": False,
        },
        "difficultyEvidence": {
            "basis": "source-point-band", "label": "중",
            "sourceReasoningPreserved": True, "measuredVariantRate": None,
            "estimated": False,
            "rationale": "활용 9회 원문 13~22번의 배점대는 3.4점이며 활용 난도는 배점대만 적용한다.",
        },
    }


def main():
    assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == SOURCE_SHA
    assert hashlib.sha256(ANSWER.read_bytes()).hexdigest() == ANSWER_SHA
    data, index = json.loads(DATA.read_text()), json.loads(INDEX.read_text())
    assert data["version"].endswith("-r10") and index["version"] == data["version"]
    assert 18 in data["pendingSourceNos"] and not any(x["sourceNo"] == 18 for x in data["items"])

    # Audit the exact source instance separately; do not promote its answer.
    _, printed_solutions, _ = solutions(3, 12, 5, 2, 31)
    _, corrected_solutions, _ = solutions(3, 12, 5, 2, 33)
    assert printed_solutions == []
    assert corrected_solutions == [(3, 1, 8, 9, 5, 7), (6, 2, 4, 9, 5, 7)]

    additions = [make_item(i, p) for i, p in enumerate(PARAMETERS, 1)]
    assert [x["answer"] for x in additions] == list(map(str, range(1, 10)))
    items = sorted(data["items"] + additions, key=lambda x: (x["sourceNo"], x["variantNo"]))
    available = sorted({x["sourceNo"] for x in items})
    pending = [n for n in range(1, 31) if n not in available]
    data.update(version=VERSION, items=items, itemCount=len(items),
                availableSourceNos=available, pendingSourceNos=pending)
    data["sourceReview"].setdefault("questionReviews", {})["18"] = {
        "sourcePage": 3, "printedTotal": 31, "candidateHandwrittenCorrection": 33,
        "sourceParameters": {"firstThreeSum": 12, "fifth": 5,
                             "sixth": 7, "firstMultiplier": 3},
        "printedSolutions": [],
        "candidateCorrectionSolutions": [list(x) for x in corrected_solutions],
        "candidateCorrectionAnswersForThirdSession": [8, 4],
        "candidateOfficialStatus": "Candidate page 3 is not authenticated as the official matching answer edition.",
        "status": "Original Q18 is excluded: printed total 31 yields no all-distinct solution; handwritten 33 correction admits two valid solutions, so third-session answer is not unique. Nine new variants use the same text-condition reasoning structure and each has one unique solution.",
    }
    index.update(version=VERSION, itemCount=len(items), availableSourceNos=available,
                 pendingSourceNos=pending)
    index["items"].append({
        "sourceNo": 18, "genId": "applied9-q18", "area": "지문 이해",
        "subarea": "조건 추론",
        "detailType": "서로 다른 회차별 정답 수의 비율·부분합·전체합으로 한 회의 수 찾기",
        "pointBand": "3.4", "reviewStatus": "verified", "variantCount": 9,
    })
    index["items"].sort(key=lambda x: x["sourceNo"])
    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    INDEX.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"status": "BUILT", "version": VERSION, "added": 9,
                      "total": len(items), "pending": pending,
                      "sourcePrintedTotalSolutions": len(printed_solutions),
                      "candidateCorrectionSolutions": [list(x) for x in corrected_solutions],
                      "answers": [x["answer"] for x in additions]},
                     ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

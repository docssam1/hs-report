#!/usr/bin/env python3
"""Independent enumeration for Applied 9 Q18 text-condition variants."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / "bank/data/applied9-expanded.json").read_text())
INDEX = json.loads((ROOT / "bank/data/applied9-expanded-index.json").read_text())
SOURCE = ROOT / "materials/초등과정 대비 실전 모의고사 활용 9회.pdf"
ANSWER = ROOT / ".private-work/hw-expansion-20261023/hw9/candidate-special-9-answer.pdf"
SOURCE_SHA = "0e32749d028cdcacd9e61d2b1d1cb5080266ac672a9a3ed17503270a74142794"
ANSWER_SHA = "a6648f008a8e7ba7012913ede0cbad488aec782eaa06818a97acfb6900ac8d62"
VERSION = "20261026-applied9-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q11-q12-q13-q14-q15-q16-q17-q18-q19-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-taxonomy-r25"
PARAMS = [
    (2, 10, 2, 2, 25), (3, 14, 1, 3, 26), (4, 8, 2, 6, 27),
    (5, 10, 2, 5, 28), (2, 8, 4, 4, 29), (3, 10, 4, 3, 30),
    (4, 12, 2, 6, 31), (5, 14, 2, 5, 32), (2, 12, 6, 1, 33),
]
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == SOURCE_SHA
assert hashlib.sha256(ANSWER.read_bytes()).hexdigest() == ANSWER_SHA
assert DATA["version"] == INDEX["version"] == VERSION
assert DATA["itemCount"] == INDEX["itemCount"] == len(DATA["items"]) == 270
items = [x for x in DATA["items"] if x["sourceNo"] == 18]
assert len(items) == 9 and [x["variantNo"] for x in items] == list(range(1, 10))
assert DATA["sourceReview"]["questionReviews"]["18"]["printedSolutions"] == []
assert DATA["sourceReview"]["questionReviews"]["18"]["candidateCorrectionAnswersForThirdSession"] == [8, 4]

# Reproduce the source conflict: the printed 31 yields no distinct tuple;
# replacing it by the candidate's handwritten 33 yields two tuples.
def enumerate_source(total):
    out = []
    fourth = total - 12 - 5 - 7
    for first in range(1, 10):
        for second in range(1, 10):
            third = 12 - first - second
            counts = (first, second, third, fourth, 5, 7)
            if first == 3 * second and all(1 <= x <= 9 for x in counts) and len(set(counts)) == 6:
                out.append(counts)
    return out

assert enumerate_source(31) == []
assert enumerate_source(33) == [(3, 1, 8, 9, 5, 7), (6, 2, 4, 9, 5, 7)]

answers = []
for item, (k, first_three_sum, fifth, delta, total) in zip(items, PARAMS):
    sixth = fifth + delta
    expected_lines = [
        "각 회에 맞힌 문제 수는 1개 이상 9개 이하이며, 여섯 회의 맞힌 수는 모두 다릅니다.",
        f"1회, 2회, 3회에 맞힌 문제 수의 합은 {first_three_sum}개입니다.",
        f"5회에는 {fifth}개, 6회에는 {sixth}개를 맞혔습니다.",
        f"1회에 맞힌 문제 수는 2회에 맞힌 문제 수의 {k}배입니다.",
        f"여섯 회에 맞힌 문제 수의 합은 {total}개입니다.",
    ]
    assert item["promptDataLines"] == expected_lines
    assert item.get("asset") is None, "Q18 conditions are text data; no invented problem diagram."
    # Independent brute force: enumerate all first-four count choices, not x2 substitution.
    valid = []
    for first in range(1, 10):
        for second in range(1, 10):
            for third in range(1, 10):
                for fourth in range(1, 10):
                    counts = (first, second, third, fourth, fifth, sixth)
                    if (first == k * second and first + second + third == first_three_sum
                            and sum(counts) == total and len(set(counts)) == 6):
                        valid.append(counts)
    assert len(valid) == 1, (item["id"], valid)
    assert item["verification"]["parameters"]["validCountTuples"] == [list(valid[0])]
    assert item["answer"] == str(valid[0][2])
    assert item["answerParts"] == [valid[0][2]] and item["acceptedAnswers"] == [str(valid[0][2])]
    assert item["answerContract"] == "single-number" and item["reviewStatus"] == "verified"
    assert item["area"] == "지문 이해" and item["pointBand"] == "3.4"
    assert "학습 위치" not in item["solution"] and item["learningLocation"]
    assert "학습 포인트" not in item["solution"] and item["learningPoint"]
    assert str(valid[0][2]) in item["solution"]
    answers.append(valid[0][2])

assert answers == list(range(1, 10))
assert DATA["pendingSourceNos"] == []
result = {
    "status": "PASS", "sourceNo": 18, "variants": 9,
    "sourcePrintedTotal31ValidSolutions": 0,
    "candidateCorrectionTotal33Solutions": [[3, 1, 8, 9, 5, 7], [6, 2, 4, 9, 5, 7]],
    "independentMethod": "brute-force all first-four session counts in 1..9, then enforce ratio, partial sum, total and pairwise distinctness",
    "answers": answers, "uniqueSolutionPerVariant": [True] * 9,
    "sourceSha256": SOURCE_SHA, "candidateAnswerSha256": ANSWER_SHA,
}
out = ROOT / ".private-work/hw-expansion-20261023/hw9/q18-evidence"
out.mkdir(parents=True, exist_ok=True)
(out / "q18-independent-validation-r16.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
print(json.dumps(result, ensure_ascii=False, indent=2))

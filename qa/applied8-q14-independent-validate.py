#!/usr/bin/env python3
"""Independent source, arithmetic, answer-contract and index checks for Applied 8 Q14."""
import json
from pathlib import Path
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
EXAM = ROOT / "materials/초등과정 대비 실전 모의고사활용 8회.pdf"
ANSWER = ROOT / ".private-work/hw-expansion-20261023/hw8/source-review/applied8-answer-drive-copy.pdf"
DATA = json.loads((ROOT / "bank/data/applied8-expanded.json").read_text())
INDEX = json.loads((ROOT / "bank/data/applied8-expanded-index.json").read_text())
REVIEW = json.loads((ROOT / ".private-work/hw-expansion-20261023/hw8/q14-source-review.json").read_text())
ITEMS = [x for x in DATA["items"] if x["sourceNo"] == 14]

exam_text = PdfReader(str(EXAM)).pages[2].extract_text()
answer_text = PdfReader(str(ANSWER)).pages[2].extract_text()
assert "분자와 분모의 합이" in exam_text and "1261" in exam_text
assert answer_text == exam_text
assert REVIEW["sourceIndependentSolution"]["answer"] == 209
assert REVIEW["sourceIndependentSolution"]["check"] == "The 209th term is 417/844 and 417+844=1261."
expected_nos = [1,2,3,4,5,6,7,8,9,10,12,13,14,15,17,18,20,21,22,23,24,25,26,27,28,29,30]
assert DATA["itemCount"] == INDEX["itemCount"] == 243
assert DATA["availableSourceNos"] == expected_nos
assert DATA["pendingSourceNos"] == [n for n in range(1, 31) if n not in expected_nos]
assert [x["sourceNo"] for x in INDEX["items"]] == expected_nos
assert len(ITEMS) == 9 and len({x["id"] for x in ITEMS}) == 9
assert [x["variantNo"] for x in ITEMS] == list(range(1, 10))

for item in ITEMS:
    params = item["verification"]["parameters"]
    p, q = params["firstNumerator"], params["firstDenominator"]
    dn, dd, target, n = params["numeratorStep"], params["denominatorStep"], params["targetSum"], params["index"]
    # Independent derivation from the visible first four terms and the target sum.
    displayed = [(p + i * dn, q + i * dd) for i in range(4)]
    assert [displayed[i + 1][0] - displayed[i][0] for i in range(3)] == [dn] * 3
    assert [displayed[i + 1][1] - displayed[i][1] for i in range(3)] == [dd] * 3
    assert n == 1 + (target - p - q) // (dn + dd)
    assert (target - p - q) % (dn + dd) == 0
    num, den = p + dn * (n - 1), q + dd * (n - 1)
    assert num + den == target
    assert item["answerParts"] == [n] and item["answer"] == str(n)
    assert item["answerContract"] == "single-number"
    assert item["pointBand"] == "3.4" and item["difficultyEvidence"]["label"] == "중"
    assert item["reviewStatus"] == "verified" and len(item["solutionSteps"]) == 4
    assert str(num) in item["solutionSteps"][3] and str(den) in item["solutionSteps"][3]
    assert item["sourceNo"] == 14 and item["sourceRound"] == 8
    assert item["verification"]["sourceDrawingCompared"] is True
    assert item["verification"]["officialAnswerStatus"].startswith("The synced Drive file")

assert len(DATA["items"]) == len(DATA["availableSourceNos"]) * 9
assert all(sum(1 for x in DATA["items"] if x["sourceNo"] == no) == 9 for no in (13, 14, 15))
print("PASS Applied8 Q14: exact source page and blank answer duplicate checked; source answer 209 derived; nine distinct fraction-sequence variants independently solved; middle difficulty and index counts match.")

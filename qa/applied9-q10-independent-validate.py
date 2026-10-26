#!/usr/bin/env python3
"""Exact linear-system check for Applied 9 Q10 and its nine variants."""
import hashlib
import json
import struct
from fractions import Fraction
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / "bank/data/applied9-expanded.json").read_text())
INDEX = json.loads((ROOT / "bank/data/applied9-expanded-index.json").read_text())
SOURCE = ROOT / "materials/초등과정 대비 실전 모의고사 활용 9회.pdf"
ANSWER = ROOT / ".private-work/hw-expansion-20261023/hw9/candidate-special-9-answer.pdf"
RENDER = ROOT / ".private-work/hw-expansion-20261023/hw9/q08-review/source-2.png"
EXACT = ROOT / ".private-work/hw-expansion-20261023/hw9/q10-evidence/q10-source-exact-crop.png"
ASSET = ROOT / "bank/assets/applied9/q10-original-crop.png"
SOURCE_SHA = "0e32749d028cdcacd9e61d2b1d1cb5080266ac672a9a3ed17503270a74142794"
ANSWER_SHA = "a6648f008a8e7ba7012913ede0cbad488aec782eaa06818a97acfb6900ac8d62"
RENDER_SHA = "5f9b6bf963ac2300331c062888ac01a8803c6452d9a3af349eb295d1b20af0ba"
ASSET_SHA = "af0c9380b9a3ab8f115f30bc386e5588259bf05b9d79a4fbca6c023536f57214"
VERSION = "20261026-applied9-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q11-q12-q13-q14-q15-q16-q17-q18-q19-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-taxonomy-r25"


def solve_linear(total):
    rows = []
    for start in range(13):
        row = [Fraction(0) for _ in range(16)]
        for i in range(start, start + 3):
            row[i] = Fraction(1)
        row[15] = Fraction(total)
        rows.append(row)
    for pos, value in ((4, 2), (12, 8)):
        row = [Fraction(0) for _ in range(16)]
        row[pos] = Fraction(1)
        row[15] = Fraction(value)
        rows.append(row)

    pivot = 0
    for col in range(15):
        found = next((r for r in range(pivot, len(rows)) if rows[r][col]), None)
        if found is None:
            continue
        rows[pivot], rows[found] = rows[found], rows[pivot]
        scale = rows[pivot][col]
        rows[pivot] = [v / scale for v in rows[pivot]]
        for r in range(len(rows)):
            if r == pivot or not rows[r][col]:
                continue
            factor = rows[r][col]
            rows[r] = [rows[r][c] - factor * rows[pivot][c] for c in range(16)]
        pivot += 1
    assert pivot == 15
    solution = [rows[i][15] for i in range(15)]
    assert all(sum(solution[i:i+3]) == total for i in range(13))
    assert solution[4] == 2 and solution[12] == 8
    return solution


assert DATA["version"] == INDEX["version"] == VERSION
assert DATA["itemCount"] == INDEX["itemCount"] == len(DATA["items"]) == 270
assert 10 in DATA["availableSourceNos"] and 10 not in DATA["pendingSourceNos"]
for path, expected in ((SOURCE, SOURCE_SHA), (ANSWER, ANSWER_SHA),
                       (RENDER, RENDER_SHA), (ASSET, ASSET_SHA), (EXACT, ASSET_SHA)):
    assert hashlib.sha256(path.read_bytes()).hexdigest() == expected, path
assert EXACT.read_bytes() == ASSET.read_bytes()
png = ASSET.read_bytes()
assert png[:8] == b"\x89PNG\r\n\x1a\n"
assert struct.unpack(">II", png[16:24]) == (740, 90)

items = [x for x in DATA["items"] if x["sourceNo"] == 10]
idx = next(x for x in INDEX["items"] if x["sourceNo"] == 10)
assert len(items) == idx["variantCount"] == 9
assert [x["variantNo"] for x in items] == list(range(1, 10))
assert [x["answer"] for x in items] == list(map(str, range(1, 10)))
assert all(x["pointBand"] == "2.7" and x["difficultyEvidence"]["label"] == "하" for x in items)
assert all(x["asset"]["src"] == "assets/applied9/q10-original-crop.png" and
           x["asset"]["sha256"] == ASSET_SHA for x in items)
assert all(x["verification"]["sourceDrawingCompared"] and
           x["verification"]["variantUsesSourceDrawing"] and
           not x["verification"]["variantDrawingModified"] for x in items)
for item in items:
    p = item["verification"]["parameters"]
    solution = solve_linear(p["tripleSum"])
    assert solution[8] == int(item["answer"]) == p["answer"]
    assert solution[4] == p["knownCard5"] == 2
    assert solution[12] == p["knownCard13"] == 8
    assert item["answerParts"] == [int(item["answer"])]
    assert item["acceptedAnswers"] == [item["answer"]]
    assert len(item["solutionSteps"]) >= 4

source = solve_linear(14)
assert source[8] == 4
assert DATA["sourceReview"]["questionReviews"]["10"]["candidateAnswer"] == 4

result = {"status": "PASS", "version": VERSION, "q10Variants": len(items),
          "answers": [int(x["answer"]) for x in items],
          "sourceAnswer": int(source[8]), "answerCandidateStatus": "unconfirmed",
          "independentMethod": "exact 15-variable rational Gauss-Jordan elimination",
          "sourceCropExactBytesMatch": True, "sourceCropSha256": ASSET_SHA}
out = ROOT / ".private-work/hw-expansion-20261023/hw9/q10-evidence/q10-independent-validation-r9.json"
out.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
print(json.dumps(result, ensure_ascii=False, indent=2))

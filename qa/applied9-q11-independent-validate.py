#!/usr/bin/env python3
"""Independent exhaustive and interval checks for Applied 9 Q11."""
import hashlib
import itertools
import json
import struct
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / "bank/data/applied9-expanded.json").read_text())
INDEX = json.loads((ROOT / "bank/data/applied9-expanded-index.json").read_text())
SOURCE = ROOT / "materials/초등과정 대비 실전 모의고사 활용 9회.pdf"
ANSWER = ROOT / ".private-work/hw-expansion-20261023/hw9/candidate-special-9-answer.pdf"
RENDER = ROOT / ".private-work/hw-expansion-20261023/hw9/q08-review/source-2.png"
EXACT_CROP = ROOT / ".private-work/hw-expansion-20261023/hw9/q11-evidence/source-cards-exact-crop.png"
ASSET = ROOT / "bank/assets/applied9/q11-source-cards.png"
SOURCE_SHA = "0e32749d028cdcacd9e61d2b1d1cb5080266ac672a9a3ed17503270a74142794"
ANSWER_SHA = "a6648f008a8e7ba7012913ede0cbad488aec782eaa06818a97acfb6900ac8d62"
RENDER_SHA = "5f9b6bf963ac2300331c062888ac01a8803c6452d9a3af349eb295d1b20af0ba"
ASSET_SHA = "dfe887a93d715f4e0099125f22bc26ae77d7afed3483b11a5ae0e2d235468e5c"
VERSION = "20261026-applied9-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q11-q12-q13-q14-q15-q16-q17-q18-q19-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-taxonomy-r25"
DIGITS = (5, 2, 4, 8, 6)

assert DATA["version"] == INDEX["version"] == VERSION
assert DATA["itemCount"] == INDEX["itemCount"] == len(DATA["items"]) == 270
assert 11 in DATA["availableSourceNos"] and 11 not in DATA["pendingSourceNos"]
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == SOURCE_SHA
assert hashlib.sha256(ANSWER.read_bytes()).hexdigest() == ANSWER_SHA
assert hashlib.sha256(RENDER.read_bytes()).hexdigest() == RENDER_SHA
assert hashlib.sha256(EXACT_CROP.read_bytes()).hexdigest() == ASSET_SHA
assert hashlib.sha256(ASSET.read_bytes()).hexdigest() == ASSET_SHA
assert EXACT_CROP.read_bytes() == ASSET.read_bytes()
png = ASSET.read_bytes()
assert png[:8] == b"\x89PNG\r\n\x1a\n"
assert struct.unpack(">II", png[16:24]) == (500, 120)

items = [x for x in DATA["items"] if x["sourceNo"] == 11]
assert len(items) == INDEX["items"][[x["sourceNo"] for x in INDEX["items"]].index(11)]["variantCount"] == 9
assert [x["variantNo"] for x in items] == list(range(1, 10))
assert [x["answer"] for x in items] == list(map(str, range(1, 10)))
assert len({x["id"] for x in items}) == len({x["answer"] for x in items}) == 9
assert all(x["pointBand"] == "2.7" and x["difficultyEvidence"]["label"] == "하" for x in items)
assert all(x["asset"]["src"] == "assets/applied9/q11-source-cards.png" and
           x["asset"]["sha256"] == ASSET_SHA for x in items)
assert all(x["verification"]["sourceDrawingCompared"] and
           x["verification"]["variantUsesSourceDrawing"] and
           not x["verification"]["variantDrawingModified"] for x in items)

permutation_set = sorted(100*a+10*b+c for a,b,c in itertools.permutations(DIGITS, 3))
assert len(permutation_set) == len(set(permutation_set)) == 60
for item in items:
    p = item["verification"]["parameters"]
    d, q = p["divisor"], p["quotient"]
    by_remainder = sorted(n for n in permutation_set if n // d == q and n % d != 0)
    lo, hi = d*q, d*(q+1)
    by_interval = sorted(100*a+10*b+c for a in DIGITS for b in DIGITS for c in DIGITS
                         if len({a,b,c}) == 3 and lo < 100*a+10*b+c < hi)
    assert by_remainder == by_interval == p["candidateNumbers"]
    assert len(by_remainder) == p["candidateCount"] == int(item["answer"])
    assert item["answerParts"] == item["acceptedAnswers"] == [item["answer"]]
    assert item["text"].count("서로 다른 3장") == 1
    assert "①" not in item["text"]
    assert len(item["solutionSteps"]) >= 4

source = [n for n in permutation_set if n // 26 == 32 and n % 26 != 0]
assert source == [842, 845, 846, 852, 854, 856]
assert DATA["sourceReview"]["questionReviews"]["11"]["candidateAnswer"] == 6
assert DATA["sourceReview"]["questionReviews"]["11"]["candidateNumbers"] == source

result = {"status": "PASS", "version": VERSION, "q11Variants": len(items),
          "uniqueAnswers": [int(x["answer"]) for x in items],
          "sourceAnswerCandidates": source, "sourceAnswerCandidateStatus": "unconfirmed",
          "generatedFigureCount": 0, "sourceCropExactBytesMatch": True,
          "sourceCropSha256": ASSET_SHA, "permutationsPerVariant": 60}
out = ROOT / ".private-work/hw-expansion-20261023/hw9/q11-evidence/q11-independent-validation-r9.json"
out.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
print(json.dumps(result, ensure_ascii=False, indent=2))

#!/usr/bin/env python3
"""Independent calculation checks for Applied 9 Q29/Q30."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
D = json.loads((ROOT / "bank/data/applied9-expanded.json").read_text())
I = json.loads((ROOT / "bank/data/applied9-expanded-index.json").read_text())
EXPECTED_VERSION = "20261026-applied9-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q11-q12-q13-q14-q15-q16-q17-q18-q19-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-taxonomy-r25"
assert D["version"] == I["version"] == EXPECTED_VERSION
assert D["itemCount"] == I["itemCount"] == len(D["items"]) == 270
assert D["availableSourceNos"] == list(range(1, 31))
assert D["pendingSourceNos"] == []

for no in (29, 30):
    qs = [x for x in D["items"] if x["sourceNo"] == no]
    assert len(qs) == 9 and [x["variantNo"] for x in qs] == list(range(1, 10))
    assert all(x["pointBand"] == "4.2" and x["difficultyEvidence"]["label"] == "상" for x in qs)
    assert all(len(x["solutionSteps"]) >= 4 and x["reviewStatus"] == "verified" for x in qs)

q29 = [x for x in D["items"] if x["sourceNo"] == 29]
for x in q29:
    p = x["verification"]["parameters"]
    digit = p["repeatedDigit"]
    n = int(str(digit) * 10)
    product = n * n
    total = sum(int(c) for c in str(product))
    assert p["repeatCount"] == 10 and p["number"] == str(n)
    assert p["product"] == str(product) and p["digitSum"] == total
    assert x["answerParts"] == [total] and x["answer"] == str(total)
source29 = int("3" * 10) ** 2
assert sum(int(c) for c in str(source29)) == 90
assert D["sourceReview"]["questionReviews"]["29"]["independentAnswer"] == 90

q30 = [x for x in D["items"] if x["sourceNo"] == 30]
for x in q30:
    p = x["verification"]["parameters"]
    theta = p["targetAngle"]
    assert 90 < theta < 180
    # Start lies strictly between 9 and 10: the unique right-angle time is 360/11 minutes after 9.
    start_num = p["startElapsedMinuteNumerator"]
    assert start_num == 360 and p["startElapsedMinuteDenominator"] == 11
    # Directed difference is -90 at start and rises at 11/2 degrees/minute.
    stop_num = 2 * (theta + 90)
    end_num = 360 + stop_num
    assert p["stopElapsedMinuteNumerator"] == stop_num
    assert p["endElapsedMinuteNumerator"] == end_num == 2 * theta + 540
    assert p["endElapsedMinuteDenominator"] == 11
    h_offset, m_num = divmod(end_num, 660)
    minute, rem = divmod(m_num, 11)
    start = "9시 32 8/11분"
    end = f"{9+h_offset}시 {minute} {rem}/11분" if rem else f"{9+h_offset}시 {minute}분"
    assert p["startTime"] == start and p["endTime"] == end
    assert x["answerParts"] == [start, end]
    assert x["answer"] == f"{start}, {end}"
    # All intermediate angle values are strictly below theta until the first crossing.
    assert stop_num > 0
source30 = D["sourceReview"]["questionReviews"]["30"]
assert source30["independentStart"] == "9시 32 8/11분"
assert source30["independentEnd"] == "10시 20 8/11분"

print("PASS: Q29 nine exact digit-sum products and Q30 nine unique first-hit clock times independently recalculated.")

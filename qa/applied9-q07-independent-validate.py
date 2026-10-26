#!/usr/bin/env python3
"""Independently verify Applied 9 Q07 dates and source-crop fidelity."""
import datetime as dt
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
D = json.loads((ROOT / "bank/data/applied9-expanded.json").read_text())
I = json.loads((ROOT / "bank/data/applied9-expanded-index.json").read_text())
ASSET = ROOT / "bank/assets/applied9/q07-calendar-original-crop.png"
ASSET_HASH = "aa09bead8e032132c534731851d13dd77b8b12be220932d8e9464354e4757cdd"
assert D["version"] == I["version"] == "20261026-applied9-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q11-q12-q13-q14-q15-q16-q17-q18-q19-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-taxonomy-r25"
assert D["itemCount"] == I["itemCount"] == len(D["items"]) == 270
assert hashlib.sha256(ASSET.read_bytes()).hexdigest() == ASSET_HASH
qs = [x for x in D["items"] if x["sourceNo"] == 7]
assert len(qs) == 9 and [x["variantNo"] for x in qs] == list(range(1, 10))
assert all(x["asset"]["src"] == "assets/applied9/q07-calendar-original-crop.png" for x in qs)
assert all(x["verification"]["sourceDrawingCompared"] and x["verification"]["variantUsesSourceDrawing"] and not x["verification"]["variantDrawingModified"] for x in qs)
assert all(x["pointBand"] == "2.7" and x["difficultyEvidence"]["label"] == "하" for x in qs)
for x in qs:
    p = x["verification"]["parameters"]
    date = dt.date(p["year"], p["month"], p["day"])
    assert p["year"] == 2021
    assert date.strftime("%A") in ("Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday")
    weekdays = ["월요일","화요일","수요일","목요일","금요일","토요일","일요일"]
    assert x["answer"] == weekdays[date.weekday()] == p["answerWeekday"]
    assert p["daysAfterJanuaryFirst"] == (date - dt.date(2021,1,1)).days
assert qs[3]["answer"] == "수요일"  # The printed source's 2021-05-05.
review = D["sourceReview"]["questionReviews"]["7"]
assert review["candidateHandwrittenYear"] == 2023 and review["independentSourceAnswer"] == "수요일"
print("PASS: Q07 nine calendar answers independently match Gregorian date arithmetic; all reuse the unchanged source crop. The 2023 candidate correction remains documented as a discrepancy.")

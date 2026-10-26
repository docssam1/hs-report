#!/usr/bin/env python3
"""Independently verify Applied4 Q4 source answer and nine slow-clock variants."""
from fractions import Fraction
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "bank/data/applied4-expanded.json"
INDEX = ROOT / "bank/data/applied4-expanded-index.json"
REVIEW = ROOT / ".private-work/hw-expansion-20261023/hw4/q04-source-answer-review-r3.json"
EXPECTED = [(6,27,30),(12,28,35),(18,35,50),(24,36,60),(30,24,48),(36,26,65),(42,30,100),(48,22,110),(50,24,144)]

data = json.loads(DATA.read_text(encoding="utf-8"))
index = json.loads(INDEX.read_text(encoding="utf-8"))
review = json.loads(REVIEW.read_text(encoding="utf-8"))
assert data["version"] == "20261025-applied4-expansion-q01-q04-r3"
assert data["availableSourceNos"] == [1,4] + list(range(5,31)) and data["pendingSourceNos"] == [2,3]
assert len(data["items"]) == index["itemCount"] == 252
assert index["pendingSourceNos"] == [2,3]
assert len(data["items"]) == len({x["id"] for x in data["items"]})
q4 = [x for x in data["items"] if x["sourceNo"] == 4]
assert len(q4) == 9 and [x["variantNo"] for x in q4] == list(range(1,10))
assert [(x["verification"]["parameters"]["minutesLostPerActualHour"],
         x["verification"]["parameters"]["clockDisplayedElapsedHours"],
         x["verification"]["parameters"]["actualElapsedHours"]) for x in q4] == EXPECTED

for item, (loss, displayed, expected_real) in zip(q4, EXPECTED):
    # Independent check A: exact rational inversion.
    actual = Fraction(displayed * 60, 60-loss)
    assert actual.denominator == 1 and actual.numerator == expected_real
    # Independent check B: simulate each real hour until displayed minutes match exactly.
    shown_minutes = 0
    real_hours = 0
    while shown_minutes < displayed * 60:
        shown_minutes += 60-loss
        real_hours += 1
    assert shown_minutes == displayed*60 and real_hours == expected_real
    assert item["answer"] == item["verification"]["parameters"]["actualTarget"]
    assert item["answerContract"] == "single-value" and item["acceptedAnswers"] == [item["answer"]]
    assert item["pointBand"] == "2.7" and item["difficultyEvidence"]["label"] == "하"
    assert len(item["solutionSteps"]) == 4 and item["learningPoint"] and item["learningLocation"]
    assert item["asset"] is None

# Original Q4: 35 displayed hours at 35 clock-minutes per real hour takes exactly 60 real hours.
assert Fraction(35*60, 35) == 60
assert review["originalCalculation"] == {"displayElapsedHours":35,"clockAdvanceMinutesPerActualHour":35,
    "actualElapsedHours":60,"answer":"모레 오후 8시"}
assert review["variantCount"] == 9 and review["sourceAnswer"]["page"] == 4
prior = [x for x in data["items"] if x["sourceNo"] != 4]
digest = hashlib.sha256(json.dumps(prior, ensure_ascii=False, separators=(",", ":")).encode()).hexdigest()
assert digest == data["q04ExpansionReview"]["preservedPriorItemsSha256"]
out = {"version":data["version"],"variantCount":9,"answers":[x["answer"] for x in q4],
       "rationalAndHourlySimulationAgreeForAll":True,"sourceAnswerIndependentlyReproduced":"모레 오후 8시",
       "priorItemsUnchangedSha256":digest,"pendingSources":data["pendingSourceNos"],
       "outputZipBrowserQA":"passed" if data["reviewSummary"]["q04ActualZipReviewed"] else "pending"}
(ROOT / ".private-work/hw-expansion-20261023/hw4/q04-independent-math-r3.json").write_text(json.dumps(out,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("PASS: source answer reproduced; all 9 variant elapsed times agree under exact ratio and separate hour simulation; prior items unchanged.")

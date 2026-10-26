"""Validate Applied3 Q06 against the user's independent-calculation ruling."""
import hashlib
import json
from fractions import Fraction
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DRAFT = ROOT / ".private-work/hw-expansion-20261023/hw3/q06-review/q06-variants-draft-r1.json"
SOURCE = ROOT / "materials/초등과정 대비 실전 모의고사 활용 3회.pdf"
PUBLIC_DATA = ROOT / "bank/data/applied3-expanded.json"
PUBLIC_INDEX = ROOT / "bank/data/applied3-expanded-index.json"
data = json.loads(DRAFT.read_text())
assert data["source"]["independentAnswer"] == 16
assert data["source"]["candidateAnswer"] == 18
assert data["source"]["sha256"] == hashlib.sha256(SOURCE.read_bytes()).hexdigest()

def solve(p):
    a, b = p["firstKwanhoDays"], p["firstPartnerDays"]
    c, d = p["secondKwanhoDays"], p["secondPartnerDays"]
    det = a * d - b * c
    assert det != 0
    x, y = Fraction(d - b, det), Fraction(a - c, det)
    assert a * x + b * y == 1
    assert c * x + d * y == 1
    return 1 / x, 1 / y

items = data["items"]
assert len(items) == 9
answers = []
for no, item in enumerate(items, 1):
    assert item["variantNo"] == no and item["id"] == f"applied3-q06-v{no}"
    p = item["verification"]["parameters"]
    kwanho_days, partner_days = solve(p)
    assert kwanho_days == p["expectedKwanhoSoloDays"] == no + 7
    assert partner_days == p["expectedPartnerSoloDays"] == 2 * (no + 7)
    assert item["answerParts"] == [kwanho_days]
    assert item["answer"] == f"{kwanho_days}일"
    assert item["acceptedAnswers"] == [item["answer"]]
    assert item["pointBand"] == "2.7" and item["difficultyEvidence"]["label"] == "하"
    assert item["verification"]["sourceHasFigure"] is False
    assert item["verification"]["independentSourceAnswer"] == 16
    assert item["verification"]["sourceAnswerCandidate"] == 18
    answers.append(item["answer"])

# The candidate's handwritten 18-day result cannot satisfy both source scenarios.
candidate_kwanho_rate = Fraction(1, 18)
candidate_partner_rate_from_first = (Fraction(1) - 8 * candidate_kwanho_rate) / 10
assert 4 * candidate_kwanho_rate + 15 * candidate_partner_rate_from_first != 1

# The user's ruling adopts the independent calculation; the original exam record stays untouched.
public_data = json.loads(PUBLIC_DATA.read_text())
public_index = json.loads(PUBLIC_INDEX.read_text())
assert 6 not in public_data["pendingSourceNos"] and 6 not in public_index["pendingSourceNos"]
assert 6 in public_data["availableSourceNos"]
active = [x for x in public_data["items"] if x["sourceNo"] == 6]
assert len(active) == 9 and all(x["reviewStatus"] == "verified" for x in active)
assert all(x["verification"]["sourceAnswerRuling"]["answer"] == 16 for x in active)
assert 6 in [x["sourceNo"] for x in public_index["items"]]
assert public_index["itemCount"] == len(public_data["items"])
print("PASS Applied3 Q06: 16 days adopted by user ruling; 9 variants verified and active; original exam grade/key not modified")

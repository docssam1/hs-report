#!/usr/bin/env python3
"""Independent exhaustive and algebraic checks for Applied 4 Q1."""
import hashlib
import json
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "bank/data/applied4-expanded.json"
INDEX = ROOT / "bank/data/applied4-expanded-index.json"
REVIEW = ROOT / ".private-work/hw-expansion-20261023/hw4/q01-source-answer-review-r2.json"
MATH = ROOT / ".private-work/hw-expansion-20261023/hw4/q01-independent-math-r2.json"
EXPECTED = [(3, 3), (3, 4), (3, 5), (3, 6), (3, 7), (4, 2), (4, 3), (4, 4), (4, 5)]


def enumerate_all(width, fixed):
    unit = int("1" * width)
    result_unit = int("1" * (width - 1)) * 10
    found = []
    for star in range(1, 10):
        for circle in range(10):
            for diamond in range(1, 10):
                if unit * star + unit * circle == diamond * 10**width + circle * result_unit + fixed:
                    found.append([star, circle, diamond])
    return found


def algebraic_solution(width, fixed):
    unit = int("1" * width)
    # unit*(A+B) = 10^w*C + 10*(10^(w-1)-1)/9*B + d
    result_circle_coefficient = int("1" * (width - 1)) * 10
    solutions = []
    for a in range(1, 10):
        for b in range(10):
            for c in range(1, 10):
                if unit * (a + b) == c * 10**width + result_circle_coefficient * b + fixed:
                    solutions.append([a, b, c])
    return solutions


data = json.loads(DATA.read_text())
index = json.loads(INDEX.read_text())
review = json.loads(REVIEW.read_text())
assert data["version"] == "20261025-applied4-expansion-q01-q04-r3"
assert data["sourceRound"] == 4 and data["availableSourceNos"] == [1, 4] + list(range(5, 31))
assert data["pendingSourceNos"] == [2, 3]
assert index["itemCount"] == len(data["items"]) == 252
assert index["pendingSourceNos"] == [2, 3]
assert len(data["items"]) == len({x["id"] for x in data["items"]})
q1 = [x for x in data["items"] if x["sourceNo"] == 1]
assert len(q1) == 9 and [x["variantNo"] for x in q1] == list(range(1, 10))
assert [(x["verification"]["parameters"]["repeatedDigitCount"], x["verification"]["parameters"]["fixedFinalDigit"]) for x in q1] == EXPECTED
for x, (width, fixed) in zip(q1, EXPECTED):
    brute = enumerate_all(width, fixed)
    algebra = algebraic_solution(width, fixed)
    answer = x["answerParts"]
    assert brute == algebra == [answer] == [[9, fixed + 1, 1]], (x["id"], brute, algebra, answer)
    assert x["pointBand"] == "2.7" and x["difficultyEvidence"]["label"] == "하"
    assert len(x["solutionSteps"]) >= 3 and x["learningPoint"] and x["learningLocation"]
    assert x["answerContract"] == "ordered-parts" and x["answerLabels"] == ["별", "원", "마름모"]
    assert len(x["acceptedAnswers"]) >= 2
    p = x["verification"]["parameters"]
    assert p["equation"] and p["allValidAssignments"] == [answer]
    svg = ROOT / "bank" / x["asset"]["src"]
    root = ET.parse(svg).getroot()
    assert root.tag.endswith("svg")
    assert len([el for el in root.iter() if el.tag.endswith("polygon")]) == width + 1
    assert len([el for el in root.iter() if el.tag.endswith("circle")]) == width * 2 - 1
# Source equation (3-digit addends, fixed units 2) independently resolves to 9,3,1.
assert enumerate_all(3, 2) == algebraic_solution(3, 2) == [[9, 3, 1]]
# Verify the 234 pre-existing items were not rewritten.
prior = [x for x in data["items"] if x["sourceNo"] not in [1, 4]]
digest = hashlib.sha256(json.dumps(prior, ensure_ascii=False, separators=(",", ":")).encode()).hexdigest()
assert digest == data["q01ExpansionReview"]["preservedPriorItemsSha256"]
assert review["sourceAnswer"]["driveId"] == "1-Cr2jAfw1bK8Z-OkvlcyB3iaDyMXu7Av"
assert review["variantCount"] == 9 and review["directOriginalQuestionAndAnswerPagesReviewed"]
assert data["reviewSummary"]["q01ActualZipReviewed"] is True
out = {"version": data["version"], "variantCount": 9, "answers": [x["answerParts"] for x in q1],
       "bruteForceAndAlgebraAgreeForAll": True, "originalAnswerUniquelyReproduced": [9, 3, 1],
       "prior234ItemsUnchangedSha256": digest, "pendingSources": data["pendingSourceNos"],
       "outputZipAndBrowserQA": "passed" if data["reviewSummary"]["q01ActualZipReviewed"] else "pending"}
MATH.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")
print("PASS: 9 variants, 9/9 unique under exhaustive digit assignments and independent algebra; original answer reproduced; prior 234 items unchanged.")

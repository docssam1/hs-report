#!/usr/bin/env python3
"""Independent Q12 audit: direct source comparison and equation substitution."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image, ImageChops
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw8"
SOURCE = ROOT / "materials/초등과정 대비 실전 모의고사활용 8회.pdf"
ANSWER = WORK / "q12-source-review/answer-drive-copy.pdf"
RENDER = WORK / "q12-source-review/source-page-3-300dpi.png"
DATA = json.loads((ROOT / "bank/data/applied8-expanded.json").read_text())
INDEX = json.loads((ROOT / "bank/data/applied8-expanded-index.json").read_text())
REVIEW = json.loads((WORK / "q12-source-answer-review.json").read_text())
MATH = json.loads((WORK / "q12-independent-math.json").read_text())
VERSION = "20261025-applied8-expansion-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q12-q13-q14-q15-q17-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r27"
EXPECTED_SOURCES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 17, 18, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]


def norm(text: str) -> str:
    return "".join((text or "").split())


def solve_from_equations(scenario: dict[str, tuple[dict[str, int], dict[str, int]]]) -> tuple[dict[str, int], int]:
    # This audit uses coefficient equations and substitution, independent of the generator's helper.
    a_left, a_right = scenario["A"]
    assert set(a_right) == {"S"} and set(a_left) <= {"S", "T"}
    triangle = (a_right["S"] - a_left.get("S", 0)) / a_left["T"]
    assert triangle.is_integer() and triangle > 0
    triangle = int(triangle)
    b_left, b_right = scenario["B"]
    assert set(b_left) == {"C"} and set(b_right) <= {"S", "T"}
    rhs = b_right.get("S", 0) + b_right.get("T", 0) * triangle
    assert rhs % b_left["C"] == 0
    circle = rhs // b_left["C"]
    assert circle > 0
    c_left, c_right = scenario["C"]
    assert c_right == {}
    answer = c_left.get("C", 0) * circle + c_left.get("T", 0) * triangle
    weights = {"S": 1, "T": triangle, "C": circle}
    # Forward-substitute into A and B and independently total C's displayed shapes.
    assert a_left.get("S", 0) + a_left.get("T", 0) * triangle == a_right["S"]
    assert b_left["C"] * circle == rhs
    assert answer == sum(c_left[k] * weights[k] for k in c_left)
    return weights, answer


src_pdf = PdfReader(str(SOURCE))
answer_pdf = PdfReader(str(ANSWER))
src_text = norm(src_pdf.pages[2].extract_text())
answer_text = norm(answer_pdf.pages[2].extract_text())
assert src_text == answer_text
assert "다음양팔저울이모두평형을이루려면" in src_text and "놓아야하는지구하시오" in src_text
assert REVIEW["sourceExam"]["questionNo"] == 12 and REVIEW["sourceExam"]["directVisualReview"]
assert REVIEW["answerCandidate"]["containsAnswers"] is False
assert REVIEW["answerCandidate"]["pageTextMatchesQuestionPdf"]
assert REVIEW["sourceIndependentAnswer"] == 8

source_crop = ROOT / "bank/assets/applied8/q12-balances-original.png"
expected_crop = Image.open(RENDER).crop((240, 3070, 1420, 3340)).convert("RGB")
actual_crop = Image.open(source_crop).convert("RGB")
assert ImageChops.difference(expected_crop, actual_crop).getbbox() is None
assert REVIEW["sourceExam"]["sourceCrop"]["sha256"] == hashlib.sha256(source_crop.read_bytes()).hexdigest()

assert DATA["version"] == INDEX["version"] == VERSION
assert DATA["itemCount"] == INDEX["itemCount"] == len(DATA["items"]) == 243
assert DATA["availableSourceNos"] == EXPECTED_SOURCES
assert DATA["pendingSourceNos"] == INDEX["pendingSourceNos"] == [11, 16, 19]
assert [x["sourceNo"] for x in INDEX["items"]] == EXPECTED_SOURCES
items = [x for x in DATA["items"] if x["sourceNo"] == 12]
assert len(items) == 9 and [x["variantNo"] for x in items] == list(range(1, 10))
assert len(MATH["scenarios"]) == 9

for item, record in zip(items, MATH["scenarios"]):
    scenario = item["verification"]["parameters"]["scenario"]
    weights, answer = solve_from_equations(scenario)
    assert record["scenario"] == scenario and record["unitWeights"] == weights
    assert record["answer"] == answer == item["verification"]["parameters"]["answer"]
    assert item["answer"] == str(answer) and item["answerParts"] == [answer]
    assert item["verification"]["parameters"]["targetWeight"] == answer
    assert item["area"] == "수와 식" and item["pointBand"] == "2.7" and item["difficultyEvidence"]["label"] == "하"
    assert item["learningPoint"] and item["learningLocation"] and len(item["solutionSteps"]) >= 3
    assert item["asset"]["src"] == ("assets/applied8/q12-balances-original.png" if item["variantNo"] == 1 else f"assets/applied8/q12-balances-v{item['variantNo']}.svg")

assert items[0]["answer"] == "8"
print("PASS Applied8 Q12: source p3 matches blank answer copy; original balance diagram crop is pixel-exact; nine A/B/C systems independently solved and substituted; r27 inventory 243/27.")

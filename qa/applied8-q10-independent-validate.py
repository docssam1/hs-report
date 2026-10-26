#!/usr/bin/env python3
"""Independent source, gear-ratio, tooth-cycle, and r27 inventory audit for Q10."""
from __future__ import annotations

import json
import re
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw8"
EXAM = ROOT / "materials/초등과정 대비 실전 모의고사활용 8회.pdf"
ANSWER = WORK / "source-review/applied8-answer-drive-copy-q10.pdf"
DATA = json.loads((ROOT / "bank/data/applied8-expanded.json").read_text())
INDEX = json.loads((ROOT / "bank/data/applied8-expanded-index.json").read_text())
REVIEW = json.loads((WORK / "q10-source-answer-review.json").read_text())
MATH = json.loads((WORK / "q10-independent-math.json").read_text())
VERSION = "20261025-applied8-expansion-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q12-q13-q14-q15-q17-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r27"
NOS = [1,2,3,4,5,6,7,8,9,10,12,13,14,15,17,18,20,21,22,23,24,25,26,27,28,29,30]
PARAMS = [(63, 42, 6), (36, 24, 8), (56, 28, 5), (30, 18, 9), (45, 30, 8),
          (24, 18, 6), (42, 21, 4), (54, 36, 6), (32, 24, 9)]


def equation(a: int, b: int, turns_a: int) -> tuple[int, int]:
    passed = a * turns_a
    assert passed % b == 0
    return passed // b, passed % b


def simulate_teeth(a: int, b: int, turns_a: int) -> tuple[int, int]:
    turns_b = remaining = 0
    for _ in range(a * turns_a):
        remaining += 1
        if remaining == b:
            turns_b += 1
            remaining = 0
    return turns_b, remaining


exam = PdfReader(str(EXAM)).pages[2]
answer = PdfReader(str(ANSWER)).pages[2]
norm = lambda t: re.sub(r"\s+", "", t or "")
assert "톱니바퀴" in norm(exam.extract_text()) and "톱니바퀴" in norm(answer.extract_text())
assert norm(exam.extract_text()) == norm(answer.extract_text())
assert REVIEW["sourceExam"]["directVisualReview"] and REVIEW["answerCandidate"]["containsAnswers"] is False
assert REVIEW["answerCandidate"]["pageTextMatchesQuestionPdf"] is True

assert DATA["version"] == INDEX["version"] == VERSION
assert DATA["itemCount"] == INDEX["itemCount"] == len(DATA["items"]) == 243
assert DATA["availableSourceNos"] == NOS
assert DATA["pendingSourceNos"] == [n for n in range(1, 31) if n not in NOS]
assert [x["sourceNo"] for x in INDEX["items"]] == NOS
entry = next(x for x in INDEX["items"] if x["sourceNo"] == 10)
assert entry["variantCount"] == 9 and entry["reviewStatus"] == "verified"
items = [x for x in DATA["items"] if x["sourceNo"] == 10]
assert len(items) == 9
for i, (item, (a, b, turns_a)) in enumerate(zip(items, PARAMS), 1):
    answer_turns, remainder = equation(a, b, turns_a)
    direct_turns, direct_remainder = simulate_teeth(a, b, turns_a)
    assert (direct_turns, direct_remainder) == (answer_turns, remainder) == (item["answerParts"][0], 0)
    p = item["verification"]["parameters"]
    assert (p["aTeeth"], p["bTeeth"], p["aTurns"], p["teethPassing"], p["bTurns"], p["remainderTeeth"]) == (a, b, turns_a, a*turns_a, answer_turns, 0)
    assert item["variantNo"] == i and item["answer"] == f"{answer_turns}바퀴"
    assert item["area"] == "수와 식" and item["pointBand"] == "2.7" and item["difficultyEvidence"]["label"] == "하"
    assert item["verification"]["sourceDrawingPresent"] is False and "asset" not in item
    assert item["solutionSteps"] and all(s in item["solution"] for s in item["solutionSteps"])
    assert item["learningPoint"] and item["learningLocation"]
assert equation(*PARAMS[0]) == (9, 0)
assert MATH["source"]["bTurns"] == 9
assert [v["bTurns"] for v in MATH["variants"]] == [equation(*p)[0] for p in PARAMS[1:]]
print("PASS Applied8 Q10: source p3 and blank answer copy compared; 9 gear ratios verified algebraically and by one-tooth simulation; no drawing added; r27 inventory 243/27.")

#!/usr/bin/env python3
"""Independent round-trip check for Applied 8 Q13 and its nine variants."""
import json
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
EXAM = ROOT / "materials/초등과정 대비 실전 모의고사활용 8회.pdf"
ANSWER = ROOT / ".private-work/hw-expansion-20261023/hw8/source-review/applied8-answer-drive-copy.pdf"
DATA = json.loads((ROOT / "bank/data/applied8-expanded.json").read_text())
INDEX = json.loads((ROOT / "bank/data/applied8-expanded-index.json").read_text())
REVIEW = json.loads((ROOT / ".private-work/hw-expansion-20261023/hw8/q13-source-answer-review.json").read_text())
EXPECTED_FINAL = [24, 32, 48, 56, 64, 72, 80, 88, 96]
ITEMS = [x for x in DATA["items"] if x["sourceNo"] == 13]


def play(initial):
    state = list(initial)
    for loser in (0, 1, 2):
        amount = state[loser]
        assert amount % 4 == 0
        state[loser] = amount // 2
        for p in range(3):
            if p != loser:
                state[p] += amount // 4
    return state


expected_nos = [1,2,3,4,5,6,7,8,9,10,12,13,14,15,17,18,20,21,22,23,24,25,26,27,28,29,30]
expected_pending = [n for n in range(1, 31) if n not in expected_nos]
assert len(DATA["items"]) == DATA["itemCount"] == 243
assert DATA["sourceRound"] == 8 and DATA["availableSourceNos"] == expected_nos
assert DATA["pendingSourceNos"] == expected_pending
assert INDEX["itemCount"] == 243 and [x["sourceNo"] for x in INDEX["items"]] == expected_nos
assert len(ITEMS) == 9
assert [x["verification"]["parameters"]["finalEach"] for x in ITEMS] == EXPECTED_FINAL
assert len({tuple(x["answerParts"]) for x in ITEMS}) == 9
assert all(x["pointBand"] == "3.4" and x["difficultyEvidence"]["label"] == "중" for x in ITEMS)
assert all("asset" not in x and x["answerContract"] == "ordered-parts" for x in ITEMS)

exam_text = PdfReader(str(EXAM)).pages[2].extract_text()
answer_text = PdfReader(str(ANSWER)).pages[2].extract_text()
assert exam_text == answer_text
for phrase in ("A,B,C", "게임을 세 번", "사탕을 40개씩"):
    assert phrase in exam_text
assert "No official answer key" in REVIEW["answerSourceConclusion"]

assert play([20, 35, 65]) == [40, 40, 40]
for item, final_each in zip(ITEMS, EXPECTED_FINAL):
    a, b, c = item["answerParts"]
    assert a == final_each // 2 and b == 7 * final_each // 8 and c == 13 * final_each // 8
    assert play([a, b, c]) == [final_each] * 3
    assert item["verification"]["parameters"] == {"finalEach": final_each, "initialA": a, "initialB": b, "initialC": c}
    assert all(str(v) in item["solution"] for v in (a, b, c, final_each))

print("PASS Applied8 Q13: source p3 directly reviewed; Drive answer copies contain no marked key; original answer and nine variants independently forward-checked; 3.4-point middle only; no new source type.")

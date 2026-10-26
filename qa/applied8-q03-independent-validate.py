#!/usr/bin/env python3
"""Direct-source, arithmetic, and exhaustive magic-square audit for Applied 8 Q3."""
import hashlib
import itertools
import json
import xml.etree.ElementTree as ET
from pathlib import Path

from PIL import Image, ImageChops
from pypdf import PdfReader

R = Path(__file__).resolve().parents[1]
W = R / ".private-work/hw-expansion-20261023/hw8"
EXAM = R / "materials/초등과정 대비 실전 모의고사활용 8회.pdf"
ANSWER = W / "source-review/applied8-answer-drive-copy-q07.pdf"
D = json.loads((R / "bank/data/applied8-expanded.json").read_text())
I = json.loads((R / "bank/data/applied8-expanded-index.json").read_text())
S = json.loads((W / "q03-source-answer-review.json").read_text())
M = json.loads((W / "q03-independent-math.json").read_text())
VERSION = "20261025-applied8-expansion-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q12-q13-q14-q15-q17-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r27"
NOS = [1,2,3,4,5,6,7,8,9,10,12,13,14,15,17,18,20,21,22,23,24,25,26,27,28,29,30]
MASK = [(0,3),(1,1),(1,2),(2,2),(3,1),(3,3)]
CASES = [
((2,16,13,3),(11,5,8,10),(7,9,12,6),(14,4,1,15)),
((1,14,4,15),(12,7,9,6),(13,2,16,3),(8,11,5,10)),
((1,14,15,4),(12,7,6,9),(8,11,10,5),(13,2,3,16)),
((1,15,4,14),(12,6,9,7),(13,3,16,2),(8,10,5,11)),
((2,13,3,16),(11,8,10,5),(14,1,15,4),(7,12,6,9)),
((2,13,16,3),(11,8,5,10),(7,12,9,6),(14,1,4,15)),
((9,6,12,7),(4,15,1,14),(5,10,8,11),(16,3,13,2)),
((10,8,11,5),(3,13,2,16),(6,12,7,9),(15,1,14,4)),
((1,15,4,14),(8,10,5,11),(13,3,16,2),(12,6,9,7)),
]


def all_completions(givens):
    """Independent row-domain enumeration for normal 4x4 squares."""
    row_domain = []
    for r in range(4):
        domain = []
        for row in itertools.permutations(range(1, 17), 4):
            if sum(row) != 34:
                continue
            if all(row[c] == value for c, value in givens.get(r, {}).items()):
                domain.append(row)
        row_domain.append(domain)
    results = []

    def extend(r, chosen, used, col_sums):
        if len(results) > 1:
            return
        if r == 4:
            square = tuple(chosen)
            if col_sums == (34,)*4 and sum(square[i][i] for i in range(4)) == 34 and sum(square[i][3-i] for i in range(4)) == 34:
                results.append(square)
            return
        for row in row_domain[r]:
            if len(set(row) & used) != 0:
                continue
            sums = tuple(col_sums[c] + row[c] for c in range(4))
            if r < 3 and any(value >= 34 for value in sums):
                continue
            if r == 3 and sums != (34,)*4:
                continue
            partial = chosen + [row]
            main = sum(partial[i][i] for i in range(len(partial)))
            other = sum(partial[i][3-i] for i in range(len(partial)))
            if r < 3 and (main >= 34 or other >= 34):
                continue
            if r == 3 and (main != 34 or other != 34):
                continue
            extend(r+1, partial, used | set(row), sums)

    extend(0, [], set(), (0,0,0,0))
    return results


norm = lambda x: "".join((x or "").split())
ep, ap = PdfReader(str(EXAM)).pages[0], PdfReader(str(ANSWER)).pages[0]
assert norm(ep.extract_text()) == norm(ap.extract_text())
assert "수를써넣은마방진입니다" in norm(ep.extract_text()) and "합이모두같아지도록" in norm(ep.extract_text())
assert S["sourceExam"]["directVisualReview"] and S["answerCandidate"]["containsAnswers"] is False
assert S["sourceAnswer"] == 89 and S["sourceUniqueCompletions"] == 1
assert D["version"] == I["version"] == VERSION and D["itemCount"] == I["itemCount"] == 243
assert D["availableSourceNos"] == NOS and len(I["items"]) == 27
assert D["pendingSourceNos"] == I["pendingSourceNos"] == [11,16,19]
crop = R / "bank/assets/applied8/q3-magic-square-original.png"
render = W / "q1-source-review/original-1.png"
assert ImageChops.difference(Image.open(crop).convert("RGB"), Image.open(render).crop((930,720,1305,1030)).convert("RGB")).getbbox() is None
items = sorted((x for x in D["items"] if x["sourceNo"] == 3), key=lambda x: x["variantNo"])
answers = [89,68,91,70,66,95,100,104,78]
assert len(items) == len(M["cases"]) == 9 and [int(x["answer"]) for x in items] == answers
for item, square, record in zip(items, CASES, M["cases"]):
    assert sorted(v for row in square for v in row) == list(range(1,17))
    assert [sum(row) for row in square] == [34]*4
    assert [sum(square[r][c] for r in range(4)) for c in range(4)] == [34]*4
    assert sum(square[i][i] for i in range(4)) == sum(square[i][3-i] for i in range(4)) == 34
    givens = {r:{c:square[r][c] for rr,c in MASK if rr==r} for r in range(4)}
    completions = all_completions(givens)
    expected = 136 - sum(square[r][c] for r,c in MASK)
    assert len(completions) == 1 and completions[0] == square
    assert record["uniqueCompletions"] == len(completions) and record["completedSquare"] == [list(row) for row in square]
    assert record["blankSum"] == expected == int(item["answer"])
    assert item["verification"]["parameters"]["completedSquare"] == [list(row) for row in square]
    assert item["answerParts"] == [expected] and item["pointBand"] == "2.7" and item["difficultyEvidence"]["label"] == "하"
    assert item["area"] == "수와 식" and item["learningLocation"] and item["learningPoint"] and len(item["solutionSteps"]) == 3
    if item["variantNo"] > 1:
        svg = ET.parse(R / "bank" / item["asset"]["src"]).getroot()
        tags = [el.tag.rsplit("}",1)[-1] for el in svg]
        texts = [int(el.text) for el in svg if el.tag.rsplit("}",1)[-1] == "text"]
        assert tags.count("line") == 10 and tags.count("text") == 6
        assert texts == [square[r][c] for r,c in MASK]
print("PASS Applied8 Q3: source p1 and blank answer duplicate compared; original 4x4 crop pixel-exact; 9 unique normal-magic completions independently enumerated and blank sums checked against 136−givens; r27 inventory 243/27.")

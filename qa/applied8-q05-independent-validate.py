#!/usr/bin/env python3
"""Independent source, diagram crop, equation enumeration, and r27 inventory audit for Q5."""
from __future__ import annotations

import itertools
import json
import re
import subprocess
import tempfile
import xml.etree.ElementTree as ET
from pathlib import Path

from PIL import Image
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw8"
EXAM = ROOT / "materials/초등과정 대비 실전 모의고사활용 8회.pdf"
ANSWER = WORK / "source-review/applied8-answer-drive-copy-q05.pdf"
DATA = json.loads((ROOT / "bank/data/applied8-expanded.json").read_text())
INDEX = json.loads((ROOT / "bank/data/applied8-expanded-index.json").read_text())
REVIEW = json.loads((WORK / "q05-source-answer-review.json").read_text())
MATH = json.loads((WORK / "q05-independent-math.json").read_text())
VERSION = "20261025-applied8-expansion-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q12-q13-q14-q15-q17-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r27"
NOS = [1,2,3,4,5,6,7,8,9,10,12,13,14,15,17,18,20,21,22,23,24,25,26,27,28,29,30]
CARD_SETS = [
    [2, 3, 4, 5, 8, 12, 15, 16], [2, 3, 4, 5, 6, 9, 10, 16],
    [2, 3, 4, 5, 6, 8, 9, 10], [2, 3, 4, 5, 6, 8, 9, 12],
    [2, 3, 4, 5, 6, 8, 10, 12], [2, 3, 4, 5, 6, 10, 12, 20],
    [2, 3, 4, 5, 6, 8, 12, 24], [2, 3, 4, 6, 8, 12, 16, 24],
    [2, 3, 4, 5, 6, 9, 15, 16],
]


def ordered(cards: list[int]) -> list[tuple[int, int, int]]:
    return sorted((a, b, c) for a, b, c in itertools.permutations(cards, 3) if a % b == 0 and a // b == c)


def by_product(cards: list[int]) -> list[tuple[int, int, int]]:
    present = set(cards)
    return sorted((q * d, d, q) for q in cards for d in cards
                  if q != d and q * d in present and q * d not in (q, d))


exam, answer = PdfReader(str(EXAM)).pages[1], PdfReader(str(ANSWER)).pages[1]
norm = lambda t: re.sub(r"\s+", "", t or "")
assert "숫자카드중장을골라" in norm(exam.extract_text())
normalized_source = norm(exam.extract_text()).replace("성3립", "성립")
assert "나눗셈식이성립하는경우는몇가지인지구하세요" in normalized_source
assert norm(exam.extract_text()) == norm(answer.extract_text())
assert REVIEW["answerCandidates"][0]["containsAnswers"] is False
assert REVIEW["answerCandidates"][0]["pageTextMatchesQuestionPdf"] is True

# Recreate the source PDF page render/crop independently and compare its decoded pixels.
source_asset = ROOT / "bank/assets/applied8/q5-cards-original.png"
with tempfile.TemporaryDirectory(prefix="q5-independent-") as td:
    prefix = Path(td) / "p"
    subprocess.run(["pdftoppm", "-f", "2", "-l", "2", "-r", "300", "-png", str(EXAM), str(prefix)],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    page = Image.open(f"{prefix}-2.png").convert("RGB")
    sx, sy = page.width / 1317, page.height / 1864
    crop = page.crop((round(60*sx), round(275*sy), round(620*sx), round(470*sy)))
    asset = Image.open(source_asset).convert("RGB")
    assert crop.size == asset.size and crop.tobytes() == asset.tobytes()
assert REVIEW["sourceExam"]["directVisualReview"] and REVIEW["sourceExam"]["driveAndLocalBytesIdentical"]

assert DATA["version"] == INDEX["version"] == VERSION
assert DATA["itemCount"] == INDEX["itemCount"] == len(DATA["items"]) == 243
assert DATA["availableSourceNos"] == NOS
assert DATA["pendingSourceNos"] == [n for n in range(1, 31) if n not in NOS]
assert [x["sourceNo"] for x in INDEX["items"]] == NOS
idx = next(x for x in INDEX["items"] if x["sourceNo"] == 5)
assert idx["variantCount"] == 9 and idx["reviewStatus"] == "verified"
items = [x for x in DATA["items"] if x["sourceNo"] == 5]
assert len(items) == 9 and len({tuple(x) for x in CARD_SETS}) == 9

for i, (item, cards) in enumerate(zip(items, CARD_SETS), 1):
    equations = ordered(cards)
    independent = by_product(cards)
    assert equations == independent and len(equations) > 0
    assert item["variantNo"] == i and item["reviewStatus"] == "verified"
    assert item["verification"]["parameters"]["cards"] == cards
    assert item["verification"]["parameters"]["validEquations"] == [list(x) for x in equations]
    assert item["verification"]["parameters"]["equationCount"] == len(equations)
    assert item["answerParts"] == [len(equations)] and item["answer"] == f"{len(equations)}가지"
    assert item["area"] == "경우의 수" and item["pointBand"] == "2.7" and item["difficultyEvidence"]["label"] == "하"
    assert item["asset"]["src"] and item["solutionSteps"] and item["learningPoint"] and item["learningLocation"]
    assert all(step in item["solution"] for step in item["solutionSteps"])
    if i == 1:
        assert item["asset"]["src"] == "assets/applied8/q5-cards-original.png"
        assert item["verification"]["sourceDrawingPixelExactCrop"] is True
    else:
        svg = ET.parse(ROOT / "bank" / item["asset"]["src"]).getroot()
        ns = {"s": "http://www.w3.org/2000/svg"}
        texts = [(n.text or "").strip() for n in svg.findall(".//s:text", ns)]
        assert [int(x) for x in texts[:8]] == cards and texts[8:] == ["÷", "="]
        assert len(svg.findall(".//s:rect", ns)) == 12
for a in items:
    assert a["verification"]["parameters"]["equationCount"] == len(ordered(a["verification"]["parameters"]["cards"]))
for variant in MATH["variants"]:
    assert variant["equations"] == [list(x) for x in ordered(variant["cards"])]
print("PASS Applied8 Q5: source page and answer-candidate comparison; pixel-exact original crop; two independent ordered-equation counts for 9 items; r27 inventory 243/27.")

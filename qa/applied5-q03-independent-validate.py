#!/usr/bin/env python3
"""Source, diagram, answer, and independent math audit for Applied 5 Q3."""
import hashlib
import itertools
import json
import xml.etree.ElementTree as ET
from pathlib import Path

from PIL import Image, ImageChops
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw5"
EXAM = ROOT / "materials/초등과정 대비 실전 모의고사활용 5회.pdf"
ANSWER = Path("/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 5회 답안.pdf")
SOURCE_RENDER = ROOT / ".private-work/hw-expansion-20261023/applied5-source-p1.png"
ANSWER_RENDER = ROOT / ".private-work/hw-expansion-20261023/applied5-answer-03.png"
DATA_PATH = ROOT / "bank/data/applied5-expanded.json"
INDEX_PATH = ROOT / "bank/data/applied5-expanded-index.json"
REVIEW_PATH = WORK / "q03-source-answer-review.json"
MASK = [0, 2, 4, 8]
EXPECTED_SETS = [
    [0, 1, 2, 7], [0, 1, 6, 8], [0, 1, 4, 5], [0, 3, 6, 9],
    [0, 5, 7, 8], [0, 1, 7, 8], [0, 2, 7, 8], [0, 1, 2, 4], [0, 1, 4, 8],
]
VERSION = "20261025-applied5-expansion-q03-q05-q06-q08-q09-q11-q12-q14-q15-q16-r11"


def by_permutation(cards):
    return sorted(
        100 * a + 10 * b + c
        for a, b, c in itertools.permutations(cards, 3)
        if a != 0 and (100 * a + 10 * b + c) % 5 == 0
        and (100 * a + 10 * b + c) % 12 == 0
    )


def by_sixty(cards):
    card_set = set(cards)
    return [
        n for n in range(120, 1000, 60)
        if len(set(map(int, str(n)))) == 3 and set(map(int, str(n))) <= card_set
    ]


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    data = json.loads(DATA_PATH.read_text())
    index = json.loads(INDEX_PATH.read_text())
    review = json.loads(REVIEW_PATH.read_text())
    assert data["version"] == index["version"] == VERSION
    assert data["sourceRound"] == 5
    assert len(data["items"]) == 162 and index["itemCount"] == 162
    assert data["availableSourceNos"] == sorted(set(data["availableSourceNos"]))
    assert 3 in data["availableSourceNos"] and 3 not in data["pendingSourceNos"]
    assert 3 in [x["sourceNo"] for x in index["items"]]
    assert len(PdfReader(str(EXAM)).pages) == 6
    assert len(PdfReader(str(ANSWER)).pages) == 31
    assert sha(EXAM) == review["sourceExam"]["sha256"]
    assert sha(ANSWER) == review["sourceAnswer"]["sha256"]
    assert review["sourceExam"]["questionNo"] == 3 and review["sourceExam"]["page"] == 1
    assert review["sourceAnswer"]["page"] == 3 and review["sourceAnswer"]["answerVisible"] is True
    assert review["sourceAnswer"]["numbersShown"] == [240, 420, 480, 840]
    assert review["sourceAnswer"]["answer"] == len(by_permutation(MASK)) == 4

    page = Image.open(SOURCE_RENDER).convert("RGB")
    crop_box = tuple(review["sourceFigure"]["cropBoxPixels"])
    direct_crop = page.crop(crop_box)
    evidence_crop = Image.open(WORK / "q03-source-card-crop.png").convert("RGB")
    assert direct_crop.size == tuple(review["sourceFigure"]["cropPixels"])
    assert ImageChops.difference(direct_crop, evidence_crop).getbbox() is None
    assert sha(SOURCE_RENDER) == review["sourceFigure"]["sourceRenderSha256"]
    assert sha(WORK / "q03-source-card-crop.png") == review["sourceFigure"]["cropSha256"]
    assert ANSWER_RENDER.is_file() and review["sourceAnswer"]["directVisualReview"]

    items = [x for x in data["items"] if x["sourceNo"] == 3]
    assert len(items) == 9 and [x["variantNo"] for x in items] == list(range(1, 10))
    sets = []
    evidence = []
    for x, expected_cards in zip(items, EXPECTED_SETS):
        p = x["verification"]["parameters"]
        cards = p["cards"]
        assert cards == expected_cards and cards != MASK and len(set(cards)) == 4 and 0 in cards
        assert cards not in sets
        sets.append(cards)
        a = by_permutation(cards)
        b = by_sixty(cards)
        assert a == b == p["validNumbers"]
        assert x["answerParts"] == [len(a)] == [p["answerCount"]]
        assert x["answer"] == str(len(a)) and x["pointBand"] == "2.7"
        assert x["difficultyEvidence"]["label"] == "하"
        assert x["reviewStatus"] == "verified" and x["verification"]["sourceDrawingCompared"]
        assert x["verification"]["sourceExamPage"] == 1 and x["verification"]["sourceAnswerPage"] == 3
        assert all(str(n) in x["solution"] for n in a)
        assert "hint" not in x["text"].lower() and "힌트" not in x["text"]
        asset = ROOT / "bank" / x["asset"]["src"]
        assert asset.is_file()
        root = ET.parse(asset).getroot()
        ns = {"s": "http://www.w3.org/2000/svg"}
        assert len(root.findall("s:rect", ns)) == 4
        digits = [int(t.text) for t in root.findall("s:text", ns) if t.text and t.text.isdigit()]
        assert digits == cards
        assert x["area"] == "경우의 수" and x["subarea"] == "숫자카드의 배열"
        evidence.append({"id": x["id"], "cards": cards, "validNumbers": a, "answer": len(a), "passed": True})
    assert len({tuple(x) for x in sets}) == 9

    out = WORK / "q03-independent-math.json"
    out.write_text(json.dumps({
        "dataSha256": sha(DATA_PATH),
        "sourceExamSha256": sha(EXAM),
        "sourceAnswerSha256": sha(ANSWER),
        "sourceAnswer": {"numbers": by_permutation(MASK), "count": 4},
        "variants": evidence,
        "suite": Path(__file__).name,
        "count": len(evidence),
    }, ensure_ascii=False, indent=2) + "\n")
    print("PASS Applied5 Q3: exact source PDFs, page-1 card crop, handwritten page-3 answer, 9 distinct card sets, two independent divisibility enumerations, answer/solution/data/index/assets.")


if __name__ == "__main__":
    main()

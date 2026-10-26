#!/usr/bin/env python3
"""Independently validate Applied 8 Q17 source, image, and nine grouped-color counts."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw8"
EXAM = ROOT / "materials/초등과정 대비 실전 모의고사활용 8회.pdf"
ANSWER = WORK / "source-review/applied8-answer-drive-copy.pdf"
PAGE = WORK / "source-review/q16-exam-4.png"
CROP = WORK / "source-review/q17-sequence-crop.png"
ASSET = ROOT / "bank/assets/applied8/q17-sequence-original.png"
DATA = ROOT / "bank/data/applied8-expanded.json"
INDEX = ROOT / "bank/data/applied8-expanded-index.json"
REVIEW = WORK / "q17-source-review.json"


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def direct_simulation(total: int) -> int:
    remaining = total
    white = 0
    group_size = 1
    black_next = True
    while remaining:
        take = min(remaining, group_size)
        if not black_next:
            white += take
        remaining -= take
        black_next = not black_next
        if black_next:
            group_size += 1
    return white


def formula(total: int) -> int:
    k = 0
    while (k + 1) * (k + 2) <= total:
        k += 1
    remaining = total - k * (k + 1)
    return k * (k + 1) // 2 + max(0, remaining - (k + 1))


def main() -> None:
    exam_text = PdfReader(str(EXAM)).pages[3].extract_text()
    answer_text = PdfReader(str(ANSWER)).pages[3].extract_text()
    compact = "".join(exam_text.split())
    for token in ("검은색", "바둑돌", "흰색", "번갈아가며", "450", "개인지구하세요"):
        assert token in compact, f"source page lacks {token}"
    assert exam_text == answer_text, "available answer copy does not match source text"
    source = Image.open(PAGE).convert("RGB")
    pixel_crop = source.crop((140, 1640, 1260, 1780))
    asset = Image.open(ASSET).convert("RGB")
    crop = Image.open(CROP).convert("RGB")
    assert asset.size == pixel_crop.size == crop.size == (1120, 140)
    assert asset.tobytes() == crop.tobytes() == pixel_crop.tobytes()

    review = json.loads(REVIEW.read_text())
    data, index = json.loads(DATA.read_text()), json.loads(INDEX.read_text())
    items = [x for x in data["items"] if x["sourceNo"] == 17]
    assert len(items) == 9
    totals = [x["verification"]["parameters"]["totalStones"] for x in items]
    assert len(set(totals)) == 9
    for item in items:
        p = item["verification"]["parameters"]
        answer = formula(p["totalStones"])
        assert answer == direct_simulation(p["totalStones"])
        assert item["answerParts"] == [answer]
        assert item["answer"] == f"{answer}개"
        assert p["whiteStones"] == answer
        assert item["asset"]["src"] == "assets/applied8/q17-sequence-original.png"
        assert item["pointBand"] == "3.4"
        assert item["difficultyEvidence"]["label"] == "중"
        assert item["reviewStatus"] == "verified"
    assert formula(450) == direct_simulation(450) == 219
    assert review["sourceIndependentSolution"]["answer"] == 219
    assert review["sourceExam"]["page"] == review["answerCandidates"][0]["page"] == 4
    assert review["answerCandidates"][0]["containsAnswers"] is False
    assert review["sourceExam"]["sequenceFigure"]["pixelExactCropVerified"] is True
    assert review["sourceExam"]["sequenceFigure"]["assetSha256"] == sha(ASSET)
    assert review["variantTotals"] == totals
    assert review["variantAnswers"] == [x["answerParts"][0] for x in items]
    assert review["sourceDrawingReusedPixelExact"] is True
    assert data["itemCount"] == 243 and data["availableSourceNos"] == [1,2,3,4,5,6,7,8,9,10,12,13,14,15,17,18,20,21,22,23,24,25,26,27,28,29,30]
    assert data["pendingSourceNos"] == index["pendingSourceNos"]
    assert [x["sourceNo"] for x in index["items"]] == [1,2,3,4,5,6,7,8,9,10,12,13,14,15,17,18,20,21,22,23,24,25,26,27,28,29,30]
    assert next(x for x in index["items"] if x["sourceNo"] == 17)["variantCount"] == 9
    print("PASS Applied8 Q17: source p4 and blank answer-copy p4 compared; original sequence crop is pixel exact; source answer 219 and nine distinct variants match independent formula and direct group simulation; 3.4 middle and index inventory verified.")


if __name__ == "__main__":
    main()

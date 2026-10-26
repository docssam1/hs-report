#!/usr/bin/env python3
"""Independent source, pixel-crop, ordinal, and answer checks for Applied 8 Q20."""
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
ASSET = ROOT / "bank/assets/applied8/q20-fraction-sequence-original.png"
DATA = json.loads((ROOT / "bank/data/applied8-expanded.json").read_text())
INDEX = json.loads((ROOT / "bank/data/applied8-expanded-index.json").read_text())
REVIEW = json.loads((WORK / "q20-source-review.json").read_text())


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def brute_term(n: int) -> tuple[str, int, int, int]:
    count = 0
    denominator = 0
    while count < n:
        denominator += 1
        for numerator in range(1, denominator + 1):
            count += 1
            if count == n:
                return f"{numerator}/{denominator}", numerator, denominator, count - numerator
    raise AssertionError("unreachable")


exam_text = PdfReader(str(EXAM)).pages[3].extract_text()
answer_text = PdfReader(str(ANSWER)).pages[3].extract_text()
assert "".join(exam_text.split()) == "".join(answer_text.split())
assert "47" in exam_text and "57" in exam_text and "분수" in exam_text
assert REVIEW["sourceExam"]["questionNo"] == 20 and REVIEW["sourceExam"]["directVisualReview"]
assert REVIEW["answerCandidate"]["containsAnswers"] is False
assert REVIEW["sourceIndependentSolution"]["answer"] == ["2/10", "2/11"]

page = Image.open(PAGE).convert("RGB")
exact = page.crop((1360, 1500, 2260, 1760))
asset = Image.open(ASSET).convert("RGB")
assert exact.size == asset.size and exact.tobytes() == asset.tobytes()
assert REVIEW["sourceExam"]["printedFigure"]["assetSha256"] == sha(ASSET)

items = [x for x in DATA["items"] if x["sourceNo"] == 20]
assert len(items) == 9
expected_pairs = [(32, 41), (37, 48), (42, 53), (45, 55), (47, 57), (50, 61), (57, 69), (63, 76), (72, 87)]
checks = []
for v, (item, targets) in enumerate(zip(items, expected_pairs), 1):
    assert item["id"] == f"applied8-q20-v{v}"
    assert item["reviewStatus"] == "verified"
    assert item["answerContract"] == "ordered-parts"
    assert item["asset"]["src"] == "assets/applied8/q20-fraction-sequence-original.png"
    assert item["text"].count("그림과 같이") == 1
    assert "규칙" not in item["text"] or "규칙에 따라" in item["text"]
    assert "풀이" not in item["text"] and "힌트" not in item["text"]
    expected = [brute_term(n)[0] for n in targets]
    assert item["answerParts"] == expected
    params = item["verification"]["parameters"]
    assert params["targetOrdinals"] == list(targets)
    for i, n in enumerate(targets):
        term, numerator, denominator, prior = brute_term(n)
        p = "first" if i == 0 else "second"
        assert params[f"{p}PreviousGroupTerms"] == prior
        assert params[f"{p}GroupDenominator"] == denominator
        assert params[f"{p}PositionInGroup"] == numerator
        assert params[f"{p}Fraction"] == term
        assert (denominator - 1) * denominator // 2 == prior < n <= denominator * (denominator + 1) // 2
    assert item["pointBand"] == "3.4" and item["difficultyEvidence"]["label"] == "중"
    assert item["difficultyEvidence"]["basis"] == "source-point-band"
    checks.append({"id": item["id"], "ordinals": targets, "answers": expected, "bruteForceVerified": True})

record = next(x for x in INDEX["items"] if x["sourceNo"] == 20)
assert record["variantCount"] == 9 and record["reviewStatus"] == "verified"
assert DATA["itemCount"] == len(DATA["availableSourceNos"]) * 9
assert DATA["pendingSourceNos"] == [n for n in range(1, 31) if n not in DATA["availableSourceNos"]]
result = {
    "passed": True,
    "sourceExamSha256": sha(EXAM),
    "sourceAnswerCandidateSha256": sha(ANSWER),
    "sourceQuestion": 20,
    "sourceAnswerCandidateIsBlankDuplicate": True,
    "sourceFigurePixelExact": True,
    "sourceAnswers": [brute_term(47)[0], brute_term(57)[0]],
    "newSourceTypes": 0,
    "variants": checks,
    "difficulty": "3.4-point band only = middle",
    "dataSha256": sha(ROOT / "bank/data/applied8-expanded.json"),
    "indexSha256": sha(ROOT / "bank/data/applied8-expanded-index.json"),
}
(WORK / "q20-independent-math.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
print("PASS Applied 8 Q20: exact p4 source figure, original 47th=2/10 and 57th=2/11, nine ordinal pairs brute-force checked, no new types.")

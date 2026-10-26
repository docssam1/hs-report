#!/usr/bin/env python3
"""Independently verify Applied 8 Q19 source reading, circular pairing, and all nine answers."""
import hashlib
import json
import re
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw8"
EXAM = ROOT / "materials/초등과정 대비 실전 모의고사활용 8회.pdf"
ANSWER = WORK / "source-review/candidate-2024-applied8-answer.pdf"
DATA = json.loads((ROOT / "bank/data/applied8-expanded.json").read_text())
INDEX = json.loads((ROOT / "bank/data/applied8-expanded-index.json").read_text())
REVIEW = json.loads((WORK / "q19-source-answer-review-r28.json").read_text())
VERSION = "20261025-applied8-expansion-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q12-q13-q14-q15-q17-q18-q19-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r28"
BASE_SOURCES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 17, 18, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]
CONFIGS = [(42, 10), (44, 13), (46, 22), (48, 27), (50, 32), (52, 29), (54, 37), (60, 20), (62, 45)]
COLORS = ["노란색", "초록색", "보라색"]
ALIASES = {"노란색": "노랑", "초록색": "초록", "보라색": "보라"}


def digest(b):
    return hashlib.sha256(b).hexdigest()


def norm(s):
    return re.sub(r"\s+", "", s or "")


exam_page = PdfReader(str(EXAM)).pages[3]
answer_page = PdfReader(str(ANSWER)).pages[3]
exam_text = exam_page.extract_text() or ""
answer_text = answer_page.extract_text() or ""
assert norm(exam_text) == norm(answer_text)
assert "답()" in norm(answer_text)
for token in ("전구개", "노란색초록색보라색", "마주놓여있는전구", "52", "29", "색깔은무슨색일까요"):
    assert token in norm(exam_text), token
assert REVIEW["sourceSha256"] == digest(EXAM.read_bytes())
assert REVIEW["answerCandidateSha256"] == digest(ANSWER.read_bytes())
assert REVIEW["sourceTextAndAnswerCandidateTextIdentical"] is True
assert REVIEW["officialAnswerKeyAvailable"] is False

assert DATA["version"] == INDEX["version"] == REVIEW["version"] == VERSION
assert DATA["sourceSet"] == INDEX["sourceSet"] == "applied"
assert DATA["sourceRound"] == INDEX["sourceRound"] == 8
assert DATA["itemCount"] == INDEX["itemCount"] == len(DATA["items"]) == 252
assert DATA["availableSourceNos"] == sorted(BASE_SOURCES + [19])
assert DATA["pendingSourceNos"] == INDEX["pendingSourceNos"] == [11, 16]
assert len(INDEX["items"]) == 28
entry = next(x for x in INDEX["items"] if x["sourceNo"] == 19)
assert entry["reviewStatus"] == "verified" and entry["variantCount"] == 9

q19 = [x for x in DATA["items"] if x["sourceNo"] == 19]
assert len(q19) == 9
assert [x["variantNo"] for x in q19] == list(range(1, 10))
assert len({x["id"] for x in q19}) == 9
assert REVIEW["baseItemCount"] == 243
prior = [x for x in DATA["items"] if x["sourceNo"] != 19]
prior_hash = digest(json.dumps(prior, ensure_ascii=False, separators=(",", ":")).encode())
assert prior_hash == REVIEW["baseItemsSha256"]
assert len(prior) == 243

colors_count = {c: 0 for c in COLORS}
independent_results = []
for i, (item, (total, target)) in enumerate(zip(q19, CONFIGS), 1):
    assert item["id"] == f"applied8-q19-v{i}"
    assert item["genId"] == "applied8-q19"
    assert item["area"] == "수와 식" and item["subarea"] == "규칙과 대응"
    assert item["pointBand"] == "3.4" and item["difficultyEvidence"]["label"] == "중"
    assert item["asset"] is None
    assert item["answerContract"] == "single-value"
    assert "원 둘레에 같은 간격" in item["text"]
    assert item["verification"]["sourceExamPage"] == item["verification"]["sourceAnswerPage"] == 4
    assert item["verification"]["officialAnswerStatus"].startswith("The available answer PDF is a text-identical copy")
    assert len(item["solutionSteps"]) == 4

    # Independent method: pair each position in the first half with the
    # corresponding position in the second half, instead of using the builder's wrap formula.
    half = total // 2
    if target <= half:
        opposite = target + half
    else:
        opposite = target - half
    sequence = [COLORS[(position - 1) % 3] for position in range(1, total + 1)]
    answer = sequence[opposite - 1]
    assert item["verification"]["parameters"] == {
        "totalBulbs": total,
        "targetPosition": target,
        "oppositeDistance": half,
        "oppositePosition": opposite,
        "colorCycle": COLORS,
        "answer": answer,
    }
    assert item["answer"] == item["answerParts"][0] == answer
    assert item["acceptedAnswerParts"] == [[answer], [ALIASES[answer]]]
    assert item["answerParts"][0] in item["solutionSteps"][-1]
    assert str(opposite) in " ".join(item["solutionSteps"])
    colors_count[answer] += 1
    independent_results.append({"variant": i, "total": total, "target": target, "opposite": opposite, "color": answer})

assert colors_count == {"노란색": 3, "초록색": 3, "보라색": 3}
assert REVIEW["answerColorCounts"] == colors_count
assert independent_results[3] == {"variant": 4, "total": 48, "target": 27, "opposite": 3, "color": "보라색"}
assert REVIEW["sourceAnswerDerived"] == {"total": 52, "target": 29, "oppositePosition": 3, "color": "보라색"}

out = WORK / "q19-independent-math-r28.json"
out.write_text(json.dumps({"method": "explicit opposite-pair enumeration plus independent position-by-position three-color cycle", "sourceAnswer": REVIEW["sourceAnswerDerived"], "variants": independent_results, "answerCounts": colors_count, "baseItemsSha256": prior_hash}, ensure_ascii=False, indent=2) + "\n")
print("PASS Applied8 Q19: source/blank answer candidate p.4 compared; source independently resolves to opposite position 3, 보라색; nine variants independently pair-checked; 243 prior items byte-structure preserved; index 252 items, pending [11,16].")

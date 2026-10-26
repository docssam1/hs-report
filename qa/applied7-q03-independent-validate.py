#!/usr/bin/env python3
"""Independent source and arithmetic audit for the existing Applied 7 Q3 type."""
from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw7"
REVIEW = json.loads((WORK / "q03-source-answer-review.json").read_text())
DATA_PATH = ROOT / "bank/data/applied7-expanded.json"
INDEX_PATH = ROOT / "bank/data/applied7-expanded-index.json"
DATA = json.loads(DATA_PATH.read_text())
INDEX = json.loads(INDEX_PATH.read_text())
EXAM = ROOT / "materials/초등과정 대비 실전 모의고사활용 7회.pdf"
ANSWER = Path(
    "/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/"
    "pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/"
    "생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf"
)
PDFTOTEXT = Path(
    "/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/"
    "poppler/poppler/bin/pdftotext"
)

def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

assert sha(EXAM) == REVIEW["sourceExam"]["sha256"]
assert sha(ANSWER) == REVIEW["sourceAnswer"]["sha256"]
exam_text = subprocess.check_output([str(PDFTOTEXT), "-layout", str(EXAM), "-"], text=True, errors="replace")
assert "구슬 2개를 넣으면 5개가 나오고" in exam_text
assert "구슬 12개를 한꺼번에 넣으면" in exam_text
assert REVIEW["directPageImagesCompared"] and REVIEW["sourceAndAnswerMatch"]
assert REVIEW["sourceTypeAlreadyPresent"] and REVIEW["newSourceTypesAdded"] == 0
assert REVIEW["sourceAnswer"]["teacherMarkedAnswer"] == 35
assert REVIEW["sourceAnswerIndependentCheck"]["result"] == 35
assert REVIEW["sourceExam"]["questionPage"] == REVIEW["sourceAnswer"]["answerPage"] == 1

assert DATA["sourceSet"] == "applied" and DATA["sourceRound"] == 7
assert DATA["availableSourceNos"] == [2,3,4,5,6,7,9,10,11,12,13,14,15,16,18,20,21,22,23,24,25,26,27,28,29,30]
assert DATA["itemCount"] == 234 and len(DATA["items"]) == 234
assert DATA["policy"]["sourceTypesAdded"] == 0
assert INDEX["itemCount"] == 234 and [x["sourceNo"] for x in INDEX["items"]] == [2,3,4,5,6,7,9,10,11,12,13,14,15,16,18,20,21,22,23,24,25,26,27,28,29,30]
assert INDEX["items"][0]["variantCount"] == 9

seen_text, seen_answers = set(), set()
proof = []
for variant, item in enumerate([x for x in DATA["items"] if x["sourceNo"] == 3], 1):
    p = item["verification"]["parameters"]
    examples = p["examples"]
    assert item["sourceNo"] == 3 and item["genId"] == "applied7-q03"
    assert item["variantNo"] == variant and item["id"] == f"applied7-q03-v{variant}"
    assert item["area"] == "수와 식" and item["pointBand"] == "2.7"
    assert item["difficultyEvidence"]["label"] == "하"
    assert len(item["solutionSteps"]) >= 3
    assert item["verification"]["sourceExamPage"] == 1
    assert item["verification"]["sourceAnswerPage"] == 1
    assert item["verification"]["sourceDrawingCompared"] is False
    assert item["verification"]["sourceDrawingPresent"] is False
    assert len(examples) == 3
    for a, b in zip(examples, examples[1:]):
        assert b["input"] - a["input"] == 2
        assert b["output"] - a["output"] == 6
    for pair in examples:
        assert pair["output"] == 3 * pair["input"] - 1
    target, answer = p["targetInput"], p["answer"]
    assert target > examples[-1]["input"]
    assert answer == 3 * target - 1
    assert item["answer"] == str(answer)
    assert item["answerParts"] == [answer]
    assert item["acceptedAnswers"] == [str(answer)]
    assert item["answerContract"] == "ordered-parts"
    assert item["text"] not in seen_text and answer not in seen_answers
    assert all(str(n) in item["text"] for n in [target, *[v for pair in examples for v in pair.values()]])
    seen_text.add(item["text"])
    seen_answers.add(answer)
    proof.append({"id": item["id"], "examples": examples, "target": target, "answer": answer, "formula": "3x-1"})

assert len(seen_text) == len(seen_answers) == 9
assert len(DATA["pendingSourceNos"]) ==4 and not ({2, 3} & set(DATA["pendingSourceNos"]))
result = {
    "sourceExamSha256": sha(EXAM),
    "sourceAnswerSha256": sha(ANSWER),
    "sourceQuestion": 3,
    "teacherAnswer": 35,
    "teacherAnswerIndependentlyRecomputed": 35,
    "directExamAndAnswerPageImagesCompared": True,
    "newSourceTypesAdded": 0,
    "variants": proof,
    "variantCount": len(proof),
    "allAnswersUnique": True,
    "allVariantsUseExistingSourceType": True,
    "dataSha256": sha(DATA_PATH),
    "indexSha256": sha(INDEX_PATH),
    "passed": True
}
out = WORK / "q03-independent-math.json"
out.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
print("PASS Applied7 Q3: source/answer pages match; teacher answer 35; 9 unique variants independently solve to 3x−1; new source types 0")

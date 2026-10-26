#!/usr/bin/env python3
"""Add nine text-only variants for Applied 8 Q19's opposite-color cycle type."""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw8"
SOURCE = ROOT / "materials/초등과정 대비 실전 모의고사활용 8회.pdf"
ANSWER_CANDIDATE = WORK / "source-review/candidate-2024-applied8-answer.pdf"
DATA_PATH = ROOT / "bank/data/applied8-expanded.json"
INDEX_PATH = ROOT / "bank/data/applied8-expanded-index.json"
VERSION = "20261025-applied8-expansion-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q12-q13-q14-q15-q17-q18-q19-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r28"
BASE_VERSION = "20261025-applied8-expansion-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q12-q13-q14-q15-q17-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r27"
BASE_SOURCES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 17, 18, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]
CONFIGS = [(42, 10), (44, 13), (46, 22), (48, 27), (50, 32), (52, 29), (54, 37), (60, 20), (62, 45)]
COLORS = ["노란색", "초록색", "보라색"]
SOURCE_STEM = "전구 52개를 노란색, 초록색, 보라색이 반복되도록 1번째 자리부터 놓았습니다. 29번째 전구와 마주 놓여 있는 전구의 색깔은 무슨 색일까요?"


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def norm(s: str) -> str:
    return re.sub(r"\s+", "", s or "")


def solve(total: int, target: int) -> tuple[int, str]:
    assert total > 0 and total % 2 == 0 and 1 <= target <= total
    opposite = (target - 1 + total // 2) % total + 1
    color = COLORS[(opposite - 1) % 3]
    return opposite, color


def item_for(i: int, total: int, target: int) -> dict:
    opposite, color = solve(total, target)
    half = total // 2
    color_remainder = opposite % 3
    color_rule = {1: "첫 번째 색은 노란색", 2: "두 번째 색은 초록색", 0: "나누어떨어지므로 세 번째 색은 보라색"}[color_remainder]
    steps = [
        f"전구 {total}개를 원 둘레에 같은 간격으로 놓았으므로 맞은편 자리는 {total}÷2={half}자리 떨어져 있습니다.",
        f"{target}번 전구에서 {half}자리를 이동하면 {target}+{half}={target + half}번 자리가 됩니다. {total}번을 넘으면 {total}을 빼므로 맞은편은 {opposite}번입니다.",
        f"1번부터 노란색, 초록색, 보라색 순으로 세 가지 색이 반복됩니다. {opposite}를 3으로 나누면 나머지는 {color_remainder}입니다. {color_rule}이므로 {color}입니다.",
        f"따라서 맞은편 전구의 색은 {color}입니다.",
    ]
    aliases = {"노란색": ["노란색", "노랑"], "초록색": ["초록색", "초록"], "보라색": ["보라색", "보라"]}[color]
    return {
        "id": f"applied8-q19-v{i}",
        "genId": "applied8-q19",
        "sourceSet": "applied",
        "sourceRound": 8,
        "sourceNo": 19,
        "variantNo": i,
        "reviewStatus": "verified",
        "area": "수와 식",
        "subarea": "규칙과 대응",
        "detailType": "세 가지 색의 반복 배열에서 맞은편 위치의 색 찾기",
        "pointBand": "3.4",
        "text": f"전구 {total}개를 원 둘레에 같은 간격으로 놓고, 1번 자리부터 노란색·초록색·보라색 순으로 색을 반복했습니다. {target}번 전구의 맞은편에 놓인 전구는 무슨 색인가요?",
        "asset": None,
        "answer": color,
        "answerParts": [color],
        "answerLabels": [f"{target}번 전구의 맞은편 색"],
        "acceptedAnswers": [color, aliases[1]],
        "acceptedAnswerParts": [[aliases[0]], [aliases[1]]],
        "answerContract": "single-value",
        "solutionSteps": steps,
        "solution": " ".join(steps),
        "learningPoint": "전체 자리 수의 절반으로 정반대편 위치를 찾고, 반복되는 세 가지 색의 순서에서 그 자리의 색을 정하기",
        "learningLocation": "활용 8회 · 원문 19번 · 반복 색깔 배열에서 맞은편 위치 찾기",
        "verification": {
            "primaryMethod": "전체 전구 수의 절반만큼 이동해 맞은편의 번호를 구한 뒤 3색 반복 순서로 색을 판정한다.",
            "independentMethod": "1부터 번호를 매긴 원형 배열의 반대편 인덱스를 직접 계산하고, 독립적인 3주기 색상 매핑으로 답을 확인한다.",
            "parameters": {"totalBulbs": total, "targetPosition": target, "oppositeDistance": half, "oppositePosition": opposite, "colorCycle": COLORS, "answer": color},
            "independentSuite": "qa/applied8-q19-independent-validate.py",
            "sourceExamPage": 4,
            "sourceExamFile": "초등과정 대비 실전 모의고사활용 8회.pdf",
            "sourceAnswerPage": 4,
            "sourceDrawingCompared": True,
            "sourceDrawingPresent": False,
            "sourceInterpretation": "원문은 ‘마주 놓여 있는 전구’라고 표현한다. 유사문제에는 원 둘레의 같은 간격 배치를 명시해 맞은편 위치가 유일하게 정해지도록 했다.",
            "officialAnswerStatus": "The available answer PDF is a text-identical copy with a blank answer field, not an official answer key. The source answer was independently derived from the stated opposite-position and repeating-color conditions.",
            "studentDifficultyMeasured": False,
        },
        "difficultyEvidence": {
            "basis": "source-point-band",
            "label": "중",
            "sourceReasoningPreserved": True,
            "measuredVariantRate": None,
            "estimated": False,
            "rationale": "활용 8회 원문 19번은 13~22번의 3.4점 배점대다. 활용 난도는 배점대만 적용한다.",
        },
    }


def main() -> None:
    data = json.loads(DATA_PATH.read_text())
    index = json.loads(INDEX_PATH.read_text())
    # Allow a corrected build to be rerun without disturbing the 243-item base.
    if data.get("version") == VERSION:
        data["items"] = [x for x in data["items"] if x["sourceNo"] != 19]
        data["availableSourceNos"] = BASE_SOURCES[:]
        data["pendingSourceNos"] = [11, 16, 19]
        data["itemCount"] = len(data["items"])
        data["version"] = BASE_VERSION
        index["items"] = [x for x in index["items"] if x["sourceNo"] != 19]
        index["pendingSourceNos"] = [11, 16, 19]
        index["itemCount"] = len(index["items"]) * 9
        index["version"] = BASE_VERSION
    assert data["version"] == index["version"] == BASE_VERSION
    assert data["sourceSet"] == "applied" and data["sourceRound"] == 8
    assert data["itemCount"] == index["itemCount"] == 243
    assert data["availableSourceNos"] == BASE_SOURCES
    assert data["pendingSourceNos"] == index["pendingSourceNos"] == [11, 16, 19]
    assert len([x for x in data["items"] if x["sourceNo"] == 19]) == 0
    base_items = json.dumps(data["items"], ensure_ascii=False, separators=(",", ":")).encode()
    source_page = PdfReader(str(SOURCE)).pages[3]
    answer_page = PdfReader(str(ANSWER_CANDIDATE)).pages[3]
    source_text = source_page.extract_text() or ""
    answer_text = answer_page.extract_text() or ""
    assert norm(source_text) == norm(answer_text)
    # The scan PDF's text layer interleaves the numerals with nearby words;
    # verify the visible phrases separately and retain the direct page render.
    for token in ("전구개", "노란색초록색보라색", "마주놓여있는전구", "52", "29", "색깔은무슨색일까요"):
        assert token in norm(source_text), token
    assert "답()" in norm(answer_text)

    items = [item_for(i, total, target) for i, (total, target) in enumerate(CONFIGS, 1)]
    answers = [x["answer"] for x in items]
    assert set(answers) == set(COLORS) and all(answers.count(c) == 3 for c in COLORS)
    data["items"].extend(items)
    data["availableSourceNos"] = sorted(BASE_SOURCES + [19])
    data["pendingSourceNos"] = [11, 16]
    data["itemCount"] = len(data["items"])
    data["version"] = VERSION

    index["items"].append({"sourceNo": 19, "genId": "applied8-q19", "area": "수와 식", "subarea": "규칙과 대응", "detailType": "세 가지 색의 반복 배열에서 맞은편 위치의 색 찾기", "pointBand": "3.4", "reviewStatus": "verified", "variantCount": 9})
    index["items"].sort(key=lambda x: x["sourceNo"])
    index["pendingSourceNos"] = [11, 16]
    index["itemCount"] = len(data["items"])
    index["version"] = VERSION

    review = {
        "version": VERSION,
        "sourceQuestion": 19,
        "sourcePage": 4,
        "sourceSha256": sha(SOURCE.read_bytes()),
        "answerCandidate": str(ANSWER_CANDIDATE.relative_to(ROOT)),
        "answerCandidateSha256": sha(ANSWER_CANDIDATE.read_bytes()),
        "sourcePdfTitle": PdfReader(str(SOURCE)).metadata.title,
        "answerCandidatePdfTitle": PdfReader(str(ANSWER_CANDIDATE)).metadata.title,
        "sourceTextAndAnswerCandidateTextIdentical": True,
        "answerCandidateBlankField": True,
        "officialAnswerKeyAvailable": False,
        "sourceInterpretation": "The phrase ‘bulb opposite it’ is interpreted as the antipodal position in a circular arrangement. The variants state an equally spaced circle explicitly; no source figure was present.",
        "sourceAnswerDerived": {"total": 52, "target": 29, "oppositePosition": solve(52, 29)[0], "color": solve(52, 29)[1]},
        "baseItemCount": 243,
        "baseItemsSha256": sha(base_items),
        "addedItemIds": [x["id"] for x in items],
        "configurations": [{"total": n, "target": k, "opposite": solve(n, k)[0], "answer": solve(n, k)[1]} for n, k in CONFIGS],
        "answerColorCounts": {c: answers.count(c) for c in COLORS},
        "officialAnswerStatus": "unconfirmed; only a blank, text-identical answer-PDF candidate was available.",
    }

    DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    INDEX_PATH.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")
    (WORK / "q19-source-answer-review-r28.json").write_text(json.dumps(review, ensure_ascii=False, indent=2) + "\n")
    print(f"PASS built Applied 8 Q19: 9 text-only variants; {data['itemCount']} total across {len(data['availableSourceNos'])} source types; pending {data['pendingSourceNos']}; source answer independently derived as {review['sourceAnswerDerived']}.")


if __name__ == "__main__":
    main()

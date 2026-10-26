#!/usr/bin/env python3
"""Build nine text-only variants of existing Applied 8 question 13."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw8"
EXAM = ROOT / "materials/초등과정 대비 실전 모의고사활용 8회.pdf"
ANSWER = WORK / "source-review/applied8-answer-drive-copy.pdf"
OUT = ROOT / "bank/data/applied8-expanded.json"
INDEX = ROOT / "bank/data/applied8-expanded-index.json"
REVIEW = WORK / "q13-source-answer-review.json"
FINAL_COUNTS = [24, 32, 48, 56, 64, 72, 80, 88, 96]


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def solve(final_each: int) -> tuple[int, int, int]:
    """Reverse the C, B, A loss rounds, then verify by replaying them."""
    if final_each % 8:
        raise ValueError("Final equal count must be divisible by 8.")
    # Reversing the last, middle, and first transfers gives these expressions.
    a, b, c = final_each // 2, 7 * final_each // 8, 13 * final_each // 8
    state = [a, b, c]
    for loser in [0, 1, 2]:
        amount = state[loser]
        if amount % 2:
            raise AssertionError("A losing player's half must be integral.")
        state[loser] = amount // 2
        each = amount // 4
        for player in range(3):
            if player != loser:
                state[player] += each
        if amount % 4:
            raise AssertionError("Each of the other two players must receive an integer share.")
    if state != [final_each] * 3:
        raise AssertionError((final_each, state))
    return a, b, c


def make_item(final_each: int, variant: int) -> dict:
    a, b, c = solve(final_each)
    text = (
        "A, B, C 세 사람이 사탕을 나누어 받았습니다. 진 사람은 자기가 가지고 있는 사탕의 "
        "절반을 나머지 두 사람에게 똑같이 나누어 줍니다. 게임을 세 번 하여 첫 번째에는 A가, "
        "두 번째에는 B가, 세 번째에는 C가 졌습니다. 게임이 끝난 뒤 세 사람은 사탕을 각각 "
        f"{final_each}개씩 갖게 되었습니다. 처음에 가지고 있던 사탕은 A, B, C가 각각 몇 개였습니까?"
    )
    steps = [
        f"세 번째 게임에서 C가 {final_each}개를 절반 나누어 주기 전에는 C가 {final_each*2}개를 가지고 있었습니다. "
        f"A와 B는 각각 {final_each//2}개씩 받았으므로, 세 번째 게임 직전에는 A와 B가 각각 {final_each//2}개였습니다.",
        f"두 번째 게임에서 B가 절반 나누어 주기 전에는 B가 {final_each}개였습니다. "
        f"A와 C가 각각 {final_each//4}개씩 받았으므로, 두 번째 게임 직전 A는 {final_each//4}개, C는 {7*final_each//4}개였습니다.",
        f"첫 번째 게임에서 A가 절반 나누어 주기 전에는 A가 {final_each//2}개였습니다. "
        f"B와 C가 각각 {final_each//8}개씩 받았으므로 처음 B는 {7*final_each//8}개, C는 {13*final_each//8}개였습니다.",
        f"따라서 처음 사탕 수는 A {a}개, B {b}개, C {c}개입니다. 세 번의 나눔을 차례로 적용하면 마지막에는 각자 {final_each}개가 됩니다.",
    ]
    return {
        "id": f"applied8-q13-v{variant}",
        "genId": "applied8-q13",
        "sourceSet": "applied",
        "sourceRound": 8,
        "sourceNo": 13,
        "variantNo": variant,
        "reviewStatus": "verified",
        "area": "수와 식",
        "subarea": "순차적 변화의 역추적",
        "detailType": "차례로 절반씩 나누는 사탕의 처음 양 역산",
        "pointBand": "3.4",
        "text": text,
        "answer": f"A {a}개, B {b}개, C {c}개",
        "answerParts": [a, b, c],
        "answerLabels": ["처음 A가 가진 사탕", "처음 B가 가진 사탕", "처음 C가 가진 사탕"],
        "acceptedAnswers": [f"{a},{b},{c}", f"{a}, {b}, {c}", f"A {a}개, B {b}개, C {c}개"],
        "answerContract": "ordered-parts",
        "solutionSteps": steps,
        "solution": " ".join(steps),
        "learningPoint": "마지막 상태에서 거꾸로 나누어 준 양을 더해 각 게임 직전의 사탕 수를 복원하기",
        "learningLocation": "활용 8회 · 원문 13번 · 순차적 절반 나눔의 역추적",
        "verification": {
            "primaryMethod": "게임 종료 상태에서 C, B, A가 진 순서의 역변환을 적용한다.",
            "independentMethod": "처음 수에서 A, B, C가 차례로 절반씩 나누는 과정을 정방향 재생해 최종 상태를 확인한다.",
            "parameters": {"finalEach": final_each, "initialA": a, "initialB": b, "initialC": c},
            "independentSuite": "qa/applied8-q13-independent-validate.py",
            "sourceExamPage": 3,
            "sourceExamFile": EXAM.name,
            "sourceAnswerPage": 3,
            "sourceDrawingCompared": False,
            "sourceDrawingPresent": False,
            "variantUsesSourceDrawing": False,
            "officialAnswerStatus": "Drive file titled as answer is a blank exam duplicate; no marked key was found. Variant answers were independently solved and forward-checked.",
            "studentDifficultyMeasured": False,
        },
        "difficultyEvidence": {
            "basis": "source-point-band",
            "label": "중",
            "sourceReasoningPreserved": True,
            "measuredVariantRate": None,
            "estimated": False,
            "rationale": "활용 8회 원문 13번은 13~22번의 3.4점 배점대다. 활용 난도는 배점대만 적용한다.",
        },
    }


def main() -> None:
    if not EXAM.exists() or not ANSWER.exists():
        raise SystemExit("The source exam or Drive answer candidate is missing.")
    items = [make_item(n, i + 1) for i, n in enumerate(FINAL_COUNTS)]
    version = "20261025-applied8-expansion-q13-q14-q15-q17-q18-q20-q21-q22-q23-r9"
    data = {
        "version": version,
        "sourceSet": "applied",
        "sourceRound": 8,
        "itemCount": len(items),
        "availableSourceNos": [13],
        "pendingSourceNos": list(range(1, 13)) + list(range(14, 31)),
        "policy": {"targetVariantsPerSource": 9, "difficultyBasis": "source-point-band", "newSourceTypes": 0},
        "items": items,
    }
    index = {
        "version": version,
        "sourceSet": "applied",
        "sourceRound": 8,
        "itemCount": len(items),
        "pendingSourceNos": data["pendingSourceNos"],
        "items": [{"sourceNo": 13, "genId": "applied8-q13", "area": "수와 식", "subarea": "순차적 변화의 역추적", "detailType": "차례로 절반씩 나누는 사탕의 처음 양 역산", "pointBand": "3.4", "reviewStatus": "verified", "variantCount": 9}],
    }
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    INDEX.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")
    review = {
        "sourceExam": {"file": EXAM.name, "sha256": sha256(EXAM), "page": 3, "questionNo": 13, "directVisualReview": True},
        "answerCandidates": [{"file": ANSWER.name, "sha256": sha256(ANSWER), "page": 3, "directVisualReview": True, "containsAnswers": False}],
        "answerSourceConclusion": "All three synced Drive copies titled as Applied 8 answer PDF have the same SHA-256. Page 3 has exactly the same extracted text as the question PDF and visually contains the same blank question with no marked answers. The PDF page sizes differ. No official answer key was available in these files.",
        "originalIndependentAnswer": [20, 35, 65],
        "originalIndependentCheck": "Backward inversion gives A=20, B=35, C=65; forward replay after A, then B, then C loses leaves (40,40,40).",
        "variantCount": 9,
        "variantsForwardChecked": True,
        "newSourceTypes": 0,
        "difficulty": "3.4-point band only = middle",
        "examSha256": sha256(EXAM),
        "answerCandidateSha256": sha256(ANSWER),
    }
    REVIEW.write_text(json.dumps(review, ensure_ascii=False, indent=2) + "\n")
    print(f"Wrote {len(items)} items from existing source type 13; source/answer SHA-256s recorded.")


if __name__ == "__main__":
    main()

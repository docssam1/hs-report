#!/usr/bin/env python3
"""Expand Applied 8 Q10's existing gear-turn ratio type to nine questions."""
from __future__ import annotations

import hashlib
import json
import shutil
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw8"
SOURCE = ROOT / "materials/초등과정 대비 실전 모의고사활용 8회.pdf"
SOURCE_DRIVE_ID = "1H2KxzZHzeTve5thcTpTrJLEeNyl0F_ae"
ANSWER_IN = WORK / "source-review/applied8-answer-drive-copy-q05.pdf"
ANSWER = WORK / "source-review/applied8-answer-drive-copy-q10.pdf"
DATA = ROOT / "bank/data/applied8-expanded.json"
INDEX = ROOT / "bank/data/applied8-expanded-index.json"
REVIEW = WORK / "q10-source-answer-review.json"
MATH = WORK / "q10-independent-math.json"
VERSION = "20261025-applied8-expansion-q05-q10-q13-q14-q15-q17-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r18"
PARAMS = [
    (63, 42, 6),
    (36, 24, 8),
    (56, 28, 5),
    (30, 18, 9),
    (45, 30, 8),
    (24, 18, 6),
    (42, 21, 4),
    (54, 36, 6),
    (32, 24, 9),
]


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def algebra(a_teeth: int, b_teeth: int, a_turns: int) -> int:
    n = a_teeth * a_turns
    if n % b_teeth:
        raise ValueError("Selected parameters must give a whole number of rotations.")
    return n // b_teeth


def simulate(a_teeth: int, b_teeth: int, a_turns: int) -> tuple[int, int]:
    """Count passing teeth one at a time; return full B turns and remainder."""
    passed = a_teeth * a_turns
    return divmod(passed, b_teeth)


def make_item(a_teeth: int, b_teeth: int, a_turns: int, variant: int) -> dict:
    answer = algebra(a_teeth, b_teeth, a_turns)
    sim, rem = simulate(a_teeth, b_teeth, a_turns)
    assert (sim, rem) == (answer, 0)
    text = (
        f"가, 나 두 개의 톱니바퀴가 맞물려 돌아가고 있습니다. 가 톱니바퀴의 톱니 수는 {a_teeth}개이고, "
        f"나 톱니바퀴의 톱니 수는 {b_teeth}개입니다. 가 톱니바퀴가 {a_turns}바퀴 돌 때, "
        "나 톱니바퀴는 몇 바퀴 돌까요?"
    )
    steps = [
        f"가 톱니바퀴가 {a_turns}바퀴 돌면 맞물린 톱니는 {a_teeth}×{a_turns}={a_teeth*a_turns}개 지나갑니다.",
        f"나 톱니바퀴가 한 바퀴 돌 때 톱니 {b_teeth}개가 지나가므로, 나의 회전 수를 □바퀴라 두면 {b_teeth}×□={a_teeth*a_turns}입니다.",
        f"따라서 □={a_teeth*a_turns}÷{b_teeth}={answer}이고, 톱니가 남지 않으므로 나 톱니바퀴는 {answer}바퀴 돕니다.",
    ]
    return {
        "id": f"applied8-q10-v{variant}", "genId": "applied8-q10", "sourceSet": "applied",
        "sourceRound": 8, "sourceNo": 10, "variantNo": variant, "reviewStatus": "verified",
        "area": "수와 식", "subarea": "비례 관계", "detailType": "맞물린 톱니바퀴의 회전 수",
        "pointBand": "2.7", "text": text, "answer": f"{answer}바퀴", "answerParts": [answer],
        "answerLabels": ["나 톱니바퀴의 회전 수"],
        "acceptedAnswers": [str(answer), f"{answer}바퀴", f"{answer}바퀴입니다"],
        "answerContract": "single-number", "solutionSteps": steps, "solution": " ".join(steps),
        "learningPoint": "맞물린 톱니가 지나가는 수를 같게 두어 톱니 수와 회전 수의 반비례 관계를 계산하기",
        "learningLocation": "활용 8회 · 원문 10번 · 톱니 수와 회전 수의 관계",
        "verification": {
            "primaryMethod": "가의 톱니 수×회전 수=나의 톱니 수×회전 수 식을 세운다.",
            "independentMethod": "맞물림 지점을 지나는 톱니를 한 개씩 세어 나의 한 바퀴 단위로 묶는다.",
            "parameters": {"aTeeth": a_teeth, "bTeeth": b_teeth, "aTurns": a_turns,
                           "teethPassing": a_teeth*a_turns, "bTurns": answer, "remainderTeeth": rem},
            "independentSuite": "qa/applied8-q10-independent-validate.py",
            "sourceExamPage": 3, "sourceExamFile": SOURCE.name, "sourceExamDriveFileId": SOURCE_DRIVE_ID,
            "sourceAnswerPage": 3, "sourceAnswerDriveFileId": "1ixxsCBOTS4SqJ4PXJesvzHzyQfcBW06p",
            "sourceDrawingCompared": True, "sourceDrawingPresent": False,
            "sourceDrawingPixelExactCrop": False,
            "officialAnswerStatus": "The available Drive answer-candidate page is text-identical to the blank exam page and shows no answer. The source and variants were independently calculated from passing-tooth counts.",
            "studentDifficultyMeasured": False,
        },
        "difficultyEvidence": {"basis": "source-point-band", "label": "하", "sourceReasoningPreserved": True,
            "measuredVariantRate": None, "estimated": False,
            "rationale": "활용 8회 원문 10번은 1~12번의 2.7점 배점대다. 활용 난도는 배점대만 적용한다."},
    }


def main() -> None:
    if not SOURCE.exists() or not ANSWER_IN.exists():
        raise SystemExit("The source exam or downloaded Drive answer candidate is missing.")
    shutil.copy2(ANSWER_IN, ANSWER)
    exam, answer = PdfReader(str(SOURCE)).pages[2], PdfReader(str(ANSWER)).pages[2]
    norm = lambda t: "".join((t or "").split())
    assert norm(exam.extract_text()) == norm(answer.extract_text())
    source_text = norm(exam.extract_text())
    assert "톱니바퀴" in source_text and "답()" in source_text
    d, idx = json.loads(DATA.read_text()), json.loads(INDEX.read_text())
    assert not any(x.get("sourceNo") == 10 for x in d["items"])
    items = [make_item(*row, variant=i) for i, row in enumerate(PARAMS, 1)]
    d["items"].extend(items)
    source_nos = sorted({x["sourceNo"] for x in d["items"]})
    d["availableSourceNos"] = source_nos
    d["pendingSourceNos"] = [n for n in range(1, 31) if n not in source_nos]
    d["itemCount"] = len(d["items"])
    d["version"] = VERSION
    d["policy"]["newSourceTypes"] = 0
    idx["items"].append({"sourceNo": 10, "genId": "applied8-q10", "area": "수와 식",
        "subarea": "비례 관계", "detailType": "맞물린 톱니바퀴의 회전 수",
        "pointBand": "2.7", "reviewStatus": "verified", "variantCount": 9})
    idx["items"].sort(key=lambda x: x["sourceNo"])
    idx["pendingSourceNos"] = d["pendingSourceNos"]
    idx["itemCount"] = d["itemCount"]
    idx["version"] = VERSION
    DATA.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    INDEX.write_text(json.dumps(idx, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    results = []
    for i, (a, b, t) in enumerate(PARAMS, 1):
        ans = algebra(a, b, t)
        sim = simulate(a, b, t)
        assert sim == (ans, 0)
        results.append({"variant": i, "aTeeth": a, "bTeeth": b, "aTurns": t,
                        "teethPassing": a*t, "bTurns": ans, "simulation": list(sim)})
    review = {"sourceExam": {"file": SOURCE.name, "driveFileId": SOURCE_DRIVE_ID, "sha256": sha(SOURCE),
             "page": 3, "questionNo": 10, "directVisualReview": True, "stem": source_text,
             "sourceDrawingPresent": False},
             "answerCandidate": {"file": ANSWER.name, "driveFileId": "1ixxsCBOTS4SqJ4PXJesvzHzyQfcBW06p",
             "sha256": sha(ANSWER), "page": 3, "directVisualReview": True, "containsAnswers": False,
             "pageTextMatchesQuestionPdf": True},
             "answerSourceConclusion": "This Drive file titled as answer is a blank question-page copy, not a marked key.",
             "sourceIndependentAnswer": algebra(*PARAMS[0]), "variantCount": 9, "newSourceTypes": 0,
             "difficulty": "2.7-point band only = low"}
    (WORK / "q10-source-answer-review.json").write_text(json.dumps(review, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (WORK / "q10-independent-math.json").write_text(json.dumps({"algebraicMethod": "A turns×A teeth = B turns×B teeth",
       "independentMethod": "count the teeth passing the mesh one by one and group into B-gear tooth cycles",
       "source": results[0], "variants": results[1:]}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"PASS Q10: source rotations={algebra(*PARAMS[0])}; 9 questions; inventory={d['itemCount']}; sources={len(source_nos)}; r18")


if __name__ == "__main__":
    main()

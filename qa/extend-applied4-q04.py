#!/usr/bin/env python3
"""Add nine source-faithful, independently solvable slow-clock variants for Applied 4 Q4."""
from __future__ import annotations

import hashlib
import json
from fractions import Fraction
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "bank/data/applied4-expanded.json"
INDEX_PATH = ROOT / "bank/data/applied4-expanded-index.json"
EXAM = ROOT / "materials/초등과정 대비 실전 모의고사 활용 4회.pdf"
ANSWER = Path("/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 4회 답안.pdf")
VERSION = "20261025-applied4-expansion-q01-q04-r3"
SOURCE_ANSWER_ID = "1-Cr2jAfw1bK8Z-OkvlcyB3iaDyMXu7Av"

# (minutes lost per real hour, hours displayed since the clock was set)
CASES = [(6, 27), (12, 28), (18, 35), (24, 36), (30, 24), (36, 26), (42, 30), (48, 22), (50, 24)]
START_HOUR = 8


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def clock_phrase(hours_after_start: int) -> str:
    absolute = START_HOUR + hours_after_start
    day, hour = divmod(absolute, 24)
    names = {0: "오늘", 1: "내일", 2: "모레", 3: "사흘 뒤", 4: "나흘 뒤", 5: "닷새 뒤", 6: "엿새 뒤"}
    h12 = hour % 12 or 12
    ampm = "오전" if hour < 12 else "오후"
    if hour == 12:
        ampm = "낮"
    return f"{names[day]} {ampm} {h12}시"


def actual_hours(loss: int, display_hours: int) -> int:
    # One actual hour advances this clock by (60-loss) minutes.
    value = Fraction(display_hours * 60, 60 - loss)
    assert value.denominator == 1
    return value.numerator


def main() -> None:
    assert EXAM.is_file() and ANSWER.is_file()
    assert sha(EXAM) == "f7bbaf0a1f5de40434882b8c0da70cc5b8fb20188f03c5c77458b6a5cac05c59"
    assert sha(ANSWER) == "67f66e5fa57df1d463261e184f1dced30e3ffbcf0a802a1ec2d9b8066d122fe8"
    assert len(CASES) == 9 and len(set(CASES)) == 9

    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    index = json.loads(INDEX_PATH.read_text(encoding="utf-8"))
    assert data["sourceRound"] == 4 and data["availableSourceNos"] == [1] + list(range(5, 31))
    assert data["pendingSourceNos"] == [2, 3, 4] and len(data["items"]) == 243
    assert index["itemCount"] == 243 and index["pendingSourceNos"] == [2, 3, 4]
    prior_sha = hashlib.sha256(json.dumps(data["items"], ensure_ascii=False, separators=(",", ":")).encode()).hexdigest()

    variants = []
    proofs = []
    for variant, (loss, display) in enumerate(CASES, 1):
        real = actual_hours(loss, display)
        assert real > display and 0 < loss < 60
        display_target = clock_phrase(display)
        real_target = clock_phrase(real)
        text = (f"실제 한 시간이 지날 때마다 {loss}분씩 늦어지는 시계를 오늘 오전 8시에 정확히 맞추었습니다. "
                f"이 시계가 {display_target}를 가리킬 때 실제 시각은 몇 시입니까?")
        steps = [
            f"실제 1시간 동안 이 시계는 60-{loss}={60-loss}분 진행합니다.",
            f"시계를 맞춘 오늘 오전 8시부터 표시된 {display_target}까지 시계가 진행한 시간은 {display}시간입니다.",
            f"실제 경과 시간은 {display}×60÷{60-loss}={real}시간입니다.",
            f"오늘 오전 8시에서 실제 {real}시간 뒤는 {real_target}입니다."
        ]
        answer = real_target
        variants.append({
            "id": f"applied4-q04-v{variant}", "genId": "applied4-q04", "sourceSet": "applied", "sourceRound": 4,
            "sourceNo": 4, "variantNo": variant, "reviewStatus": "verified", "area": "수와 식",
            "subarea": "시간과 빠르기", "detailType": "느린 시계의 진행 비율로 실제 시각 구하기", "pointBand": "2.7",
            "text": text, "asset": None, "answer": answer, "answerParts": [answer],
            "acceptedAnswers": [answer], "answerContract": "single-value",
            "solutionSteps": steps, "solution": " ".join(steps),
            "learningPoint": "느린 시계의 한 시간 진행량을 비율로 나타내고 표시된 시간과 실제 경과 시간을 바꾸어 계산하기",
            "learningLocation": "활용 4회 · 원문 4번 · 느린 시계의 진행 비율과 실제 시각",
            "verification": {
                "primaryMethod": "시계의 실제 1시간당 진행 분량과 표시된 경과 시간을 비례식으로 환산",
                "independentMethod": "분 단위 유리수 비율을 계산해 실제 경과 시간을 시간·일 단위로 환산",
                "parameters": {"minutesLostPerActualHour": loss, "clockDisplayedElapsedHours": display,
                               "actualElapsedHours": real, "startClockHour": START_HOUR,
                               "displayTarget": display_target, "actualTarget": real_target},
                "independentSuite": "qa/applied4-q04-independent-validate.py",
                "sourceExamPage": 1, "sourceAnswerPage": 4,
                "sourceExamFile": EXAM.name, "sourceAnswerFile": ANSWER.name,
                "sourceAnswerDriveFileId": SOURCE_ANSWER_ID, "sourceDrawingCompared": False,
                "sourceDrawingPresent": False,
                "officialAnswerStatus": "답안 후보 PDF p4의 손글씨 ‘오후 8시’를 확인했다. 실제 60시간 경과로 독립 재현했다. PDF가 공식 정답표인지 여부는 미확인이다.",
                "studentDifficultyMeasured": False
            },
            "difficultyEvidence": {"basis": "source-point-band", "label": "하", "sourceReasoningPreserved": True,
                "measuredVariantRate": None, "estimated": False,
                "rationale": "활용4 원문 p1에서 1~12번은 2.7점으로 표시되어 있어 활용 난도는 배점대만 적용한다."}
        })
        # Independent integer check: invert the rate using Fraction, then recompute display elapsed.
        assert Fraction(real * (60-loss), 60) == display
        proofs.append({"variant": variant, "lossMinutesPerRealHour": loss, "displayElapsedHours": display,
                       "actualElapsedHours": real, "displayTarget": display_target, "answer": answer,
                       "checkA": f"{display}×60÷{60-loss}={real}",
                       "checkB": f"{real}×{60-loss}÷60={display}"})

    data["items"] = variants + data["items"]
    data["availableSourceNos"] = [1, 4] + list(range(5, 31))
    data["pendingSourceNos"] = [2, 3]
    data["version"] = VERSION
    data["revision"] = VERSION
    data["reviewSummary"]["q04DirectSourceComparison"] = True
    data["reviewSummary"]["q04IndependentMathCount"] = 9
    data["reviewSummary"]["q04SourceAnswerCandidate"] = "모레 오후 8시"
    data["reviewSummary"]["q04ActualZipReviewed"] = False
    data["q04ExpansionReview"] = {"variants": 9, "sourceAnswerDriveFileId": SOURCE_ANSWER_ID,
        "preservedPriorItemsSha256": prior_sha, "status": "source/direct answer reviewed; independent variants added; ZIP/browser checks pending"}
    index["version"] = VERSION
    index["itemCount"] = 252
    index["pendingSourceNos"] = [2, 3]
    index["items"].insert(1, {"sourceNo": 4, "genId": "applied4-q04", "area": "수와 식", "subarea": "시간과 빠르기",
        "detailType": "느린 시계의 진행 비율로 실제 시각 구하기", "pointBand": "2.7", "reviewStatus": "verified", "variantCount": 9})
    DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    INDEX_PATH.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    WORK = ROOT / ".private-work/hw-expansion-20261023/hw4"
    WORK.mkdir(parents=True, exist_ok=True)
    evidence = {"sourceExam": {"name": EXAM.name, "sha256": sha(EXAM), "page": 1, "questionNumber": 4,
                "directVisualReview": True, "render": ".private-work/hw-expansion-20261023/hw4/source-review-q04/exam-1.png",
                "question": "한 시간에 25분씩 느려지는 시계를 오늘 오전 8시에 맞춘 뒤 내일 오후 7시를 가리킬 때 실제 시각"},
                "sourceAnswer": {"name": ANSWER.name, "driveId": SOURCE_ANSWER_ID, "sha256": sha(ANSWER), "page": 4,
                "questionNumber": 4, "directVisualReview": True,
                "render": ".private-work/hw-expansion-20261023/hw4/source-review-q04/answer-04.png",
                "observedHandwriting": {"actualTime": "모레 오후 8시", "actualElapsedHours": 60},
                "officialKeyStatus": "candidate annotated answer PDF; not identified as official answer key"},
                "originalCalculation": {"displayElapsedHours": 35, "clockAdvanceMinutesPerActualHour": 35,
                                        "actualElapsedHours": 35*60//35, "answer": "모레 오후 8시"},
                "variantCount": 9, "variants": proofs, "dataVersion": VERSION}
    (WORK / "q04-source-answer-review-r3.json").write_text(json.dumps(evidence, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"version": VERSION, "itemCount": len(data["items"]), "types": len(data["availableSourceNos"]),
                      "pending": data["pendingSourceNos"], "answers": [x["answer"] for x in variants],
                      "preservedPriorItemsSha256": prior_sha}, ensure_ascii=False))


if __name__ == "__main__":
    main()

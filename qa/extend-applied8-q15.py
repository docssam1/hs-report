#!/usr/bin/env python3
"""Add nine variants of Applied 8 Q15, reusing the original calendar crop unchanged."""
from __future__ import annotations

import calendar
import hashlib
import json
from datetime import date
from pathlib import Path

from PIL import Image
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw8"
EXAM = ROOT / "materials/초등과정 대비 실전 모의고사활용 8회.pdf"
ANSWER = WORK / "source-review/applied8-answer-drive-copy.pdf"
PAGE_RENDER = ROOT / ".private-work/hw-expansion-20261023/hw8/source-review/exam-page-3.png"
SOURCE_CROP = WORK / "q15-source-review/calendar-crop-candidate2.png"
ASSET = ROOT / "bank/assets/applied8/q15-calendar-original.png"
OUT = ROOT / "bank/data/applied8-expanded.json"
INDEX = ROOT / "bank/data/applied8-expanded-index.json"
REVIEW = WORK / "q15-source-review.json"
VERSION = "20261025-applied8-expansion-q13-q14-q15-q17-q18-q20-q21-q22-q23-r9"
REFERENCE = date(2019, 3, 1)
WEEKDAYS = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"]
TARGETS = [
    date(2020, 1, 1), date(2020, 2, 29), date(2020, 3, 17),
    date(2020, 4, 13), date(2020, 5, 31), date(2020, 6, 24),
    date(2020, 8, 15), date(2020, 10, 9), date(2020, 12, 31),
]


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def elapsed_expression(target: date) -> tuple[str, int]:
    # Count full months from March 2019 through the month before the target,
    # then add the days before the target date. Leap-year February is included.
    parts = []
    year, month = REFERENCE.year, REFERENCE.month
    while (year, month) < (target.year, target.month):
        parts.append(calendar.monthrange(year, month)[1])
        month += 1
        if month == 13:
            year += 1
            month = 1
    if target.day > 1:
        parts.append(target.day - 1)
    days = (target - REFERENCE).days
    assert sum(parts) == days
    return "+".join(str(x) for x in parts), days


def make_item(target: date, variant: int) -> dict:
    expression, days = elapsed_expression(target)
    weeks, remainder = divmod(days, 7)
    answer = WEEKDAYS[(REFERENCE.weekday() + remainder) % 7]
    target_month_days = calendar.monthrange(target.year, target.month)[1]
    assert 1 <= target.day <= target_month_days
    steps = [
        "그림에서 2019년 3월 1일은 금요일입니다. 2019년 3월 1일부터 2020년 1월 1일까지는 31+30+31+30+31+31+30+31+30+31=306일입니다.",
        f"2020년 1월 1일부터 {target.month}월 {target.day}일까지의 날짜 수를 더하면 전체 경과 일수는 {expression}={days}일입니다.",
        f"{days}=7×{weeks}+{remainder}이므로 기준일에서 {remainder}일 뒤입니다. 금요일에서 {remainder}일 뒤는 {answer}입니다.",
        f"따라서 2020년 {target.month}월 {target.day}일은 {answer}입니다.",
    ]
    return {
        "id": f"applied8-q15-v{variant}",
        "genId": "applied8-q15",
        "sourceSet": "applied",
        "sourceRound": 8,
        "sourceNo": 15,
        "variantNo": variant,
        "reviewStatus": "verified",
        "area": "수와 식",
        "subarea": "달력과 요일",
        "detailType": "기준 달력으로 다음 해의 날짜와 요일 구하기",
        "pointBand": "3.4",
        "text": f"아래 그림은 2019년 3월 달력의 일부입니다. 이를 기준으로 2020년 {target.month}월 {target.day}일은 무슨 요일인지 구하세요.",
        "asset": {
            "kind": "raster",
            "src": "assets/applied8/q15-calendar-original.png",
            "description": "활용 8회 원문 15번의 2019년 3월 달력 그림을 그대로 사용",
        },
        "answer": answer,
        "answerParts": [answer],
        "answerLabels": ["요일"],
        "acceptedAnswers": [answer],
        "answerContract": "single-number",
        "solutionSteps": steps,
        "solution": " ".join(steps),
        "learningPoint": "기준 날짜에서 목표 날짜까지의 경과 일수를 세고 7일 주기의 나머지로 요일을 찾기",
        "learningLocation": "활용 8회 · 원문 15번 · 달력 기준일과 윤년을 포함한 요일 계산",
        "verification": {
            "primaryMethod": "기준일에서 목표일까지 각 달의 실제 날짜 수를 합한 뒤 7로 나눈 나머지를 적용한다.",
            "independentMethod": "Gregorian 날짜 차로 목표 요일을 직접 계산한 뒤 기준 요일+나머지 요일 이동으로 대조한다.",
            "parameters": {
                "referenceDate": REFERENCE.isoformat(),
                "referenceWeekday": "금요일",
                "targetDate": target.isoformat(),
                "elapsedDays": days,
                "wholeWeeks": weeks,
                "remainderDays": remainder,
                "answerWeekday": answer,
            },
            "independentSuite": "qa/applied8-q15-independent-validate.py",
            "sourceExamPage": 3,
            "sourceExamFile": EXAM.name,
            "sourceAnswerPage": 3,
            "sourceDrawingCompared": True,
            "sourceDrawingPresent": True,
            "variantUsesSourceDrawing": True,
            "sourceDrawingAssetSha256": sha256(ASSET),
            "officialAnswerStatus": "The synced Drive file titled as the answer PDF is a blank exam duplicate; no marked official key was available. Source and variant weekdays were independently calculated.",
            "studentDifficultyMeasured": False,
        },
        "difficultyEvidence": {
            "basis": "source-point-band",
            "label": "중",
            "sourceReasoningPreserved": True,
            "measuredVariantRate": None,
            "estimated": False,
            "rationale": "활용 8회 원문 15번은 13~22번의 3.4점 배점대다. 활용 난도는 배점대만 적용한다.",
        },
    }


def main() -> None:
    if not all(p.is_file() for p in (EXAM, ANSWER, PAGE_RENDER, SOURCE_CROP, ASSET)):
        raise SystemExit("The source PDFs, rendered page, or original drawing crop are missing.")
    exam_text = PdfReader(str(EXAM)).pages[2].extract_text()
    answer_text = PdfReader(str(ANSWER)).pages[2].extract_text()
    compact_text = "".join(exam_text.split())
    if not all(term in compact_text for term in ("아래그림은", "2019", "2020", "달력의일부분", "무슨요일")) or answer_text != exam_text:
        raise SystemExit("Exact source Q15 or the answer-copy comparison did not match page 3.")
    src = Image.open(PAGE_RENDER).convert("RGB")
    expected_crop = src.crop((1330, 2600, 2150, 3035))
    supplied_crop = Image.open(ASSET).convert("RGB")
    if expected_crop.size != supplied_crop.size or expected_crop.tobytes() != supplied_crop.tobytes():
        raise SystemExit("The reused source drawing is not an exact pixel crop of source page 3.")
    if Image.open(SOURCE_CROP).convert("RGB").tobytes() != supplied_crop.tobytes():
        raise SystemExit("The reviewed crop candidate differs from the bank asset.")

    data = json.loads(OUT.read_text())
    index = json.loads(INDEX.read_text())
    if any(item["sourceNo"] == 15 for item in data["items"]):
        raise SystemExit("Q15 already exists in the bank; refusing to duplicate or overwrite it.")
    items = [make_item(target, i + 1) for i, target in enumerate(TARGETS)]
    data["version"] = VERSION
    data["items"].extend(items)
    data["itemCount"] = len(data["items"])
    data["availableSourceNos"] = sorted(set(data["availableSourceNos"] + [15]))
    data["pendingSourceNos"] = [n for n in range(1, 31) if n not in data["availableSourceNos"]]
    index["version"] = VERSION
    index["itemCount"] = len(data["items"])
    index["pendingSourceNos"] = data["pendingSourceNos"]
    index["items"].append({
        "sourceNo": 15,
        "genId": "applied8-q15",
        "area": "수와 식",
        "subarea": "달력과 요일",
        "detailType": "기준 달력으로 다음 해의 날짜와 요일 구하기",
        "pointBand": "3.4",
        "reviewStatus": "verified",
        "variantCount": 9,
    })
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    INDEX.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")

    original_elapsed = (date(2020, 4, 1) - REFERENCE).days
    original_weekday = WEEKDAYS[(REFERENCE.weekday() + original_elapsed % 7) % 7]
    assert original_elapsed == 397 and original_weekday == "수요일"
    review = {
        "sourceExam": {
            "file": EXAM.name,
            "sha256": sha256(EXAM),
            "page": 3,
            "questionNo": 15,
            "directVisualReview": True,
            "prompt": "2019년 3월 달력 일부를 기준으로 2020년 4월 1일의 요일을 묻는다.",
            "calendarImageCrop": {
                "sourcePageRender": str(PAGE_RENDER.relative_to(ROOT)),
                "sourcePageRenderSha256": sha256(PAGE_RENDER),
                "cropCoordinatesPx": [1330, 2600, 2150, 3035],
                "asset": str(ASSET.relative_to(ROOT)),
                "assetSha256": sha256(ASSET),
                "assetDimensionsPx": list(Image.open(ASSET).size),
                "pixelExactCropVerified": True,
            },
        },
        "answerCandidates": [{
            "file": ANSWER.name,
            "sha256": sha256(ANSWER),
            "page": 3,
            "directVisualReview": True,
            "containsAnswers": False,
            "comparison": "Page 3 has the same blank calendar problem and no marked answer; extracted text equals source exam page 3.",
        }],
        "sourceIndependentSolution": {
            "referenceDate": REFERENCE.isoformat(),
            "referenceWeekday": "금요일",
            "targetDate": "2020-04-01",
            "elapsedDays": original_elapsed,
            "weeksAndRemainder": "397=7×56+5",
            "answer": original_weekday,
            "check": "Friday plus five days is Wednesday.",
        },
        "answerSourceConclusion": "The synced Drive file titled as Applied 8 answer PDF is a blank exam duplicate, not an answer key. Q15's source answer was independently calculated; official answer-key comparison remains unavailable.",
        "variantCount": len(items),
        "variantTargets": [x.isoformat() for x in TARGETS],
        "variantsIndependentlyCalculated": True,
        "sourceDrawingReusedPixelExact": True,
        "newSourceTypes": 0,
        "difficulty": "3.4-point band only = middle",
        "examSha256": sha256(EXAM),
        "answerCandidateSha256": sha256(ANSWER),
    }
    REVIEW.write_text(json.dumps(review, ensure_ascii=False, indent=2) + "\n")
    print(f"Wrote Q15 variants; preserved earlier items and now have {len(data['items'])} items across {len(data['availableSourceNos'])} source types.")


if __name__ == "__main__":
    main()

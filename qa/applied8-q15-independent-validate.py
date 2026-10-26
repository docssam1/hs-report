#!/usr/bin/env python3
"""Independent source, pixel-exact image, calendar and index validation for Applied 8 Q15."""
import calendar
import json
from datetime import date, timedelta
from pathlib import Path
from PIL import Image
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
EXAM = ROOT / "materials/초등과정 대비 실전 모의고사활용 8회.pdf"
ANSWER = ROOT / ".private-work/hw-expansion-20261023/hw8/source-review/applied8-answer-drive-copy.pdf"
PAGE = ROOT / ".private-work/hw-expansion-20261023/hw8/source-review/exam-page-3.png"
ASSET = ROOT / "bank/assets/applied8/q15-calendar-original.png"
DATA = json.loads((ROOT / "bank/data/applied8-expanded.json").read_text())
INDEX = json.loads((ROOT / "bank/data/applied8-expanded-index.json").read_text())
REVIEW = json.loads((ROOT / ".private-work/hw-expansion-20261023/hw8/q15-source-review.json").read_text())
ITEMS = [x for x in DATA["items"] if x["sourceNo"] == 15]
WEEKDAYS = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"]
REFERENCE = date(2019, 3, 1)
TARGETS = [
    date(2020, 1, 1), date(2020, 2, 29), date(2020, 3, 17),
    date(2020, 4, 13), date(2020, 5, 31), date(2020, 6, 24),
    date(2020, 8, 15), date(2020, 10, 9), date(2020, 12, 31),
]

exam_text = PdfReader(str(EXAM)).pages[2].extract_text()
answer_text = PdfReader(str(ANSWER)).pages[2].extract_text()
compact_text = "".join(exam_text.split())
assert all(term in compact_text for term in ("아래그림은", "2019", "2020", "달력의일부분", "무슨요일"))
assert answer_text == exam_text
assert len(ITEMS) == 9 and [x["variantNo"] for x in ITEMS] == list(range(1, 10))
assert [date.fromisoformat(x["verification"]["parameters"]["targetDate"]) for x in ITEMS] == TARGETS
expected_nos = [1,2,3,4,5,6,7,8,9,10,12,13,14,15,17,18,20,21,22,23,24,25,26,27,28,29,30]
assert DATA["itemCount"] == INDEX["itemCount"] == 243
assert DATA["availableSourceNos"] == expected_nos
assert DATA["pendingSourceNos"] == [n for n in range(1, 31) if n not in expected_nos]
assert [x["sourceNo"] for x in INDEX["items"]] == expected_nos

# Compare the published asset against the exact measured crop from the source page render.
source_page = Image.open(PAGE).convert("RGB")
pixels = source_page.crop((1330, 2600, 2150, 3035))
bank_image = Image.open(ASSET).convert("RGB")
assert pixels.size == bank_image.size and pixels.tobytes() == bank_image.tobytes()
assert REVIEW["sourceExam"]["calendarImageCrop"]["pixelExactCropVerified"] is True

# Two separate computations: Gregorian date delta and weekday-index arithmetic.
for target, item in zip(TARGETS, ITEMS):
    elapsed = (target - REFERENCE).days
    weeks, remainder = divmod(elapsed, 7)
    direct_date_answer = WEEKDAYS[target.weekday()]
    modular_answer = WEEKDAYS[(REFERENCE.weekday() + remainder) % 7]
    params = item["verification"]["parameters"]
    assert params == {
        "referenceDate": "2019-03-01",
        "referenceWeekday": "금요일",
        "targetDate": target.isoformat(),
        "elapsedDays": elapsed,
        "wholeWeeks": weeks,
        "remainderDays": remainder,
        "answerWeekday": direct_date_answer,
    }
    assert direct_date_answer == modular_answer == item["answer"] == item["answerParts"][0]
    assert item["answerContract"] == "single-number" and item["answerLabels"] == ["요일"]
    assert item["asset"]["src"] == "assets/applied8/q15-calendar-original.png"
    assert item["verification"]["sourceDrawingCompared"] is True
    assert item["verification"]["variantUsesSourceDrawing"] is True
    assert item["pointBand"] == "3.4" and item["difficultyEvidence"]["label"] == "중"
    assert item["reviewStatus"] == "verified" and len(item["solutionSteps"]) == 4
    assert str(elapsed) in item["solutionSteps"][1]
    assert f"7×{weeks}+{remainder}" in item["solutionSteps"][2]

original_elapsed = (date(2020, 4, 1) - REFERENCE).days
assert original_elapsed == 397
assert WEEKDAYS[(REFERENCE.weekday() + original_elapsed % 7) % 7] == "수요일"
assert REVIEW["sourceIndependentSolution"]["answer"] == "수요일"
assert all(x["sourceNo"] != 15 for x in DATA["items"] if x not in ITEMS)
print("PASS Applied8 Q15: exact source question and calendar crop, blank answer copy, original answer Wednesday, nine unique target dates and weekday calculations, middle difficulty, and current 243-item r27 catalog index.")

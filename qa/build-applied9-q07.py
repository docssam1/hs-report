#!/usr/bin/env python3
"""Add nine calendar-date variants using the unchanged source calendar crop."""
import calendar
import datetime as dt
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "bank/data/applied9-expanded.json"
INDEX = ROOT / "bank/data/applied9-expanded-index.json"
SOURCE = ROOT / "materials/초등과정 대비 실전 모의고사 활용 9회.pdf"
ASSET = ROOT / "bank/assets/applied9/q07-calendar-original-crop.png"
SOURCE_HASH = "0e32749d028cdcacd9e61d2b1d1cb5080266ac672a9a3ed17503270a74142794"
ANSWER_HASH = "a6648f008a8e7ba7012913ede0cbad488aec782eaa06818a97acfb6900ac8d62"
ANSWER_DRIVE_ID = "1M7rJHVE11w4BZF5OHjZegDLcGGlmxKp4"
ASSET_HASH = "aa09bead8e032132c534731851d13dd77b8b12be220932d8e9464354e4757cdd"
VERSION = "20261025-applied9-q02-q06-q07-q10-q11-q13-q17-q19-q21-q27-q29-q30-r8"
DATES = [(2, 5), (3, 15), (4, 20), (5, 5), (6, 12), (7, 19), (8, 24), (9, 9), (10, 31)]
WEEKDAYS = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"]


def q7():
    assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == SOURCE_HASH
    assert hashlib.sha256(ASSET.read_bytes()).hexdigest() == ASSET_HASH
    out = []
    offsets = []
    for i, (month, day) in enumerate(DATES, 1):
        date = dt.date(2021, month, day)
        answer = WEEKDAYS[date.weekday()]
        offset = sum(calendar.monthrange(2021, m)[1] for m in range(1, month)) + day - 1
        jan_first = WEEKDAYS[dt.date(2021, 1, 1).weekday()]
        assert WEEKDAYS[(4 + offset) % 7] == answer  # 2021-01-01 was Friday (index 4).
        offsets.append(offset)
        text = f"2021년 1월 달력은 아래와 같습니다. 2021년 {month}월 {day}일은 무슨 요일입니까?"
        steps = [
            f"달력에서 2021년 1월 1일은 금요일입니다.",
            f"2021년 1월 1일부터 {month}월 {day}일까지 날짜가 넘어가는 수는 {offset}일입니다.",
            f"{offset}일을 7씩 묶어 나머지를 구하면 {offset}÷7의 나머지는 {offset % 7}입니다.",
            f"금요일에서 {offset % 7}일 뒤의 요일은 {answer}입니다.",
        ]
        out.append({
            "id": f"applied9-q07-v{i}", "genId": "applied9-q07",
            "sourceSet": "applied", "sourceRound": 9, "sourceNo": 7,
            "variantNo": i, "reviewStatus": "verified", "area": "지문 이해",
            "subarea": "달력과 요일 추론",
            "detailType": "한 달의 달력으로 같은 해 다른 날짜의 요일 찾기",
            "pointBand": "2.7", "text": text, "answer": answer,
            "answerParts": [answer], "answerLabels": ["요일"],
            "acceptedAnswers": [answer], "answerContract": "single-number",
            "asset": {"kind": "raster", "src": "assets/applied9/q07-calendar-original-crop.png",
                      "description": "활용9 원문 7번의 2021년 1월 달력 그림(원본 그대로)"},
            "solutionSteps": steps, "solution": " ".join(steps),
            "learningPoint": "달력에서 기준 날짜의 요일을 읽고 지난 날짜 수를 7로 나누어 목표 요일 구하기",
            "learningLocation": "활용 9회 · 원문 7번 · 달력과 요일 추론",
            "verification": {
                "primaryMethod": "2021년 1월 달력에서 1월 1일 금요일을 읽고 월별 날짜를 누적해 목표 날짜의 요일을 계산한다.",
                "independentMethod": "별도 그레고리력 날짜 계산으로 같은 날짜의 요일을 재확인한다.",
                "parameters": {"year": 2021, "month": month, "day": day,
                                "daysAfterJanuaryFirst": offset, "answerWeekday": answer,
                                "janFirstWeekday": jan_first},
                "independentSuite": "qa/applied9-q07-independent-validate.py",
                "sourceExamPage": 2,
                "sourceExamFile": "초등과정 대비 실전 모의고사 활용 9회.pdf",
                "sourceExamSha256": SOURCE_HASH,
                "sourceAnswerPage": 2,
                "sourceAnswerFile": "초등과정 대비 실전 모의고사 특강 9회 답안.pdf",
                "sourceAnswerDriveId": ANSWER_DRIVE_ID,
                "sourceAnswerSha256": ANSWER_HASH,
                "officialAnswerStatus": "Source prints 2021 and shows the January 2021 calendar. Candidate answer page 2 has a handwritten 2023 correction and Thursday for May 5; this conflicts with the printed source. Original source conditions and scoring are unchanged; variants follow 2021.",
                "sourceDrawingCompared": True, "sourceDrawingPresent": True,
                "sourceDrawingAssetSha256": ASSET_HASH,
                "variantUsesSourceDrawing": True,
                "variantDrawingModified": False,
                "studentDifficultyMeasured": False,
            },
            "difficultyEvidence": {
                "basis": "source-point-band", "label": "하",
                "sourceReasoningPreserved": True, "measuredVariantRate": None,
                "estimated": False,
                "rationale": "활용 9회 원문 1~12번의 2.7점 배점대다. 활용 난도는 배점대만 적용한다.",
            },
        })
    assert len(out) == 9 and out[3]["answer"] == "수요일"
    return out, offsets


def main():
    data, offsets = json.loads(DATA.read_text()), None
    index = json.loads(INDEX.read_text())
    variants, offsets = q7()
    items = [x for x in data["items"] if x["sourceNo"] != 7] + variants
    items.sort(key=lambda x: (x["sourceNo"], x["variantNo"]))
    available = sorted({x["sourceNo"] for x in items})
    pending = [n for n in range(1, 31) if n not in available]
    data.update(version=VERSION, items=items, itemCount=len(items),
                availableSourceNos=available, pendingSourceNos=pending)
    data["sourceReview"].setdefault("questionReviews", {})["7"] = {
        "sourcePrintedYear": 2021, "sourceFigureYear": 2021,
        "candidateHandwrittenYear": 2023, "candidateHandwrittenAnswer": "목요일",
        "independentSourceAnswer": "수요일", "status": "candidate-discrepancy; source text and figure agree on 2021; original unchanged"}
    index.update(version=VERSION, itemCount=len(items), availableSourceNos=available,
                 pendingSourceNos=pending)
    index["items"] = [x for x in index["items"] if x["sourceNo"] != 7]
    q = variants[0]
    index["items"].append({"sourceNo": 7, "genId": "applied9-q07", "area": q["area"],
                           "subarea": q["subarea"], "detailType": q["detailType"],
                           "pointBand": "2.7", "reviewStatus": "verified", "variantCount": 9})
    index["items"].sort(key=lambda x: x["sourceNo"])
    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    INDEX.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")
    print(f"Built Applied9 Q07: +9 calendar variants using exact original crop; total {len(items)}; pending {pending}; offsets {offsets}.")


if __name__ == "__main__":
    main()

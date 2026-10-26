#!/usr/bin/env python3
"""Extend Applied 9 with text-only variants for source Q29 and Q30."""
import json
import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "bank/data/applied9-expanded.json"
INDEX = ROOT / "bank/data/applied9-expanded-index.json"
SOURCE = ROOT / "materials/초등과정 대비 실전 모의고사 활용 9회.pdf"
SOURCE_HASH = "0e32749d028cdcacd9e61d2b1d1cb5080266ac672a9a3ed17503270a74142794"
ANSWER_HASH = "a6648f008a8e7ba7012913ede0cbad488aec782eaa06818a97acfb6900ac8d62"
ANSWER_DRIVE_ID = "1M7rJHVE11w4BZF5OHjZegDLcGGlmxKp4"
VERSION = "20261025-applied9-q02-q06-q07-q10-q11-q13-q17-q19-q21-q27-q29-q30-r8"
TARGET_ANGLES = [102, 111, 120, 129, 138, 147, 156, 165, 174]


def record(no, variant, area, subarea, detail, point, text, answer, parts,
           labels, contract, steps, params, method):
    return {
        "id": f"applied9-q{no:02}-v{variant}",
        "genId": f"applied9-q{no:02}",
        "sourceSet": "applied", "sourceRound": 9, "sourceNo": no,
        "variantNo": variant, "reviewStatus": "verified", "area": area,
        "subarea": subarea, "detailType": detail, "pointBand": "4.2",
        "text": text, "answer": str(answer), "answerParts": parts,
        "answerLabels": labels, "acceptedAnswers": [str(answer)],
        "answerContract": contract, "solutionSteps": steps,
        "solution": " ".join(steps),
        "learningPoint": {
            29: "같은 숫자가 반복된 수의 곱을 계산하고 결과의 각 자리 숫자를 빠짐없이 더하기",
            30: "시침과 분침의 상대 각속도로 시작 시각과 목표 각도에 처음 도달하는 시각 구하기",
        }[no],
        "learningLocation": f"활용 9회 · 원문 {no}번 · {detail}",
        "verification": {
            "primaryMethod": method,
            "independentMethod": "별도 정수 계산 또는 각도 방정식과 시간 범위를 사용해 원 조건의 유일성을 다시 확인한다.",
            "parameters": params,
            "independentSuite": "qa/applied9-q29-q30-independent-validate.py",
            "sourceExamPage": 6,
            "sourceExamFile": "초등과정 대비 실전 모의고사 활용 9회.pdf",
            "sourceExamSha256": SOURCE_HASH,
            "sourceAnswerPage": 6,
            "sourceAnswerFile": "초등과정 대비 실전 모의고사 특강 9회 답안.pdf",
            "sourceAnswerDriveId": ANSWER_DRIVE_ID,
            "sourceAnswerSha256": ANSWER_HASH,
            "officialAnswerStatus": (
                "Candidate answer page 6 writes digit sum 90 for source Q29; exact edition identity beyond the matching page is unconfirmed."
                if no == 29 else
                "Candidate answer page 6 gives 9:32 8/11 minutes and 10:20 8/11 minutes; independently derived from the printed angle conditions. Exact edition identity beyond the matching page is unconfirmed."
            ),
            "sourceDrawingCompared": False, "sourceDrawingPresent": False,
            "variantUsesSourceDrawing": False, "studentDifficultyMeasured": False,
        },
        "difficultyEvidence": {
            "basis": "source-point-band", "label": "상",
            "sourceReasoningPreserved": True, "measuredVariantRate": None,
            "estimated": False,
            "rationale": "활용 9회 원문 23~30번의 4.2점 배점대다. 활용 난도는 배점대만 적용한다.",
        },
    }


def q29():
    out = []
    for i, digit in enumerate(range(1, 10), 1):
        number = int(str(digit) * 10)
        product = number * number
        digit_sum = sum(map(int, str(product)))
        assert len(str(number)) == 10 and len(str(product)) >= 19
        steps = [
            f"열 자리 모두 {digit}인 수는 {number:,}입니다.",
            f"곱을 계산하면 {number}×{number}={product}입니다.",
            f"곱의 각 자리 숫자를 더하면 {'+'.join(str(x) for x in map(int, str(product)))}={digit_sum}입니다.",
            f"따라서 구하는 합은 {digit_sum}입니다.",
        ]
        text = (f"두 개의 10자리 수 {str(digit) * 10}과 {str(digit) * 10}을 곱했습니다. "
                "곱의 각 자리 숫자를 모두 더하면 얼마입니까?")
        out.append(record(29, i, "수와 식", "큰 수의 곱셈과 자릿값",
                          "같은 숫자가 반복된 두 수의 곱에서 각 자리 숫자의 합", "4.2",
                          text, digit_sum, [digit_sum], ["각 자리 숫자의 합"],
                          "single-number", steps,
                          {"repeatedDigit": digit, "repeatCount": 10,
                           "number": str(number), "product": str(product),
                           "digitSum": digit_sum},
                          "열 자리 반복 숫자를 정수로 곱하고 곱의 모든 십진 자릿수를 더한다."))
    return out


def mixed_minute(numerator):
    whole, rem = divmod(numerator, 11)
    return f"{whole} {rem}/11분" if rem else f"{whole}분"


def clock_time(total_minutes_num):
    # Input is the numerator of elapsed minutes after 9:00, with denominator 11.
    hour_offset, minute_num = divmod(total_minutes_num, 60 * 11)
    minute_whole, rem = divmod(minute_num, 11)
    hour = 9 + hour_offset
    minute = f"{minute_whole} {rem}/11분" if rem else f"{minute_whole}분"
    return f"{hour}시 {minute}", hour, minute_whole, rem


def q30():
    out = []
    for i, target in enumerate(TARGET_ANGLES, 1):
        start_num = 360  # minutes after 9:00 are in elevenths
        elapsed_num = 2 * (target + 90)
        end_num = start_num + elapsed_num
        start = "9시 32 8/11분"
        end, end_hour, end_minute, end_rem = clock_time(end_num)
        assert start_num == 360 and target > 90 and target < 180
        assert end_num == 2 * target + 540
        text = (
            "진수는 일요일 아침 축구를 할 때 시계를 보니 9시와 10시 사이에 시침과 분침이 직각을 이루고 있었습니다. "
            f"축구를 한 뒤 시침과 분침이 처음으로 {target}°가 되었을 때 그만했습니다. "
            "진수가 축구를 시작한 시각과 마친 시각을 모두 구하시오."
        )
        steps = [
            "9시부터 t분 뒤의 분침과 시침의 방향 차이를 분침 각도에서 시침 각도를 빼어 나타내면 5.5t−270°입니다.",
            "9시와 10시 사이에서 두 바늘이 직각인 때는 5.5t−270°=−90°를 만족하는 t=360/11분, 즉 9시 32 8/11분입니다. 다른 부호인 +90°는 10시 이후입니다.",
            f"시작할 때 방향 차이는 −90°이고, 이후 분당 5.5°씩 증가합니다. {target}°가 되는 데 걸리는 시간은 ({target}+90)÷5.5={mixed_minute(elapsed_num)}입니다.",
            f"따라서 시작 시각은 {start}, 마친 시각은 {end}입니다. 이보다 먼저 시작 뒤에 {target}°가 되는 때는 없습니다.",
        ]
        out.append(record(30, i, "도형", "시계의 각도와 시간",
                          "시침과 분침의 상대 각속도로 시작·종료 시각 구하기", "4.2",
                          text, f"{start}, {end}", [start, end],
                          ["축구를 시작한 시각", "축구를 마친 시각"],
                          "ordered-parts", steps,
                          {"targetAngle": target, "startElapsedMinuteNumerator": start_num,
                           "startElapsedMinuteDenominator": 11,
                           "relativeSpeedDegreesPerMinute": "5.5",
                           "stopElapsedMinuteNumerator": elapsed_num,
                           "stopElapsedMinuteDenominator": 11,
                           "endElapsedMinuteNumerator": end_num,
                           "endElapsedMinuteDenominator": 11,
                           "endHour": end_hour, "endMinuteWhole": end_minute,
                           "endMinuteNumerator": end_rem, "startTime": start,
                           "endTime": end},
                          "시침·분침의 상대 각속도 5.5°/분과 시간 구간을 방정식으로 풀고, 종료 각도에 처음 도달하는 시각을 구한다."))
    return out


def main():
    assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == SOURCE_HASH
    data = json.loads(DATA.read_text())
    idx = json.loads(INDEX.read_text())
    additions = q29() + q30()
    items = [x for x in data["items"] if x["sourceNo"] not in (29, 30)] + additions
    items.sort(key=lambda x: (x["sourceNo"], x["variantNo"]))
    available = sorted({x["sourceNo"] for x in items})
    pending = [n for n in range(1, 31) if n not in available]
    data.update(version=VERSION, items=items, itemCount=len(items),
                availableSourceNos=available, pendingSourceNos=pending)
    data["sourceReview"].setdefault("questionReviews", {})["29"] = {
        "candidateAnswer": 90, "independentAnswer": 90,
        "status": "matched; candidate edition identity beyond page 6 unconfirmed"}
    data["sourceReview"]["questionReviews"]["30"] = {
        "candidateStart": "9시 32 8/11분", "candidateEnd": "10시 20 8/11분",
        "independentStart": "9시 32 8/11분", "independentEnd": "10시 20 8/11분",
        "status": "matched; candidate edition identity beyond page 6 unconfirmed"}
    idx.update(version=VERSION, itemCount=len(items), availableSourceNos=available,
               pendingSourceNos=pending)
    idx["items"] = [x for x in idx["items"] if x["sourceNo"] not in (29, 30)]
    for no in (29, 30):
        q = next(x for x in additions if x["sourceNo"] == no)
        idx["items"].append({"sourceNo": no, "genId": f"applied9-q{no:02}",
                             "area": q["area"], "subarea": q["subarea"],
                             "detailType": q["detailType"], "pointBand": "4.2",
                             "reviewStatus": "verified", "variantCount": 9})
    idx["items"].sort(key=lambda x: x["sourceNo"])
    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    INDEX.write_text(json.dumps(idx, ensure_ascii=False, indent=2) + "\n")
    print(f"Built Applied9 Q29/Q30: +18 variants; total {len(items)}; pending {pending}.")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Build the reviewed, text-only Applied 9 Q2 variants from explicit parameters."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PARAMS = [(1, 90), (2, 45), (3, 72), (4, 54), (5, 45), (6, 36), (7, 27), (8, 18), (7, 90)]
CLOCK_ELAPSED = [300, 435, 570, 705, 840, 975, 1110, 1245, 1290]
SOURCE_HASH = "0e32749d028cdcacd9e61d2b1d1cb5080266ac672a9a3ed17503270a74142794"
ANSWER_HASH = "a6648f008a8e7ba7012913ede0cbad488aec782eaa06818a97acfb6900ac8d62"
ANSWER_DRIVE_ID = "1M7rJHVE11w4BZF5OHjZegDLcGGlmxKp4"


def make_item(i, digit, delta):
    x = 11 * digit + delta // 9
    prefixed, suffixed = 100 * digit + x, 10 * x + digit
    assert delta % 9 == 0 and 10 <= x <= 99
    assert suffixed - prefixed == delta
    text = (f"어떤 두 자리 수의 앞에 {digit}을 붙여 만든 세 자리 수는 "
            f"뒤에 {digit}을 붙여 만든 세 자리 수보다 {delta}만큼 작습니다. "
            "어떤 두 자리 수입니까?")
    steps = [
        f"구하려는 두 자리 수를 □라고 두면, 앞에 {digit}을 붙인 수는 {100*digit}+□이고 뒤에 붙인 수는 10×□+{digit}입니다.",
        f"뒤에 붙인 수가 앞에 붙인 수보다 {delta}만큼 크므로 (10×□+{digit})−({100*digit}+□)={delta}입니다.",
        f"정리하면 9×□−{99*digit}={delta}, 따라서 9×□={delta+99*digit}이고 □={delta+99*digit}÷9={x}입니다.",
        f"확인하면 {x}{digit}−{digit}{x}={suffixed}−{prefixed}={delta}입니다. 조건에 맞으므로 답은 {x}입니다.",
    ]
    return {
        "id": f"applied9-q02-v{i}", "genId": "applied9-q02", "sourceSet": "applied",
        "sourceRound": 9, "sourceNo": 2, "variantNo": i, "reviewStatus": "verified",
        "area": "수와 식", "subarea": "자릿값과 수의 관계",
        "detailType": "같은 숫자를 앞뒤에 붙인 수의 차로 원래 두 자리 수 찾기",
        "pointBand": "2.7", "text": text, "answer": str(x), "answerParts": [x],
        "answerLabels": ["원래 두 자리 수"], "acceptedAnswers": [str(x), f"{x}"],
        "answerContract": "single-number", "solutionSteps": steps, "solution": " ".join(steps),
        "learningPoint": "숫자를 앞이나 뒤에 붙였을 때 각 자리의 값이 어떻게 달라지는지 식으로 나타내기",
        "learningLocation": "활용 9회 · 원문 2번 · 자릿값과 수의 관계",
        "verification": {
            "primaryMethod": "두 자리 수를 x로 두고 접두 수와 접미 수를 각각 자리값 식으로 나타내 차를 푼다.",
            "independentMethod": "생성한 답으로 두 세 자리 수를 직접 만들고 차를 계산해 조건을 재확인한다.",
            "parameters": {"attachedDigit": digit, "difference": delta, "answer": x,
                           "prefixNumber": prefixed, "suffixNumber": suffixed},
            "independentSuite": "qa/build-applied9-q02-q06.py",
            "sourceExamPage": 1, "sourceExamFile": "초등과정 대비 실전 모의고사 활용 9회.pdf",
            "sourceExamSha256": SOURCE_HASH, "sourceAnswerPage": 1,
            "sourceAnswerFile": "초등과정 대비 실전 모의고사 특강 9회 답안.pdf",
            "sourceAnswerDriveId": ANSWER_DRIVE_ID, "sourceAnswerSha256": ANSWER_HASH,
            "officialAnswerStatus": "Candidate answer PDF is titled 특강 9회 답안; its page 1 title, question sequence, wording, and layout were visually matched to 활용 9회 source page 1. Handwritten answer 98 matches independent calculation. Exact edition identity beyond the matching page has not been confirmed.",
            "sourceDrawingCompared": False, "sourceDrawingPresent": False,
            "variantUsesSourceDrawing": False, "studentDifficultyMeasured": False,
        },
        "difficultyEvidence": {"basis": "source-point-band", "label": "하",
            "sourceReasoningPreserved": True, "measuredVariantRate": None, "estimated": False,
            "rationale": "활용 9회 원문 2번은 1~12번의 2.7점 배점대다. 활용 난도는 배점대만 적용한다."},
    }


def clock_time(minutes):
    h, minute = divmod(minutes % 1440, 60)
    part = "오전" if h < 12 else "오후"
    h12 = h % 12 or 12
    return part, h12, minute


def make_clock_item(i, shown_elapsed):
    actual_elapsed = shown_elapsed * 4 // 5
    assert shown_elapsed % 5 == 0 and (shown_elapsed * 4) % 5 == 0
    shown = clock_time(60 + shown_elapsed)  # the clock was set at 01:00
    actual = clock_time(60 + actual_elapsed)
    assert (actual_elapsed * 5) // 4 == shown_elapsed
    shown_text = f"{shown[0]} {shown[1]}시" + (f" {shown[2]}분" if shown[2] else "")
    actual_text = f"{actual[0]} {actual[1]}시 {actual[2]}분"
    display_hours, display_minutes = divmod(shown_elapsed, 60)
    steps = [
        f"시계를 맞춘 오전 1시부터 {shown_text}까지 시계 표시로 흐른 시간은 {display_hours}시간" + (f" {display_minutes}분" if display_minutes else "") + "입니다.",
        "이 시계는 실제로 1시간이 지날 때마다 표시 시간이 1시간 15분씩 흐릅니다.",
        f"따라서 실제 경과 시간은 표시 경과 시간의 60/75, 즉 4/5입니다. {display_hours}시간" + (f" {display_minutes}분" if display_minutes else "") + f"의 4/5는 {actual_elapsed // 60}시간 {actual_elapsed % 60}분입니다.",
        f"실제 시각은 오전 1시에서 {actual_elapsed // 60}시간 {actual_elapsed % 60}분 지난 {actual_text}입니다. 확인하면 이 시간 동안 시계 표시는 {shown_elapsed // 60}시간 {shown_elapsed % 60}분 흘러 {shown_text}를 가리킵니다.",
    ]
    return {
        "id": f"applied9-q06-v{i}", "genId": "applied9-q06", "sourceSet": "applied",
        "sourceRound": 9, "sourceNo": 6, "variantNo": i, "reviewStatus": "verified",
        "area": "수와 식", "subarea": "시간과 비례 관계",
        "detailType": "일정한 속도로 빨라지는 시계의 표시 시각에서 실제 시각 구하기",
        "pointBand": "2.7",
        "text": f"한 시계는 실제로 한 시간이 지날 때마다 15분씩 빠르게 갑니다. 오늘 오전 1시에 정확히 맞춘 뒤, 이 시계가 오늘 {shown_text}을 가리킬 때 실제 시각은 몇 시 몇 분입니까? 오전/오후도 함께 쓰세요.",
        "answer": actual_text, "answerParts": [actual[0], actual[1], actual[2]],
        "answerLabels": ["오전/오후", "시", "분"], "acceptedAnswers": [actual_text],
        "answerContract": "ordered-parts", "solutionSteps": steps, "solution": " ".join(steps),
        "learningPoint": "시계가 빨라진 양을 표시 시간의 증가율로 바꾸고, 표시 경과 시간과 실제 경과 시간의 비를 세우기",
        "learningLocation": "활용 9회 · 원문 6번 · 빠르게 가는 시계의 표시 시간과 실제 시간",
        "verification": {
            "primaryMethod": "실제로 60분이 흐를 때 시계 표시는 75분 흐르므로 실제 경과 시간은 표시 경과 시간의 4/5이다.",
            "independentMethod": "구한 실제 경과 시간에 5/4를 곱해 시계 표시 경과 시간을 복원하고 표시 시각과 대조한다.",
            "parameters": {"shownElapsedMinutes": shown_elapsed, "actualElapsedMinutes": actual_elapsed,
                           "shownTime": shown_text, "actualTime": actual_text,
                           "clockAdvancePerActualHour": 75},
            "independentSuite": "qa/build-applied9-q02-q06.py",
            "sourceExamPage": 1, "sourceExamFile": "초등과정 대비 실전 모의고사 활용 9회.pdf",
            "sourceExamSha256": SOURCE_HASH, "sourceAnswerPage": 1,
            "sourceAnswerFile": "초등과정 대비 실전 모의고사 특강 9회 답안.pdf",
            "sourceAnswerDriveId": ANSWER_DRIVE_ID, "sourceAnswerSha256": ANSWER_HASH,
            "officialAnswerStatus": "Candidate answer PDF page 1 visually matches the Applied 9 source page; handwritten original answer is 오후 5시 48분, independently reproduced. Exact edition identity beyond the matching page is not confirmed.",
            "sourceDrawingCompared": False, "sourceDrawingPresent": False,
            "variantUsesSourceDrawing": False, "studentDifficultyMeasured": False,
        },
        "difficultyEvidence": {"basis": "source-point-band", "label": "하",
            "sourceReasoningPreserved": True, "measuredVariantRate": None, "estimated": False,
            "rationale": "활용 9회 원문 6번은 1~12번의 2.7점 배점대다. 활용 난도는 배점대만 적용한다."},
    }


def main():
    answers = [11*d + delta//9 for d, delta in PARAMS]
    assert len(set(answers)) == len(answers) == 9
    items = ([make_item(i, d, delta) for i, (d, delta) in enumerate(PARAMS, 1)] +
             [make_clock_item(i, elapsed) for i, elapsed in enumerate(CLOCK_ELAPSED, 1)])
    data = {"version": "20261025-applied9-q02-q06-r1", "sourceSet": "applied", "sourceRound": 9,
            "itemCount": len(items), "availableSourceNos": [2, 6],
            "pendingSourceNos": [n for n in range(1,31) if n not in (2, 6)],
            "policy": {"targetVariantsPerSource": 9, "difficultyBasis": "source-point-band", "newSourceTypes": 0},
            "sourceReview": {"sourceFile": "초등과정 대비 실전 모의고사 활용 9회.pdf", "sourceSha256": SOURCE_HASH,
                "sourcePage": 1, "answerCandidateFile": "초등과정 대비 실전 모의고사 특강 9회 답안.pdf",
                "answerCandidateDriveId": ANSWER_DRIVE_ID, "answerCandidateSha256": ANSWER_HASH,
                "editionMatch": "page 1 title, question sequence, wording and layout visually match; answer file title differs.",
                "questionReviews": {"2": {"answer": 98, "parameters": {"digit": 7, "difference": 189}},
                                    "6": {"answer": "오후 5시 48분", "displayElapsedMinutes": 1260, "actualElapsedMinutes": 1008}},
                "sourceQuestionAnswer": 98, "sourceQuestionParameters": {"digit": 7, "difference": 189}},
            "items": items}
    index = {"version": data["version"], "sourceSet": "applied", "sourceRound": 9,
             "itemCount": len(items), "availableSourceNos": [2, 6],
             "pendingSourceNos": data["pendingSourceNos"], "items": [{
                 "sourceNo": 2, "genId": "applied9-q02", "area": "수와 식",
                 "subarea": items[0]["subarea"], "detailType": items[0]["detailType"],
                 "pointBand": "2.7", "reviewStatus": "verified", "variantCount": 9}, {
                 "sourceNo": 6, "genId": "applied9-q06", "area": "수와 식",
                 "subarea": items[9]["subarea"], "detailType": items[9]["detailType"],
                 "pointBand": "2.7", "reviewStatus": "verified", "variantCount": 9}]}
    (ROOT / "bank/data/applied9-expanded.json").write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    (ROOT / "bank/data/applied9-expanded-index.json").write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")
    # Independent arithmetic and structural validation, intentionally separate from generation assertions.
    loaded = json.loads((ROOT / "bank/data/applied9-expanded.json").read_text())
    assert len(loaded["items"]) == 18 and loaded["itemCount"] == 18
    assert all(len([q for q in loaded["items"] if q["sourceNo"] == no]) == 9 for no in (2, 6))
    for q in [x for x in loaded["items"] if x["sourceNo"] == 2]:
        p = q["verification"]["parameters"]
        assert p["suffixNumber"] - p["prefixNumber"] == p["difference"]
        assert p["answer"] == int(q["answer"]) and len(q["solutionSteps"]) >= 3
        assert f"{p['suffixNumber']}−{p['prefixNumber']}={p['difference']}" in q["solutionSteps"][-1]
        assert q["pointBand"] == "2.7" and q["difficultyEvidence"]["label"] == "하"
    clocks = [q for q in loaded["items"] if q["sourceNo"] == 6]
    assert len({tuple(q["answerParts"]) for q in clocks}) == 9
    for q in clocks:
        p = q["verification"]["parameters"]
        assert p["actualElapsedMinutes"] * 5 == p["shownElapsedMinutes"] * 4
        assert p["actualElapsedMinutes"] * 75 // 60 == p["shownElapsedMinutes"]
        assert q["pointBand"] == "2.7" and q["difficultyEvidence"]["label"] == "하"
    assert make_clock_item(99, 1260)["answer"] == "오후 5시 48분"
    print("Applied 9 Q2/Q6: 18 variants; 9 unique answers per source type, independently recalculated.")


if __name__ == "__main__":
    main()

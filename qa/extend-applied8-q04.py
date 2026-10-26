#!/usr/bin/env python3
"""Expand Applied 8 Q4's existing concatenated-natural-number type to nine items."""
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
ANSWER = WORK / "source-review/applied8-answer-drive-copy-q04.pdf"
DATA = ROOT / "bank/data/applied8-expanded.json"
INDEX = ROOT / "bank/data/applied8-expanded-index.json"
VERSION = "20261025-applied8-expansion-q04-q05-q10-q13-q14-q15-q17-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r19"
LENGTHS = [357, 194, 197, 199, 204, 215, 222, 245, 327]


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def block_solution(total_digits: int) -> tuple[str, int, dict]:
    """Skip the one-digit and two-digit blocks, then locate the last three digits."""
    after_99 = total_digits - 9 - 90 * 2
    if after_99 <= 0:
        raise ValueError("Selected lengths must reach the 100-and-up block.")
    completed, offset = divmod(after_99, 3)
    current = 100 + completed
    if offset == 0:
        suffix = str(current - 1)[-3:]
    elif offset == 1:
        suffix = str(current - 1)[-2:] + str(current)[0]
    else:
        suffix = str(current - 1)[-1:] + str(current)[:2]
    return suffix, sum(map(int, suffix)), {
        "digitsThrough99": 189, "digitsAfter99": after_99,
        "completedThreeDigitNumbers": completed, "offsetIntoNextNumber": offset,
        "nextNumber": current, "lastThreeDigits": suffix,
    }


def literal_solution(total_digits: int) -> tuple[str, int]:
    """Build the concatenated prefix literally, independently of block arithmetic."""
    prefix = ""
    value = 1
    while len(prefix) < total_digits:
        prefix += str(value)
        value += 1
    suffix = prefix[:total_digits][-3:]
    return suffix, sum(int(ch) for ch in suffix)


def make_item(total_digits: int, variant: int) -> dict:
    suffix, answer, params = block_solution(total_digits)
    assert (suffix, answer) == literal_solution(total_digits)
    digit_sum = "+".join(suffix)
    steps = [
        f"1부터 9까지 이어 붙이면 9자리이고, 10부터 99까지는 90×2=180자리이므로 99까지 모두 189자리입니다.",
        f"전체 {total_digits}자리에서 189자리를 빼면 100부터 이어 붙인 부분은 {params['digitsAfter99']}자리입니다.",
        f"이어 붙인 수의 마지막 세 자리는 {suffix}이므로 숫자의 합은 {digit_sum}={answer}입니다.",
    ]
    return {
        "id": f"applied8-q04-v{variant}", "genId": "applied8-q04", "sourceSet": "applied",
        "sourceRound": 8, "sourceNo": 4, "variantNo": variant, "reviewStatus": "verified",
        "area": "수와 식", "subarea": "수의 배열과 자릿수", "detailType": "자연수를 이어 붙인 수의 끝자리 찾기",
        "pointBand": "2.7",
        "text": f"1부터 자연수를 차례로 계속하여 붙여 전체가 {total_digits}자리인 수를 만들었습니다. 마지막 빈칸 세 개에 들어가는 숫자의 합을 구하세요.",
        "promptDataLines": ["12345678910111213 … □ □ □"],
        "answer": str(answer), "answerParts": [answer], "answerLabels": ["마지막 세 숫자의 합"],
        "acceptedAnswers": [str(answer), f"{answer}입니다"], "answerContract": "single-number",
        "solutionSteps": steps, "solution": " ".join(steps),
        "learningPoint": "자릿수 구간별 길이를 누적해 목표 위치를 찾고, 끝의 세 숫자를 정확히 읽기",
        "learningLocation": "활용 8회 · 원문 4번 · 자연수 이어 붙이기의 자릿수 위치",
        "verification": {
            "primaryMethod": "1~9와 10~99의 자릿수를 먼저 합산한 뒤 100 이상 구간에서 끝 세 자리 위치를 계산한다.",
            "independentMethod": "1부터 자연수를 실제 문자열로 이어 붙여 지정된 길이에서 자르고 마지막 세 자리의 합을 구한다.",
            "parameters": {"totalDigits": total_digits, **params, "lastThreeDigits": suffix, "digitSumExpression": digit_sum, "digitSum": answer},
            "independentSuite": "qa/applied8-q04-independent-validate.py",
            "sourceExamPage": 1, "sourceExamFile": SOURCE.name, "sourceExamDriveFileId": SOURCE_DRIVE_ID,
            "sourceAnswerPage": 1, "sourceAnswerDriveFileId": "1ixxsCBOTS4SqJ4PXJesvzHzyQfcBW06p",
            "sourceDrawingCompared": True, "sourceDrawingPresent": False,
            "officialAnswerStatus": "The Drive file titled as an answer is a text-identical blank exam copy; no marked answer key is present. Original and variants were independently calculated by block lengths and literal concatenation.",
            "studentDifficultyMeasured": False,
        },
        "difficultyEvidence": {
            "basis": "source-point-band", "label": "하", "sourceReasoningPreserved": True,
            "measuredVariantRate": None, "estimated": False,
            "rationale": "활용 8회 원문 4번은 1~12번의 2.7점 배점대다. 활용 난도는 배점대만 적용한다.",
        },
    }


def main() -> None:
    if not SOURCE.exists() or not ANSWER_IN.exists():
        raise SystemExit("The source exam or downloaded Drive answer candidate is missing.")
    shutil.copy2(ANSWER_IN, ANSWER)
    exam_page, answer_page = PdfReader(str(SOURCE)).pages[0], PdfReader(str(ANSWER)).pages[0]
    norm = lambda text: "".join((text or "").split())
    assert norm(exam_page.extract_text()) == norm(answer_page.extract_text())
    source_text = norm(exam_page.extract_text())
    # PDF text extraction reorders the printed 357 count and blank count; the
    # rendered source p.1 was directly reviewed, and the extraction anchors
    # only guard that the relevant text region exists.
    assert "357" in source_text and "마지막빈칸개에들어가는숫자" in source_text

    data = json.loads(DATA.read_text(encoding="utf-8"))
    index = json.loads(INDEX.read_text(encoding="utf-8"))
    assert not any(x.get("sourceNo") == 4 for x in data["items"])
    items = [make_item(n, i) for i, n in enumerate(LENGTHS, 1)]
    assert len(items) == 9 and items[0]["answer"] == "11"
    data["items"].extend(items)
    source_nos = sorted({item["sourceNo"] for item in data["items"]})
    data["availableSourceNos"] = source_nos
    data["pendingSourceNos"] = [n for n in range(1, 31) if n not in source_nos]
    data["itemCount"] = len(data["items"])
    data["version"] = VERSION
    data["policy"]["newSourceTypes"] = 0
    index["items"].append({"sourceNo": 4, "genId": "applied8-q04", "area": "수와 식",
        "subarea": "수의 배열과 자릿수", "detailType": "자연수를 이어 붙인 수의 끝자리 찾기",
        "pointBand": "2.7", "reviewStatus": "verified", "variantCount": 9})
    index["items"].sort(key=lambda item: item["sourceNo"])
    index["pendingSourceNos"] = data["pendingSourceNos"]
    index["itemCount"] = data["itemCount"]
    index["version"] = VERSION
    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    INDEX.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    from_page = {"file": SOURCE.name, "driveFileId": SOURCE_DRIVE_ID, "sha256": sha(SOURCE),
        "page": 1, "questionNo": 4, "directVisualReview": True, "stem": source_text,
        "sourceDrawingPresent": False}
    answer_copy = {"file": ANSWER.name, "driveFileId": "1ixxsCBOTS4SqJ4PXJesvzHzyQfcBW06p",
        "sha256": sha(ANSWER), "page": 1, "directVisualReview": True, "containsAnswers": False,
        "pageTextMatchesQuestionPdf": True}
    (WORK / "q04-source-answer-review.json").write_text(json.dumps({"sourceExam": from_page,
        "answerCandidate": answer_copy,
        "answerSourceConclusion": "The available Drive answer-candidate PDF is a blank question-page copy, not an answer key.",
        "sourceIndependentAnswer": items[0]["answer"], "variantCount": 9, "newSourceTypes": 0,
        "difficulty": "2.7-point band only = low"}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    math_rows=[]
    for length in LENGTHS:
        suffix, digit_sum, params=block_solution(length)
        literal_suffix,literal_sum=literal_solution(length)
        assert (suffix,digit_sum)==(literal_suffix,literal_sum)
        math_rows.append({"totalDigits":length,"lastThreeDigits":suffix,"digitSum":digit_sum,
                          "blockMethod":params,"literalConcatenationMatches":True})
    (WORK / "q04-independent-math.json").write_text(json.dumps({
        "blockMethod":"189 digits through 99, then locate the endpoint in the three-digit block",
        "independentMethod":"literal concatenation of 1 onward and slice the exact total length",
        "source":math_rows[0],"variants":math_rows[1:]},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"PASS Q4: source answer={items[0]['answer']}; 9 items; inventory={data['itemCount']}; types={len(source_nos)}; r19")


if __name__ == "__main__":
    main()

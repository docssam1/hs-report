#!/usr/bin/env python3
"""Extend Applied 5 Q19's existing digit-sum increment rule."""
import hashlib
import json
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw5"
DATA_FILE = ROOT / "bank/data/applied5-expanded.json"
INDEX_FILE = ROOT / "bank/data/applied5-expanded-index.json"
EXAM = ROOT / "materials/초등과정 대비 실전 모의고사활용 5회.pdf"
ANSWER = Path("/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 5회 답안.pdf")
EXAM_RENDER = WORK / "q19-source-page-4.png"
ANSWER_RENDER = WORK / "q19-answer-page-19.png"
ANSWER_OCR = WORK / "q19-answer-page-19-vision.txt"
EXAM_ID = "1x7CevkWByUrXPqfbV5xTHidJPNDrbuJp"
ANSWER_ID = "1QGjWnEBjULxwy4BBX8tLutpGbjQfEh05"
VERSION = "20261025-applied5-expansion-q03-q05-q06-q08-q09-q11-q12-q14-q15-q16-q17-q18-q19-r14"

# Each row is (three examples, target original number). The transform is
# n + digital_root(sum_of_digits(n)) + 1, reconstructed from the source.
PARAMETERS = [
    ([12, 34, 56], 15),
    ([16, 43, 71], 28),
    ([25, 48, 62], 36),
    ([13, 55, 82], 43),
    ([11, 26, 74], 51),
    ([15, 33, 58], 62),
    ([18, 42, 66], 73),
    ([17, 32, 69], 84),
    ([14, 37, 83], 48),
]


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def digital_root(n):
    while n >= 10:
        n = sum(map(int, str(n)))
    return n


def transform(n):
    return n + digital_root(sum(map(int, str(n)))) + 1


def has_batchim(n):
    return str(n)[-1] in "013678"


def particle(n, batchim, vowel):
    return batchim if has_batchim(n) else vowel


def make_item(no, examples, answer):
    target = transform(answer)
    equations = [f"{n} = {transform(n)}" for n in examples]
    equations.append(f"? = {target}")
    q = "applied5-q19"
    amount = digital_root(sum(map(int, str(answer)))) + 1
    low, high = target - 10, target - 2
    steps = [
        f"{examples[0]}{particle(examples[0], '은', '는')} 각 자리 숫자의 합이 {sum(map(int, str(examples[0])))}이고, 한 자리 수 {digital_root(sum(map(int, str(examples[0]))))}에 1을 더한 {digital_root(sum(map(int, str(examples[0])))) + 1}{particle(digital_root(sum(map(int, str(examples[0])))) + 1, '을', '를')} 더해 {transform(examples[0])}{particle(transform(examples[0]), '이', '가')} 됩니다.",
        f"{examples[1]}{particle(examples[1], '은', '는')} 각 자리 숫자의 합을 한 자리 수로 만들면 {digital_root(sum(map(int, str(examples[1]))))}입니다. 여기에 1을 더한 수를 {examples[1]}에 더하면 {transform(examples[1])}{particle(transform(examples[1]), '이', '가')} 됩니다. 같은 규칙으로 {examples[2]}{particle(examples[2], '은', '는')} {transform(examples[2])}{particle(transform(examples[2]), '이', '가')} 됩니다.",
        f"각 자리 숫자의 합을 한 자리 수로 만든 뒤 1을 더한 값은 2부터 10까지입니다. 따라서 ?에 들어갈 두 자리 수는 {low}부터 {high}까지입니다.",
        f"{answer}의 각 자리 숫자의 합 {sum(map(int, str(answer)))}{particle(sum(map(int, str(answer))), '을', '를')} 한 자리 수로 만들면 {digital_root(sum(map(int, str(answer))))}입니다. 여기에 1을 더한 {amount}{particle(amount, '을', '를')} 더하면 {answer}+{amount}={target}입니다. 후보를 대입하면 이 범위에서 조건을 만족하는 수는 {answer}뿐입니다.",
    ]
    return {
        "id": f"{q}-v{no}", "genId": q, "sourceSet": "applied", "sourceRound": 5,
        "sourceNo": 19, "variantNo": no, "reviewStatus": "verified",
        "area": "수와 식", "subarea": "수의 규칙",
        "detailType": "각 자리의 합을 한 자리로 만들어 더하는 수 변환 규칙",
        "pointBand": "3.4",
        "text": "다음은 일정한 규칙에 따라 쓰여졌습니다. ?를 구하시오.",
        "promptDataLines": equations,
        "answer": str(answer), "answerParts": [answer], "answerLabels": ["?에 들어갈 수"],
        "acceptedAnswers": [str(answer)], "answerContract": "single-value",
        "solutionSteps": steps, "solution": " ".join(steps),
        "learningPoint": "각 자리 숫자의 합을 한 자리 수로 만든 뒤 1을 더해 원래 수에 더하는 규칙을 찾아 거꾸로 적용한다.",
        "learningLocation": "활용 5회 · 원문 19번 · 각 자리 숫자의 합을 이용한 수 변환 규칙",
        "verification": {
            "primaryMethod": "각 자리 숫자의 합을 반복해 한 자리 수로 만든 뒤 1을 더해 원래 수에 더한다.",
            "independentMethod": "두 자리 후보 10~99를 전수 대입해 목표값을 만드는 수가 하나인지 확인한다.",
            "parameters": {"exampleInputs": examples,
                           "exampleOutputs": [transform(n) for n in examples],
                           "targetOutput": target, "answer": answer,
                           "digitSum": sum(map(int, str(answer))),
                           "digitalRoot": digital_root(sum(map(int, str(answer)))),
                           "increment": amount, "candidateRange": [low, high],
                           "sourceRule": "n + digital_root(sum_of_digits(n)) + 1"},
            "independentSuite": "qa/applied5-q19-independent-validate.py",
            "sourceExamPage": 4, "sourceExamFile": EXAM.name,
            "sourceExamDriveFileId": EXAM_ID,
            "sourceAnswerPage": 19, "sourceAnswerFile": ANSWER.name,
            "sourceAnswerDriveFileId": ANSWER_ID,
            "sourceDrawingCompared": True, "sourceDrawingPresent": False,
            "sourceAnswerStatus": "답안 PDF 19쪽의 교사 표시 정답 49와 각 예시의 증가값 3, 7, 9를 직접 대조했다. 규칙을 각 자리 합의 한 자리 값에 1을 더해 원래 수에 더하는 것으로 재구성했고 49에서 54를 독립 재현했다.",
            "studentDifficultyMeasured": False,
        },
        "difficultyEvidence": {"basis": "source-point-band", "label": "중",
                               "sourceReasoningPreserved": True, "measuredVariantRate": None,
                               "estimated": False,
                               "rationale": "활용 5회 원문 19번은 13~22번 3.4점 배점대이므로 활용 난도는 배점대만 적용한다."},
    }


def main():
    assert EXAM.is_file() and ANSWER.is_file() and EXAM_RENDER.is_file() and ANSWER_RENDER.is_file() and ANSWER_OCR.is_file()
    assert sha(EXAM) == "5a258dad75459598920ecf5e221db1b4d94dfc5899a2260cf3e7f0b121fe8d2c"
    assert sha(ANSWER) == "6559ed2c3ec8c5a4908c9decaec66dc19f566ef8f672dc02dc47d96dcf9d879e"
    pages = PdfReader(str(EXAM)).pages
    source_text = "".join((pages[3].extract_text() or "").split())
    assert all(token in source_text for token in ("일정한규칙에따라", "20=23", "60=67", "89=98", "?=54"))
    assert len(PdfReader(str(ANSWER)).pages) >= 19
    ocr = ANSWER_OCR.read_text()
    assert "19." in ocr and "? = 54" in ocr and "49" in ocr

    data, index = json.loads(DATA_FILE.read_text()), json.loads(INDEX_FILE.read_text())
    assert data["version"].endswith("q18-r13") and len(data["items"]) == 180
    assert data["pendingSourceNos"] == [19, 20, 22, 23, 24, 25, 26, 27, 28, 29]
    assert 19 not in data["availableSourceNos"] and not any(x["sourceNo"] == 19 for x in data["items"])
    variants = [make_item(i, examples, answer) for i, (examples, answer) in enumerate(PARAMETERS, 1)]
    assert len({x["answer"] for x in variants}) == 9

    source_rule = {"20": 23, "60": 67, "89": 98, "49": 54}
    assert {str(n): transform(n) for n in (20, 60, 89, 49)} == source_rule

    data["items"].extend(variants)
    data["items"].sort(key=lambda x: (x["sourceNo"], x["variantNo"]))
    data["availableSourceNos"].append(19)
    data["availableSourceNos"].sort()
    data["pendingSourceNos"].remove(19)
    data["version"] = VERSION
    data["sourceEditionNotes"]["19"] = "시험지 4쪽의 규칙 문제와 답안 19쪽 교사 표시 49를 직접 대조. 각 자리 합을 한 자리로 만든 값에 1을 더해 원래 수에 더하는 규칙으로 재구성하고 독립 검산."
    data["reviewSummary"].update({"independentMathCount": len(data["items"]),
                                  "sourceTypes": len(data["availableSourceNos"]),
                                  "sourceDrawingCount": sum(bool(x.get("asset")) for x in data["items"])})
    DATA_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")

    index["items"].append({"sourceNo": 19, "genId": "applied5-q19", "area": "수와 식",
                           "subarea": "수의 규칙",
                           "detailType": "각 자리의 합을 한 자리로 만들어 더하는 수 변환 규칙",
                           "pointBand": "3.4", "reviewStatus": "verified", "variantCount": 9})
    index["items"].sort(key=lambda x: x["sourceNo"])
    index.update({"version": VERSION, "itemCount": len(data["items"]), "pendingSourceNos": data["pendingSourceNos"]})
    INDEX_FILE.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")

    review = {
        "sourceExam": {"file": EXAM.name, "sha256": sha(EXAM), "page": 4,
                       "questionNo": 19, "directVisualReview": True,
                       "sourceText": "다음은 일정한 규칙에 따라 쓰여졌습니다. ?를 구하시오. 20=23, 60=67, 89=98, ?=54.",
                       "drawingPresent": False, "render": str(EXAM_RENDER.relative_to(ROOT))},
        "sourceAnswer": {"file": ANSWER.name, "driveFileId": ANSWER_ID, "sha256": sha(ANSWER), "page": 19,
                         "directVisualReview": True, "teacherMarkedAnswer": 49,
                         "teacherMarkedIncrements": [3, 7, 9], "render": str(ANSWER_RENDER.relative_to(ROOT)),
                         "visionOcr": str(ANSWER_OCR.relative_to(ROOT))},
        "sourceRule": {"expression": "n + digital_root(sum_of_digits(n)) + 1",
                       "examples": [{"input": n, "digitSum": sum(map(int, str(n))),
                                     "oneDigitSum": digital_root(sum(map(int, str(n)))),
                                     "increment": digital_root(sum(map(int, str(n)))) + 1,
                                     "output": transform(n)} for n in (20, 60, 89)],
                       "answerCheck": {"input": 49, "digitSum": 13, "oneDigitSum": 4,
                                       "increment": 5, "output": 54}},
        "variantCount": 9, "newSourceTypes": 0,
        "difficulty": "3.4 point band only = medium",
        "variants": [{"id": x["id"], "examples": x["verification"]["parameters"]["exampleInputs"],
                      "exampleOutputs": x["verification"]["parameters"]["exampleOutputs"],
                      "targetOutput": x["verification"]["parameters"]["targetOutput"],
                      "answer": x["answer"]} for x in variants],
        "dataVersion": VERSION,
    }
    (WORK / "q19-source-answer-review.json").write_text(json.dumps(review, ensure_ascii=False, indent=2) + "\n")
    print("Added Applied5 Q19: nine variants of the existing digit-sum rule; source answer 49; total", len(data["items"]))


if __name__ == "__main__":
    main()

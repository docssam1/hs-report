#!/usr/bin/env python3
"""Independent source, answer, and unique-integer audit for Applied 5 Q19."""
import hashlib
import json
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw5"
EXAM = ROOT / "materials/초등과정 대비 실전 모의고사활용 5회.pdf"
ANSWER = Path("/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 5회 답안.pdf")
DATA = json.loads((ROOT / "bank/data/applied5-expanded.json").read_text())
INDEX = json.loads((ROOT / "bank/data/applied5-expanded-index.json").read_text())
REVIEW = json.loads((WORK / "q19-source-answer-review.json").read_text())


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def digital_root(n):
    while n >= 10:
        n = sum(map(int, str(n)))
    return n


def transform(n):
    return n + digital_root(sum(map(int, str(n)))) + 1


def main():
    assert sha(EXAM) == REVIEW["sourceExam"]["sha256"] == "5a258dad75459598920ecf5e221db1b4d94dfc5899a2260cf3e7f0b121fe8d2c"
    assert sha(ANSWER) == REVIEW["sourceAnswer"]["sha256"] == "6559ed2c3ec8c5a4908c9decaec66dc19f566ef8f672dc02dc47d96dcf9d879e"
    assert REVIEW["sourceExam"]["page"] == 4 and REVIEW["sourceExam"]["questionNo"] == 19
    assert REVIEW["sourceAnswer"]["page"] == 19 and REVIEW["sourceAnswer"]["teacherMarkedAnswer"] == 49
    assert REVIEW["sourceAnswer"]["driveFileId"] == "1QGjWnEBjULxwy4BBX8tLutpGbjQfEh05"
    assert all(Path(ROOT / p).is_file() for p in (REVIEW["sourceExam"]["render"],
                                                    REVIEW["sourceAnswer"]["render"],
                                                    REVIEW["sourceAnswer"]["visionOcr"]))
    source_text = "".join((PdfReader(str(EXAM)).pages[3].extract_text() or "").split())
    assert all(token in source_text for token in ("일정한규칙에따라", "20=23", "60=67", "89=98", "?=54"))
    ocr = (ROOT / REVIEW["sourceAnswer"]["visionOcr"]).read_text()
    assert "19." in ocr and "? = 54" in ocr and "49" in ocr
    assert {n: transform(n) for n in (20, 60, 89, 49)} == {20: 23, 60: 67, 89: 98, 49: 54}

    assert DATA["version"].endswith("q20-r15") and len(DATA["items"]) == 198
    assert INDEX["version"] == DATA["version"] and INDEX["itemCount"] == 198
    assert INDEX["pendingSourceNos"] == DATA["pendingSourceNos"] == [22, 23, 24, 25, 26, 27, 28, 29]
    assert len(DATA["availableSourceNos"]) == 22 and 19 in DATA["availableSourceNos"]
    items = [x for x in DATA["items"] if x["sourceNo"] == 19]
    assert len(items) == 9 and [x["variantNo"] for x in items] == list(range(1, 10))
    proofs = []
    answers = set()
    for item in items:
        p = item["verification"]["parameters"]
        answer, target = p["answer"], p["targetOutput"]
        examples = p["exampleInputs"]
        assert item["reviewStatus"] == "verified" and item["pointBand"] == "3.4"
        assert item["difficultyEvidence"]["label"] == "중"
        assert item["area"] == "수와 식" and item["subarea"] == "수의 규칙"
        assert item["text"] == "다음은 일정한 규칙에 따라 쓰여졌습니다. ?를 구하시오."
        assert len(examples) == 3 and len(set(examples)) == 3
        assert [transform(n) for n in examples] == p["exampleOutputs"]
        assert all(line == f"{n} = {transform(n)}" for line, n in zip(item["promptDataLines"][:3], examples))
        assert item["promptDataLines"][3] == f"? = {target}"
        assert item["answerParts"] == [answer] and item["answer"] == str(answer)
        assert target == transform(answer)
        candidates = [n for n in range(10, 100) if transform(n) == target]
        assert candidates == [answer], (item["id"], target, candidates)
        lo, hi = p["candidateRange"]
        assert candidates[0] in range(lo, hi + 1)
        assert lo == target - 10 and hi == target - 2
        assert "5.5" not in item["text"]
        assert item["verification"]["sourceDrawingPresent"] is False
        answers.add(answer)
        proofs.append({"id": item["id"], "exampleInputs": examples,
                       "exampleOutputs": p["exampleOutputs"], "targetOutput": target,
                       "candidateRange": [lo, hi], "allTwoDigitCandidates": candidates,
                       "answer": answer, "answerForwardCheck": transform(answer), "passed": True})
    assert len(answers) == 9
    proof = {"dataSha256": sha(ROOT / "bank/data/applied5-expanded.json"),
             "sourceExamSha256": sha(EXAM), "sourceAnswerSha256": sha(ANSWER),
             "sourceQuestion": 19, "sourceExamPage": 4, "sourceAnswerPage": 19,
             "sourceAnswer": 49, "sourceRule": "n + digital_root(sum_of_digits(n)) + 1",
             "variantCount": len(proofs), "allAnswersUniqueAcrossTwoDigitDomain": True,
             "variants": proofs}
    (WORK / "q19-independent-math.json").write_text(json.dumps(proof, ensure_ascii=False, indent=2) + "\n")
    print("PASS Applied5 Q19: direct exam p4/teacher-marked answer p19; source answer 49; 9 unique two-digit variant answers; 3.4-point medium; no added source type.")


if __name__ == "__main__":
    main()

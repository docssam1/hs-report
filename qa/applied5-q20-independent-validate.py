#!/usr/bin/env python3
"""Independently verify Applied 5 Q20's source conditions and all answers."""
import hashlib
import json
from pathlib import Path

from PIL import Image, ImageChops
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw5"
DATA = json.loads((ROOT / "bank/data/applied5-expanded.json").read_text())
INDEX = json.loads((ROOT / "bank/data/applied5-expanded-index.json").read_text())
REVIEW = json.loads((WORK / "q20-source-answer-review.json").read_text())
EXAM = ROOT / "materials/초등과정 대비 실전 모의고사활용 5회.pdf"
ANSWER = Path("/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 5회 답안.pdf")
PARAMETERS = [(10, 1, 2), (11, 2, 1), (12, 2, 3), (13, 3, 2),
              (12, 1, 4), (13, 4, 2), (14, 5, 3), (15, 6, 1), (17, 2, 7)]


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def brute(total, second, third):
    return [n for n in range(1000, 10000)
            if sum(map(int, str(n))) == total and (n // 100) % 10 == second
            and (n // 10) % 10 == third and len(set(str(n))) == 4]


def main():
    assert sha(EXAM) == REVIEW["sourceExam"]["sha256"] == "5a258dad75459598920ecf5e221db1b4d94dfc5899a2260cf3e7f0b121fe8d2c"
    assert sha(ANSWER) == REVIEW["sourceAnswer"]["sha256"] == "6559ed2c3ec8c5a4908c9decaec66dc19f566ef8f672dc02dc47d96dcf9d879e"
    assert len(PdfReader(str(EXAM)).pages) >= 4 and len(PdfReader(str(ANSWER)).pages) >= 20
    assert REVIEW["sourceExam"]["page"] == 4 and REVIEW["sourceExam"]["questionNo"] == 20
    assert REVIEW["sourceAnswer"]["page"] == 20
    assert REVIEW["sourceAnswer"]["teacherMarkedPasswords"] == [7350, 6351, 1356]
    ocr = (ROOT / REVIEW["sourceAnswer"]["visionOcr"]).read_text()
    assert all(s in ocr for s in ("20.", "7350", "6351", "1356"))
    source_text = "".join((PdfReader(str(EXAM)).pages[3].extract_text() or "").split())
    assert all(s in source_text for s in ("다음네자리수인비밀번호", "순서도의조건에알맞은비밀번호를모두", "각자리숫자는모두다른숫자"))
    source_image = Image.open(WORK / "q20-source-page-4.png")
    crop = source_image.crop(tuple(REVIEW["sourceExam"]["figureCropBoxPixels"]))
    stored_crop = Image.open(ROOT / REVIEW["sourceExam"]["figureCrop"])
    assert crop.size == stored_crop.size and ImageChops.difference(crop, stored_crop).getbbox() is None
    assert brute(15, 3, 5) == [1356, 6351, 7350]
    assert DATA["version"].endswith("q20-r15") and len(DATA["items"]) == INDEX["itemCount"] == 198
    assert INDEX["version"] == DATA["version"]
    assert DATA["availableSourceNos"] == [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 30]
    assert DATA["pendingSourceNos"] == INDEX["pendingSourceNos"] == [22, 23, 24, 25, 26, 27, 28, 29]
    items = [x for x in DATA["items"] if x["sourceNo"] == 20]
    assert len(items) == 9 and [x["variantNo"] for x in items] == list(range(1, 10))
    seen_answers = set()
    proof = []
    for item, (total, second, third) in zip(items, PARAMETERS):
        answers = brute(total, second, third)
        p = item["verification"]["parameters"]
        assert len(answers) == len(item["answerParts"]) == 3
        assert item["answerParts"] == answers and item["answerContract"] == "unordered-set"
        assert item["area"] == "경우의 수" and item["pointBand"] == "3.4"
        assert item["difficultyEvidence"]["label"] == "중"
        assert p["digitSum"] == total and p["secondDigit"] == second and p["thirdDigit"] == third
        assert p["outerDigitSum"] == total - second - third
        assert all(sum(map(int, str(n))) == total and (n // 100) % 10 == second
                   and (n // 10) % 10 == third and len(set(str(n))) == 4 for n in answers)
        assert item["asset"]["src"] == f"assets/applied5/q20-v{item['variantNo']}.svg"
        assert item["verification"]["sourceExamDriveFileId"] == REVIEW["sourceExam"]["driveFileId"]
        assert item["verification"]["sourceAnswerDriveFileId"] == REVIEW["sourceAnswer"]["driveFileId"]
        assert item["learningLocation"].startswith("활용 5회 · 원문 20번")
        seen_answers.add(tuple(answers))
        proof.append({"id": item["id"], "answers": answers, "answerCount": len(answers), "passed": True})
    assert len(seen_answers) == 9
    result = {"dataSha256": sha(ROOT / "bank/data/applied5-expanded.json"),
              "sourceExamSha256": sha(EXAM), "sourceAnswerSha256": sha(ANSWER),
              "sourceAnswerDriveFileId": REVIEW["sourceAnswer"]["driveFileId"],
              "sourceFigureCropPixelExact": True, "teacherMarkedAnswersReproduced": [1356, 6351, 7350],
              "variantCount": 9, "allVariantsHaveThreeUniqueAnswers": True, "variants": proof}
    (WORK / "q20-independent-math.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    print("PASS Applied5 Q20: source exam p4 and annotated answer p20 checked; exact source crop verified; source answers reproduced; nine unique variants exhaustively checked; medium point band.")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Add text-condition variants for Applied 9 Q05 using its unchanged card art."""
from itertools import permutations
import hashlib
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "bank/data/applied9-expanded.json"
INDEX = ROOT / "bank/data/applied9-expanded-index.json"
SOURCE = ROOT / "materials/초등과정 대비 실전 모의고사 활용 9회.pdf"
ANSWER = ROOT / ".private-work/hw-expansion-20261023/hw9/candidate-special-9-answer.pdf"
SOURCE_HASH = "0e32749d028cdcacd9e61d2b1d1cb5080266ac672a9a3ed17503270a74142794"
ANSWER_HASH = "a6648f008a8e7ba7012913ede0cbad488aec782eaa06818a97acfb6900ac8d62"
ANSWER_DRIVE_ID = "1M7rJHVE11w4BZF5OHjZegDLcGGlmxKp4"
SOURCE_RENDER = ROOT / ".private-work/hw-expansion-20261023/hw9/q01-review/source-1.png"
ASSET = ROOT / "bank/assets/applied9/q05-source-cards.png"
DIVISORS = [2, 3, 4, 5, 6, 7, 9, 11, 12]
VERSION = "20261025-applied9-q02-q05-q06-q07-q10-q11-q13-q17-q19-q21-q26-q27-q29-q30-r10"


def source_card_crop():
    assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == SOURCE_HASH
    assert hashlib.sha256(ANSWER.read_bytes()).hexdigest() == ANSWER_HASH
    page = Image.open(SOURCE_RENDER).convert("RGB")
    assert page.size == (1722, 2437)
    crop = page.crop((1080, 1380, 1440, 1550))
    assert crop.size == (360, 170)
    ASSET.parent.mkdir(parents=True, exist_ok=True)
    crop.save(ASSET, format="PNG", optimize=False)
    return hashlib.sha256(ASSET.read_bytes()).hexdigest()


def item(variant, divisor, asset_hash):
    valid = [int("".join(p)) for p in permutations("01234", 3)
             if p[0] != "0" and int("".join(p)) % divisor == 0]
    groups = {h: [n for n in valid if n // 100 == h] for h in range(1, 5)}
    answer = len(valid)
    group_text = "; ".join(f"백의 자리 {h}: {', '.join(map(str, nums))} ({len(nums)}개)"
                            for h, nums in groups.items())
    steps = [
        "백의 자리에는 0을 쓸 수 없으므로 1, 2, 3, 4 중 하나를 놓습니다.",
        "서로 다른 카드만 써야 하므로 백의 자리를 정한 뒤 남은 카드 중 두 장을 십의 자리와 일의 자리에 놓아 가능한 수를 조사합니다.",
        f"{divisor}의 배수인 수를 백의 자리별로 모으면 {group_text}입니다.",
        f"따라서 조건에 맞는 수는 모두 {' + '.join(str(len(v)) for v in groups.values())}={answer}개입니다.",
    ]
    text = (
        "다음 숫자 카드에서 서로 다른 3장을 한 번씩만 사용하여 세 자리 수를 만듭니다. "
        f"만들 수 있는 수 중에서 {divisor}로 나누어떨어지는 수는 모두 몇 개입니까?"
    )
    return {
        "id": f"applied9-q05-v{variant}", "genId": "applied9-q05",
        "sourceSet": "applied", "sourceRound": 9, "sourceNo": 5,
        "variantNo": variant, "reviewStatus": "verified",
        "area": "경우의 수", "subarea": "수 만들기와 조건에 맞는 경우 세기",
        "detailType": "숫자 카드로 만든 세 자리 수의 배수 조건을 만족하는 경우 세기",
        "pointBand": "2.7", "text": text,
        "answer": str(answer), "answerParts": [answer],
        "answerLabels": ["조건에 맞는 세 자리 수의 개수"],
        "acceptedAnswers": [str(answer)], "answerContract": "single-number",
        "asset": {"kind": "raster", "src": "assets/applied9/q05-source-cards.png",
                  "description": "활용 9회 원문 5번의 0·1·2·3·4 숫자 카드 그림 원본 크롭",
                  "sha256": asset_hash},
        "solutionSteps": steps, "solution": " ".join(steps),
        "learningPoint": "0이 포함된 카드로 세 자리 수를 만들 때 백의 자리 조건과 배수 판정으로 경우를 세기",
        "learningLocation": "활용 9회 · 원문 5번 · 숫자 카드로 수 만들기와 배수 조건",
        "verification": {
            "primaryMethod": "서로 다른 0~4 카드 세 장의 모든 순열 중 백의 자리가 0이 아닌 수를 만들고, 나머지가 0인 수를 백의 자리별로 센다.",
            "independentMethod": "백의 자리를 1~4로 고정한 뒤 십의 자리와 일의 자리의 순서쌍을 중복 없이 전수 생성하고 나눗셈 나머지를 직접 계산한다.",
            "parameters": {"cards": [0, 1, 2, 3, 4], "digitsUsed": 3,
                           "divisor": divisor, "validNumbers": valid,
                           "numbersByHundredsDigit": groups,
                           "answer": answer, "sourceCardCropSha256": asset_hash},
            "independentSuite": "qa/applied9-q05-independent-validate.py",
            "sourceExamPage": 1,
            "sourceExamFile": "초등과정 대비 실전 모의고사 활용 9회.pdf",
            "sourceExamSha256": SOURCE_HASH,
            "sourceAnswerPage": 1,
            "sourceAnswerFile": "초등과정 대비 실전 모의고사 특강 9회 답안.pdf",
            "sourceAnswerDriveId": ANSWER_DRIVE_ID,
            "sourceAnswerSha256": ANSWER_HASH,
            "officialAnswerStatus": "Candidate page 1 handwritten answer for the original divisor 4 is 15 and matches independent enumeration; official edition identity remains unconfirmed.",
            "sourceDrawingCompared": True, "sourceDrawingPresent": True,
            "sourceDrawingDescription": "Opened the original Q05 prompt and printed card row on source page 1. The five 0–4 cards are reused as an unchanged pixel crop in all variants.",
            "variantUsesSourceDrawing": True, "variantDrawingModified": False,
            "studentDifficultyMeasured": False,
        },
        "difficultyEvidence": {
            "basis": "source-point-band", "label": "하",
            "sourceReasoningPreserved": True, "measuredVariantRate": None,
            "estimated": False,
            "rationale": "활용 9회 원문 1~12번의 2.7점 배점대이므로 활용 난도는 배점대만 적용한다.",
        },
    }


def main():
    asset_hash = source_card_crop()
    additions = [item(i, divisor, asset_hash) for i, divisor in enumerate(DIVISORS, 1)]
    data = json.loads(DATA.read_text())
    index = json.loads(INDEX.read_text())
    assert data["version"].endswith("-r9") and index["version"] == data["version"]
    assert 5 in data["pendingSourceNos"] and not any(x["sourceNo"] == 5 for x in data["items"])
    items = sorted(data["items"] + additions, key=lambda x: (x["sourceNo"], x["variantNo"]))
    available = sorted({x["sourceNo"] for x in items})
    pending = [n for n in range(1, 31) if n not in available]
    data.update(version=VERSION, items=items, itemCount=len(items),
                availableSourceNos=available, pendingSourceNos=pending)
    data["sourceReview"].setdefault("questionReviews", {})["5"] = {
        "sourcePage": 1, "cards": [0, 1, 2, 3, 4], "sourceDivisor": 4,
        "candidateAnswer": 15, "independentAnswer": 15,
        "status": "candidate handwritten answer matches independent enumeration; candidate official edition identity unconfirmed; source unchanged",
    }
    index.update(version=VERSION, itemCount=len(items), availableSourceNos=available,
                 pendingSourceNos=pending)
    index["items"].append({"sourceNo": 5, "genId": "applied9-q05",
                           "area": "경우의 수", "subarea": "수 만들기와 조건에 맞는 경우 세기",
                           "detailType": "숫자 카드로 만든 세 자리 수의 배수 조건을 만족하는 경우 세기",
                           "pointBand": "2.7", "reviewStatus": "verified", "variantCount": 9})
    index["items"].sort(key=lambda x: x["sourceNo"])
    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    INDEX.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"status": "BUILT", "version": VERSION, "added": 9,
                      "total": len(items), "pending": pending,
                      "divisors": DIVISORS,
                      "answers": [x["answer"] for x in additions],
                      "sourceCardCropSha256": asset_hash}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

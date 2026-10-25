#!/usr/bin/env python3
"""Add nine stored variants of Applied 5 Q3's digit-card counting type."""
import hashlib
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw5"
DATA_PATH = ROOT / "bank/data/applied5-expanded.json"
INDEX_PATH = ROOT / "bank/data/applied5-expanded-index.json"
SOURCE_PAGE = ROOT / ".private-work/hw-expansion-20261023/applied5-source-p1.png"
ANSWER_PAGE = ROOT / ".private-work/hw-expansion-20261023/applied5-answer-03.png"
ASSET_DIR = ROOT / "bank/assets/applied5"
VERSION = "20261025-applied5-expansion-q03-r2"

# The original {0,2,4,8} is the reference item and is deliberately excluded:
# these are nine additional practice variants, not a duplicate of the source.
CARD_SETS = [
    [0, 1, 2, 7],
    [0, 1, 6, 8],
    [0, 1, 4, 5],
    [0, 3, 6, 9],
    [0, 5, 7, 8],
    [0, 1, 7, 8],
    [0, 2, 7, 8],
    [0, 1, 2, 4],
    [0, 1, 4, 8],
]


def valid_numbers(cards):
    return sorted(
        100 * a + 10 * b
        for a in cards
        for b in cards
        if a != 0 and b != 0 and a != b and b % 2 == 0 and (a + b) % 3 == 0
    )


def make_svg(cards):
    chunks = ['<svg xmlns="http://www.w3.org/2000/svg" width="252" height="54" viewBox="0 0 252 54">']
    for i, digit in enumerate(cards):
        x = 5 + i * 61
        chunks.append(f'<rect x="{x}" y="5" width="40" height="40" fill="#fff" stroke="#777" stroke-width="1.2"/>')
        chunks.append(f'<text x="{x + 20}" y="34" text-anchor="middle" font-family="serif" font-size="25" fill="#191511">{digit}</text>')
        if i < len(cards) - 1:
            chunks.append(f'<text x="{x + 49}" y="33" text-anchor="middle" font-family="serif" font-size="19" fill="#191511">,</text>')
    chunks.append('</svg>')
    return ''.join(chunks)


def build_item(no, cards):
    valid = valid_numbers(cards)
    if not valid:
        raise ValueError(f"No valid number for {cards}")
    gen = "applied5-q03"
    answer = len(valid)
    text = "네 장의 숫자카드 중 3장을 골라 5와 12로 나누어 떨어지는 세 자리 수를 만들려고 합니다. 세 자리 수는 모두 몇 개 만들 수 있습니까?"
    solution = [
        "5의 배수는 일의 자리가 0 또는 5입니다. 12의 배수는 4의 배수이기도 한데, 끝이 5인 수는 4의 배수가 될 수 없으므로 일의 자리는 0입니다.",
        f"숫자카드 {', '.join(map(str, cards))}에서 0을 마지막에 놓습니다. 십의 자리가 짝수이고 백의 자리와 십의 자리의 합이 3의 배수인 서로 다른 순서쌍만 남기면 됩니다.",
        "조건을 만족하는 세 자리 수는 " + ", ".join(map(str, valid)) + f"입니다. 따라서 만들 수 있는 수는 모두 {answer}개입니다.",
    ]
    return {
        "id": f"{gen}-v{no}",
        "genId": gen,
        "sourceSet": "applied",
        "sourceRound": 5,
        "sourceNo": 3,
        "variantNo": no,
        "reviewStatus": "verified",
        "area": "경우의 수",
        "subarea": "숫자카드의 배열",
        "detailType": "배수 조건에 맞는 세 자리 수의 개수",
        "pointBand": "2.7",
        "text": text,
        "asset": {
            "kind": "svg",
            "src": f"assets/applied5/q03-v{no}.svg",
            "description": f"숫자카드 {', '.join(map(str, cards))} 네 장의 새 카드 그림",
        },
        "answer": str(answer),
        "answerParts": [answer],
        "answerLabels": ["만들 수 있는 세 자리 수의 개수"],
        "acceptedAnswers": [str(answer), f"{answer}개"],
        "answerContract": "ordered-parts",
        "solutionSteps": solution,
        "solution": " ".join(solution),
        "learningPoint": "5의 배수와 12의 배수 조건을 나누어 적용하고, 숫자카드 배열을 빠짐없이 세기",
        "learningLocation": "활용 5회 · 원문 3번 · 숫자카드로 5와 12의 공배수 만들기",
        "verification": {
            "primaryMethod": "5의 배수의 일의 자리 조건을 정하고, 12의 배수의 끝 두 자리와 각 자리 합 조건으로 가능한 카드 순서를 나열한다.",
            "independentMethod": "120부터 960까지의 60의 배수만 전수 확인해 카드 집합에 숫자가 중복 없이 들어가는지 별도로 검사한다.",
            "parameters": {"cards": cards, "divisors": [5, 12], "validNumbers": valid, "answerCount": answer},
            "independentSuite": "qa/applied5-independent-validate.py",
            "sourceExamPage": 1,
            "sourceAnswerPage": 3,
            "sourceExamFile": "초등과정 대비 실전 모의고사활용 5회.pdf",
            "sourceAnswerFile": "초등 선발 모의고사 특강 5회 답안.pdf",
            "sourceExamDriveFileId": "1x7CevkWByUrXPqfbV5xTHidJPNDrbuJp",
            "sourceAnswerDriveFileId": "1QGjWnEBjULxwy4BBX8tLutpGbjQfEh05",
            "sourceDrawingCompared": True,
            "variantDrawingType": "four-number-cards",
            "sourceAnswerStatus": "Drive answer PDF page 3 directly shows 240, 420, 480, 840 and handwritten 4개; matched by independent enumeration.",
            "studentDifficultyMeasured": False,
        },
        "difficultyEvidence": {
            "basis": "source-point-band",
            "label": "하",
            "sourceReasoningPreserved": True,
            "measuredVariantRate": None,
            "estimated": False,
            "rationale": "활용 5회 원문 3번은 1~12번의 2.7점 배점대이므로 활용 난도는 배점대만 적용한다.",
        },
    }


def main():
    WORK.mkdir(parents=True, exist_ok=True)
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    data = json.loads(DATA_PATH.read_text())
    index = json.loads(INDEX_PATH.read_text())
    if any(x.get("sourceNo") == 3 for x in data["items"]):
        raise SystemExit("Applied5 Q3 already exists; refusing to duplicate it.")
    if 3 not in data["pendingSourceNos"] or 3 in data["availableSourceNos"]:
        raise SystemExit("Applied5 Q3 availability state is not the expected pending state.")
    if len({tuple(cards) for cards in CARD_SETS}) != 9 or len(CARD_SETS) != 9:
        raise SystemExit("Variant card sets must be nine unique sets.")
    if [0, 2, 4, 8] in CARD_SETS:
        raise SystemExit("Do not count the original question as a new variant.")

    original_crop = Image.open(SOURCE_PAGE).crop((110, 1700, 320, 1760))
    original_crop.save(WORK / "q03-source-card-crop.png")
    original_crop.save(WORK / "q03-source-card-crop-proof.png")

    variants = []
    for i, cards in enumerate(CARD_SETS, 1):
        (ASSET_DIR / f"q03-v{i}.svg").write_text(make_svg(cards), encoding="utf-8")
        variants.append(build_item(i, cards))

    pos = max(i for i, x in enumerate(data["items"]) if x["sourceNo"] == 2) + 1
    data["items"][pos:pos] = variants
    data["version"] = VERSION
    data["availableSourceNos"] = sorted(data["availableSourceNos"] + [3])
    data["pendingSourceNos"] = [n for n in data["pendingSourceNos"] if n != 3]
    data["reviewSummary"].update({"independentMathCount": 81, "sourceTypes": 9, "variantsPerType": 9, "sourceDrawingCount": 1})

    i_pos = next(i for i, x in enumerate(index["items"]) if x["sourceNo"] == 4)
    index["items"].insert(i_pos, {
        "sourceNo": 3,
        "genId": "applied5-q03",
        "area": "경우의 수",
        "subarea": "숫자카드의 배열",
        "detailType": "배수 조건에 맞는 세 자리 수의 개수",
        "pointBand": "2.7",
        "reviewStatus": "verified",
        "variantCount": 9,
    })
    index["version"] = VERSION
    index["itemCount"] = len(data["items"])
    index["pendingSourceNos"] = list(data["pendingSourceNos"])
    DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    INDEX_PATH.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")

    source_review = {
        "sourceExam": {
            "file": "초등과정 대비 실전 모의고사활용 5회.pdf",
            "driveFileId": "1x7CevkWByUrXPqfbV5xTHidJPNDrbuJp",
            "bytes": 796852,
            "sha256": "5a258dad75459598920ecf5e221db1b4d94dfc5899a2260cf3e7f0b121fe8d2c",
            "page": 1,
            "questionNo": 3,
            "directVisualReview": True,
            "stem": "네 장의 숫자카드 중 3장을 골라 5와 12로 나누어 떨어지는 세 자리 수를 만들려고 합니다. 세 자리 수는 모두 몇 개 만들 수 있습니까?",
            "cards": [0, 2, 4, 8],
        },
        "sourceAnswer": {
            "file": "초등 선발 모의고사 특강 5회 답안.pdf",
            "driveFileId": "1QGjWnEBjULxwy4BBX8tLutpGbjQfEh05",
            "bytes": 5070346,
            "sha256": "6559ed2c3ec8c5a4908c9decaec66dc19f566ef8f672dc02dc47d96dcf9d879e",
            "page": 3,
            "directVisualReview": True,
            "answerVisible": True,
            "numbersShown": [240, 420, 480, 840],
            "answer": 4,
        },
        "sourceFigure": {
            "sourceRenderedPage": ".private-work/hw-expansion-20261023/applied5-source-p1.png",
            "cropBoxPixels": [110, 1700, 320, 1760],
            "cropPixels": [210, 60],
            "pixelExactCrop": True,
            "evidenceCrop": ".private-work/hw-expansion-20261023/hw5/q03-source-card-crop.png",
            "sourceRenderSha256": hashlib.sha256(SOURCE_PAGE.read_bytes()).hexdigest(),
            "cropSha256": hashlib.sha256((WORK / "q03-source-card-crop.png").read_bytes()).hexdigest(),
            "variantsUseNewFourCardDiagrams": True,
        },
        "independentAnswer": {"validNumbers": [240, 420, 480, 840], "count": 4, "divisorsLcm": 60},
        "variantCount": 9,
        "newSourceTypes": 0,
        "difficulty": "2.7-point band only = low",
    }
    (WORK / "q03-source-answer-review.json").write_text(json.dumps(source_review, ensure_ascii=False, indent=2) + "\n")
    print(f"Added Applied5 Q3: 9 unique sets, source answer 4, data items {len(data['items'])}.")


if __name__ == "__main__":
    main()

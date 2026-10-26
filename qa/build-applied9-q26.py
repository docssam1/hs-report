#!/usr/bin/env python3
"""Extend Applied 9 Q26 from the directly checked source diagram."""
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
SOURCE_RENDER = ROOT / ".private-work/hw-expansion-20261023/hw9/q25-q30-review/source-5.png"
ASSET = ROOT / "bank/assets/applied9/q26-source-distances.png"
VERSION = "20261025-applied9-q02-q06-q07-q10-q11-q13-q17-q19-q21-q26-q27-q29-q30-r9"
SPEEDS = [
    (4, 3, 1), (3, 2, 2), (2, 1, 3),
    (4, 4, 1), (3, 3, 2), (1, 1, 4),
    (4, 5, 1), (3, 5, 2), (1, 6, 4),
]


def crop_source_figure():
    assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == SOURCE_HASH
    assert hashlib.sha256(ANSWER.read_bytes()).hexdigest() == ANSWER_HASH
    assert SOURCE_RENDER.exists(), "Directly inspected source page render is missing."
    image = Image.open(SOURCE_RENDER).convert("RGB")
    assert image.size == (1823, 2580)
    crop = image.crop((120, 1590, 870, 1780))
    assert crop.size == (750, 190)
    ASSET.parent.mkdir(parents=True, exist_ok=True)
    crop.save(ASSET, format="PNG", optimize=False)
    return hashlib.sha256(ASSET.read_bytes()).hexdigest()


def make_item(variant, m, h, d, crop_hash):
    first_meeting = 420 // (h + d)
    second_meeting = 635 // (m + d)
    elapsed = second_meeting - first_meeting
    assert 420 % (h + d) == 0 and 635 % (m + d) == 0
    assert m > 0 and h > 0 and d > 0 and first_meeting < second_meeting
    steps = [
        f"희선이와 동호 사이의 거리는 420m이고 두 사람이 서로를 향해 초당 {h}m와 초당 {d}m로 움직이므로, 만나는 데 걸리는 시간은 420÷({h}+{d})={first_meeting}초입니다.",
        f"민정이와 동호 사이의 처음 거리는 215+420=635m입니다. 두 사람이 서로를 향해 초당 {m}m와 초당 {d}m로 움직이므로, 만나는 데 걸리는 시간은 635÷({m}+{d})={second_meeting}초입니다.",
        f"동호가 희선이를 만난 뒤 민정이를 만날 때까지 걸리는 시간은 {second_meeting}−{first_meeting}={elapsed}초입니다.",
        f"따라서 구하는 시간은 {elapsed}초입니다.",
    ]
    text = (
        "직선 도로에 민정, 희선, 동호가 그림과 같이 서 있습니다. "
        f"민정이는 1초에 {m}m를 걷는 빠르기로 가고, 희선이는 동호를 향해 1초에 {h}m를 걷는 빠르기로 갑니다. "
        f"또 동호는 민정이를 향해 1초에 {d}m를 걷는 빠르기로 갑니다. "
        "세 사람이 동시에 출발하였을 때, 동호는 희선이를 만나고 몇 초 후에 민정이를 만나게 되는지 구하시오."
    )
    return {
        "id": f"applied9-q26-v{variant}", "genId": "applied9-q26",
        "sourceSet": "applied", "sourceRound": 9, "sourceNo": 26,
        "variantNo": variant, "reviewStatus": "verified",
        "area": "수와 식", "subarea": "속력과 만남",
        "detailType": "세 사람의 직선 운동에서 두 차례 만남 시각의 차 구하기",
        "pointBand": "4.2", "text": text,
        "answer": str(elapsed), "answerParts": [elapsed],
        "answerLabels": ["동호가 희선이를 만난 뒤 민정이를 만날 때까지의 시간"],
        "acceptedAnswers": [str(elapsed)], "answerContract": "single-number",
        "asset": {
            "kind": "image", "src": "assets/applied9/q26-source-distances.png",
            "description": "활용 9회 원문 26번의 민정-희선 215m, 희선-동호 420m 직선 도식 원본 크롭",
            "sha256": crop_hash,
        },
        "solutionSteps": steps, "solution": " ".join(steps),
        "learningPoint": "서로 반대 방향으로 움직이는 두 사람의 상대 속력으로 만남 시각을 구하고 두 시각의 차 계산하기",
        "learningLocation": "활용 9회 · 원문 26번 · 속력과 만남",
        "verification": {
            "primaryMethod": "두 만남에 대해 상대 속력과 초기 거리를 사용하여 각 만남 시각을 구한 뒤 차를 계산한다.",
            "independentMethod": "직선 좌표를 두고 위치식을 각각 세워 동호=희선, 동호=민정의 두 방정식을 풀이한 다음 두 해의 차를 비교한다.",
            "parameters": {
                "initialMinjeongHeeseonDistance": 215,
                "initialHeeseonDonghoDistance": 420,
                "initialMinjeongDonghoDistance": 635,
                "minjeongSpeed": m, "heeseonSpeed": h, "donghoSpeed": d,
                "heeseonDonghoMeetingSeconds": first_meeting,
                "minjeongDonghoMeetingSeconds": second_meeting,
                "elapsedSeconds": elapsed,
                "sourceFigureCropSha256": crop_hash,
            },
            "independentSuite": "qa/applied9-q26-independent-validate.py",
            "sourceExamPage": 5,
            "sourceExamFile": "초등과정 대비 실전 모의고사 활용 9회.pdf",
            "sourceExamSha256": SOURCE_HASH,
            "sourceAnswerPage": 5,
            "sourceAnswerFile": "초등과정 대비 실전 모의고사 특강 9회 답안.pdf",
            "sourceAnswerDriveId": ANSWER_DRIVE_ID,
            "sourceAnswerSha256": ANSWER_HASH,
            "officialAnswerStatus": "Candidate page 5 handwritten result is 57 seconds for the source values; independent equations reproduce it. Candidate page matches the problem layout, but official edition identity remains unconfirmed.",
            "sourceDrawingCompared": True, "sourceDrawingPresent": True,
            "sourceDrawingDescription": "Opened the exact Q26 text and figure on source PDF printed page 5. The original line diagram and labels 215m and 420m are reused as a byte-identical crop; no drawing element is changed.",
            "variantUsesSourceDrawing": True,
            "variantDrawingModified": False,
            "studentDifficultyMeasured": False,
        },
        "difficultyEvidence": {
            "basis": "source-point-band", "label": "상",
            "sourceReasoningPreserved": True, "measuredVariantRate": None,
            "estimated": False,
            "rationale": "활용 9회 원문 25~30번의 4.2점 배점대이며 활용 난도는 배점대만 적용한다.",
        },
    }


def main():
    crop_hash = crop_source_figure()
    additions = [make_item(i, *speeds, crop_hash) for i, speeds in enumerate(SPEEDS, 1)]
    data = json.loads(DATA.read_text())
    index = json.loads(INDEX.read_text())
    assert data["version"].endswith("-r8") and index["version"] == data["version"]
    assert 26 in data["pendingSourceNos"] and not any(x["sourceNo"] == 26 for x in data["items"])
    items = sorted(data["items"] + additions, key=lambda x: (x["sourceNo"], x["variantNo"]))
    available = sorted({x["sourceNo"] for x in items})
    pending = [n for n in range(1, 31) if n not in available]
    data.update(version=VERSION, items=items, itemCount=len(items),
                availableSourceNos=available, pendingSourceNos=pending)
    data["sourceReview"].setdefault("questionReviews", {})["26"] = {
        "sourcePage": 5, "initialDistancesMeters": [215, 420],
        "sourceSpeedsMetersPerSecond": {"minjeong": 3, "heeseon": 4, "dongho": 2},
        "candidateAnswerSeconds": 57, "independentAnswerSeconds": 57,
        "status": "candidate handwritten result matches independent coordinate equations; candidate official edition identity unconfirmed; original unchanged",
    }
    data["sourceReview"]["questionReviews"]["27"]["status"] = (
        "Source Q27 is the 3×3×3 dice stack; candidate page agrees with independent contact-pair count. "
        "User explicitly confirmed '27번 주사위 (추천)' after source-number clarification and approved nine new variant figures. "
        "Original drawing remains unchanged; candidate official edition identity is unconfirmed."
    )
    index.update(version=VERSION, itemCount=len(items), availableSourceNos=available,
                 pendingSourceNos=pending)
    index["items"].append({
        "sourceNo": 26, "genId": "applied9-q26", "area": "수와 식",
        "subarea": "속력과 만남",
        "detailType": "세 사람의 직선 운동에서 두 차례 만남 시각의 차 구하기",
        "pointBand": "4.2", "reviewStatus": "verified", "variantCount": 9,
    })
    index["items"].sort(key=lambda x: x["sourceNo"])
    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    INDEX.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"status": "BUILT", "version": VERSION, "added": 9,
                      "total": len(items), "pending": pending,
                      "answers": [int(x["answer"]) for x in additions],
                      "sourceCropSha256": crop_hash}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

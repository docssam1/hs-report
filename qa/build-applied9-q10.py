#!/usr/bin/env python3
"""Build nine Q10 variants from the exact, unchanged source-card crop."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "bank/data/applied9-expanded.json"
INDEX = ROOT / "bank/data/applied9-expanded-index.json"
ASSET = ROOT / "bank/assets/applied9/q10-original-crop.png"
SOURCE = ROOT / "materials/초등과정 대비 실전 모의고사 활용 9회.pdf"
ANSWER = ROOT / ".private-work/hw-expansion-20261023/hw9/candidate-special-9-answer.pdf"
SOURCE_RENDER = ROOT / ".private-work/hw-expansion-20261023/hw9/q08-review/source-2.png"
SOURCE_SHA = "0e32749d028cdcacd9e61d2b1d1cb5080266ac672a9a3ed17503270a74142794"
ANSWER_SHA = "a6648f008a8e7ba7012913ede0cbad488aec782eaa06818a97acfb6900ac8d62"
SOURCE_RENDER_SHA = "5f9b6bf963ac2300331c062888ac01a8803c6452d9a3af349eb295d1b20af0ba"
ASSET_SHA = "af0c9380b9a3ab8f115f30bc386e5588259bf05b9d79a4fbca6c023536f57214"
VERSION = "20261025-applied9-q02-q06-q07-q10-q11-q13-q17-q19-q21-q27-q29-q30-r8"


def derive_by_period(sum_value):
    # The equal sum of adjacent triples forces a[i] == a[i+3].
    repeating = [8, 2, sum_value - 10]
    row = [repeating[i % 3] for i in range(15)]
    assert row[4] == 2 and row[12] == 8 and row[8] == sum_value - 10
    assert all(sum(row[i:i+3]) == sum_value for i in range(13))
    return row[8], row


def variants():
    out = []
    for variant, total in enumerate(range(11, 20), 1):
        answer, row = derive_by_period(total)
        steps = [
            f"연속한 세 장의 합이 모두 {total}이므로, 이웃한 두 묶음의 합을 비교하면 세 칸 떨어진 카드의 수는 같습니다.",
            "따라서 1·4·7·10·13번째 카드의 수는 모두 8이고, 2·5·8·11·14번째 카드의 수는 모두 2입니다.",
            f"1·2·3번째 카드의 합이 {total}이므로 3번째 카드의 수는 {total}−8−2={answer}입니다. 9번째 카드는 3번째 카드와 세 칸 간격이므로 같은 수입니다.",
            f"따라서 9번째 카드에 적힌 수는 {answer}입니다.",
        ]
        out.append({
            "id": f"applied9-q10-v{variant}", "genId": "applied9-q10",
            "sourceSet": "applied", "sourceRound": 9, "sourceNo": 10,
            "variantNo": variant, "reviewStatus": "verified",
            "area": "수와 식", "subarea": "반복되는 수의 규칙",
            "detailType": "연속한 세 수의 합이 같을 때 일정한 간격의 항 찾기",
            "pointBand": "2.7",
            "text": f"15장의 수 카드에서 연속한 세 장에 적힌 수의 합이 모두 {total}이 되도록 한 줄로 놓았습니다. 왼쪽에서 다섯 번째 카드에는 2가, 오른쪽에서 세 번째 카드에는 8이 적혀 있습니다. 왼쪽에서 아홉 번째 카드에 적힌 수는 얼마입니까?",
            "answer": str(answer), "answerParts": [answer], "answerLabels": ["수"],
            "acceptedAnswers": [str(answer)], "answerContract": "single-number",
            "asset": {"kind": "raster", "src": "assets/applied9/q10-original-crop.png",
                      "sha256": ASSET_SHA,
                      "description": "활용 9회 원문 10번의 카드 15장 그림(원문 PDF에서 영역만 크롭)"},
            "solutionSteps": steps, "solution": " ".join(steps),
            "learningPoint": "연속한 세 항의 합이 같다는 식을 비교해 세 칸 간격으로 같은 수가 반복됨을 찾기",
            "learningLocation": "활용 9회 · 원문 10번 · 연속한 세 수의 합과 반복 규칙",
            "verification": {
                "primaryMethod": "연속한 두 개의 세 카드 합을 빼면 첫 카드와 네 번째 카드가 같아져 세 칸 주기의 반복을 얻는다.",
                "independentMethod": "15개 위치와 13개의 연속 세 카드 합, 5번째·13번째 카드 값을 연립방정식으로 세워 정확한 가우스 소거를 했다.",
                "parameters": {"cardCount": 15, "tripleSum": total, "knownCard5": 2,
                               "knownCard13": 8, "targetCard": 9, "answer": answer,
                               "oneWitnessSequence": row},
                "independentSuite": "qa/applied9-q10-independent-validate.py",
                "sourceExamPage": 2, "sourceExamFile": "초등과정 대비 실전 모의고사 활용 9회.pdf",
                "sourceExamSha256": SOURCE_SHA, "sourceAnswerPage": 2,
                "sourceAnswerFile": "초등과정 대비 실전 모의고사 특강 9회 답안.pdf",
                "sourceAnswerDriveId": "1M7rJHVE11w4BZF5OHjZegDLcGGlmxKp4",
                "sourceAnswerSha256": ANSWER_SHA,
                "officialAnswerStatus": "답안 후보 2쪽의 손글씨 답 4는 원문 tripleSum=14에서 독립 계산으로 재현된다. 답안 후보의 공식성은 미확인.",
                "sourceDrawingCompared": True, "sourceDrawingPresent": True,
                "sourceDrawingAssetSha256": ASSET_SHA, "variantUsesSourceDrawing": True,
                "variantDrawingModified": False, "studentDifficultyMeasured": False,
                "sourceCrop": {"sourceRenderedPage": ".private-work/hw-expansion-20261023/hw9/q08-review/source-2.png",
                               "sourceRenderedPageSha256": SOURCE_RENDER_SHA,
                               "sourcePage": 2,
                               "cropPixels": {"top": 435, "left": 880, "height": 90, "width": 740},
                               "cropOnly": True, "rescaled": False, "redrawn": False}
            },
            "difficultyEvidence": {"basis": "source-point-band", "label": "하",
                                   "sourceReasoningPreserved": True, "measuredVariantRate": None,
                                   "estimated": False,
                                   "rationale": "활용 9회 원문 1~12번의 2.7점 배점대다. 활용 난도는 배점대만 적용한다."},
        })
    return out


def main():
    for path, expected in ((SOURCE, SOURCE_SHA), (ANSWER, ANSWER_SHA),
                           (SOURCE_RENDER, SOURCE_RENDER_SHA), (ASSET, ASSET_SHA)):
        if hashlib.sha256(path.read_bytes()).hexdigest() != expected:
            raise SystemExit(f"Source file changed; stop for review: {path}")
    out = variants()
    data, index = json.loads(DATA.read_text()), json.loads(INDEX.read_text())
    items = [x for x in data["items"] if x["sourceNo"] != 10] + out
    items.sort(key=lambda x: (x["sourceNo"], x["variantNo"]))
    available = sorted({x["sourceNo"] for x in items})
    pending = [n for n in range(1, 31) if n not in available]
    data.update(version=VERSION, items=items, itemCount=len(items),
                availableSourceNos=available, pendingSourceNos=pending)
    data["sourceReview"].setdefault("questionReviews", {})["10"] = {
        "sourceTripleSum": 14, "sourceKnownCard5": 2, "sourceKnownCard13": 8,
        "candidateAnswer": 4, "independentAnswer": 4,
        "status": "candidate answer agrees with independent linear-system solution; official status unconfirmed; original unchanged"}
    index.update(version=VERSION, itemCount=len(items), availableSourceNos=available,
                 pendingSourceNos=pending)
    index["items"] = [x for x in index["items"] if x["sourceNo"] != 10]
    first = out[0]
    index["items"].append({"sourceNo": 10, "genId": "applied9-q10", "area": first["area"],
                           "subarea": first["subarea"], "detailType": first["detailType"],
                           "pointBand": first["pointBand"], "reviewStatus": "verified", "variantCount": 9})
    index["items"].sort(key=lambda x: x["sourceNo"])
    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    INDEX.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"status": "BUILT", "version": VERSION, "newItems": len(out),
                      "totalItems": len(items), "availableSourceNos": available,
                      "pendingSourceNos": pending, "answers": [x["answer"] for x in out]},
                     ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

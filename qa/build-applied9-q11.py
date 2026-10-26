#!/usr/bin/env python3
"""Build nine Applied 9 Q11 quotient-and-remainder counting variants.

The five source digit cards are reused from an exact crop of exam page 2.
No source artwork is redrawn or edited.
"""
import hashlib
import json
from itertools import permutations
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "bank/data/applied9-expanded.json"
INDEX = ROOT / "bank/data/applied9-expanded-index.json"
ASSET = ROOT / "bank/assets/applied9/q11-source-cards.png"
SOURCE = ROOT / "materials/초등과정 대비 실전 모의고사 활용 9회.pdf"
ANSWER = ROOT / ".private-work/hw-expansion-20261023/hw9/candidate-special-9-answer.pdf"
SOURCE_SHA = "0e32749d028cdcacd9e61d2b1d1cb5080266ac672a9a3ed17503270a74142794"
ANSWER_SHA = "a6648f008a8e7ba7012913ede0cbad488aec782eaa06818a97acfb6900ac8d62"
SOURCE_RENDER = ROOT / ".private-work/hw-expansion-20261023/hw9/q08-review/source-2.png"
SOURCE_RENDER_SHA = "5f9b6bf963ac2300331c062888ac01a8803c6452d9a3af349eb295d1b20af0ba"
ANSWER_DRIVE_ID = "1M7rJHVE11w4BZF5OHjZegDLcGGlmxKp4"
VERSION = "20261025-applied9-q02-q06-q07-q10-q11-q13-q17-q19-q21-q27-q29-q30-r8"
DIGITS = (5, 2, 4, 8, 6)
PARAMETERS = [(12, 37), (12, 22), (12, 20), (13, 19), (14, 18),
              (17, 50), (24, 35), (35, 13), (28, 30)]


def solutions_by_permutation(divisor, quotient):
    values = sorted(100 * a + 10 * b + c for a, b, c in permutations(DIGITS, 3)
                    if (100 * a + 10 * b + c) // divisor == quotient
                    and (100 * a + 10 * b + c) % divisor != 0)
    return values


def solutions_by_interval(divisor, quotient):
    """Independent check using qd < N < (q+1)d, without division/remainder."""
    lo, hi = quotient * divisor, (quotient + 1) * divisor
    values = []
    for hundreds in DIGITS:
        for tens in DIGITS:
            for ones in DIGITS:
                if len({hundreds, tens, ones}) != 3:
                    continue
                number = 100 * hundreds + 10 * tens + ones
                if lo < number < hi:
                    values.append(number)
    return sorted(values)


def build_items(asset_sha):
    if hashlib.sha256(SOURCE.read_bytes()).hexdigest() != SOURCE_SHA:
        raise SystemExit("Applied9 source PDF changed; stop for a new source review.")
    if hashlib.sha256(ANSWER.read_bytes()).hexdigest() != ANSWER_SHA:
        raise SystemExit("Applied9 answer candidate changed; stop for a new answer review.")
    if hashlib.sha256(SOURCE_RENDER.read_bytes()).hexdigest() != SOURCE_RENDER_SHA:
        raise SystemExit("Applied9 Q11 source-page render changed; stop and recheck the figure crop.")
    if hashlib.sha256(ASSET.read_bytes()).hexdigest() != asset_sha:
        raise SystemExit("Applied9 Q11 card crop changed unexpectedly.")
    all_permutations = sorted(100 * a + 10 * b + c for a, b, c in permutations(DIGITS, 3))
    assert len(all_permutations) == 60 and len(set(all_permutations)) == 60
    out = []
    for variant, (divisor, quotient) in enumerate(PARAMETERS, 1):
        candidates = solutions_by_permutation(divisor, quotient)
        interval_candidates = solutions_by_interval(divisor, quotient)
        assert candidates == interval_candidates and candidates
        lo, hi = quotient * divisor, (quotient + 1) * divisor
        steps = [
            f"카드 {5}장 중 서로 다른 카드 3장을 골라 만들 수 있는 세 자리 수는 {len(all_permutations)}개입니다.",
            f"{divisor}로 나누어 몫이 {quotient}이고 나머지가 0이 아니려면 세 자리 수 N은 {lo}보다 크고 {hi}보다 작아야 합니다.",
            f"카드 숫자를 중복 없이 놓아 이 범위에 드는 수를 모두 찾으면 {', '.join(map(str, candidates))}입니다.",
            f"따라서 조건에 맞는 수는 모두 {len(candidates)}개입니다.",
        ]
        out.append({
            "id": f"applied9-q11-v{variant}", "genId": "applied9-q11",
            "sourceSet": "applied", "sourceRound": 9, "sourceNo": 11,
            "variantNo": variant, "reviewStatus": "verified",
            "area": "경우의 수", "subarea": "수 만들기와 조건에 맞는 경우 세기",
            "detailType": "서로 다른 숫자 카드로 만든 세 자리 수의 몫·나머지 조건을 만족하는 수 세기",
            "pointBand": "2.7",
            "text": f"수 카드 5, 2, 4, 8, 6 중 서로 다른 3장을 한 번씩 사용하여 세 자리 수를 만들었습니다. 이 수를 {divisor}로 나누었을 때 몫이 {quotient}이고 나머지가 0이 아닌 경우, 가능한 수는 몇 개입니까?",
            "answer": str(len(candidates)), "answerParts": [str(len(candidates))],
            "answerLabels": ["가능한 수의 개수"], "acceptedAnswers": [str(len(candidates))],
            "answerContract": "single-number",
            "asset": {"kind": "raster", "src": "assets/applied9/q11-source-cards.png",
                      "sha256": asset_sha,
                      "description": "활용 9회 원문 11번의 숫자 카드 5·2·4·8·6(원문 PDF에서 영역만 크롭)"},
            "solutionSteps": steps, "solution": " ".join(steps),
            "learningPoint": "몫과 나머지 조건을 곱셈식으로 범위화하고, 주어진 숫자 카드로 만들 수를 빠짐없이 세기",
            "learningLocation": "활용 9회 · 원문 11번 · 수 카드와 몫·나머지 조건",
            "verification": {
                "primaryMethod": "서로 다른 세 카드의 순열 60개를 만들고 나눗셈의 몫·나머지 조건을 직접 적용했다.",
                "independentMethod": "N=dq+r, 1≤r<d를 사용해 dq<N<(q+1)d인 구간을 구한 뒤 세 카드의 모든 순서와 대조했다.",
                "parameters": {"digits": list(DIGITS), "availableThreeDigitNumbers": len(all_permutations),
                               "divisor": divisor, "quotient": quotient, "quotientIntervalOpen": [lo, hi],
                               "candidateNumbers": candidates, "candidateCount": len(candidates)},
                "independentSuite": "qa/applied9-q11-independent-validate.py",
                "sourceExamPage": 2, "sourceExamFile": "초등과정 대비 실전 모의고사 활용 9회.pdf",
                "sourceExamSha256": SOURCE_SHA, "sourceAnswerPage": 2,
                "sourceAnswerFile": "초등과정 대비 실전 모의고사 특강 9회 답안.pdf",
                "sourceAnswerDriveId": ANSWER_DRIVE_ID, "sourceAnswerSha256": ANSWER_SHA,
                "officialAnswerStatus": "답안 후보 2쪽의 손글씨 답은 6이며 독립 전수 계산도 6이다. 답안 후보의 공식성은 확인하지 않았다.",
                "sourceDrawingCompared": True, "sourceDrawingPresent": True,
                "sourceDrawingAssetSha256": asset_sha, "variantUsesSourceDrawing": True,
                "variantDrawingModified": False, "studentDifficultyMeasured": False,
                "sourceCrop": {"sourceRenderedPage": ".private-work/hw-expansion-20261023/hw9/q08-review/source-2.png",
                               "sourceRenderedPageSha256": SOURCE_RENDER_SHA,
                               "sourcePage": 2, "cropPixels": {"top": 1135, "left": 1000, "height": 120, "width": 500},
                               "cropOnly": True, "rescaled": False, "redrawn": False}
            },
            "difficultyEvidence": {"basis": "source-point-band", "label": "하",
                                   "sourceReasoningPreserved": True, "measuredVariantRate": None,
                                   "estimated": False,
                                   "rationale": "활용 9회 원문 1~12번의 2.7점 배점대다. 활용 난도는 배점대만 적용한다."},
        })
    original = solutions_by_permutation(26, 32)
    assert original == [842, 845, 846, 852, 854, 856]
    assert len(out) == 9 and len({x["answer"] for x in out}) == 9
    return out, original


def main():
    if not ASSET.exists():
        raise SystemExit(f"Exact source crop is missing: {ASSET}")
    asset_sha = hashlib.sha256(ASSET.read_bytes()).hexdigest()
    variants, original_candidates = build_items(asset_sha)
    data, index = json.loads(DATA.read_text()), json.loads(INDEX.read_text())
    items = [x for x in data["items"] if x["sourceNo"] != 11] + variants
    items.sort(key=lambda x: (x["sourceNo"], x["variantNo"]))
    available = sorted({x["sourceNo"] for x in items})
    pending = [n for n in range(1, 31) if n not in available]
    data.update(version=VERSION, items=items, itemCount=len(items),
                availableSourceNos=available, pendingSourceNos=pending)
    data["sourceReview"].setdefault("questionReviews", {})["11"] = {
        "printedDivisor": 26, "printedQuotient": 32, "printedRemainderCondition": "nonzero",
        "candidateAnswer": 6, "independentAnswer": len(original_candidates),
        "candidateNumbers": original_candidates,
        "status": "candidate answer agrees with independent exhaustive check; answer candidate official status unconfirmed; original unchanged"}
    index.update(version=VERSION, itemCount=len(items), availableSourceNos=available,
                 pendingSourceNos=pending)
    index["items"] = [x for x in index["items"] if x["sourceNo"] != 11]
    first = variants[0]
    index["items"].append({"sourceNo": 11, "genId": "applied9-q11", "area": first["area"],
                           "subarea": first["subarea"], "detailType": first["detailType"],
                           "pointBand": first["pointBand"], "reviewStatus": "verified", "variantCount": 9})
    index["items"].sort(key=lambda x: x["sourceNo"])
    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    INDEX.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"status": "BUILT", "version": VERSION, "newItems": 9,
                      "totalItems": len(items), "availableSourceNos": available,
                      "pendingSourceNos": pending,
                      "originalCandidates": original_candidates,
                      "variants": [{"divisor": x["verification"]["parameters"]["divisor"],
                                    "quotient": x["verification"]["parameters"]["quotient"],
                                    "candidates": x["verification"]["parameters"]["candidateNumbers"],
                                    "answer": x["answer"]} for x in variants]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

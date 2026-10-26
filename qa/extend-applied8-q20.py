#!/usr/bin/env python3
"""Add nine variants of Applied 8 Q20's grouped fraction sequence."""
from __future__ import annotations

import hashlib
import json
from math import gcd
import shutil
from pathlib import Path

from PIL import Image
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw8"
EXAM = ROOT / "materials/초등과정 대비 실전 모의고사활용 8회.pdf"
ANSWER = WORK / "source-review/applied8-answer-drive-copy.pdf"
PAGE_RENDER = WORK / "source-review/q16-exam-4.png"
SOURCE_CROP = WORK / "source-review/q20-fraction-crop-candidate.png"
ASSET = ROOT / "bank/assets/applied8/q20-fraction-sequence-original.png"
DATA_PATH = ROOT / "bank/data/applied8-expanded.json"
INDEX_PATH = ROOT / "bank/data/applied8-expanded-index.json"
REVIEW = WORK / "q20-source-review.json"
VERSION = "20261025-applied8-expansion-q13-q14-q15-q17-q18-q20-q21-q22-q23-r9"
ORDINAL_PAIRS = [(32, 41), (37, 48), (42, 53), (45, 55), (47, 57), (50, 61), (57, 69), (63, 76), (72, 87)]


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def term_at(index: int) -> tuple[int, int, int]:
    """Return numerator, denominator, and completed preceding terms."""
    if index < 1:
        raise ValueError("Sequence positions are one-based.")
    denominator = 1
    while denominator * (denominator + 1) // 2 < index:
        denominator += 1
    preceding = (denominator - 1) * denominator // 2
    numerator = index - preceding
    assert 1 <= numerator <= denominator
    return numerator, denominator, preceding


def make_item(pair: tuple[int, int], variant: int) -> dict:
    n1, n2 = pair
    a_num, a_den, a_before = term_at(n1)
    b_num, b_den, b_before = term_at(n2)
    a, b = f"{a_num}/{a_den}", f"{b_num}/{b_den}"
    reduced = [f"{a_num // gcd(a_num, a_den)}/{a_den // gcd(a_num, a_den)}", f"{b_num // gcd(b_num, b_den)}/{b_den // gcd(b_num, b_den)}"]
    steps = [
        f"분모가 1인 묶음에는 1개, 분모가 2인 묶음에는 2개, 분모가 3인 묶음에는 3개가 있습니다. 따라서 분모가 n인 묶음까지의 항 수는 1+2+…+n=n(n+1)÷2입니다.",
        f"{n1}번째 항 앞에는 {a_before}개가 있습니다. {n1}−{a_before}={a_num}이므로 {n1}번째 항은 분모가 {a_den}인 묶음의 {a_num}번째이고, 분수는 {a_num}/{a_den}입니다.",
        f"{n2}번째 항 앞에는 {b_before}개가 있습니다. {n2}−{b_before}={b_num}이므로 {n2}번째 항은 분모가 {b_den}인 묶음의 {b_num}번째이고, 분수는 {b_num}/{b_den}입니다.",
        f"따라서 구하는 분수는 {n1}번째 {a}, {n2}번째 {b}입니다.",
    ]
    return {
        "id": f"applied8-q20-v{variant}",
        "genId": "applied8-q20",
        "sourceSet": "applied",
        "sourceRound": 8,
        "sourceNo": 20,
        "variantNo": variant,
        "reviewStatus": "verified",
        "area": "수와 식",
        "subarea": "규칙과 대응",
        "detailType": "분모별 묶음의 누적 항 수로 분수열의 특정 항 찾기",
        "pointBand": "3.4",
        "text": f"아래 그림과 같이 일정한 규칙에 따라 나열된 분수가 있습니다. {n1}번째 분수와 {n2}번째 분수를 각각 구하세요.",
        "asset": {
            "kind": "raster",
            "src": "assets/applied8/q20-fraction-sequence-original.png",
            "description": "활용 8회 원문 20번에 제시된 분수열 그림을 그대로 사용",
        },
        "answer": f"{a}, {b}",
        "answerParts": [a, b],
        "answerLabels": [f"{n1}번째 분수", f"{n2}번째 분수"],
        "acceptedAnswers": [f"{a}, {b}", f"{a} {b}"],
        "acceptedAnswerParts": [[a, b], reduced] if reduced != [a, b] else None,
        "answerContract": "ordered-parts",
        "solutionSteps": steps,
        "solution": " ".join(steps),
        "learningPoint": "분모별로 묶인 항의 누적 개수를 삼각수로 나타내고 목표 순번이 속한 묶음과 위치를 찾기",
        "learningLocation": "활용 8회 · 원문 20번 · 분모별로 묶인 분수열의 순번 찾기",
        "verification": {
            "primaryMethod": "삼각수 T_n=n(n+1)/2와 목표 순번을 비교해 각 항의 묶음과 묶음 안 순번을 구한다.",
            "independentMethod": "각 목표 순번의 앞뒤 삼각수를 직접 계산하고, 묶음 안 순번을 차감해 분수열을 순서대로 재구성한다.",
            "parameters": {
                "targetOrdinals": [n1, n2],
                "firstPreviousGroupTerms": a_before,
                "firstGroupDenominator": a_den,
                "firstPositionInGroup": a_num,
                "firstFraction": a,
                "secondPreviousGroupTerms": b_before,
                "secondGroupDenominator": b_den,
                "secondPositionInGroup": b_num,
                "secondFraction": b,
            },
            "independentSuite": "qa/applied8-q20-independent-validate.py",
            "sourceExamPage": 4,
            "sourceExamFile": EXAM.name,
            "sourceAnswerPage": 4,
            "sourceDrawingCompared": True,
            "sourceDrawingPresent": True,
            "variantUsesSourceDrawing": True,
            "sourceDrawingAssetSha256": sha256(ASSET),
            "officialAnswerStatus": "The available Drive PDF titled as the answer PDF is a blank exam duplicate with no marked Q20 key. The original and variants were independently calculated from the printed sequence.",
            "studentDifficultyMeasured": False,
        },
        "difficultyEvidence": {
            "basis": "source-point-band",
            "label": "중",
            "sourceReasoningPreserved": True,
            "measuredVariantRate": None,
            "estimated": False,
            "rationale": "활용 8회 원문 20번은 13~22번의 3.4점 배점대다. 활용 난도는 배점대만 적용한다.",
        },
    }


def main() -> None:
    for p in (EXAM, ANSWER, PAGE_RENDER, SOURCE_CROP):
        if not p.is_file():
            raise SystemExit(f"Required reviewed source is missing: {p}")
    exam_text = PdfReader(str(EXAM)).pages[3].extract_text()
    answer_text = PdfReader(str(ANSWER)).pages[3].extract_text()
    compact = "".join(exam_text.split())
    if not all(t in compact for t in ("아래그림과같일정한규칙에따라나열된분수가있습니다", "47", "57", "각각구하세요")):
        raise SystemExit("Exact source Q20 prompt on page 4 did not match.")
    if answer_text != exam_text:
        raise SystemExit("The answer candidate differs from source page 4; inspect before proceeding.")
    page = Image.open(PAGE_RENDER).convert("RGB")
    exact = page.crop((1360, 1500, 2260, 1760))
    candidate = Image.open(SOURCE_CROP).convert("RGB")
    if exact.size != candidate.size or exact.tobytes() != candidate.tobytes():
        raise SystemExit("Reviewed Q20 crop is not a pixel-exact crop of source PDF page 4.")
    ASSET.parent.mkdir(parents=True, exist_ok=True)
    if ASSET.exists():
        saved = Image.open(ASSET).convert("RGB")
        if saved.size != exact.size or saved.tobytes() != exact.tobytes():
            raise SystemExit("Existing Q20 asset differs from source crop; refusing to overwrite it.")
    else:
        shutil.copyfile(SOURCE_CROP, ASSET)

    data = json.loads(DATA_PATH.read_text())
    index = json.loads(INDEX_PATH.read_text())
    existing = [x for x in data["items"] if x["sourceNo"] == 20]
    if existing and len(existing) != 9:
        raise SystemExit(f"Q20 has {len(existing)} existing records, not 9; inspect before rebuilding.")
    variants = [make_item(pair, i + 1) for i, pair in enumerate(ORDINAL_PAIRS)]
    data["version"] = VERSION
    data["items"] = [x for x in data["items"] if x["sourceNo"] != 20] + variants
    data["items"].sort(key=lambda x: (x["sourceNo"], x["variantNo"]))
    data["itemCount"] = len(data["items"])
    data["availableSourceNos"] = sorted(set(data["availableSourceNos"] + [20]))
    data["pendingSourceNos"] = [n for n in range(1, 31) if n not in data["availableSourceNos"]]
    index["version"] = VERSION
    index["itemCount"] = len(data["items"])
    index["pendingSourceNos"] = data["pendingSourceNos"]
    index["items"] = [x for x in index["items"] if x["sourceNo"] != 20]
    index["items"].append({
        "sourceNo": 20,
        "genId": "applied8-q20",
        "area": "수와 식",
        "subarea": "규칙과 대응",
        "detailType": "분모별 묶음의 누적 항 수로 분수열의 특정 항 찾기",
        "pointBand": "3.4",
        "reviewStatus": "verified",
        "variantCount": 9,
    })
    index["items"].sort(key=lambda x: x["sourceNo"])
    DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    INDEX_PATH.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")

    source_terms = {n: term_at(n)[:2] for n in (47, 57)}
    if source_terms != {47: (2, 10), 57: (2, 11)}:
        raise AssertionError(f"Independent source answer mismatch: {source_terms}")
    review = {
        "sourceExam": {
            "file": EXAM.name,
            "sha256": sha256(EXAM),
            "page": 4,
            "questionNo": 20,
            "directVisualReview": True,
            "prompt": "분모 1, 2, 3, 4의 묶음에 각각 1, 2, 3, 4개 항이 놓이는 분수열에서 47번째와 57번째 항을 묻는다.",
            "printedFigure": {
                "sourcePageRender": str(PAGE_RENDER.relative_to(ROOT)),
                "sourcePageRenderSha256": sha256(PAGE_RENDER),
                "cropCoordinatesPx": [1360, 1500, 2260, 1760],
                "asset": str(ASSET.relative_to(ROOT)),
                "assetSha256": sha256(ASSET),
                "dimensionsPx": list(Image.open(ASSET).size),
                "pixelExactCropVerified": True,
                "visibleSequence": ["1", "1/2", "1", "1/3", "2/3", "1", "1/4", "2/4", "3/4"],
            },
        },
        "answerCandidate": {
            "file": ANSWER.name,
            "sha256": sha256(ANSWER),
            "page": 4,
            "directVisualReview": True,
            "containsAnswers": False,
            "comparison": "Page 4 is a blank problem-page duplicate; the printed response line has no marked answer. Extracted source and candidate page text match. No separate marked key was available in that PDF.",
        },
        "sourceIndependentSolution": {
            "triangularCount": "T_n=n(n+1)/2 terms through denominator n",
            "ordinal47": {"previousTerms": 45, "groupDenominator": 10, "positionInGroup": 2, "fraction": "2/10"},
            "ordinal57": {"previousTerms": 55, "groupDenominator": 11, "positionInGroup": 2, "fraction": "2/11"},
            "answer": ["2/10", "2/11"],
            "check": "The 10th-denominator group occupies positions 46–55; the 11th group occupies positions 56–66.",
        },
        "answerSourceConclusion": "The available Drive answer PDF is an unmarked copy of the question page. Source and variant answers were independently derived from the shown sequence.",
        "variantCount": len(variants),
        "ordinalPairs": [list(x) for x in ORDINAL_PAIRS],
        "variantAnswers": [x["answerParts"] for x in variants],
        "variantsIndependentlyCalculated": True,
        "sourceDrawingReusedPixelExact": True,
        "newSourceTypes": 0,
        "difficulty": "3.4-point band only = middle",
    }
    REVIEW.write_text(json.dumps(review, ensure_ascii=False, indent=2) + "\n")
    print(f"Added 9 Q20 variants; {len(data['items'])} items across {len(data['availableSourceNos'])} existing source types; original answers are 2/10 and 2/11.")


if __name__ == "__main__":
    main()

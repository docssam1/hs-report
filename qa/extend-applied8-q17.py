#!/usr/bin/env python3
"""Add nine Applied 8 Q17 growing alternating-group variants, reusing source art."""
from __future__ import annotations

import hashlib
import json
import shutil
from pathlib import Path

from PIL import Image
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw8"
EXAM = ROOT / "materials/초등과정 대비 실전 모의고사활용 8회.pdf"
ANSWER = WORK / "source-review/applied8-answer-drive-copy.pdf"
PAGE_RENDER = WORK / "source-review/q16-exam-4.png"
SOURCE_CROP = WORK / "source-review/q17-sequence-crop.png"
ASSET = ROOT / "bank/assets/applied8/q17-sequence-original.png"
OUT = ROOT / "bank/data/applied8-expanded.json"
INDEX = ROOT / "bank/data/applied8-expanded-index.json"
REVIEW = WORK / "q17-source-review.json"
VERSION = "20261025-applied8-expansion-q13-q14-q15-q17-q18-q20-q21-q22-q23-r9"
TOTALS = [300, 353, 420, 455, 528, 590, 606, 650, 720]


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def white_count(total: int) -> tuple[int, int, int, int]:
    """Return white total, completed pair count, remaining, and next white group."""
    k = 0
    while (k + 1) * (k + 2) <= total:
        k += 1
    complete_total = k * (k + 1)
    remaining = total - complete_total
    completed_white = k * (k + 1) // 2
    next_white = max(0, remaining - (k + 1))
    return completed_white + next_white, k, remaining, next_white


def make_item(total: int, variant: int) -> dict:
    answer, k, remaining, next_white = white_count(total)
    complete_total = k * (k + 1)
    completed_white = k * (k + 1) // 2
    steps = [
        f"그림에서 검은색과 흰색은 1개씩, 2개씩, 3개씩 차례로 한 묶음씩 놓입니다. {k}개씩인 한 쌍까지 놓으면 전체는 2×(1+2+…+{k})={complete_total}개이고, 흰색은 1+2+…+{k}={completed_white}개입니다.",
    ]
    if remaining == 0:
        steps.append(f"남은 돌은 {total}−{complete_total}=0개이므로 다음 묶음은 시작하지 않습니다.")
        steps.append("따라서 이 뒤에 더 놓인 흰색 바둑돌은 0개입니다.")
    elif remaining <= k + 1:
        steps.append(f"남은 돌은 {total}−{complete_total}={remaining}개입니다. 다음 검은색 묶음은 {k+1}개이므로 남은 돌은 이 검은색 묶음의 일부입니다.")
        steps.append("다음 흰색 묶음은 시작하지 않았으므로 남은 부분에서 흰색 바둑돌은 0개입니다.")
    else:
        steps.append(f"남은 돌은 {total}−{complete_total}={remaining}개입니다. 다음 검은색 묶음 {k+1}개를 놓고 나면 {remaining}−{k+1}={next_white}개가 남아 흰색 묶음에 들어갑니다.")
        steps.append(f"따라서 남은 부분의 흰색 바둑돌은 {next_white}개입니다.")
    steps.append(f"따라서 흰색 바둑돌은 {completed_white}+{next_white}={answer}개입니다.")
    return {
        "id": f"applied8-q17-v{variant}",
        "genId": "applied8-q17",
        "sourceSet": "applied",
        "sourceRound": 8,
        "sourceNo": 17,
        "variantNo": variant,
        "reviewStatus": "verified",
        "area": "수와 식",
        "subarea": "규칙과 대응",
        "detailType": "색을 번갈아 놓는 증가 묶음에서 한 색의 개수 세기",
        "pointBand": "3.4",
        "text": f"다음 그림과 같은 규칙으로 검은색 바둑돌과 흰색 바둑돌을 번갈아 가며 모두 {total}개 놓았습니다. 흰색 바둑돌은 모두 몇 개인지 구하세요.",
        "asset": {
            "kind": "raster",
            "src": "assets/applied8/q17-sequence-original.png",
            "description": "활용 8회 원문 17번에 제시된 바둑돌 묶음 그림을 그대로 사용",
        },
        "answer": f"{answer}개",
        "answerParts": [answer],
        "answerLabels": ["흰색 바둑돌 수"],
        "acceptedAnswers": [str(answer), f"{answer}개"],
        "answerContract": "single-number",
        "solutionSteps": steps,
        "solution": " ".join(steps),
        "learningPoint": "검은색과 흰색 묶음을 크기별로 짝지어 완성한 뒤 남은 묶음의 색과 개수를 계산하기",
        "learningLocation": "활용 8회 · 원문 17번 · 색이 번갈아 나타나는 증가 묶음의 누적 개수",
        "verification": {
            "primaryMethod": "완성된 크기별 흑백 묶음 쌍의 합 2×T_k를 기준으로 남은 묶음을 색 순서대로 계산한다.",
            "independentMethod": "각 그룹을 순서대로 시뮬레이션해 전체가 total개가 되는 시점의 흰색 개수를 직접 합산한다.",
            "parameters": {
                "totalStones": total,
                "completePairCount": k,
                "completePairStones": complete_total,
                "remainingStones": remaining,
                "completedWhiteStones": completed_white,
                "nextWhiteStones": next_white,
                "whiteStones": answer,
            },
            "independentSuite": "qa/applied8-q17-independent-validate.py",
            "sourceExamPage": 4,
            "sourceExamFile": EXAM.name,
            "sourceAnswerPage": 4,
            "sourceDrawingCompared": True,
            "sourceDrawingPresent": True,
            "variantUsesSourceDrawing": True,
            "sourceDrawingAssetSha256": sha256(ASSET),
            "officialAnswerStatus": "The available Drive PDF titled as the answer PDF has the same blank Q17 problem and no marked key. The source answer and all variants were independently counted.",
            "studentDifficultyMeasured": False,
        },
        "difficultyEvidence": {
            "basis": "source-point-band",
            "label": "중",
            "sourceReasoningPreserved": True,
            "measuredVariantRate": None,
            "estimated": False,
            "rationale": "활용 8회 원문 17번은 13~22번의 3.4점 배점대다. 활용 난도는 배점대만 적용한다.",
        },
    }


def main() -> None:
    if not all(p.is_file() for p in (EXAM, ANSWER, PAGE_RENDER, SOURCE_CROP)):
        raise SystemExit("The exact source PDFs, page render, or reviewed drawing crop is missing.")
    exam_text = PdfReader(str(EXAM)).pages[3].extract_text()
    answer_text = PdfReader(str(ANSWER)).pages[3].extract_text()
    compact = "".join(exam_text.split())
    if not all(x in compact for x in ("검은색", "바둑돌", "흰색", "번갈아가며", "450", "개인지구하세요")):
        raise SystemExit("Q17 prompt on the exact source page did not match.")
    if answer_text != exam_text:
        raise SystemExit("Available answer candidate differs from source page; review the discrepancy before proceeding.")
    page = Image.open(PAGE_RENDER).convert("RGB")
    exact = page.crop((140, 1640, 1260, 1780))
    candidate = Image.open(SOURCE_CROP).convert("RGB")
    if exact.size != candidate.size or exact.tobytes() != candidate.tobytes():
        raise SystemExit("Reviewed Q17 crop is not a pixel-exact crop of the source PDF page 4.")
    ASSET.parent.mkdir(parents=True, exist_ok=True)
    if ASSET.exists():
        saved = Image.open(ASSET).convert("RGB")
        if saved.size != exact.size or saved.tobytes() != exact.tobytes():
            raise SystemExit("Existing Q17 asset differs from the exact source crop; refusing to overwrite it.")
    else:
        shutil.copyfile(SOURCE_CROP, ASSET)

    data, index = json.loads(OUT.read_text()), json.loads(INDEX.read_text())
    existing = [x for x in data["items"] if x["sourceNo"] == 17]
    if existing and len(existing) != 9:
        raise SystemExit(f"Q17 has {len(existing)} existing records, not 9; inspect manually before repair.")
    variants = [make_item(total, i + 1) for i, total in enumerate(TOTALS)]
    data["version"] = VERSION
    data["items"] = [x for x in data["items"] if x["sourceNo"] != 17] + variants
    data["itemCount"] = len(data["items"])
    data["availableSourceNos"] = sorted(set(data["availableSourceNos"] + [17]))
    data["pendingSourceNos"] = [n for n in range(1, 31) if n not in data["availableSourceNos"]]
    index["version"] = VERSION
    index["itemCount"] = len(data["items"])
    index["pendingSourceNos"] = data["pendingSourceNos"]
    index["items"] = [x for x in index["items"] if x["sourceNo"] != 17]
    index["items"].append({
        "sourceNo": 17,
        "genId": "applied8-q17",
        "area": "수와 식",
        "subarea": "규칙과 대응",
        "detailType": "색을 번갈아 놓는 증가 묶음에서 한 색의 개수 세기",
        "pointBand": "3.4",
        "reviewStatus": "verified",
        "variantCount": 9,
    })
    index["items"].sort(key=lambda x: x["sourceNo"])
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    INDEX.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")

    original_answer, original_k, original_r, original_next_white = white_count(450)
    if (original_answer, original_k, original_r, original_next_white) != (219, 20, 30, 9):
        raise AssertionError("Original Q17 independent answer did not reproduce 219.")
    review = {
        "sourceExam": {
            "file": EXAM.name,
            "sha256": sha256(EXAM),
            "page": 4,
            "questionNo": 17,
            "directVisualReview": True,
            "prompt": "검은색·흰색 바둑돌을 1개씩, 2개씩, 3개씩 번갈아 묶어 놓는 그림을 기준으로 450개 중 흰색 개수를 묻는다.",
            "sequenceFigure": {
                "sourcePageRender": str(PAGE_RENDER.relative_to(ROOT)),
                "sourcePageRenderSha256": sha256(PAGE_RENDER),
                "cropCoordinatesPx": [140, 1640, 1260, 1780],
                "asset": str(ASSET.relative_to(ROOT)),
                "assetSha256": sha256(ASSET),
                "assetDimensionsPx": list(Image.open(ASSET).size),
                "pixelExactCropVerified": True,
                "visiblePattern": "black 1, white 1, black 2, white 2, black 3, white 3, black 4, white 4, black 5 begins",
            },
        },
        "answerCandidates": [{
            "file": ANSWER.name,
            "sha256": sha256(ANSWER),
            "page": 4,
            "directVisualReview": True,
            "containsAnswers": False,
            "comparison": "Page 4 contains the same blank Q17 prompt and illustration; no marked answer is visible. Extracted source and candidate page text match.",
        }],
        "sourceIndependentSolution": {
            "totalStones": 450,
            "completePairCount": 20,
            "completePairStones": 420,
            "completedWhiteStones": 210,
            "remainingStones": 30,
            "nextBlackGroup": 21,
            "nextWhiteStones": 9,
            "answer": 219,
            "check": "Direct group simulation agrees: after 20 black-white pairs there are 420 stones and 210 white; 21 black stones then 9 white stones reach 450.",
        },
        "answerSourceConclusion": "No marked official answer key was available in the linked Drive answer PDF; original and variants were independently counted.",
        "variantCount": len(variants),
        "variantTotals": TOTALS,
        "variantAnswers": [x["answerParts"][0] for x in variants],
        "variantsIndependentlyCalculated": True,
        "sourceDrawingReusedPixelExact": True,
        "newSourceTypes": 0,
        "difficulty": "3.4-point band only = middle",
        "examSha256": sha256(EXAM),
        "answerCandidateSha256": sha256(ANSWER),
    }
    REVIEW.write_text(json.dumps(review, ensure_ascii=False, indent=2) + "\n")
    print(f"Added 9 Q17 variants; {len(data['items'])} items across {len(data['availableSourceNos'])} source types; source answer independently verified as 219.")


if __name__ == "__main__":
    main()

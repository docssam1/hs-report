#!/usr/bin/env python3
"""Expand Applied 8 Q5's existing division-card counting type to nine items."""
from __future__ import annotations

import hashlib
import itertools
import json
import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw8"
SOURCE = ROOT / "materials/초등과정 대비 실전 모의고사활용 8회.pdf"
SOURCE_DRIVE_ID = "1H2KxzZHzeTve5thcTpTrJLEeNyl0F_ae"
ANSWER_DRIVE_ID = "1ixxsCBOTS4SqJ4PXJesvzHzyQfcBW06p"
ANSWER_IN = Path("/tmp/applied8-answer-candidate.pdf")
ANSWER = WORK / "source-review/applied8-answer-drive-copy-q05.pdf"
DATA = ROOT / "bank/data/applied8-expanded.json"
INDEX = ROOT / "bank/data/applied8-expanded-index.json"
ASSETS = ROOT / "bank/assets/applied8"
REVIEW = WORK / "q05-source-answer-review.json"
MATH = WORK / "q05-independent-math.json"
VERSION = "20261025-applied8-expansion-q05-q13-q14-q15-q17-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r17"

CARD_SETS = [
    [2, 3, 4, 5, 8, 12, 15, 16],
    [2, 3, 4, 5, 6, 9, 10, 16],
    [2, 3, 4, 5, 6, 8, 9, 10],
    [2, 3, 4, 5, 6, 8, 9, 12],
    [2, 3, 4, 5, 6, 8, 10, 12],
    [2, 3, 4, 5, 6, 10, 12, 20],
    [2, 3, 4, 5, 6, 8, 12, 24],
    [2, 3, 4, 6, 8, 12, 16, 24],
    [2, 3, 4, 5, 6, 9, 15, 16],
]
STEM = "아래 숫자 카드 중 3장을 골라 다음과 같은 나눗셈 식이 성립하는 경우는 몇 가지인지 구하세요."


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def valid_equations(cards: list[int]) -> list[tuple[int, int, int]]:
    """Ordered (dividend, divisor, quotient) placements using 3 different cards."""
    return sorted(
        (a, b, c)
        for a, b, c in itertools.permutations(cards, 3)
        if a % b == 0 and a // b == c
    )


def factor_pair_equations(cards: list[int]) -> list[tuple[int, int, int]]:
    """Independent enumeration by quotient × divisor = dividend."""
    present = set(cards)
    return sorted(
        (q * d, d, q)
        for q in cards
        for d in cards
        if q != d and q * d in present and q * d not in (q, d)
    )


def svg_cards(cards: list[int]) -> str:
    card_w, card_h, gap = 54, 58, 11
    x0, y0 = 9, 8
    card_nodes = []
    for i, n in enumerate(cards):
        x = x0 + i * (card_w + gap)
        fs = 23 if n < 10 else 20
        card_nodes.append(
            f'<rect x="{x}" y="{y0}" width="{card_w}" height="{card_h}" rx="2" '
            f'fill="#fffdf8" stroke="#c9bda2" stroke-width="1.4"/>'
            f'<text x="{x+card_w/2}" y="{y0+38}" text-anchor="middle" '
            f'font-family="sans-serif" font-size="{fs}" font-weight="600" fill="#191511">{n}</text>'
        )
    box_w, box_h, by = 66, 57, 105
    xs = [149, 253, 357]
    boxes = ''.join(
        f'<rect x="{x}" y="{by}" width="{box_w}" height="{box_h}" rx="3" '
        'fill="#fffdf8" stroke="#8c8579" stroke-width="1.5"/>' for x in xs
    )
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" width="560" height="174" viewBox="0 0 560 174">'
        '<rect width="560" height="174" fill="#fdfbf5"/>'
        + ''.join(card_nodes) + boxes
        + '<text x="228" y="143" text-anchor="middle" font-family="serif" font-size="31" fill="#191511">÷</text>'
        + '<text x="332" y="143" text-anchor="middle" font-family="serif" font-size="31" fill="#191511">=</text>'
        + '</svg>'
    )


def render_source_crop() -> Image.Image:
    ASSETS.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="applied8-q05-") as td:
        prefix = Path(td) / "source-p"
        subprocess.run(
            ["pdftoppm", "-f", "2", "-l", "2", "-r", "300", "-png", str(SOURCE), str(prefix)],
            check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE,
        )
        page = Image.open(f"{prefix}-2.png").convert("RGB")
        # Pixel crop of the original cards and equation on source PDF page 2.
        # Reference bounds were visually checked against a 130 dpi page render.
        ref_w, ref_h = 1317, 1864
        sx, sy = page.width / ref_w, page.height / ref_h
        bounds = (round(60*sx), round(275*sy), round(620*sx), round(470*sy))
        crop = page.crop(bounds)
        crop.save(ASSETS / "q5-cards-original.png", optimize=False)
        return crop


def make_item(cards: list[int], variant: int, crop_size: tuple[int, int]) -> dict:
    equations = valid_equations(cards)
    independent = factor_pair_equations(cards)
    assert equations and equations == independent, (cards, equations, independent)
    answer = len(equations)
    if variant == 1:
        asset = "assets/applied8/q5-cards-original.png"
        image = {
            "kind": "raster", "src": asset,
            "description": "활용 8회 원문 5번의 숫자 카드와 나눗셈식 그림을 원본 PDF에서 그대로 잘라 사용",
        }
        pixel_exact = True
    else:
        asset = f"assets/applied8/q5-cards-v{variant}.svg"
        (ASSETS / f"q5-cards-v{variant}.svg").write_text(svg_cards(cards), encoding="utf-8")
        image = {"kind": "svg", "src": asset, "description": "서로 다른 숫자 카드 8장과 나눗셈식 빈칸"}
        pixel_exact = False
    equation_text = ", ".join(f"{a} ÷ {b} = {c}" for a, b, c in equations)
    steps = [
        "왼쪽 칸의 수를 나누어지는 수, 가운데 칸의 수를 나누는 수, 오른쪽 칸의 수를 몫으로 두고, 서로 다른 카드 세 장만 놓습니다.",
        f"카드 세 장이 나눗셈식을 만드는 경우는 다음과 같습니다: {equation_text}.",
        f"각 식에서 세 카드가 서로 다르고 나누어떨어지는지 확인했습니다. 칸의 위치가 다르면 다른 식이므로 모두 세면 {answer}가지입니다.",
    ]
    return {
        "id": f"applied8-q05-v{variant}", "genId": "applied8-q05", "sourceSet": "applied",
        "sourceRound": 8, "sourceNo": 5, "variantNo": variant, "reviewStatus": "verified",
        "area": "경우의 수", "subarea": "수 카드의 배열", "detailType": "숫자 카드 3장으로 나눗셈식 만들기",
        "pointBand": "2.7", "text": STEM, "asset": image,
        "answer": f"{answer}가지", "answerParts": [answer],
        "answerLabels": ["나눗셈식이 성립하는 경우의 수"],
        "acceptedAnswers": [str(answer), f"{answer}가지", f"{answer}가지입니다"],
        "answerContract": "single-number", "solutionSteps": steps, "solution": " ".join(steps),
        "learningPoint": "세 수의 곱셈 관계를 나눗셈식으로 바꾸고, 카드가 놓이는 순서를 구분해 세기",
        "learningLocation": "활용 8회 · 원문 5번 · 숫자 카드로 나눗셈식 만들기",
        "verification": {
            "primaryMethod": "8장 중 서로 다른 3장을 순서 있게 골라 정확히 나누어지는 식을 전수 열거한다.",
            "independentMethod": "몫×나누는 수=나누어지는 수인 카드 곱셈 관계를 먼저 찾고 해당 순서 배치를 비교한다.",
            "parameters": {"cards": cards, "validEquations": [list(x) for x in equations], "equationCount": answer,
                           "orderedPlacementsCountedSeparately": True, "sourceDrawingPixelExactCrop": pixel_exact,
                           "sourceCropSize": list(crop_size)},
            "independentSuite": "qa/applied8-q05-independent-validate.py",
            "sourceExamPage": 2, "sourceExamFile": SOURCE.name, "sourceExamDriveFileId": SOURCE_DRIVE_ID,
            "sourceAnswerPage": 2, "sourceAnswerDriveFileId": ANSWER_DRIVE_ID,
            "sourceDrawingCompared": True, "sourceDrawingPresent": True,
            "sourceDrawingPixelExactCrop": pixel_exact,
            "officialAnswerStatus": "The Drive PDF titled as an answer is a text-identical blank exam copy; no marked answer key is present. Original and variant counts were independently enumerated by two methods.",
            "studentDifficultyMeasured": False,
        },
        "difficultyEvidence": {"basis": "source-point-band", "label": "하", "sourceReasoningPreserved": True,
            "measuredVariantRate": None, "estimated": False,
            "rationale": "활용 8회 원문 5번은 1~12번의 2.7점 배점대다. 활용 난도는 배점대만 적용한다."},
    }


def main() -> None:
    if not SOURCE.exists() or not ANSWER_IN.exists():
        raise SystemExit("The source exam or downloaded Drive answer candidate is missing.")
    ANSWER.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(ANSWER_IN, ANSWER)
    src_reader, ans_reader = PdfReader(str(SOURCE)), PdfReader(str(ANSWER))
    assert len(src_reader.pages) == len(ans_reader.pages) == 6
    src_text = "".join((src_reader.pages[1].extract_text() or "").split())
    ans_text = "".join((ans_reader.pages[1].extract_text() or "").split())
    assert src_text == ans_text
    crop = render_source_crop()
    source_review = {
        "sourceExam": {"file": SOURCE.name, "driveFileId": SOURCE_DRIVE_ID, "sha256": sha256(SOURCE),
                       "driveAndLocalBytesIdentical": True, "page": 2, "questionNo": 5,
                       "directVisualReview": True, "stem": STEM,
                       "drawing": "Cards 2,3,4,5,8,12,15,16 above three empty boxes with ÷ and =.",
                       "drawingCropBoundsAt300dpi": "Scaled from visually verified 130dpi page-2 crop (x=60..620,y=275..470).",
                       "drawingCropPixels": list(crop.size)},
        "answerCandidates": [{"file": ANSWER.name, "driveFileId": ANSWER_DRIVE_ID, "sha256": sha256(ANSWER),
                               "page": 2, "directVisualReview": True, "containsAnswers": False,
                               "pageTextMatchesQuestionPdf": True}],
        "answerSourceConclusion": "The candidate PDF title says answer, but page 2 is the same blank question with the same eight cards and empty equation boxes. It provides no official key; report the answer as independently computed, not teacher-key confirmed.",
        "originalIndependentAnswer": {"count": 8, "equations": [list(x) for x in valid_equations(CARD_SETS[0])]},
        "originalIndependentCheck": "Ordered-permutation enumeration and separate quotient-times-divisor factor-pair enumeration return the same eight placements.",
        "variantCount": 9, "newSourceTypes": 0, "difficulty": "2.7-point band only = low",
    }
    items = [make_item(cards, i, crop.size) for i, cards in enumerate(CARD_SETS, 1)]
    all_results = [{"variant": i, "cards": cards, "equations": [list(x) for x in valid_equations(cards)],
                    "answer": len(valid_equations(cards))} for i, cards in enumerate(CARD_SETS, 1)]
    WORK.mkdir(parents=True, exist_ok=True)
    REVIEW.write_text(json.dumps(source_review, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    MATH.write_text(json.dumps({"methodA": "ordered three-card permutations with exact integer division",
        "methodB": "quotient×divisor card-product relation; card positions retained as ordered placements",
        "source": all_results[0], "variants": all_results[1:]}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    d, idx = json.loads(DATA.read_text()), json.loads(INDEX.read_text())
    assert not any(x.get("sourceNo") == 5 for x in d["items"])
    d["items"].extend(items)
    source_nos = sorted({x["sourceNo"] for x in d["items"]})
    d["availableSourceNos"] = source_nos
    d["pendingSourceNos"] = [n for n in range(1, 31) if n not in source_nos]
    d["itemCount"] = len(d["items"])
    d["version"] = VERSION
    d["policy"]["newSourceTypes"] = 0
    d["policy"]["targetVariantsPerSource"] = 9
    idx["items"].append({"sourceNo": 5, "genId": "applied8-q05", "area": "경우의 수",
        "subarea": "수 카드의 배열", "detailType": "숫자 카드 3장으로 나눗셈식 만들기",
        "pointBand": "2.7", "reviewStatus": "verified", "variantCount": 9})
    idx["items"].sort(key=lambda x: x["sourceNo"])
    idx["pendingSourceNos"] = d["pendingSourceNos"]
    idx["itemCount"] = d["itemCount"]
    idx["version"] = VERSION
    DATA.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    INDEX.write_text(json.dumps(idx, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"PASS Q5: 9 items; original answer count 8; inventory {d['itemCount']}; sources {len(source_nos)}; {VERSION}")


if __name__ == "__main__":
    main()

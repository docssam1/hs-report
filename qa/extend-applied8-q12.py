#!/usr/bin/env python3
"""Expand Applied 8 Q12's existing balance-scale equations to nine items."""
from __future__ import annotations

import hashlib
import json
import shutil
from pathlib import Path

from PIL import Image
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw8"
SOURCE = ROOT / "materials/초등과정 대비 실전 모의고사활용 8회.pdf"
SOURCE_ID = "1H2KxzZHzeTve5thcTpTrJLEeNyl0F_ae"
ANSWER_ID = "1ixxsCBOTS4SqJ4PXJesvzHzyQfcBW06p"
ANSWER = WORK / "q12-source-review/answer-drive-copy.pdf"
SOURCE_RENDER = WORK / "q12-source-review/source-page-3-300dpi.png"
CROP = ROOT / "bank/assets/applied8/q12-balances-original.png"
DATA = ROOT / "bank/data/applied8-expanded.json"
INDEX = ROOT / "bank/data/applied8-expanded-index.json"
VERSION = "20261025-applied8-expansion-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q12-q13-q14-q15-q17-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r27"

# Each scenario stores A:(left shapes,right shape counts), B:..., C:...
# Shape keys are S=square, T=triangle, C=circle. The right pan in C is blank.
SCENARIOS = [
    {"A": ({"T": 1, "S": 1}, {"S": 3}), "B": ({"C": 2}, {"S": 2, "T": 2}), "C": ({"C": 2, "T": 1}, {})},
    {"A": ({"T": 1, "S": 1}, {"S": 4}), "B": ({"C": 2}, {"S": 2, "T": 2}), "C": ({"C": 1, "T": 1}, {})},
    {"A": ({"T": 2, "S": 1}, {"S": 5}), "B": ({"C": 1}, {"S": 2, "T": 1}), "C": ({"C": 2, "T": 1}, {})},
    {"A": ({"T": 3, "S": 1}, {"S": 10}), "B": ({"C": 2}, {"S": 2, "T": 2}), "C": ({"C": 3, "T": 1}, {})},
    {"A": ({"T": 1, "S": 2}, {"S": 6}), "B": ({"C": 1}, {"S": 2, "T": 1}), "C": ({"C": 2, "T": 1}, {})},
    {"A": ({"T": 2, "S": 2}, {"S": 10}), "B": ({"C": 1}, {"S": 2, "T": 1}), "C": ({"C": 1, "T": 2}, {})},
    {"A": ({"T": 1, "S": 3}, {"S": 8}), "B": ({"C": 3}, {"S": 3, "T": 3}), "C": ({"C": 2, "T": 1}, {})},
    {"A": ({"T": 2, "S": 1}, {"S": 13}), "B": ({"C": 2}, {"S": 2, "T": 2}), "C": ({"C": 2, "T": 1}, {})},
    {"A": ({"T": 1, "S": 2}, {"S": 9}), "B": ({"C": 3}, {"S": 3, "T": 3}), "C": ({"C": 2, "T": 1}, {})},
]


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def value(shape: str, units: dict[str, int]) -> int:
    return sum(units[k] * n for k, n in shape.items())


def solve(sc: dict) -> tuple[dict[str, int], int]:
    a_left, a_right = sc["A"]
    # Set the square's mass to one unit, then solve A for the triangle.
    square_mass = 1
    assert a_left.get("S", 0) < a_right.get("S", 0)
    assert set(a_left) <= {"S", "T"} and set(a_right) == {"S"}
    triangle_mass = (a_right["S"] - a_left.get("S", 0)) // a_left.get("T", 0)
    assert (a_right["S"] - a_left.get("S", 0)) % a_left.get("T", 0) == 0
    assert value(a_left, {"S": square_mass, "T": triangle_mass}) == value(a_right, {"S": square_mass})

    b_left, b_right = sc["B"]
    assert set(b_left) == {"C"} and set(b_right) <= {"S", "T"}
    circles = b_left["C"]
    rhs = value(b_right, {"S": square_mass, "T": triangle_mass})
    assert rhs % circles == 0
    circle_mass = rhs // circles
    assert circle_mass > 0
    assert value(b_left, {"C": circle_mass}) == value(b_right, {"S": square_mass, "T": triangle_mass})

    c_left, c_right = sc["C"]
    assert set(c_left) <= {"C", "T"} and not c_right
    answer = value(c_left, {"S": square_mass, "T": triangle_mass, "C": circle_mass})
    assert answer > 0
    return {"S": square_mass, "T": triangle_mass, "C": circle_mass}, answer


def fmt_expr(counts: dict[str, int]) -> str:
    names = {"S": "■", "T": "▲", "C": "●"}
    return " + ".join((f"{n}{names[k]}" if n > 1 else names[k]) for k, n in counts.items()) or "빈 접시"


def shapes_svg(counts: dict[str, int], cx: int, y0: int) -> str:
    out = []
    shapes = [k for k in ("S", "T", "C") for _ in range(counts.get(k, 0))]
    # Five positions per row keep even the largest equation readable.
    for i, kind in enumerate(shapes):
        row, col = divmod(i, 5)
        row_items = min(5, len(shapes) - row * 5)
        x = cx + (col - (row_items - 1) / 2) * 23
        y = y0 - row * 21
        if kind == "S":
            out.append(f'<rect x="{x-8}" y="{y-8}" width="16" height="16" fill="#b5a77f" stroke="#2a241c" stroke-width="1"/>')
        elif kind == "C":
            out.append(f'<circle cx="{x}" cy="{y}" r="8" fill="#b5a77f" stroke="#2a241c" stroke-width="1"/>')
        else:
            out.append(f'<path d="M {x} {y-9} L {x-9} {y+8} L {x+9} {y+8} Z" fill="#b5a77f" stroke="#2a241c" stroke-width="1"/>')
    return "".join(out)


def scale_svg(sc: dict) -> str:
    groups = []
    for i, key in enumerate(("A", "B", "C")):
        cx = 160 + 320 * i
        left, right = sc[key]
        groups.append(
            f'<g fill="none" stroke="#2a241c" stroke-width="2.2">'
            f'<line x1="{cx-102}" y1="204" x2="{cx+102}" y2="204"/>'
            f'<path d="M {cx} 204 L {cx-48} 252 L {cx+48} 252 Z" fill="#f1ece1"/>'
            f'<line x1="{cx-88}" y1="204" x2="{cx-88}" y2="178"/><line x1="{cx+88}" y1="204" x2="{cx+88}" y2="178"/>'
            f'<path d="M {cx-124} 177 Q {cx-88} 190 {cx-52} 177"/><path d="M {cx+52} 177 Q {cx+88} 190 {cx+124} 177"/>'
            f'<line x1="{cx-124}" y1="177" x2="{cx-52}" y2="177"/><line x1="{cx+52}" y1="177" x2="{cx+124}" y2="177"/>'
            f'</g>{shapes_svg(left,cx-88,165)}{shapes_svg(right,cx+88,165)}'
            f'<text x="{cx}" y="279" text-anchor="middle" fill="#2a241c" font-size="18" font-family="Pretendard,sans-serif">{key}</text>'
        )
    return '<svg xmlns="http://www.w3.org/2000/svg" width="960" height="300" viewBox="0 0 960 300">' + "".join(groups) + "</svg>"


def make_item(i: int, sc: dict) -> dict:
    units, ans = solve(sc)
    a_left, a_right = sc["A"]
    b_left, b_right = sc["B"]
    c_left, _ = sc["C"]
    a_triangle_count = a_left.get("T", 0)
    a_triangle = (a_right["S"] - a_left.get("S", 0)) // a_triangle_count
    b_circles = b_left["C"]
    b_rhs = value(b_right, {"S": 1, "T": a_triangle})
    c_terms = [f"{n}×{units[k]}" if n > 1 else str(units[k]) for k, n in c_left.items()]
    c_calc = " + ".join(c_terms)
    c_eq = " + ".join(f"{n}{k}" if n > 1 else k for k, n in c_left.items())
    steps = [
        f"■ 하나의 무게를 1이라고 두겠습니다. A 저울은 {fmt_expr(a_left)}와 {fmt_expr(a_right)}가 평형이므로 ▲ 하나의 무게는 ({a_right['S']}−{a_left.get('S',0)})÷{a_triangle_count}={a_triangle}입니다.",
        f"B 저울은 {fmt_expr(b_left)}와 {fmt_expr(b_right)}가 평형입니다. 오른쪽 접시의 무게는 {b_rhs}이므로 ● 하나의 무게는 {b_rhs}÷{b_circles}={units['C']}입니다.",
        f"C 저울의 왼쪽은 {c_eq}입니다. 이를 ■의 무게로 바꾸면 {c_calc}={ans}이므로 빈 접시에 놓을 ■는 {ans}개입니다.",
    ]
    asset = ({"kind": "raster", "src": "assets/applied8/q12-balances-original.png", "description": "활용 8회 원문 12번의 세 양팔 저울 그림을 원문 PDF에서 그대로 crop"}
             if i == 1 else {"kind": "svg", "src": f"assets/applied8/q12-balances-v{i}.svg", "description": "세 양팔 저울의 도형별 수를 바꾼 같은 무게 관계"})
    return {
        "id": f"applied8-q12-v{i}", "genId": "applied8-q12", "sourceSet": "applied", "sourceRound": 8, "sourceNo": 12,
        "variantNo": i, "reviewStatus": "verified", "area": "수와 식", "subarea": "등식과 무게 관계",
        "detailType": "양팔 저울의 등식으로 도형의 무게 구하기", "pointBand": "2.7",
        "text": "다음 양팔 저울이 모두 평형을 이루려면, 빈 접시에 ■를 몇 개 놓아야 하는지 구하시오.",
        "asset": asset, "answer": str(ans), "answerParts": [ans], "answerLabels": ["빈 접시에 놓을 ■의 개수"],
        "acceptedAnswers": [str(ans), f"{ans}개", f"{ans}개입니다"], "answerContract": "single-number",
        "solutionSteps": steps, "solution": " ".join(steps),
        "learningPoint": "평형인 저울을 등식으로 나타내고 도형의 무게를 차례로 구하기",
        "learningLocation": "활용 8회 · 원문 12번 · 양팔 저울의 등식",
        "verification": {
            "primaryMethod": "A 저울로 ▲를 구하고 B 저울로 ●를 구한 뒤 C 저울의 무게를 ■의 개수로 환산한다.",
            "independentMethod": "■=1을 대입해 세 저울의 양쪽 무게를 직접 계산하고, 마지막 빈 접시의 총무게와 정답 개수를 대조한다.",
            "parameters": {"scenario": sc, "unitWeights": units, "answer": ans, "equationChecks": {
                k: value(v[0], units) == value(v[1], units) for k, v in sc.items() if k != "C"
            }, "targetWeight": value(c_left, units), "targetIsSquares": True},
            "independentSuite": "qa/applied8-q12-independent-validate.py", "sourceExamPage": 3,
            "sourceExamFile": SOURCE.name, "sourceExamDriveFileId": SOURCE_ID, "sourceAnswerPage": 3,
            "sourceAnswerDriveFileId": ANSWER_ID, "sourceDrawingCompared": True, "sourceDrawingPresent": True,
            "sourceDrawingPixelExactCrop": i == 1,
            "officialAnswerStatus": "Drive answer candidate is a blank exam copy without a marked key; the source answer is independently derived from the three printed balance equations.",
            "studentDifficultyMeasured": False,
        },
        "difficultyEvidence": {"basis": "source-point-band", "label": "하", "sourceReasoningPreserved": True,
            "measuredVariantRate": None, "estimated": False,
            "rationale": "활용 8회 원문 12번은 1~12번의 2.7점 배점대다. 활용 난도는 배점대만 적용한다."},
    }


def main() -> None:
    src_reader = PdfReader(str(SOURCE))
    ans_reader = PdfReader(str(ANSWER))
    norm = lambda s: "".join((s or "").split())
    src_text = norm(src_reader.pages[2].extract_text())
    ans_text = norm(ans_reader.pages[2].extract_text())
    assert "다음양팔저울이모두평형을이루려면" in src_text and "놓아야하는지구하시오" in src_text and "빈접시에" in src_text
    assert src_text == ans_text, "Available answer candidate differs from source page"
    assert Image.open(CROP).size == (1180, 270)
    assert SOURCE_RENDER.exists()
    data = json.loads(DATA.read_text())
    index = json.loads(INDEX.read_text())
    assert data["version"].endswith("r26") and index["version"] == data["version"]
    assert not any(x["sourceNo"] == 12 for x in data["items"])
    items = [make_item(i, sc) for i, sc in enumerate(SCENARIOS, 1)]
    data["items"].extend(items)
    nos = sorted({x["sourceNo"] for x in data["items"]})
    data["availableSourceNos"] = nos
    data["pendingSourceNos"] = [n for n in range(1, 31) if n not in nos]
    data["itemCount"] = len(data["items"])
    data["version"] = VERSION
    data["policy"]["newSourceTypes"] = 0
    index["items"].append({"sourceNo": 12, "genId": "applied8-q12", "area": "수와 식",
        "subarea": "등식과 무게 관계", "detailType": "양팔 저울의 등식으로 도형의 무게 구하기",
        "pointBand": "2.7", "reviewStatus": "verified", "variantCount": 9})
    index["items"].sort(key=lambda x: x["sourceNo"])
    index["pendingSourceNos"] = data["pendingSourceNos"]
    index["itemCount"] = data["itemCount"]
    index["version"] = VERSION
    for i, sc in enumerate(SCENARIOS[1:], 2):
        (ROOT / f"bank/assets/applied8/q12-balances-v{i}.svg").write_text(scale_svg(sc), encoding="utf-8")
    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    INDEX.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")
    source_review = {"sourceExam": {"file": SOURCE.name, "driveFileId": SOURCE_ID, "sha256": sha(SOURCE), "page": 3,
        "questionNo": 12, "directVisualReview": True,
        "stem": "다음 양팔 저울이 모두 평형을 이루려면, 빈 접시에 ■를 몇 개 놓아야 하는지 구하시오.",
        "diagramEquations": {"A": "▲+■=3■", "B": "2●=2■+2▲", "C": "2●+▲=빈 접시"},
        "sourceCrop": {"file": str(CROP.relative_to(ROOT)), "sha256": sha(CROP), "sizePixels": list(Image.open(CROP).size), "cropOnlyFromOriginalRenderedPage": True}},
        "answerCandidate": {"file": ANSWER.name, "driveFileId": ANSWER_ID, "sha256": sha(ANSWER), "page": 3,
            "directVisualReview": True, "containsAnswers": False, "pageTextMatchesQuestionPdf": True},
        "answerSourceConclusion": "The Drive answer candidate is an unmarked exam copy; the answer 8 is independently derived from A, B, and C.",
        "sourceIndependentAnswer": 8, "variantCount": 9, "newSourceTypes": 0, "difficulty": "2.7-point band only = low"}
    (WORK / "q12-source-answer-review.json").write_text(json.dumps(source_review, ensure_ascii=False, indent=2) + "\n")
    math = {"unitSquare": 1, "independentCheck": "Solve all displayed balance equations as linear equalities, then substitute the solved unit weights into the target pan.",
        "scenarios": [{"variantNo": i, "scenario": sc, "unitWeights": solve(sc)[0], "answer": solve(sc)[1],
            "balanceChecks": {k: {"left": value(v[0], solve(sc)[0]), "right": value(v[1], solve(sc)[0]), "equal": value(v[0], solve(sc)[0]) == value(v[1], solve(sc)[0])} for k, v in sc.items() if k != "C"},
            "targetSquares": solve(sc)[1]} for i, sc in enumerate(SCENARIOS, 1)]}
    (WORK / "q12-independent-math.json").write_text(json.dumps(math, ensure_ascii=False, indent=2) + "\n")
    print(f"PASS Q12: source answer=8; exact crop; {len(items)} balance systems; inventory={data['itemCount']}; types={len(nos)}; r27")


if __name__ == "__main__":
    main()

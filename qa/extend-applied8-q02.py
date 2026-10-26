#!/usr/bin/env python3
"""Extend Applied 8 Q2's existing matchstick-triangle counting type."""
from __future__ import annotations

import hashlib
import itertools
import json
import math
from collections import Counter
from pathlib import Path

from PIL import Image
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw8"
EXAM = ROOT / "materials/초등과정 대비 실전 모의고사활용 8회.pdf"
ANSWER = WORK / "source-review/applied8-answer-drive-copy-q07.pdf"
RENDER = WORK / "q1-source-review/original-1.png"
CROP = ROOT / "bank/assets/applied8/q2-matchstick-triangles-original.png"
DATA = ROOT / "bank/data/applied8-expanded.json"
INDEX = ROOT / "bank/data/applied8-expanded-index.json"
VERSION = "20261025-applied8-expansion-q01-q02-q04-q05-q06-q07-q08-q09-q10-q13-q14-q15-q17-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r25"
SOURCE_NUMBERS = [1, 2, 4, 5, 6, 7, 8, 9, 10, 13, 14, 15, 17, 18, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]
CASES = [(3, 2), (2, 2), (4, 2), (2, 3), (3, 3), (4, 3), (2, 4), (3, 4), (4, 4)]
CROP_BOX = (205, 1450, 710, 1765)


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def graph(width: int, height: int):
    vertices = {(a, b) for b in range(height + 1) for a in range(width + 1)}
    edges: set[frozenset[tuple[int, int]]] = set()

    def add(a, b):
        edges.add(frozenset((a, b)))

    for b in range(height + 1):
        for a in range(width):
            add((a, b), (a + 1, b))
    for b in range(height):
        for a in range(width + 1):
            add((a, b), (a, b + 1))
        for a in range(width):
            add((a + 1, b), (a, b + 1))
    return vertices, edges


def distance2(a, b):
    dx, dy = a[0] - b[0], a[1] - b[1]
    return dx * dx + dy * dy + dx * dy


def straight_segment_exists(a, b, edges):
    dx, dy = b[0] - a[0], b[1] - a[1]
    if dy == 0:
        step, n = (1 if dx > 0 else -1, 0), abs(dx)
    elif dx == 0:
        step, n = (0, 1 if dy > 0 else -1), abs(dy)
    elif dx + dy == 0:
        step, n = (1 if dx > 0 else -1, 1 if dy > 0 else -1), abs(dx)
    else:
        return False
    points = [(a[0] + step[0] * i, a[1] + step[1] * i) for i in range(n + 1)]
    return all(frozenset((p, q)) in edges for p, q in zip(points, points[1:]))


def enumerate_triangles(width: int, height: int):
    vertices, edges = graph(width, height)
    counts = Counter()
    triangles = []
    for tri in itertools.combinations(sorted(vertices), 3):
        ds = [distance2(tri[i], tri[j]) for i, j in ((0, 1), (0, 2), (1, 2))]
        if ds[0] and ds[0] == ds[1] == ds[2] and all(
            straight_segment_exists(a, b, edges) for a, b in itertools.combinations(tri, 2)
        ):
            side = math.isqrt(ds[0])
            assert side * side == ds[0]
            counts[side] += 1
            triangles.append((tri, side))
    return counts, triangles


def formula_counts(width: int, height: int):
    return {side: 2 * (width - side + 1) * (height - side + 1)
            for side in range(1, min(width, height) + 1)}


def svg(width: int, height: int) -> str:
    unit = 74
    row = unit * math.sqrt(3) / 2
    margin_x, margin_y = 130, 42
    x = lambda a, b: margin_x + unit * a - unit * b / 2
    y = lambda a, b: margin_y + row * b
    strokes = []
    edges = []
    for b in range(height + 1):
        for a in range(width):
            edges.append(((a, b), (a + 1, b)))
    for b in range(height):
        for a in range(width + 1):
            edges.append(((a, b), (a, b + 1)))
        for a in range(width):
            edges.append(((a + 1, b), (a, b + 1)))
    for a, b in edges:
        strokes.append(
            f'<line x1="{x(*a):.1f}" y1="{y(*a):.1f}" x2="{x(*b):.1f}" y2="{y(*b):.1f}" '
            'stroke="#7b3024" stroke-width="5" stroke-linecap="round"/>'
        )
    nodes = {point for edge in edges for point in edge}
    for a, b in sorted(nodes):
        strokes.append(f'<circle cx="{x(a,b):.1f}" cy="{y(a,b):.1f}" r="3.2" fill="#241c16"/>')
    vbw = max(400, int(margin_x * 2 + unit * width + 20))
    vbh = int(margin_y * 2 + row * height + 18)
    min_x = x(0, height)
    max_x = x(width, 0)
    view_x = round((min_x + max_x - vbw) / 2) if min_x < 0 else 0
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{vbw}" height="{vbh}" viewBox="{view_x} 0 {vbw} {vbh}">'
            + ''.join(strokes) + '</svg>')


def make_item(variant: int, width: int, height: int):
    by_side = formula_counts(width, height)
    enum, triangles = enumerate_triangles(width, height)
    assert dict(enum) == by_side
    total = sum(by_side.values())
    steps = [
        f"한 변에 성냥개비 {side}개를 쓰는 삼각형은 격자에서 위·아래 두 방향으로 놓입니다. 각 방향으로 놓을 수 있는 자리는 ({width}−{side}+1)×({height}−{side}+1)개입니다. 따라서 이 크기의 삼각형은 2×({width}−{side}+1)×({height}−{side}+1)={count}개입니다."
        for side, count in sorted(by_side.items())
    ]
    steps.append(f"변의 길이별 개수를 합하면 {'+'.join(map(str, by_side.values()))}={total}입니다. 따라서 삼각형은 모두 {total}개입니다.")
    asset = ({"kind": "raster", "src": "assets/applied8/q2-matchstick-triangles-original.png",
              "description": "활용 8회 원문 2번 그림을 원본 PDF 렌더에서 그대로 잘라 보존"}
             if variant == 1 else
             {"kind": "svg", "src": f"assets/applied8/q2-matchstick-triangles-v{variant}.svg",
              "description": "같은 유형의 성냥개비 삼각 격자"})
    return {
        "id": f"applied8-q02-v{variant}", "genId": "applied8-q02", "sourceSet": "applied", "sourceRound": 8,
        "sourceNo": 2, "variantNo": variant, "reviewStatus": "verified",
        "area": "도형", "subarea": "평면도형의 개수", "detailType": "성냥개비 삼각 격자에서 크기별 삼각형 세기",
        "pointBand": "2.7",
        "text": "다음 그림과 같이 성냥개비로 만든 모양에서 찾을 수 있는 크고 작은 삼각형은 모두 몇 개입니까?",
        "asset": asset, "answer": str(total), "answerParts": [total], "answerLabels": ["삼각형의 수"],
        "acceptedAnswers": [str(total), f"{total}개"], "answerContract": "single-number",
        "solutionSteps": steps, "solution": " ".join(steps),
        "learningPoint": "삼각 격자에서 한 변의 길이와 방향을 나누어 같은 크기의 삼각형을 빠짐없이 세기",
        "learningLocation": "활용 8회 · 원문 2번 · 성냥개비 격자에서 삼각형 수 세기",
        "verification": {
            "primaryMethod": "삼각형의 한 변에 놓인 성냥개비 수와 방향별 시작 위치를 세어 크기별 개수를 더한다.",
            "independentMethod": "격자 꼭짓점 세 개의 실제 격자 거리와 각 변을 이루는 성냥개비 연결을 전수 열거한다.",
            "parameters": {"horizontalIntervals": width, "diagonalIntervals": height,
                           "countBySideLength": {str(k): v for k, v in sorted(by_side.items())},
                           "triangleCount": total, "enumeratedTriangles": len(triangles)},
            "independentSuite": "qa/applied8-q02-independent-validate.py",
            "sourceExamPage": 1, "sourceExamFile": EXAM.name,
            "sourceExamDriveFileId": "1H2KxzZHzeTve5thcTpTrJLEeNyl0F_ae",
            "sourceAnswerPage": 1, "sourceAnswerDriveFileId": "1ixxsCBOTS4SqJ4PXJesvzHzyQfcBW06p",
            "sourceDrawingCompared": True, "sourceDrawingPresent": True,
            "sourceDrawingPixelExactCrop": variant == 1,
            "officialAnswerStatus": "The available Drive answer candidate is an unmarked exam duplicate; the source answer is independently enumerated from the original matchstick diagram.",
            "studentDifficultyMeasured": False},
        "difficultyEvidence": {"basis": "source-point-band", "label": "하", "sourceReasoningPreserved": True,
                               "measuredVariantRate": None, "estimated": False,
                               "rationale": "활용 8회 원문 2번은 1~12번의 2.7점 배점대다. 활용 난도는 배점대만 적용한다."}
    }


def main():
    assert not any(x["sourceNo"] == 2 for x in json.loads(DATA.read_text())["items"])
    exam_page, answer_page = PdfReader(str(EXAM)).pages[0], PdfReader(str(ANSWER)).pages[0]
    norm = lambda x: "".join((x or "").split())
    exam_text, answer_text = norm(exam_page.extract_text()), norm(answer_page.extract_text())
    assert exam_text == answer_text and "성냥개비" in exam_text and "세모모양" in exam_text
    CROP.parent.mkdir(parents=True, exist_ok=True)
    original_page = Image.open(RENDER)
    original_page.crop(CROP_BOX).save(CROP)
    data, index = json.loads(DATA.read_text()), json.loads(INDEX.read_text())
    items = [make_item(i, *case) for i, case in enumerate(CASES, 1)]
    data["items"].extend(items)
    data["availableSourceNos"] = SOURCE_NUMBERS
    data["pendingSourceNos"] = [n for n in range(1, 31) if n not in SOURCE_NUMBERS]
    data["itemCount"], data["version"] = len(data["items"]), VERSION
    index["items"].append({"sourceNo": 2, "genId": "applied8-q02", "area": "도형", "subarea": "평면도형의 개수",
                           "detailType": "성냥개비 삼각 격자에서 크기별 삼각형 세기", "pointBand": "2.7",
                           "reviewStatus": "verified", "variantCount": 9})
    index["items"].sort(key=lambda x: x["sourceNo"])
    index.update({"pendingSourceNos": data["pendingSourceNos"], "itemCount": len(data["items"]), "version": VERSION})
    for i, (w, h) in enumerate(CASES[1:], 2):
        (ROOT / f"bank/assets/applied8/q2-matchstick-triangles-v{i}.svg").write_text(svg(w, h), encoding="utf-8")
    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    INDEX.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")
    review = {"sourceExam": {"file": EXAM.name, "sha256": sha(EXAM), "page": 1, "questionNo": 2,
                              "directVisualReview": True, "stem": exam_page.extract_text(),
                              "sourceFigure": {"horizontalIntervals": 3, "diagonalIntervals": 2,
                                               "vertexRows": 3, "verticesPerRow": 4,
                                               "smallTriangles": 12, "largeSide2Triangles": 4}},
              "sourceCrop": {"file": str(CROP.relative_to(ROOT)), "sha256": sha(CROP),
                             "cropBoxOnOriginalRenderedPage": list(CROP_BOX),
                             "pixels": list(Image.open(CROP).size), "pixelExactSourceRender": True},
              "answerCandidate": {"file": ANSWER.name, "sha256": sha(ANSWER), "page": 1,
                                  "directVisualReview": True, "containsAnswers": False,
                                  "pageTextMatchesQuestionPdf": True},
              "answerSourceConclusion": "The available Drive answer candidate is a blank duplicate of the exam. Original answer count is independently confirmed by two enumeration methods.",
              "sourceAnswer": 16, "sourceIndependentCounts": {"formulaBySide": {"1": 12, "2": 4},
                                                                 "vertexTripleEnumeration": 16},
              "variantCount": 9, "newSourceTypes": 0, "difficulty": "2.7-point band only = low"}
    (WORK / "q02-source-answer-review.json").write_text(json.dumps(review, ensure_ascii=False, indent=2) + "\n")
    math = {"sourceDimensions": [3, 2], "cases": []}
    for case, item in zip(CASES, items):
        w, h = case
        formula, triples = enumerate_triangles(w, h)
        independent = formula_counts(w, h)
        assert dict(formula) == independent
        math["cases"].append({"dimensions": list(case), "formulaCountsBySide": {str(k): v for k, v in sorted(independent.items())},
                              "tripleEnumerationCountsBySide": {str(k): v for k, v in sorted(formula.items())},
                              "triangleCount": item["answer"], "enumeratedTriangleRecords": len(triples)})
    (WORK / "q02-independent-math.json").write_text(json.dumps(math, ensure_ascii=False, indent=2) + "\n")
    print(f"PASS Q2 source + variants: {[x['answer'] for x in items]}; inventory={len(data['items'])}; types={len(SOURCE_NUMBERS)}; r25")


if __name__ == "__main__":
    main()

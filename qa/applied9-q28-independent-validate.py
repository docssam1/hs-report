#!/usr/bin/env python3
"""Independently enumerate Applied 9 Q28 route diagrams and verify the saved items."""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / "bank/data/applied9-expanded.json").read_text(encoding="utf-8"))
INDEX = json.loads((ROOT / "bank/data/applied9-expanded-index.json").read_text(encoding="utf-8"))
EXPECTED_ANSWERS = [9, 10, 13, 15, 16, 17, 19, 21, 24]
items = [item for item in DATA["items"] if item["sourceNo"] == 28]
assert len(items) == 9 and [item["variantNo"] for item in items] == list(range(1, 10))
assert DATA["version"] == INDEX["version"]
assert DATA["itemCount"] == INDEX["itemCount"] == len(DATA["items"]) == 270
assert DATA["availableSourceNos"] == INDEX["availableSourceNos"] == list(range(1, 31))
assert DATA["pendingSourceNos"] == INDEX["pendingSourceNos"] == []
assert [int(item["answer"]) for item in items] == EXPECTED_ANSWERS
assert len(set(EXPECTED_ANSWERS)) == 9

def enumerate_graph(m: int, upper: list[int], lower: list[int]) -> int:
    """Depth-first graph traversal, independent of the ordered-pair formula."""
    edges: dict[tuple[int, int], list[tuple[int, int]]] = {}
    def add(a: tuple[int, int], b: tuple[int, int]) -> None:
        edges.setdefault(a, []).append(b)
    for row in range(3):
        for col in range(m):
            add((row, col), (row, col + 1))
    for col in upper:
        add((0, col), (1, col))
    for col in lower:
        add((1, col), (2, col))
    total = 0
    stack = [(0, 0)]
    while stack:
        node = stack.pop()
        if node == (2, m):
            total += 1
        else:
            stack.extend(edges.get(node, []))
    return total

for item, expected in zip(items, EXPECTED_ANSWERS):
    p = item["verification"]["parameters"]
    m = p["columnsBetweenVertices"]
    upper = p["upperDropColumns"]
    lower = p["lowerDropColumns"]
    assert upper == sorted(set(upper)) and lower == sorted(set(lower))
    assert all(isinstance(c, int) and 0 <= c <= m for c in upper + lower)
    # Second derivation: count legal ordered upper/lower drop-column pairs.
    pairs = [(i, j) for i in upper for j in lower if i <= j]
    assert len(pairs) == expected == int(item["answer"])
    assert enumerate_graph(m, upper, lower) == expected
    assert p["orderedPairCount"] == p["graphPathCount"] == expected
    assert p["contributionsByUpperDrop"] == [sum(j >= i for j in lower) for i in upper]
    assert item["acceptedAnswers"] == [str(expected)]
    assert item["answerParts"] == [expected]
    assert item["area"] == "경우의 수" and item["subarea"] == "경로 세기"
    assert item["pointBand"] == "4.2" and item["difficultyEvidence"]["label"] == "상"
    assert item["reviewStatus"] == "verified" and len(item["solutionSteps"]) >= 4
    assert item["verification"]["sourceExamPage"] == item["verification"]["sourceAnswerPage"] == 5
    assert item["verification"]["sourceDrawingCompared"] is True
    assert item["verification"]["variantUsesSourceDrawing"] is False
    assert item["verification"]["userAuthorizedNewVariantFigures"] is True
    assert item["asset"]["kind"] == "svg"
    svg_path = ROOT / "bank" / item["asset"]["src"]
    svg = svg_path.read_text(encoding="utf-8")
    assert hashlib.sha256(svg_path.read_bytes()).hexdigest() == item["asset"]["sha256"]
    assert svg.count('marker-end="url(#arrow)"') == 3 * m + len(upper) + len(lower)
    assert svg.count("<circle") == 3 * (m + 1)
    assert f"유사문제 {item['variantNo']}" in svg
    root = re.search(r'<svg[^>]*width="(\d+)" height="(\d+)" viewBox="0 0 (\d+) (\d+)"', svg)
    assert root and root.group(1) == root.group(3) and root.group(2) == root.group(4)
    assert re.search(r">A</text>.*>B</text>", svg)
    assert all(step for step in item["solutionSteps"])
    assert str(expected) in item["solution"]

source_review = DATA["sourceReview"]["questionReviews"]["28"]
assert source_review["directVisualReview"] is True
assert source_review["officialKeyConfirmed"] is False
assert source_review["independentSourceCount"] == {
    "routesToCenter": 5, "routesFromCenterToB": 3, "perimeterBypasses": 2, "total": 17
}
assert sum(item["sourceNo"] == 28 for item in INDEX["items"]) == 1
assert next(row for row in INDEX["items"] if row["sourceNo"] == 28)["variantCount"] == 9
print(json.dumps({"status": "PASS", "checked": len(items), "answers": EXPECTED_ANSWERS,
                  "independentMethod": "ordered pairs + DFS route enumeration",
                  "sourceOriginalAnswer": 17, "version": DATA["version"]}, ensure_ascii=False, indent=2))

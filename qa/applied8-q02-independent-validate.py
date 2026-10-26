#!/usr/bin/env python3
"""Direct source and two-method independent audit for Applied 8 Q2."""
import hashlib
import itertools
import json
import xml.etree.ElementTree as ET
from collections import Counter
from pathlib import Path

from PIL import Image, ImageChops
from pypdf import PdfReader

R = Path(__file__).resolve().parents[1]
W = R / ".private-work/hw-expansion-20261023/hw8"
EXAM = R / "materials/초등과정 대비 실전 모의고사활용 8회.pdf"
ANSWER = W / "source-review/applied8-answer-drive-copy-q07.pdf"
D = json.loads((R / "bank/data/applied8-expanded.json").read_text())
I = json.loads((R / "bank/data/applied8-expanded-index.json").read_text())
S = json.loads((W / "q02-source-answer-review.json").read_text())
M = json.loads((W / "q02-independent-math.json").read_text())
VERSION = "20261025-applied8-expansion-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q12-q13-q14-q15-q17-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r27"
NOS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 17, 18, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]
CASES = [(3, 2), (2, 2), (4, 2), (2, 3), (3, 3), (4, 3), (2, 4), (3, 4), (4, 4)]


def graph(w, h):
    V = {(a, b) for b in range(h + 1) for a in range(w + 1)}
    E = set()
    add = lambda a, b: E.add(frozenset((a, b)))
    for b in range(h + 1):
        for a in range(w): add((a, b), (a + 1, b))
    for b in range(h):
        for a in range(w + 1): add((a, b), (a, b + 1))
        for a in range(w): add((a + 1, b), (a, b + 1))
    return V, E


def distance2(p, q):
    x, y = p[0] - q[0], p[1] - q[1]
    return x*x + y*y + x*y


def side_exists(p, q, edges):
    dx, dy = q[0] - p[0], q[1] - p[1]
    if dy == 0: sx, sy, n = (1 if dx > 0 else -1), 0, abs(dx)
    elif dx == 0: sx, sy, n = 0, (1 if dy > 0 else -1), abs(dy)
    elif dx + dy == 0: sx, sy, n = (1 if dx > 0 else -1), (1 if dy > 0 else -1), abs(dx)
    else: return False
    for i in range(n):
        a, b = (p[0] + i*sx, p[1] + i*sy), (p[0] + (i+1)*sx, p[1] + (i+1)*sy)
        if frozenset((a, b)) not in edges: return False
    return True


def vertex_triple_counts(w, h):
    vertices, edges = graph(w, h)
    found = Counter()
    for tri in itertools.combinations(sorted(vertices), 3):
        d = [distance2(tri[a], tri[b]) for a, b in ((0, 1), (0, 2), (1, 2))]
        if d[0] and d[0] == d[1] == d[2] and all(side_exists(a, b, edges) for a, b in itertools.combinations(tri, 2)):
            found[d[0]**0.5] += 1
    return {str(int(side)): count for side, count in sorted(found.items())}


def placement_formula(w, h):
    return {str(side): 2 * (w - side + 1) * (h - side + 1)
            for side in range(1, min(w, h) + 1)}


norm = lambda t: "".join((t or "").split())
ep, ap = PdfReader(str(EXAM)).pages[0], PdfReader(str(ANSWER)).pages[0]
assert norm(ep.extract_text()) == norm(ap.extract_text())
assert "성냥개비로만든모양" in norm(ep.extract_text()) and "세모모양" in norm(ep.extract_text())
assert S["sourceExam"]["directVisualReview"] and S["sourceAnswer"] == 16
assert S["answerCandidate"]["containsAnswers"] is False
assert D["version"] == I["version"] == VERSION and D["itemCount"] == I["itemCount"] == 243
assert D["availableSourceNos"] == NOS and len(I["items"]) == 27
assert D["pendingSourceNos"] == I["pendingSourceNos"] == [11, 16, 19]
crop = R / "bank/assets/applied8/q2-matchstick-triangles-original.png"
render = W / "q1-source-review/original-1.png"
assert ImageChops.difference(Image.open(crop).convert("RGB"), Image.open(render).crop((205, 1450, 710, 1765)).convert("RGB")).getbbox() is None
items = sorted((x for x in D["items"] if x["sourceNo"] == 2), key=lambda x: x["variantNo"])
assert len(items) == 9 and [int(x["answer"]) for x in items] == [16, 10, 22, 16, 28, 40, 22, 40, 60]
assert len(M["cases"]) == 9
for item, dims, row in zip(items, CASES, M["cases"]):
    w, h = dims
    formula = placement_formula(w, h)
    independent = vertex_triple_counts(w, h)
    assert independent == formula == row["formulaCountsBySide"] == row["tripleEnumerationCountsBySide"]
    total = sum(formula.values())
    assert item["answer"] == str(total) == row["triangleCount"]
    assert item["verification"]["parameters"]["countBySideLength"] == formula
    assert item["area"] == "도형" and item["subarea"] == "평면도형의 개수" and item["pointBand"] == "2.7"
    assert item["difficultyEvidence"]["label"] == "하" and len(item["solutionSteps"]) == len(formula) + 1
    assert item["learningPoint"] and item["learningLocation"]
    if item["variantNo"] > 1:
        svg = ET.parse(R / "bank" / item["asset"]["src"]).getroot()
        tags = [el.tag.rsplit("}", 1)[-1] for el in svg]
        expected_edges = (h + 1) * w + h * (w + 1) + h * w
        assert tags.count("line") == expected_edges
        assert tags.count("circle") == (w + 1) * (h + 1)
print("PASS Applied8 Q2: original page and blank answer copy compared; source crop pixel-exact; 9 answers cross-checked by placement formula and vertex-triple graph enumeration; r27 inventory 243/27.")

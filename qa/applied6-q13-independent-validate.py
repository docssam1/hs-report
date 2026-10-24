#!/usr/bin/env python3
"""Independently verify Applied 6 Q13 source and nine layered-prism variants."""
import hashlib
import itertools
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "bank/data/applied6-expanded.json"
INDEX_PATH = ROOT / "bank/data/applied6-expanded-index.json"
QUESTION_PDF = ROOT / "materials/초등과정 대비 실전 모의고사 활용 6회.pdf"
ANSWER_PDF = ROOT / ".private-work/hw-expansion-20261023/hw6/source-answer-6.pdf"
EVIDENCE = ROOT / ".private-work/hw-expansion-20261023/hw6/q13-independent-math.json"
OLD_DATA = json.loads(subprocess.check_output(
    ["git", "show", "f8c2dc4c6be8a23ead566a22b4e525a51e89f9af:bank/data/applied6-expanded.json"],
    cwd=ROOT, text=True
))
data = json.loads(DATA_PATH.read_text())
index = json.loads(INDEX_PATH.read_text())
assert data["version"] == "20261024-applied6-expansion-r12"
assert data["availableSourceNos"] == [2, 3, 5, 7, 8, 9, 10, 11, 12, 13, 14, 16]
assert len(data["items"]) == 108 and len([x for x in data["items"] if x["sourceNo"] == 13]) == 9
assert index["version"] == data["version"] and index["itemCount"] == len(data["items"])
assert index["pendingSourceNos"] == data["pendingSourceNos"]
assert {x["sourceNo"] for x in index["items"]} == set(data["availableSourceNos"])
assert [x for x in data["items"] if x["sourceNo"] not in (13, 14, 16)] == OLD_DATA["items"]
assert sum(1 for n in data["availableSourceNos"] if len([x for x in data["items"] if x["sourceNo"] == n]) == 9) == 12

def rectangles(width, depth):
    return (width * (width + 1) // 2) * (depth * (depth + 1) // 2)

def enumerate_filled_cuboids(layers):
    occupied = set()
    bounds = []
    base_w, base_d = layers[0]
    for z, (width, depth) in enumerate(layers):
        x0, y0 = (base_w - width) // 2, (base_d - depth) // 2
        bounds.append((x0, y0, width, depth))
        occupied.update((x, y, z)
                        for x in range(x0, x0 + width)
                        for y in range(y0, y0 + depth))
    found = 0
    # Enumerate every possible top layer, vertical start, and footprint.
    for top_z, (x0, y0, width, depth) in enumerate(bounds):
        for bottom_z in range(top_z + 1):
            for xa, xb in itertools.combinations(range(x0, x0 + width + 1), 2):
                for ya, yb in itertools.combinations(range(y0, y0 + depth + 1), 2):
                    if all((x, y, z) in occupied
                           for z in range(bottom_z, top_z + 1)
                           for x in range(xa, xb)
                           for y in range(ya, yb)):
                        found += 1
    return found

source_layers = [(5, 5), (3, 3), (1, 1)]
source_answer = enumerate_filled_cuboids(source_layers)
assert sum(w * d for w, d in source_layers) == 35
assert source_answer == 300
source_sha = hashlib.sha256(QUESTION_PDF.read_bytes()).hexdigest()
answer_sha = hashlib.sha256(ANSWER_PDF.read_bytes()).hexdigest()
assert source_sha == "54a5bf1489a9d537f9cc34e6db29609bc6384f8a18b666a40eb11561f912ea4c"
assert answer_sha == "b1ff5ad327fd669a56508bc1256be8743e809122f1e80b3af5f0731874939975"

items = [x for x in data["items"] if x["sourceNo"] == 13]
proof = []
answers = []
for item in items:
    layers = [(x["width"], x["depth"])
              for x in item["verification"]["parameters"]["layersBottomToTop"]]
    assert layers[0][0] % 2 == layers[0][1] % 2 == 1
    assert all(layers[i] == (layers[i-1][0] - 2, layers[i-1][1] - 2)
               for i in range(1, len(layers)))
    assert layers != source_layers
    layer_counts = [rectangles(w, d) for w, d in layers]
    weighted = [(i + 1) * count for i, count in enumerate(layer_counts)]
    formula = sum(weighted)
    exhaustive = enumerate_filled_cuboids(layers)
    assert formula == exhaustive == item["answerParts"][0]
    assert item["answer"] == str(formula) and item["acceptedAnswers"] == [str(formula)]
    assert item["reviewStatus"] == "verified"
    assert item["area"] == "도형" and item["pointBand"] == "3.4"
    assert item["difficultyEvidence"]["label"] == "중"
    assert item["difficultyEvidence"]["estimated"] is True
    indexed = next(x for x in index["items"] if x["sourceNo"] == 13)
    assert item["pointBand"] == indexed["pointBand"] and item["detailType"] == indexed["detailType"]
    assert item["verification"]["sourceExamPage"] == 3
    assert item["verification"]["sourceAnswerPage"] == 3
    assert item["verification"]["sourceDrawingCompared"] is True
    assert item["verification"]["variantUsesSourceDrawing"] is False
    assert len(item["solutionSteps"]) >= 3
    assert item["learningLocation"] and item["learningPoint"]
    answers.append(formula)
    proof.append({
        "id": item["id"],
        "layersBottomToTop": layers,
        "rectanglesPerLayer": layer_counts,
        "heightWeightedTerms": weighted,
        "answerByFormula": formula,
        "answerByOccupiedCellEnumeration": exhaustive,
        "methodsAgree": formula == exhaustive,
    })
assert len(set(answers)) == 9

result = {
    "source": {
        "questionPdfSha256": source_sha,
        "answerPdfSha256": answer_sha,
        "questionPage": 3,
        "answerPage": 3,
        "layersBottomToTop": source_layers,
        "cubeCount": 35,
        "teacherHandwrittenAnswer": 300,
        "enumeratedFilledCuboids": source_answer,
        "sourceDrawingDirectlyCompared": True,
    },
    "dataSha256": hashlib.sha256(DATA_PATH.read_bytes()).hexdigest(),
    "items": proof,
    "passed": True,
}
EVIDENCE.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
print("PASS Applied6 Q13: source 35-cube stack has 300 cuboids; nine variants agree by formula and occupied-cell enumeration")

"""Independent audit for the nine Applied 3 Q07 dice-path variants."""
from __future__ import annotations

import hashlib
import itertools
import json
import math
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "bank/data/applied3-expanded.json"
INDEX_PATH = ROOT / "bank/data/applied3-expanded-index.json"
EXAM_PATH = ROOT / "materials/초등과정 대비 실전 모의고사 활용 3회.pdf"
ANSWER_PATH = ROOT / ".private-work/hw-expansion-20261023/hw3/source/drive-answer-2022-3-candidate.pdf"
ORIGINAL_FIGURE = ROOT / "bank/assets/applied3/dice-path-original.png"
OUT = ROOT / ".private-work/hw-expansion-20261023/hw3/q07-review/q07-independent-audit-r1.json"
VERSION = "20261026-applied3-expansion-q04-q07-q12-q14-q18-q21-q06-locked-r11"
EXPECTED_EXAM_SHA = "877da93ca12b01d513ef182bbf5998c6a391f2ee6c243059dcf79d901bf8f0f6"
EXPECTED_ANSWER_CANDIDATE_SHA = "84290ca2e61e46f5fca1dcd9957e841a6cfce45ba2f5ae5f0d3ff2d2cb288fed"
EXPECTED_ORIGINAL_FIGURE_SHA = "2a206eaba18176ca5aa5c3875ab7ce3199453ba1690a7dc48cc95ceba38d8c07"


def legal_orientations() -> set[tuple[int, int, int]]:
    """Enumerate the 24 proper rotations of the source die using signed matrices."""
    base = {"U": 2, "D": 5, "F": 3, "B": 4, "R": 1, "L": 6}
    vectors = {
        "U": (0, 0, 1), "D": (0, 0, -1), "F": (0, -1, 0),
        "B": (0, 1, 0), "R": (1, 0, 0), "L": (-1, 0, 0),
    }
    target = {v: k for k, v in vectors.items()}
    orientations = set()
    for perm in itertools.permutations(range(3)):
        for signs in itertools.product((-1, 1), repeat=3):
            matrix = tuple(tuple(signs[i] if j == perm[i] else 0 for j in range(3)) for i in range(3))
            determinant = (
                matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1])
                - matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0])
                + matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0])
            )
            if determinant != 1:
                continue
            moved = {}
            for face, vector in vectors.items():
                rotated = tuple(sum(matrix[i][j] * vector[j] for j in range(3)) for i in range(3))
                moved[target[rotated]] = base[face]
            orientations.add((moved["U"], moved["F"], moved["R"]))
    assert len(orientations) == 24
    return orientations


def top_values(initial: tuple[int, int, int], moves: str = "RRFLL") -> list[int]:
    top, front, right = initial
    faces = {
        "U": top, "D": 7 - top, "F": front,
        "B": 7 - front, "R": right, "L": 7 - right,
    }
    result = []
    for move in moves:
        old = faces.copy()
        if move == "R":
            faces.update(U=old["L"], D=old["R"], R=old["U"], L=old["D"])
        elif move == "L":
            faces.update(U=old["R"], D=old["L"], R=old["D"], L=old["U"])
        elif move == "F":
            faces.update(U=old["B"], D=old["F"], F=old["U"], B=old["D"])
        else:
            raise AssertionError(move)
        result.append(faces["U"])
    return result


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
index = json.loads(INDEX_PATH.read_text(encoding="utf-8"))
assert data["version"] == index["version"] == VERSION
assert len(data["items"]) == index["itemCount"] == 207
assert len(index["items"]) == 23 and len(data["availableSourceNos"]) == 23
assert data["pendingSourceNos"] == index["pendingSourceNos"] == [6, 13, 16, 19, 24, 27, 29]
assert sha(EXAM_PATH) == EXPECTED_EXAM_SHA
assert sha(ANSWER_PATH) == EXPECTED_ANSWER_CANDIDATE_SHA
assert sha(ORIGINAL_FIGURE) == EXPECTED_ORIGINAL_FIGURE_SHA
assert top_values((2, 3, 1)) == [6, 5, 4, 6, 3]
assert sum(top_values((2, 3, 1))) == 24
legal = legal_orientations()
assert (2, 3, 1) in legal
variants = [x for x in data["items"] if x["sourceNo"] == 7]
assert len(variants) == 9
assert [(x["sourceNo"], x["variantCount"]) for x in index["items"] if x["sourceNo"] == 7] == [(7, 9)]
answers, orientations, evidence = [], set(), []
for item in variants:
    p = item["verification"]["parameters"]
    triple = (p["initialTop"], p["initialFront"], p["initialRight"])
    assert triple in legal and triple not in orientations
    orientations.add(triple)
    sequence = top_values(triple)
    answer = sum(sequence)
    assert p["oppositeFaceSum"] == 7
    assert p["movesStartThroughFive"] == list("RRFLL")
    assert p["topSequence"] == sequence
    assert item["answerParts"] == [answer] and item["answer"] == str(answer)
    assert item["acceptedAnswers"] == [str(answer)]
    assert item["pointBand"] == "2.7" and item["difficultyEvidence"]["label"] == "하"
    assert item["reviewStatus"] == "verified" and len(item["solutionSteps"]) == 3
    assert item["verification"]["sourceExamPage"] == item["verification"]["sourceAnswerPage"] == 2
    assert item["verification"]["sourceDrawingPreserved"] is True
    assert item["asset"]["kind"] == "svg"
    asset = ROOT / "bank" / item["asset"]["src"]
    assert sha(asset) == item["asset"]["sha256"] == item["verification"]["assetSha256"]
    root = ET.parse(asset).getroot()
    assert root.attrib["viewBox"] == "0 0 420 298"
    ns = {"s": "http://www.w3.org/2000/svg"}
    face_groups = root.findall(".//s:g[@data-face]", ns)
    assert [g.attrib["data-face"] for g in face_groups] == ["top", "front", "right"]
    visible_counts = [len(g.findall("s:circle", ns)) for g in face_groups]
    assert visible_counts == [triple[0], triple[1], triple[2]]
    tile_labels = [n.text for n in root.findall(".//s:text", ns) if n.text in list("12345")]
    assert tile_labels == list("12345")
    assert item["asset"]["description"] and "정답" not in item["asset"]["description"]
    answers.append(answer)
    evidence.append({"id": item["id"], "orientation": triple, "topSequence": sequence, "answer": answer, "assetSha256": sha(asset)})
assert len(set(answers)) == 9 and len(orientations) == 9
assert answers == [21, 17, 23, 19, 18, 14, 20, 13, 11]
OUT.parent.mkdir(parents=True, exist_ok=True)
result = {
    "pass": True, "version": VERSION, "questionCount": len(data["items"]), "sourceTypeCount": len(index["items"]),
    "pendingSourceNos": data["pendingSourceNos"], "originalQ07": {"orientation": [2, 3, 1], "moves": list("RRFLL"), "topSequence": top_values((2, 3, 1)), "answer": 24},
    "q07Variants": evidence, "distinctVariantAnswers": len(set(answers)),
    "originalFigureSha256": sha(ORIGINAL_FIGURE), "examSha256": sha(EXAM_PATH),
    "answerCandidateSha256": sha(ANSWER_PATH), "dataSha256": sha(DATA_PATH), "indexSha256": sha(INDEX_PATH),
    "method": "all 24 proper cube rotations, independent face-state transitions, SVG pip-count validation",
}
OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps(result, ensure_ascii=False, indent=2))

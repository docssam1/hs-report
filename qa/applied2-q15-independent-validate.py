"""Verify Q15 fold/cut answers and both fresh SVG drawings independently."""

import importlib.util
import json
from fractions import Fraction as Q
from pathlib import Path
from xml.etree import ElementTree

ROOT = Path(__file__).resolve().parents[1]
MODULE = ROOT / "tools/question-bank/applied2_q15_topology.py"
spec = importlib.util.spec_from_file_location("q15_topology", MODULE)
topology = importlib.util.module_from_spec(spec)
spec.loader.exec_module(topology)

data = json.loads((ROOT / "bank/data/applied2-expanded.json").read_text())
items = [x for x in data["items"] if x["sourceNo"] == 15]
assert len(items) == 9 and {x["variantNo"] for x in items} == set(range(1, 10))
source_count, source_graph = topology.pieces(4, Q(1), Q(2), Q(4), Q(6), Q(2), True, True)
assert source_count == len(topology.pieces_by_faces(source_graph)) == 9
expected_answers = [7, 9, 10, 7, 9, 10, 7, 9, 10]
seen = set()

for n, item in enumerate(sorted(items, key=lambda x: x["variantNo"]), 1):
    p = item["verification"]["parameters"]
    params = (p["layers"], p["foldedHeightCm"], p["widthCm"],
              p["leftStationCm"], p["rightStationCm"], p["notchHeightCm"])
    assert params not in seen
    seen.add(params)
    assert p["folds"] == p["layers"] - 1
    assert item["id"] == f"applied2-q15-v{n}"
    assert item["pointBand"] == "3.4" and item["reviewStatus"] == "verified"
    assert item["answerContract"] == "ordered-parts"
    assert item["difficultyEvidence"]["label"] == "중"
    count, graph = topology.pieces(params[0], Q(params[5]), Q(params[3]), Q(params[4]),
                                    Q(params[2]), Q(params[1]), True, True)
    faces = topology.pieces_by_faces(graph)
    assert count == len(faces) == expected_answers[n - 1]
    assert count == item["answerParts"][0] == p["answer"]
    assert item["answer"] == f"{count}조각"
    # An exterior region surrounding a closed hole has multiple boundary cycles;
    # the positive loop areas overlap, so their sum is not the sheet area.
    for key in ("asset", "solutionAsset"):
        path = ROOT / "bank" / item[key]["src"]
        assert path.is_file()
        svg = ElementTree.parse(path).getroot()
        assert svg.tag.endswith("svg")
        assert int(svg.attrib["width"]) > 0 and int(svg.attrib["height"]) > 0
        assert svg.attrib["viewBox"].split()[2:] == [svg.attrib["width"], svg.attrib["height"]]
    assert "접힌 쪽" in item["text"] and "아래쪽" in item["text"]
    assert "점선" in item["solution"] and item["solutionAsset"]["caption"]

assert data["itemCount"] == 261 and data["pendingSourceNos"] == [22]
print("PASS Applied2 Q15: source nine pieces; nine variants, exact graph/face counts, SVGs and solution links")

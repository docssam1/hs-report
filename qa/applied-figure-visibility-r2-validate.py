#!/usr/bin/env python3
"""Check Applied 3 Q19 spacing and Applied 4 Q21 contrast without changing math."""
import importlib.util
import json
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NS = "{http://www.w3.org/2000/svg}"


def items(round_no, source_no):
    data = json.loads((ROOT / f"bank/data/applied{round_no}-expanded.json").read_text())
    found = sorted((x for x in data["items"] if x["sourceNo"] == source_no),
                   key=lambda x: x["variantNo"])
    assert len(found) == 9 and [x["variantNo"] for x in found] == list(range(1, 10))
    return found


for x in items(3, 19):
    n = x["variantNo"]
    old = (ROOT / f"bank/assets/applied3/q19-v{n}.svg").read_text()
    new = (ROOT / "bank" / x["asset"]["src"]).read_text()
    assert x["asset"]["src"] == f"assets/applied3/q19-v{n}-r2.svg"
    assert new.replace('<g transform="translate(0 35)">', "", 1).replace("</g><rect x=", "<rect x=", 1) == old
    root = ET.fromstring(new)
    triangle = root.find(f"{NS}g[@transform='translate(0 35)']")
    circles = triangle.findall(f"{NS}circle")
    cards = root.findall(f"{NS}rect")[1:]
    assert len(circles) == len(cards) == 9
    circle_top = min(float(c.get("cy")) - float(c.get("r")) + 35 for c in circles)
    card_bottom = max(float(c.get("y")) + float(c.get("height")) for c in cards)
    assert circle_top-card_bottom >= 25
    p = x["verification"]["parameters"]
    assert x["verification"]["sourceExamPage"] == 4
    assert x["answerParts"] == [3*p["sideSum"]-p["allCardSum"]]

spec = importlib.util.spec_from_file_location("q21_math", ROOT / "qa/applied4-q21-independent-validate.py")
mathqa = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mathqa)
rots = mathqa.matrix_rotations()
assert len(rots) == 24
for x in items(4, 21):
    n = x["variantNo"]
    old = ET.parse(ROOT / f"bank/assets/applied4/q21-expanded-v{n}.svg").getroot()
    new = ET.parse(ROOT / "bank" / x["asset"]["src"]).getroot()
    assert x["asset"]["src"] == f"assets/applied4/q21-expanded-v{n}-r2.svg"
    old_polygons, new_polygons = old.findall(f".//{NS}polygon"), new.findall(f".//{NS}polygon")
    assert len(old_polygons) == len(new_polygons)
    assert [p.get("points") for p in old_polygons] == [p.get("points") for p in new_polygons]
    openings = [p for p in new_polygons if p.get("fill") == "#fff"]
    assert len(openings) == (1 if n <= 3 else 2)
    assert all(p.get("stroke-width") == "3" for p in openings)
    assert all(p.get("fill") in ("#d4d4d4", "#bdbdbd", "#e6e6e6", "#fff") for p in new_polygons)
    p = x["verification"]["parameters"]
    dims = tuple(p["dimensions"])
    holes = mathqa.holes(dims, p["tunnelAxis"], [tuple(y) for y in p["tunnelLines"]])
    cubes = {(a,b,c) for a in range(dims[0]) for b in range(dims[1]) for c in range(dims[2])} - holes
    assert mathqa.connected(cubes)
    lows, highs = [], []
    for cube in cubes:
        face_dirs = mathqa.exposed(cube, cubes, dims)
        scores = [sum(mathqa.BASE[tuple(mathqa.dot(v, rot[k]) for k in range(3))] for v in face_dirs) for rot in rots]
        lows.append(min(scores)); highs.append(max(scores))
    assert x["answerParts"] == [sum(highs), sum(lows)]

print("PASS: Applied3 Q19 nine card gaps and answers; Applied4 Q21 nine unchanged polygons, clear openings and 24-orientation answers")

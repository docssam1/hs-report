#!/usr/bin/env python3
"""Independent geometry and column-alignment checks for Applied 4/7/8 Q1."""
import json
import math
import re
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NS = {"s": "http://www.w3.org/2000/svg"}


def items(round_no):
    data = json.loads((ROOT / f"bank/data/applied{round_no}-expanded.json").read_text())
    found = sorted((x for x in data["items"] if x["sourceNo"] == 1), key=lambda x: x["variantNo"])
    assert len(found) == 9
    return found


def svg(item):
    p = ROOT / "bank" / item["asset"]["src"]
    assert p.is_file(), p
    return ET.parse(p).getroot()


for x in items(4):
    root = svg(x)
    width = x["verification"]["parameters"]["repeatedDigitCount"]
    stars = root.findall(".//s:polygon", NS)[:width]
    top = [float(p.get("points").split()[0].split(",")[0]) for p in stars]
    second = [float(c.get("cx")) for c in root.findall(".//s:circle", NS)[:width]]
    digit = [t for t in root.findall(".//s:text", NS) if t.text and t.text.isdigit()][0]
    assert top == second and top[-1] == float(digit.get("x")), (x["id"], top, second)
    assert len(top) == width and len(set(top)) == width

for x in items(7):
    root = svg(x)
    params = x["verification"]["parameters"]
    a, b = params["knownTriangleSides"]
    u, z = params["unknownTriangleSide"], params["exposedSquareSideSegment"]
    side, width, answer = params["squareSide"], params["rectangleWidth"], int(x["answer"])
    assert a*a + u*u == b*b and a+b+u == params["trianglePerimeter"]
    assert side == u+z and width == 2*side and answer == 2*(width+side)
    rect = root.find(".//s:rect[@fill='none']", NS)
    assert rect is not None
    rw, rh = float(rect.get("width")), float(rect.get("height"))
    assert math.isclose(rw/rh, 2, abs_tol=1e-5)
    paths = root.findall(".//s:path", NS)
    def coords(d):
        return [tuple(map(float, m)) for m in re.findall(r"([\d.]+),([\d.]+)", d)]
    square, tri = coords(paths[0].get("d")), coords(paths[1].get("d"))
    p, top, right, bottom = square
    p2, u_pt, v_pt = tri
    assert p == p2 and math.isclose(u_pt[0], v_pt[0], abs_tol=.002)
    scale = rh/side
    for actual, expected in ((math.dist(p, top), side*scale),
                             (math.dist(p, bottom), side*scale),
                             (math.dist(p, u_pt), a*scale),
                             (math.dist(u_pt, v_pt), b*scale),
                             (math.dist(p, v_pt), u*scale),
                             (math.dist(v_pt, bottom), z*scale)):
        assert math.isclose(actual, expected, abs_tol=.003), (x["id"], actual, expected)
    assert math.isclose(float(rect.get("x"))+rw, u_pt[0], abs_tol=.002)
    assert math.isclose(float(rect.get("y"))+rh, v_pt[1], abs_tol=.002)

for x in items(8)[1:]:
    root = svg(x)
    # Each second equation has two operands at x=348/390 and its result
    # exactly under those same units/tens columns.
    shapes = root.findall("./s:rect", NS) + root.findall("./s:circle", NS) + root.findall("./s:polygon", NS)
    def center(shape):
        tag = shape.tag.rsplit("}", 1)[-1]
        if tag == "rect": return float(shape.get("x"))+float(shape.get("width"))/2, float(shape.get("y"))+float(shape.get("height"))/2
        if tag == "circle": return float(shape.get("cx")), float(shape.get("cy"))
        pts = [tuple(map(float, p.split(","))) for p in shape.get("points").split()]
        return pts[0][0], 222.0 if min(y for _, y in pts) > 200 else (130.0 if min(y for _, y in pts) < 120 else 170.0)
    positions = [center(sh) for sh in shapes]
    for y in (130, 170, 222):
        row = sorted(v for v in positions if abs(v[1]-y) < .1 and v[0] > 300)
        assert row == [(348.0, float(y)), (390.0, float(y))], (x["id"], y, row)

print("PASS: Applied4 9 aligned additions, Applied7 9 exact overlap diagrams and answers, Applied8 8 aligned second equations")

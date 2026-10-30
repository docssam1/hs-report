#!/usr/bin/env python3
"""Correct Applied 7 Q1 variants to geometrically exact overlap drawings.

The original PDF is unchanged. Earlier variant SVGs remain as historical assets;
only the nine Q1 records point to the new r2 drawings.
"""
from __future__ import annotations

import json
import math
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "bank/data/applied7-expanded.json"
CASES = [(1, 4), (1, 5), (1, 6), (2, 5), (2, 6), (2, 7),
         (3, 7), (3, 8), (3, 9)]  # 3-4-5 triangle scale, exposed segment


def drawing(variant: int, k: int, z: int) -> str:
    side = 3 * k + z
    scale = min(15.0, 165.0 / side)
    p = (310.0, 170.0)
    upper = (0.6, -0.8)
    lower = (0.8, 0.6)

    def along(origin, unit, length):
        return (origin[0] + unit[0] * length * scale,
                origin[1] + unit[1] * length * scale)

    top = along(p, upper, side)
    bottom = along(p, lower, side)
    right = (top[0] + bottom[0] - p[0], top[1] + bottom[1] - p[1])
    u = along(p, upper, 4 * k)
    v = along(p, lower, 3 * k)
    assert math.isclose(u[0], v[0], abs_tol=1e-7)
    rect_x = u[0] - 2 * side * scale
    rect_y = v[1] - side * scale
    assert rect_x > 0 and rect_y < u[1] and v[1] < 350
    assert math.isclose(v[1] - u[1], 5 * k * scale, abs_tol=1e-7)
    assert math.isclose(math.dist(p, u), 4 * k * scale, abs_tol=1e-7)
    assert math.isclose(math.dist(p, v), 3 * k * scale, abs_tol=1e-7)

    fmt = lambda pt: f"{pt[0]:.3f},{pt[1]:.3f}"
    a = (p[0] + 0.48 * (u[0] - p[0]) - 9,
         p[1] + 0.48 * (u[1] - p[1]) - 11)
    zpos = (v[0] + 0.52 * (bottom[0] - v[0]) + 8,
            v[1] + 0.52 * (bottom[1] - v[1]) + 24)
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="560" height="350" viewBox="0 0 560 350" role="img" aria-label="직사각형 가와 정사각형 나의 겹친 삼각형. 삼각형의 둘레 {12*k} cm, 표시된 변 {4*k} cm와 {5*k} cm, 이어진 변 {z} cm">
<rect width="560" height="350" fill="#fff"/>
<g stroke="#191511" stroke-width="2.2" stroke-linejoin="round">
 <rect x="{rect_x:.3f}" y="{rect_y:.3f}" width="{2*side*scale:.3f}" height="{side*scale:.3f}" fill="none"/>
 <path d="M {fmt(p)} L {fmt(top)} L {fmt(right)} L {fmt(bottom)} Z" fill="none"/>
 <path d="M {fmt(p)} L {fmt(u)} L {fmt(v)} Z" fill="#e5e5e5"/>
</g>
<g fill="#191511" font-family="Noto Serif KR,serif" font-size="19">
 <text x="{rect_x+0.36*2*side*scale:.3f}" y="{rect_y+0.55*side*scale:.3f}" text-anchor="middle">가</text>
 <text x="{right[0]-0.3*side*scale:.3f}" y="{right[1]:.3f}" text-anchor="middle">나</text>
 <text x="{a[0]:.3f}" y="{a[1]:.3f}" text-anchor="middle">{4*k} cm</text>
 <text x="{u[0]+10:.3f}" y="{(u[1]+v[1])/2:.3f}">{5*k} cm</text>
 <text x="{zpos[0]:.3f}" y="{zpos[1]:.3f}" text-anchor="middle">{z} cm</text>
</g>
</svg>'''
    target = ROOT / f"bank/assets/applied7/q01-v{variant}-r2.svg"
    target.write_text(svg, encoding="utf-8")
    ET.parse(target)
    return target.relative_to(ROOT / "bank").as_posix()


def main() -> None:
    data = json.loads(DATA.read_text(encoding="utf-8"))
    q1 = sorted((item for item in data["items"] if item["sourceNo"] == 1),
                key=lambda item: item["variantNo"])
    assert len(q1) == 9 and [item["variantNo"] for item in q1] == list(range(1, 10))
    for item, (k, z) in zip(q1, CASES):
        n = item["variantNo"]
        a, b, u = 4*k, 5*k, 3*k
        perimeter, side = 12*k, u+z
        width, answer = 2*side, 6*side
        item["asset"]["src"] = drawing(n, k, z)
        item["asset"]["description"] = (f"직사각형과 정사각형의 정확한 겹침: 삼각형 둘레 {perimeter} cm, "
                                          f"표시된 두 변 {a} cm·{b} cm, 이어진 변 {z} cm")
        item["text"] = ("직사각형 가와 정사각형 나의 한 변의 길이는 같습니다. "
                        "직사각형 가의 가로는 세로의 2배입니다. "
                        f"두 도형이 겹쳐 생긴 삼각형의 세 변의 길이의 합은 {perimeter} cm입니다. "
                        "직사각형 가의 둘레는 몇 cm입니까?")
        steps = [
            f"겹친 삼각형의 세 변의 합은 {perimeter} cm이고 두 변은 {a} cm와 {b} cm이므로 남은 변은 {perimeter}−{a}−{b}={u} cm입니다.",
            f"정사각형의 한 변은 {u}+{z}={side} cm입니다. 직사각형의 세로도 {side} cm입니다.",
            f"직사각형의 가로는 {width} cm이므로 둘레는 ({width}+{side})×2={answer} cm입니다.",
        ]
        item["answer"] = str(answer)
        item["answerParts"] = [answer]
        item["acceptedAnswers"] = [str(answer), f"{answer}cm", f"{answer} cm"]
        item["solutionSteps"] = steps
        item["solution"] = " ".join(steps)
        item["practiceStorageVersion"] = "20261030-applied7-q01-geometry-r2"
        verification = item["verification"]
        verification["independentMethod"] = ("3:4:5 직각삼각형의 각 변 길이를 좌표에서 다시 측정하고 "
                                              "정사각형·직사각형의 실제 SVG 길이와 답을 대조한다.")
        verification["parameters"] = {
            "trianglePerimeter": perimeter, "knownTriangleSides": [a, b],
            "unknownTriangleSide": u, "exposedSquareSideSegment": z,
            "squareSide": side, "rectangleWidth": width,
            "rectanglePerimeter": answer, "geometryScale": k,
        }
        verification["independentSuite"] = "qa/applied-q01-artwork-r2-validate.py"
        assert a*a + u*u == b*b and answer == 2*(width+side)
    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("PASS: revised Applied 7 Q1 answers", [item["answer"] for item in q1])


if __name__ == "__main__":
    main()

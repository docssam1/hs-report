#!/usr/bin/env python3
"""Render source-faithful Applied 7 Q19 fold-and-punch diagrams for variants 1–9."""
from __future__ import annotations

import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "bank/assets/applied7"
OUT = ROOT / ".private-work/hw-expansion-20261023/hw7/q19-render-r30"
SVG_DIR = OUT / "svg"
CASES = [(1, 1), (2, 1), (3, 1), (4, 1), (3, 2), (4, 2), (3, 3), (4, 3), (3, 4)]

# Coordinates are on a unit square with the same orientation as source Q19.
# The first fold leaves x+y<1; the second fold leaves x<y. The black square is
# punched in the stationary half before fold two, so it contributes two holes.
# Round holes are punched after fold two, through four layers.
SQUARE_PUNCHES = [(0.10, 0.20), (0.30, 0.50), (0.25, 0.65), (0.10, 0.35)]
ROUND_PUNCHES = [(0.10, 0.55), (0.15, 0.70), (0.20, 0.45), (0.10, 0.80)]


def reflect_first(p):
    x, y = p
    return (1 - y, 1 - x)


def reflect_second(p):
    x, y = p
    return (y, x)


def circle_orbit(p):
    q = reflect_second(p)
    r = reflect_first(p)
    s = reflect_first(q)
    return [p, q, r, s]


def square_orbit(p):
    return [p, reflect_first(p)]


def no_duplicate_points(points):
    return all(math.dist(a, b) > 0.10 for i, a in enumerate(points) for b in points[i + 1 :])


def validate_positions():
    assert all(x + y < 1 and x < y for x, y in SQUARE_PUNCHES)
    assert all(x + y < 1 and x < y for x, y in ROUND_PUNCHES)
    for a, b in CASES:
        square_points = [q for p in SQUARE_PUNCHES[:a] for q in square_orbit(p)]
        round_points = [q for p in ROUND_PUNCHES[:b] for q in circle_orbit(p)]
        assert no_duplicate_points(square_points), (a, b, "square overlap")
        assert no_duplicate_points(round_points), (a, b, "round overlap")
        assert no_duplicate_points(square_points + round_points), (a, b, "cross-family overlap")
        assert len(square_points) == 2 * a
        assert len(round_points) == 4 * b


def svg_diagram(square_count: int, round_count: int) -> str:
    w, h = 1320, 490
    side = 160
    centers = [130, 395, 660, 925, 1190]
    top = 40
    stroke = "#251f19"

    def xy(cx, model):
        x, y = model
        return (cx - side / 2 + side * x, top + side * y)

    def polygon(points, extra=""):
        pts = " ".join(f"{x:.1f},{y:.1f}" for x, y in points)
        return f'<polygon points="{pts}" fill="white" stroke="{stroke}" stroke-width="2.2" {extra}/>'

    def line(a, b, dash=False, width=1.8):
        d = ' stroke-dasharray="7 6"' if dash else ""
        return f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" stroke="{stroke}" stroke-width="{width}"{d}/>'

    def mark(model, kind, cx, size=8):
        x, y = xy(cx, model)
        if kind == "square":
            return f'<rect x="{x-size:.1f}" y="{y-size:.1f}" width="{2*size:.1f}" height="{2*size:.1f}" fill="{stroke}"/>'
        return f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{size:.1f}" fill="{stroke}"/>'

    def arrow(x1, x2, y):
        return (f'<path d="M{x1:.1f},{y-3:.1f} L{x2-18:.1f},{y-3:.1f} '
                f'L{x2-18:.1f},{y-9:.1f} L{x2:.1f},{y:.1f} '
                f'L{x2-18:.1f},{y+9:.1f} L{x2-18:.1f},{y+3:.1f} '
                f'L{x1:.1f},{y+3:.1f} Z" fill="{stroke}"/>')

    def fold_arrow(cx, model_start, model_end):
        x1, y1 = xy(cx, model_start)
        x2, y2 = xy(cx, model_end)
        dx, dy = x2 - x1, y2 - y1
        length = math.hypot(dx, dy) or 1
        ux, uy = dx / length, dy / length
        bx, by = x2 - 10 * ux, y2 - 10 * uy
        nx, ny = -uy, ux
        return (f'<path d="M{x1:.1f},{y1:.1f} Q{(x1+x2)/2+16:.1f},{(y1+y2)/2-6:.1f} {bx:.1f},{by:.1f}" '
                f'fill="none" stroke="{stroke}" stroke-width="2.3"/> '
                f'<path d="M{x2:.1f},{y2:.1f} L{bx+4*nx:.1f},{by+4*ny:.1f} '
                f'L{bx-4*nx:.1f},{by-4*ny:.1f} Z" fill="{stroke}"/>')

    # First panel: unopened square, with the source's first diagonal fold.
    x0 = centers[0] - side / 2
    y0 = top
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">',
             f'<rect x="0" y="0" width="{w}" height="{h}" fill="#ffffff"/>',
             f'<rect x="{x0}" y="{y0}" width="{side}" height="{side}" fill="white" stroke="{stroke}" stroke-width="2.2"/>',
             line((x0, y0 + side), (x0 + side, y0), True)]

    # The source's first fold leaves the top-left triangle x+y<=1.
    tri_models = [(0, 0), (1, 0), (0, 1)]
    tri = [xy(centers[1], p) for p in tri_models]
    parts.append(polygon(tri))
    # A light second edge indicates the two layers created by the first fold.
    parts.extend([line((centers[1] - side / 2 - 5, top + 8), (centers[1] - side / 2 - 5, top + side - 3), False, 1.2),
                  arrow(centers[0] + side / 2 + 8, centers[1] - side / 2 - 8, top + side / 2)])
    parts.append(fold_arrow(centers[1], (0.70, 0.25), (0.42, 0.48)))

    # Square punch marks are on the twice-layered triangle, before fold two.
    tri2 = [xy(centers[2], p) for p in tri_models]
    parts.append(polygon(tri2))
    parts.append(line(xy(centers[2], (0, 0)), xy(centers[2], (0.5, 0.5)), True))
    parts.extend(mark(p, "square", centers[2]) for p in SQUARE_PUNCHES[:square_count])
    parts.append(arrow(centers[1] + side / 2 + 8, centers[2] - side / 2 - 8, top + side / 2))

    # The source folds the right half over the stationary left half. The
    # retained quarter is bounded by (0,0), (0,1), and (1/2,1/2).
    folded_models = [(0, 0), (0, 1), (0.5, 0.5)]
    folded = [xy(centers[3], p) for p in folded_models]
    parts.append(polygon(folded))
    parts.append(line(xy(centers[3], (0.03, 0.96)), xy(centers[3], (0.53, 0.46)), False, 1.1))
    parts.append(fold_arrow(centers[3], (0.72, 0.31), (0.43, 0.52)))
    parts.append(arrow(centers[2] + side / 2 + 8, centers[3] - side / 2 - 8, top + side / 2))

    # Colored punches are made through four layers in the folded quarter.
    parts.append(polygon([xy(centers[4], p) for p in folded_models]))
    parts.extend(mark(p, "round", centers[4]) for p in ROUND_PUNCHES[:round_count])
    parts.append(arrow(centers[3] + side / 2 + 8, centers[4] - side / 2 - 8, top + side / 2))
    # Small line-art punch tool, matching the source's tool cue without text.
    parts.append(f'<path d="M1277 178 l24 -1 7 6 -20 5 -16 -4 z M1276 185 l28 -3 -5 7 -23 2 z" fill="none" stroke="{stroke}" stroke-width="2"/>')
    parts.append(f'<circle cx="1289" cy="185" r="2.2" fill="{stroke}"/>')

    # Unfolded sheet is left blank: no answer holes are revealed in the question.
    fs, fx, fy = 170, w / 2 - 85, 280
    parts.append(f'<rect x="{fx:.1f}" y="{fy:.1f}" width="{fs}" height="{fs}" fill="white" stroke="{stroke}" stroke-width="2.2"/>')
    parts.append(line((fx, fy), (fx + fs, fy + fs), True))
    parts.append(line((fx, fy + fs), (fx + fs, fy), True))
    parts.append('</svg>')
    return "".join(parts)


def main():
    validate_positions()
    OUT.mkdir(parents=True, exist_ok=True)
    records = []
    for variant, (a, b) in enumerate(CASES, 1):
        answer = 2 * a + 4 * b
        records.append({"variantNo": variant, "squarePunches": a, "coloredPunches": b,
                        "squareHolePositions": 2 * a, "coloredHolePositions": 4 * b,
                        "uniqueUnfoldedHolePositions": answer, "answer": answer})
        p = SVG_DIR / f"q19-fold-hole-v{variant}-r30.svg"
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(svg_diagram(a, b), encoding="utf-8")
    payload = {"sourceVariant": {"squarePunches": 1, "coloredPunches": 2, "answer": 10},
               "independentModel": "first fold creates two layers; second fold creates four; reflected hole coordinates are counted as sets to reject overlap",
               "cases": records}
    (OUT / "position-and-count-proof.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Rendered all nine new Q19 SVG variants; position orbits are pairwise distinct.")
    print("Answers:", [x["answer"] for x in records])


if __name__ == "__main__":
    main()

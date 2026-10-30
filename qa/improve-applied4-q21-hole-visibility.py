#!/usr/bin/env python3
"""Increase contrast of the existing Applied 4 Q21 tunnel diagrams."""
from __future__ import annotations

import json
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "bank/data/applied4-expanded.json"


def main() -> None:
    data = json.loads(DATA.read_text(encoding="utf-8"))
    items = sorted((x for x in data["items"] if x["sourceNo"] == 21),
                   key=lambda x: x["variantNo"])
    assert len(items) == 9 and [x["variantNo"] for x in items] == list(range(1, 10))
    for item in items:
        n = item["variantNo"]
        original = ROOT / f"bank/assets/applied4/q21-expanded-v{n}.svg"
        revised = ROOT / f"bank/assets/applied4/q21-expanded-v{n}-r2.svg"
        svg = original.read_text(encoding="utf-8")
        opening_count = svg.count('fill="#fff" stroke="#191511" stroke-width="2.2"')
        assert opening_count == (1 if n <= 3 else 2)
        # Preserve every polygon coordinate and its drawing order. The gray
        # faces match the source's dark block; only the actual openings stay white.
        svg = svg.replace('fill="#f8f8f8"', 'fill="#d4d4d4"')
        svg = svg.replace('fill="#e9e9e9"', 'fill="#bdbdbd"')
        svg = svg.replace('fill="#fff" points=', 'fill="#e6e6e6" points=')
        svg = svg.replace('fill="#fff" stroke="#191511" stroke-width="2.2"',
                          'fill="#fff" stroke="#191511" stroke-width="3"')
        revised.write_text(svg, encoding="utf-8")
        ET.parse(revised)
        item["asset"]["src"] = revised.relative_to(ROOT / "bank").as_posix()
        item["asset"]["description"] = "회색 주사위 직육면체의 흰색 관통 구멍 입구"
    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("PASS: Applied 4 Q21 nine contrasted tunnel drawings")


if __name__ == "__main__":
    main()

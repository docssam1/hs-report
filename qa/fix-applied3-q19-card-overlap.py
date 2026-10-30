#!/usr/bin/env python3
"""Separate the number cards from the triangle in Applied 3 Q19 variants."""
from __future__ import annotations

import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "bank/data/applied3-expanded.json"


def particle(number: int) -> str:
    # Korean reading of the final digit: 일·삼·육·칠·팔·영 have batchim.
    return "이" if number % 10 in (0, 1, 3, 6, 7, 8) else "가"


def main() -> None:
    data = json.loads(DATA.read_text(encoding="utf-8"))
    items = sorted((x for x in data["items"] if x["sourceNo"] == 19),
                   key=lambda x: x["variantNo"])
    assert len(items) == 9 and [x["variantNo"] for x in items] == list(range(1, 10))
    for item in items:
        n = item["variantNo"]
        source = ROOT / f"bank/assets/applied3/q19-v{n}.svg"
        target = ROOT / f"bank/assets/applied3/q19-v{n}-r2.svg"
        svg = source.read_text(encoding="utf-8")
        assert svg.count('<rect width="100%" height="100%" fill="white"/>') == 1
        assert svg.count('<rect x="10" y="8"') == 1
        # The cards end at y=42. The top circle originally starts at y=35;
        # moving only the triangle down 35px gives a 28px clear gap.
        svg = svg.replace('<rect width="100%" height="100%" fill="white"/>',
                          '<rect width="100%" height="100%" fill="white"/><g transform="translate(0 35)">', 1)
        svg = svg.replace('<rect x="10" y="8"', '</g><rect x="10" y="8"', 1)
        target.write_text(svg, encoding="utf-8")
        ET.parse(target)
        item["asset"]["src"] = target.relative_to(ROOT / "bank").as_posix()
        item["asset"]["kind"] = "svg"
        side_sum = item["verification"]["parameters"]["sideSum"]
        item["text"] = re.sub(rf"{side_sum}[가이] 되게",
                              f"{side_sum}{particle(side_sum)} 되게", item["text"])
        item["verification"]["sourceExamPage"] = 4
    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("PASS: Applied 3 Q19 nine figures separated; source page corrected to 4")


if __name__ == "__main__":
    main()

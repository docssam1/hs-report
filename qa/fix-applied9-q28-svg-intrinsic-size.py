#!/usr/bin/env python3
"""Add intrinsic SVG dimensions so the reviewed diagrams survive PDF rasterization."""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "bank/data/applied9-expanded.json"
INDEX_PATH = ROOT / "bank/data/applied9-expanded-index.json"
OLD_VERSION = "20261025-applied9-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q11-q12-q13-q14-q15-q16-q17-q18-q19-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r23"
NEW_VERSION = OLD_VERSION[:-2] + "24"
data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
index = json.loads(INDEX_PATH.read_text(encoding="utf-8"))
assert data["version"] == index["version"] == OLD_VERSION
items = [item for item in data["items"] if item["sourceNo"] == 28]
assert len(items) == 9
for item in items:
    path = ROOT / "bank" / item["asset"]["src"]
    svg = path.read_text(encoding="utf-8")
    match = re.search(r'<svg([^>]*)viewBox="0 0 (\d+) (\d+)"', svg)
    assert match and 'width="' not in match.group(1) and 'height="' not in match.group(1)
    width, height = match.group(2), match.group(3)
    svg = svg[:match.start()] + f'<svg{match.group(1)}width="{width}" height="{height}" viewBox="0 0 {width} {height}"' + svg[match.end():]
    path.write_text(svg, encoding="utf-8")
    item["asset"]["sha256"] = hashlib.sha256(path.read_bytes()).hexdigest()
data["version"] = NEW_VERSION
index["version"] = NEW_VERSION
DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
INDEX_PATH.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"oldVersion": OLD_VERSION, "version": NEW_VERSION,
                  "updatedSvgCount": len(items),
                  "sha256": [item["asset"]["sha256"] for item in items]}, ensure_ascii=False))

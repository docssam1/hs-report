#!/usr/bin/env python3
"""Exhaustively validate all Applied 9 Q12 cube placements and answer alternatives."""
import hashlib
import itertools
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / "bank/data/applied9-expanded.json").read_text())
INDEX = json.loads((ROOT / "bank/data/applied9-expanded-index.json").read_text())
REPORT = json.loads((ROOT / ".private-work/hw-expansion-20261023/hw9/q12-independent-validation-r17.json").read_text())
VERSION = "20261026-applied9-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q11-q12-q13-q14-q15-q16-q17-q18-q19-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-taxonomy-r25"
FACES = [(0, 1, 2, 3), (3, 2, 5, 4), (1, 2, 6, 5), (4, 5, 6, 7), (0, 3, 4, 7), (0, 1, 6, 7)]
SLOTS = [(0, 2), (0, 4), (0, 6), (1, 3), (1, 5), (1, 7), (2, 4), (2, 6), (3, 5)]
ALL = [p for p in itertools.permutations(range(1, 9)) if len({sum(p[i] for i in f) for f in FACES}) == 1]
assert len(ALL) == 144
assert DATA["version"] == INDEX["version"] == VERSION
assert len(DATA["items"]) == INDEX["itemCount"] == 270
assert DATA["availableSourceNos"] == list(range(1, 31))
assert DATA["pendingSourceNos"] == []
assert len(REPORT["variants"]) == 9
items = [x for x in DATA["items"] if x["sourceNo"] == 12]
assert len(items) == 9 and [x["variantNo"] for x in items] == list(range(1, 10))
assert sum(x["sourceNo"] == 12 for x in INDEX["items"]) == 1
assert next(x for x in INDEX["items"] if x["sourceNo"] == 12)["variantCount"] == 9

for k, (item, row, expected_slots) in enumerate(zip(items, REPORT["variants"], SLOTS), 1):
    assert item["id"] == row["id"] == f"applied9-q12-v{k}"
    p = item["verification"]["parameters"]
    slots = tuple(p["clueSlots"])
    assert slots == tuple(row["clueSlots"]) == expected_slots
    assert len(set(slots)) == 2 and len(p["blankSlots"]) == 6
    clue_values = tuple(p["clueValues"])
    valid_completions = [v for v in ALL if (v[slots[0]], v[slots[1]]) == clue_values]
    assert len(valid_completions) == p["completeSolutionCount"] == 2
    assert valid_completions == [tuple(v) for v in p["acceptedFullAssignments"]]
    assert valid_completions == [tuple(v) for v in row["acceptedFullAssignments"]]
    for sol in valid_completions:
        assert sorted(sol) == list(range(1, 9))
        assert [sum(sol[i] for i in face) for face in FACES] == [18] * 6
    blanks = [i for i in range(8) if i not in slots]
    expected_parts = [[sol[i] for i in blanks] for sol in valid_completions]
    assert p["blankSlots"] == blanks
    assert item["answerParts"] == expected_parts[0]
    assert item["acceptedAnswerParts"] == expected_parts
    assert len(item["answerLabels"]) == len(item["answerParts"]) == 6
    assert item["answerContract"] == "ordered-parts"
    assert item["pointBand"] == "2.7" and item["difficultyEvidence"]["label"] == "하"
    assert item["verification"]["sourceDrawingCompared"] is True
    assert item["verification"]["variantUsesSourceDrawing"] is False
    asset = ROOT / "bank" / item["asset"]["src"]
    raw = asset.read_bytes()
    assert hashlib.sha256(raw).hexdigest() == item["asset"]["sha256"] == row["assetSha256"]
    svg = raw.decode()
    assert svg.count("<circle ") == 8
    assert svg.count("<line ") == 13
    nums = [int(n) for n in re.findall(r">([1-8])</text>", svg)]
    assert sorted(nums) == sorted(clue_values)
    assert svg.count("<text ") == 8
    assert item["verification"]["sourceExamPage"] == item["verification"]["sourceAnswerPage"] == 2
    assert "공식성·판본 동일성은 미확인" in item["verification"]["officialAnswerStatus"]
    assert row["faceSums"] == [[18] * 6 for _ in valid_completions]

assert len({tuple(x["verification"]["parameters"]["clueSlots"]) for x in items}) == 9
print(json.dumps({"status": "PASS", "sourceNo": 12, "variants": 9,
    "allCubeAssignments": 40320, "validCompleteArrangements": len(ALL),
    "acceptedSolutionsPerVariant": [x["verification"]["parameters"]["completeSolutionCount"] for x in items],
    "answerLabelChecks": "six blank positions per variant", "pointBand": "2.7", "newSourceTypes": 0}, ensure_ascii=False, indent=2))

#!/usr/bin/env python3
"""Independent digit-geometry and exhaustive-answer audit for Applied 9 Q25."""
import hashlib
import json
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / "bank/data/applied9-expanded.json").read_text())
INDEX = json.loads((ROOT / "bank/data/applied9-expanded-index.json").read_text())
OUT = ROOT / ".private-work/hw-expansion-20261023/hw9/q25-independent-audit-r22.json"
VERSION = "20261026-applied9-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q11-q12-q13-q14-q15-q16-q17-q18-q19-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-taxonomy-r25"
CONSTANTS = [(86, 95, 2, 1), (59, 81, 2, 0), (58, 91, 2, 0),
             (86, 92, 1, 0), (56, 81, 2, 0), (96, 98, 5, 2),
             (58, 61, 2, 0), (96, 98, 2, 1), (86, 96, 1, 2)]

# Seven-segment labels are converted under a geometric half-turn: horizontal
# top/bottom exchange, left/right upper/lower exchange, and the middle stays.
MASKS = {
    # The source artwork uses a single centered stroke for 1; this differs
    # from the paired right-side strokes used by many digital display fonts.
    0: set("abcdef"), 1: set("u"), 2: set("abged"), 3: set("abgcd"),
    4: set("fgbc"), 5: set("afgcd"), 6: set("afgecd"), 7: set("abc"),
    8: set("abcdefg"), 9: set("abfgcd"),
}
SVG_MASKS = {
    0: set("abcdef"), 1: set("u"), 2: set("abged"), 3: set("abgcd"),
    4: set("fgbc"), 5: set("afgcd"), 6: set("afgecd"), 7: set("abc"),
    8: set("abcdefg"), 9: set("abfgcd"),
}
ROTATE_SEGMENT = {"a": "d", "d": "a", "b": "e", "e": "b",
                  "c": "f", "f": "c", "g": "g", "u": "u"}
INVERSE = {frozenset(mask): digit for digit, mask in MASKS.items()}
ROTATION = {}
for digit, mask in MASKS.items():
    turned = frozenset(ROTATE_SEGMENT[segment] for segment in mask)
    if turned in INVERSE:
        ROTATION[digit] = INVERSE[turned]
ALLOWED = sorted(ROTATION)


def turn_number(value):
    tens, ones = divmod(value, 10)
    return 10 * ROTATION[ones] + ROTATION[tens]


assert ROTATION == {0: 0, 1: 1, 2: 2, 5: 5, 6: 9, 8: 8, 9: 6}
assert DATA["version"] == VERSION == INDEX["version"]
assert DATA["sourceSet"] == "applied" and DATA["sourceRound"] == 9
assert len(DATA["items"]) == DATA["itemCount"] == INDEX["itemCount"] == 270
assert DATA["availableSourceNos"] == list(range(1, 31))
assert DATA["pendingSourceNos"] == []
assert DATA["availableSourceNos"] == list(range(1, 31))
assert len(INDEX["items"]) == 30
assert INDEX["items"] == sorted(INDEX["items"], key=lambda row: row["sourceNo"])

items = [item for item in DATA["items"] if item["sourceNo"] == 25]
assert len(items) == 9 and [item["variantNo"] for item in items] == list(range(1, 10))
idx = next(row for row in INDEX["items"] if row["sourceNo"] == 25)
assert idx["variantCount"] == 9 and idx["reviewStatus"] == "verified"

# Reproduce the source independently: the two equal sums are 237, and the
# exhaustive digit-pair search yields only circle=9, square=6.
source_pair = []
for circle in ALLOWED:
    for square in ALLOWED:
        if circle <= square:
            continue
        front = 61 + 18 + 80 + circle + 10 * square + 9
        back = turn_number(61) + turn_number(18) + 10 * ROTATION[circle] + ROTATION[8] + 10 * ROTATION[9] + ROTATION[square]
        if front == back:
            source_pair.append((circle, square, front))
assert source_pair == [(9, 6, 237)]

results = []
for item, (first, second, tens, last) in zip(items, CONSTANTS):
    solutions = []
    for circle in ALLOWED:
        for square in ALLOWED:
            if circle <= square:
                continue
            front_parts = [first, second, 10 * tens + circle, 10 * square + last]
            back_parts = [turn_number(first), turn_number(second),
                          10 * ROTATION[circle] + ROTATION[tens],
                          10 * ROTATION[last] + ROTATION[square]]
            if sum(front_parts) == sum(back_parts):
                solutions.append((circle, square, front_parts, back_parts))
    assert len(solutions) == 1, (item["id"], solutions)
    circle, square, front, back = solutions[0]
    expression = "+".join(map(str, front))
    assert item["id"] == f"applied9-q25-v{item['variantNo']}"
    assert item["genId"] == "applied9-q25" and item["reviewStatus"] == "verified"
    assert item["answer"] == expression
    assert item["answerParts"] == front
    assert item["acceptedAnswers"] == [expression]
    assert item["answerContract"] == "ordered-parts"
    assert item["area"] == "수와 식" and item["subarea"] == "자리와 식"
    assert item["pointBand"] == "4.2" and item["difficultyEvidence"]["label"] == "상"
    assert len(item["solutionSteps"]) >= 3 and item["solution"] == " ".join(item["solutionSteps"])
    assert "가운데 세로획" in item["solutionSteps"][0]
    assert "180° 돌려 읽은 값을 r(n)" in item["solutionSteps"][1]
    assert item["verification"]["sourceExamPage"] == 5
    assert item["verification"]["sourceAnswerPage"] == 5
    assert item["verification"]["sourceDrawingCompared"] is True
    assert item["verification"]["userAuthorizedNewVariantFigures"] is True
    assert "공식성·판본 동일성은 미확인" in item["verification"]["officialAnswerStatus"]
    assert item["verification"]["parameters"]["uniquePair"] == {"circle": circle, "square": square}
    assert item["verification"]["parameters"]["oppositeDirectionParts"] == back
    assert sum(front) == sum(back)

    asset_path = ROOT / "bank" / item["asset"]["src"]
    blob = asset_path.read_bytes()
    digest = hashlib.sha256(blob).hexdigest()
    assert digest == item["asset"]["sha256"]
    svg = ET.fromstring(blob)
    assert svg.tag.endswith("svg")
    svg_text = "".join(svg.itertext())
    assert "ㄱ" in svg_text and "ㄴ" in svg_text and "+" in svg_text
    symbols = [node.attrib.get("data-symbol") for node in svg.iter() if node.attrib.get("data-symbol")]
    assert symbols == ["circle", "square"]
    digits = [int(node.attrib["data-digit"]) for node in svg.iter() if "data-digit" in node.attrib]
    expected_digits = [int(ch) for num in (first, second, tens, last) for ch in str(num)]
    assert sorted(digits) == sorted(expected_digits)
    for group in (node for node in svg.iter() if "data-digit" in node.attrib):
        digit = int(group.attrib["data-digit"])
        drawn = {line.attrib["data-segment"] for line in group if "data-segment" in line.attrib}
        assert drawn == SVG_MASKS[digit], (item["id"], digit, drawn)
    results.append({"id": item["id"], "constantTuple": [first, second, tens, last],
                    "uniquePair": [circle, square], "front": front, "back": back,
                    "sum": sum(front), "assetSha256": digest})

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps({"pass": True, "version": VERSION,
                           "rotationMap": ROTATION, "sourcePair": source_pair,
                           "variants": results}, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({"pass": True, "version": VERSION,
                  "sourcePair": source_pair,
                  "answers": [item["answer"] for item in items],
                  "uniquePairs": [[row["uniquePair"][0], row["uniquePair"][1]] for row in results]}, ensure_ascii=False))

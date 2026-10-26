#!/usr/bin/env python3
"""Independent exhaustive audit of Applied 9 Q24 source and nine variants."""
import hashlib
import json
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / "bank/data/applied9-expanded.json").read_text())
INDEX = json.loads((ROOT / "bank/data/applied9-expanded-index.json").read_text())
OUT = ROOT / ".private-work/hw-expansion-20261023/hw9/q24-independent-audit-r22.json"
VERSION = "20261026-applied9-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q11-q12-q13-q14-q15-q16-q17-q18-q19-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-taxonomy-r25"
CLUES = [(1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (4, 0), (4, 8)]


def exhaustive_pairs(d1, d2):
    valid = []
    for a in range(1, 10):
        for b in range(10):
            if a == b:
                continue
            for x in range(10):
                n = 1000 * a + 100 * x + 10 * b + a
                p1, p2, product = n * b, n * a, n * (10 * a + b)
                if (p2 % 10 == d1 and product % 10 == d2
                        and 10000 <= p1 <= 99999 and 10000 <= p2 <= 99999
                        and 100000 <= product <= 999999):
                    valid.append((a, b, x, p1, p2, product))
    return valid


assert DATA["version"] == VERSION == INDEX["version"]
assert len(DATA["items"]) == DATA["itemCount"] == INDEX["itemCount"] == 270
assert DATA["availableSourceNos"] == list(range(1, 31))
assert DATA["pendingSourceNos"] == []
items = [item for item in DATA["items"] if item["sourceNo"] == 24]
assert len(items) == 9 and [item["variantNo"] for item in items] == list(range(1, 10))
assert INDEX["items"] == sorted(INDEX["items"], key=lambda entry: entry["sourceNo"])
idx = next(entry for entry in INDEX["items"] if entry["sourceNo"] == 24)
assert idx["variantCount"] == 9 and idx["reviewStatus"] == "verified"

# Check the actual source clue pair independently: the answer candidate's
# handwritten pair (8,3) and sum 11 follow from the printed 4/4 units digits.
source_solutions = exhaustive_pairs(4, 4)
source_pairs = sorted({(a, b) for a, b, *_ in source_solutions})
assert source_pairs == [(8, 3)]
assert {sum(pair) for pair in source_pairs} == {11}
assert {x for a, b, x, *_ in source_solutions} == set(range(10))

results = []
for item, clues in zip(items, CLUES):
    d1, d2 = clues
    solutions = exhaustive_pairs(d1, d2)
    pairs = sorted({(a, b) for a, b, *_ in solutions})
    assert len(pairs) == 1, (item["id"], clues, pairs)
    a, b = pairs[0]
    middle_digits = sorted({x for aa, bb, x, *_ in solutions if (aa, bb) == (a, b)})
    expected = a + b
    assert middle_digits == list(range(10))
    assert item["answer"] == str(expected)
    assert item["answerParts"] == [expected] and item["acceptedAnswers"] == [str(expected)]
    assert item["answerContract"] == "single-number"
    assert item["sourceNo"] == 24 and item["variantNo"] in range(1, 10)
    assert item["area"] == "수와 식" and item["pointBand"] == "4.2"
    assert item["difficultyEvidence"]["label"] == "상"
    assert item["verification"]["sourceExamPage"] == 4
    assert item["verification"]["sourceAnswerPage"] == 4
    assert "공식성·판본 동일성은 미확인" in item["verification"]["officialAnswerStatus"]
    assert item["verification"]["sourceDrawingCompared"] is True
    assert item["verification"]["variantUsesSourceDrawing"] is False
    assert item["verification"]["userAuthorizedNewVariantFigures"] is True
    assert item["solutionSteps"][-1].endswith(f"={expected}입니다.")

    asset = ROOT / "bank" / item["asset"]["src"]
    blob = asset.read_bytes()
    digest = hashlib.sha256(blob).hexdigest()
    assert digest == item["asset"]["sha256"]
    root = ET.fromstring(blob)
    assert root.attrib["viewBox"] == "0 0 520 355"
    ns = {"s": "http://www.w3.org/2000/svg"}
    labels = [node.text for node in root.findall(".//s:text", ns)]
    assert labels[:3] == ["ㄱ", "ㄴ", "ㄱ"]
    assert labels[3:6] == ["×", "ㄱ", "ㄴ"]
    visible = [node.text for node in root.findall(".//s:text", ns)]
    assert visible[-2:] == [str(d1), str(d2)]
    # The SVG must show 5 first-partial cells, 5 shifted second-partial cells,
    # and 6 final cells, with exactly the approved clue digits printed.
    rects = root.findall("s:rect", ns)
    assert len(rects) == 17  # background + 5 + 5 + 6 result cells
    cell_rects = root.findall(".//s:rect", ns)
    assert len(cell_rects) == 18  # background + blank digit box + all result cells
    assert all("□" not in (node.text or "") for node in root.findall(".//s:text", ns))
    results.append({"id": item["id"], "clues": [d1, d2], "uniquePair": [a, b],
                    "answer": expected, "validMiddleDigits": middle_digits,
                    "solutionCount": len(solutions), "assetSha256": digest})

OUT.write_text(json.dumps({"version": VERSION, "sourceCandidateAnswer": 11,
                           "sourceExhaustivePair": [8, 3], "sourceValidMiddleDigits": list(range(10)),
                           "variants": results}, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({"pass": True, "version": VERSION, "variantCount": len(items),
                  "answers": [result["answer"] for result in results],
                  "uniquePairs": [result["uniquePair"] for result in results]}, ensure_ascii=False))

"""Check Q13 source and nine variants by enumerating joint coordinates."""

import itertools
import json
from pathlib import Path
from xml.etree import ElementTree

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / "bank/data/applied2-expanded.json").read_text())
items = [x for x in data["items"] if x["sourceNo"] == 13]
assert len(items) == 9 and {x["variantNo"] for x in items} == set(range(1, 10))


def coordinates(weights):
    a, b, c, d = weights
    result = set()
    for signs in itertools.product((-1, 1), repeat=4):
        a_pos = signs[0] * a
        b_pos = a_pos + signs[1] * b
        points = (0, a_pos, b_pos, b_pos + signs[2] * c, b_pos + signs[3] * d)
        for i, j in itertools.combinations(range(5), 2):
            if points[i] != points[j]:
                result.add(abs(points[i] - points[j]))
    return result


assert coordinates((1, 15, 3, 7)) == {
    1, 3, 4, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23
}
assert len({tuple(x["verification"]["parameters"]["edgeLengths"]) for x in items}) == 9
for item in items:
    weights = item["verification"]["parameters"]["edgeLengths"]
    values = coordinates(weights)
    assert sorted(values) == item["verification"]["parameters"]["lengths"]
    assert len(values) == item["answerParts"][0] == item["verification"]["parameters"]["answer"]
    assert item["pointBand"] == "3.4" and item["reviewStatus"] == "verified"
    asset = ROOT / "bank" / item["asset"]["src"]
    xml = ElementTree.parse(asset).getroot()
    labels = [node.text for node in xml.iter() if node.tag.endswith("text")]
    assert labels == [str(n) for n in weights], (item["id"], labels)
    assert sum(1 for node in xml.iter() if node.tag.endswith("circle")) == 5
    assert sum(1 for node in xml.iter() if node.tag.endswith("line")) == 4

assert data["itemCount"] == 261 and data["pendingSourceNos"] == [22]
print("PASS Applied2 Q13: original 19 lengths; nine coordinate enumerations, answers, SVG labels and geometry")

#!/usr/bin/env python3
"""Independent Q23 audit using segment reflection and permutation enumeration."""
import hashlib
import itertools
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / "bank/data/applied9-expanded.json").read_text())
INDEX = json.loads((ROOT / "bank/data/applied9-expanded-index.json").read_text())
OUT = ROOT / ".private-work/hw-expansion-20261023/hw9/q23-independent-audit-r22.json"

# Horizontal reflection is computed from seven-segment coordinates independently
# of the builder's digit-to-reflection lookup.
SEGMENTS = {
    0: frozenset("ab cdef".replace(" ", "")),
    1: frozenset("uv"),
    2: frozenset("abged"),
    3: frozenset("abgcd"),
    4: frozenset("fgbc"),
    5: frozenset("afgcd"),
    6: frozenset("afgecd"),
    7: frozenset("abc"),
    8: frozenset("abcdefg"),
    9: frozenset("abfgcd"),
}
REFLECT = {"a": "a", "d": "d", "g": "g", "b": "f", "f": "b", "c": "e", "e": "c", "u": "u", "v": "v"}
DIGIT_FOR_SEGMENTS = {v: k for k, v in SEGMENTS.items()}
REFLECTED_DIGITS = {
    digit: DIGIT_FOR_SEGMENTS[frozenset(REFLECT[s] for s in segments)]
    for digit, segments in SEGMENTS.items()
    if frozenset(REFLECT[s] for s in segments) in DIGIT_FOR_SEGMENTS
}
COUNTS = {digit: len(segments) for digit, segments in SEGMENTS.items()}
TARGETS = [7, 9, 12, 13, 14, 17, 18, 19, 25]


def enumerate_answers(target):
    accepted = []
    eligible = sorted(REFLECTED_DIGITS)
    for size in range(1, len(eligible) + 1):
        for selected in itertools.combinations(eligible, size):
            if sum(COUNTS[d] for d in selected) != target:
                continue
            for order in itertools.permutations(selected):
                if size > 1 and (order[0] == 0 or order[-1] == 0):
                    continue
                reflected_order = tuple(REFLECTED_DIGITS[d] for d in reversed(order))
                if all(d in SEGMENTS for d in reflected_order):
                    accepted.append(order)
    return accepted


assert DATA["version"].endswith("-taxonomy-r25") and INDEX["version"] == DATA["version"]
assert DATA["availableSourceNos"] == list(range(1, 31))
assert 23 in DATA["availableSourceNos"] and 23 not in DATA["pendingSourceNos"]
items = [x for x in DATA["items"] if x.get("sourceNo") == 23]
assert len(items) == 9 and [x["variantNo"] for x in items] == list(range(1, 10))
assert sorted(REFLECTED_DIGITS.items()) == [(0, 0), (1, 1), (2, 5), (5, 2), (8, 8)]

results = []
for item, target in zip(items, TARGETS):
    params = item["verification"]["parameters"]
    answers = enumerate_answers(target)
    expected = len(answers)
    assert int(item["answer"]) == expected
    assert item["answerParts"] == [expected] and item["acceptedAnswers"] == [str(expected)]
    assert item["pointBand"] == "4.2" and item["difficultyEvidence"]["label"] == "상"
    assert item["area"] == "경우의 수" and item["subarea"] == "숫자 카드와 거울 대칭"
    assert params["targetMatchsticks"] == target
    assert params["validNumberCount"] == expected
    assert params["mirrorValidDigits"] == [0, 1, 2, 5, 8]
    assert item["verification"]["sourceExamPage"] == 4
    assert item["verification"]["sourceAnswerPage"] == 4
    assert "공식성·판본 동일성은 미확인" in item["verification"]["officialAnswerStatus"]
    assert item["verification"]["sourceDrawingCompared"] is True
    assert item["verification"]["variantUsesSourceDrawing"] is False
    asset = ROOT / "bank" / item["asset"]["src"]
    blob = asset.read_bytes()
    digest = hashlib.sha256(blob).hexdigest()
    assert digest == item["asset"]["sha256"]
    svg = blob.decode("utf-8")
    cards = [(int(d), body) for d, body in re.findall(r'<g data-digit="(\d+)">(.*?)</g>', svg)]
    assert [d for d, _ in cards] == params["digitOrder"]
    assert sorted(d for d, _ in cards) == list(range(10))
    for digit, body in cards:
        segment_lines = len(re.findall(r"<line\b", body))
        assert segment_lines == COUNTS[digit], (item["id"], digit, segment_lines, COUNTS[digit])
    results.append({"id": item["id"], "target": target, "answer": expected,
                    "arrangements": [list(a) for a in answers], "assetSha256": digest})

# Source question has 12 sticks. The handwritten candidate answer is 10;
# validate agreement without elevating that candidate to official-answer status.
assert len(enumerate_answers(12)) == 10
OUT.write_text(json.dumps({"version": DATA["version"], "independentMethod": "segment-coordinate reflection + exhaustive subsets/permutations",
                           "reflectionMap": REFLECTED_DIGITS, "sourceCandidateAnswer": 10,
                           "sourceIndependentAnswer": len(enumerate_answers(12)), "variants": results},
                          ensure_ascii=False, indent=2) + "\n")
print(json.dumps({"pass": True, "version": DATA["version"], "items": len(items),
                  "answers": [x["answer"] for x in results], "sourceAnswerCandidateReproduced": 10}, ensure_ascii=False))

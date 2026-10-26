#!/usr/bin/env python3
"""Independent exhaustive validation for Applied 2 Q03 letter addition."""
import hashlib
import itertools
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "bank/data/applied2-expanded.json"
DATA = json.loads(DATA_FILE.read_text())
LETTERS = "ABCDE"
BASELINE = json.loads(__import__("subprocess").check_output(["git", "show", "dcb9bdf:bank/data/applied2-expanded.json"], cwd=ROOT))
BASELINE_BY_ID = {x["id"]: x for x in BASELINE["items"]}
CURRENT_BY_ID = {x["id"]: x for x in DATA["items"]}
assert len(BASELINE_BY_ID) == 126
assert all(CURRENT_BY_ID.get(item_id) == item for item_id, item in BASELINE_BY_ID.items()), "An existing approved item changed"
assert set(CURRENT_BY_ID) - set(BASELINE_BY_ID) == {f"applied2-q03-v{i}" for i in range(1, 10)}


def calculate(pattern, digits):
    return int("".join(str(digits[ch]) for ch in pattern))


def enumerate_solutions(a, b, result):
    found = []
    for mapping in itertools.permutations(range(10), 5):
        d = dict(zip(LETTERS, mapping))
        if any(d[word[0]] == 0 for word in (a, b, result)):
            continue
        if calculate(a, d) + calculate(b, d) == calculate(result, d):
            found.append(d)
    return found


items = [x for x in DATA["items"] if x["sourceNo"] == 3]
assert len(items) == 9
assert [x["variantNo"] for x in items] == list(range(1, 10))
assert len({x["answer"] for x in items}) == 9
for item in items:
    p = item["verification"]["parameters"]
    a, b, result = p["addend1Pattern"], p["addend2Pattern"], p["sumPattern"]
    assert set(a + b + result) == set(LETTERS)
    assert len(a) == 3 and len(b) == 2 and len(result) == 4
    found = enumerate_solutions(a, b, result)
    assert len(found) == 1, (item["id"], len(found))
    d = found[0]
    assert d == p["digitAssignment"]
    assert len(set(d.values())) == 5
    assert [d[ch] for ch in LETTERS] == item["answerParts"]
    assert "".join(str(d[ch]) for ch in LETTERS) == item["answer"]
    x, y, z = calculate(a, d), calculate(b, d), calculate(result, d)
    assert (x, y, z) == tuple(p["numericValues"][k] for k in ("addend1", "addend2", "sum"))
    assert x + y == z
    carry = 0
    facts = []
    for pos in range(1, 4):
        da = d[a[-pos]] if pos <= len(a) else 0
        db = d[b[-pos]] if pos <= len(b) else 0
        dz = d[result[-pos]]
        total = da + db + carry
        assert total % 10 == dz
        facts.append({"fromRight": pos, "first": da, "second": db, "carryIn": carry, "resultDigit": dz, "carryOut": total // 10})
        carry = total // 10
    assert facts == p["columnChecksRightToLeft"]
    assert carry == d[result[0]] == p["thousandsCarry"]
    assert item["pointBand"] == "2.7" and item["difficultyEvidence"]["label"] == "하"
    assert item["area"] == "수와 식" and item["answerLabels"] == list(LETTERS)
    assert len(item["solutionSteps"]) == 5 and all(step.strip() for step in item["solutionSteps"])
    assert len(item["arithmeticRows"]) == 4 and all(len(row) == 7 for row in item["arithmeticRows"])
    assert item["verification"]["sourceAnswerCandidate"] == "95180"
    assert item["verification"]["sourceAnswerOfficiality"] == "unconfirmed"

# Recheck the exact original source constraints: A,C,D are nonzero, while B/E may be zero.
source_solutions = []
for mapping in itertools.permutations(range(10), 5):
    d = dict(zip(LETTERS, mapping))
    if d["A"] == 0 or d["C"] == 0 or d["D"] == 0:
        continue
    if calculate("ABC", d) + calculate("BD", d) == calculate("CEEA", d):
        source_solutions.append(d)
assert len(source_solutions) == 1
assert "".join(str(source_solutions[0][x]) for x in LETTERS) == "95180"
assert calculate("ABC", source_solutions[0]) + calculate("BD", source_solutions[0]) == calculate("CEEA", source_solutions[0])

out = ROOT / ".private-work/hw-expansion-20261023/hw2/q03-independent-validation.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps({"status": "PASS", "dataSha256": hashlib.sha256(DATA_FILE.read_bytes()).hexdigest(), "preservedBaselineItems": len(BASELINE_BY_ID), "variants": [{"id": x["id"], "answer": x["answer"], "sourcePatterns": [x["verification"]["parameters"][k] for k in ("addend1Pattern", "addend2Pattern", "sumPattern")], "solutionCount": 1, "carryColumns": x["verification"]["parameters"]["columnChecksRightToLeft"]} for x in items], "originalSource": {"equation": "ABC + BD = CEEA", "exactPrintedConstraintUniqueAnswer": "95180", "answerCandidateOfficiality": "unconfirmed"}}, ensure_ascii=False, indent=2) + "\n")
print("PASS: preserved all 126 baseline items; 9 Q03 variants each have exactly one solution among all 10P5 mappings and valid carry columns. Original printed constraints independently yield 95180.")

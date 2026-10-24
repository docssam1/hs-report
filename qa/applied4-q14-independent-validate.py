"""Independent math, source, and figure validation for Applied4 question 14."""
from pathlib import Path
from itertools import combinations
import hashlib
import json
import math
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/nine-expansion-20261024/round5-q14-source"
DATA = ROOT / "bank/data/applied4-expanded.json"
SOURCE = ROOT / "materials/초등과정 대비 실전 모의고사 활용 4회.pdf"
ANSWER = ROOT / ".private-work/balanced15-20261024/source/applied4-answer.pdf"


def pair_products(cards):
    # Deliberately use positional nested loops rather than the generator's
    # combinations_with_replacement helper.
    return {cards[i] * cards[j] for i in range(4) for j in range(i, 4)}


def factor_pool(values):
    result = set()
    for value in values:
        for divisor in range(1, math.isqrt(value) + 1):
            if value % divisor == 0:
                result.add(divisor)
                result.add(value // divisor)
    return result


def find_solutions(visible):
    pool = factor_pool(visible)
    found = []
    for cards in combinations(sorted(pool), 4):
        values = pair_products(cards)
        missing = values - visible
        if len(values) == 9 and visible <= values and len(missing) == 1:
            found.append((cards, next(iter(missing))))
    return pool, found


def main():
    data = json.loads(DATA.read_text())
    old = json.loads((WORK / "prior-expanded.json").read_text())
    assert data["items"][:162] == old["items"]
    assert len(data["items"]) == 171
    assert data["availableSourceNos"] == sorted(old["availableSourceNos"] + [14])
    assert 14 not in data["pendingSourceNos"]
    assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == "f7bbaf0a1f5de40434882b8c0da70cc5b8fb20188f03c5c77458b6a5cac05c59"
    assert hashlib.sha256(ANSWER.read_bytes()).hexdigest() == "67f66e5fa57df1d463261e184f1dced30e3ffbcf0a802a1ec2d9b8066d122fe8"

    items = [x for x in data["items"] if x["sourceNo"] == 14]
    assert len(items) == 9 and [x["variantNo"] for x in items] == list(range(1, 10))
    assert len({tuple(x["verification"]["parameters"]["cards"]) for x in items}) == 9
    proof = []
    for x in items:
        p = x["verification"]["parameters"]
        cards = tuple(x["answerParts"][:4])
        missing = x["answerParts"][4]
        assert cards == tuple(p["cards"]) and len(set(cards)) == 4 and all(n > 0 for n in cards)
        asset = ROOT / "bank" / x["asset"]["src"]
        raw = asset.read_bytes()
        assert hashlib.sha256(raw).hexdigest() == x["verification"]["assetSha256"]
        root = ET.fromstring(raw)
        texts = [n.text.strip() for n in root.iter() if n.tag.endswith("text") and n.text]
        numeric = [int(t) for t in texts if t.isdecimal()]
        flower = [t for t in texts if t == "꽃"]
        assert len(numeric) == 8 and len(set(numeric)) == 8 and len(flower) == 1
        visible = set(numeric)
        values = pair_products(cards)
        assert len(values) == 9 and values - visible == {missing} and visible <= values
        pool, solutions = find_solutions(visible)
        assert solutions == [(cards, missing)], (x["id"], solutions, (cards, missing))
        assert len(solutions) == p["candidateCount"] == 1
        assert sorted(pool) == p["factorCandidatePool"]
        assert p["candidateCards"] == [list(cards)]
        assert x["answerParts"] == [*cards, missing]
        assert x["pointBand"] == x["sourcePointBand"] == "3.4"
        assert x["difficultyEvidence"]["basis"] == "source-point-band"
        assert x["difficultyEvidence"]["label"] == "중"
        assert x["reviewStatus"] in {"pending-output-review", "verified"}
        assert all(key in x["text"] for key in ["9가지", "꽃", "같은 카드를 두 번", "작은 수부터"])
        assert len(x["solutionSteps"]) >= 3
        proof.append({"id": x["id"], "passed": True, "cards": list(cards), "visibleProducts": sorted(visible),
                      "blank": missing, "candidateCardSetCount": len(solutions),
                      "factorPoolSize": len(pool), "assetSha256": x["verification"]["assetSha256"]})

    report = {"dataSha256": hashlib.sha256(DATA.read_bytes()).hexdigest(),
              "sourceExamPdfSha256": hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
              "sourceAnswerPdfSha256": hashlib.sha256(ANSWER.read_bytes()).hexdigest(),
              "sourceExamPage": 3, "sourceAnswerPage": 14,
              "answerReadAs": "teacher's handwritten 3,4,6,9 and flower=9, directly inspected",
              "sourcePointBand": "3.4", "variantCount": 9, "old162Exact": True,
              "allPassed": True, "items": proof}
    (WORK / "q14-independent-math.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print("PASS Q14: 9 variants, point 3.4, every visible board uniquely determines four cards and flower value, prior 162 unchanged")


if __name__ == "__main__":
    main()

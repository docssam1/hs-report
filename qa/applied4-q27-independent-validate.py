#!/usr/bin/env python3
"""Independent exhaustive and source-evidence checks for Applied 4 Q27."""
from collections import Counter
from pathlib import Path
import hashlib
import json
import subprocess

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "bank/data/applied4-expanded.json"
INDEX = ROOT / "bank/data/applied4-expanded-index.json"
WORK = ROOT / ".private-work/nine-expansion-20261024/round6-q27-source"
SOURCE = ROOT / "materials/초등과정 대비 실전 모의고사 활용 4회.pdf"
ANSWER = ROOT / ".private-work/balanced15-20261024/source/applied4-answer.pdf"


def brute(s):
    return sum(1 for n in range(10000, 100000)
               if n % 4 == 0 and sum(map(int, str(n))) == s)


def suffix_method(s):
    suffixes = range(0, 100, 4)
    total = 0
    for suffix in suffixes:
        rem = s - suffix // 10 - suffix % 10
        total += sum(1 for a in range(1, 10) for b in range(10)
                     for c in range(10) if a + b + c == rem)
    return total


def main():
    data = json.loads(DATA.read_text(encoding="utf-8"))
    prior = json.loads((WORK / "prior-expanded.json").read_text(encoding="utf-8"))
    index = json.loads(INDEX.read_text(encoding="utf-8"))
    rows = [x for x in data["items"] if x["sourceNo"] == 27]
    assert len(rows) == 9
    old = [x for x in data["items"] if x["sourceNo"] != 27]
    q22 = [x for x in old if x["sourceNo"] == 22]
    q25 = [x for x in old if x["sourceNo"] == 25]
    q26 = [x for x in old if x["sourceNo"] == 26]
    assert old[:len(prior["items"])] == prior["items"] and len(q22) == len(q25) == len(q26) == 9
    assert old[len(prior["items"]):] == q22 + q25 + q26 and len(old) == 198
    sums = list(range(33, 42))
    assert [x["verification"]["parameters"]["digitSum"] for x in rows] == sums
    assert [x["answer"] for x in rows] == [str(brute(s)) for s in sums]
    assert [x["answer"] for x in rows] == [str(suffix_method(s)) for s in sums]
    assert all(x["pointBand"] == "4.2" and x["sourcePointBand"] == "4.2" for x in rows)
    assert all(x["difficultyEvidence"]["label"] == "상" for x in rows)
    assert rows[-1]["answer"] == "10" and rows[-1]["verification"]["sourceAnswerMatch"] is True
    assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == rows[0]["verification"]["parameters"]["sourceExamPdfSha256"]
    assert hashlib.sha256(ANSWER.read_bytes()).hexdigest() == rows[0]["verification"]["parameters"]["sourceAnswerPdfSha256"]
    released = all(x["reviewStatus"] == "verified" for x in rows)
    if released:
        assert any(x["sourceNo"] == 27 and x["variantCount"] == 9 for x in index["items"])
        assert 27 not in index["pendingSourceNos"] and index["itemCount"] == 207
    else:
        assert not any(x["sourceNo"] == 27 for x in index["items"])
        assert 27 in index["pendingSourceNos"] and index["itemCount"] == 171
    proof = {"result": "pass", "dataSha256": hashlib.sha256(DATA.read_bytes()).hexdigest(),
             "questionCount": 9, "digitSums": sums,
             "answers": [int(x["answer"]) for x in rows],
             "methods": ["brute force over every five-digit natural number",
                         "suffix multiples of four × leading three-digit digit-sum count"],
             "sourceAnswerQ27": 10, "prior171RecordsExact": True,
             "sourcePdfSha256": hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
             "answerPdfSha256": hashlib.sha256(ANSWER.read_bytes()).hexdigest()}
    (WORK / "q27-independent-math.json").write_text(json.dumps(proof, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("PASS Q27: 9 unique digit sums, 2 independent exact counts, source answer 10, prior records unchanged; Q22/Q25/Q26 appended")


if __name__ == "__main__":
    main()

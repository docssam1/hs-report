#!/usr/bin/env python3
"""Independent path enumeration and answer verification for Applied 9 Q20."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / "bank/data/applied9-expanded.json").read_text())
INDEX = json.loads((ROOT / "bank/data/applied9-expanded-index.json").read_text())
REPORT = json.loads((ROOT / ".private-work/hw-expansion-20261023/hw9/q20-independent-validation-r18.json").read_text())
VERSION = "20261026-applied9-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q11-q12-q13-q14-q15-q16-q17-q18-q19-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-taxonomy-r25"
assert DATA["version"] == INDEX["version"] == VERSION
assert len(DATA["items"]) == INDEX["itemCount"] == 270
assert DATA["availableSourceNos"] == list(range(1, 31))
assert DATA["pendingSourceNos"] == []
items = [x for x in DATA["items"] if x["sourceNo"] == 20]
assert len(items) == len(REPORT["variants"]) == 9
assert [x["variantNo"] for x in items] == list(range(1, 10))

# Source figure path, read directly from original Q20 p.4:
# (가,1),(가,2),(나,2),(나,3),(다,3),(다,4),(라,4),(라,5),(라,6),
# (다,6),(다,7),(나,7),(나,8),(가,8); the motif restarts at column 9.
source_path = [(0,1),(0,2),(1,2),(1,3),(2,3),(2,4),(3,4),(3,5),(3,6),(2,6),(2,7),(1,7),(1,8),(0,8)]
assert len(source_path) == 14 and len(set(source_path)) == 14
source_n = 130
source_q, source_r0 = divmod(source_n - 1, 14)
source_row, source_col = source_path[source_r0]
assert source_q == 9 and source_path[source_r0] == (1,3)
assert (source_row, source_col + source_q * 8) == (1,75)

all_answers = set()
for k, (item, row) in enumerate(zip(items, REPORT["variants"]), 1):
    assert item["id"] == row["id"] == f"applied9-q20-v{k}"
    p = item["verification"]["parameters"]
    path = [tuple(x) for x in p["motifCoordinates"]]
    assert len(path) == p["motifCellCount"] == 14 and len(set(path)) == 14
    assert path[0] == (0,1) and path[1] == (0,2) and path[-1] == (0,8)
    assert set(r for r,c in path) == set(range(4)) and min(c for r,c in path) == 1 and max(c for r,c in path) == 8
    assert p["runsByRowSegment"] == row["runsByRowSegment"] and sum(p["runsByRowSegment"]) == 14
    target = p["target"]
    q, rem0 = divmod(target - 1, 14)
    rem = rem0 + 1
    direct = path[rem0]
    answer = (direct[0], direct[1] + q * 8)
    expanded = [(r, c + cycle * 8) for cycle in range(q + 2) for r,c in path]
    assert expanded[target - 1] == answer
    names = ["가", "나", "다", "라"]
    expect_parts = [names[answer[0]], answer[1]]
    assert (q, rem) == (p["quotient"], p["remainder"])
    assert p["localAnswer"] == [names[direct[0]], direct[1]]
    assert p["answer"] == list(expect_parts) == row["answer"]
    assert item["answerParts"] == expect_parts and item["answerContract"] == "ordered-parts"
    assert item["pointBand"] == "3.4" and item["difficultyEvidence"]["label"] == "중"
    assert item["verification"]["sourceDrawingCompared"] is True and item["verification"]["variantUsesSourceDrawing"] is False
    asset = ROOT / "bank" / item["asset"]["src"]
    raw = asset.read_bytes()
    assert hashlib.sha256(raw).hexdigest() == item["asset"]["sha256"] == row["assetSha256"]
    svg = raw.decode()
    assert svg.count("<rect ") == 68 and svg.count("<circle ") == 14 and svg.count("<polyline ") == 1
    assert item["verification"]["sourceExamPage"] == item["verification"]["sourceAnswerPage"] == 4
    all_answers.add(tuple(expect_parts))
assert len(all_answers) == 9
assert len({tuple(x["verification"]["parameters"]["runsByRowSegment"]) for x in items}) == 9
print(json.dumps({"status":"PASS","sourceNo":20,"variants":9,"motifCells":14,"repeatColumnWidth":8,
    "variantAnswers":[[x["answerParts"][0],x["answerParts"][1]] for x in items],"sourceCandidateAnswer":["나",75],
    "answerContracts":"ordered row and column; 9 distinct valid answers","pointBand":"3.4 / 중","newSourceTypes":0},ensure_ascii=False,indent=2))

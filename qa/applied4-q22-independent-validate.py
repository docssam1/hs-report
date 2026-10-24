"""Independent geometry and source checks for the nine Applied4 Q22 variants."""
from pathlib import Path
from collections import deque
import hashlib
import json
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "bank/data/applied4-expanded.json"
SOURCE = ROOT / "materials/초등과정 대비 실전 모의고사 활용 4회.pdf"
ANSWER = ROOT / ".private-work/balanced15-20261024/source/applied4-answer.pdf"
WORK = ROOT / ".private-work/nine-expansion-20261024/round7-q22"


def edge_set(cubes):
    edges = set()
    for x, y, z in cubes:
        for yy in (y, y + 1):
            for zz in (z, z + 1):
                edges.add(tuple(sorted(((x, yy, zz), (x + 1, yy, zz)))))
        for xx in (x, x + 1):
            for zz in (z, z + 1):
                edges.add(tuple(sorted(((xx, y, zz), (xx, y + 1, zz)))))
        for xx in (x, x + 1):
            for yy in (y, y + 1):
                edges.add(tuple(sorted(((xx, yy, z), (xx, yy, z + 1)))))
    return edges


def axis_segments(cubes):
    result = [set(), set(), set()]
    for x, y, z in cubes:
        for yy in (y, y + 1):
            for zz in (z, z + 1):
                result[0].add(((x, yy, zz), (x + 1, yy, zz)))
        for xx in (x, x + 1):
            for zz in (z, z + 1):
                result[1].add(((xx, y, zz), (xx, y + 1, zz)))
        for xx in (x, x + 1):
            for yy in (y, y + 1):
                result[2].add(((xx, yy, z), (xx, yy, z + 1)))
    return result


def connected(cubes):
    cubes = set(map(tuple, cubes))
    seen = {next(iter(cubes))}
    todo = deque(seen)
    while todo:
        x, y, z = todo.popleft()
        for p in ((x+1,y,z),(x-1,y,z),(x,y+1,z),(x,y-1,z),(x,y,z+1),(x,y,z-1)):
            if p in cubes and p not in seen:
                seen.add(p); todo.append(p)
    return seen == cubes


def main():
    data = json.loads(DATA.read_text())
    prior = json.loads((WORK / "prior-expanded.json").read_text())
    items = [x for x in data["items"] if x["sourceNo"] == 22]
    assert data["items"][:len(prior["items"])] == prior["items"]
    assert len(items) == 9 and [x["variantNo"] for x in items] == list(range(1, 10))
    assert data["availableSourceNos"] == sorted(prior["availableSourceNos"] + [22, 25])
    assert len([x for x in data["items"] if x["sourceNo"] == 25]) == 9
    assert 22 not in data["pendingSourceNos"]
    source_sha = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
    answer_sha = hashlib.sha256(ANSWER.read_bytes()).hexdigest()
    assert source_sha == "f7bbaf0a1f5de40434882b8c0da70cc5b8fb20188f03c5c77458b6a5cac05c59"
    assert answer_sha == "67f66e5fa57df1d463261e184f1dced30e3ffbcf0a802a1ec2d9b8066d122fe8"
    reports = []
    for x in items:
        p = x["verification"]["parameters"]
        cubes = [tuple(c) for c in p["cubeCoordinates"]]
        assert len(cubes) == len(set(cubes)) == p["cubeCount"] == 13
        assert connected(cubes)
        first = edge_set(cubes)
        second_axes = axis_segments(cubes)
        axes = list(map(len, second_axes))
        total = sum(axes)
        assert len(first) == total == p["uniqueEdgeTotal"] == int(x["answer"])
        assert axes == p["uniqueEdgesByDirection"]
        asset = ROOT / "bank" / x["asset"]["src"]
        raw = asset.read_bytes()
        assert hashlib.sha256(raw).hexdigest() == x["verification"]["assetSha256"]
        svg = ET.fromstring(raw)
        assert svg.tag.endswith("svg") and float(svg.attrib["width"]) > 0 and float(svg.attrib["height"]) > 0
        assert not any(k.endswith("href") for e in svg.iter() for k in e.attrib)
        assert x["pointBand"] == "3.4" and x["difficultyEvidence"]["label"] == "중"
        assert x["practiceStage"] in ("low", "middle", "high")
        assert x["answerParts"] == [total] and x["acceptedAnswers"] == [str(total)]
        assert len(x["solutionSteps"]) >= 3
        assert x["verification"]["sourceAnswer"] == 102 and not x["verification"]["sourceAnswerMatch"]
        assert x["verification"]["sourceExamPdfSha256"] == source_sha
        assert x["verification"]["sourceAnswerPdfSha256"] == answer_sha
        reports.append({"id": x["id"], "cubeCount": len(cubes), "connected": True,
                        "edgeCountsByDirection": axes, "answer": total,
                        "assetSha256": x["verification"]["assetSha256"], "passed": True})
    output = {"dataSha256": hashlib.sha256(DATA.read_bytes()).hexdigest(),
              "sourceExamPdfSha256": source_sha, "sourceAnswerPdfSha256": answer_sha,
              "sourceExamPage": 4, "sourceAnswerPage": 22,
              "sourceAnswer": 102, "sourceAnswerDirectlyInspected": True,
              "sourceFigureDirectlyInspected": True, "variantCount": 9,
              "old180Exact": True, "independentMethods": ["endpoint-pair union", "axis-separated unit segment sets"],
              "allPassed": True, "items": reports}
    (WORK / "q22-independent-math.json").write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n")
    print("PASS Q22: 9 connected 13-cube shapes; endpoint and axis-segment counts agree; source pages and previous 180 items match")


if __name__ == "__main__":
    main()

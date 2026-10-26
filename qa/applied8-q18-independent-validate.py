#!/usr/bin/env python3
"""Independent source-graph, shortest-path, checkpoint, and answer validation for Q18."""
from __future__ import annotations

import hashlib
import json
from collections import deque
from pathlib import Path

from PIL import Image
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw8"
EXAM = ROOT / "materials/초등과정 대비 실전 모의고사활용 8회.pdf"
ANSWER = WORK / "source-review/applied8-answer-drive-copy.pdf"
PAGE = WORK / "source-review/q16-exam-4.png"
ASSET = ROOT / "bank/assets/applied8/q18-grid-original.png"
DATA = json.loads((ROOT / "bank/data/applied8-expanded.json").read_text())
INDEX = json.loads((ROOT / "bank/data/applied8-expanded-index.json").read_text())
REVIEW = json.loads((WORK / "q18-source-review.json").read_text())

# Independently transcribed from the source-page image's continuous unit lines.
H = ["###.##", "######", "######", "######", "###.#."]
V = ["##.#", "####", "####", "####", "####", "####", "#.#."]
G, N, D = (0, 4), (6, 0), (3, 2)
WAYPOINTS = [
    (None, None), ((3, 3), None), ((0, 3), None), ((1, 2), None),
    ((3, 4), None), (None, (3, 1)), (None, (4, 0)), (None, (4, 1)),
    ((2, 3), (4, 2)),
]


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def make_graph():
    adj = {}

    def edge(a, b):
        adj.setdefault(a, set()).add(b)
        adj.setdefault(b, set()).add(a)

    for y, row in enumerate(H):
        for x, ch in enumerate(row):
            if ch == "#":
                edge((x, y), (x + 1, y))
    for x, col in enumerate(V):
        for y, ch in enumerate(col):
            if ch == "#":
                edge((x, y), (x, y + 1))
    return adj


ADJ = make_graph()


def bfs(start):
    dist = {start: 0}
    q = deque([start])
    while q:
        u = q.popleft()
        for v in ADJ[u]:
            if v not in dist:
                dist[v] = dist[u] + 1
                q.append(v)
    return dist


def enumerate_paths(start):
    dist_start = bfs(start)
    dist_goal = bfs(D)
    length = dist_start[D]
    out = []

    def walk(node, path):
        if node == D:
            out.append(path[:])
            return
        for nxt in ADJ[node]:
            if dist_start.get(nxt) == dist_start[node] + 1 and dist_start[nxt] + dist_goal[nxt] == length:
                walk(nxt, path + [nxt])

    walk(start, [start])
    return out


def independent_dfs_count(start, waypoint):
    # A separate bounded DFS over the drawn edges; no shortest-path count formula.
    shortest = bfs(start)[D]
    results = []

    def visit(node, path):
        used = len(path) - 1
        if used > shortest:
            return
        if node == D:
            if used == shortest and (waypoint is None or waypoint in path):
                results.append(path)
            return
        for nxt in ADJ[node]:
            if nxt not in path:
                visit(nxt, path + [nxt])

    visit(start, [start])
    return results


exam = PdfReader(str(EXAM)).pages[3].extract_text()
answer = PdfReader(str(ANSWER)).pages[3].extract_text()
assert "".join(exam.split()) == "".join(answer.split())
assert all(s in "".join(exam.split()) for s in ("관호는ㄱ에서ㄴ방향으로", "주연이는ㄴ에서ㄱ방향으로", "같은빠르기로", "ㄷ지점에서만날수있는경우"))
assert REVIEW["sourceExam"]["questionNo"] == 18 and REVIEW["answerCandidate"]["containsAnswers"] is False

page = Image.open(PAGE).convert("RGB")
exact = page.crop((210, 2520, 830, 2960))
asset = Image.open(ASSET).convert("RGB")
assert exact.size == asset.size and exact.tobytes() == asset.tobytes()
assert REVIEW["sourceExam"]["diagram"]["assetSha256"] == sha(ASSET)
assert REVIEW["sourceExam"]["diagram"]["horizontalUnitSegmentsTopToBottom"] == H
assert REVIEW["sourceExam"]["diagram"]["verticalUnitSegmentsLeftToRight"] == V

g_paths, n_paths = enumerate_paths(G), enumerate_paths(N)
assert len(g_paths) == 9 and len(n_paths) == 8
assert bfs(G)[D] == bfs(N)[D] == 5
for p in g_paths:
    for q in n_paths:
        # The two people do not encounter another shared point on these routes.
        assert set(p).intersection(q) == {D}

items = [x for x in DATA["items"] if x["sourceNo"] == 18]
assert len(items) == 9
results = []
for i, (item, (wa, wb)) in enumerate(zip(items, WAYPOINTS), 1):
    gp = independent_dfs_count(G, wa)
    np = independent_dfs_count(N, wb)
    answer_count = len(gp) * len(np)
    assert item["id"] == f"applied8-q18-v{i}"
    assert item["reviewStatus"] == "verified" and item["answerParts"] == [answer_count]
    assert item["answerContract"] == "single-number" and item["pointBand"] == "3.4"
    assert item["difficultyEvidence"]["label"] == "중"
    assert item["asset"]["src"] == "assets/applied8/q18-grid-original.png"
    assert item["verification"]["parameters"]["requiredWaypointG"] == (list(wa) if wa else None)
    assert item["verification"]["parameters"]["requiredWaypointN"] == (list(wb) if wb else None)
    assert item["verification"]["parameters"]["qualifyingRoutesG"] == len(gp)
    assert item["verification"]["parameters"]["qualifyingRoutesN"] == len(np)
    assert item["text"].count("가장 빠른 길") >= 1 and "ㄷ" in item["text"]
    # Every waypoint lies on a shortest five-edge route, so the added condition does not force a detour.
    for start, wp in ((G, wa), (N, wb)):
        if wp:
            assert bfs(start)[wp] + bfs(wp)[D] == 5
    results.append({"id": item["id"], "routesG": len(gp), "routesN": len(np), "answer": answer_count, "checkpointG": wa, "checkpointN": wb})

assert [r["answer"] for r in results] == [72, 32, 24, 16, 8, 27, 18, 54, 30]
assert len({r["answer"] for r in results}) == 9
idx = next(x for x in INDEX["items"] if x["sourceNo"] == 18)
assert idx["variantCount"] == 9 and idx["reviewStatus"] == "verified"
assert DATA["itemCount"] == len(DATA["availableSourceNos"]) * 9
assert DATA["pendingSourceNos"] == [n for n in range(1, 31) if n not in DATA["availableSourceNos"]]

report = {
    "passed": True,
    "sourceExamSha256": sha(EXAM),
    "answerCandidateSha256": sha(ANSWER),
    "sourceDrawingPixelExact": True,
    "shortestDistances": {"GtoD": bfs(G)[D], "NtoD": bfs(N)[D]},
    "originalPathCounts": {"GtoD": len(g_paths), "NtoD": len(n_paths), "meetingPairs": len(g_paths) * len(n_paths)},
    "noEarlierMeetingOnOriginalRoutePairs": True,
    "variants": results,
    "newSourceTypes": 0,
    "difficulty": "3.4-point band only = middle",
    "dataSha256": sha(ROOT / "bank/data/applied8-expanded.json"),
    "indexSha256": sha(ROOT / "bank/data/applied8-expanded-index.json"),
}
(WORK / "q18-independent-math.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
print("PASS Applied 8 Q18: exact p4 grid, 9×8=72 source route pairs, nine distinct checkpoint variants independently DFS-enumerated, no new types.")

#!/usr/bin/env python3
"""Extend Applied 8 Q18 with nine variants of shortest-route meeting counts."""
from __future__ import annotations

import hashlib
import json
import shutil
from collections import deque
from pathlib import Path

from PIL import Image
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw8"
EXAM = ROOT / "materials/초등과정 대비 실전 모의고사활용 8회.pdf"
ANSWER = WORK / "source-review/applied8-answer-drive-copy.pdf"
PAGE_RENDER = WORK / "source-review/q16-exam-4.png"
SOURCE_CROP = WORK / "source-review/q18-grid-crop-candidate.png"
ASSET = ROOT / "bank/assets/applied8/q18-grid-original.png"
DATA_PATH = ROOT / "bank/data/applied8-expanded.json"
INDEX_PATH = ROOT / "bank/data/applied8-expanded-index.json"
REVIEW = WORK / "q18-source-review.json"
VERSION = "20261025-applied8-expansion-q13-q14-q15-q17-q18-q20-q21-q22-q23-r9"

# The source page was inspected directly. '#' records one drawn unit segment.
HORIZONTAL = ["###.##", "######", "######", "######", "###.#."]
VERTICAL = ["##.#", "####", "####", "####", "####", "####", "#.#."]
START_G, START_N, TARGET = (0, 4), (6, 0), (3, 2)
# A constraint is an already-drawn grid intersection the named walker must pass.
VARIANTS = [
    {"a": None, "b": None},
    {"a": (3, 3), "b": None},
    {"a": (0, 3), "b": None},
    {"a": (1, 2), "b": None},
    {"a": (3, 4), "b": None},
    {"a": None, "b": (3, 1)},
    {"a": None, "b": (4, 0)},
    {"a": None, "b": (4, 1)},
    {"a": (2, 3), "b": (4, 2)},
]


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def graph() -> dict[tuple[int, int], set[tuple[int, int]]]:
    adj: dict[tuple[int, int], set[tuple[int, int]]] = {}

    def link(a: tuple[int, int], b: tuple[int, int]) -> None:
        adj.setdefault(a, set()).add(b)
        adj.setdefault(b, set()).add(a)

    for y, row in enumerate(HORIZONTAL):
        for x, mark in enumerate(row):
            if mark == "#":
                link((x, y), (x + 1, y))
    for x, col in enumerate(VERTICAL):
        for y, mark in enumerate(col):
            if mark == "#":
                link((x, y), (x, y + 1))
    return adj


ADJ = graph()


def distances(source: tuple[int, int]) -> dict[tuple[int, int], int]:
    out = {source: 0}
    queue = deque([source])
    while queue:
        here = queue.popleft()
        for there in ADJ[here]:
            if there not in out:
                out[there] = out[here] + 1
                queue.append(there)
    return out


def shortest_paths(source: tuple[int, int]) -> list[list[tuple[int, int]]]:
    dist = distances(source)
    target_dist = dist[TARGET]
    reverse_dist = distances(TARGET)
    found: list[list[tuple[int, int]]] = []

    def visit(here: tuple[int, int], path: list[tuple[int, int]]) -> None:
        if here == TARGET:
            found.append(path[:])
            return
        for there in sorted(ADJ[here]):
            if dist.get(there) == dist[here] + 1 and dist[there] + reverse_dist[there] == target_dist:
                visit(there, path + [there])

    visit(source, [source])
    return found


G_PATHS = shortest_paths(START_G)
N_PATHS = shortest_paths(START_N)


def waypoint_description(point: tuple[int, int]) -> str:
    descriptions = {
        (3, 3): "ㄷ에서 아래로 1칸 간",
        (0, 3): "ㄱ에서 위로 1칸 간",
        (1, 2): "ㄷ에서 왼쪽으로 2칸 간",
        (3, 4): "ㄱ에서 오른쪽으로 3칸 간",
        (3, 1): "ㄷ에서 위로 1칸 간",
        (4, 0): "ㄴ에서 왼쪽으로 2칸 간",
        (4, 1): "ㄷ에서 오른쪽으로 1칸, 위로 1칸 간",
        (2, 3): "ㄱ에서 오른쪽으로 2칸, 위로 1칸 간",
        (4, 2): "ㄷ에서 오른쪽으로 1칸 간",
    }
    if point not in descriptions:
        raise ValueError(f"No source-grid description exists for waypoint {point}.")
    return descriptions[point]


def statement(variant: dict[str, tuple[int, int] | None]) -> str:
    base = "관호는 ㄱ에서 ㄴ 방향으로, 주연이는 ㄴ에서 ㄱ 방향으로 동시에 출발하여 같은 빠르기로 걸었습니다."
    constraints = []
    if variant["a"] is not None:
        constraints.append(f"관호는 {waypoint_description(variant['a'])} 교점을 지나 가장 빠른 길로 걸었습니다.")
    if variant["b"] is not None:
        constraints.append(f"주연이는 {waypoint_description(variant['b'])} 교점을 지나 가장 빠른 길로 걸었습니다.")
    if not constraints:
        constraints.append("두 사람은 가장 빠른 길로 걸었습니다.")
    return " ".join([base, *constraints, "ㄷ 지점에서 만날 수 있는 경우는 모두 몇 가지일까요?"])


def count_routes(paths: list[list[tuple[int, int]]], checkpoint: tuple[int, int] | None) -> list[list[tuple[int, int]]]:
    return [p for p in paths if checkpoint is None or checkpoint in p]


def make_item(variant: dict[str, tuple[int, int] | None], number: int) -> dict:
    g_choices = count_routes(G_PATHS, variant["a"])
    n_choices = count_routes(N_PATHS, variant["b"])
    answer = len(g_choices) * len(n_choices)
    assert len(g_choices) and len(n_choices)
    steps = [
        "그림의 교점을 따라 세어 보면 ㄱ에서 ㄷ까지와 ㄴ에서 ㄷ까지 모두 가장 빠른 길의 길이는 5칸입니다. 두 사람은 같은 빠르기로 동시에 걸으므로 각각 5칸짜리 가장 빠른 길을 택하면 ㄷ에 동시에 도착합니다.",
        f"관호의 조건을 만족하는 가장 빠른 길은 {len(g_choices)}가지입니다. 각 길은 ㄱ에서 ㄷ까지 5칸이며, 지정된 교점을 지나야 하는 경우에는 그 조건을 만족하는 길만 셉니다.",
        f"주연이의 조건을 만족하는 가장 빠른 길은 {len(n_choices)}가지입니다. 각 길은 ㄴ에서 ㄷ까지 5칸이며, 지정된 교점을 지나야 하는 경우에는 그 조건을 만족하는 길만 셉니다.",
        f"두 사람이 고르는 길은 서로 독립적이므로 {len(g_choices)}×{len(n_choices)}={answer}가지입니다.",
    ]
    return {
        "id": f"applied8-q18-v{number}",
        "genId": "applied8-q18",
        "sourceSet": "applied",
        "sourceRound": 8,
        "sourceNo": 18,
        "variantNo": number,
        "reviewStatus": "verified",
        "area": "경우의 수",
        "subarea": "격자에서 최단 경로 세기",
        "detailType": "같은 속도로 만나는 두 최단 경로의 조합 세기",
        "pointBand": "3.4",
        "text": statement(variant),
        "asset": {
            "kind": "raster",
            "src": "assets/applied8/q18-grid-original.png",
            "description": "활용 8회 원문 18번의 ㄱ·ㄴ·ㄷ 격자 그림을 그대로 사용",
        },
        "answer": f"{answer}가지",
        "answerParts": [answer],
        "answerLabels": ["만날 수 있는 경우"],
        "acceptedAnswers": [str(answer), f"{answer}가지"],
        "answerContract": "single-number",
        "solutionSteps": steps,
        "solution": " ".join(steps),
        "learningPoint": "두 출발점에서 만나는 교점까지의 최단 거리가 같은지 확인하고 각자의 조건을 만족하는 최단 경로 수를 곱하기",
        "learningLocation": "활용 8회 · 원문 18번 · 같은 속도로 만나는 격자 최단 경로",
        "verification": {
            "primaryMethod": "원본 격자의 각 선분으로 그래프를 만들고 너비 우선 탐색으로 최단 거리와 경로를 전수 열거한다.",
            "independentMethod": "원문 렌더에서 가로·세로 단위 선분을 별도 판독한 인접 그래프를 재구성하고 재귀 DFS로 조건별 5칸 경로를 직접 센다.",
            "parameters": {
                "gridHorizontalSegments": HORIZONTAL,
                "gridVerticalSegments": VERTICAL,
                "startG": list(START_G),
                "startN": list(START_N),
                "meetingD": list(TARGET),
                "requiredWaypointG": list(variant["a"]) if variant["a"] else None,
                "requiredWaypointN": list(variant["b"]) if variant["b"] else None,
                "shortestDistanceG": distances(START_G)[TARGET],
                "shortestDistanceN": distances(START_N)[TARGET],
                "qualifyingRoutesG": len(g_choices),
                "qualifyingRoutesN": len(n_choices),
                "meetingRoutePairs": answer,
            },
            "independentSuite": "qa/applied8-q18-independent-validate.py",
            "sourceExamPage": 4,
            "sourceExamFile": EXAM.name,
            "sourceAnswerPage": 4,
            "sourceDrawingCompared": True,
            "sourceDrawingPresent": True,
            "variantUsesSourceDrawing": True,
            "sourceDrawingAssetSha256": sha256(ASSET),
            "officialAnswerStatus": "The available Drive answer PDF page is an unmarked duplicate of the question page. Original and variants were independently enumerated from the printed grid.",
            "studentDifficultyMeasured": False,
        },
        "difficultyEvidence": {
            "basis": "source-point-band",
            "label": "중",
            "sourceReasoningPreserved": True,
            "measuredVariantRate": None,
            "estimated": False,
            "rationale": "활용 8회 원문 18번은 13~22번의 3.4점 배점대다. 활용 난도는 배점대만 적용한다.",
        },
    }


def main() -> None:
    for p in (EXAM, ANSWER, PAGE_RENDER, SOURCE_CROP):
        if not p.is_file():
            raise SystemExit(f"Required reviewed source is missing: {p}")
    exam_text = PdfReader(str(EXAM)).pages[3].extract_text()
    answer_text = PdfReader(str(ANSWER)).pages[3].extract_text()
    compact = "".join(exam_text.split())
    if not all(x in compact for x in ("관호는ㄱ에서ㄴ방향으로", "주연이는ㄴ에서ㄱ방향으로", "같은빠르기로", "ㄷ지점에서만날수있는경우")):
        raise SystemExit("Exact source Q18 prompt on page 4 did not match.")
    if answer_text != exam_text:
        raise SystemExit("Answer candidate differs from source page 4; inspect before proceeding.")
    page = Image.open(PAGE_RENDER).convert("RGB")
    exact = page.crop((210, 2520, 830, 2960))
    candidate = Image.open(SOURCE_CROP).convert("RGB")
    if exact.size != candidate.size or exact.tobytes() != candidate.tobytes():
        raise SystemExit("Reviewed Q18 grid crop is not pixel-exact to source PDF page 4.")
    ASSET.parent.mkdir(parents=True, exist_ok=True)
    if ASSET.exists():
        saved = Image.open(ASSET).convert("RGB")
        if saved.size != exact.size or saved.tobytes() != exact.tobytes():
            raise SystemExit("Existing Q18 asset differs from exact source crop; refusing to overwrite.")
    else:
        shutil.copyfile(SOURCE_CROP, ASSET)

    data = json.loads(DATA_PATH.read_text())
    index = json.loads(INDEX_PATH.read_text())
    old = [x for x in data["items"] if x["sourceNo"] == 18]
    if old and len(old) != 9:
        raise SystemExit(f"Q18 has {len(old)} items, not 9; inspect before rebuilding.")
    variants = [make_item(v, i + 1) for i, v in enumerate(VARIANTS)]
    data["version"] = VERSION
    data["items"] = [x for x in data["items"] if x["sourceNo"] != 18] + variants
    data["items"].sort(key=lambda x: (x["sourceNo"], x["variantNo"]))
    data["itemCount"] = len(data["items"])
    data["availableSourceNos"] = sorted(set(data["availableSourceNos"] + [18]))
    data["pendingSourceNos"] = [n for n in range(1, 31) if n not in data["availableSourceNos"]]
    index["version"] = VERSION
    index["itemCount"] = len(data["items"])
    index["pendingSourceNos"] = data["pendingSourceNos"]
    index["items"] = [x for x in index["items"] if x["sourceNo"] != 18]
    index["items"].append({
        "sourceNo": 18,
        "genId": "applied8-q18",
        "area": "경우의 수",
        "subarea": "격자에서 최단 경로 세기",
        "detailType": "같은 속도로 만나는 두 최단 경로의 조합 세기",
        "pointBand": "3.4",
        "reviewStatus": "verified",
        "variantCount": 9,
    })
    index["items"].sort(key=lambda x: x["sourceNo"])
    DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    INDEX_PATH.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")

    if (distances(START_G)[TARGET], distances(START_N)[TARGET], len(G_PATHS), len(N_PATHS)) != (5, 5, 9, 8):
        raise AssertionError("Original source route counts did not match the independently read graph.")
    # With the printed endpoints, shortest routes share only D; neither walker can meet earlier.
    for a in G_PATHS:
        for b in N_PATHS:
            if set(a).intersection(b) != {TARGET}:
                raise AssertionError("A shortest path pair could meet at an earlier shared junction.")
    review = {
        "sourceExam": {
            "file": EXAM.name,
            "sha256": sha256(EXAM),
            "page": 4,
            "questionNo": 18,
            "directVisualReview": True,
            "prompt": "ㄱ·ㄴ에서 같은 속도로 동시에 출발해 가장 빠른 길을 택할 때 ㄷ에서 만나는 경로 조합 수를 묻는다.",
            "diagram": {
                "render": str(PAGE_RENDER.relative_to(ROOT)),
                "renderSha256": sha256(PAGE_RENDER),
                "cropCoordinatesPx": [210, 2520, 830, 2960],
                "asset": str(ASSET.relative_to(ROOT)),
                "assetSha256": sha256(ASSET),
                "dimensionsPx": list(Image.open(ASSET).size),
                "pixelExactCropVerified": True,
                "horizontalUnitSegmentsTopToBottom": HORIZONTAL,
                "verticalUnitSegmentsLeftToRight": VERTICAL,
                "G": list(START_G),
                "N": list(START_N),
                "D": list(TARGET),
            },
        },
        "answerCandidate": {
            "file": ANSWER.name,
            "sha256": sha256(ANSWER),
            "page": 4,
            "directVisualReview": True,
            "containsAnswers": False,
            "comparison": "Page 4 is an unmarked duplicate of the question page; the answer line is blank. Extracted source and answer-candidate page text match.",
        },
        "sourceIndependentSolution": {
            "shortestDistanceFromGToD": distances(START_G)[TARGET],
            "shortestDistanceFromNToD": distances(START_N)[TARGET],
            "shortestRoutesG": len(G_PATHS),
            "shortestRoutesN": len(N_PATHS),
            "answer": len(G_PATHS) * len(N_PATHS),
            "routePairsMeetOnlyAtD": True,
            "check": "All 9 G-to-D and 8 N-to-D shortest paths were enumerated; each pair shares only D, so the two same-speed walkers first meet at D.",
        },
        "variantCount": len(variants),
        "variantRouteCounts": [{"variant": i + 1, "G": len(count_routes(G_PATHS, v["a"])), "N": len(count_routes(N_PATHS, v["b"])), "answer": variants[i]["answerParts"][0]} for i, v in enumerate(VARIANTS)],
        "variantsIndependentlyCalculated": True,
        "sourceDrawingReusedPixelExact": True,
        "newSourceTypes": 0,
        "difficulty": "3.4-point band only = middle",
    }
    REVIEW.write_text(json.dumps(review, ensure_ascii=False, indent=2) + "\n")
    print(f"Added 9 Q18 variants; source answer {len(G_PATHS)}×{len(N_PATHS)}={len(G_PATHS)*len(N_PATHS)}; {len(data['items'])} items across {len(data['availableSourceNos'])} existing source types.")


if __name__ == "__main__":
    main()
